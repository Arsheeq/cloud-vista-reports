
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from pydantic import BaseModel
import boto3
from botocore.exceptions import ClientError, NoCredentialsError

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Credentials(BaseModel):
    accessKeyId: str
    secretAccessKey: str
    region: Optional[str] = None
    accountId: Optional[str] = None

class Instance(BaseModel):
    id: str
    name: str
    type: str
    state: str
    region: str
    selected: bool = False

@app.post("/validate-credentials")
async def validate_credentials(credentials: Credentials):
    try:
        # Use us-east-1 as default region for validation
        region = credentials.region if credentials.region else 'me-central-1'
        session = boto3.Session(
            aws_access_key_id=credentials.accessKeyId,
            aws_secret_access_key=credentials.secretAccessKey,
            region_name=region
        )
        ec2 = session.client('ec2')
        ec2.describe_instances()
        return {"status": "success", "message": "Credentials validated successfully"}
    except (ClientError, NoCredentialsError) as e:
        raise HTTPException(status_code=401, detail=str(e))

@app.post("/instances")
async def get_instances(credentials: Credentials):
    try:
        # First create a session with default region to get list of all regions
        session = boto3.Session(
            aws_access_key_id=credentials.accessKeyId,
            aws_secret_access_key=credentials.secretAccessKey,
            region_name='us-east-1'  # Default region to get region list
        )

        ec2_client = session.client('ec2')
        regions = [region['RegionName'] for region in ec2_client.describe_regions()['Regions']]

        ec2_instances = []

        print("Fetching instances from all AWS regions:")
        print("----------------------------------------")

        # Iterate through each region
        for region in regions:
            print(f"\nScanning region: {region}")
            regional_session = boto3.Session(
                aws_access_key_id=credentials.accessKeyId,
                aws_secret_access_key=credentials.secretAccessKey,
                region_name=region
            )

            ec2 = regional_session.client('ec2')
            try:
                response = ec2.describe_instances()

                for reservation in response['Reservations']:
                    for instance in reservation['Instances']:
                        name = next((tag['Value'] for tag in instance.get('Tags', []) 
                                   if tag['Key'] == 'Name'), instance['InstanceId'])
                        # Only add non-terminated instances
                        if instance['State']['Name'] != 'terminated':
                            instance_data = {
                                "id": instance['InstanceId'],
                                "name": name,
                                "type": instance['InstanceType'],
                                "state": instance['State']['Name'],
                                "region": region,
                                "selected": False
                            }
                            print(f"✓ Found instance: {instance_data['name']} ({instance_data['id']}) - {instance_data['type']} - {instance_data['state']}")
                            ec2_instances.append(instance_data)

                if len(response['Reservations']) == 0:
                    print(f"No instances found in region {region}")
            except Exception as e:
                error_msg = str(e)
                if 'AuthFailure' in error_msg:
                    print(f"Authentication failed for region {region}: {error_msg}")
                elif 'OptInRequired' in error_msg:
                    print(f"Region {region} requires opt-in: {error_msg}")
                elif 'UnauthorizedOperation' in error_msg:
                    print(f"Unauthorized operation in region {region}: {error_msg}")
                elif 'AccessDenied' in error_msg:
                    print(f"Access denied in region {region}: {error_msg}")
                else:
                    print(f"Error in region {region}: {error_msg}")

                # If this is the user's specified region, raise the error
                if region == credentials.region:
                    raise HTTPException(status_code=400, detail=f"Error accessing region {region}: {error_msg}")
                continue

        # If no instances found in any region, add debug info
        if len(ec2_instances) == 0:
            print("No instances found in any region. Credentials region:", credentials.region)
            print("AWS Access Key ID:", credentials.accessKeyId[:4] + "..." + credentials.accessKeyId[-4:])

        # Get RDS instances for each region
        rds_instances = []
        for region in regions:
            try:
                rds_client = boto3.client('rds',
                                        region_name=region,
                                        aws_access_key_id=credentials.accessKeyId,
                                        aws_secret_access_key=credentials.secretAccessKey)

                rds_response = rds_client.describe_db_instances()
                for instance in rds_response['DBInstances']:
                    rds_instances.append({
                        "id": instance['DBInstanceIdentifier'],
                        "name": instance.get('DBName', ''),
                        "type": instance['DBInstanceClass'],
                        "engine": instance['Engine'],
                        "size": str(instance.get('AllocatedStorage', 0)) + ' GB',
                        "state": instance['DBInstanceStatus'],
                        "region": region,
                        "selected": False
                    })
                    print(f"✓ Found RDS instance: {instance['DBInstanceIdentifier']} - {instance['Engine']} - {instance['DBInstanceStatus']}")
            except Exception as e:
                if 'OptInRequired' not in str(e) and 'AuthFailure' not in str(e):
                    print(f"Error fetching RDS instances in region {region}: {str(e)}")

        return {
            "ec2Instances": ec2_instances,
            "rdsInstances": rds_instances
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/generate-report")
async def generate_report(provider: str, credentials: Credentials, selected_instances: List[Instance], frequency: str):
    try:
        # Calculate time period based on frequency
        now = datetime.now()
        if frequency == "daily":
            start_time = now - timedelta(days=1)
        elif frequency == "weekly":
            start_time = now - timedelta(weeks=1)
        else:  # monthly
            start_time = now - timedelta(days=30)

        # Initialize AWS client
        session = boto3.Session(
            aws_access_key_id=credentials.accessKeyId,
            aws_secret_access_key=credentials.secretAccessKey,
            region_name=credentials.region or 'me-central-1'
        )

        cloudwatch = session.client('cloudwatch')
        ec2 = session.client('ec2')
        rds = session.client('rds')

        report_data = {
            "instances": [],
            "rds_instances": []
        }

        # Get metrics for each instance
        for instance in selected_instances:
            if hasattr(instance, 'engine'):  # RDS instance
                metrics = {
                    'CPUUtilization': {'Namespace': 'AWS/RDS'},
                    'FreeableMemory': {'Namespace': 'AWS/RDS'},
                    'FreeStorageSpace': {'Namespace': 'AWS/RDS'}
                }
                instance_data = {
                    "id": instance.id,
                    "type": instance.type,
                    "engine": instance.engine,
                    "metrics": {}
                }
            else:  # EC2 instance
                metrics = {
                    'CPUUtilization': {'Namespace': 'AWS/EC2'},
                    'MemoryUtilization': {'Namespace': 'CWAgent'},
                    'DiskUtilization': {'Namespace': 'CWAgent'}
                }
                instance_data = {
                    "id": instance.id,
                    "name": instance.name,
                    "type": instance.type,
                    "metrics": {}
                }

                # Get Windows disk metrics if it's a Windows instance
                if instance.platform == 'windows':
                    response = ec2.describe_volumes(
                        Filters=[{'Name': 'attachment.instance-id', 'Values': [instance.id]}]
                    )
                    instance_data["disk_volumes"] = response['Volumes']

            # Get CloudWatch metrics, focusing on CPU if others unavailable
            for metric_name, metric_info in metrics.items():
                try:
                    # Only try non-CPU metrics if they're available
                    if metric_name != 'CPUUtilization' and metric_info['Namespace'] == 'CWAgent':
                        # Test if CloudWatch agent metrics exist
                        test_response = cloudwatch.list_metrics(
                            Namespace=metric_info['Namespace'],
                            MetricName=metric_name,
                            Dimensions=[{'Name': 'InstanceId', 'Value': instance.id}]
                        )
                        if not test_response.get('Metrics'):
                            print(f"Skipping {metric_name} - CloudWatch agent metrics not available for {instance.id}")
                            continue

                    response = cloudwatch.get_metric_statistics(
                        Namespace=metric_info['Namespace'],
                        MetricName=metric_name,
                        Dimensions=[{'Name': 'InstanceId', 'Value': instance.id}],
                        StartTime=start_time,
                        EndTime=now,
                        Period=300,  # 5-minute intervals
                        Statistics=['Average']
                    )
                    
                    if response['Datapoints']:
                        instance_data["metrics"][metric_name] = response['Datapoints']
                    else:
                        print(f"No {metric_name} data points available for {instance.id}")
                except Exception as e:
                    print(f"Error getting {metric_name} for instance {instance.id}: {str(e)}")
                    # If CPU metrics fail, note it in the response
                    if metric_name == 'CPUUtilization':
                        instance_data["metrics"][metric_name] = "Metrics unavailable"

            if hasattr(instance, 'engine'):
                report_data["rds_instances"].append(instance_data)
            else:
                report_data["instances"].append(instance_data)

        return report_data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

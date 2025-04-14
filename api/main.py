
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from pydantic import BaseModel
import boto3
from botocore.exceptions import ClientError

app = FastAPI()

# Enable CORS
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
    accountId: Optional[str] = None

class Instance(BaseModel):
    id: str
    selected: bool = False

@app.post("/api/validate-credentials")
async def validate_credentials(credentials: Credentials):
    try:
        session = boto3.Session(
            aws_access_key_id=credentials.accessKeyId,
            aws_secret_access_key=credentials.secretAccessKey,
        )
        ec2 = session.client('ec2', region_name='us-east-1')
        # Test connection by listing regions
        ec2.describe_regions()
        return {"valid": True, "message": "Credentials validated successfully"}
    except ClientError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/instances/{provider}")
async def get_instances(provider: str, credentials: Credentials):
    if provider != "aws":
        raise HTTPException(status_code=400, detail="Only AWS provider is supported")
    
    try:
        session = boto3.Session(
            aws_access_key_id=credentials.accessKeyId,
            aws_secret_access_key=credentials.secretAccessKey,
        )
        
        # Get EC2 instances
        ec2 = session.client('ec2', region_name='us-east-1')
        regions = [region['RegionName'] for region in ec2.describe_regions()['Regions']]
        
        ec2_instances = []
        rds_instances = []
        
        for region in regions:
            regional_ec2 = session.client('ec2', region_name=region)
            regional_rds = session.client('rds', region_name=region)
            
            # Get EC2 instances
            paginator = regional_ec2.get_paginator('describe_instances')
            for page in paginator.paginate():
                for reservation in page['Reservations']:
                    for instance in reservation['Instances']:
                        name = ''
                        for tag in instance.get('Tags', []):
                            if tag['Key'] == 'Name':
                                name = tag['Value']
                                break
                                
                        ec2_instances.append({
                            "id": instance['InstanceId'],
                            "name": name or instance['InstanceId'],
                            "region": region,
                            "state": instance['State']['Name'],
                            "type": instance['InstanceType'],
                            "selected": False
                        })
            
            # Get RDS instances
            try:
                rds_response = regional_rds.describe_db_instances()
                for db in rds_response['DBInstances']:
                    rds_instances.append({
                        "id": db['DBInstanceIdentifier'],
                        "name": db.get('DBName', db['DBInstanceIdentifier']),
                        "region": region,
                        "state": db['DBInstanceStatus'],
                        "type": db['DBInstanceClass'],
                        "engine": db['Engine'],
                        "size": f"{db['AllocatedStorage']}GB",
                        "selected": False
                    })
            except ClientError:
                continue
                
        return {
            "ec2Instances": ec2_instances,
            "rdsInstances": rds_instances
        }
        
    except ClientError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/generate-report")
async def generate_report(provider: str, credentials: Credentials, selected_instances: List[Instance]):
    # For now, just return success
    # You can implement actual report generation later
    return {"status": "success", "message": "Report generated successfully"}

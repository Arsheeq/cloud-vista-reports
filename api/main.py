
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from pydantic import BaseModel
import boto3
from botocore.exceptions import ClientError
from datetime import datetime, timedelta
import sys
import os

# Add clio-main to path
sys.path.append(os.path.join(os.path.dirname(__file__), '../clio-main'))

app = FastAPI()

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
        # Create session with provided credentials
        session = boto3.Session(
            aws_access_key_id=credentials.accessKeyId,
            aws_secret_access_key=credentials.secretAccessKey,
            region_name='ap-south-1'
        )
        
        # Test connection by listing EC2 regions
        ec2 = session.client('ec2')
        ec2.describe_regions()
        
        return {"valid": True, "message": "Credentials validated successfully"}
    except ClientError as e:
        error_code = e.response.get('Error', {}).get('Code', 'Unknown')
        error_msg = e.response.get('Error', {}).get('Message', str(e))
        raise HTTPException(status_code=400, detail=f"AWS Error ({error_code}): {error_msg}")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/instances/{provider}")
async def get_instances(provider: str, credentials: Credentials):
    if provider != "aws":
        raise HTTPException(status_code=400, detail="Only AWS provider is supported")
    
    try:
        # Create session with provided credentials
        session = boto3.Session(
            aws_access_key_id=credentials.accessKeyId,
            aws_secret_access_key=credentials.secretAccessKey,
            region_name='ap-south-1'
        )
        
        # Get EC2 instances
        ec2 = session.client('ec2')
        ec2_instances = []
        paginator = ec2.get_paginator('describe_instances')
        
        for page in paginator.paginate():
            for reservation in page['Reservations']:
                for instance in reservation['Instances']:
                    name = next((tag['Value'] for tag in instance.get('Tags', []) 
                               if tag['Key'] == 'Name'), instance['InstanceId'])
                    ec2_instances.append({
                        "id": instance['InstanceId'],
                        "name": name,
                        "region": 'ap-south-1',
                        "state": instance['State']['Name'],
                        "type": instance['InstanceType'],
                        "selected": False
                    })
        
        # Get RDS instances
        rds = session.client('rds')
        rds_instances = []
        
        try:
            rds_response = rds.describe_db_instances()
            for db in rds_response['DBInstances']:
                rds_instances.append({
                    "id": db['DBInstanceIdentifier'],
                    "name": db['DBInstanceIdentifier'],
                    "region": 'ap-south-1',
                    "state": db['DBInstanceStatus'],
                    "type": db['DBInstanceClass'],
                    "engine": db['Engine'],
                    "size": f"{db.get('AllocatedStorage', 'N/A')}GB",
                    "selected": False
                })
        except ClientError:
            # Continue even if RDS access fails
            pass
            
        return {
            "ec2Instances": ec2_instances,
            "rdsInstances": rds_instances
        }
        
    except ClientError as e:
        error_code = e.response.get('Error', {}).get('Code', 'Unknown')
        error_msg = e.response.get('Error', {}).get('Message', str(e))
        raise HTTPException(status_code=400, detail=f"AWS Error ({error_code}): {error_msg}")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/generate-report")
async def generate_report(provider: str, credentials: Credentials, selected_instances: List[Instance]):
    try:
        return {"status": "success", "message": "Report generated successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

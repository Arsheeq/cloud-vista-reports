
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
from app.provider.aws.client import Client

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
        session = boto3.Session(
            aws_access_key_id=credentials.accessKeyId,
            aws_secret_access_key=credentials.secretAccessKey,
        )
        ec2 = session.client('ec2', region_name='ap-south-1')
        ec2.describe_regions()
        return {"valid": True, "message": "Credentials validated successfully"}
    except ClientError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/instances/{provider}")
async def get_instances(provider: str, credentials: Credentials):
    if provider != "aws":
        raise HTTPException(status_code=400, detail="Only AWS provider is supported")
    
    try:
        client = Client(region="ap-south-1", account_id=credentials.accountId)
        client.secrets = {
            'access_key': credentials.accessKeyId,
            'secret_key': credentials.secretAccessKey
        }
        
        # Get EC2 instances
        ec2_instances = []
        instance_ids = client.get_running_ec2_instance_ids()
        
        for instance_id in instance_ids:
            instance_info = client.get_instance_info(instance_id)
            ec2_instances.append({
                "id": instance_info["id"],
                "name": instance_info["name"],
                "region": "ap-south-1",
                "state": instance_info["state"],
                "type": instance_info["type"],
                "selected": False
            })
        
        # Get RDS instances
        rds_instances = []
        for rds in client.get_rds_instances():
            rds_instances.append({
                "id": rds["id"],
                "name": rds["id"],
                "region": "ap-south-1",
                "state": rds["status"],
                "type": rds["type"],
                "engine": rds["engine"],
                "size": f"{rds.get('allocated_storage', 'N/A')}GB",
                "selected": False
            })
            
        return {
            "ec2Instances": ec2_instances,
            "rdsInstances": rds_instances
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/generate-report")
async def generate_report(provider: str, credentials: Credentials, selected_instances: List[Instance]):
    try:
        # This will be implemented to generate actual reports using your ConsolidatedCloudReport class
        return {"status": "success", "message": "Report generated successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

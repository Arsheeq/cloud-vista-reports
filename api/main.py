
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import sys
import os

# Add clio-main to path so we can import the cloud reporting code
sys.path.append(os.path.join(os.path.dirname(__file__), '../clio-main'))
from app.app import ConsolidatedCloudReport
from app.provider.aws.client import Client as Aws_Client

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
    selected: bool

@app.post("/api/validate-credentials")
async def validate_credentials(credentials: Credentials):
    try:
        client = Aws_Client(
            account_id=credentials.accountId,
            region="ap-south-1"
        )
        # Test connection by listing instances
        instances = client.get_running_ec2_instance_ids()
        return {"valid": True, "message": "Credentials validated successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/instances/{provider}")
async def get_instances(provider: str, credentials: Credentials):
    try:
        client = Aws_Client(
            account_id=credentials.accountId,
            region="ap-south-1"
        )
        ec2_instances = []
        rds_instances = []

        if provider == "aws":
            # Get EC2 instances
            instance_ids = client.get_running_ec2_instance_ids()
            for instance_id in instance_ids:
                info = client.get_instance_info(instance_id)
                ec2_instances.append({
                    "id": info["id"],
                    "name": info["name"],
                    "type": info["type"],
                    "state": info["state"],
                    "region": "ap-south-1",
                    "selected": False
                })
            
            # Get RDS instances
            rds_list = client.get_rds_instances()
            rds_instances = [{
                "id": instance["id"],
                "type": instance["type"],
                "state": instance["status"],
                "engine": instance["engine"],
                "region": "ap-south-1",
                "size": "20GB",  # Default size for demo
                "selected": False
            } for instance in rds_list]

        return {
            "ec2Instances": ec2_instances,
            "rdsInstances": rds_instances
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/generate-report")
async def generate_report(
    provider: str,
    credentials: Credentials,
    selected_instances: List[Instance]
):
    try:
        instance_ids = [instance.id for instance in selected_instances if instance.selected]
        
        report_generator = ConsolidatedCloudReport(
            account_name=credentials.accountId,
            cloud_provider=provider.upper(),
            account_id=credentials.accountId,
            report_date=datetime.now().strftime("%Y-%m-%d")
        )

        client = Aws_Client(
            account_id=credentials.accountId,
            region="ap-south-1"
        )

        report_path = report_generator.generate_consolidated_report(
            client,
            instance_ids,
            f"/tmp/report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        )

        # Here you would typically upload the report to cloud storage
        # and return a download URL
        return {"status": "success", "message": "Report generated successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

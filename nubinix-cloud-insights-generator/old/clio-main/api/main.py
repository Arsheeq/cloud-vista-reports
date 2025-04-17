from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
import redis
import json
from dotenv import load_dotenv
import io

# Initialize Redis with error handling
try:
    redis_client = redis.Redis(host='0.0.0.0', port=6379, db=0, decode_responses=True)
    redis_client.ping()  # Test connection
except redis.ConnectionError:
    print("Warning: Could not connect to Redis, some features may be limited")
    redis_client = None
from typing import List, Optional
from pydantic import BaseModel
import boto3
from botocore.exceptions import ClientError, NoCredentialsError
import matplotlib.pyplot as plt
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak
from datetime import datetime, timedelta
import os
import tempfile

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

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

@app.post("/generate-report")
async def generate_report(provider: str, credentials: Credentials, selected_instances: List[Instance], frequency: str):
    try:
        print(f"Generating {frequency} report for {len(selected_instances)} instances")

        session = boto3.Session(
            aws_access_key_id=credentials.accessKeyId,
            aws_secret_access_key=credentials.secretAccessKey,
            region_name=credentials.region or 'me-central-1'
        )

        # Your existing report generation logic here
        # For now returning a simple PDF
        doc = SimpleDocTemplate("report.pdf", pagesize=letter)
        elements = []

        styles = getSampleStyleSheet()
        elements.append(Paragraph(f"Cloud Infrastructure Report - {frequency}", styles['Title']))

        # Add instance details
        for instance in selected_instances:
            elements.append(Paragraph(f"Instance: {instance.name}", styles['Heading1']))
            data = [['Property', 'Value'],
                   ['ID', instance.id],
                   ['Type', instance.type],
                   ['State', instance.state],
                   ['Region', instance.region]]
            t = Table(data)
            elements.append(t)

        doc.build(elements)

        return FileResponse(
            "report.pdf",
            media_type='application/pdf',
            filename=f"cloud-report-{frequency}-{datetime.now().strftime('%Y%m%d')}.pdf"
        )
    except Exception as e:
        print(f"Error generating report: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/instances")
async def get_instances(credentials: Credentials):
    try:
        session = boto3.Session(
            aws_access_key_id=credentials.accessKeyId,
            aws_secret_access_key=credentials.secretAccessKey,
            region_name='us-east-1'
        )

        ec2_client = session.client('ec2')
        regions = [region['RegionName'] for region in ec2_client.describe_regions()['Regions']]
        ec2_instances = []
        rds_instances = []

        print("Fetching instances from all AWS regions:")
        print("----------------------------------------")

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

            except Exception as e:
                print(f"Error in region {region}: {str(e)}")
                continue

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

class ReportRequest(BaseModel):
    provider: str
    credentials: Credentials
    selected_instances: List[Instance]
    frequency: str

@app.post("/generate-report")
async def generate_report(request: ReportRequest):
    try:
        # Cache credentials for 1 hour
        cache_key = f"credentials_{request.credentials.accessKeyId}"
        redis_client.setex(
            cache_key,
            3600,  # 1 hour
            json.dumps(request.credentials.dict())
        )

        if not request.selected_instances:
            raise HTTPException(status_code=400, detail="No instances selected")

        # Create temp directory
        temp_dir = tempfile.mkdtemp()
        pdf_path = os.path.join(temp_dir, f"cloud-report-{request.frequency}-{datetime.now().strftime('%Y%m%d')}.pdf")

        print(f"Generating PDF at {pdf_path}")

        provider = request.provider
        credentials = request.credentials
        selected_instances = request.selected_instances
        frequency = request.frequency

        # Create temp directory if it doesn't exist
        temp_dir = "temp_reports"
        os.makedirs(temp_dir, exist_ok=True)

        # Calculate time period based on frequency
        now = datetime.now()
        if frequency == "daily":
            start_time = now - timedelta(days=1)
        elif frequency == "weekly":
            start_time = now - timedelta(weeks=1)
        else:  # monthly
            start_time = now - timedelta(days=30)

        # Create temporary file for PDF
        temp_dir = tempfile.mkdtemp()
        pdf_path = os.path.join(temp_dir, f"cloud-report-{frequency}-{now.strftime('%Y%m%d')}.pdf")

        # Initialize PDF document
        doc = SimpleDocTemplate(pdf_path, pagesize=letter)
        styles = getSampleStyleSheet()
        elements = []

        # Add title
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Title'],
            fontSize=24,
            spaceAfter=30
        )
        elements.append(Paragraph(f"Cloud Infrastructure Report - {frequency.capitalize()}", title_style))
        elements.append(Spacer(1, 12))

        # Add report period
        period_text = f"Report Period: {start_time.strftime('%Y-%m-%d')} to {now.strftime('%Y-%m-%d')}"
        elements.append(Paragraph(period_text, styles['Normal']))
        elements.append(Spacer(1, 12))

        # Initialize AWS client for metrics
        session = boto3.Session(
            aws_access_key_id=credentials.accessKeyId,
            aws_secret_access_key=credentials.secretAccessKey,
            region_name=credentials.region or 'me-central-1'
        )
        cloudwatch = session.client('cloudwatch')

        # Process each instance
        for instance in selected_instances:
            instance_name = instance.get('name', 'Unknown')
            elements.append(Paragraph(f"Instance: {instance_name}", styles['Heading1']))
            elements.append(Spacer(1, 12))

            # Instance details table
            instance_data = [
                ['Property', 'Value'],
                ['ID', instance.get('id', 'N/A')],
                ['Type', instance.get('type', 'N/A')],
                ['Region', instance.get('region', 'N/A')],
                ['State', instance.get('state', 'N/A')]
            ]

            t = Table(instance_data, colWidths=[200, 300])
            t.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 14),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
                ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 1), (-1, -1), 12),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('PADDING', (0, 0), (-1, -1), 6),
            ]))
            elements.append(t)
            elements.append(Spacer(1, 12))

            # Get and plot CloudWatch metrics
            metrics = {
                'CPUUtilization': {'namespace': 'AWS/EC2', 'unit': '%'},
                'NetworkIn': {'namespace': 'AWS/EC2', 'unit': 'Bytes'},
                'NetworkOut': {'namespace': 'AWS/EC2', 'unit': 'Bytes'}
            }

            for metric_name, metric_info in metrics.items():
                try:
                    response = cloudwatch.get_metric_statistics(
                        Namespace=metric_info['namespace'],
                        MetricName=metric_name,
                        Dimensions=[{'Name': 'InstanceId', 'Value': instance.id}],
                        StartTime=start_time,
                        EndTime=now,
                        Period=3600,
                        Statistics=['Average']
                    )

                    if response['Datapoints']:
                        # Create metric graph
                        plt.figure(figsize=(10, 4))
                        datapoints = sorted(response['Datapoints'], key=lambda x: x['Timestamp'])
                        plt.plot([d['Timestamp'] for d in datapoints], 
                               [d['Average'] for d in datapoints])
                        plt.title(f"{metric_name} Over Time")
                        plt.xlabel("Time")
                        plt.ylabel(f"{metric_name} ({metric_info['unit']})")
                        plt.xticks(rotation=45)
                        plt.tight_layout()

                        # Save plot to temp file and add to PDF
                        plot_path = os.path.join(temp_dir, f"{instance.id}_{metric_name}.png")
                        plt.savefig(plot_path)
                        plt.close()
                        elements.append(Paragraph(f"{metric_name} Graph", styles['Heading2']))
                        elements.append(Image(plot_path, width=400, height=200))
                        elements.append(Spacer(1, 12))

                except Exception as e:
                    print(f"Error getting {metric_name} for instance {instance.id}: {str(e)}")
                    elements.append(Paragraph(f"Error getting {metric_name} metrics", styles['Normal']))

            elements.append(PageBreak())

        # Build PDF
        doc.build(elements)

        # Return PDF file with proper headers
        if not os.path.exists(pdf_path):
            raise HTTPException(status_code=500, detail="Failed to generate PDF")

        return FileResponse(
            path=pdf_path,
            media_type='application/pdf',
            filename=os.path.basename(pdf_path),
            headers={
                "Content-Disposition": f"attachment; filename={os.path.basename(pdf_path)}",
                "Access-Control-Expose-Headers": "Content-Disposition",
                "Access-Control-Allow-Origin": "*"
            }
        )

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
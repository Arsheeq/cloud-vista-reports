from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from typing import List, Optional
from pydantic import BaseModel
import boto3
from datetime import datetime, timedelta
import os
import tempfile
import pytz
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak
from reportlab.pdfgen import canvas

class Instance(BaseModel):
    id: str
    name: str = ""
    type: str
    state: str
    selected: bool = False
    region: str = ""
    os: str = "linux"

class Credentials(BaseModel):
    accessKeyId: str
    secretAccessKey: str
    region: Optional[str] = None
    accountId: Optional[str] = None
    accountName: str

class ReportRequest(BaseModel):
    provider: str
    credentials: Credentials
    selected_instances: List[Instance]
    frequency: str

app = FastAPI()

# Configure CORS properly
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"]
)

# Ensure temp directory exists
if not os.path.exists("temp_reports"):
    os.makedirs("temp_reports")

def generate_metric_graph(metric_data, metric_name, instance_name, temp_dir):
    if not metric_data or not metric_data.get('Datapoints'):
        return None

    os.makedirs(temp_dir, exist_ok=True)
    time_series = metric_data['Datapoints']
    time_series.sort(key=lambda x: x['Timestamp'])
    timestamps = [point['Timestamp'] for point in time_series]
    values = [point['Average'] for point in time_series]

    plt.figure(figsize=(10, 4))
    plt.plot(timestamps, values, color='#FF0066', linewidth=2.5, 
             marker='o', markersize=3, markerfacecolor='#FF0066', 
             label='Average', alpha=0.9)

    unit = time_series[0]['Unit'] if time_series else 'Percent'
    plt.xlabel('Time', fontweight='bold')
    plt.ylabel(f"{metric_name} ({unit})", fontweight='bold')

    start_time = min(timestamps)
    end_time = max(timestamps)
    start_str = start_time.strftime('%Y-%m-%d %H:%M')
    end_str = end_time.strftime('%Y-%m-%d %H:%M')
    plt.title(f'{instance_name}: {metric_name}\n{start_str} to {end_str}', fontweight='bold')

    plt.gcf().autofmt_xdate()
    plt.xlim(start_time, end_time)
    plt.grid(True, linestyle='--', alpha=0.7)

    if values:
        min_val = min(values)
        max_val = max(values)
        avg_val = sum(values) / len(values)
        stats_text = f"Min: {min_val:.2f}% | Max: {max_val:.2f}% | Avg: {avg_val:.2f}%"
        plt.figtext(0.5, 0.01, stats_text, ha='center', fontsize=10, fontweight='bold')

    plt.tight_layout()
    filename = f"{temp_dir}/{instance_name}_{metric_name.lower()}.png"
    plt.savefig(filename, dpi=150, bbox_inches='tight')
    plt.close()

    return filename

def get_time_range(frequency):
    now = datetime.now(pytz.UTC)
    if frequency == "daily":
        start_time = now - timedelta(days=1)
    elif frequency == "weekly":
        start_time = now - timedelta(weeks=1)
    else:  # monthly
        start_time = now - timedelta(days=30)
    return start_time, now

@app.post("/generate-report")
async def generate_report(request: ReportRequest):
    try:
        start_time, end_time = get_time_range(request.frequency)
        temp_dir = tempfile.mkdtemp(dir="temp_reports") #Use temp_reports directory
        pdf_filename = f"{request.credentials.accountName}-{datetime.now().strftime('%Y-%m-%d')}.pdf"
        pdf_path = os.path.join(temp_dir, pdf_filename)

        session = boto3.Session(
            aws_access_key_id=request.credentials.accessKeyId,
            aws_secret_access_key=request.credentials.secretAccessKey,
            region_name=request.credentials.region or 'us-east-1'
        )
        cloudwatch = session.client('cloudwatch')

        doc = SimpleDocTemplate(pdf_path, pagesize=letter)
        styles = getSampleStyleSheet()
        elements = []

        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Title'],
            fontSize=24,
            spaceAfter=30
        )
        elements.append(Paragraph(f"{request.credentials.accountName}", title_style))
        elements.append(Paragraph(f"Account {request.frequency.capitalize()} Report", title_style))

        # Add report information table
        data = [
            ["Account", request.credentials.accountName],
            ["Report", "Resource Utilization"],
            ["Cloud Provider", request.provider.upper()],
            ["Account ID", request.credentials.accountId or "N/A"],
            ["Date", datetime.now().strftime("%Y-%m-%d")]
        ]

        table = Table(data, colWidths=[1.5*inch, 3*inch])
        table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
            ('BACKGROUND', (0, 0), (0, -1), colors.grey),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ]))
        elements.append(table)
        elements.append(Spacer(1, 20))

        # Process each instance
        for instance in request.selected_instances:
            elements.append(PageBreak())
            elements.append(Paragraph(f"Host: {instance.name}", styles['Heading1']))

            # Instance info table
            instance_data = [
                ["Instance ID", instance.id],
                ["Type", instance.type],
                ["Operating System", instance.os],
                ["State", instance.state]
            ]

            instance_table = Table(instance_data, colWidths=[1.5*inch, 4*inch])
            instance_table.setStyle(TableStyle([
                ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
                ('BACKGROUND', (0, 0), (0, -1), colors.white),
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('PADDING', (0, 0), (-1, -1), 6)
            ]))
            elements.append(instance_table)
            elements.append(Spacer(1, 20))

            # Get metrics and generate graphs
            metrics = ["cpu", "memory", "disk"]
            for metric in metrics:
                try:
                    response = cloudwatch.get_metric_statistics(
                        Namespace="AWS/EC2",
                        MetricName=f"{metric}Utilization",
                        Dimensions=[{"Name": "InstanceId", "Value": instance.id}],
                        StartTime=start_time,
                        EndTime=end_time,
                        Period=300,
                        Statistics=["Average"]
                    )

                    if response['Datapoints']:
                        graph_path = generate_metric_graph(response, metric, instance.name, temp_dir)
                        if graph_path:
                            elements.append(Paragraph(f"{metric.upper()} UTILIZATION", styles['Heading2']))
                            img = Image(graph_path, width=6*inch, height=2*inch)
                            elements.append(img)
                            elements.append(Spacer(1, 20))
                except Exception as e:
                    print(f"Error getting metrics for {instance.id}: {str(e)}")

        doc.build(elements)

        headers = {
            "Content-Disposition": f"attachment; filename={pdf_filename}",
            "Access-Control-Expose-Headers": "Content-Disposition",
            "Access-Control-Allow-Origin": "*"
        }
        
        return FileResponse(
            path=pdf_path,
            media_type='application/pdf',
            filename=pdf_filename,
            headers=headers
        )

    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error generating report: {str(e)}\n{error_trace}")
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")
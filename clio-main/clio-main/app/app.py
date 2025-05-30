import os
from datetime import datetime
import matplotlib.pyplot as plt
import matplotlib
import pytz
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak

from .provider.aws.client import Client as Aws_Client
import boto3

class ConsolidatedCloudReport:
    def __init__(self, 
                 account_name, 
                 cloud_provider="AWS", 
                 account_id=None, 
                 report_date=None):
        """
        Initialize the consolidated report generator
        
        Parameters:
        - account_name: Name of the account
        - cloud_provider: Name of the cloud provider (e.g., AWS)
        - account_id: Account identifier
        - report_date: Date of the report (defaults to today)
        """
        self.account_name = account_name
        self.cloud_provider = cloud_provider
        self.account_id = account_id
        self.report_date = report_date or datetime.now().strftime("%Y-%m-%d")
        
        # Define metrics to collect
        self.metrics = {
            "linux": ["cpu", "memory", "disk"],
            "windows": ["cpu", "memory", "disk"]
            }
        
        # Define styles
        self.styles = getSampleStyleSheet()
        
        # Create custom styles
        self.title_style = ParagraphStyle(
            name='TitleStyle',
            parent=self.styles['Title'],
            fontSize=18,
            alignment=1,  # Center alignment
            spaceAfter=0.2*inch
        )
        
        self.header_style = ParagraphStyle(
            name='HeaderStyle',
            parent=self.styles['Heading1'],
            fontSize=14,
            spaceAfter=0.1*inch
        )
        
        self.normal_style = ParagraphStyle(
            name='NormalStyle',
            parent=self.styles['Normal'],
            fontSize=10,
            spaceAfter=0.05*inch
        )
        
        self.label_style = ParagraphStyle(
            name='LabelStyle',
            parent=self.styles['Normal'],
            fontSize=10,
            spaceBefore=0.1*inch,
            spaceAfter=0.05*inch,
            fontName='Helvetica-Bold'
        )
        
        self.remark_style = ParagraphStyle(
            name='RemarkStyle',
            parent=self.styles['Normal'],
            fontSize=10,
            spaceAfter=0.1*inch,
            fontName='Helvetica-Oblique'
        )
    
    def generate_metric_graph(self, metric_data, metric_name, instance_name, output_dir="graphs"):
        """
        Generate a graph for metric data with time range derived from available datapoints
        
        Parameters:
        - metric_data: Dictionary with time-series data
        - metric_name: Name of the metric
        - instance_name: Name of the instance
        - output_dir: Directory to save graphs
        
        Returns:
        Path to the generated graph
        """
        if not metric_data or not metric_data.get('Datapoints'):
            return None
            
        # Make sure output directory exists
        os.makedirs(output_dir, exist_ok=True)
        
        # Extract data
        time_series = metric_data['Datapoints']

        # Sort the time series by timestamp for proper plotting
        time_series.sort(key=lambda x: x['Timestamp'])
        
        # Extract all timestamps from the data
        timestamps = [point['Timestamp'] for point in time_series]

        # Find the start and end times from the available timestamps
        start_time = min(timestamps)
        end_time = max(timestamps)

        
        # Re-extract timestamps and values after sorting
        sorted_timestamps = [point['Timestamp'] for point in time_series]
        sorted_avg_values = [point['Average'] for point in time_series]
        
        # Create a new figure
        plt.figure(figsize=(10, 4))
        
        # Plot the data with a bright, highlighted color
        plt.plot(sorted_timestamps, sorted_avg_values, color='#FF0066', linewidth=2.5, 
                 marker='o', markersize=3, markerfacecolor='#FF0066', 
                 label='Average', alpha=0.9)
        
        unit = ""
        # Add labels and title
        unit_val = time_series[0]['Unit'] if time_series else 'Percent'

        if 'bytes' in str(unit).lower():
            unit = unit_val.replace("bytes", "GB")
        else:
            unit = unit_val
        plt.xlabel('Time', fontweight='bold')
        plt.ylabel(f"{metric_name} ({unit})", fontweight='bold')
        
        # Format the time span in the title
        start_str = start_time.strftime('%Y-%m-%d %H:%M')
        end_str = end_time.strftime('%Y-%m-%d %H:%M')
        plt.title(f'{instance_name}: {metric_name}\n{start_str} to {end_str}', fontweight='bold')
        
        # Format the x-axis to show dates nicely
        plt.gcf().autofmt_xdate()

        # Set explicit x-axis range based on the data
        plt.xlim(start_time, end_time)
        
        # Calculate time difference and use appropriate formatter
        time_diff = end_time - start_time
        hours_diff = time_diff.total_seconds() / 3600
        
        if hours_diff <= 24:
            plt.gca().xaxis.set_major_formatter(matplotlib.dates.DateFormatter('%H:%M', tz=pytz.timezone('Asia/Kolkata')))
        else:
            plt.gca().xaxis.set_major_formatter(matplotlib.dates.DateFormatter('%m-%d %H:%M', tz=pytz.timezone('Asia/Kolkata')))
        
        # Add legend
        plt.legend(loc='upper right', frameon=True)
        
        # Add grid
        plt.grid(True, linestyle='--', alpha=0.7)
        
        # Add statistics
        if sorted_avg_values:
            min_val = min(sorted_avg_values)
            max_val = max(sorted_avg_values)
            avg_val = sum(sorted_avg_values) / len(sorted_avg_values)
            stats_text = f"Min: {min_val:.2f}% | Max: {max_val:.2f}% | Avg: {avg_val:.2f}%"
            plt.figtext(0.5, 0.01, stats_text, ha='center', fontsize=10, fontweight='bold')
        
        # Tight layout to maximize graph area
        plt.tight_layout()
        
        # Create a descriptive filename
        time_range = "24h" if hours_diff <= 24 else f"{int(hours_diff)}h"
        filename = f"{output_dir}/{instance_name}_{metric_name.lower()}_{time_range}.png".replace(" ", "_")
        plt.savefig(filename, dpi=150, bbox_inches='tight')
        plt.close()
        
        return filename

    def generate_consolidated_report(self, aws_cli, instance_ids, output_path="consolidated_report.pdf", days=1):
        """
        Generate a consolidated report for multiple instances
        
        Parameters:
        - instance_ids: List of EC2 instance IDs
        - output_path: Path to save the PDF
        - days: Number of days of data to retrieve
        
        Returns:
        Path to the generated report
        """
        # Create graphs directory if it doesn't exist
        graphs_dir = "/tmp/graphs"
        os.makedirs(graphs_dir, exist_ok=True)
        
        # Create document with letter page size
        doc = SimpleDocTemplate(
            output_path,
            pagesize=letter,
            rightMargin=0.5*inch,
            leftMargin=0.5*inch,
            topMargin=1.5*inch,
            bottomMargin=0.5*inch
        )
        
        # Initialize the list of flowables
        elements = []
        
        # Add extra spacer to move title down
        elements.append(Paragraph("CLOUD UTILIZATION<br/>REPORT", self.title_style))
        elements.append(Spacer(1, 0.2*inch))
        
        # Add report information table
        report_data = [
            ["Account", self.account_name],
            ["Report", "Resource Utilization"],
            ["Cloud Provider", self.cloud_provider],
            ["Account ID", self.account_id or "N/A"],
            ["Date", self.report_date]
        ]
        
        report_table = Table(report_data, colWidths=[1.5*inch, 3*inch])
        report_table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
            ('BACKGROUND', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('PADDING', (0, 0), (-1, -1), 6)
        ]))
        
        elements.append(report_table)
        
        # Add instances summary
        elements.append(Spacer(1, 0.4*inch))
        elements.append(Paragraph("Instances Covered in Report:", self.header_style))
        elements.append(Spacer(1, 0.2*inch))
        
        # Create a table for instance summary
        instance_summary_data = [["Instance ID", "Name", "Type", "Status"]]
        
        # Process each instance
        all_instances_info = []
        for instance_id in instance_ids:
            try:
                # Get instance information
                host_info = aws_cli.get_instance_info(instance_id)
                all_instances_info.append(host_info)
                
                # Add to summary table
                instance_summary_data.append([
                    host_info["id"],
                    host_info["name"],
                    host_info["type"],
                    host_info["state"]
                ])
                
            except Exception as e:
                print(f"Error processing instance {instance_id}: {e}")
                instance_summary_data.append([instance_id, "Error", "Error", "Error"])
        
        # Create and add the instances summary table
        instance_summary_table = Table(instance_summary_data, colWidths=[1.5*inch, 2*inch, 1.5*inch, 1*inch])
        instance_summary_table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
            ('BACKGROUND', (0, 0), (-1, 0), colors.lightblue),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('PADDING', (0, 0), (-1, -1), 6),
        ]))

        
        # summary table
        elements.append(instance_summary_table)

        # RDS instances summary
        elements.append(Spacer(1, 0.4*inch))
        elements.append(Paragraph("RDS instances Covered in Report:", self.header_style))
        elements.append(Spacer(1, 0.2*inch))

        # Create a table for instance summary
        rds_instance_summary_data = [["Instance Name","Type", "Status", "Engine"]]

        rds_instances = aws_cli.get_rds_instances()

        for instance in rds_instances:
            rds_instance_summary_data.append([
                instance['id'],
                instance['type'],
                instance['status'],
                instance['engine']
                ]
            )
        
        # Create and add the instances summary table
        rds_instance_summary_table = Table(rds_instance_summary_data, colWidths=[1.5*inch, 2*inch, 1.5*inch, 1*inch])
        rds_instance_summary_table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
            ('BACKGROUND', (0, 0), (-1, 0), colors.lightblue),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('PADDING', (0, 0), (-1, -1), 6),
        ]))

        # summary table
        elements.append(rds_instance_summary_table)

        # Define IST timezone
        ist = pytz.timezone("Asia/Kolkata")

        # Define start and end times in IST
        dt = datetime.strptime(self.report_date,  "%Y-%m-%d")
        start_time_ist = datetime(dt.year, dt.month, dt.day, 0, 0, 0, tzinfo=ist)
        end_time_ist = datetime(dt.year, dt.month, dt.day, 23, 59, 59, tzinfo=ist)

        # Convert IST to UTC
        start_time_utc = start_time_ist.astimezone(pytz.utc)
        end_time_utc = end_time_ist.astimezone(pytz.utc)

        # Process each ec2 instance
        self.generate_ec2_report(elements, all_instances_info, aws_cli, start_time_utc, end_time_utc, graphs_dir)

        # Process each RDS instance
        self.generate_rds_report(elements, aws_cli, start_time_utc, end_time_utc, graphs_dir)

        # Build the PDF
        doc.build(elements, onFirstPage=header_function, onLaterPages=header_function)
        
        return output_path
    
    def generate_rds_report(self, elements, aws_cli, start_time, end_time, graphs_dir):

        rds_metrics = ["cpu", "memory", "disk"]

        all_instances_info = aws_cli.get_rds_instances()
        # Process each instance
        for host_info in all_instances_info:
            # Start a new page for each host
            elements.append(PageBreak())
            # Add host header
            elements.append(Paragraph(f"RDS Instance : {host_info['id']}", self.header_style))
            elements.append(Spacer(1, 0.1*inch))
            
            # Host information
            host_info_data = [
                ["Instance ID", host_info['id']],
                ["Type", host_info['type']],
                ["Status", host_info['status']],
                ["Engine", host_info['engine']]
            ]
            
            host_info_table = Table(host_info_data, colWidths=[1.5*inch, 4*inch])
            host_info_table.setStyle(TableStyle([
                ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
                ('BACKGROUND', (0, 0), (0, -1), colors.white),
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('PADDING', (0, 0), (-1, -1), 6)
            ]))
            
            elements.append(host_info_table)
            elements.append(Spacer(1, 0.3*inch))
            
            # Get metrics data for this instance
            metrics_data = {}
            graphs_paths = {}

            for metric_key in rds_metrics:
                data = aws_cli.get_metrics(instance_id=host_info['id'], metric_name=metric_key, start_time=start_time,end_time=end_time,resource_type='rds', resource_os=None)
                if data:
                    if metric_key == "memory" or metric_key == "disk":
                        convert_bytes_to_gb(data)
                    metrics_data[metric_key] = data
                    # Generate graph
                    graph_path = self.generate_metric_graph(data, metric_key, host_info['id'], graphs_dir)
                    if graph_path:
                        graphs_paths[metric_key] = graph_path
            
            # Add metrics sections side by side
            for metric_key in rds_metrics:
                remarks = "Average utilization is normal"
                if metric_key in metrics_data:
                    # Add utilization data table
                    data = metrics_data[metric_key]
                    avg_usage_list = [value['Average'] for value in data['Datapoints']]

                    if len(avg_usage_list) > 0:
                        avg_val = sum(avg_usage_list) / len(avg_usage_list)

                        if metric_key == "memory" or metric_key == "disk":
                            elements.append(Paragraph(f"AVAILABLE {metric_key.upper()} (in GB)", self.label_style))
                            if avg_val < 10:
                                remarks = "Available " + metric_key + " is low. Recommend increasing resources"
                            else:
                                remarks = "Available " + metric_key + " capacity is sufficient"
                        else:
                            elements.append(Paragraph(f"{metric_key.upper()} UTILIZATION", self.label_style))
                            if avg_val > 85:
                                remarks = "Average utilisation is high. Explore possibility of optimising the resources"

                        elements.append(Spacer(1, 0.1*inch))
                        elements.append(Paragraph(f"Remarks: {remarks}", self.remark_style))

                        if metric_key == "memory" or metric_key == "disk":
                            table_data = [
                                ["Average", f"{avg_val:.2f}"]
                            ]
                        else:
                            table_data = [
                                ["Average", f"{avg_val:.2f}%"]
                            ]
                    
                        util_table = Table(table_data, colWidths=[1.5*inch, 1*inch])
                        util_table.setStyle(TableStyle([
                            ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
                            ('BACKGROUND', (0, 0), (0, -1), colors.white),
                            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                            ('PADDING', (0, 0), (-1, -1), 6)
                        ]))
                    
                        elements.append(util_table)
                        elements.append(Spacer(1, 0.2*inch))
                    
                        # Add graph if available
                        if metric_key in graphs_paths and os.path.exists(graphs_paths[metric_key]):
                            graph_path = graphs_paths[metric_key]
                            img = Image(graph_path, width=6*inch, height=2*inch)
                            elements.append(img)
                            elements.append(Spacer(1, 0.2*inch))
                else:
                    elements.append(Paragraph(f"No {metric_key} utilization data available.", self.normal_style))
                    elements.append(Spacer(1, 0.2*inch))    

    def generate_ec2_report(self, elements, all_instances_info, aws_cli, start_time, end_time, graphs_dir):
        
        # Process each instance
        for host_info in all_instances_info:
            # Start a new page for each host
            elements.append(PageBreak())
            # Add host header
            elements.append(Paragraph(f"Host: {host_info['name']}", self.header_style))
            elements.append(Spacer(1, 0.1*inch))
            
            # Host information
            host_info_data = [
                ["Instance ID", host_info['id']],
                ["Type", host_info['type']],
                ["Operating System", host_info['os']],
                ["State", host_info['state']]
            ]
            
            host_info_table = Table(host_info_data, colWidths=[1.5*inch, 4*inch])
            host_info_table.setStyle(TableStyle([
                ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
                ('BACKGROUND', (0, 0), (0, -1), colors.white),
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('PADDING', (0, 0), (-1, -1), 6)
            ]))
            
            elements.append(host_info_table)
            elements.append(Spacer(1, 0.3*inch))
            
            # Get metrics data for this instance
            metrics_data = {}
            graphs_paths = {}
            
            for metric_key in self.metrics[str(host_info['os']).lower()]:
                data = aws_cli.get_metrics(instance_id=host_info['id'], metric_name=metric_key, start_time=start_time,end_time=end_time,resource_type='ec2', resource_os=str(host_info['os']).lower())
                if data:
                    metrics_data[metric_key] = data
                    # Generate graph
                    graph_path = self.generate_metric_graph(data, metric_key, host_info['name'], graphs_dir)
                    if graph_path:
                        graphs_paths[metric_key] = graph_path
            
            # Add metrics sections side by side
            for metric_key in ["cpu", "memory", "disk"]:
                if metric_key in metrics_data:
                    # Add utilization data table
                    data = metrics_data[metric_key]
                    avg_usage_list = [value['Average'] for value in data['Datapoints']]


                    if len(avg_usage_list) > 0:
                        avg_val = sum(avg_usage_list) / len(avg_usage_list)

                        # Add remarks
                        if avg_val > 85:
                            remarks = "Average utilisation is high. Explore possibility of optimising the resources"
                        else:
                            remarks = "Average utilisation is low. No action needed at the time"

                        if metric_key == "disk" and str(host_info['os']).lower() == 'windows':
                            elements.append(Paragraph(f"{metric_key.upper()} FREE PERCENTAGE", self.label_style))
                        else:
                            elements.append(Paragraph(f"{metric_key.upper()} UTILIZATION", self.label_style))
                        elements.append(Spacer(1, 0.1*inch))
                        elements.append(Paragraph(f"Remarks: {remarks}", self.remark_style))
                        

                        table_data = [
                            # ["Maximum", f"{data['maximum']}%"],
                            ["Average", f"{avg_val:.2f}%"],
                            # ["Minimum", f"{data['minimum']}%"]
                        ]
                    
                        util_table = Table(table_data, colWidths=[1.5*inch, 1*inch])
                        util_table.setStyle(TableStyle([
                            ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
                            ('BACKGROUND', (0, 0), (0, -1), colors.white),
                            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                            ('PADDING', (0, 0), (-1, -1), 6)
                        ]))
                    
                        elements.append(util_table)
                        elements.append(Spacer(1, 0.2*inch))
                    
                        # Add graph if available
                        if metric_key in graphs_paths and os.path.exists(graphs_paths[metric_key]):
                            graph_path = graphs_paths[metric_key]
                            img = Image(graph_path, width=6*inch, height=2*inch)
                            elements.append(img)
                            elements.append(Spacer(1, 0.2*inch))
                else:
                    elements.append(Paragraph(f"No {metric_key} utilization data available.", self.normal_style))
                    elements.append(Spacer(1, 0.2*inch))

    def get_all_ec2_instance_ids(region_name=None):
        """
        Retrieve instance IDs of all EC2 instances in the AWS account.
        
        :param region_name: Optional specific region to check. If None, checks all regions.
        :return: List of instance IDs
        """
        # Create an EC2 client
        ec2 = boto3.client('ec2')
        
        # If no region specified, get all regions
        if region_name is None:
            regions = [region['RegionName'] for region in ec2.describe_regions()['Regions']]
        else:
            regions = [region_name]
        
        # List to store all instance IDs
        all_instance_ids = []
        
        # Iterate through regions
        for region in regions:
            # Create EC2 client for each region
            regional_ec2 = boto3.client('ec2', region_name=region)
            
            # Describe instances in the region
            response = regional_ec2.describe_instances()
            
            # Extract instance IDs
            for reservation in response['Reservations']:
                for instance in reservation['Instances']:
                    all_instance_ids.append(instance['InstanceId'])
        
        return all_instance_ids


def main(report_date, accounts):


    # TODO: get start date and end date as an argument

    for key, value in accounts.items():
        report_generator = ConsolidatedCloudReport(
            account_name=value,
            account_id=key,
            report_date=report_date
        )

        aws_cli = Aws_Client(account_id=key)
        instance_ids = aws_cli.get_running_ec2_instance_ids("ap-south-1")

        OUTPUT_PATH_PREFIX = "/tmp/"

        FILE_NAME = value.replace(" ", "-") + ".pdf"

        # Generate the consolidated report
        report = report_generator.generate_consolidated_report(
            aws_cli,
            instance_ids, 
            OUTPUT_PATH_PREFIX + FILE_NAME,
        )
        aws_cli.upload_to_s3(report, "nx-report", "clients/manapuram/" + report_date + "/" + FILE_NAME)

# Define the header function - ReportLab will automatically pass canvas and doc parameters
def header_function(canvas, doc):
    # Save the state of the canvas
    canvas.saveState()

    # Add website URL on the left
    canvas.setFont("Helvetica", 10)
    canvas.drawString(doc.leftMargin, doc.height + doc.topMargin - 0.25*inch, "www.nubinix.com")

    # Add logo on the right
    logo_path = '/var/task/app/static/nubinix_logo.jpg'
    logo_width = 1.5*inch
    logo_height = 1.5*inch
    # Calculate x position for right alignment
    logo_x = doc.width + doc.leftMargin - logo_width
    logo = Image(logo_path, width=logo_width, height=logo_height)
    logo.drawOn(canvas, logo_x, doc.height + doc.topMargin - 0.75*inch)

    # Restore the state of the canvas
    canvas.restoreState()

def convert_bytes_to_gb(data):
    for dp in data['Datapoints']:
        gb_value = dp['Average']/(1024 ** 3)
        dp['Average'] = gb_value

if __name__ == "__main__":
    main()
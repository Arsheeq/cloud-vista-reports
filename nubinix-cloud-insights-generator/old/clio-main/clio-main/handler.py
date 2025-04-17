import json
import logging
from app import app

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    # Log the incoming event
    logger.info(f"Received event: {json.dumps(event)}")

    logger.info(f"Invoking report generator: {json.dumps(event)}")

    report_date = event['reportDate']
    accounts = event['accounts']

    app.main(report_date, accounts)
    
    # Prepare the response
    response = {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json"
        }
    }
    
    return response
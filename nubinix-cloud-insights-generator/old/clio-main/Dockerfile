FROM public.ecr.aws/lambda/python:3.12

# Copy requirements.txt
COPY requirements.txt ${LAMBDA_TASK_ROOT}

# Install dependencies
RUN pip3 install -r requirements.txt

# Copy all code
COPY handler.py ${LAMBDA_TASK_ROOT}/handler.py

COPY app/ ${LAMBDA_TASK_ROOT}/app/

# Set the CMD to your handler (using module/file.function format if needed)
CMD [ "handler.lambda_handler" ]
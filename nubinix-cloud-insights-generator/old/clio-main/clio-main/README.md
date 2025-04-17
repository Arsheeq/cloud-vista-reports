# clio
Serverless app to generate daily, weekly, monthly reports on cloud resource usage.


# Testing locally

For testing any changes made in your, you can build and run this as a docker container. Steps below.

1. Build Docker image: `docker build -t nx/internal-tools .`
2. `docker run --rm  -v ~/.aws/credentials:/var/task/.aws/credentials -p 9000:8080 nx/internal-tools`
3. `curl "http://localhost:9000/2015-03-31/functions/function/invocations" -d '{ "reportDate": "2025-03-23", "accounts": { "<account_number>": "<account_name>" } }'`
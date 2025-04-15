docker build --platform=linux/amd64 -t nx/internal-tools .
docker tag nx/internal-tools:latest 533267332422.dkr.ecr.ap-south-1.amazonaws.com/nx/internal-tools:latest
docker push 533267332422.dkr.ecr.ap-south-1.amazonaws.com/nx/internal-tools:latest


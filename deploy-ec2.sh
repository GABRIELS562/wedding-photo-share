#!/bin/bash

# EC2 Deployment Script for Kirsten & Dale Wedding Photo Share
# Deploy to photos.jagdevops.co.za

echo "🚀 Starting deployment to EC2..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="photos.jagdevops.co.za"
APP_NAME="wedding-photo-share"
EC2_USER="ubuntu"  # Change if different
EC2_HOST="your-ec2-ip-here"  # YOU NEED TO UPDATE THIS

# Function to check if command was successful
check_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ $1 successful${NC}"
    else
        echo -e "${RED}✗ $1 failed${NC}"
        exit 1
    fi
}

# Step 1: Build the Docker image locally
echo -e "${YELLOW}Step 1: Building Docker image...${NC}"
docker build -t $APP_NAME:latest .
check_status "Docker build"

# Step 2: Save Docker image
echo -e "${YELLOW}Step 2: Saving Docker image...${NC}"
docker save -o $APP_NAME.tar $APP_NAME:latest
check_status "Docker save"

# Step 3: Copy files to EC2
echo -e "${YELLOW}Step 3: Copying files to EC2...${NC}"
echo "Please enter your EC2 instance IP address:"
read EC2_HOST

# Create directory on EC2
ssh $EC2_USER@$EC2_HOST "mkdir -p ~/$APP_NAME"
check_status "Create directory on EC2"

# Copy Docker image
scp $APP_NAME.tar $EC2_USER@$EC2_HOST:~/$APP_NAME/
check_status "Copy Docker image"

# Copy docker-compose and env file
scp docker-compose.prod.yml $EC2_USER@$EC2_HOST:~/$APP_NAME/
scp .env.production $EC2_USER@$EC2_HOST:~/$APP_NAME/.env
check_status "Copy configuration files"

# Step 4: Deploy on EC2
echo -e "${YELLOW}Step 4: Deploying on EC2...${NC}"
ssh $EC2_USER@$EC2_HOST << 'ENDSSH'
cd ~/wedding-photo-share

# Load Docker image
echo "Loading Docker image..."
docker load -i wedding-photo-share.tar

# Stop existing container if running
docker-compose -f docker-compose.prod.yml down

# Start new container
docker-compose -f docker-compose.prod.yml up -d

# Check if container is running
docker ps | grep wedding-photo-share

# Clean up
rm wedding-photo-share.tar

echo "✨ Deployment complete!"
ENDSSH

check_status "EC2 deployment"

# Clean up local tar file
rm $APP_NAME.tar

echo -e "${GREEN}🎉 Deployment successful!${NC}"
echo -e "${GREEN}Your app is now available at: https://$DOMAIN${NC}"
echo ""
echo "Next steps:"
echo "1. Set up SSL certificate with Let's Encrypt"
echo "2. Configure your DNS CNAME record to point to your EC2 instance"
echo "3. Test the application"
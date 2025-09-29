#!/bin/bash

# Deployment script for Kirsten & Dale Wedding Photo Share
# For deployment on EC2 with Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="kirsten-dale-wedding-photos"
DOMAIN="photos.jagdevops.co.za"
BACKUP_DIR="/var/backups/wedding-photos"
LOG_FILE="/var/log/wedding-deployment.log"

# Functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a $LOG_FILE
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}" | tee -a $LOG_FILE
}

error() {
    echo -e "${RED}[ERROR] $1${NC}" | tee -a $LOG_FILE
    exit 1
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}" | tee -a $LOG_FILE
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        error "This script should not be run as root for security reasons"
    fi
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."

    # Check Docker
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed"
    fi

    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed"
    fi

    # Check environment file
    if [[ ! -f .env.production ]]; then
        error ".env.production file not found"
    fi

    # Check if port 3001 is available
    if ss -tuln | grep -q ":3001 "; then
        warn "Port 3001 is already in use"
    fi

    log "Prerequisites check passed"
}

# Load environment variables
load_environment() {
    log "Loading environment variables..."

    if [[ -f .env.production ]]; then
        source .env.production
        log "Production environment loaded"
    else
        error "Production environment file not found"
    fi

    # Validate required variables
    required_vars=(
        "VITE_CLOUDINARY_CLOUD_NAME"
        "VITE_CLOUDINARY_UPLOAD_PRESET"
        "VITE_CLOUDINARY_API_KEY"
        "VITE_CLOUDINARY_API_SECRET"
    )

    for var in "${required_vars[@]}"; do
        if [[ -z "${!var}" ]]; then
            error "Required environment variable $var is not set"
        fi
    done

    log "Environment validation passed"
}

# Create backup
create_backup() {
    log "Creating backup..."

    # Create backup directory
    sudo mkdir -p $BACKUP_DIR
    local backup_file="$BACKUP_DIR/wedding-photos-$(date +%Y%m%d_%H%M%S).tar.gz"

    # Backup current deployment (if exists)
    if docker ps -q -f name=$APP_NAME &> /dev/null; then
        log "Backing up current deployment..."

        # Export current containers
        docker save $(docker images -q | head -5) | gzip > "$backup_file"

        # Backup configuration files
        tar -czf "$BACKUP_DIR/config-$(date +%Y%m%d_%H%M%S).tar.gz" \
            docker-compose.prod.yml nginx.conf Dockerfile .env.production 2>/dev/null || true

        log "Backup created: $backup_file"
    else
        log "No existing deployment found, skipping backup"
    fi
}

# Pull latest code
pull_latest() {
    log "Pulling latest code..."

    # Stash any local changes
    git stash push -m "Pre-deployment stash $(date)"

    # Pull latest changes
    git pull origin main

    log "Code updated successfully"
}

# Build application
build_application() {
    log "Building wedding photo application..."

    # Build Docker image
    docker-compose -f docker-compose.prod.yml build --no-cache

    # Verify build
    if docker images | grep -q "wedding-photo-share"; then
        log "Docker image built successfully"
    else
        error "Docker image build failed"
    fi
}

# Stop current deployment
stop_current() {
    log "Stopping current deployment..."

    # Stop and remove containers
    docker-compose -f docker-compose.prod.yml down --remove-orphans || true

    # Remove unused images
    docker image prune -f || true

    log "Current deployment stopped"
}

# Start new deployment
start_new() {
    log "Starting new deployment..."

    # Start services
    docker-compose -f docker-compose.prod.yml up -d

    # Wait for services to be ready
    log "Waiting for services to start..."
    sleep 30

    # Check if services are running
    if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
        log "Services started successfully"
    else
        error "Failed to start services"
    fi
}

# Health check
health_check() {
    log "Performing health check..."

    local max_attempts=10
    local attempt=1

    while [[ $attempt -le $max_attempts ]]; do
        info "Health check attempt $attempt/$max_attempts"

        if curl -f -s http://localhost:3001/health > /dev/null; then
            log "Health check passed"
            return 0
        fi

        sleep 10
        ((attempt++))
    done

    error "Health check failed after $max_attempts attempts"
}

# Setup SSL (Let's Encrypt)
setup_ssl() {
    log "Setting up SSL certificate..."

    # Check if certbot is installed
    if ! command -v certbot &> /dev/null; then
        warn "Certbot not installed, skipping SSL setup"
        return 0
    fi

    # Create SSL certificate directory
    sudo mkdir -p ./ssl-certs

    # Get certificate
    sudo certbot certonly --webroot \
        -w /var/www/certbot \
        -d $DOMAIN \
        --email admin@jagdevops.co.za \
        --agree-tos \
        --non-interactive || warn "SSL certificate generation failed"

    # Copy certificates
    if [[ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]]; then
        sudo cp "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ./ssl-certs/
        sudo cp "/etc/letsencrypt/live/$DOMAIN/privkey.pem" ./ssl-certs/
        sudo chown $USER:$USER ./ssl-certs/*
        log "SSL certificates installed"
    else
        warn "SSL certificates not found, continuing without HTTPS"
    fi
}

# Configure nginx reverse proxy on host
configure_nginx_proxy() {
    log "Configuring nginx reverse proxy..."

    # Create nginx configuration for the host
    local nginx_config="/etc/nginx/sites-available/wedding-photos"

    if [[ -f $nginx_config ]]; then
        sudo cp $nginx_config "$nginx_config.backup.$(date +%s)"
    fi

    sudo tee $nginx_config > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN;

    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Redirect HTTP to HTTPS
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN;

    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Proxy to Docker container
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # For file uploads
        client_max_body_size 20M;
    }
}
EOF

    # Enable site
    sudo ln -sf $nginx_config /etc/nginx/sites-enabled/

    # Test nginx configuration
    sudo nginx -t

    # Reload nginx
    sudo systemctl reload nginx

    log "Nginx reverse proxy configured"
}

# Setup monitoring
setup_monitoring() {
    log "Setting up monitoring..."

    # Create simple monitoring page
    cat > monitoring.html <<EOF
<!DOCTYPE html>
<html>
<head>
    <title>Kirsten & Dale Wedding Photos - Status</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .status { padding: 20px; margin: 20px 0; border-radius: 8px; }
        .ok { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        h1 { color: #333; }
    </style>
    <script>
        function checkStatus() {
            fetch('/health')
                .then(response => {
                    const statusDiv = document.getElementById('status');
                    if (response.ok) {
                        statusDiv.className = 'status ok';
                        statusDiv.innerHTML = '✅ Wedding Photo Share is running smoothly!';
                    } else {
                        statusDiv.className = 'status error';
                        statusDiv.innerHTML = '❌ Service is experiencing issues';
                    }
                })
                .catch(error => {
                    const statusDiv = document.getElementById('status');
                    statusDiv.className = 'status error';
                    statusDiv.innerHTML = '❌ Cannot connect to service';
                });
        }

        setInterval(checkStatus, 30000); // Check every 30 seconds
        checkStatus(); // Initial check
    </script>
</head>
<body>
    <h1>💒 Kirsten & Dale Wedding Photos</h1>
    <div id="status" class="status">Checking status...</div>
    <p>Last updated: <span id="timestamp">$(date)</span></p>
    <p>Deployment time: $(date)</p>
</body>
</html>
EOF

    log "Monitoring page created"
}

# Cleanup old resources
cleanup() {
    log "Cleaning up old resources..."

    # Remove old images (keep last 3)
    docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.ID}}\t{{.CreatedAt}}" | \
        grep wedding-photo-share | \
        tail -n +4 | \
        awk '{print $3}' | \
        xargs -r docker rmi -f || true

    # Remove old backups (keep last 7 days)
    find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete 2>/dev/null || true

    log "Cleanup completed"
}

# Send notification
send_notification() {
    local status=$1
    local message=$2

    log "Sending deployment notification..."

    # Simple webhook notification (customize as needed)
    curl -X POST -H "Content-Type: application/json" \
         -d "{\"text\":\"🎊 Wedding Photos Deployment: $status - $message\"}" \
         "${WEBHOOK_URL:-}" 2>/dev/null || warn "Notification failed"
}

# Main deployment process
main() {
    log "🎊 Starting deployment for Kirsten & Dale Wedding Photo Share 🎊"

    check_root
    check_prerequisites
    load_environment
    create_backup
    pull_latest
    build_application
    stop_current
    start_new
    health_check
    setup_ssl
    configure_nginx_proxy
    setup_monitoring
    cleanup

    log "🎉 Deployment completed successfully! 🎉"
    log "Wedding Photo Share is now available at: https://$DOMAIN"

    send_notification "SUCCESS" "Deployment completed successfully"

    # Show final status
    echo ""
    echo "=========================="
    echo "🎊 DEPLOYMENT SUMMARY 🎊"
    echo "=========================="
    echo "Application: Kirsten & Dale Wedding Photos"
    echo "Domain: https://$DOMAIN"
    echo "Status: Running"
    echo "Monitoring: http://localhost:3002"
    echo "Logs: docker-compose -f docker-compose.prod.yml logs -f"
    echo "=========================="
}

# Rollback function
rollback() {
    log "🔄 Rolling back deployment..."

    # Stop current containers
    docker-compose -f docker-compose.prod.yml down || true

    # Find latest backup
    local latest_backup=$(ls -t $BACKUP_DIR/wedding-photos-*.tar.gz 2>/dev/null | head -1)

    if [[ -n "$latest_backup" ]]; then
        log "Restoring from backup: $latest_backup"
        docker load < "$latest_backup"
        docker-compose -f docker-compose.prod.yml up -d
        log "Rollback completed"
    else
        error "No backup found for rollback"
    fi
}

# Handle script arguments
case "${1:-}" in
    "rollback")
        rollback
        ;;
    "health")
        health_check
        ;;
    "logs")
        docker-compose -f docker-compose.prod.yml logs -f
        ;;
    "stop")
        stop_current
        ;;
    "start")
        start_new
        health_check
        ;;
    *)
        main
        ;;
esac
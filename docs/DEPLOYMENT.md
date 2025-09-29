# 🚀 Deployment Guide

This guide covers deploying the Wedding Photo Share application to production environments, including Docker, EC2, and serverless platforms.

## 📋 Pre-Deployment Checklist

### Security Review
- [ ] Admin password is strong and secure
- [ ] Environment variables are properly configured
- [ ] No sensitive data in git repository
- [ ] SSL certificates are ready
- [ ] Cloudinary upload presets are secured

### Performance Optimization
- [ ] Bundle size is optimized
- [ ] Images are compressed
- [ ] CDN is configured
- [ ] Caching strategies are implemented

### Testing Verification
- [ ] All tests pass
- [ ] E2E tests complete successfully
- [ ] Performance benchmarks meet requirements
- [ ] Security scans are clean

## 🌐 Serverless Deployment (Recommended)

### Vercel Deployment

#### Quick Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/wedding-photo-share)

#### Manual Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Set environment variables
vercel env add VITE_CLOUDINARY_CLOUD_NAME
vercel env add VITE_CLOUDINARY_UPLOAD_PRESET
vercel env add VITE_ADMIN_PASSWORD
```

#### Custom Domain Setup
```bash
# Add custom domain
vercel domains add yourwedding.com

# Update DNS records
# A record: @ -> 76.76.19.61
# CNAME: www -> cname.vercel-dns.com
```

### Netlify Deployment

#### Via Git Integration
1. Connect GitHub repository to Netlify
2. Set build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
3. Configure environment variables in Netlify dashboard

#### CLI Deployment
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

#### Custom Headers
Create `public/_headers`:
```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Strict-Transport-Security: max-age=31536000; includeSubDomains
```

## 🐳 Docker Deployment

### Production Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration
Create `nginx.conf`:
```nginx
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    sendfile        on;
    keepalive_timeout  65;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;

    server {
        listen       80;
        server_name  localhost;
        root         /usr/share/nginx/html;
        index        index.html;

        # SPA routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Security headers
        add_header X-Frame-Options "DENY" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    }
}
```

### Docker Build and Run
```bash
# Build Docker image
docker build -t wedding-photo-share:latest .

# Run container
docker run -d \
  --name wedding-app \
  -p 80:80 \
  wedding-photo-share:latest

# With environment variables
docker run -d \
  --name wedding-app \
  -p 80:80 \
  -e VITE_CLOUDINARY_CLOUD_NAME=your_cloud \
  wedding-photo-share:latest
```

### Docker Compose Production
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped

  nginx-proxy:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./ssl:/etc/nginx/ssl
      - ./nginx-proxy.conf:/etc/nginx/nginx.conf
    depends_on:
      - app
    restart: unless-stopped
```

## ☁️ AWS EC2 Deployment

### EC2 Instance Setup

#### Launch Instance
```bash
# Create security group
aws ec2 create-security-group \
  --group-name wedding-app-sg \
  --description "Wedding Photo Share Security Group"

# Add rules
aws ec2 authorize-security-group-ingress \
  --group-name wedding-app-sg \
  --protocol tcp \
  --port 22 \
  --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-name wedding-app-sg \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-name wedding-app-sg \
  --protocol tcp \
  --port 443 \
  --cidr 0.0.0.0/0
```

#### Instance Configuration
**Recommended specs:**
- **Instance Type**: t3.medium (2 vCPU, 4 GB RAM)
- **Storage**: 20 GB GP3 SSD
- **OS**: Ubuntu 22.04 LTS
- **Security Group**: wedding-app-sg

### Server Setup Script
```bash
#!/bin/bash
# Server setup script for Ubuntu 22.04

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Docker
sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Nginx
sudo apt install -y nginx

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx

# Create app directory
sudo mkdir -p /var/www/wedding-app
sudo chown ubuntu:ubuntu /var/www/wedding-app
```

### Application Deployment
```bash
# Clone repository
cd /var/www/wedding-app
git clone https://github.com/yourusername/wedding-photo-share.git .

# Create environment file
cp .env.example .env
nano .env  # Edit with production values

# Install dependencies and build
npm ci --only=production
npm run build

# Copy built files to nginx
sudo cp -r dist/* /var/www/html/
```

### Nginx Configuration
```nginx
# /etc/nginx/sites-available/wedding-app
server {
    listen 80;
    server_name yourwedding.com www.yourwedding.com;
    root /var/www/html;
    index index.html;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Rate limiting for uploads
    location /api/upload {
        limit_req zone=upload burst=5 nodelay;
        proxy_pass http://localhost:3001;
    }
}
```

### SSL Certificate Setup
```bash
# Get SSL certificate
sudo certbot --nginx -d yourwedding.com -d www.yourwedding.com

# Test auto-renewal
sudo certbot renew --dry-run

# Setup auto-renewal cron job
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

## 🔒 Security Configuration

### Environment Variables
```bash
# Secure environment file
sudo nano /etc/environment

# Add production variables
VITE_CLOUDINARY_CLOUD_NAME=prod_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=prod_preset
VITE_ADMIN_PASSWORD=super_secure_password_here
VITE_APP_URL=https://yourwedding.com
```

### Firewall Setup
```bash
# Enable UFW firewall
sudo ufw enable

# Allow specific ports
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'

# Block all other traffic
sudo ufw default deny incoming
sudo ufw default allow outgoing
```

### Fail2Ban Setup
```bash
# Install Fail2Ban
sudo apt install fail2ban

# Configure for Nginx
sudo nano /etc/fail2ban/jail.local
```

```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[nginx-http-auth]
enabled = true

[nginx-limit-req]
enabled = true
```

## 📊 Monitoring & Logging

### System Monitoring
```bash
# Install monitoring tools
sudo apt install htop iotop

# Setup log rotation
sudo nano /etc/logrotate.d/wedding-app
```

```
/var/log/wedding-app/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    sharedscripts
}
```

### Application Monitoring
```bash
# Install PM2 for process management
npm install -g pm2

# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'wedding-app',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/wedding-app',
    env: {
      NODE_ENV: 'production'
    }
  }]
}
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 🔄 Backup & Recovery

### Automated Backup Script
```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/var/backups/wedding-app"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /var/www/wedding-app

# Backup Nginx configuration
tar -czf $BACKUP_DIR/nginx_$DATE.tar.gz /etc/nginx

# Backup SSL certificates
tar -czf $BACKUP_DIR/ssl_$DATE.tar.gz /etc/letsencrypt

# Remove backups older than 7 days
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

### Setup Backup Cron Job
```bash
# Make script executable
chmod +x backup.sh

# Add to crontab (daily at 2 AM)
echo "0 2 * * * /path/to/backup.sh" | sudo crontab -
```

## 🚀 Performance Optimization

### CDN Configuration
```javascript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[hash][extname]',
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js'
      }
    }
  }
})
```

### Cloudflare Setup
1. Add domain to Cloudflare
2. Update DNS to Cloudflare nameservers
3. Configure caching rules:
   - **Static assets**: Cache for 1 year
   - **HTML files**: Cache for 1 hour
   - **API endpoints**: No cache

### Database Optimization (if using)
```bash
# Redis for session storage
sudo apt install redis-server

# Configure Redis
sudo nano /etc/redis/redis.conf
# maxmemory 256mb
# maxmemory-policy allkeys-lru
```

## 🔧 Deployment Automation

### GitHub Actions Workflow
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run tests
      run: npm test

    - name: Build application
      run: npm run build
      env:
        VITE_CLOUDINARY_CLOUD_NAME: ${{ secrets.CLOUDINARY_CLOUD_NAME }}
        VITE_CLOUDINARY_UPLOAD_PRESET: ${{ secrets.CLOUDINARY_UPLOAD_PRESET }}

    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.4
      with:
        host: ${{ secrets.HOST }}
        username: ubuntu
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /var/www/wedding-app
          git pull origin main
          npm ci --only=production
          npm run build
          sudo cp -r dist/* /var/www/html/
          sudo systemctl reload nginx
```

## 📱 Mobile App Deployment (Optional)

### Progressive Web App
```javascript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      manifest: {
        name: 'Wedding Photo Share',
        short_name: 'WeddingShare',
        description: 'Share your wedding photos',
        theme_color: '#ec4899',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})
```

## 🚨 Troubleshooting

### Common Deployment Issues

#### Build Failures
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
npm run build
```

#### SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew --nginx

# Test renewal
sudo certbot renew --dry-run
```

#### Performance Issues
```bash
# Check server resources
htop
df -h
free -m

# Analyze bundle size
npm run build
npm install -g webpack-bundle-analyzer
npx webpack-bundle-analyzer dist/assets
```

## 📞 Support

For deployment issues:
- Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- Review server logs: `sudo journalctl -u nginx`
- Monitor application: `pm2 logs`
- Contact support: deploy@yourwedding.com

---

**Next Steps:** After deployment, see [MAINTENANCE.md](MAINTENANCE.md) for ongoing maintenance procedures.
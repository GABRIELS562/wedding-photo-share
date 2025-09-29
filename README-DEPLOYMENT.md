# 🎊 Kirsten & Dale Wedding Photo Share - Production Deployment Guide

This guide covers deploying the wedding photo sharing application to EC2 with Docker, optimized for `photos.jagdevops.co.za`.

## 🚀 Quick Start

### Prerequisites

1. **EC2 Instance Setup**:
   - Ubuntu 22.04 LTS
   - Minimum: t3.medium (2 vCPU, 4 GB RAM)
   - 20 GB storage
   - Security groups allow ports 22, 80, 443, 3001

2. **Required Software**:
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker $USER

   # Install Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose

   # Install Nginx (for reverse proxy)
   sudo apt install nginx certbot python3-certbot-nginx -y
   ```

### Deployment Steps

1. **Clone and Configure**:
   ```bash
   git clone <repository-url> wedding-photo-share
   cd wedding-photo-share

   # Copy and configure environment
   cp .env.production.example .env.production
   nano .env.production  # Fill in your Cloudinary credentials
   ```

2. **Deploy**:
   ```bash
   ./deploy.sh
   ```

That's it! The script handles everything automatically.

## 🔧 Configuration

### Environment Variables

Critical variables in `.env.production`:

```env
# Cloudinary (Required)
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=kirsten_dale_wedding_preset
VITE_CLOUDINARY_API_KEY=your_api_key
VITE_CLOUDINARY_API_SECRET=your_api_secret

# Wedding Details
VITE_EVENT_NAME="Kirsten & Dale"
VITE_EVENT_DATE="October 12, 2024"
VITE_EVENT_LOCATION="Rosewood Manor, Cape Town"

# Security
VITE_ADMIN_PASSWORD=your_secure_password

# Domain
DOMAIN=photos.jagdevops.co.za
```

### Cloudinary Setup

1. **Create Upload Preset**:
   - Name: `kirsten_dale_wedding_preset`
   - Mode: Unsigned
   - Folder: `kirsten_dale_wedding_2024`
   - Max file size: 10MB
   - Allowed formats: jpg, png, gif, webp

2. **Configure Transformations**:
   - Auto quality: `q_auto:good`
   - Auto format: `f_auto`
   - Thumbnails: `w_400,h_400,c_fill`

## 🏗️ Architecture

```
Internet → Nginx (Host) → Docker Container (Port 3001)
           ↓
       SSL/HTTPS → Wedding Photo App
```

### Container Structure

- **Base**: `node:18-alpine` (build) + `nginx:alpine` (runtime)
- **Port**: 3001 (configurable)
- **Volumes**: SSL certs, logs
- **Health Checks**: `/health` endpoint
- **Security**: Non-root user, security headers

## 📊 Monitoring

### Health Checks

- **Application**: `curl http://localhost:3001/health`
- **Container**: Built-in Docker health checks
- **Monitoring Page**: `http://localhost:3002`

### Logs

```bash
# Application logs
docker-compose -f docker-compose.prod.yml logs -f

# Nginx logs
tail -f logs/access.log logs/error.log

# System logs
sudo journalctl -u docker -f
```

## 🔐 Security Features

### Application Security

- **HTTPS Only**: Automatic HTTP → HTTPS redirect
- **Security Headers**: CSP, HSTS, XSS protection
- **Rate Limiting**: Upload and API endpoints
- **Input Validation**: File type and size limits
- **Non-root Container**: Security best practices

### Network Security

- **Firewall**: UFW with minimal ports
- **SSL/TLS**: Let's Encrypt certificates
- **Reverse Proxy**: Nginx with security headers
- **Container Isolation**: Bridge network

## 🛠️ Operations

### Deployment Commands

```bash
# Full deployment
./deploy.sh

# Rollback to previous version
./deploy.sh rollback

# Check health
./deploy.sh health

# View logs
./deploy.sh logs

# Stop services
./deploy.sh stop

# Start services
./deploy.sh start
```

### Maintenance

```bash
# Update application
git pull origin main
./deploy.sh

# Renew SSL certificate
sudo certbot renew

# View disk usage
docker system df

# Clean up old images
docker system prune -a
```

## 📱 QR Code Integration

### Generating QR Codes

```bash
# Install QR code generator
npm install -g qrcode-generator-cli

# Generate QR code for mobile access
qr-code-generator https://photos.jagdevops.co.za/upload \
  --width 400 --height 400 \
  --output wedding-qr-code.png
```

### Mobile Optimization

- **Touch-optimized**: Swipe gestures, large buttons
- **Camera Integration**: Direct photo capture
- **Offline Support**: Upload queue with retry
- **Progressive Loading**: Optimized for mobile networks

## 🎨 Wedding Theme Features

### Visual Design

- **Color Palette**: Gold (#d4af37), Sage (#9caf88), Dusty Rose (#d4b5a0)
- **Typography**: Playfair Display, Dancing Script, Montserrat
- **Animations**: Framer Motion with wedding-themed effects
- **Responsive**: Mobile-first design

### User Experience

- **Guest Flow**: Name → Upload → Gallery
- **Mobile QR**: Scan → Upload immediately
- **Progress Tracking**: Real-time upload feedback
- **Memory Collection**: Beautiful photo organization

## 🔄 Backup & Recovery

### Automatic Backups

- **Container Images**: Before each deployment
- **Configuration**: Docker configs and environment
- **Retention**: 7 days (configurable)
- **Location**: `/var/backups/wedding-photos`

### Recovery Process

```bash
# Restore from backup
./deploy.sh rollback

# Manual restore
docker load < /var/backups/wedding-photos/backup-file.tar.gz
docker-compose -f docker-compose.prod.yml up -d
```

## 📈 Performance Optimization

### Image Optimization

- **Cloudinary**: Auto-format, quality, compression
- **Responsive**: Multiple sizes for different devices
- **CDN**: Global delivery network
- **Lazy Loading**: Load images as needed

### Caching Strategy

- **Static Assets**: 1 year cache
- **HTML**: 1 hour cache
- **API Responses**: No cache
- **Browser Cache**: Optimized headers

## 🚨 Troubleshooting

### Common Issues

1. **Port 3001 in use**:
   ```bash
   sudo lsof -i :3001
   sudo kill -9 <PID>
   ```

2. **SSL certificate issues**:
   ```bash
   sudo certbot renew --dry-run
   sudo nginx -t && sudo systemctl reload nginx
   ```

3. **Docker permissions**:
   ```bash
   sudo usermod -aG docker $USER
   # Logout and login again
   ```

4. **Cloudinary upload errors**:
   - Check API credentials
   - Verify upload preset configuration
   - Check file size limits

### Log Analysis

```bash
# Check deployment logs
tail -f /var/log/wedding-deployment.log

# Check container health
docker-compose -f docker-compose.prod.yml ps

# Check nginx errors
sudo tail -f /var/log/nginx/error.log

# Check system resources
htop
df -h
free -m
```

## 🔗 Integration

### Domain Setup

1. **DNS Configuration**:
   ```
   CNAME: photos.jagdevops.co.za → your-ec2-instance.region.compute.amazonaws.com
   ```

2. **SSL Certificate**:
   ```bash
   sudo certbot --nginx -d photos.jagdevops.co.za
   ```

### Main Wedding Site Integration

Add link to main wedding site:
```html
<a href="https://photos.jagdevops.co.za" target="_blank">
  📸 Share Your Wedding Photos
</a>
```

## 📞 Support

### Monitoring Alerts

- **Health Check**: Every 30 seconds
- **SSL Expiry**: 30 days before expiration
- **Disk Space**: 80% threshold
- **Memory Usage**: 90% threshold

### Contact Information

- **Technical Support**: admin@jagdevops.co.za
- **Wedding Couple**: [Contact details]
- **Emergency**: [Emergency contact]

---

**🎊 Congratulations Kirsten & Dale! 🎊**

Your wedding photo sharing platform is ready to capture and preserve all the beautiful memories from your special day!
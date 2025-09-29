# 🎊 Kirsten & Dale Wedding Photo Share - Complete Deployment Guide

## 📅 Wedding Details
- **Date**: Friday, October 31, 2024
- **Venue**: Cape Point Vineyard, Noordhoek
- **Domain**: https://photos.jagdevops.co.za
- **GitHub**: https://github.com/GABRIELS562/wedding-photo-share

---

## 📋 COMPLETE DEPLOYMENT CHECKLIST

### ✅ Phase 1: Cloudinary Setup (Required - 10 minutes)

1. **Create Cloudinary Account**
   - Go to https://cloudinary.com
   - Sign up for FREE account
   - From Dashboard, copy:
     - Cloud Name (e.g., `dxxxxxxx`)
     - API Key (e.g., `123456789012345`)
     - API Secret (e.g., `abcdefghijklmnopqrstuvwxyz`)

2. **Create Upload Preset**
   - Go to Settings → Upload
   - Click "Add upload preset"
   - Mode: **Unsigned**
   - Preset name: `wedding_photos_unsigned`
   - Folder: `kirsten_dale_wedding_2024`
   - Click Save

3. **Update .env.production file**
   ```bash
   # Edit this file on your local machine
   nano .env.production
   ```
   Replace the placeholder values with your real Cloudinary credentials:
   ```
   VITE_CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
   VITE_CLOUDINARY_UPLOAD_PRESET=wedding_photos_unsigned
   VITE_CLOUDINARY_API_KEY=your_actual_api_key
   VITE_CLOUDINARY_API_SECRET=your_actual_api_secret
   ```

---

### ✅ Phase 2: Local Preparation (5 minutes)

1. **Build the production app**
   ```bash
   cd /Users/user/wedding-photo-share
   npm run build
   ```

2. **Test locally with Docker (optional)**
   ```bash
   docker build -t wedding-photo-share:latest .
   docker run -p 3000:80 wedding-photo-share:latest
   # Visit http://localhost:3000 to test
   ```

3. **Commit and push changes**
   ```bash
   git add .
   git commit -m "Ready for production deployment"
   git push
   ```

---

### ✅ Phase 3: EC2 Setup (20 minutes)

#### Step 1: Connect to your EC2 instance
```bash
# Replace with your EC2 details
ssh -i your-key.pem ubuntu@your-ec2-public-ip

# Or if you have SSH config set up
ssh your-ec2-alias
```

#### Step 2: Install Docker & Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install docker.io docker-compose git nginx certbot python3-certbot-nginx -y

# Add user to docker group
sudo usermod -aG docker $USER

# Logout and login again for group changes
exit
ssh ubuntu@your-ec2-public-ip
```

#### Step 3: Clone and Setup Repository
```bash
# Clone the repository
git clone https://github.com/GABRIELS562/wedding-photo-share.git
cd wedding-photo-share

# Create production environment file
nano .env
# Paste your REAL Cloudinary credentials here:
```

Copy and paste this (with YOUR real values):
```env
VITE_CLOUDINARY_CLOUD_NAME=your_real_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=wedding_photos_unsigned
VITE_CLOUDINARY_API_KEY=your_real_api_key
VITE_CLOUDINARY_API_SECRET=your_real_api_secret
VITE_EVENT_NAME=Kirsten & Dale's Wedding
VITE_EVENT_DATE=2024-10-31
VITE_EVENT_LOCATION=Cape Point Vineyard, Noordhoek
VITE_ADMIN_PASSWORD=KirstenDale2024!
VITE_APP_URL=https://photos.jagdevops.co.za
VITE_MAX_FILE_SIZE=10485760
VITE_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp,image/heic,image/heif
VITE_MAX_UPLOADS_PER_SESSION=20
```

#### Step 4: Build and Run with Docker
```bash
# Build the Docker image
docker build -t wedding-photo-share:latest .

# Run with the lightweight configuration
docker-compose -f docker-compose.lite.yml up -d

# Check if it's running
docker ps
docker logs wedding-photo-share

# Test locally on EC2
curl http://localhost/health
```

---

### ✅ Phase 4: Domain & SSL Setup (15 minutes)

#### Step 1: Configure DNS (in your domain provider - GoDaddy/Namecheap/etc)
1. Login to your domain registrar
2. Go to DNS Management
3. Add record:
   - Type: **A Record** (if using Elastic IP) or **CNAME** (if using EC2 DNS)
   - Name: `photos`
   - Value: `your-ec2-elastic-ip` or `ec2-xxx.compute.amazonaws.com`
   - TTL: 600

#### Step 2: Setup Nginx Reverse Proxy (on EC2)
```bash
# Stop Docker nginx temporarily
docker-compose -f docker-compose.lite.yml down

# Install and configure system Nginx
sudo nano /etc/nginx/sites-available/wedding-photos
```

Paste this configuration:
```nginx
server {
    listen 80;
    server_name photos.jagdevops.co.za;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    client_max_body_size 20M;
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/wedding-photos /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Update docker-compose to use port 3001
nano docker-compose.lite.yml
# Change ports from "80:80" to "3001:80"

# Restart Docker container
docker-compose -f docker-compose.lite.yml up -d
```

#### Step 3: SSL Certificate with Let's Encrypt
```bash
# Get SSL certificate
sudo certbot --nginx -d photos.jagdevops.co.za

# Follow prompts:
# - Enter email
# - Agree to terms
# - Choose redirect HTTP to HTTPS (option 2)

# Test auto-renewal
sudo certbot renew --dry-run
```

---

### ✅ Phase 5: Testing & Verification (5 minutes)

1. **Test the live site**
   - Visit https://photos.jagdevops.co.za
   - Should see the wedding upload page
   - Try uploading a test photo
   - Check admin panel: https://photos.jagdevops.co.za/admin
   - Password: `KirstenDale2024!`

2. **Test on mobile**
   - Open on phone browser
   - Should see PWA install prompt
   - Test photo upload from camera

3. **Monitor logs**
   ```bash
   # On EC2
   docker logs -f wedding-photo-share
   sudo tail -f /var/log/nginx/access.log
   ```

---

## 🎯 Quick Commands Reference

### On EC2 - Container Management
```bash
# View running containers
docker ps

# View logs
docker logs wedding-photo-share

# Restart app
docker-compose -f docker-compose.lite.yml restart

# Stop app
docker-compose -f docker-compose.lite.yml down

# Start app
docker-compose -f docker-compose.lite.yml up -d

# Rebuild after changes
git pull
docker build -t wedding-photo-share:latest .
docker-compose -f docker-compose.lite.yml up -d --force-recreate
```

### Monitoring
```bash
# Check memory usage
free -h

# Check disk space
df -h

# Check Docker resource usage
docker stats

# Check app health
curl https://photos.jagdevops.co.za/health
```

---

## 📱 QR Code Generation (Before Wedding)

1. **Generate QR codes**
   ```bash
   # On your local machine
   cd wedding-photo-share
   npm run generate-qr -- --url https://photos.jagdevops.co.za/upload
   ```

2. **Print QR codes**
   - Place on reception tables
   - Include on wedding programs
   - Display at venue entrance

---

## 🚨 Troubleshooting Guide

### Issue: Site not accessible
```bash
# Check if Docker is running
docker ps

# Check nginx
sudo systemctl status nginx

# Check firewall
sudo ufw status

# Allow ports if needed
sudo ufw allow 80
sudo ufw allow 443
```

### Issue: Photos not uploading
```bash
# Check Cloudinary credentials
docker exec wedding-photo-share env | grep CLOUDINARY

# Check logs
docker logs wedding-photo-share --tail 50

# Test Cloudinary connection
curl https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload
```

### Issue: EC2 running out of space
```bash
# Clean Docker
docker system prune -a

# Check what's using space
du -sh /*
```

---

## 📊 Wedding Day Checklist

### 1 Week Before:
- [ ] Test full upload flow
- [ ] Generate and print QR codes
- [ ] Brief wedding party on app usage
- [ ] Backup EC2 instance

### Day Before:
- [ ] Clear test photos from admin panel
- [ ] Verify SSL certificate
- [ ] Check EC2 health
- [ ] Test from multiple devices

### Day Of:
- [ ] Monitor uploads via admin panel
- [ ] Check server resources periodically
- [ ] Have backup plan (Google Photos link)

### After Wedding:
- [ ] Download all photos via admin panel
- [ ] Create backup on external drive
- [ ] Share download link with couple
- [ ] Keep site running for 1 month

---

## 💰 Cost Breakdown

- **EC2 t2.micro**: FREE (750 hours/month for 12 months)
- **Cloudinary**: FREE (25GB storage, 25GB bandwidth)
- **Domain**: Already owned
- **SSL**: FREE (Let's Encrypt)
- **Total**: $0/month 🎉

---

## 🔐 Security Notes

1. **Admin Password**: `KirstenDale2024!`
   - Change this in .env file if needed
   - Only share with couple

2. **Cloudinary**:
   - Uses unsigned uploads (safe for public)
   - Photos organized in wedding folder
   - Auto-backup enabled

3. **EC2 Security**:
   - Security group: Allow ports 80, 443, 22
   - Keep system updated
   - Monitor access logs

---

## 📞 Quick Support

### If something breaks on wedding day:
1. **Quick fix**: Restart Docker
   ```bash
   ssh ubuntu@your-ec2-ip
   cd wedding-photo-share
   docker-compose -f docker-compose.lite.yml restart
   ```

2. **Backup option**: Direct Cloudinary upload
   - Share this link: https://cloudinary.com/console/YOUR_CLOUD_NAME/media_library

3. **Emergency**: Use Google Photos
   - Create shared album as backup

---

## 🎉 Success Metrics

- Target: 200-500 photo uploads
- Expected users: 50-100 concurrent
- Storage needed: ~2-5GB on Cloudinary
- EC2 load: <30% CPU, <500MB RAM

---

## 📝 Notes Section

Add your notes here:
- EC2 IP: _______________
- Cloudinary Cloud Name: _______________
- DNS Provider: _______________
- SSL Expiry: _______________

---

## ✨ Final Reminders

1. Everything stores on Cloudinary, not EC2
2. EC2 only serves the web interface (5MB)
3. Free tier handles 1000+ concurrent users
4. SSL auto-renews every 90 days
5. Admin panel shows real-time uploads

---

**Created with 💕 for Kirsten & Dale's Special Day**
**October 31, 2024 | Cape Point Vineyard, Noordhoek**
# 🔧 Maintenance Guide

This guide covers ongoing maintenance procedures for the Wedding Photo Share application to ensure optimal performance, security, and reliability.

## 📋 Regular Maintenance Schedule

### Daily Tasks (Automated)
- **Cloudinary Usage Monitoring** - Check storage and bandwidth usage
- **Error Log Review** - Monitor application errors and performance
- **Backup Verification** - Ensure automated backups are running
- **Security Alerts** - Check for any security notifications

### Weekly Tasks
- **Dependency Updates** - Review and update npm packages
- **Performance Monitoring** - Analyze site speed and user experience
- **Storage Cleanup** - Remove old logs and temporary files
- **Analytics Review** - Check user engagement and upload patterns

### Monthly Tasks
- **Security Audit** - Review access logs and security settings
- **Backup Testing** - Verify backup restoration procedures
- **Documentation Updates** - Keep documentation current
- **Performance Optimization** - Optimize based on usage patterns

### Quarterly Tasks
- **Major Updates** - Update React, TypeScript, and major dependencies
- **Security Penetration Testing** - Professional security assessment
- **Disaster Recovery Testing** - Full system recovery testing
- **Capacity Planning** - Plan for growth and scaling needs

## 🔍 Monitoring & Analytics

### Application Monitoring

#### Performance Metrics
```bash
# Web Vitals monitoring
# Core Web Vitals to track:
# - Largest Contentful Paint (LCP): < 2.5s
# - First Input Delay (FID): < 100ms
# - Cumulative Layout Shift (CLS): < 0.1

# Monitor using Google PageSpeed Insights
curl "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://yourwedding.com&strategy=mobile"
```

#### Error Tracking
```javascript
// Set up error monitoring in your app
window.addEventListener('error', (event) => {
  console.error('Application Error:', {
    message: event.error.message,
    stack: event.error.stack,
    filename: event.filename,
    lineno: event.lineno
  })

  // Send to monitoring service
  // fetch('/api/errors', { method: 'POST', body: JSON.stringify(errorData) })
})

// React Error Boundary for component errors
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('React Error:', error, errorInfo)
    // Log to monitoring service
  }
}
```

#### Uptime Monitoring
```bash
# Set up external monitoring
# Tools: UptimeRobot, Pingdom, StatusCake

# Simple health check endpoint
curl -f https://yourwedding.com/health || echo "Site is down"

# Monitor critical pages
pages=(
  "https://yourwedding.com/"
  "https://yourwedding.com/upload"
  "https://yourwedding.com/gallery"
  "https://yourwedding.com/admin"
)

for page in "${pages[@]}"; do
  status=$(curl -s -o /dev/null -w "%{http_code}" "$page")
  if [ "$status" != "200" ]; then
    echo "Alert: $page returned status $status"
  fi
done
```

### Cloudinary Monitoring

#### Usage Tracking
```javascript
// Monitor Cloudinary usage
const monitorCloudinaryUsage = async () => {
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/usage`,
      {
        headers: {
          'Authorization': `Basic ${btoa(`${API_KEY}:${API_SECRET}`)}`
        }
      }
    )

    const usage = await response.json()

    // Check against limits (80% warning threshold)
    const alerts = []

    if (usage.usage.storage > usage.limit.storage * 0.8) {
      alerts.push('Storage approaching limit')
    }

    if (usage.usage.bandwidth > usage.limit.bandwidth * 0.8) {
      alerts.push('Bandwidth approaching limit')
    }

    if (usage.usage.transformations > usage.limit.transformations * 0.8) {
      alerts.push('Transformations approaching limit')
    }

    return { usage, alerts }
  } catch (error) {
    console.error('Failed to fetch Cloudinary usage:', error)
  }
}
```

#### Asset Health Check
```javascript
// Check for broken images
const checkAssetHealth = async () => {
  const images = await listAllImages()
  const brokenImages = []

  for (const image of images) {
    try {
      const response = await fetch(image.secure_url, { method: 'HEAD' })
      if (!response.ok) {
        brokenImages.push(image.public_id)
      }
    } catch (error) {
      brokenImages.push(image.public_id)
    }
  }

  return brokenImages
}
```

## 🔄 Update Procedures

### Dependency Management

#### Security Updates
```bash
# Check for security vulnerabilities
npm audit

# Fix automatically
npm audit fix

# For critical vulnerabilities that can't be auto-fixed
npm audit fix --force

# Update specific vulnerable packages
npm install package-name@latest
```

#### Regular Updates
```bash
# Check outdated packages
npm outdated

# Update all packages to latest compatible versions
npm update

# Update to latest versions (may include breaking changes)
npm install package-name@latest

# Update all packages to latest (careful!)
npx npm-check-updates -u
npm install
```

#### Major Framework Updates
```bash
# React updates
npm install react@latest react-dom@latest
npm install --save-dev @types/react@latest @types/react-dom@latest

# TypeScript updates
npm install --save-dev typescript@latest

# Vite updates
npm install --save-dev vite@latest

# Test after each major update
npm run test
npm run build
npm run dev
```

### Environment Updates

#### Node.js Updates
```bash
# Check current version
node --version

# Using nvm to update
nvm install node --latest-npm
nvm use node

# Update npm separately
npm install -g npm@latest

# Verify versions
node --version && npm --version
```

#### Browser Compatibility
```javascript
// Update browserslist in package.json
{
  "browserslist": [
    "> 1%",
    "last 2 versions",
    "not dead",
    "not ie 11"
  ]
}

// Check compatibility
npx browserslist
```

## 🧹 Cleanup Procedures

### Storage Cleanup

#### Log Rotation
```bash
# Set up log rotation for production servers
sudo nano /etc/logrotate.d/wedding-app

# Configuration
/var/log/wedding-app/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    sharedscripts
    postrotate
        systemctl reload nginx
    endscript
}
```

#### Cloudinary Cleanup
```javascript
// Remove old temporary uploads
const cleanupOldUploads = async () => {
  const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago

  const searchResults = await cloudinary.search
    .expression(`created_at:<${cutoffDate.toISOString()} AND tags:temporary`)
    .max_results(500)
    .execute()

  const publicIds = searchResults.resources.map(resource => resource.public_id)

  if (publicIds.length > 0) {
    await cloudinary.api.delete_resources(publicIds)
    console.log(`Cleaned up ${publicIds.length} temporary uploads`)
  }
}
```

#### Browser Cache Busting
```javascript
// Update version in package.json
{
  "version": "1.0.1"
}

// Generate cache-busting hash in build
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

### Database Cleanup (if applicable)

#### User Session Cleanup
```javascript
// Clean expired sessions from localStorage
const cleanupExpiredSessions = () => {
  const keys = Object.keys(localStorage)
  const now = Date.now()

  keys.forEach(key => {
    if (key.startsWith('upload_session_')) {
      try {
        const session = JSON.parse(localStorage.getItem(key))
        if (session.expires && session.expires < now) {
          localStorage.removeItem(key)
        }
      } catch (error) {
        // Remove corrupted session data
        localStorage.removeItem(key)
      }
    }
  })
}
```

## 🔐 Security Maintenance

### Security Updates

#### Automated Security Scanning
```bash
# Set up automated security scanning
npm install -g audit-ci

# Run in CI/CD pipeline
audit-ci --moderate
```

#### SSL Certificate Renewal
```bash
# Check certificate expiration
echo | openssl s_client -servername yourwedding.com -connect yourwedding.com:443 2>/dev/null | openssl x509 -noout -dates

# Automated renewal with Certbot
sudo certbot renew --quiet

# Test renewal
sudo certbot renew --dry-run

# Set up cron job for auto-renewal
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

#### Access Log Analysis
```bash
# Analyze Nginx access logs for suspicious activity
sudo grep "POST /admin" /var/log/nginx/access.log | tail -20

# Check for failed authentication attempts
sudo grep "401\|403" /var/log/nginx/access.log | tail -20

# Monitor upload endpoints
sudo grep "POST.*upload" /var/log/nginx/access.log | tail -20
```

### Cloudinary Security

#### API Key Rotation
```bash
# 1. Generate new API key in Cloudinary dashboard
# 2. Update environment variables
# 3. Test with new credentials
# 4. Revoke old API key

# Test new credentials
curl -u "NEW_API_KEY:NEW_API_SECRET" \
  "https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/resources/image"
```

#### Upload Preset Security
```javascript
// Regularly review upload preset settings
const auditUploadPresets = async () => {
  const presets = await cloudinary.api.upload_presets()

  presets.presets.forEach(preset => {
    console.log(`Preset: ${preset.name}`)
    console.log(`- Unsigned: ${preset.unsigned}`)
    console.log(`- Max file size: ${preset.settings.max_file_size}`)
    console.log(`- Allowed formats: ${preset.settings.allowed_formats}`)

    // Check for security issues
    if (preset.unsigned && !preset.settings.max_file_size) {
      console.warn(`⚠️  Preset ${preset.name} has no file size limit`)
    }
  })
}
```

## 📊 Performance Optimization

### Database Optimization

#### Query Performance
```javascript
// Monitor slow queries
const monitorQueryPerformance = () => {
  const startTime = performance.now()

  return new Promise((resolve) => {
    // Your query here
    resolve(result)
  }).then(result => {
    const endTime = performance.now()
    const duration = endTime - startTime

    if (duration > 1000) { // Log slow queries
      console.warn(`Slow query detected: ${duration}ms`)
    }

    return result
  })
}
```

#### Image Optimization
```javascript
// Optimize Cloudinary transformations
const optimizeImageDelivery = () => {
  const transformations = {
    // Responsive images
    responsive: 'w_auto,c_scale',

    // Auto format
    autoFormat: 'f_auto',

    // Auto quality
    autoQuality: 'q_auto',

    // Progressive JPEG
    progressive: 'fl_progressive'
  }

  return Object.values(transformations).join(',')
}
```

### CDN Optimization

#### Cache Headers
```nginx
# Nginx configuration for optimal caching
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    access_log off;
}

location ~* \.(html)$ {
    expires 1h;
    add_header Cache-Control "public, must-revalidate";
}
```

## 🔄 Backup & Recovery

### Automated Backups

#### Application Code Backup
```bash
#!/bin/bash
# backup-app.sh

BACKUP_DIR="/var/backups/wedding-app"
DATE=$(date +%Y%m%d_%H%M%S)
APP_DIR="/var/www/wedding-app"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/app_$DATE.tar.gz -C $APP_DIR .

# Backup configuration
tar -czf $BACKUP_DIR/config_$DATE.tar.gz /etc/nginx/sites-available/wedding-app

# Remove backups older than 30 days
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

#### Cloudinary Asset Backup
```javascript
// Backup Cloudinary metadata
const backupCloudinaryMetadata = async () => {
  const allResources = []
  let nextCursor = null

  do {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'wedding-photos/',
      max_results: 500,
      next_cursor: nextCursor,
      context: true,
      tags: true
    })

    allResources.push(...result.resources)
    nextCursor = result.next_cursor
  } while (nextCursor)

  // Save metadata to file
  const backup = {
    date: new Date().toISOString(),
    count: allResources.length,
    resources: allResources
  }

  return backup
}
```

### Recovery Procedures

#### Application Recovery
```bash
#!/bin/bash
# restore-app.sh

BACKUP_FILE=$1
RESTORE_DIR="/var/www/wedding-app"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup-file>"
    exit 1
fi

# Stop application
sudo systemctl stop nginx

# Backup current state
mv $RESTORE_DIR $RESTORE_DIR.backup.$(date +%Y%m%d_%H%M%S)

# Restore from backup
mkdir -p $RESTORE_DIR
tar -xzf $BACKUP_FILE -C $RESTORE_DIR

# Set permissions
sudo chown -R www-data:www-data $RESTORE_DIR

# Start application
sudo systemctl start nginx

echo "Recovery completed"
```

## 📈 Scaling Considerations

### Traffic Monitoring
```javascript
// Monitor traffic patterns
const analyzeTraffic = () => {
  const analytics = {
    dailyUploads: getUploadsByDay(),
    peakHours: getPeakUploadTimes(),
    userConcurrency: getConcurrentUsers(),
    bandwidth: getBandwidthUsage()
  }

  // Alert if thresholds exceeded
  if (analytics.userConcurrency > 100) {
    console.warn('High concurrent user load detected')
  }

  return analytics
}
```

### Capacity Planning
```bash
# Monitor server resources
df -h  # Disk usage
free -m  # Memory usage
top  # CPU usage

# Cloudinary limits
curl -u "$API_KEY:$API_SECRET" \
  "https://api.cloudinary.com/v1_1/$CLOUD_NAME/usage"
```

## 📞 Incident Response

### Emergency Procedures

#### Site Down Response
```bash
#!/bin/bash
# emergency-response.sh

echo "🚨 Emergency Response Activated"

# Check service status
systemctl status nginx
systemctl status docker  # if using Docker

# Check disk space
df -h

# Check memory
free -m

# Check recent logs
tail -50 /var/log/nginx/error.log

# Restart services if needed
sudo systemctl restart nginx

echo "✅ Emergency checks completed"
```

#### Data Recovery
```bash
# Restore from latest backup
LATEST_BACKUP=$(ls -t /var/backups/wedding-app/*.tar.gz | head -1)
./restore-app.sh $LATEST_BACKUP

# Verify restoration
curl -f https://yourwedding.com/health
```

### Communication Templates

#### Status Page Update
```markdown
🚨 **Service Disruption** - [Timestamp]

We're experiencing issues with photo uploads. Our team is investigating.

**Status**: Investigating
**Impact**: Photo uploads may fail
**Workaround**: Please try again in a few minutes

Updates will be posted here every 15 minutes.
```

#### User Notification
```markdown
📸 **Wedding Photo Share Update**

We're temporarily experiencing technical difficulties with photo uploads.

Don't worry - no photos have been lost! We're working to resolve this quickly.

Thank you for your patience.
❤️ The Wedding Photo Team
```

## 📝 Maintenance Logs

### Log Templates
```markdown
## Maintenance Log - [Date]

### Tasks Completed
- [ ] Dependency updates
- [ ] Security scan
- [ ] Performance review
- [ ] Backup verification

### Issues Found
- Description of any issues
- Resolution steps taken

### Recommendations
- Suggested improvements
- Upcoming maintenance items

### Next Review Date
[Date]
```

---

**Next:** See [SECURITY.md](SECURITY.md) for comprehensive security guidelines.
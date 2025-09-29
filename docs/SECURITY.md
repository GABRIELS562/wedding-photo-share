# 🔒 Security Guide

This comprehensive guide covers security considerations, best practices, and implementation details for the Wedding Photo Share application.

## 🎯 Security Overview

### Security Principles
- **Defense in Depth** - Multiple layers of security controls
- **Least Privilege** - Minimal access rights for users and systems
- **Zero Trust** - Verify every request and user
- **Security by Design** - Built-in security from the ground up
- **Regular Auditing** - Continuous monitoring and assessment

### Threat Model
- **External Attackers** - Malicious users attempting unauthorized access
- **Data Breaches** - Unauthorized access to photos and personal data
- **Service Abuse** - Excessive uploads or bandwidth consumption
- **Social Engineering** - Phishing attempts targeting admin credentials
- **Supply Chain** - Compromised dependencies or third-party services

## 🛡️ Application Security

### Authentication & Authorization

#### Admin Authentication
```typescript
// Secure password handling
import bcrypt from 'bcrypt'

const SALT_ROUNDS = 12
const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes

interface LoginAttempt {
  count: number
  lastAttempt: number
  lockedUntil?: number
}

class AdminAuth {
  private attempts = new Map<string, LoginAttempt>()

  async verifyPassword(inputPassword: string): Promise<boolean> {
    const clientIP = this.getClientIP()

    // Check if IP is locked out
    if (this.isLockedOut(clientIP)) {
      throw new Error('Too many failed attempts. Please try again later.')
    }

    const hashedPassword = process.env.VITE_ADMIN_PASSWORD_HASH
    const isValid = await bcrypt.compare(inputPassword, hashedPassword)

    if (!isValid) {
      this.recordFailedAttempt(clientIP)
      throw new Error('Invalid password')
    }

    this.clearAttempts(clientIP)
    return true
  }

  private isLockedOut(ip: string): boolean {
    const attempt = this.attempts.get(ip)
    if (!attempt) return false

    if (attempt.lockedUntil && Date.now() < attempt.lockedUntil) {
      return true
    }

    return false
  }

  private recordFailedAttempt(ip: string): void {
    const attempt = this.attempts.get(ip) || { count: 0, lastAttempt: 0 }
    attempt.count++
    attempt.lastAttempt = Date.now()

    if (attempt.count >= MAX_LOGIN_ATTEMPTS) {
      attempt.lockedUntil = Date.now() + LOCKOUT_DURATION
    }

    this.attempts.set(ip, attempt)
  }
}
```

#### Session Management
```typescript
// Secure session handling
interface Session {
  id: string
  userId: string
  createdAt: number
  expiresAt: number
  lastActivity: number
}

class SessionManager {
  private sessions = new Map<string, Session>()
  private readonly SESSION_DURATION = 2 * 60 * 60 * 1000 // 2 hours
  private readonly CLEANUP_INTERVAL = 15 * 60 * 1000 // 15 minutes

  constructor() {
    // Clean up expired sessions
    setInterval(() => this.cleanupExpiredSessions(), this.CLEANUP_INTERVAL)
  }

  createSession(userId: string): string {
    const sessionId = this.generateSecureId()
    const now = Date.now()

    const session: Session = {
      id: sessionId,
      userId,
      createdAt: now,
      expiresAt: now + this.SESSION_DURATION,
      lastActivity: now
    }

    this.sessions.set(sessionId, session)
    return sessionId
  }

  validateSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId)
    if (!session || Date.now() > session.expiresAt) {
      this.sessions.delete(sessionId)
      return false
    }

    // Update last activity
    session.lastActivity = Date.now()
    return true
  }

  private generateSecureId(): string {
    return crypto.randomUUID()
  }

  private cleanupExpiredSessions(): void {
    const now = Date.now()
    for (const [id, session] of this.sessions) {
      if (now > session.expiresAt) {
        this.sessions.delete(id)
      }
    }
  }
}
```

### Input Validation & Sanitization

#### File Upload Security
```typescript
interface FileValidationConfig {
  maxSize: number
  allowedTypes: string[]
  allowedExtensions: string[]
  scanForMalware: boolean
}

class SecureFileValidator {
  private config: FileValidationConfig = {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    scanForMalware: true
  }

  async validateFile(file: File): Promise<ValidationResult> {
    const errors: string[] = []

    // Size validation
    if (file.size > this.config.maxSize) {
      errors.push(`File size exceeds ${this.config.maxSize / 1024 / 1024}MB limit`)
    }

    // Type validation
    if (!this.config.allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} not allowed`)
    }

    // Extension validation
    const extension = this.getFileExtension(file.name)
    if (!this.config.allowedExtensions.includes(extension)) {
      errors.push(`File extension ${extension} not allowed`)
    }

    // Magic number validation
    const isValidImage = await this.validateImageMagicNumbers(file)
    if (!isValidImage) {
      errors.push('File appears to be corrupted or not a valid image')
    }

    // Scan file content for malicious code
    const hasMaliciousContent = await this.scanForMaliciousContent(file)
    if (hasMaliciousContent) {
      errors.push('File contains potentially malicious content')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  private async validateImageMagicNumbers(file: File): Promise<boolean> {
    const buffer = await file.arrayBuffer()
    const bytes = new Uint8Array(buffer.slice(0, 12))

    // Check magic numbers for supported formats
    const magicNumbers = {
      jpeg: [0xFF, 0xD8, 0xFF],
      png: [0x89, 0x50, 0x4E, 0x47],
      gif87a: [0x47, 0x49, 0x46, 0x38, 0x37, 0x61],
      gif89a: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61],
      webp: [0x52, 0x49, 0x46, 0x46] // RIFF header
    }

    return Object.values(magicNumbers).some(magic =>
      magic.every((byte, index) => bytes[index] === byte)
    )
  }

  private async scanForMaliciousContent(file: File): Promise<boolean> {
    const text = await file.text().catch(() => '')

    // Look for suspicious patterns
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /vbscript:/i,
      /on\w+\s*=/i,
      /data:text\/html/i,
      /eval\s*\(/i,
      /function\s*\(/i
    ]

    return suspiciousPatterns.some(pattern => pattern.test(text))
  }

  private getFileExtension(filename: string): string {
    return filename.toLowerCase().substring(filename.lastIndexOf('.'))
  }
}
```

#### XSS Prevention
```typescript
// Content sanitization
import DOMPurify from 'dompurify'

class ContentSanitizer {
  static sanitizeText(input: string): string {
    // Remove any HTML tags and encode special characters
    return input
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .trim()
  }

  static sanitizeHTML(input: string): string {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [], // No HTML tags allowed
      ALLOWED_ATTR: []
    })
  }

  static validateInput(input: string, maxLength: number = 1000): boolean {
    if (!input || typeof input !== 'string') return false
    if (input.length > maxLength) return false

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /vbscript:/i,
      /on\w+\s*=/i,
      /style\s*=/i
    ]

    return !suspiciousPatterns.some(pattern => pattern.test(input))
  }
}
```

### CSRF Protection
```typescript
// CSRF token implementation
class CSRFProtection {
  private tokens = new Map<string, { token: string; expires: number }>()

  generateToken(sessionId: string): string {
    const token = crypto.randomUUID()
    const expires = Date.now() + 60 * 60 * 1000 // 1 hour

    this.tokens.set(sessionId, { token, expires })
    return token
  }

  validateToken(sessionId: string, token: string): boolean {
    const stored = this.tokens.get(sessionId)
    if (!stored || Date.now() > stored.expires) {
      this.tokens.delete(sessionId)
      return false
    }

    return stored.token === token
  }

  invalidateToken(sessionId: string): void {
    this.tokens.delete(sessionId)
  }
}
```

## 🌐 Infrastructure Security

### HTTPS Configuration

#### Nginx SSL Configuration
```nginx
# /etc/nginx/sites-available/wedding-app
server {
    listen 80;
    server_name yourwedding.com www.yourwedding.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourwedding.com www.yourwedding.com;

    # SSL Certificates
    ssl_certificate /etc/letsencrypt/live/yourwedding.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourwedding.com/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; img-src 'self' data: https://res.cloudinary.com; connect-src 'self' https://api.cloudinary.com; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;" always;

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=upload:10m rate=10r/m;
    limit_req_zone $binary_remote_addr zone=api:10m rate=30r/m;

    # Upload endpoint rate limiting
    location /api/upload {
        limit_req zone=upload burst=5 nodelay;
        proxy_pass http://localhost:3001;
    }

    # API rate limiting
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://localhost:3001;
    }

    # Static files
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

### Firewall Configuration

#### UFW Setup
```bash
# Basic firewall setup
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (adjust port as needed)
sudo ufw allow ssh
# Or specific port: sudo ufw allow 2222

# Allow HTTP and HTTPS
sudo ufw allow 'Nginx Full'

# Allow specific services if needed
sudo ufw allow 3000  # Development only

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status verbose
```

#### Advanced Firewall Rules
```bash
# Rate limiting for SSH
sudo ufw limit ssh

# Allow from specific IP ranges only
sudo ufw allow from 192.168.1.0/24 to any port 22

# Block specific countries (using fail2ban)
sudo fail2ban-client set sshd addignoreip 192.168.1.0/24
```

### Intrusion Detection

#### Fail2Ban Configuration
```ini
# /etc/fail2ban/jail.local
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3
ignoreip = 127.0.0.1/8 192.168.1.0/24

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
logpath = /var/log/nginx/error.log
maxretry = 5

[nginx-noscript]
enabled = true
filter = nginx-noscript
logpath = /var/log/nginx/access.log
maxretry = 6

[nginx-badbots]
enabled = true
filter = nginx-badbots
logpath = /var/log/nginx/access.log
maxretry = 2

[nginx-noproxy]
enabled = true
filter = nginx-noproxy
logpath = /var/log/nginx/access.log
maxretry = 2
```

## ☁️ Cloudinary Security

### Upload Preset Security
```javascript
// Secure upload preset configuration
const secureUploadPreset = {
  name: 'wedding_photos_secure',
  unsigned: false, // Use signed uploads for better security
  folder: 'wedding-photos',

  // File restrictions
  allowed_formats: ['jpg', 'png', 'gif', 'webp'],
  max_file_size: 10485760, // 10MB
  max_image_width: 4000,
  max_image_height: 4000,

  // Content filtering
  moderation: 'aws_rek', // Enable AI moderation

  // Transformation restrictions
  disallow_public_id: true,
  unique_filename: true,

  // Security settings
  access_mode: 'authenticated', // Require authentication for access
  invalidate: true, // Invalidate CDN cache on update

  // Webhook for processing
  notification_url: 'https://yourwedding.com/api/cloudinary/webhook'
}
```

### API Key Management
```typescript
// Secure API key handling
class CloudinarySecurityManager {
  private readonly API_KEY = process.env.CLOUDINARY_API_KEY
  private readonly API_SECRET = process.env.CLOUDINARY_API_SECRET
  private readonly CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME

  constructor() {
    this.validateCredentials()
  }

  private validateCredentials(): void {
    if (!this.API_KEY || !this.API_SECRET || !this.CLOUD_NAME) {
      throw new Error('Missing Cloudinary credentials')
    }

    // Validate format
    if (this.API_KEY.length < 15 || this.API_SECRET.length < 25) {
      throw new Error('Invalid Cloudinary credentials format')
    }
  }

  generateSignedUploadURL(publicId: string): string {
    const timestamp = Math.round(Date.now() / 1000)
    const paramsToSign = {
      public_id: publicId,
      timestamp: timestamp,
      folder: 'wedding-photos'
    }

    const signature = this.generateSignature(paramsToSign)

    return `https://api.cloudinary.com/v1_1/${this.CLOUD_NAME}/image/upload?${
      new URLSearchParams({
        ...paramsToSign,
        api_key: this.API_KEY,
        signature
      })
    }`
  }

  private generateSignature(params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&')

    return crypto
      .createHash('sha1')
      .update(sortedParams + this.API_SECRET)
      .digest('hex')
  }

  validateWebhook(body: string, signature: string, timestamp: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha1', this.API_SECRET)
      .update(body + timestamp)
      .digest('hex')

    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    )
  }
}
```

### Content Moderation
```typescript
// Automated content moderation
interface ModerationResult {
  approved: boolean
  confidence: number
  categories: string[]
  reasons: string[]
}

class ContentModerationService {
  async moderateImage(publicId: string): Promise<ModerationResult> {
    try {
      // Use Cloudinary's moderation add-ons
      const result = await cloudinary.uploader.explicit(publicId, {
        type: 'upload',
        moderation: 'aws_rek:explicit_nudity,aws_rek:suggestive,google_video_intelligence:safe_search'
      })

      return this.processModerationResult(result.moderation)
    } catch (error) {
      console.error('Moderation failed:', error)
      // Fail safe - reject if moderation fails
      return {
        approved: false,
        confidence: 0,
        categories: ['error'],
        reasons: ['Moderation service unavailable']
      }
    }
  }

  private processModerationResult(moderation: any): ModerationResult {
    let approved = true
    const categories: string[] = []
    const reasons: string[] = []
    let confidence = 100

    // Process AWS Rekognition results
    if (moderation.aws_rek) {
      for (const [key, result] of Object.entries(moderation.aws_rek)) {
        if (result.confidence > 80) { // 80% confidence threshold
          approved = false
          categories.push(key)
          reasons.push(`${key} detected with ${result.confidence}% confidence`)
          confidence = Math.min(confidence, 100 - result.confidence)
        }
      }
    }

    // Process Google Safe Search results
    if (moderation.google_video_intelligence) {
      const safeSearch = moderation.google_video_intelligence.safe_search
      const riskLevels = ['VERY_LIKELY', 'LIKELY']

      for (const [category, level] of Object.entries(safeSearch)) {
        if (riskLevels.includes(level)) {
          approved = false
          categories.push(category)
          reasons.push(`${category} flagged as ${level}`)
        }
      }
    }

    return { approved, confidence, categories, reasons }
  }
}
```

## 🔐 Data Protection

### Privacy Compliance

#### GDPR Implementation
```typescript
interface UserData {
  name?: string
  email?: string
  ipAddress: string
  uploadedImages: string[]
  sessionData: any
}

class PrivacyManager {
  async handleDataRequest(userId: string, requestType: 'access' | 'delete'): Promise<any> {
    switch (requestType) {
      case 'access':
        return await this.exportUserData(userId)
      case 'delete':
        return await this.deleteUserData(userId)
    }
  }

  private async exportUserData(userId: string): Promise<UserData> {
    // Gather all user data
    const userData: UserData = {
      name: this.getUserName(userId),
      email: this.getUserEmail(userId),
      ipAddress: this.getUserIP(userId),
      uploadedImages: await this.getUserImages(userId),
      sessionData: this.getSessionData(userId)
    }

    return userData
  }

  private async deleteUserData(userId: string): Promise<void> {
    // Delete from Cloudinary
    const images = await this.getUserImages(userId)
    if (images.length > 0) {
      await cloudinary.api.delete_resources(images)
    }

    // Delete local data
    this.deleteLocalUserData(userId)

    // Log deletion for compliance
    this.logDataDeletion(userId)
  }

  private logDataDeletion(userId: string): void {
    console.log(`Data deletion completed for user ${userId} at ${new Date().toISOString()}`)
  }
}
```

#### Data Encryption
```typescript
import crypto from 'crypto'

class DataEncryption {
  private readonly algorithm = 'aes-256-gcm'
  private readonly keyLength = 32
  private readonly ivLength = 16
  private readonly saltLength = 64
  private readonly tagLength = 16

  encrypt(text: string, password: string): string {
    const salt = crypto.randomBytes(this.saltLength)
    const key = crypto.pbkdf2Sync(password, salt, 100000, this.keyLength, 'sha256')
    const iv = crypto.randomBytes(this.ivLength)

    const cipher = crypto.createCipher(this.algorithm, key)
    cipher.setAAD(salt)

    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    const tag = cipher.getAuthTag()

    return salt.toString('hex') + ':' + iv.toString('hex') + ':' + encrypted + ':' + tag.toString('hex')
  }

  decrypt(encryptedText: string, password: string): string {
    const parts = encryptedText.split(':')
    const salt = Buffer.from(parts[0], 'hex')
    const iv = Buffer.from(parts[1], 'hex')
    const encrypted = parts[2]
    const tag = Buffer.from(parts[3], 'hex')

    const key = crypto.pbkdf2Sync(password, salt, 100000, this.keyLength, 'sha256')

    const decipher = crypto.createDecipher(this.algorithm, key)
    decipher.setAAD(salt)
    decipher.setAuthTag(tag)

    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  }
}
```

## 🚨 Security Monitoring

### Log Analysis
```bash
#!/bin/bash
# security-monitor.sh

LOG_FILE="/var/log/security-events.log"
ALERT_EMAIL="admin@yourwedding.com"

# Monitor for suspicious activities
check_failed_logins() {
    local failed_logins=$(grep "authentication failure" /var/log/auth.log | wc -l)
    if [ $failed_logins -gt 10 ]; then
        echo "ALERT: $failed_logins failed login attempts detected" | mail -s "Security Alert" $ALERT_EMAIL
    fi
}

check_upload_anomalies() {
    local recent_uploads=$(grep "POST.*upload" /var/log/nginx/access.log | grep "$(date +%Y-%m-%d)" | wc -l)
    if [ $recent_uploads -gt 1000 ]; then
        echo "ALERT: Unusual number of uploads detected: $recent_uploads" | mail -s "Upload Anomaly" $ALERT_EMAIL
    fi
}

check_disk_space() {
    local disk_usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ $disk_usage -gt 80 ]; then
        echo "ALERT: Disk usage at $disk_usage%" | mail -s "Disk Space Alert" $ALERT_EMAIL
    fi
}

# Run checks
check_failed_logins
check_upload_anomalies
check_disk_space
```

### Real-time Monitoring
```typescript
// Security event monitoring
interface SecurityEvent {
  type: 'login_attempt' | 'upload' | 'admin_access' | 'suspicious_activity'
  timestamp: number
  ip: string
  userAgent: string
  details: any
}

class SecurityMonitor {
  private events: SecurityEvent[] = []
  private alerts: ((event: SecurityEvent) => void)[] = []

  logEvent(event: SecurityEvent): void {
    this.events.push(event)

    // Keep only last 1000 events
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000)
    }

    // Check for alerts
    this.checkForAnomalies(event)
  }

  private checkForAnomalies(event: SecurityEvent): void {
    // Check for rapid successive events from same IP
    const recentEvents = this.events.filter(e =>
      e.ip === event.ip &&
      Date.now() - e.timestamp < 60000 // Last minute
    )

    if (recentEvents.length > 20) {
      this.triggerAlert({
        ...event,
        type: 'suspicious_activity',
        details: { reason: 'High request rate', count: recentEvents.length }
      })
    }

    // Check for multiple failed logins
    const failedLogins = this.events.filter(e =>
      e.type === 'login_attempt' &&
      e.details?.success === false &&
      Date.now() - e.timestamp < 300000 // Last 5 minutes
    )

    if (failedLogins.length > 5) {
      this.triggerAlert({
        ...event,
        type: 'suspicious_activity',
        details: { reason: 'Multiple failed logins', count: failedLogins.length }
      })
    }
  }

  private triggerAlert(event: SecurityEvent): void {
    console.warn('Security Alert:', event)
    this.alerts.forEach(callback => callback(event))

    // Send notification to admin
    this.notifyAdmin(event)
  }

  private async notifyAdmin(event: SecurityEvent): Promise<void> {
    // Implement notification logic (email, Slack, etc.)
    const message = `Security Alert: ${event.type} from ${event.ip} at ${new Date(event.timestamp).toISOString()}`
    console.log('Admin notification:', message)
  }

  onAlert(callback: (event: SecurityEvent) => void): void {
    this.alerts.push(callback)
  }
}
```

## 🔄 Security Updates

### Automated Security Scanning
```bash
#!/bin/bash
# security-scan.sh

echo "🔍 Running security scan..."

# Dependency vulnerability scan
echo "📦 Checking dependencies..."
npm audit --audit-level moderate

# Container security scan (if using Docker)
if command -v docker &> /dev/null; then
    echo "🐳 Scanning Docker images..."
    docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
        aquasec/trivy image wedding-photo-share:latest
fi

# SSL certificate check
echo "🔒 Checking SSL certificates..."
echo | openssl s_client -servername yourwedding.com -connect yourwedding.com:443 2>/dev/null | \
    openssl x509 -noout -dates

# Port scan
echo "🔍 Checking open ports..."
nmap -sS -T4 localhost

echo "✅ Security scan completed"
```

### Incident Response Plan
```markdown
## Security Incident Response Plan

### Phase 1: Detection & Analysis (0-30 minutes)
1. **Identify** the nature and scope of the incident
2. **Assess** the potential impact and severity
3. **Document** initial findings and timeline
4. **Notify** the incident response team

### Phase 2: Containment (30-60 minutes)
1. **Isolate** affected systems to prevent spread
2. **Preserve** evidence for investigation
3. **Implement** temporary containment measures
4. **Monitor** for continued malicious activity

### Phase 3: Eradication & Recovery (1-4 hours)
1. **Remove** malicious code or unauthorized access
2. **Patch** vulnerabilities that enabled the incident
3. **Restore** systems from clean backups
4. **Test** systems before returning to production

### Phase 4: Post-Incident Analysis (24-48 hours)
1. **Document** lessons learned
2. **Update** security procedures
3. **Implement** additional preventive measures
4. **Conduct** team retrospective

### Emergency Contacts
- Security Team Lead: [Phone/Email]
- System Administrator: [Phone/Email]
- Legal Counsel: [Phone/Email]
- External Security Consultant: [Phone/Email]
```

## 📋 Security Checklist

### Pre-Deployment Security Checklist
```markdown
- [ ] All dependencies updated and vulnerability-free
- [ ] Environment variables properly configured
- [ ] HTTPS enabled with valid SSL certificates
- [ ] Security headers configured in web server
- [ ] Rate limiting implemented
- [ ] Input validation and sanitization in place
- [ ] Authentication and authorization working
- [ ] File upload restrictions configured
- [ ] Content moderation enabled
- [ ] Logging and monitoring configured
- [ ] Backup and recovery procedures tested
- [ ] Incident response plan documented
- [ ] Security scan completed with no critical issues
```

### Regular Security Maintenance
```markdown
## Weekly
- [ ] Review security logs for anomalies
- [ ] Check for dependency updates
- [ ] Verify backup integrity
- [ ] Monitor SSL certificate expiration

## Monthly
- [ ] Conduct security scan
- [ ] Review and rotate API keys
- [ ] Update security documentation
- [ ] Test incident response procedures

## Quarterly
- [ ] Penetration testing
- [ ] Security policy review
- [ ] Staff security training
- [ ] Audit user access and permissions
```

---

This comprehensive security guide provides multiple layers of protection for your Wedding Photo Share application. Regular review and updates of these security measures are essential to maintain a secure environment for your users' precious memories.

**Remember**: Security is an ongoing process, not a one-time setup. Stay vigilant and keep all systems updated!
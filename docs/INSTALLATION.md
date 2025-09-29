# 🛠️ Installation Guide

This comprehensive guide will walk you through setting up the Wedding Photo Share application from development to production.

## 📋 Prerequisites

### System Requirements
- **Node.js** 18.0 or higher
- **npm** 9.0 or higher (comes with Node.js)
- **Git** for version control
- **Modern web browser** (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)

### Optional Tools
- **Docker** (for containerized deployment)
- **VSCode** (recommended IDE)
- **Tailscale** (for secure network access)

### Check Prerequisites
```bash
# Check Node.js version
node --version  # Should be 18.0+

# Check npm version
npm --version   # Should be 9.0+

# Check Git
git --version
```

## 🚀 Local Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/wedding-photo-share.git
cd wedding-photo-share
```

### 2. Install Dependencies
```bash
# Install all dependencies
npm install

# Or using yarn
yarn install
```

### 3. Environment Configuration

#### Create Environment File
```bash
cp .env.example .env
```

#### Configure Environment Variables
Edit `.env` with your specific configuration:

```env
# Cloudinary Configuration (Required)
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
VITE_CLOUDINARY_API_KEY=your_api_key
VITE_CLOUDINARY_API_SECRET=your_api_secret

# Event Configuration
VITE_EVENT_NAME=John & Jane's Wedding
VITE_EVENT_DATE=2024-06-15
VITE_EVENT_LOCATION=The Grand Ballroom, Chicago

# Admin Configuration
VITE_ADMIN_PASSWORD=your_secure_password

# App Configuration
VITE_APP_URL=http://localhost:3000
VITE_MAX_FILE_SIZE=10485760  # 10MB
VITE_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp
VITE_MAX_UPLOADS_PER_SESSION=20
```

### 4. Cloudinary Setup

#### Create Cloudinary Account
1. Visit [Cloudinary](https://cloudinary.com) and sign up for free
2. Verify your email address
3. Access your dashboard

#### Configure Upload Preset
1. Go to **Settings** → **Upload**
2. Click **Add upload preset**
3. Configure settings:
   - **Preset name**: `wedding_photos` (or your choice)
   - **Signing Mode**: **Unsigned**
   - **Folder**: `wedding-photos`
   - **Allowed formats**: `jpg,png,gif,webp`
   - **Max file size**: `10MB`
   - **Image and video analysis**: Enabled
   - **Auto backup**: Enabled (recommended)

#### Get API Credentials
1. Dashboard → **Account Details**
2. Copy **Cloud Name**
3. Copy **API Key** and **API Secret** (for admin features)

### 5. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 6. Generate QR Codes
```bash
# Generate QR code for upload page
npm run generate-qr

# With custom URL
npm run generate-qr -- --url https://yourwedding.com/upload

# Custom size and output
npm run generate-qr -- --url https://yourwedding.com/upload --size 800 --output custom-qr.png
```

## 🔧 Development Tools Setup

### VSCode Extensions (Recommended)
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

### VSCode Settings
Create `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

### Git Hooks Setup
Install Husky for pre-commit hooks:
```bash
npm run prepare
```

This sets up:
- **Pre-commit**: Linting and formatting
- **Pre-push**: Type checking and tests

## 🐳 Docker Setup (Optional)

### Development with Docker
```bash
# Build development image
docker build -t wedding-photo-share:dev .

# Run with environment file
docker run -p 3000:3000 --env-file .env wedding-photo-share:dev

# Or use docker-compose
docker-compose up -d
```

### Docker Compose Configuration
Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
    env_file:
      - .env
    volumes:
      - .:/app
      - /app/node_modules
    command: npm run dev
```

## 🔍 Verification Steps

### 1. Test Upload Functionality
1. Navigate to `http://localhost:3000/upload`
2. Enter a test name
3. Upload a sample image
4. Verify it appears in Cloudinary dashboard

### 2. Test Admin Panel
1. Go to `http://localhost:3000/admin`
2. Enter your admin password
3. Verify dashboard displays correctly
4. Test photo moderation features

### 3. Test QR Code Generation
```bash
npm run generate-qr
# Check qr-codes/ directory for generated files
```

### 4. Verify Environment Variables
```bash
# Test configuration loading
npm run dev
# Check console for any missing environment variable warnings
```

## 🚨 Common Issues & Solutions

### Node.js Version Issues
```bash
# Use nvm to manage Node.js versions
nvm install 18
nvm use 18
```

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
VITE_PORT=3001 npm run dev
```

### Cloudinary Upload Errors
1. Verify **Upload Preset** is set to **Unsigned**
2. Check **Cloud Name** is correct
3. Ensure **Folder** permissions are set
4. Test with smaller image file first

### Module Resolution Errors
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors
```bash
# Check TypeScript configuration
npx tsc --noEmit

# Update types
npm install --save-dev @types/react@latest @types/react-dom@latest
```

## 📱 Mobile Development Testing

### Local Network Access
Find your local IP and test on mobile devices:
```bash
# On macOS/Linux
ifconfig | grep inet

# On Windows
ipconfig

# Access via mobile browser
http://YOUR_LOCAL_IP:3000
```

### Tailscale Setup (Recommended)
1. Install [Tailscale](https://tailscale.com)
2. Set up tailnet
3. Access development server from any device: `http://your-machine.tailscale-network.ts.net:3000`

## 🔐 Security Considerations

### Development Environment
- Never commit `.env` files
- Use strong admin passwords
- Keep dependencies updated
- Review Cloudinary usage limits

### Environment Variables
```bash
# Generate secure admin password
openssl rand -base64 32

# Check for exposed secrets
npm audit
git secrets --scan
```

## 📈 Performance Optimization

### Development Build
```bash
# Analyze bundle size
npm run build
npm run preview

# Bundle analyzer
npm install --save-dev webpack-bundle-analyzer
npm run analyze
```

### Memory Usage
Monitor Node.js memory usage during development:
```bash
# Run with memory monitoring
node --max-old-space-size=4096 node_modules/.bin/vite
```

## 🧪 Testing Setup

### Run Tests
```bash
# Unit tests
npm run test

# Coverage report
npm run test:coverage

# End-to-end tests
npm run test:e2e
```

### Test Environment
Tests use `.env.test` for configuration:
```env
VITE_CLOUDINARY_CLOUD_NAME=test_cloud
VITE_ADMIN_PASSWORD=test_password
```

## 🔄 Update Procedures

### Dependency Updates
```bash
# Check outdated packages
npm outdated

# Update all dependencies
npm update

# Update specific package
npm install package-name@latest
```

### Framework Updates
```bash
# Update React
npm install react@latest react-dom@latest

# Update TypeScript
npm install --save-dev typescript@latest

# Update Tailwind CSS
npm install --save-dev tailwindcss@latest
```

## 📞 Getting Help

### Documentation
- [Configuration Guide](CONFIGURATION.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Troubleshooting](TROUBLESHOOTING.md)

### Community Support
- GitHub Issues: Report bugs and feature requests
- Discord: Real-time community support
- Email: support@yourwedding.com

### Development Resources
- [React Documentation](https://reactjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Cloudinary Documentation](https://cloudinary.com/documentation)

---

**Next Steps:** Once installation is complete, see [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment instructions.
# 🔧 Troubleshooting Guide

This guide helps you resolve common issues when setting up, developing, or deploying the Wedding Photo Share application.

## 📋 Quick Diagnostics

### System Check Commands
```bash
# Check Node.js and npm versions
node --version && npm --version

# Check project dependencies
npm ls --depth=0

# Verify environment variables
npm run check-env

# Test Cloudinary connection
npm run test-cloudinary
```

## 🚀 Development Issues

### Installation Problems

#### Node.js Version Conflicts
**Problem**: App fails to start with Node.js version errors
```
Error: The engine "node" is incompatible with this module
```

**Solution**:
```bash
# Check Node.js version
node --version

# Install correct version with nvm
nvm install 18
nvm use 18

# Verify version
node --version  # Should show v18.x.x

# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### Dependency Installation Failures
**Problem**: npm install fails with permission or network errors

**Solution**:
```bash
# For permission errors on macOS/Linux
sudo chown -R $(whoami) ~/.npm

# For network issues
npm config set registry https://registry.npmjs.org/
npm cache clean --force

# For specific package conflicts
npm install --legacy-peer-deps

# Complete clean install
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

#### Missing TypeScript Errors
**Problem**: TypeScript compilation fails
```
Cannot find module '@types/react' or its corresponding type declarations
```

**Solution**:
```bash
# Install missing type definitions
npm install --save-dev @types/react @types/react-dom
npm install --save-dev @types/node

# Check TypeScript configuration
npx tsc --noEmit
```

### Development Server Issues

#### Port Already in Use
**Problem**: Port 3000 is already occupied
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution**:
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
VITE_PORT=3001 npm run dev

# Find and kill specific process
lsof -ti:3000 | xargs kill -9
```

#### Hot Reload Not Working
**Problem**: Changes don't reflect automatically

**Solution**:
```bash
# Check file watchers limit (Linux)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Restart development server
npm run dev

# Clear browser cache
# Chrome: Ctrl+Shift+R / Cmd+Shift+R
```

#### Environment Variables Not Loading
**Problem**: Environment variables show as undefined

**Solution**:
```bash
# Check .env file exists
ls -la .env

# Verify VITE_ prefix
cat .env | grep VITE_

# Restart development server
npm run dev

# Debug in browser console
console.log(import.meta.env.VITE_CLOUDINARY_CLOUD_NAME)
```

## ☁️ Cloudinary Integration Issues

### Upload Failures

#### Invalid Upload Preset
**Problem**: Upload fails with preset error
```
{
  "error": {
    "message": "Invalid upload preset",
    "http_code": 400
  }
}
```

**Solution**:
1. **Verify Upload Preset Configuration**:
   - Go to Cloudinary Dashboard → Settings → Upload
   - Check preset name matches `VITE_CLOUDINARY_UPLOAD_PRESET`
   - Ensure **Signing Mode** is set to **Unsigned**

2. **Update Environment Variables**:
```env
VITE_CLOUDINARY_UPLOAD_PRESET=your_correct_preset_name
```

3. **Test Upload Preset**:
```bash
curl -X POST \
  https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload \
  -F "upload_preset=YOUR_PRESET" \
  -F "file=@test-image.jpg"
```

#### Cloud Name Issues
**Problem**: API calls fail with cloud name errors

**Solution**:
```bash
# Verify cloud name in Cloudinary dashboard
# Update .env file
VITE_CLOUDINARY_CLOUD_NAME=your_correct_cloud_name

# Test API endpoint
curl https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/list
```

#### File Size Limits
**Problem**: Large files fail to upload
```
{
  "error": {
    "message": "File size too large",
    "http_code": 400
  }
}
```

**Solution**:
1. **Update Upload Preset**:
   - Go to Cloudinary Dashboard → Upload Settings
   - Increase **Max file size** (e.g., 10MB)

2. **Client-side Compression**:
```typescript
// Increase compression quality in imageCompression.ts
const options = {
  maxSizeMB: 5, // Reduce from 10MB
  maxWidthOrHeight: 1920,
  useWebWorker: true
}
```

#### Network Timeout Issues
**Problem**: Uploads timeout on slow connections

**Solution**:
```typescript
// Increase timeout in upload service
const uploadWithTimeout = (file: File, timeout = 60000) => {
  return Promise.race([
    uploadImage(file),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Upload timeout')), timeout)
    )
  ])
}
```

### Admin Panel Issues

#### Authentication Failures
**Problem**: Admin password not working

**Solution**:
```bash
# Check environment variable
echo $VITE_ADMIN_PASSWORD

# Update .env file
VITE_ADMIN_PASSWORD=your_secure_password

# Clear browser storage
# Browser DevTools → Application → Local Storage → Clear All

# Restart development server
npm run dev
```

#### API Rate Limiting
**Problem**: Too many API requests
```
{
  "error": {
    "message": "Rate limit exceeded",
    "http_code": 420
  }
}
```

**Solution**:
```typescript
// Implement exponential backoff
const rateLimitedRequest = async (fn: () => Promise<any>, retries = 3) => {
  try {
    return await fn()
  } catch (error) {
    if (error.status === 420 && retries > 0) {
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, 4 - retries) * 1000))
      return rateLimitedRequest(fn, retries - 1)
    }
    throw error
  }
}
```

## 🏗️ Build Issues

### Build Failures

#### TypeScript Compilation Errors
**Problem**: Build fails with type errors

**Solution**:
```bash
# Check for type errors
npx tsc --noEmit

# Update TypeScript
npm install --save-dev typescript@latest

# Fix common issues
npm install --save-dev @types/react@latest @types/react-dom@latest

# Skip type checking for build (temporary)
npm run build -- --skipLibCheck
```

#### Memory Issues During Build
**Problem**: Build runs out of memory
```
FATAL ERROR: Ineffective mark-compacts near heap limit
```

**Solution**:
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Or update package.json
{
  "scripts": {
    "build": "NODE_OPTIONS='--max-old-space-size=4096' vite build"
  }
}
```

#### Bundle Size Issues
**Problem**: Bundle too large for deployment

**Solution**:
```bash
# Analyze bundle size
npm run build
npm install --save-dev webpack-bundle-analyzer
npx webpack-bundle-analyzer dist

# Enable tree shaking
# Update vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react', 'framer-motion']
        }
      }
    }
  }
})
```

## 🚀 Deployment Issues

### Vercel Deployment

#### Build Failures on Vercel
**Problem**: Deployment fails during build

**Solution**:
1. **Check Node.js Version**:
   - Create `.nvmrc` file:
   ```
   18
   ```

2. **Environment Variables**:
   - Add all `VITE_*` variables in Vercel dashboard
   - Verify values match your local `.env`

3. **Build Settings**:
   ```
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

#### Static File Issues
**Problem**: Assets not loading correctly

**Solution**:
1. **Update Vite Config**:
```typescript
// vite.config.ts
export default defineConfig({
  base: '/', // or your custom domain path
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
```

2. **Check Asset Paths**:
```typescript
// Use relative paths
const imagePath = './assets/image.png'
// Not absolute paths
const imagePath = '/assets/image.png'
```

### Netlify Deployment

#### Routing Issues
**Problem**: Direct URLs return 404

**Solution**:
Create `public/_redirects`:
```
/*    /index.html   200
```

#### Function Timeout
**Problem**: Build functions timeout

**Solution**:
Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  functions = "netlify/functions"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Docker Deployment

#### Container Build Failures
**Problem**: Docker build fails

**Solution**:
```dockerfile
# Update Dockerfile with specific versions
FROM node:18-alpine AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files first
COPY package*.json ./
RUN npm ci --only=production

# Then copy source
COPY . .
RUN npm run build
```

#### Port Configuration Issues
**Problem**: Container not accessible

**Solution**:
```bash
# Verify port mapping
docker run -p 3000:3000 wedding-photo-share

# Check container logs
docker logs container_name

# Test internally
docker exec -it container_name curl localhost:3000
```

## 📱 Mobile Issues

### iOS Safari Issues

#### Upload Button Not Working
**Problem**: File input doesn't work on iOS

**Solution**:
```typescript
// Add capture attribute for camera access
<input
  type="file"
  accept="image/*"
  capture="environment" // or "user" for front camera
  multiple
/>
```

#### PWA Installation Issues
**Problem**: App not installable on iOS

**Solution**:
1. **Add iOS Meta Tags**:
```html
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="Wedding Photos">
<link rel="apple-touch-icon" href="/icon-192.png">
```

2. **Update Manifest**:
```json
{
  "display": "standalone",
  "start_url": "/",
  "scope": "/"
}
```

### Android Chrome Issues

#### Image Orientation Problems
**Problem**: Photos appear rotated

**Solution**:
```typescript
// Use image-orientation CSS
.uploaded-image {
  image-orientation: from-image;
}

// Or handle EXIF data
import EXIF from 'exif-js'

const getImageOrientation = (file: File): Promise<number> => {
  return new Promise((resolve) => {
    EXIF.getData(file, function() {
      const orientation = EXIF.getTag(this, 'Orientation') || 1
      resolve(orientation)
    })
  })
}
```

## 🔐 Security Issues

### CORS Errors
**Problem**: Cross-origin requests blocked

**Solution**:
```typescript
// Configure Cloudinary CORS settings
// In Cloudinary Dashboard → Settings → Security
// Add your domain to "Allowed fetch domains"

// For development
// Add localhost:3000, localhost:3001, etc.
```

### CSP Violations
**Problem**: Content Security Policy errors

**Solution**:
```html
<!-- Update CSP meta tag -->
<meta http-equiv="Content-Security-Policy"
      content="img-src 'self' data: https://res.cloudinary.com;
               connect-src 'self' https://api.cloudinary.com;">
```

## 🔍 Performance Issues

### Slow Loading Times
**Problem**: App loads slowly

**Solution**:
```typescript
// 1. Implement code splitting
const AdminPanel = lazy(() => import('./components/AdminPanel'))
const PhotoGallery = lazy(() => import('./components/PhotoGallery'))

// 2. Optimize images
const optimizeImage = (url: string) => {
  return url.replace('/upload/', '/upload/q_auto,f_auto/')
}

// 3. Add loading states
const [isLoading, setIsLoading] = useState(true)
```

### Memory Leaks
**Problem**: App becomes slow over time

**Solution**:
```typescript
// Clean up event listeners
useEffect(() => {
  const handleScroll = () => { /* ... */ }
  window.addEventListener('scroll', handleScroll)

  return () => {
    window.removeEventListener('scroll', handleScroll)
  }
}, [])

// Cancel pending requests
useEffect(() => {
  const controller = new AbortController()

  fetch('/api/data', { signal: controller.signal })

  return () => {
    controller.abort()
  }
}, [])
```

## 🧪 Testing Issues

### Test Failures
**Problem**: Unit tests failing

**Solution**:
```bash
# Update test environment
npm install --save-dev @testing-library/jest-dom
npm install --save-dev jsdom

# Update vitest config
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts']
  }
})
```

### E2E Test Issues
**Problem**: Playwright tests failing

**Solution**:
```bash
# Install browsers
npx playwright install

# Update test config
// playwright.config.ts
export default defineConfig({
  use: {
    headless: false, // For debugging
    video: 'on-first-retry'
  }
})

# Run with debug mode
npx playwright test --debug
```

## 📞 Getting Help

### Log Analysis
```bash
# Browser console logs
# Open DevTools → Console

# Network requests
# DevTools → Network → Filter by type

# Application state
# React DevTools → Components/Profiler
```

### Support Channels
- **GitHub Issues**: Report bugs with detailed logs
- **Documentation**: Check all docs in `/docs` folder
- **Email Support**: support@yourwedding.com
- **Community Discord**: Real-time help

### Bug Report Template
```markdown
## Bug Description
Brief description of the issue

## Steps to Reproduce
1. Go to...
2. Click on...
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., macOS 12.0]
- Browser: [e.g., Chrome 95]
- Node.js: [e.g., 18.12.0]
- App Version: [e.g., 1.0.0]

## Additional Context
Screenshots, logs, etc.
```

---

**Next:** See [MAINTENANCE.md](MAINTENANCE.md) for ongoing maintenance procedures.
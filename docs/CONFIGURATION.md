# ⚙️ Configuration Guide

This guide covers all configuration options for customizing the Wedding Photo Share application to match your event and requirements.

## 📁 Configuration Files Overview

### Primary Configuration Files
- **`.env`** - Environment variables and secrets
- **`tailwind.config.js`** - Theme colors and styling
- **`vite.config.ts`** - Build and development configuration
- **`package.json`** - Dependencies and scripts
- **`src/utils/constants.ts`** - Application constants

### Optional Configuration
- **`vercel.json`** - Vercel deployment settings
- **`netlify.toml`** - Netlify deployment settings
- **`docker-compose.yml`** - Docker container configuration

## 🌐 Environment Variables

### Required Variables

#### Cloudinary Configuration
```env
# Your Cloudinary cloud name (required)
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name

# Upload preset name for unsigned uploads (required)
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# API credentials for admin features (optional but recommended)
VITE_CLOUDINARY_API_KEY=your_api_key
VITE_CLOUDINARY_API_SECRET=your_api_secret
```

**Setting up Cloudinary:**
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get cloud name from dashboard
3. Create unsigned upload preset in Settings > Upload
4. Copy API key/secret for admin features

#### Admin Configuration
```env
# Secure admin password (required)
VITE_ADMIN_PASSWORD=your_super_secure_password

# Optional: Admin session timeout (in minutes)
VITE_ADMIN_SESSION_TIMEOUT=60
```

**Security Best Practices:**
- Use a strong, unique password (minimum 12 characters)
- Include uppercase, lowercase, numbers, and symbols
- Never commit passwords to version control
- Use environment-specific passwords

### Event Configuration

#### Basic Event Details
```env
# Event name displayed throughout the app
VITE_EVENT_NAME=Sarah & Michael's Wedding

# Event date (ISO format recommended)
VITE_EVENT_DATE=2024-09-15

# Event location
VITE_EVENT_LOCATION=Rosewood Manor, Beverly Hills

# Optional: Event description
VITE_EVENT_DESCRIPTION=Celebrating our love with family and friends
```

#### Welcome Messages
```env
# Custom welcome message for guests
VITE_WELCOME_MESSAGE=Welcome to our special day! Share your photos with us.

# Upload instructions
VITE_UPLOAD_INSTRUCTIONS=Drag & drop photos or click to select from your device

# Thank you message after upload
VITE_THANK_YOU_MESSAGE=Thank you for sharing your memories with us!
```

### Upload Configuration

#### File Restrictions
```env
# Maximum file size in bytes (10MB = 10485760)
VITE_MAX_FILE_SIZE=10485760

# Allowed file types (comma-separated MIME types)
VITE_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp,image/heic

# Maximum number of files per upload session
VITE_MAX_UPLOADS_PER_SESSION=20

# Maximum total uploads per guest (optional)
VITE_MAX_UPLOADS_PER_GUEST=50
```

#### Upload Features
```env
# Require guests to enter their name (true/false)
VITE_REQUIRE_NAME=true

# Enable photo captions (true/false)
VITE_ENABLE_CAPTIONS=true

# Auto-approve all uploads (true/false) - use with caution
VITE_AUTO_APPROVE=false

# Enable guest downloads (true/false)
VITE_ENABLE_DOWNLOADS=true

# Enable social sharing (true/false)
VITE_ENABLE_SHARING=true
```

### Application Configuration

#### URLs and Domains
```env
# Base application URL
VITE_APP_URL=https://yourwedding.com

# Custom domain for QR codes
VITE_QR_DOMAIN=yourwedding.com

# Google Analytics ID (optional)
VITE_GA_ID=G-XXXXXXXXXX

# Sentry DSN for error tracking (optional)
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
```

#### Feature Toggles
```env
# Enable/disable analytics dashboard
VITE_ENABLE_ANALYTICS=true

# Enable/disable batch downloads
VITE_ENABLE_BATCH_DOWNLOAD=true

# Enable/disable guest gallery access
VITE_ENABLE_GUEST_GALLERY=true

# Enable/disable mobile PWA features
VITE_ENABLE_PWA=true

# Enable/disable dark mode toggle
VITE_ENABLE_DARK_MODE=false
```

### Optional Integrations

#### Email Notifications
```env
# Email service configuration (optional)
VITE_EMAIL_SERVICE=sendgrid
VITE_EMAIL_API_KEY=your_email_api_key
VITE_NOTIFICATION_EMAIL=couple@example.com
```

#### Social Media
```env
# Social media handles for sharing (optional)
VITE_TWITTER_HANDLE=@yourwedding
VITE_INSTAGRAM_HANDLE=@yourwedding
VITE_HASHTAG=#YourWedding2024
```

#### Performance Monitoring
```env
# Performance monitoring (optional)
VITE_ENABLE_PERFORMANCE_MONITORING=true
VITE_PERFORMANCE_SAMPLE_RATE=0.1
```

## 🎨 Theme Configuration

### Color Scheme

Edit `tailwind.config.js` to customize colors:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf2f4',
          100: '#fce7eb',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',  // Main primary color
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',  // Main secondary color
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        }
      }
    }
  }
}
```

### Pre-made Color Schemes

#### Romantic Pink & Gold
```javascript
primary: {
  500: '#ec4899', // Pink
  600: '#db2777',
},
secondary: {
  500: '#f59e0b', // Gold
  600: '#d97706',
}
```

#### Classic Navy & Rose Gold
```javascript
primary: {
  500: '#1e40af', // Navy
  600: '#1d4ed8',
},
secondary: {
  500: '#f472b6', // Rose Gold
  600: '#ec4899',
}
```

#### Rustic Green & Brown
```javascript
primary: {
  500: '#059669', // Forest Green
  600: '#047857',
},
secondary: {
  500: '#92400e', // Warm Brown
  600: '#7c2d12',
}
```

#### Elegant Purple & Silver
```javascript
primary: {
  500: '#7c3aed', // Royal Purple
  600: '#6d28d9',
},
secondary: {
  500: '#6b7280', // Silver
  600: '#4b5563',
}
```

### Typography

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        'display': ['Playfair Display', 'serif'], // Headings
        'body': ['Inter', 'sans-serif'],          // Body text
      }
    }
  }
}
```

**Popular Wedding Font Combinations:**
- **Classic**: Playfair Display + Inter
- **Modern**: Montserrat + Open Sans
- **Elegant**: Cormorant Garamond + Lato
- **Romantic**: Dancing Script + Poppins
- **Rustic**: Amatic SC + Source Sans Pro

### Background Patterns

```css
/* src/styles/globals.css */
.wedding-pattern {
  background-image: url('/patterns/lace.svg');
  background-repeat: repeat;
  background-size: 200px;
  opacity: 0.05;
}

.floral-border {
  border-image: url('/patterns/floral-border.svg') 30 round;
}
```

## 📱 Responsive Configuration

### Breakpoints

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    }
  }
}
```

### Mobile Optimization

```env
# Mobile-specific settings
VITE_MOBILE_UPLOAD_QUALITY=0.8
VITE_MOBILE_MAX_DIMENSION=1920
VITE_ENABLE_CAMERA_CAPTURE=true
VITE_ENABLE_TOUCH_GESTURES=true
```

## 🔧 Build Configuration

### Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ],
  build: {
    target: 'es2015',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['framer-motion', 'lucide-react'],
          utils: ['date-fns', 'fuse.js']
        }
      }
    }
  },
  server: {
    port: 3000,
    host: true
  }
})
```

### Performance Optimization

```typescript
// vite.config.ts - Performance focused
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[hash][extname]',
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js'
      }
    },
    chunkSizeWarningLimit: 1000,
    assetsInlineLimit: 4096
  }
})
```

## 📊 Analytics Configuration

### Google Analytics 4

```env
VITE_GA_ID=G-XXXXXXXXXX
VITE_GA_ENHANCED_ECOMMERCE=false
VITE_GA_ANONYMIZE_IP=true
```

```typescript
// src/utils/analytics.ts
export const initGA = () => {
  if (import.meta.env.VITE_GA_ID) {
    gtag('config', import.meta.env.VITE_GA_ID, {
      anonymize_ip: import.meta.env.VITE_GA_ANONYMIZE_IP
    })
  }
}
```

### Custom Analytics Events

```typescript
// Track upload events
export const trackUpload = (fileCount: number, totalSize: number) => {
  gtag('event', 'photo_upload', {
    event_category: 'engagement',
    event_label: 'photos',
    value: fileCount,
    custom_parameters: {
      total_size: totalSize
    }
  })
}
```

## 🔐 Security Configuration

### Content Security Policy

```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://www.googletagmanager.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: https://res.cloudinary.com;
  connect-src 'self' https://api.cloudinary.com;
  font-src 'self' https://fonts.gstatic.com;
">
```

### Rate Limiting

```env
# Rate limiting configuration
VITE_UPLOAD_RATE_LIMIT=10  # uploads per minute
VITE_DOWNLOAD_RATE_LIMIT=50  # downloads per minute
VITE_ADMIN_RATE_LIMIT=100   # admin actions per minute
```

### Input Validation

```typescript
// src/utils/validation.ts
export const fileValidation = {
  maxSize: parseInt(import.meta.env.VITE_MAX_FILE_SIZE),
  allowedTypes: import.meta.env.VITE_ALLOWED_FILE_TYPES.split(','),
  maxDimensions: {
    width: 8000,
    height: 8000
  }
}
```

## 🌍 Internationalization

### Language Configuration

```env
# Default language
VITE_DEFAULT_LANGUAGE=en

# Available languages
VITE_AVAILABLE_LANGUAGES=en,es,fr,de

# Enable RTL support
VITE_ENABLE_RTL=false
```

### Language Files

```typescript
// src/locales/en.ts
export const en = {
  welcome: 'Welcome to our wedding!',
  upload: 'Upload Photos',
  gallery: 'Photo Gallery',
  admin: 'Admin Panel'
}

// src/locales/es.ts
export const es = {
  welcome: '¡Bienvenidos a nuestra boda!',
  upload: 'Subir Fotos',
  gallery: 'Galería de Fotos',
  admin: 'Panel de Admin'
}
```

## 🔄 Development Configuration

### Development Environment

```env
# Development-specific settings
NODE_ENV=development
VITE_DEV_MODE=true
VITE_MOCK_UPLOADS=false
VITE_ENABLE_DEVTOOLS=true
VITE_HOT_RELOAD=true
```

### Testing Configuration

```env
# Testing environment
NODE_ENV=test
VITE_CLOUDINARY_CLOUD_NAME=test-cloud
VITE_ADMIN_PASSWORD=test-password
VITE_MOCK_API=true
```

### Debug Configuration

```env
# Debug settings
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug
VITE_ENABLE_REDUX_DEVTOOLS=true
VITE_PERFORMANCE_TIMING=true
```

## 📦 Deployment Configuration

### Vercel Configuration

```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Netlify Configuration

```toml
# netlify.toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### Docker Configuration

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:80"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    restart: unless-stopped
```

## 📱 PWA Configuration

### Manifest Configuration

```typescript
// vite.config.ts - PWA
VitePWA({
  registerType: 'autoUpdate',
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
    cleanupOutdatedCaches: true
  },
  manifest: {
    name: import.meta.env.VITE_EVENT_NAME,
    short_name: 'Wedding Share',
    description: 'Share your wedding photos',
    theme_color: '#ec4899',
    background_color: '#ffffff',
    display: 'standalone',
    orientation: 'portrait',
    icons: [
      {
        src: 'icon-192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: 'icon-512.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ]
  }
})
```

## 🔍 Monitoring Configuration

### Error Tracking

```env
# Sentry configuration
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
VITE_SENTRY_ENVIRONMENT=production
VITE_SENTRY_SAMPLE_RATE=0.1
```

### Performance Monitoring

```typescript
// src/utils/monitoring.ts
export const performanceConfig = {
  enableLCP: true,
  enableFID: true,
  enableCLS: true,
  enableFCP: true,
  enableTTFB: true,
  sampleRate: 0.1
}
```

## 🚀 Optimization Configuration

### Image Optimization

```env
# Cloudinary optimization
VITE_AUTO_OPTIMIZE=true
VITE_QUALITY=auto
VITE_FORMAT=auto
VITE_FETCH_FORMAT=auto
```

### Bundle Optimization

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
})
```

## 📞 Configuration Help

### Environment Validation

Add validation to ensure required configuration:

```typescript
// src/utils/config.ts
const requiredEnvVars = [
  'VITE_CLOUDINARY_CLOUD_NAME',
  'VITE_CLOUDINARY_UPLOAD_PRESET',
  'VITE_ADMIN_PASSWORD'
]

export const validateConfig = () => {
  const missing = requiredEnvVars.filter(
    key => !import.meta.env[key]
  )

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}
```

### Configuration Testing

```bash
# Test configuration
npm run config:test

# Validate environment
npm run config:validate

# Generate config template
npm run config:template
```

---

**Next Steps:** After configuration, see [DEPLOYMENT.md](DEPLOYMENT.md) for deployment instructions or [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common configuration issues.
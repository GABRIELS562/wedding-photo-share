# Customization Guide

This guide covers how to customize the Wedding Photo Share application for your specific event.

## Table of Contents
- [Event Information](#event-information)
- [Visual Customization](#visual-customization)
- [Feature Configuration](#feature-configuration)
- [Advanced Customization](#advanced-customization)
- [Localization](#localization)

## Event Information

### Basic Event Details

Update `.env` file with your event information:

```env
# Event name displayed throughout the app
VITE_EVENT_NAME=Sarah & Michael's Wedding

# Event date (ISO format recommended)
VITE_EVENT_DATE=2024-09-15

# Venue information
VITE_EVENT_LOCATION=Rosewood Manor, Beverly Hills
```

### Custom Welcome Messages

Edit `src/pages/Upload.tsx` to customize guest messaging:

```typescript
// Line 85 - Customize welcome message
<h2>Welcome to our special day!</h2>

// Line 88 - Customize instruction text
<p>Please enter your name so we know who's sharing these beautiful memories with us.</p>
```

## Visual Customization

### Color Scheme

Edit `tailwind.config.js` to match your wedding colors:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Dusty Rose theme example
        50: '#fdf2f4',
        100: '#fce7eb',
        200: '#fad0d9',
        300: '#f7a8ba',
        400: '#f17595',
        500: '#e84771',  // Main color
        600: '#d42a56',
        700: '#b21f44',
        800: '#941c3c',
        900: '#7f1a36',
      },
      secondary: {
        // Navy Blue theme example
        50: '#f4f6fb',
        100: '#e8ecf6',
        200: '#cbd6eb',
        300: '#9db2d9',
        400: '#6888c3',
        500: '#4568ad',  // Main color
        600: '#335091',
        700: '#2a4175',
        800: '#263862',
        900: '#243153',
      }
    }
  }
}
```

### Typography

#### Update Font Families

1. Add fonts to `index.html`:

```html
<!-- Elegant serif font for headings -->
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&display=swap" rel="stylesheet">

<!-- Clean sans-serif for body -->
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600&display=swap" rel="stylesheet">
```

2. Update `tailwind.config.js`:

```javascript
fontFamily: {
  'display': ['Cormorant Garamond', 'serif'],
  'body': ['Montserrat', 'sans-serif'],
}
```

### Logo and Branding

#### Add Your Logo

1. Place logo file in `public/` directory
2. Update components to display logo:

```typescript
// src/pages/Upload.tsx
import logoUrl from '/logo.png'

<img src={logoUrl} alt="Wedding Logo" className="h-24 mx-auto mb-4" />
```

#### Custom Favicon

Replace `public/favicon.ico` with your own icon:
- Use a favicon generator
- Include multiple sizes for different devices
- Consider using your initials or wedding date

### Background Patterns

Add custom background patterns in `src/styles/globals.css`:

```css
.custom-pattern {
  background-image:
    repeating-linear-gradient(
      45deg,
      transparent,
      transparent 35px,
      rgba(255, 255, 255, 0.1) 35px,
      rgba(255, 255, 255, 0.1) 70px
    );
}

.floral-pattern {
  background-image: url('/patterns/floral.svg');
  background-repeat: repeat;
  background-size: 200px;
  opacity: 0.05;
}
```

## Feature Configuration

### Upload Settings

Configure upload behavior in `.env`:

```env
# Maximum file size (in bytes)
# 5MB = 5242880, 10MB = 10485760, 20MB = 20971520
VITE_MAX_FILE_SIZE=15728640

# Allowed file types
VITE_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp,image/heic

# Max uploads per guest session
VITE_MAX_UPLOADS_PER_SESSION=30

# Enable/disable features
VITE_ENABLE_MESSAGES=true
VITE_REQUIRE_NAME=true
VITE_SHOW_UPLOAD_COUNT=true
```

### Gallery Options

Customize gallery behavior in `src/components/PhotoGallery/PhotoGallery.tsx`:

```typescript
// Default view mode
const [view, setView] = useState<'grid' | 'list'>('grid')

// Photos per page
const PHOTOS_PER_PAGE = 24

// Sort options
const sortOptions = [
  { value: 'date-desc', label: 'Newest First' },
  { value: 'date-asc', label: 'Oldest First' },
  { value: 'name', label: 'By Uploader Name' },
  { value: 'popular', label: 'Most Liked' }  // If implementing likes
]
```

### Admin Features

Configure admin capabilities:

```typescript
// src/pages/Admin.tsx

// Customize admin features
const ADMIN_FEATURES = {
  bulkDownload: true,
  individualDelete: true,
  bulkDelete: true,
  viewStatistics: true,
  exportMetadata: true,
  generateQR: true
}

// Custom admin password validation
const validatePassword = (password: string) => {
  // Add custom validation rules
  return password.length >= 8 && /[A-Z]/.test(password)
}
```

## Advanced Customization

### Add Social Sharing

Implement social media sharing:

```typescript
// src/components/PhotoGallery/ShareButton.tsx
const ShareButton = ({ photo, platform }) => {
  const shareUrl = `${window.location.origin}/photo/${photo.id}`

  const shareLinks = {
    facebook: `https://facebook.com/sharer/sharer.php?u=${shareUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${shareUrl}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${shareUrl}&media=${photo.url}`
  }

  return (
    <button onClick={() => window.open(shareLinks[platform])}>
      Share on {platform}
    </button>
  )
}
```

### Guest Book Feature

Add a digital guest book:

```typescript
// src/components/GuestBook/GuestBook.tsx
interface GuestBookEntry {
  id: string
  name: string
  message: string
  timestamp: Date
}

const GuestBook = () => {
  const [entries, setEntries] = useState<GuestBookEntry[]>([])

  // Implementation
}
```

### Photo Filters

Add Instagram-style filters:

```typescript
// src/components/PhotoUpload/PhotoFilters.tsx
const filters = [
  { name: 'Original', css: '' },
  { name: 'Vintage', css: 'sepia(0.5) contrast(1.2)' },
  { name: 'B&W', css: 'grayscale(1)' },
  { name: 'Warm', css: 'sepia(0.2) saturate(1.5)' }
]
```

### Email Notifications

Set up email notifications for uploads:

```typescript
// src/services/notifications.ts
const sendUploadNotification = async (photo: Photo) => {
  // Integrate with email service (SendGrid, AWS SES, etc.)
  await fetch('/api/notify', {
    method: 'POST',
    body: JSON.stringify({
      to: 'couple@email.com',
      subject: 'New Photo Uploaded',
      photo: photo
    })
  })
}
```

### Analytics Integration

Add Google Analytics or similar:

```html
<!-- index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## Localization

### Multi-language Support

Create language files:

```typescript
// src/locales/en.ts
export const en = {
  welcome: 'Welcome to our wedding!',
  uploadPhotos: 'Upload Photos',
  gallery: 'Photo Gallery',
  admin: 'Admin Panel'
}

// src/locales/es.ts
export const es = {
  welcome: '¡Bienvenidos a nuestra boda!',
  uploadPhotos: 'Subir Fotos',
  gallery: 'Galería de Fotos',
  admin: 'Panel de Admin'
}
```

Use in components:

```typescript
import { useLanguage } from '../hooks/useLanguage'

const Component = () => {
  const t = useLanguage()
  return <h1>{t.welcome}</h1>
}
```

### Date/Time Formatting

Customize date formats for different locales:

```typescript
// src/utils/dateFormatting.ts
import { format } from 'date-fns'
import { enUS, es, fr } from 'date-fns/locale'

const locales = { en: enUS, es, fr }

export const formatDate = (date: Date, locale = 'en') => {
  return format(date, 'PPP', { locale: locales[locale] })
}
```

## Theme Templates

### Rustic Theme

```javascript
// tailwind.config.js
colors: {
  primary: {
    500: '#8B7355',  // Burlap
  },
  secondary: {
    500: '#5B8C5A',  // Sage Green
  }
}
```

### Beach Theme

```javascript
colors: {
  primary: {
    500: '#40E0D0',  // Turquoise
  },
  secondary: {
    500: '#F4A460',  // Sandy Brown
  }
}
```

### Garden Theme

```javascript
colors: {
  primary: {
    500: '#FFB6C1',  // Light Pink
  },
  secondary: {
    500: '#98FB98',  // Pale Green
  }
}
```

## Performance Customization

### Image Optimization

Configure Cloudinary transformations:

```typescript
// src/services/cloudinary.ts
const getOptimizedUrl = (url: string, options = {}) => {
  const defaults = {
    quality: 'auto',
    fetch_format: 'auto',
    width: 1920,
    crop: 'limit'
  }

  // Apply transformations
  return url.replace('/upload/', `/upload/${buildTransformString({...defaults, ...options})}/`)
}
```

### Lazy Loading

Implement progressive image loading:

```typescript
// src/components/ProgressiveImage.tsx
const ProgressiveImage = ({ src, placeholder }) => {
  const [currentSrc, setCurrentSrc] = useState(placeholder)

  useEffect(() => {
    const img = new Image()
    img.src = src
    img.onload = () => setCurrentSrc(src)
  }, [src])

  return <img src={currentSrc} />
}
```

## Custom Workflows

### Approval System

Add photo approval before display:

```typescript
interface Photo {
  // ... existing fields
  approved: boolean
  approvedBy?: string
  approvedAt?: Date
}

// Only show approved photos in gallery
const approvedPhotos = photos.filter(p => p.approved)
```

### Categorization

Allow categorizing photos:

```typescript
const categories = [
  'Ceremony',
  'Reception',
  'First Dance',
  'Speeches',
  'Party',
  'Behind the Scenes'
]
```

## Testing Customizations

After customizing:

1. Test all upload scenarios
2. Verify responsive design on various devices
3. Check color contrast for accessibility
4. Validate all forms and inputs
5. Test with slow network connections
6. Verify customizations work in production build
# 🔌 API Documentation

This document covers the Cloudinary integration and API endpoints used by the Wedding Photo Share application.

## 📋 Overview

The application primarily uses Cloudinary's Upload API for image storage and management. All uploads are handled client-side using unsigned upload presets for security and performance.

## 🔧 Cloudinary Integration

### Authentication

The application uses **unsigned upload presets** which allows client-side uploads without exposing API secrets.

```javascript
// Environment variables required
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_preset_name
VITE_CLOUDINARY_API_KEY=your_api_key        // Admin only
VITE_CLOUDINARY_API_SECRET=your_api_secret  // Admin only
```

### Upload Preset Configuration

Configure your upload preset in Cloudinary dashboard:

```json
{
  "name": "wedding_photos",
  "unsigned": true,
  "folder": "wedding-photos",
  "resource_type": "image",
  "allowed_formats": ["jpg", "png", "gif", "webp"],
  "max_file_size": 10485760,
  "transformation": [
    {
      "quality": "auto:good",
      "fetch_format": "auto"
    }
  ],
  "eager": [
    {
      "width": 400,
      "height": 400,
      "crop": "fill",
      "quality": "auto:good"
    }
  ]
}
```

## 📤 Upload API

### Client-Side Upload

The application uses the Cloudinary JavaScript SDK for uploads:

```typescript
interface UploadResponse {
  public_id: string
  secure_url: string
  url: string
  width: number
  height: number
  format: string
  bytes: number
  created_at: string
  tags: string[]
  context?: {
    caption?: string
    uploader?: string
  }
}

// Upload function
const uploadImage = async (
  file: File,
  options: UploadOptions
): Promise<UploadResponse> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)
  formData.append('folder', 'wedding-photos')

  if (options.caption) {
    formData.append('context', `caption=${options.caption}`)
  }

  if (options.uploader) {
    formData.append('context', `uploader=${options.uploader}`)
  }

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData
    }
  )

  return response.json()
}
```

### Upload Options

```typescript
interface UploadOptions {
  caption?: string
  uploader?: string
  tags?: string[]
  folder?: string
  public_id?: string
  transformation?: {
    quality?: string
    width?: number
    height?: number
    crop?: string
  }
}
```

### Progress Tracking

```typescript
const uploadWithProgress = (
  file: File,
  onProgress: (progress: number) => void
): Promise<UploadResponse> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const progress = (event.loaded / event.total) * 100
        onProgress(progress)
      }
    })

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText))
      } else {
        reject(new Error(`Upload failed: ${xhr.statusText}`))
      }
    })

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'))
    })

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', UPLOAD_PRESET)

    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`)
    xhr.send(formData)
  })
}
```

## 🔍 Retrieval API

### List Images

```typescript
interface ListResponse {
  resources: CloudinaryResource[]
  next_cursor?: string
  total_count: number
}

interface CloudinaryResource {
  public_id: string
  format: string
  version: number
  resource_type: string
  type: string
  created_at: string
  bytes: number
  width: number
  height: number
  url: string
  secure_url: string
  context?: {
    custom: {
      caption?: string
      uploader?: string
      approved?: string
    }
  }
  tags: string[]
}

// Admin API call (requires API key)
const listImages = async (
  nextCursor?: string,
  maxResults: number = 50
): Promise<ListResponse> => {
  const params = new URLSearchParams({
    resource_type: 'image',
    type: 'upload',
    prefix: 'wedding-photos/',
    max_results: maxResults.toString(),
    context: 'true',
    tags: 'true'
  })

  if (nextCursor) {
    params.append('next_cursor', nextCursor)
  }

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/image/upload?${params}`,
    {
      headers: {
        'Authorization': `Basic ${btoa(`${API_KEY}:${API_SECRET}`)}`
      }
    }
  )

  return response.json()
}
```

### Search Images

```typescript
interface SearchOptions {
  expression: string
  sortBy?: string
  maxResults?: number
  nextCursor?: string
}

const searchImages = async (options: SearchOptions): Promise<ListResponse> => {
  const body = {
    expression: options.expression,
    sort_by: options.sortBy || [['created_at', 'desc']],
    max_results: options.maxResults || 50,
    with_field: ['context', 'tags', 'metadata']
  }

  if (options.nextCursor) {
    body.next_cursor = options.nextCursor
  }

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/search`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(`${API_KEY}:${API_SECRET}`)}`
      },
      body: JSON.stringify(body)
    }
  )

  return response.json()
}
```

## 🛠️ Management API

### Update Image Metadata

```typescript
const updateImageContext = async (
  publicId: string,
  context: Record<string, string>
): Promise<void> => {
  const contextString = Object.entries(context)
    .map(([key, value]) => `${key}=${value}`)
    .join('|')

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${API_KEY}:${API_SECRET}`)}`
      },
      body: new URLSearchParams({
        public_id: publicId,
        context: contextString,
        type: 'upload'
      })
    }
  )

  return response.json()
}
```

### Add Tags

```typescript
const addTags = async (
  publicIds: string[],
  tags: string[]
): Promise<void> => {
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/tags`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(`${API_KEY}:${API_SECRET}`)}`
      },
      body: JSON.stringify({
        public_ids: publicIds,
        tags: tags,
        command: 'add'
      })
    }
  )

  return response.json()
}
```

### Delete Images

```typescript
const deleteImages = async (publicIds: string[]): Promise<void> => {
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(`${API_KEY}:${API_SECRET}`)}`
      },
      body: JSON.stringify({
        public_ids: publicIds,
        type: 'upload'
      })
    }
  )

  return response.json()
}
```

## 🖼️ Transformation API

### URL-based Transformations

```typescript
const generateImageUrl = (
  publicId: string,
  transformations: Transformation[]
): string => {
  const baseUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`
  const transformString = transformations
    .map(t => Object.entries(t).map(([k, v]) => `${k}_${v}`).join(','))
    .join('/')

  return `${baseUrl}/${transformString}/${publicId}`
}

// Examples
const thumbnailUrl = generateImageUrl('sample', [
  { width: 300, height: 300, crop: 'fill' }
])

const optimizedUrl = generateImageUrl('sample', [
  { quality: 'auto:good', fetch_format: 'auto' }
])
```

### Common Transformations

```typescript
const transformations = {
  thumbnail: { width: 300, height: 300, crop: 'fill' },
  large: { width: 1200, height: 1200, crop: 'limit' },
  optimized: { quality: 'auto:good', fetch_format: 'auto' },
  watermark: {
    overlay: 'watermark_image',
    gravity: 'south_east',
    opacity: 50
  }
}
```

## 📊 Analytics API

### Usage Statistics

```typescript
interface UsageStats {
  plan: string
  last_updated: string
  usage: {
    transformations: number
    objects: number
    bandwidth: number
    storage: number
    requests: number
  }
  limit: {
    transformations: number
    objects: number
    bandwidth: number
    storage: number
    requests: number
  }
}

const getUsageStats = async (): Promise<UsageStats> => {
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/usage`,
    {
      headers: {
        'Authorization': `Basic ${btoa(`${API_KEY}:${API_SECRET}`)}`
      }
    }
  )

  return response.json()
}
```

## 🔒 Security Best Practices

### Upload Signatures (Optional)

For additional security, you can use signed uploads:

```typescript
const generateSignature = (paramsToSign: Record<string, any>): string => {
  const sortedParams = Object.keys(paramsToSign)
    .sort()
    .map(key => `${key}=${paramsToSign[key]}`)
    .join('&')

  // This should be done server-side
  return crypto
    .createHash('sha1')
    .update(sortedParams + API_SECRET)
    .digest('hex')
}
```

### Rate Limiting

```typescript
class RateLimiter {
  private requests: number[] = []
  private readonly maxRequests = 100
  private readonly timeWindow = 60000 // 1 minute

  canMakeRequest(): boolean {
    const now = Date.now()
    this.requests = this.requests.filter(time => now - time < this.timeWindow)

    if (this.requests.length >= this.maxRequests) {
      return false
    }

    this.requests.push(now)
    return true
  }
}
```

## 🚨 Error Handling

### Common Error Responses

```typescript
interface CloudinaryError {
  error: {
    message: string
    http_code: number
  }
}

const handleUploadError = (error: CloudinaryError): string => {
  switch (error.error.http_code) {
    case 400:
      return 'Invalid file format or size'
    case 401:
      return 'Authentication failed'
    case 420:
      return 'Rate limit exceeded'
    case 500:
      return 'Server error, please try again'
    default:
      return error.error.message || 'Upload failed'
  }
}
```

### Retry Logic

```typescript
const uploadWithRetry = async (
  file: File,
  maxRetries: number = 3
): Promise<UploadResponse> => {
  let lastError: Error

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await uploadImage(file, {})
    } catch (error) {
      lastError = error as Error

      if (attempt < maxRetries) {
        await new Promise(resolve =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        )
      }
    }
  }

  throw lastError!
}
```

## 📱 Mobile Considerations

### Image Compression

```typescript
import imageCompression from 'browser-image-compression'

const compressForMobile = async (file: File): Promise<File> => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/jpeg'
  }

  return await imageCompression(file, options)
}
```

## 🔗 Webhook Integration

### Setup Notification URL

Configure webhooks in Cloudinary dashboard to receive notifications:

```typescript
interface WebhookPayload {
  notification_type: string
  timestamp: number
  request_id: string
  asset: {
    public_id: string
    version: number
    signature: string
    width: number
    height: number
    format: string
    resource_type: string
    created_at: string
    tags: string[]
    bytes: number
    type: string
    etag: string
    url: string
    secure_url: string
  }
}
```

## 📞 Support

For API issues:
- Cloudinary Documentation: https://cloudinary.com/documentation
- Support Email: api-support@yourwedding.com
- Status Page: https://status.cloudinary.com

---

**Next:** See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common API issues and solutions.
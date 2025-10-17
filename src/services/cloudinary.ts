import { CloudinaryResponse, Photo } from '../types'

const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

export const uploadToCloudinary = async (
  file: File,
  onProgress?: (progress: number) => void,
  uploaderName?: string,
  caption?: string
): Promise<Photo> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)
  formData.append('folder', 'kirsten_dale_wedding_2024')

  // Add wedding-specific tags
  const tags = ['kirsten_dale_wedding', 'wedding_2024', 'guest_photos']
  if (uploaderName) {
    tags.push(`uploader_${uploaderName.toLowerCase().replace(/\s+/g, '_')}`)
  }
  formData.append('tags', tags.join(','))

  // Add context metadata as a single string (Cloudinary format: key1=value1|key2=value2)
  const contextParts = []
  if (uploaderName) {
    contextParts.push(`uploader=${uploaderName}`)
  }
  if (caption) {
    contextParts.push(`caption=${caption}`)
  }
  contextParts.push(`upload_date=${new Date().toISOString()}`)
  contextParts.push(`event=kirsten_dale_wedding`)

  if (contextParts.length > 0) {
    formData.append('context', contextParts.join('|'))
  }

  // Add transformation for automatic optimization
  formData.append('transformation', 'q_auto:good,f_auto')

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const progress = Math.round((e.loaded / e.total) * 100)
        onProgress(progress)
      }
    })

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        const response: CloudinaryResponse = JSON.parse(xhr.responseText)
        const photo: Photo = {
          id: response.public_id,
          url: response.secure_url,
          thumbnailUrl: generateOptimizedUrl(response.secure_url, { width: 400, height: 400, crop: 'fill' }),
          publicId: response.public_id,
          uploadedAt: new Date(response.created_at),
          uploaderName: uploaderName,
          caption: caption,
          width: response.width,
          height: response.height,
          format: response.format,
          size: response.bytes,
          tags: response.tags || [],
          context: response.context || {},
        }
        resolve(photo)
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`))
      }
    })

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'))
    })

    xhr.open('POST', CLOUDINARY_URL)
    xhr.send(formData)
  })
}

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  const timestamp = Math.round(new Date().getTime() / 1000)
  const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY
  const apiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET

  const signature = await generateSignature(publicId, timestamp, apiSecret)

  const formData = new FormData()
  formData.append('public_id', publicId)
  formData.append('signature', signature)
  formData.append('api_key', apiKey)
  formData.append('timestamp', timestamp.toString())

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/destroy`,
    {
      method: 'POST',
      body: formData,
    }
  )

  if (!response.ok) {
    throw new Error('Failed to delete image')
  }
}

async function generateSignature(publicId: string, timestamp: number, apiSecret: string): Promise<string> {
  const message = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`
  const encoder = new TextEncoder()
  const data = encoder.encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-1', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

// Generate optimized image URLs for different use cases
export const generateOptimizedUrl = (
  originalUrl: string,
  options: {
    width?: number
    height?: number
    crop?: 'fill' | 'scale' | 'fit' | 'limit'
    quality?: 'auto' | 'auto:good' | 'auto:best' | number
    format?: 'auto' | 'webp' | 'jpg' | 'png'
  } = {}
): string => {
  const {
    width,
    height,
    crop = 'fill',
    quality = 'auto:good',
    format = 'auto'
  } = options

  let transformation = `q_${quality},f_${format}`

  if (width && height) {
    transformation += `,w_${width},h_${height},c_${crop}`
  } else if (width) {
    transformation += `,w_${width}`
  } else if (height) {
    transformation += `,h_${height}`
  }

  return originalUrl.replace('/upload/', `/upload/${transformation}/`)
}

// Wedding-specific image transformations
export const getWeddingImageVariants = (originalUrl: string) => {
  return {
    thumbnail: generateOptimizedUrl(originalUrl, { width: 300, height: 300, crop: 'fill' }),
    medium: generateOptimizedUrl(originalUrl, { width: 800, height: 600, crop: 'limit' }),
    large: generateOptimizedUrl(originalUrl, { width: 1200, height: 900, crop: 'limit' }),
    watermarked: originalUrl.replace(
      '/upload/',
      '/upload/l_text:Arial_40:Kirsten%20%26%20Dale%202024,g_south_east,x_20,y_20,o_60/'
    )
  }
}

// Fetch wedding photos with pagination
export const fetchWeddingPhotos = async (
  nextCursor?: string,
  maxResults: number = 50
): Promise<{ photos: Photo[]; nextCursor?: string }> => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY
  const apiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET

  if (!apiKey || !apiSecret) {
    throw new Error('API credentials required for fetching photos')
  }

  const timestamp = Math.round(Date.now() / 1000)
  const params = {
    timestamp: timestamp.toString(),
    resource_type: 'image',
    type: 'upload',
    prefix: 'kirsten_dale_wedding_2024/',
    max_results: maxResults.toString(),
    context: 'true',
    tags: 'true',
    ...(nextCursor && { next_cursor: nextCursor })
  }

  const signature = await generateApiSignature(params, apiSecret)

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/resources/image`
  const queryParams = new URLSearchParams({ ...params, api_key: apiKey, signature })

  const response = await fetch(`${url}?${queryParams}`)

  if (!response.ok) {
    throw new Error('Failed to fetch wedding photos')
  }

  const data = await response.json()

  const photos: Photo[] = data.resources.map((resource: any) => ({
    id: resource.public_id,
    url: resource.secure_url,
    thumbnailUrl: generateOptimizedUrl(resource.secure_url, { width: 400, height: 400 }),
    publicId: resource.public_id,
    uploadedAt: new Date(resource.created_at),
    width: resource.width,
    height: resource.height,
    format: resource.format,
    size: resource.bytes,
    tags: resource.tags || [],
    context: resource.context?.custom || {},
    uploaderName: resource.context?.custom?.uploader,
    caption: resource.context?.custom?.caption,
  }))

  return {
    photos,
    nextCursor: data.next_cursor
  }
}

// Generate signature for API requests
async function generateApiSignature(params: Record<string, string>, apiSecret: string): Promise<string> {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&')

  const message = sortedParams + apiSecret
  const encoder = new TextEncoder()
  const data = encoder.encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-1', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export const getCloudinaryConfig = () => {
  return {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
    uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
    apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY,
    apiSecret: import.meta.env.VITE_CLOUDINARY_API_SECRET,
  }
}

export const validateCloudinaryConfig = (): boolean => {
  const config = getCloudinaryConfig()
  return !!(config.cloudName && config.uploadPreset)
}

// Wedding-specific upload monitoring
export const getUploadStats = async (): Promise<{
  totalPhotos: number
  totalSize: number
  uploaderStats: Record<string, number>
}> => {
  try {
    const { photos } = await fetchWeddingPhotos(undefined, 1000)

    const totalPhotos = photos.length
    const totalSize = photos.reduce((sum, photo) => sum + (photo.size || 0), 0)

    const uploaderStats: Record<string, number> = {}
    photos.forEach(photo => {
      const uploader = photo.uploaderName || 'Unknown'
      uploaderStats[uploader] = (uploaderStats[uploader] || 0) + 1
    })

    return { totalPhotos, totalSize, uploaderStats }
  } catch (error) {
    console.error('Failed to get upload stats:', error)
    return { totalPhotos: 0, totalSize: 0, uploaderStats: {} }
  }
}
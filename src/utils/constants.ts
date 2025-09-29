export const APP_NAME = 'Wedding Photo Share'

export const ROUTES = {
  UPLOAD: '/upload',
  GALLERY: '/gallery',
  ADMIN: '/admin',
} as const

export const FILE_SIZE_LIMITS = {
  MIN: 1024, // 1KB
  MAX: 10 * 1024 * 1024, // 10MB
  RECOMMENDED: 5 * 1024 * 1024, // 5MB
} as const

export const ACCEPTED_IMAGE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
} as const

export const UPLOAD_MESSAGES = {
  SUCCESS: 'Photo uploaded successfully!',
  ERROR: 'Failed to upload photo. Please try again.',
  SIZE_ERROR: 'File is too large. Maximum size is 10MB.',
  TYPE_ERROR: 'Invalid file type. Please upload an image.',
  LIMIT_ERROR: 'Upload limit reached for this session.',
} as const

export const ADMIN_MESSAGES = {
  AUTH_SUCCESS: 'Successfully authenticated as admin',
  AUTH_FAILED: 'Invalid admin password',
  DELETE_CONFIRM: 'Are you sure you want to delete this photo?',
  DELETE_ALL_CONFIRM: 'Are you sure you want to delete ALL photos? This action cannot be undone.',
  DOWNLOAD_SUCCESS: 'Photos downloaded successfully',
  DOWNLOAD_ERROR: 'Failed to download photos',
} as const

export const QR_CONFIG = {
  SIZE: 300,
  MARGIN: 4,
  DARK_COLOR: '#000000',
  LIGHT_COLOR: '#FFFFFF',
  ERROR_LEVEL: 'M' as const,
} as const
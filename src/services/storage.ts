import { Photo } from '../types'

const STORAGE_KEY = 'wedding-photos'
const ADMIN_KEY = 'wedding-admin-auth'

export const savePhotoToStorage = (photo: Photo): void => {
  const existingPhotos = getPhotosFromStorage()
  existingPhotos.push(photo)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existingPhotos))
}

export const getPhotosFromStorage = (): Photo[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const photos = JSON.parse(stored)
      return photos.map((photo: any) => ({
        ...photo,
        uploadedAt: new Date(photo.uploadedAt)
      }))
    }
  } catch (error) {
    console.error('Error reading from storage:', error)
  }
  return []
}

export const removePhotoFromStorage = (id: string): void => {
  const photos = getPhotosFromStorage()
  const filtered = photos.filter(p => p.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
}

export const clearAllPhotosFromStorage = (): void => {
  localStorage.removeItem(STORAGE_KEY)
}

export const isAdminAuthenticated = (): boolean => {
  const auth = sessionStorage.getItem(ADMIN_KEY)
  return auth === 'authenticated'
}

export const authenticateAdmin = (password: string): boolean => {
  const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123'
  if (password === adminPassword) {
    sessionStorage.setItem(ADMIN_KEY, 'authenticated')
    return true
  }
  return false
}

export const logoutAdmin = (): void => {
  sessionStorage.removeItem(ADMIN_KEY)
}

export const getUploadCount = (): number => {
  const count = sessionStorage.getItem('upload-count')
  return count ? parseInt(count, 10) : 0
}

export const incrementUploadCount = (): void => {
  const current = getUploadCount()
  sessionStorage.setItem('upload-count', (current + 1).toString())
}

export const canUploadMore = (): boolean => {
  const max = parseInt(import.meta.env.VITE_MAX_UPLOADS_PER_SESSION || '20', 10)
  return getUploadCount() < max
}
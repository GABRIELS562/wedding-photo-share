import { useState, useCallback } from 'react'
import { Photo, EventConfig } from '../types'
import { uploadToCloudinary } from '../services/cloudinary'
import { savePhotoToStorage, incrementUploadCount, canUploadMore } from '../services/storage'
import toast from 'react-hot-toast'

export const usePhotoUpload = () => {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const getEventConfig = useCallback((): EventConfig => {
    return {
      name: import.meta.env.VITE_EVENT_NAME || 'Wedding Celebration',
      date: import.meta.env.VITE_EVENT_DATE || new Date().toISOString(),
      location: import.meta.env.VITE_EVENT_LOCATION || 'Beautiful Venue',
      maxFileSize: parseInt(import.meta.env.VITE_MAX_FILE_SIZE || '10485760', 10),
      allowedFileTypes: (import.meta.env.VITE_ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,image/webp').split(','),
      maxUploadsPerSession: parseInt(import.meta.env.VITE_MAX_UPLOADS_PER_SESSION || '20', 10),
    }
  }, [])

  const validateFile = useCallback((file: File): string | null => {
    const config = getEventConfig()

    if (file.size > config.maxFileSize) {
      return `File size exceeds ${(config.maxFileSize / 1024 / 1024).toFixed(0)}MB limit`
    }

    if (!config.allowedFileTypes.includes(file.type)) {
      return 'Invalid file type. Please upload JPEG, PNG, GIF, or WebP images'
    }

    if (!canUploadMore()) {
      return `Upload limit reached (${config.maxUploadsPerSession} photos per session)`
    }

    return null
  }, [getEventConfig])

  const uploadPhoto = useCallback(async (
    file: File,
    uploaderName?: string,
    message?: string
  ): Promise<Photo | null> => {
    const error = validateFile(file)
    if (error) {
      toast.error(error)
      return null
    }

    setUploading(true)
    setProgress(0)

    try {
      const photo = await uploadToCloudinary(file, (progress) => {
        setProgress(progress)
      })

      const enrichedPhoto: Photo = {
        ...photo,
        uploaderName,
        message,
      }

      savePhotoToStorage(enrichedPhoto)
      incrementUploadCount()

      toast.success('Photo uploaded successfully!')
      return enrichedPhoto
    } catch (error) {
      console.error('Upload failed:', error)
      toast.error('Failed to upload photo. Please try again.')
      return null
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }, [validateFile])

  return {
    uploadPhoto,
    uploading,
    progress,
    validateFile,
    getEventConfig,
    canUploadMore,
  }
}
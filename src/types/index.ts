export interface Photo {
  id: string
  url: string
  thumbnailUrl: string
  publicId: string
  uploadedAt: Date
  uploaderName?: string
  message?: string
  caption?: string
  width: number
  height: number
  format: string
  size: number
  tags?: string[]
  context?: Record<string, any>
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export interface CloudinaryResponse {
  public_id: string
  secure_url: string
  thumbnail_url: string
  width: number
  height: number
  format: string
  bytes: number
  created_at: string
  tags?: string[]
  context?: {
    custom?: Record<string, string>
  }
}

export interface EventConfig {
  name: string
  date: string
  location: string
  maxFileSize: number
  allowedFileTypes: string[]
  maxUploadsPerSession: number
  welcomeMessage?: string
  autoApprove?: boolean
  enableDownloads?: boolean
  requireName?: boolean
  enableCaptions?: boolean
}

export interface WeddingStats {
  totalPhotos: number
  totalSize: number
  uploaderStats: Record<string, number>
  recentUploads: Photo[]
  mostActiveUploader: string
  averagePhotoSize: number
}

export interface UploadSession {
  id: string
  uploaderName: string
  startTime: Date
  uploads: Photo[]
  totalUploaded: number
  maxAllowed: number
}

export interface PhotoFilter {
  uploader?: string
  dateRange?: {
    start: Date
    end: Date
  }
  approved?: boolean
  tags?: string[]
  searchTerm?: string
}

export interface MobileUploadOptions {
  enableCamera: boolean
  enableGallery: boolean
  maxConcurrentUploads: number
  compressionQuality: number
  enableOfflineQueue: boolean
}

export interface GestureConfig {
  swipeThreshold: number
  longPressDelay: number
  doubleTapDelay: number
}
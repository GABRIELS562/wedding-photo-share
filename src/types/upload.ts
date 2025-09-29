export interface UploadFile {
  id: string
  file: File
  originalFile: File
  compressedFile?: File
  caption?: string
  status: 'pending' | 'compressing' | 'uploading' | 'success' | 'error'
  progress: number
  error?: string
  retryCount: number
  thumbnailUrl?: string
  uploadedUrl?: string
  publicId?: string
}

export interface UploadQueueItem extends UploadFile {
  priority: number
  startTime?: Date
  endTime?: Date
  duration?: number
}

export interface UploadStats {
  totalFiles: number
  successCount: number
  errorCount: number
  totalSize: number
  uploadedSize: number
  averageCompressionRatio: number
  estimatedTimeRemaining: number
}
import { Photo, WeddingStats } from './index'

export interface AdminSession {
  id: string
  createdAt: Date
  lastActivity: Date
  ipAddress: string
  userAgent: string
  permissions: AdminPermission[]
}

export type AdminPermission =
  | 'view_photos'
  | 'download_photos'
  | 'delete_photos'
  | 'view_analytics'
  | 'manage_users'
  | 'export_data'
  | 'moderate_content'

export interface AdminState {
  isAuthenticated: boolean
  session: AdminSession | null
  stats: WeddingStats
  permissions: AdminPermission[]
  lastActivity: Date | null
}

export type AdminAction =
  | {
      type: 'LOGIN_SUCCESS'
      payload: {
        session: AdminSession
        permissions: AdminPermission[]
      }
    }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_SESSION'; payload: AdminSession }
  | { type: 'UPDATE_STATS'; payload: Partial<WeddingStats> }
  | { type: 'REFRESH_ACTIVITY' }

export interface AdminDashboardStats {
  totalPhotos: number
  totalGuests: number
  totalStorage: string
  recentUploads: number
  topUploaders: Array<{
    name: string
    count: number
    percentage: number
  }>
  uploadTimeline: Array<{
    date: string
    count: number
  }>
  storageBreakdown: Array<{
    category: string
    size: number
    percentage: number
  }>
}

export interface PhotoModerationItem {
  photo: Photo
  status: 'pending' | 'approved' | 'rejected'
  reason?: string
  moderatedAt?: Date
  moderatedBy?: string
}

export interface BulkOperation {
  type: 'download' | 'delete' | 'approve' | 'reject' | 'export'
  photoIds: string[]
  options?: {
    format?: 'original' | 'compressed' | 'thumbnail'
    includeMetadata?: boolean
    zipFileName?: string
  }
}

export interface ExportOptions {
  format: 'json' | 'csv' | 'zip'
  includePhotos: boolean
  includeMetadata: boolean
  dateRange?: {
    start: Date
    end: Date
  }
  uploaders?: string[]
  photoIds?: string[]
}

export interface AdminAnalytics {
  overview: {
    totalPhotos: number
    totalStorage: number
    totalGuests: number
    avgPhotosPerGuest: number
  }
  timeline: Array<{
    date: string
    uploads: number
    uniqueGuests: number
    totalSize: number
  }>
  topUploaders: Array<{
    name: string
    count: number
    totalSize: number
    lastUpload: Date
  }>
  deviceStats: Array<{
    device: string
    count: number
    percentage: number
  }>
  performanceMetrics: {
    avgUploadTime: number
    successRate: number
    errorRate: number
    peakUploadTime: string
  }
}

export interface AdminNotification {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionUrl?: string
}

export interface AdminActivityLog {
  id: string
  action: string
  details: string
  timestamp: Date
  ipAddress: string
  userAgent: string
  photoId?: string
  guestName?: string
}

export interface PhotoBatch {
  id: string
  name: string
  photoIds: string[]
  createdAt: Date
  status: 'creating' | 'ready' | 'downloading' | 'error'
  downloadUrl?: string
  expiresAt?: Date
  size?: number
}
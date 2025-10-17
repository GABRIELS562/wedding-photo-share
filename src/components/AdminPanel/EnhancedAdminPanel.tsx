import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, Download, Trash2, BarChart3, Settings, QrCode,
  Users, Camera, HardDrive, TrendingUp, Calendar, Lock,
  CheckCircle, XCircle, AlertCircle, RefreshCw
} from 'lucide-react'
import AnalyticsDashboard from './AnalyticsDashboard'
import PhotoModeration from './PhotoModeration'
import EventConfiguration from './EventConfiguration'
// import QRGenerator from './QRGenerator' // TODO: Create this component
// import SecuritySettings from './SecuritySettings' // TODO: Create this component
import { Photo } from '../../types'
import { format } from 'date-fns'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import toast from 'react-hot-toast'

interface EnhancedAdminPanelProps {
  photos: Photo[]
  onPhotoDelete: (id: string) => void
  onPhotoApprove: (id: string) => void
  onBulkAction: (action: 'approve' | 'reject' | 'delete', ids: string[]) => void
}

type AdminTab = 'overview' | 'moderation' | 'analytics' | 'configuration' | 'qr-codes' | 'security'

const EnhancedAdminPanel: React.FC<EnhancedAdminPanelProps> = ({
  photos,
  onPhotoDelete,
  onPhotoApprove,
  onBulkAction
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview')
  const [stats, setStats] = useState({
    totalPhotos: 0,
    pendingModeration: 0,
    approvedPhotos: 0,
    rejectedPhotos: 0,
    totalSize: 0,
    uniqueUploaders: 0,
    todayUploads: 0,
    weeklyGrowth: 0
  })
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)

  useEffect(() => {
    // Calculate statistics
    const totalSize = photos.reduce((sum, p) => sum + p.size, 0)
    const uniqueUploaders = new Set(photos.map(p => p.uploaderName).filter(Boolean)).size
    const today = new Date().setHours(0, 0, 0, 0)
    const todayUploads = photos.filter(p =>
      new Date(p.uploadedAt).setHours(0, 0, 0, 0) === today
    ).length

    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weeklyUploads = photos.filter(p =>
      new Date(p.uploadedAt) > weekAgo
    ).length
    const previousWeekUploads = photos.filter(p => {
      const uploadDate = new Date(p.uploadedAt)
      const twoWeeksAgo = new Date()
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
      return uploadDate > twoWeeksAgo && uploadDate < weekAgo
    }).length

    const weeklyGrowth = previousWeekUploads > 0
      ? ((weeklyUploads - previousWeekUploads) / previousWeekUploads * 100)
      : 100

    setStats({
      totalPhotos: photos.length,
      pendingModeration: photos.filter(p => !p.approved && !p.rejected).length,
      approvedPhotos: photos.filter(p => p.approved).length,
      rejectedPhotos: photos.filter(p => p.rejected).length,
      totalSize,
      uniqueUploaders,
      todayUploads,
      weeklyGrowth
    })
  }, [photos])

  const handleBulkDownload = async () => {
    setIsDownloading(true)
    setDownloadProgress(0)

    try {
      const zip = new JSZip()
      const mainFolder = zip.folder('wedding-photos')

      // Organize by uploader
      const photosByUploader = photos.reduce((acc, photo) => {
        const uploader = photo.uploaderName || 'anonymous'
        if (!acc[uploader]) acc[uploader] = []
        acc[uploader].push(photo)
        return acc
      }, {} as Record<string, Photo[]>)

      let processedCount = 0
      const totalPhotos = photos.length

      for (const [uploader, uploaderPhotos] of Object.entries(photosByUploader)) {
        const uploaderFolder = mainFolder?.folder(uploader)

        for (const photo of uploaderPhotos) {
          try {
            const response = await fetch(photo.url)
            const blob = await response.blob()
            const fileName = `${format(new Date(photo.uploadedAt), 'yyyy-MM-dd_HHmmss')}_${photo.id}.${photo.format}`
            uploaderFolder?.file(fileName, blob)

            processedCount++
            setDownloadProgress(Math.round((processedCount / totalPhotos) * 100))
          } catch (error) {
            console.error(`Failed to download photo ${photo.id}:`, error)
          }
        }
      }

      // Add metadata
      const metadata = {
        eventName: import.meta.env.VITE_EVENT_NAME,
        eventDate: import.meta.env.VITE_EVENT_DATE,
        totalPhotos: photos.length,
        uploaders: Object.keys(photosByUploader),
        exportDate: new Date().toISOString()
      }
      mainFolder?.file('metadata.json', JSON.stringify(metadata, null, 2))

      // Generate and download ZIP
      const content = await zip.generateAsync({ type: 'blob' })
      const timestamp = format(new Date(), 'yyyy-MM-dd_HHmmss')
      saveAs(content, `wedding-photos-complete-${timestamp}.zip`)

      toast.success('All photos downloaded successfully!')
    } catch (error) {
      console.error('Download failed:', error)
      toast.error('Failed to download photos')
    } finally {
      setIsDownloading(false)
      setDownloadProgress(0)
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'moderation', label: 'Moderation', icon: CheckCircle },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'configuration', label: 'Configuration', icon: Settings },
    { id: 'qr-codes', label: 'QR Codes', icon: QrCode },
    { id: 'security', label: 'Security', icon: Lock }
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="h-10 w-10" />
              <h1 className="text-3xl font-display font-bold">Admin Dashboard</h1>
            </div>
            <p className="text-white/90 text-lg">
              Manage your wedding photos and monitor guest activity
            </p>
          </div>
          <button
            onClick={handleBulkDownload}
            disabled={isDownloading || photos.length === 0}
            className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors flex items-center space-x-2"
          >
            {isDownloading ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span>Downloading... {downloadProgress}%</span>
              </>
            ) : (
              <>
                <Download className="h-5 w-5" />
                <span>Download All Photos</span>
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm p-2">
        <div className="flex space-x-2 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap
                ${activeTab === tab.id
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'text-secondary-600 hover:bg-secondary-50'
                }
              `}
            >
              <tab.icon className="h-4 w-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {/* Stat Cards */}
            <StatCard
              icon={Camera}
              label="Total Photos"
              value={stats.totalPhotos}
              change={`+${stats.todayUploads} today`}
              color="blue"
            />
            <StatCard
              icon={Users}
              label="Unique Guests"
              value={stats.uniqueUploaders}
              change={`${Math.round(stats.weeklyGrowth)}% growth`}
              color="green"
            />
            <StatCard
              icon={HardDrive}
              label="Storage Used"
              value={`${(stats.totalSize / 1024 / 1024).toFixed(1)} MB`}
              change={`${(stats.totalSize / photos.length / 1024).toFixed(1)} KB avg`}
              color="purple"
            />
            <StatCard
              icon={AlertCircle}
              label="Pending Review"
              value={stats.pendingModeration}
              change={stats.pendingModeration > 0 ? 'Needs attention' : 'All clear'}
              color={stats.pendingModeration > 0 ? 'orange' : 'green'}
            />
          </motion.div>
        )}

        {activeTab === 'moderation' && (
          <motion.div
            key="moderation"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <PhotoModeration
              photos={photos}
              onApprove={onPhotoApprove}
              onReject={(id) => onPhotoDelete(id)}
              onBulkAction={onBulkAction}
            />
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <AnalyticsDashboard photos={photos} />
          </motion.div>
        )}

        {activeTab === 'configuration' && (
          <motion.div
            key="configuration"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <EventConfiguration />
          </motion.div>
        )}

        {activeTab === 'qr-codes' && (
          <motion.div
            key="qr-codes"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-white rounded-xl shadow-sm p-8 text-center"
          >
            <QrCode className="h-16 w-16 mx-auto text-secondary-400 mb-4" />
            <h3 className="text-xl font-medium text-secondary-900 mb-2">QR Code Generator</h3>
            <p className="text-secondary-600">This feature will be available soon!</p>
          </motion.div>
        )}

        {activeTab === 'security' && (
          <motion.div
            key="security"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-white rounded-xl shadow-sm p-8 text-center"
          >
            <Lock className="h-16 w-16 mx-auto text-secondary-400 mb-4" />
            <h3 className="text-xl font-medium text-secondary-900 mb-2">Security Settings</h3>
            <p className="text-secondary-600">This feature will be available soon!</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  change: string
  color: 'blue' | 'green' | 'purple' | 'orange'
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, change, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-secondary-600">{label}</p>
          <p className="mt-2 text-3xl font-bold text-secondary-900">{value}</p>
          <p className="mt-2 text-sm text-secondary-500">{change}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  )
}

export default EnhancedAdminPanel
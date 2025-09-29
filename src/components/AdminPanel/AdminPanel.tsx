import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Trash2, Shield, Copy, QrCode, Settings } from 'lucide-react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import toast from 'react-hot-toast'
import { Photo } from '../../types'
import AdminStats from './AdminStats'
import BulkActions from './BulkActions'

interface AdminPanelProps {
  photos: Photo[]
  onDeletePhoto: (id: string) => void
  onDeleteAll: () => void
}

const AdminPanel: React.FC<AdminPanelProps> = ({ photos, onDeletePhoto, onDeleteAll }) => {
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set())
  const [downloading, setDownloading] = useState(false)

  const handleSelectPhoto = (id: string) => {
    const newSelection = new Set(selectedPhotos)
    if (newSelection.has(id)) {
      newSelection.delete(id)
    } else {
      newSelection.add(id)
    }
    setSelectedPhotos(newSelection)
  }

  const handleSelectAll = () => {
    if (selectedPhotos.size === photos.length) {
      setSelectedPhotos(new Set())
    } else {
      setSelectedPhotos(new Set(photos.map(p => p.id)))
    }
  }

  const handleDownloadSelected = async () => {
    const photosToDownload = selectedPhotos.size > 0
      ? photos.filter(p => selectedPhotos.has(p.id))
      : photos

    if (photosToDownload.length === 0) {
      toast.error('No photos to download')
      return
    }

    setDownloading(true)
    try {
      const zip = new JSZip()
      const folder = zip.folder('wedding-photos')

      await Promise.all(
        photosToDownload.map(async (photo, index) => {
          try {
            const response = await fetch(photo.url)
            const blob = await response.blob()
            const fileName = `photo-${index + 1}-${photo.uploaderName || 'guest'}.${photo.format}`
            folder?.file(fileName, blob)
          } catch (error) {
            console.error(`Failed to download photo ${photo.id}:`, error)
          }
        })
      )

      const content = await zip.generateAsync({ type: 'blob' })
      saveAs(content, `wedding-photos-${new Date().toISOString().split('T')[0]}.zip`)
      toast.success(`Downloaded ${photosToDownload.length} photos`)
      setSelectedPhotos(new Set())
    } catch (error) {
      console.error('Download failed:', error)
      toast.error('Failed to download photos')
    } finally {
      setDownloading(false)
    }
  }

  const handleDeleteSelected = () => {
    if (selectedPhotos.size === 0) return

    if (window.confirm(`Are you sure you want to delete ${selectedPhotos.size} photo(s)?`)) {
      selectedPhotos.forEach(id => onDeletePhoto(id))
      setSelectedPhotos(new Set())
      toast.success(`Deleted ${selectedPhotos.size} photos`)
    }
  }

  const copyUploadLink = () => {
    const uploadUrl = `${window.location.origin}/upload`
    navigator.clipboard.writeText(uploadUrl)
    toast.success('Upload link copied to clipboard')
  }

  const generateQRCode = () => {
    window.location.href = '/admin#qr-generator'
    toast.success('Scroll down to QR code generator')
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-500 to-purple-600 rounded-xl p-6 text-white"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="h-8 w-8" />
          <h2 className="text-2xl font-display font-bold">Admin Dashboard</h2>
        </div>
        <p className="text-white/90">
          Manage all uploaded photos, download in bulk, and monitor upload activity.
        </p>
      </motion.div>

      <AdminStats photos={photos} />

      <div className="card">
        <h3 className="text-lg font-medium text-secondary-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={copyUploadLink}
            className="flex items-center justify-center space-x-2 p-4 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Copy className="h-5 w-5" />
            <span>Copy Upload Link</span>
          </button>
          <button
            onClick={generateQRCode}
            className="flex items-center justify-center space-x-2 p-4 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
          >
            <QrCode className="h-5 w-5" />
            <span>Generate QR Code</span>
          </button>
          <button
            onClick={() => handleDownloadSelected()}
            disabled={downloading || photos.length === 0}
            className="flex items-center justify-center space-x-2 p-4 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-5 w-5" />
            <span>{downloading ? 'Downloading...' : 'Download All'}</span>
          </button>
          <button
            onClick={onDeleteAll}
            disabled={photos.length === 0}
            className="flex items-center justify-center space-x-2 p-4 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="h-5 w-5" />
            <span>Delete All</span>
          </button>
        </div>
      </div>

      <BulkActions
        photos={photos}
        selectedPhotos={selectedPhotos}
        onSelectPhoto={handleSelectPhoto}
        onSelectAll={handleSelectAll}
        onDownloadSelected={handleDownloadSelected}
        onDeleteSelected={handleDeleteSelected}
        downloading={downloading}
      />
    </div>
  )
}

export default AdminPanel
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package,
  Download,
  Trash2,
  Check,
  X,
  FileArchive,
  HardDrive,
  Calendar,
  Users,
  Image,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw
} from 'lucide-react'
import { BulkOperation, ExportOptions, PhotoBatch } from '../../types/admin'
import { Photo } from '../../types'
import { usePhotoContext } from '../../context/PhotoContext'
import { formatFileSize } from '../../utils/helpers'
import toast from 'react-hot-toast'

const BulkOperations: React.FC = () => {
  const { photos } = usePhotoContext()
  const [activeOperation, setActiveOperation] = useState<BulkOperation | null>(null)
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'zip',
    includePhotos: true,
    includeMetadata: true
  })
  const [selectedDateRange, setSelectedDateRange] = useState({
    start: '',
    end: ''
  })
  const [selectedUploaders, setSelectedUploaders] = useState<string[]>([])
  const [photoBatches, setPhotoBatches] = useState<PhotoBatch[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    // Load existing batches from localStorage
    const savedBatches = localStorage.getItem('photoBatches')
    if (savedBatches) {
      try {
        setPhotoBatches(JSON.parse(savedBatches))
      } catch (error) {
        console.error('Failed to load photo batches:', error)
      }
    }
  }, [])

  const uniqueUploaders = Array.from(new Set(photos.map(p => p.uploaderName).filter(Boolean))).sort()

  const getFilteredPhotos = () => {
    return photos.filter(photo => {
      // Date range filter
      if (selectedDateRange.start && selectedDateRange.end) {
        const photoDate = new Date(photo.uploadedAt)
        const startDate = new Date(selectedDateRange.start)
        const endDate = new Date(selectedDateRange.end)
        if (photoDate < startDate || photoDate > endDate) return false
      }

      // Uploader filter
      if (selectedUploaders.length > 0) {
        if (!photo.uploaderName || !selectedUploaders.includes(photo.uploaderName)) return false
      }

      return true
    })
  }

  const filteredPhotos = getFilteredPhotos()
  const totalSize = filteredPhotos.reduce((sum, photo) => sum + photo.size, 0)

  const handleBulkDownload = async () => {
    if (filteredPhotos.length === 0) {
      toast.error('No photos match your criteria')
      return
    }

    setIsProcessing(true)
    try {
      // Create a new batch
      const batch: PhotoBatch = {
        id: crypto.randomUUID(),
        name: `Wedding Photos - ${new Date().toLocaleDateString()}`,
        photoIds: filteredPhotos.map(p => p.id),
        createdAt: new Date(),
        status: 'creating',
        size: totalSize
      }

      setPhotoBatches(prev => {
        const updated = [batch, ...prev]
        localStorage.setItem('photoBatches', JSON.stringify(updated))
        return updated
      })

      // Simulate batch creation process
      setTimeout(() => {
        setPhotoBatches(prev => prev.map(b =>
          b.id === batch.id
            ? { ...b, status: 'ready', downloadUrl: '#', expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) }
            : b
        ))
        toast.success('Photo batch created successfully!')
      }, 3000)

      toast.info('Creating photo batch... This may take a few minutes.')
    } catch (error) {
      console.error('Failed to create batch:', error)
      toast.error('Failed to create photo batch')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBulkDelete = async () => {
    if (filteredPhotos.length === 0) {
      toast.error('No photos match your criteria')
      return
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${filteredPhotos.length} photos? This action cannot be undone.`
    )

    if (!confirmed) return

    setIsProcessing(true)
    try {
      // In a real implementation, this would call an API
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success(`${filteredPhotos.length} photos deleted successfully`)
    } catch (error) {
      console.error('Delete failed:', error)
      toast.error('Failed to delete photos')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleExport = async () => {
    if (filteredPhotos.length === 0) {
      toast.error('No photos to export')
      return
    }

    setIsProcessing(true)
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000))

      if (exportOptions.format === 'json') {
        const exportData = {
          metadata: {
            exportDate: new Date().toISOString(),
            totalPhotos: filteredPhotos.length,
            totalSize: totalSize
          },
          photos: filteredPhotos.map(photo => ({
            id: photo.id,
            uploaderName: photo.uploaderName,
            uploadedAt: photo.uploadedAt,
            caption: photo.caption,
            size: photo.size,
            width: photo.width,
            height: photo.height,
            format: photo.format,
            ...(exportOptions.includePhotos && { url: photo.url })
          }))
        }

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `wedding-photos-export-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }

      toast.success('Export completed successfully!')
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Export failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadBatch = (batch: PhotoBatch) => {
    if (batch.status !== 'ready' || !batch.downloadUrl) return

    toast.info('Starting download...')
    // In a real implementation, this would download the actual ZIP file
    toast.success('Download started!')
  }

  const deleteBatch = (batchId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this batch?')
    if (!confirmed) return

    setPhotoBatches(prev => {
      const updated = prev.filter(b => b.id !== batchId)
      localStorage.setItem('photoBatches', JSON.stringify(updated))
      return updated
    })
    toast.success('Batch deleted successfully')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-elegant p-6">
        <h2 className="text-2xl font-display font-medium text-wedding-navy mb-2">
          Bulk Operations
        </h2>
        <p className="text-wedding-navy-light font-accent">
          Manage large collections of photos with powerful bulk operations
        </p>
      </div>

      {/* Filters */}
      <div className="card-elegant p-6">
        <h3 className="text-lg font-display font-medium text-wedding-navy mb-4">
          Photo Selection Criteria
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-accent font-medium text-wedding-navy mb-2">
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={selectedDateRange.start}
                onChange={(e) => setSelectedDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="input-field"
              />
              <input
                type="date"
                value={selectedDateRange.end}
                onChange={(e) => setSelectedDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="input-field"
              />
            </div>
          </div>

          {/* Uploaders */}
          <div>
            <label className="block text-sm font-accent font-medium text-wedding-navy mb-2">
              Uploaders
            </label>
            <div className="max-h-32 overflow-y-auto border border-wedding-gold/30 rounded-lg p-2">
              <label className="flex items-center space-x-2 p-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedUploaders.length === 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedUploaders([])
                    }
                  }}
                  className="w-4 h-4 text-wedding-gold rounded focus:ring-wedding-gold"
                />
                <span className="font-accent text-sm text-wedding-navy">All uploaders</span>
              </label>
              {uniqueUploaders.map(uploader => (
                <label key={uploader} className="flex items-center space-x-2 p-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedUploaders.includes(uploader)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUploaders(prev => [...prev, uploader])
                      } else {
                        setSelectedUploaders(prev => prev.filter(u => u !== uploader))
                      }
                    }}
                    className="w-4 h-4 text-wedding-gold rounded focus:ring-wedding-gold"
                  />
                  <span className="font-accent text-sm text-wedding-navy">{uploader}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Selection Summary */}
        <div className="mt-6 p-4 bg-wedding-gold-light/20 rounded-lg border border-wedding-gold/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Image className="h-5 w-5 text-wedding-gold" />
              <span className="font-accent text-wedding-navy">
                {filteredPhotos.length} photos selected
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <HardDrive className="h-5 w-5 text-wedding-sage" />
              <span className="font-accent text-wedding-navy">
                {formatFileSize(totalSize)} total size
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-wedding-dusty" />
              <span className="font-accent text-wedding-navy">
                {selectedUploaders.length || uniqueUploaders.length} uploaders
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bulk Download */}
        <div className="card-elegant p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-wedding-gold/20 rounded-lg flex items-center justify-center">
              <Download className="h-5 w-5 text-wedding-gold" />
            </div>
            <div>
              <h3 className="text-lg font-display font-medium text-wedding-navy">
                Bulk Download
              </h3>
              <p className="text-sm text-wedding-navy-light font-accent">
                Create ZIP archives of selected photos
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-accent font-medium text-wedding-navy mb-2">
                Download Format
              </label>
              <select className="w-full input-field">
                <option value="original">Original Quality</option>
                <option value="compressed">Compressed (80% quality)</option>
                <option value="thumbnail">Thumbnails Only</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeMetadata"
                defaultChecked
                className="w-4 h-4 text-wedding-gold rounded focus:ring-wedding-gold"
              />
              <label htmlFor="includeMetadata" className="font-accent text-sm text-wedding-navy">
                Include metadata file
              </label>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBulkDownload}
              disabled={isProcessing || filteredPhotos.length === 0}
              className="w-full btn-primary disabled:opacity-50"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center space-x-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Creating Batch...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Package className="h-4 w-4" />
                  <span>Create Download Batch</span>
                </div>
              )}
            </motion.button>
          </div>
        </div>

        {/* Data Export */}
        <div className="card-elegant p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-wedding-sage/20 rounded-lg flex items-center justify-center">
              <FileArchive className="h-5 w-5 text-wedding-sage" />
            </div>
            <div>
              <h3 className="text-lg font-display font-medium text-wedding-navy">
                Data Export
              </h3>
              <p className="text-sm text-wedding-navy-light font-accent">
                Export photo metadata and information
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-accent font-medium text-wedding-navy mb-2">
                Export Format
              </label>
              <select
                value={exportOptions.format}
                onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value as 'json' | 'csv' | 'zip' }))}
                className="w-full input-field"
              >
                <option value="json">JSON Format</option>
                <option value="csv">CSV Spreadsheet</option>
                <option value="zip">ZIP with Photos</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={exportOptions.includePhotos}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, includePhotos: e.target.checked }))}
                  className="w-4 h-4 text-wedding-gold rounded focus:ring-wedding-gold"
                />
                <span className="font-accent text-sm text-wedding-navy">Include photo URLs</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={exportOptions.includeMetadata}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, includeMetadata: e.target.checked }))}
                  className="w-4 h-4 text-wedding-gold rounded focus:ring-wedding-gold"
                />
                <span className="font-accent text-sm text-wedding-navy">Include metadata</span>
              </label>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExport}
              disabled={isProcessing || filteredPhotos.length === 0}
              className="w-full btn-elegant disabled:opacity-50"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center space-x-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Exporting...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <FileArchive className="h-4 w-4" />
                  <span>Export Data</span>
                </div>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Bulk Delete (Dangerous) */}
      <div className="card-elegant p-6 border-red-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <Trash2 className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-display font-medium text-red-600">
              Bulk Delete
            </h3>
            <p className="text-sm text-red-500 font-accent">
              Permanently delete selected photos (irreversible)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 mb-4">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <span className="text-sm text-red-600 font-accent">
            This action cannot be undone. Please be very careful.
          </span>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleBulkDelete}
          disabled={isProcessing || filteredPhotos.length === 0}
          className="w-full bg-red-500 text-white font-accent py-2 px-4 rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
        >
          {isProcessing ? (
            <div className="flex items-center justify-center space-x-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Deleting...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <Trash2 className="h-4 w-4" />
              <span>Delete {filteredPhotos.length} Photos</span>
            </div>
          )}
        </motion.button>
      </div>

      {/* Download Batches */}
      {photoBatches.length > 0 && (
        <div className="card-elegant p-6">
          <h3 className="text-lg font-display font-medium text-wedding-navy mb-4">
            Download Batches
          </h3>
          <div className="space-y-3">
            {photoBatches.map((batch) => (
              <motion.div
                key={batch.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 bg-wedding-cream/30 rounded-lg border border-wedding-gold/20"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    batch.status === 'ready' ? 'bg-green-100 text-green-600' :
                    batch.status === 'creating' ? 'bg-yellow-100 text-yellow-600' :
                    batch.status === 'error' ? 'bg-red-100 text-red-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {batch.status === 'ready' && <CheckCircle className="h-4 w-4" />}
                    {batch.status === 'creating' && <Clock className="h-4 w-4" />}
                    {batch.status === 'downloading' && <Download className="h-4 w-4" />}
                    {batch.status === 'error' && <X className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="font-accent font-medium text-wedding-navy">{batch.name}</p>
                    <p className="text-sm text-wedding-navy-light">
                      {batch.photoIds.length} photos • {formatFileSize(batch.size || 0)}
                      {batch.expiresAt && (
                        <span className="ml-2">
                          • Expires {new Date(batch.expiresAt).toLocaleDateString()}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {batch.status === 'ready' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => downloadBatch(batch)}
                      className="px-3 py-1 bg-wedding-gold text-white rounded-lg hover:bg-wedding-gold/80 transition-colors text-sm font-accent"
                    >
                      Download
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => deleteBatch(batch.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-accent"
                  >
                    Delete
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default BulkOperations
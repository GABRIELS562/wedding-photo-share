import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, X, FileArchive, Image } from 'lucide-react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { Photo } from '../../types'

interface BatchDownloadModalProps {
  photos: Photo[]
  onClose: () => void
}

const BatchDownloadModal: React.FC<BatchDownloadModalProps> = ({ photos, onClose }) => {
  const [downloading, setDownloading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [format, setFormat] = useState<'original' | 'compressed'>('original')
  const [includeMetadata, setIncludeMetadata] = useState(true)

  const handleDownload = async () => {
    setDownloading(true)
    setProgress(0)

    const zip = new JSZip()
    const folder = zip.folder('wedding-photos')

    // Create metadata file if requested
    if (includeMetadata) {
      const metadata = photos.map(photo => ({
        id: photo.id,
        uploader: photo.uploaderName,
        message: photo.message,
        uploadedAt: photo.uploadedAt,
        size: photo.size,
        dimensions: `${photo.width}x${photo.height}`,
        format: photo.format
      }))

      folder?.file('metadata.json', JSON.stringify(metadata, null, 2))
    }

    // Download each photo
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i]
      setProgress(Math.round(((i + 1) / photos.length) * 100))

      try {
        const url = format === 'compressed'
          ? photo.thumbnailUrl || photo.url
          : photo.url

        const response = await fetch(url)
        const blob = await response.blob()

        const fileName = `${i + 1}_${photo.uploaderName || 'guest'}_${photo.id}.${photo.format}`
        folder?.file(fileName, blob)
      } catch (error) {
        console.error(`Failed to download photo ${photo.id}:`, error)
      }
    }

    // Generate and download ZIP
    const content = await zip.generateAsync({ type: 'blob' })
    const timestamp = new Date().toISOString().split('T')[0]
    saveAs(content, `wedding-photos-${timestamp}.zip`)

    setDownloading(false)
    onClose()
  }

  const totalSize = photos.reduce((sum, photo) => sum + photo.size, 0)
  const estimatedZipSize = format === 'compressed'
    ? totalSize * 0.3
    : totalSize * 0.9

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-bold text-secondary-900">
            Download Photos
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-secondary-500 hover:text-secondary-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Download Info */}
          <div className="bg-secondary-50 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <FileArchive className="h-8 w-8 text-primary-500" />
              <div>
                <p className="font-medium text-secondary-900">
                  {photos.length} photos selected
                </p>
                <p className="text-sm text-secondary-600">
                  Estimated size: {(estimatedZipSize / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Image Quality
              </label>
              <div className="space-y-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="original"
                    checked={format === 'original'}
                    onChange={(e) => setFormat(e.target.value as 'original' | 'compressed')}
                    className="w-4 h-4 text-primary-600"
                  />
                  <span className="ml-2 text-sm text-secondary-700">
                    Original quality (larger file size)
                  </span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="compressed"
                    checked={format === 'compressed'}
                    onChange={(e) => setFormat(e.target.value as 'original' | 'compressed')}
                    className="w-4 h-4 text-primary-600"
                  />
                  <span className="ml-2 text-sm text-secondary-700">
                    Compressed (smaller file size)
                  </span>
                </label>
              </div>
            </div>

            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={includeMetadata}
                onChange={(e) => setIncludeMetadata(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded"
              />
              <span className="ml-2 text-sm text-secondary-700">
                Include metadata file (JSON)
              </span>
            </label>
          </div>

          {/* Progress Bar */}
          {downloading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-secondary-600">
                <span>Preparing download...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 bg-secondary-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary-500 to-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={downloading}
              className="flex-1 px-4 py-2 border border-secondary-300 text-secondary-700 rounded-lg hover:bg-secondary-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {downloading ? (
                <>
                  <div className="loading-spinner" />
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <Download className="h-5 w-5" />
                  <span>Download ZIP</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default BatchDownloadModal
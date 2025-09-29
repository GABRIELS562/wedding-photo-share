import React from 'react'
import { motion } from 'framer-motion'
import { X, Download, Trash2, Calendar, User, Info } from 'lucide-react'
import { Photo } from '../../types'
import { format } from 'date-fns'

interface PhotoModalProps {
  photo: Photo
  onClose: () => void
  onDownload: () => void
  onDelete?: (id: string) => void
}

const PhotoModal: React.FC<PhotoModalProps> = ({ photo, onClose, onDownload, onDelete }) => {
  const handleDelete = () => {
    if (onDelete) {
      onDelete(photo.id)
      onClose()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative max-w-7xl max-h-[90vh] bg-white rounded-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-4 right-4 z-10 flex space-x-2">
          <button
            onClick={onDownload}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-secondary-700 hover:bg-white transition-colors"
            title="Download"
          >
            <Download className="h-5 w-5" />
          </button>
          {onDelete && (
            <button
              onClick={handleDelete}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-red-600 hover:bg-white transition-colors"
              title="Delete"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-secondary-700 hover:bg-white transition-colors"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row">
          <div className="flex-1 bg-black flex items-center justify-center p-4 md:p-8">
            <img
              src={photo.url}
              alt="Wedding photo"
              className="max-w-full max-h-[70vh] object-contain"
            />
          </div>

          <div className="w-full md:w-80 bg-white p-6 space-y-4">
            <h3 className="text-xl font-display font-bold text-secondary-900">
              Photo Details
            </h3>

            {photo.uploaderName && (
              <div className="flex items-center space-x-2 text-secondary-700">
                <User className="h-4 w-4 text-secondary-400" />
                <span className="font-medium">Uploaded by:</span>
                <span>{photo.uploaderName}</span>
              </div>
            )}

            <div className="flex items-center space-x-2 text-secondary-700">
              <Calendar className="h-4 w-4 text-secondary-400" />
              <span className="font-medium">Date:</span>
              <span>{format(new Date(photo.uploadedAt), 'MMM dd, yyyy h:mm a')}</span>
            </div>

            <div className="flex items-center space-x-2 text-secondary-700">
              <Info className="h-4 w-4 text-secondary-400" />
              <span className="font-medium">Details:</span>
            </div>
            <div className="pl-6 space-y-1 text-sm text-secondary-600">
              <p>Dimensions: {photo.width} × {photo.height}px</p>
              <p>Format: {photo.format.toUpperCase()}</p>
              <p>Size: {(photo.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>

            {photo.message && (
              <>
                <div className="border-t pt-4">
                  <p className="font-medium text-secondary-900 mb-2">Message:</p>
                  <p className="text-secondary-700">{photo.message}</p>
                </div>
              </>
            )}

            <div className="pt-4 border-t">
              <button
                onClick={onDownload}
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                <Download className="h-5 w-5" />
                <span>Download Full Resolution</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default PhotoModal
import React from 'react'
import { motion } from 'framer-motion'
import { Download, Trash2, Calendar, User, Maximize2 } from 'lucide-react'
import { Photo } from '../../types'
import { format } from 'date-fns'

interface PhotoCardProps {
  photo: Photo
  index: number
  view: 'grid' | 'list'
  isAdmin?: boolean
  onClick: () => void
  onDownload: () => void
  onDelete?: (id: string) => void
}

const PhotoCard: React.FC<PhotoCardProps> = ({
  photo,
  index,
  view,
  isAdmin,
  onClick,
  onDownload,
  onDelete
}) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDelete) {
      onDelete(photo.id)
    }
  }

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDownload()
  }

  if (view === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-4"
      >
        <div className="flex items-center space-x-4">
          <div
            className="w-24 h-24 rounded-lg overflow-hidden bg-secondary-100 cursor-pointer flex-shrink-0"
            onClick={onClick}
          >
            <img
              src={photo.thumbnailUrl || photo.url}
              alt="Wedding photo"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                {photo.uploaderName && (
                  <div className="flex items-center text-sm text-secondary-600 mb-1">
                    <User className="h-3 w-3 mr-1" />
                    {photo.uploaderName}
                  </div>
                )}
                <div className="flex items-center text-xs text-secondary-500">
                  <Calendar className="h-3 w-3 mr-1" />
                  {format(new Date(photo.uploadedAt), 'MMM dd, yyyy h:mm a')}
                </div>
                {photo.message && (
                  <p className="mt-2 text-sm text-secondary-700 line-clamp-2">
                    {photo.message}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleDownload}
                  className="p-2 text-secondary-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  onClick={onClick}
                  className="p-2 text-secondary-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  title="View fullscreen"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
                {isAdmin && onDelete && (
                  <button
                    onClick={handleDelete}
                    className="p-2 text-secondary-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      <div className="aspect-square overflow-hidden bg-secondary-100">
        <img
          src={photo.thumbnailUrl || photo.url}
          alt="Wedding photo"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          loading="lazy"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {photo.uploaderName && (
            <p className="text-white text-sm font-medium mb-1">
              {photo.uploaderName}
            </p>
          )}
          <p className="text-white/80 text-xs">
            {format(new Date(photo.uploadedAt), 'MMM dd, yyyy')}
          </p>
        </div>
        <div className="absolute top-4 right-4 flex space-x-2">
          <button
            onClick={handleDownload}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-secondary-700 hover:bg-white transition-colors"
            title="Download"
          >
            <Download className="h-4 w-4" />
          </button>
          {isAdmin && onDelete && (
            <button
              onClick={handleDelete}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-red-600 hover:bg-white transition-colors"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default PhotoCard
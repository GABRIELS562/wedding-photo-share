import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertCircle, Eye, Trash2, Download } from 'lucide-react'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import { Photo } from '../../types'
import { format } from 'date-fns'
import 'react-lazy-load-image-component/src/effects/blur.css'

interface PhotoModerationProps {
  photos: Photo[]
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onBulkAction: (action: 'approve' | 'reject' | 'delete', ids: string[]) => void
}

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected'

const PhotoModeration: React.FC<PhotoModerationProps> = ({
  photos,
  onApprove,
  onReject,
  onBulkAction
}) => {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('pending')
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set())
  const [viewPhoto, setViewPhoto] = useState<Photo | null>(null)

  const filteredPhotos = photos.filter(photo => {
    switch (filterStatus) {
      case 'pending':
        return !photo.approved && !photo.rejected
      case 'approved':
        return photo.approved
      case 'rejected':
        return photo.rejected
      default:
        return true
    }
  })

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
    if (selectedPhotos.size === filteredPhotos.length) {
      setSelectedPhotos(new Set())
    } else {
      setSelectedPhotos(new Set(filteredPhotos.map(p => p.id)))
    }
  }

  const handleBulkAction = (action: 'approve' | 'reject' | 'delete') => {
    if (selectedPhotos.size === 0) return

    onBulkAction(action, Array.from(selectedPhotos))
    setSelectedPhotos(new Set())
  }

  const getStatusBadge = (photo: Photo) => {
    if (photo.approved) {
      return (
        <span className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
          <CheckCircle className="h-3 w-3" />
          <span>Approved</span>
        </span>
      )
    }
    if (photo.rejected) {
      return (
        <span className="flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
          <XCircle className="h-3 w-3" />
          <span>Rejected</span>
        </span>
      )
    }
    return (
      <span className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
        <AlertCircle className="h-3 w-3" />
        <span>Pending</span>
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-4">
            {(['all', 'pending', 'approved', 'rejected'] as FilterStatus[]).map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === status
                    ? 'bg-primary-500 text-white'
                    : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  {photos.filter(p => {
                    if (status === 'all') return true
                    if (status === 'pending') return !p.approved && !p.rejected
                    if (status === 'approved') return p.approved
                    if (status === 'rejected') return p.rejected
                    return false
                  }).length}
                </span>
              </button>
            ))}
          </div>

          {selectedPhotos.size > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-secondary-600">
                {selectedPhotos.size} selected
              </span>
              <button
                onClick={() => handleBulkAction('approve')}
                className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Approve
              </button>
              <button
                onClick={() => handleBulkAction('reject')}
                className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Reject
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1.5 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Select All */}
        {filteredPhotos.length > 0 && (
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              checked={selectedPhotos.size === filteredPhotos.length}
              onChange={handleSelectAll}
              className="w-4 h-4 text-primary-600 rounded"
            />
            <label className="ml-2 text-sm text-secondary-700 cursor-pointer">
              Select all {filteredPhotos.length} photos
            </label>
          </div>
        )}

        {/* Photo Grid */}
        {filteredPhotos.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
            <p className="text-secondary-600">No photos to moderate</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <AnimatePresence>
              {filteredPhotos.map(photo => (
                <motion.div
                  key={photo.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative group"
                >
                  <div className="aspect-square rounded-lg overflow-hidden bg-secondary-100">
                    <LazyLoadImage
                      src={photo.thumbnailUrl || photo.url}
                      alt={photo.uploaderName}
                      effect="blur"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                    <div className="absolute inset-0 p-2 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <input
                          type="checkbox"
                          checked={selectedPhotos.has(photo.id)}
                          onChange={() => handleSelectPhoto(photo.id)}
                          className="w-4 h-4 text-primary-600 rounded"
                        />
                        {getStatusBadge(photo)}
                      </div>

                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => setViewPhoto(photo)}
                          className="p-1.5 bg-white/20 backdrop-blur-sm rounded text-white hover:bg-white/30"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {!photo.approved && !photo.rejected && (
                          <>
                            <button
                              onClick={() => onApprove(photo.id)}
                              className="p-1.5 bg-green-500/20 backdrop-blur-sm rounded text-green-400 hover:bg-green-500/30"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => onReject(photo.id)}
                              className="p-1.5 bg-red-500/20 backdrop-blur-sm rounded text-red-400 hover:bg-red-500/30"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Photo Info */}
                  <div className="mt-2">
                    <p className="text-xs font-medium text-secondary-900 truncate">
                      {photo.uploaderName || 'Anonymous'}
                    </p>
                    <p className="text-xs text-secondary-500">
                      {format(new Date(photo.uploadedAt), 'MMM dd, HH:mm')}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Photo Preview Modal */}
      <AnimatePresence>
        {viewPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            onClick={() => setViewPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-4xl w-full bg-white rounded-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={viewPhoto.url}
                alt={viewPhoto.uploaderName}
                className="w-full h-auto"
              />
              <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
                <div className="flex items-start justify-between text-white">
                  <div>
                    <p className="font-medium">{viewPhoto.uploaderName || 'Anonymous'}</p>
                    <p className="text-sm opacity-75">
                      {format(new Date(viewPhoto.uploadedAt), 'PPp')}
                    </p>
                    {viewPhoto.message && (
                      <p className="text-sm mt-2">{viewPhoto.message}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setViewPhoto(null)}
                    className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
                <div className="flex justify-center space-x-4">
                  {!viewPhoto.approved && !viewPhoto.rejected && (
                    <>
                      <button
                        onClick={() => {
                          onApprove(viewPhoto.id)
                          setViewPhoto(null)
                        }}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      >
                        <CheckCircle className="h-5 w-5 inline mr-2" />
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          onReject(viewPhoto.id)
                          setViewPhoto(null)
                        }}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        <XCircle className="h-5 w-5 inline mr-2" />
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PhotoModeration
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Download, Heart, Calendar, User } from 'lucide-react'
import PhotoCard from './PhotoCard'
import PhotoModal from './PhotoModal'
import GalleryFilter from './GalleryFilter'
import { Photo } from '../../types'
import { format } from 'date-fns'
import LoadingSpinner from '../common/LoadingSpinner'

interface PhotoGalleryProps {
  photos: Photo[]
  loading?: boolean
  isAdmin?: boolean
  onPhotoDelete?: (id: string) => void
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  photos,
  loading = false,
  isAdmin = false,
  onPhotoDelete
}) => {
  const [filteredPhotos, setFilteredPhotos] = useState<Photo[]>(photos)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date')
  const [view, setView] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    let filtered = [...photos]

    if (searchTerm) {
      filtered = filtered.filter(photo =>
        photo.uploaderName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        photo.message?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      } else {
        return (a.uploaderName || '').localeCompare(b.uploaderName || '')
      }
    })

    setFilteredPhotos(filtered)
  }, [photos, searchTerm, sortBy])

  const downloadPhoto = async (photo: Photo) => {
    try {
      const response = await fetch(photo.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `wedding-photo-${photo.id}.${photo.format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="large" text="Loading photos..." />
      </div>
    )
  }

  return (
    <div className="w-full">
      <GalleryFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortBy={sortBy}
        onSortChange={setSortBy}
        view={view}
        onViewChange={setView}
        totalPhotos={filteredPhotos.length}
      />

      {filteredPhotos.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 bg-secondary-100 rounded-full mb-4">
            <Search className="h-12 w-12 text-secondary-400" />
          </div>
          <h3 className="text-xl font-medium text-secondary-900 mb-2">
            No photos found
          </h3>
          <p className="text-secondary-600 max-w-md mx-auto">
            {searchTerm
              ? `No photos match your search for "${searchTerm}"`
              : 'No photos have been uploaded yet. Be the first to share a memory!'}
          </p>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={
              view === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
                : 'space-y-4'
            }
          >
            {filteredPhotos.map((photo, index) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                index={index}
                view={view}
                isAdmin={isAdmin}
                onClick={() => setSelectedPhoto(photo)}
                onDownload={() => downloadPhoto(photo)}
                onDelete={onPhotoDelete}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      <AnimatePresence>
        {selectedPhoto && (
          <PhotoModal
            photo={selectedPhoto}
            onClose={() => setSelectedPhoto(null)}
            onDownload={() => downloadPhoto(selectedPhoto)}
            onDelete={isAdmin ? onPhotoDelete : undefined}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default PhotoGallery
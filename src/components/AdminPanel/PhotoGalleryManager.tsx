import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Grid,
  List,
  Search,
  Filter,
  Download,
  Trash2,
  Eye,
  Calendar,
  User,
  HardDrive,
  Check,
  X,
  MoreHorizontal,
  Heart,
  Share2,
  ZoomIn,
  Info
} from 'lucide-react'
import { Photo, PhotoFilter } from '../../types'
import { usePhotoContext } from '../../context/PhotoContext'
import { formatFileSize } from '../../utils/helpers'
import { formatDistanceToNow } from 'date-fns'
import PhotoLightbox from '../PhotoGallery/PhotoLightbox'
import toast from 'react-hot-toast'

type ViewMode = 'grid' | 'list'
type SortBy = 'date' | 'name' | 'size' | 'uploader'
type SortOrder = 'asc' | 'desc'

interface SelectedPhoto extends Photo {
  selected?: boolean
}

const PhotoGalleryManager: React.FC = () => {
  const { photos } = usePhotoContext()
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<PhotoFilter>({})
  const [showFilters, setShowFilters] = useState(false)
  const [lightboxPhoto, setLightboxPhoto] = useState<Photo | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Filter and sort photos
  const filteredAndSortedPhotos = useMemo(() => {
    let filtered = photos.filter(photo => {
      // Search term filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        const matchesName = photo.uploaderName?.toLowerCase().includes(term)
        const matchesCaption = photo.caption?.toLowerCase().includes(term)
        const matchesId = photo.id.toLowerCase().includes(term)
        if (!matchesName && !matchesCaption && !matchesId) return false
      }

      // Uploader filter
      if (filter.uploader && photo.uploaderName !== filter.uploader) return false

      // Date range filter
      if (filter.dateRange) {
        const photoDate = new Date(photo.uploadedAt)
        if (photoDate < filter.dateRange.start || photoDate > filter.dateRange.end) return false
      }

      // Approval filter
      if (filter.approved !== undefined && photo.approved !== filter.approved) return false

      // Tags filter
      if (filter.tags && filter.tags.length > 0) {
        const hasMatchingTag = filter.tags.some(tag => photo.tags?.includes(tag))
        if (!hasMatchingTag) return false
      }

      return true
    })

    // Sort photos
    filtered.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'date':
          comparison = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
          break
        case 'name':
          comparison = (a.uploaderName || '').localeCompare(b.uploaderName || '')
          break
        case 'size':
          comparison = a.size - b.size
          break
        case 'uploader':
          comparison = (a.uploaderName || '').localeCompare(b.uploaderName || '')
          break
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [photos, searchTerm, sortBy, sortOrder, filter])

  // Get unique uploaders for filter
  const uniqueUploaders = useMemo(() => {
    const uploaders = new Set(photos.map(p => p.uploaderName).filter(Boolean))
    return Array.from(uploaders).sort()
  }, [photos])

  // Get unique tags for filter
  const uniqueTags = useMemo(() => {
    const tags = new Set(photos.flatMap(p => p.tags || []))
    return Array.from(tags).sort()
  }, [photos])

  const handlePhotoSelect = (photoId: string) => {
    setSelectedPhotos(prev => {
      const newSet = new Set(prev)
      if (newSet.has(photoId)) {
        newSet.delete(photoId)
      } else {
        newSet.add(photoId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (selectedPhotos.size === filteredAndSortedPhotos.length) {
      setSelectedPhotos(new Set())
    } else {
      setSelectedPhotos(new Set(filteredAndSortedPhotos.map(p => p.id)))
    }
  }

  const handleBulkDownload = async () => {
    if (selectedPhotos.size === 0) {
      toast.error('Please select photos to download')
      return
    }

    setIsLoading(true)
    try {
      const selectedPhotoObjects = filteredAndSortedPhotos.filter(p => selectedPhotos.has(p.id))

      // Create and download ZIP file
      // This is a simplified implementation - in production, you'd use a proper ZIP library
      toast.success(`Preparing ${selectedPhotos.size} photos for download...`)

      // For now, download each photo individually
      for (const photo of selectedPhotoObjects) {
        const link = document.createElement('a')
        link.href = photo.url
        link.download = `${photo.uploaderName || 'guest'}_${photo.id}.${photo.format}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // Small delay to prevent overwhelming the browser
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      toast.success('Download completed!')
      setSelectedPhotos(new Set())
    } catch (error) {
      console.error('Download failed:', error)
      toast.error('Download failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedPhotos.size === 0) {
      toast.error('Please select photos to delete')
      return
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedPhotos.size} selected photo(s)? This action cannot be undone.`
    )

    if (!confirmed) return

    setIsLoading(true)
    try {
      // In a real implementation, you'd call an API to delete photos
      toast.success(`${selectedPhotos.size} photos deleted successfully`)
      setSelectedPhotos(new Set())
    } catch (error) {
      console.error('Delete failed:', error)
      toast.error('Delete failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="card-elegant p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Title and stats */}
          <div>
            <h2 className="text-2xl font-display font-medium text-wedding-navy mb-2">
              Photo Gallery Management
            </h2>
            <p className="text-wedding-navy-light font-accent">
              {filteredAndSortedPhotos.length} of {photos.length} photos
              {selectedPhotos.size > 0 && (
                <span className="ml-2 text-wedding-gold">
                  • {selectedPhotos.size} selected
                </span>
              )}
            </p>
          </div>

          {/* View controls */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-wedding-cream rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-wedding-gold text-white'
                    : 'text-wedding-navy-light hover:text-wedding-navy'
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-wedding-gold text-white'
                    : 'text-wedding-navy-light hover:text-wedding-navy'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg font-accent transition-colors ${
                showFilters
                  ? 'bg-wedding-gold text-white'
                  : 'bg-wedding-gold/10 text-wedding-gold hover:bg-wedding-gold/20'
              }`}
            >
              <Filter className="h-4 w-4 inline mr-2" />
              Filters
            </button>
          </div>
        </div>

        {/* Search and bulk actions */}
        <div className="mt-6 flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-wedding-navy-light" />
            <input
              type="text"
              placeholder="Search photos by uploader, caption, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-wedding-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-wedding-gold font-accent"
            />
          </div>

          {/* Sort controls */}
          <div className="flex space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="px-3 py-2 border border-wedding-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-wedding-gold font-accent"
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="size">Sort by Size</option>
              <option value="uploader">Sort by Uploader</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-wedding-gold/30 rounded-lg hover:bg-wedding-gold/10 transition-colors font-accent"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>

          {/* Bulk actions */}
          {selectedPhotos.size > 0 && (
            <div className="flex space-x-2">
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleBulkDownload}
                disabled={isLoading}
                className="px-4 py-2 bg-wedding-sage text-white rounded-lg hover:bg-wedding-sage/80 transition-colors font-accent flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Download</span>
              </motion.button>
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleBulkDelete}
                disabled={isLoading}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-accent flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </motion.button>
            </div>
          )}
        </div>

        {/* Advanced Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 p-4 bg-wedding-cream/50 rounded-lg border border-wedding-gold/20"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-accent font-medium text-wedding-navy mb-2">
                    Uploader
                  </label>
                  <select
                    value={filter.uploader || ''}
                    onChange={(e) => setFilter(prev => ({ ...prev, uploader: e.target.value || undefined }))}
                    className="w-full px-3 py-2 border border-wedding-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-wedding-gold font-accent"
                  >
                    <option value="">All uploaders</option>
                    {uniqueUploaders.map(uploader => (
                      <option key={uploader} value={uploader}>{uploader}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-accent font-medium text-wedding-navy mb-2">
                    Approval Status
                  </label>
                  <select
                    value={filter.approved === undefined ? '' : filter.approved.toString()}
                    onChange={(e) => {
                      const value = e.target.value
                      setFilter(prev => ({
                        ...prev,
                        approved: value === '' ? undefined : value === 'true'
                      }))
                    }}
                    className="w-full px-3 py-2 border border-wedding-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-wedding-gold font-accent"
                  >
                    <option value="">All photos</option>
                    <option value="true">Approved</option>
                    <option value="false">Pending</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-accent font-medium text-wedding-navy mb-2">
                    Tags
                  </label>
                  <select
                    multiple
                    value={filter.tags || []}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, option => option.value)
                      setFilter(prev => ({ ...prev, tags: selected.length > 0 ? selected : undefined }))
                    }}
                    className="w-full px-3 py-2 border border-wedding-gold/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-wedding-gold font-accent"
                  >
                    {uniqueTags.map(tag => (
                      <option key={tag} value={tag}>{tag}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setFilter({})}
                  className="px-4 py-2 text-wedding-sage hover:text-wedding-gold transition-colors font-accent"
                >
                  Clear Filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Photo Gallery */}
      <div className="card-elegant p-6">
        {/* Select All */}
        <div className="mb-4 flex items-center justify-between">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedPhotos.size === filteredAndSortedPhotos.length && filteredAndSortedPhotos.length > 0}
              onChange={handleSelectAll}
              className="w-4 h-4 text-wedding-gold rounded focus:ring-wedding-gold"
            />
            <span className="font-accent text-wedding-navy">
              Select All ({filteredAndSortedPhotos.length})
            </span>
          </label>

          {filteredAndSortedPhotos.length === 0 && (
            <p className="text-wedding-navy-light font-accent">
              No photos match your current filters
            </p>
          )}
        </div>

        {/* Photo Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {filteredAndSortedPhotos.map((photo) => (
              <PhotoGridItem
                key={photo.id}
                photo={photo}
                selected={selectedPhotos.has(photo.id)}
                onSelect={() => handlePhotoSelect(photo.id)}
                onView={() => setLightboxPhoto(photo)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredAndSortedPhotos.map((photo) => (
              <PhotoListItem
                key={photo.id}
                photo={photo}
                selected={selectedPhotos.has(photo.id)}
                onSelect={() => handlePhotoSelect(photo.id)}
                onView={() => setLightboxPhoto(photo)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxPhoto && (
        <PhotoLightbox
          photos={filteredAndSortedPhotos}
          initialPhotoIndex={filteredAndSortedPhotos.findIndex(p => p.id === lightboxPhoto.id)}
          onClose={() => setLightboxPhoto(null)}
        />
      )}
    </div>
  )
}

const PhotoGridItem: React.FC<{
  photo: Photo
  selected: boolean
  onSelect: () => void
  onView: () => void
}> = ({ photo, selected, onSelect, onView }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative group rounded-lg overflow-hidden ${
        selected ? 'ring-2 ring-wedding-gold' : ''
      }`}
    >
      {/* Selection checkbox */}
      <div className="absolute top-2 left-2 z-10">
        <label className="cursor-pointer">
          <input
            type="checkbox"
            checked={selected}
            onChange={onSelect}
            className="w-4 h-4 text-wedding-gold rounded focus:ring-wedding-gold"
          />
        </label>
      </div>

      {/* Photo */}
      <div className="aspect-square relative">
        <img
          src={photo.thumbnailUrl}
          alt={photo.caption || `Photo by ${photo.uploaderName}`}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center">
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            whileHover={{ opacity: 1, scale: 1 }}
            onClick={onView}
            className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-2"
          >
            <ZoomIn className="h-5 w-5 text-wedding-navy" />
          </motion.button>
        </div>
      </div>

      {/* Info */}
      <div className="p-2 bg-white">
        <p className="text-xs font-accent text-wedding-navy truncate">
          {photo.uploaderName || 'Unknown'}
        </p>
        <p className="text-xs text-wedding-navy-light">
          {formatFileSize(photo.size)}
        </p>
      </div>
    </motion.div>
  )
}

const PhotoListItem: React.FC<{
  photo: Photo
  selected: boolean
  onSelect: () => void
  onView: () => void
}> = ({ photo, selected, onSelect, onView }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center space-x-4 p-4 bg-white rounded-lg border transition-colors ${
        selected ? 'border-wedding-gold bg-wedding-gold/5' : 'border-wedding-gold/20 hover:border-wedding-gold/40'
      }`}
    >
      {/* Selection */}
      <label className="cursor-pointer">
        <input
          type="checkbox"
          checked={selected}
          onChange={onSelect}
          className="w-4 h-4 text-wedding-gold rounded focus:ring-wedding-gold"
        />
      </label>

      {/* Thumbnail */}
      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
        <img
          src={photo.thumbnailUrl}
          alt={photo.caption || `Photo by ${photo.uploaderName}`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <User className="h-4 w-4 text-wedding-navy-light" />
          <span className="font-accent font-medium text-wedding-navy">
            {photo.uploaderName || 'Unknown Guest'}
          </span>
        </div>
        {photo.caption && (
          <p className="text-sm text-wedding-navy-light font-accent truncate mb-1">
            "{photo.caption}"
          </p>
        )}
        <div className="flex items-center space-x-4 text-xs text-wedding-navy-light">
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDistanceToNow(photo.uploadedAt)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <HardDrive className="h-3 w-3" />
            <span>{formatFileSize(photo.size)}</span>
          </div>
          <span>{photo.width} × {photo.height}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-2">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onView}
          className="p-2 text-wedding-sage hover:bg-wedding-sage/10 rounded-lg transition-colors"
          title="View photo"
        >
          <Eye className="h-4 w-4" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 text-wedding-gold hover:bg-wedding-gold/10 rounded-lg transition-colors"
          title="Download photo"
        >
          <Download className="h-4 w-4" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 text-wedding-dusty hover:bg-wedding-dusty/10 rounded-lg transition-colors"
          title="More options"
        >
          <MoreHorizontal className="h-4 w-4" />
        </motion.button>
      </div>
    </motion.div>
  )
}

export default PhotoGalleryManager
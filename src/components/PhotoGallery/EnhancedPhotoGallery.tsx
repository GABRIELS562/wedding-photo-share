import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react'
import Masonry from 'react-masonry-css'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import { useInView } from 'react-intersection-observer'
import { motion, AnimatePresence } from 'framer-motion'
import Fuse from 'fuse.js'
import {
  Search, Filter, Download, Grid3x3, List, Share2, Calendar,
  User, SortAsc, SortDesc, ChevronUp, X
} from 'lucide-react'
import { Photo } from '../../types'
import PhotoLightbox from './PhotoLightbox'
import FilterPanel from './FilterPanel'
import LoadingSpinner from '../common/LoadingSpinner'
import { EmptyStateAnimation } from '../common/LoadingAnimations'
import 'react-lazy-load-image-component/src/effects/blur.css'

const BatchDownloadModal = lazy(() => import('./BatchDownloadModal'))
const SocialShareModal = lazy(() => import('./SocialShareModal'))

interface EnhancedPhotoGalleryProps {
  photos: Photo[]
  isAdmin?: boolean
  onPhotoDelete?: (id: string) => void
  onPhotoApprove?: (id: string) => void
}

type ViewMode = 'masonry' | 'grid' | 'list'
type SortBy = 'date-desc' | 'date-asc' | 'name' | 'size'

const PHOTOS_PER_PAGE = 20

const EnhancedPhotoGallery: React.FC<EnhancedPhotoGalleryProps> = ({
  photos,
  isAdmin = false,
  onPhotoDelete,
  onPhotoApprove
}) => {
  const [filteredPhotos, setFilteredPhotos] = useState<Photo[]>(photos)
  const [displayedPhotos, setDisplayedPhotos] = useState<Photo[]>([])
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('masonry')
  const [sortBy, setSortBy] = useState<SortBy>('date-desc')
  const [showFilters, setShowFilters] = useState(false)
  const [showBatchDownload, setShowBatchDownload] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [sharePhoto, setSharePhoto] = useState<Photo | null>(null)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({
    dateRange: { start: null, end: null },
    uploaders: [] as string[],
    tags: [] as string[]
  })

  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false
  })

  // Fuse.js search configuration
  const fuse = useMemo(() => {
    return new Fuse(photos, {
      keys: ['uploaderName', 'message', 'tags'],
      threshold: 0.3,
      includeScore: true
    })
  }, [photos])

  // Filter and sort photos
  useEffect(() => {
    let result = [...photos]

    // Apply search
    if (searchQuery) {
      const searchResults = fuse.search(searchQuery)
      result = searchResults.map(r => r.item)
    }

    // Apply filters
    if (filters.dateRange.start) {
      result = result.filter(p =>
        new Date(p.uploadedAt) >= new Date(filters.dateRange.start!)
      )
    }
    if (filters.dateRange.end) {
      result = result.filter(p =>
        new Date(p.uploadedAt) <= new Date(filters.dateRange.end!)
      )
    }
    if (filters.uploaders.length > 0) {
      result = result.filter(p =>
        filters.uploaders.includes(p.uploaderName || '')
      )
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        case 'date-asc':
          return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
        case 'name':
          return (a.uploaderName || '').localeCompare(b.uploaderName || '')
        case 'size':
          return b.size - a.size
        default:
          return 0
      }
    })

    setFilteredPhotos(result)
    setPage(1)
    setDisplayedPhotos(result.slice(0, PHOTOS_PER_PAGE))
  }, [photos, searchQuery, filters, sortBy, fuse])

  // Load more photos when scrolling
  useEffect(() => {
    if (inView && displayedPhotos.length < filteredPhotos.length) {
      const nextPage = page + 1
      const nextPhotos = filteredPhotos.slice(0, nextPage * PHOTOS_PER_PAGE)
      setDisplayedPhotos(nextPhotos)
      setPage(nextPage)
    }
  }, [inView, page, displayedPhotos.length, filteredPhotos])

  const handlePhotoSelect = useCallback((photo: Photo) => {
    if (selectedPhotos.has(photo.id)) {
      const newSelection = new Set(selectedPhotos)
      newSelection.delete(photo.id)
      setSelectedPhotos(newSelection)
    } else {
      setSelectedPhotos(new Set([...selectedPhotos, photo.id]))
    }
  }, [selectedPhotos])

  const handleSelectAll = useCallback(() => {
    if (selectedPhotos.size === displayedPhotos.length) {
      setSelectedPhotos(new Set())
    } else {
      setSelectedPhotos(new Set(displayedPhotos.map(p => p.id)))
    }
  }, [selectedPhotos, displayedPhotos])

  const handleBatchDownload = useCallback(() => {
    const photosToDownload = photos.filter(p => selectedPhotos.has(p.id))
    if (photosToDownload.length > 0) {
      setShowBatchDownload(true)
    }
  }, [photos, selectedPhotos])

  const handleShare = useCallback((photo: Photo) => {
    setSharePhoto(photo)
    setShowShareModal(true)
  }, [])

  // Masonry breakpoints
  const masonryBreakpoints = {
    default: 4,
    1536: 4,
    1280: 3,
    1024: 3,
    768: 2,
    640: 1
  }

  const renderPhotoItem = (photo: Photo, index: number) => {
    const isSelected = selectedPhotos.has(photo.id)

    return (
      <motion.div
        key={photo.id}
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, delay: index * 0.02 }}
        className={`
          relative group cursor-pointer rounded-lg overflow-hidden
          ${viewMode === 'list' ? 'flex bg-white shadow-sm hover:shadow-md' : ''}
          ${isSelected ? 'ring-2 ring-primary-500' : ''}
        `}
      >
        {viewMode === 'list' ? (
          <div className="flex items-center p-4 w-full">
            <LazyLoadImage
              src={photo.thumbnailUrl}
              alt={photo.uploaderName}
              effect="blur"
              className="w-20 h-20 object-cover rounded-lg"
              onClick={() => setSelectedPhoto(photo)}
            />
            <div className="ml-4 flex-1">
              <p className="font-medium text-secondary-900">{photo.uploaderName}</p>
              <p className="text-sm text-secondary-600">{photo.message}</p>
              <div className="flex items-center space-x-4 mt-2 text-xs text-secondary-500">
                <span className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(photo.uploadedAt).toLocaleDateString()}
                </span>
                <span>{(photo.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleShare(photo)
                }}
                className="p-2 text-secondary-500 hover:text-primary-600"
              >
                <Share2 className="h-4 w-4" />
              </button>
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handlePhotoSelect(photo)}
                className="w-4 h-4 text-primary-600 rounded"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        ) : (
          <>
            <LazyLoadImage
              src={photo.thumbnailUrl || photo.url}
              alt={photo.uploaderName}
              effect="blur"
              className="w-full h-auto object-cover cursor-pointer transition-transform group-hover:scale-105"
              onClick={() => setSelectedPhoto(photo)}
              wrapperClassName="w-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <p className="font-medium">{photo.uploaderName}</p>
                <p className="text-sm opacity-90">{photo.message}</p>
              </div>
              <div className="absolute top-2 right-2 flex space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleShare(photo)
                  }}
                  className="p-2 bg-white/90 rounded-lg text-secondary-700 hover:bg-white"
                >
                  <Share2 className="h-4 w-4" />
                </button>
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 bg-white/90 rounded-lg"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handlePhotoSelect(photo)}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </motion.div>
    )
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="w-full">
      {/* Header Controls */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm shadow-sm p-4 mb-6 rounded-xl">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" />
            <input
              type="text"
              placeholder="Search by name, message, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 border border-secondary-300 rounded-lg hover:bg-secondary-50"
            >
              <Filter className="h-5 w-5" />
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="name">By Name</option>
              <option value="size">By Size</option>
            </select>

            <div className="flex bg-secondary-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('masonry')}
                className={`p-1.5 rounded ${viewMode === 'masonry' ? 'bg-white shadow-sm' : ''}`}
              >
                <Grid3x3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
              >
                <Grid3x3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            {selectedPhotos.size > 0 && (
              <>
                <button
                  onClick={handleBatchDownload}
                  className="px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                >
                  <Download className="h-4 w-4 inline mr-1" />
                  Download ({selectedPhotos.size})
                </button>
                <button
                  onClick={handleSelectAll}
                  className="px-3 py-2 border border-secondary-300 rounded-lg hover:bg-secondary-50"
                >
                  {selectedPhotos.size === displayedPhotos.length ? 'Deselect All' : 'Select All'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Photo Count */}
        <div className="mt-2 text-sm text-secondary-600">
          Showing {displayedPhotos.length} of {filteredPhotos.length} photos
        </div>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <FilterPanel
            filters={filters}
            onFiltersChange={setFilters}
            availableUploaders={[...new Set(photos.map(p => p.uploaderName).filter((name): name is string => Boolean(name)))]}
            onClose={() => setShowFilters(false)}
          />
        )}
      </AnimatePresence>

      {/* Photo Gallery */}
      {displayedPhotos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <EmptyStateAnimation />
          <h3 className="text-xl font-medium text-secondary-900 mt-4">No photos found</h3>
          <p className="text-secondary-600 mt-2">
            {searchQuery ? 'Try adjusting your search or filters' : 'Be the first to upload a photo!'}
          </p>
        </div>
      ) : (
        <>
          {viewMode === 'masonry' ? (
            <Masonry
              breakpointCols={masonryBreakpoints}
              className="flex -ml-4 w-auto"
              columnClassName="pl-4 bg-transparent"
            >
              {displayedPhotos.map((photo, index) => renderPhotoItem(photo, index))}
            </Masonry>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayedPhotos.map((photo, index) => renderPhotoItem(photo, index))}
            </div>
          ) : (
            <div className="space-y-4">
              {displayedPhotos.map((photo, index) => renderPhotoItem(photo, index))}
            </div>
          )}

          {/* Load More Trigger */}
          {displayedPhotos.length < filteredPhotos.length && (
            <div ref={loadMoreRef} className="flex justify-center py-8">
              <LoadingSpinner size="medium" text="Loading more photos..." />
            </div>
          )}
        </>
      )}

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {displayedPhotos.length > 10 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-4 right-4 p-3 bg-white shadow-lg rounded-full hover:shadow-xl transition-shadow z-30"
          >
            <ChevronUp className="h-6 w-6 text-secondary-700" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Lightbox */}
      {selectedPhoto && (
        <PhotoLightbox
          photo={selectedPhoto}
          photos={filteredPhotos}
          onClose={() => setSelectedPhoto(null)}
          onDelete={isAdmin ? onPhotoDelete : undefined}
          onApprove={isAdmin ? onPhotoApprove : undefined}
        />
      )}

      {/* Batch Download Modal */}
      <Suspense fallback={<LoadingSpinner />}>
        {showBatchDownload && (
          <BatchDownloadModal
            photos={photos.filter(p => selectedPhotos.has(p.id))}
            onClose={() => setShowBatchDownload(false)}
          />
        )}
      </Suspense>

      {/* Social Share Modal */}
      <Suspense fallback={<LoadingSpinner />}>
        {showShareModal && sharePhoto && (
          <SocialShareModal
            photo={sharePhoto}
            onClose={() => {
              setShowShareModal(false)
              setSharePhoto(null)
            }}
          />
        )}
      </Suspense>
    </div>
  )
}

export default EnhancedPhotoGallery
import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, ChevronLeft, ChevronRight, Download, Share2, Trash2,
  CheckCircle, Info, ZoomIn, ZoomOut, RotateCw
} from 'lucide-react'
import { Photo } from '../../types'
import { format } from 'date-fns'

interface PhotoLightboxProps {
  photo: Photo
  photos: Photo[]
  onClose: () => void
  onDelete?: (id: string) => void
  onApprove?: (id: string) => void
}

const PhotoLightbox: React.FC<PhotoLightboxProps> = ({
  photo,
  photos,
  onClose,
  onDelete,
  onApprove
}) => {
  const [currentPhoto, setCurrentPhoto] = useState(photo)
  const [currentIndex, setCurrentIndex] = useState(photos.findIndex(p => p.id === photo.id))
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [showInfo, setShowInfo] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          navigatePrevious()
          break
        case 'ArrowRight':
          navigateNext()
          break
        case '+':
        case '=':
          handleZoomIn()
          break
        case '-':
          handleZoomOut()
          break
        case 'r':
          handleRotate()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'auto'
    }
  }, [currentIndex])

  const navigateNext = useCallback(() => {
    if (currentIndex < photos.length - 1) {
      const nextIndex = currentIndex + 1
      setCurrentIndex(nextIndex)
      setCurrentPhoto(photos[nextIndex])
      setZoom(1)
      setRotation(0)
    }
  }, [currentIndex, photos])

  const navigatePrevious = useCallback(() => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1
      setCurrentIndex(prevIndex)
      setCurrentPhoto(photos[prevIndex])
      setZoom(1)
      setRotation(0)
    }
  }, [currentIndex, photos])

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5))
  }

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(currentPhoto.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `wedding-photo-${currentPhoto.id}.${currentPhoto.format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Wedding Photo',
          text: `Photo by ${currentPhoto.uploaderName}`,
          url: currentPhoto.url
        })
      } catch (error) {
        console.error('Share failed:', error)
      }
    } else {
      navigator.clipboard.writeText(currentPhoto.url)
      alert('Photo URL copied to clipboard!')
    }
  }

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      navigateNext()
    } else {
      navigatePrevious()
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
        onClick={onClose}
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10 bg-gradient-to-b from-black/50 to-transparent">
          <div className="text-white">
            <p className="text-lg font-medium">{currentPhoto.uploaderName}</p>
            <p className="text-sm opacity-75">
              {format(new Date(currentPhoto.uploadedAt), 'PPP')}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowInfo(!showInfo)
              }}
              className="p-2 bg-white/10 backdrop-blur-sm rounded-lg text-white hover:bg-white/20"
            >
              <Info className="h-5 w-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleShare()
              }}
              className="p-2 bg-white/10 backdrop-blur-sm rounded-lg text-white hover:bg-white/20"
            >
              <Share2 className="h-5 w-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleDownload()
              }}
              className="p-2 bg-white/10 backdrop-blur-sm rounded-lg text-white hover:bg-white/20"
            >
              <Download className="h-5 w-5" />
            </button>
            {onApprove && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onApprove(currentPhoto.id)
                }}
                className="p-2 bg-green-500/20 backdrop-blur-sm rounded-lg text-green-400 hover:bg-green-500/30"
              >
                <CheckCircle className="h-5 w-5" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (confirm('Are you sure you want to delete this photo?')) {
                    onDelete(currentPhoto.id)
                    onClose()
                  }
                }}
                className="p-2 bg-red-500/20 backdrop-blur-sm rounded-lg text-red-400 hover:bg-red-500/30"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onClose()
              }}
              className="p-2 bg-white/10 backdrop-blur-sm rounded-lg text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Main Image */}
        <motion.div
          className="relative max-w-[90vw] max-h-[80vh]"
          onClick={(e) => e.stopPropagation()}
          drag
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          dragElastic={0.2}
          onDragEnd={(e, { offset, velocity }) => {
            if (Math.abs(offset.x) > 100 || Math.abs(velocity.x) > 500) {
              handleSwipe(offset.x > 0 ? 'right' : 'left')
            }
          }}
        >
          <motion.img
            key={currentPhoto.id}
            src={currentPhoto.url}
            alt={currentPhoto.uploaderName}
            className="max-w-full max-h-[80vh] object-contain cursor-move"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
              opacity: 1,
              scale: zoom,
              rotate: rotation
            }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          />
        </motion.div>

        {/* Navigation */}
        {currentIndex > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              navigatePrevious()
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        {currentIndex < photos.length - 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              navigateNext()
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}

        {/* Zoom Controls */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg p-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleZoomOut()
            }}
            className="p-2 text-white hover:bg-white/20 rounded"
          >
            <ZoomOut className="h-5 w-5" />
          </button>
          <span className="text-white px-3">{Math.round(zoom * 100)}%</span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleZoomIn()
            }}
            className="p-2 text-white hover:bg-white/20 rounded"
          >
            <ZoomIn className="h-5 w-5" />
          </button>
          <div className="w-px h-6 bg-white/30" />
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleRotate()
            }}
            className="p-2 text-white hover:bg-white/20 rounded"
          >
            <RotateCw className="h-5 w-5" />
          </button>
        </div>

        {/* Photo Info Panel */}
        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="absolute right-0 top-0 bottom-0 w-80 bg-white/10 backdrop-blur-md p-6 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-white text-lg font-medium mb-4">Photo Details</h3>
              <div className="space-y-3 text-white/80 text-sm">
                <div>
                  <p className="text-white/60">Uploaded by</p>
                  <p className="font-medium">{currentPhoto.uploaderName || 'Anonymous'}</p>
                </div>
                {currentPhoto.message && (
                  <div>
                    <p className="text-white/60">Message</p>
                    <p className="font-medium">{currentPhoto.message}</p>
                  </div>
                )}
                <div>
                  <p className="text-white/60">Date</p>
                  <p className="font-medium">
                    {format(new Date(currentPhoto.uploadedAt), 'PPP p')}
                  </p>
                </div>
                <div>
                  <p className="text-white/60">Dimensions</p>
                  <p className="font-medium">
                    {currentPhoto.width} × {currentPhoto.height} pixels
                  </p>
                </div>
                <div>
                  <p className="text-white/60">File Size</p>
                  <p className="font-medium">
                    {(currentPhoto.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <div>
                  <p className="text-white/60">Format</p>
                  <p className="font-medium uppercase">{currentPhoto.format}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Thumbnail Strip */}
        <div className="absolute bottom-20 left-0 right-0 flex justify-center space-x-2 px-4">
          {photos.slice(
            Math.max(0, currentIndex - 3),
            Math.min(photos.length, currentIndex + 4)
          ).map((p, i) => {
            const actualIndex = Math.max(0, currentIndex - 3) + i
            return (
              <button
                key={p.id}
                onClick={(e) => {
                  e.stopPropagation()
                  setCurrentIndex(actualIndex)
                  setCurrentPhoto(photos[actualIndex])
                  setZoom(1)
                  setRotation(0)
                }}
                className={`
                  w-16 h-16 rounded-lg overflow-hidden border-2 transition-all
                  ${actualIndex === currentIndex
                    ? 'border-white scale-110'
                    : 'border-white/30 hover:border-white/60'
                  }
                `}
              >
                <img
                  src={p.thumbnailUrl || p.url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </button>
            )
          })}
        </div>

        {/* Counter */}
        <div className="absolute bottom-4 right-4 text-white/60 text-sm">
          {currentIndex + 1} / {photos.length}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default PhotoLightbox
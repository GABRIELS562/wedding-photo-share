import React, { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, CheckCircle, AlertCircle, Heart, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import FocusTrap from 'focus-trap-react'
import toast from 'react-hot-toast'
import { useUploadQueue } from '../../hooks/useUploadQueue'
import UploadQueueList from './UploadQueueList'
import CaptionModal from './CaptionModal'
import { useInView } from 'react-intersection-observer'

interface EnhancedPhotoUploadProps {
  onUploadComplete?: (urls: string[]) => void
  maxFileSize?: number
  maxFiles?: number
}

const EnhancedPhotoUpload: React.FC<EnhancedPhotoUploadProps> = ({
  onUploadComplete,
  maxFileSize = 5 * 1024 * 1024, // 5MB
  maxFiles = 20
}) => {
  const [showCaptionModal, setShowCaptionModal] = useState(false)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [captions, setCaptions] = useState<Map<string, string>>(new Map())
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)

  const { ref: dropzoneRef, inView } = useInView({
    threshold: 0.5,
  })

  const {
    queue,
    stats,
    isProcessing,
    addToQueue,
    processQueue,
    retryUpload,
    cancelUpload,
    clearCompleted,
    updateCaption
  } = useUploadQueue()

  const validateFiles = useCallback((files: File[]): File[] => {
    const validFiles: File[] = []
    const errors: string[] = []

    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        errors.push(`${file.name} is not an image file`)
      } else if (file.size > maxFileSize) {
        errors.push(`${file.name} exceeds ${(maxFileSize / 1024 / 1024).toFixed(1)}MB limit`)
      } else if (queue.length + validFiles.length >= maxFiles) {
        errors.push(`Maximum ${maxFiles} files allowed`)
      } else {
        validFiles.push(file)
      }
    })

    if (errors.length > 0) {
      errors.forEach(error => toast.error(error))
    }

    return validFiles
  }, [maxFileSize, maxFiles, queue.length])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = validateFiles(acceptedFiles)
    if (validFiles.length > 0) {
      setPendingFiles(validFiles)
      setShowCaptionModal(true)
    }
  }, [validateFiles])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.heic', '.heif']
    },
    maxSize: maxFileSize,
    multiple: true,
    noClick: false,
    noKeyboard: false,
  })

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    setTouchStart({ x: touch.clientX, y: touch.clientY })
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return

    const touch = e.changedTouches[0]
    const deltaX = Math.abs(touch.clientX - touchStart.x)
    const deltaY = Math.abs(touch.clientY - touchStart.y)

    if (deltaX < 10 && deltaY < 10) {
      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      if (input) {
        input.click()
      }
    }
    setTouchStart(null)
  }

  const handleCaptionsSubmit = async (submittedCaptions: Map<string, string>) => {
    setCaptions(submittedCaptions)
    const fileIds = await addToQueue(pendingFiles, submittedCaptions)
    setPendingFiles([])
    setShowCaptionModal(false)

    toast.success(
      <div className="flex items-center space-x-2">
        <Sparkles className="h-4 w-4" />
        <span>Added {pendingFiles.length} photos to upload queue</span>
      </div>
    )

    processQueue()
  }

  useEffect(() => {
    const successfulUploads = queue.filter(item => item.status === 'success')
    if (successfulUploads.length > 0 && onUploadComplete) {
      const urls = successfulUploads
        .filter(item => item.uploadedUrl)
        .map(item => item.uploadedUrl!)
      onUploadComplete(urls)
    }
  }, [queue, onUploadComplete])

  const dropzoneClasses = `
    relative border-3 border-dashed rounded-2xl p-8 md:p-12 transition-all duration-300
    ${isDragActive ? 'border-primary-500 bg-primary-50 scale-[1.02]' : 'border-secondary-300 hover:border-primary-400 bg-white/80'}
    ${isDragReject ? 'border-red-500 bg-red-50' : ''}
    backdrop-blur-sm shadow-xl hover:shadow-2xl cursor-pointer
    focus-within:ring-4 focus-within:ring-primary-500/20 focus-within:border-primary-500
  `

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6" ref={dropzoneRef}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 20 }}
        transition={{ duration: 0.5 }}
      >
        <div
          {...getRootProps({
            className: dropzoneClasses,
            onTouchStart: handleTouchStart,
            onTouchEnd: handleTouchEnd,
            role: 'button',
            'aria-label': 'Upload photos dropzone',
            tabIndex: 0
          })}
        >
          <input {...getInputProps({ 'aria-label': 'File input' })} />

          <div className="flex flex-col items-center space-y-6 text-center">
            <motion.div
              animate={{
                scale: isDragActive ? 1.2 : 1,
                rotate: isDragActive ? 10 : 0
              }}
              transition={{ type: "spring", stiffness: 300 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full blur-2xl opacity-20 animate-pulse-slow" />
              <div className="relative bg-gradient-to-br from-pink-100 to-purple-100 p-6 rounded-full">
                {isDragReject ? (
                  <AlertCircle className="h-16 w-16 text-red-500" />
                ) : (
                  <Upload className="h-16 w-16 text-primary-600" />
                )}
              </div>
            </motion.div>

            <div>
              <h3 className="text-2xl font-display font-bold text-secondary-900 mb-2">
                {isDragActive ? '✨ Drop your photos here' : 'Share Your Memories'}
              </h3>
              <p className="text-secondary-600 mb-1">
                Drag & drop photos or tap to select
              </p>
              <p className="text-sm text-secondary-500">
                Max {(maxFileSize / 1024 / 1024).toFixed(0)}MB per photo • Up to {maxFiles} photos
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {['JPEG', 'PNG', 'GIF', 'WebP', 'HEIC'].map(format => (
                <span
                  key={format}
                  className="px-3 py-1 bg-secondary-100 text-secondary-600 text-xs rounded-full"
                >
                  {format}
                </span>
              ))}
            </div>
          </div>

          {isDragActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-purple-500/10 rounded-2xl pointer-events-none"
            />
          )}
        </div>
      </motion.div>

      {queue.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-secondary-900">
                Upload Queue ({queue.length})
              </h3>
              <p className="text-sm text-secondary-600">
                {stats.successCount} completed • {stats.errorCount} failed
              </p>
            </div>
            <div className="flex space-x-2">
              {stats.successCount > 0 && (
                <button
                  onClick={clearCompleted}
                  className="text-sm text-secondary-500 hover:text-secondary-700 transition-colors"
                  aria-label="Clear completed uploads"
                >
                  Clear completed
                </button>
              )}
              {!isProcessing && queue.some(item => item.status === 'pending') && (
                <button
                  onClick={processQueue}
                  className="btn-primary text-sm flex items-center space-x-1"
                  aria-label="Start upload"
                >
                  <Upload className="h-4 w-4" />
                  <span>Start Upload</span>
                </button>
              )}
            </div>
          </div>

          <UploadQueueList
            queue={queue}
            onRetry={retryUpload}
            onCancel={cancelUpload}
            onUpdateCaption={updateCaption}
          />

            {stats.totalFiles > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-r from-wedding-gold-light/20 to-wedding-dusty-light/20 p-4 rounded-xl border border-wedding-gold/20 mt-4"
              >
                <div className="flex justify-between text-sm items-center">
                  <div className="flex items-center space-x-2">
                    <Heart className="h-4 w-4 text-wedding-dusty" />
                    <span className="text-wedding-navy font-accent">Memory Collection Progress</span>
                  </div>
                  <span className="font-display font-medium text-wedding-gold text-lg">
                    {Math.round((stats.successCount / stats.totalFiles) * 100)}%
                  </span>
                </div>
                <div className="mt-3 h-3 bg-wedding-cream/80 rounded-full overflow-hidden elegant-shadow">
                  <motion.div
                    className="h-full bg-gradient-to-r from-wedding-gold to-wedding-dusty relative overflow-hidden"
                    initial={{ width: 0 }}
                    animate={{ width: `${(stats.successCount / stats.totalFiles) * 100}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                  </motion.div>
                </div>
              </motion.div>
            )}
        </motion.div>
      )}

      <AnimatePresence>
        {showCaptionModal && (
          <FocusTrap>
            <CaptionModal
              files={pendingFiles}
              onSubmit={handleCaptionsSubmit}
              onCancel={() => {
                setShowCaptionModal(false)
                setPendingFiles([])
              }}
            />
          </FocusTrap>
        )}
      </AnimatePresence>
    </div>
  )
}

export default EnhancedPhotoUpload
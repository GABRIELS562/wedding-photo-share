import React, { useState, useRef } from 'react'
import { motion, useAnimation, PanInfo } from 'framer-motion'
import { Camera, Image as ImageIcon, X, Check, Plus, Sparkles, Heart } from 'lucide-react'
import toast from 'react-hot-toast'

interface MobileOptimizedUploadProps {
  onFilesSelected: (files: File[]) => void
  maxFiles?: number
  maxFileSize?: number
}

const MobileOptimizedUpload: React.FC<MobileOptimizedUploadProps> = ({
  onFilesSelected,
  maxFiles = 10,
  maxFileSize = 5 * 1024 * 1024
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const controls = useAnimation()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    processFiles(files)
  }

  const processFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`)
        return false
      }
      if (file.size > maxFileSize) {
        toast.error(`${file.name} is too large`)
        return false
      }
      return true
    }).slice(0, maxFiles - selectedFiles.length)

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles])
      toast.success(`Added ${validFiles.length} photo${validFiles.length > 1 ? 's' : ''}`)
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    controls.start({ scale: [1, 0.95, 1] })
  }

  const handleUpload = () => {
    if (selectedFiles.length > 0) {
      onFilesSelected(selectedFiles)
      setSelectedFiles([])
    }
  }

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo, index: number) => {
    if (Math.abs(info.offset.x) > 100) {
      removeFile(index)
    }
  }

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="wedding-glass rounded-2xl elegant-shadow overflow-hidden"
      >
        <div className="p-6 bg-gradient-to-br from-wedding-cream/80 to-wedding-gold-light/20 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5, type: "spring" }}
            className="text-center mb-6"
          >
            <h3 className="text-2xl font-script text-wedding-gold mb-2 sparkle-text">
              Share Your Memories
            </h3>
            <p className="text-sm font-accent text-wedding-navy-light">
              Every photo tells our story
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-white/90 to-wedding-cream/80 rounded-xl elegant-shadow hover:shadow-xl transition-all duration-300 border border-wedding-gold/20"
            >
              <motion.div
                animate={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <ImageIcon className="h-8 w-8 text-wedding-gold mb-2" />
              </motion.div>
              <span className="text-sm font-accent font-medium text-wedding-navy">Gallery</span>
            </motion.button>

            {isMobile && (
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => cameraInputRef.current?.click()}
                className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-white/90 to-wedding-sage-light/20 rounded-xl elegant-shadow hover:shadow-xl transition-all duration-300 border border-wedding-sage/20"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Camera className="h-8 w-8 text-wedding-sage mb-2" />
                </motion.div>
                <span className="text-sm font-accent font-medium text-wedding-navy">Camera</span>
              </motion.button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            aria-label="Select photos from gallery"
          />

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
            aria-label="Take photo with camera"
          />

          {selectedFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-2"
            >
              <div className="flex items-center justify-center space-x-2 mb-3">
                <Heart className="h-4 w-4 text-wedding-dusty" />
                <p className="text-sm font-accent text-wedding-navy">
                  Selected: {selectedFiles.length} / {maxFiles}
                </p>
                <Sparkles className="h-4 w-4 text-wedding-gold animate-sparkle" />
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 custom-scrollbar">
                {selectedFiles.map((file, index) => (
                  <motion.div
                    key={index}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={(event, info) => handleDragEnd(event, info, index)}
                    animate={controls}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-white/95 to-wedding-cream/80 rounded-lg elegant-shadow border border-wedding-gold/10"
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary-100 flex-shrink-0">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-accent font-medium text-wedding-navy truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-wedding-navy-light">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeFile(index)}
                      className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors hover:scale-110"
                      aria-label={`Remove ${file.name}`}
                    >
                      <X className="h-5 w-5" />
                    </motion.button>
                  </motion.div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleUpload}
                className="w-full py-4 bg-gradient-to-r from-wedding-gold to-wedding-dusty text-white font-accent font-medium rounded-xl elegant-shadow hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 shimmer-effect"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Check className="h-5 w-5" />
                </motion.div>
                <span>✨ Upload {selectedFiles.length} Memory{selectedFiles.length > 1 ? 's' : ''} ✨</span>
              </motion.button>
            </motion.div>
          )}

          {selectedFiles.length < maxFiles && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 border-2 border-dashed border-wedding-gold/40 text-wedding-gold font-accent font-medium rounded-xl hover:border-wedding-gold hover:bg-wedding-gold-light/20 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <motion.div
                animate={{ rotate: [0, 90, 180, 270, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Plus className="h-5 w-5" />
              </motion.div>
              <span>Add More Memories</span>
            </motion.button>
          )}
        </div>

        <div className="p-4 bg-gradient-to-r from-wedding-sage-light/10 to-wedding-dusty-light/10">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Sparkles className="h-4 w-4 text-wedding-gold" />
              <span className="text-sm font-script text-wedding-gold">Photo Tips</span>
              <Sparkles className="h-4 w-4 text-wedding-gold" />
            </div>
            <div className="text-xs text-wedding-navy-light font-accent space-y-1">
              <p>📱 Swipe left on photos to remove</p>
              <p>💾 Max {(maxFileSize / 1024 / 1024).toFixed(0)}MB per photo</p>
              <p>🎨 JPEG, PNG, GIF, WebP supported</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default MobileOptimizedUpload
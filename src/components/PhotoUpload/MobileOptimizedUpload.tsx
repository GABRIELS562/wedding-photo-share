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
      // Android compatibility: Check for valid image types
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif']
      const isValidType = file.type.startsWith('image/') || validTypes.some(type => file.type === type)

      // Android sometimes doesn't set file.type correctly, check extension
      const fileName = file.name.toLowerCase()
      const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif']
      const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext))

      if (!isValidType && !hasValidExtension) {
        toast.error(`${file.name} is not a supported image format`)
        return false
      }
      if (file.size > maxFileSize) {
        toast.error(`${file.name} is too large (max ${(maxFileSize / 1024 / 1024).toFixed(0)}MB)`)
        return false
      }
      if (file.size === 0) {
        toast.error(`${file.name} appears to be empty`)
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
            <motion.h3
              className="text-3xl font-script text-transparent bg-clip-text bg-gradient-to-r from-wedding-gold via-wedding-dusty to-wedding-gold mb-3 font-extrabold drop-shadow-lg"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear'
              }}
              style={{
                backgroundSize: '200% 200%'
              }}
            >
              📸 SHARE YOUR MEMORIES 📸
            </motion.h3>
            <motion.p
              className="text-base font-accent text-wedding-navy font-bold"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              👇 Tap a button below to get started 👇
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <motion.button
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fileInputRef.current?.click()}
              animate={{
                boxShadow: [
                  "0 4px 12px rgba(212, 175, 55, 0.3)",
                  "0 6px 18px rgba(212, 175, 55, 0.5)",
                  "0 4px 12px rgba(212, 175, 55, 0.3)"
                ]
              }}
              transition={{
                boxShadow: { duration: 2, repeat: Infinity }
              }}
              className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-wedding-gold/10 via-white to-wedding-cream/80 rounded-2xl elegant-shadow hover:shadow-2xl transition-all duration-300 border-2 border-wedding-gold/40 relative overflow-hidden group"
            >
              <motion.div
                animate={{
                  rotate: [0, -8, 8, 0],
                  scale: [1, 1.15, 1]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <ImageIcon className="h-12 w-12 text-wedding-gold mb-3 drop-shadow-lg" />
              </motion.div>
              <span className="text-lg font-accent font-bold text-wedding-navy drop-shadow-sm">📱 GALLERY</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent group-active:animate-shimmer" />
            </motion.button>

            {isMobile && (
              <motion.button
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => cameraInputRef.current?.click()}
                animate={{
                  boxShadow: [
                    "0 4px 12px rgba(156, 175, 136, 0.3)",
                    "0 6px 18px rgba(156, 175, 136, 0.5)",
                    "0 4px 12px rgba(156, 175, 136, 0.3)"
                  ]
                }}
                transition={{
                  boxShadow: { duration: 2, repeat: Infinity, delay: 0.5 }
                }}
                className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-wedding-sage/10 via-white to-wedding-sage-light/30 rounded-2xl elegant-shadow hover:shadow-2xl transition-all duration-300 border-2 border-wedding-sage/40 relative overflow-hidden group"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Camera className="h-12 w-12 text-wedding-sage mb-3 drop-shadow-lg" />
                </motion.div>
                <span className="text-lg font-accent font-bold text-wedding-navy drop-shadow-sm">📷 CAMERA</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent group-active:animate-shimmer" />
              </motion.button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,image/heic,image/heif,image/jpeg,image/jpg,image/png,image/webp"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            aria-label="Select photos from gallery"
          />

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*,image/heic,image/heif"
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
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleUpload}
                animate={{
                  boxShadow: [
                    "0 8px 20px rgba(212, 175, 55, 0.5)",
                    "0 12px 35px rgba(212, 175, 55, 0.8)",
                    "0 8px 20px rgba(212, 175, 55, 0.5)"
                  ]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-full py-6 mt-4 bg-gradient-to-r from-wedding-gold via-wedding-dusty to-wedding-gold text-white font-accent font-extrabold text-2xl rounded-2xl shadow-2xl flex items-center justify-center space-x-3 border-4 border-white pulse-glow relative overflow-hidden group"
                style={{
                  letterSpacing: '1px',
                  backgroundSize: '200% 100%',
                }}
              >
                <motion.div
                  animate={{
                    scale: [1, 1.4, 1],
                    rotate: [0, 360]
                  }}
                  transition={{
                    scale: { duration: 1, repeat: Infinity },
                    rotate: { duration: 2, repeat: Infinity }
                  }}
                >
                  <Check className="h-8 w-8" />
                </motion.div>
                <span className="drop-shadow-lg relative z-10">🚀 UPLOAD NOW 🚀</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent group-active:animate-shimmer" />
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
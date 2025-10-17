import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, Camera, Info, Users, Sparkles, Star } from 'lucide-react'
import EnhancedPhotoUpload from '../components/PhotoUpload/EnhancedPhotoUpload'
import MobileOptimizedUpload from '../components/PhotoUpload/MobileOptimizedUpload'
import InstallPrompt from '../components/PWA/InstallPrompt'
import { usePhotoContext } from '../context/PhotoContext'
import { Photo } from '../types'
import toast from 'react-hot-toast'

const Upload: React.FC = () => {
  const [uploaderName, setUploaderName] = useState('')
  const [message, setMessage] = useState('')
  const [showNamePrompt, setShowNamePrompt] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const { addPhoto } = usePhotoContext()
  const config = {
    name: 'Kirsten & Dale',
    date: 'October 31, 2024',
    location: 'Cape Point Vineyard, Noordhoek',
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxUploadsPerSession: 60,
    welcomeMessage: 'Help us capture every magical moment of our special day'
  }

  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent))
  }, [])

  const handleUploadComplete = (photo: Photo) => {
    const enrichedPhoto = {
      ...photo,
      uploaderName: uploaderName || 'Guest',
      message: message || '',
    }
    addPhoto(enrichedPhoto)
  }

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (uploaderName.trim()) {
      setShowNamePrompt(false)
      toast.success(`Welcome, ${uploaderName}!`)
    }
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-wedding-gold to-wedding-dusty rounded-full mb-6 elegant-shadow floating-animation"
          >
            <Heart className="h-12 w-12 text-white" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-script wedding-text-gradient mb-4 sparkle-text">
              Kirsten & Dale
            </h1>
            <div className="flex items-center justify-center space-x-3 mb-3">
              <Sparkles className="h-5 w-5 text-wedding-gold animate-sparkle" />
              <p className="text-xl md:text-2xl font-accent text-wedding-navy-light">
                {config.date}
              </p>
              <Sparkles className="h-5 w-5 text-wedding-gold animate-sparkle" style={{animationDelay: '0.5s'}} />
            </div>
            <p className="text-lg text-wedding-sage font-medium">
              {config.location}
            </p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="text-wedding-dusty font-accent italic mt-2 text-lg"
            >
              {config.welcomeMessage}
            </motion.p>
          </motion.div>
        </motion.div>

        {showNamePrompt ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="max-w-md mx-auto card-elegant"
          >
            <div className="flex items-center justify-center space-x-3 mb-6">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Users className="h-7 w-7 text-wedding-gold" />
              </motion.div>
              <h2 className="text-2xl font-display font-medium text-wedding-navy">
                Welcome, Dear Friend!
              </h2>
            </div>
            <p className="text-wedding-navy-light mb-6 text-center font-accent text-lg leading-relaxed">
              Please tell us who you are so we can cherish these precious memories together.
            </p>
            <form onSubmit={handleNameSubmit} className="space-y-5">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Your beautiful name"
                  value={uploaderName}
                  onChange={(e) => setUploaderName(e.target.value)}
                  className="input-field text-center font-accent text-lg"
                  autoFocus
                />
                <Star className="absolute right-3 top-3 h-5 w-5 text-wedding-gold opacity-50" />
              </div>
              <div className="relative">
                <textarea
                  placeholder="Share your wishes for Kirsten & Dale (optional)"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="input-field h-28 resize-none text-center font-accent"
                />
                <Heart className="absolute right-3 top-3 h-5 w-5 text-wedding-dusty opacity-50" />
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full wedding-btn-primary text-lg font-medium"
              >
                ✨ Begin the Memory Journey ✨
              </motion.button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="card-elegant mb-8"
            >
              <div className="text-center">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="inline-block mb-4"
                >
                  <Camera className="h-8 w-8 text-wedding-gold" />
                </motion.div>
                <h2 className="text-2xl font-display font-medium text-wedding-navy mb-3">
                  Welcome, {uploaderName}! 💫
                </h2>
                <p className="text-wedding-navy-light font-accent text-lg leading-relaxed">
                  Your photos will become part of our forever story. Thank you for sharing these precious moments with us.
                  {message && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="block mt-4 p-4 bg-wedding-gold-light/20 rounded-lg text-wedding-navy italic font-script text-xl border border-wedding-gold/20"
                    >
                      "{message}" 💝
                    </motion.span>
                  )}
                </p>
              </div>
            </motion.div>

            {isMobile ? (
              <MobileOptimizedUpload
                onFilesSelected={async (files) => {
                  // Upload each file to Cloudinary
                  for (const file of files) {
                    try {
                      const { uploadToCloudinary } = await import('../services/cloudinary')
                      toast.loading(`Uploading ${file.name}...`, { id: file.name })

                      const photo = await uploadToCloudinary(
                        file,
                        (progress) => {
                          toast.loading(`Uploading ${file.name}: ${progress}%`, { id: file.name })
                        },
                        uploaderName,
                        message
                      )

                      handleUploadComplete(photo)
                      toast.success(`${file.name} uploaded successfully!`, { id: file.name })
                    } catch (error) {
                      const errorMsg = error instanceof Error ? error.message : 'Upload failed'
                      toast.error(`Failed to upload ${file.name}: ${errorMsg}`, { id: file.name })
                      console.error('Upload error:', error)
                    }
                  }
                }}
                maxFiles={config.maxUploadsPerSession}
                maxFileSize={config.maxFileSize}
              />
            ) : (
              <EnhancedPhotoUpload
                onUploadComplete={(urls) => {
                  urls.forEach(url => {
                    const photo: Photo = {
                      id: `photo-${Date.now()}`,
                      url,
                      thumbnailUrl: url,
                      publicId: '',
                      uploadedAt: new Date(),
                      uploaderName,
                      message,
                      width: 0,
                      height: 0,
                      format: 'jpeg',
                      size: 0
                    }
                    handleUploadComplete(photo)
                  })
                }}
                maxFileSize={config.maxFileSize}
                maxFiles={config.maxUploadsPerSession}
              />
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 card bg-gradient-to-br from-wedding-sage-light/20 to-wedding-dusty-light/20 border border-wedding-gold/30"
            >
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <Info className="h-6 w-6 text-wedding-sage" />
                  <h3 className="font-display font-medium text-wedding-navy text-lg">Sharing Guidelines</h3>
                  <Sparkles className="h-5 w-5 text-wedding-gold animate-sparkle" />
                </div>
                <div className="text-wedding-navy-light font-accent space-y-2">
                  <p>📸 Maximum file size: {(config.maxFileSize / 1024 / 1024).toFixed(0)}MB per photo</p>
                  <p>🎥 Videos: 50MB max, 3 videos per session (30-45 seconds)</p>
                  <p>🎨 Supported formats: JPEG, PNG, GIF, WebP, HEIC, MP4, MOV</p>
                  <p>💫 Upload up to {config.maxUploadsPerSession} photos per session</p>
                  <p className="text-sm text-wedding-sage italic mt-3">⚠️ Please keep videos short to help us stay within storage limits!</p>
                  <p>❤️ All photos & videos become part of our wedding album</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-8 text-center"
            >
              <motion.button
                onClick={() => {
                  setShowNamePrompt(true)
                  setUploaderName('')
                  setMessage('')
                }}
                whileHover={{ scale: 1.05 }}
                className="text-wedding-sage hover:text-wedding-gold transition-colors duration-300 font-accent"
              >
                🔄 Switch to Another Guest
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* PWA Install Prompt */}
      <InstallPrompt
        onInstall={() => toast.success('🎉 Wedding Photos app installed!')}
        onDismiss={() => console.log('Install prompt dismissed')}
      />
    </div>
  )
}

export default Upload
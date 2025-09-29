import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, Camera, Upload, Lock, Users, Star } from 'lucide-react'
import { PhotoGallery } from '../components/PhotoGallery'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { getPhotosFromStorage, removePhotoFromStorage } from '../services/storage'
import { Photo } from '../types'
import toast from 'react-hot-toast'

const Gallery: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPhotos()
  }, [])

  const loadPhotos = async () => {
    setLoading(true)
    try {
      const storedPhotos = getPhotosFromStorage()
      setPhotos(storedPhotos)
    } catch (error) {
      console.error('Error loading photos:', error)
      toast.error('Failed to load photos')
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePhoto = (id: string) => {
    if (window.confirm('Are you sure you want to delete this photo?')) {
      removePhotoFromStorage(id)
      setPhotos(prev => prev.filter(p => p.id !== id))
      toast.success('Photo deleted')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-wedding-cream via-white to-wedding-gold-light relative overflow-hidden">
      {/* Elegant background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-wedding-gold rounded-full mix-blend-multiply filter blur-xl animate-float"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-wedding-sage rounded-full mix-blend-multiply filter blur-xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-wedding-dusty rounded-full mix-blend-multiply filter blur-xl animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative z-10 p-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-wedding-gold to-wedding-dusty rounded-full mb-6 shadow-lg"
            >
              <Heart className="h-10 w-10 text-white" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-6xl font-dancing text-wedding-navy mb-3"
            >
              Our Wedding Gallery
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center space-x-4 mb-4"
            >
              <div className="w-12 h-px bg-wedding-gold"></div>
              <Star className="w-4 h-4 text-wedding-gold" />
              <div className="w-12 h-px bg-wedding-gold"></div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xl text-wedding-navy-light font-accent mb-2"
            >
              Kirsten & Dale • October 31, 2024
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-lg text-gray-600 max-w-2xl mx-auto"
            >
              Every moment of love, joy, and celebration captured by our cherished family and friends
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex justify-center items-center space-x-8 mt-6"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-wedding-gold">{photos.length}</div>
                <div className="text-sm text-gray-600 font-accent">Photos</div>
              </div>
              <div className="w-px h-8 bg-wedding-gold/30"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-wedding-sage">{new Set(photos.map(p => p.uploaderName)).size}</div>
                <div className="text-sm text-gray-600 font-accent">Contributors</div>
              </div>
              <div className="w-px h-8 bg-wedding-gold/30"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-wedding-dusty">∞</div>
                <div className="text-sm text-gray-600 font-accent">Memories</div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row justify-center gap-4 mb-8"
          >
            <Link
              to="/upload"
              className="wedding-btn-primary flex items-center justify-center space-x-2 group"
            >
              <Camera className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span>Add Your Photos</span>
            </Link>
            <Link
              to="/admin"
              className="wedding-btn-secondary flex items-center justify-center space-x-2 group"
            >
              <Lock className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span>Couple's Access</span>
            </Link>
          </motion.div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <LoadingSpinner size="large" text="Loading gallery..." />
          </div>
        ) : (
          <PhotoGallery
            photos={photos}
            loading={loading}
            onPhotoDelete={handleDeletePhoto}
          />
        )}

          {!loading && photos.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="inline-flex items-center justify-center w-24 h-24 bg-wedding-cream border-2 border-wedding-gold/20 rounded-full mb-6">
                <Heart className="h-12 w-12 text-wedding-gold" />
              </div>
              <h3 className="text-2xl font-dancing text-wedding-navy mb-3">
                The Gallery Awaits Your Love
              </h3>
              <p className="text-wedding-navy-light max-w-md mx-auto mb-6 font-accent">
                Be the first to share beautiful memories from Kirsten & Dale's special day!
              </p>
              <Link
                to="/upload"
                className="wedding-btn-primary inline-flex items-center space-x-2 group"
              >
                <Camera className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span>Share Your First Photo</span>
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Gallery
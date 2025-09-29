import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, LogOut, QrCode } from 'lucide-react'
import { AdminPanel } from '../components/AdminPanel'
import LoadingSpinner from '../components/common/LoadingSpinner'
import QRCode from 'qrcode'
import {
  isAdminAuthenticated,
  authenticateAdmin,
  logoutAdmin,
  getPhotosFromStorage,
  removePhotoFromStorage,
  clearAllPhotosFromStorage
} from '../services/storage'
import { Photo } from '../types'
import toast from 'react-hot-toast'

const Admin: React.FC = () => {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const isAuth = isAdminAuthenticated()
    setAuthenticated(isAuth)
    if (isAuth) {
      loadPhotos()
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    generateQRCode()
  }, [])

  const generateQRCode = async () => {
    try {
      const uploadUrl = `${window.location.origin}/upload`
      const url = await QRCode.toDataURL(uploadUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      })
      setQrCodeUrl(url)
    } catch (error) {
      console.error('Error generating QR code:', error)
    }
  }

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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (authenticateAdmin(password)) {
      setAuthenticated(true)
      loadPhotos()
      toast.success('Successfully logged in as admin')
    } else {
      toast.error('Invalid admin password')
    }
    setPassword('')
  }

  const handleLogout = () => {
    logoutAdmin()
    setAuthenticated(false)
    toast.success('Logged out successfully')
    navigate('/')
  }

  const handleDeletePhoto = (id: string) => {
    removePhotoFromStorage(id)
    setPhotos(prev => prev.filter(p => p.id !== id))
    toast.success('Photo deleted')
  }

  const handleDeleteAll = () => {
    if (window.confirm('Are you sure you want to delete ALL photos? This action cannot be undone.')) {
      clearAllPhotosFromStorage()
      setPhotos([])
      toast.success('All photos deleted')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading..." />
      </div>
    )
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card max-w-md w-full"
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full">
              <Lock className="h-8 w-8 text-primary-600" />
            </div>
            <h2 className="text-2xl font-display font-bold text-secondary-900">
              Admin Access
            </h2>
            <p className="text-secondary-600">
              Enter the admin password to access the dashboard
            </p>
            <form onSubmit={handleLogin} className="w-full space-y-4">
              <input
                type="password"
                placeholder="Admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                autoFocus
              />
              <button type="submit" className="w-full btn-primary">
                Login
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-end mb-4">
          <button
            onClick={handleLogout}
            className="btn-secondary flex items-center space-x-2"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>

        <AdminPanel
          photos={photos}
          onDeletePhoto={handleDeletePhoto}
          onDeleteAll={handleDeleteAll}
        />

        <motion.div
          id="qr-generator"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-8 card"
        >
          <div className="flex items-center space-x-3 mb-4">
            <QrCode className="h-6 w-6 text-primary-600" />
            <h3 className="text-xl font-medium text-secondary-900">
              QR Code for Guest Upload
            </h3>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              {qrCodeUrl && (
                <img
                  src={qrCodeUrl}
                  alt="QR Code for upload page"
                  className="w-full max-w-[300px] mx-auto"
                />
              )}
            </div>
            <div className="space-y-4">
              <p className="text-secondary-600">
                Share this QR code with your guests so they can easily upload photos.
              </p>
              <div className="bg-secondary-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-secondary-700 mb-2">
                  Upload URL:
                </p>
                <code className="text-xs text-secondary-600 break-all">
                  {window.location.origin}/upload
                </code>
              </div>
              <button
                onClick={() => {
                  const link = document.createElement('a')
                  link.download = 'wedding-photo-upload-qr.png'
                  link.href = qrCodeUrl
                  link.click()
                }}
                className="btn-primary w-full"
              >
                Download QR Code
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Admin
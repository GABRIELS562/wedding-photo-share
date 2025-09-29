import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Settings, Save, Calendar, MapPin, Palette, Type, Upload, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

interface EventConfig {
  eventName: string
  eventDate: string
  eventLocation: string
  primaryColor: string
  secondaryColor: string
  welcomeMessage: string
  maxFileSize: number
  maxUploadsPerSession: number
  requireName: boolean
  enableCaptions: boolean
  autoApprove: boolean
  enableDownloads: boolean
}

const EventConfiguration: React.FC = () => {
  const [config, setConfig] = useState<EventConfig>({
    eventName: '',
    eventDate: '',
    eventLocation: '',
    primaryColor: '#ec4899',
    secondaryColor: '#8b5cf6',
    welcomeMessage: '',
    maxFileSize: 10,
    maxUploadsPerSession: 20,
    requireName: true,
    enableCaptions: true,
    autoApprove: false,
    enableDownloads: true
  })

  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    // Load configuration from environment variables or localStorage
    const savedConfig = localStorage.getItem('eventConfig')
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig))
    } else {
      setConfig({
        eventName: import.meta.env.VITE_EVENT_NAME || 'Wedding Celebration',
        eventDate: import.meta.env.VITE_EVENT_DATE || new Date().toISOString().split('T')[0],
        eventLocation: import.meta.env.VITE_EVENT_LOCATION || 'Beautiful Venue',
        primaryColor: '#ec4899',
        secondaryColor: '#8b5cf6',
        welcomeMessage: 'Welcome to our special day! Share your photos with us.',
        maxFileSize: parseInt(import.meta.env.VITE_MAX_FILE_SIZE || '10485760') / 1024 / 1024,
        maxUploadsPerSession: parseInt(import.meta.env.VITE_MAX_UPLOADS_PER_SESSION || '20'),
        requireName: true,
        enableCaptions: true,
        autoApprove: false,
        enableDownloads: true
      })
    }
  }, [])

  const handleChange = (field: keyof EventConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }))
    setIsDirty(true)
  }

  const handleSave = () => {
    localStorage.setItem('eventConfig', JSON.stringify(config))
    toast.success('Configuration saved successfully!')
    setIsDirty(false)

    // Apply color changes immediately
    document.documentElement.style.setProperty('--color-primary', config.primaryColor)
    document.documentElement.style.setProperty('--color-secondary', config.secondaryColor)
  }

  const handleReset = () => {
    const confirmed = window.confirm('Reset all settings to default?')
    if (confirmed) {
      localStorage.removeItem('eventConfig')
      window.location.reload()
    }
  }

  return (
    <div className="space-y-6">
      {/* Event Details */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Calendar className="h-6 w-6 text-primary-500" />
          <h3 className="text-xl font-medium text-secondary-900">Event Details</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Event Name
            </label>
            <input
              type="text"
              value={config.eventName}
              onChange={(e) => handleChange('eventName', e.target.value)}
              className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="John & Jane's Wedding"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Event Date
            </label>
            <input
              type="date"
              value={config.eventDate}
              onChange={(e) => handleChange('eventDate', e.target.value)}
              className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              <MapPin className="h-4 w-4 inline mr-1" />
              Location
            </label>
            <input
              type="text"
              value={config.eventLocation}
              onChange={(e) => handleChange('eventLocation', e.target.value)}
              className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="The Grand Ballroom, Chicago"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              <Type className="h-4 w-4 inline mr-1" />
              Welcome Message
            </label>
            <textarea
              value={config.welcomeMessage}
              onChange={(e) => handleChange('welcomeMessage', e.target.value)}
              className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
              placeholder="Welcome message for guests..."
            />
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Palette className="h-6 w-6 text-primary-500" />
          <h3 className="text-xl font-medium text-secondary-900">Appearance</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Primary Color
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={config.primaryColor}
                onChange={(e) => handleChange('primaryColor', e.target.value)}
                className="h-10 w-20 border border-secondary-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={config.primaryColor}
                onChange={(e) => handleChange('primaryColor', e.target.value)}
                className="flex-1 px-3 py-2 border border-secondary-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Secondary Color
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={config.secondaryColor}
                onChange={(e) => handleChange('secondaryColor', e.target.value)}
                className="h-10 w-20 border border-secondary-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={config.secondaryColor}
                onChange={(e) => handleChange('secondaryColor', e.target.value)}
                className="flex-1 px-3 py-2 border border-secondary-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-secondary-50 rounded-lg">
          <p className="text-sm text-secondary-600">
            Preview: Your wedding colors will be applied throughout the app
          </p>
          <div className="flex space-x-4 mt-3">
            <div
              className="w-24 h-24 rounded-lg shadow-sm"
              style={{ backgroundColor: config.primaryColor }}
            />
            <div
              className="w-24 h-24 rounded-lg shadow-sm"
              style={{ backgroundColor: config.secondaryColor }}
            />
          </div>
        </div>
      </div>

      {/* Upload Settings */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Upload className="h-6 w-6 text-primary-500" />
          <h3 className="text-xl font-medium text-secondary-900">Upload Settings</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Max File Size (MB)
            </label>
            <input
              type="number"
              value={config.maxFileSize}
              onChange={(e) => handleChange('maxFileSize', parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              min="1"
              max="50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Max Uploads Per Session
            </label>
            <input
              type="number"
              value={config.maxUploadsPerSession}
              onChange={(e) => handleChange('maxUploadsPerSession', parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              min="1"
              max="100"
            />
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.requireName}
              onChange={(e) => handleChange('requireName', e.target.checked)}
              className="w-4 h-4 text-primary-600 rounded"
            />
            <span className="ml-3 text-sm text-secondary-700">
              Require guests to enter their name
            </span>
          </label>

          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.enableCaptions}
              onChange={(e) => handleChange('enableCaptions', e.target.checked)}
              className="w-4 h-4 text-primary-600 rounded"
            />
            <span className="ml-3 text-sm text-secondary-700">
              Allow guests to add captions to photos
            </span>
          </label>

          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.autoApprove}
              onChange={(e) => handleChange('autoApprove', e.target.checked)}
              className="w-4 h-4 text-primary-600 rounded"
            />
            <span className="ml-3 text-sm text-secondary-700">
              Auto-approve all uploaded photos
            </span>
          </label>

          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.enableDownloads}
              onChange={(e) => handleChange('enableDownloads', e.target.checked)}
              className="w-4 h-4 text-primary-600 rounded"
            />
            <span className="ml-3 text-sm text-secondary-700">
              Allow guests to download photos
            </span>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <button
          onClick={handleReset}
          className="px-6 py-2 border border-secondary-300 text-secondary-700 rounded-lg hover:bg-secondary-50"
        >
          Reset to Default
        </button>
        <button
          onClick={handleSave}
          disabled={!isDirty}
          className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <Save className="h-5 w-5" />
          <span>Save Changes</span>
        </button>
      </div>
    </div>
  )
}

export default EventConfiguration
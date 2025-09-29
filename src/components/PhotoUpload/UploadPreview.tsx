import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { motion } from 'framer-motion'

interface UploadPreviewProps {
  file: File
  progress?: number
  onRemove: () => void
  disabled?: boolean
}

const UploadPreview: React.FC<UploadPreviewProps> = ({ file, progress = 0, onRemove, disabled }) => {
  const [preview, setPreview] = useState<string>('')

  useEffect(() => {
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    return () => {
      if (preview) {
        URL.revokeObjectURL(preview)
      }
    }
  }, [file])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="relative group"
    >
      <div className="aspect-square rounded-lg overflow-hidden bg-secondary-100">
        {preview && (
          <img
            src={preview}
            alt={file.name}
            className="w-full h-full object-cover"
          />
        )}
        {progress > 0 && progress < 100 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-white text-sm font-medium">{progress}%</div>
          </div>
        )}
        {progress === 100 && (
          <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center">
            <div className="bg-green-500 text-white rounded-full p-1">
              <svg className="h-6 w-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>
        )}
      </div>
      {!disabled && progress === 0 && (
        <button
          onClick={onRemove}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      <p className="mt-1 text-xs text-secondary-600 truncate">
        {file.name}
      </p>
      <p className="text-xs text-secondary-400">
        {(file.size / 1024 / 1024).toFixed(2)} MB
      </p>
    </motion.div>
  )
}

export default UploadPreview
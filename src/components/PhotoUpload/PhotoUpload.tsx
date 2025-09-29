import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { uploadToCloudinary } from '../../services/cloudinary'
import { usePhotoUpload } from '../../hooks/usePhotoUpload'
import UploadPreview from './UploadPreview'
import UploadProgress from './UploadProgress'
import { Photo } from '../../types'

interface PhotoUploadProps {
  onUploadComplete?: (photo: Photo) => void
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ onUploadComplete }) => {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const { validateFile, getEventConfig } = usePhotoUpload()
  const config = getEventConfig()

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    const validFiles = acceptedFiles.filter(file => {
      const error = validateFile(file)
      if (error) {
        toast.error(error)
        return false
      }
      return true
    })

    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach((file) => {
        const error = file.errors[0]?.message || 'Invalid file'
        toast.error(`${file.file.name}: ${error}`)
      })
    }

    setFiles(prev => [...prev, ...validFiles])
  }, [validateFile])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxSize: config.maxFileSize,
    multiple: true,
  })

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
    setUploadProgress(prev => {
      const newProgress = { ...prev }
      delete newProgress[index.toString()]
      return newProgress
    })
  }

  const uploadFiles = async () => {
    if (files.length === 0) {
      toast.error('Please select files to upload')
      return
    }

    setUploading(true)
    let successCount = 0
    let failCount = 0

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      try {
        setUploadProgress(prev => ({ ...prev, [i]: 0 }))

        const photo = await uploadToCloudinary(
          file,
          (progress) => {
            setUploadProgress(prev => ({ ...prev, [i]: progress }))
          }
        )

        setUploadProgress(prev => ({ ...prev, [i]: 100 }))
        successCount++

        if (onUploadComplete) {
          onUploadComplete(photo)
        }
      } catch (error) {
        console.error('Upload error:', error)
        failCount++
        toast.error(`Failed to upload ${file.name}`)
      }
    }

    setUploading(false)

    if (successCount > 0) {
      toast.success(`Successfully uploaded ${successCount} photo${successCount > 1 ? 's' : ''}`)
      setFiles([])
      setUploadProgress({})
    }

    if (failCount > 0) {
      toast.error(`Failed to upload ${failCount} photo${failCount > 1 ? 's' : ''}`)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 cursor-pointer
          ${isDragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-secondary-300 hover:border-primary-400 bg-white'
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-4">
          <motion.div
            animate={{ scale: isDragActive ? 1.1 : 1 }}
            transition={{ duration: 0.2 }}
          >
            <Upload className="h-16 w-16 text-primary-500" />
          </motion.div>
          <div className="text-center">
            <p className="text-lg font-medium text-secondary-900">
              {isDragActive ? 'Drop your photos here' : 'Drag & drop photos here'}
            </p>
            <p className="mt-1 text-sm text-secondary-500">
              or click to select from your device
            </p>
            <p className="mt-2 text-xs text-secondary-400">
              Supported formats: JPEG, PNG, GIF, WebP (Max {(config.maxFileSize / 1024 / 1024).toFixed(0)}MB per file)
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-secondary-900">
                Selected Photos ({files.length})
              </h3>
              {!uploading && (
                <button
                  onClick={() => {
                    setFiles([])
                    setUploadProgress({})
                  }}
                  className="text-sm text-secondary-500 hover:text-secondary-700"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {files.map((file, index) => (
                <UploadPreview
                  key={index}
                  file={file}
                  progress={uploadProgress[index]}
                  onRemove={() => removeFile(index)}
                  disabled={uploading}
                />
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={uploadFiles}
                disabled={uploading || files.length === 0}
                className="btn-primary flex items-center space-x-2"
              >
                {uploading ? (
                  <>
                    <div className="loading-spinner" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5" />
                    <span>Upload {files.length} Photo{files.length > 1 ? 's' : ''}</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PhotoUpload
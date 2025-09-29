import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, MessageSquare, Save } from 'lucide-react'

interface CaptionModalProps {
  files: File[]
  onSubmit: (captions: Map<string, string>) => void
  onCancel: () => void
}

const CaptionModal: React.FC<CaptionModalProps> = ({ files, onSubmit, onCancel }) => {
  const [captions, setCaptions] = useState<Map<string, string>>(new Map())
  const [currentIndex, setCurrentIndex] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [currentIndex])

  const handleCaptionChange = (fileName: string, caption: string) => {
    const newCaptions = new Map(captions)
    if (caption.trim()) {
      newCaptions.set(fileName, caption)
    } else {
      newCaptions.delete(fileName)
    }
    setCaptions(newCaptions)
  }

  const handleNext = () => {
    if (currentIndex < files.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleSubmit = () => {
    onSubmit(captions)
  }

  const currentFile = files[currentIndex]
  const previewUrl = currentFile ? URL.createObjectURL(currentFile) : null

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={onCancel}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-lg text-secondary-700 hover:bg-white transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <MessageSquare className="h-6 w-6 text-primary-500" />
            <h2 className="text-2xl font-display font-bold text-secondary-900">
              Add Captions (Optional)
            </h2>
          </div>

          {files.length > 1 && (
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-secondary-600">
                Photo {currentIndex + 1} of {files.length}
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  className="px-3 py-1 text-sm bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentIndex === files.length - 1}
                  className="px-3 py-1 text-sm bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {currentFile && previewUrl && (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt={currentFile.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded">
                  {currentFile.name}
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor={`caption-${currentIndex}`}
                className="block text-sm font-medium text-secondary-700 mb-2"
              >
                Caption for this photo
              </label>
              <textarea
                ref={textareaRef}
                id={`caption-${currentIndex}`}
                value={captions.get(currentFile.name) || ''}
                onChange={(e) => handleCaptionChange(currentFile.name, e.target.value)}
                placeholder="Add a message or description..."
                className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                rows={3}
                maxLength={200}
              />
              <p className="mt-1 text-xs text-secondary-500">
                {captions.get(currentFile.name)?.length || 0}/200 characters
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-secondary-700 bg-secondary-100 rounded-lg hover:bg-secondary-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Start Upload</span>
            </button>
          </div>

          {files.length > 1 && (
            <div className="mt-4 flex justify-center space-x-1">
              {files.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex
                      ? 'bg-primary-500'
                      : 'bg-secondary-300 hover:bg-secondary-400'
                  }`}
                  aria-label={`Go to photo ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default CaptionModal
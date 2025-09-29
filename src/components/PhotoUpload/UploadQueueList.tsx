import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, RefreshCw, CheckCircle, AlertCircle, Loader2, Edit2, Image as ImageIcon } from 'lucide-react'
import { UploadQueueItem } from '../../types/upload'

interface UploadQueueListProps {
  queue: UploadQueueItem[]
  onRetry: (id: string) => void
  onCancel: (id: string) => void
  onUpdateCaption: (id: string, caption: string) => void
}

const UploadQueueList: React.FC<UploadQueueListProps> = ({
  queue,
  onRetry,
  onCancel,
  onUpdateCaption
}) => {
  const getStatusIcon = (status: UploadQueueItem['status']) => {
    switch (status) {
      case 'compressing':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
      case 'uploading':
        return <Loader2 className="h-5 w-5 text-primary-500 animate-spin" />
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <ImageIcon className="h-5 w-5 text-secondary-400" />
    }
  }

  const getStatusText = (item: UploadQueueItem) => {
    switch (item.status) {
      case 'pending':
        return 'Waiting...'
      case 'compressing':
        return `Compressing... ${item.progress}%`
      case 'uploading':
        return `Uploading... ${item.progress}%`
      case 'success':
        return 'Complete'
      case 'error':
        return item.error || 'Failed'
      default:
        return ''
    }
  }

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(2)} MB`
  }

  return (
    <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
      <AnimatePresence mode="popLayout">
        {queue.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start space-x-4">
              <div className="relative flex-shrink-0">
                {item.thumbnailUrl && (
                  <img
                    src={item.thumbnailUrl}
                    alt={item.file.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                )}
                {(item.status === 'compressing' || item.status === 'uploading') && (
                  <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-medium">
                      {item.progress}%
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-secondary-900 truncate">
                      {item.file.name}
                    </h4>
                    <p className="text-xs text-secondary-500 mt-1">
                      {formatFileSize(item.file.size)}
                      {item.compressedFile && (
                        <span className="text-green-600 ml-1">
                          → {formatFileSize(item.compressedFile.size)}
                        </span>
                      )}
                    </p>
                    {item.caption && (
                      <p className="text-xs text-secondary-600 mt-1 italic truncate">
                        "{item.caption}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {getStatusIcon(item.status)}

                    <div className="flex items-center space-x-1">
                      {item.status === 'error' && (
                        <button
                          onClick={() => onRetry(item.id)}
                          className="p-1 text-secondary-500 hover:text-primary-600 transition-colors"
                          aria-label="Retry upload"
                          title="Retry upload"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                      )}

                      {item.status === 'pending' && (
                        <button
                          onClick={() => {
                            const newCaption = prompt('Edit caption:', item.caption || '')
                            if (newCaption !== null) {
                              onUpdateCaption(item.id, newCaption)
                            }
                          }}
                          className="p-1 text-secondary-500 hover:text-primary-600 transition-colors"
                          aria-label="Edit caption"
                          title="Edit caption"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      )}

                      {(item.status === 'pending' || item.status === 'error') && (
                        <button
                          onClick={() => onCancel(item.id)}
                          className="p-1 text-secondary-500 hover:text-red-600 transition-colors"
                          aria-label="Remove from queue"
                          title="Remove from queue"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-2">
                  <p className="text-xs text-secondary-500">
                    {getStatusText(item)}
                    {item.retryCount > 0 && (
                      <span className="ml-1 text-orange-600">
                        (Retry {item.retryCount}/{3})
                      </span>
                    )}
                  </p>

                  {(item.status === 'compressing' || item.status === 'uploading') && (
                    <div className="mt-2 h-1.5 bg-secondary-100 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${
                          item.status === 'compressing'
                            ? 'bg-blue-500'
                            : 'bg-gradient-to-r from-primary-500 to-purple-500'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${item.progress}%` }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default UploadQueueList
import { useState, useCallback, useRef } from 'react'
import { UploadQueueItem, UploadStats } from '../types/upload'
import { compressImage, shouldCompress, generateThumbnail } from '../services/imageCompression'
import { uploadToCloudinary } from '../services/cloudinary'
import { v4 as uuidv4 } from 'uuid'

const MAX_CONCURRENT_UPLOADS = 3
const MAX_RETRY_ATTEMPTS = 3
const RETRY_DELAY = 2000

export const useUploadQueue = () => {
  const [queue, setQueue] = useState<Map<string, UploadQueueItem>>(new Map())
  const [isProcessing, setIsProcessing] = useState(false)
  const [stats, setStats] = useState<UploadStats>({
    totalFiles: 0,
    successCount: 0,
    errorCount: 0,
    totalSize: 0,
    uploadedSize: 0,
    averageCompressionRatio: 0,
    estimatedTimeRemaining: 0
  })

  const processingRef = useRef<Set<string>>(new Set())
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map())

  const addToQueue = useCallback(async (files: File[], captions?: Map<string, string>) => {
    const newItems: UploadQueueItem[] = []

    for (const file of files) {
      const id = uuidv4()
      const thumbnailUrl = await generateThumbnail(file)

      const item: UploadQueueItem = {
        id,
        file,
        originalFile: file,
        caption: captions?.get(file.name),
        status: 'pending',
        progress: 0,
        retryCount: 0,
        priority: Date.now(),
        thumbnailUrl
      }

      newItems.push(item)
    }

    setQueue(prev => {
      const newQueue = new Map(prev)
      newItems.forEach(item => newQueue.set(item.id, item))
      return newQueue
    })

    setStats(prev => ({
      ...prev,
      totalFiles: prev.totalFiles + newItems.length,
      totalSize: prev.totalSize + newItems.reduce((sum, item) => sum + item.file.size, 0)
    }))

    return newItems.map(item => item.id)
  }, [])

  const compressFile = async (item: UploadQueueItem): Promise<File> => {
    if (!shouldCompress(item.file)) {
      return item.file
    }

    setQueue(prev => {
      const newQueue = new Map(prev)
      const updatedItem = { ...item, status: 'compressing' as const, progress: 0 }
      newQueue.set(item.id, updatedItem)
      return newQueue
    })

    const compressedFile = await compressImage(
      item.file,
      {
        maxSizeMB: 2,
        maxWidthOrHeight: 2048,
      },
      (progress) => {
        setQueue(prev => {
          const newQueue = new Map(prev)
          const currentItem = newQueue.get(item.id)
          if (currentItem) {
            newQueue.set(item.id, { ...currentItem, progress: progress * 0.3 })
          }
          return newQueue
        })
      }
    )

    return compressedFile
  }

  const uploadFile = async (item: UploadQueueItem): Promise<void> => {
    const abortController = new AbortController()
    abortControllersRef.current.set(item.id, abortController)

    try {
      const compressedFile = await compressFile(item)

      setQueue(prev => {
        const newQueue = new Map(prev)
        const updatedItem = { ...item, status: 'uploading' as const, compressedFile }
        newQueue.set(item.id, updatedItem)
        return newQueue
      })

      const photo = await uploadToCloudinary(
        compressedFile,
        (progress) => {
          setQueue(prev => {
            const newQueue = new Map(prev)
            const currentItem = newQueue.get(item.id)
            if (currentItem) {
              newQueue.set(item.id, { ...currentItem, progress: 30 + (progress * 0.7) })
            }
            return newQueue
          })
        }
      )

      setQueue(prev => {
        const newQueue = new Map(prev)
        newQueue.set(item.id, {
          ...item,
          status: 'success',
          progress: 100,
          uploadedUrl: photo.url,
          publicId: photo.publicId,
          endTime: new Date()
        })
        return newQueue
      })

      setStats(prev => ({
        ...prev,
        successCount: prev.successCount + 1,
        uploadedSize: prev.uploadedSize + compressedFile.size
      }))

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'

      if (item.retryCount < MAX_RETRY_ATTEMPTS) {
        setTimeout(() => {
          retryUpload(item.id)
        }, RETRY_DELAY * (item.retryCount + 1))
      } else {
        setQueue(prev => {
          const newQueue = new Map(prev)
          newQueue.set(item.id, {
            ...item,
            status: 'error',
            error: errorMessage,
            endTime: new Date()
          })
          return newQueue
        })

        setStats(prev => ({
          ...prev,
          errorCount: prev.errorCount + 1
        }))
      }
    } finally {
      abortControllersRef.current.delete(item.id)
      processingRef.current.delete(item.id)
    }
  }

  const processQueue = useCallback(async () => {
    if (isProcessing) return

    setIsProcessing(true)

    while (true) {
      const pendingItems = Array.from(queue.values())
        .filter(item => item.status === 'pending' && !processingRef.current.has(item.id))
        .sort((a, b) => a.priority - b.priority)
        .slice(0, MAX_CONCURRENT_UPLOADS - processingRef.current.size)

      if (pendingItems.length === 0) {
        if (processingRef.current.size === 0) {
          break
        }
        await new Promise(resolve => setTimeout(resolve, 100))
        continue
      }

      const uploadPromises = pendingItems.map(item => {
        processingRef.current.add(item.id)
        item.startTime = new Date()
        return uploadFile(item)
      })

      await Promise.allSettled(uploadPromises)
    }

    setIsProcessing(false)
  }, [queue, isProcessing])

  const retryUpload = useCallback((id: string) => {
    setQueue(prev => {
      const newQueue = new Map(prev)
      const item = newQueue.get(id)
      if (item) {
        newQueue.set(id, {
          ...item,
          status: 'pending',
          retryCount: item.retryCount + 1,
          error: undefined
        })
      }
      return newQueue
    })
  }, [])

  const cancelUpload = useCallback((id: string) => {
    const controller = abortControllersRef.current.get(id)
    if (controller) {
      controller.abort()
    }

    setQueue(prev => {
      const newQueue = new Map(prev)
      newQueue.delete(id)
      return newQueue
    })

    processingRef.current.delete(id)
  }, [])

  const clearCompleted = useCallback(() => {
    setQueue(prev => {
      const newQueue = new Map(prev)
      Array.from(newQueue.entries()).forEach(([id, item]) => {
        if (item.status === 'success') {
          newQueue.delete(id)
        }
      })
      return newQueue
    })
  }, [])

  const updateCaption = useCallback((id: string, caption: string) => {
    setQueue(prev => {
      const newQueue = new Map(prev)
      const item = newQueue.get(id)
      if (item) {
        newQueue.set(id, { ...item, caption })
      }
      return newQueue
    })
  }, [])

  return {
    queue: Array.from(queue.values()),
    stats,
    isProcessing,
    addToQueue,
    processQueue,
    retryUpload,
    cancelUpload,
    clearCompleted,
    updateCaption
  }
}
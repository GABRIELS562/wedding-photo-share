import imageCompression from 'browser-image-compression'

export interface CompressionOptions {
  maxSizeMB?: number
  maxWidthOrHeight?: number
  useWebWorker?: boolean
  maxIteration?: number
  initialQuality?: number
  fileType?: string
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxSizeMB: 2,
  maxWidthOrHeight: 2048,
  useWebWorker: true,
  maxIteration: 10,
  initialQuality: 0.8,
  fileType: 'image/jpeg'
}

export const compressImage = async (
  file: File,
  options: CompressionOptions = {},
  onProgress?: (progress: number) => void
): Promise<File> => {
  const compressionOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
    onProgress: (progress: number) => {
      if (onProgress) {
        onProgress(Math.round(progress))
      }
    }
  }

  try {
    const compressedFile = await imageCompression(file, compressionOptions)

    const sizeDiff = ((file.size - compressedFile.size) / file.size) * 100
    console.log(`Image compressed: ${sizeDiff.toFixed(2)}% size reduction`)

    return compressedFile
  } catch (error) {
    console.error('Image compression failed:', error)
    return file
  }
}

export const compressMultipleImages = async (
  files: File[],
  options: CompressionOptions = {},
  onProgress?: (totalProgress: number, fileIndex: number) => void
): Promise<File[]> => {
  const compressedFiles: File[] = []
  const fileCount = files.length

  for (let i = 0; i < fileCount; i++) {
    const file = files[i]

    const compressedFile = await compressImage(
      file,
      options,
      (progress) => {
        const totalProgress = ((i * 100) + progress) / fileCount
        if (onProgress) {
          onProgress(Math.round(totalProgress), i)
        }
      }
    )

    compressedFiles.push(compressedFile)
  }

  return compressedFiles
}

export const shouldCompress = (file: File): boolean => {
  const MAX_SIZE_WITHOUT_COMPRESSION = 500 * 1024 // 500KB
  const COMPRESSIBLE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

  return file.size > MAX_SIZE_WITHOUT_COMPRESSION &&
         COMPRESSIBLE_TYPES.includes(file.type)
}

export const estimateCompressionTime = (file: File): number => {
  const MB = file.size / (1024 * 1024)
  const baseTime = 500 // milliseconds
  const timePerMB = 300 // milliseconds per MB

  return Math.round(baseTime + (MB * timePerMB))
}

export const generateThumbnail = async (
  file: File,
  maxSize: number = 200
): Promise<string> => {
  const options = {
    maxSizeMB: 0.1,
    maxWidthOrHeight: maxSize,
    useWebWorker: true,
  }

  try {
    const thumbnailFile = await imageCompression(file, options)
    return URL.createObjectURL(thumbnailFile)
  } catch (error) {
    console.error('Thumbnail generation failed:', error)
    return URL.createObjectURL(file)
  }
}
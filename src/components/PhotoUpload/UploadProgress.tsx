import React from 'react'
import { motion } from 'framer-motion'

interface UploadProgressProps {
  progress: number
  fileName: string
}

const UploadProgress: React.FC<UploadProgressProps> = ({ progress, fileName }) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-secondary-700 truncate max-w-xs">
          {fileName}
        </span>
        <span className="text-sm font-medium text-primary-600">
          {progress}%
        </span>
      </div>
      <div className="w-full bg-secondary-200 rounded-full h-2 overflow-hidden">
        <motion.div
          className="bg-gradient-to-r from-primary-400 to-primary-600 h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

export default UploadProgress
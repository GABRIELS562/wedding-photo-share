import React from 'react'
import { motion } from 'framer-motion'

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  text?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'medium', text }) => {
  const sizeClasses = {
    small: 'h-8 w-8',
    medium: 'h-12 w-12',
    large: 'h-16 w-16',
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className={`${sizeClasses[size]} border-4 border-primary-200 border-t-primary-500 rounded-full`}
      />
      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-secondary-600 font-medium"
        >
          {text}
        </motion.p>
      )}
    </div>
  )
}

export default LoadingSpinner
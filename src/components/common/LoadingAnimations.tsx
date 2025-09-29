import React from 'react'
import { motion } from 'framer-motion'
import { Heart, Camera, Sparkles } from 'lucide-react'

export const HeartLoader: React.FC = () => {
  return (
    <div className="flex items-center justify-center p-8">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative"
      >
        <Heart className="h-12 w-12 text-pink-500 fill-pink-500" />
        <motion.div
          className="absolute inset-0"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0, 0.5]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Heart className="h-12 w-12 text-pink-300" />
        </motion.div>
      </motion.div>
    </div>
  )
}

export const CameraShutter: React.FC = () => {
  return (
    <div className="flex items-center justify-center p-8">
      <motion.div className="relative">
        <Camera className="h-16 w-16 text-secondary-700" />
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{
            scale: [0, 1.5, 0],
            opacity: [1, 0, 1]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="w-4 h-4 bg-white rounded-full" />
        </motion.div>
        <motion.div
          className="absolute -inset-4 border-2 border-secondary-300 rounded-full"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0, 0.3],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </motion.div>
    </div>
  )
}

export const SparkleLoader: React.FC = () => {
  const sparkles = Array.from({ length: 5 })

  return (
    <div className="flex items-center justify-center p-8">
      <div className="relative">
        <Sparkles className="h-12 w-12 text-yellow-500" />
        {sparkles.map((_, index) => (
          <motion.div
            key={index}
            className="absolute"
            initial={{
              x: 0,
              y: 0,
              scale: 0,
              opacity: 1
            }}
            animate={{
              x: [0, (index - 2) * 20],
              y: [0, -30, 0],
              scale: [0, 1, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: index * 0.2,
              ease: "easeOut"
            }}
          >
            <div className="w-2 h-2 bg-yellow-400 rounded-full" />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export const UploadProgressAnimation: React.FC<{ progress: number }> = ({ progress }) => {
  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full -rotate-90">
        <circle
          cx="64"
          cy="64"
          r="56"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          className="text-secondary-200"
        />
        <motion.circle
          cx="64"
          cy="64"
          r="56"
          stroke="url(#gradient)"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: progress / 100 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{
            strokeDasharray: 352,
            strokeDashoffset: 0
          }}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-secondary-900">{progress}%</span>
      </div>
    </div>
  )
}

export const PhotoStackLoader: React.FC = () => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="relative w-20 h-20">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="absolute inset-0 bg-white rounded-lg shadow-lg border-2 border-secondary-200"
            initial={{
              rotate: index * 10,
              scale: 1 - index * 0.1
            }}
            animate={{
              rotate: [index * 10, index * 10 + 360],
              scale: [1 - index * 0.1, 1, 1 - index * 0.1]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: index * 0.3,
              ease: "easeInOut"
            }}
          >
            <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center">
              <ImageIcon className="h-8 w-8 text-primary-500" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export const SuccessAnimation: React.FC = () => {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20
      }}
      className="flex items-center justify-center p-8"
    >
      <div className="relative">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ duration: 0.5 }}
          className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center"
        >
          <motion.svg
            className="w-12 h-12 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <motion.path
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              d="M5 13l4 4L19 7"
            />
          </motion.svg>
        </motion.div>

        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute inset-0 flex items-center justify-center"
            initial={{ scale: 0, rotate: 0 }}
            animate={{
              scale: [0, 1, 0],
              rotate: [0, 180],
            }}
            transition={{
              duration: 1,
              delay: 0.5 + i * 0.1,
              ease: "easeOut"
            }}
          >
            <div
              className="absolute w-2 h-2 bg-green-400 rounded-full"
              style={{
                top: '20%',
                transform: `rotate(${i * 60}deg) translateY(-40px)`
              }}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

export const ErrorAnimation: React.FC = () => {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="flex items-center justify-center p-8"
    >
      <motion.div
        animate={{
          x: [0, -10, 10, -10, 10, 0],
        }}
        transition={{
          duration: 0.5,
          ease: "easeInOut"
        }}
        className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center"
      >
        <svg
          className="w-12 h-12 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </motion.div>
    </motion.div>
  )
}

export const EmptyStateAnimation: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <motion.div
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative"
      >
        <div className="w-32 h-32 bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-2xl flex items-center justify-center">
          <Camera className="h-16 w-16 text-secondary-400" />
        </div>
        <motion.div
          className="absolute -top-2 -right-2"
          animate={{
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        >
          <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold">
            ?
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

const LoadingAnimations = {
  HeartLoader,
  CameraShutter,
  SparkleLoader,
  UploadProgressAnimation,
  PhotoStackLoader,
  SuccessAnimation,
  ErrorAnimation,
  EmptyStateAnimation
}

export default LoadingAnimations
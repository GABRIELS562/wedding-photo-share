import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Crown, Eye, EyeOff, Lock, Heart, Sparkles } from 'lucide-react'
import { useAdmin } from '../../contexts/AdminContext'

const AdminLogin: React.FC = () => {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const { login } = useAdmin()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const success = await login(password)
      if (!success) {
        setAttempts(prev => prev + 1)
        setPassword('')
      }
    } catch (error) {
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const isBlocked = attempts >= 3

  return (
    <div className="min-h-screen bg-gradient-to-br from-wedding-cream via-white to-wedding-gold-light flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-wedding-gold/10 rounded-full mix-blend-multiply filter blur-xl animate-float"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-wedding-sage/10 rounded-full mix-blend-multiply filter blur-xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-wedding-dusty/10 rounded-full mix-blend-multiply filter blur-xl animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="card-elegant p-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-center mb-8"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-wedding-gold to-wedding-dusty rounded-full mb-4 elegant-shadow"
            >
              <Crown className="h-10 w-10 text-white" />
            </motion.div>

            <h1 className="text-3xl font-script text-wedding-gold mb-2 sparkle-text">
              Admin Portal
            </h1>
            <p className="text-wedding-navy-light font-accent">
              Welcome back, Kirsten & Dale
            </p>
            <div className="flex items-center justify-center space-x-2 mt-2">
              <Heart className="h-4 w-4 text-wedding-dusty" />
              <span className="text-sm text-wedding-sage font-accent">
                Manage your wedding memories
              </span>
              <Heart className="h-4 w-4 text-wedding-dusty" />
            </div>
          </motion.div>

          {/* Login Form */}
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Password Field */}
            <div className="relative">
              <label className="block text-sm font-accent font-medium text-wedding-navy mb-2">
                Admin Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-wedding-gold" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 pr-12 text-center font-accent"
                  placeholder="Enter your admin password"
                  disabled={isBlocked || isLoading}
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-wedding-sage hover:text-wedding-gold transition-colors"
                  disabled={isBlocked || isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Messages */}
            {attempts > 0 && attempts < 3 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-red-600 text-sm font-accent text-center">
                  Invalid password. {3 - attempts} attempt{3 - attempts !== 1 ? 's' : ''} remaining.
                </p>
              </motion.div>
            )}

            {isBlocked && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-red-600 text-sm font-accent text-center">
                  Access blocked due to multiple failed attempts. Please refresh the page to try again.
                </p>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isBlocked || isLoading || !password.trim()}
              whileHover={{ scale: isBlocked || isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isBlocked || isLoading ? 1 : 0.98 }}
              className="w-full btn-primary text-lg font-accent shimmer-effect disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Crown className="h-5 w-5" />
                  <span>✨ Enter Admin Portal ✨</span>
                </div>
              )}
            </motion.button>
          </motion.form>

          {/* Security Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-6 p-4 bg-wedding-sage-light/20 rounded-lg border border-wedding-sage/20"
          >
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Sparkles className="h-4 w-4 text-wedding-sage" />
              <span className="text-sm font-accent font-medium text-wedding-navy">
                Secure Access
              </span>
            </div>
            <p className="text-xs text-wedding-navy-light font-accent text-center leading-relaxed">
              This admin portal is protected and secure. Only authorized users can access
              your wedding photo collection and management features.
            </p>
          </motion.div>

          {/* Help Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-4 text-center"
          >
            <button
              onClick={() => window.location.href = '/'}
              className="text-sm text-wedding-sage hover:text-wedding-gold transition-colors font-accent"
            >
              ← Back to Photo Gallery
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default AdminLogin
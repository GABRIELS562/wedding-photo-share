import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X, Smartphone, Heart } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

interface InstallPromptProps {
  onInstall?: () => void
  onDismiss?: () => void
}

const InstallPrompt: React.FC<InstallPromptProps> = ({ onInstall, onDismiss }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isIOSStandalone = (window.navigator as any).standalone === true

    if (isStandalone || isIOSStandalone) {
      setIsInstalled(true)
      return
    }

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOS(iOS)

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)

      // Show prompt after a delay to not be intrusive
      setTimeout(() => {
        if (!localStorage.getItem('pwa-install-dismissed')) {
          setShowPrompt(true)
        }
      }, 3000)
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowPrompt(false)
      onInstall?.()
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [onInstall])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === 'accepted') {
        console.log('User accepted the install prompt')
        onInstall?.()
      } else {
        console.log('User dismissed the install prompt')
        onDismiss?.()
      }
    } catch (error) {
      console.error('Error during installation:', error)
    }

    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa-install-dismissed', 'true')
    onDismiss?.()
  }

  if (isInstalled || !showPrompt) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50"
      >
        <div className="bg-white border border-wedding-gold rounded-2xl shadow-xl overflow-hidden backdrop-blur-md">
          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-wedding-gold/10 rounded-lg">
                  <Heart className="w-5 h-5 text-wedding-gold" />
                </div>
                <div>
                  <h3 className="font-playfair font-semibold text-wedding-navy">
                    Install Wedding Photos
                  </h3>
                  <p className="text-sm text-gray-600">
                    Get the full experience
                  </p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Smartphone className="w-4 h-4 text-wedding-sage" />
                <span>Works offline</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Download className="w-4 h-4 text-wedding-sage" />
                <span>Fast & convenient</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Heart className="w-4 h-4 text-wedding-dusty" />
                <span>App-like experience</span>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              {isIOS ? (
                <div className="text-sm text-gray-600">
                  Tap <span className="font-semibold">Share</span> → <span className="font-semibold">Add to Home Screen</span>
                </div>
              ) : (
                <>
                  <button
                    onClick={handleInstallClick}
                    className="flex-1 bg-wedding-gold text-white px-4 py-2 rounded-lg font-medium hover:bg-wedding-gold-dark transition-colors"
                  >
                    Install App
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Maybe Later
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default InstallPrompt
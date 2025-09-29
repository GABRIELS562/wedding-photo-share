import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export interface ServiceWorkerStatus {
  isSupported: boolean
  isRegistered: boolean
  isUpdating: boolean
  needsRefresh: boolean
  registration: ServiceWorkerRegistration | null
}

export const useServiceWorker = () => {
  const [status, setStatus] = useState<ServiceWorkerStatus>({
    isSupported: 'serviceWorker' in navigator,
    isRegistered: false,
    isUpdating: false,
    needsRefresh: false,
    registration: null,
  })

  useEffect(() => {
    if (!status.isSupported) {
      console.log('Service workers not supported')
      return
    }

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        })

        setStatus(prev => ({
          ...prev,
          isRegistered: true,
          registration
        }))

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (!newWorker) return

          setStatus(prev => ({ ...prev, isUpdating: true }))

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setStatus(prev => ({
                ...prev,
                isUpdating: false,
                needsRefresh: true
              }))

              toast((t) => (
                <div className="flex items-center gap-3">
                  <span>✨ New version available!</span>
                  <button
                    onClick={() => {
                      toast.dismiss(t.id)
                      updateApp()
                    }}
                    className="bg-wedding-gold text-white px-3 py-1 rounded text-sm font-medium"
                  >
                    Update
                  </button>
                </div>
              ), {
                duration: 10000,
                id: 'sw-update'
              })
            }
          })
        })

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          const { type, data } = event.data

          switch (type) {
            case 'UPLOAD_QUEUED':
              toast.success('📤 Photo queued for upload when online', {
                icon: '📱',
                duration: 3000
              })
              break

            case 'UPLOADS_SYNCED':
              if (data.count > 0) {
                toast.success(`✅ ${data.count} photos synced successfully!`, {
                  icon: '☁️',
                  duration: 4000
                })
              }
              break

            case 'CACHE_UPDATED':
              console.log('Cache updated:', data)
              break

            default:
              console.log('Unknown SW message:', type, data)
          }
        })

        console.log('Wedding Photos SW: Service worker registered successfully! 💒✨')

      } catch (error) {
        console.error('Wedding Photos SW: Service worker registration failed:', error)
        toast.error('Failed to enable offline features')
      }
    }

    registerSW()
  }, [status.isSupported])

  const updateApp = async () => {
    if (!status.registration) return

    // Tell the waiting service worker to skip waiting
    if (status.registration.waiting) {
      status.registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    }

    // Reload the page to use the new service worker
    window.location.reload()
  }

  const checkForUpdates = async () => {
    if (status.registration) {
      try {
        await status.registration.update()
      } catch (error) {
        console.error('Failed to check for updates:', error)
      }
    }
  }

  const getAppVersion = async (): Promise<string> => {
    return new Promise((resolve) => {
      if (!status.registration) {
        resolve('unknown')
        return
      }

      const messageChannel = new MessageChannel()
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data.version || 'unknown')
      }

      status.registration.active?.postMessage(
        { type: 'GET_VERSION' },
        [messageChannel.port2]
      )
    })
  }

  const clearCache = async (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!status.registration) {
        resolve(false)
        return
      }

      const messageChannel = new MessageChannel()
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data.success || false)
      }

      status.registration.active?.postMessage(
        { type: 'CLEAR_CACHE' },
        [messageChannel.port2]
      )
    })
  }

  return {
    ...status,
    updateApp,
    checkForUpdates,
    getAppVersion,
    clearCache,
  }
}
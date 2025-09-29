// Wedding Photo Share Service Worker
// Provides offline functionality, caching, and background sync

const CACHE_NAME = 'wedding-photos-v1.2.0'
const RUNTIME_CACHE = 'wedding-photos-runtime'
const UPLOAD_QUEUE_STORE = 'upload-queue'
const NETWORK_TIMEOUT = 5000

// Core app files to cache immediately
const PRECACHE_ASSETS = [
  '/',
  '/upload',
  '/gallery',
  '/manifest.json',
  '/offline.html',
  // Add your built CSS and JS files here
  // These will be added automatically by the build process
]

// Runtime caching patterns
const RUNTIME_CACHING = [
  {
    urlPattern: /^https:\/\/fonts\.googleapis\.com/,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'google-fonts-stylesheets',
      expiration: {
        maxEntries: 10,
        maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
      }
    }
  },
  {
    urlPattern: /^https:\/\/fonts\.gstatic\.com/,
    handler: 'CacheFirst',
    options: {
      cacheName: 'google-fonts-webfonts',
      expiration: {
        maxEntries: 30,
        maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
      }
    }
  },
  {
    urlPattern: /^https:\/\/res\.cloudinary\.com/,
    handler: 'CacheFirst',
    options: {
      cacheName: 'cloudinary-images',
      expiration: {
        maxEntries: 200,
        maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
      }
    }
  }
]

// Install event - precache core assets
self.addEventListener('install', event => {
  console.log('Wedding Photos SW: Installing...')

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Wedding Photos SW: Precaching core assets')
        return cache.addAll(PRECACHE_ASSETS)
      })
      .then(() => {
        console.log('Wedding Photos SW: Installation complete')
        // Force activation of new service worker
        return self.skipWaiting()
      })
  )
})

// Activate event - cleanup old caches
self.addEventListener('activate', event => {
  console.log('Wedding Photos SW: Activating...')

  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => {
              return cacheName.startsWith('wedding-photos-') &&
                     cacheName !== CACHE_NAME &&
                     cacheName !== RUNTIME_CACHE
            })
            .map(cacheName => {
              console.log('Wedding Photos SW: Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            })
        )
      }),

      // Take control of all clients
      self.clients.claim()
    ])
  )
})

// Fetch event - network first for API, cache first for assets
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return
  }

  // Handle API requests (Cloudinary uploads)
  if (url.hostname === 'api.cloudinary.com') {
    event.respondWith(handleApiRequest(request))
    return
  }

  // Handle image requests (Cloudinary CDN)
  if (url.hostname === 'res.cloudinary.com') {
    event.respondWith(handleImageRequest(request))
    return
  }

  // Handle app navigation
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request))
    return
  }

  // Handle static assets
  event.respondWith(handleStaticAssets(request))
})

// Handle API requests with network first strategy
async function handleApiRequest(request) {
  try {
    // Try network first
    const networkResponse = await Promise.race([
      fetch(request),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Network timeout')), NETWORK_TIMEOUT)
      )
    ])

    if (networkResponse.ok) {
      return networkResponse
    }

    throw new Error(`API request failed: ${networkResponse.status}`)
  } catch (error) {
    console.log('Wedding Photos SW: API request failed, queueing for retry:', error)

    // Queue upload for background sync if it's a POST request
    if (request.method === 'POST') {
      await queueFailedUpload(request)
    }

    // Return offline response
    return new Response(
      JSON.stringify({
        error: 'Offline - request queued for retry',
        queued: true,
        timestamp: Date.now()
      }),
      {
        status: 202,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// Handle image requests with cache first strategy
async function handleImageRequest(request) {
  try {
    const cache = await caches.open(RUNTIME_CACHE)
    const cachedResponse = await cache.match(request)

    if (cachedResponse) {
      // Return cached version and update in background
      fetchAndCache(request, cache)
      return cachedResponse
    }

    // Not in cache, fetch from network
    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      // Cache the response for future use
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    console.log('Wedding Photos SW: Image request failed:', error)

    // Return placeholder image for failed image requests
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="#f3f4f6"/><text x="200" y="150" text-anchor="middle" fill="#9ca3af" font-family="Arial" font-size="16">Image Offline</text></svg>',
      {
        headers: { 'Content-Type': 'image/svg+xml' }
      }
    )
  }
}

// Handle navigation requests (app routes)
async function handleNavigationRequest(request) {
  try {
    // Try network first for navigation
    const networkResponse = await Promise.race([
      fetch(request),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Network timeout')), NETWORK_TIMEOUT)
      )
    ])

    if (networkResponse.ok) {
      return networkResponse
    }

    throw new Error(`Navigation failed: ${networkResponse.status}`)
  } catch (error) {
    console.log('Wedding Photos SW: Navigation request failed, serving from cache:', error)

    const cache = await caches.open(CACHE_NAME)

    // Try to serve the specific route from cache
    const cachedResponse = await cache.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // Fallback to main app shell
    const appShell = await cache.match('/')
    if (appShell) {
      return appShell
    }

    // Ultimate fallback to offline page
    return cache.match('/offline.html') || new Response('Offline')
  }
}

// Handle static assets with cache first strategy
async function handleStaticAssets(request) {
  const cache = await caches.open(CACHE_NAME)
  const cachedResponse = await cache.match(request)

  if (cachedResponse) {
    return cachedResponse
  }

  try {
    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      // Cache static assets for future use
      const responseClone = networkResponse.clone()
      cache.put(request, responseClone)
    }

    return networkResponse
  } catch (error) {
    console.log('Wedding Photos SW: Static asset request failed:', error)
    return new Response('Asset unavailable offline')
  }
}

// Background fetch and cache helper
async function fetchAndCache(request, cache) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      cache.put(request, response.clone())
    }
  } catch (error) {
    console.log('Wedding Photos SW: Background fetch failed:', error)
  }
}

// Queue failed upload for background sync
async function queueFailedUpload(request) {
  try {
    // Clone the request to read the body
    const clonedRequest = request.clone()
    const formData = await clonedRequest.formData()

    // Store upload data in IndexedDB
    const uploadData = {
      id: Date.now().toString(),
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      formData: formData,
      timestamp: Date.now(),
      retryCount: 0
    }

    // In a real implementation, you'd store this in IndexedDB
    console.log('Wedding Photos SW: Queued upload for retry:', uploadData)

    // Register for background sync
    await self.registration.sync.register('upload-retry')

    // Notify the client about the queued upload
    const clients = await self.clients.matchAll()
    clients.forEach(client => {
      client.postMessage({
        type: 'UPLOAD_QUEUED',
        data: uploadData
      })
    })
  } catch (error) {
    console.error('Wedding Photos SW: Failed to queue upload:', error)
  }
}

// Background sync event - retry failed uploads
self.addEventListener('sync', event => {
  if (event.tag === 'upload-retry') {
    console.log('Wedding Photos SW: Background sync triggered for upload retry')
    event.waitUntil(retryQueuedUploads())
  }
})

// Retry queued uploads
async function retryQueuedUploads() {
  try {
    // In a real implementation, you'd retrieve queued uploads from IndexedDB
    // and retry them here
    console.log('Wedding Photos SW: Retrying queued uploads...')

    // Notify clients about successful retries
    const clients = await self.clients.matchAll()
    clients.forEach(client => {
      client.postMessage({
        type: 'UPLOADS_SYNCED',
        data: { count: 0 } // Replace with actual retry count
      })
    })
  } catch (error) {
    console.error('Wedding Photos SW: Failed to retry uploads:', error)
  }
}

// Handle push notifications (for future use)
self.addEventListener('push', event => {
  console.log('Wedding Photos SW: Push notification received')

  const options = {
    body: event.data ? event.data.text() : 'New wedding photos available!',
    icon: '/icons/icon-192.png',
    badge: '/icons/badge.png',
    tag: 'wedding-notification',
    data: {
      url: '/gallery'
    },
    actions: [
      {
        action: 'view',
        title: 'View Photos',
        icon: '/icons/view-action.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification('Wedding Photos', options)
  )
})

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('Wedding Photos SW: Notification clicked')

  event.notification.close()

  if (event.action === 'view' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/gallery')
    )
  }
})

// Handle messages from the main app
self.addEventListener('message', event => {
  console.log('Wedding Photos SW: Message received:', event.data)

  switch (event.data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting()
      break

    case 'GET_VERSION':
      event.ports[0].postMessage({ version: CACHE_NAME })
      break

    case 'CLEAR_CACHE':
      event.waitUntil(
        caches.delete(RUNTIME_CACHE).then(() => {
          event.ports[0].postMessage({ success: true })
        })
      )
      break

    default:
      console.log('Wedding Photos SW: Unknown message type:', event.data.type)
  }
})

// Cleanup and optimization
self.addEventListener('periodicsync', event => {
  if (event.tag === 'cleanup') {
    event.waitUntil(performCleanup())
  }
})

async function performCleanup() {
  console.log('Wedding Photos SW: Performing periodic cleanup...')

  try {
    // Clean up old cache entries
    const cache = await caches.open(RUNTIME_CACHE)
    const requests = await cache.keys()

    const now = Date.now()
    const oneDay = 24 * 60 * 60 * 1000

    for (const request of requests) {
      const response = await cache.match(request)
      if (response) {
        const dateHeader = response.headers.get('date')
        if (dateHeader) {
          const age = now - new Date(dateHeader).getTime()
          if (age > oneDay * 7) { // Remove entries older than 7 days
            await cache.delete(request)
          }
        }
      }
    }

    console.log('Wedding Photos SW: Cleanup completed')
  } catch (error) {
    console.error('Wedding Photos SW: Cleanup failed:', error)
  }
}

console.log('Wedding Photos SW: Service Worker loaded successfully! 💒✨')
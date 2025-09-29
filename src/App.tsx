import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { motion } from 'framer-motion'
import Upload from './pages/Upload'
import Gallery from './pages/Gallery'
import Admin from './pages/Admin'
import ErrorBoundary from './components/common/ErrorBoundary'
import AccessibilityWrapper from './components/common/AccessibilityWrapper'
import { PhotoProvider } from './context/PhotoContext'
import { useServiceWorker } from './hooks/useServiceWorker'

const App: React.FC = () => {
  const serviceWorker = useServiceWorker()

  return (
    <ErrorBoundary>
      <AccessibilityWrapper>
        <PhotoProvider>
          <Router>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="min-h-screen bg-gradient-to-br from-wedding-cream via-white to-wedding-gold-light relative overflow-hidden"
            >
              {/* Elegant background pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-0 w-96 h-96 bg-wedding-gold rounded-full mix-blend-multiply filter blur-xl animate-float"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-wedding-sage rounded-full mix-blend-multiply filter blur-xl animate-float" style={{animationDelay: '2s'}}></div>
                <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-wedding-dusty rounded-full mix-blend-multiply filter blur-xl animate-float" style={{animationDelay: '4s'}}></div>
              </div>
              <Toaster
                position="top-center"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'rgba(44, 62, 80, 0.95)',
                    color: '#fff',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    borderRadius: '12px',
                    fontFamily: 'Montserrat, sans-serif',
                  },
                  success: {
                    style: {
                      background: 'rgba(156, 175, 136, 0.95)',
                      color: '#fff',
                    },
                  },
                  error: {
                    style: {
                      background: 'rgba(220, 53, 69, 0.95)',
                      color: '#fff',
                    },
                  },
                }}
              />
              <div className="relative z-10">
                <Routes>
                  <Route path="/" element={<Navigate to="/upload" replace />} />
                  <Route path="/upload" element={<Upload />} />
                  <Route path="/gallery" element={<Gallery />} />
                  <Route path="/admin" element={<Admin />} />
                </Routes>
              </div>
            </motion.div>
        </Router>
      </PhotoProvider>
      </AccessibilityWrapper>
    </ErrorBoundary>
  )
}

export default App
import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Maximize2, Minimize2 } from 'lucide-react'

interface AccessibilityWrapperProps {
  children: React.ReactNode
}

const AccessibilityWrapper: React.FC<AccessibilityWrapperProps> = ({ children }) => {
  const [highContrast, setHighContrast] = useState(false)
  const [largeText, setLargeText] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [showControls, setShowControls] = useState(false)

  useEffect(() => {
    const savedPreferences = localStorage.getItem('accessibility-preferences')
    if (savedPreferences) {
      const prefs = JSON.parse(savedPreferences)
      setHighContrast(prefs.highContrast || false)
      setLargeText(prefs.largeText || false)
      setReducedMotion(prefs.reducedMotion || false)
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    const preferences = { highContrast, largeText, reducedMotion }
    localStorage.setItem('accessibility-preferences', JSON.stringify(preferences))

    document.documentElement.classList.toggle('high-contrast', highContrast)
    document.documentElement.classList.toggle('large-text', largeText)
    document.documentElement.classList.toggle('reduced-motion', reducedMotion)
  }, [highContrast, largeText, reducedMotion])

  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.altKey && e.shiftKey && e.key === 'A') {
        setShowControls(prev => !prev)
      }
    }

    document.addEventListener('keydown', handleKeyboard)
    return () => document.removeEventListener('keydown', handleKeyboard)
  }, [])

  return (
    <>
      <div className="skip-to-content">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-primary-600 text-white px-4 py-2 rounded-lg"
        >
          Skip to main content
        </a>
      </div>

      <div id="main-content">
        {children}
      </div>

      <button
        onClick={() => setShowControls(!showControls)}
        className="fixed bottom-4 right-4 z-40 p-3 bg-white shadow-lg rounded-full hover:shadow-xl transition-shadow"
        aria-label="Accessibility controls"
        title="Press Alt+Shift+A to toggle"
      >
        <Eye className="h-5 w-5 text-secondary-700" />
      </button>

      {showControls && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-20 right-4 z-40 bg-white rounded-xl shadow-2xl p-6 w-80"
        >
          <h3 className="text-lg font-medium text-secondary-900 mb-4">
            Accessibility Options
          </h3>

          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-secondary-700">High Contrast</span>
              <button
                onClick={() => setHighContrast(!highContrast)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  highContrast ? 'bg-primary-600' : 'bg-secondary-300'
                }`}
                role="switch"
                aria-checked={highContrast}
                aria-label="Toggle high contrast mode"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    highContrast ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-secondary-700">Large Text</span>
              <button
                onClick={() => setLargeText(!largeText)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  largeText ? 'bg-primary-600' : 'bg-secondary-300'
                }`}
                role="switch"
                aria-checked={largeText}
                aria-label="Toggle large text"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    largeText ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-secondary-700">Reduce Motion</span>
              <button
                onClick={() => setReducedMotion(!reducedMotion)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  reducedMotion ? 'bg-primary-600' : 'bg-secondary-300'
                }`}
                role="switch"
                aria-checked={reducedMotion}
                aria-label="Toggle reduced motion"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    reducedMotion ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>
          </div>

          <div className="mt-4 pt-4 border-t border-secondary-200">
            <p className="text-xs text-secondary-600">
              Press <kbd className="px-1 py-0.5 bg-secondary-100 rounded text-xs">Alt</kbd> +
              <kbd className="px-1 py-0.5 bg-secondary-100 rounded text-xs ml-1">Shift</kbd> +
              <kbd className="px-1 py-0.5 bg-secondary-100 rounded text-xs ml-1">A</kbd> to toggle
            </p>
          </div>
        </motion.div>
      )}

      <style jsx global>{`
        .high-contrast {
          filter: contrast(1.2);
        }

        .high-contrast img {
          filter: contrast(1.1);
        }

        .high-contrast .btn-primary {
          background-color: #000 !important;
          color: #fff !important;
          border: 2px solid #fff !important;
        }

        .high-contrast .btn-secondary {
          background-color: #fff !important;
          color: #000 !important;
          border: 2px solid #000 !important;
        }

        .large-text {
          font-size: 110%;
        }

        .large-text h1 {
          font-size: 3rem;
        }

        .large-text h2 {
          font-size: 2.5rem;
        }

        .large-text h3 {
          font-size: 2rem;
        }

        .reduced-motion * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }

        @media (prefers-contrast: high) {
          :root {
            --primary-color: #000;
            --secondary-color: #fff;
          }
        }

        :focus-visible {
          outline: 3px solid #ec4899;
          outline-offset: 2px;
        }

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }

        .focus\\:not-sr-only:focus {
          position: absolute;
          width: auto;
          height: auto;
          padding: 0;
          margin: 0;
          overflow: visible;
          clip: auto;
          white-space: normal;
        }
      `}</style>
    </>
  )
}

export default AccessibilityWrapper
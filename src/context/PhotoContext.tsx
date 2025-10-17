import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { Photo } from '../types'

interface PhotoContextType {
  photos: Photo[]
  loading: boolean
  addPhoto: (photo: Photo) => void
  updatePhoto: (photo: Photo) => void
  removePhoto: (id: string) => void
  setPhotos: (photos: Photo[]) => void
  refreshPhotos: () => Promise<void>
}

const PhotoContext = createContext<PhotoContextType | undefined>(undefined)

export const usePhotoContext = () => {
  const context = useContext(PhotoContext)
  if (!context) {
    throw new Error('usePhotoContext must be used within a PhotoProvider')
  }
  return context
}

interface PhotoProviderProps {
  children: ReactNode
}

export const PhotoProvider: React.FC<PhotoProviderProps> = ({ children }) => {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(false)

  const addPhoto = useCallback((photo: Photo) => {
    setPhotos(prev => [...prev, photo])
  }, [])

  const updatePhoto = useCallback((photo: Photo) => {
    setPhotos(prev => prev.map(p => p.id === photo.id ? photo : p))
  }, [])

  const removePhoto = useCallback((id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id))
  }, [])

  const refreshPhotos = useCallback(async () => {
    setLoading(true)
    try {
      const storedPhotos = localStorage.getItem('wedding-photos')
      if (storedPhotos) {
        setPhotos(JSON.parse(storedPhotos))
      }
    } catch (error) {
      console.error('Error refreshing photos:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <PhotoContext.Provider value={{ photos, loading, addPhoto, updatePhoto, removePhoto, setPhotos, refreshPhotos }}>
      {children}
    </PhotoContext.Provider>
  )
}
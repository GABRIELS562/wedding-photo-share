import React from 'react'
import { Check, Download, Trash2 } from 'lucide-react'
import { Photo } from '../../types'

interface BulkActionsProps {
  photos: Photo[]
  selectedPhotos: Set<string>
  onSelectPhoto: (id: string) => void
  onSelectAll: () => void
  onDownloadSelected: () => void
  onDeleteSelected: () => void
  downloading: boolean
}

const BulkActions: React.FC<BulkActionsProps> = ({
  photos,
  selectedPhotos,
  onSelectPhoto,
  onSelectAll,
  onDownloadSelected,
  onDeleteSelected,
  downloading
}) => {
  if (photos.length === 0) return null

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-secondary-900">
          Photo Management
        </h3>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedPhotos.size === photos.length && photos.length > 0}
              onChange={onSelectAll}
              className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-secondary-600">
              Select All ({selectedPhotos.size}/{photos.length})
            </span>
          </label>
          {selectedPhotos.size > 0 && (
            <div className="flex items-center space-x-2">
              <button
                onClick={onDownloadSelected}
                disabled={downloading}
                className="btn-secondary flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Download Selected</span>
              </button>
              <button
                onClick={onDeleteSelected}
                className="bg-red-100 text-red-700 font-medium py-2 px-4 rounded-lg hover:bg-red-200 transition-colors flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete Selected</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="relative group cursor-pointer"
            onClick={() => onSelectPhoto(photo.id)}
          >
            <div className="aspect-square rounded-lg overflow-hidden bg-secondary-100">
              <img
                src={photo.thumbnailUrl || photo.url}
                alt="Wedding photo"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div
              className={`
                absolute inset-0 rounded-lg transition-all duration-200
                ${selectedPhotos.has(photo.id)
                  ? 'bg-primary-600/30 ring-2 ring-primary-600'
                  : 'bg-black/0 hover:bg-black/20'
                }
              `}
            >
              {selectedPhotos.has(photo.id) && (
                <div className="absolute top-2 right-2 bg-primary-600 text-white rounded-full p-1">
                  <Check className="h-4 w-4" />
                </div>
              )}
            </div>
            {photo.uploaderName && (
              <p className="mt-1 text-xs text-secondary-600 truncate">
                {photo.uploaderName}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default BulkActions
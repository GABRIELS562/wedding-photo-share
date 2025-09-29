import React from 'react'
import { Search, Grid, List, SortAsc } from 'lucide-react'

interface GalleryFilterProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  sortBy: 'date' | 'name'
  onSortChange: (value: 'date' | 'name') => void
  view: 'grid' | 'list'
  onViewChange: (value: 'grid' | 'list') => void
  totalPhotos: number
}

const GalleryFilter: React.FC<GalleryFilterProps> = ({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  view,
  onViewChange,
  totalPhotos
}) => {
  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search by name or message..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="input-field pl-10"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" />
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as 'date' | 'name')}
            className="input-field"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
          </select>

          <div className="flex bg-secondary-100 rounded-lg p-1">
            <button
              onClick={() => onViewChange('grid')}
              className={`p-2 rounded transition-colors ${
                view === 'grid'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-secondary-600 hover:text-secondary-900'
              }`}
              title="Grid view"
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => onViewChange('list')}
              className={`p-2 rounded transition-colors ${
                view === 'list'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-secondary-600 hover:text-secondary-900'
              }`}
              title="List view"
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-secondary-600">
          Showing {totalPhotos} photo{totalPhotos !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  )
}

export default GalleryFilter
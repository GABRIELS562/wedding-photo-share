import React from 'react'
import { motion } from 'framer-motion'
import { X, Calendar, User, Tag } from 'lucide-react'

interface FilterPanelProps {
  filters: {
    dateRange: { start: Date | null; end: Date | null }
    uploaders: string[]
    tags: string[]
  }
  onFiltersChange: (filters: any) => void
  availableUploaders: string[]
  onClose: () => void
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  availableUploaders,
  onClose
}) => {
  const handleDateChange = (type: 'start' | 'end', value: string) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [type]: value ? new Date(value) : null
      }
    })
  }

  const handleUploaderToggle = (uploader: string) => {
    const newUploaders = filters.uploaders.includes(uploader)
      ? filters.uploaders.filter(u => u !== uploader)
      : [...filters.uploaders, uploader]

    onFiltersChange({
      ...filters,
      uploaders: newUploaders
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      dateRange: { start: null, end: null },
      uploaders: [],
      tags: []
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl shadow-lg p-6 mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-secondary-900">Filters</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={clearFilters}
            className="text-sm text-secondary-500 hover:text-secondary-700"
          >
            Clear all
          </button>
          <button
            onClick={onClose}
            className="p-1 text-secondary-500 hover:text-secondary-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Date Range */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Calendar className="h-4 w-4 text-secondary-500" />
            <h4 className="font-medium text-secondary-900">Date Range</h4>
          </div>
          <div className="space-y-2">
            <input
              type="date"
              value={filters.dateRange.start?.toISOString().split('T')[0] || ''}
              onChange={(e) => handleDateChange('start', e.target.value)}
              className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Start date"
            />
            <input
              type="date"
              value={filters.dateRange.end?.toISOString().split('T')[0] || ''}
              onChange={(e) => handleDateChange('end', e.target.value)}
              className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="End date"
            />
          </div>
        </div>

        {/* Uploaders */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <User className="h-4 w-4 text-secondary-500" />
            <h4 className="font-medium text-secondary-900">Uploaders</h4>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {availableUploaders.map(uploader => (
              <label key={uploader} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.uploaders.includes(uploader)}
                  onChange={() => handleUploaderToggle(uploader)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-secondary-700">{uploader}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Tag className="h-4 w-4 text-secondary-500" />
            <h4 className="font-medium text-secondary-900">Tags</h4>
          </div>
          <p className="text-sm text-secondary-500">
            Tags feature coming soon
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default FilterPanel
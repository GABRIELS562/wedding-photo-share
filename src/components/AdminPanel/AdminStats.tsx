import React from 'react'
import { Camera, Users, HardDrive, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { Photo } from '../../types'

interface AdminStatsProps {
  photos: Photo[]
}

const AdminStats: React.FC<AdminStatsProps> = ({ photos }) => {
  const totalSize = photos.reduce((sum, photo) => sum + photo.size, 0)
  const uniqueUploaders = new Set(photos.map(p => p.uploaderName).filter(Boolean)).size
  const latestUpload = photos.length > 0
    ? Math.max(...photos.map(p => new Date(p.uploadedAt).getTime()))
    : null

  const stats = [
    {
      label: 'Total Photos',
      value: photos.length.toString(),
      icon: Camera,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Unique Uploaders',
      value: uniqueUploaders.toString(),
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Total Storage',
      value: `${(totalSize / 1024 / 1024).toFixed(1)} MB`,
      icon: HardDrive,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Latest Upload',
      value: latestUpload ? format(new Date(latestUpload), 'MMM dd, h:mm a') : 'No uploads',
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">{stat.label}</p>
              <p className="mt-2 text-2xl font-bold text-secondary-900">{stat.value}</p>
            </div>
            <div className={`${stat.bgColor} p-3 rounded-lg`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default AdminStats
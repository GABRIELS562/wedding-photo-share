import React, { useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { format, startOfDay, eachDayOfInterval, subDays } from 'date-fns'
import { Photo } from '../../types'
import { TrendingUp, Users, Calendar, HardDrive } from 'lucide-react'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

interface AnalyticsDashboardProps {
  photos: Photo[]
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ photos }) => {
  // Upload trend data (last 7 days)
  const uploadTrendData = useMemo(() => {
    const days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date()
    })

    const uploadsByDay = days.map(day => {
      const dayStart = startOfDay(day)
      const dayEnd = new Date(dayStart)
      dayEnd.setHours(23, 59, 59, 999)

      const count = photos.filter(p => {
        const uploadDate = new Date(p.uploadedAt)
        return uploadDate >= dayStart && uploadDate <= dayEnd
      }).length

      return {
        date: format(day, 'MMM dd'),
        count
      }
    })

    return {
      labels: uploadsByDay.map(d => d.date),
      datasets: [{
        label: 'Photos Uploaded',
        data: uploadsByDay.map(d => d.count),
        borderColor: 'rgb(236, 72, 153)',
        backgroundColor: 'rgba(236, 72, 153, 0.1)',
        tension: 0.4
      }]
    }
  }, [photos])

  // Uploads by hour
  const uploadsByHourData = useMemo(() => {
    const hourCounts = new Array(24).fill(0)

    photos.forEach(photo => {
      const hour = new Date(photo.uploadedAt).getHours()
      hourCounts[hour]++
    })

    return {
      labels: Array.from({ length: 24 }, (_, i) =>
        i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`
      ),
      datasets: [{
        label: 'Uploads by Hour',
        data: hourCounts,
        backgroundColor: 'rgba(139, 92, 246, 0.5)',
        borderColor: 'rgb(139, 92, 246)',
        borderWidth: 1
      }]
    }
  }, [photos])

  // Top uploaders
  const topUploadersData = useMemo(() => {
    const uploaderCounts = photos.reduce((acc, photo) => {
      const uploader = photo.uploaderName || 'Anonymous'
      acc[uploader] = (acc[uploader] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const sorted = Object.entries(uploaderCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)

    return {
      labels: sorted.map(([name]) => name),
      datasets: [{
        label: 'Photos',
        data: sorted.map(([, count]) => count),
        backgroundColor: [
          'rgba(236, 72, 153, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(251, 146, 60, 0.8)'
        ]
      }]
    }
  }, [photos])

  // File size distribution
  const fileSizeData = useMemo(() => {
    const sizes = {
      'Small (<1MB)': 0,
      'Medium (1-3MB)': 0,
      'Large (3-5MB)': 0,
      'Very Large (>5MB)': 0
    }

    photos.forEach(photo => {
      const sizeMB = photo.size / (1024 * 1024)
      if (sizeMB < 1) sizes['Small (<1MB)']++
      else if (sizeMB < 3) sizes['Medium (1-3MB)']++
      else if (sizeMB < 5) sizes['Large (3-5MB)']++
      else sizes['Very Large (>5MB)']++
    })

    return {
      labels: Object.keys(sizes),
      datasets: [{
        data: Object.values(sizes),
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ]
      }]
    }
  }, [photos])

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const
      }
    }
  }

  const insights = useMemo(() => {
    const totalSize = photos.reduce((sum, p) => sum + p.size, 0)
    const avgSize = photos.length > 0 ? totalSize / photos.length : 0
    const uniqueUploaders = new Set(photos.map(p => p.uploaderName).filter(Boolean)).size
    const avgPhotosPerUser = photos.length > 0 ? photos.length / uniqueUploaders : 0

    const peakHour = uploadsByHourData.datasets[0].data
      .reduce((max, count, hour) => count > max.count ? { hour, count } : max, { hour: 0, count: 0 })

    return {
      avgSize,
      avgPhotosPerUser,
      peakHour: peakHour.hour
    }
  }, [photos, uploadsByHourData])

  return (
    <div className="space-y-6">
      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <InsightCard
          icon={TrendingUp}
          label="Avg Photos/Day"
          value={(photos.length / 7).toFixed(1)}
        />
        <InsightCard
          icon={Users}
          label="Avg Photos/Guest"
          value={insights.avgPhotosPerUser.toFixed(1)}
        />
        <InsightCard
          icon={Calendar}
          label="Peak Upload Hour"
          value={`${insights.peakHour > 12 ? insights.peakHour - 12 : insights.peakHour} ${insights.peakHour >= 12 ? 'PM' : 'AM'}`}
        />
        <InsightCard
          icon={HardDrive}
          label="Avg File Size"
          value={`${(insights.avgSize / 1024 / 1024).toFixed(1)} MB`}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Trend */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-medium text-secondary-900 mb-4">Upload Trend</h3>
          <div className="h-64">
            <Line data={uploadTrendData} options={chartOptions} />
          </div>
        </div>

        {/* Uploads by Hour */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-medium text-secondary-900 mb-4">Activity by Hour</h3>
          <div className="h-64">
            <Bar data={uploadsByHourData} options={chartOptions} />
          </div>
        </div>

        {/* Top Uploaders */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-medium text-secondary-900 mb-4">Top Contributors</h3>
          <div className="h-64">
            <Doughnut data={topUploadersData} options={chartOptions} />
          </div>
        </div>

        {/* File Size Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-medium text-secondary-900 mb-4">File Size Distribution</h3>
          <div className="h-64">
            <Doughnut data={fileSizeData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-medium text-secondary-900 mb-4">Recent Activity</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {photos.slice(0, 10).map(photo => (
            <div key={photo.id} className="flex items-center space-x-4 p-3 hover:bg-secondary-50 rounded-lg">
              <img
                src={photo.thumbnailUrl || photo.url}
                alt=""
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="flex-1">
                <p className="font-medium text-secondary-900">{photo.uploaderName || 'Anonymous'}</p>
                <p className="text-sm text-secondary-600">
                  {format(new Date(photo.uploadedAt), 'PPp')}
                </p>
              </div>
              <span className="text-sm text-secondary-500">
                {(photo.size / 1024 / 1024).toFixed(1)} MB
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

interface InsightCardProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}

const InsightCard: React.FC<InsightCardProps> = ({ icon: Icon, label, value }) => (
  <div className="bg-white rounded-lg shadow-sm p-4">
    <div className="flex items-center space-x-3">
      <div className="p-2 bg-primary-50 rounded-lg">
        <Icon className="h-5 w-5 text-primary-600" />
      </div>
      <div>
        <p className="text-sm text-secondary-600">{label}</p>
        <p className="text-xl font-bold text-secondary-900">{value}</p>
      </div>
    </div>
  </div>
)

export default AnalyticsDashboard
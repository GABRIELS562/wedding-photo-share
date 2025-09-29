import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Crown,
  LogOut,
  Image,
  Users,
  Download,
  BarChart3,
  Settings,
  Heart,
  Sparkles,
  Calendar,
  HardDrive,
  TrendingUp,
  Activity,
  Bell,
  Shield
} from 'lucide-react'
import { useAdmin } from '../../contexts/AdminContext'
import { AdminDashboardStats } from '../../types/admin'
import PhotoGalleryManager from './PhotoGalleryManager'
import AdminAnalytics from './AdminAnalytics'
import BulkOperations from './BulkOperations'
import PhotoModeration from './PhotoModeration'
import AdminSettings from './AdminSettings'
import toast from 'react-hot-toast'

type AdminTab = 'overview' | 'gallery' | 'analytics' | 'bulk' | 'moderation' | 'settings'

const AdminDashboard: React.FC = () => {
  const { state, logout, refreshSession } = useAdmin()
  const [activeTab, setActiveTab] = useState<AdminTab>('overview')
  const [dashboardStats, setDashboardStats] = useState<AdminDashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardStats()
    const interval = setInterval(() => {
      refreshSession()
      loadDashboardStats()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const loadDashboardStats = async () => {
    try {
      // Simulate loading dashboard stats (replace with actual API call)
      const stats: AdminDashboardStats = {
        totalPhotos: 127,
        totalGuests: 23,
        totalStorage: '2.3 GB',
        recentUploads: 12,
        topUploaders: [
          { name: 'Sarah Johnson', count: 15, percentage: 25 },
          { name: 'Mike Chen', count: 12, percentage: 20 },
          { name: 'Emily Davis', count: 10, percentage: 17 },
          { name: 'David Wilson', count: 8, percentage: 13 },
          { name: 'Others', count: 15, percentage: 25 },
        ],
        uploadTimeline: [
          { date: '2024-10-12', count: 45 },
          { date: '2024-10-13', count: 32 },
          { date: '2024-10-14', count: 28 },
          { date: '2024-10-15', count: 22 },
        ],
        storageBreakdown: [
          { category: 'Photos', size: 2.1, percentage: 91 },
          { category: 'Thumbnails', size: 0.15, percentage: 7 },
          { category: 'Metadata', size: 0.05, percentage: 2 },
        ],
      }

      setDashboardStats(stats)
    } catch (error) {
      console.error('Failed to load dashboard stats:', error)
      toast.error('Failed to load dashboard statistics')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'gallery', label: 'Photo Gallery', icon: Image },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'bulk', label: 'Bulk Operations', icon: Download },
    { id: 'moderation', label: 'Moderation', icon: Shield },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-wedding-cream via-white to-wedding-gold-light flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card-elegant p-8 text-center"
        >
          <div className="w-16 h-16 border-4 border-wedding-gold/20 border-t-wedding-gold rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-wedding-navy font-accent">Loading admin dashboard...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-wedding-cream via-white to-wedding-gold-light">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm border-b border-wedding-gold/20 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Title */}
            <div className="flex items-center space-x-3">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="w-10 h-10 bg-gradient-to-br from-wedding-gold to-wedding-dusty rounded-full flex items-center justify-center"
              >
                <Crown className="h-6 w-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-script text-wedding-gold">
                  Wedding Admin Portal
                </h1>
                <p className="text-sm text-wedding-navy-light font-accent">
                  Kirsten & Dale's Memory Collection
                </p>
              </div>
            </div>

            {/* Session Info & Logout */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-right">
                <p className="text-sm font-accent text-wedding-navy">
                  Welcome back! 👑
                </p>
                <p className="text-xs text-wedding-navy-light">
                  Session: {state.session?.id.slice(0, 8)}...
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-wedding-sage/20 text-wedding-sage rounded-lg hover:bg-wedding-sage/30 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="font-accent">Logout</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-2 bg-white/50 backdrop-blur-sm p-2 rounded-xl border border-wedding-gold/20">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id

              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id as AdminTab)}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg font-accent transition-all duration-200
                    ${isActive
                      ? 'bg-wedding-gold text-white shadow-lg'
                      : 'text-wedding-navy hover:bg-wedding-gold/10'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'overview' && dashboardStats && (
              <DashboardOverview stats={dashboardStats} />
            )}
            {activeTab === 'gallery' && <PhotoGalleryManager />}
            {activeTab === 'analytics' && <AdminAnalytics />}
            {activeTab === 'bulk' && <BulkOperations />}
            {activeTab === 'moderation' && <PhotoModeration />}
            {activeTab === 'settings' && <AdminSettings />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

const DashboardOverview: React.FC<{ stats: AdminDashboardStats }> = ({ stats }) => {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="card-elegant p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-accent text-wedding-navy-light">Total Photos</p>
              <p className="text-3xl font-display font-bold text-wedding-gold">
                {stats.totalPhotos}
              </p>
            </div>
            <div className="w-12 h-12 bg-wedding-gold/20 rounded-lg flex items-center justify-center">
              <Image className="h-6 w-6 text-wedding-gold" />
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-600 font-accent">+{stats.recentUploads} recent</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="card-elegant p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-accent text-wedding-navy-light">Guest Contributors</p>
              <p className="text-3xl font-display font-bold text-wedding-sage">
                {stats.totalGuests}
              </p>
            </div>
            <div className="w-12 h-12 bg-wedding-sage/20 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-wedding-sage" />
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-2">
            <Heart className="h-4 w-4 text-wedding-dusty" />
            <span className="text-sm text-wedding-dusty font-accent">Amazing participation!</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="card-elegant p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-accent text-wedding-navy-light">Total Storage</p>
              <p className="text-3xl font-display font-bold text-wedding-dusty">
                {stats.totalStorage}
              </p>
            </div>
            <div className="w-12 h-12 bg-wedding-dusty/20 rounded-lg flex items-center justify-center">
              <HardDrive className="h-6 w-6 text-wedding-dusty" />
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-2">
            <Activity className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-blue-600 font-accent">Well organized</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="card-elegant p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-accent text-wedding-navy-light">Event Date</p>
              <p className="text-lg font-display font-bold text-wedding-navy">
                Oct 12, 2024
              </p>
            </div>
            <div className="w-12 h-12 bg-wedding-navy/20 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-wedding-navy" />
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-wedding-gold" />
            <span className="text-sm text-wedding-gold font-accent">Your special day!</span>
          </div>
        </motion.div>
      </div>

      {/* Top Uploaders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="card-elegant p-6"
        >
          <h3 className="text-xl font-display font-medium text-wedding-navy mb-4">
            Top Contributors
          </h3>
          <div className="space-y-3">
            {stats.topUploaders.map((uploader, index) => (
              <div key={uploader.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-wedding-gold/20 rounded-full flex items-center justify-center text-sm font-accent font-medium text-wedding-gold">
                    {index + 1}
                  </div>
                  <span className="font-accent text-wedding-navy">{uploader.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-accent text-wedding-navy-light">
                    {uploader.count} photos
                  </span>
                  <div className="w-16 h-2 bg-wedding-cream rounded-full overflow-hidden">
                    <div
                      className="h-full bg-wedding-gold rounded-full"
                      style={{ width: `${uploader.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="card-elegant p-6"
        >
          <h3 className="text-xl font-display font-medium text-wedding-navy mb-4">
            Upload Timeline
          </h3>
          <div className="space-y-3">
            {stats.uploadTimeline.map((day) => (
              <div key={day.date} className="flex items-center justify-between">
                <span className="font-accent text-wedding-navy">
                  {new Date(day.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-accent text-wedding-navy-light">
                    {day.count} uploads
                  </span>
                  <div className="w-20 h-2 bg-wedding-cream rounded-full overflow-hidden">
                    <div
                      className="h-full bg-wedding-sage rounded-full"
                      style={{ width: `${(day.count / Math.max(...stats.uploadTimeline.map(d => d.count))) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="card-elegant p-6"
      >
        <h3 className="text-xl font-display font-medium text-wedding-navy mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-4 bg-wedding-gold/10 rounded-lg border border-wedding-gold/20 hover:bg-wedding-gold/20 transition-colors"
          >
            <Download className="h-6 w-6 text-wedding-gold mb-2" />
            <p className="font-accent font-medium text-wedding-navy">Download All Photos</p>
            <p className="text-sm text-wedding-navy-light">ZIP archive with all images</p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-4 bg-wedding-sage/10 rounded-lg border border-wedding-sage/20 hover:bg-wedding-sage/20 transition-colors"
          >
            <BarChart3 className="h-6 w-6 text-wedding-sage mb-2" />
            <p className="font-accent font-medium text-wedding-navy">View Analytics</p>
            <p className="text-sm text-wedding-navy-light">Detailed insights and metrics</p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-4 bg-wedding-dusty/10 rounded-lg border border-wedding-dusty/20 hover:bg-wedding-dusty/20 transition-colors"
          >
            <Shield className="h-6 w-6 text-wedding-dusty mb-2" />
            <p className="font-accent font-medium text-wedding-navy">Moderate Photos</p>
            <p className="text-sm text-wedding-navy-light">Review and approve uploads</p>
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}

export default AdminDashboard
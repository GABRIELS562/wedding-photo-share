import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { AdminState, AdminAction, AdminSession, AdminPermission } from '../types/admin'
import { WeddingStats } from '../types'
import toast from 'react-hot-toast'

interface AdminContextType {
  state: AdminState
  login: (password: string) => Promise<boolean>
  logout: () => void
  refreshSession: () => void
  hasPermission: (permission: AdminPermission) => boolean
  updateStats: (stats: Partial<WeddingStats>) => void
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

const initialState: AdminState = {
  isAuthenticated: false,
  session: null,
  stats: {
    totalPhotos: 0,
    totalSize: 0,
    uploaderStats: {},
    recentUploads: [],
    mostActiveUploader: '',
    averagePhotoSize: 0,
  },
  permissions: [],
  lastActivity: null,
}

function adminReducer(state: AdminState, action: AdminAction): AdminState {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        session: action.payload.session,
        permissions: action.payload.permissions,
        lastActivity: new Date(),
      }

    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        session: null,
        permissions: [],
        lastActivity: null,
      }

    case 'UPDATE_SESSION':
      return {
        ...state,
        session: action.payload,
        lastActivity: new Date(),
      }

    case 'UPDATE_STATS':
      return {
        ...state,
        stats: { ...state.stats, ...action.payload },
      }

    case 'REFRESH_ACTIVITY':
      return {
        ...state,
        lastActivity: new Date(),
      }

    default:
      return state
  }
}

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(adminReducer, initialState)

  // Session timeout (30 minutes)
  const SESSION_TIMEOUT = 30 * 60 * 1000

  useEffect(() => {
    // Check for existing session on app start
    const savedSession = localStorage.getItem('adminSession')
    if (savedSession) {
      try {
        const session: AdminSession = JSON.parse(savedSession)
        const isExpired = Date.now() - new Date(session.createdAt).getTime() > SESSION_TIMEOUT

        if (!isExpired) {
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              session,
              permissions: getDefaultPermissions(),
            },
          })
        } else {
          localStorage.removeItem('adminSession')
        }
      } catch (error) {
        localStorage.removeItem('adminSession')
      }
    }
  }, [])

  useEffect(() => {
    // Auto-logout on session timeout
    if (state.isAuthenticated && state.lastActivity) {
      const timeoutId = setTimeout(() => {
        const timeSinceActivity = Date.now() - state.lastActivity!.getTime()
        if (timeSinceActivity >= SESSION_TIMEOUT) {
          logout()
          toast.error('Session expired. Please log in again.')
        }
      }, SESSION_TIMEOUT)

      return () => clearTimeout(timeoutId)
    }
  }, [state.isAuthenticated, state.lastActivity])

  const login = async (password: string): Promise<boolean> => {
    try {
      // Verify password against environment variable
      const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD

      if (!adminPassword) {
        toast.error('Admin authentication not configured')
        return false
      }

      // Simple password check (in production, use proper hashing)
      if (password !== adminPassword) {
        // Add delay to prevent brute force
        await new Promise(resolve => setTimeout(resolve, 1000))
        toast.error('Invalid admin password')
        return false
      }

      // Create admin session
      const session: AdminSession = {
        id: crypto.randomUUID(),
        createdAt: new Date(),
        lastActivity: new Date(),
        ipAddress: 'unknown', // Would get from request in real backend
        userAgent: navigator.userAgent,
        permissions: getDefaultPermissions(),
      }

      // Save session to localStorage (in production, use secure httpOnly cookies)
      localStorage.setItem('adminSession', JSON.stringify(session))

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          session,
          permissions: getDefaultPermissions(),
        },
      })

      toast.success('Welcome to the admin panel! 👑')
      return true
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Authentication failed')
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('adminSession')
    dispatch({ type: 'LOGOUT' })
    toast.success('Logged out successfully')
  }

  const refreshSession = () => {
    if (state.session) {
      const updatedSession = {
        ...state.session,
        lastActivity: new Date(),
      }
      localStorage.setItem('adminSession', JSON.stringify(updatedSession))
      dispatch({ type: 'UPDATE_SESSION', payload: updatedSession })
    }
    dispatch({ type: 'REFRESH_ACTIVITY' })
  }

  const hasPermission = (permission: AdminPermission): boolean => {
    return state.permissions.includes(permission)
  }

  const updateStats = (stats: Partial<WeddingStats>) => {
    dispatch({ type: 'UPDATE_STATS', payload: stats })
  }

  const getDefaultPermissions = (): AdminPermission[] => {
    return [
      'view_photos',
      'download_photos',
      'delete_photos',
      'view_analytics',
      'manage_users',
      'export_data',
      'moderate_content',
    ]
  }

  const value: AdminContextType = {
    state,
    login,
    logout,
    refreshSession,
    hasPermission,
    updateStats,
  }

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  )
}

export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
}

export default AdminContext
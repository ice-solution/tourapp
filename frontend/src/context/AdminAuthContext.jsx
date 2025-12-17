import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../utils/api.js'

const STORAGE_KEY = 'tourapp.admin.authed'

const AdminAuthContext = createContext({
  isAuthenticated: false,
  admin: null,
  login: async () => {},
  logout: async () => {},
  checkAuth: async () => {},
})

export const AdminAuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/me')
      if (response.success && response.data.admin) {
        setIsAuthenticated(true)
        setAdmin(response.data.admin)
        return true
      }
    } catch (error) {
      setIsAuthenticated(false)
      setAdmin(null)
      return false
    }
    return false
  }

  useEffect(() => {
    checkAuth().finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      if (response.success && response.data.admin) {
        setIsAuthenticated(true)
        setAdmin(response.data.admin)
        return { success: true }
      }
      return { success: false, message: '登入失敗' }
    } catch (error) {
      return { success: false, message: error.message || '登入失敗' }
    }
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsAuthenticated(false)
      setAdmin(null)
    }
  }

  const value = useMemo(
    () => ({
      isAuthenticated,
      admin,
      login,
      logout,
      checkAuth,
      loading,
    }),
    [isAuthenticated, admin, loading],
  )

  if (loading) {
    return null // 或返回 loading spinner
  }

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export const useAdminAuth = () => useContext(AdminAuthContext)



import { createContext, useContext, useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../utils/api.js'

const EventUserAuthContext = createContext(null)

export const EventUserAuthProvider = ({ children, eventId: propEventId }) => {
  const params = useParams()
  const eventId = propEventId || params?.eventId
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (eventId) {
      checkAuth()
    } else {
      setLoading(false)
    }
  }, [eventId])

  const checkAuth = async () => {
    if (!eventId) {
      setLoading(false)
      return
    }
    
    try {
      const response = await api.get(`/events/${eventId}/me`)
      if (response.success && response.data.user) {
        setIsAuthenticated(true)
        setUser(response.data.user)
      } else {
        setIsAuthenticated(false)
        setUser(null)
      }
    } catch (error) {
      setIsAuthenticated(false)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await api.post(`/events/${eventId}/login`, {
        eventId,
        email,
        password,
      })
      if (response.success) {
        setIsAuthenticated(true)
        setUser(response.data.user)
        return { success: true }
      } else {
        return { success: false, error: response.message || '登入失敗' }
      }
    } catch (error) {
      return { success: false, error: error.message || '登入失敗' }
    }
  }

  const logout = async () => {
    try {
      await api.post(`/events/${eventId}/logout`)
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsAuthenticated(false)
      setUser(null)
    }
  }

  return (
    <EventUserAuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </EventUserAuthContext.Provider>
  )
}

export const useEventUserAuth = () => {
  const context = useContext(EventUserAuthContext)
  if (!context) {
    throw new Error('useEventUserAuth must be used within EventUserAuthProvider')
  }
  return context
}


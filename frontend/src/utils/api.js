import { environment } from '../config/environment.js'

const API_BASE_URL = environment.API_BASE_URL

const getAuthHeaders = () => {
  const token = document.cookie
    .split('; ')
    .find((row) => row.startsWith('accessToken='))
    ?.split('=')[1]
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

export const api = {
  get: async (url) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include',
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: '請求失敗' }))
      throw new Error(error.message || '請求失敗')
    }
    return response.json()
  },

  post: async (url, data) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: '請求失敗' }))
      throw new Error(error.message || '請求失敗')
    }
    return response.json()
  },

  put: async (url, data) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: '請求失敗' }))
      throw new Error(error.message || '請求失敗')
    }
    return response.json()
  },

  patch: async (url, data) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: '請求失敗' }))
      throw new Error(error.message || '請求失敗')
    }
    return response.json()
  },

  delete: async (url) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include',
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: '請求失敗' }))
      throw new Error(error.message || '請求失敗')
    }
    return response.json()
  },
}


// ============================================
// src/services/api.js
// ============================================

import axios from 'axios'
import config from '../config/env'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (requestConfig) => {
    // Ambil token langsung dari localStorage
    const token = localStorage.getItem('token')

    if (token) {
      requestConfig.headers.Authorization = `Bearer ${token}`
    }

    // Log requests in development
    if (config.isDevelopment) {
      console.log('📤 API Request:', {
        method: requestConfig.method?.toUpperCase(),
        url: requestConfig.url,
        hasAuth: !!token,
      })
    }

    return requestConfig
  },
  (error) => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor to handle common responses and errors
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (config.isDevelopment) {
      console.log('📥 API Response:', {
        method: response.config.method?.toUpperCase(),
        url: response.config.url,
        status: response.status,
      })
    }
    return response
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    })

    if (error.response) {
      const { status, data } = error.response
      const url = error.config?.url || ''

      switch (status) {
        case 401:
          console.warn('Unauthorized access - token may be expired or missing')

          // ✅ CRITICAL: Don't redirect to login for public endpoints
          const protectedPaths = [
            '/my-annotations',
            '/bookmarks',
            '/highlights',
            '/notes',
            '/progress',
            '/dashboard',
            '/library',
            '/reviews/my'
          ]

          const isProtectedEndpoint = protectedPaths.some(path => url.includes(path))

          if (isProtectedEndpoint) {
            console.warn('🔒 Protected endpoint requires login')
            localStorage.removeItem('token')
          } else {
            console.log('✅ Public endpoint - 401 is acceptable (user not logged in)')
          }
          break

        case 403:
          console.warn('Forbidden access - insufficient permissions')
          break

        case 404:
          console.warn('Resource not found')
          break

        case 500:
          console.error('Server error')
          break

        default:
          console.error(`HTTP Error ${status}`)
      }

      return Promise.reject({
        status,
        message: data?.message || data?.error || `HTTP Error ${status}`,
        data: data
      })
    } else if (error.request) {
      console.error('Network error - no response received')
      return Promise.reject({
        status: 0,
        message: 'Network error - please check your connection',
        data: null
      })
    } else {
      console.error('Request setup error:', error.message)
      return Promise.reject({
        status: -1,
        message: error.message,
        data: null
      })
    }
  }
)

export default api
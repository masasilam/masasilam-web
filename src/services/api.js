// ============================================
// src/services/api.js - FIXED ERROR FORMAT
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

      // ✅ PERBAIKAN: Kembalikan error asli axios, JANGAN ubah formatnya
      // Biarkan LoginPage yang handle error message
      return Promise.reject(error)
    } else if (error.request) {
      console.error('Network error - no response received')

      // Untuk network error, buat format yang mirip axios error
      const networkError = new Error('Network error - please check your connection')
      networkError.request = error.request
      return Promise.reject(networkError)
    } else {
      console.error('Request setup error:', error.message)
      return Promise.reject(error)
    }
  }
)

export default api
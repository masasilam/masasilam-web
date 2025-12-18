// ============================================
// src/services/dashboardService.js - IMPROVED
// ============================================

import api from './api'

// Helper function untuk menormalisasi respons
const normalizeResponse = (apiResponse, dataPath = 'data') => {
  if (!apiResponse || !apiResponse.data) {
    return {
      success: false,
      message: 'No response data',
      data: { items: [], totalData: 0 }
    }
  }

  const responseData = apiResponse.data
  
  // Cari data di berbagai kemungkinan path
  let items = []
  let totalData = 0
  
  // Coba berbagai struktur
  if (responseData[dataPath]?.list) {
    items = responseData[dataPath].list
    totalData = responseData[dataPath].total || 0
  } else if (responseData.list) {
    items = responseData.list
    totalData = responseData.total || 0
  } else if (responseData[dataPath]?.items) {
    items = responseData[dataPath].items
    totalData = responseData[dataPath].totalData || 0
  } else if (responseData.items) {
    items = responseData.items
    totalData = responseData.totalData || 0
  } else if (Array.isArray(responseData[dataPath])) {
    items = responseData[dataPath]
    totalData = items.length
  } else if (Array.isArray(responseData)) {
    items = responseData
    totalData = items.length
  }

  return {
    success: responseData.result === 'Success',
    message: responseData.detail || '',
    code: responseData.code || 200,
    data: {
      items,
      totalData,
      page: responseData[dataPath]?.page || responseData.page || 1,
      limit: responseData[dataPath]?.limit || responseData.limit || 12,
      total: responseData[dataPath]?.total || responseData.total || totalData
    }
  }
}

export const dashboardService = {
  // Main Dashboard - Overview lengkap
  getMainDashboard: async () => {
    const response = await api.get('/dashboard')
    return normalizeResponse(response)
  },

  // Perpustakaan - dengan filter & sort
  getLibrary: async (filter = 'all', page = 1, limit = 12, sortBy = 'last_read') => {
    try {
      const response = await api.get('/dashboard/library', {
        params: { filter, page, limit, sortBy }
      })
      return normalizeResponse(response)
    } catch (error) {
      console.error('Dashboard service error:', error)
      throw error
    }
  },

  // Riwayat Baca - DIPERBAIKI
  getReadingHistory: async (days = 7, page = 1, limit = 20) => {
    try {
      const response = await api.get('/dashboard/history', {
        params: { days, page, limit }
      })
      return normalizeResponse(response)
    } catch (error) {
      console.error('Reading history error:', error)
      throw error
    }
  },

  // Statistik Membaca
  getStatistics: async (period = 30) => {
    const response = await api.get('/dashboard/stats', {
      params: { period }
    })
    return normalizeResponse(response)
  },

  // Semua Annotations (bookmarks, highlights, notes)
  getAnnotations: async (type = 'all', page = 1, limit = 20, sortBy = 'recent') => {
    const response = await api.get('/dashboard/annotations', {
      params: { type, page, limit, sortBy }
    })
    return normalizeResponse(response)
  },

  // Ulasan User
  getReviews: async (page = 1, limit = 10) => {
    const response = await api.get('/dashboard/reviews', {
      params: { page, limit }
    })
    return normalizeResponse(response)
  },

  // Quick Stats - untuk widgets
  getQuickStats: async () => {
    const response = await api.get('/dashboard/quick-stats')
    return normalizeResponse(response)
  },

  // Reading Calendar
  getCalendar: async (year, month) => {
    const response = await api.get('/dashboard/calendar', {
      params: { year, month }
    })
    return normalizeResponse(response)
  },

  // Achievements
  getAchievements: async () => {
    const response = await api.get('/dashboard/achievements')
    return normalizeResponse(response)
  },

  // Reading Goals
  getGoals: async () => {
    const response = await api.get('/dashboard/goals')
    return normalizeResponse(response)
  },

  // Recommendations
  getRecommendations: async (limit = 10) => {
    const response = await api.get('/dashboard/recommendations', {
      params: { limit }
    })
    return normalizeResponse(response)
  }
}
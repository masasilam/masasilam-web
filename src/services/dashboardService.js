// ============================================
// src/services/dashboardService.js - OPTIMIZED
// ============================================

import api from './api'

// Normalize API response - support both object & array data
const normalize = (res, isArray = false) => {
  if (!res?.data) return { success: false, message: 'No data', data: isArray ? [] : null }

  const { result, detail, code, data } = res.data

  if (!isArray) return { success: result === 'Success', message: detail || '', code: code || 200, data }

  // Handle array responses
  const items = data?.list || data?.items || (Array.isArray(data) ? data : [])
  return {
    success: result === 'Success',
    message: detail || '',
    code: code || 200,
    data: {
      items,
      total: data?.total || items.length,
      page: data?.page || 1,
      limit: data?.limit || 12
    }
  }
}

export const dashboardService = {
  getMainDashboard: () => api.get('/dashboard').then(res => normalize(res)),

  getLibrary: (filter = 'all', page = 1, limit = 12, sortBy = 'last_read') =>
    api.get('/dashboard/library', { params: { filter, page, limit, sortBy } })
      .then(res => normalize(res, true)),

  getReadingHistory: (days = 7, page = 1, limit = 20) =>
    api.get('/dashboard/history', { params: { days, page, limit } })
      .then(res => normalize(res, true)),

  getStatistics: (period = 30) =>
    api.get('/dashboard/stats', { params: { period } })
      .then(res => normalize(res)),

  getAnnotations: (type = 'all', page = 1, limit = 20, sortBy = 'recent') =>
    api.get('/dashboard/annotations', { params: { type, page, limit, sortBy } })
      .then(res => normalize(res, true)),

  getReviews: (page = 1, limit = 10) =>
    api.get('/dashboard/reviews', { params: { page, limit } })
      .then(res => normalize(res, true)),

  getQuickStats: () =>
    api.get('/dashboard/quick-stats')
      .then(res => normalize(res)),

  getCalendar: (year, month) =>
    api.get('/dashboard/calendar', { params: { year, month } })
      .then(res => normalize(res)),

  getAchievements: () =>
    api.get('/dashboard/achievements')
      .then(res => normalize(res, true)),

  getGoals: () =>
    api.get('/dashboard/goals')
      .then(res => normalize(res)),

  getRecommendations: (limit = 10) =>
    api.get('/dashboard/recommendations', { params: { limit } })
      .then(res => normalize(res, true))
}
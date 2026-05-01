// ============================================
// src/services/zineDashboardService.js
// Dashboard service untuk Zine
// Mirrors dashboardService.js pattern
// ============================================
import api from './api'

const normalize = (res, isArray = false) => {
  if (!res?.data) return { success: false, message: 'No data', data: isArray ? [] : null }
  const { result, detail, code, data } = res.data
  if (!isArray) return { success: result === 'Success', message: detail || '', code: code || 200, data }
  const items = data?.list || data?.items || (Array.isArray(data) ? data : [])
  const total = data?.totalData ?? data?.total ?? items.length
  return {
    success: result === 'Success',
    message: detail || '',
    code: code || 200,
    data: { items, total, totalData: total, page: data?.page || 1, limit: data?.limit || 16 }
  }
}

export const zineDashboardService = {
  // GET /api/dashboard/zines/library
  getZineLibrary: (filter = 'all', page = 1, limit = 16, sortBy = 'last_read') =>
    api.get('/dashboard/zines/library', { params: { filter, page, limit, sortBy } })
      .then(res => normalize(res, true)),

  // GET /api/dashboard/zines/history
  getZineReadingHistory: (days = 7, page = 1, limit = 20) =>
    api.get('/dashboard/zines/history', { params: { days, page, limit } })
      .then(res => normalize(res, true)),

  // GET /api/dashboard/zines/statistics
  getZineStatistics: (period = 30) =>
    api.get('/dashboard/zines/statistics', { params: { period } })
      .then(res => normalize(res)),

  // GET /api/dashboard/zines/reviews
  getZineReviews: (page = 1, limit = 10) =>
    api.get('/dashboard/zines/reviews', { params: { page, limit } })
      .then(res => normalize(res, true)),

  // GET /api/dashboard/combined-overview
  getCombinedOverview: () =>
    api.get('/dashboard/combined-overview').then(res => normalize(res)),
}

export default zineDashboardService
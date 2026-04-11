// ============================================
// src/services/dashboardService.js
//
// FIX yang diterapkan:
//   - normalize() handle totalData (LibraryPageResponse) selain total
//   - Semua endpoint & shape response sudah sinkron dengan DashboardController
// ============================================
import api from './api'

// ── Normalize helper ────────────────────────────────────────────────────────
// Menyamakan shape response dari backend:
//   { result, detail, code, data }  →  { success, message, code, data }
//
// isArray = true  → data.items / data.list dinormalisasi menjadi
//                   { items, total, totalData, page, limit }
// isArray = false → data dikembalikan apa adanya
const normalize = (res, isArray = false) => {
  if (!res?.data) return { success: false, message: 'No data', data: isArray ? [] : null }

  const { result, detail, code, data } = res.data

  if (!isArray) {
    return { success: result === 'Success', message: detail || '', code: code || 200, data }
  }

  // Handle array / paginated responses.
  // Backend bisa pakai:
  //   data.list      → DatatableResponse (ReadingHistoryPageResponse)
  //   data.items     → DataResponse (LibraryPageResponse, AnnotationsPageResponse)
  //   Array langsung → DataResponse<List<...>>
  const items = data?.list || data?.items || (Array.isArray(data) ? data : [])

  // FIX: LibraryPageResponse pakai totalData, bukan total.
  // Ambil keduanya agar kompatibel dengan semua response shape.
  const total = data?.totalData ?? data?.total ?? items.length

  return {
    success: result === 'Success',
    message: detail || '',
    code:    code   || 200,
    data: {
      items,
      total,
      totalData: total,   // ← FIX: expose totalData agar MyLibraryPage tidak perlu fallback
      page:  data?.page  || 1,
      limit: data?.limit || 12,
    }
  }
}

export const dashboardService = {

  // ── Main dashboard ──────────────────────────────────────────────────────────
  // GET /api/dashboard
  // Response: DashboardMainResponse
  getMainDashboard: () =>
    api.get('/dashboard').then(res => normalize(res)),

  // ── Library ─────────────────────────────────────────────────────────────────
  // GET /api/dashboard/library?filter=&page=&limit=&sortBy=
  // Response: LibraryPageResponse { items, totalData, page, limit }
  // FIX: isArray=true → normalize akan expose totalData dengan benar
  getLibrary: (filter = 'all', page = 1, limit = 16, sortBy = 'last_read') =>
    api.get('/dashboard/library', { params: { filter, page, limit, sortBy } })
      .then(res => normalize(res, true)),

  // ── Reading history ──────────────────────────────────────────────────────────
  // GET /api/dashboard/history?days=&page=&limit=
  // Response: ReadingHistoryPageResponse { list, total, page, limit }
  getReadingHistory: (days = 7, page = 1, limit = 20) =>
    api.get('/dashboard/history', { params: { days, page, limit } })
      .then(res => normalize(res, true)),

  // ── Statistics ───────────────────────────────────────────────────────────────
  // GET /api/dashboard/statistics?period=
  getStatistics: (period = 30) =>
    api.get('/dashboard/statistics', { params: { period } })
      .then(res => normalize(res)),

  // ── Annotations ─────────────────────────────────────────────────────────────
  // GET /api/dashboard/annotations?type=&page=&limit=&sortBy=
  // Response: AnnotationsPageResponse { items, total, page, limit }
  getAnnotations: (type = 'all', page = 1, limit = 20, sortBy = 'recent') =>
    api.get('/dashboard/annotations', { params: { type, page, limit, sortBy } })
      .then(res => normalize(res, true)),

  // ── Reviews ──────────────────────────────────────────────────────────────────
  // GET /api/dashboard/reviews?page=&limit=
  getReviews: (page = 1, limit = 10) =>
    api.get('/dashboard/reviews', { params: { page, limit } })
      .then(res => normalize(res, true)),

  // ── Quick stats ───────────────────────────────────────────────────────────────
  // GET /api/dashboard/quick-stats
  getQuickStats: () =>
    api.get('/dashboard/quick-stats').then(res => normalize(res)),

  // ── Calendar ─────────────────────────────────────────────────────────────────
  // GET /api/dashboard/calendar?year=&month=
  getCalendar: (year, month) =>
    api.get('/dashboard/calendar', { params: { year, month } })
      .then(res => normalize(res)),

  // ── Goals ────────────────────────────────────────────────────────────────────
  // GET /api/dashboard/goals
  getGoals: () =>
    api.get('/dashboard/goals').then(res => normalize(res)),

  // ── Goals CRUD ───────────────────────────────────────────────────────────────

  // GET /api/dashboard/goals  (sudah ada, tidak berubah)
  // getGoals: () => api.get('/dashboard/goals').then(res => normalize(res)),

  // POST /api/dashboard/goals
  createGoal: (payload) =>
    api.post('/dashboard/goals', payload).then(res => normalize(res)),

  // PUT /api/dashboard/goals/{id}
  updateGoal: (id, payload) =>
    api.put(`/dashboard/goals/${id}`, payload).then(res => normalize(res)),

  // DELETE /api/dashboard/goals/{id}
  deleteGoal: (id) =>
    api.delete(`/dashboard/goals/${id}`).then(res => normalize(res)),

  // ── Achievements ─────────────────────────────────────────────────────────────
  // GET /api/dashboard/achievements
  // DataResponse biasa — isArray=false
  getAchievements: () =>
    api.get('/dashboard/achievements').then(res => normalize(res)),

  // ── Recommendations ───────────────────────────────────────────────────────────
  // GET /api/dashboard/recommendations?limit=
  getRecommendations: (limit = 10) =>
    api.get('/dashboard/recommendations', { params: { limit } })
      .then(res => normalize(res, true)),

  // ── Koreksi teks ─────────────────────────────────────────────────────────────
  // GET /api/dashboard/corrections?status=&page=&limit=
  getCorrections: (status = 'PENDING', page = 1, limit = 20) =>
    api.get('/dashboard/corrections', { params: { status, page, limit } })
      .then(res => normalize(res, true)),

  approveCorrection: (correctionId) =>
    api.post(`/dashboard/corrections/${correctionId}/approve`)
      .then(res => normalize(res)),

  rejectCorrection: (correctionId, note = null) =>
    api.post(`/dashboard/corrections/${correctionId}/reject`, { note })
      .then(res => normalize(res)),
}

export default dashboardService
// ============================================
// src/services/dashboardService.js
//
// PERUBAHAN dari versi sebelumnya:
//   - Tambah normalize() helper untuk konsistensi shape response
//   - Perbaiki endpoint getStatistics: /dashboard/stats → /dashboard/statistics
//   - Perbaiki normalize getAchievements: isArray=true → false (DataResponse biasa)
//   - Endpoint koreksi tetap di /api/dashboard/corrections/* sesuai DashboardController
//   - approveCorrection & rejectCorrection: body field `note` sesuai RejectCorrectionRequest
//   - Tambah getReviews, getQuickStats, getRecommendations
// ============================================
import api from './api'

// ── Normalize helper ────────────────────────────────────────────────────────
// Menyamakan shape response dari backend:
//   { result, detail, code, data }  →  { success, message, code, data }
//
// isArray = true  → data.items / data.list dinormalisasi menjadi { items, total, page, limit }
// isArray = false → data dikembalikan apa adanya
const normalize = (res, isArray = false) => {
  if (!res?.data) return { success: false, message: 'No data', data: isArray ? [] : null }

  const { result, detail, code, data } = res.data

  if (!isArray) {
    return { success: result === 'Success', message: detail || '', code: code || 200, data }
  }

  // Handle array / paginated responses
  // Backend bisa pakai data.list (DatatableResponse) atau data.items (DataResponse)
  const items = data?.list || data?.items || (Array.isArray(data) ? data : [])
  return {
    success: result === 'Success',
    message: detail || '',
    code:    code  || 200,
    data: {
      items,
      total: data?.total || items.length,
      page:  data?.page  || 1,
      limit: data?.limit || 12,
    }
  }
}

export const dashboardService = {

  // ── Main dashboard ──────────────────────────────────────────────────────────
  // Dipakai: DashboardOverview.jsx
  // GET /api/dashboard
  // Response: DashboardMainResponse {
  //   overviewStats, booksInProgress, readingPattern,
  //   recentlyRead, annotationsSummary, recentAchievements
  // }
  getMainDashboard: () =>
    api.get('/dashboard').then(res => normalize(res)),

  // ── Library ─────────────────────────────────────────────────────────────────
  // Dipakai: MyLibraryPage.jsx
  // GET /api/dashboard/library?filter=&page=&limit=&sortBy=
  // Response: LibraryPageResponse { items, totalData, page, limit }
  getLibrary: (filter = 'all', page = 1, limit = 16, sortBy = 'last_read') =>
    api.get('/dashboard/library', { params: { filter, page, limit, sortBy } })
      .then(res => normalize(res, true)),

  // ── Reading history ──────────────────────────────────────────────────────────
  // Dipakai: ReadingHistoryPage.jsx
  // GET /api/dashboard/history?days=&page=&limit=
  // Response: ReadingHistoryPageResponse { list, total, page, limit }
  getReadingHistory: (days = 7, page = 1, limit = 20) =>
    api.get('/dashboard/history', { params: { days, page, limit } })
      .then(res => normalize(res, true)),

  // ── Statistics ───────────────────────────────────────────────────────────────
  // Dipakai: StatisticsPage.jsx
  // GET /api/dashboard/statistics?period=
  // Response: StatisticsResponse {
  //   totalBooksRead, totalChaptersRead, totalReadingMinutes,
  //   averageReadingSpeedWpm,
  //   readingTimeTrend, completionTrend, speedTrend,
  //   genreBreakdown, peakReadingTimes
  // }
  getStatistics: (period = 30) =>
    api.get('/dashboard/statistics', { params: { period } })
      .then(res => normalize(res)),

  // ── Annotations ─────────────────────────────────────────────────────────────
  // Dipakai: AnnotationsPage.jsx
  // GET /api/dashboard/annotations?type=&page=&limit=&sortBy=
  // Response: AnnotationsPageResponse { items, total, page, limit }
  getAnnotations: (type = 'all', page = 1, limit = 20, sortBy = 'recent') =>
    api.get('/dashboard/annotations', { params: { type, page, limit, sortBy } })
      .then(res => normalize(res, true)),

  // ── Reviews ──────────────────────────────────────────────────────────────────
  // Dipakai: ReviewsPage.jsx
  // GET /api/dashboard/reviews?page=&limit=
  // Response: DatatableResponse<UserReviewItemResponse>
  getReviews: (page = 1, limit = 10) =>
    api.get('/dashboard/reviews', { params: { page, limit } })
      .then(res => normalize(res, true)),

  // ── Quick stats ───────────────────────────────────────────────────────────────
  // GET /api/dashboard/quick-stats
  // Response: QuickStatsResponse { totalBooks, currentStreak, completedBooks, ... }
  getQuickStats: () =>
    api.get('/dashboard/quick-stats').then(res => normalize(res)),

  // ── Calendar ─────────────────────────────────────────────────────────────────
  // Dipakai: CalendarPage.jsx
  // GET /api/dashboard/calendar?year=&month=
  // Response: CalendarResponse { days, totalMinutes, totalPages, activeDays }
  getCalendar: (year, month) =>
    api.get('/dashboard/calendar', { params: { year, month } })
      .then(res => normalize(res)),

  // ── Goals ────────────────────────────────────────────────────────────────────
  // Dipakai: GoalsPage.jsx
  // GET /api/dashboard/goals
  // Response: GoalsResponse { summary, active, completed }
  getGoals: () =>
    api.get('/dashboard/goals').then(res => normalize(res)),

  // ── Achievements ─────────────────────────────────────────────────────────────
  // Dipakai: AchievementsPage.jsx
  // GET /api/dashboard/achievements
  // Response: AchievementsResponse { list, total, unlocked, categories }
  // CATATAN: DataResponse biasa — isArray=false
  getAchievements: () =>
    api.get('/dashboard/achievements').then(res => normalize(res)),

  // ── Recommendations ───────────────────────────────────────────────────────────
  // GET /api/dashboard/recommendations?limit=
  // Response: DataResponse<List<BookRecommendationResponse>>
  getRecommendations: (limit = 10) =>
    api.get('/dashboard/recommendations', { params: { limit } })
      .then(res => normalize(res, true)),

  // ═══════════════════════════════════════════════════════════════════════════
  // KOREKSI TEKS
  // Dipakai: CorrectionQueuePage.jsx
  //
  // Endpoint di /api/dashboard/corrections/* sesuai DashboardController.
  // submitCorrection (dari ChapterReaderPage) tetap via chapterService.
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Ambil daftar koreksi dengan filter status.
   *
   * GET /api/dashboard/corrections?status=&page=&limit=
   *
   * Admin   : semua koreksi dari semua user
   * User biasa: koreksi milik sendiri saja
   *
   * Response: DatatableResponse<CorrectionResponse>
   *   data.items : CorrectionResponse[] {
   *     id, bookId, bookTitle, bookSlug,
   *     chapterNumber, chapterTitle,
   *     originalText, correctedText, contextBefore, contextAfter,
   *     userNote, reviewNote,
   *     status,                            // PENDING | APPROVED | REJECTED
   *     submittedByUserId, submittedByUsername,
   *     reviewedByUserId, reviewedByUsername,
   *     createdAt, reviewedAt
   *   }
   *   data.total, data.page, data.limit
   */
  getCorrections: (status = 'PENDING', page = 1, limit = 20) =>
    api.get('/dashboard/corrections', { params: { status, page, limit } })
      .then(res => normalize(res, true)),

  /**
   * Admin menyetujui koreksi.
   *
   * POST /api/dashboard/corrections/{id}/approve
   * Response: DataResponse<Void>
   */
  approveCorrection: (correctionId) =>
    api.post(`/dashboard/corrections/${correctionId}/approve`)
      .then(res => normalize(res)),

  /**
   * Admin menolak koreksi.
   *
   * POST /api/dashboard/corrections/{id}/reject
   * Body: { note? }   ← sesuai RejectCorrectionRequest di backend
   * Response: DataResponse<Void>
   */
  rejectCorrection: (correctionId, note = null) =>
    api.post(`/dashboard/corrections/${correctionId}/reject`, { note })
      .then(res => normalize(res)),
}

export default dashboardService
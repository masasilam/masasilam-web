// src/services/chapterService.js - COMPLETE IMPLEMENTATION
import api from './api'

export const chapterService = {
  // ============================================
  // CHAPTER READING
  // ============================================
  
  readChapterByPath: async (bookSlug, chapterPath) => {
    const response = await api.get(`/books/${bookSlug}/chapters/${chapterPath}`)
    return response.data?.data || response.data
  },

  readChapter: async (slug, chapterNumber) => {
    const response = await api.get(`/books/${slug}/chapters/${chapterNumber}`)
    return response.data?.data || response.data
  },

  getAllChapters: async (slug) => {
    const response = await api.get(`/books/${slug}/chapters`)
    return {
      data: {
        data: response.data?.data || []
      }
    }
  },

  saveProgress: async (slug, chapterNumber, progressData) => {
    const response = await api.post(
      `/books/${slug}/chapters/${chapterNumber}/progress`,
      progressData
    )
    return response.data?.data || response.data
  },

  // ============================================
  // CHAPTER ANNOTATIONS
  // ============================================
  
  getAllBookAnnotations: async (slug) => {
    const response = await api.get(`/books/${slug}/my-annotations`)
    const data = response.data?.data || response.data
    return {
      bookmarks: data.bookmarks || [],
      highlights: data.highlights || [],
      notes: data.notes || []
    }
  },

  getAnnotations: async (slug, chapterNumber) => {
    const response = await api.get(`/books/${slug}/chapters/${chapterNumber}/my-annotations`)
    return response.data?.data || response.data
  },

  addBookmark: async (slug, chapterNumber, bookmarkData) => {
    const response = await api.post(
      `/books/${slug}/chapters/${chapterNumber}/bookmarks`,
      bookmarkData
    )
    return response.data?.data || response.data
  },

  addHighlight: async (slug, chapterNumber, highlightData) => {
    const response = await api.post(
      `/books/${slug}/chapters/${chapterNumber}/highlights`,
      highlightData
    )
    return response.data?.data || response.data
  },

  addNote: async (slug, chapterNumber, noteData) => {
    const response = await api.post(
      `/books/${slug}/chapters/${chapterNumber}/notes`,
      noteData
    )
    return response.data?.data || response.data
  },

  deleteBookmark: async (slug, chapterNumber, bookmarkId) => {
    const response = await api.delete(
      `/books/${slug}/chapters/${chapterNumber}/bookmarks/${bookmarkId}`
    )
    return response.data?.data || response.data
  },

  deleteHighlight: async (slug, chapterNumber, highlightId) => {
    const response = await api.delete(
      `/books/${slug}/chapters/${chapterNumber}/highlights/${highlightId}`
    )
    return response.data?.data || response.data
  },

  deleteNote: async (slug, chapterNumber, noteId) => {
    const response = await api.delete(
      `/books/${slug}/chapters/${chapterNumber}/notes/${noteId}`
    )
    return response.data?.data || response.data
  },

  // ============================================
  // CHAPTER REVIEWS & SOCIAL
  // ============================================
  
  getChapterReviews: async (slug, chapterNumber, page = 1, limit = 10) => {
    const response = await api.get(`/books/${slug}/chapters/${chapterNumber}/reviews`, {
      params: { page, limit },
    })
    return response.data
  },

  addChapterReview: async (slug, chapterNumber, reviewData) => {
    const response = await api.post(
      `/books/${slug}/chapters/${chapterNumber}/reviews`,
      reviewData
    )
    return response.data
  },

  replyToChapterReview: async (slug, chapterNumber, reviewId, replyData) => {
    const response = await api.post(
      `/books/${slug}/chapters/${chapterNumber}/reviews/${reviewId}/replies`,
      replyData
    )
    return response.data
  },

  likeChapterReview: async (slug, chapterNumber, reviewId) => {
    const response = await api.post(
      `/books/${slug}/chapters/${chapterNumber}/reviews/${reviewId}/like`
    )
    return response.data
  },

  unlikeChapterReview: async (slug, chapterNumber, reviewId) => {
    const response = await api.delete(
      `/books/${slug}/chapters/${chapterNumber}/reviews/${reviewId}/like`
    )
    return response.data
  },

  // ============================================
  // CHAPTER RATING - NEW
  // ============================================
  
  rateChapter: async (slug, chapterNumber, rating) => {
    const response = await api.post(
      `/books/${slug}/chapters/${chapterNumber}/rating`,
      { rating }
    )
    return response.data?.data || response.data
  },

  getChapterRating: async (slug, chapterNumber) => {
    const response = await api.get(
      `/books/${slug}/chapters/${chapterNumber}/rating`
    )
    return response.data?.data || response.data
  },

  deleteChapterRating: async (slug, chapterNumber) => {
    const response = await api.delete(
      `/books/${slug}/chapters/${chapterNumber}/rating`
    )
    return response.data?.data || response.data
  },

  // ============================================
  // READING ACTIVITY TRACKING - NEW
  // ============================================
  
  startReading: async (slug, sessionData) => {
    const response = await api.post(
      `/books/${slug}/chapters/reading/start`,
      sessionData
    )
    return response.data?.data || response.data
  },

  endReading: async (slug, sessionData) => {
    const response = await api.post(
      `/books/${slug}/chapters/reading/end`,
      sessionData
    )
    return response.data?.data || response.data
  },

  sendHeartbeat: async (slug, heartbeatData) => {
    const response = await api.post(
      `/books/${slug}/chapters/reading/heartbeat`,
      heartbeatData
    )
    return response.data?.data || response.data
  },

  getReadingHistory: async (slug) => {
    const response = await api.get(`/books/${slug}/chapters/reading/history`)
    return response.data?.data || response.data
  },

  getReadingPattern: async (slug) => {
    const response = await api.get(`/books/${slug}/chapters/reading/patterns`)
    return response.data?.data || response.data
  },

  // ============================================
  // SEARCH IN BOOK - NEW
  // ============================================
  
  searchInBook: async (slug, query, page = 1, limit = 10) => {
    const response = await api.post(`/books/${slug}/chapters/search`, {
      query,
      page,
      limit
    })
    return response.data?.data || response.data
  },

  getSearchHistory: async (slug, limit = 10) => {
    const response = await api.get(`/books/${slug}/chapters/search/history`, {
      params: { limit }
    })
    return response.data?.data || response.data
  },

  // ============================================
  // EXPORT ANNOTATIONS - NEW
  // ============================================
  
  exportAnnotations: async (slug, exportOptions) => {
    const response = await api.post(
      `/books/${slug}/chapters/annotations/export`,
      exportOptions
    )
    return response.data?.data || response.data
  },

  getExportStatus: async (slug, exportId) => {
    const response = await api.get(
      `/books/${slug}/chapters/annotations/export/${exportId}`
    )
    return response.data?.data || response.data
  },

  downloadExport: async (slug, exportId) => {
    // Returns redirect URL
    return `/api/books/${slug}/chapters/annotations/export/${exportId}/download`
  },

  getExportHistory: async (slug, page = 1, limit = 10) => {
    const response = await api.get(
      `/books/${slug}/chapters/annotations/exports`,
      { params: { page, limit } }
    )
    return response.data?.data || response.data
  },

  deleteExport: async (slug, exportId) => {
    const response = await api.delete(
      `/books/${slug}/chapters/annotations/export/${exportId}`
    )
    return response.data?.data || response.data
  },

  // ============================================
  // BULK USER DATA - CRITICAL FOR DASHBOARD
  // ============================================
  
  getMyBookData: async (slug) => {
    const response = await api.get(`/books/${slug}/chapters/me`)
    return response.data?.data || response.data
  },

  // ============================================
  // ANALYTICS - NEW
  // ============================================
  
  getBookAnalytics: async (slug, dateFrom, dateTo) => {
    const params = {}
    if (dateFrom) params.dateFrom = dateFrom
    if (dateTo) params.dateTo = dateTo
    
    const response = await api.get(`/books/${slug}/chapters/analytics`, { params })
    return response.data?.data || response.data
  },

  getChaptersAnalytics: async (slug) => {
    const response = await api.get(`/books/${slug}/chapters/analytics/chapters`)
    return response.data?.data || response.data
  },

  // ============================================
  // CHAPTER AUDIO & TEXT
  // ============================================
  
  getChapterText: async (slug, chapterNumber) => {
    const response = await api.get(`/books/${slug}/chapters/${chapterNumber}/text`)
    return response.data?.data || response.data
  },

  getChapterParagraphs: async (slug, chapterNumber) => {
    const response = await api.get(`/books/${slug}/chapters/${chapterNumber}/paragraphs`)
    return response.data?.data || response.data
  },

  // ============================================
  // CHAPTER STATISTICS
  // ============================================
  
  getChapterStats: async (slug, chapterNumber) => {
    const response = await api.get(`/books/${slug}/chapters/${chapterNumber}/stats`)
    return response.data?.data || response.data
  }
}

export default chapterService
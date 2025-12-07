// src/services/chapterService.js
import api from './api'

export const chapterService = {
  // ============ CHAPTER READING ============
  
  /**
   * Read chapter by slug path (hierarchical)
   * @param {string} bookSlug - Book slug
   * @param {string} chapterPath - Hierarchical path (e.g., "kerikil-tajam/nisan")
   */
  readChapterByPath: async (bookSlug, chapterPath) => {
    const response = await api.get(`/books/${bookSlug}/chapters/${chapterPath}`)
    return response.data?.data || response.data
  },

  /**
   * Read chapter by number (legacy support)
   */
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

  // ============ CHAPTER ANNOTATIONS ============
  
  getAllBookAnnotations: async (slug) => {
    const response = await api.get(`/books/${slug}/my-annotations`)
    console.log('🔍 Raw API Response:', response.data)
    
    const data = response.data?.data || response.data
    console.log('🔍 Extracted data:', data)
    
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

  // ============ DELETE ANNOTATIONS ============
  
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

  // ============ CHAPTER REVIEWS & SOCIAL ============
  
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

  // ============ CHAPTER AUDIO & TEXT ============
  
  getChapterText: async (slug, chapterNumber) => {
    const response = await api.get(`/books/${slug}/chapters/${chapterNumber}/text`)
    return response.data?.data || response.data
  },

  getChapterParagraphs: async (slug, chapterNumber) => {
    const response = await api.get(`/books/${slug}/chapters/${chapterNumber}/paragraphs`)
    return response.data?.data || response.data
  },

  // ============ CHAPTER STATISTICS ============
  
  getChapterStats: async (slug, chapterNumber) => {
    const response = await api.get(`/books/${slug}/chapters/${chapterNumber}/stats`)
    return response.data?.data || response.data
  },
}

export default chapterService
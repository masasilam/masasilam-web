import api from './api'

const cleanParams = (params) => {
  const entries = Object.entries(params).filter(([, v]) => v != null && v !== '')
  return Object.fromEntries(
    entries.map(([k, v]) => {
      switch (k) {
        case 'isFeatured':
          return [k, v === 'true' || v === true]
        case 'languageId':
        case 'volume':
        case 'minChapters':
        case 'maxChapters':
        case 'publicationYearFrom':
        case 'publicationYearTo':
        case 'minViewCount':
        case 'minReadCount':
          return [k, parseInt(v, 10)]
        case 'minFileSize':
        case 'maxFileSize':
          return [k, Math.round(parseFloat(v) * 1024 * 1024)]
        case 'minRating':
          return [k, parseFloat(v)]
        default:
          return [k, v]
      }
    })
  )
}

const formatResponse = (data, limit) => ({
  data: {
    data: data?.list || [],
    total: data?.total || 0,
    page: data?.page || 1,
    totalPages: Math.ceil((data?.total || 0) / (data?.limit || limit || 12))
  }
})

export const zineService = {
  getZines: async (params = {}) => {
    try {
      const response = await api.get('/zines', { params: cleanParams(params) })
      return formatResponse(response.data?.data, params.limit)
    } catch (error) {
      console.error('zineService.getZines error:', error)
      return formatResponse(null, params.limit)
    }
  },

  getZineBySlug: async (slug) => {
    const response = await api.get(`/zines/${slug}`)
    return response.data?.data || response.data
  },

  getDownloadUrl: async (slug) => {
    const response = await api.get(`/zines/${slug}/download`)
    return response.data
  },

  // ── Rating ──────────────────────────────────────────────────────────────────
  addRating: async (slug, ratingData) => {
    const response = await api.post(`/zines/${slug}/rating`, { rating: ratingData.rating })
    return response.data
  },

  getRatingStats: async (slug) => {
    const response = await api.get(`/zines/${slug}/rating`)
    return response.data
  },

  getMyRating: async (slug) => {
    const response = await api.get(`/zines/${slug}/rating/me`)
    return response.data
  },

  deleteRating: async (slug) => {
    const response = await api.delete(`/zines/${slug}/rating`)
    return response.data
  },

  // ── Reviews ─────────────────────────────────────────────────────────────────
  getReviews: async (slug, page = 1, limit = 10, sortBy = 'helpful') => {
    try {
      const response = await api.get(`/zines/${slug}/reviews`, { params: { page, limit, sortBy } })
      return response.data
    } catch {
      return { data: { page: 1, limit, total: 0, list: [] } }
    }
  },

  getMyReview: async (slug) => {
    const response = await api.get(`/zines/${slug}/reviews/me`)
    return response.data
  },

  addReview: async (slug, reviewData) => {
    const response = await api.post(`/zines/${slug}/reviews`, {
      title: reviewData.title || null,
      content: reviewData.content || reviewData.comment,
    })
    return response.data
  },

  updateReview: async (slug, reviewData) => {
    const response = await api.put(`/zines/${slug}/reviews`, {
      title: reviewData.title || null,
      content: reviewData.content || reviewData.comment,
    })
    return response.data
  },

  deleteReview: async (slug) => {
    const response = await api.delete(`/zines/${slug}/reviews`)
    return response.data
  },

  // ── Replies ─────────────────────────────────────────────────────────────────
  addReply: async (slug, reviewId, replyData) => {
    const response = await api.post(`/zines/${slug}/reviews/${reviewId}/replies`, { content: replyData.content })
    return response.data
  },

  updateReply: async (slug, replyId, replyData) => {
    const response = await api.put(`/zines/${slug}/reviews/replies/${replyId}`, { content: replyData.content })
    return response.data
  },

  deleteReply: async (slug, replyId) => {
    const response = await api.delete(`/zines/${slug}/reviews/replies/${replyId}`)
    return response.data
  },

  // ── Feedback ─────────────────────────────────────────────────────────────────
  addFeedback: async (slug, reviewId, feedbackData) => {
    const response = await api.post(`/zines/${slug}/reviews/${reviewId}/feedback`, {
      isHelpful: feedbackData.isHelpful,
    })
    return response.data
  },

  deleteFeedback: async (slug, reviewId) => {
    const response = await api.delete(`/zines/${slug}/reviews/${reviewId}/feedback`)
    return response.data
  },

  // ── Metadata ─────────────────────────────────────────────────────────────────
  getGenres: async (includeZineCount = true) => {
    const response = await api.get('/zines/genres', { params: { includeZineCount } })
    return response.data
  },

  getAuthors: async (page = 1, limit = 20, search = '', sortBy = 'name') => {
    const response = await api.get('/zines/authors', { params: { page, limit, search, sortBy } })
    return response.data
  },

  getContributors: async (page = 1, limit = 20, role = '', search = '') => {
    const response = await api.get('/zines/contributors', { params: { page, limit, role, search } })
    return response.data
  },
}

export default zineService
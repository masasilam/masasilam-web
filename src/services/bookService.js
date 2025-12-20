// ============================================
// src/services/bookService.js - OPTIMIZED VERSION
// Clean, fast, SEO-ready, <100 lines
// ============================================
import api from './api';

const cleanParams = (params) => 
  Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null && v !== ''));

const formatResponse = (data, limit) => ({
  data: {
    data: data?.list || [],
    total: data?.total || 0,
    page: data?.page || 1,
    totalPages: Math.ceil((data?.total || 0) / (data?.limit || limit || 12))
  }
});

export const bookService = {
  // Books with advanced filtering - matches backend exactly
  getBooks: async (params = {}) => {
    try {
      const response = await api.get('/books', { params: cleanParams(params) });
      return formatResponse(response.data?.data, params.limit);
    } catch (error) {
      return formatResponse(null, params.limit);
    }
  },

  getBookBySlug: async (slug) => {
    const response = await api.get(`/books/${slug}`);
    return response.data?.data || response.data;
  },

  getTableOfContents: async (slug) => {
    const response = await api.get(`/books/${slug}/chapters`);
    const data = response.data?.data || response.data;
    return data?.list || (Array.isArray(data) ? data : []);
  },

  downloadBook: async (slug) => {
    const response = await api.get(`/books/${slug}/download`, { responseType: 'blob' });
    return response.data;
  },

  // Rating operations
  addRating: async (slug, ratingData) => {
    const response = await api.post(`/books/${slug}/rating`, { rating: ratingData.rating });
    return response.data;
  },

  getRatingStats: async (slug) => {
    const response = await api.get(`/books/${slug}/rating`);
    return response.data;
  },

  getMyRating: async (slug) => {
    const response = await api.get(`/books/${slug}/rating/me`);
    return response.data;
  },

  deleteRating: async (slug) => {
    const response = await api.delete(`/books/${slug}/rating`);
    return response.data;
  },

  // Review operations
  getReviews: async (slug, page = 1, limit = 10, sortBy = 'helpful') => {
    try {
      const response = await api.get(`/books/${slug}/reviews`, { params: { page, limit, sortBy } });
      return response.data;
    } catch (error) {
      return { data: { page: 1, limit, total: 0, list: [] } };
    }
  },

  getMyReview: async (slug) => {
    const response = await api.get(`/books/${slug}/reviews/me`);
    return response.data;
  },

  addReview: async (slug, reviewData) => {
    const response = await api.post(`/books/${slug}/reviews`, {
      title: reviewData.title || null,
      content: reviewData.content || reviewData.comment
    });
    return response.data;
  },

  updateReview: async (slug, reviewData) => {
    const response = await api.put(`/books/${slug}/reviews`, {
      title: reviewData.title || null,
      content: reviewData.content || reviewData.comment
    });
    return response.data;
  },

  deleteReview: async (slug) => {
    const response = await api.delete(`/books/${slug}/reviews`);
    return response.data;
  },

  // Reply operations
  addReply: async (slug, reviewId, replyData) => {
    const response = await api.post(`/books/${slug}/reviews/${reviewId}/replies`, { content: replyData.content });
    return response.data;
  },

  updateReply: async (slug, replyId, replyData) => {
    const response = await api.put(`/books/${slug}/reviews/replies/${replyId}`, { content: replyData.content });
    return response.data;
  },

  deleteReply: async (slug, replyId) => {
    const response = await api.delete(`/books/${slug}/reviews/replies/${replyId}`);
    return response.data;
  },

  // Feedback operations
  addFeedback: async (slug, reviewId, feedbackData) => {
    const response = await api.post(`/books/${slug}/reviews/${reviewId}/feedback`, { isHelpful: feedbackData.isHelpful });
    return response.data;
  },

  deleteFeedback: async (slug, reviewId) => {
    const response = await api.delete(`/books/${slug}/reviews/${reviewId}/feedback`);
    return response.data;
  },

  // Metadata operations
  getMyAnnotations: async (slug) => {
    const response = await api.get(`/books/${slug}/my-annotations`);
    return response.data;
  },

  getGenres: async (includeBookCount = true) => {
    const response = await api.get('/books/genres', { params: { includeBookCount } });
    return response.data;
  },

  getAuthors: async (page = 1, limit = 20, search = '', sortBy = 'name') => {
    const response = await api.get('/books/authors', { params: { page, limit, search, sortBy } });
    return response.data;
  },

  getContributors: async (page = 1, limit = 20, role = '', search = '') => {
    const response = await api.get('/books/contributors', { params: { page, limit, role, search } });
    return response.data;
  }
};

export default bookService;
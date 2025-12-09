// src/services/bookService.js
import api from './api';

export const bookService = {
  // ============ BOOK OPERATIONS ============

  getBooks: async (params = {}) => {
    try {
      const response = await api.get('/books', { params });
      const responseData = response.data?.data;

      if (!responseData) {
        console.warn('No data object in response');
        return {
          data: {
            data: [],
            total: 0,
            page: 1,
            totalPages: 1
          }
        };
      }

      const bookList = responseData.list || [];
      const totalItems = responseData.total || 0;
      const currentPage = responseData.page || 1;
      const limit = responseData.limit || params.limit || 12;
      const totalPages = Math.ceil(totalItems / limit);

      console.log('Processed books:', bookList.length, 'Total:', totalItems);

      return {
        data: {
          data: bookList,
          total: totalItems,
          page: currentPage,
          totalPages: totalPages
        }
      };
    } catch (error) {
      console.error('Error fetching books:', error);
      return {
        data: {
          data: [],
          total: 0,
          page: 1,
          totalPages: 1
        }
      };
    }
  },

  getBookBySlug: async (slug) => {
    try {
      const response = await api.get(`/books/${slug}`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error fetching book details:', error);
      throw error;
    }
  },

  /**
   * Get Table of Contents (hierarchical chapter structure)
   */
  getTableOfContents: async (slug) => {
    try {
      const response = await api.get(`/books/${slug}/chapters`);
      console.log('📚 TOC Response:', response.data);

      const data = response.data?.data || response.data;

      if (Array.isArray(data)) {
        return data;
      }

      if (data?.list && Array.isArray(data.list)) {
        return data.list;
      }

      console.warn('⚠️ Unexpected TOC response structure:', data);
      return [];
    } catch (error) {
      console.error('❌ Error fetching table of contents:', error);
      throw error;
    }
  },

  downloadBook: async (slug) => {
    try {
      const response = await api.get(`/books/${slug}/download`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading book:', error);
      throw error;
    }
  },

  // ============ RATING OPERATIONS ============

  /**
   * 🆕 Add or update book rating (0.5 - 5 stars)
   * Backend: POST /api/books/{slug}/rating
   */
  addRating: async (slug, ratingData) => {
    try {
      const response = await api.post(`/books/${slug}/rating`, {
        rating: ratingData.rating
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error adding rating:', error);
      throw error;
    }
  },

  /**
   * 🆕 Update existing rating
   * Backend: POST /api/books/{slug}/rating (same endpoint, auto-detects update)
   */
  updateRating: async (slug, ratingData) => {
    try {
      const response = await api.post(`/books/${slug}/rating`, {
        rating: ratingData.rating
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error updating rating:', error);
      throw error;
    }
  },

  /**
   * 🆕 Delete user's rating
   * Backend: DELETE /api/books/{slug}/rating
   */
  deleteRating: async (slug) => {
    try {
      const response = await api.delete(`/books/${slug}/rating`);
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting rating:', error);
      throw error;
    }
  },

  // ============ REVIEW/COMMENT OPERATIONS ============

  /**
   * Get book reviews with pagination
   * Backend: GET /api/books/{slug}/reviews
   */
  getReviews: async (slug, page = 1, limit = 10) => {
    try {
      const response = await api.get(`/books/${slug}/reviews`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return { data: { data: [], total: 0 } };
    }
  },

  /**
   * 🆕 Add review to book
   * Backend: POST /api/books/{slug}/reviews
   */
  addReview: async (slug, reviewData) => {
    try {
      const response = await api.post(`/books/${slug}/reviews`, {
        title: reviewData.title || null,
        comment: reviewData.comment
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error adding review:', error);
      throw error;
    }
  },

  /**
   * 🆕 Update own review
   * Backend: PUT /api/books/{slug}/reviews
   */
  updateReview: async (slug, reviewData) => {
    try {
      const response = await api.put(`/books/${slug}/reviews`, {
        title: reviewData.title || null,
        comment: reviewData.comment
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error updating review:', error);
      throw error;
    }
  },

  /**
   * 🆕 Delete own review
   * Backend: DELETE /api/books/{slug}/reviews
   */
  deleteReview: async (slug) => {
    try {
      const response = await api.delete(`/books/${slug}/reviews`);
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting review:', error);
      throw error;
    }
  },

  // ============ REPLY OPERATIONS ============

  /**
   * 🆕 Add reply to a review/comment
   * Backend: POST /api/books/{slug}/reviews/{parentId}/replies
   */
  addReply: async (slug, parentId, replyData) => {
    try {
      const response = await api.post(
        `/books/${slug}/reviews/${parentId}/replies`,
        {
          comment: replyData.comment
        }
      );
      return response.data;
    } catch (error) {
      console.error('❌ Error adding reply:', error);
      throw error;
    }
  },

  /**
   * 🆕 Update own reply
   * Backend: PUT /api/books/{slug}/reviews/replies/{replyId}
   */
  updateReply: async (slug, replyId, replyData) => {
    try {
      const response = await api.put(
        `/books/${slug}/reviews/replies/${replyId}`,
        {
          comment: replyData.comment
        }
      );
      return response.data;
    } catch (error) {
      console.error('❌ Error updating reply:', error);
      throw error;
    }
  },

  /**
   * 🆕 Delete own reply
   * Backend: DELETE /api/books/{slug}/reviews/replies/{replyId}
   */
  deleteReply: async (slug, replyId) => {
    try {
      const response = await api.delete(
        `/books/${slug}/reviews/replies/${replyId}`
      );
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting reply:', error);
      throw error;
    }
  },

  // ============ FEEDBACK OPERATIONS (HELPFUL/NOT_HELPFUL) ============

  /**
   * 🆕 Add or update feedback on a review
   * Backend: POST /api/books/{slug}/reviews/{reviewId}/feedback
   * @param {string} type - "HELPFUL" or "NOT_HELPFUL"
   */
  addFeedback: async (slug, reviewId, feedbackData) => {
    try {
      const response = await api.post(
        `/books/${slug}/reviews/${reviewId}/feedback`,
        {
          type: feedbackData.type // "HELPFUL" or "NOT_HELPFUL"
        }
      );
      return response.data;
    } catch (error) {
      console.error('❌ Error adding feedback:', error);
      throw error;
    }
  },

  /**
   * 🆕 Update existing feedback
   * Backend: POST /api/books/{slug}/reviews/{reviewId}/feedback (same endpoint)
   */
  updateFeedback: async (slug, reviewId, feedbackData) => {
    try {
      const response = await api.post(
        `/books/${slug}/reviews/${reviewId}/feedback`,
        {
          type: feedbackData.type
        }
      );
      return response.data;
    } catch (error) {
      console.error('❌ Error updating feedback:', error);
      throw error;
    }
  },

  /**
   * 🆕 Delete feedback
   * Backend: DELETE /api/books/{slug}/reviews/{reviewId}/feedback
   */
  deleteFeedback: async (slug, reviewId) => {
    try {
      const response = await api.delete(
        `/books/${slug}/reviews/${reviewId}/feedback`
      );
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting feedback:', error);
      throw error;
    }
  },

  // ============ ANNOTATIONS OPERATIONS ============

  /**
   * 🆕 Get all user's annotations across ALL chapters in this book
   * Returns: bookmarks, highlights, notes from entire book
   * Backend: GET /api/books/{slug}/my-annotations
   */
  getMyAnnotations: async (slug) => {
    try {
      const response = await api.get(`/books/${slug}/my-annotations`);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching annotations:', error);
      throw error;
    }
  }
};

export default bookService;
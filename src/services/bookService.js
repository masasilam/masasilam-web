// src/services/bookService.js
import api from './api';

export const bookService = {
  getBooks: async (params = {}) => {
    try {
      const response = await api.get('/books', { params });
      
      console.log('Full API Response:', response.data);
      
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
   * ✅ NEW: Get Table of Contents (hierarchical chapter structure)
   * @param {string} slug - Book slug
   * @returns {Promise<Array>} Array of chapters with subChapters
   */
  getTableOfContents: async (slug) => {
    try {
      const response = await api.get(`/books/${slug}/chapters`);
      console.log('📚 TOC Response:', response.data);
      
      // Handle different response structures
      const data = response.data?.data || response.data;
      
      // If data is array, return directly
      if (Array.isArray(data)) {
        return data;
      }
      
      // If data has 'list' property (pagination response)
      if (data?.list && Array.isArray(data.list)) {
        return data.list;
      }
      
      // Fallback: return empty array
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

  addReview: async (slug, reviewData) => {
    try {
      const response = await api.post(`/books/${slug}/reviews`, reviewData);
      return response.data;
    } catch (error) {
      console.error('Error adding review:', error);
      throw error;
    }
  }
};

export default bookService;
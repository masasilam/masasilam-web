// ============================================
// src/services/userService.js
// ============================================

import api from './api'

export const userService = {
  // Get user profile
  getProfile: async () => {
    const response = await api.get('/user/profile')
    return response.data
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await api.put('/user/profile', profileData)
    return response.data
  },

  // Upload profile picture
  uploadProfilePicture: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post('/user/profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Get reading history
  getReadingHistory: async (page = 1, limit = 10) => {
    const response = await api.get('/user/reading-history', {
      params: { page, limit },
    })
    return response.data
  },

  // Get user library
  getLibrary: async (page = 1, limit = 10) => {
    const response = await api.get('/user/library', {
      params: { page, limit },
    })
    return response.data
  },

  // Get bookmarks
  getBookmarks: async (page = 1, limit = 10) => {
    const response = await api.get('/user/bookmarks', {
      params: { page, limit },
    })
    return response.data
  },

  // Get highlights
  getHighlights: async (page = 1, limit = 10) => {
    const response = await api.get('/user/highlights', {
      params: { page, limit },
    })
    return response.data
  },

  // Get notes
  getNotes: async (page = 1, limit = 10) => {
    const response = await api.get('/user/notes', {
      params: { page, limit },
    })
    return response.data
  },

  // Get user reviews
  getMyReviews: async (page = 1, limit = 10) => {
    const response = await api.get('/user/reviews', {
      params: { page, limit },
    })
    return response.data
  },
}
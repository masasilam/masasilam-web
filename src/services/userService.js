import api from './api'

export const userService = {
  // Get all users (for statistics/admin)
  getAllUsers: async () => {
    const response = await api.get('/user')
    return response.data
  },

  // Get user by ID
  getUserById: async (userId) => {
    const response = await api.get(`/user/${userId}`)
    return response.data
  },

  // Update user profile (username, fullName, bio, profilePictureUrl, emailNotifications)
  updateProfile: async (userId, profileData) => {
    const response = await api.put(`/user/${userId}`, profileData)
    return response.data
  },

  // Change password
  changePassword: async (userId, passwordData) => {
    const response = await api.put(`/user/${userId}/change-password`, passwordData)
    return response.data
  },

  // Delete user account
  deleteAccount: async (userId, hardDelete = false) => {
    const response = await api.delete(`/user/${userId}`, {
      params: { hardDelete }
    })
    return response.data
  },

  // Upload profile picture dengan userId sebagai query param
  uploadProfilePicture: async (file, userId) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('userId', userId)

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

export default userService
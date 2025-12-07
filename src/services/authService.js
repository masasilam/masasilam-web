import api from './api';

const authService = {
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);

      if (response.data && response.data.result === 'Success') {
        return response.data;
      } else {
        throw new Error(response.data?.detail || 'Login failed');
      }
    } catch (error) {
      if (error.response) {
        const errorMessage = error.response.data?.detail ||
                           error.response.data?.message ||
                           `Login failed with status ${error.response.status}`;
        throw new Error(errorMessage);
      } else if (error.request) {
        throw new Error('Network error - please check your connection');
      } else {
        throw new Error(error.message || 'Login failed');
      }
    }
  },

  logout: async () => {
    // Add logout logic if you have logout endpoint
    console.log('Logout called');
    return true;
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      if (error.response) {
        const errorMessage = error.response.data?.message ||
                           `Failed to fetch user - ${error.response.status}`;
        throw new Error(errorMessage);
      } else if (error.request) {
        throw new Error('Network error - please check your connection');
      } else {
        throw new Error(error.message || 'Failed to fetch user');
      }
    }
  },
};

// Export both named and default
export { authService };
export default authService;
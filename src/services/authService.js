// ============================================
// src/services/authService.js - UPDATED
// ============================================

import api from './api';

const authService = {
  // Login
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);

      if (response.data && response.data.result === 'Success') {
        return response.data;
      } else {
        throw new Error(response.data?.detail || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
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

  // Register
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);

      console.log('Register response:', response.data);

      if (response.data && (response.data.result === 'Success' || response.status === 201)) {
        return response.data;
      } else {
        throw new Error(response.data?.detail || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response) {
        console.error('Error response:', {
          status: error.response.status,
          data: error.response.data
        });

        const errorMessage = error.response.data?.detail ||
                           error.response.data?.message ||
                           `Registration failed with status ${error.response.status}`;
        throw new Error(errorMessage);
      } else if (error.request) {
        throw new Error('Network error - please check your connection');
      } else {
        throw new Error(error.message || 'Registration failed');
      }
    }
  },

  // Logout
  logout: async (token) => {
    try {
      const response = await api.post('/auth/logout', {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Logout error:', error);
      return true;
    }
  },

  // Google OAuth - UPDATED WITH DETAILED LOGGING
  googleAuth: async (idToken) => {
    try {
      console.log('🔵 Calling /auth/google endpoint...');

      const response = await api.post('/auth/google', { idToken });

      console.log('🔵 Backend response received:', {
        status: response.status,
        hasData: !!response.data,
        result: response.data?.result,
        hasToken: !!response.data?.data?.token
      });

      if (response.data && response.data.result === 'Success') {
        console.log('✅ Google auth successful:', {
          username: response.data.data?.username,
          name: response.data.data?.name,
          roles: response.data.data?.roles,
          tokenLength: response.data.data?.token?.length
        });
        return response.data;
      } else {
        console.error('❌ Unexpected response format:', response.data);
        throw new Error(response.data?.detail || 'Google authentication failed');
      }
    } catch (error) {
      console.error('❌ Google auth error:', error);

      if (error.response) {
        console.error('Error response:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });

        const errorMessage = error.response.data?.detail ||
                           error.response.data?.message ||
                           `Google authentication failed (${error.response.status})`;
        throw new Error(errorMessage);
      } else if (error.request) {
        console.error('No response received:', error.request);
        throw new Error('Network error during Google authentication');
      } else {
        console.error('Request setup error:', error.message);
        throw new Error(error.message || 'Google authentication failed');
      }
    }
  },

  // Verify Email
  verifyEmail: async (token) => {
    try {
      const response = await api.post(`/auth/verify-email?token=${token}`);

      if (response.data && response.data.result === 'Success') {
        return response.data;
      } else {
        throw new Error(response.data?.detail || 'Email verification failed');
      }
    } catch (error) {
      console.error('Email verification error:', error);
      if (error.response) {
        const errorMessage = error.response.data?.detail ||
                           error.response.data?.message ||
                           'Email verification failed';
        throw new Error(errorMessage);
      } else {
        throw new Error('Network error during email verification');
      }
    }
  },

  // Resend Verification Email
  resendVerificationEmail: async (email) => {
    try {
      const response = await api.post(`/auth/resend-verification?email=${encodeURIComponent(email)}`);

      if (response.data && response.data.result === 'Success') {
        return response.data;
      } else {
        throw new Error(response.data?.detail || 'Failed to resend verification email');
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      if (error.response) {
        const errorMessage = error.response.data?.detail ||
                           error.response.data?.message ||
                           'Failed to resend verification email';
        throw new Error(errorMessage);
      } else {
        throw new Error('Network error');
      }
    }
  },

  // Forgot Password
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });

      if (response.data && response.data.result === 'Success') {
        return response.data;
      } else {
        throw new Error(response.data?.detail || 'Failed to send reset email');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      if (error.response) {
        const errorMessage = error.response.data?.detail ||
                           error.response.data?.message ||
                           'Failed to send reset email';
        throw new Error(errorMessage);
      } else {
        throw new Error('Network error');
      }
    }
  },

  // Reset Password
  resetPassword: async (token, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', {
        token,
        newPassword
      });

      if (response.data && response.data.result === 'Success') {
        return response.data;
      } else {
        throw new Error(response.data?.detail || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      if (error.response) {
        const errorMessage = error.response.data?.detail ||
                           error.response.data?.message ||
                           'Failed to reset password';
        throw new Error(errorMessage);
      } else {
        throw new Error('Network error');
      }
    }
  },

  // Refresh Token
  refreshToken: async (refreshToken) => {
    try {
      const response = await api.post('/auth/refresh-token', { refreshToken });

      if (response.data && response.data.result === 'Success') {
        return response.data;
      } else {
        throw new Error(response.data?.detail || 'Failed to refresh token');
      }
    } catch (error) {
      console.error('Refresh token error:', error);
      if (error.response) {
        const errorMessage = error.response.data?.detail ||
                           error.response.data?.message ||
                           'Failed to refresh token';
        throw new Error(errorMessage);
      } else {
        throw new Error('Network error');
      }
    }
  },

  // Get Current User
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
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

export { authService };
export default authService;
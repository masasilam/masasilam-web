// ============================================
// src/services/authService.js - FIXED ERROR HANDLING
// ============================================

import api from './api';

const authService = {
  // Login - SIMPLIFIED: Let axios error propagate
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);

    if (response.data && response.data.result === 'Success') {
      return response.data;
    } else {
      // Create error that looks like axios error
      const error = new Error(response.data?.detail || 'Login failed');
      error.response = { data: response.data, status: response.status };
      throw error;
    }
  },

  // Register - SIMPLIFIED
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);

    console.log('Register response:', response.data);

    if (response.data && (response.data.result === 'Success' || response.status === 201)) {
      return response.data;
    } else {
      const error = new Error(response.data?.detail || 'Registration failed');
      error.response = { data: response.data, status: response.status };
      throw error;
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

  // Google OAuth - SIMPLIFIED WITH DETAILED LOGGING
  googleAuth: async (idToken) => {
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
      const error = new Error(response.data?.detail || 'Google authentication failed');
      error.response = { data: response.data, status: response.status };
      throw error;
    }
  },

  // Verify Email - SIMPLIFIED
  verifyEmail: async (token) => {
    const response = await api.post(`/auth/verify-email?token=${token}`);

    if (response.data && response.data.result === 'Success') {
      return response.data;
    } else {
      const error = new Error(response.data?.detail || 'Email verification failed');
      error.response = { data: response.data, status: response.status };
      throw error;
    }
  },

  // Resend Verification Email - SIMPLIFIED
  resendVerificationEmail: async (email) => {
    const response = await api.post(`/auth/resend-verification?email=${encodeURIComponent(email)}`);

    if (response.data && response.data.result === 'Success') {
      return response.data;
    } else {
      const error = new Error(response.data?.detail || 'Failed to resend verification email');
      error.response = { data: response.data, status: response.status };
      throw error;
    }
  },

  // Forgot Password - SIMPLIFIED
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });

    if (response.data && response.data.result === 'Success') {
      return response.data;
    } else {
      const error = new Error(response.data?.detail || 'Failed to send reset email');
      error.response = { data: response.data, status: response.status };
      throw error;
    }
  },

  // Reset Password - SIMPLIFIED
  resetPassword: async (token, newPassword) => {
    const response = await api.post('/auth/reset-password', {
      token,
      newPassword
    });

    if (response.data && response.data.result === 'Success') {
      return response.data;
    } else {
      const error = new Error(response.data?.detail || 'Failed to reset password');
      error.response = { data: response.data, status: response.status };
      throw error;
    }
  },

  // Refresh Token - SIMPLIFIED
  refreshToken: async (refreshToken) => {
    const response = await api.post('/auth/refresh-token', { refreshToken });

    if (response.data && response.data.result === 'Success') {
      return response.data;
    } else {
      const error = new Error(response.data?.detail || 'Failed to refresh token');
      error.response = { data: response.data, status: response.status };
      throw error;
    }
  },

  // Get Current User - SIMPLIFIED
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export { authService };
export default authService;
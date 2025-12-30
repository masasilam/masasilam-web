// ============================================
// src/config/env.js
// Centralized environment configuration
// ============================================

const config = {
  // API Configuration
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,

  // App Information
  appName: import.meta.env.VITE_APP_NAME || 'MasasilaM',
  appDescription: import.meta.env.VITE_APP_DESCRIPTION || 'Platform Perpustakaan Digital',

  // Google OAuth
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,

  // Environment flags
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  mode: import.meta.env.MODE,
}

// Validation - Throw errors if critical env vars are missing
if (!config.apiBaseUrl) {
  throw new Error('❌ VITE_API_BASE_URL is required in .env file')
}

if (!config.googleClientId) {
  console.warn('⚠️ VITE_GOOGLE_CLIENT_ID is missing - Google login will not work')
}

// Log configuration in development
if (config.isDevelopment) {
  console.log('🔧 Environment Configuration:', {
    mode: config.mode,
    apiBaseUrl: config.apiBaseUrl,
    appName: config.appName,
    hasGoogleClientId: !!config.googleClientId,
  })
}

export default config
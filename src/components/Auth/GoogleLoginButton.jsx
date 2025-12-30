// ============================================
// src/components/Auth/GoogleLoginButton.jsx
// ============================================

import { useEffect, useRef } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { authService } from '../../services/authService'
import { useNavigate } from 'react-router-dom'
import config from '../../config/env'

const GoogleLoginButton = ({
  onSuccess,
  onError,
  text = "Lanjutkan dengan Google",
  className = ""
}) => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const buttonContainerRef = useRef(null)
  const resizeTimeoutRef = useRef(null)

  useEffect(() => {
    // Load Google Identity Services script
    const loadGoogleScript = () => {
      if (document.getElementById('google-identity-script')) {
        initializeGoogleSignIn()
        return
      }

      const script = document.createElement('script')
      script.id = 'google-identity-script'
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = initializeGoogleSignIn
      document.body.appendChild(script)
    }

    const initializeGoogleSignIn = () => {
      if (!window.google) {
        console.warn('Google Identity Services not loaded')
        return
      }

      // Use centralized config
      const GOOGLE_CLIENT_ID = config.googleClientId

      if (!GOOGLE_CLIENT_ID) {
        console.error('❌ VITE_GOOGLE_CLIENT_ID not configured in .env file')
        return
      }

      console.log('🔵 Initializing Google Sign-In')

      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        })

        // Initial render
        renderButton()

        // Re-render on window resize (debounced)
        window.addEventListener('resize', handleResize)
      } catch (error) {
        console.error('❌ Error initializing Google Sign-In:', error)
      }
    }

    const renderButton = () => {
      const buttonContainer = buttonContainerRef.current
      if (!buttonContainer || !window.google) return

      // Clear existing button
      buttonContainer.innerHTML = ''

      // Get container width dynamically
      const containerWidth = buttonContainer.offsetWidth

      // Google accepts width between 200-400px
      const buttonWidth = Math.min(Math.max(containerWidth, 200), 400)

      if (config.isDevelopment) {
        console.log('🔵 Rendering Google button:', buttonWidth + 'px')
      }

      try {
        window.google.accounts.id.renderButton(
          buttonContainer,
          {
            theme: 'outline',
            size: 'large',
            width: buttonWidth,
            text: 'continue_with',
            shape: 'rectangular',
            logo_alignment: 'left',
          }
        )
      } catch (error) {
        console.error('❌ Error rendering Google button:', error)
      }
    }

    const handleResize = () => {
      // Debounce resize events
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current)
      }

      resizeTimeoutRef.current = setTimeout(() => {
        renderButton()
      }, 250)
    }

    const handleCredentialResponse = async (response) => {
      console.log('🔵 Google credential received')

      try {
        const idToken = response.credential
        console.log('🔵 Sending idToken to backend...')

        const result = await authService.googleAuth(idToken)
        console.log('✅ Backend response:', result)

        if (result && result.data) {
          console.log('✅ Login data received:', {
            username: result.data.username,
            name: result.data.name,
            roles: result.data.roles,
            hasToken: !!result.data.token,
            hasRefreshToken: !!result.data.refreshToken
          })

          // Save auth data to context + localStorage
          await login(
            {
              username: result.data.username,
              name: result.data.name,
              roles: result.data.roles,
            },
            result.data.token,
            result.data.refreshToken
          )

          console.log('✅ Auth context updated')

          // Wait for state to update
          setTimeout(() => {
            if (onSuccess) {
              console.log('🔵 Calling onSuccess callback')
              onSuccess(result)
            } else {
              console.log('🔵 Navigating to /dasbor')
              navigate('/dasbor', { replace: true })
            }
          }, 100)
        } else {
          throw new Error('Invalid response format from server')
        }
      } catch (error) {
        console.error('❌ Google login error:', error)
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        })

        const errorMessage = error.response?.data?.detail ||
                           error.response?.data?.message ||
                           error.message ||
                           'Gagal login dengan Google. Silakan coba lagi.'

        if (onError) {
          onError(errorMessage)
        }
      }
    }

    loadGoogleScript()

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current)
      }
    }
  }, [login, navigate, onSuccess, onError])

  return (
    <div className={`google-login-wrapper ${className}`}>
      <div
        ref={buttonContainerRef}
        className="flex justify-center w-full min-h-[44px]"
      />

      {/* Fallback for browsers without JavaScript */}
      <noscript>
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          JavaScript diperlukan untuk login dengan Google
        </div>
      </noscript>
    </div>
  )
}

export default GoogleLoginButton
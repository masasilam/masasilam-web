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

        renderButton()
        window.addEventListener('resize', handleResize)
      } catch (error) {
        console.error('❌ Error initializing Google Sign-In:', error)
      }
    }

    const renderButton = () => {
      const buttonContainer = buttonContainerRef.current
      if (!buttonContainer || !window.google) return

      buttonContainer.innerHTML = ''
      const containerWidth = buttonContainer.offsetWidth
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
            id: result.data.id,
            username: result.data.username,
            email: result.data.email,
            profilePictureUrl: result.data.profilePictureUrl,
            hasToken: !!result.data.token,
            hasRefreshToken: !!result.data.refreshToken
          })

          // ✅ FIXED: Save ALL user data from backend
          await login(
            {
              id: result.data.id,
              username: result.data.username,
              email: result.data.email,
              roles: result.data.roles,
              fullName: result.data.fullName || result.data.name,
              bio: result.data.bio,
              profilePictureUrl: result.data.profilePictureUrl, // ✅ Now available!
              emailNotifications: result.data.emailNotifications,
              level: result.data.level,
              totalBooksRead: result.data.totalBooksRead,
              readingStreakDays: result.data.readingStreakDays,
              contributedBooksCount: result.data.contributedBooksCount,
              averageRating: result.data.averageRating,
              experiencePoints: result.data.experiencePoints,
            },
            result.data.token,
            result.data.refreshToken
          )

          console.log('✅ Auth context updated with profilePictureUrl:', result.data.profilePictureUrl)

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

        const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Gagal login dengan Google. Silakan coba lagi.'

        if (onError) {
          onError(errorMessage)
        }
      }
    }

    loadGoogleScript()

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

      <noscript>
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          JavaScript diperlukan untuk login dengan Google
        </div>
      </noscript>
    </div>
  )
}

export default GoogleLoginButton
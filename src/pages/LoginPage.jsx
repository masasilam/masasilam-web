// ============================================
// src/pages/LoginPage.jsx - UPDATED WITH GOOGLE LOGIN
// ============================================

import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { authService } from '../services/authService'
import { useAuth } from '../hooks/useAuth'
import Input from '../components/Common/Input'
import Button from '../components/Common/Button'
import Alert from '../components/Common/Alert'
import GoogleLoginButton from '../components/Auth/GoogleLoginButton'

const LoginPage = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [formData, setFormData] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message)
      window.history.replaceState({}, document.title)
    }
  }, [location])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    setLoading(true)

    try {
      const response = await authService.login(formData)

      if (response.data) {
        login(
          {
            username: response.data.username,
            name: response.data.name,
            roles: response.data.roles,
          },
          response.data.token,
          response.data.refreshToken
        )

        navigate('/dasbor')
      }
    } catch (err) {
      console.error('Login error:', err)

      let errorMessage = 'Gagal login. Silakan coba lagi.'

      if (err.response) {
        const status = err.response.status
        const data = err.response.data

        if (status === 401) {
          errorMessage = 'Login gagal. Kemungkinan penyebab:\n• Username atau password salah\n• Email belum diverifikasi'
        } else if (status === 403) {
          errorMessage = 'Akun Anda tidak aktif atau diblokir. Hubungi administrator.'
        } else if (data?.detail) {
          errorMessage = data.detail
        } else if (data?.message) {
          errorMessage = data.message
        } else if (err.message) {
          errorMessage = err.message
        }
      } else if (err.message) {
        errorMessage = err.message
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Handler untuk Google login success
  const handleGoogleSuccess = (result) => {
    console.log('✅ Google login success in LoginPage', result)
    setSuccessMessage('Login dengan Google berhasil!')
    setError('')

    // Navigate to dashboard
    setTimeout(() => {
      navigate('/dasbor', { replace: true })
    }, 500)
  }

  // Handler untuk Google login error
  const handleGoogleError = (errorMessage) => {
    console.error('❌ Google login error in LoginPage:', errorMessage)
    setError(errorMessage)
    setSuccessMessage('')
  }

  return (
    <div className="max-w-md w-full">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Selamat Datang Kembali</h1>
        <p className="text-gray-600 dark:text-gray-400">Masuk ke akun Anda</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        {successMessage && (
          <div className="mb-4">
            <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />
          </div>
        )}

        {error && (
          <div className="mb-4">
            <Alert type="error" message={error} onClose={() => setError('')} />

            {error.includes('Email belum diverifikasi') && (
              <div className="mt-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
                  📧 Email Belum Diverifikasi
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-300 mb-3">
                  Silakan cek inbox email Anda dan klik link verifikasi yang telah kami kirim.
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  Tidak menerima email? Cek folder spam atau{' '}
                  <Link to="/kontak" className="font-medium underline hover:no-underline">
                    hubungi kami
                  </Link>
                </p>
              </div>
            )}
          </div>
        )}

        {/* ========== GOOGLE LOGIN BUTTON ========== */}
        <div className="mb-6">
          <GoogleLoginButton
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
          />
        </div>

        {/* ========== DIVIDER ========== */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              Atau masuk dengan email
            </span>
          </div>
        </div>

        {/* ========== REGULAR LOGIN FORM ========== */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Username"
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
            placeholder="username_anda"
          />

          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            placeholder="••••••••"
          />

          <Button
            type="submit"
            loading={loading}
            fullWidth
            size="lg"
          >
            Masuk
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <Link to="/lupa-kata-sandi" className="text-primary hover:underline">
            Lupa password?
          </Link>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 text-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">Belum punya akun? </span>
          <Link to="/daftar" className="text-primary hover:underline font-medium">
            Daftar sekarang
          </Link>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
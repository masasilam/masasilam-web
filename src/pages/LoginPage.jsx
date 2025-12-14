// src/pages/LoginPage.jsx
import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { authService } from '../services/authService'
import { useAuth } from '../hooks/useAuth'
import Input from '../components/Common/Input'
import Button from '../components/Common/Button'
import Alert from '../components/Common/Alert'

const LoginPage = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [formData, setFormData] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if there's a success message from registration
    if (location.state?.message) {
      setSuccessMessage(location.state.message)
      // Clear the state
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
      
      // Parse error from various sources
      let errorMessage = 'Gagal login. Silakan coba lagi.'
      
      if (err.response) {
        const status = err.response.status
        const data = err.response.data
        
        // Check for 401 Unauthorized
        if (status === 401) {
          // Backend returns 401 for: wrong credentials OR email not verified
          // Since we can't distinguish without backend changes, show comprehensive message
          errorMessage = 'Login gagal. Kemungkinan penyebab:\n• Username atau password salah\n• Email belum diverifikasi'
          setError(errorMessage)
          return
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

  return (
    <div className="max-w-md w-full">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Selamat Datang Kembali</h1>
        <p className="text-gray-600 dark:text-gray-400">Masuk ke akun Anda</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-4">
            <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4">
            <Alert type="error" message={error} onClose={() => setError('')} />
            
            {/* Show helpful info for 401 errors */}
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
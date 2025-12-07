// ============================================
// src/pages/auth/LoginPage.jsx
// ============================================

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import { useAuth } from '../hooks/useAuth'
import Input from '../components/Common/Input'
import Button from '../components/Common/Button'
import Alert from '../components/Common/Alert'

const LoginPage = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
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
      setError('Username atau password salah')
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
        {error && (
          <div className="mb-4">
            <Alert type="error" message={error} onClose={() => setError('')} />
          </div>
        )}

        <div className="space-y-6" onSubmit={handleSubmit}>
          <Input
            label="Username"
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
          />

          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />

          <Button
            onClick={handleSubmit}
            loading={loading}
            fullWidth
            size="lg"
          >
            Masuk
          </Button>
        </div>

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
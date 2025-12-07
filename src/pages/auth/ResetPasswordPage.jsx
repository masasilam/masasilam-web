// ============================================
// src/pages/auth/ResetPasswordPage.jsx
// ============================================

import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { authService } from '../../services/authService'
import Input from '../../components/Common/Input'
import Button from '../../components/Common/Button'
import Alert from '../../components/Common/Alert'
import { validatePassword, validateConfirmPassword } from '../../utils/validation'

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [token, setToken] = useState('')
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (!tokenParam) {
      setApiError('Token reset password tidak valid')
    } else {
      setToken(tokenParam)
    }
  }, [searchParams])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors = {}
    
    const passwordErrors = validatePassword(formData.newPassword)
    if (passwordErrors.length > 0) newErrors.newPassword = passwordErrors[0]
    
    const confirmErrors = validateConfirmPassword(formData.newPassword, formData.confirmPassword)
    if (confirmErrors.length > 0) newErrors.confirmPassword = confirmErrors[0]
    
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError('')

    if (!token) {
      setApiError('Token reset password tidak valid')
      return
    }

    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)
    try {
      await authService.resetPassword(token, formData.newPassword)
      setSuccess(true)
      setTimeout(() => {
        navigate('/masuk', {
          state: { message: 'Password berhasil direset! Silakan login.' }
        })
      }, 2000)
    } catch (err) {
      setApiError('Gagal reset password. Token mungkin sudah kadaluarsa.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Password Berhasil Direset!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Anda sekarang dapat login dengan password baru.
          </p>
          <p className="text-sm text-gray-500">
            Mengarahkan ke halaman login...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md w-full">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Masukkan password baru Anda
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        {apiError && (
          <div className="mb-4">
            <Alert type="error" message={apiError} onClose={() => setApiError('')} />
          </div>
        )}

        <div className="space-y-6">
          <Input
            label="Password Baru"
            name="newPassword"
            type="password"
            value={formData.newPassword}
            onChange={handleChange}
            error={errors.newPassword}
            required
            helperText="Minimal 8 karakter dengan huruf besar, kecil, dan angka"
          />

          <Input
            label="Konfirmasi Password Baru"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            required
          />

          <Button
            onClick={handleSubmit}
            loading={loading}
            fullWidth
            size="lg"
            disabled={!token}
          >
            Reset Password
          </Button>
        </div>

        <div className="mt-6 text-center text-sm">
          <Link to="/masuk" className="text-primary hover:underline">
            Kembali ke login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage
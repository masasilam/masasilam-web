// ============================================
// src/pages/auth/RegisterPage.jsx
// ============================================

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../../services/authService'
import Input from '../../components/Common/Input'
import Button from '../../components/Common/Button'
import Alert from '../../components/Common/Alert'
import { validateUsername, validateEmail, validatePassword, validateConfirmPassword } from '../../utils/validation'

const RegisterPage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    password: '',
    confirmPassword: '',
    bio: ''
  })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors = {}
    
    const usernameErrors = validateUsername(formData.username)
    if (usernameErrors.length > 0) newErrors.username = usernameErrors[0]
    
    const emailErrors = validateEmail(formData.email)
    if (emailErrors.length > 0) newErrors.email = emailErrors[0]
    
    if (!formData.fullName) newErrors.fullName = 'Nama lengkap wajib diisi'
    
    const passwordErrors = validatePassword(formData.password)
    if (passwordErrors.length > 0) newErrors.password = passwordErrors[0]
    
    const confirmErrors = validateConfirmPassword(formData.password, formData.confirmPassword)
    if (confirmErrors.length > 0) newErrors.confirmPassword = confirmErrors[0]
    
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiError('')
    
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)
    try {
      const response = await authService.register({
        username: formData.username,
        email: formData.email,
        fullName: formData.fullName,
        password: formData.password,
        bio: formData.bio || null
      })
      
      if (response.status === 201) {
        setSuccess(true)
        setTimeout(() => {
          navigate('/masuk', {
            state: { message: 'Registrasi berhasil! Silakan cek email untuk verifikasi.' }
          })
        }, 2000)
      }
    } catch (error) {
      setApiError(error.response?.data?.message || 'Gagal mendaftar. Username atau email mungkin sudah digunakan.')
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
          <h2 className="text-2xl font-bold mb-2">Registrasi Berhasil!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Silakan cek email Anda untuk verifikasi akun.
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
        <h1 className="text-3xl font-bold mb-2">Daftar Akun Baru</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Bergabung dengan MasasilaM sekarang
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        {apiError && (
          <div className="mb-4">
            <Alert type="error" message={apiError} onClose={() => setApiError('')} />
          </div>
        )}

        <div className="space-y-4">
          <Input
            label="Username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            error={errors.username}
            required
            placeholder="username_anda"
          />

          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
            placeholder="email@example.com"
          />

          <Input
            label="Nama Lengkap"
            name="fullName"
            type="text"
            value={formData.fullName}
            onChange={handleChange}
            error={errors.fullName}
            required
            placeholder="Nama Lengkap Anda"
          />

          <Input
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            required
            helperText="Minimal 8 karakter dengan huruf besar, kecil, dan angka"
          />

          <Input
            label="Konfirmasi Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            required
          />

          <div>
            <label className="block text-sm font-medium mb-2">
              Bio (Opsional)
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="3"
              placeholder="Ceritakan sedikit tentang Anda..."
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
            />
          </div>

          <Button
            onClick={handleSubmit}
            loading={loading}
            fullWidth
            size="lg"
          >
            Daftar
          </Button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 text-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">Sudah punya akun? </span>
          <Link to="/masuk" className="text-primary hover:underline font-medium">
            Masuk di sini
          </Link>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
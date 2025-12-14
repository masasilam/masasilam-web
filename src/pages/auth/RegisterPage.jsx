// src/pages/auth/RegisterPage.jsx - WITH DEBUG LOGGING

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
      console.log('Validation errors:', validationErrors)
      return
    }

    setLoading(true)
    
    // Prepare request data
    const requestData = {
      username: formData.username,
      email: formData.email,
      fullName: formData.fullName,
      password: formData.password,
      bio: formData.bio || null
    }
    
    console.log('Sending registration request:', {
      ...requestData,
      password: '***hidden***'
    })
    
    try {
      const response = await authService.register(requestData)
      
      console.log('Registration response:', response)
      
      if (response.status === 201 || response.result === 'Success') {
        setSuccess(true)
        // ❌ REMOVED: Auto redirect to login
        // User should verify email first before login
      } else {
        console.warn('Unexpected response format:', response)
        setApiError('Registrasi gagal. Silakan coba lagi.')
      }
    } catch (error) {
      console.error('Registration error:', error)
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      
      // Set more specific error message
      if (error.message) {
        setApiError(error.message)
      } else if (error.response?.data?.detail) {
        setApiError(error.response.data.detail)
      } else if (error.response?.data?.message) {
        setApiError(error.response.data.message)
      } else {
        setApiError('Gagal mendaftar. Username atau email mungkin sudah digunakan.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center mb-2">Registrasi Berhasil!</h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
            Akun Anda telah dibuat dengan email <strong>{formData.email}</strong>
          </p>

          {/* Email Verification Notice */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 mb-6">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-1">
                  Verifikasi Email Diperlukan
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  Kami telah mengirim email verifikasi ke inbox Anda. Silakan cek email dan klik link verifikasi untuk mengaktifkan akun.
                </p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-3 mb-6">
            <div className="flex items-start">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold mr-3 flex-shrink-0 mt-0.5">1</span>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Buka inbox email Anda dan cari email dari <strong>skah.org</strong>
              </p>
            </div>
            <div className="flex items-start">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold mr-3 flex-shrink-0 mt-0.5">2</span>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Klik link verifikasi dalam email (link berlaku 24 jam)
              </p>
            </div>
            <div className="flex items-start">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold mr-3 flex-shrink-0 mt-0.5">3</span>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Setelah verifikasi berhasil, Anda dapat login ke akun Anda
              </p>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-6">
            <p className="text-xs text-yellow-800 dark:text-yellow-300 text-center">
              💡 Tidak menerima email? Cek folder spam/junk atau tunggu beberapa menit
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={() => navigate('/masuk')}
              fullWidth
              size="lg"
            >
              Sudah Verifikasi? Login Sekarang
            </Button>
            
            <button
              onClick={() => {
                setSuccess(false)
                setFormData({
                  username: '',
                  email: '',
                  fullName: '',
                  password: '',
                  confirmPassword: '',
                  bio: ''
                })
              }}
              className="w-full text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
            >
              Daftar dengan email lain
            </button>
          </div>
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
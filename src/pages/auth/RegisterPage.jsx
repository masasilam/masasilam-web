// ============================================
// src/pages/auth/RegisterPage.jsx - WITH DESCRIPTIVE ERROR MESSAGES
// ============================================

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../../services/authService'
import Input from '../../components/Common/Input'
import Button from '../../components/Common/Button'
import Alert from '../../components/Common/Alert'
import GoogleLoginButton from '../../components/Auth/GoogleLoginButton'
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

    const requestData = {
      username: formData.username,
      email: formData.email,
      fullName: formData.fullName,
      password: formData.password,
      bio: formData.bio || null
    }

    try {
      const response = await authService.register(requestData)

      if (response.status === 201 || response.result === 'Success') {
        setSuccess(true)
      } else {
        setApiError('Registrasi gagal. Silakan coba lagi.')
      }
    } catch (err) {
      console.error('Register error:', err)
      console.error('Error details:', {
        hasResponse: !!err.response,
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      })

      let errorMessage = 'Gagal mendaftar. Silakan coba lagi.'

      if (err.response) {
        const status = err.response.status
        const data = err.response.data

        // Prioritaskan pesan dari backend, tapi terjemahkan ke Indonesia
        if (data?.detail) {
          // Terjemahkan pesan backend umum ke Indonesia
          const translatedMessages = {
            'Data already exists': 'Username atau email sudah digunakan',
            'Data already exists.': 'Username atau email sudah digunakan',
            'Username already exists': 'Username sudah digunakan',
            'Username already exists.': 'Username sudah digunakan',
            'Email already exists': 'Email sudah terdaftar',
            'Email already exists.': 'Email sudah terdaftar',
            'Username already taken': 'Username sudah digunakan',
            'Username already taken.': 'Username sudah digunakan',
            'Email already registered': 'Email sudah terdaftar',
            'Email already registered.': 'Email sudah terdaftar',
            'Invalid email format': 'Format email tidak valid',
            'Invalid email format.': 'Format email tidak valid',
            'Password too weak': 'Password terlalu lemah',
            'Password too weak.': 'Password terlalu lemah',
            'Username too short': 'Username terlalu pendek',
            'Username too short.': 'Username terlalu pendek',
            'Invalid username': 'Username tidak valid',
            'Invalid username.': 'Username tidak valid',
            'Request failed with status code 409': 'Username atau email sudah digunakan',
            'Conflict': 'Username atau email sudah digunakan'
          }
          errorMessage = translatedMessages[data.detail] || data.detail
        } else if (data?.message) {
          errorMessage = data.message
        } else if (status === 409) {
          errorMessage = 'Username atau email sudah digunakan. Silakan gunakan yang lain'
        } else if (status === 400) {
          errorMessage = 'Data tidak valid. Periksa kembali informasi yang Anda masukkan'
        } else if (status === 422) {
          errorMessage = 'Format data tidak sesuai. Periksa kembali semua field'
        } else if (status === 500) {
          errorMessage = 'Terjadi kesalahan server. Silakan coba lagi nanti'
        } else if (status === 503) {
          errorMessage = 'Layanan sedang dalam pemeliharaan. Silakan coba lagi nanti'
        } else {
          errorMessage = `Terjadi kesalahan (${status}). Silakan coba lagi`
        }
      } else if (err.request) {
        errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda'
      } else if (err.message) {
        // Handle pesan error langsung
        if (err.message.includes('409')) {
          errorMessage = 'Username atau email sudah digunakan. Silakan gunakan yang lain'
        } else {
          errorMessage = `Terjadi kesalahan: ${err.message}`
        }
      }

      setApiError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Handler untuk Google registration - langsung ke dashboard
  const handleGoogleSuccess = () => {
    // Google user auto-verified, langsung masuk
    navigate('/dasbor')
  }

  const handleGoogleError = (errorMessage) => {
    setApiError(errorMessage)
  }

  if (success) {
    return (
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-center mb-2">Registrasi Berhasil!</h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
            Akun Anda telah dibuat dengan email <strong>{formData.email}</strong>
          </p>

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
                  Kami telah mengirim email verifikasi. Silakan cek inbox dan klik link verifikasi.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-start">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold mr-3 flex-shrink-0 mt-0.5">1</span>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Buka inbox email dan cari email dari <strong>naskah.org</strong>
              </p>
            </div>
            <div className="flex items-start">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold mr-3 flex-shrink-0 mt-0.5">2</span>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Klik link verifikasi (berlaku 24 jam)
              </p>
            </div>
            <div className="flex items-start">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold mr-3 flex-shrink-0 mt-0.5">3</span>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Login ke akun Anda
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Button onClick={() => navigate('/masuk')} fullWidth size="lg">
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
          Bergabung dengan Naskah sekarang
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        {apiError && (
          <div className="mb-4">
            <Alert type="error" message={apiError} onClose={() => setApiError('')} />

            {/* Tambahan info untuk error tertentu */}
            {apiError.includes('Username') && apiError.includes('sudah') && (
              <div className="mt-3 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <p className="text-sm font-semibold text-orange-900 dark:text-orange-200 mb-2">
                  💡 Tips Memilih Username
                </p>
                <ul className="text-sm text-orange-800 dark:text-orange-300 space-y-1 list-disc list-inside">
                  <li>Gunakan kombinasi huruf dan angka</li>
                  <li>Hindari karakter spesial</li>
                  <li>Minimal 3 karakter</li>
                </ul>
              </div>
            )}

            {apiError.includes('Email') && apiError.includes('sudah') && (
              <div className="mt-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  Email ini sudah terdaftar. Apakah Anda sudah punya akun?{' '}
                  <Link to="/masuk" className="font-medium underline hover:no-underline">
                    Masuk di sini
                  </Link>
                  {' '}atau{' '}
                  <Link to="/lupa-kata-sandi" className="font-medium underline hover:no-underline">
                    reset password
                  </Link>
                </p>
              </div>
            )}
          </div>
        )}

        {/* ========== GOOGLE SIGN UP ========== */}
        <div className="mb-6">
          <GoogleLoginButton
            text="Daftar dengan Google"
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
              Atau daftar dengan email
            </span>
          </div>
        </div>

        {/* ========== REGULAR REGISTRATION FORM ========== */}
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
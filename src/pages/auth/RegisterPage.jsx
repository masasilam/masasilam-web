import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle2, Mail, Loader2, ArrowRight } from 'lucide-react'
import { authService } from '../../services/authService'
import Input from '../../components/Common/Input'
import Button from '../../components/Common/Button'
import Alert from '../../components/Common/Alert'
import GoogleLoginButton from '../../components/Auth/GoogleLoginButton'
import { validateUsername, validateEmail, validatePassword, validateConfirmPassword } from '../../utils/validation'

const ERROR_MAP = {
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
  'Invalid username.': 'Username tidak valid'
}

const RegisterPage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ username: '', email: '', fullName: '', password: '', confirmPassword: '', bio: '' })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendMessage, setResendMessage] = useState('')
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
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
        setCooldown(60)
      } else {
        setApiError('Registrasi gagal. Silakan coba lagi.')
      }
    } catch (err) {
      let errorMessage = 'Gagal mendaftar. Silakan coba lagi.'
      if (err.response) {
        const status = err.response.status
        const data = err.response.data
        if (data?.detail) {
          errorMessage = ERROR_MAP[data.detail] || data.detail
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
        errorMessage = err.message.includes('409') ? 'Username atau email sudah digunakan. Silakan gunakan yang lain' : `Terjadi kesalahan: ${err.message}`
      }
      setApiError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (cooldown > 0) return
    setResending(true)
    setResendMessage('')
    try {
      await authService.resendVerificationEmail(formData.email)
      setResendMessage('Email verifikasi baru sudah dikirim')
      setCooldown(60)
    } catch {
      setResendMessage('Gagal mengirim ulang. Coba lagi sebentar')
    } finally {
      setResending(false)
    }
  }

  const handleGoogleSuccess = () => navigate('/dasbor')
  const handleGoogleError = (errorMessage) => setApiError(errorMessage)

  if (success) {
    return (
      <div className="max-w-md w-full mx-auto px-4 animate-in fade-in duration-300">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-2">Registrasi Berhasil!</h2>
          <p className="text-center text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
            Akun Anda telah dibuat dengan email <strong className="break-all">{formData.email}</strong>
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-r-lg p-4 mb-6 flex items-start gap-3">
            <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm sm:text-base text-blue-900 dark:text-blue-200 mb-1">Verifikasi Email Diperlukan</h3>
              <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-300">Kami telah mengirim email verifikasi. Silakan cek inbox dan klik link verifikasi.</p>
            </div>
          </div>
          <div className="space-y-3 mb-6">
            {['Buka inbox email dan cari email dari MasasilaM', 'Klik link verifikasi (berlaku 24 jam)', 'Login ke akun Anda'].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex-shrink-0">{i + 1}</span>
                <p className="text-sm text-gray-700 dark:text-gray-300 pt-0.5">{step}</p>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <button onClick={handleResend} disabled={cooldown > 0 || resending} className="w-full flex items-center justify-center gap-2 text-sm font-medium text-primary hover:underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed py-2">
              {resending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Mengirim ulang...</>
              ) : cooldown > 0 ? (
                `Kirim ulang dalam ${cooldown}s`
              ) : (
                'Tidak menerima email? Kirim ulang'
              )}
            </button>
            {resendMessage && <p className="text-center text-xs text-gray-500 dark:text-gray-400">{resendMessage}</p>}
            <Button onClick={() => navigate('/masuk')} fullWidth size="lg">Sudah Verifikasi? Login Sekarang</Button>
            <button
              onClick={() => {
                setSuccess(false)
                setFormData({ username: '', email: '', fullName: '', password: '', confirmPassword: '', bio: '' })
              }}
              className="w-full text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors py-1"
            >
              Daftar dengan email lain
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md w-full mx-auto px-4">
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Daftar Akun Baru</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Bergabung dengan MasasilaM sekarang</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8">
        {apiError && (
          <div className="mb-4">
            <Alert type="error" message={apiError} onClose={() => setApiError('')} />
            {apiError.includes('Username') && apiError.includes('sudah') && (
              <div className="mt-3 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <p className="text-sm font-semibold text-orange-900 dark:text-orange-200 mb-2">Tips Memilih Username</p>
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
                  <Link to="/masuk" className="font-medium underline hover:no-underline">Masuk di sini</Link>{' '}atau{' '}
                  <Link to="/lupa-kata-sandi" className="font-medium underline hover:no-underline">reset password</Link>
                </p>
              </div>
            )}
          </div>
        )}
        <div className="mb-6">
          <GoogleLoginButton text="Daftar dengan Google" onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
        </div>
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Atau daftar dengan email</span>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Username" name="username" type="text" value={formData.username} onChange={handleChange} error={errors.username} required placeholder="username_anda" autoComplete="username" />
          <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} error={errors.email} required placeholder="email@example.com" autoComplete="email" />
          <Input label="Nama Lengkap" name="fullName" type="text" value={formData.fullName} onChange={handleChange} error={errors.fullName} required placeholder="Nama Lengkap Anda" autoComplete="name" />
          <Input label="Password" name="password" type="password" value={formData.password} onChange={handleChange} error={errors.password} required helperText="Minimal 8 karakter dengan huruf besar, kecil, dan angka" autoComplete="new-password" />
          <Input label="Konfirmasi Password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} required autoComplete="new-password" />
          <div>
            <label className="block text-sm font-medium mb-2">Bio (Opsional)</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="3"
              placeholder="Ceritakan sedikit tentang Anda..."
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
            />
          </div>
          <Button type="submit" loading={loading} fullWidth size="lg">
            {loading ? 'Membuat akun & mengirim email verifikasi...' : (<span className="flex items-center justify-center gap-2">Daftar <ArrowRight className="w-4 h-4" /></span>)}
          </Button>
        </form>
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 text-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">Sudah punya akun? </span>
          <Link to="/masuk" className="text-primary hover:underline font-medium">Masuk di sini</Link>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
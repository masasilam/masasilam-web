import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react'
import { authService } from '../../services/authService'
import Input from '../../components/Common/Input'
import Button from '../../components/Common/Button'
import Alert from '../../components/Common/Alert'
import { validatePassword, validateConfirmPassword } from '../../utils/validation'

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [token, setToken] = useState('')
  const [tokenInvalid, setTokenInvalid] = useState(false)
  const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (!tokenParam) {
      setTokenInvalid(true)
    } else {
      setToken(tokenParam)
    }
  }, [searchParams])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
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
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setLoading(true)
    try {
      await authService.resetPassword(token, formData.newPassword)
      setSuccess(true)
      setTimeout(() => navigate('/masuk', { state: { message: 'Password berhasil direset! Silakan login.' } }), 2000)
    } catch {
      setApiError('Gagal reset password. Token mungkin sudah kadaluarsa.')
    } finally {
      setLoading(false)
    }
  }

  if (tokenInvalid) {
    return (
      <div className="max-w-md w-full mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Link Tidak Valid</h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">Link reset password tidak ditemukan atau sudah kadaluarsa.</p>
          <Link to="/lupa-kata-sandi">
            <Button fullWidth size="lg">Minta Link Baru</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="max-w-md w-full mx-auto px-4 animate-in fade-in duration-300">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Password Berhasil Direset!</h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">Anda sekarang dapat login dengan password baru.</p>
          <p className="text-sm text-gray-500">Mengarahkan ke halaman login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md w-full mx-auto px-4">
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Reset Password</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Masukkan password baru Anda</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8">
        {apiError && <div className="mb-4"><Alert type="error" message={apiError} onClose={() => setApiError('')} /></div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input label="Password Baru" name="newPassword" type="password" value={formData.newPassword} onChange={handleChange} error={errors.newPassword} required helperText="Minimal 8 karakter dengan huruf besar, kecil, dan angka" autoComplete="new-password" autoFocus />
          <Input label="Konfirmasi Password Baru" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} required autoComplete="new-password" />
          <Button type="submit" loading={loading} fullWidth size="lg">
            {loading ? 'Menyimpan password baru...' : (<span className="flex items-center justify-center gap-2">Reset Password <ArrowRight className="w-4 h-4" /></span>)}
          </Button>
        </form>
        <div className="mt-6 text-center text-sm">
          <Link to="/masuk" className="text-primary hover:underline">Kembali ke login</Link>
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowRight, Loader2 } from 'lucide-react'
import { authService } from '../../services/authService'
import Input from '../../components/Common/Input'
import Button from '../../components/Common/Button'
import Alert from '../../components/Common/Alert'
import { validateEmail } from '../../utils/validation'

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const emailErrors = validateEmail(email)
    if (emailErrors.length > 0) {
      setError(emailErrors[0])
      return
    }
    setLoading(true)
    try {
      await authService.forgotPassword(email)
      setSuccess(true)
      setCooldown(60)
    } catch {
      setError('Gagal mengirim email reset password')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (cooldown > 0) return
    setResending(true)
    try {
      await authService.forgotPassword(email)
      setCooldown(60)
    } catch {
      setError('Gagal mengirim ulang. Coba lagi sebentar')
    } finally {
      setResending(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-md w-full mx-auto px-4 animate-in fade-in duration-300">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Email Terkirim!</h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
            Kami telah mengirim link reset password ke <strong className="break-all">{email}</strong>
          </p>
          <p className="text-sm text-gray-500 mb-6">Cek inbox atau folder spam Anda. Link akan kadaluarsa dalam 1 jam.</p>
          {error && <div className="mb-4"><Alert type="error" message={error} onClose={() => setError('')} /></div>}
          <div className="space-y-3">
            <button onClick={handleResend} disabled={cooldown > 0 || resending} className="w-full flex items-center justify-center gap-2 text-sm font-medium text-primary hover:underline disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed py-2">
              {resending ? (<><Loader2 className="w-4 h-4 animate-spin" /> Mengirim ulang...</>) : cooldown > 0 ? `Kirim ulang dalam ${cooldown}s` : 'Tidak menerima email? Kirim ulang'}
            </button>
            <Link to="/masuk">
              <Button fullWidth size="lg">Kembali ke Login</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md w-full mx-auto px-4">
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Lupa Password?</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Masukkan email Anda untuk reset password</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8">
        {error && <div className="mb-4"><Alert type="error" message={error} onClose={() => setError('')} /></div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" required autoComplete="email" autoFocus />
          <Button type="submit" loading={loading} fullWidth size="lg">
            {loading ? 'Mengirim link reset...' : (<span className="flex items-center justify-center gap-2">Kirim Link Reset <ArrowRight className="w-4 h-4" /></span>)}
          </Button>
        </form>
        <div className="mt-6 text-center text-sm">
          <Link to="/masuk" className="text-primary hover:underline">Kembali ke login</Link>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
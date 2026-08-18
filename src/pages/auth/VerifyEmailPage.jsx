import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, XCircle } from 'lucide-react'
import { authService } from '../../services/authService'
import Button from '../../components/Common/Button'
import LoadingSpinner from '../../components/Common/LoadingSpinner'

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setStatus('error')
      setMessage('Token verifikasi tidak valid')
      return
    }
    const verifyEmail = async () => {
      try {
        const response = await authService.verifyEmail(token)
        setStatus('success')
        setMessage(response.message || 'Email berhasil diverifikasi!')
      } catch (error) {
        setStatus('error')
        setMessage(error.response?.data?.message || 'Verifikasi gagal. Token mungkin sudah kadaluarsa.')
      }
    }
    verifyEmail()
  }, [searchParams])

  if (status === 'loading') {
    return (
      <div className="max-w-md w-full mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8 text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-sm sm:text-base text-gray-600 dark:text-gray-400">Memverifikasi email Anda...</p>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="max-w-md w-full mx-auto px-4 animate-in fade-in duration-300">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Verifikasi Berhasil!</h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">{message}</p>
          <Link to="/masuk">
            <Button fullWidth size="lg">Login Sekarang</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md w-full mx-auto px-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8 text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold mb-2">Verifikasi Gagal</h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">{message}</p>
        <div className="space-y-3">
          <Link to="/masuk">
            <Button fullWidth variant="secondary">Kembali ke Login</Button>
          </Link>
          <p className="text-sm text-gray-500">
            Butuh link verifikasi baru?{' '}
            <Link to="/kontak" className="text-primary hover:underline">Hubungi kami</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default VerifyEmailPage
// ============================================
// src/pages/auth/ForgotPasswordPage.jsx
// ============================================

import { useState } from 'react'
import { Link } from 'react-router-dom'
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
    } catch (err) {
      setError('Gagal mengirim email reset password')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Email Terkirim!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Kami telah mengirim link reset password ke <strong>{email}</strong>
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Cek inbox atau folder spam Anda. Link akan kadaluarsa dalam 1 jam.
          </p>
          <Link to="/masuk" className="btn-primary">
            Kembali ke Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md w-full">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Lupa Password?</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Masukkan email Anda untuk reset password
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        {error && (
          <div className="mb-4">
            <Alert type="error" message={error} onClose={() => setError('')} />
          </div>
        )}

        <div className="space-y-6">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            required
          />

          <Button
            onClick={handleSubmit}
            loading={loading}
            fullWidth
            size="lg"
          >
            Kirim Link Reset
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

export default ForgotPasswordPage
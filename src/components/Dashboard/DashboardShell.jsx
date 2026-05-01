// src/components/Dashboard/DashboardShell.jsx
//
// Wrapper loading & error yang SERAGAM untuk semua halaman dashboard.
// Pakai ini di setiap halaman dashboard sebagai pengganti
// `if (loading) return <LoadingSpinner />` yang posisinya berbeda-beda.
//
// Cara pakai:
//   import DashboardShell from '../../components/Dashboard/DashboardShell'
//
//   const MyPage = () => {
//     const [loading, setLoading] = useState(true)
//     const [error,   setError]   = useState(null)  // null | 'auth' | 'network'
//
//     const handleLogin = () => navigate('/masuk', { state: { from: '/dasbor/...' } })
//
//     return (
//       <DashboardShell loading={loading} error={error} onRetry={fetch} onLogin={handleLogin}>
//         {/* konten halaman */}
//       </DashboardShell>
//     )
//   }

import { useNavigate } from 'react-router-dom'
import { Book } from 'lucide-react'
import LoadingSpinner from '../Common/LoadingSpinner'

const DashboardShell = ({ children, loading, error, onRetry, onLogin }) => {
  const navigate = useNavigate()

  const handleLogin = onLogin || (() => navigate('/masuk', { state: { from: window.location.pathname } }))

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    )
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    const isAuth = error === 'auth'
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
          <Book className="w-8 h-8 text-amber-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {isAuth ? 'Sesi telah berakhir' : 'Gagal memuat data'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
            {isAuth
              ? 'Silakan masuk kembali untuk melanjutkan.'
              : 'Terjadi kesalahan. Periksa koneksi internet kamu.'}
          </p>
        </div>
        {isAuth ? (
          <button
            onClick={handleLogin}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition"
          >
            Masuk Kembali
          </button>
        ) : (
          <button
            onClick={onRetry}
            className="px-6 py-2.5 bg-primary hover:opacity-90 text-white text-sm font-semibold rounded-lg transition"
          >
            Coba Lagi
          </button>
        )}
      </div>
    )
  }

  // ── Konten normal ─────────────────────────────────────────────────────────
  return children
}

export default DashboardShell
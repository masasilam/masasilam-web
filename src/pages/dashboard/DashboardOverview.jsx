// ============================================
// FILE: src/pages/dashboard/DashboardOverview.jsx
// ============================================
import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { dashboardService } from '../../services/dashboardService'
import {
  Book, Clock, Star, TrendingUp, Flame, Bookmark,
  Highlighter, MessageSquare, Award, Target, Calendar,
} from 'lucide-react'
import LoadingSpinner from '../../components/Common/LoadingSpinner'
import { readingPositionLabel } from '../../utils/epubUtils'

// ── Sub-components ────────────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, color, subtitle }) => (
  <article className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow">
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">{label}</h3>
      <Icon className={`w-6 h-6 sm:w-8 sm:h-8 ${color} opacity-50`} aria-hidden="true" />
    </div>
    <p className="text-2xl sm:text-3xl font-bold mb-1">{value}</p>
    {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
  </article>
)

const QuickLink = ({ to, icon: Icon, label, count }) => (
  <Link
    to={to}
    className="flex flex-col items-center gap-2 p-3 sm:p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-700 transition-all touch-manipulation focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
  >
    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" aria-hidden="true" />
    <span className="text-xs sm:text-sm font-medium text-center">{label}</span>
    {count !== undefined && <span className="text-xs text-gray-500">{count}</span>}
  </Link>
)

const activityLabel = (type) => {
  switch (type) {
    case 'completed': return 'Selesai'
    case 'reading':   return 'Sedang dibaca'
    case 'started':   return 'Baru dimulai'
    default:          return 'Dibaca'
  }
}

const activityClass = (type) => {
  switch (type) {
    case 'completed':
      return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
    case 'reading':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
  }
}

const buildBookUrl   = (slug) => slug ? `/buku/${slug}/baca` : '#'
const buildBookState = (lastCfi) => lastCfi ? { lastCfi } : {}

// ── DashboardShell ────────────────────────────────────────────────────────────
// Shared loading/error wrapper — semua halaman dashboard bisa pakai ini
// agar spinner dan layout error konsisten.
export const DashboardShell = ({ children, loading, error, onRetry, onLogin }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    )
  }

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
              : 'Terjadi kesalahan saat mengambil data. Periksa koneksi internet kamu.'}
          </p>
        </div>
        {isAuth ? (
          <button
            onClick={onLogin}
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

  return children
}

// ── DashboardOverview ─────────────────────────────────────────────────────────

const DashboardOverview = () => {
  const { user } = useAuth()
  const navigate  = useNavigate()
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  // fetchData didefinisikan di DALAM komponen agar punya akses ke setState
  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await dashboardService.getMainDashboard()
      setData(res?.data || null)
    } catch (err) {
      // 401 dari server → token invalid / revoked
      if (err?.response?.status === 401) {
        setError('auth')
      } else {
        setError('network')
      }
      console.error('Dashboard fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    document.title = 'Dashboard - MasasilaM'
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', 'Lacak progres membaca, statistik, dan pencapaian Anda')
    fetchData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const stats        = useMemo(() => data?.overviewStats      || {}, [data])
  const reading      = useMemo(() => data?.booksInProgress    || [], [data])
  const pattern      = useMemo(() => data?.readingPattern     || {}, [data])
  const recent       = useMemo(() => data?.recentlyRead       || [], [data])
  const notes        = useMemo(() => data?.annotationsSummary || {}, [data])
  const achievements = useMemo(() => data?.recentAchievements || [], [data])

  // Pakai estimasi WPM jika nilai utama 0 (konsisten dengan StatisticsPage)
  const displaySpeedWpm = pattern.averageReadingSpeedWpm > 0
    ? pattern.averageReadingSpeedWpm
    : (pattern.estimatedReadingSpeedWpm || 0)

  const speedValue = displaySpeedWpm > 0
    ? `${Math.round(displaySpeedWpm)} wpm`
    : '-'

  const handleLogin = () => {
    navigate('/masuk', { state: { from: '/dasbor' } })
  }

  return (
    <DashboardShell
      loading={loading}
      error={error}
      onRetry={fetchData}
      onLogin={handleLogin}
    >
      <div className="space-y-6 sm:space-y-8">

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-primary to-purple-500 rounded-lg p-6 sm:p-8 text-white shadow-xl">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            Selamat Datang, {user?.name || user?.username}! 👋
          </h1>
          <p className="opacity-90 text-sm sm:text-base">
            {(stats.currentStreak || 0) > 0
              ? `Streak ${stats.currentStreak} hari! 🔥`
              : 'Mulai membaca hari ini'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <StatCard
            icon={Book}  label="Total Buku"
            value={stats.totalBooks || 0}
            color="text-primary"
            subtitle={`${stats.booksCompleted || 0} selesai`}
          />
          <StatCard
            icon={Clock} label="Waktu Baca"
            value={`${stats.totalReadingTimeHours || 0}j`}
            color="text-blue-500"
            subtitle="Total jam"
          />
          <StatCard
            icon={Flame} label="Streak"
            value={stats.currentStreak || 0}
            color="text-orange-500"
            subtitle={`Terpanjang: ${stats.longestStreak || 0}`}
          />
          <StatCard
            icon={Star}  label="Rating"
            value={(stats.averageRating || 0).toFixed(1)}
            color="text-yellow-500"
            subtitle={`${(stats.completionRate || 0).toFixed(0)}% selesai`}
          />
        </div>

        {/* Reading Progress & Pattern */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

          {/* Sedang Dibaca */}
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold">Sedang Dibaca</h2>
              <Link
                to="/dasbor/perpustakaan?filter=reading"
                className="text-primary text-sm hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
              >
                Semua
              </Link>
            </div>
            {reading.length === 0 ? (
              <p className="text-gray-500 text-center py-8 text-sm">Belum ada buku</p>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {reading.map(b => (
                  <div
                    key={b.bookId}
                    onClick={() => navigate(buildBookUrl(b.bookSlug), { state: buildBookState(b.lastCfi) })}
                    className="flex gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    role="link"
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && navigate(buildBookUrl(b.bookSlug), { state: buildBookState(b.lastCfi) })}
                  >
                    <div className="w-12 sm:w-14 flex-shrink-0 rounded overflow-hidden">
                      <img
                        src={b.coverImageUrl || '/placeholder.jpg'}
                        alt={`Cover ${b.bookTitle}`}
                        className="w-full h-auto block"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{b.bookTitle}</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 truncate">{b.authorName}</p>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-1">
                        <div
                          className="bg-primary h-1.5 rounded-full transition-all"
                          style={{ width: `${b.progressPercentage || 0}%` }}
                          role="progressbar"
                          aria-valuenow={b.progressPercentage || 0}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        {readingPositionLabel(b.currentChapter, b.totalChapters, b.progressPercentage, b.lastCfi)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Pola Membaca */}
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold mb-4">Pola Membaca</h2>
            <div className="space-y-3 sm:space-y-4">
              {[
                {
                  icon: Clock, color: 'text-blue-500',
                  label: 'Waktu Favorit',
                  value: pattern.preferredReadingTime || '-',
                },
                {
                  icon: TrendingUp, color: 'text-green-500',
                  label: 'Kecepatan',
                  value: speedValue,
                },
                {
                  icon: Target, color: 'text-purple-500',
                  label: 'Durasi Sesi',
                  value: `${pattern.averageSessionMinutes || 0} menit`,
                },
                {
                  icon: Flame, color: 'text-orange-500',
                  label: 'Pace',
                  value: pattern.readingPace || '-',
                },
              ].map(({ icon: Icon, color, label, value }) => (
                <div key={label} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${color}`} aria-hidden="true" />
                    <span className="text-sm">{label}</span>
                  </div>
                  <span className="font-semibold text-sm sm:text-base">{value}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Terakhir Dibaca */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold">Terakhir Dibaca</h2>
            <Link
              to="/dasbor/riwayat"
              className="text-primary text-sm hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
            >
              Riwayat
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="text-gray-500 text-center py-8 text-sm">Belum ada riwayat</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {recent.slice(0, 6).map((r, idx) => (
                <div
                  key={`${r.bookId}-${idx}`}
                  onClick={() => navigate(buildBookUrl(r.bookSlug), { state: buildBookState(r.lastCfi) })}
                  className="flex gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  role="link"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && navigate(buildBookUrl(r.bookSlug), { state: buildBookState(r.lastCfi) })}
                >
                  <div className="w-12 sm:w-14 flex-shrink-0 rounded overflow-hidden">
                    <img
                      src={r.coverImageUrl || '/placeholder.jpg'}
                      alt={`Cover ${r.bookTitle}`}
                      className="w-full h-auto block"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm mb-1 truncate">{r.bookTitle}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 truncate">{r.authorName}</p>
                    <span className={`inline-block px-2 py-0.5 text-xs rounded ${activityClass(r.activityType)}`}>
                      {activityLabel(r.activityType)}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {readingPositionLabel(r.currentChapter, r.totalChapters, r.progressPercentage, r.lastCfi)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Anotasi & Pencapaian */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold mb-4">Anotasi</h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
              {[
                { icon: Bookmark,      bg: 'bg-yellow-50 dark:bg-yellow-900/20', color: 'text-yellow-600', count: notes.totalBookmarks  || 0, label: 'Penanda'   },
                { icon: Highlighter,   bg: 'bg-blue-50 dark:bg-blue-900/20',     color: 'text-blue-600',   count: notes.totalHighlights || 0, label: 'Highlight' },
                { icon: MessageSquare, bg: 'bg-green-50 dark:bg-green-900/20',   color: 'text-green-600',  count: notes.totalNotes      || 0, label: 'Catatan'   },
                { icon: Star,          bg: 'bg-purple-50 dark:bg-purple-900/20', color: 'text-purple-600', count: notes.totalReviews    || 0, label: 'Ulasan'    },
              ].map(({ icon: Icon, bg, color, count, label }) => (
                <div key={label} className={`text-center p-3 sm:p-4 ${bg} rounded-lg`}>
                  <Icon className={`w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 ${color}`} aria-hidden="true" />
                  <div className="text-xl sm:text-2xl font-bold">{count}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{label}</div>
                </div>
              ))}
            </div>
            <Link
              to="/dasbor/anotasi"
              className="block text-center text-primary hover:underline text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
            >
              Lihat Semua
            </Link>
          </section>

          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold">Pencapaian</h2>
              <Link
                to="/dasbor/pencapaian"
                className="text-primary text-sm hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
              >
                Semua
              </Link>
            </div>
            {achievements.length === 0 ? (
              <p className="text-gray-500 text-center py-8 text-sm">Belum ada pencapaian</p>
            ) : (
              <div className="space-y-3">
                {achievements.map(a => (
                  <div
                    key={a.achievementId}
                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg"
                  >
                    <Award className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500 flex-shrink-0" aria-hidden="true" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{a.title}</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{a.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Quick Access */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold mb-4">Akses Cepat</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <QuickLink to="/dasbor/perpustakaan" icon={Book}       label="Perpustakaan" count={stats.totalBooks} />
            <QuickLink to="/dasbor/statistik"    icon={TrendingUp} label="Statistik" />
            <QuickLink to="/dasbor/kalender"     icon={Calendar}   label="Kalender" />
            <QuickLink to="/dasbor/pencapaian"   icon={Award}      label="Pencapaian" />
          </div>
        </section>

      </div>
    </DashboardShell>
  )
}

export default DashboardOverview
import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { dashboardService } from '../../services/dashboardService'
import {
  Book, Clock, Star, TrendingUp, Flame, Bookmark,
  Highlighter, MessageSquare, Award, Target, Calendar,
  ChevronRight, Zap, BookOpen, BarChart2, ArrowUpRight,
} from 'lucide-react'
import LoadingSpinner from '../../components/Common/LoadingSpinner'
import { readingPositionLabel } from '../../utils/epubUtils'

// ── Shared shell ──────────────────────────────────────────────────────────────
export const DashboardShell = ({ children, loading, error, onRetry, onLogin }) => {
  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <LoadingSpinner />
    </div>
  )
  if (error) {
    const isAuth = error === 'auth'
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
          <Book className="w-8 h-8 text-amber-500" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-stone-900 dark:text-slate-100 mb-1">
            {isAuth ? 'Sesi telah berakhir' : 'Gagal memuat data'}
          </h2>
          <p className="text-sm text-stone-500 dark:text-slate-400 max-w-xs">
            {isAuth ? 'Silakan masuk kembali untuk melanjutkan.' : 'Terjadi kesalahan. Periksa koneksi internet kamu.'}
          </p>
        </div>
        <button
          onClick={isAuth ? onLogin : onRetry}
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 text-sm font-bold rounded-xl transition-all"
        >
          {isAuth ? 'Masuk Kembali' : 'Coba Lagi'}
        </button>
      </div>
    )
  }
  return children
}

// ── Stat Card — redesigned ────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, subtitle, color, bg, trend }) => (
  <article className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-slate-700/80 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group">
    {/* Decorative background circle */}
    <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full ${bg} opacity-40 group-hover:opacity-60 transition-opacity`} />
    <div className="relative">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
          <Icon className={`w-5 h-5 ${color}`} aria-hidden="true" />
        </div>
        {trend != null && (
          <span className="flex items-center gap-0.5 text-[11px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
            <ArrowUpRight className="w-3 h-3" />{trend}%
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-stone-900 dark:text-slate-50 mb-0.5 tabular-nums">{value}</p>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 dark:text-slate-500 mb-0.5">{label}</p>
      {subtitle && <p className="text-xs text-stone-400 dark:text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
  </article>
)

// ── Quick Link ────────────────────────────────────────────────────────────────
const QuickLink = ({ to, icon: Icon, label, count, color, bg }) => (
  <Link
    to={to}
    className="group flex flex-col items-center gap-2.5 p-4 rounded-2xl border border-stone-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 hover:border-amber-400 dark:hover:border-amber-500/60 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
  >
    <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
      <Icon className={`w-5 h-5 ${color}`} aria-hidden="true" />
    </div>
    <span className="text-xs font-semibold text-stone-700 dark:text-slate-300 text-center">{label}</span>
    {count !== undefined && (
      <span className="text-[11px] font-medium text-stone-400 dark:text-slate-500 bg-stone-50 dark:bg-slate-800 px-2 py-0.5 rounded-full">
        {count} buku
      </span>
    )}
  </Link>
)

// ── Book Progress Item — FIXED: proper cover size & aspect ratio ───────────────
const BookProgressItem = ({ book, onClick }) => {
  const [imgLoaded, setImgLoaded] = useState(false)

  return (
    <div
      onClick={onClick}
      className="flex gap-3.5 p-3 rounded-xl hover:bg-stone-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
      role="link"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}
    >
      {/* Cover — w-14 with proper aspect-[2/3] so full portrait is visible */}
      <div className="w-14 flex-shrink-0 self-start">
        <div className="relative overflow-hidden shadow-md border border-stone-100 dark:border-slate-700 aspect-[2/3]">
          {!imgLoaded && (
            <div className="absolute inset-0 animate-pulse bg-stone-100 dark:bg-slate-800" />
          )}
          <img
            src={book.coverImageUrl || '/placeholder.jpg'}
            alt={`Cover ${book.bookTitle}`}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
          />
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 py-0.5">
        <h3 className="font-semibold text-sm text-stone-900 dark:text-slate-100 truncate mb-0.5 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
          {book.bookTitle}
        </h3>
        <p className="text-xs text-stone-400 dark:text-slate-500 truncate mb-2.5">{book.authorName}</p>
        <div className="space-y-1.5">
          {/* Progress bar */}
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-stone-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-400 to-amber-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${book.progressPercentage || 0}%` }}
                role="progressbar"
                aria-valuenow={book.progressPercentage || 0}
                aria-valuemin="0"
                aria-valuemax="100"
              />
            </div>
            <span className="text-[11px] font-bold text-amber-500 dark:text-amber-400 flex-shrink-0 tabular-nums w-7 text-right">
              {book.progressPercentage || 0}%
            </span>
          </div>
          <p className="text-[11px] text-stone-400 dark:text-slate-500">
            {readingPositionLabel(book.currentChapter, book.totalChapters, book.progressPercentage, book.lastCfi)}
          </p>
        </div>
      </div>

      <ChevronRight className="w-4 h-4 text-stone-300 dark:text-slate-600 self-center flex-shrink-0 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
    </div>
  )
}

// ── Reading Pattern Row ────────────────────────────────────────────────────────
const PatternRow = ({ icon: Icon, color, bg, label, value }) => (
  <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-stone-50 dark:bg-slate-800/50 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors">
    <div className="flex items-center gap-3">
      <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-4 h-4 ${color}`} aria-hidden="true" />
      </div>
      <span className="text-sm font-medium text-stone-600 dark:text-slate-400">{label}</span>
    </div>
    <span className="font-bold text-sm text-stone-900 dark:text-slate-100">{value}</span>
  </div>
)

// ── Activity badges ────────────────────────────────────────────────────────────
const activityLabel = (t) => ({ completed: 'Selesai', reading: 'Sedang dibaca', started: 'Baru dimulai' }[t] || 'Dibaca')
const activityClass = (t) => ({
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  reading: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
}[t] || 'bg-stone-100 text-stone-600 dark:bg-slate-700 dark:text-slate-300')

const buildBookUrl = (slug) => slug ? `/buku/${slug}/baca` : '#'
const buildBookState = (lastCfi) => lastCfi ? { lastCfi } : {}

// ── Annotation Stat ────────────────────────────────────────────────────────────
const AnnotationStat = ({ icon: Icon, bg, color, count, label }) => (
  <div className={`flex items-center gap-3 p-3.5 ${bg} rounded-xl transition-transform hover:scale-[1.02] cursor-default`}>
    <div className="w-9 h-9 rounded-xl bg-white/60 dark:bg-black/20 flex items-center justify-center flex-shrink-0">
      <Icon className={`w-4.5 h-4.5 ${color} flex-shrink-0`} aria-hidden="true" />
    </div>
    <div>
      <div className="text-2xl font-bold text-stone-900 dark:text-slate-50 tabular-nums leading-none">{count}</div>
      <div className="text-xs font-medium text-stone-500 dark:text-slate-400 mt-0.5">{label}</div>
    </div>
  </div>
)

// ─────────────────────────────────────────────────────────────────────────────
// Main Dashboard
// ─────────────────────────────────────────────────────────────────────────────
const DashboardOverview = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    try {
      setLoading(true); setError(null)
      const res = await dashboardService.getMainDashboard()
      setData(res?.data || null)
    } catch (err) {
      setError(err?.response?.status === 401 ? 'auth' : 'network')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    document.title = 'Dashboard - MasasilaM'
    fetchData()
  }, []) // eslint-disable-line

  const stats = useMemo(() => data?.overviewStats || {}, [data])
  const reading = useMemo(() => data?.booksInProgress || [], [data])
  const pattern = useMemo(() => data?.readingPattern || {}, [data])
  const recent = useMemo(() => data?.recentlyRead || [], [data])
  const notes = useMemo(() => data?.annotationsSummary || {}, [data])
  const achievements = useMemo(() => data?.recentAchievements || [], [data])

  const displaySpeedWpm = pattern.averageReadingSpeedWpm > 0
    ? pattern.averageReadingSpeedWpm
    : (pattern.estimatedReadingSpeedWpm || 0)

  return (
    <DashboardShell loading={loading} error={error} onRetry={fetchData} onLogin={() => navigate('/masuk', { state: { from: '/dasbor' } })}>
      <div className="space-y-5">

        {/* ── Welcome Banner ──────────────────────────────────────────────── */}
        {/*
          LIGHT: warm amber-to-cream gradient — teks gelap kontras tinggi
          DARK:  slate-950 to amber-950   — teks terang seperti semula
        */}
        <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8
                        bg-gradient-to-br from-amber-50 via-amber-100/70 to-stone-100
                        border border-amber-200/80
                        dark:bg-none dark:border-0
                        dark:[background-image:linear-gradient(to_bottom_right,#020617,#0f172a,rgba(120,53,15,0.5))]">
          {/* Decorative blobs — amber mais ringan di light, tetap sama di dark */}
          <div className="pointer-events-none absolute -right-10 -top-10 w-56 h-56 rounded-full
                          bg-amber-300/20 dark:bg-amber-500/10 blur-3xl" />
          <div className="pointer-events-none absolute right-8 bottom-0 w-40 h-40 rounded-full
                          bg-amber-200/30 dark:bg-amber-400/5 blur-2xl" />
          {/* Dot pattern — lebih gelap di light agar terlihat */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
            style={{ backgroundImage: 'radial-gradient(circle, #92400e 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

          <div className="relative flex items-start justify-between gap-4">
            <div>
              {/* Label — amber-600 di light, amber-400 di dark */}
              <p className="text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-widest mb-1.5">
                Selamat Datang
              </p>
              {/* Heading — stone-900 di light, white di dark */}
              <h1 className="text-2xl sm:text-3xl font-bold mb-2
                             text-stone-900 dark:text-white">
                {user?.fullName || user?.username || 'Pembaca'} 👋
              </h1>
              {/* Subtitle — stone-600 di light, stone-300 di dark */}
              <p className="text-sm text-stone-600 dark:text-stone-300">
                {(stats.currentStreak || 0) > 0 ? (
                  <span className="flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-orange-500 dark:text-orange-400" />
                    Streak{' '}
                    <strong className="text-orange-600 dark:text-orange-300">
                      {stats.currentStreak} hari
                    </strong>{' '}
                    berturut-turut!
                  </span>
                ) : 'Mulai membaca hari ini dan bangun kebiasaan literasi.'}
              </p>
            </div>

            {/* Completion ring */}
            {stats.completionRate > 0 && (
              <div className="hidden sm:flex flex-col items-center flex-shrink-0">
                <div className="relative w-16 h-16">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                    {/* Track ring — stone-200 di light, white/10 di dark */}
                    <circle cx="32" cy="32" r="26" fill="none"
                      className="stroke-stone-200 dark:stroke-white/10"
                      strokeWidth="6" />
                    {/* Progress ring — amber-500 di keduanya */}
                    <circle
                      cx="32" cy="32" r="26" fill="none"
                      stroke="rgba(245,158,11,0.85)"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 26}`}
                      strokeDashoffset={`${2 * Math.PI * 26 * (1 - (stats.completionRate || 0) / 100)}`}
                      style={{ transition: 'stroke-dashoffset 1s ease' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-amber-600 dark:text-amber-300">
                      {Math.round(stats.completionRate)}%
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-medium mt-1 text-center
                                 text-stone-500 dark:text-stone-400">Selesai</span>
              </div>
            )}
          </div>
        </div>

        {/* ── Stats Grid ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            icon={Book} label="Total Buku" value={stats.totalBooks || 0}
            subtitle={`${stats.booksCompleted || 0} selesai`}
            color="text-amber-600 dark:text-amber-400"
            bg="bg-amber-50 dark:bg-amber-500/10"
          />
          <StatCard
            icon={Clock} label="Jam Baca" value={`${stats.totalReadingTimeHours || 0}j`}
            subtitle="Total waktu membaca"
            color="text-blue-600 dark:text-blue-400"
            bg="bg-blue-50 dark:bg-blue-500/10"
          />
          <StatCard
            icon={Flame} label="Streak" value={stats.currentStreak || 0}
            subtitle={`Terpanjang: ${stats.longestStreak || 0} hari`}
            color="text-orange-600 dark:text-orange-400"
            bg="bg-orange-50 dark:bg-orange-500/10"
          />
          <StatCard
            icon={Star} label="Rata-rata" value={(stats.averageRating || 0).toFixed(1)}
            subtitle={`${(stats.completionRate || 0).toFixed(0)}% buku selesai`}
            color="text-yellow-600 dark:text-yellow-400"
            bg="bg-yellow-50 dark:bg-yellow-500/10"
          />
        </div>

        {/* ── Reading Progress + Pattern ────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Sedang Dibaca */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-slate-700/80 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                  <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <h2 className="font-bold text-stone-900 dark:text-slate-100">Sedang Dibaca</h2>
                {reading.length > 0 && (
                  <span className="text-[11px] font-semibold bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full">
                    {reading.length}
                  </span>
                )}
              </div>
              <Link
                to="/dasbor/perpustakaan?filter=reading"
                className="text-xs font-semibold text-amber-500 hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-0.5 transition-colors"
              >
                Semua <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-3">
              {reading.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-stone-50 dark:bg-slate-800 flex items-center justify-center mb-3 border border-stone-100 dark:border-slate-700">
                    <BookOpen className="w-7 h-7 text-stone-200 dark:text-slate-600" />
                  </div>
                  <p className="text-sm font-medium text-stone-400 dark:text-slate-500 mb-1">Belum ada buku yang sedang dibaca</p>
                  <Link to="/buku" className="mt-2 text-xs font-semibold text-amber-500 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                    Jelajahi koleksi buku →
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-stone-50 dark:divide-slate-800/50">
                  {reading.map(b => (
                    <BookProgressItem
                      key={b.bookId}
                      book={b}
                      onClick={() => navigate(buildBookUrl(b.bookSlug), { state: buildBookState(b.lastCfi) })}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Pola Membaca — redesigned */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-slate-700/80 overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-stone-100 dark:border-slate-800">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                <BarChart2 className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <h2 className="font-bold text-stone-900 dark:text-slate-100">Pola Membaca</h2>
            </div>
            <div className="p-4 space-y-2.5">
              <PatternRow
                icon={Clock} color="text-blue-500" bg="bg-blue-50 dark:bg-blue-500/10"
                label="Waktu Favorit" value={pattern.preferredReadingTime || '–'}
              />
              <PatternRow
                icon={Zap} color="text-yellow-500" bg="bg-yellow-50 dark:bg-yellow-500/10"
                label="Kecepatan Baca" value={displaySpeedWpm > 0 ? `${Math.round(displaySpeedWpm)} wpm` : '–'}
              />
              <PatternRow
                icon={Target} color="text-purple-500" bg="bg-purple-50 dark:bg-purple-500/10"
                label="Rata-rata Sesi" value={`${pattern.averageSessionMinutes || 0} menit`}
              />
              <PatternRow
                icon={Flame} color="text-orange-500" bg="bg-orange-50 dark:bg-orange-500/10"
                label="Pace Membaca" value={pattern.readingPace || '–'}
              />
              <PatternRow
                icon={TrendingUp} color="text-emerald-500" bg="bg-emerald-50 dark:bg-emerald-500/10"
                label="Buku Selesai" value={`${stats.booksCompleted || 0} buku`}
              />
            </div>
          </div>
        </div>

        {/* ── Terakhir Dibaca ───────────────────────────────────────────── */}
        {recent.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-slate-700/80 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                </div>
                <h2 className="font-bold text-stone-900 dark:text-slate-100">Terakhir Dibaca</h2>
              </div>
              <Link to="/dasbor/riwayat" className="text-xs font-semibold text-amber-500 hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-0.5 transition-colors">
                Riwayat <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-stone-100 dark:bg-slate-800/60">
              {recent.slice(0, 6).map((r, idx) => (
                <div
                  key={`${r.bookId}-${idx}`}
                  onClick={() => navigate(buildBookUrl(r.bookSlug), { state: buildBookState(r.lastCfi) })}
                  className="flex gap-3.5 p-4 bg-white dark:bg-slate-900 hover:bg-amber-50/50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors group"
                  role="link"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && navigate(buildBookUrl(r.bookSlug), { state: buildBookState(r.lastCfi) })}
                >
                  {/* Cover — w-14 with proper aspect ratio */}
                  <div className="w-12 flex-shrink-0 self-start">
                    <div className="relative overflow-hidden border border-stone-100 dark:border-slate-700 shadow-md aspect-[2/3]">
                      <img
                        src={r.coverImageUrl || '/placeholder.jpg'}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 py-0.5">
                    <h3 className="font-semibold text-sm text-stone-900 dark:text-slate-100 mb-0.5 line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-snug">
                      {r.bookTitle}
                    </h3>
                    <p className="text-[11px] text-stone-400 dark:text-slate-500 truncate mb-2">{r.authorName}</p>
                    <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${activityClass(r.activityType)}`}>
                      {activityLabel(r.activityType)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Anotasi + Pencapaian ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Anotasi */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-slate-700/80 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                  <Bookmark className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <h2 className="font-bold text-stone-900 dark:text-slate-100">Anotasi</h2>
              </div>
              <Link to="/dasbor/anotasi" className="text-xs font-semibold text-amber-500 hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-0.5 transition-colors">
                Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 p-4">
              <AnnotationStat
                icon={Bookmark} bg="bg-amber-50 dark:bg-amber-500/10" color="text-amber-500"
                count={notes.totalBookmarks || 0} label="Penanda"
              />
              <AnnotationStat
                icon={Highlighter} bg="bg-emerald-50 dark:bg-emerald-500/10" color="text-emerald-500"
                count={notes.totalHighlights || 0} label="Highlight"
              />
              <AnnotationStat
                icon={MessageSquare} bg="bg-blue-50 dark:bg-blue-500/10" color="text-blue-500"
                count={notes.totalNotes || 0} label="Catatan"
              />
              <AnnotationStat
                icon={Star} bg="bg-purple-50 dark:bg-purple-500/10" color="text-purple-500"
                count={notes.totalReviews || 0} label="Ulasan"
              />
            </div>
          </div>

          {/* Pencapaian */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-slate-700/80 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-yellow-50 dark:bg-yellow-500/10 flex items-center justify-center">
                  <Award className="w-3.5 h-3.5 text-yellow-500" />
                </div>
                <h2 className="font-bold text-stone-900 dark:text-slate-100">Pencapaian</h2>
              </div>
              <Link to="/dasbor/pencapaian" className="text-xs font-semibold text-amber-500 hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-0.5 transition-colors">
                Semua <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="p-4">
              {achievements.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <div className="w-14 h-14 rounded-2xl bg-stone-50 dark:bg-slate-800 border border-stone-100 dark:border-slate-700 flex items-center justify-center mb-3">
                    <Award className="w-7 h-7 text-stone-200 dark:text-slate-600" />
                  </div>
                  <p className="text-sm font-medium text-stone-400 dark:text-slate-500">Belum ada pencapaian</p>
                  <p className="text-xs text-stone-300 dark:text-slate-600 mt-1">Terus membaca untuk meraihnya!</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {achievements.map(a => (
                    <div
                      key={a.achievementId}
                      className="flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50/50 dark:from-amber-500/10 dark:to-yellow-500/5 border border-amber-100 dark:border-amber-500/20 hover:border-amber-300 dark:hover:border-amber-500/40 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-amber-200/50 dark:shadow-amber-900/30">
                        <Award className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-stone-900 dark:text-slate-100 truncate">{a.title}</h3>
                        <p className="text-xs text-stone-400 dark:text-slate-500 truncate mt-0.5">{a.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Akses Cepat ──────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-slate-700/80 overflow-hidden">
          <div className="px-5 py-4 border-b border-stone-100 dark:border-slate-800">
            <h2 className="font-bold text-stone-900 dark:text-slate-100">Akses Cepat</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4">
            <QuickLink
              to="/dasbor/perpustakaan" icon={Book} label="Perpustakaan"
              count={stats.totalBooks}
              color="text-amber-600 dark:text-amber-400" bg="bg-amber-50 dark:bg-amber-500/10"
            />
            <QuickLink
              to="/dasbor/statistik" icon={TrendingUp} label="Statistik"
              color="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-50 dark:bg-emerald-500/10"
            />
            <QuickLink
              to="/dasbor/kalender" icon={Calendar} label="Kalender"
              color="text-blue-600 dark:text-blue-400" bg="bg-blue-50 dark:bg-blue-500/10"
            />
            <QuickLink
              to="/dasbor/pencapaian" icon={Award} label="Pencapaian"
              color="text-yellow-600 dark:text-yellow-400" bg="bg-yellow-50 dark:bg-yellow-500/10"
            />
          </div>
        </div>

      </div>
    </DashboardShell>
  )
}

export default DashboardOverview
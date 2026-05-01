// ============================================
// src/pages/dashboard/ZineStatisticsPage.jsx
// Dashboard: Statistik Baca Zine
// LIGHT: stone palette | DARK: slate palette — Emerald accent
// ============================================
import { useState, useEffect, useCallback } from 'react'
import zineDashboardService from '../../services/zineDashboardService'
import LoadingSpinner from '../../components/Common/LoadingSpinner'
import {
  BarChart2, Clock, BookOpen, TrendingUp, TrendingDown,
  Minus, Layers, Star, CheckCircle, Zap, Target
} from 'lucide-react'

const PERIOD_OPTIONS = [
  { value: 7,  label: '7 hari'  },
  { value: 30, label: '30 hari' },
  { value: 90, label: '90 hari' },
  { value: 365, label: '1 tahun' },
]

// ── Trend badge ───────────────────────────────────────────────────────────────
const TrendBadge = ({ trend }) => {
  if (!trend || trend.direction === 'neutral') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
                       bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
        <Minus className="w-3 h-3" />Stabil
      </span>
    )
  }
  const isUp = trend.direction === 'up'
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
      isUp ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
           : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    }`}>
      {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {Math.abs(trend.changePercentage || 0).toFixed(1)}%
    </span>
  )
}

// ── Stat card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, subtitle, trend, color = 'emerald', accent }) => {
  const colorMap = {
    emerald: { bg: 'from-emerald-500 to-teal-500', shadow: 'shadow-emerald-200/60 dark:shadow-emerald-900/40' },
    blue:    { bg: 'from-blue-500 to-indigo-500',  shadow: 'shadow-blue-200/60 dark:shadow-blue-900/40'    },
    purple:  { bg: 'from-purple-500 to-pink-500',  shadow: 'shadow-purple-200/60 dark:shadow-purple-900/40' },
    amber:   { bg: 'from-amber-500 to-orange-500', shadow: 'shadow-amber-200/60 dark:shadow-amber-900/40'  },
  }
  const c = colorMap[color] || colorMap.emerald
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.bg} flex items-center justify-center shadow-md ${c.shadow}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && <TrendBadge trend={trend} />}
      </div>
      <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-0.5">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>}
    </div>
  )
}

// ── GenreBar ─────────────────────────────────────────────────────────────────
const GenreBar = ({ name, percentage, minutesSpent, booksRead }) => (
  <div className="flex items-center gap-3">
    <div className="w-24 text-xs font-medium text-gray-700 dark:text-gray-300 truncate flex-shrink-0">
      {name}
    </div>
    <div className="flex-1 h-2.5 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700">
      <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
        style={{ width:`${Math.min(100, percentage)}%` }} />
    </div>
    <div className="flex items-center gap-2 text-[10px] text-gray-400 dark:text-gray-500 flex-shrink-0 w-28 text-right">
      <span>{minutesSpent}m</span>
      <span>·</span>
      <span>{booksRead} zine</span>
    </div>
  </div>
)

// ── PeakHoursChart ────────────────────────────────────────────────────────────
const PeakHoursChart = ({ peakTimes }) => {
  if (!peakTimes?.length) return null
  const maxMinutes = Math.max(...peakTimes.map(p => p.minutesRead || 0), 1)
  return (
    <div className="space-y-2">
      {peakTimes.map(({ hour, minutesRead, percentage }) => (
        <div key={hour} className="flex items-center gap-3">
          <span className="text-xs text-gray-500 dark:text-gray-400 w-10 text-right flex-shrink-0">
            {String(hour).padStart(2, '0')}:00
          </span>
          <div className="flex-1 h-2 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700">
            <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-700"
              style={{ width:`${(minutesRead / maxMinutes) * 100}%` }} />
          </div>
          <span className="text-[10px] text-gray-400 dark:text-gray-500 w-8 flex-shrink-0">{minutesRead}m</span>
        </div>
      ))}
    </div>
  )
}

// ── ZineStatisticsPage ────────────────────────────────────────────────────────
const ZineStatisticsPage = () => {
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [period,  setPeriod]  = useState(30)

  useEffect(() => { document.title = 'Statistik Zine — Dashboard' }, [])

  const fetchStats = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const res = await zineDashboardService.getZineStatistics(period)
      setStats(res?.data || null)
    } catch (err) {
      if (err?.response?.status === 401) setError('auth')
      else setError('network')
    } finally { setLoading(false) }
  }, [period])

  useEffect(() => { fetchStats() }, [fetchStats])

  const displayWpm = stats
    ? (stats.averageReadingSpeedWpm > 0 ? stats.averageReadingSpeedWpm : stats.estimatedReadingSpeedWpm || 0)
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-200/60 dark:shadow-emerald-900/40">
              <BarChart2 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Statistik Zine</h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 ml-12">Analisis kebiasaan membaca zine Anda</p>
        </div>
        {/* Period selector */}
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-1">
          {PERIOD_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => setPeriod(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                period === opt.value
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner /></div>
      ) : error === 'auth' ? (
        <div className="text-center py-16">
          <p className="text-gray-500 dark:text-gray-400 mb-4">Sesi telah berakhir</p>
          <button onClick={() => window.location.href = '/masuk'}
            className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-semibold">Masuk Kembali</button>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-center">
          <p className="text-red-700 dark:text-red-400 mb-3">Gagal memuat statistik</p>
          <button onClick={fetchStats}
            className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition">Coba Lagi</button>
        </div>
      ) : !stats ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mx-auto mb-4">
            <Layers className="w-8 h-8 text-emerald-300 dark:text-emerald-700" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Belum ada data statistik zine</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Mulai baca zine untuk melihat statistik</p>
        </div>
      ) : (
        <>
          {/* Main stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard
              icon={Layers} color="emerald" label="Zine Dibaca"
              value={stats.totalZinesRead || 0}
              subtitle={`${stats.completedZines || 0} selesai`}
              trend={stats.completionTrend}
            />
            <StatCard
              icon={Clock} color="blue" label="Total Menit"
              value={stats.totalReadingMinutes > 0
                ? stats.totalReadingMinutes >= 60
                  ? `${Math.floor(stats.totalReadingMinutes / 60)}j ${stats.totalReadingMinutes % 60}m`
                  : `${stats.totalReadingMinutes}m`
                : '0m'}
              subtitle="Waktu membaca"
              trend={stats.readingTimeTrend}
            />
            <StatCard
              icon={BookOpen} color="purple" label="Total Bab"
              value={stats.totalChaptersRead || 0}
              subtitle="Bab diselesaikan"
            />
            <StatCard
              icon={Zap} color="amber" label="Kecepatan"
              value={displayWpm > 0 ? `${Math.round(displayWpm)} wpm` : '—'}
              subtitle={displayWpm > 0 ? 'Estimasi WPM' : 'Belum ada data'}
              trend={stats.speedTrend}
            />
          </div>

          {/* Secondary stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-4 text-white">
              <CheckCircle className="w-6 h-6 mb-2 opacity-80" />
              <p className="text-3xl font-bold">{stats.completedZines || 0}</p>
              <p className="text-sm opacity-80">Zine Selesai</p>
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4">
              <Target className="w-6 h-6 mb-2 text-emerald-500" />
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.completionRate != null ? `${stats.completionRate.toFixed(1)}%` : '—'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Rata-rata progres</p>
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4">
              <Star className="w-6 h-6 mb-2 text-amber-500" />
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.totalReadingMinutes > 0 && stats.totalZinesRead > 0
                  ? Math.round(stats.totalReadingMinutes / Math.max(stats.totalZinesRead, 1))
                  : '—'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Menit per zine</p>
            </div>
          </div>

          {/* Trend details */}
          {(stats.readingTimeTrend || stats.completionTrend) && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5">
              <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />Tren Membaca
              </h2>
              <div className="space-y-3">
                {stats.readingTimeTrend && (
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                    <Clock className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Waktu Baca</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{stats.readingTimeTrend.interpretation || '—'}</p>
                    </div>
                    <div className="ml-auto"><TrendBadge trend={stats.readingTimeTrend} /></div>
                  </div>
                )}
                {stats.completionTrend && (
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                    <Layers className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Zine Selesai</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{stats.completionTrend.interpretation || '—'}</p>
                    </div>
                    <div className="ml-auto"><TrendBadge trend={stats.completionTrend} /></div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Genre breakdown */}
          {stats.genreBreakdown?.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5">
              <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-emerald-500" />Genre Favorit
              </h2>
              <div className="space-y-3">
                {stats.genreBreakdown.slice(0, 8).map(genre => (
                  <GenreBar key={genre.genreName}
                    name={genre.genreName}
                    percentage={genre.percentage || 0}
                    minutesSpent={genre.minutesSpent || 0}
                    booksRead={genre.booksRead || 0}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Peak reading times */}
          {stats.peakReadingTimes?.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5">
              <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-500" />Jam Membaca Favorit
              </h2>
              <PeakHoursChart peakTimes={stats.peakReadingTimes} />
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ZineStatisticsPage
import { useState, useEffect, useCallback } from 'react'
import { dashboardService } from '../../services/dashboardService'
import LoadingSpinner from '../../components/Common/LoadingSpinner'
import { TrendingUp, TrendingDown, Minus, Book, Clock, Zap, BarChart2 } from 'lucide-react'

// ── Trend Card ────────────────────────────────────────────────────────────
const TrendCard = ({ title, trend }) => {
  if (!trend) return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-slate-700 p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-slate-500 mb-4">{title}</p>
      <div className="flex items-center gap-2">
        <Minus className="w-5 h-5 text-stone-300 dark:text-slate-600" />
        <span className="text-2xl font-bold text-stone-300 dark:text-slate-600">—</span>
      </div>
      <p className="text-xs text-stone-400 dark:text-slate-500 mt-2">Tidak ada data tren</p>
    </div>
  )

  const direction = trend.direction || 'neutral'
  const changePct = trend.changePercentage || 0

  const cfg = {
    up:      { icon: TrendingUp,   color: 'text-emerald-500', numColor: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    down:    { icon: TrendingDown, color: 'text-red-500',     numColor: 'text-red-600 dark:text-red-400',         bg: 'bg-red-50 dark:bg-red-500/10'         },
    neutral: { icon: Minus,        color: 'text-stone-400',   numColor: 'text-stone-600 dark:text-slate-400',     bg: 'bg-stone-100 dark:bg-slate-800'       },
  }[direction]

  const Icon = cfg.icon

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-slate-700 p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-slate-500 mb-4">{title}</p>
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-4.5 h-4.5 ${cfg.color}`} />
        </div>
        <span className={`text-2xl font-bold ${cfg.numColor}`}>
          {changePct > 0 ? '+' : ''}{changePct.toFixed(1)}%
        </span>
      </div>
      <p className="text-xs text-stone-500 dark:text-slate-400 leading-relaxed">
        {trend.interpretation || 'Tidak ada interpretasi'}
      </p>
    </div>
  )
}

// ── Bar chart visual for peak reading times ────────────────────────────────
const PeakTimeBar = ({ slot, maxMinutes }) => {
  const pct = maxMinutes > 0 ? ((slot.minutesRead || 0) / maxMinutes) * 100 : 0
  const isActive = (slot.minutesRead || 0) > 0
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex flex-col justify-end h-20 w-full">
        <div
          className={`w-full rounded-t-lg transition-all duration-500 ${isActive ? 'bg-amber-400 dark:bg-amber-500' : 'bg-stone-100 dark:bg-slate-800'}`}
          style={{ height: `${Math.max(pct, isActive ? 4 : 0)}%` }}
        />
      </div>
      <span className="text-[10px] text-stone-500 dark:text-slate-500 font-mono">
        {String(slot.hour ?? 0).padStart(2, '0')}
      </span>
      {isActive && (
        <span className="text-[9px] font-semibold text-amber-600 dark:text-amber-400">{slot.minutesRead}m</span>
      )}
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────
const StatisticsPage = () => {
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [period,  setPeriod]  = useState(30)

  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true); setError(null)
      const res = await dashboardService.getStatistics(period)
      setStats(res?.data || {})
    } catch {
      setError('Gagal memuat statistik')
      setStats({})
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => { fetchStatistics() }, [fetchStatistics])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <LoadingSpinner />
    </div>
  )

  const {
    totalBooksRead           = 0,
    totalChaptersRead        = 0,
    totalEpubChaptersRead    = 0,
    totalReadingMinutes      = 0,
    averageReadingSpeedWpm   = 0,
    estimatedReadingSpeedWpm = 0,
    readingTimeTrend         = null,
    completionTrend          = null,
    speedTrend               = null,
    genreBreakdown           = [],
    peakReadingTimes         = [],
  } = stats || {}

  const displaySpeedWpm  = averageReadingSpeedWpm > 0 ? averageReadingSpeedWpm : estimatedReadingSpeedWpm
  const totalAllChapters = totalChaptersRead + totalEpubChaptersRead
  const totalHours       = Math.floor(totalReadingMinutes / 60)
  const totalMins        = totalReadingMinutes % 60
  const maxPeakMinutes   = Math.max(...peakReadingTimes.map(s => s.minutesRead || 0), 1)

  const PERIOD_OPTIONS = [
    { value: 7,   label: '7 Hari'  },
    { value: 30,  label: '30 Hari' },
    { value: 90,  label: '3 Bulan' },
    { value: 365, label: '1 Tahun' },
  ]

  const summaryCards = [
    {
      icon: Book, label: 'Total Buku', value: totalBooksRead, sub: null,
      color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10',
    },
    {
      icon: Book, label: 'Total Bab',  value: totalAllChapters,
      sub: totalEpubChaptersRead > 0 && totalChaptersRead > 0
        ? `${totalEpubChaptersRead} EPUB · ${totalChaptersRead} chapter`
        : totalEpubChaptersRead > 0 ? 'Dari EPUB' : totalChaptersRead > 0 ? 'Dari chapter reader' : null,
      color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10',
    },
    {
      icon: Clock, label: 'Waktu Baca',
      value: `${totalHours}j`, sub: `${totalMins} menit`,
      color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    },
    {
      icon: Zap, label: 'Kecepatan',
      value: displaySpeedWpm > 0 ? `${Math.round(displaySpeedWpm)}` : '—',
      sub: displaySpeedWpm > 0
        ? `kata/menit${averageReadingSpeedWpm === 0 && estimatedReadingSpeedWpm > 0 ? ' (est.)' : ''}`
        : 'Belum ada data',
      color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-500/10',
    },
  ]

  return (
    <div className="space-y-6">

      {/* ── Page Header ────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-slate-50 mb-1">Statistik Membaca</h1>
        <p className="text-sm text-stone-500 dark:text-slate-400">Analisis mendalam aktivitas membaca Anda</p>
      </div>

      {/* ── Error ─────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 flex items-center justify-between">
          <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          <button onClick={fetchStatistics} className="text-sm px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors font-medium">
            Coba Lagi
          </button>
        </div>
      )}

      {/* ── Period Filter ────────────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap">
        {PERIOD_OPTIONS.map(p => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={`px-4 py-2 text-sm font-medium rounded-full border transition-all ${
              period === p.value
                ? 'bg-amber-500 text-stone-950 border-amber-500 font-bold shadow-sm shadow-amber-200 dark:shadow-amber-900/30'
                : 'bg-white dark:bg-slate-900 text-stone-600 dark:text-slate-400 border-stone-200 dark:border-slate-700 hover:border-amber-400 hover:text-amber-600 dark:hover:border-amber-500 dark:hover:text-amber-400'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* ── Summary Stats ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {summaryCards.map(({ icon: Icon, label, value, sub, color, bg }) => (
          <div key={label} className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-slate-700 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-slate-500">{label}</p>
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
            </div>
            <p className={`text-3xl font-bold mb-0.5 ${color}`}>{value}</p>
            {sub && <p className="text-xs text-stone-400 dark:text-slate-500">{sub}</p>}
          </div>
        ))}
      </div>

      {/* ── Trends ───────────────────────────────────────────────── */}
      <div>
        <h2 className="font-bold text-lg text-stone-900 dark:text-slate-100 mb-3">Tren Membaca</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <TrendCard title="Waktu Baca"    trend={readingTimeTrend} />
          <TrendCard title="Penyelesaian" trend={completionTrend}  />
          <TrendCard title="Kecepatan"    trend={speedTrend}       />
        </div>
      </div>

      {/* ── Genre Breakdown ──────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-slate-700 overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-stone-100 dark:border-slate-800">
          <BarChart2 className="w-4 h-4 text-amber-500" />
          <h2 className="font-bold text-stone-900 dark:text-slate-100">Genre Favorit</h2>
        </div>
        <div className="p-5">
          {genreBreakdown.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <BarChart2 className="w-10 h-10 text-stone-200 dark:text-slate-700 mb-3" />
              <p className="text-sm text-stone-400 dark:text-slate-500">Belum ada data genre</p>
            </div>
          ) : (
            <div className="space-y-4">
              {genreBreakdown.map((genre, idx) => {
                const pct = Math.min(genre.percentage || 0, 100)
                const COLORS = [
                  'bg-amber-400', 'bg-blue-400', 'bg-emerald-400', 'bg-purple-400',
                  'bg-rose-400',  'bg-cyan-400', 'bg-orange-400',  'bg-teal-400',
                ]
                const barColor = COLORS[idx % COLORS.length]
                return (
                  <div key={genre.genreName || idx}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${barColor}`} />
                        <span className="font-semibold text-sm text-stone-800 dark:text-slate-200">
                          {genre.genreName || 'Tidak diketahui'}
                        </span>
                        <span className="text-xs text-stone-400 dark:text-slate-500">
                          {genre.booksRead || 0} buku
                          {(genre.minutesSpent || 0) > 0 && ` · ${Math.floor(genre.minutesSpent / 60)}j`}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-stone-700 dark:text-slate-300">{pct.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-stone-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Peak Reading Times ────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-slate-700 overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-stone-100 dark:border-slate-800">
          <Clock className="w-4 h-4 text-blue-500" />
          <h2 className="font-bold text-stone-900 dark:text-slate-100">Waktu Baca Favorit</h2>
        </div>
        <div className="p-5">
          {peakReadingTimes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Clock className="w-10 h-10 text-stone-200 dark:text-slate-700 mb-3" />
              <p className="text-sm text-stone-400 dark:text-slate-500">Belum ada data</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="grid min-w-[480px]" style={{ gridTemplateColumns: `repeat(${peakReadingTimes.length}, 1fr)`, gap: '4px' }}>
                {peakReadingTimes.map((slot, idx) => (
                  <PeakTimeBar key={slot.hour ?? idx} slot={slot} maxMinutes={maxPeakMinutes} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}

export default StatisticsPage
// ============================================
// src/pages/dashboard/StatisticsPage.jsx
//
// PERBAIKAN:
//   - Hapus label hardcoded "Dari sesi non-EPUB" — diganti info yang akurat
//     sesuai data dari backend (totalChaptersRead sekarang mencakup EPUB)
//   - Hapus label hardcoded "Tidak tersedia untuk EPUB" pada kecepatan —
//     backend sekarang mengirim estimasi WPM dari durasi + halaman EPUB
//   - Card kecepatan tetap menampilkan "—" hanya jika nilai benar-benar 0
//     (tidak ada data sama sekali), bukan karena semua sesi adalah EPUB
//   - Semua field name tetap camelCase sesuai backend Java
// ============================================
import { useState, useEffect, useCallback } from 'react'
import { dashboardService } from '../../services/dashboardService'
import LoadingSpinner from '../../components/Common/LoadingSpinner'
import { TrendingUp, TrendingDown, Minus, Book, Clock, Zap } from 'lucide-react'

const TrendCard = ({ title, trend }) => {
  if (!trend) return null

  const direction = trend.direction || 'neutral'
  const changePct = trend.changePercentage || 0

  const iconMap = {
    up:      <TrendingUp   className="w-5 h-5 text-green-500" />,
    down:    <TrendingDown className="w-5 h-5 text-red-500"   />,
    neutral: <Minus        className="w-5 h-5 text-gray-500"  />,
  }

  const colorMap = {
    up:      'text-green-600 dark:text-green-400',
    down:    'text-red-600 dark:text-red-400',
    neutral: 'text-gray-600 dark:text-gray-400',
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="font-semibold mb-4 text-sm sm:text-base">{title}</h3>
      <div className="flex items-center gap-2 mb-2">
        {iconMap[direction]}
        <span className={`text-xl sm:text-2xl font-bold ${colorMap[direction]}`}>
          {changePct > 0 ? '+' : ''}{changePct.toFixed(1)}%
        </span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {trend.interpretation || 'Tidak ada data tren'}
      </p>
    </div>
  )
}

const StatisticsPage = () => {
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [period, setPeriod]   = useState(30)

  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await dashboardService.getStatistics(period)
      setStats(res?.data || {})
    } catch (err) {
      console.error('Error fetching statistics:', err)
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

  // Gunakan estimasi WPM jika WPM akurat tidak tersedia
  const displaySpeedWpm = averageReadingSpeedWpm > 0
    ? averageReadingSpeedWpm
    : estimatedReadingSpeedWpm

  // Total bab gabungan: chapter reader + EPUB chapters
  const totalAllChapters = totalChaptersRead + totalEpubChaptersRead

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Statistik Membaca</h1>
        <p className="text-gray-600 dark:text-gray-400">Analisis aktivitas membaca Anda</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <p className="text-red-700 dark:text-red-400 mb-2">{error}</p>
          <button
            onClick={fetchStatistics}
            className="text-sm px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Period filter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {[7, 30, 90, 365].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                period === p
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {p === 365 ? '1 Tahun' : `${p} Hari`}
            </button>
          ))}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">

        {/* Total Buku */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-gray-600 dark:text-gray-400">Total Buku</h3>
            <Book className="w-8 h-8 text-primary opacity-50" />
          </div>
          <p className="text-3xl font-bold">{totalBooksRead}</p>
        </div>

        {/* Total Bab — sekarang mencakup EPUB + chapter reader */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-gray-600 dark:text-gray-400">Total Bab</h3>
            <Book className="w-8 h-8 text-blue-500 opacity-50" />
          </div>
          <p className="text-3xl font-bold">{totalAllChapters}</p>
          {/* Tampilkan breakdown hanya jika keduanya ada */}
          {totalEpubChaptersRead > 0 && totalChaptersRead > 0 ? (
            <p className="text-xs text-gray-400 mt-1">
              {totalEpubChaptersRead} EPUB · {totalChaptersRead} chapter
            </p>
          ) : totalEpubChaptersRead > 0 ? (
            <p className="text-xs text-gray-400 mt-1">Dari sesi EPUB</p>
          ) : totalChaptersRead > 0 ? (
            <p className="text-xs text-gray-400 mt-1">Dari chapter reader</p>
          ) : null}
        </div>

        {/* Waktu Membaca */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-gray-600 dark:text-gray-400">Waktu Membaca</h3>
            <Clock className="w-8 h-8 text-green-500 opacity-50" />
          </div>
          <p className="text-3xl font-bold">{Math.floor(totalReadingMinutes / 60)}j</p>
          <p className="text-xs text-gray-500">{totalReadingMinutes % 60} menit</p>
        </div>

        {/* Kecepatan — sekarang pakai estimasi untuk EPUB */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-gray-600 dark:text-gray-400">Kecepatan</h3>
            <Zap className="w-8 h-8 text-yellow-500 opacity-50" />
          </div>
          {displaySpeedWpm > 0 ? (
            <>
              <p className="text-3xl font-bold">{Math.round(displaySpeedWpm)}</p>
              <p className="text-xs text-gray-500">
                kata/menit
                {averageReadingSpeedWpm === 0 && estimatedReadingSpeedWpm > 0 && (
                  <span className="ml-1 text-gray-400">(estimasi)</span>
                )}
              </p>
            </>
          ) : (
            <>
              <p className="text-3xl font-bold text-gray-300 dark:text-gray-600">—</p>
              <p className="text-xs text-gray-400">Belum ada data</p>
            </>
          )}
        </div>
      </div>

      {/* Trends */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <TrendCard title="Tren Waktu Baca"   trend={readingTimeTrend} />
        <TrendCard title="Tren Penyelesaian" trend={completionTrend}  />
        <TrendCard title="Tren Kecepatan"    trend={speedTrend}       />
      </div>

      {/* Genre breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-6">Genre Favorit</h2>
        {genreBreakdown.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Belum ada data genre</p>
        ) : (
          <div className="space-y-4">
            {genreBreakdown.map((genre, idx) => (
              <div key={genre.genreName || idx}>
                <div className="flex justify-between mb-2">
                  <div>
                    <span className="font-semibold text-sm sm:text-base">
                      {genre.genreName || 'Tidak diketahui'}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">
                      {genre.booksRead || 0} buku
                      {(genre.minutesSpent || 0) > 0 && ` · ${Math.floor(genre.minutesSpent / 60)}j`}
                    </span>
                  </div>
                  <span className="font-semibold text-sm">
                    {(genre.percentage || 0).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-primary h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(genre.percentage || 0, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Peak reading times */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-6">Waktu Baca Favorit</h2>
        {peakReadingTimes.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Belum ada data</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {peakReadingTimes.map((slot, idx) => (
              <div
                key={slot.hour ?? idx}
                className={`p-3 rounded-lg text-center ${
                  (slot.minutesRead || 0) > 0
                    ? 'bg-primary/10 dark:bg-primary/20'
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                <div className="font-semibold text-sm mb-1">
                  {String(slot.hour ?? 0).padStart(2, '0')}:00
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {slot.minutesRead || 0}m
                </div>
                {(slot.percentage || 0) > 0 && (
                  <div className="text-xs text-primary mt-1">
                    {(slot.percentage || 0).toFixed(0)}%
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default StatisticsPage
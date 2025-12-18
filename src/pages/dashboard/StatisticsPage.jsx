// ============================================
// src/pages/dashboard/StatisticsPage.jsx - FIXED
// ============================================

import { useState, useEffect } from 'react'
import { dashboardService } from '../../services/dashboardService'
import LoadingSpinner from '../../components/Common/LoadingSpinner'
import { TrendingUp, TrendingDown, Minus, Book, Clock, Zap } from 'lucide-react'

const StatisticsPage = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [period, setPeriod] = useState(30)

  useEffect(() => {
    fetchStatistics()
  }, [period])

  const fetchStatistics = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Fetching statistics for period:', period)
      const response = await dashboardService.getStatistics(period)
      
      console.log('Statistics response:', response)
      console.log('Response data:', response?.data)
      
      // PERBAIKAN: Set stats dengan default values jika undefined
      setStats(response?.data || {})
    } catch (error) {
      console.error('Error:', error)
      setError('Gagal memuat statistik')
      setStats({})
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner />
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>
  if (!stats) return <div className="text-gray-500 text-center py-8">Data tidak tersedia</div>

  // PERBAIKAN: Gunakan default values untuk semua property
  const {
    totalBooksRead = 0,
    totalChaptersRead = 0,
    totalReadingMinutes = 0,
    averageReadingSpeedWpm = 0,
    readingTimeTrend = { direction: 'neutral', changePercentage: 0, interpretation: 'Tidak ada data' },
    completionTrend = { direction: 'neutral', changePercentage: 0, interpretation: 'Tidak ada data' },
    speedTrend = { direction: 'neutral', changePercentage: 0, interpretation: 'Tidak ada data' },
    genreBreakdown = [], // Default ke array kosong
    peakReadingTimes = [] // Default ke array kosong
  } = stats

  const getTrendIcon = (direction) => {
    switch(direction) {
      case 'up': return <TrendingUp className="w-5 h-5 text-green-500" />
      case 'down': return <TrendingDown className="w-5 h-5 text-red-500" />
      default: return <Minus className="w-5 h-5 text-gray-500" />
    }
  }

  const getTrendColor = (direction) => {
    switch(direction) {
      case 'up': return 'text-green-600'
      case 'down': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Statistik Membaca</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Analisis mendalam aktivitas membaca Anda
        </p>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <p className="text-red-700 dark:text-red-400">{error}</p>
          <button
            onClick={fetchStatistics}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Period Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div className="flex gap-2">
          {[7, 30, 90, 365].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg transition-colors ${
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

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-gray-600 dark:text-gray-400">Total Buku Dibaca</h3>
            <Book className="w-8 h-8 text-primary opacity-50" />
          </div>
          <p className="text-3xl font-bold">{totalBooksRead}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-gray-600 dark:text-gray-400">Total Bab</h3>
            <Book className="w-8 h-8 text-blue-500 opacity-50" />
          </div>
          <p className="text-3xl font-bold">{totalChaptersRead}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-gray-600 dark:text-gray-400">Waktu Membaca</h3>
            <Clock className="w-8 h-8 text-green-500 opacity-50" />
          </div>
          <p className="text-3xl font-bold">{Math.floor(totalReadingMinutes / 60)}h</p>
          <p className="text-xs text-gray-500">{totalReadingMinutes % 60}m</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-gray-600 dark:text-gray-400">Kecepatan Rata-rata</h3>
            <Zap className="w-8 h-8 text-yellow-500 opacity-50" />
          </div>
          <p className="text-3xl font-bold">{Math.round(averageReadingSpeedWpm)}</p>
          <p className="text-xs text-gray-500">kata/menit</p>
        </div>
      </div>

      {/* Trends */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <TrendCard
          title="Tren Waktu Baca"
          trend={readingTimeTrend}
          getTrendIcon={getTrendIcon}
          getTrendColor={getTrendColor}
        />
        <TrendCard
          title="Tren Penyelesaian"
          trend={completionTrend}
          getTrendIcon={getTrendIcon}
          getTrendColor={getTrendColor}
        />
        <TrendCard
          title="Tren Kecepatan"
          trend={speedTrend}
          getTrendIcon={getTrendIcon}
          getTrendColor={getTrendColor}
        />
      </div>

      {/* Genre Breakdown - PERBAIKAN: Gunakan optional chaining */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-6">Genre Favorit</h2>
        {!genreBreakdown || genreBreakdown.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Belum ada data genre</p>
        ) : (
          <div className="space-y-4">
            {genreBreakdown.map((genre) => (
              <div key={genre?.genreName || Math.random()}>
                <div className="flex justify-between mb-2">
                  <div>
                    <span className="font-semibold">{genre?.genreName || 'Unknown Genre'}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      {genre?.booksRead || 0} buku • {genre?.minutesSpent || 0} menit
                    </span>
                  </div>
                  <span className="font-semibold">
                    {(genre?.percentage || 0).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-primary h-3 rounded-full transition-all"
                    style={{ width: `${genre?.percentage || 0}%` }}
                  />
                </div>
                {genre?.averageRating > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Rating rata-rata: {(genre?.averageRating || 0).toFixed(1)} ⭐
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Peak Reading Times - PERBAIKAN: Gunakan optional chaining */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-6">Waktu Baca Favorit</h2>
        {!peakReadingTimes || peakReadingTimes.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Belum ada data</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {peakReadingTimes.map((slot) => (
              <div
                key={slot?.hour || Math.random()}
                className={`p-4 rounded-lg text-center ${
                  (slot?.minutesRead || 0) > 0 ? 'bg-primary/10' : 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                <div className="font-semibold mb-1">
                  {String(slot?.hour || 0).padStart(2, '0')}:00
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {(slot?.minutesRead || 0)}m
                </div>
                {(slot?.percentage || 0) > 0 && (
                  <div className="text-xs text-primary mt-1">
                    {(slot?.percentage || 0).toFixed(0)}%
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

const TrendCard = ({ title, trend, getTrendIcon, getTrendColor }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
    <h3 className="font-semibold mb-4">{title}</h3>
    <div className="flex items-center gap-2 mb-2">
      {getTrendIcon(trend?.direction || 'neutral')}
      <span className={`text-2xl font-bold ${getTrendColor(trend?.direction || 'neutral')}`}>
        {((trend?.changePercentage || 0) > 0 ? '+' : '')}
        {(trend?.changePercentage || 0).toFixed(1)}%
      </span>
    </div>
    <p className="text-sm text-gray-600 dark:text-gray-400">
      {trend?.interpretation || 'Tidak ada data tren'}
    </p>
  </div>
)

export default StatisticsPage
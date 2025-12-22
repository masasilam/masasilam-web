// ============================================
// src/pages/dashboard/DashboardOverview.jsx - OPTIMIZED
// ============================================

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { dashboardService } from '../../services/dashboardService'
import {
  Book, Clock, Star, TrendingUp, Flame, Bookmark,
  Highlighter, MessageSquare, Award, Target, Calendar
} from 'lucide-react'
import LoadingSpinner from '../../components/Common/LoadingSpinner'

const StatCard = ({ icon: Icon, label, value, color, subtitle }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-gray-600 dark:text-gray-400 text-sm">{label}</h3>
      <Icon className={`w-8 h-8 ${color} opacity-50`} />
    </div>
    <p className="text-3xl font-bold mb-1">{value}</p>
    {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
  </div>
)

const QuickLink = ({ to, icon: Icon, label, count }) => (
  <Link to={to} className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
    <Icon className="w-6 h-6 text-primary" />
    <span className="text-sm font-medium text-center">{label}</span>
    {count !== undefined && <span className="text-xs text-gray-500">{count}</span>}
  </Link>
)

const DashboardOverview = () => {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    dashboardService.getMainDashboard()
      .then(res => setData(res.data))
      .catch(() => setError('Gagal memuat dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>

  const stats = data?.overviewStats || {}
  const reading = data?.booksInProgress || []
  const pattern = data?.readingPattern || {}
  const recent = data?.recentlyRead || []
  const notes = data?.annotationsSummary || {}
  const achievements = data?.recentAchievements || []

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-primary to-purple-500 rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Selamat Datang, {user?.name || user?.username}! 👋</h1>
        <p className="opacity-90">{stats.currentStreak > 0 ? `Streak ${stats.currentStreak} hari! 🔥` : 'Mulai membaca hari ini'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Book} label="Total Buku" value={stats.totalBooks || 0} color="text-primary" subtitle={`${stats.booksCompleted || 0} selesai`} />
        <StatCard icon={Clock} label="Waktu Baca" value={`${stats.totalReadingTimeHours || 0}h`} color="text-blue-500" subtitle="Total jam" />
        <StatCard icon={Flame} label="Streak" value={stats.currentStreak || 0} color="text-orange-500" subtitle={`Terpanjang: ${stats.longestStreak || 0}`} />
        <StatCard icon={Star} label="Rating" value={(stats.averageRating || 0).toFixed(1)} color="text-yellow-500" subtitle={`${(stats.completionRate || 0).toFixed(0)}% selesai`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Sedang Dibaca</h2>
            <Link to="/dasbor/perpustakaan?filter=reading" className="text-primary text-sm hover:underline">Semua</Link>
          </div>
          {reading.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Belum ada buku</p>
          ) : (
            <div className="space-y-4">
              {reading.map(b => (
                <Link key={b.bookId} to={`/buku/${b.bookSlug}`} className="flex gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                  <img src={b.coverImageUrl || '/placeholder.jpg'} alt={b.bookTitle} className="w-12 h-18 object-cover rounded" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{b.bookTitle}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{b.authorName}</p>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-1">
                      <div className="bg-primary h-1.5 rounded-full" style={{ width: `${b.progressPercentage || 0}%` }} />
                    </div>
                    <p className="text-xs text-gray-500">Bab {b.currentChapter || 0}/{b.totalChapters || 0} • {(b.progressPercentage || 0).toFixed(0)}%</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Pola Membaca</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3"><Clock className="w-5 h-5 text-blue-500" /><span className="text-sm">Waktu Favorit</span></div>
              <span className="font-semibold">{pattern.preferredReadingTime || '-'}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3"><TrendingUp className="w-5 h-5 text-green-500" /><span className="text-sm">Kecepatan</span></div>
              <span className="font-semibold">{pattern.averageReadingSpeedWpm || 0} wpm</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3"><Target className="w-5 h-5 text-purple-500" /><span className="text-sm">Durasi Sesi</span></div>
              <span className="font-semibold">{pattern.averageSessionMinutes || 0} menit</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3"><Flame className="w-5 h-5 text-orange-500" /><span className="text-sm">Pace</span></div>
              <span className="font-semibold">{pattern.readingPace || '-'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Terakhir Dibaca</h2>
          <Link to="/dasbor/riwayat" className="text-primary text-sm hover:underline">Riwayat</Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Belum ada riwayat</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recent.slice(0, 6).map(r => (
              <Link key={`${r.bookId}-${r.lastReadAt}`} to={`/buku/${r.bookSlug}`} className="flex gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary">
                <img src={r.coverImageUrl || '/placeholder.jpg'} alt={r.bookTitle} className="w-16 h-24 object-cover rounded" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm mb-1 truncate">{r.bookTitle}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{r.authorName}</p>
                  <span className={`inline-block px-2 py-0.5 text-xs rounded ${
                    r.activityType === 'completed' ? 'bg-green-100 text-green-700' :
                    r.activityType === 'started' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {r.activityType === 'completed' ? 'Selesai' : r.activityType === 'started' ? 'Dimulai' : 'Lanjut'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Anotasi</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <Bookmark className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
              <div className="text-2xl font-bold">{notes.totalBookmarks || 0}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Bookmarks</div>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Highlighter className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">{notes.totalHighlights || 0}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Highlights</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <MessageSquare className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">{notes.totalNotes || 0}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Notes</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Star className="w-6 h-6 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold">{notes.totalReviews || 0}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Reviews</div>
            </div>
          </div>
          <Link to="/dasbor/anotasi" className="block text-center text-primary hover:underline text-sm">Lihat Semua</Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Pencapaian</h2>
            <Link to="/dasbor/pencapaian" className="text-primary text-sm hover:underline">Semua</Link>
          </div>
          {achievements.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Belum ada pencapaian</p>
          ) : (
            <div className="space-y-3">
              {achievements.map(a => (
                <div key={a.achievementId} className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg">
                  <Award className="w-8 h-8 text-yellow-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm">{a.title}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{a.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Akses Cepat</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickLink to="/dasbor/perpustakaan" icon={Book} label="Perpustakaan" count={stats.totalBooks} />
          <QuickLink to="/dasbor/statistik" icon={TrendingUp} label="Statistik" />
          <QuickLink to="/dasbor/kalender" icon={Calendar} label="Kalender" />
          <QuickLink to="/dasbor/pencapaian" icon={Award} label="Pencapaian" />
        </div>
      </div>
    </div>
  )
}

export default DashboardOverview
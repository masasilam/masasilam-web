// ============================================
// src/pages/dashboard/DashboardOverview.jsx - FIXED
// ============================================

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { dashboardService } from '../../services/dashboardService'
import { 
  Book, Clock, Star, TrendingUp, Flame, 
  Bookmark, Highlighter, MessageSquare,
  Award, Target, Calendar
} from 'lucide-react'
import LoadingSpinner from '../../components/Common/LoadingSpinner'

const DashboardOverview = () => {
  const { user } = useAuth()
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Fetching dashboard...')
      const response = await dashboardService.getMainDashboard()
      
      console.log('Dashboard response:', response)
      console.log('Dashboard data:', response?.data)
      
      // PERBAIKAN: Validasi data dengan optional chaining
      setDashboard(response?.data || null)
    } catch (error) {
      console.error('Error fetching dashboard:', error)
      setError('Gagal memuat dashboard')
      setDashboard(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner />
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>
  
  // PERBAIKAN: Validasi dashboard data dengan default values
  const stats = dashboard?.overviewStats || {
    currentStreak: 0,
    longestStreak: 0,
    totalBooks: 0,
    booksCompleted: 0,
    totalReadingTimeHours: 0,
    averageRating: 0,
    completionRate: 0
  }

  const booksInProgress = dashboard?.booksInProgress || []
  const readingPattern = dashboard?.readingPattern || {
    preferredReadingTime: 'Belum ada data',
    averageReadingSpeedWpm: 0,
    averageSessionMinutes: 0,
    readingPace: 'Belum ada data'
  }
  
  const recentlyRead = dashboard?.recentlyRead || []
  const annotationsSummary = dashboard?.annotationsSummary || {
    totalBookmarks: 0,
    totalHighlights: 0,
    totalNotes: 0,
    totalReviews: 0
  }
  
  const recentAchievements = dashboard?.recentAchievements || []

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary to-purple-500 rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Selamat Datang, {user?.name || user?.username || 'Pengguna'}! 👋
        </h1>
        <p className="opacity-90">
          {stats.currentStreak > 0 
            ? `Streak ${stats.currentStreak} hari! Lanjutkan membaca hari ini 🔥`
            : 'Mulai petualangan membaca Anda hari ini'}
        </p>
      </div>

      {/* Stats Grid - PERBAIKAN: Gunakan optional chaining */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Book}
          label="Total Buku"
          value={stats.totalBooks}
          color="text-primary"
          subtitle={`${stats.booksCompleted} selesai`}
        />
        
        <StatCard
          icon={Clock}
          label="Waktu Baca"
          value={`${stats.totalReadingTimeHours}h`}
          color="text-blue-500"
          subtitle="Total jam membaca"
        />
        
        <StatCard
          icon={Flame}
          label="Streak Aktif"
          value={stats.currentStreak}
          color="text-orange-500"
          subtitle={`Terpanjang: ${stats.longestStreak} hari`}
        />
        
        <StatCard
          icon={Star}
          label="Rating Rata-rata"
          value={stats.averageRating.toFixed(1)}
          color="text-yellow-500"
          subtitle={`${stats.completionRate.toFixed(0)}% completion`}
        />
      </div>

      {/* Reading Progress & Pattern */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Books In Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Sedang Dibaca</h2>
            <Link to="/dasbor/perpustakaan?filter=reading" className="text-primary text-sm hover:underline">
              Lihat Semua
            </Link>
          </div>
          
          {booksInProgress.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Belum ada buku yang sedang dibaca</p>
          ) : (
            <div className="space-y-4">
              {booksInProgress.map((book) => (
                <Link
                  key={book.bookId}
                  to={`/buku/${book.bookSlug}`}
                  className="flex gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <img
                    src={book.coverImageUrl || 'https://via.placeholder.com/60x90'}
                    alt={book.bookTitle}
                    className="w-12 h-18 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{book.bookTitle}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      {book.authorName}
                    </p>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-1">
                      <div
                        className="bg-primary h-1.5 rounded-full"
                        style={{ width: `${book.progressPercentage || 0}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Bab {book.currentChapter || 0} dari {book.totalChapters || 0} • {book.progressPercentage?.toFixed(0) || 0}%
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Reading Pattern */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Pola Membaca</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-500" />
                <span className="text-sm">Waktu Favorit</span>
              </div>
              <span className="font-semibold">{readingPattern.preferredReadingTime}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span className="text-sm">Kecepatan Baca</span>
              </div>
              <span className="font-semibold">{readingPattern.averageReadingSpeedWpm} wpm</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-purple-500" />
                <span className="text-sm">Durasi Sesi</span>
              </div>
              <span className="font-semibold">{readingPattern.averageSessionMinutes} menit</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <Flame className="w-5 h-5 text-orange-500" />
                <span className="text-sm">Pace</span>
              </div>
              <span className="font-semibold">{readingPattern.readingPace}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recently Read */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Terakhir Dibaca</h2>
          <Link to="/dasbor/riwayat" className="text-primary text-sm hover:underline">
            Lihat Riwayat
          </Link>
        </div>
        
        {recentlyRead.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Belum ada riwayat membaca</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentlyRead.map((item) => (
              <Link
                key={item.bookId}
                to={`/buku/${item.bookSlug}`}
                className="flex gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary transition-colors"
              >
                <img
                  src={item.coverImageUrl || 'https://via.placeholder.com/60x90'}
                  alt={item.bookTitle}
                  className="w-16 h-24 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm mb-1 truncate">{item.bookTitle}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{item.authorName}</p>
                  <span className={`inline-block px-2 py-0.5 text-xs rounded ${
                    item.activityType === 'completed' ? 'bg-green-100 text-green-700' :
                    item.activityType === 'started' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {item.activityType === 'completed' ? 'Selesai' : 
                     item.activityType === 'started' ? 'Dimulai' : 'Dilanjutkan'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Annotations & Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Annotations Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Anotasi</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <Bookmark className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
              <div className="text-2xl font-bold">{annotationsSummary.totalBookmarks}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Bookmarks</div>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Highlighter className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">{annotationsSummary.totalHighlights}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Highlights</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <MessageSquare className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">{annotationsSummary.totalNotes}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Notes</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Star className="w-6 h-6 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold">{annotationsSummary.totalReviews}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Reviews</div>
            </div>
          </div>
          <Link 
            to="/dasbor/anotasi" 
            className="block text-center text-primary hover:underline text-sm"
          >
            Lihat Semua Anotasi
          </Link>
        </div>

        {/* Recent Achievements */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Pencapaian Terbaru</h2>
            <Link to="/dasbor/pencapaian" className="text-primary text-sm hover:underline">
              Lihat Semua
            </Link>
          </div>
          
          {recentAchievements.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Belum ada pencapaian</p>
          ) : (
            <div className="space-y-3">
              {recentAchievements.map((achievement) => (
                <div 
                  key={achievement.achievementId}
                  className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg"
                >
                  <Award className="w-8 h-8 text-yellow-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm">{achievement.title}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Akses Cepat</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickLink
            to="/dasbor/perpustakaan"
            icon={Book}
            label="Perpustakaan"
            count={stats.totalBooks}
          />
          <QuickLink
            to="/dasbor/statistik"
            icon={TrendingUp}
            label="Statistik"
          />
          <QuickLink
            to="/dasbor/kalender"
            icon={Calendar}
            label="Kalender"
          />
          <QuickLink
            to="/dasbor/pencapaian"
            icon={Award}
            label="Pencapaian"
          />
        </div>
      </div>
    </div>
  )
}

// Helper Components
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
  <Link
    to={to}
    className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
  >
    <Icon className="w-6 h-6 text-primary" />
    <span className="text-sm font-medium text-center">{label}</span>
    {count !== undefined && (
      <span className="text-xs text-gray-500">{count}</span>
    )}
  </Link>
)

export default DashboardOverview
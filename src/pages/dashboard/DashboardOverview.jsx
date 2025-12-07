// ============================================
// src/pages/dashboard/DashboardOverview.jsx
// ============================================

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { userService } from '../../services/userService'
import { Book, Clock, Star, TrendingUp } from 'lucide-react'
import LoadingSpinner from '../../components/Common/LoadingSpinner'

const DashboardOverview = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalBooks: 0,
    readingTime: 0,
    completedBooks: 0,
    averageRating: 0
  })
  const [recentBooks, setRecentBooks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      // TODO: Implement actual dashboard stats API
      const response = await userService.getReadingHistory(1, 5)
      setRecentBooks(response.data?.data || [])
      
      // Mock stats for now
      setStats({
        totalBooks: 15,
        readingTime: 120,
        completedBooks: 8,
        averageRating: 4.5
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary to-purple-500 rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Selamat Datang, {user?.name || user?.username}! 👋
        </h1>
        <p className="opacity-90">
          Lanjutkan petualangan membaca Anda hari ini
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 dark:text-gray-400 text-sm">Total Buku</h3>
            <Book className="w-8 h-8 text-primary opacity-50" />
          </div>
          <p className="text-3xl font-bold">{stats.totalBooks}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 dark:text-gray-400 text-sm">Waktu Baca</h3>
            <Clock className="w-8 h-8 text-blue-500 opacity-50" />
          </div>
          <p className="text-3xl font-bold">{stats.readingTime}h</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 dark:text-gray-400 text-sm">Selesai Dibaca</h3>
            <TrendingUp className="w-8 h-8 text-green-500 opacity-50" />
          </div>
          <p className="text-3xl font-bold">{stats.completedBooks}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-600 dark:text-gray-400 text-sm">Rating Rata-rata</h3>
            <Star className="w-8 h-8 text-yellow-500 opacity-50" />
          </div>
          <p className="text-3xl font-bold">{stats.averageRating}</p>
        </div>
      </div>

      {/* Recent Reading */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Terakhir Dibaca</h2>
          <Link to="/dasbor/riwayat" className="text-primary hover:underline text-sm">
            Lihat Semua
          </Link>
        </div>
        
        {recentBooks.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            Belum ada riwayat membaca
          </p>
        ) : (
          <div className="space-y-4">
            {recentBooks.map((book) => (
              <div key={book.id} className="flex gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <img
                  src={book.coverImageUrl || 'https://via.placeholder.com/80x120'}
                  alt={book.title}
                  className="w-20 h-30 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{book.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {book.author}
                  </p>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${book.progress || 0}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {book.progress || 0}% selesai
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardOverview
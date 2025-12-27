// ============================================
// src/pages/dashboard/ReadingHistoryPage.jsx - FIXED
// ============================================

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { dashboardService } from '../../services/dashboardService'
import LoadingSpinner from '../../components/Common/LoadingSpinner'
import { Clock, Book as BookIcon, Bookmark, Highlighter, MessageSquare, Star } from 'lucide-react'

const ReadingHistoryPage = () => {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [days, setDays] = useState(7)
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetchHistory()
  }, [days, page])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await dashboardService.getReadingHistory(days, page, 20)

      console.log('Reading history response:', response) // Debug
      console.log('Response data:', response?.data) // Debug

      // PERBAIKAN: Handle multiple response structures
      let activitiesData = []

      if (response?.data?.data?.list) {
        // Struktur: response.data.data.list
        activitiesData = response.data.data.list
      } else if (response?.data?.list) {
        // Struktur: response.data.list
        activitiesData = response.data.list
      } else if (response?.data?.items) {
        // Struktur: response.data.items
        activitiesData = response.data.items
      } else if (Array.isArray(response?.data)) {
        // Struktur: response.data langsung array
        activitiesData = response.data
      }

      console.log('Activities data:', activitiesData) // Debug

      setActivities(activitiesData || [])
    } catch (error) {
      console.error('Error:', error)
      setError('Gagal memuat riwayat aktivitas')
      setActivities([])
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type) => {
    switch(type) {
      case 'reading_session': return <BookIcon className="w-5 h-5 text-blue-500" />
      case 'add_bookmark': return <Bookmark className="w-5 h-5 text-yellow-500" />
      case 'add_highlight': return <Highlighter className="w-5 h-5 text-green-500" />
      case 'add_note': return <MessageSquare className="w-5 h-5 text-purple-500" />
      case 'add_rating': return <Star className="w-5 h-5 text-orange-500" />
      case 'add_review': return <MessageSquare className="w-5 h-5 text-indigo-500" />
      default: return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins} menit yang lalu`
    if (diffHours < 24) return `${diffHours} jam yang lalu`
    if (diffDays < 7) return `${diffDays} hari yang lalu`
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Riwayat Aktivitas</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Timeline aktivitas membaca Anda
        </p>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <p className="text-red-700 dark:text-red-400">{error}</p>
          <button
            onClick={fetchHistory}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Period Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div className="flex gap-2">
          {[7, 30, 90].map(d => (
            <button
              key={d}
              onClick={() => {
                setDays(d)
                setPage(1)
              }}
              className={`px-4 py-2 rounded-lg transition-colors ${
                days === d
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {d} Hari Terakhir
            </button>
          ))}
        </div>
      </div>

      {/* PERBAIKAN: Gunakan optional chaining */}
      {loading ? (
        <LoadingSpinner />
      ) : activities?.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <Clock className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">Belum ada aktivitas</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {activities.map((activity) => (
              <div key={activity?.activityId || Math.random()} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity?.activityType)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <Link
                          to={`/buku/${activity?.bookSlug || '#'}`}
                          className="font-semibold hover:text-primary"
                        >
                          {activity?.bookTitle || 'Judul tidak tersedia'}
                        </Link>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {activity?.description || ''}
                        </p>
                        {activity?.chapterNumber && (
                          <p className="text-xs text-gray-500 mt-1">
                            Bab {activity.chapterNumber}
                          </p>
                        )}
                      </div>

                      {activity?.bookCover && (
                        <img
                          src={activity.bookCover}
                          alt={activity?.bookTitle || 'Cover buku'}
                          className="w-12 h-16 object-cover rounded"
                        />
                      )}
                    </div>

                    <p className="text-xs text-gray-500">
                      {activity?.timestamp ? formatTimestamp(activity.timestamp) : 'Waktu tidak tersedia'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ReadingHistoryPage
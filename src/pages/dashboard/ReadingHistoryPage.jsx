// ============================================
// src/pages/dashboard/ReadingHistoryPage.jsx
// ============================================

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { userService } from '../../services/userService'
import LoadingSpinner from '../../components/Common/LoadingSpinner'
import { formatRelativeTime } from '../../utils/helpers'
import { Clock } from 'lucide-react'

const ReadingHistoryPage = () => {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const response = await userService.getReadingHistory(1, 20)
      setHistory(response.data?.data || [])
    } catch (error) {
      console.error('Error fetching history:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Riwayat Baca</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Aktivitas membaca Anda
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {history.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Belum ada riwayat membaca</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {history.map((item) => (
              <Link
                key={item.id}
                to={`/buku/${item.bookSlug}`}
                className="block p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex gap-4">
                  <img
                    src={item.coverImageUrl || 'https://via.placeholder.com/80x120'}
                    alt={item.bookTitle}
                    className="w-20 h-30 object-cover rounded flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-1 truncate">
                      {item.bookTitle}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {item.author}
                    </p>
                    <p className="text-xs text-gray-500">
                      Dibaca {formatRelativeTime(item.lastReadAt)}
                    </p>
                    {item.progress > 0 && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {item.progress}% selesai
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ReadingHistoryPage
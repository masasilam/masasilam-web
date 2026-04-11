// ============================================
// src/pages/dashboard/ReadingHistoryPage.jsx
//
// PERBAIKAN: Ganti multi-format parsing lama dengan satu path yang jelas.
// normalize() menjamin shape: { success, message, code, data }
// di mana data = ReadingHistoryPageResponse { list, total, page, limit }
// Jadi ambil langsung res.data.list — tidak perlu coba-coba berbagai format.
// ============================================
import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { dashboardService } from '../../services/dashboardService'
import LoadingSpinner from '../../components/Common/LoadingSpinner'
import { Clock, BookOpen } from 'lucide-react'

const formatTimestamp = (timestamp) => {
  if (!timestamp) return ''
  const date     = new Date(timestamp)
  const now      = new Date()
  const diffMs   = now - date
  const diffMin  = Math.floor(diffMs / 60000)
  const diffHr   = Math.floor(diffMs / 3600000)
  const diffDay  = Math.floor(diffMs / 86400000)

  if (diffMin < 60) return `${diffMin} menit yang lalu`
  if (diffHr  < 24) return `${diffHr} jam yang lalu`
  if (diffDay < 7)  return `${diffDay} hari yang lalu`

  return date.toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
}

const ReadingHistoryPage = () => {
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [days, setDays]       = useState(7)
  const [page, setPage]       = useState(1)
  const [total, setTotal]     = useState(0)
  const LIMIT = 20

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await dashboardService.getReadingHistory(days, page, LIMIT)

      // PERBAIKAN: normalize() → { success, data }
      // data = ReadingHistoryPageResponse { list, total, page, limit }
      const pageData = res?.data || {}
      setItems(pageData.items || [])
      setTotal(pageData.total || 0)

    } catch (err) {
      console.error('Error fetching reading history:', err)
      setError('Gagal memuat riwayat aktivitas')
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [days, page])

  useEffect(() => { fetchHistory() }, [fetchHistory])

  const handleDaysChange = (newDays) => { setDays(newDays); setPage(1) }

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Riwayat Aktivitas</h1>
        <p className="text-gray-600 dark:text-gray-400">Timeline sesi membaca Anda</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <p className="text-red-700 dark:text-red-400 mb-2">{error}</p>
          <button
            onClick={fetchHistory}
            className="text-sm px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Period filter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {[7, 30, 90].map(d => (
            <button
              key={d}
              onClick={() => handleDaysChange(d)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
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

      {loading ? (
        <LoadingSpinner />
      ) : items.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">
            Belum ada aktivitas dalam {days} hari terakhir
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Mulai membaca untuk melihat riwayat di sini
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {total} sesi ditemukan
          </p>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {items.map((item, idx) => (
                <div
                  key={`${item.activityId || idx}-${idx}`}
                  className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1 min-w-0">
                          {item.bookSlug ? (
                            <Link
                              to={`/buku/${item.bookSlug}`}
                              className="font-semibold hover:text-primary transition-colors block truncate"
                            >
                              {item.bookTitle || 'Judul tidak tersedia'}
                            </Link>
                          ) : (
                            <p className="font-semibold truncate">
                              {item.bookTitle || 'Judul tidak tersedia'}
                            </p>
                          )}
                          {item.authorName && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                              {item.authorName}
                            </p>
                          )}
                          {/* description dihasilkan backend — tidak perlu direkonstruksi */}
                          {item.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {item.description}
                            </p>
                          )}
                          {item.chapterNumber && (
                            <p className="text-xs text-gray-500 mt-1">
                              Bab {item.chapterNumber}
                            </p>
                          )}
                        </div>
                        {item.bookCover && (
                          <img
                            src={item.bookCover}
                            alt={item.bookTitle || 'Cover buku'}
                            className="w-10 h-14 sm:w-12 sm:h-16 object-cover rounded flex-shrink-0"
                            loading="lazy"
                          />
                        )}
                      </div>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {formatTimestamp(item.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {totalPages > 1 && (
            <nav
              aria-label="Pagination"
              className="flex items-center justify-center gap-2 mt-6"
            >
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600
                  hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                ← Sebelumnya
              </button>
              <span className="text-sm text-gray-500 dark:text-gray-400 px-2" aria-current="page">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || loading}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600
                  hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Selanjutnya →
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  )
}

export default ReadingHistoryPage
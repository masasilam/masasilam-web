// src/pages/dashboard/ReadingHistoryPage.jsx

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { dashboardService } from '../../services/dashboardService'
import { Clock, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react'
import { parseCfiChapter } from '../../utils/epubUtils'

// Format deskripsi menggunakan CFI untuk menentukan bab yang akurat
const buildDescription = (item) => {
  const cfiChapter = parseCfiChapter(item?.lastCfi)
  const chapter = cfiChapter ?? item?.chapterNumber

  const rawDesc = item?.description ?? ''

  if (!chapter) return rawDesc || 'Membaca buku'

  const durasiMatch = rawDesc.match(/selama .+$/)
  const durasiStr = durasiMatch ? durasiMatch[0] : ''

  const isEpub = !item?.chapterNumber && !item?.totalChapters
  if (isEpub) {
    return durasiStr
      ? `Membaca EPUB (bab ${chapter}) ${durasiStr}`
      : `Membaca EPUB (bab ${chapter})`
  }
  return durasiStr
    ? `Membaca hingga Bab ${chapter} ${durasiStr}`
    : `Membaca hingga Bab ${chapter}`
}

const formatTime = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

// Group: tanggal → bookId → { info buku + sessions[] }
const groupByDateAndBook = (items) => {
  const byDate = {}
  items.forEach(item => {
    const dateKey = item.timestamp
      ? new Date(item.timestamp).toLocaleDateString('id-ID', {
          year: 'numeric', month: 'long', day: 'numeric',
        })
      : 'Tanggal tidak diketahui'

    if (!byDate[dateKey]) byDate[dateKey] = {}

    const bookKey = item.bookId
    if (!byDate[dateKey][bookKey]) {
      byDate[dateKey][bookKey] = {
        bookId:     item.bookId,
        bookSlug:   item.bookSlug,
        bookTitle:  item.bookTitle,
        authorName: item.authorName,
        bookCover:  item.bookCover,
        lastCfi:    item.lastCfi,
        sessions:   [],
      }
    }

    byDate[dateKey][bookKey].sessions.push(item)
  })
  return byDate
}

const ProgressBadge = ({ pct }) => {
  const color =
    pct >= 95 ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' :
    pct >= 50 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' :
                'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${color}`}>
      {pct.toFixed(0)}%
    </span>
  )
}

const ReadingHistoryPage = () => {
  const navigate = useNavigate()
  const [historyData, setHistoryData] = useState(null)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)
  const [days, setDays]               = useState(7)
  const [page, setPage]               = useState(1)
  const LIMIT = 20

  useEffect(() => {
    document.title = 'Riwayat Membaca - Dashboard MasasilaM'
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', 'Lihat riwayat sesi membaca Anda')
  }, [])

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await dashboardService.getReadingHistory(days, page, LIMIT)
      setHistoryData(data?.data ?? null)
    } catch (err) {
      console.error('Failed to load history:', err)
      setError('Gagal memuat riwayat membaca')
    } finally {
      setLoading(false)
    }
  }, [days, page])

  useEffect(() => { loadHistory() }, [loadHistory])

  const handleDaysChange = (d) => { setDays(d); setPage(1) }
  const handlePageChange = (p) => {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const items      = historyData?.items ?? []
  const total      = historyData?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / LIMIT))
  const grouped    = groupByDateAndBook(items)

  const DAY_OPTIONS = [
    { value: 7,   label: '7 Hari'  },
    { value: 14,  label: '14 Hari' },
    { value: 30,  label: '30 Hari' },
    { value: 90,  label: '3 Bulan' },
    { value: 365, label: '1 Tahun' },
  ]

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold mb-1">Riwayat Membaca</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {total} sesi ditemukan dalam {days} hari terakhir
            </p>
          </div>

          {/* Filter rentang waktu */}
          <div className="flex flex-wrap gap-2">
            {DAY_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleDaysChange(opt.value)}
                className={`px-3 py-1.5 text-xs sm:text-sm rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  days === opt.value
                    ? 'bg-primary text-white border-primary'
                    : 'text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:border-primary hover:text-primary'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16" role="status" aria-live="polite">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" aria-hidden="true" />
          <span className="sr-only">Memuat riwayat...</span>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center"
          role="alert"
        >
          <p className="text-red-700 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={loadHistory}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && items.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Belum ada riwayat membaca dalam {days} hari terakhir
          </p>
        </div>
      )}

      {/* List dikelompokkan per tanggal → per buku */}
      {!loading && !error && items.length > 0 && (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, books]) => {
            const totalSesi = Object.values(books).reduce(
              (sum, b) => sum + b.sessions.length, 0
            )

            return (
              <section key={date}>
                {/* Tanggal header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <h2 className="font-semibold text-sm sm:text-base text-gray-700 dark:text-gray-300">
                      {date}
                    </h2>
                  </div>
                  <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {totalSesi} sesi
                  </span>
                </div>

                {/* Kartu per buku */}
                <div className="space-y-2 sm:space-y-3">
                  {Object.values(books).map(book => {
                    const pct = book.sessions[0]?.progressPercentage ?? 0

                    const handleBookClick = () => {
                      if (!book.bookSlug) return
                      navigate(`/buku/${book.bookSlug}/baca`, {
                        state: book.lastCfi ? { lastCfi: book.lastCfi } : {},
                      })
                    }

                    return (
                      <div
                        key={book.bookId}
                        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 overflow-hidden hover:border-primary hover:shadow-md transition-all"
                      >
                        {/* Header buku */}
                        <div
                          onClick={handleBookClick}
                          className="flex gap-3 p-3 sm:p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          role="link"
                          tabIndex={0}
                          onKeyDown={e => e.key === 'Enter' && handleBookClick()}
                        >
                          {/* Cover */}
                          {book.bookCover ? (
                            <img
                              src={book.bookCover}
                              alt={`Cover ${book.bookTitle}`}
                              className="w-10 h-14 object-cover rounded shadow flex-shrink-0"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-10 h-14 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
                              <BookOpen className="w-4 h-4 text-gray-400" />
                            </div>
                          )}

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-0.5">
                              <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                                {book.bookTitle}
                              </h3>
                              <ProgressBadge pct={pct} />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                              {book.authorName}
                            </p>
                            {/* Progress bar */}
                            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1">
                              <div
                                className="h-1 rounded-full bg-primary transition-all"
                                style={{ width: `${Math.min(pct, 100)}%` }}
                                role="progressbar"
                                aria-valuenow={pct}
                                aria-valuemin="0"
                                aria-valuemax="100"
                              />
                            </div>
                          </div>

                          {/* Jumlah sesi */}
                          <div className="flex-shrink-0 text-right pl-2">
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                              {book.sessions.length} sesi
                            </p>
                          </div>
                        </div>

                        {/* Timeline sesi */}
                        <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-2 pl-16 space-y-1.5">
                          {book.sessions.map(s => (
                            <div
                              key={s.activityId}
                              className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400"
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0" />
                              <span className="flex-1 truncate">{buildDescription(s)}</span>
                              <span className="flex-shrink-0 text-gray-400 dark:text-gray-500">
                                {formatTime(s.timestamp)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <nav aria-label="Pagination" className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => handlePageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="w-4 h-4" />
            Sebelumnya
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400 px-2" aria-current="page">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-1 px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Selanjutnya
            <ChevronRight className="w-4 h-4" />
          </button>
        </nav>
      )}
    </div>
  )
}

export default ReadingHistoryPage
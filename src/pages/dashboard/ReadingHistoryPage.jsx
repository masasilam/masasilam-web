import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { dashboardService } from '../../services/dashboardService'
import DashboardShell from '../../components/Dashboard/DashboardShell'
import { Clock, BookOpen, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react'
import { parseCfiChapter } from '../../utils/epubUtils'

const buildDescription = (item) => {
  const cfiChapter = parseCfiChapter(item?.lastCfi)
  const chapter    = cfiChapter ?? item?.chapterNumber
  const rawDesc    = item?.description ?? ''
  if (!chapter) return rawDesc || 'Membaca buku'
  const durasiMatch = rawDesc.match(/selama .+$/)
  const durasiStr   = durasiMatch ? durasiMatch[0] : ''
  const isEpub = !item?.chapterNumber && !item?.totalChapters
  if (isEpub) return durasiStr ? `Membaca EPUB (bab ${chapter}) ${durasiStr}` : `Membaca EPUB (bab ${chapter})`
  return durasiStr ? `Membaca hingga Bab ${chapter} ${durasiStr}` : `Membaca hingga Bab ${chapter}`
}

const formatTime = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

const groupByDateAndBook = (items) => {
  const byDate = {}
  items.forEach(item => {
    const dateKey = item.timestamp
      ? new Date(item.timestamp).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      : 'Tanggal tidak diketahui'
    if (!byDate[dateKey]) byDate[dateKey] = {}
    const bookKey = item.bookId
    if (!byDate[dateKey][bookKey]) {
      byDate[dateKey][bookKey] = {
        bookId: item.bookId, bookSlug: item.bookSlug, bookTitle: item.bookTitle,
        authorName: item.authorName, bookCover: item.bookCover,
        lastCfi: item.lastCfi, sessions: [],
      }
    }
    byDate[dateKey][bookKey].sessions.push(item)
  })
  return byDate
}

const ProgressBadge = ({ pct }) => {
  const color =
    pct >= 95 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
    : pct >= 50 ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'
    : 'bg-stone-100 text-stone-600 dark:bg-slate-700 dark:text-slate-300'
  return (
    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${color}`}>
      {pct.toFixed(0)}%
    </span>
  )
}

const DAY_OPTIONS = [
  { value: 7,   label: '7 Hari'  },
  { value: 14,  label: '14 Hari' },
  { value: 30,  label: '30 Hari' },
  { value: 90,  label: '3 Bulan' },
  { value: 365, label: '1 Tahun' },
]

const ReadingHistoryPage = () => {
  const navigate = useNavigate()
  const [historyData, setHistoryData] = useState(null)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)
  const [days, setDays]               = useState(7)
  const [page, setPage]               = useState(1)
  const LIMIT = 20

  useEffect(() => { document.title = 'Riwayat Membaca - Dashboard' }, [])

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true); setError(null)
      const data = await dashboardService.getReadingHistory(days, page, LIMIT)
      setHistoryData(data?.data ?? null)
    } catch (err) {
      setError(err?.response?.status === 401 ? 'auth' : 'network')
    } finally {
      setLoading(false)
    }
  }, [days, page])

  useEffect(() => { loadHistory() }, [loadHistory])

  const handleDaysChange = (d) => { setDays(d); setPage(1) }
  const handlePageChange = (p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  const items      = historyData?.items ?? []
  const total      = historyData?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / LIMIT))
  const grouped    = groupByDateAndBook(items)

  return (
    <DashboardShell
      loading={loading} error={error} onRetry={loadHistory}
      onLogin={() => navigate('/masuk', { state: { from: '/dasbor/riwayat' } })}
    >
      <div className="space-y-5">

        {/* ── Header ──────────────────────────────────────────── */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-slate-50 mb-1">Riwayat Membaca</h1>
          <p className="text-sm text-stone-500 dark:text-slate-400">
            {total > 0
              ? <><span className="font-semibold text-stone-700 dark:text-slate-300">{total} sesi</span> ditemukan dalam {days} hari terakhir</>
              : `Tidak ada sesi dalam ${days} hari terakhir`}
          </p>
        </div>

        {/* ── Period Filter ────────────────────────────────────── */}
        <div className="flex gap-2 flex-wrap">
          {DAY_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => handleDaysChange(opt.value)}
              className={`px-4 py-2 text-sm font-medium rounded-full border transition-all ${
                days === opt.value
                  ? 'bg-amber-500 text-stone-950 border-amber-500 font-bold shadow-sm shadow-amber-200 dark:shadow-amber-900/30'
                  : 'bg-white dark:bg-slate-900 text-stone-600 dark:text-slate-400 border-stone-200 dark:border-slate-700 hover:border-amber-400 hover:text-amber-600 dark:hover:border-amber-500 dark:hover:text-amber-400'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* ── Empty State ───────────────────────────────────────── */}
        {!loading && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-slate-700">
            <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-stone-300 dark:text-slate-600" />
            </div>
            <p className="text-stone-500 dark:text-slate-400 text-sm font-medium mb-1">Belum ada riwayat</p>
            <p className="text-stone-400 dark:text-slate-500 text-xs">Mulai membaca buku untuk melihat aktivitas di sini</p>
          </div>
        )}

        {/* ── History List ─────────────────────────────────────── */}
        {items.length > 0 && (
          <div className="space-y-6">
            {Object.entries(grouped).map(([date, books]) => {
              const totalSesi = Object.values(books).reduce((sum, b) => sum + b.sessions.length, 0)
              return (
                <section key={date}>
                  {/* Date separator */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                      </div>
                      <h2 className="text-sm font-bold text-stone-800 dark:text-slate-200 capitalize">{date}</h2>
                    </div>
                    <div className="flex-1 h-px bg-stone-100 dark:bg-slate-800" />
                    <span className="text-xs text-stone-400 dark:text-slate-500 flex-shrink-0 bg-stone-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                      {totalSesi} sesi
                    </span>
                  </div>

                  {/* Book cards */}
                  <div className="space-y-2 pl-0 sm:pl-3">
                    {Object.values(books).map(book => {
                      const pct = book.sessions[0]?.progressPercentage ?? 0
                      const handleBookClick = () => {
                        if (!book.bookSlug) return
                        navigate(`/buku/${book.bookSlug}/baca`, {
                          state: book.lastCfi ? { lastCfi: book.lastCfi } : {},
                        })
                      }
                      return (
                        <div key={book.bookId} className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-slate-700 overflow-hidden hover:border-amber-300 dark:hover:border-amber-500/50 hover:shadow-sm transition-all">

                          {/* Book header — clickable */}
                          <div
                            onClick={handleBookClick}
                            className="flex gap-3 p-4 cursor-pointer hover:bg-stone-50/60 dark:hover:bg-slate-800/30 transition-colors group"
                            role="link" tabIndex={0}
                            onKeyDown={e => e.key === 'Enter' && handleBookClick()}
                          >
                            {/* Cover */}
                            <div className="w-11 flex-shrink-0 rounded-lg overflow-hidden border border-stone-100 dark:border-slate-700 aspect-[2/3] shadow-sm">
                              {book.bookCover
                                ? <img src={book.bookCover} alt={`Cover ${book.bookTitle}`} className="w-full h-full object-cover" loading="lazy" />
                                : <div className="w-full h-full bg-stone-100 dark:bg-slate-800 flex items-center justify-center"><BookOpen className="w-4 h-4 text-stone-300" /></div>
                              }
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-0.5">
                                <h3 className="font-bold text-sm text-stone-900 dark:text-slate-100 truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">{book.bookTitle}</h3>
                                <ProgressBadge pct={pct} />
                              </div>
                              <p className="text-xs text-stone-400 dark:text-slate-500 mb-2 truncate">{book.authorName}</p>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 rounded-full bg-stone-100 dark:bg-slate-700 overflow-hidden">
                                  <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all"
                                    style={{ width: `${Math.min(pct, 100)}%` }}
                                    role="progressbar" aria-valuenow={pct} aria-valuemin="0" aria-valuemax="100" />
                                </div>
                                <span className="text-xs text-stone-400 dark:text-slate-500 flex-shrink-0">
                                  {book.sessions.length} sesi
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Sessions list */}
                          <div className="border-t border-stone-100 dark:border-slate-800 divide-y divide-stone-50 dark:divide-slate-800/50">
                            {book.sessions.map(s => (
                              <div key={s.activityId} className="flex items-center gap-3 px-4 py-2.5 pl-[4.25rem]">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-300 dark:bg-amber-600 flex-shrink-0" />
                                <span className="flex-1 text-xs text-stone-600 dark:text-slate-400 truncate">{buildDescription(s)}</span>
                                <span className="flex-shrink-0 text-[11px] text-stone-400 dark:text-slate-500 font-medium">{formatTime(s.timestamp)}</span>
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

        {/* ── Pagination ────────────────────────────────────────── */}
        {totalPages > 1 && (
          <nav className="flex items-center justify-center gap-2 pt-2" aria-label="Pagination">
            <button
              onClick={() => handlePageChange(Math.max(1, page - 1))}
              disabled={page === 1}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-stone-600 dark:text-slate-400 disabled:opacity-40 hover:border-stone-400 transition-all"
            >
              <ChevronLeft className="w-4 h-4" /> Sebelumnya
            </button>
            <span className="px-4 py-2 text-sm text-stone-500 dark:text-slate-400">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-stone-600 dark:text-slate-400 disabled:opacity-40 hover:border-stone-400 transition-all"
            >
              Selanjutnya <ChevronRight className="w-4 h-4" />
            </button>
          </nav>
        )}
      </div>
    </DashboardShell>
  )
}

export default ReadingHistoryPage
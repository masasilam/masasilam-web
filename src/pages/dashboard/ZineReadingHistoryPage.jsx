// ============================================
// src/pages/dashboard/ZineReadingHistoryPage.jsx
// Dashboard: Riwayat Baca Zine
// LIGHT: stone palette | DARK: slate palette — Emerald accent
// ============================================
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import zineDashboardService from '../../services/zineDashboardService'
import LoadingSpinner from '../../components/Common/LoadingSpinner'
import { BookOpen, Clock, Calendar, ChevronRight, Layers, TrendingUp } from 'lucide-react'

const PERIOD_OPTIONS = [
  { value: 7,  label: '7 hari' },
  { value: 14, label: '14 hari' },
  { value: 30, label: '30 hari' },
  { value: 90, label: '90 hari' },
]

// ── Format date relative ──────────────────────────────────────────────────────
const formatRelative = (dateStr) => {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  const now   = new Date()
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Hari ini'
  if (diffDays === 1) return 'Kemarin'
  if (diffDays < 7)   return `${diffDays} hari lalu`
  return date.toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' })
}

// ── HistoryItem ───────────────────────────────────────────────────────────────
const HistoryItem = ({ item }) => {
  const navigate = useNavigate()
  const pct = Math.round(item.progressPercentage || 0)

  const handleClick = () => {
    if (!item.zineSlug) return
    navigate(`/zine/${item.zineSlug}/baca`, { state: item.lastCfi ? { lastCfi: item.lastCfi } : {} })
  }

  return (
    <div onClick={handleClick}
      className="flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border cursor-pointer
                 transition-all hover:shadow-md hover:-translate-y-0.5
                 bg-white border-stone-100 shadow-sm shadow-stone-50/80
                 hover:border-emerald-200 hover:shadow-emerald-50
                 dark:bg-gray-800 dark:border-gray-700 dark:shadow-none
                 dark:hover:border-emerald-700/50 dark:hover:shadow-emerald-900/20"
      role="link" tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && handleClick()}>

      {/* Cover */}
      <div className="flex-shrink-0 w-12 sm:w-14">
        <div className="aspect-[2/3] rounded-lg overflow-hidden bg-stone-100 dark:bg-gray-700 shadow-sm relative">
          {/* Emerald stripe */}
          <div className="absolute top-0 inset-x-0 h-0.5 z-10 bg-gradient-to-r from-emerald-500 to-teal-400" />
          {item.zineCover ? (
            <img src={item.zineCover} alt={item.zineTitle} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-emerald-50 dark:bg-emerald-900/20">
              <Layers className="w-5 h-5 text-emerald-400 dark:text-emerald-600" />
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-sm line-clamp-2 text-gray-900 dark:text-white leading-snug">
            {item.zineTitle}
          </h3>
          <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0 mt-0.5" />
        </div>

        {item.authorName && (
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-2">{item.authorName}</p>
        )}

        {item.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2 leading-relaxed">
            {item.description}
          </p>
        )}

        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
              style={{ width:`${pct}%` }} />
          </div>
          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums w-8 text-right">
            {pct}%
          </span>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 text-[10px] text-gray-400 dark:text-gray-500">
          {item.chapterNumber && (
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />Bab {item.chapterNumber}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />{formatRelative(item.timestamp)}
          </span>
        </div>
      </div>
    </div>
  )
}

// ── ZineReadingHistoryPage ────────────────────────────────────────────────────
const ZineReadingHistoryPage = () => {
  const [items,      setItems]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [period,     setPeriod]     = useState(7)
  const [page,       setPage]       = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const LIMIT = 20

  useEffect(() => { document.title = 'Riwayat Zine — Dashboard' }, [])

  const fetchHistory = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const res = await zineDashboardService.getZineReadingHistory(period, page, LIMIT)
      if (res?.data) {
        setItems(res.data.items || [])
        const total = res.data.total || res.data.totalData || 0
        setTotalCount(total)
        setTotalPages(Math.max(1, Math.ceil(total / LIMIT)))
      } else { setItems([]); setTotalCount(0); setTotalPages(1) }
    } catch (err) {
      if (err?.response?.status === 401) setError('auth')
      else setError('network')
      setItems([])
    } finally { setLoading(false) }
  }, [period, page])

  useEffect(() => { fetchHistory() }, [fetchHistory])

  const handlePeriodChange = (newPeriod) => { setPeriod(newPeriod); setPage(1) }

  // Group by date
  const grouped = items.reduce((acc, item) => {
    const dateKey = item.timestamp
      ? new Date(item.timestamp).toLocaleDateString('id-ID', { weekday:'long', year:'numeric', month:'long', day:'numeric' })
      : 'Tanggal tidak diketahui'
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(item)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-200/60 dark:shadow-emerald-900/40">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Riwayat Baca Zine</h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 ml-12">Jejak membaca zine &amp; majalah Anda</p>
        </div>
        {/* Period selector */}
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-1">
          {PERIOD_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => handlePeriodChange(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                period === opt.value
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary card */}
      {!loading && items.length > 0 && (
        <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-5 text-white shadow-lg shadow-emerald-200/40 dark:shadow-emerald-900/40">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 opacity-80" />
            <span className="text-sm font-semibold opacity-90">{period} hari terakhir</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-2xl font-bold">{totalCount}</p>
              <p className="text-xs opacity-75">Sesi baca</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{new Set(items.map(i => i.zineId)).size}</p>
              <p className="text-xs opacity-75">Zine unik</p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-2xl font-bold">{Object.keys(grouped).length}</p>
              <p className="text-xs opacity-75">Hari aktif</p>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner /></div>
      ) : error === 'auth' ? (
        <div className="text-center py-16">
          <p className="text-gray-500 dark:text-gray-400 mb-4">Sesi telah berakhir</p>
          <button onClick={() => window.location.href = '/masuk'}
            className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-semibold">Masuk Kembali</button>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-center">
          <p className="text-red-700 dark:text-red-400 mb-3">Gagal memuat riwayat baca</p>
          <button onClick={fetchHistory}
            className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition">Coba Lagi</button>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mx-auto mb-4">
            <Layers className="w-8 h-8 text-emerald-300 dark:text-emerald-700" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-base font-medium mb-1">Belum ada riwayat baca zine</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm">Mulai baca zine untuk melihat riwayat di sini</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([dateKey, dayItems]) => (
            <div key={dateKey}>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20
                                border border-emerald-200 dark:border-emerald-700/50">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">{dateKey}</span>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500">{dayItems.length} sesi</span>
              </div>
              <div className="space-y-2">
                {dayItems.map((item) => <HistoryItem key={item.activityId || item.zineId} item={item} />)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 transition">
            ← Sebelumnya
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400 px-2">
            Halaman {page} dari {totalPages}
          </span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="px-4 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 transition">
            Selanjutnya →
          </button>
        </div>
      )}
    </div>
  )
}

export default ZineReadingHistoryPage
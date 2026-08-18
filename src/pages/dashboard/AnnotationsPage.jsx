import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { dashboardService } from '../../services/dashboardService'
import DashboardShell from '../../components/Dashboard/DashboardShell'
import { Bookmark, Highlighter, FileText, ChevronLeft, ChevronRight, StickyNote } from 'lucide-react'

const TYPE_CONFIG = {
  bookmark: {
    label: 'Bookmark',
    icon: Bookmark,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    border: 'border-l-amber-400 dark:border-l-amber-500',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
    bar: 'bg-amber-400',
  },
  highlight: {
    label: 'Highlight',
    icon: Highlighter,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    border: 'border-l-emerald-400 dark:border-l-emerald-500',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
    bar: 'bg-emerald-400',
  },
  note: {
    label: 'Catatan',
    icon: StickyNote,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-500/10',
    border: 'border-l-blue-400 dark:border-l-blue-500',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
    bar: 'bg-blue-400',
  },
}

const AnnotationCard = ({ annotation }) => {
  const cfg = TYPE_CONFIG[annotation.type] || TYPE_CONFIG.note
  const Icon = cfg.icon

  return (
    <div className={`group bg-white dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-slate-700 border-l-4 ${cfg.border} overflow-hidden hover:shadow-md transition-all duration-200`}>
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${cfg.bg}`}>
            <Icon className={`w-4 h-4 ${cfg.color}`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${cfg.badge}`}>
                <Icon className="w-2.5 h-2.5" />{cfg.label}
              </span>
              {annotation.chapterNumber && (
                <span className="text-[11px] text-stone-400 dark:text-slate-500">Bab {annotation.chapterNumber}</span>
              )}
            </div>

            <Link
              to={`/buku/${annotation.bookSlug}/baca`}
              state={{ lastCfi: annotation.cfi }}
              className={`font-bold text-sm mb-2 block leading-snug transition-colors text-stone-800 dark:text-slate-100 ${cfg.color.replace('text-', 'hover:text-')}`}
            >
              {annotation.bookTitle}
            </Link>

            {annotation.content && (
              <p className="text-sm text-stone-600 dark:text-slate-300 leading-relaxed line-clamp-3 mb-3">
                {annotation.content}
              </p>
            )}

            <p className="text-[11px] text-stone-400 dark:text-slate-500">
              {new Date(annotation.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          {annotation.bookCover && (
            <div className="flex-shrink-0 w-12 h-16 rounded-lg overflow-hidden shadow-sm border border-stone-100 dark:border-slate-700">
              <img src={annotation.bookCover} alt={annotation.bookTitle} className="w-full h-full object-cover" loading="lazy" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const AnnotationsPage = () => {
  const navigate = useNavigate()
  const [annotations, setAnnotations] = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)
  const [type, setType]               = useState('all')
  const [sortBy, setSortBy]           = useState('recent')
  const [page, setPage]               = useState(1)
  const [total, setTotal]             = useState(0)
  const LIMIT = 20

  const fetchAnnotations = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await dashboardService.getAnnotations(type, page, LIMIT, sortBy)
      setAnnotations(response.data?.items || [])
      setTotal(response.data?.total || 0)
    } catch (err) {
      setError(err?.response?.status === 401 ? 'auth' : 'network')
    } finally {
      setLoading(false)
    }
  }, [type, sortBy, page])

  useEffect(() => { fetchAnnotations() }, [fetchAnnotations])

  const totalPages = Math.max(1, Math.ceil(total / LIMIT))

  const typeOptions = [
    { value: 'all',       label: 'Semua',      icon: FileText,   count: null },
    { value: 'bookmark',  label: 'Bookmarks',  icon: Bookmark,   count: null },
    { value: 'highlight', label: 'Highlights', icon: Highlighter,count: null },
    { value: 'note',      label: 'Catatan',    icon: StickyNote, count: null },
  ]

  return (
    <DashboardShell
      loading={loading}
      error={error}
      onRetry={fetchAnnotations}
      onLogin={() => navigate('/masuk', { state: { from: '/dasbor/anotasi' } })}
    >
      <div className="space-y-6">

        {/* ── Page Header ───────────────────────────────────────── */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-slate-50 mb-1">Anotasi</h1>
          <p className="text-sm text-stone-500 dark:text-slate-400">
            Semua bookmark, highlight, dan catatan Anda
            {total > 0 && <span className="ml-2 font-medium text-stone-700 dark:text-slate-300">({total} item)</span>}
          </p>
        </div>

        {/* ── Filters & Sort ────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          {/* Type filter pills */}
          <div className="flex gap-2 flex-wrap">
            {typeOptions.map(opt => {
              const Icon = opt.icon
              const cfg = TYPE_CONFIG[opt.value]
              return (
                <button
                  key={opt.value}
                  onClick={() => { setType(opt.value); setPage(1) }}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all border ${
                    type === opt.value
                      ? opt.value === 'all'
                        ? 'bg-stone-800 text-white border-stone-800 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100'
                        : `${cfg?.bg} ${cfg?.color} border-current`
                      : 'bg-white dark:bg-slate-900 text-stone-500 dark:text-slate-400 border-stone-200 dark:border-slate-700 hover:border-stone-400 dark:hover:border-slate-500'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {opt.label}
                </button>
              )
            })}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={e => { setSortBy(e.target.value); setPage(1) }}
            className="self-start sm:self-auto px-3 py-2 text-sm rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-stone-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
          >
            <option value="recent">Terbaru</option>
            <option value="oldest">Terlama</option>
          </select>
        </div>

        {/* ── Empty State ───────────────────────────────────────── */}
        {!loading && annotations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-slate-700">
            <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-stone-300 dark:text-slate-600" />
            </div>
            <p className="text-stone-500 dark:text-slate-400 text-sm">Belum ada anotasi</p>
          </div>
        )}

        {/* ── Annotation List ───────────────────────────────────── */}
        {annotations.length > 0 && (
          <div className="space-y-3">
            {annotations.map((annotation) => (
              <AnnotationCard key={`${annotation.type}-${annotation.id}`} annotation={annotation} />
            ))}
          </div>
        )}

        {/* ── Pagination ────────────────────────────────────────── */}
        {totalPages > 1 && (
          <nav className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-stone-600 dark:text-slate-400 disabled:opacity-40 hover:border-stone-400 dark:hover:border-slate-500 transition-all"
            >
              <ChevronLeft className="w-4 h-4" /> Sebelumnya
            </button>
            <span className="px-4 py-2 text-sm font-medium text-stone-500 dark:text-slate-400">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-stone-600 dark:text-slate-400 disabled:opacity-40 hover:border-stone-400 dark:hover:border-slate-500 transition-all"
            >
              Selanjutnya <ChevronRight className="w-4 h-4" />
            </button>
          </nav>
        )}
      </div>
    </DashboardShell>
  )
}

export default AnnotationsPage
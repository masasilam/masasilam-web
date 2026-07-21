import { useState, useEffect, useCallback, memo } from 'react'
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Calendar, BookOpen, ArrowLeft } from 'lucide-react'
import api from '../services/api'

const CATEGORIES = [
  { value: 'nasional',          label: 'Nasional',           icon: '🇮🇩' },
  { value: 'internasional',     label: 'Internasional',      icon: '🌏' },
  { value: 'daerah',            label: 'Daerah / Lokal',     icon: '📍' },
  { value: 'politik',           label: 'Politik',            icon: '🏛️' },
  { value: 'hukum',             label: 'Hukum & Kriminal',   icon: '⚖️' },
  { value: 'pemerintahan',      label: 'Pemerintahan',       icon: '🏢' },
  { value: 'ekonomi',           label: 'Ekonomi',            icon: '💰' },
  { value: 'bisnis',            label: 'Bisnis & Keuangan',  icon: '📈' },
  { value: 'pertanian',         label: 'Pertanian',          icon: '🌾' },
  { value: 'sosial',            label: 'Sosial',             icon: '👥' },
  { value: 'pendidikan',        label: 'Pendidikan',         icon: '📚' },
  { value: 'kesehatan',         label: 'Kesehatan',          icon: '🏥' },
  { value: 'agama',             label: 'Agama',              icon: '🕌' },
  { value: 'lingkungan',        label: 'Lingkungan',         icon: '🌿' },
  { value: 'teknologi',         label: 'Teknologi',          icon: '💻' },
  { value: 'sains',             label: 'Sains & Iptek',      icon: '🔬' },
  { value: 'budaya',            label: 'Budaya',             icon: '🎭' },
  { value: 'hiburan',           label: 'Hiburan',            icon: '🎬' },
  { value: 'olahraga',          label: 'Olahraga',           icon: '⚽' },
  { value: 'gaya-hidup',        label: 'Gaya Hidup',         icon: '✨' },
  { value: 'kuliner',           label: 'Kuliner',            icon: '🍜' },
  { value: 'wisata',            label: 'Wisata',             icon: '✈️' },
  { value: 'opini',             label: 'Opini / Kolom',      icon: '✍️' },
  { value: 'sastra',            label: 'Sastra & Cerita',    icon: '📖' },
  { value: 'cerita-bersambung', label: 'Cerita Bersambung',  icon: '📜' },
  { value: 'iklan',             label: 'Iklan / Pengumuman', icon: '📢' },
  { value: 'lainnya',           label: 'Lainnya',            icon: '📰' },
]
const CAT_MAP   = Object.fromEntries(CATEGORIES.map(c => [c.value, c]))
const getCatLabel = (v) => CAT_MAP[v]?.label || v
const getCatIcon  = (v) => CAT_MAP[v]?.icon  || '📰'

const formatDate = (d) => {
  try {
    return new Date(d + 'T00:00:00').toLocaleDateString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    })
  } catch { return d }
}

const offsetDate = (d, days) => {
  const dt = new Date(d + 'T00:00:00')
  dt.setDate(dt.getDate() + days)
  return dt.toISOString().split('T')[0]
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
const SkeletonRow = memo(() => (
  <div className="animate-pulse flex items-start gap-4 p-4 rounded-xl border
                  bg-white border-stone-100 dark:bg-slate-900 dark:border-slate-800">
    <div className="w-20 h-14 rounded-lg bg-stone-200 dark:bg-slate-700 flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-2.5 rounded w-1/3 bg-stone-200 dark:bg-slate-700" />
      <div className="h-4 rounded w-full bg-stone-200 dark:bg-slate-700" />
      <div className="h-3 rounded w-2/3 bg-stone-200 dark:bg-slate-700" />
    </div>
  </div>
))
SkeletonRow.displayName = 'SkeletonRow'

// ── ArticleRow ────────────────────────────────────────────────────────────────
const ArticleRow = memo(({ article }) => (
  <Link
    to={`/koran/${article.category}/${article.publishDate}/${article.slug}`}
    className="group flex items-start gap-4 p-4 rounded-xl border transition-all duration-200
               bg-white border-stone-100 hover:border-violet-300 hover:shadow-md hover:shadow-violet-100/60
               dark:bg-slate-900 dark:border-slate-800 dark:hover:border-violet-700/50 dark:hover:shadow-violet-900/20"
  >
    {article.imageUrl && (
      <img src={article.imageUrl} alt=""
        className="w-20 h-14 object-cover rounded-lg flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
        loading="lazy" />
    )}
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        {article.importance === 'high' && (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold
                           bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            UTAMA
          </span>
        )}
        {article.sourceName && (
          <span className="text-[10px] text-stone-400 dark:text-slate-500">
            {article.sourceName}
          </span>
        )}
        {article.pageNumber && (
          <span className="text-[10px] text-stone-300 dark:text-slate-600">
            · Hal. {article.pageNumber}
          </span>
        )}
      </div>
      <h3
        className="font-bold text-sm leading-snug line-clamp-2 mb-1 transition-colors
                   text-stone-800 group-hover:text-violet-700
                   dark:text-slate-200 dark:group-hover:text-violet-300"
        style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
      >
        {article.title}
      </h3>
      {article.author && (
        <p className="text-[10px] text-stone-400 dark:text-slate-500">
          Oleh {article.author}
        </p>
      )}
    </div>
  </Link>
))
ArticleRow.displayName = 'ArticleRow'

// ── Main ──────────────────────────────────────────────────────────────────────
const NewspaperDatePage = () => {
  const { date }  = useParams()
  const navigate  = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [articles, setArticles] = useState([])
  const [total,    setTotal]    = useState(0)
  const [loading,  setLoading]  = useState(true)
  const [grouped,  setGrouped]  = useState({})

  const page     = parseInt(searchParams.get('page') || '1')
  const category = searchParams.get('category') || ''
  const limit    = 50

  const today   = new Date().toISOString().split('T')[0]
  const prevDay = offsetDate(date, -1)
  const nextDay = offsetDate(date, 1)

  const fetchArticles = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit, sortBy: 'importance' }
      if (category) params.category = category
      const res = await api.get(`/newspapers/date/${date}`, { params })
      const data = res.data?.data
      const list = data?.list || []
      setArticles(list)
      setTotal(data?.total || 0)
      const g = {}
      list.forEach(art => {
        const cat = art.category || 'lainnya'
        if (!g[cat]) g[cat] = []
        g[cat].push(art)
      })
      setGrouped(g)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [date, page, category])

  useEffect(() => {
    document.title = `Edisi ${formatDate(date)} — Arsip Koran`
    fetchArticles()
  }, [fetchArticles, date])

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value); else next.delete(key)
    next.delete('page')
    setSearchParams(next)
  }

  const isToday  = date === today
  const isFuture = nextDay > today

  return (
    <div className="min-h-screen transition-colors duration-300
                    bg-stone-50 dark:bg-slate-950">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="border-b transition-colors
                      bg-white border-stone-200
                      dark:bg-slate-900 dark:border-slate-700">
        <div className="container mx-auto px-4 max-w-7xl py-6 sm:py-8">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs mb-5
                          text-stone-400 dark:text-slate-500">
            <Link to="/koran" className="hover:text-stone-700 dark:hover:text-slate-300 transition">Koran</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-medium text-stone-600 dark:text-slate-400">Edisi Tanggal</span>
          </nav>

          {/* Date nav */}
          <div className="flex items-center justify-between gap-4">
            <Link
              to={`/koran/tanggal/${prevDay}`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-all flex-shrink-0
                         bg-white border-stone-200 text-stone-600 shadow-sm
                         hover:border-violet-400 hover:text-violet-700
                         dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:shadow-none
                         dark:hover:border-violet-600 dark:hover:text-violet-400">
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Sebelumnya</span>
            </Link>

            <div className="text-center min-w-0 flex-1">
              <p className="text-[10px] tracking-[0.3em] uppercase mb-1
                            text-stone-400 dark:text-slate-500">
                Edisi
              </p>
              <h1
                className="text-xl sm:text-3xl lg:text-4xl font-black leading-tight
                           text-stone-900 dark:text-slate-50"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif', letterSpacing: '-0.02em' }}
              >
                {formatDate(date)}
              </h1>
              {(isToday || total > 0) && (
                <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
                  {isToday && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold
                                     bg-violet-100 text-violet-700 border border-violet-200
                                     dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-700/50">
                      HARI INI
                    </span>
                  )}
                  {total > 0 && (
                    <span className="text-xs text-stone-400 dark:text-slate-500">
                      {total.toLocaleString('id-ID')} artikel
                    </span>
                  )}
                </div>
              )}
            </div>

            <Link
              to={isFuture ? '#' : `/koran/tanggal/${nextDay}`}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-all flex-shrink-0 ${
                isFuture
                  ? 'border-stone-100 text-stone-300 cursor-not-allowed pointer-events-none dark:border-slate-800 dark:text-slate-700'
                  : 'bg-white border-stone-200 text-stone-600 shadow-sm hover:border-violet-400 hover:text-violet-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:shadow-none dark:hover:border-violet-600 dark:hover:text-violet-400'
              }`}
            >
              <span className="hidden sm:inline">Berikutnya</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Date picker */}
          <div className="flex items-center justify-center gap-3 mt-5">
            <Calendar className="w-4 h-4 text-stone-400 dark:text-slate-500" />
            <input
              type="date"
              value={date}
              max={today}
              onChange={e => e.target.value && navigate(`/koran/tanggal/${e.target.value}`)}
              className="px-3 py-1.5 rounded-lg border text-sm transition-all focus:outline-none
                         border-stone-200 bg-stone-50 text-stone-900
                         focus:ring-2 focus:ring-violet-400/40 focus:border-violet-400
                         dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100
                         dark:focus:ring-violet-500/40 dark:focus:border-violet-500/60"
            />
          </div>
        </div>
      </div>

      {/* ── Category Filter Tabs ─────────────────────────────────── */}
      {Object.keys(grouped).length > 1 && (
        <div className="border-b sticky top-0 z-10 transition-colors
                        bg-white/90 border-stone-200 backdrop-blur-sm
                        dark:bg-slate-900/90 dark:border-slate-700">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex gap-1 overflow-x-auto py-2.5"
                 style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <button
                onClick={() => setParam('category', '')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                  !category
                    ? 'bg-violet-600 text-white shadow-sm shadow-violet-200/80 dark:shadow-violet-900/40'
                    : 'text-stone-500 hover:bg-stone-100 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}>
                Semua
                {total > 0 && (
                  <span className="ml-1 opacity-60">({total})</span>
                )}
              </button>
              {Object.keys(grouped).map(cat => (
                <button
                  key={cat}
                  onClick={() => setParam('category', cat)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                    category === cat
                      ? 'bg-violet-600 text-white shadow-sm shadow-violet-200/80 dark:shadow-violet-900/40'
                      : 'text-stone-500 hover:bg-stone-100 dark:text-slate-400 dark:hover:bg-slate-800'
                  }`}>
                  {getCatIcon(cat)} {getCatLabel(cat)}
                  <span className="opacity-60">({grouped[cat].length})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Articles ──────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 max-w-7xl py-6 sm:py-8">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 10 }, (_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-24">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-stone-200 dark:text-slate-700" />
            <p className="font-medium mb-1 text-stone-500 dark:text-slate-400">
              Tidak ada artikel pada tanggal ini
            </p>
            <p className="text-sm text-stone-400 dark:text-slate-500">
              Coba pilih tanggal lain
            </p>
          </div>
        ) : category ? (
          /* Single category view */
          <div className="space-y-3">
            {articles.filter(a => a.category === category).map(art => (
              <ArticleRow key={art.id} article={art} />
            ))}
          </div>
        ) : (
          /* Grouped by category */
          <div className="space-y-10">
            {Object.entries(grouped).map(([cat, arts]) => (
              <section key={cat}>
                {/* Section header */}
                <div className="flex items-center gap-3 mb-4 pl-4 border-l-4 border-violet-500 dark:border-violet-400">
                  <span className="text-2xl">{getCatIcon(cat)}</span>
                  <div>
                    <h2
                      className="font-bold text-base text-stone-900 dark:text-slate-50"
                      style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                    >
                      {getCatLabel(cat)}
                    </h2>
                    <p className="text-xs text-stone-400 dark:text-slate-500">
                      {arts.length} artikel
                    </p>
                  </div>
                  <div className="flex-1 h-px ml-2 bg-stone-200 dark:bg-slate-700" />
                  <Link
                    to={`/koran/kategori/${cat}`}
                    className="text-xs font-medium whitespace-nowrap transition-colors
                               text-violet-600 hover:text-violet-700
                               dark:text-violet-400 dark:hover:text-violet-300">
                    Lihat semua →
                  </Link>
                </div>

                {/* Articles */}
                <div className="space-y-2">
                  {arts.map(art => <ArticleRow key={art.id} article={art} />)}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default NewspaperDatePage
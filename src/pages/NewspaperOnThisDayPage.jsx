import { useState, useEffect, useCallback, memo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Clock, ChevronRight, ChevronLeft, Calendar } from 'lucide-react'
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

const MONTHS_ID = [
  '', 'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember'
]

// ── Skeleton ──────────────────────────────────────────────────────────────────
const SkeletonYear = memo(() => (
  <div className="animate-pulse">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex-shrink-0" />
      <div className="flex-1 h-px bg-stone-200 dark:bg-slate-700" />
    </div>
    <div className="space-y-3 pl-3 ml-6 border-l-2 border-amber-100 dark:border-amber-900">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="flex items-start gap-3 p-3 rounded-xl border
                                bg-white border-stone-100 dark:bg-slate-900 dark:border-slate-800">
          <div className="w-14 h-10 rounded-lg bg-stone-200 dark:bg-slate-700 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-2.5 rounded w-1/3 bg-stone-200 dark:bg-slate-700" />
            <div className="h-4 rounded w-full bg-stone-200 dark:bg-slate-700" />
          </div>
        </div>
      ))}
    </div>
  </div>
))
SkeletonYear.displayName = 'SkeletonYear'

// ── ArticleItem ───────────────────────────────────────────────────────────────
const ArticleItem = memo(({ article }) => (
  <Link
    to={`/koran/${article.category}/${article.publishDate}/${article.slug}`}
    className="group flex items-start gap-3 p-3 rounded-xl border transition-all duration-200
               bg-white border-stone-100 hover:border-amber-300 hover:shadow-md hover:shadow-amber-100/60
               dark:bg-slate-900 dark:border-slate-800 dark:hover:border-amber-700/50 dark:hover:shadow-amber-900/20"
  >
    {article.imageUrl && (
      <img src={article.imageUrl} alt=""
        className="w-14 h-10 object-cover rounded-lg flex-shrink-0 transition-transform duration-300 group-hover:scale-105"
        loading="lazy" />
    )}
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
        <span className="text-[10px] text-stone-400 dark:text-slate-500">
          {getCatIcon(article.category)} {getCatLabel(article.category)}
        </span>
        {article.source && (
          <>
            <span className="text-stone-200 dark:text-slate-700">·</span>
            <span className="text-[10px] text-stone-400 dark:text-slate-500 truncate">
              {article.source}
            </span>
          </>
        )}
      </div>
      <h3
        className="font-semibold text-sm line-clamp-2 leading-snug transition-colors
                   text-stone-800 group-hover:text-amber-700
                   dark:text-slate-200 dark:group-hover:text-amber-400"
        style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
      >
        {article.title}
      </h3>
    </div>
  </Link>
))
ArticleItem.displayName = 'ArticleItem'

// ── Main ──────────────────────────────────────────────────────────────────────
const NewspaperOnThisDayPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [articles, setArticles] = useState([])
  const [total,    setTotal]    = useState(0)
  const [loading,  setLoading]  = useState(true)

  const today = new Date()
  const month = parseInt(searchParams.get('month') || String(today.getMonth() + 1))
  const day   = parseInt(searchParams.get('day')   || String(today.getDate()))
  const page  = parseInt(searchParams.get('page')  || '1')
  const limit = 20
  const totalPages = Math.ceil(total / limit)

  const fetchArticles = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/newspapers/on-this-day', { params: { month, day, page, limit } })
      const data = res.data?.data
      setArticles(data?.list || [])
      setTotal(data?.total || 0)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [month, day, page])

  useEffect(() => {
    document.title = `${day} ${MONTHS_ID[month]} dalam Sejarah — Arsip Koran`
    fetchArticles()
  }, [fetchArticles, month, day])

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    next.set(key, String(value)); next.delete('page')
    setSearchParams(next)
  }

  const prevDay = () => {
    let d = day - 1, m = month
    if (d < 1) { m = m - 1; if (m < 1) m = 12; d = new Date(2024, m, 0).getDate() }
    setSearchParams(new URLSearchParams({ month: m, day: d }))
  }
  const nextDay = () => {
    const daysInMonth = new Date(2024, month, 0).getDate()
    let d = day + 1, m = month
    if (d > daysInMonth) { d = 1; m = m + 1; if (m > 12) m = 1 }
    setSearchParams(new URLSearchParams({ month: m, day: d }))
  }

  const isToday = month === (today.getMonth() + 1) && day === today.getDate()

  // Group by year
  const grouped = {}
  articles.forEach(art => {
    const year = art.publishDate?.split('-')[0] || '?'
    if (!grouped[year]) grouped[year] = []
    grouped[year].push(art)
  })
  const years = Object.keys(grouped).sort((a, b) => Number(b) - Number(a))

  return (
    <div className="min-h-screen transition-colors duration-300
                    bg-stone-50 dark:bg-slate-950">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="border-b transition-colors
                      bg-gradient-to-br from-amber-50 to-stone-50 border-amber-200
                      dark:from-amber-900/20 dark:to-slate-900 dark:border-amber-800/50">
        <div className="container mx-auto px-4 max-w-4xl py-8 sm:py-12">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs mb-6
                          text-amber-700/70 dark:text-amber-500/70">
            <Link to="/koran" className="hover:text-amber-900 dark:hover:text-amber-300 transition">Koran</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-medium">Pada Hari Ini</span>
          </nav>

          {/* Date nav */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={prevDay}
              className="p-2.5 rounded-xl border transition-all flex-shrink-0
                         border-amber-300 text-amber-700 hover:bg-amber-100
                         dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/30">
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="text-center min-w-0 flex-1">
              <div className="flex items-center gap-2 justify-center mb-2">
                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                {isToday && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold
                                   bg-amber-200 text-amber-800
                                   dark:bg-amber-800/40 dark:text-amber-200">
                    HARI INI
                  </span>
                )}
              </div>
              <h1
                className="text-3xl sm:text-5xl font-black leading-none
                           text-amber-900 dark:text-amber-200"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif', letterSpacing: '-0.02em' }}
              >
                {day} {MONTHS_ID[month]}
              </h1>
              <p className="text-sm mt-2 text-amber-700/70 dark:text-amber-400/70">
                {total > 0
                  ? <>{total.toLocaleString('id-ID')} artikel dari berbagai tahun</>
                  : 'Tidak ada artikel untuk tanggal ini'}
              </p>
            </div>

            <button
              onClick={nextDay}
              className="p-2.5 rounded-xl border transition-all flex-shrink-0
                         border-amber-300 text-amber-700 hover:bg-amber-100
                         dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/30">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Date pickers */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <select
              value={day}
              onChange={e => setParam('day', e.target.value)}
              className="px-3 py-2 rounded-xl border text-sm transition-all focus:outline-none
                         border-amber-300 bg-white text-amber-900
                         focus:ring-2 focus:ring-amber-400/50
                         dark:border-amber-700 dark:bg-slate-800 dark:text-amber-200
                         dark:focus:ring-amber-500/40">
              {Array.from({ length: 31 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
            <select
              value={month}
              onChange={e => setParam('month', e.target.value)}
              className="px-3 py-2 rounded-xl border text-sm transition-all focus:outline-none
                         border-amber-300 bg-white text-amber-900
                         focus:ring-2 focus:ring-amber-400/50
                         dark:border-amber-700 dark:bg-slate-800 dark:text-amber-200
                         dark:focus:ring-amber-500/40">
              {MONTHS_ID.slice(1).map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Articles ──────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 max-w-4xl py-8 sm:py-10">
        {loading ? (
          <div className="space-y-8">
            {Array.from({ length: 4 }, (_, i) => <SkeletonYear key={i} />)}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-24">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-stone-200 dark:text-slate-700" />
            <p className="font-medium mb-1 text-stone-500 dark:text-slate-400">
              Tidak ada artikel untuk tanggal ini
            </p>
            <p className="text-sm text-stone-400 dark:text-slate-500">
              Coba tanggal lain
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {years.map(year => (
              <section key={year}>
                {/* Year marker */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                                  bg-amber-100 dark:bg-amber-900/30">
                    <span className="text-xs font-black leading-none text-amber-700 dark:text-amber-400">
                      {year}
                    </span>
                  </div>
                  <div className="flex-1 h-px bg-amber-200 dark:bg-amber-800/50" />
                  <span className="text-xs text-amber-600/70 dark:text-amber-500/70 flex-shrink-0">
                    {grouped[year].length} artikel
                  </span>
                </div>

                {/* Articles under year */}
                <div className="space-y-2 pl-4 border-l-2 border-amber-100 dark:border-amber-900/40 ml-6">
                  {grouped[year].map(art => (
                    <ArticleItem key={art.id} article={art} />
                  ))}
                </div>
              </section>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <button
                  onClick={() => setParam('page', page - 1)}
                  disabled={page === 1}
                  className="p-2 rounded-xl border transition-all disabled:opacity-40
                             border-stone-200 text-stone-500 hover:border-amber-400 hover:text-amber-700
                             dark:border-slate-700 dark:text-slate-400 dark:hover:border-amber-600 dark:hover:text-amber-400">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm px-3 text-stone-500 dark:text-slate-400">
                  Hal. {page} / {totalPages}
                </span>
                <button
                  onClick={() => setParam('page', page + 1)}
                  disabled={page === totalPages}
                  className="p-2 rounded-xl border transition-all disabled:opacity-40
                             border-stone-200 text-stone-500 hover:border-amber-400 hover:text-amber-700
                             dark:border-slate-700 dark:text-slate-400 dark:hover:border-amber-600 dark:hover:text-amber-400">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default NewspaperOnThisDayPage
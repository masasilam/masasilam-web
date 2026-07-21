import { useState, useEffect, useCallback, memo, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, ChevronRight, ChevronLeft, SlidersHorizontal, X, BookOpen, Eye } from 'lucide-react'
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

// ── Skeleton ──────────────────────────────────────────────────────────────────
const SkeletonResult = memo(() => (
  <div className="animate-pulse flex items-start gap-4 p-4 rounded-xl border
                  bg-white border-stone-100 dark:bg-slate-900 dark:border-slate-800">
    <div className="w-20 h-14 rounded-lg bg-stone-200 dark:bg-slate-700 flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-2.5 rounded w-1/3 bg-stone-200 dark:bg-slate-700" />
      <div className="h-4 rounded w-full bg-stone-200 dark:bg-slate-700" />
      <div className="h-4 rounded w-3/4 bg-stone-200 dark:bg-slate-700" />
    </div>
  </div>
))
SkeletonResult.displayName = 'SkeletonResult'

// ── ResultCard ────────────────────────────────────────────────────────────────
const ResultCard = memo(({ article }) => (
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
      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
        <span className="text-[10px] font-semibold text-violet-600 dark:text-violet-400">
          {getCatIcon(article.category)} {getCatLabel(article.category)}
        </span>
        <span className="text-stone-200 dark:text-slate-700">·</span>
        <span className="text-[10px] text-stone-400 dark:text-slate-500">
          {article.dateFormatted || article.publishDate}
        </span>
        {article.sourceName && (
          <>
            <span className="text-stone-200 dark:text-slate-700">·</span>
            <span className="text-[10px] text-stone-400 dark:text-slate-500 truncate">
              {article.sourceName}
            </span>
          </>
        )}
        {article.viewCount > 0 && (
          <span className="flex items-center gap-1 ml-auto text-[10px] text-stone-400 dark:text-slate-500 flex-shrink-0">
            <Eye className="w-3 h-3" />
            {article.viewCount.toLocaleString('id-ID')}
          </span>
        )}
      </div>
      <h3
        className="font-bold text-sm leading-snug line-clamp-2 transition-colors
                   text-stone-800 group-hover:text-violet-700
                   dark:text-slate-200 dark:group-hover:text-violet-300"
        style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
      >
        {article.title}
      </h3>
    </div>
  </Link>
))
ResultCard.displayName = 'ResultCard'

// ── Filter Pill ───────────────────────────────────────────────────────────────
const FilterPill = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full text-xs font-medium
                   bg-violet-100 border border-violet-300 text-violet-800
                   dark:bg-violet-900/20 dark:border-violet-700/50 dark:text-violet-300">
    {label}
    <button
      onClick={onRemove}
      className="w-3.5 h-3.5 rounded-full flex items-center justify-center transition-colors
                 hover:bg-violet-200 dark:hover:bg-violet-800/60">
      <X className="w-2.5 h-2.5" />
    </button>
  </span>
)

// ── Page Input ────────────────────────────────────────────────────────────────
const PageInput = memo(({ current, total, onGo, disabled }) => {
  const [val, setVal] = useState(String(current))
  const ref = useRef(null)
  useEffect(() => { setVal(String(current)) }, [current])
  const commit = useCallback(() => {
    const n = parseInt(val, 10)
    if (!isNaN(n) && n >= 1 && n <= total) onGo(n)
    else setVal(String(current))
  }, [val, current, total, onGo])

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs whitespace-nowrap text-stone-400 dark:text-slate-500">Hal</span>
      <input
        ref={ref}
        type="number" min={1} max={total}
        value={val} disabled={disabled}
        onChange={e => setVal(e.target.value)}
        onBlur={commit}
        onKeyDown={e => e.key === 'Enter' && (commit(), ref.current?.blur())}
        className="w-14 px-2 py-1.5 text-center text-xs rounded-lg transition-all focus:outline-none disabled:opacity-50
                   border border-stone-200 bg-white text-stone-800
                   focus:ring-2 focus:ring-violet-400/50
                   dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200
                   dark:focus:ring-violet-500/40"
      />
      <span className="text-xs whitespace-nowrap text-stone-400 dark:text-slate-500">dari {total}</span>
    </div>
  )
})
PageInput.displayName = 'PageInput'

// ── Main ──────────────────────────────────────────────────────────────────────
const NewspaperSearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [articles,    setArticles]    = useState([])
  const [total,       setTotal]       = useState(0)
  const [loading,     setLoading]     = useState(false)
  const [inputQ,      setInputQ]      = useState(searchParams.get('q') || '')
  const [showFilter,  setShowFilter]  = useState(false)

  const q          = searchParams.get('q')          || ''
  const page       = parseInt(searchParams.get('page') || '1')
  const category   = searchParams.get('category')   || ''
  const dateFrom   = searchParams.get('dateFrom')   || ''
  const dateTo     = searchParams.get('dateTo')     || ''
  const importance = searchParams.get('importance') || ''
  const limit      = 20
  const totalPages = Math.ceil(total / limit)

  const fetchResults = useCallback(async () => {
    if (!q.trim()) return
    setLoading(true)
    try {
      const params = { q, page, limit }
      if (category)   params.category   = category
      if (dateFrom)   params.dateFrom   = dateFrom
      if (dateTo)     params.dateTo     = dateTo
      if (importance) params.importance = importance
      const res = await api.get('/newspapers/search', { params })
      const data = res.data?.data
      setArticles(data?.list || [])
      setTotal(data?.total || 0)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [q, page, category, dateFrom, dateTo, importance])

  useEffect(() => {
    document.title = q ? `"${q}" — Cari Koran` : 'Cari Artikel — Koran'
    fetchResults()
  }, [fetchResults, q])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (inputQ.trim()) setSearchParams(new URLSearchParams({ q: inputQ.trim() }))
  }

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value); else next.delete(key)
    next.delete('page')
    setSearchParams(next)
  }

  const goToPage = (p) => {
    const next = new URLSearchParams(searchParams)
    if (p === 1) next.delete('page'); else next.set('page', String(p))
    setSearchParams(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const hasFilters = category || dateFrom || dateTo || importance
  const activePills = [
    category   && { key: 'category',   label: `${getCatIcon(category)} ${getCatLabel(category)}` },
    dateFrom   && { key: 'dateFrom',   label: `Dari: ${dateFrom}` },
    dateTo     && { key: 'dateTo',     label: `Sampai: ${dateTo}` },
    importance && { key: 'importance', label: `Prioritas: ${importance === 'high' ? 'Utama' : importance === 'medium' ? 'Reguler' : 'Tambahan'}` },
  ].filter(Boolean)

  const paginationPages = (() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const pages = new Set([1, totalPages, page])
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.add(i)
    return [...pages].sort((a, b) => a - b)
  })()

  const inputCls = `w-full px-3 py-2 rounded-lg text-sm transition-all focus:outline-none
    border border-stone-200 bg-white text-stone-800 placeholder-stone-400
    focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400
    dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500
    dark:focus:ring-violet-500/40 dark:focus:border-violet-500/60`

  return (
    <div className="min-h-screen transition-colors duration-300
                    bg-stone-50 dark:bg-slate-950">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="border-b transition-colors
                      bg-white border-stone-200
                      dark:bg-slate-900 dark:border-slate-700">
        <div className="container mx-auto px-4 max-w-4xl py-6 sm:py-8">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs mb-5
                          text-stone-400 dark:text-slate-500">
            <Link to="/koran" className="hover:text-stone-700 dark:hover:text-slate-300 transition">Koran</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-medium text-stone-600 dark:text-slate-400">Pencarian</span>
          </nav>

          <h1
            className="text-2xl sm:text-3xl font-black mb-5 text-stone-900 dark:text-slate-50"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            Cari Artikel
          </h1>

          {/* Search form */}
          <form onSubmit={handleSubmit}>
            <div className="flex items-stretch gap-2 h-11 mb-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none
                                   text-stone-400 dark:text-slate-500" />
                <input
                  type="text"
                  value={inputQ}
                  onChange={e => setInputQ(e.target.value)}
                  placeholder="Ketik kata kunci, judul, topik…"
                  autoFocus
                  className="h-full w-full pl-10 pr-4 text-sm rounded-xl transition-all focus:outline-none
                             border border-stone-200 bg-stone-50 text-stone-900 placeholder-stone-400
                             focus:ring-2 focus:ring-violet-400/40 focus:border-violet-400
                             dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500
                             dark:focus:ring-violet-500/40 dark:focus:border-violet-500/60"
                />
                {inputQ && (
                  <button
                    type="button"
                    onClick={() => { setInputQ(''); setSearchParams({}) }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors
                               text-stone-400 hover:text-stone-700 dark:text-slate-500 dark:hover:text-slate-300">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="flex-shrink-0 flex items-center gap-1.5 px-5 rounded-xl text-sm font-semibold
                           transition-all bg-violet-600 hover:bg-violet-500 text-white
                           shadow-sm shadow-violet-200/80 hover:shadow-md dark:shadow-violet-900/40">
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Cari</span>
              </button>
              <button
                type="button"
                onClick={() => setShowFilter(v => !v)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 rounded-xl border text-sm font-medium transition-all ${
                  showFilter || hasFilters
                    ? 'bg-violet-600 text-white border-violet-600 shadow-sm dark:shadow-violet-900/40'
                    : 'bg-white border-stone-200 text-stone-600 hover:border-violet-300 hover:text-violet-700 shadow-sm dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:border-violet-600 dark:hover:text-violet-400'
                }`}>
                <SlidersHorizontal className="w-4 h-4" />
                {hasFilters && (
                  <span className="w-4 h-4 rounded-full bg-white text-violet-600 text-[10px] font-bold
                                   flex items-center justify-center">
                    {activePills.length}
                  </span>
                )}
              </button>
            </div>

            {/* Active filter pills */}
            {activePills.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center mb-3">
                <span className="text-xs text-stone-400 dark:text-slate-500">Filter aktif:</span>
                {activePills.map(f => (
                  <FilterPill
                    key={f.key}
                    label={f.label}
                    onRemove={() => setParam(f.key, '')}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => setSearchParams({ q })}
                  className="text-xs font-medium underline transition-colors
                             text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                  Hapus semua
                </button>
              </div>
            )}

            {/* Filter panel */}
            {showFilter && (
              <div className="p-4 sm:p-5 rounded-2xl border mb-1 transition-colors
                              bg-violet-50/60 border-violet-200
                              dark:bg-slate-800/60 dark:border-slate-700">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-stone-500 dark:text-slate-400">
                      Kategori
                    </label>
                    <select value={category} onChange={e => setParam('category', e.target.value)}
                      className={inputCls}>
                      <option value="">Semua</option>
                      {CATEGORIES.map(c => (
                        <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-stone-500 dark:text-slate-400">
                      Dari Tanggal
                    </label>
                    <input type="date" value={dateFrom}
                      onChange={e => setParam('dateFrom', e.target.value)}
                      className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-stone-500 dark:text-slate-400">
                      Sampai Tanggal
                    </label>
                    <input type="date" value={dateTo}
                      onChange={e => setParam('dateTo', e.target.value)}
                      className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-stone-500 dark:text-slate-400">
                      Prioritas
                    </label>
                    <select value={importance} onChange={e => setParam('importance', e.target.value)}
                      className={inputCls}>
                      <option value="">Semua</option>
                      <option value="high">Utama</option>
                      <option value="medium">Reguler</option>
                      <option value="low">Tambahan</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* ── Results ───────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 max-w-4xl py-6 sm:py-8">
        {!q ? (
          <div className="text-center py-24">
            <Search className="w-16 h-16 mx-auto mb-4 text-stone-200 dark:text-slate-700" />
            <p className="font-medium mb-1 text-stone-500 dark:text-slate-400">
              Masukkan kata kunci untuk mencari artikel
            </p>
            <p className="text-sm text-stone-400 dark:text-slate-500">
              Cari berdasarkan judul, topik, atau kata kunci apapun
            </p>
          </div>
        ) : loading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }, (_, i) => <SkeletonResult key={i} />)}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-24">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-stone-200 dark:text-slate-700" />
            <p className="font-medium mb-1 text-stone-500 dark:text-slate-400">
              Tidak ada hasil untuk "{q}"
            </p>
            <p className="text-sm text-stone-400 dark:text-slate-500">
              Coba kata kunci yang berbeda atau hapus filter
            </p>
            {hasFilters && (
              <button
                onClick={() => setSearchParams({ q })}
                className="mt-4 px-4 py-2 rounded-lg text-sm font-semibold transition-all
                           bg-violet-600 hover:bg-violet-500 text-white">
                Hapus Filter
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Results info */}
            <div className="flex items-center justify-between mb-5 text-sm">
              <p className="text-stone-500 dark:text-slate-500">
                <span className="font-semibold text-stone-800 dark:text-slate-200">
                  {total.toLocaleString('id-ID')}
                </span> hasil untuk{' '}
                <span className="font-semibold text-violet-600 dark:text-violet-400">
                  "{q}"
                </span>
              </p>
              {totalPages > 1 && (
                <span className="text-xs text-stone-400 dark:text-slate-500">
                  Hal. {page} / {totalPages}
                </span>
              )}
            </div>

            <div className="space-y-3">
              {articles.map(art => <ResultCard key={art.id} article={art} />)}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="mt-10 flex flex-row flex-wrap items-center justify-center gap-2"
                   aria-label="Navigasi halaman">
                <button onClick={() => goToPage(page - 1)} disabled={page === 1}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium
                             border transition-all disabled:opacity-40 disabled:pointer-events-none
                             bg-white border-stone-200 text-stone-600 shadow-sm
                             hover:border-violet-400 hover:text-violet-700
                             dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400 dark:shadow-none
                             dark:hover:border-violet-500/70 dark:hover:text-violet-400">
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Sebelumnya</span>
                </button>

                <div className="hidden sm:flex items-center gap-1">
                  {paginationPages.map((p, i) => {
                    const prev = paginationPages[i - 1]
                    return (
                      <span key={p} className="flex items-center gap-1">
                        {prev && p - prev > 1 && (
                          <span className="w-6 text-center text-sm text-stone-300 dark:text-slate-600">…</span>
                        )}
                        <button onClick={() => goToPage(p)}
                          className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                            p === page
                              ? 'bg-violet-600 text-white shadow-md shadow-violet-200/80 dark:shadow-violet-900/50'
                              : 'bg-white border border-stone-200 text-stone-600 hover:border-violet-400 hover:text-violet-700 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:border-violet-500/70 dark:hover:text-violet-400'
                          }`}>
                          {p}
                        </button>
                      </span>
                    )
                  })}
                </div>

                <PageInput current={page} total={totalPages} onGo={goToPage} disabled={loading} />

                <button onClick={() => goToPage(page + 1)} disabled={page === totalPages}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium
                             border transition-all disabled:opacity-40 disabled:pointer-events-none
                             bg-white border-stone-200 text-stone-600 shadow-sm
                             hover:border-violet-400 hover:text-violet-700
                             dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400 dark:shadow-none
                             dark:hover:border-violet-500/70 dark:hover:text-violet-400">
                  <span className="hidden sm:inline">Berikutnya</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default NewspaperSearchPage
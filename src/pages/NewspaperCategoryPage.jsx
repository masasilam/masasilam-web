// src/pages/NewspaperCategoryPage.jsx
// ============================================
// LIGHT: bg-stone-50, surface=white, border=stone-200, accent=violet
// DARK:  bg-slate-950, surface=slate-900, border=slate-700, accent=violet
// ============================================

import { useState, useEffect, useCallback, memo, useRef } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import {
  ChevronLeft, ChevronRight, Eye, BookOpen, X, SlidersHorizontal,
  ArrowUpDown, ArrowUp, ArrowDown, Search, Newspaper
} from 'lucide-react'
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

const IMPORTANCE_LABELS = { high: 'Utama', medium: 'Reguler', low: 'Tambahan' }

// ── Skeleton ──────────────────────────────────────────────────────────────────
const SkeletonCard = memo(() => (
  <div className="animate-pulse rounded-xl border overflow-hidden
                  bg-white border-stone-200 dark:bg-slate-900 dark:border-slate-700">
    <div className="aspect-video bg-stone-200 dark:bg-slate-700" />
    <div className="p-4 space-y-2">
      <div className="h-2.5 rounded w-1/3 bg-stone-200 dark:bg-slate-700" />
      <div className="h-4 rounded w-full bg-stone-200 dark:bg-slate-700" />
      <div className="h-4 rounded w-3/4 bg-stone-200 dark:bg-slate-700" />
      <div className="h-2.5 rounded w-1/2 bg-stone-200 dark:bg-slate-700" />
    </div>
  </div>
))
SkeletonCard.displayName = 'SkeletonCard'

// ── Article Card ──────────────────────────────────────────────────────────────
const ArticleCard = memo(({ article }) => (
  <Link
    to={`/koran/${article.category}/${article.publishDate}/${article.slug}`}
    className="group rounded-xl border overflow-hidden transition-all duration-200
               bg-white border-stone-200 hover:border-violet-400 hover:shadow-lg hover:shadow-violet-100/60
               dark:bg-slate-900 dark:border-slate-700 dark:hover:border-violet-600/60 dark:hover:shadow-violet-900/20"
  >
    {article.imageUrl && (
      <div className="aspect-video overflow-hidden
                      bg-stone-100 dark:bg-slate-800">
        <img
          src={article.imageUrl}
          alt={article.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
    )}
    <div className="p-4">
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        {article.importance === 'high' && (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold
                           bg-red-100 text-red-700
                           dark:bg-red-900/30 dark:text-red-400">
            UTAMA
          </span>
        )}
        {article.sourceName && (
          <span className="text-[10px] font-medium text-stone-400 dark:text-slate-500">
            {article.sourceName}
          </span>
        )}
        {article.pageNumber && (
          <span className="text-[10px] text-stone-300 dark:text-slate-600">
            Hal. {article.pageNumber}
          </span>
        )}
      </div>
      <h3
        className="font-bold text-sm leading-snug line-clamp-3 mb-2 transition-colors
                   text-stone-800 group-hover:text-violet-700
                   dark:text-slate-200 dark:group-hover:text-violet-300"
        style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
      >
        {article.title}
      </h3>
      <div className="flex items-center gap-3 text-[10px]
                      text-stone-400 dark:text-slate-500">
        <span>{article.dateFormatted || article.publishDate}</span>
        {article.author && <><span>·</span><span className="truncate">{article.author}</span></>}
        {article.viewCount > 0 && (
          <span className="flex items-center gap-1 ml-auto flex-shrink-0">
            <Eye className="w-3 h-3" />
            {article.viewCount.toLocaleString('id-ID')}
          </span>
        )}
      </div>
    </div>
  </Link>
))
ArticleCard.displayName = 'ArticleCard'

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
        className="w-14 px-2 py-1.5 text-center text-xs rounded-lg transition-all focus:outline-none
                   border border-stone-200 bg-white text-stone-800 disabled:opacity-50
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
const NewspaperCategoryPage = () => {
  const { categorySlug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()

  const [articles,    setArticles]    = useState([])
  const [total,       setTotal]       = useState(0)
  const [loading,     setLoading]     = useState(true)
  const [sources,     setSources]     = useState([])
  const [showFilter,  setShowFilter]  = useState(false)

  const page       = parseInt(searchParams.get('page') || '1')
  const dateFrom   = searchParams.get('dateFrom') || ''
  const dateTo     = searchParams.get('dateTo')   || ''
  const source     = searchParams.get('source')   || ''
  const importance = searchParams.get('importance') || ''
  const sortBy     = searchParams.get('sortBy')   || 'date'
  const sortOrder  = searchParams.get('sortOrder')|| 'DESC'
  const limit      = 20
  const totalPages = Math.ceil(total / limit)

  const catName = getCatLabel(categorySlug)
  const catIcon = getCatIcon(categorySlug)

  const fetchArticles = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit, sortBy, sortOrder }
      if (dateFrom)   params.dateFrom   = dateFrom
      if (dateTo)     params.dateTo     = dateTo
      if (source)     params.source     = source
      if (importance) params.importance = importance
      const res = await api.get(`/newspapers/categories/${categorySlug}`, { params })
      const data = res.data?.data
      setArticles(data?.list || [])
      setTotal(data?.total || 0)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [categorySlug, page, sortBy, sortOrder, dateFrom, dateTo, source, importance])

  useEffect(() => {
    document.title = `${catName} — Arsip Koran`
    fetchArticles()
  }, [fetchArticles, catName])

  useEffect(() => {
    api.get('/newspapers/sources', { params: { page: 1, limit: 100 } })
      .then(r => setSources(r.data?.data?.list || []))
      .catch(() => {})
  }, [])

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

  const clearFilters = () => setSearchParams({ page: '1' })
  const hasFilters   = dateFrom || dateTo || source || importance

  const activePills = [
    dateFrom   && { key: 'dateFrom',   label: `Dari: ${dateFrom}` },
    dateTo     && { key: 'dateTo',     label: `Sampai: ${dateTo}` },
    source     && { key: 'source',     label: `Sumber: ${source}` },
    importance && { key: 'importance', label: `Prioritas: ${IMPORTANCE_LABELS[importance] || importance}` },
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
        <div className="container mx-auto px-4 max-w-7xl py-6 sm:py-8">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs mb-4
                          text-stone-400 dark:text-slate-500">
            <Link to="/koran" className="hover:text-stone-700 dark:hover:text-slate-300 transition">
              Koran
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-medium text-stone-600 dark:text-slate-400">{catName}</span>
          </nav>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="text-4xl sm:text-5xl flex-shrink-0">{catIcon}</div>
              <div className="min-w-0">
                <h1
                  className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight
                             text-stone-900 dark:text-slate-50"
                  style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                >
                  {catName}
                </h1>
                <p className="text-sm mt-1 text-stone-500 dark:text-slate-400">
                  {loading ? 'Memuat…' : (
                    <>
                      <span className="font-semibold text-stone-800 dark:text-slate-200">
                        {total.toLocaleString('id-ID')}
                      </span>{' '}artikel ditemukan
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Page badge */}
            {totalPages > 1 && (
              <div className="hidden sm:flex flex-col items-end px-4 py-2.5 rounded-xl border flex-shrink-0 transition-colors
                              bg-stone-50 border-stone-200 dark:bg-slate-800 dark:border-slate-700">
                <span className="text-[10px] uppercase tracking-widest font-medium
                                 text-stone-400 dark:text-slate-500">Halaman</span>
                <span className="text-xl font-bold text-stone-800 dark:text-slate-200">
                  {page}
                  <span className="text-sm font-normal text-stone-400 dark:text-slate-500"> / {totalPages}</span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Filter Bar ────────────────────────────────────────────── */}
      <div className="border-b transition-colors
                      bg-white/70 border-stone-200 backdrop-blur-sm
                      dark:bg-slate-900/70 dark:border-slate-700">
        <div className="container mx-auto px-4 max-w-7xl py-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Sort pills */}
            <div className="flex items-center gap-1.5 mr-2">
              {[['date', 'Terbaru'], ['importance', 'Prioritas']].map(([v, l]) => (
                <button
                  key={v}
                  onClick={() => setParam('sortBy', v)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    sortBy === v
                      ? 'bg-violet-600 text-white shadow-sm shadow-violet-200/80 dark:shadow-violet-900/40'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                  }`}
                >
                  {l}
                  {sortBy === v && (
                    sortOrder === 'DESC'
                      ? <ArrowDown className="w-3 h-3" />
                      : <ArrowUp className="w-3 h-3" />
                  )}
                </button>
              ))}
              {sortBy !== 'importance' && (
                <button
                  onClick={() => setParam('sortOrder', sortOrder === 'DESC' ? 'ASC' : 'DESC')}
                  className="p-1.5 rounded-lg text-xs transition-all
                             text-stone-500 hover:bg-stone-100
                             dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex-1" />

            {/* Filter button */}
            <button
              onClick={() => setShowFilter(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                showFilter || hasFilters
                  ? 'bg-violet-600 text-white border-violet-600 shadow-sm dark:shadow-violet-900/40'
                  : 'bg-white border-stone-200 text-stone-600 hover:border-violet-300 hover:text-violet-700 shadow-sm dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:border-violet-600 dark:hover:text-violet-400'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filter
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
            <div className="flex flex-wrap gap-2 items-center mt-2">
              <span className="text-xs text-stone-400 dark:text-slate-500">Filter aktif:</span>
              {activePills.map(f => (
                <FilterPill
                  key={f.key}
                  label={f.label}
                  onRemove={() => setParam(f.key, '')}
                />
              ))}
              <button
                onClick={clearFilters}
                className="text-xs font-medium underline transition-colors
                           text-red-500 hover:text-red-700
                           dark:text-red-400 dark:hover:text-red-300"
              >
                Hapus semua
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Filter Panel ──────────────────────────────────────────── */}
      {showFilter && (
        <div className="border-b transition-colors
                        bg-violet-50/60 border-violet-200
                        dark:bg-slate-900 dark:border-slate-700">
          <div className="container mx-auto px-4 max-w-7xl py-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5
                                  text-stone-500 dark:text-slate-400">Dari Tanggal</label>
                <input type="date" value={dateFrom}
                  onChange={e => setParam('dateFrom', e.target.value)}
                  className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5
                                  text-stone-500 dark:text-slate-400">Sampai Tanggal</label>
                <input type="date" value={dateTo}
                  onChange={e => setParam('dateTo', e.target.value)}
                  className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5
                                  text-stone-500 dark:text-slate-400">Sumber</label>
                <select value={source} onChange={e => setParam('source', e.target.value)}
                  className={inputCls}>
                  <option value="">Semua Sumber</option>
                  {sources.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5
                                  text-stone-500 dark:text-slate-400">Prioritas</label>
                <select value={importance} onChange={e => setParam('importance', e.target.value)}
                  className={inputCls}>
                  <option value="">Semua</option>
                  {Object.entries(IMPORTANCE_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
            </div>
            {hasFilters && (
              <button onClick={clearFilters}
                className="flex items-center gap-1.5 mt-3 text-xs font-medium transition-colors
                           text-red-500 hover:text-red-700">
                <X className="w-3.5 h-3.5" />Hapus semua filter
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Articles ──────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 max-w-7xl py-6 sm:py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }, (_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-24">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-stone-200 dark:text-slate-700" />
            <p className="font-medium mb-1 text-stone-500 dark:text-slate-400">Tidak ada artikel ditemukan</p>
            <p className="text-sm text-stone-400 dark:text-slate-500">Coba ubah filter pencarian</p>
            {hasFilters && (
              <button onClick={clearFilters}
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
              <span className="text-stone-500 dark:text-slate-500">
                Menampilkan{' '}
                <span className="font-semibold text-stone-800 dark:text-slate-200">
                  {((page - 1) * limit) + 1}–{Math.min(page * limit, total)}
                </span>
                {' '}dari{' '}
                <span className="font-semibold text-stone-800 dark:text-slate-200">
                  {total.toLocaleString('id-ID')}
                </span>
                {' '}artikel
              </span>
              <span className="text-xs px-2.5 py-1 rounded-lg
                               bg-stone-100 text-stone-500
                               dark:bg-slate-800 dark:text-slate-500">
                {sortBy === 'date' ? 'Terbaru' : 'Prioritas'}
                {sortOrder === 'DESC' ? ' ↓' : ' ↑'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {articles.map(art => <ArticleCard key={art.id} article={art} />)}
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

export default NewspaperCategoryPage
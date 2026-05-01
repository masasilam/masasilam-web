// ============================================
// src/pages/FilmsPage.jsx
// LIGHT: Cool slate/white — sinema siang bersih
// DARK:  Deep navy/slate  — bioskop malam elegan
// ============================================

import { useState, useEffect, useCallback, memo, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { filmService } from '../services/filmService'
import FilmGrid from '../components/Film/FilmGrid'
import SEO from '../components/Common/SEO'
import {
  Search, SlidersHorizontal, X, ArrowUpDown, ArrowUp, ArrowDown,
  ArrowLeft, ChevronLeft, ChevronRight
} from 'lucide-react'

// ── Sort options ──────────────────────────────────────────────────────────────
const SORTS = [
  { v: 'tahunRilis', l: 'Tahun'    },
  { v: 'judul',      l: 'Judul A–Z' },
  { v: 'durasi',     l: 'Durasi'   },
]

const EMPTY_CRIT = {
  searchTitle: '', genre: '', negara: '', yearFrom: '', yearTo: ''
}

const FILTER_LABELS = {
  genre:    'Genre',
  negara:   'Negara',
  yearFrom: 'Tahun Dari',
  yearTo:   'Tahun Sampai',
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared input className — cool slate light / deep dark
// LIGHT: bg-white border-slate-200 text-slate-800
// DARK:  bg-slate-800 border-slate-600 text-slate-200
// ─────────────────────────────────────────────────────────────────────────────
const inputCls = `
  w-full px-3 py-2 rounded-lg text-sm transition-all focus:outline-none
  border border-slate-200 bg-white text-slate-800 placeholder-slate-400
  focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400
  dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500
  dark:focus:ring-blue-500/40 dark:focus:border-blue-500/60
`

// ── Advanced filter panel ─────────────────────────────────────────────────────
// LIGHT: bg-blue-50/60 border-blue-200  — cool tint
// DARK:  bg-slate-900 border-slate-700  — deep cool
const FilterPanel = memo(({ crit, onChange, onApply, onReset, onClose }) => (
  <div className="mb-6 p-4 sm:p-5 rounded-2xl border shadow-lg transition-colors
                  bg-blue-50/60 border-blue-200 shadow-blue-100/60
                  dark:bg-slate-900 dark:border-slate-700 dark:shadow-black/50">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-bold flex items-center gap-2
                     text-slate-800 dark:text-slate-100">
        <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        Filter Lanjutan
      </h3>
      <button onClick={onClose}
        className="p-1.5 rounded-lg transition-all
                   text-slate-400 hover:text-slate-700 hover:bg-blue-100
                   dark:text-slate-500 dark:hover:text-slate-200 dark:hover:bg-slate-800">
        <X className="w-4 h-4" />
      </button>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {[
        { ph: 'Genre film...', f: 'genre' },
        { ph: 'Negara asal...', f: 'negara' },
      ].map(({ ph, f }) => (
        <input key={f} placeholder={ph} value={crit[f]}
          onChange={(e) => onChange(f, e.target.value)}
          className={inputCls} />
      ))}

      <div className="flex gap-2">
        {[
          { ph: 'Tahun dari', f: 'yearFrom' },
          { ph: 'Tahun sampai', f: 'yearTo' },
        ].map(({ ph, f }) => (
          <input key={f} type="number" placeholder={ph} value={crit[f]}
            onChange={(e) => onChange(f, e.target.value)}
            className={inputCls} />
        ))}
      </div>
    </div>

    <div className="flex gap-2 mt-4 pt-4 border-t border-blue-200 dark:border-slate-700">
      <button onClick={onApply}
        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                   text-sm font-semibold transition-all
                   bg-blue-500 hover:bg-blue-400 text-white
                   shadow-sm shadow-blue-200/80 hover:shadow-md
                   dark:shadow-blue-900/30">
        <Search className="w-4 h-4" />Terapkan Filter
      </button>
      <button onClick={onReset}
        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                   text-sm font-medium transition-all
                   bg-slate-100 hover:bg-slate-200 text-slate-700
                   dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300">
        <X className="w-4 h-4" />Reset
      </button>
    </div>
  </div>
))

// ── Sort button ───────────────────────────────────────────────────────────────
// ACTIVE:   blue-500 text-white shadow-blue-200
// INACTIVE: bg-slate-100 text-slate-600 hover:bg-slate-200
const SortBtn = memo(({ opt, active, order, loading, onClick }) => (
  <button onClick={onClick} disabled={loading}
    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                transition-all duration-200 disabled:opacity-50 whitespace-nowrap
                ${active
                  ? 'bg-blue-500 text-white shadow-md shadow-blue-200/80 dark:shadow-blue-900/50'
                  : `bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800
                     dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200`
                }`}>
    {opt.l}
    {active
      ? order === 'DESC'
        ? <ArrowDown className="w-3 h-3" />
        : <ArrowUp className="w-3 h-3" />
      : <ArrowUpDown className="w-3 h-3 opacity-30" />}
  </button>
))

// ── Page input ────────────────────────────────────────────────────────────────
const PageInput = memo(({ currentPage, totalPages, onGo, disabled }) => {
  const [val, setVal] = useState(String(currentPage))
  const inputRef = useRef(null)
  useEffect(() => { setVal(String(currentPage)) }, [currentPage])
  const commit = useCallback(() => {
    const n = parseInt(val, 10)
    if (!isNaN(n) && n >= 1 && n <= totalPages) onGo(n)
    else setVal(String(currentPage))
  }, [val, currentPage, totalPages, onGo])

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs whitespace-nowrap text-slate-400 dark:text-slate-500">Hal</span>
      <input
        ref={inputRef}
        type="number" min={1} max={totalPages}
        value={val} disabled={disabled}
        onChange={(e) => setVal(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && (commit(), inputRef.current?.blur())}
        className="w-14 px-2 py-1.5 text-center text-xs rounded-lg transition-all focus:outline-none
                   border border-slate-200 bg-white text-slate-800
                   focus:ring-2 focus:ring-blue-400/50
                   disabled:opacity-50
                   dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200
                   dark:focus:ring-blue-500/40"
      />
      <span className="text-xs whitespace-nowrap text-slate-400 dark:text-slate-500">
        dari {totalPages}
      </span>
    </div>
  )
})
PageInput.displayName = 'PageInput'

// ── Filter pill ───────────────────────────────────────────────────────────────
// LIGHT: bg-blue-100 border-blue-300 text-blue-800
// DARK:  bg-blue-900/20 border-blue-700/50 text-blue-300
const FilterPill = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full
                   text-xs font-medium
                   bg-blue-100 border border-blue-300 text-blue-800
                   dark:bg-blue-900/20 dark:border-blue-700/50 dark:text-blue-300">
    {label}
    <button onClick={onRemove}
      className="w-3.5 h-3.5 rounded-full flex items-center justify-center transition-colors
                 hover:bg-blue-200 dark:hover:bg-blue-800/60">
      <X className="w-2.5 h-2.5" />
    </button>
  </span>
)

// ─────────────────────────────────────────────────────────────────────────────
// Control button classNames (Urutkan / Filter)
// LIGHT: bg-white border-slate-200 text-slate-600 shadow-sm
// DARK:  bg-slate-900 border-slate-700 text-slate-400
// ─────────────────────────────────────────────────────────────────────────────
const ctrlBtnBase = `flex-shrink-0 flex items-center gap-1.5 px-3 rounded-xl text-sm font-medium border transition-all`
const ctrlBtnOff  = `bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-700 shadow-sm
                     dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400
                     dark:hover:border-blue-600 dark:hover:text-blue-400 dark:shadow-none`
const ctrlBtnOn   = `bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-200/80 dark:shadow-blue-900/40`

// ── FilmsPage ─────────────────────────────────────────────────────────────────
const FilmsPage = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // URL adalah sumber kebenaran untuk page, sort, order
  const pageFromUrl  = parseInt(searchParams.get('page') || '1', 10)
  const sortFromUrl  = searchParams.get('sortField') || 'tahunRilis'
  const orderFromUrl = searchParams.get('sortOrder') || 'DESC'

  const [films,       setFilms]       = useState([])
  const [loading,     setLoading]     = useState(true)
  const [totalPages,  setTotalPages]  = useState(1)
  const [totalFilms,  setTotalFilms]  = useState(0)
  const [showAdv,     setShowAdv]     = useState(false)
  const [showSort,    setShowSort]    = useState(false)
  const [crit,        setCrit]        = useState(EMPTY_CRIT)
  const [appliedCrit, setAppliedCrit] = useState(EMPTY_CRIT)

  const abortRef = useRef(null)

  const activeFilters = Object.entries(appliedCrit)
    .filter(([k, v]) => v && k !== 'searchTitle')
    .map(([k, v]) => ({ key: k, label: `${FILTER_LABELS[k] || k}: ${v}` }))

  const updateParams = useCallback((updates) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      Object.entries(updates).forEach(([k, v]) => {
        if (v === null || v === undefined || v === '') next.delete(k)
        else next.set(k, String(v))
      })
      return next
    }, { replace: false })
  }, [setSearchParams])

  // ── Satu-satunya fetch trigger ─────────────────────────────────────────────
  useEffect(() => {
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()

    const doFetch = async () => {
      try {
        setLoading(true)
        const params = {
          page:      pageFromUrl - 1, // 0-indexed API
          size:      12,
          sortField: sortFromUrl,
          sortOrder: orderFromUrl,
          ...Object.fromEntries(Object.entries(appliedCrit).filter(([, v]) => v))
        }
        const res = await filmService.getFilms(params)
        setFilms(res.data?.data || [])
        const total = res.data?.total || 0
        setTotalFilms(total)
        setTotalPages(Math.ceil(total / 12))
      } catch (e) {
        if (e.name !== 'AbortError') {
          console.error('Error fetching films:', e)
          setFilms([])
        }
      } finally {
        setLoading(false)
      }
    }

    doFetch()
    return () => abortRef.current?.abort()
  }, [pageFromUrl, sortFromUrl, orderFromUrl, appliedCrit])

  useEffect(() => {
    sessionStorage.setItem('filmsPageUrl', window.location.pathname + window.location.search)
  }, [searchParams])

  const goToPage = useCallback((page) => {
    updateParams({ page: page === 1 ? null : page })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [updateParams])

  const handleSort = useCallback((field) => {
    const newOrder = sortFromUrl === field
      ? (orderFromUrl === 'DESC' ? 'ASC' : 'DESC')
      : 'DESC'
    updateParams({ sortField: field, sortOrder: newOrder, page: null })
  }, [sortFromUrl, orderFromUrl, updateParams])

  const handleChange = useCallback((f, v) => setCrit(p => ({ ...p, [f]: v })), [])
  const handleApply  = useCallback(() => {
    setAppliedCrit({ ...crit })
    updateParams({ page: null })
  }, [crit, updateParams])
  const handleReset  = useCallback(() => {
    setCrit(EMPTY_CRIT)
    setAppliedCrit(EMPTY_CRIT)
    updateParams({ page: null })
  }, [updateParams])
  const removeFilter = useCallback((key) => {
    const nc = { ...crit, [key]: '' }
    const na = { ...appliedCrit, [key]: '' }
    setCrit(nc)
    setAppliedCrit(na)
  }, [crit, appliedCrit])

  // ── SEO ────────────────────────────────────────────────────────────────────
  const pageTitle = appliedCrit.searchTitle
    ? `${appliedCrit.searchTitle} - Koleksi Film`
    : `Koleksi Film Digital - Halaman ${pageFromUrl}`
  const pageDescription = appliedCrit.searchTitle
    ? `Hasil pencarian "${appliedCrit.searchTitle}" — Temukan film di koleksi kami`
    : `Jelajahi ${totalFilms.toLocaleString('id-ID')} film klasik domain publik. Halaman ${pageFromUrl} dari ${totalPages}.`
  const pageUrl = pageFromUrl > 1 ? `/film?page=${pageFromUrl}` : '/film'
  const prevUrl = pageFromUrl > 1
    ? (pageFromUrl === 2 ? '/film' : `/film?page=${pageFromUrl - 1}`)
    : null
  const nextUrl = pageFromUrl < totalPages ? `/film?page=${pageFromUrl + 1}` : null

  // ── Smart pagination (sama persis dengan BooksPage) ──────────────────────
  const paginationPages = (() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const pages = new Set([1, totalPages, pageFromUrl])
    for (
      let i = Math.max(2, pageFromUrl - 1);
      i <= Math.min(totalPages - 1, pageFromUrl + 1);
      i++
    ) pages.add(i)
    return [...pages].sort((a, b) => a - b)
  })()

  return (
    <>
      <SEO
        title={pageTitle}
        description={pageDescription}
        url={pageUrl}
        type="website"
        keywords="film gratis, domain publik, film klasik, tonton film online, film vintage"
        prevUrl={prevUrl}
        nextUrl={nextUrl}
      />

      {/*
        ══════════════════════════════════════════════════════════════
        LIGHT MODE PALETTE:
          Background  : slate-50    (#f8fafc) — cool off-white
          Surface     : white       (#ffffff)
          Border      : slate-200   (#e2e8f0)
          Text primary: slate-900   (#0f172a)
          Text muted  : slate-500   (#64748b)
          Accent bg   : blue-50/60  — cool cinema tint
          CTA         : blue-500    (#3b82f6)

        DARK MODE PALETTE:
          Background  : slate-950   (#020617) — near-black cool
          Surface     : slate-900   (#0f172a) — deep navy
          Border      : slate-700   (#334155)
          Text primary: slate-50    (#f8fafc)
          Text muted  : slate-400   (#94a3b8)
          Accent bg   : slate-800   (#1e293b)
          CTA         : blue-500    (#3b82f6)
        ══════════════════════════════════════════════════════════════
      */}
      <div className="min-h-screen py-4 sm:py-8 transition-colors duration-300
                      bg-slate-50 dark:bg-slate-950">
        <div className="container mx-auto px-3 sm:px-4 max-w-7xl">

          {/* Back button */}
          <button onClick={() => navigate('/')}
            className="flex items-center gap-2 mb-4 sm:mb-6 group transition-colors
                       text-sm font-medium
                       text-slate-500 hover:text-slate-900
                       dark:text-slate-500 dark:hover:text-slate-100">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Kembali ke Beranda
          </button>

          {/* ── Page header ───────────────────────────────────────────── */}
          <header className="mb-6 sm:mb-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1.5 transition-colors
                               text-slate-900 dark:text-slate-50">
                  Koleksi Film Digital
                </h1>
                <p className="text-sm sm:text-base transition-colors
                              text-slate-500 dark:text-slate-400">
                  {loading ? 'Memuat koleksi…' : (
                    <>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {totalFilms.toLocaleString('id-ID')}
                      </span>{' '}film tersedia
                    </>
                  )}
                </p>
              </div>

              {/* Page indicator */}
              {totalPages > 1 && (
                <div className="hidden sm:flex flex-col items-end px-4 py-2.5 rounded-xl
                                border flex-shrink-0 transition-colors
                                bg-white border-slate-200 shadow-sm
                                dark:bg-slate-900 dark:border-slate-700 dark:shadow-none">
                  <span className="text-[10px] uppercase tracking-widest font-medium
                                   text-slate-400 dark:text-slate-500">Halaman</span>
                  <span className="text-xl font-bold text-slate-800 dark:text-slate-200">
                    {pageFromUrl}
                    <span className="text-sm font-normal text-slate-400 dark:text-slate-500">
                      {' '}/ {totalPages}
                    </span>
                  </span>
                </div>
              )}
            </div>
          </header>

          {/* ── Search & controls ──────────────────────────────────────── */}
          <div className="mb-4 space-y-3">
            <div className="flex items-stretch gap-2 h-10">

              {/* Search input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none
                                   text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  placeholder="Cari judul film…"
                  value={crit.searchTitle}
                  onChange={(e) => handleChange('searchTitle', e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                  className="h-full w-full pl-10 pr-8 text-sm rounded-xl transition-all focus:outline-none
                             border border-slate-200 bg-white text-slate-900 placeholder-slate-400
                             shadow-sm focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400
                             dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100
                             dark:placeholder-slate-500 dark:shadow-none
                             dark:focus:ring-blue-500/40 dark:focus:border-blue-500/60"
                />
                {crit.searchTitle && (
                  <button
                    onClick={() => { handleChange('searchTitle', ''); handleApply() }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 transition-colors
                               text-slate-400 hover:text-slate-700
                               dark:text-slate-500 dark:hover:text-slate-300">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Cari — blue solid di kedua mode */}
              <button onClick={handleApply}
                className="flex-shrink-0 flex items-center gap-1.5 px-4 rounded-xl text-sm font-semibold
                           transition-all bg-blue-500 hover:bg-blue-400 text-white
                           shadow-sm shadow-blue-200/80 hover:shadow-md
                           dark:shadow-blue-900/30">
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Cari</span>
              </button>

              {/* Urutkan */}
              <button
                onClick={() => setShowSort(!showSort)}
                className={`${ctrlBtnBase} ${showSort ? ctrlBtnOn : ctrlBtnOff}`}>
                <ArrowUpDown className="w-4 h-4" />
                <span className="hidden sm:inline">Urutkan</span>
              </button>

              {/* Filter */}
              <button
                onClick={() => setShowAdv(!showAdv)}
                className={`${ctrlBtnBase} ${showAdv ? ctrlBtnOn : ctrlBtnOff}`}>
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Filter</span>
                {activeFilters.length > 0 && (
                  <span className="flex-shrink-0 w-4 h-4 rounded-full text-[10px] font-bold
                                   flex items-center justify-center bg-white text-blue-600">
                    {activeFilters.length}
                  </span>
                )}
              </button>
            </div>

            {/* Active filter pills */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs text-slate-400 dark:text-slate-500">Filter aktif:</span>
                {activeFilters.map(f => (
                  <FilterPill
                    key={f.key}
                    label={f.label}
                    onRemove={() => removeFilter(f.key)}
                  />
                ))}
                <button onClick={handleReset}
                  className="text-xs font-medium underline transition-colors
                             text-red-500 hover:text-red-700
                             dark:text-red-400 dark:hover:text-red-300">
                  Hapus semua
                </button>
              </div>
            )}

            {/* Sort panel */}
            {showSort && (
              <div className="rounded-2xl p-4 border shadow-lg transition-colors
                              bg-white border-slate-200 shadow-slate-100/80
                              dark:bg-slate-900 dark:border-slate-700 dark:shadow-black/50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2
                                 text-slate-600 dark:text-slate-400">
                    <ArrowUpDown className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    Urutkan berdasarkan
                  </h3>
                  <button onClick={() => setShowSort(false)}
                    className="p-1 rounded-lg transition-all
                               text-slate-400 hover:text-slate-700 hover:bg-slate-100
                               dark:text-slate-500 dark:hover:text-slate-200 dark:hover:bg-slate-800">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SORTS.map(o => (
                    <SortBtn
                      key={o.v}
                      opt={o}
                      active={sortFromUrl === o.v}
                      order={orderFromUrl}
                      loading={loading}
                      onClick={() => handleSort(o.v)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Filter panel */}
          {showAdv && (
            <FilterPanel
              crit={crit}
              onChange={handleChange}
              onApply={() => { handleApply(); setShowAdv(false) }}
              onReset={handleReset}
              onClose={() => setShowAdv(false)}
            />
          )}

          {/* ── Results info row ─────────────────────────────────────────── */}
          {!loading && films.length > 0 && (
            <div className="flex items-center justify-between mb-4 text-sm">
              <span className="text-slate-500 dark:text-slate-500">
                Menampilkan{' '}
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {((pageFromUrl - 1) * 12) + 1}–{Math.min(pageFromUrl * 12, totalFilms)}
                </span>
                {' '}dari{' '}
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {totalFilms.toLocaleString('id-ID')}
                </span>{' '}film
              </span>
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg
                               whitespace-nowrap transition-colors
                               bg-slate-100 text-slate-500
                               dark:bg-slate-900 dark:border dark:border-slate-700/60 dark:text-slate-500">
                Diurutkan:{' '}
                <span className="font-medium text-slate-700 dark:text-slate-300
                                 inline-flex items-center gap-0.5">
                  {SORTS.find(s => s.v === sortFromUrl)?.l || sortFromUrl}
                  {orderFromUrl === 'DESC' ? ' ↓' : ' ↑'}
                </span>
              </span>
            </div>
          )}

          {/* ── Film grid ────────────────────────────────────────────────── */}
          <FilmGrid films={films} loading={loading} skeletonCount={12} />

          {/* ── Pagination ────────────────────────────────────────────────── */}
          {totalPages > 1 && !loading && (
            <nav
              className="mt-10 flex flex-row flex-wrap items-center justify-center gap-2"
              aria-label="Navigasi halaman">

              {/* Prev */}
              <button
                onClick={() => goToPage(pageFromUrl - 1)}
                disabled={pageFromUrl === 1}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium
                           border transition-all disabled:opacity-40 disabled:pointer-events-none
                           bg-white border-slate-200 text-slate-600 shadow-sm
                           hover:border-blue-400 hover:text-blue-600
                           dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400
                           dark:shadow-none dark:hover:border-blue-500/70 dark:hover:text-blue-400">
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Sebelumnya</span>
              </button>

              {/* Page numbers */}
              <div className="hidden sm:flex items-center gap-1">
                {paginationPages.map((p, i) => {
                  const prev = paginationPages[i - 1]
                  const showEllipsis = prev && p - prev > 1
                  return (
                    <span key={p} className="flex items-center gap-1">
                      {showEllipsis && (
                        <span className="w-6 text-center text-sm
                                         text-slate-300 dark:text-slate-600">…</span>
                      )}
                      <button
                        onClick={() => goToPage(p)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-all
                          ${p === pageFromUrl
                            ? 'bg-blue-500 text-white shadow-md shadow-blue-200/80 dark:shadow-blue-900/50'
                            : `bg-white border border-slate-200 text-slate-600
                               hover:border-blue-400 hover:text-blue-600
                               dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400
                               dark:hover:border-blue-500/70 dark:hover:text-blue-400`
                          }`}>
                        {p}
                      </button>
                    </span>
                  )
                })}
              </div>

              <PageInput
                currentPage={pageFromUrl}
                totalPages={totalPages}
                onGo={goToPage}
                disabled={loading}
              />

              {/* Next */}
              <button
                onClick={() => goToPage(pageFromUrl + 1)}
                disabled={pageFromUrl === totalPages}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium
                           border transition-all disabled:opacity-40 disabled:pointer-events-none
                           bg-white border-slate-200 text-slate-600 shadow-sm
                           hover:border-blue-400 hover:text-blue-600
                           dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400
                           dark:shadow-none dark:hover:border-blue-500/70 dark:hover:text-blue-400">
                <span className="hidden sm:inline">Berikutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </nav>
          )}

        </div>
      </div>
    </>
  )
}

export default FilmsPage
import { useState, useEffect, useCallback, memo, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import bookService from '../services/bookService'
import BookGrid from '../components/Book/BookGrid'
import Input from '../components/Common/Input'
import SEO from '../components/Common/SEO'
import { generateCollectionPageStructuredData, generateBreadcrumbStructuredData } from '../utils/seoHelpers'
import {
  Search, SlidersHorizontal, X, ArrowUpDown, ArrowUp, ArrowDown,
  ArrowLeft, ChevronLeft, ChevronRight, BookOpen
} from 'lucide-react'

// ── Sort options ──────────────────────────────────────────────────────────────
const SORTS = [
  { v: 'updateAt',          l: 'Terbaru'    },
  { v: 'publishedAt',       l: 'Terbit'     },
  { v: 'averageRating',     l: 'Rating'     },
  { v: 'viewCount',         l: 'Views'      },
  { v: 'readCount',         l: 'Dibaca'     },
  { v: 'downloadCount',     l: 'Download'   },
  { v: 'title',             l: 'Judul A–Z'  },
  { v: 'estimatedReadTime', l: 'Durasi'     },
  { v: 'totalWord',         l: 'Kata'       },
  { v: 'fileSize',          l: 'Ukuran'     },
  { v: 'totalPages',        l: 'Bab'        },
]

const EMPTY_CRIT = {
  searchTitle: '', searchInBook: '', authorName: '', contributor: '', genre: '',
  minChapters: '', maxChapters: '', minFileSize: '', maxFileSize: '',
  publicationYearFrom: '', publicationYearTo: '', difficultyLevel: '',
  fileFormat: '', isFeatured: '', languageId: '', minRating: '',
  minViewCount: '', minReadCount: ''
}

const FILTER_LABELS = {
  searchInBook: 'Isi Buku', authorName: 'Penulis', contributor: 'Kontributor',
  genre: 'Genre', difficultyLevel: 'Kesulitan', fileFormat: 'Format',
  isFeatured: 'Status', languageId: 'Bahasa', minRating: 'Min Rating',
  minChapters: 'Bab Min', maxChapters: 'Bab Maks', minFileSize: 'Ukuran Min',
  maxFileSize: 'Ukuran Maks', publicationYearFrom: 'Tahun Dari',
  publicationYearTo: 'Tahun Sampai', minViewCount: 'Min Views', minReadCount: 'Min Dibaca',
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared input className — warm light / cool dark
// LIGHT: bg-white border-stone-200 text-stone-800 placeholder-stone-400
// DARK:  bg-slate-800 border-slate-600 text-slate-200 placeholder-slate-500
// ─────────────────────────────────────────────────────────────────────────────
const inputCls = `
  w-full px-3 py-2 rounded-lg text-sm transition-all focus:outline-none
  border border-stone-200 bg-white text-stone-800 placeholder-stone-400
  focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400
  dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500
  dark:focus:ring-amber-500/40 dark:focus:border-amber-500/60
`

// ── Reusable select ───────────────────────────────────────────────────────────
const Sel = memo(({ val, onChange, opts, ph }) => (
  <select value={val} onChange={onChange} className={inputCls}>
    <option value="">{ph}</option>
    {opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
  </select>
))

// ── Advanced filter panel ─────────────────────────────────────────────────────
// LIGHT: bg-amber-50/60 border-amber-200 — warm tint
// DARK:  bg-slate-900 border-slate-700   — deep cool
const FilterPanel = memo(({ crit, onChange, onApply, onReset, onClose }) => (
  <div className="mb-6 p-4 sm:p-5 rounded-2xl border shadow-lg transition-colors
                  bg-amber-50/60 border-amber-200 shadow-amber-100/60
                  dark:bg-slate-900 dark:border-slate-700 dark:shadow-black/50">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-bold flex items-center gap-2
                     text-stone-800 dark:text-slate-100">
        <SlidersHorizontal className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        Filter Lanjutan
      </h3>
      <button onClick={onClose}
        className="p-1.5 rounded-lg transition-all
                   text-stone-400 hover:text-stone-700 hover:bg-amber-100
                   dark:text-slate-500 dark:hover:text-slate-200 dark:hover:bg-slate-800">
        <X className="w-4 h-4" />
      </button>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {[
        { ph: 'Cari dalam isi buku...', f: 'searchInBook' },
        { ph: 'Nama penulis...', f: 'authorName' },
        { ph: 'Kontributor...', f: 'contributor' },
        { ph: 'Genre / kategori...', f: 'genre' },
      ].map(({ ph, f }) => (
        <input key={f} placeholder={ph} value={crit[f]}
          onChange={(e) => onChange(f, e.target.value)}
          className={inputCls} />
      ))}

      <Sel val={crit.difficultyLevel} onChange={(e) => onChange('difficultyLevel', e.target.value)}
        ph="Tingkat Kesulitan"
        opts={[{v:'BEGINNER',l:'Pemula'},{v:'INTERMEDIATE',l:'Menengah'},{v:'ADVANCED',l:'Lanjutan'}]} />
      <Sel val={crit.fileFormat} onChange={(e) => onChange('fileFormat', e.target.value)}
        ph="Format File" opts={[{v:'epub',l:'EPUB'},{v:'pdf',l:'PDF'},{v:'mobi',l:'MOBI'}]} />
      <Sel val={crit.isFeatured} onChange={(e) => onChange('isFeatured', e.target.value)}
        ph="Status" opts={[{v:'true',l:'Pilihan Editor'},{v:'false',l:'Reguler'}]} />
      <Sel val={crit.languageId} onChange={(e) => onChange('languageId', e.target.value)}
        ph="Bahasa" opts={[{v:'1',l:'Bahasa Indonesia'},{v:'2',l:'English'},{v:'3',l:'Jawa'}]} />
      <Sel val={crit.minRating} onChange={(e) => onChange('minRating', e.target.value)}
        ph="Rating Minimum"
        opts={[{v:'4.5',l:'4.5+ ⭐ Luar Biasa'},{v:'4.0',l:'4.0+ ⭐ Sangat Bagus'},{v:'3.5',l:'3.5+ ⭐ Bagus'},{v:'3.0',l:'3.0+ ⭐ Cukup'}]} />

      {[
        [{ph:'Bab min',f:'minChapters'},{ph:'Bab maks',f:'maxChapters'}],
        [{ph:'Ukuran min (MB)',f:'minFileSize'},{ph:'Ukuran maks (MB)',f:'maxFileSize'}],
        [{ph:'Tahun dari',f:'publicationYearFrom'},{ph:'Tahun sampai',f:'publicationYearTo'}],
      ].map((pair, i) => (
        <div key={i} className="flex gap-2">
          {pair.map(({ph,f}) => (
            <input key={f} type="number" placeholder={ph} value={crit[f]}
              onChange={(e) => onChange(f, e.target.value)} className={inputCls} />
          ))}
        </div>
      ))}

      {[{ph:'Minimal views',f:'minViewCount'},{ph:'Minimal dibaca',f:'minReadCount'}].map(({ph,f}) => (
        <input key={f} type="number" placeholder={ph} value={crit[f]}
          onChange={(e) => onChange(f, e.target.value)} className={inputCls} />
      ))}
    </div>

    <div className="flex gap-2 mt-4 pt-4 border-t border-amber-200 dark:border-slate-700">
      <button onClick={onApply}
        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                   text-sm font-semibold transition-all
                   bg-amber-500 hover:bg-amber-400 text-white
                   shadow-sm shadow-amber-200/80 hover:shadow-md
                   dark:shadow-amber-900/30">
        <Search className="w-4 h-4" />Terapkan Filter
      </button>
      <button onClick={onReset}
        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                   text-sm font-medium transition-all
                   bg-stone-100 hover:bg-stone-200 text-stone-700
                   dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300">
        <X className="w-4 h-4" />Reset
      </button>
    </div>
  </div>
))

// ── Sort button ───────────────────────────────────────────────────────────────
// ACTIVE LIGHT:   amber-500 text-white shadow-amber-200
// ACTIVE DARK:    amber-500 text-white shadow-amber-900/50
// INACTIVE LIGHT: bg-stone-100 text-stone-600 hover:bg-stone-200
// INACTIVE DARK:  bg-slate-800 text-slate-400 hover:bg-slate-700
const SortBtn = memo(({ opt, active, order, loading, onClick }) => (
  <button onClick={onClick} disabled={loading}
    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                transition-all duration-200 disabled:opacity-50 whitespace-nowrap
                ${active
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-200/80 dark:shadow-amber-900/50'
                  : `bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-800
                     dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200`
                }`}>
    {opt.l}
    {active
      ? order === 'DESC' ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />
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
      <span className="text-xs whitespace-nowrap text-stone-400 dark:text-slate-500">Hal</span>
      <input ref={inputRef} type="number" min={1} max={totalPages}
        value={val} disabled={disabled}
        onChange={(e) => setVal(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && (commit(), inputRef.current?.blur())}
        className="w-14 px-2 py-1.5 text-center text-xs rounded-lg transition-all focus:outline-none
                   border border-stone-200 bg-white text-stone-800
                   focus:ring-2 focus:ring-amber-400/50
                   disabled:opacity-50
                   dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200
                   dark:focus:ring-amber-500/40"
      />
      <span className="text-xs whitespace-nowrap text-stone-400 dark:text-slate-500">dari {totalPages}</span>
    </div>
  )
})
PageInput.displayName = 'PageInput'

// ── Filter pill ───────────────────────────────────────────────────────────────
// LIGHT: warm amber bg-amber-100 border-amber-300 text-amber-800
// DARK:  cool     bg-amber-900/20 border-amber-700/50 text-amber-300
const FilterPill = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full text-xs font-medium
                   bg-amber-100 border border-amber-300 text-amber-800
                   dark:bg-amber-900/20 dark:border-amber-700/50 dark:text-amber-300">
    {label}
    <button onClick={onRemove}
      className="w-3.5 h-3.5 rounded-full flex items-center justify-center transition-colors
                 hover:bg-amber-200 dark:hover:bg-amber-800/60">
      <X className="w-2.5 h-2.5" />
    </button>
  </span>
)

// ─────────────────────────────────────────────────────────────────────────────
// Control button className (Urutkan / Filter) — inactive state
// LIGHT: bg-white border-stone-200 text-stone-600 shadow-sm
// DARK:  bg-slate-900 border-slate-700 text-slate-400
// ─────────────────────────────────────────────────────────────────────────────
const ctrlBtnBase = `flex-shrink-0 flex items-center gap-1.5 px-3 rounded-xl text-sm font-medium border transition-all`
const ctrlBtnOff  = `bg-white border-stone-200 text-stone-600 hover:border-amber-300 hover:text-amber-700 shadow-sm
                     dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:border-amber-600 dark:hover:text-amber-400 dark:shadow-none`
const ctrlBtnOn   = `bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-200/80 dark:shadow-amber-900/40`

// ── BooksPage ─────────────────────────────────────────────────────────────────
const BooksPage = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const pageFromUrl  = parseInt(searchParams.get('page') || '1', 10)
  const sortFromUrl  = searchParams.get('sortField') || 'updateAt'
  const orderFromUrl = searchParams.get('sortOrder') || 'DESC'

  const [books,       setBooks]       = useState([])
  const [loading,     setLoading]     = useState(true)
  const [totalPages,  setTotalPages]  = useState(1)
  const [totalBooks,  setTotalBooks]  = useState(0)
  const [showAdv,     setShowAdv]     = useState(false)
  const [showSort,    setShowSort]    = useState(false)
  const [crit,        setCrit]        = useState(EMPTY_CRIT)
  const [appliedCrit, setAppliedCrit] = useState(EMPTY_CRIT)

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

  const fetchBooks = useCallback(async (page, sortField, sortOrder, criteria) => {
    try {
      setLoading(true)
      const params = {
        page, limit: 12, sortField, sortOrder,
        ...Object.fromEntries(Object.entries(criteria).filter(([, v]) => v))
      }
      const res = await bookService.getBooks(params)
      setBooks(res.data?.data || [])
      const total = res.data?.total || 0
      setTotalBooks(total)
      setTotalPages(Math.ceil(total / 12))
    } catch (e) {
      console.error('Error fetching books:', e)
      setBooks([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBooks(pageFromUrl, sortFromUrl, orderFromUrl, appliedCrit)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageFromUrl, sortFromUrl, orderFromUrl, appliedCrit])

  useEffect(() => {
    sessionStorage.setItem('booksPageUrl', window.location.pathname + window.location.search)
  }, [searchParams])

  const goToPage = useCallback((page) => {
    updateParams({ page: page === 1 ? null : page })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [updateParams])

  const handleSort = useCallback((field) => {
    const newOrder = sortFromUrl === field ? (orderFromUrl === 'DESC' ? 'ASC' : 'DESC') : 'DESC'
    updateParams({ sortField: field, sortOrder: newOrder, page: null })
  }, [sortFromUrl, orderFromUrl, updateParams])

  const handleChange  = useCallback((f, v) => setCrit(p => ({ ...p, [f]: v })), [])
  const handleApply   = useCallback(() => { setAppliedCrit({ ...crit }); updateParams({ page: null }) }, [crit, updateParams])
  const handleReset   = useCallback(() => { setCrit(EMPTY_CRIT); setAppliedCrit(EMPTY_CRIT); updateParams({ page: null }) }, [updateParams])
  const removeFilter  = useCallback((key) => {
    const nc = { ...crit, [key]: '' }; const na = { ...appliedCrit, [key]: '' }
    setCrit(nc); setAppliedCrit(na)
  }, [crit, appliedCrit])

  const breadcrumbs      = [{ name: 'Beranda', url: '/' }, { name: 'Koleksi Buku', url: '#' }]
  const collectionSchema = generateCollectionPageStructuredData(
    'books', books.map(b => ({ ...b, slug: b.slug || b.id })), pageFromUrl, totalBooks, 12
  )
  const breadcrumbSchema = generateBreadcrumbStructuredData(breadcrumbs)
  const pageTitle        = appliedCrit.searchTitle ? `${appliedCrit.searchTitle} - Koleksi Buku` : `Koleksi Ebook - Halaman ${pageFromUrl}`
  const pageDescription  = appliedCrit.searchTitle
    ? `Hasil pencarian "${appliedCrit.searchTitle}" — Temukan buku di perpustakaan digital kami`
    : `Jelajahi ${totalBooks.toLocaleString('id-ID')} buku digital gratis. Halaman ${pageFromUrl} dari ${totalPages}.`
  const pageUrl  = pageFromUrl > 1 ? `/buku?page=${pageFromUrl}` : '/buku'
  const prevUrl  = pageFromUrl > 1 ? (pageFromUrl === 2 ? '/buku' : `/buku?page=${pageFromUrl - 1}`) : null
  const nextUrl  = pageFromUrl < totalPages ? `/buku?page=${pageFromUrl + 1}` : null

  const paginationPages = (() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const pages = new Set([1, totalPages, pageFromUrl])
    for (let i = Math.max(2, pageFromUrl - 1); i <= Math.min(totalPages - 1, pageFromUrl + 1); i++) pages.add(i)
    return [...pages].sort((a, b) => a - b)
  })()

  return (
    <>
      <SEO title={pageTitle} description={pageDescription} url={pageUrl} type="website"
        keywords="koleksi buku, perpustakaan digital, buku gratis, domain publik, baca buku online"
        structuredData={[collectionSchema, breadcrumbSchema]} prevUrl={prevUrl} nextUrl={nextUrl} />

      {/*
        ══════════════════════════════════════════════════════════════
        LIGHT MODE PALETTE:
          Background  : stone-50     (#fafaf9) — warm off-white
          Surface     : white        (#ffffff) — bersih
          Border      : stone-200    (#e7e5e4) — subtle warm
          Text primary: stone-900    (#1c1917)
          Text muted  : stone-500    (#78716c)
          Accent bg   : amber-50/60  — warm honey tint
          CTA         : amber-500    (#f59e0b)

        DARK MODE PALETTE:
          Background  : slate-950    (#020617) — near-black cool blue
          Surface     : slate-900    (#0f172a) — deep navy
          Border      : slate-700    (#334155) — visible but subtle
          Text primary: slate-50     (#f8fafc)
          Text muted  : slate-400    (#94a3b8)
          Accent bg   : slate-800    (#1e293b)
          CTA         : amber-500    (#f59e0b) — tetap amber, kontras kuat
        ══════════════════════════════════════════════════════════════
      */}
      <div className="min-h-screen py-4 sm:py-8 transition-colors duration-300
                      bg-stone-50 dark:bg-slate-950">

        <div className="container mx-auto px-3 sm:px-4 max-w-7xl">

          {/* Back button */}
          <button onClick={() => navigate('/')}
            className="flex items-center gap-2 mb-4 sm:mb-6 group transition-colors text-sm font-medium
                       text-stone-500 hover:text-stone-900
                       dark:text-slate-500 dark:hover:text-slate-100">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Kembali ke Beranda
          </button>

          {/* ── Page header ───────────────────────────────────────────── */}
          <header className="mb-6 sm:mb-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1.5">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold transition-colors
                                 text-stone-900 dark:text-slate-50">
                    Koleksi Buku Digital <em>(eBook)</em>
                  </h1>
                </div>
                <p className="text-sm sm:text-base transition-colors
                              text-stone-500 dark:text-slate-400">
                  {loading ? 'Memuat koleksi…' : (
                    <>
                      <span className="font-semibold text-stone-800 dark:text-slate-200">
                        {totalBooks.toLocaleString('id-ID')}
                      </span>{' '}buku tersedia
                    </>
                  )}
                </p>
              </div>

              {/* Page indicator
                  LIGHT: bg-white border-stone-200 shadow-sm — crisp card
                  DARK:  bg-slate-900 border-slate-700 — deep panel */}
              {totalPages > 1 && (
                <div className="hidden sm:flex flex-col items-end px-4 py-2.5 rounded-xl border flex-shrink-0 transition-colors
                                bg-white border-stone-200 shadow-sm
                                dark:bg-slate-900 dark:border-slate-700 dark:shadow-none">
                  <span className="text-[10px] uppercase tracking-widest font-medium
                                   text-stone-400 dark:text-slate-500">Halaman</span>
                  <span className="text-xl font-bold text-stone-800 dark:text-slate-200">
                    {pageFromUrl}
                    <span className="text-sm font-normal text-stone-400 dark:text-slate-500"> / {totalPages}</span>
                  </span>
                </div>
              )}
            </div>
          </header>

          {/* ── Search & controls ──────────────────────────────────────── */}
          <div className="mb-4 space-y-3">
            <div className="flex items-stretch gap-2 h-10">

              {/* Search input
                  LIGHT: bg-white border-stone-200 shadow-sm
                  DARK:  bg-slate-900 border-slate-700 */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none
                                   text-stone-400 dark:text-slate-500" />
                <input type="text" placeholder="Cari judul buku…"
                  value={crit.searchTitle}
                  onChange={(e) => handleChange('searchTitle', e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                  className="h-full w-full pl-10 pr-8 text-sm rounded-xl transition-all focus:outline-none
                             border border-stone-200 bg-white text-stone-900 placeholder-stone-400
                             shadow-sm focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400
                             dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500
                             dark:shadow-none dark:focus:ring-amber-500/40 dark:focus:border-amber-500/60"
                />
                {crit.searchTitle && (
                  <button onClick={() => { handleChange('searchTitle', ''); handleApply() }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 transition-colors
                               text-stone-400 hover:text-stone-700
                               dark:text-slate-500 dark:hover:text-slate-300">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Cari — amber solid di kedua mode */}
              <button onClick={handleApply}
                className="flex-shrink-0 flex items-center gap-1.5 px-4 rounded-xl text-sm font-semibold
                           transition-all bg-amber-500 hover:bg-amber-400 text-white
                           shadow-sm shadow-amber-200/80 hover:shadow-md
                           dark:shadow-amber-900/30">
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Cari</span>
              </button>

              {/* Urutkan */}
              <button onClick={() => setShowSort(!showSort)}
                className={`${ctrlBtnBase} ${showSort ? ctrlBtnOn : ctrlBtnOff}`}>
                <ArrowUpDown className="w-4 h-4" />
                <span className="hidden sm:inline">Urutkan</span>
              </button>

              {/* Filter */}
              <button onClick={() => setShowAdv(!showAdv)}
                className={`${ctrlBtnBase} ${showAdv ? ctrlBtnOn : ctrlBtnOff}`}>
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Filter</span>
                {activeFilters.length > 0 && (
                  <span className="flex-shrink-0 w-4 h-4 rounded-full text-[10px] font-bold
                                   flex items-center justify-center bg-white text-amber-600">
                    {activeFilters.length}
                  </span>
                )}
              </button>
            </div>

            {/* Active filter pills */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs text-stone-400 dark:text-slate-500">Filter aktif:</span>
                {activeFilters.map(f => (
                  <FilterPill key={f.key} label={f.label} onRemove={() => removeFilter(f.key)} />
                ))}
                <button onClick={handleReset}
                  className="text-xs font-medium underline transition-colors
                             text-red-500 hover:text-red-700
                             dark:text-red-400 dark:hover:text-red-300">
                  Hapus semua
                </button>
              </div>
            )}

            {/* Sort panel
                LIGHT: bg-white border-stone-200 shadow-stone-100
                DARK:  bg-slate-900 border-slate-700 shadow-black/50 */}
            {showSort && (
              <div className="rounded-2xl p-4 border shadow-lg transition-colors
                              bg-white border-stone-200 shadow-stone-100/80
                              dark:bg-slate-900 dark:border-slate-700 dark:shadow-black/50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2
                                 text-stone-600 dark:text-slate-400">
                    <ArrowUpDown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    Urutkan berdasarkan
                  </h3>
                  <button onClick={() => setShowSort(false)}
                    className="p-1 rounded-lg transition-all
                               text-stone-400 hover:text-stone-700 hover:bg-stone-100
                               dark:text-slate-500 dark:hover:text-slate-200 dark:hover:bg-slate-800">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SORTS.map(o => (
                    <SortBtn key={o.v} opt={o} active={sortFromUrl === o.v}
                      order={orderFromUrl} loading={loading} onClick={() => handleSort(o.v)} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Filter panel */}
          {showAdv && (
            <FilterPanel crit={crit} onChange={handleChange}
              onApply={() => { handleApply(); setShowAdv(false) }}
              onReset={handleReset} onClose={() => setShowAdv(false)} />
          )}

          {/* ── Results info row ──────────────────────────────────────────
              LIGHT: bg-stone-100 text-stone-500
              DARK:  bg-slate-900 text-slate-500                        */}
          {!loading && books.length > 0 && (
            <div className="flex items-center justify-between mb-4 text-sm">
              <span className="text-stone-500 dark:text-slate-500">
                Menampilkan{' '}
                <span className="font-semibold text-stone-800 dark:text-slate-200">
                  {((pageFromUrl - 1) * 12) + 1}–{Math.min(pageFromUrl * 12, totalBooks)}
                </span>
                {' '}dari{' '}
                <span className="font-semibold text-stone-800 dark:text-slate-200">
                  {totalBooks.toLocaleString('id-ID')}
                </span>{' '}buku
              </span>
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors
                               bg-stone-100 text-stone-500
                               dark:bg-slate-900 dark:border dark:border-slate-700/60 dark:text-slate-500">
                Diurutkan:{' '}
                <span className="font-medium text-stone-700 dark:text-slate-300 inline-flex items-center gap-0.5">
                  {SORTS.find(s => s.v === sortFromUrl)?.l || sortFromUrl}
                  {orderFromUrl === 'DESC' ? ' ↓' : ' ↑'}
                </span>
              </span>
            </div>
          )}

          {/* ── Book grid ─────────────────────────────────────────────── */}
          <BookGrid books={books} loading={loading} skeletonCount={12} />

          {/* ── Pagination ────────────────────────────────────────────────
              LIGHT: bg-white border-stone-200 shadow-sm
              DARK:  bg-slate-900 border-slate-700                      */}
          {totalPages > 1 && !loading && (
            <nav className="mt-10 flex flex-row flex-wrap items-center justify-center gap-2"
              aria-label="Navigasi halaman">

              {/* Prev */}
              <button onClick={() => goToPage(pageFromUrl - 1)} disabled={pageFromUrl === 1}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium
                           border transition-all disabled:opacity-40 disabled:pointer-events-none
                           bg-white border-stone-200 text-stone-600 shadow-sm
                           hover:border-amber-400 hover:text-amber-600
                           dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400 dark:shadow-none
                           dark:hover:border-amber-500/70 dark:hover:text-amber-400">
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
                                         text-stone-300 dark:text-slate-600">…</span>
                      )}
                      <button onClick={() => goToPage(p)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-all
                          ${p === pageFromUrl
                            ? 'bg-amber-500 text-white shadow-md shadow-amber-200/80 dark:shadow-amber-900/50'
                            : `bg-white border border-stone-200 text-stone-600
                               hover:border-amber-400 hover:text-amber-600
                               dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400
                               dark:hover:border-amber-500/70 dark:hover:text-amber-400`
                          }`}>
                        {p}
                      </button>
                    </span>
                  )
                })}
              </div>

              <PageInput currentPage={pageFromUrl} totalPages={totalPages}
                onGo={goToPage} disabled={loading} />

              {/* Next */}
              <button onClick={() => goToPage(pageFromUrl + 1)} disabled={pageFromUrl === totalPages}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium
                           border transition-all disabled:opacity-40 disabled:pointer-events-none
                           bg-white border-stone-200 text-stone-600 shadow-sm
                           hover:border-amber-400 hover:text-amber-600
                           dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400 dark:shadow-none
                           dark:hover:border-amber-500/70 dark:hover:text-amber-400">
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

export default BooksPage
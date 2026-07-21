import { useState, useEffect, useCallback, memo, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import zineService from '../services/zineService'
import ZineGrid from '../components/Zine/ZineGrid'
import SEO from '../components/Common/SEO'
import {
  Search, SlidersHorizontal, X, ArrowUpDown, ArrowUp, ArrowDown,
  ArrowLeft, ChevronLeft, ChevronRight, BookOpen
} from 'lucide-react'

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
  { v: 'totalPages',        l: 'Halaman'    },
]

const EMPTY_CRIT = {
  searchTitle: '', authorName: '', genre: '', volume: '',
  minChapters: '', maxChapters: '', publicationYearFrom: '', publicationYearTo: '',
  isFeatured: '', languageId: '', minRating: '', minViewCount: '', minReadCount: ''
}

const FILTER_LABELS = {
  authorName: 'Penulis', genre: 'Genre', volume: 'Volume',
  isFeatured: 'Status', languageId: 'Bahasa', minRating: 'Min Rating',
  minChapters: 'Hal Min', maxChapters: 'Hal Maks',
  publicationYearFrom: 'Tahun Dari', publicationYearTo: 'Tahun Sampai',
  minViewCount: 'Min Views', minReadCount: 'Min Dibaca',
}

const inputCls = `
  w-full px-3 py-2 rounded-lg text-sm transition-all focus:outline-none
  border border-stone-200 bg-white text-stone-800 placeholder-stone-400
  focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400
  dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500
  dark:focus:ring-emerald-500/40 dark:focus:border-emerald-500/60
`

const Sel = memo(({ val, onChange, opts, ph }) => (
  <select value={val} onChange={onChange} className={inputCls}>
    <option value="">{ph}</option>
    {opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
  </select>
))

const FilterPanel = memo(({ crit, onChange, onApply, onReset, onClose }) => (
  <div className="mb-6 p-4 sm:p-5 rounded-2xl border shadow-lg transition-colors
                  bg-emerald-50/60 border-emerald-200 shadow-emerald-100/60
                  dark:bg-slate-900 dark:border-slate-700 dark:shadow-black/50">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-bold flex items-center gap-2 text-stone-800 dark:text-slate-100">
        <SlidersHorizontal className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        Filter Lanjutan
      </h3>
      <button onClick={onClose}
        className="p-1.5 rounded-lg transition-all text-stone-400 hover:text-stone-700 hover:bg-emerald-100
                   dark:text-slate-500 dark:hover:text-slate-200 dark:hover:bg-slate-800">
        <X className="w-4 h-4" />
      </button>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {[
        { ph: 'Nama penulis...', f: 'authorName' },
        { ph: 'Genre / kategori...', f: 'genre' },
        { ph: 'Volume (misal: 1)', f: 'volume' },
      ].map(({ ph, f }) => (
        <input key={f} placeholder={ph} value={crit[f]}
          onChange={(e) => onChange(f, e.target.value)} className={inputCls} />
      ))}
      <Sel val={crit.isFeatured} onChange={(e) => onChange('isFeatured', e.target.value)}
        ph="Status" opts={[{ v:'true',l:'Pilihan Editor' },{ v:'false',l:'Reguler' }]} />
      <Sel val={crit.languageId} onChange={(e) => onChange('languageId', e.target.value)}
        ph="Bahasa" opts={[{ v:'1',l:'Bahasa Indonesia' },{ v:'2',l:'English' },{ v:'3',l:'Jawa' }]} />
      <Sel val={crit.minRating} onChange={(e) => onChange('minRating', e.target.value)}
        ph="Rating Minimum"
        opts={[{ v:'4.5',l:'4.5+ ⭐ Luar Biasa' },{ v:'4.0',l:'4.0+ ⭐ Sangat Bagus' },{ v:'3.5',l:'3.5+ ⭐ Bagus' }]} />
      {[
        [{ ph:'Tahun dari', f:'publicationYearFrom' }, { ph:'Tahun sampai', f:'publicationYearTo' }],
        [{ ph:'Min Views', f:'minViewCount' }, { ph:'Min Dibaca', f:'minReadCount' }],
      ].map((pair, i) => (
        <div key={i} className="flex gap-2">
          {pair.map(({ ph, f }) => (
            <input key={f} type="number" placeholder={ph} value={crit[f]}
              onChange={(e) => onChange(f, e.target.value)} className={inputCls} />
          ))}
        </div>
      ))}
    </div>
    <div className="flex gap-2 mt-4 pt-4 border-t border-emerald-200 dark:border-slate-700">
      <button onClick={onApply}
        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                   text-sm font-semibold transition-all
                   bg-emerald-500 hover:bg-emerald-400 text-white
                   shadow-sm shadow-emerald-200/80 hover:shadow-md dark:shadow-emerald-900/30">
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

const SortBtn = memo(({ opt, active, order, loading, onClick }) => (
  <button onClick={onClick} disabled={loading}
    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                transition-all duration-200 disabled:opacity-50 whitespace-nowrap
                ${active
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200/80 dark:shadow-emerald-900/50'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-800 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200'
                }`}>
    {opt.l}
    {active
      ? order === 'DESC' ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />
      : <ArrowUpDown className="w-3 h-3 opacity-30" />}
  </button>
))

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
      <input ref={inputRef} type="number" min={1} max={totalPages} value={val} disabled={disabled}
        onChange={(e) => setVal(e.target.value)} onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && (commit(), inputRef.current?.blur())}
        className="w-14 px-2 py-1.5 text-center text-xs rounded-lg transition-all focus:outline-none
                   border border-stone-200 bg-white text-stone-800
                   focus:ring-2 focus:ring-emerald-400/50 disabled:opacity-50
                   dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:focus:ring-emerald-500/40" />
      <span className="text-xs whitespace-nowrap text-stone-400 dark:text-slate-500">dari {totalPages}</span>
    </div>
  )
})
PageInput.displayName = 'PageInput'

const FilterPill = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full text-xs font-medium
                   bg-emerald-100 border border-emerald-300 text-emerald-800
                   dark:bg-emerald-900/20 dark:border-emerald-700/50 dark:text-emerald-300">
    {label}
    <button onClick={onRemove}
      className="w-3.5 h-3.5 rounded-full flex items-center justify-center transition-colors
                 hover:bg-emerald-200 dark:hover:bg-emerald-800/60">
      <X className="w-2.5 h-2.5" />
    </button>
  </span>
)

const ctrlBtnBase = `flex-shrink-0 flex items-center gap-1.5 px-3 rounded-xl text-sm font-medium border transition-all`
const ctrlBtnOff  = `bg-white border-stone-200 text-stone-600 hover:border-emerald-300 hover:text-emerald-700 shadow-sm
                     dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:border-emerald-600 dark:hover:text-emerald-400 dark:shadow-none`
const ctrlBtnOn   = `bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-200/80 dark:shadow-emerald-900/40`

const ZinesPage = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const pageFromUrl  = parseInt(searchParams.get('page') || '1', 10)
  const sortFromUrl  = searchParams.get('sortField') || 'updateAt'
  const orderFromUrl = searchParams.get('sortOrder') || 'DESC'

  const [zines,       setZines]       = useState([])
  const [loading,     setLoading]     = useState(true)
  const [totalPages,  setTotalPages]  = useState(1)
  const [totalZines,  setTotalZines]  = useState(0)
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

  const fetchZines = useCallback(async (page, sortField, sortOrder, criteria) => {
    try {
      setLoading(true)
      const params = {
        page, limit: 12, sortField, sortOrder,
        ...Object.fromEntries(Object.entries(criteria).filter(([, v]) => v))
      }
      const res = await zineService.getZines(params)
      setZines(res.data?.data || [])
      const total = res.data?.total || 0
      setTotalZines(total)
      setTotalPages(Math.ceil(total / 12))
    } catch (e) {
      console.error('Error fetching zines:', e)
      setZines([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchZines(pageFromUrl, sortFromUrl, orderFromUrl, appliedCrit)
    // eslint-disable-next-line
  }, [pageFromUrl, sortFromUrl, orderFromUrl, appliedCrit])

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

  const paginationPages = (() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const pages = new Set([1, totalPages, pageFromUrl])
    for (let i = Math.max(2, pageFromUrl - 1); i <= Math.min(totalPages - 1, pageFromUrl + 1); i++) pages.add(i)
    return [...pages].sort((a, b) => a - b)
  })()

  return (
    <>
      <SEO
        title={`Koleksi Zine & Majalah Digital — Halaman ${pageFromUrl}`}
        description={`Jelajahi ${totalZines.toLocaleString('id-ID')} zine dan majalah digital gratis. Halaman ${pageFromUrl} dari ${totalPages}.`}
        url={pageFromUrl > 1 ? `/zine?page=${pageFromUrl}` : '/zine'}
        type="website"
        keywords="zine, majalah digital, perpustakaan digital, bacaan gratis, domain publik"
      />

      <div className="min-h-screen py-4 sm:py-8 transition-colors duration-300
                      bg-stone-50 dark:bg-slate-950">
        <div className="container mx-auto px-3 sm:px-4 max-w-7xl">

          {/* Back */}
          <button onClick={() => navigate('/')}
            className="flex items-center gap-2 mb-4 sm:mb-6 group transition-colors text-sm font-medium
                       text-stone-500 hover:text-stone-900 dark:text-slate-500 dark:hover:text-slate-100">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Kembali ke Beranda
          </button>

          {/* Header */}
          <header className="mb-6 sm:mb-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  {/* Zine icon badge */}
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-md shadow-emerald-200/60 dark:shadow-emerald-900/40">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold transition-colors
                                 text-stone-900 dark:text-slate-50">
                    Zine &amp; Majalah Digital
                  </h1>
                </div>
                <p className="text-sm sm:text-base transition-colors text-stone-500 dark:text-slate-400">
                  {loading ? 'Memuat koleksi…' : (
                    <>
                      <span className="font-semibold text-stone-800 dark:text-slate-200">
                        {totalZines.toLocaleString('id-ID')}
                      </span>{' '}zine tersedia
                    </>
                  )}
                </p>
              </div>

              {totalPages > 1 && (
                <div className="hidden sm:flex flex-col items-end px-4 py-2.5 rounded-xl border flex-shrink-0 transition-colors
                                bg-white border-stone-200 shadow-sm dark:bg-slate-900 dark:border-slate-700 dark:shadow-none">
                  <span className="text-[10px] uppercase tracking-widest font-medium text-stone-400 dark:text-slate-500">Halaman</span>
                  <span className="text-xl font-bold text-stone-800 dark:text-slate-200">
                    {pageFromUrl}
                    <span className="text-sm font-normal text-stone-400 dark:text-slate-500"> / {totalPages}</span>
                  </span>
                </div>
              )}
            </div>
          </header>

          {/* Controls */}
          <div className="mb-4 space-y-3">
            <div className="flex items-stretch gap-2 h-10">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-stone-400 dark:text-slate-500" />
                <input type="text" placeholder="Cari judul zine…"
                  value={crit.searchTitle}
                  onChange={(e) => handleChange('searchTitle', e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                  className="h-full w-full pl-10 pr-8 text-sm rounded-xl transition-all focus:outline-none
                             border border-stone-200 bg-white text-stone-900 placeholder-stone-400
                             shadow-sm focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400
                             dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500
                             dark:shadow-none dark:focus:ring-emerald-500/40 dark:focus:border-emerald-500/60" />
                {crit.searchTitle && (
                  <button onClick={() => { handleChange('searchTitle', ''); handleApply() }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 transition-colors
                               text-stone-400 hover:text-stone-700 dark:text-slate-500 dark:hover:text-slate-300">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {/* Cari */}
              <button onClick={handleApply}
                className="flex-shrink-0 flex items-center gap-1.5 px-4 rounded-xl text-sm font-semibold
                           transition-all bg-emerald-500 hover:bg-emerald-400 text-white
                           shadow-sm shadow-emerald-200/80 hover:shadow-md dark:shadow-emerald-900/30">
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
                                   flex items-center justify-center bg-white text-emerald-600">
                    {activeFilters.length}
                  </span>
                )}
              </button>
            </div>

            {/* Active pills */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs text-stone-400 dark:text-slate-500">Filter aktif:</span>
                {activeFilters.map(f => (
                  <FilterPill key={f.key} label={f.label} onRemove={() => removeFilter(f.key)} />
                ))}
                <button onClick={handleReset}
                  className="text-xs font-medium underline transition-colors text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                  Hapus semua
                </button>
              </div>
            )}

            {/* Sort panel */}
            {showSort && (
              <div className="rounded-2xl p-4 border shadow-lg transition-colors
                              bg-white border-stone-200 shadow-stone-100/80
                              dark:bg-slate-900 dark:border-slate-700 dark:shadow-black/50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2
                                 text-stone-600 dark:text-slate-400">
                    <ArrowUpDown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Urutkan berdasarkan
                  </h3>
                  <button onClick={() => setShowSort(false)}
                    className="p-1 rounded-lg transition-all text-stone-400 hover:text-stone-700 hover:bg-stone-100
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

          {/* Results info */}
          {!loading && zines.length > 0 && (
            <div className="flex items-center justify-between mb-4 text-sm">
              <span className="text-stone-500 dark:text-slate-500">
                Menampilkan{' '}
                <span className="font-semibold text-stone-800 dark:text-slate-200">
                  {((pageFromUrl - 1) * 12) + 1}–{Math.min(pageFromUrl * 12, totalZines)}
                </span>
                {' '}dari{' '}
                <span className="font-semibold text-stone-800 dark:text-slate-200">
                  {totalZines.toLocaleString('id-ID')}
                </span>{' '}volume
              </span>
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors
                               bg-stone-100 text-stone-500 dark:bg-slate-900 dark:border dark:border-slate-700/60 dark:text-slate-500">
                Diurutkan:{' '}
                <span className="font-medium text-stone-700 dark:text-slate-300 inline-flex items-center gap-0.5">
                  {SORTS.find(s => s.v === sortFromUrl)?.l || sortFromUrl}
                  {orderFromUrl === 'DESC' ? ' ↓' : ' ↑'}
                </span>
              </span>
            </div>
          )}

          {/* Grid */}
          <ZineGrid
            zines={zines}
            loading={loading}
            skeletonCount={8}
            autoGroup={true}
          />

          {/* Pagination */}
          {totalPages > 1 && !loading && (
            <nav className="mt-10 flex flex-row flex-wrap items-center justify-center gap-2"
              aria-label="Navigasi halaman">
              <button onClick={() => goToPage(pageFromUrl - 1)} disabled={pageFromUrl === 1}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium
                           border transition-all disabled:opacity-40 disabled:pointer-events-none
                           bg-white border-stone-200 text-stone-600 shadow-sm
                           hover:border-emerald-400 hover:text-emerald-600
                           dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400 dark:shadow-none
                           dark:hover:border-emerald-500/70 dark:hover:text-emerald-400">
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Sebelumnya</span>
              </button>

              <div className="hidden sm:flex items-center gap-1">
                {paginationPages.map((p, i) => {
                  const prev = paginationPages[i - 1]
                  const showEllipsis = prev && p - prev > 1
                  return (
                    <span key={p} className="flex items-center gap-1">
                      {showEllipsis && <span className="w-6 text-center text-sm text-stone-300 dark:text-slate-600">…</span>}
                      <button onClick={() => goToPage(p)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-all
                          ${p === pageFromUrl
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200/80 dark:shadow-emerald-900/50'
                            : 'bg-white border border-stone-200 text-stone-600 hover:border-emerald-400 hover:text-emerald-600 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:border-emerald-500/70 dark:hover:text-emerald-400'
                          }`}>
                        {p}
                      </button>
                    </span>
                  )
                })}
              </div>

              <PageInput currentPage={pageFromUrl} totalPages={totalPages} onGo={goToPage} disabled={loading} />

              <button onClick={() => goToPage(pageFromUrl + 1)} disabled={pageFromUrl === totalPages}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium
                           border transition-all disabled:opacity-40 disabled:pointer-events-none
                           bg-white border-stone-200 text-stone-600 shadow-sm
                           hover:border-emerald-400 hover:text-emerald-600
                           dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400 dark:shadow-none
                           dark:hover:border-emerald-500/70 dark:hover:text-emerald-400">
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

export default ZinesPage
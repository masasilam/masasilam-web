import { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import bookService from '../services/bookService'
import SEO from '../components/Common/SEO'
import {
  generateCollectionPageStructuredData,
  generateBreadcrumbStructuredData,
  combineStructuredData
} from '../utils/seoHelpers'
import {
  User, BookOpen, Search, ChevronRight, ChevronLeft,
  Calendar, MapPin, ArrowRight, ArrowLeft, X
} from 'lucide-react'

const LIMIT = 24

// ── PageInput — identik dengan BooksPage ─────────────────────────────────────
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
      <input
        ref={inputRef}
        type="number" min={1} max={totalPages}
        value={val} disabled={disabled}
        onChange={e => setVal(e.target.value)}
        onBlur={commit}
        onKeyDown={e => e.key === 'Enter' && (commit(), inputRef.current?.blur())}
        className="w-14 px-2 py-1.5 text-center text-xs rounded-lg transition-all focus:outline-none
                   border border-stone-200 bg-white text-stone-800
                   focus:ring-2 focus:ring-amber-400/50 disabled:opacity-50
                   dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200
                   dark:focus:ring-amber-500/40"
      />
      <span className="text-xs whitespace-nowrap text-stone-400 dark:text-slate-500">
        dari {totalPages}
      </span>
    </div>
  )
})
PageInput.displayName = 'PageInput'

// ── AuthorCard ────────────────────────────────────────────────────────────────
const AuthorCard = memo(({ author }) => {
  const birthYear = author.birthDate ? new Date(author.birthDate).getFullYear() : null
  const deathYear = author.deathDate ? new Date(author.deathDate).getFullYear() : null

  return (
    <Link
      to={`/penulis/${author.slug}`}
      aria-label={`Lihat profil ${author.name}`}
      className="group bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border
                 border-stone-200 dark:border-slate-800
                 hover:border-amber-400 dark:hover:border-amber-500
                 hover:shadow-lg hover:shadow-amber-100/50 dark:hover:shadow-amber-900/10
                 transition-all duration-200 flex gap-4 items-center"
    >
      {/* Avatar */}
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden flex-shrink-0
                      bg-gradient-to-br from-amber-100 to-amber-200
                      dark:from-amber-900/30 dark:to-slate-800
                      border border-amber-200/60 dark:border-amber-800/40
                      flex items-center justify-center">
        {author.photoUrl ? (
          <img
            src={author.photoUrl}
            alt={author.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <User className="w-7 h-7 sm:w-8 sm:h-8 text-amber-400 dark:text-amber-600" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h2 className="font-serif text-sm sm:text-base font-bold leading-snug line-clamp-1 mb-1
                       text-stone-900 dark:text-slate-100
                       group-hover:text-amber-700 dark:group-hover:text-amber-400
                       transition-colors capitalize">
          {author.name}
        </h2>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1.5
                        text-xs text-stone-400 dark:text-slate-500">
          {birthYear && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 flex-shrink-0" />
              {birthYear}{deathYear ? `–${deathYear}` : ''}
            </span>
          )}
          {author.nationality && (
            <span className="flex items-center gap-1">
              🌍 {author.nationality}
            </span>
          )}
          {author.birthPlace && (
            <span className="flex items-center gap-1 min-w-0">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{author.birthPlace}</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold
                        text-amber-600 dark:text-amber-400">
          <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
          {author.totalBooks || 0} buku
        </div>
      </div>

      <ArrowRight className="w-4 h-4 flex-shrink-0 self-center
                             text-stone-300 dark:text-slate-600
                             group-hover:text-amber-500 group-hover:translate-x-0.5
                             transition-all" />
    </Link>
  )
})
AuthorCard.displayName = 'AuthorCard'

// ── SkeletonCard ──────────────────────────────────────────────────────────────
const SkeletonCard = memo(() => (
  <div className="animate-pulse bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border
                  border-stone-200 dark:border-slate-800 flex gap-4 items-center"
       aria-hidden="true">
    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex-shrink-0
                    bg-stone-200 dark:bg-slate-700" />
    <div className="flex-1 space-y-2.5">
      <div className="h-4 rounded-full w-2/3 bg-stone-200 dark:bg-slate-700" />
      <div className="h-3 rounded-full w-1/2 bg-stone-200 dark:bg-slate-700" />
      <div className="h-3 rounded-full w-1/4 bg-stone-200 dark:bg-slate-700" />
    </div>
  </div>
))
SkeletonCard.displayName = 'SkeletonCard'

// ── Main Page ─────────────────────────────────────────────────────────────────
const AuthorsPage = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const pageFromUrl = parseInt(searchParams.get('page') || '1', 10)

  const [authors,      setAuthors]      = useState([])
  const [loading,      setLoading]      = useState(true)
  const [totalAuthors, setTotalAuthors] = useState(0)
  const [totalPages,   setTotalPages]   = useState(1)
  const [searchTerm,   setSearchTerm]   = useState('')
  const [sortBy,       setSortBy]       = useState('name-asc')

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchAuthors = async () => {
      setLoading(true)
      try {
        const { data } = await bookService.getAuthors(pageFromUrl, LIMIT)
        setAuthors(data?.list || [])
        setTotalAuthors(data?.total || 0)
        setTotalPages(Math.ceil((data?.total || 0) / LIMIT))
      } catch (err) {
        console.error('Error fetching authors:', err)
        setAuthors([])
      } finally {
        setLoading(false)
      }
    }
    fetchAuthors()
  }, [pageFromUrl])

  // ── Navigation ─────────────────────────────────────────────────────────────
  const goToPage = useCallback((page) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (page === 1) next.delete('page')
      else next.set('page', String(page))
      return next
    }, { replace: false })
    // ScrollToTop di App.jsx handle scroll otomatis — tidak perlu window.scrollTo
  }, [setSearchParams])

  // ── Client-side filter + sort ──────────────────────────────────────────────
  const sorted = useMemo(() => {
    let list = authors.filter(a =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    switch (sortBy) {
      case 'name-desc':  return list.sort((a, b) => b.name.localeCompare(a.name))
      case 'books-desc': return list.sort((a, b) => (b.totalBooks || 0) - (a.totalBooks || 0))
      case 'books-asc':  return list.sort((a, b) => (a.totalBooks || 0) - (b.totalBooks || 0))
      default:           return list.sort((a, b) => a.name.localeCompare(b.name))
    }
  }, [authors, searchTerm, sortBy])

  // ── Smart pagination numbers (identik BooksPage) ───────────────────────────
  const paginationPages = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const pages = new Set([1, totalPages, pageFromUrl])
    for (let i = Math.max(2, pageFromUrl - 1); i <= Math.min(totalPages - 1, pageFromUrl + 1); i++) {
      pages.add(i)
    }
    return [...pages].sort((a, b) => a - b)
  }, [totalPages, pageFromUrl])

  // ── SEO ────────────────────────────────────────────────────────────────────
  const breadcrumbs = [{ name: 'Beranda', url: '/' }, { name: 'Daftar Penulis', url: '#' }]
  const pageUrl     = pageFromUrl > 1 ? `/penulis?page=${pageFromUrl}` : '/penulis'
  const prevUrl     = pageFromUrl > 1 ? (pageFromUrl === 2 ? '/penulis' : `/penulis?page=${pageFromUrl - 1}`) : null
  const nextUrl     = pageFromUrl < totalPages ? `/penulis?page=${pageFromUrl + 1}` : null

  const structuredData = combineStructuredData(
    generateBreadcrumbStructuredData(breadcrumbs),
    generateCollectionPageStructuredData('authors', authors, pageFromUrl, totalAuthors, LIMIT)
  )

  const sortOptions = [
    { value: 'name-asc',   label: 'Nama A–Z'        },
    { value: 'name-desc',  label: 'Nama Z–A'        },
    { value: 'books-desc', label: 'Buku Terbanyak'  },
    { value: 'books-asc',  label: 'Buku Tersedikit' },
  ]

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <SEO
        title={`Daftar Penulis Buku Domain Publik — MasasilaM`}
        description={`Jelajahi ${totalAuthors} penulis buku klasik domain publik. Temukan karya-karya terbaik dari penulis Indonesia dan dunia.`}
        url={pageUrl}
        type="website"
        keywords="daftar penulis, penulis buku klasik, penulis domain publik, penulis indonesia, biografi penulis"
        structuredData={structuredData}
        prevUrl={prevUrl}
        nextUrl={nextUrl}
        canonical={`https://masasilam.com${pageUrl}`}
      />

      <div className="min-h-screen bg-stone-50 dark:bg-slate-950 transition-colors duration-300">

        {/* ── HERO ──────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-white dark:bg-slate-950
                            border-b border-stone-200 dark:border-slate-800
                            py-10 sm:py-14">
          <div className="pointer-events-none absolute inset-0 flex items-start justify-center overflow-hidden">
            <div className="w-[600px] h-[400px] rounded-full bg-amber-100/40 dark:bg-amber-900/10 blur-3xl -translate-y-1/2" />
          </div>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-amber-400 via-emerald-400 to-blue-400 opacity-60" />

          <div className="relative container mx-auto px-4 sm:px-6 max-w-5xl">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs text-stone-400 dark:text-slate-500 mb-5"
                 aria-label="Breadcrumb">
              <Link to="/" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                Beranda
              </Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-stone-600 dark:text-slate-300 font-medium">Penulis</span>
            </nav>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest
                                text-amber-700 dark:text-amber-400
                                bg-amber-50 dark:bg-amber-900/20
                                px-3.5 py-1.5 rounded-full mb-4
                                border border-amber-200 dark:border-amber-800/40">
                  <User className="w-3.5 h-3.5" /> Penulis
                </div>
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight
                               text-stone-900 dark:text-white">
                  Daftar Penulis
                </h1>
                <p className="text-stone-500 dark:text-slate-400 text-sm sm:text-base mt-2">
                  Jelajahi{' '}
                  <span className="font-semibold text-stone-800 dark:text-slate-200">
                    {totalAuthors.toLocaleString('id-ID')}
                  </span>{' '}
                  penulis dan karya-karya terbaik mereka
                </p>
              </div>

              {/* Page indicator (tampil kalau > 1 halaman) */}
              {totalPages > 1 && (
                <div className="hidden sm:flex flex-col items-end px-4 py-2.5 rounded-xl border flex-shrink-0
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
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">

          {/* ── BACK + CONTROLS ───────────────────────────────────── */}
          <div className="mt-6 space-y-3">
            {/* Back button */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 group text-sm font-medium transition-colors
                         text-stone-500 hover:text-stone-900
                         dark:text-slate-500 dark:hover:text-slate-100"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Kembali ke Beranda
            </button>

            {/* Search + Sort */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none
                                   text-stone-400 dark:text-slate-500" />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Cari penulis..."
                  aria-label="Cari penulis"
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl text-sm transition-all focus:outline-none
                             border border-stone-200 bg-white text-stone-900 placeholder-stone-400
                             shadow-sm focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400
                             dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100
                             dark:placeholder-slate-500 dark:shadow-none
                             dark:focus:ring-amber-500/40 dark:focus:border-amber-500/60"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors
                               text-stone-400 hover:text-stone-700
                               dark:text-slate-500 dark:hover:text-slate-300"
                    aria-label="Hapus pencarian"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <select
                value={sortBy}
                onChange={e => { setSortBy(e.target.value) }}
                aria-label="Urutkan penulis"
                className="px-3 py-2.5 rounded-xl text-sm transition-all focus:outline-none
                           border border-stone-200 bg-white text-stone-800 shadow-sm
                           focus:ring-2 focus:ring-amber-400/40
                           dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200
                           dark:shadow-none dark:focus:ring-amber-500/40
                           sm:min-w-[170px]"
              >
                {sortOptions.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* ── RESULTS INFO ──────────────────────────────────────── */}
          {!loading && sorted.length > 0 && (
            <div className="flex items-center justify-between mt-4 mb-2 text-sm">
              <span className="text-stone-500 dark:text-slate-500">
                Menampilkan{' '}
                <span className="font-semibold text-stone-800 dark:text-slate-200">
                  {((pageFromUrl - 1) * LIMIT) + 1}–{Math.min(pageFromUrl * LIMIT, totalAuthors)}
                </span>
                {' '}dari{' '}
                <span className="font-semibold text-stone-800 dark:text-slate-200">
                  {totalAuthors.toLocaleString('id-ID')}
                </span>{' '}penulis
              </span>
            </div>
          )}

          {/* ── GRID ──────────────────────────────────────────────── */}
          <section className="mt-2 mb-4" aria-label="Daftar penulis">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Array.from({ length: 8 }, (_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : sorted.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-slate-800
                                flex items-center justify-center mx-auto mb-4">
                  <User className="w-7 h-7 text-stone-300 dark:text-slate-600" />
                </div>
                <p className="font-semibold text-stone-600 dark:text-slate-400 mb-1">
                  {searchTerm ? 'Penulis tidak ditemukan' : 'Belum ada penulis'}
                </p>
                {searchTerm && (
                  <p className="text-sm text-stone-400 dark:text-slate-500">Coba kata kunci lain</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sorted.map(author => (
                  <AuthorCard key={author.id} author={author} />
                ))}
              </div>
            )}
          </section>

          {/* ── PAGINATION — identik dengan BooksPage ─────────────── */}
          {totalPages > 1 && !loading && (
            <nav
              className="mt-8 mb-16 flex flex-row flex-wrap items-center justify-center gap-2"
              aria-label="Navigasi halaman"
            >
              {/* Prev */}
              <button
                onClick={() => goToPage(pageFromUrl - 1)}
                disabled={pageFromUrl === 1}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium
                           border transition-all disabled:opacity-40 disabled:pointer-events-none
                           bg-white border-stone-200 text-stone-600 shadow-sm
                           hover:border-amber-400 hover:text-amber-600
                           dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400
                           dark:shadow-none dark:hover:border-amber-500/70 dark:hover:text-amber-400"
              >
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
                      <button
                        onClick={() => goToPage(p)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-all
                          ${p === pageFromUrl
                            ? 'bg-amber-500 text-white shadow-md shadow-amber-200/80 dark:shadow-amber-900/50'
                            : `bg-white border border-stone-200 text-stone-600
                               hover:border-amber-400 hover:text-amber-600
                               dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400
                               dark:hover:border-amber-500/70 dark:hover:text-amber-400`
                          }`}
                      >
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
                           bg-white border-stone-200 text-stone-600 shadow-sm
                           hover:border-amber-400 hover:text-amber-600
                           dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400
                           dark:shadow-none dark:hover:border-amber-500/70 dark:hover:text-amber-400"
              >
                <span className="hidden sm:inline">Selanjutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </nav>
          )}

          {(!totalPages || totalPages <= 1) && <div className="pb-16" />}
        </div>
      </div>
    </>
  )
}

export default AuthorsPage
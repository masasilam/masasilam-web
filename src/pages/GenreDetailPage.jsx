import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import bookService from '../services/bookService'
import BookCard from '../components/Book/BookCard'
import LoadingSpinner from '../components/Common/LoadingSpinner'
import SEO from '../components/Common/SEO'
import {
  generateCollectionPageStructuredData,
  generateBreadcrumbStructuredData,
  combineStructuredData,
  generateMetaDescription,
} from '../utils/seoHelpers'
import { BookOpen, ChevronRight, Home, ChevronLeft, ArrowUpDown, Tag } from 'lucide-react'

const LIMIT = 24

const sortButtons = [
  { field: 'viewCount',    label: 'Terpopuler' },
  { field: 'publishedAt',  label: 'Terbaru'    },
  { field: 'averageRating', label: 'Rating'    },
  { field: 'title',        label: 'Judul'      },
]

const GenreDetailPage = () => {
  const { genreSlug }                       = useParams()
  const [genre,       setGenre]             = useState(null)
  const [books,       setBooks]             = useState([])
  const [loading,     setLoading]           = useState(true)
  const [currentPage, setCurrentPage]       = useState(1)
  const [totalPages,  setTotalPages]        = useState(1)
  const [totalBooks,  setTotalBooks]        = useState(0)
  const [sortBy,      setSortBy]            = useState('viewCount')
  const [sortOrder,   setSortOrder]         = useState('DESC')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [genresRes, booksRes] = await Promise.all([
          bookService.getGenres(true),
          bookService.getBooks({ page: currentPage, limit: LIMIT, genre: genreSlug, sortField: sortBy, sortOrder }),
        ])
        const found = genresRes.data?.find(g => g.slug?.toLowerCase() === genreSlug?.toLowerCase())
        setGenre(found || null)
        setBooks(booksRes.data?.data || [])
        setTotalPages(booksRes.data?.totalPages || 1)
        setTotalBooks(booksRes.data?.total || 0)
      } catch (err) {
        console.error('Error fetching genre data:', err)
        setGenre(null)
        setBooks([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [genreSlug, currentPage, sortBy, sortOrder])

  const handleSort = (field) => {
    setSortBy(field)
    setSortOrder(sortBy === field && sortOrder === 'DESC' ? 'ASC' : 'DESC')
    setCurrentPage(1)
  }

  const handlePage = (p) => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  // SEO
  const breadcrumbs = genre ? [
    { name: 'Beranda',  url: '/' },
    { name: 'Kategori', url: '/kategori' },
    { name: genre.name, url: '#' },
  ] : []
  const metaDescription = genre?.description
    ? generateMetaDescription(genre.description, 160)
    : `Temukan ${totalBooks} buku ${genre?.name || genreSlug} domain publik. Baca gratis di MasasilaM.`
  const pageUrl     = currentPage > 1 ? `/kategori/${genreSlug}?page=${currentPage}` : `/kategori/${genreSlug}`
  const prevUrl     = currentPage > 1 ? (currentPage === 2 ? `/kategori/${genreSlug}` : `/kategori/${genreSlug}?page=${currentPage - 1}`) : null
  const nextUrl     = currentPage < totalPages ? `/kategori/${genreSlug}?page=${currentPage + 1}` : null
  const structuredData = genre && books.length > 0
    ? combineStructuredData(generateBreadcrumbStructuredData(breadcrumbs), generateCollectionPageStructuredData('books', books, currentPage, totalBooks, LIMIT))
    : null

  if (loading) return <LoadingSpinner fullScreen />

  if (!genre) {
    return (
      <>
        <SEO title="Kategori Tidak Ditemukan" description="Halaman kategori yang Anda cari tidak tersedia" url={`/kategori/${genreSlug}`} noindex />
        <div className="min-h-screen bg-stone-50 dark:bg-slate-950 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-20 h-20 rounded-3xl bg-stone-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-5">
              <BookOpen className="w-10 h-10 text-stone-300 dark:text-slate-600" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-stone-900 dark:text-white mb-2">Kategori Tidak Ditemukan</h1>
            <p className="text-stone-500 dark:text-slate-400 mb-6 text-sm">Kategori "{genreSlug}" tidak tersedia</p>
            <Link to="/kategori" className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-stone-900 rounded-full font-semibold text-sm transition-all">
              <Home className="w-4 h-4" /> Kembali ke Kategori
            </Link>
          </div>
        </div>
      </>
    )
  }

  // Pagination pages to display
  const pagesToShow = () => {
    const pages = []
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        pages.push(i)
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        pages.push('...' + i)
      }
    }
    return pages
  }

  return (
    <>
      <SEO
        title={`${genre.name} — Koleksi Buku Domain Publik`}
        description={metaDescription}
        url={pageUrl}
        type="website"
        keywords={`${genre.name}, buku ${genre.name}, ${genre.name} gratis, domain publik, perpustakaan digital`}
        structuredData={structuredData}
        prevUrl={prevUrl}
        nextUrl={nextUrl}
        canonical={`https://masasilam.com${pageUrl}`}
      />

      <div className="min-h-screen bg-stone-50 dark:bg-slate-950 transition-colors duration-300">

        {/* ── HERO ──────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-white dark:bg-slate-950 border-b border-stone-200 dark:border-slate-800 py-14 sm:py-20">
          <div className="pointer-events-none absolute inset-0 flex items-start justify-center overflow-hidden">
            <div className="w-[500px] h-[400px] rounded-full bg-amber-100/40 dark:bg-amber-900/10 blur-3xl -translate-y-1/2" />
          </div>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-amber-400 via-emerald-400 to-blue-400 opacity-60" />

          <div className="relative container mx-auto px-4 sm:px-6 max-w-6xl">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs text-stone-400 dark:text-slate-500 mb-6 flex-wrap" aria-label="Breadcrumb">
              <Link to="/" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Beranda</Link>
              <ChevronRight className="w-3 h-3 flex-shrink-0" />
              <Link to="/kategori" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Kategori</Link>
              <ChevronRight className="w-3 h-3 flex-shrink-0" />
              <span className="text-stone-600 dark:text-slate-300 font-medium">{genre.name}</span>
            </nav>

            <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3.5 py-1.5 rounded-full mb-4 border border-amber-200 dark:border-amber-800/40">
              <Tag className="w-3.5 h-3.5" /> Kategori
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-stone-900 dark:text-white mb-3">
              {genre.name}
            </h1>
            {genre.description && (
              <p className="text-stone-500 dark:text-slate-400 text-sm sm:text-base leading-relaxed mb-4 max-w-2xl">
                {genre.description}
              </p>
            )}
            <div className="flex items-center gap-2 text-sm text-stone-400 dark:text-slate-500">
              <BookOpen className="w-4 h-4" />
              <span>
                <span className="font-semibold text-stone-700 dark:text-slate-300">{totalBooks.toLocaleString('id-ID')}</span> buku tersedia
              </span>
            </div>
          </div>
        </section>

        {/* ── CONTENT ───────────────────────────────────────────────── */}
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">

          {/* Sort controls */}
          <div className="mt-8 flex flex-wrap items-center gap-2" role="group" aria-label="Opsi pengurutan">
            <div className="flex items-center gap-1.5 text-xs text-stone-400 dark:text-slate-500 mr-1">
              <ArrowUpDown className="w-3.5 h-3.5" /> Urutkan:
            </div>
            {sortButtons.map(({ field, label }) => (
              <button
                key={field}
                onClick={() => handleSort(field)}
                aria-pressed={sortBy === field}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  sortBy === field
                    ? 'bg-amber-500 text-stone-900 shadow-md shadow-amber-200/60 dark:shadow-amber-900/30'
                    : 'bg-white dark:bg-slate-900 text-stone-600 dark:text-slate-400 border border-stone-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400'
                }`}
              >
                {label} {sortBy === field && (sortOrder === 'DESC' ? '↓' : '↑')}
              </button>
            ))}
          </div>

          {/* Books grid */}
          <section className="mt-6">
            {books.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-7 h-7 text-stone-300 dark:text-slate-600" />
                </div>
                <p className="font-semibold text-stone-600 dark:text-slate-400 mb-1">Belum ada buku dalam kategori ini</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
                {books.map((book) => <BookCard key={book.id} book={book} />)}
              </div>
            )}
          </section>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="flex justify-center items-center gap-1.5 mt-10 mb-4 flex-wrap" aria-label="Navigasi halaman">
              <button
                onClick={() => handlePage(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-stone-600 dark:text-slate-400 disabled:opacity-40 hover:border-amber-400 dark:hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400 transition-all text-sm font-medium"
                aria-label="Halaman sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" /> Sebelumnya
              </button>

              {pagesToShow().map((p, i) =>
                typeof p === 'string' ? (
                  <span key={i} className="px-2 text-stone-300 dark:text-slate-600 text-sm" aria-hidden>…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => handlePage(p)}
                    aria-current={currentPage === p ? 'page' : undefined}
                    className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                      currentPage === p
                        ? 'bg-amber-500 text-stone-900 shadow-md shadow-amber-200/60 dark:shadow-amber-900/30'
                        : 'bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700 text-stone-600 dark:text-slate-400 hover:border-amber-400 dark:hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                onClick={() => handlePage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-stone-600 dark:text-slate-400 disabled:opacity-40 hover:border-amber-400 dark:hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400 transition-all text-sm font-medium"
                aria-label="Halaman berikutnya"
              >
                Selanjutnya <ChevronRight className="w-4 h-4" />
              </button>
            </nav>
          )}

          <div className="pb-16" />
        </div>
      </div>
    </>
  )
}

export default GenreDetailPage
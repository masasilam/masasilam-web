import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import bookService from '../services/bookService'
import BookCard from '../components/Book/BookCard'
import LoadingSpinner from '../components/Common/LoadingSpinner'
import SEO from '../components/Common/SEO'
import {
  generateAuthorStructuredData,
  generateBreadcrumbStructuredData,
  combineStructuredData,
  generateMetaDescription,
  generateKeywords
} from '../utils/seoHelpers'
import { User, BookOpen, Home, ChevronRight, ChevronLeft, Calendar, MapPin, Globe } from 'lucide-react'

const LIMIT = 24

const AuthorDetailPage = () => {
  const { authorSlug }                  = useParams()
  const [author,       setAuthor]       = useState(null)
  const [books,        setBooks]        = useState([])
  const [loading,      setLoading]      = useState(true)
  const [currentPage,  setCurrentPage]  = useState(1)
  const [totalPages,   setTotalPages]   = useState(1)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [authorsRes, booksRes] = await Promise.all([
          bookService.getAuthors(1, 1000),
          bookService.getBooks({
            page: currentPage, limit: LIMIT,
            authorName: authorSlug,
            sortField: 'publishedAt', sortOrder: 'DESC'
          })
        ])
        const found = authorsRes.data?.list?.find(a => a.slug === authorSlug)
        setAuthor(found || { name: authorSlug.replace(/-/g, ' '), slug: authorSlug })
        setBooks(booksRes.data?.data || [])
        setTotalPages(booksRes.data?.totalPages || 1)
      } catch (err) {
        console.error('Error:', err)
        setAuthor({ name: authorSlug.replace(/-/g, ' '), slug: authorSlug })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [authorSlug, currentPage])

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : null
  const formatYear = (d) => d ? new Date(d).getFullYear() : null

  const breadcrumbs = [
    { name: 'Beranda', url: '/' },
    { name: 'Penulis',  url: '/penulis' },
    { name: author?.name || authorSlug, url: '#' },
  ]
  const metaDescription = author?.biography
    ? generateMetaDescription(author.biography, 160)
    : `Jelajahi ${books.length} karya dari ${author?.name || authorSlug}. Baca buku-buku domain publik secara gratis di MasasilaM.`
  const keywords = generateKeywords(null, author?.name || authorSlug, null) + ', biografi penulis, karya penulis'
  const structuredData = author
    ? combineStructuredData(generateBreadcrumbStructuredData(breadcrumbs), generateAuthorStructuredData(author, books))
    : null

  if (loading && currentPage === 1) return <LoadingSpinner fullScreen />

  if (!author) {
    return (
      <>
        <SEO title="Penulis Tidak Ditemukan" description="Halaman penulis yang Anda cari tidak tersedia" url={`/penulis/${authorSlug}`} noindex />
        <div className="min-h-screen bg-stone-50 dark:bg-slate-950 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-20 h-20 rounded-3xl bg-stone-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-5">
              <User className="w-10 h-10 text-stone-300 dark:text-slate-600" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-stone-900 dark:text-white mb-2">Penulis Tidak Ditemukan</h1>
            <p className="text-stone-500 dark:text-slate-400 mb-6 text-sm">Penulis "{authorSlug}" tidak tersedia</p>
            <Link to="/penulis" className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-stone-900 rounded-full font-semibold text-sm transition-all">
              <Home className="w-4 h-4" /> Kembali ke Daftar Penulis
            </Link>
          </div>
        </div>
      </>
    )
  }

  const birthYear = formatYear(author.birthDate)
  const deathYear = formatYear(author.deathDate)

  return (
    <>
      <SEO
        title={`${author.name} — Profil & Karya Penulis`}
        description={metaDescription}
        url={`/penulis/${author.slug}`}
        type="profile"
        image={author.photoUrl}
        keywords={keywords}
        structuredData={structuredData}
        author={author.name}
        canonical={`https://masasilam.com/penulis/${author.slug}`}
      />

      <div className="min-h-screen bg-stone-50 dark:bg-slate-950 transition-colors duration-300">

        {/* ── HERO / PROFILE HEADER ─────────────────────────────────── */}
        <section className="relative overflow-hidden bg-white dark:bg-slate-950 border-b border-stone-200 dark:border-slate-800 py-14 sm:py-20">
          <div className="pointer-events-none absolute inset-0 flex items-start justify-center overflow-hidden">
            <div className="w-[500px] h-[400px] rounded-full bg-amber-100/40 dark:bg-amber-900/10 blur-3xl -translate-y-1/2" />
          </div>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-amber-400 via-emerald-400 to-blue-400 opacity-60" />

          <div className="relative container mx-auto px-4 sm:px-6 max-w-5xl">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs text-stone-400 dark:text-slate-500 mb-8" aria-label="Breadcrumb">
              <Link to="/" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Beranda</Link>
              <ChevronRight className="w-3 h-3" />
              <Link to="/penulis" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Penulis</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-stone-600 dark:text-slate-300 font-medium truncate">{author.name}</span>
            </nav>

            {/* Profile card */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl overflow-hidden bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-slate-800 flex items-center justify-center border-2 border-amber-200/60 dark:border-amber-800/40 shadow-xl shadow-amber-100/40 dark:shadow-black/30">
                  {author.photoUrl ? (
                    <img src={author.photoUrl} alt={`Foto ${author.name}`} className="w-full h-full object-cover" loading="eager" />
                  ) : (
                    <User className="w-14 h-14 sm:w-18 sm:h-18 text-amber-400 dark:text-amber-600" />
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3.5 py-1.5 rounded-full mb-3 border border-amber-200 dark:border-amber-800/40">
                  <User className="w-3 h-3" /> Penulis
                </div>
                <h1 className="font-serif text-3xl sm:text-5xl font-black tracking-tight text-stone-900 dark:text-white capitalize mb-3">
                  {author.name}
                </h1>

                {/* Meta */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1.5 mb-4 text-xs sm:text-sm text-stone-400 dark:text-slate-500">
                  {author.birthDate && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                      {formatDate(author.birthDate)}{author.deathDate && ` — ${formatDate(author.deathDate)}`}
                    </span>
                  )}
                  {!author.birthDate && birthYear && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                      {birthYear}{deathYear && `–${deathYear}`}
                    </span>
                  )}
                  {author.birthPlace && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      {author.birthPlace}
                    </span>
                  )}
                  {author.nationality && (
                    <span className="flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 flex-shrink-0" />
                      {author.nationality}
                    </span>
                  )}
                </div>

                {/* Biography */}
                {author.biography && (
                  <p className="text-stone-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed mb-4 max-w-2xl">
                    {author.biography}
                  </p>
                )}

                {/* Book count badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-full text-amber-700 dark:text-amber-400 font-semibold text-sm">
                  <BookOpen className="w-4 h-4" />
                  {author.totalBooks || books.length} buku tersedia
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── BOOKS SECTION ─────────────────────────────────────────── */}
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
          <section className="mt-10 sm:mt-12">
            {books.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-7 h-7 text-stone-300 dark:text-slate-600" />
                </div>
                <p className="font-semibold text-stone-600 dark:text-slate-400 mb-1">Belum ada buku dari penulis ini</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-6 pl-4 border-l-4 border-amber-500 dark:border-amber-400">
                  <div>
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-slate-50">
                      Karya-karya {author.name}
                    </h2>
                    <p className="text-xs text-stone-400 dark:text-slate-500 mt-0.5">{books.length} buku ditampilkan</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
                  {books.map((book) => <BookCard key={book.id} book={book} />)}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <nav className="flex justify-center items-center gap-2 mt-10 mb-4 flex-wrap" aria-label="Navigasi halaman">
                    <button
                      onClick={() => { setCurrentPage(p => p - 1); window.scrollTo(0, 0) }}
                      disabled={currentPage === 1}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-stone-600 dark:text-slate-400 disabled:opacity-40 hover:border-amber-400 dark:hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400 transition-all text-sm font-medium"
                    >
                      <ChevronLeft className="w-4 h-4" /> Sebelumnya
                    </button>
                    <span className="px-4 py-2.5 text-sm text-stone-400 dark:text-slate-500">
                      Hal <span className="font-semibold text-stone-700 dark:text-slate-300">{currentPage}</span> dari {totalPages}
                    </span>
                    <button
                      onClick={() => { setCurrentPage(p => p + 1); window.scrollTo(0, 0) }}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-stone-600 dark:text-slate-400 disabled:opacity-40 hover:border-amber-400 dark:hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400 transition-all text-sm font-medium"
                    >
                      Selanjutnya <ChevronRight className="w-4 h-4" />
                    </button>
                  </nav>
                )}
              </>
            )}
          </section>
          <div className="pb-16" />
        </div>
      </div>
    </>
  )
}

export default AuthorDetailPage
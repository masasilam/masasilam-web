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
import { User, BookOpen, Home, ChevronRight, Calendar, MapPin, Globe } from 'lucide-react'

const AuthorDetailPage = () => {
  const { authorSlug } = useParams()
  const [author, setAuthor] = useState(null)
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const LIMIT = 24

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [authorsRes, booksRes] = await Promise.all([
          bookService.getAuthors(1, 1000),
          bookService.getBooks({
            page: currentPage,
            limit: LIMIT,
            authorName: authorSlug.replace(/-/g, ' '),
            sortField: 'publishedAt',
            sortOrder: 'DESC'
          })
        ])
        const foundAuthor = authorsRes.data?.list?.find(a => a.slug === authorSlug)
        setAuthor(foundAuthor || { name: authorSlug.replace(/-/g, ' '), slug: authorSlug })
        setBooks(booksRes.data?.data || [])
        setTotalPages(booksRes.data?.totalPages || 1)
      } catch (error) {
        console.error('Error:', error)
        setAuthor({ name: authorSlug.replace(/-/g, ' '), slug: authorSlug })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [authorSlug, currentPage])

  const formatDate = (date) => date ? new Date(date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : null

  // SEO Data
  const breadcrumbs = [
    { name: 'Beranda', url: '/' },
    { name: 'Penulis', url: '/penulis' },
    { name: author?.name || authorSlug, url: '#' }
  ]

  const metaDescription = author?.biography
    ? generateMetaDescription(author.biography, 160)
    : `Jelajahi ${books.length} karya dari ${author?.name || authorSlug}. Baca buku-buku domain publik secara gratis di MasasilaM.`

  const keywords = generateKeywords(
    null,
    author?.name || authorSlug,
    null
  ) + ', biografi penulis, karya penulis, buku penulis'

  const structuredData = author ? combineStructuredData(
    generateBreadcrumbStructuredData(breadcrumbs),
    generateAuthorStructuredData(author, books)
  ) : null

  if (loading && currentPage === 1) return <LoadingSpinner fullScreen />

  if (!author) {
    return (
      <>
        <SEO
          title="Penulis Tidak Ditemukan"
          description="Halaman penulis yang Anda cari tidak tersedia"
          url={`/penulis/${authorSlug}`}
          noindex={true}
        />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="text-center">
            <User className="w-20 h-20 mx-auto mb-4 text-gray-400" aria-hidden="true" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Penulis Tidak Ditemukan</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Penulis "{authorSlug}" tidak tersedia</p>
            <Link to="/penulis" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition">
              <Home className="w-5 h-5" /> Kembali ke Daftar Penulis
            </Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <SEO
        title={`${author.name} - Profil & Karya Penulis`}
        description={metaDescription}
        url={`/penulis/${author.slug}`}
        type="profile"
        image={author.photoUrl}
        keywords={keywords}
        structuredData={structuredData}
        author={author.name}
        canonical={`https://masasilam.com/penulis/${author.slug}`}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs sm:text-sm mb-4 sm:mb-6 text-gray-600 dark:text-gray-400" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-primary transition">Beranda</Link>
            <ChevronRight className="w-3 h-3" aria-hidden="true" />
            <Link to="/penulis" className="hover:text-primary transition">Penulis</Link>
            <ChevronRight className="w-3 h-3" aria-hidden="true" />
            <span className="text-gray-900 dark:text-white font-medium truncate">{author.name}</span>
          </nav>

          {/* Author Header - SEO Optimized */}
          <header className="mb-8 sm:mb-10 pb-6 sm:pb-8 border-b-2 border-primary">
            <div className="flex flex-col items-center text-center gap-4 sm:gap-6">
              <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full overflow-hidden bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-xl">
                {author.photoUrl ? (
                  <img src={author.photoUrl} alt={`Foto ${author.name}`} className="w-full h-full object-cover" loading="eager" />
                ) : (
                  <User className="w-12 h-12 sm:w-16 sm:h-16 text-white" aria-hidden="true" />
                )}
              </div>
              <div className="w-full max-w-3xl">
                <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-light text-gray-900 dark:text-white mb-3 sm:mb-4 capitalize">
                  {author.name}
                </h1>
                {(author.birthDate || author.birthPlace || author.nationality) && (
                  <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-3 sm:mb-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 px-4">
                    {author.birthDate && (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                        {formatDate(author.birthDate)}{author.deathDate && ` - ${formatDate(author.deathDate)}`}
                      </span>
                    )}
                    {author.birthPlace && (
                      <span className="flex items-center gap-1.5 min-w-0">
                        <MapPin className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                        <span className="break-words">{author.birthPlace}</span>
                      </span>
                    )}
                    {author.nationality && (
                      <span className="flex items-center gap-1.5">
                        <Globe className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                        {author.nationality}
                      </span>
                    )}
                  </div>
                )}
                {author.biography && (
                  <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed mb-4 sm:mb-5 px-4">
                    {author.biography}
                  </p>
                )}
                <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-primary/10 dark:bg-primary/20 rounded-full text-primary font-medium text-sm sm:text-base">
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
                  <span>{author.totalBooks || books.length} buku tersedia</span>
                </div>
              </div>
            </div>
          </header>

          {/* Books Section */}
          {books.length === 0 ? (
            <div className="text-center py-16" role="status">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" aria-hidden="true" />
              <p className="text-gray-600 dark:text-gray-400">Belum ada buku dari penulis ini</p>
            </div>
          ) : (
            <>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-light text-gray-900 dark:text-white mb-4 sm:mb-6">
                Karya-karya {author.name}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
                {books.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
              {totalPages > 1 && (
                <nav className="flex justify-center items-center gap-2 mt-8 flex-wrap" aria-label="Navigasi halaman">
                  <button onClick={() => { setCurrentPage(p => p - 1); window.scrollTo(0, 0) }} disabled={currentPage === 1} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800 transition text-sm">
                    Sebelumnya
                  </button>
                  <span className="px-3 py-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">Hal {currentPage} dari {totalPages}</span>
                  <button onClick={() => { setCurrentPage(p => p + 1); window.scrollTo(0, 0) }} disabled={currentPage === totalPages} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800 transition text-sm">
                    Selanjutnya
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default AuthorDetailPage
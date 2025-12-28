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
  generateMetaDescription
} from '../utils/seoHelpers'
import { BookOpen, ChevronRight, Home } from 'lucide-react'

const GenreDetailPage = () => {
  const { genreSlug } = useParams()
  const [genre, setGenre] = useState(null)
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalBooks, setTotalBooks] = useState(0)
  const [sortBy, setSortBy] = useState('viewCount')
  const [sortOrder, setSortOrder] = useState('DESC')
  const LIMIT = 24

  useEffect(() => {
    fetchGenreAndBooks()
  }, [genreSlug, currentPage, sortBy, sortOrder])

  const fetchGenreAndBooks = async () => {
    try {
      setLoading(true)

      const [genresResponse, booksResponse] = await Promise.all([
        bookService.getGenres(true),
        bookService.getBooks({
          page: currentPage,
          limit: LIMIT,
          genre: genreSlug,
          sortField: sortBy,
          sortOrder: sortOrder
        })
      ])

      const currentGenre = genresResponse.data?.find(g =>
        g.slug?.toLowerCase() === genreSlug?.toLowerCase()
      )

      setGenre(currentGenre || null)
      setBooks(booksResponse.data?.data || [])
      setTotalPages(booksResponse.data?.totalPages || 1)
      setTotalBooks(booksResponse.data?.total || 0)
    } catch (error) {
      console.error('Error fetching genre data:', error)
      setGenre(null)
      setBooks([])
    } finally {
      setLoading(false)
    }
  }

  const handleSortChange = (field) => {
    setSortBy(field)
    setSortOrder(sortBy === field && sortOrder === 'DESC' ? 'ASC' : 'DESC')
    setCurrentPage(1)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // SEO Data
  const breadcrumbs = genre ? [
    { name: 'Beranda', url: '/' },
    { name: 'Kategori', url: '/kategori' },
    { name: genre.name, url: '#' }
  ] : []

  const metaDescription = genre?.description
    ? generateMetaDescription(genre.description, 160)
    : `Temukan ${totalBooks} buku ${genre?.name || genreSlug} domain publik. Baca gratis dengan fitur bookmark dan highlight di MasasilaM.`

  const keywords = `${genre?.name || genreSlug}, buku ${genre?.name || genreSlug}, ${genre?.name || genreSlug} gratis, buku domain publik, perpustakaan digital`

  const pageUrl = currentPage > 1 ? `/kategori/${genreSlug}?page=${currentPage}` : `/kategori/${genreSlug}`
  const prevUrl = currentPage > 1 ? (currentPage === 2 ? `/kategori/${genreSlug}` : `/kategori/${genreSlug}?page=${currentPage - 1}`) : null
  const nextUrl = currentPage < totalPages ? `/kategori/${genreSlug}?page=${currentPage + 1}` : null

  const structuredData = genre && books.length > 0 ? combineStructuredData(
    generateBreadcrumbStructuredData(breadcrumbs),
    generateCollectionPageStructuredData('books', books, currentPage, totalBooks, LIMIT)
  ) : null

  if (loading) return <LoadingSpinner fullScreen />

  if (!genre) {
    return (
      <>
        <SEO
          title="Kategori Tidak Ditemukan"
          description="Halaman kategori yang Anda cari tidak tersedia"
          url={`/kategori/${genreSlug}`}
          noindex={true}
        />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
          <div className="container mx-auto px-4 text-center">
            <BookOpen className="w-20 h-20 mx-auto mb-4 text-gray-400" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Kategori Tidak Ditemukan
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Kategori "{genreSlug}" tidak tersedia
            </p>
            <Link to="/kategori" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
              <Home className="w-5 h-5" />
              Kembali ke Daftar Kategori
            </Link>
          </div>
        </div>
      </>
    )
  }

  const sortButtons = [
    { field: 'viewCount', label: 'Terpopuler' },
    { field: 'publishedAt', label: 'Terbaru' },
    { field: 'averageRating', label: 'Rating' },
    { field: 'title', label: 'Judul' }
  ]

  return (
    <>
      <SEO
        title={`${genre.name} - Koleksi Buku Domain Publik`}
        description={metaDescription}
        url={pageUrl}
        type="website"
        keywords={keywords}
        structuredData={structuredData}
        prevUrl={prevUrl}
        nextUrl={nextUrl}
        canonical={`https://masasilam.com${pageUrl}`}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-sm mb-6 text-gray-600 dark:text-gray-400" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-primary transition-colors">Beranda</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/kategori" className="hover:text-primary transition-colors">Kategori</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 dark:text-white font-medium">{genre.name}</span>
          </nav>

          <header className="mb-8 pb-6 border-b-2 border-primary">
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-gray-900 dark:text-white mb-3">
              {genre.name}
            </h1>
            {genre.description && (
              <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg mb-3">
                {genre.description}
              </p>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <BookOpen className="w-4 h-4" />
              <span>{totalBooks} buku tersedia</span>
            </div>
          </header>

          <div className="flex flex-wrap gap-2 mb-6" role="group" aria-label="Sort options">
            {sortButtons.map(({ field, label }) => (
              <button
                key={field}
                onClick={() => handleSortChange(field)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === field
                    ? 'bg-primary text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:border-primary'
                }`}
                aria-pressed={sortBy === field}
              >
                {label} {sortBy === field && (sortOrder === 'DESC' ? '↓' : '↑')}
              </button>
            ))}
          </div>

          {books.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Belum ada buku dalam kategori ini
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5 md:gap-6">
                {books.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>

              {totalPages > 1 && (
                <nav className="flex justify-center items-center gap-2 mt-8 flex-wrap" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Previous page"
                  >
                    Sebelumnya
                  </button>

                  {[...Array(totalPages)].map((_, idx) => {
                    const pageNum = idx + 1
                    const isEdge = pageNum === 1 || pageNum === totalPages
                    const isNearCurrent = pageNum >= currentPage - 1 && pageNum <= currentPage + 1

                    if (isEdge || isNearCurrent) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            currentPage === pageNum
                              ? 'bg-primary text-white'
                              : 'border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                          aria-label={`Page ${pageNum}`}
                          aria-current={currentPage === pageNum ? 'page' : undefined}
                        >
                          {pageNum}
                        </button>
                      )
                    } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                      return <span key={pageNum} aria-hidden="true">...</span>
                    }
                    return null
                  })}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Next page"
                  >
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

export default GenreDetailPage
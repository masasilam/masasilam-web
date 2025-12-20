import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import bookService from '../services/bookService'
import BookCard from '../components/Book/BookCard'
import LoadingSpinner from '../components/Common/LoadingSpinner'
import { User, BookOpen, Home, ChevronRight } from 'lucide-react'

const AuthorDetailPage = () => {
  const { authorSlug } = useParams()
  const [author, setAuthor] = useState(null)
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const LIMIT = 24

  useEffect(() => {
    fetchAuthorAndBooks()
  }, [authorSlug, currentPage])

  const fetchAuthorAndBooks = async () => {
    try {
      setLoading(true)
      
      const [authorsResponse, booksResponse] = await Promise.all([
        bookService.getAuthors(1, 1000, authorSlug),
        bookService.getBooks({
          page: currentPage,
          limit: LIMIT,
          authorName: authorSlug.replace(/-/g, ' '),
          sortField: 'publishedAt',
          sortOrder: 'DESC'
        })
      ])

      const foundAuthor = authorsResponse.data?.list?.find(a => a.slug === authorSlug)
      setAuthor(foundAuthor || { name: authorSlug.replace(/-/g, ' '), slug: authorSlug })
      setBooks(booksResponse.data?.data || [])
      setTotalPages(booksResponse.data?.totalPages || 1)
    } catch (error) {
      console.error('Error fetching author data:', error)
      setAuthor({ name: authorSlug.replace(/-/g, ' '), slug: authorSlug })
      setBooks([])
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading && currentPage === 1) return <LoadingSpinner fullScreen />

  if (!author) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4 text-center">
          <User className="w-20 h-20 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Penulis Tidak Ditemukan
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Penulis "{authorSlug}" tidak tersedia
          </p>
          <Link to="/penulis" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
            <Home className="w-5 h-5" />
            Kembali ke Daftar Penulis
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6">
        <nav className="flex items-center gap-2 text-sm mb-6 text-gray-600 dark:text-gray-400" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-primary transition-colors">Beranda</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/penulis" className="hover:text-primary transition-colors">Penulis</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 dark:text-white font-medium">{author.name}</span>
        </nav>

        <header className="mb-8 pb-6 border-b-2 border-primary text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-primary to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            {author.photoUrl ? (
              <img src={author.photoUrl} alt={author.name} className="w-24 h-24 rounded-full object-cover" loading="lazy" />
            ) : (
              <User className="w-12 h-12 text-white" />
            )}
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-gray-900 dark:text-white mb-3 capitalize">
            {author.name}
          </h1>
          {author.biography && (
            <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg max-w-2xl mx-auto mb-3">
              {author.biography}
            </p>
          )}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <BookOpen className="w-4 h-4" />
            <span>{author.totalBooks || author.bookCount || books.length} buku tersedia</span>
          </div>
        </header>

        {books.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Belum ada buku dari penulis ini
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

                <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                  Halaman {currentPage} dari {totalPages}
                </span>

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
  )
}

export default AuthorDetailPage
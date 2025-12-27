// src/pages/dashboard/MyLibraryPage.jsx
import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { dashboardService } from '../../services/dashboardService'
import LoadingSpinner from '../../components/Common/LoadingSpinner'
import { Book, Filter, SortAsc, Star } from 'lucide-react'

const MyLibraryPage = () => {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('last_read')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    document.title = 'Perpustakaan Saya - Dashboard MasasilaM'
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Kelola dan lacak semua buku yang pernah Anda baca')
    }
  }, [])

  useEffect(() => {
    fetchLibrary()
  }, [filter, sortBy, page])

  const fetchLibrary = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await dashboardService.getLibrary(filter, page, 12, sortBy)

      if (response && response.data) {
        setBooks(response.data.items || [])
        setTotalPages(Math.ceil((response.data.totalData || 0) / 12))
      } else {
        setBooks([])
        setTotalPages(1)
        setError('Format respons tidak valid')
      }
    } catch (error) {
      console.error('Error:', error)
      setError('Gagal memuat data perpustakaan')
      setBooks([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }, [filter, page, sortBy])

  const filterOptions = useMemo(() => [
    { value: 'all', label: 'Semua Buku' },
    { value: 'reading', label: 'Sedang Dibaca' },
    { value: 'completed', label: 'Selesai' },
    { value: 'bookmarked', label: 'Ada Bookmark' }
  ], [])

  const sortOptions = useMemo(() => [
    { value: 'last_read', label: 'Terakhir Dibaca' },
    { value: 'progress', label: 'Progress' },
    { value: 'title', label: 'Judul' },
    { value: 'rating', label: 'Rating' }
  ], [])

  const handleFilterChange = useCallback((newFilter) => {
    setFilter(newFilter)
    setPage(1)
  }, [])

  const handleSortChange = useCallback((newSort) => {
    setSortBy(newSort)
    setPage(1)
  }, [])

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <>
      <div className="space-y-4 sm:space-y-6">
        <header className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Perpustakaan Saya</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Semua buku yang pernah Anda baca
          </p>
        </header>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4" role="alert">
            <p className="text-red-700 dark:text-red-400 mb-3">{error}</p>
            <button
              onClick={fetchLibrary}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors touch-manipulation focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Filters & Sort */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">
                <Filter className="w-4 h-4 inline mr-2" aria-hidden="true" />
                Filter
              </label>
              <select
                value={filter}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {filterOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">
                <SortAsc className="w-4 h-4 inline mr-2" aria-hidden="true" />
                Urutkan
              </label>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {sortOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Books Grid */}
        {loading ? (
          <LoadingSpinner />
        ) : books?.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 sm:p-12 text-center">
            <Book className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-400" aria-hidden="true" />
            <p className="text-gray-500 text-sm sm:text-base">Belum ada buku di perpustakaan</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {books.map((book) => (
                <Link
                  key={book?.bookId || Math.random()}
                  to={`/buku/${book?.bookSlug || '#'}`}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  <div className="aspect-[3/4] relative bg-gray-100 dark:bg-gray-900">
                    <img
                      src={book?.coverImageUrl || 'https://via.placeholder.com/300x400'}
                      alt={book?.bookTitle || 'Judul tidak tersedia'}
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                    {/* Badge di pojok kiri bawah dengan shadow */}
                    <div className="absolute bottom-2 left-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium shadow-lg ${
                        book?.readingStatus === 'completed' ? 'bg-green-500 text-white' :
                        book?.readingStatus === 'reading' ? 'bg-blue-500 text-white' :
                        'bg-gray-500 text-white'
                      }`}>
                        {book?.readingStatus === 'completed' ? 'Selesai' :
                         book?.readingStatus === 'reading' ? 'Dibaca' : 'Belum'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 sm:p-4">
                    <h3 className="font-bold text-sm sm:text-lg mb-1 line-clamp-2">
                      {book?.bookTitle || 'Judul tidak tersedia'}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 truncate">
                      {book?.authorName || 'Penulis tidak tersedia'}
                    </p>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                        <span>Bab {book?.currentChapter || 0} dari {book?.totalChapters || 0}</span>
                        <span>{(book?.progressPercentage || 0).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2" role="progressbar" aria-valuenow={book?.progressPercentage || 0} aria-valuemin="0" aria-valuemax="100">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${book?.progressPercentage || 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{(book?.totalReadingTimeMinutes || 0)}m dibaca</span>
                      {book?.myRating && (
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" aria-hidden="true" />
                          {book.myRating}
                        </span>
                      )}
                    </div>

                    {/* Engagement Counts */}
                    {(book?.bookmarkCount > 0 || book?.highlightCount > 0 || book?.noteCount > 0) && (
                      <div className="flex gap-3 mt-2 text-xs">
                        {book?.bookmarkCount > 0 && (
                          <span className="text-gray-500">📑 {book.bookmarkCount}</span>
                        )}
                        {book?.highlightCount > 0 && (
                          <span className="text-gray-500">✨ {book.highlightCount}</span>
                        )}
                        {book?.noteCount > 0 && (
                          <span className="text-gray-500">📝 {book.noteCount}</span>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="mt-6 sm:mt-8 flex justify-center gap-2" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(Math.max(1, page - 1))}
                  disabled={page === 1 || loading}
                  className="px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 text-sm sm:text-base"
                  aria-label="Halaman sebelumnya"
                >
                  Sebelumnya
                </button>
                <span className="px-3 sm:px-4 py-2 text-sm sm:text-base" aria-current="page">
                  Halaman {page} dari {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages || loading}
                  className="px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 text-sm sm:text-base"
                  aria-label="Halaman selanjutnya"
                >
                  Selanjutnya
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </>
  )
}

export default MyLibraryPage
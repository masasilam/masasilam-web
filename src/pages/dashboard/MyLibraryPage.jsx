// ============================================
// src/pages/dashboard/MyLibraryPage.jsx - FIXED
// ============================================

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { dashboardService } from '../../services/dashboardService'
import LoadingSpinner from '../../components/Common/LoadingSpinner'
import { Book, Filter, SortAsc, Star } from 'lucide-react' // PERBAIKAN: Tambahkan import Star

const MyLibraryPage = () => {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null) // PERBAIKAN: Tambahkan state untuk error
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('last_read')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchLibrary()
  }, [filter, sortBy, page])

  const fetchLibrary = async () => {
    try {
      setLoading(true)
      setError(null) // Reset error state
      const response = await dashboardService.getLibrary(filter, page, 12, sortBy)
      
      // PERBAIKAN: Tambahkan validasi response
      if (response && response.data) {
        setBooks(response.data.items || []) // Default ke array kosong jika items undefined
        setTotalPages(Math.ceil((response.data.totalData || 0) / 12))
      } else {
        setBooks([])
        setTotalPages(1)
        setError('Format respons tidak valid')
      }
    } catch (error) {
      console.error('Error:', error)
      setError('Gagal memuat data perpustakaan')
      setBooks([]) // Pastikan books selalu array
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const filterOptions = [
    { value: 'all', label: 'Semua Buku' },
    { value: 'reading', label: 'Sedang Dibaca' },
    { value: 'completed', label: 'Selesai' },
    { value: 'bookmarked', label: 'Ada Bookmark' }
  ]

  const sortOptions = [
    { value: 'last_read', label: 'Terakhir Dibaca' },
    { value: 'progress', label: 'Progress' },
    { value: 'title', label: 'Judul' },
    { value: 'rating', label: 'Rating' }
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Perpustakaan Saya</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Semua buku yang pernah Anda baca
        </p>
      </div>

      {/* Tampilkan error jika ada */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <p className="text-red-700 dark:text-red-400">{error}</p>
          <button
            onClick={fetchLibrary}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Filters & Sort */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">
              <Filter className="w-4 h-4 inline mr-2" />
              Filter
            </label>
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value)
                setPage(1)
              }}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {filterOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">
              <SortAsc className="w-4 h-4 inline mr-2" />
              Urutkan
            </label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value)
                setPage(1)
              }}
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
      ) : books?.length === 0 ? ( // PERBAIKAN: Gunakan optional chaining
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <Book className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">Belum ada buku di perpustakaan</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* PERBAIKAN: Tambahkan optional chaining untuk properti buku */}
            {books.map((book) => (
              <Link
                key={book?.bookId || Math.random()}
                to={`/buku/${book?.bookSlug || '#'}`}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="aspect-[3/4] relative">
                  <img
                    src={book?.coverImageUrl || 'https://via.placeholder.com/300x400'}
                    alt={book?.bookTitle || 'Judul tidak tersedia'}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      book?.readingStatus === 'completed' ? 'bg-green-500 text-white' :
                      book?.readingStatus === 'reading' ? 'bg-blue-500 text-white' :
                      'bg-gray-500 text-white'
                    }`}>
                      {book?.readingStatus === 'completed' ? 'Selesai' :
                       book?.readingStatus === 'reading' ? 'Dibaca' : 'Belum'}
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1 line-clamp-2">
                    {book?.bookTitle || 'Judul tidak tersedia'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {book?.authorName || 'Penulis tidak tersedia'}
                  </p>
                  
                  {/* Progress Bar dengan validasi */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                      <span>Bab {book?.currentChapter || 0} dari {book?.totalChapters || 0}</span>
                      <span>{(book?.progressPercentage || 0).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${book?.progressPercentage || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats dengan validasi */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{(book?.totalReadingTimeMinutes || 0)}m dibaca</span>
                    {book?.myRating && (
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                        {book.myRating}
                      </span>
                    )}
                  </div>
                  
                  {/* Engagement Counts dengan validasi */}
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
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sebelumnya
              </button>
              <span className="px-4 py-2">
                Halaman {page} dari {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || loading}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Selanjutnya
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default MyLibraryPage
// ============================================
// src/pages/RecommendedBooksPage.jsx - FIXED
// ============================================

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import bookService from '../services/bookService'
import BookGrid from '../components/Book/BookGrid'
import Button from '../components/Common/Button'
import { ChevronRight, Star } from 'lucide-react'

const RecommendedBooksPage = () => {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchRecommendedBooks()
  }, [currentPage])

  const fetchRecommendedBooks = async () => {
    try {
      setLoading(true)
      
      // ✅ Books with rating >= 4.0 and featured status
      const response = await bookService.getBooks({
        page: currentPage,
        limit: 24,
        sortField: 'averageRating', // ✅ Sort by rating
        sortOrder: 'DESC',
        minRating: 4.0, // ✅ Only highly rated books
        isFeatured: true // ✅ Featured books only
      })
      
      console.log('⭐ Recommended Books Response:', response)
      
      setBooks(response.data?.data || [])
      setTotalPages(Math.ceil((response.data?.total || 0) / 24))
    } catch (error) {
      console.error('❌ Error fetching recommended books:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* ============ BREADCRUMB ============ */}
        <nav className="flex items-center gap-2 text-sm mb-6">
          <Link 
            to="/" 
            className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
          >
            Beranda
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <Link 
            to="/buku" 
            className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
          >
            Katalog Buku
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 dark:text-white font-medium">
            Rekomendasi
          </span>
        </nav>

        {/* ============ HEADER ============ */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
              <Star className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Buku Rekomendasi</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Buku pilihan dengan rating terbaik
              </p>
            </div>
          </div>

          {/* Stats Badge */}
          {!loading && books.length > 0 && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-sm">
              <Star className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-gray-700 dark:text-gray-300">
                Menampilkan {books.length} buku rekomendasi
              </span>
            </div>
          )}
        </div>

        {/* ============ BOOKS GRID ============ */}
        <BookGrid books={books} loading={loading} />

        {/* ============ PAGINATION ============ */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center gap-2">
            <Button
              variant="secondary"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || loading}
            >
              Sebelumnya
            </Button>
            
            <span className="flex items-center px-4 text-sm text-gray-600 dark:text-gray-400">
              Halaman {currentPage} dari {totalPages}
            </span>

            <Button
              variant="secondary"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || loading}
            >
              Selanjutnya
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default RecommendedBooksPage
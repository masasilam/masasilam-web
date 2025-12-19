// ============================================
// src/pages/PopularBooksPage.jsx - FIXED
// ============================================

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import bookService from '../services/bookService'
import BookGrid from '../components/Book/BookGrid'
import Button from '../components/Common/Button'
import { ChevronRight, TrendingUp } from 'lucide-react'

const PopularBooksPage = () => {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchPopularBooks()
  }, [currentPage])

  const fetchPopularBooks = async () => {
    try {
      setLoading(true)
      
      // ✅ FIXED: Backend expects 'viewCount' not 'view_count'
      const response = await bookService.getBooks({
        page: currentPage,
        limit: 24,
        sortField: 'viewCount', // ✅ Sesuai dengan allowedSortFields di backend
        sortOrder: 'DESC',
      })
      
      console.log('📊 Popular Books Response:', response)
      
      setBooks(response.data?.data || [])
      setTotalPages(Math.ceil((response.data?.total || 0) / 24))
    } catch (error) {
      console.error('❌ Error fetching popular books:', error)
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
            Buku
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 dark:text-white font-medium">
            Terpopuler
          </span>
        </nav>

        {/* ============ HEADER ============ */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
              <TrendingUp className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Buku Terpopuler</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Buku paling banyak dibaca oleh pengguna MasasilaM
              </p>
            </div>
          </div>

          {/* Stats Badge */}
          {!loading && books.length > 0 && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-sm">
              <TrendingUp className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <span className="text-gray-700 dark:text-gray-300">
                Menampilkan {books.length} buku terpopuler
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

export default PopularBooksPage
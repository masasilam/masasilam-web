// ============================================
// src/pages/SearchResultsPage.jsx
// ============================================

import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import bookService from '../services/bookService'
import BookGrid from '../components/Book/BookGrid'
import Button from '../components/Common/Button'
import { Search } from 'lucide-react'

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (query) {
      searchBooks()
    }
  }, [query, currentPage])

  const searchBooks = async () => {
    try {
      setLoading(true)
      const response = await bookService.getBooks({
        page: currentPage,
        limit: 24,
        searchTitle: query,
        sortField: 'viewCount',
        sortOrder: 'DESC',
      })
      
      setBooks(response.data?.data || [])
      setTotalPages(Math.ceil((response.data?.total || 0) / 24))
    } catch (error) {
      console.error('Error searching books:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!query) {
    return (
      <div className="min-h-screen py-16">
        <div className="container mx-auto px-4 text-center">
          <Search className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold mb-2">Cari Buku</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Masukkan kata kunci untuk mencari buku
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Hasil Pencarian</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Menampilkan hasil untuk: <strong>"{query}"</strong>
          </p>
          {!loading && books.length > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              Ditemukan {books.length} buku
            </p>
          )}
        </div>

        <BookGrid 
          books={books} 
          loading={loading}
          emptyMessage={`Tidak ada buku yang cocok dengan "${query}"`}
        />

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

export default SearchResultsPage
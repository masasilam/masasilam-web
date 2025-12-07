// ============================================
// src/pages/BooksPage.jsx
// ============================================

import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import bookService from '../services/bookService'
import BookGrid from '../components/Book/BookGrid'
import LoadingSpinner from '../components/Common/LoadingSpinner'
import Button from '../components/Common/Button'

const BooksPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sortField, setSortField] = useState('updateAt')
  const [sortOrder, setSortOrder] = useState('DESC')

  useEffect(() => {
    fetchBooks()
  }, [currentPage, sortField, sortOrder])

  const fetchBooks = async () => {
    try {
      setLoading(true)
      const response = await bookService.getBooks({
        page: currentPage,
        limit: 12,
        sortField,
        sortOrder,
      })
      
      setBooks(response.data?.data || [])
      setTotalPages(Math.ceil((response.data?.total || 0) / 12))
    } catch (error) {
      console.error('Error fetching books:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSortChange = (field) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'DESC' ? 'ASC' : 'DESC')
    } else {
      setSortField(field)
      setSortOrder('DESC')
    }
    setCurrentPage(1)
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Katalog Buku</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Jelajahi koleksi lengkap buku kami
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4 items-center">
          <span className="text-sm font-medium">Urutkan:</span>
          <Button
            variant={sortField === 'updateAt' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => handleSortChange('updateAt')}
          >
            Terbaru
          </Button>
          <Button
            variant={sortField === 'viewCount' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => handleSortChange('viewCount')}
          >
            Terpopuler
          </Button>
          <Button
            variant={sortField === 'title' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => handleSortChange('title')}
          >
            Judul
          </Button>
          <Button
            variant={sortField === 'averageRating' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => handleSortChange('averageRating')}
          >
            Rating
          </Button>
        </div>

        {/* Books Grid */}
        <BookGrid books={books} loading={loading} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center gap-2">
            <Button
              variant="secondary"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Sebelumnya
            </Button>
            
            <div className="flex items-center gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <Button
                  key={i}
                  variant={currentPage === i + 1 ? 'primary' : 'secondary'}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
            </div>

            <Button
              variant="secondary"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Selanjutnya
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default BooksPage
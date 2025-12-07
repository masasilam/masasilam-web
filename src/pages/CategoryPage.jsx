// ============================================
// src/pages/CategoryPage.jsx
// ============================================

import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import bookService from '../services/bookService'
import BookGrid from '../components/Book/BookGrid'
import Button from '../components/Common/Button'

const CategoryPage = () => {
  const { genreSlug } = useParams()
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [categoryName, setCategoryName] = useState('')

  useEffect(() => {
    if (genreSlug) {
      fetchBooksByCategory()
    }
  }, [genreSlug, currentPage])

  const fetchBooksByCategory = async () => {
    try {
      setLoading(true)
      // TODO: Implement proper genre/category filter when backend is ready
      const response = await bookService.getBooks({
        page: currentPage,
        limit: 24,
        // genreId or genreSlug parameter needed
        sortField: 'viewCount',
        sortOrder: 'DESC',
      })
      
      setBooks(response.data?.data || [])
      setTotalPages(Math.ceil((response.data?.total || 0) / 24))
      setCategoryName(genreSlug.replace(/-/g, ' ').toUpperCase())
    } catch (error) {
      console.error('Error fetching books by category:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 capitalize">{categoryName || 'Kategori'}</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Jelajahi buku dalam kategori ini
          </p>
        </div>

        <BookGrid books={books} loading={loading} />

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

export default CategoryPage
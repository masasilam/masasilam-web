// ============================================
// src/pages/AuthorPage.jsx
// ============================================

import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import bookService from '../services/bookService'
import BookGrid from '../components/Book/BookGrid'
import Button from '../components/Common/Button'
import { User } from 'lucide-react'

const AuthorPage = () => {
  const { authorSlug } = useParams()
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [authorName, setAuthorName] = useState('')

  useEffect(() => {
    if (authorSlug) {
      fetchBooksByAuthor()
    }
  }, [authorSlug, currentPage])

  const fetchBooksByAuthor = async () => {
    try {
      setLoading(true)
      // TODO: Implement proper author filter when backend is ready
      const response = await bookService.getBooks({
        page: currentPage,
        limit: 24,
        // authorId or authorSlug parameter needed
        sortField: 'updateAt',
        sortOrder: 'DESC',
      })
      
      setBooks(response.data?.data || [])
      setTotalPages(Math.ceil((response.data?.total || 0) / 24))
      setAuthorName(authorSlug.replace(/-/g, ' '))
    } catch (error) {
      console.error('Error fetching books by author:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Author Header */}
        <div className="mb-8 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-primary to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2 capitalize">{authorName || 'Penulis'}</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Koleksi buku karya penulis ini
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

export default AuthorPage
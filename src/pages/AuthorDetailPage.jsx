// ============================================
// src/pages/AuthorDetailPage.jsx - UPDATED
// ============================================

import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import bookService from '../services/bookService'
import BookGrid from '../components/Book/BookGrid'
import Button from '../components/Common/Button'
import LoadingSpinner from '../components/Common/LoadingSpinner'
import { User, BookOpen } from 'lucide-react'

const AuthorDetailPage = () => {
  const { authorSlug } = useParams()
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [author, setAuthor] = useState(null)

  useEffect(() => {
    if (authorSlug) {
      fetchAuthorInfo()
    }
  }, [authorSlug])

  useEffect(() => {
    if (author) {
      fetchBooksByAuthor()
    }
  }, [author, currentPage])

  const fetchAuthorInfo = async () => {
    try {
      // Fetch all authors to find the matching one
      const response = await bookService.getAuthors(1, 1000, authorSlug)
      const authors = response.data?.list || []
      const foundAuthor = authors.find(a => a.slug === authorSlug)
      
      if (foundAuthor) {
        setAuthor(foundAuthor)
      } else {
        console.warn('Author not found:', authorSlug)
        setAuthor({ 
          name: authorSlug.replace(/-/g, ' '),
          id: null 
        })
      }
    } catch (error) {
      console.error('Error fetching author info:', error)
      setAuthor({ 
        name: authorSlug.replace(/-/g, ' '),
        id: null 
      })
    }
  }

  const fetchBooksByAuthor = async () => {
    try {
      setLoading(true)
      
      // TODO: Backend belum support filter by authorId
      // Untuk sementara ambil semua buku dan filter di frontend
      const response = await bookService.getBooks({
        page: currentPage,
        limit: 24,
        // authorId: author.id, // Uncomment when backend supports this
        sortField: 'updateAt',
        sortOrder: 'DESC',
      })
      
      let booksList = response.data?.data || []
      
      // Filter by author name if author exists
      if (author.name) {
        booksList = booksList.filter(book => 
          book.authorNames?.toLowerCase().includes(author.name.toLowerCase())
        )
      }
      
      setBooks(booksList)
      setTotalPages(response.data?.totalPages || 1)
    } catch (error) {
      console.error('Error fetching books by author:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!author) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Author Header */}
        <div className="mb-8 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-primary to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            {author.photoUrl ? (
              <img
                src={author.photoUrl}
                alt={author.name}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <User className="w-12 h-12 text-white" />
            )}
          </div>
          <h1 className="text-4xl font-bold mb-2 capitalize">
            {author.name || 'Penulis'}
          </h1>
          {author.biography && (
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-4">
              {author.biography}
            </p>
          )}
          <p className="text-gray-500 dark:text-gray-500 text-sm">
            {author.bookCount ? `${author.bookCount} buku` : 'Koleksi buku karya penulis ini'}
          </p>
        </div>

        {loading && currentPage === 1 ? (
          <LoadingSpinner />
        ) : books.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">
              Belum ada buku dari penulis ini
            </p>
          </div>
        ) : (
          <>
            <BookGrid books={books} loading={loading && currentPage > 1} />

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
          </>
        )}
      </div>
    </div>
  )
}

export default AuthorDetailPage
// ============================================
// src/pages/AuthorsPage.jsx
// ============================================

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import bookService from '../services/bookService'
import LoadingSpinner from '../components/Common/LoadingSpinner'
import Button from '../components/Common/Button'
import Input from '../components/Common/Input'
import { User, BookOpen, Search } from 'lucide-react'

const AuthorsPage = () => {
  const [authors, setAuthors] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('name')

  useEffect(() => {
    fetchAuthors()
  }, [currentPage, sortBy])

  const fetchAuthors = async () => {
    try {
      setLoading(true)
      const response = await bookService.getAuthors(currentPage, 24, search, sortBy)
      
      const authorsList = response.data?.list || []
      setAuthors(authorsList)
      
      const total = response.data?.total || 0
      setTotalPages(Math.ceil(total / 24))
    } catch (error) {
      console.error('Error fetching authors:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchAuthors()
  }

  if (loading && currentPage === 1) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Daftar Penulis</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Jelajahi buku berdasarkan penulis favorit Anda
          </p>

          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Cari penulis..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </form>

            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value)
                setCurrentPage(1)
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="name">Nama A-Z</option>
              <option value="bookCount">Jumlah Buku</option>
              <option value="createdAt">Terbaru</option>
            </select>
          </div>
        </div>

        {authors.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">
              {search ? 'Penulis tidak ditemukan' : 'Belum ada penulis tersedia'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {authors.map((author) => (
                <Link
                  key={author.id}
                  to={`/penulis/${author.slug}`}
                  className="group bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md hover:shadow-xl transition-all hover:scale-105"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary to-purple-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      {author.photoUrl ? (
                        <img
                          src={author.photoUrl}
                          alt={author.name}
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-10 h-10 text-white" />
                      )}
                    </div>
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                      {author.name}
                    </h3>
                    {author.biography && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {author.biography}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <BookOpen className="w-4 h-4" />
                      <span>{author.bookCount || 0} buku</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
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

export default AuthorsPage
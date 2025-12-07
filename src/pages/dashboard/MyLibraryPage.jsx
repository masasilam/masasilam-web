// ============================================
// src/pages/dashboard/MyLibraryPage.jsx
// ============================================

import { useState, useEffect } from 'react'
import { userService } from '../../services/userService'
import BookGrid from '../../components/Book/BookGrid'
import Button from '../../components/Common/Button'

const MyLibraryPage = () => {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchLibrary()
  }, [currentPage])

  const fetchLibrary = async () => {
    try {
      setLoading(true)
      const response = await userService.getLibrary(currentPage, 12)
      setBooks(response.data?.data || [])
    } catch (error) {
      console.error('Error fetching library:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Perpustakaan Saya</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Buku yang telah Anda simpan
        </p>
      </div>

      <BookGrid books={books} loading={loading} emptyMessage="Belum ada buku di perpustakaan" />
      
      {books.length >= 12 && (
        <div className="mt-8 flex justify-center gap-2">
          <Button
            variant="secondary"
            onClick={() => setCurrentPage(prev => prev - 1)}
            disabled={currentPage === 1 || loading}
          >
            Sebelumnya
          </Button>
          <Button
            variant="secondary"
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={loading}
          >
            Selanjutnya
          </Button>
        </div>
      )}
    </div>
  )
}

export default MyLibraryPage
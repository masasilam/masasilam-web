// ============================================
// src/components/Book/BookGrid.jsx - RESPONSIVE OPTIMIZED
// ============================================

import BookCard from './BookCard'
import LoadingSpinner from '../Common/LoadingSpinner'

const BookGrid = ({ books, loading = false, emptyMessage = 'Tidak ada buku ditemukan' }) => {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!books || books.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
      {books.map(book => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  )
}

export default BookGrid
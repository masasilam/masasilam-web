// ============================================
// src/components/Book/BookCard.jsx - ENHANCED WITH COMPLETE STATS
// ============================================

import { Link } from 'react-router-dom'
import { Clock, Eye, Star, Download, BookOpen, MessageCircle } from 'lucide-react'

const BookCard = ({ book }) => {
  return (
    <Link
      to={`/buku/${book.slug}`}
      className="group block bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
    >
      {/* Cover Image */}
      <div className="aspect-[2/3] overflow-hidden bg-gray-100 dark:bg-gray-700">
        <img
          src={book.coverImageUrl || 'https://via.placeholder.com/300x450?text=No+Cover'}
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      {/* Book Info */}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 line-clamp-2 group-hover:text-primary transition-colors">
          {book.title}
        </h3>
        
        {(book.authorNames || book.authors) && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {book.authorNames || book.authors}
          </p>
        )}

        {/* Stats - Enhanced with more data */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-500">
          {/* Average Rating */}
          {book.averageRating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span>{book.averageRating.toFixed(1)}</span>
              {(book.totalRatings > 0 || book.ratingCount > 0) && (
                <span className="text-gray-400">({book.totalRatings || book.ratingCount})</span>
              )}
            </div>
          )}

          {/* View Count */}
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            <span>{book.viewCount || 0}</span>
          </div>

          {/* Download Count */}
          {(book.downloadCount > 0 || book.downloadCount === 0) && (
            <div className="flex items-center gap-1">
              <Download className="w-3 h-3" />
              <span>{book.downloadCount || 0}</span>
            </div>
          )}

          {/* Read Count */}
          {book.readCount > 0 && (
            <div className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              <span>{book.readCount}</span>
            </div>
          )}

          {/* Total Comments/Reviews */}
          {book.totalComments > 0 && (
            <div className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              <span>{book.totalComments}</span>
            </div>
          )}

          {/* Estimated Read Time */}
          {book.estimatedReadTime && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{book.estimatedReadTime} menit</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

export default BookCard
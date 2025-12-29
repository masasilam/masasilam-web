// ============================================
// src/components/Book/BookCard.jsx - RESPONSIVE OPTIMIZED
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
      <div className="p-3 sm:p-4">
        {/* Title - Word wrap enabled, no truncation */}
        <h3 className="font-semibold text-sm sm:text-base lg:text-lg mb-2 leading-snug group-hover:text-primary transition-colors break-words hyphens-auto">
          {book.title}
        </h3>

        {/* Author - Single line with ellipsis */}
        {(book.authorNames || book.authors) && (
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 truncate">
            {book.authorNames || book.authors}
          </p>
        )}

        {/* Stats - Responsive sizing */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-gray-500 dark:text-gray-500">
          {/* Average Rating */}
          {book.averageRating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs">{book.averageRating.toFixed(1)}</span>
              {(book.totalRatings > 0 || book.ratingCount > 0) && (
                <span className="hidden sm:inline text-gray-400 text-xs">
                  ({book.totalRatings || book.ratingCount})
                </span>
              )}
            </div>
          )}

          {/* View Count - Always show */}
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            <span className="text-xs">{book.viewCount || 0}</span>
          </div>

          {/* Read Count - Always show */}
          <div className="flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            <span className="text-xs">{book.readCount || 0}</span>
          </div>

          {/* Download Count - Always show */}
          <div className="flex items-center gap-1">
            <Download className="w-3 h-3" />
            <span className="text-xs">{book.downloadCount || 0}</span>
          </div>

          {/* Estimated Read Time - Always show */}
          {book.estimatedReadTime && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span className="text-xs">{book.estimatedReadTime}m</span>
            </div>
          )}

          {/* Total Comments - Only show if > 0 */}
          {book.totalComments > 0 && (
            <div className="hidden lg:flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              <span className="text-xs">{book.totalComments}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

export default BookCard
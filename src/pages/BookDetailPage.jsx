// ============================================
// src/pages/BookDetailPage.jsx - FIXED VERSION
// ============================================

import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  Book, BookOpen, Calendar, Clock, Download,
  Eye, Heart, Share2, Star, User, FileText, Globe, Building2, X
} from 'lucide-react'
import bookService from '../services/bookService'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from '../components/Common/LoadingSpinner'
import Button from '../components/Common/Button'
import Alert from '../components/Common/Alert'

// ============================================
// Rating Modal Component - FIXED LAYOUT
// ============================================
const RatingModal = ({ isOpen, onClose, onSubmit, bookTitle }) => {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [review, setReview] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0) {
      alert('Silakan pilih rating bintang')
      return
    }

    setSubmitting(true)
    await onSubmit({ rating, review })
    setSubmitting(false)

    // Reset form
    setRating(0)
    setReview('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold">Beri Rating & Ulasan</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Book Title */}
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Buku:</p>
            <p className="font-medium">{bookTitle}</p>
          </div>

          {/* ✅ FIXED: Star Rating with Proper Layout */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Rating Bintang <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 items-center">
              {[1, 2, 3, 4, 5].map((star) => {
                const isHalfFilled = (hoverRating || rating) === star - 0.5
                const isFullFilled = (hoverRating || rating) >= star

                return (
                  <div key={star} className="relative cursor-pointer group">
                    {/* Full Star Background */}
                    <Star
                      className={`w-12 h-12 transition-all ${
                        isFullFilled
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'fill-gray-200 text-gray-300 dark:fill-gray-700 dark:text-gray-600'
                      } group-hover:scale-110`}
                    />

                    {/* Half Star Overlay (Left Half) */}
                    {isHalfFilled && !isFullFilled && (
                      <Star
                        className="w-12 h-12 absolute top-0 left-0 fill-yellow-400 text-yellow-400 transition-all"
                        style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' }}
                      />
                    )}

                    {/* Click handlers */}
                    <div className="absolute inset-0 flex">
                      {/* Left half click area */}
                      <button
                        type="button"
                        className="w-1/2 h-full focus:outline-none"
                        onClick={() => setRating(star - 0.5)}
                        onMouseEnter={() => setHoverRating(star - 0.5)}
                        onMouseLeave={() => setHoverRating(0)}
                      />
                      {/* Right half click area */}
                      <button
                        type="button"
                        className="w-1/2 h-full focus:outline-none"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Rating Description */}
            {rating > 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                {rating === 0.5 && '⭐ 0.5 - Sangat Buruk'}
                {rating === 1 && '⭐ 1.0 - Sangat Buruk'}
                {rating === 1.5 && '⭐ 1.5 - Buruk'}
                {rating === 2 && '⭐⭐ 2.0 - Buruk'}
                {rating === 2.5 && '⭐⭐ 2.5 - Kurang'}
                {rating === 3 && '⭐⭐⭐ 3.0 - Cukup'}
                {rating === 3.5 && '⭐⭐⭐ 3.5 - Lumayan'}
                {rating === 4 && '⭐⭐⭐⭐ 4.0 - Bagus'}
                {rating === 4.5 && '⭐⭐⭐⭐ 4.5 - Sangat Bagus'}
                {rating === 5 && '⭐⭐⭐⭐⭐ 5.0 - Sempurna'}
              </p>
            )}
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Ulasan (Opsional)
            </label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Tulis ulasan Anda tentang buku ini..."
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {review.length}/500 karakter
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={onClose}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={submitting}
              disabled={submitting || rating === 0}
            >
              {submitting ? 'Mengirim...' : 'Kirim Rating'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ============================================
// Main Book Detail Page Component
// ============================================
const BookDetailPage = () => {
  const { bookSlug } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [downloadLoading, setDownloadLoading] = useState(false)
  const [readingLoading, setReadingLoading] = useState(false)
  const [error, setError] = useState(null)

  // Rating Modal State
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false)

  useEffect(() => {
    fetchBookDetail()
  }, [bookSlug])

  const fetchBookDetail = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await bookService.getBookBySlug(bookSlug)
      setBook(response)
    } catch (error) {
      console.error('❌ Error fetching book:', error)
      setError('Buku tidak ditemukan')
    } finally {
      setLoading(false)
    }
  }

  const handleStartReading = async () => {
    try {
      setReadingLoading(true)
      const lastReadSlug = localStorage.getItem(`lastChapter_${bookSlug}`)

      if (lastReadSlug) {
        navigate(`/buku/${bookSlug}/${lastReadSlug}`)
        return
      }

      navigate(`/buku/${bookSlug}/daftar-isi`)
    } catch (error) {
      console.error('❌ Error starting reading:', error)
      alert(`❌ Gagal memulai membaca: ${error.message || 'Unknown error'}`)
    } finally {
      setReadingLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!book.fileUrl) {
      alert('File buku tidak tersedia')
      return
    }

    try {
      setDownloadLoading(true)
      const link = document.createElement('a')
      link.href = book.fileUrl
      link.download = `${book.title}.${book.fileFormat || 'epub'}`
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('❌ Error downloading book:', error)
      alert('Gagal mengunduh buku')
    } finally {
      setDownloadLoading(false)
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: book.title,
      text: `Baca "${book.title}" oleh ${book.authorNames}`,
      url: window.location.href
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(window.location.href)
        alert('✅ Link berhasil disalin ke clipboard!')
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('❌ Error sharing:', error)
      }
    }
  }

  const handleAddToFavorite = async () => {
    if (!isAuthenticated) {
      alert('Silakan login terlebih dahulu')
      navigate('/login')
      return
    }

    try {
      alert('Fitur favorite akan segera hadir!')
    } catch (error) {
      console.error('❌ Error adding to favorite:', error)
      alert('Gagal menambahkan ke favorit')
    }
  }

  const handleOpenRatingModal = () => {
    if (!isAuthenticated) {
      alert('Silakan login terlebih dahulu untuk memberi rating')
      navigate('/login')
      return
    }
    setIsRatingModalOpen(true)
  }

  /**
   * ✅ FIXED: Handle Submit Rating - Separate rating and review
   */
  const handleSubmitRating = async (ratingData) => {
    try {
      // ✅ Step 1: Submit rating ONLY (always required)
      await bookService.addRating(bookSlug, {
        rating: ratingData.rating
      })

      // ✅ Step 2: Submit review ONLY if user wrote something (optional)
      if (ratingData.review && ratingData.review.trim()) {
        try {
          await bookService.addReview(bookSlug, {
            comment: ratingData.review,
            title: null
          })
          alert('✅ Rating dan ulasan berhasil ditambahkan!')
        } catch (reviewError) {
          // If review fails (e.g., already exists), show specific message
          console.warn('⚠️ Review error:', reviewError)
          alert('✅ Rating berhasil ditambahkan, tapi ulasan gagal disimpan. Mungkin Anda sudah pernah memberi ulasan sebelumnya.')
        }
      } else {
        alert('✅ Rating berhasil ditambahkan!')
      }

      setIsRatingModalOpen(false)

      // Refresh book data
      fetchBookDetail()

    } catch (error) {
      console.error('❌ Error submitting rating:', error)

      // ✅ Better error handling
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error'

      if (errorMessage.includes('already have a rating')) {
        alert('❌ Anda sudah pernah memberi rating. Gunakan tombol edit untuk mengubah rating Anda.')
      } else if (errorMessage.includes('already have a review')) {
        alert('❌ Anda sudah pernah memberi ulasan. Gunakan tombol edit untuk mengubah ulasan Anda.')
      } else {
        alert(`❌ Gagal menambahkan rating: ${errorMessage}`)
      }
    }
  }

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  if (error || !book) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert type="error" message={error || 'Buku tidak ditemukan'} />
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Book Cover */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <img
                src={book.coverImageUrl || 'https://via.placeholder.com/400x600?text=No+Cover'}
                alt={book.title}
                className="w-full rounded-lg shadow-lg"
              />

              <div className="mt-6 space-y-3">
                <Button
                  fullWidth
                  variant="primary"
                  size="lg"
                  onClick={handleStartReading}
                  loading={readingLoading}
                  disabled={readingLoading}
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  {readingLoading ? 'Memuat...' : 'Mulai Membaca'}
                </Button>

                <Button
                  fullWidth
                  variant="secondary"
                  onClick={handleDownload}
                  loading={downloadLoading}
                  disabled={downloadLoading || !book.fileUrl}
                >
                  <Download className="w-5 h-5 mr-2" />
                  {downloadLoading ? 'Mengunduh...' : 'Unduh EPUB'}
                </Button>

                <div className="grid grid-cols-3 gap-2">
                  <Button
                    fullWidth
                    variant="outline"
                    onClick={handleAddToFavorite}
                    className="flex-col py-3"
                  >
                    <Heart className="w-5 h-5 mb-1" />
                    <span className="text-xs">Favorit</span>
                  </Button>

                  <Button
                    fullWidth
                    variant="outline"
                    onClick={handleOpenRatingModal}
                    className="flex-col py-3"
                  >
                    <Star className="w-5 h-5 mb-1" />
                    <span className="text-xs">Rating</span>
                  </Button>

                  <Button
                    fullWidth
                    variant="outline"
                    onClick={handleShare}
                    className="flex-col py-3"
                  >
                    <Share2 className="w-5 h-5 mb-1" />
                    <span className="text-xs">Bagikan</span>
                  </Button>
                </div>
              </div>

              {/* Additional Info Card */}
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3 text-sm">
                {book.publisher && (
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-gray-500 text-xs">Penerbit</div>
                      <div className="font-medium">{book.publisher}</div>
                    </div>
                  </div>
                )}

                {book.language && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-gray-500 text-xs">Bahasa</div>
                      <div className="font-medium">{book.language}</div>
                    </div>
                  </div>
                )}

                {book.totalWord && (
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-gray-500 text-xs">Total Kata</div>
                      <div className="font-medium">{book.totalWord.toLocaleString()} kata</div>
                    </div>
                  </div>
                )}

                {book.edition && (
                  <div className="flex items-center gap-2">
                    <Book className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-gray-500 text-xs">Edisi</div>
                      <div className="font-medium">Edisi {book.edition}</div>
                    </div>
                  </div>
                )}

                {book.copyrightStatus && (
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-gray-500 text-xs">Status Hak Cipta</div>
                    <div className="font-medium text-green-600 dark:text-green-400">
                      {book.copyrightStatus}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Book Info */}
          <div className="lg:col-span-2">
            <h1 className="text-4xl font-bold mb-2">{book.title}</h1>

            {book.subtitle && (
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
                {book.subtitle}
              </p>
            )}

            {book.authorNames && (
              <div className="flex items-center gap-2 mb-6">
                <User className="w-5 h-5 text-gray-500" />
                <span className="text-lg">{book.authorNames}</span>
              </div>
            )}

            {/* Stats */}
            <div className="flex flex-wrap gap-6 mb-6 text-sm text-gray-600 dark:text-gray-400">
              {book.averageRating > 0 && (
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{book.averageRating.toFixed(1)}</span>
                  <span className="text-xs">({book.totalRatings} rating)</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                <span>{book.viewCount || 0} views</span>
              </div>
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                <span>{book.downloadCount || 0} unduhan</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                <span>{book.readCount || 0} pembaca</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{book.estimatedReadTime} menit</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{book.publicationYear}</span>
              </div>
            </div>

            {/* Genres */}
            {book.genres && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {book.genres.split(',').reverse().map((genre, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm hover:bg-primary hover:text-white transition-colors cursor-pointer"
                    >
                      {genre.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Contributors */}
            {book.contributors && (
              <div className="mb-8">
                <h3 className="font-semibold mb-3">Kontributor</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {book.contributors}
                </p>
              </div>
            )}

            {/* Description */}
            <div className="prose dark:prose-invert max-w-none mb-8">
              <h2 className="text-2xl font-bold mb-4">Deskripsi</h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                {book.description || 'Tidak ada deskripsi tersedia.'}
              </p>
            </div>

            {/* Category Badge */}
            {book.category && (
              <div className="mb-6">
                <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  {book.category}
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
              <div className="flex gap-4">
                <Link to={`/buku/${bookSlug}/daftar-isi`}>
                  <Button variant="secondary">
                    <Book className="w-5 h-5 mr-2" />
                    Daftar Isi
                  </Button>
                </Link>
                {/* ✅ FIXED: Use button with onClick instead of Link */}
                <Button
                  variant="secondary"
                  onClick={() => navigate(`/buku/${bookSlug}/ulasan`)}
                >
                  <Star className="w-5 h-5 mr-2" />
                  Lihat Ulasan
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        onSubmit={handleSubmitRating}
        bookTitle={book.title}
      />
    </div>
  )
}

export default BookDetailPage
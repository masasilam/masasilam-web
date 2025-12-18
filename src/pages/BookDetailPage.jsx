// ============================================
// src/pages/BookDetailPage.jsx - COMPLETE FIXED VERSION
// ============================================

import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  Book, BookOpen, Calendar, Clock, Download,
  Eye, Heart, Share2, Star, User, FileText, Globe, Building2, X, MessageCircle, ThumbsUp, ArrowLeft
} from 'lucide-react'
import bookService from '../services/bookService'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from '../components/Common/LoadingSpinner'
import Button from '../components/Common/Button'
import Alert from '../components/Common/Alert'

// ============================================
// Rating Modal Component - RATING ONLY (NO REVIEW)
// ============================================
const RatingModal = ({ isOpen, onClose, onSubmit, bookTitle }) => {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0) {
      alert('Silakan pilih rating bintang')
      return
    }

    setSubmitting(true)
    await onSubmit({ rating })
    setSubmitting(false)

    // Reset form
    setRating(0)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold">Beri Rating</h2>
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

          {/* Star Rating */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Rating Bintang <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 items-center justify-center">
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
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 text-center">
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
  const [userRating, setUserRating] = useState(null)
  const [ratingStats, setRatingStats] = useState(null)
  const [recentReviews, setRecentReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [showRatingStats, setShowRatingStats] = useState(false)
  const [showBookDetails, setShowBookDetails] = useState(false)

  useEffect(() => {
    fetchBookDetail()
    if (isAuthenticated) {
      fetchUserRating()
    }
    fetchRatingStats()
    fetchRecentReviews()
  }, [bookSlug, isAuthenticated])

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

  const fetchUserRating = async () => {
    try {
      const response = await bookService.getMyRating(bookSlug)
      if (response.data) {
        setUserRating(response.data)
      }
    } catch (error) {
      // User hasn't rated yet
      setUserRating(null)
    }
  }

  const fetchRatingStats = async () => {
    try {
      const response = await bookService.getRatingStats(bookSlug)
      if (response.data) {
        setRatingStats(response.data)
      }
    } catch (error) {
      console.error('Error fetching rating stats:', error)
    }
  }

  const fetchRecentReviews = async () => {
    try {
      setReviewsLoading(true)
      const response = await bookService.getReviews(bookSlug, 1, 5, 'helpful')
      
      // Backend returns: { data: { page, limit, total, list } }
      const reviewsList = response.data?.list || []
      
      console.log('📝 Reviews fetched:', reviewsList.length, reviewsList)
      setRecentReviews(reviewsList)
    } catch (error) {
      console.error('Error fetching recent reviews:', error)
      setRecentReviews([])
    } finally {
      setReviewsLoading(false)
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
      navigate('/masuk')
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
      navigate('/masuk')
      return
    }
    setIsRatingModalOpen(true)
  }

  const handleDeleteRating = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus rating Anda?')) {
      return
    }

    try {
      await bookService.deleteRating(bookSlug)
      alert('✅ Rating berhasil dihapus!')
      setUserRating(null)
      fetchBookDetail()
      fetchRatingStats()
    } catch (error) {
      console.error('❌ Error deleting rating:', error)
      alert('❌ Gagal menghapus rating')
    }
  }

  /**
   * Handle Submit Rating (Rating Only, No Review)
   */
  const handleSubmitRating = async (ratingData) => {
    try {
      await bookService.addRating(bookSlug, {
        rating: ratingData.rating
      })

      alert('✅ Rating berhasil ditambahkan!')

      setIsRatingModalOpen(false)
      fetchBookDetail()
      fetchUserRating()
      fetchRatingStats()

    } catch (error) {
      console.error('❌ Error submitting rating:', error)
      const errorMessage = error.response?.data?.detail || error.message || 'Unknown error'
      alert(`❌ Gagal menambahkan rating: ${errorMessage}`)
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
        {/* ✅ Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-sm mb-4 overflow-x-auto">
          <Link
            to="/"
            className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors whitespace-nowrap"
          >
            Beranda
          </Link>
          <span className="text-gray-400">/</span>
          <Link
            to="/buku"
            className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors whitespace-nowrap"
          >
            Koleksi Buku
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 dark:text-white font-medium truncate">
            {book.title}
          </span>
        </nav>

        {/* ✅ NEW: Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors mb-6 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Kembali</span>
        </button>

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

                <div className="grid grid-cols-4 gap-2">
                  <Button
                    fullWidth
                    variant="outline"
                    onClick={() => navigate(`/buku/${bookSlug}/daftar-isi`)}
                    className="flex-col py-3"
                  >
                    <Book className="w-5 h-5 mb-1" />
                    <span className="text-xs">Daftar Isi</span>
                  </Button>

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
                    variant={userRating ? "primary" : "outline"}
                    onClick={handleOpenRatingModal}
                    className="flex-col py-3"
                  >
                    <Star className={`w-5 h-5 mb-1 ${userRating ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                    <span className="text-xs">
                      {book.averageRating > 0 ? `${book.averageRating.toFixed(1)}⭐` : 'Beri Rating'}
                    </span>
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

                {/* User Rating Info */}
                {userRating && (
                  <div className="mt-4 p-3 bg-primary/5 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">Rating Anda: {userRating.rating}</span>
                      </div>
                      <button
                        onClick={handleDeleteRating}
                        className="text-xs text-red-500 hover:text-red-700 transition-colors"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                )}
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

                {book.updatedAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-gray-500 text-xs">Edisi Terakhir</div>
                      <div className="font-medium">
                        {new Date(book.updatedAt).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {book.createdAt && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-gray-500 text-xs">Ditambahkan</div>
                      <div className="font-medium">
                        {new Date(book.createdAt).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
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

                {book.source && (
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-gray-500 text-xs mb-1">Sumber Digital</div>
                    <a
                      href={book.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm break-all flex items-center gap-1"
                    >
                      <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      <span className="truncate">{book.source}</span>
                    </a>
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

            {/* Featured & Status Badges */}
            <div className="flex items-center gap-2 mb-4">
              {book.isFeatured && (
                <span className="inline-flex items-center px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full text-sm font-medium">
                  <Star className="w-4 h-4 mr-1 fill-current" />
                  Featured
                </span>
              )}
              
              {book.isActive === false && (
                <span className="inline-flex items-center px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full text-sm font-medium">
                  Tidak Aktif
                </span>
              )}
            </div>

            {book.authorNames && (
              <div className="flex items-center gap-2 mb-6">
                <User className="w-5 h-5 text-gray-500" />
                {book.authorNames.split(',').map((author, index, arr) => {
                  const authorName = author.trim()
                  const authorSlug = authorName.toLowerCase().replace(/\s+/g, '-')
                  
                  return (
                    <span key={index}>
                      <Link
                        to={`/penulis/${authorSlug}`}
                        className="text-lg hover:text-primary hover:underline transition-colors"
                      >
                        {authorName}
                      </Link>
                      {index < arr.length - 1 && <span className="text-gray-500">, </span>}
                    </span>
                  )
                })}
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
                  {book.genres.split(',').reverse().map((genre, index) => {
                    const genreName = genre.trim()
                    const genreSlug = genreName.toLowerCase().replace(/\s+/g, '-')
                    
                    return (
                      <Link
                        key={index}
                        to={`/kategori/${genreSlug}`}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm hover:bg-primary hover:text-white transition-colors cursor-pointer"
                      >
                        {genreName}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Category Badge */}
            {book.category && (
              <div className="mb-8">
                <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  {book.category}
                </span>
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

            {/* Detailed Book Information (Collapsible) */}
            <div className="mb-8">
              <button
                onClick={() => setShowBookDetails(!showBookDetails)}
                className="flex items-center justify-between w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-500" />
                  <span className="font-semibold">Detail Buku Lengkap</span>
                </div>
                <svg
                  className={`w-5 h-5 transition-transform ${showBookDetails ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showBookDetails && (
                <div className="mt-3 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left Column */}
                    <div className="space-y-3">
                      {book.fileFormat && (
                        <div>
                          <div className="text-xs text-gray-500 uppercase mb-1">Format File</div>
                          <div className="font-medium">{book.fileFormat.toUpperCase()}</div>
                        </div>
                      )}

                      {book.fileSize && (
                        <div>
                          <div className="text-xs text-gray-500 uppercase mb-1">Ukuran File</div>
                          <div className="font-medium">
                            {(book.fileSize / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                      )}

                      {book.totalPages && (
                        <div>
                          <div className="text-xs text-gray-500 uppercase mb-1">Total Halaman</div>
                          <div className="font-medium">{book.totalPages} halaman</div>
                        </div>
                      )}

                      {book.totalWord && (
                        <div>
                          <div className="text-xs text-gray-500 uppercase mb-1">Total Kata</div>
                          <div className="font-medium">{book.totalWord.toLocaleString()} kata</div>
                        </div>
                      )}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-3">
                      {book.publicationYear && (
                        <div>
                          <div className="text-xs text-gray-500 uppercase mb-1">Tahun Terbit</div>
                          <div className="font-medium">{book.publicationYear}</div>
                        </div>
                      )}

                      {book.publishedAt && (
                        <div>
                          <div className="text-xs text-gray-500 uppercase mb-1">Tanggal Terbit</div>
                          <div className="font-medium">
                            {new Date(book.publishedAt).toLocaleDateString('id-ID', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                      )}

                      {book.createdAt && (
                        <div>
                          <div className="text-xs text-gray-500 uppercase mb-1">Ditambahkan ke Perpustakaan</div>
                          <div className="font-medium">
                            {new Date(book.createdAt).toLocaleDateString('id-ID', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                      )}

                      {book.updatedAt && (
                        <div>
                          <div className="text-xs text-gray-500 uppercase mb-1">Edisi Terakhir Diperbarui</div>
                          <div className="font-medium">
                            {new Date(book.updatedAt).toLocaleDateString('id-ID', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Source Link */}
                  {book.source && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-xs text-gray-500 uppercase mb-2">Sumber Digital</div>
                      <a
                        href={book.source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline break-all flex items-center gap-2"
                      >
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        {book.source}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Rating Statistics - Collapsible */}
            {ratingStats && ratingStats.totalRatings > 0 && (
              <div className="mb-8">
                <button
                  onClick={() => setShowRatingStats(!showRatingStats)}
                  className="flex items-center justify-between w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">Statistik Rating</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      ({ratingStats.totalRatings} rating)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">{ratingStats.averageRating.toFixed(1)}</span>
                    <svg
                      className={`w-5 h-5 transition-transform ${showRatingStats ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {showRatingStats && (
                  <div className="mt-3 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="space-y-2">
                      {/* ✅ FIXED: Match backend field names (rating50Count, rating45Count, etc.) */}
                      {[
                        { value: 5.0, label: '5.0', count: ratingStats.rating50Count },
                        { value: 4.5, label: '4.5', count: ratingStats.rating45Count },
                        { value: 4.0, label: '4.0', count: ratingStats.rating40Count },
                        { value: 3.5, label: '3.5', count: ratingStats.rating35Count },
                        { value: 3.0, label: '3.0', count: ratingStats.rating30Count },
                        { value: 2.5, label: '2.5', count: ratingStats.rating25Count },
                        { value: 2.0, label: '2.0', count: ratingStats.rating20Count },
                        { value: 1.5, label: '1.5', count: ratingStats.rating15Count },
                        { value: 1.0, label: '1.0', count: ratingStats.rating10Count },
                        { value: 0.5, label: '0.5', count: ratingStats.rating05Count },
                      ].map(({ value, label, count }) => {
                        const percentage = ratingStats.totalRatings > 0 
                          ? ((count || 0) / ratingStats.totalRatings * 100).toFixed(1)
                          : 0

                        // Skip if count is 0 (optional - for cleaner UI)
                        if (count === 0) return null

                        return (
                          <div key={value} className="flex items-center gap-3">
                            <div className="flex items-center gap-1 w-20">
                              <span className="text-sm font-medium">{label}</span>
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            </div>
                            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-yellow-400 transition-all"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400 w-24 text-right">
                              {count} ({percentage}%)
                            </span>
                          </div>
                        )
                      })}
                    </div>

                    {/* Show message if all ratings are 0 */}
                    {[
                      ratingStats.rating50Count,
                      ratingStats.rating45Count,
                      ratingStats.rating40Count,
                      ratingStats.rating35Count,
                      ratingStats.rating30Count,
                      ratingStats.rating25Count,
                      ratingStats.rating20Count,
                      ratingStats.rating15Count,
                      ratingStats.rating10Count,
                      ratingStats.rating05Count,
                    ].every(count => count === 0) && (
                      <p className="text-center text-gray-500 dark:text-gray-400">
                        Belum ada distribusi rating
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Recent Reviews Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Ulasan Paling Membantu</h2>
                <div className="flex gap-2">
                  {!isAuthenticated ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate('/masuk')}
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Tulis Ulasan
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate(`/buku/${bookSlug}/ulasan`)}
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Tulis Ulasan
                    </Button>
                  )}
                  {recentReviews.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/buku/${bookSlug}/ulasan`)}
                    >
                      Lihat Semua
                    </Button>
                  )}
                </div>
              </div>

              {reviewsLoading ? (
                <div className="text-center py-8">
                  <LoadingSpinner />
                </div>
              ) : recentReviews.length === 0 ? (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Belum ada ulasan untuk buku ini
                  </p>
                  {!isAuthenticated ? (
                    <Button
                      variant="primary"
                      onClick={() => navigate('/masuk')}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Login untuk Memberi Ulasan
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={() => navigate(`/buku/${bookSlug}/ulasan`)}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Jadilah yang Pertama Memberi Ulasan
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {recentReviews.map((review) => (
                    <div
                      key={review.id}
                      className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow"
                    >
                      {/* Reviewer Info */}
                      <div className="flex items-start gap-4 mb-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          {review.userPhotoUrl ? (
                            <img
                              src={review.userPhotoUrl}
                              alt={review.userName}
                              className="w-10 h-10 rounded-full"
                            />
                          ) : (
                            <User className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold truncate">{review.userName}</h4>
                            {review.isOwner && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded flex-shrink-0">
                                Anda
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString('id-ID', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Review Content */}
                      {review.title && (
                        <h3 className="font-semibold text-lg mb-2">{review.title}</h3>
                      )}
                      <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
                        {review.content}
                      </p>

                      {/* Review Stats */}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="w-4 h-4" />
                          <span>{review.helpfulCount || 0} membantu</span>
                        </div>
                        {review.replyCount > 0 && (
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            <span>{review.replyCount} balasan</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
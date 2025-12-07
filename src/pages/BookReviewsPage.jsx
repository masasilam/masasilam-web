// ============================================
// src/pages/BookReviewsPage.jsx
// ============================================

import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import  bookService  from '../services/bookService'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from '../components/Common/LoadingSpinner'
import Button from '../components/Common/Button'
import Input from '../components/Common/Input'
import Alert from '../components/Common/Alert'
import { Star, ThumbsUp, MessageCircle, User } from 'lucide-react'
import { formatRelativeTime } from '../utils/helpers'

const BookReviewsPage = () => {
  const { bookSlug } = useParams()
  const { isAuthenticated } = useAuth()
  const [book, setBook] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [showAddReview, setShowAddReview] = useState(false)
  const [reviewText, setReviewText] = useState('')
  const [reviewTitle, setReviewTitle] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchData()
  }, [bookSlug, currentPage])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [bookResponse, reviewsResponse] = await Promise.all([
        bookService.getBookBySlug(bookSlug),
        bookService.getReviews(bookSlug, currentPage, 10)
      ])
      
      setBook(bookResponse.data)
      setReviews(reviewsResponse.data?.data || [])
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async () => {
    if (!reviewText.trim()) {
      setError('Ulasan tidak boleh kosong')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      await bookService.addReview(bookSlug, {
        comment: reviewText,
        title: reviewTitle || null
      })
      
      setReviewText('')
      setReviewTitle('')
      setShowAddReview(false)
      fetchData() // Refresh reviews
    } catch (err) {
      setError('Gagal menambahkan ulasan')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading && !book) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link to={`/buku/${bookSlug}`} className="text-primary hover:underline mb-2 inline-block">
            ← Kembali ke Detail Buku
          </Link>
          <h1 className="text-4xl font-bold mb-2">Ulasan & Komentar</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {book?.title}
          </p>
        </div>

        {/* Add Review Section */}
        {isAuthenticated && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            {!showAddReview ? (
              <Button onClick={() => setShowAddReview(true)} fullWidth>
                Tulis Ulasan
              </Button>
            ) : (
              <div className="space-y-4">
                <Input
                  label="Judul Ulasan (Opsional)"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="Ringkasan singkat ulasan Anda"
                />
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Ulasan Anda <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    rows="5"
                    placeholder="Bagikan pendapat Anda tentang buku ini..."
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                  />
                </div>

                {error && <Alert type="error" message={error} onClose={() => setError('')} />}

                <div className="flex gap-3">
                  <Button onClick={handleSubmitReview} loading={submitting}>
                    Kirim Ulasan
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={() => {
                      setShowAddReview(false)
                      setReviewText('')
                      setReviewTitle('')
                      setError('')
                    }}
                  >
                    Batal
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-6">
          {reviews.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="font-semibold text-lg mb-2">Belum Ada Ulasan</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Jadilah yang pertama memberikan ulasan untuk buku ini
              </p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                {/* Reviewer Info */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{review.userName}</h4>
                    <p className="text-sm text-gray-500">
                      {formatRelativeTime(review.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Review Content */}
                {review.title && (
                  <h3 className="font-semibold text-lg mb-2">{review.title}</h3>
                )}
                <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-line">
                  {review.comment}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <button className="flex items-center gap-1 hover:text-primary transition-colors">
                    <ThumbsUp className="w-4 h-4" />
                    <span>{review.likeCount || 0}</span>
                  </button>
                  {review.replies && review.replies.length > 0 && (
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{review.replies.length} balasan</span>
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {reviews.length >= 10 && (
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
    </div>
  )
}

export default BookReviewsPage
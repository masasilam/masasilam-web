// ============================================
// src/pages/BookReviewsPage.jsx - FIXED VERSION
// ============================================

import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import bookService from '../services/bookService'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from '../components/Common/LoadingSpinner'
import Button from '../components/Common/Button'
import Input from '../components/Common/Input'
import Alert from '../components/Common/Alert'
import { Star, ThumbsUp, MessageCircle, User, Edit2, Trash2 } from 'lucide-react'
import { formatRelativeTime } from '../utils/helpers'

const BookReviewsPage = () => {
  const { bookSlug } = useParams()
  const { isAuthenticated, user } = useAuth()
  const [book, setBook] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [showAddReview, setShowAddReview] = useState(false)
  const [reviewText, setReviewText] = useState('')
  const [reviewTitle, setReviewTitle] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // 🆕 State for editing
  const [isEditing, setIsEditing] = useState(false)
  const [existingReview, setExistingReview] = useState(null)

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

      setBook(bookResponse.data || bookResponse)
      const reviewsList = reviewsResponse.data?.data || reviewsResponse.data || []
      setReviews(reviewsList)

      // 🆕 Check if current user already has a review
      if (isAuthenticated && user) {
        const userReview = reviewsList.find(r => r.userId === user.id || r.userName === user.username)
        if (userReview) {
          setExistingReview(userReview)
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
      setError('Gagal memuat ulasan')
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
      if (isEditing && existingReview) {
        // 🆕 Update existing review
        await bookService.updateReview(bookSlug, {
          comment: reviewText,
          title: reviewTitle || null
        })
      } else {
        // Add new review
        await bookService.addReview(bookSlug, {
          comment: reviewText,
          title: reviewTitle || null
        })
      }

      setReviewText('')
      setReviewTitle('')
      setShowAddReview(false)
      setIsEditing(false)
      setExistingReview(null)
      fetchData() // Refresh reviews

      alert(isEditing ? '✅ Ulasan berhasil diperbarui!' : '✅ Ulasan berhasil ditambahkan!')
    } catch (err) {
      console.error('Error submitting review:', err)
      const errorMsg = err.response?.data?.message || err.message || 'Gagal menambahkan ulasan'

      // 🆕 Handle "already have review" error
      if (errorMsg.includes('already have a review')) {
        setError('Anda sudah memiliki ulasan untuk buku ini. Silakan edit ulasan yang ada.')
        // Fetch data again to get the existing review
        fetchData()
      } else {
        setError(errorMsg)
      }
    } finally {
      setSubmitting(false)
    }
  }

  // 🆕 Handle edit review
  const handleEditReview = (review) => {
    setReviewText(review.comment)
    setReviewTitle(review.title || '')
    setIsEditing(true)
    setShowAddReview(true)
    setError('')
  }

  // 🆕 Handle delete review
  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Apakah Anda yakin ingin menghapus ulasan ini?')) {
      return
    }

    try {
      await bookService.deleteReview(bookSlug)
      alert('✅ Ulasan berhasil dihapus!')
      setExistingReview(null)
      fetchData()
    } catch (err) {
      console.error('Error deleting review:', err)
      alert('❌ Gagal menghapus ulasan')
    }
  }

  // 🆕 Handle cancel edit
  const handleCancelEdit = () => {
    setShowAddReview(false)
    setIsEditing(false)
    setReviewText('')
    setReviewTitle('')
    setError('')
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

        {/* Add/Edit Review Section */}
        {isAuthenticated && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            {!showAddReview ? (
              <div>
                {existingReview ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Anda sudah memberikan ulasan untuk buku ini
                    </p>
                    <Button onClick={() => handleEditReview(existingReview)} fullWidth>
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit Ulasan Anda
                    </Button>
                  </div>
                ) : (
                  <Button onClick={() => setShowAddReview(true)} fullWidth>
                    Tulis Ulasan
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">
                    {isEditing ? 'Edit Ulasan' : 'Tulis Ulasan'}
                  </h3>
                  {isEditing && (
                    <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      Mode Edit
                    </span>
                  )}
                </div>

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
                    {isEditing ? 'Perbarui Ulasan' : 'Kirim Ulasan'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleCancelEdit}
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
            reviews.map((review) => {
              const isOwnReview = isAuthenticated && user && (review.userId === user.id || review.userName === user.username)

              return (
                <div key={review.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  {/* Reviewer Info */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{review.userName}</h4>
                          {isOwnReview && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                              Anda
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {formatRelativeTime(review.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* 🆕 Edit/Delete buttons for own review */}
                    {isOwnReview && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditReview(review)}
                          className="p-2 text-gray-500 hover:text-primary transition-colors"
                          title="Edit ulasan"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                          title="Hapus ulasan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
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
                    {review.replyCount > 0 && (
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{review.replyCount} balasan</span>
                      </span>
                    )}
                  </div>
                </div>
              )
            })
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
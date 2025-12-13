// ============================================
// src/pages/BookReviewsPage.jsx - COMPLETE IMPLEMENTATION
// ============================================

import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import bookService from '../services/bookService'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from '../components/Common/LoadingSpinner'
import Button from '../components/Common/Button'
import Input from '../components/Common/Input'
import Alert from '../components/Common/Alert'
import { Star, ThumbsUp, ThumbsDown, MessageCircle, User, Edit2, Trash2, Send } from 'lucide-react'
import { formatRelativeTime } from '../utils/helpers'

const BookReviewsPage = () => {
  const { bookSlug } = useParams()
  const { isAuthenticated, user } = useAuth()
  const [book, setBook] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sortBy, setSortBy] = useState('helpful') // helpful, recent
  const [showAddReview, setShowAddReview] = useState(false)
  const [reviewText, setReviewText] = useState('')
  const [reviewTitle, setReviewTitle] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // State for editing
  const [isEditing, setIsEditing] = useState(false)
  const [existingReview, setExistingReview] = useState(null)

  // State for replies
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [replySubmitting, setReplySubmitting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [bookSlug, currentPage, sortBy])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [bookResponse, reviewsResponse] = await Promise.all([
        bookService.getBookBySlug(bookSlug),
        bookService.getReviews(bookSlug, currentPage, 10, sortBy)
      ])

      setBook(bookResponse.data || bookResponse)
      
      // Backend returns: { data: { page, limit, total, list } }
      const reviewsData = reviewsResponse.data?.list || []
      setReviews(reviewsData)
      
      const total = reviewsResponse.data?.total || 0
      setTotalPages(Math.ceil(total / 10))
      
      console.log('📝 Reviews loaded:', reviewsData.length, 'Total:', total)

      // Check if current user already has a review
      if (isAuthenticated && user) {
        try {
          const myReviewResponse = await bookService.getMyReview(bookSlug)
          if (myReviewResponse.data) {
            setExistingReview(myReviewResponse.data)
          }
        } catch (err) {
          // No review found
          setExistingReview(null)
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
      setError('Gagal memuat ulasan')
    } finally {
      setLoading(false)
    }
  }

  // ============================================
  // REVIEW OPERATIONS
  // ============================================

  const handleSubmitReview = async () => {
    if (!reviewText.trim()) {
      setError('Ulasan tidak boleh kosong')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      if (isEditing && existingReview) {
        await bookService.updateReview(bookSlug, {
          content: reviewText,
          title: reviewTitle || null
        })
      } else {
        await bookService.addReview(bookSlug, {
          content: reviewText,
          title: reviewTitle || null
        })
      }

      setReviewText('')
      setReviewTitle('')
      setShowAddReview(false)
      setIsEditing(false)
      setExistingReview(null)
      fetchData()

      alert(isEditing ? '✅ Ulasan berhasil diperbarui!' : '✅ Ulasan berhasil ditambahkan!')
    } catch (err) {
      console.error('Error submitting review:', err)
      const errorMsg = err.response?.data?.detail || err.message || 'Gagal menambahkan ulasan'

      if (errorMsg.includes('already have a review')) {
        setError('Anda sudah memiliki ulasan untuk buku ini. Silakan edit ulasan yang ada.')
        fetchData()
      } else {
        setError(errorMsg)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditReview = (review) => {
    setReviewText(review.content)
    setReviewTitle(review.title || '')
    setIsEditing(true)
    setShowAddReview(true)
    setError('')
  }

  const handleDeleteReview = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus ulasan ini?')) {
      return
    }

    try {
      await bookService.deleteReview(bookSlug)
      alert('✅ Ulasan berhasil dihapus!')
      setExistingReview(null)
      setShowAddReview(false)
      fetchData()
    } catch (err) {
      console.error('Error deleting review:', err)
      alert('❌ Gagal menghapus ulasan')
    }
  }

  const handleCancelEdit = () => {
    setShowAddReview(false)
    setIsEditing(false)
    setReviewText('')
    setReviewTitle('')
    setError('')
  }

  // ============================================
  // FEEDBACK OPERATIONS (HELPFUL/NOT HELPFUL)
  // ============================================

  const handleFeedback = async (reviewId, isHelpful, currentFeedback) => {
    if (!isAuthenticated) {
      alert('Silakan login terlebih dahulu')
      return
    }

    try {
      // If clicking the same feedback, remove it
      if (currentFeedback === isHelpful) {
        await bookService.deleteFeedback(bookSlug, reviewId)
      } else {
        // Add or update feedback
        await bookService.addFeedback(bookSlug, reviewId, { isHelpful })
      }
      
      fetchData() // Refresh to update counts
    } catch (err) {
      console.error('Error handling feedback:', err)
      alert('❌ Gagal memberikan feedback')
    }
  }

  // ============================================
  // REPLY OPERATIONS
  // ============================================

  const handleSubmitReply = async (reviewId) => {
    if (!replyText.trim()) {
      alert('Balasan tidak boleh kosong')
      return
    }

    setReplySubmitting(true)

    try {
      await bookService.addReply(bookSlug, reviewId, {
        content: replyText
      })

      setReplyText('')
      setReplyingTo(null)
      fetchData()
      alert('✅ Balasan berhasil ditambahkan!')
    } catch (err) {
      console.error('Error submitting reply:', err)
      const errorMsg = err.response?.data?.detail || err.message
      
      if (errorMsg?.includes('Cannot reply to your own review')) {
        alert('❌ Anda tidak bisa membalas ulasan sendiri')
      } else {
        alert('❌ Gagal menambahkan balasan')
      }
    } finally {
      setReplySubmitting(false)
    }
  }

  const handleDeleteReply = async (replyId) => {
    if (!confirm('Apakah Anda yakin ingin menghapus balasan ini?')) {
      return
    }

    try {
      await bookService.deleteReply(bookSlug, replyId)
      alert('✅ Balasan berhasil dihapus!')
      fetchData()
    } catch (err) {
      console.error('Error deleting reply:', err)
      alert('❌ Gagal menghapus balasan')
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

        {/* Sort Options */}
        <div className="mb-6 flex gap-3">
          <Button
            variant={sortBy === 'helpful' ? 'primary' : 'secondary'}
            onClick={() => setSortBy('helpful')}
          >
            Terbanyak Membantu
          </Button>
          <Button
            variant={sortBy === 'recent' ? 'primary' : 'secondary'}
            onClick={() => setSortBy('recent')}
          >
            Terbaru
          </Button>
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
                    <div className="flex gap-3">
                      <Button onClick={() => handleEditReview(existingReview)} fullWidth>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit Ulasan Anda
                      </Button>
                      <Button variant="outline" onClick={handleDeleteReview}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Hapus
                      </Button>
                    </div>
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
                  <Button variant="secondary" onClick={handleCancelEdit}>
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
              const isOwnReview = review.isOwner || (isAuthenticated && user && review.userId === user.id)
              const currentUserFeedback = review.currentUserFeedback

              return (
                <div key={review.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  {/* Reviewer Info */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        {review.userPhotoUrl ? (
                          <img src={review.userPhotoUrl} alt={review.userName} className="w-10 h-10 rounded-full" />
                        ) : (
                          <User className="w-5 h-5 text-primary" />
                        )}
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

                    {/* Edit/Delete buttons for own review */}
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
                          onClick={handleDeleteReview}
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
                    {review.content}
                  </p>

                  {/* Feedback Actions */}
                  <div className="flex items-center gap-4 text-sm mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => handleFeedback(review.id, true, currentUserFeedback)}
                      className={`flex items-center gap-1 transition-colors ${
                        currentUserFeedback === true
                          ? 'text-green-600 font-medium'
                          : 'text-gray-500 hover:text-green-600'
                      }`}
                      disabled={!isAuthenticated}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span>Membantu ({review.helpfulCount || 0})</span>
                    </button>
                    
                    <button
                      onClick={() => handleFeedback(review.id, false, currentUserFeedback)}
                      className={`flex items-center gap-1 transition-colors ${
                        currentUserFeedback === false
                          ? 'text-red-600 font-medium'
                          : 'text-gray-500 hover:text-red-600'
                      }`}
                      disabled={!isAuthenticated}
                    >
                      <ThumbsDown className="w-4 h-4" />
                      <span>Tidak Membantu ({review.notHelpfulCount || 0})</span>
                    </button>

                    {!isOwnReview && isAuthenticated && (
                      <button
                        onClick={() => setReplyingTo(replyingTo === review.id ? null : review.id)}
                        className="flex items-center gap-1 text-gray-500 hover:text-primary transition-colors ml-auto"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Balas</span>
                      </button>
                    )}
                  </div>

                  {/* Reply Form */}
                  {replyingTo === review.id && (
                    <div className="mb-4 pl-14">
                      <div className="flex gap-2">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Tulis balasan Anda..."
                          rows="3"
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
                        />
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          onClick={() => handleSubmitReply(review.id)}
                          loading={replySubmitting}
                          disabled={replySubmitting || !replyText.trim()}
                        >
                          <Send className="w-3 h-3 mr-1" />
                          Kirim
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setReplyingTo(null)
                            setReplyText('')
                          }}
                        >
                          Batal
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Replies */}
                  {review.replies && review.replies.length > 0 && (
                    <div className="space-y-4 pl-14">
                      {review.replies.map((reply) => (
                        <div key={reply.id} className="relative">
                          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700 -ml-7" />
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                              {reply.userPhotoUrl ? (
                                <img src={reply.userPhotoUrl} alt={reply.userName} className="w-8 h-8 rounded-full" />
                              ) : (
                                <User className="w-4 h-4 text-primary" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">{reply.userName}</span>
                                  {reply.isOwner && (
                                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                      Anda
                                    </span>
                                  )}
                                  <span className="text-xs text-gray-500">
                                    {formatRelativeTime(reply.createdAt)}
                                  </span>
                                </div>
                                {reply.isOwner && (
                                  <button
                                    onClick={() => handleDeleteReply(reply.id)}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                    title="Hapus balasan"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                {reply.content}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <Button
              variant="secondary"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || loading}
            >
              Sebelumnya
            </Button>
            <div className="flex items-center gap-2 px-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Halaman {currentPage} dari {totalPages}
              </span>
            </div>
            <Button
              variant="secondary"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || loading}
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
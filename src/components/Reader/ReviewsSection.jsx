// ============================================
// FILE 9: src/components/Reader/ReviewsSection.jsx
// ============================================
import { useState } from 'react'
import { MessageSquare, ThumbsUp, Send } from 'lucide-react'
import Button from '../Common/Button'

const ReviewsSection = ({ 
  reviews, 
  isAuthenticated,
  onAddReview, 
  onLikeReview, 
  onReplyToReview,
  onNavigateToLogin 
}) => {
  const [showReviewPanel, setShowReviewPanel] = useState(false)
  const [reviewContent, setReviewContent] = useState('')
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyContent, setReplyContent] = useState('')

  const handleAddReview = () => {
    if (!reviewContent.trim()) {
      alert('⚠️ Silakan tulis review terlebih dahulu')
      return
    }
    onAddReview(reviewContent)
    setReviewContent('')
    setShowReviewPanel(false)
  }

  const handleReply = (reviewId) => {
    if (!replyContent.trim()) {
      alert('⚠️ Silakan tulis balasan terlebih dahulu')
      return
    }
    onReplyToReview(reviewId, replyContent)
    setReplyingTo(null)
    setReplyContent('')
  }

  return (
    <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-bold">Diskusi Bab Ini</h2>
        <Button onClick={() => setShowReviewPanel(!showReviewPanel)}>
          <MessageSquare className="w-5 h-5 mr-2" />
          Tulis
        </Button>
      </div>

      {showReviewPanel && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
          <textarea
            value={reviewContent}
            onChange={(e) => setReviewContent(e.target.value)}
            placeholder="Bagaimana pendapat Anda tentang bab ini?"
            className="w-full p-3 border rounded-lg mb-4 min-h-[100px] bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
          <div className="flex gap-2">
            <Button onClick={handleAddReview} disabled={!reviewContent.trim()}>
              <Send className="w-4 h-4 mr-2" />
              Kirim
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setShowReviewPanel(false)
                setReviewContent('')
              }}
            >
              Batal
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {reviews && reviews.length > 0 ? (
          reviews.map(r => (
            <div key={r.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow border border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3">
                  {r.userProfilePicture ? (
                    <img
                      src={r.userProfilePicture}
                      alt={r.userName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-semibold">
                        {r.userName?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                  <div>
                    <div className="font-semibold">{r.userName || 'Anonymous'}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(r.createdAt).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
                {r.isSpoiler && (
                  <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded">
                    Spoiler
                  </span>
                )}
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-3 whitespace-pre-wrap">
                {r.comment}
              </p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => onLikeReview(r.id, r.isLikedByMe)}
                  disabled={!isAuthenticated}
                  className={`flex items-center gap-2 text-sm transition-colors ${
                    !isAuthenticated
                      ? 'cursor-not-allowed opacity-50'
                      : r.isLikedByMe
                        ? 'text-primary font-semibold'
                        : 'text-gray-500 hover:text-primary'
                  }`}
                  title={!isAuthenticated ? 'Login untuk menyukai' : r.isLikedByMe ? 'Unlike' : 'Like'}
                >
                  <ThumbsUp className={`w-4 h-4 ${r.isLikedByMe ? 'fill-current' : ''}`} />
                  {r.likeCount || 0} Suka
                </button>
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      onNavigateToLogin()
                      return
                    }
                    setReplyingTo(replyingTo === r.id ? null : r.id)
                    setReplyContent('')
                  }}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  Balas
                </button>
                {r.replies && r.replies.length > 0 && (
                  <span className="text-sm text-gray-500">
                    {r.replies.length} balasan
                  </span>
                )}
              </div>

              {/* Reply Form */}
              {replyingTo === r.id && isAuthenticated && (
                <div className="mt-4 ml-12 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder={`Balas ke ${r.userName}...`}
                    className="w-full p-3 border rounded-lg mb-3 min-h-[80px] bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600 text-sm"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleReply(r.id)}
                      disabled={!replyContent.trim()}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Kirim Balasan
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setReplyingTo(null)
                        setReplyContent('')
                      }}
                    >
                      Batal
                    </Button>
                  </div>
                </div>
              )}

              {/* Replies */}
              {r.replies && r.replies.length > 0 && (
                <div className="mt-4 ml-12 space-y-3 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                  {r.replies.map(reply => (
                    <div key={reply.id} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <div className="flex items-start gap-2 mb-2">
                        {reply.userProfilePicture ? (
                          <img
                            src={reply.userProfilePicture}
                            alt={reply.userName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary text-sm font-semibold">
                              {reply.userName?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="font-semibold text-sm">{reply.userName}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(reply.createdAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap mt-1">
                            {reply.comment}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-8">Belum ada diskusi</p>
        )}
      </div>
    </div>
  )
}

export default ReviewsSection
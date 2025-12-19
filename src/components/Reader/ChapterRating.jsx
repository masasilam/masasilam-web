// src/components/Reader/ChapterRating.jsx
import { useState, useEffect } from 'react'
import { Star, TrendingUp, Lock } from 'lucide-react'
import { chapterService } from '../../services/chapterService'
import { useNavigate, useLocation } from 'react-router-dom'

const ChapterRating = ({ bookSlug, chapterNumber, chapterTitle, isAuthenticated }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [myRating, setMyRating] = useState(null)
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showDistribution, setShowDistribution] = useState(false)

  useEffect(() => {
    fetchRating()
  }, [bookSlug, chapterNumber])

  const fetchRating = async () => {
    try {
      setLoading(true)
      const data = await chapterService.getChapterRating(bookSlug, chapterNumber)
      setSummary(data)
      if (isAuthenticated) {
        setMyRating(data.myRating)
        setRating(data.myRating || 0)
      }
    } catch (error) {
      console.error('Error fetching rating:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRate = async (value) => {
    if (!isAuthenticated) {
      // Redirect to login
      navigate('/masuk', { state: { from: location.pathname } })
      return
    }

    try {
      await chapterService.rateChapter(bookSlug, chapterNumber, value)
      setRating(value)
      setMyRating(value)
      fetchRating() // Refresh to get updated average
    } catch (error) {
      console.error('Error rating chapter:', error)
      alert('Gagal menyimpan rating')
    }
  }

  const handleDeleteRating = async () => {
    if (!confirm('Hapus rating Anda?')) return
    
    try {
      await chapterService.deleteChapterRating(bookSlug, chapterNumber)
      setRating(0)
      setMyRating(null)
      fetchRating()
    } catch (error) {
      console.error('Error deleting rating:', error)
    }
  }

  if (loading) {
    return <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-32 rounded-lg"></div>
  }

  const getRatingLabel = (r) => {
    if (r === 1) return 'Sangat buruk'
    if (r === 2) return 'Buruk'
    if (r === 3) return 'Cukup'
    if (r === 4) return 'Bagus'
    if (r === 5) return 'Sangat bagus'
    return ''
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            Rating Bab Ini
          </h3>
          {summary && summary.totalRatings > 0 && (
            <button
              onClick={() => setShowDistribution(!showDistribution)}
              className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
            >
              <TrendingUp className="w-3 h-3" />
              {summary.totalRatings} rating dari pembaca
            </button>
          )}
        </div>

        {/* Average Rating Display */}
        {summary && summary.totalRatings > 0 && (
          <div className="text-right">
            <div className="text-3xl font-bold text-amber-500">
              {summary.averageRating.toFixed(1)}
            </div>
            <div className="flex text-amber-400 justify-end">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(summary.averageRating) ? 'fill-current' : ''
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Rating Distribution - Collapsible */}
      {showDistribution && summary && summary.distribution && summary.totalRatings > 0 && (
        <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="space-y-1 text-sm">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = summary.distribution[`${star === 1 ? 'one' : star === 2 ? 'two' : star === 3 ? 'three' : star === 4 ? 'four' : 'five'}Star${star === 1 ? '' : 's'}`] || 0
              const percentage = summary.totalRatings > 0 
                ? (count / summary.totalRatings * 100).toFixed(0)
                : 0
              
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="w-8 text-gray-600 dark:text-gray-400 text-xs">
                    {star} ★
                  </span>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div
                      className="bg-amber-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="w-8 text-right text-gray-600 dark:text-gray-400 text-xs">
                    {count}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* User Rating Input */}
      <div>
        <div className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
          {isAuthenticated ? (myRating ? '⭐ Rating Anda' : '📝 Beri Rating') : '🔒 Login untuk memberi rating'}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 relative">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRate(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className={`transition-all focus:outline-none ${
                  isAuthenticated ? 'hover:scale-125 focus:scale-125' : 'cursor-pointer'
                }`}
                disabled={!isAuthenticated}
              >
                <Star
                  className={`w-7 h-7 transition-colors ${
                    star <= (hoverRating || rating)
                      ? 'text-amber-400 fill-current drop-shadow-md'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                />
              </button>
            ))}
            {!isAuthenticated && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/5 dark:bg-gray-100/5 rounded-lg backdrop-blur-[1px]">
                <Lock className="w-6 h-6 text-gray-400" />
              </div>
            )}
          </div>
          {isAuthenticated && myRating && (
            <button
              onClick={handleDeleteRating}
              className="text-xs text-red-500 hover:text-red-700 hover:underline ml-auto"
            >
              Hapus
            </button>
          )}
        </div>
        {isAuthenticated && (hoverRating || rating) > 0 && (
          <div className="text-sm text-amber-600 dark:text-amber-400 mt-2 font-medium">
            {getRatingLabel(hoverRating || rating)}
          </div>
        )}
        {!isAuthenticated && (
          <button
            onClick={() => navigate('/masuk', { state: { from: location.pathname } })}
            className="mt-3 text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
          >
            <Lock className="w-4 h-4" />
            Masuk untuk memberi rating
          </button>
        )}
      </div>
    </div>
  )
}

export default ChapterRating
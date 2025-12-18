// ============================================
// src/pages/dashboard/MyReviewsPage.jsx - FIXED
// ============================================

import { useState, useEffect } from 'react' // TAMBAHKAN INI
import { userService } from '../../services/userService'
import LoadingSpinner from '../../components/Common/LoadingSpinner'

export const MyReviewsPage = () => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null) // Optional: tambahkan error handling

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await userService.getMyReviews()
      
      // Debug: lihat struktur respons
      console.log('Reviews response:', response)
      console.log('Response data:', response?.data)
      
      // PERBAIKAN: Sesuaikan dengan struktur respons
      let reviewsData = []
      
      if (response?.data?.data?.list) {
        reviewsData = response.data.data.list
      } else if (response?.data?.list) {
        reviewsData = response.data.list
      } else if (response?.data?.items) {
        reviewsData = response.data.items
      } else if (Array.isArray(response?.data)) {
        reviewsData = response.data
      } else if (Array.isArray(response)) {
        reviewsData = response
      }
      
      console.log('Reviews data:', reviewsData)
      setReviews(reviewsData || [])
    } catch (error) {
      console.error('Error:', error)
      setError('Gagal memuat ulasan')
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Ulasan Saya</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Semua ulasan yang pernah Anda tulis
        </p>
      </div>

      {/* Tampilkan error jika ada */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <p className="text-red-700 dark:text-red-400">{error}</p>
          <button
            onClick={fetchReviews}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* PERBAIKAN: Gunakan optional chaining */}
      {reviews?.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
          <p className="text-gray-500">Belum ada ulasan</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review?.id || Math.random()} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-start gap-4">
                {/* Book cover */}
                <div className="flex-shrink-0">
                  <img
                    src={review?.bookCover || 'https://via.placeholder.com/80x120'}
                    alt={review?.bookTitle || 'Cover buku'}
                    className="w-16 h-24 object-cover rounded"
                  />
                </div>
                
                {/* Review content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">
                        <a 
                          href={`/buku/${review?.bookSlug || '#'}`} 
                          className="hover:text-primary"
                        >
                          {review?.bookTitle || 'Judul tidak tersedia'}
                        </a>
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        oleh {review?.authorName || 'Penulis tidak diketahui'}
                      </p>
                    </div>
                    
                    {/* Rating */}
                    {review?.rating && (
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="font-semibold">{review.rating}/5</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Review text */}
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    {review?.comment || 'Tidak ada teks ulasan'}
                  </p>
                  
                  {/* Metadata */}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {review?.createdAt && (
                      <span>
                        Ditulis pada {new Date(review.createdAt).toLocaleDateString('id-ID')}
                      </span>
                    )}
                    
                    {review?.isEdited && (
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        Disunting
                      </span>
                    )}
                    
                    {/* Like count */}
                    {review?.likeCount > 0 && (
                      <span>❤️ {review.likeCount} suka</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyReviewsPage
// MyReviewsPage
export const MyReviewsPage = () => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      const response = await userService.getMyReviews()
      setReviews(response.data?.data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Ulasan Saya</h1>
      {reviews.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
          <p className="text-gray-500">Belum ada ulasan</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="font-semibold mb-2">{review.bookTitle}</h3>
              <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
// HighlightsPage
export const HighlightsPage = () => {
  const [highlights, setHighlights] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHighlights()
  }, [])

  const fetchHighlights = async () => {
    try {
      const response = await userService.getHighlights()
      setHighlights(response.data?.data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Sorotan Teks</h1>
      {highlights.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
          <p className="text-gray-500">Belum ada sorotan</p>
        </div>
      ) : (
        <div className="space-y-4">
          {highlights.map((highlight) => (
            <div key={highlight.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <p className="italic mb-2">"{highlight.text}"</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{highlight.bookTitle}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
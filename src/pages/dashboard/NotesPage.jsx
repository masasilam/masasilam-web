// NotesPage
export const NotesPage = () => {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    try {
      const response = await userService.getNotes()
      setNotes(response.data?.data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Catatan Saya</h1>
      {notes.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
          <p className="text-gray-500">Belum ada catatan</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <div key={note.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="font-semibold mb-2">{note.title}</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-2">{note.content}</p>
              <p className="text-sm text-gray-500">{note.bookTitle}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
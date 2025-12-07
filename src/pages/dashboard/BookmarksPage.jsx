// BookmarksPage
import { useState, useEffect } from 'react'
import { userService } from '../../services/userService'
import LoadingSpinner from '../../components/Common/LoadingSpinner'
import { Bookmark } from 'lucide-react'

export const BookmarksPage = () => {
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBookmarks()
  }, [])

  const fetchBookmarks = async () => {
    try {
      const response = await userService.getBookmarks()
      setBookmarks(response.data?.data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Penanda Buku</h1>
      {bookmarks.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
          <Bookmark className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">Belum ada penanda</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookmarks.map((bookmark) => (
            <div key={bookmark.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="font-semibold mb-2">{bookmark.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{bookmark.bookTitle}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
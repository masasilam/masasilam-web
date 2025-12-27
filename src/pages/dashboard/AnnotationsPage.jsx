// ============================================
// src/pages/dashboard/AnnotationsPage.jsx - NEW
// ============================================

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { dashboardService } from '../../services/dashboardService'
import LoadingSpinner from '../../components/Common/LoadingSpinner'
import { Bookmark, Highlighter, FileText, Filter } from 'lucide-react'

const AnnotationsPage = () => {
  const [annotations, setAnnotations] = useState([])
  const [loading, setLoading] = useState(true)
  const [type, setType] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetchAnnotations()
  }, [type, sortBy, page])

  const fetchAnnotations = async () => {
    try {
      setLoading(true)
      const response = await dashboardService.getAnnotations(type, page, 20, sortBy)
      setAnnotations(response.data.items)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const typeOptions = [
    { value: 'all', label: 'Semua', icon: FileText },
    { value: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
    { value: 'highlights', label: 'Highlights', icon: Highlighter },
    { value: 'notes', label: 'Notes', icon: FileText }
  ]

  const getAnnotationStyle = (annotationType) => {
    switch(annotationType) {
      case 'bookmark': return 'border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10'
      case 'highlight': return 'border-l-4 border-green-500 bg-green-50 dark:bg-green-900/10'
      case 'note': return 'border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/10'
      default: return 'border-l-4 border-gray-500'
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Anotasi</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Semua bookmark, highlight, dan catatan Anda
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          {typeOptions.map(opt => {
            const Icon = opt.icon
            return (
              <button
                key={opt.value}
                onClick={() => {
                  setType(opt.value)
                  setPage(1)
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  type === opt.value
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : annotations.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">Belum ada anotasi</p>
        </div>
      ) : (
        <div className="space-y-4">
          {annotations.map((annotation) => (
            <div
              key={`${annotation.type}-${annotation.id}`}
              className={`rounded-lg p-6 ${getAnnotationStyle(annotation.type)}`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium px-2 py-1 bg-white dark:bg-gray-800 rounded">
                      {annotation.type.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">
                      Bab {annotation.chapterNumber}
                    </span>
                  </div>

                  <Link
                    to={`/buku/${annotation.bookSlug}`}
                    className="font-semibold hover:text-primary block mb-2"
                  >
                    {annotation.bookTitle}
                  </Link>

                  {annotation.title && annotation.type === 'note' && (
                    <h3 className="font-medium mb-2">{annotation.title}</h3>
                  )}

                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    {annotation.content}
                  </p>

                  <p className="text-xs text-gray-500">
                    {new Date(annotation.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>

                {annotation.bookCover && (
                  <img
                    src={annotation.bookCover}
                    alt={annotation.bookTitle}
                    className="w-16 h-24 object-cover rounded"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AnnotationsPage
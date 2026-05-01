// src/pages/dashboard/AnnotationsPage.jsx
import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { dashboardService } from '../../services/dashboardService'
import DashboardShell from '../../components/Dashboard/DashboardShell'
import { Bookmark, Highlighter, FileText, ChevronLeft, ChevronRight } from 'lucide-react'

const AnnotationsPage = () => {
  const navigate = useNavigate()
  const [annotations, setAnnotations] = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)
  const [type, setType]               = useState('all')
  const [sortBy, setSortBy]           = useState('recent')
  const [page, setPage]               = useState(1)
  const [total, setTotal]             = useState(0)
  const LIMIT = 20

  const fetchAnnotations = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await dashboardService.getAnnotations(type, page, LIMIT, sortBy)
      setAnnotations(response.data?.items || [])
      setTotal(response.data?.total || 0)
    } catch (err) {
      setError(err?.response?.status === 401 ? 'auth' : 'network')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }, [type, sortBy, page])

  useEffect(() => { fetchAnnotations() }, [fetchAnnotations])

  const totalPages = Math.max(1, Math.ceil(total / LIMIT))

  const typeOptions = [
    { value: 'all',       label: 'Semua',     icon: FileText   },
    { value: 'bookmark',  label: 'Bookmarks', icon: Bookmark   },
    { value: 'highlight', label: 'Highlights',icon: Highlighter },
    { value: 'note',      label: 'Notes',     icon: FileText   },
  ]

  const getAnnotationStyle = (annotationType) => {
    switch (annotationType) {
      case 'bookmark':  return 'border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10'
      case 'highlight': return 'border-l-4 border-green-500 bg-green-50 dark:bg-green-900/10'
      case 'note':      return 'border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/10'
      default:          return 'border-l-4 border-gray-500'
    }
  }

  return (
    <DashboardShell
      loading={loading}
      error={error}
      onRetry={fetchAnnotations}
      onLogin={() => navigate('/masuk', { state: { from: '/dasbor/anotasi' } })}
    >
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
                  onClick={() => { setType(opt.value); setPage(1) }}
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

        {annotations.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">Belum ada anotasi</p>
          </div>
        ) : (
          <>
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
                        {annotation.chapterNumber && (
                          <span className="text-xs text-gray-500">
                            Bab {annotation.chapterNumber}
                          </span>
                        )}
                      </div>
                      <Link
                        to={`/buku/${annotation.bookSlug}/baca`}
                        state={{ lastCfi: annotation.cfi }}
                        className="font-semibold hover:text-primary block mb-2"
                      >
                        {annotation.bookTitle}
                      </Link>
                      <p className="text-gray-700 dark:text-gray-300 mb-2">
                        {annotation.content}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(annotation.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })}
                      </p>
                    </div>
                    {annotation.bookCover && (
                      <img
                        src={annotation.bookCover}
                        alt={annotation.bookTitle}
                        className="w-16 h-24 object-cover rounded"
                        loading="lazy"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </DashboardShell>
  )
}

export default AnnotationsPage
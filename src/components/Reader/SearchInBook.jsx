// src/components/Reader/SearchInBook.jsx
import { useState, useEffect } from 'react'
import { Search, X, Clock, ExternalLink } from 'lucide-react'
import { chapterService } from '../../services/chapterService'
import { useNavigate } from 'react-router-dom'

const SearchInBook = ({ bookSlug, onClose }) => {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searchHistory, setSearchHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [totalResults, setTotalResults] = useState(0)
  const [totalChapters, setTotalChapters] = useState(0)

  useEffect(() => {
    fetchSearchHistory()
  }, [])

  const fetchSearchHistory = async () => {
    try {
      const history = await chapterService.getSearchHistory(bookSlug)
      setSearchHistory(history || [])
    } catch (error) {
      console.error('Error fetching search history:', error)
    }
  }

  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return

    try {
      setLoading(true)
      const data = await chapterService.searchInBook(bookSlug, searchQuery)
      setResults(data.results || [])
      setTotalResults(data.totalResults || 0)
      setTotalChapters(data.totalChapters || 0)
      fetchSearchHistory() // Refresh history
    } catch (error) {
      console.error('Error searching:', error)
      alert('Gagal melakukan pencarian')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    handleSearch(query)
  }

  const handleHistoryClick = (historyQuery) => {
    setQuery(historyQuery)
    handleSearch(historyQuery)
  }

  const handleResultClick = (result) => {
    // Navigate to chapter with the search result
    const chapterUrl = `/buku/${bookSlug}/${result.chapterSlug}`
    navigate(chapterUrl)
    onClose?.()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-3xl mt-20 mb-20">
        {/* Header */}
        <div className="flex items-center gap-4 p-6 border-b border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari dalam buku ini..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary focus:border-transparent"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={!query.trim() || loading}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Mencari...' : 'Cari'}
            </button>
          </form>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Summary */}
        {totalResults > 0 && (
          <div className="px-6 py-4 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700">
            <div className="text-sm">
              Ditemukan <span className="font-semibold">{totalResults}</span> hasil 
              di <span className="font-semibold">{totalChapters}</span> bab
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Search Results */}
          {results.length > 0 ? (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg mb-4">Hasil Pencarian</h3>
              {results.map((result) => (
                <button
                  key={`${result.chapterId}-${result.relevanceScore}`}
                  onClick={() => handleResultClick(result)}
                  className="w-full text-left bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-4 transition-colors border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="font-medium text-primary mb-1">
                        Bab {result.chapterNumber}: {result.chapterTitle}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {result.matchCount} kecocokan ditemukan
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </div>
                  
                  {/* Matches/Snippets */}
                  {result.matches && result.matches.length > 0 && (
                    <div className="space-y-2">
                      {result.matches.slice(0, 2).map((match, idx) => (
                        <div
                          key={idx}
                          className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 p-3 rounded border border-gray-200 dark:border-gray-700"
                          dangerouslySetInnerHTML={{ __html: match.snippet }}
                        />
                      ))}
                      {result.matches.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{result.matches.length - 2} kecocokan lainnya
                        </div>
                      )}
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : query && !loading ? (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Tidak ada hasil</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Coba gunakan kata kunci yang berbeda
              </p>
            </div>
          ) : null}

          {/* Search History */}
          {!query && searchHistory.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Pencarian Terakhir
              </h3>
              <div className="space-y-2">
                {searchHistory.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleHistoryClick(item.query)}
                    className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{item.query}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.resultsCount} hasil
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!query && searchHistory.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Cari dalam buku</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Temukan kata, frasa, atau topik tertentu
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SearchInBook
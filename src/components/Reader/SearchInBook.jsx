// src/components/Reader/SearchInBook.jsx
import { useState, useEffect, useRef } from 'react'
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

  const modalRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    fetchSearchHistory()

    // Focus input setelah modal dibuka (dengan delay untuk mobile)
    const timer = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }, 300)

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden'

    return () => {
      clearTimeout(timer)
      document.body.style.overflow = 'unset'
    }
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
    // Blur input untuk hide keyboard di mobile
    if (inputRef.current) {
      inputRef.current.blur()
    }
    handleSearch(query)
  }

  const handleHistoryClick = (historyQuery) => {
    setQuery(historyQuery)
    // Blur input untuk hide keyboard di mobile
    if (inputRef.current) {
      inputRef.current.blur()
    }
    handleSearch(historyQuery)
  }

  const handleResultClick = (result) => {
    // Navigate to chapter with the search result
    const chapterUrl = `/buku/${bookSlug}/${result.chapterSlug}`
    navigate(chapterUrl)
    onClose?.()
  }

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose?.()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[9999] flex items-start justify-center overflow-y-auto"
      onClick={handleBackdropClick}
      style={{
        touchAction: 'none',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-3xl my-4 mx-4 sm:mt-20 sm:mb-20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-2 sm:gap-4 p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari dalam buku ini..."
                className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary focus:border-transparent"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />
            </div>
            <button
              type="submit"
              disabled={!query.trim() || loading}
              className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-primary text-white rounded-lg hover:bg-primary/90 active:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed font-medium whitespace-nowrap transition-colors"
            >
              {loading ? 'Mencari...' : 'Cari'}
            </button>
          </form>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Summary */}
        {totalResults > 0 && (
          <div className="px-4 sm:px-6 py-3 sm:py-4 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700">
            <div className="text-xs sm:text-sm">
              Ditemukan <span className="font-semibold">{totalResults}</span> hasil
              di <span className="font-semibold">{totalChapters}</span> bab
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-4 sm:p-6 max-h-[calc(100vh-180px)] sm:max-h-[60vh] overflow-y-auto">
          {/* Search Results */}
          {results.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Hasil Pencarian</h3>
              {results.map((result) => (
                <button
                  key={`${result.chapterId}-${result.relevanceScore}`}
                  onClick={() => handleResultClick(result)}
                  className="w-full text-left bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 rounded-lg p-3 sm:p-4 transition-colors border border-gray-200 dark:border-gray-700"
                  type="button"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-primary mb-1 text-sm sm:text-base truncate">
                        Bab {result.chapterNumber}: {result.chapterTitle}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        {result.matchCount} kecocokan ditemukan
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                  </div>

                  {/* Matches/Snippets */}
                  {result.matches && result.matches.length > 0 && (
                    <div className="space-y-2">
                      {result.matches.slice(0, 2).map((match, idx) => (
                        <div
                          key={idx}
                          className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 p-2 sm:p-3 rounded border border-gray-200 dark:border-gray-700 overflow-hidden"
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
            <div className="text-center py-8 sm:py-12">
              <Search className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 dark:text-gray-600 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Tidak ada hasil</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Coba gunakan kata kunci yang berbeda
              </p>
            </div>
          ) : null}

          {/* Search History */}
          {!query && searchHistory.length > 0 && (
            <div className="mt-4 sm:mt-6">
              <h3 className="font-semibold text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Pencarian Terakhir
              </h3>
              <div className="space-y-2">
                {searchHistory.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleHistoryClick(item.query)}
                    className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 rounded-lg transition-colors flex items-center justify-between group"
                    type="button"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{item.query}</span>
                    </div>
                    <div className="text-xs text-gray-500 ml-2 flex-shrink-0">
                      {item.resultsCount} hasil
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!query && searchHistory.length === 0 && (
            <div className="text-center py-8 sm:py-12">
              <Search className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 dark:text-gray-600 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Cari dalam buku</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
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
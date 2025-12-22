import { useState, useEffect, useRef } from 'react'
import { Search, X, Clock, ExternalLink } from 'lucide-react'

// Mock service untuk demo
const mockChapterService = {
  searchInBook: async (bookSlug, query) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    return {
      results: [
        {
          chapterId: 1,
          chapterNumber: 1,
          chapterTitle: "Pengenalan",
          chapterSlug: "pengenalan",
          matchCount: 3,
          relevanceScore: 0.95,
          matches: [
            { snippet: "Ini adalah contoh <mark>hasil pencarian</mark> pertama" },
            { snippet: "Dan ini <mark>hasil pencarian</mark> kedua" }
          ]
        }
      ],
      totalResults: 3,
      totalChapters: 1
    }
  },
  getSearchHistory: async (bookSlug) => {
    return [
      { id: 1, query: "pengenalan", resultsCount: 5 },
      { id: 2, query: "tutorial", resultsCount: 8 }
    ]
  }
}

const SearchInBook = ({ bookSlug = "demo-book", onClose = () => {} }) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searchHistory, setSearchHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [totalResults, setTotalResults] = useState(0)
  const [totalChapters, setTotalChapters] = useState(0)

  const inputRef = useRef(null)
  const modalRef = useRef(null)

  useEffect(() => {
    fetchSearchHistory()

    // Focus dengan delay untuk mobile
    const timer = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }, 300)

    // Prevent body scroll saat modal terbuka
    document.body.style.overflow = 'hidden'

    return () => {
      clearTimeout(timer)
      document.body.style.overflow = ''
    }
  }, [])

  const fetchSearchHistory = async () => {
    try {
      const history = await mockChapterService.getSearchHistory(bookSlug)
      setSearchHistory(history || [])
    } catch (error) {
      console.error('Error fetching search history:', error)
    }
  }

  const handleSearch = async (searchQuery) => {
    const trimmedQuery = searchQuery.trim()
    if (!trimmedQuery) return

    try {
      setLoading(true)
      const data = await mockChapterService.searchInBook(bookSlug, trimmedQuery)
      setResults(data.results || [])
      setTotalResults(data.totalResults || 0)
      setTotalChapters(data.totalChapters || 0)
      fetchSearchHistory()
    } catch (error) {
      console.error('Error searching:', error)
      alert('Gagal melakukan pencarian')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    if (e) {
      e.preventDefault()
    }

    // Blur input untuk menutup keyboard mobile
    if (inputRef.current) {
      inputRef.current.blur()
    }

    handleSearch(query)
  }

  const handleHistoryClick = (historyQuery) => {
    setQuery(historyQuery)

    // Blur input sebelum search
    if (inputRef.current) {
      inputRef.current.blur()
    }

    // Delay search untuk smooth UX
    setTimeout(() => {
      handleSearch(historyQuery)
    }, 100)
  }

  const handleResultClick = (result) => {
    alert(`Navigasi ke: Bab ${result.chapterNumber} - ${result.chapterTitle}`)
    onClose?.()
  }

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose()
    }
  }

  const handleKeyPress = (e) => {
    // Handle Enter key di mobile
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto"
      onClick={handleBackdropClick}
      style={{
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain'
      }}
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-3xl my-4 mx-4 sm:my-20"
        style={{ maxHeight: 'calc(100vh - 2rem)' }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 sm:gap-4 p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <div className="flex-1 flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                ref={inputRef}
                type="search"
                inputMode="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Cari dalam buku ini..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />
            </div>
            <button
              onClick={() => handleSubmit()}
              disabled={!query.trim() || loading}
              className="px-4 sm:px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors touch-manipulation"
            >
              {loading ? 'Mencari...' : 'Cari'}
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 rounded-lg transition-colors touch-manipulation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Summary */}
        {totalResults > 0 && (
          <div className="px-4 sm:px-6 py-3 sm:py-4 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700">
            <div className="text-sm">
              Ditemukan <span className="font-semibold">{totalResults}</span> hasil
              di <span className="font-semibold">{totalChapters}</span> bab
            </div>
          </div>
        )}

        {/* Content */}
        <div
          className="p-4 sm:p-6 overflow-y-auto"
          style={{
            maxHeight: 'calc(100vh - 10rem)',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {/* Search Results */}
          {results.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Hasil Pencarian</h3>
              {results.map((result, idx) => (
                <button
                  key={`${result.chapterId}-${idx}`}
                  onClick={() => handleResultClick(result)}
                  className="w-full text-left bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 rounded-lg p-3 sm:p-4 transition-colors border border-gray-200 dark:border-gray-700 touch-manipulation"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-blue-600 dark:text-blue-400 mb-1 truncate">
                        Bab {result.chapterNumber}: {result.chapterTitle}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {result.matchCount} kecocokan ditemukan
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                  </div>

                  {/* Matches/Snippets */}
                  {result.matches && result.matches.length > 0 && (
                    <div className="space-y-2 mt-3">
                      {result.matches.slice(0, 2).map((match, matchIdx) => (
                        <div
                          key={matchIdx}
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
                    className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600 rounded-lg transition-colors flex items-center justify-between group touch-manipulation"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{item.query}</span>
                    </div>
                    <div className="text-xs text-gray-500 flex-shrink-0 ml-2">
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
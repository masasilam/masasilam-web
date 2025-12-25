import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import bookService from '../services/bookService'
import LoadingSpinner from '../components/Common/LoadingSpinner'
import { User, BookOpen, Search, ChevronRight, ChevronLeft, Calendar, MapPin } from 'lucide-react'

const AuthorsPage = () => {
  const [authors, setAuthors] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('name-asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const LIMIT = 24

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        setLoading(true)
        const { data } = await bookService.getAuthors(currentPage, LIMIT)
        setAuthors(data?.list || [])
        setTotalPages(Math.ceil((data?.total || 0) / LIMIT))
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchAuthors()
  }, [currentPage])

  const filteredAndSortedAuthors = useMemo(() => {
    let filtered = authors.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()))
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name-desc': return b.name.localeCompare(a.name)
        case 'books-desc': return (b.totalBooks || 0) - (a.totalBooks || 0)
        case 'books-asc': return (a.totalBooks || 0) - (b.totalBooks || 0)
        default: return a.name.localeCompare(a.name)
      }
    })
  }, [authors, searchTerm, sortBy])

  const formatYear = (date) => date ? new Date(date).getFullYear() : null

  if (loading && currentPage === 1) return <LoadingSpinner fullScreen />

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        {/* SEO Optimized Header */}
        <header className="mb-6 sm:mb-8 pb-4 sm:pb-6 border-b-2 border-primary">
          <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-light text-gray-900 dark:text-white mb-2">
            Daftar Penulis
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            Jelajahi {authors.length} penulis dan temukan karya-karya terbaik mereka
          </p>
        </header>

        {/* Search & Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari penulis..."
              className="w-full pl-10 pr-3 py-2.5 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:outline-none text-sm"
              aria-label="Cari penulis"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1) }}
            className="px-3 py-2.5 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:outline-none min-w-[160px] text-sm"
            aria-label="Urutkan penulis"
          >
            <option value="name-asc">Nama A-Z</option>
            <option value="name-desc">Nama Z-A</option>
            <option value="books-desc">Buku Terbanyak</option>
            <option value="books-asc">Buku Tersedikit</option>
          </select>
        </div>

        {/* Authors Grid */}
        {filteredAndSortedAuthors.length === 0 ? (
          <div className="text-center py-16" role="status">
            <User className="w-16 h-16 mx-auto mb-4 text-gray-400" aria-hidden="true" />
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm ? 'Penulis tidak ditemukan' : 'Belum ada penulis'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {filteredAndSortedAuthors.map((author) => (
                <Link
                  key={author.id}
                  to={`/penulis/${author.slug}`}
                  className="group bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 border-2 border-gray-200 dark:border-gray-700 hover:border-primary hover:shadow-xl transition-all duration-300"
                  aria-label={`Lihat profil ${author.name}`}
                >
                  <div className="flex gap-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-lg flex-shrink-0">
                      {author.photoUrl ? (
                        <img src={author.photoUrl} alt={author.name} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" aria-hidden="true" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-base sm:text-lg font-bold mb-2 text-gray-900 dark:text-white group-hover:text-primary transition-colors capitalize line-clamp-1">
                        {author.name}
                      </h2>
                      <div className="space-y-1.5 mb-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex flex-wrap items-center gap-3">
                          {author.birthDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                              {formatYear(author.birthDate)}{author.deathDate && `–${formatYear(author.deathDate)}`}
                            </span>
                          )}
                          {author.nationality && <span className="flex items-center gap-1"><span aria-hidden="true">🌍</span>{author.nationality}</span>}
                        </div>
                        {author.birthPlace && (
                          <span className="flex items-start gap-1">
                            <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
                            <span className="line-clamp-2">{author.birthPlace}</span>
                          </span>
                        )}
                      </div>
                      <span className="flex items-center gap-1.5 text-xs sm:text-sm text-primary font-medium">
                        <BookOpen className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                        {author.totalBooks || 0} buku
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 self-center" aria-hidden="true" />
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="flex justify-center items-center gap-2 mt-8 flex-wrap" aria-label="Navigasi halaman">
                <button onClick={() => { setCurrentPage(p => p - 1); window.scrollTo(0, 0) }} disabled={currentPage === 1} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800 transition text-sm" aria-label="Halaman sebelumnya">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400" aria-current="page">
                  Hal {currentPage} dari {totalPages}
                </span>
                <button onClick={() => { setCurrentPage(p => p + 1); window.scrollTo(0, 0) }} disabled={currentPage === totalPages} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800 transition text-sm" aria-label="Halaman berikutnya">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default AuthorsPage
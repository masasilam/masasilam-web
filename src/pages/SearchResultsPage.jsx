// ============================================
// src/pages/SearchResultsPage.jsx - WITH SEO & FILM SUPPORT
// ============================================

import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import bookService from '../services/bookService'
import { filmService } from '../services/filmService'
import BookGrid from '../components/Book/BookGrid'
import Button from '../components/Common/Button'
import SEO from '../components/Common/SEO'
import { generateSearchResultsStructuredData } from '../utils/seoHelpers'
import { Search, BookOpen, Film } from 'lucide-react'

const FilmCard = ({ film }) => (
  <Link
    to={`/film/${film.slug || film.id}`}
    className="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300"
  >
    <div className="aspect-[2/3] bg-gray-100 dark:bg-gray-700 overflow-hidden">
      {film.posterUrl ? (
        <img
          src={film.posterUrl}
          alt={film.judul}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Film className="w-12 h-12 text-gray-400" />
        </div>
      )}
    </div>
    <div className="p-4">
      <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1 group-hover:text-primary transition-colors">
        {film.judul}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {film.tahunRilis ? new Date(film.tahunRilis).getFullYear() : 'Tahun tidak diketahui'}
      </p>
    </div>
  </Link>
)

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [books, setBooks] = useState([])
  const [films, setFilms] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const [activeTab, setActiveTab] = useState('all') // 'all', 'books', 'films'

  useEffect(() => {
    if (query) {
      searchContent()
    }
  }, [query, currentPage, activeTab])

  const searchContent = async () => {
    try {
      setLoading(true)

      let bookData = []
      let filmData = []
      let bookTotal = 0
      let filmTotal = 0

      if (activeTab === 'all' || activeTab === 'books') {
        const bookResponse = await bookService.getBooks({
          page: currentPage,
          limit: activeTab === 'all' ? 12 : 24,
          searchTitle: query,
          sortField: 'viewCount',
          sortOrder: 'DESC',
        })
        bookData = bookResponse.data?.data || []
        bookTotal = bookResponse.data?.total || 0
        setBooks(bookData)
      }

      if (activeTab === 'all' || activeTab === 'films') {
        const filmResponse = await filmService.searchFilms(
          query,
          currentPage - 1, // API uses 0-based page index
          activeTab === 'all' ? 12 : 24
        ).catch(() => ({ data: { data: [], total: 0 } }))
        filmData = filmResponse.data?.data || []
        filmTotal = filmResponse.data?.total || 0
        setFilms(filmData)
      }

      // Calculate total results based on active tab
      let total = 0
      if (activeTab === 'all') {
        total = bookTotal + filmTotal
      } else if (activeTab === 'books') {
        total = bookTotal
      } else if (activeTab === 'films') {
        total = filmTotal
      }

      setTotalResults(total)
      setTotalPages(Math.ceil(total / (activeTab === 'all' ? 24 : 24)))
    } catch (error) {
      console.error('Error searching content:', error)
    } finally {
      setLoading(false)
    }
  }

  // Generate SEO data
  const searchResultsSchema = (books.length > 0 || films.length > 0) && query
    ? generateSearchResultsStructuredData(
        query,
        books.map(b => ({ ...b, slug: b.slug || b.id })),
        totalResults
      )
    : null

  const pageTitle = query
    ? `Hasil Pencarian: ${query} - MasasilaM`
    : 'Cari Konten - MasasilaM'

  const pageDescription = query
    ? `Ditemukan ${totalResults} hasil untuk pencarian "${query}". Jelajahi hasil pencarian buku dan film domain publik gratis di MasasilaM.`
    : 'Cari buku dan film favorit Anda di perpustakaan digital MasasilaM. Ribuan konten domain publik gratis tersedia untuk Anda.'

  const pageUrl = query
    ? `/cari?q=${encodeURIComponent(query)}${currentPage > 1 ? `&page=${currentPage}` : ''}`
    : '/cari'

  if (!query) {
    return (
      <>
        <SEO
          title="Cari Konten - MasasilaM"
          description="Cari buku dan film favorit Anda di perpustakaan digital MasasilaM. Ribuan konten domain publik gratis tersedia untuk Anda."
          url="/cari"
          type="website"
          keywords="cari buku, cari film, pencarian, perpustakaan digital, konten gratis"
        />

        <div className="min-h-screen py-16">
          <div className="container mx-auto px-4 text-center">
            <Search className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h1 className="text-2xl font-bold mb-2">Cari Konten</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Masukkan kata kunci untuk mencari buku atau film
            </p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <SEO
        title={pageTitle}
        description={pageDescription}
        url={pageUrl}
        type="website"
        keywords={`${query}, cari buku, cari film, pencarian, hasil pencarian, konten gratis`}
        structuredData={searchResultsSchema ? [searchResultsSchema] : undefined}
        noindex={totalResults === 0}
      />

      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Hasil Pencarian</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Menampilkan hasil untuk: <strong>"{query}"</strong>
            </p>
            {!loading && (books.length > 0 || films.length > 0) && (
              <p className="text-sm text-gray-500 mt-2">
                Ditemukan {totalResults.toLocaleString('id-ID')} hasil
              </p>
            )}
          </div>

          {/* Tabs */}
          <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setActiveTab('all')
                  setCurrentPage(1)
                }}
                className={`pb-3 px-2 font-medium transition-colors border-b-2 ${
                  activeTab === 'all'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => {
                  setActiveTab('books')
                  setCurrentPage(1)
                }}
                className={`pb-3 px-2 font-medium transition-colors border-b-2 flex items-center gap-2 ${
                  activeTab === 'books'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Buku
              </button>
              <button
                onClick={() => {
                  setActiveTab('films')
                  setCurrentPage(1)
                }}
                className={`pb-3 px-2 font-medium transition-colors border-b-2 flex items-center gap-2 ${
                  activeTab === 'films'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Film className="w-4 h-4" />
                Film
              </button>
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : (
            <>
              {/* Books Section */}
              {(activeTab === 'all' || activeTab === 'books') && books.length > 0 && (
                <div className="mb-12">
                  {activeTab === 'all' && <h2 className="text-2xl font-bold mb-4">Buku</h2>}
                  <BookGrid
                    books={books}
                    loading={false}
                    emptyMessage=""
                  />
                </div>
              )}

              {/* Films Section */}
              {(activeTab === 'all' || activeTab === 'films') && films.length > 0 && (
                <div className="mb-12">
                  {activeTab === 'all' && <h2 className="text-2xl font-bold mb-4">Film</h2>}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {films.map((film) => (
                      <FilmCard key={film.id} film={film} />
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {books.length === 0 && films.length === 0 && (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Tidak ada hasil yang cocok dengan "{query}"
                  </p>
                </div>
              )}
            </>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center gap-2">
              <Button
                variant="secondary"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || loading}
              >
                Sebelumnya
              </Button>

              <span className="flex items-center px-4 text-sm text-gray-600 dark:text-gray-400">
                Halaman {currentPage} dari {totalPages}
              </span>

              <Button
                variant="secondary"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || loading}
              >
                Selanjutnya
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default SearchResultsPage
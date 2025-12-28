// ============================================
// src/pages/SearchResultsPage.jsx - WITH SEO
// ============================================

import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import bookService from '../services/bookService'
import BookGrid from '../components/Book/BookGrid'
import Button from '../components/Common/Button'
import SEO from '../components/Common/SEO'
import { generateSearchResultsStructuredData } from '../utils/seoHelpers'
import { Search } from 'lucide-react'

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalResults, setTotalResults] = useState(0)

  useEffect(() => {
    if (query) {
      searchBooks()
    }
  }, [query, currentPage])

  const searchBooks = async () => {
    try {
      setLoading(true)
      const response = await bookService.getBooks({
        page: currentPage,
        limit: 24,
        searchTitle: query,
        sortField: 'viewCount',
        sortOrder: 'DESC',
      })

      const bookData = response.data?.data || []
      const total = response.data?.total || 0

      setBooks(bookData)
      setTotalResults(total)
      setTotalPages(Math.ceil(total / 24))
    } catch (error) {
      console.error('Error searching books:', error)
    } finally {
      setLoading(false)
    }
  }

  // Generate SEO data
  const searchResultsSchema = books.length > 0 && query
    ? generateSearchResultsStructuredData(
        query,
        books.map(b => ({ ...b, slug: b.slug || b.id })),
        totalResults
      )
    : null

  const pageTitle = query
    ? `Hasil Pencarian: ${query} - MasasilaM`
    : 'Cari Buku - MasasilaM'

  const pageDescription = query
    ? `Ditemukan ${totalResults} buku untuk pencarian "${query}". Jelajahi hasil pencarian buku domain publik gratis di MasasilaM.`
    : 'Cari buku favorit Anda di perpustakaan digital MasasilaM. Ribuan buku domain publik gratis tersedia untuk Anda.'

  const pageUrl = query
    ? `/cari?q=${encodeURIComponent(query)}${currentPage > 1 ? `&page=${currentPage}` : ''}`
    : '/cari'

  if (!query) {
    return (
      <>
        <SEO
          title="Cari Buku - MasasilaM"
          description="Cari buku favorit Anda di perpustakaan digital MasasilaM. Ribuan buku domain publik gratis tersedia untuk Anda baca online."
          url="/cari"
          type="website"
          keywords="cari buku, pencarian buku, perpustakaan digital, buku gratis"
        />

        <div className="min-h-screen py-16">
          <div className="container mx-auto px-4 text-center">
            <Search className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h1 className="text-2xl font-bold mb-2">Cari Buku</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Masukkan kata kunci untuk mencari buku
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
        keywords={`${query}, cari buku, pencarian, hasil pencarian, buku gratis`}
        structuredData={searchResultsSchema ? [searchResultsSchema] : undefined}
        noindex={totalResults === 0} // Don't index empty search results
      />

      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Hasil Pencarian</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Menampilkan hasil untuk: <strong>"{query}"</strong>
            </p>
            {!loading && books.length > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Ditemukan {totalResults.toLocaleString('id-ID')} buku
              </p>
            )}
          </div>

          <BookGrid
            books={books}
            loading={loading}
            emptyMessage={`Tidak ada buku yang cocok dengan "${query}"`}
          />

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
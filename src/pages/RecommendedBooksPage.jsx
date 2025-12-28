// ============================================
// src/pages/RecommendedBooksPage.jsx - WITH COMPLETE SEO
// ============================================

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import bookService from '../services/bookService'
import BookGrid from '../components/Book/BookGrid'
import Button from '../components/Common/Button'
import SEO from '../components/Common/SEO'
import {
  generateCollectionPageStructuredData,
  generateBreadcrumbStructuredData,
  combineStructuredData
} from '../utils/seoHelpers'
import { ChevronRight, Star } from 'lucide-react'

const RecommendedBooksPage = () => {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalBooks, setTotalBooks] = useState(0)

  useEffect(() => {
    fetchRecommendedBooks()
  }, [currentPage])

  const fetchRecommendedBooks = async () => {
    try {
      setLoading(true)

      const response = await bookService.getBooks({
        page: currentPage,
        limit: 24,
        sortField: 'averageRating',
        sortOrder: 'DESC',
        minRating: 4.0,
        isFeatured: true
      })

      setBooks(response.data?.data || [])
      setTotalBooks(response.data?.total || 0)
      setTotalPages(Math.ceil((response.data?.total || 0) / 24))
    } catch (error) {
      console.error('❌ Error fetching recommended books:', error)
    } finally {
      setLoading(false)
    }
  }

  // SEO Data
  const breadcrumbs = [
    { name: 'Beranda', url: '/' },
    { name: 'Buku', url: '/buku' },
    { name: 'Rekomendasi', url: '#' }
  ]

  const structuredData = combineStructuredData(
    generateBreadcrumbStructuredData(breadcrumbs),
    generateCollectionPageStructuredData('books', books, currentPage, totalBooks, 24)
  )

  const pageUrl = currentPage > 1 ? `/buku/rekomendasi?page=${currentPage}` : '/buku/rekomendasi'
  const prevUrl = currentPage > 1 ? (currentPage === 2 ? '/buku/rekomendasi' : `/buku/rekomendasi?page=${currentPage - 1}`) : null
  const nextUrl = currentPage < totalPages ? `/buku/rekomendasi?page=${currentPage + 1}` : null

  return (
    <>
      <SEO
        title="Buku Rekomendasi Terbaik - Rating Tertinggi"
        description={`Jelajahi ${totalBooks} buku rekomendasi pilihan dengan rating terbaik (4.0+). Temukan buku-buku berkualitas tinggi yang paling disukai pembaca di MasasilaM.`}
        url={pageUrl}
        type="website"
        keywords="buku rekomendasi, buku terbaik, buku rating tinggi, buku pilihan, buku berkualitas, buku populer"
        structuredData={structuredData}
        prevUrl={prevUrl}
        nextUrl={nextUrl}
        canonical={`https://masasilam.com${pageUrl}`}
      />

      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          {/* ============ BREADCRUMB ============ */}
          <nav className="flex items-center gap-2 text-sm mb-6" aria-label="Breadcrumb">
            <Link
              to="/"
              className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
            >
              Beranda
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" aria-hidden="true" />
            <Link
              to="/buku"
              className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
            >
              Buku
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" aria-hidden="true" />
            <span className="text-gray-900 dark:text-white font-medium">
              Rekomendasi
            </span>
          </nav>

          {/* ============ HEADER ============ */}
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
                <Star className="w-8 h-8 text-yellow-600 dark:text-yellow-400" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Buku Rekomendasi</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Buku pilihan dengan rating terbaik (4.0+)
                </p>
              </div>
            </div>

            {/* Stats Badge */}
            {!loading && books.length > 0 && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-sm">
                <Star className="w-4 h-4 text-yellow-600 dark:text-yellow-400" aria-hidden="true" />
                <span className="text-gray-700 dark:text-gray-300">
                  Menampilkan {books.length} dari {totalBooks} buku rekomendasi
                </span>
              </div>
            )}
          </header>

          {/* ============ BOOKS GRID ============ */}
          <BookGrid books={books} loading={loading} />

          {/* ============ PAGINATION ============ */}
          {totalPages > 1 && (
            <nav className="mt-12 flex justify-center gap-2" aria-label="Navigasi halaman">
              <Button
                variant="secondary"
                onClick={() => {
                  setCurrentPage(prev => Math.max(1, prev - 1))
                  window.scrollTo(0, 0)
                }}
                disabled={currentPage === 1 || loading}
                aria-label="Halaman sebelumnya"
              >
                Sebelumnya
              </Button>

              <span className="flex items-center px-4 text-sm text-gray-600 dark:text-gray-400" aria-current="page">
                Halaman {currentPage} dari {totalPages}
              </span>

              <Button
                variant="secondary"
                onClick={() => {
                  setCurrentPage(prev => Math.min(totalPages, prev + 1))
                  window.scrollTo(0, 0)
                }}
                disabled={currentPage === totalPages || loading}
                aria-label="Halaman berikutnya"
              >
                Selanjutnya
              </Button>
            </nav>
          )}
        </div>
      </div>
    </>
  )
}

export default RecommendedBooksPage
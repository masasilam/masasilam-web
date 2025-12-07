// ============================================
// src/pages/BookDetailPage.jsx - COMPLETE FIXED VERSION
// ============================================

import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { 
  Book, BookOpen, Calendar, Clock, Download, 
  Eye, Heart, Share2, Star, User, FileText, Globe, Building2
} from 'lucide-react'
import bookService from '../services/bookService'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from '../components/Common/LoadingSpinner'
import Button from '../components/Common/Button'
import Alert from '../components/Common/Alert'

const BookDetailPage = () => {
  const { bookSlug } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [downloadLoading, setDownloadLoading] = useState(false)
  const [readingLoading, setReadingLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchBookDetail()
  }, [bookSlug])

  const fetchBookDetail = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await bookService.getBookBySlug(bookSlug)
      
      console.log('📖 Book data loaded:', response)
      
      setBook(response)
    } catch (error) {
      console.error('❌ Error fetching book:', error)
      setError('Buku tidak ditemukan')
    } finally {
      setLoading(false)
    }
  }

  /**
   * ✅ Handle "Mulai Membaca" - Smart navigation
   * - Jika ada last read → langsung ke chapter terakhir
   * - Jika belum pernah baca → ke Daftar Isi dulu
   */
  const handleStartReading = async () => {
    try {
      setReadingLoading(true)
      console.log('📖 Starting reading for book:', bookSlug)
      
      // 1. Cek last read chapter dari localStorage
      const lastReadSlug = localStorage.getItem(`lastChapter_${bookSlug}`)
      
      if (lastReadSlug) {
        console.log('✅ Found last read chapter, continuing:', lastReadSlug)
        navigate(`/buku/${bookSlug}/${lastReadSlug}`)
        return
      }

      // 2. ✅ Belum pernah baca → Arahkan ke Daftar Isi
      console.log('📚 First time reading, redirecting to table of contents')
      navigate(`/buku/${bookSlug}/daftar-isi`)

    } catch (error) {
      console.error('❌ Error starting reading:', error)
      alert(`❌ Gagal memulai membaca: ${error.message || 'Unknown error'}`)
    } finally {
      setReadingLoading(false)
    }
  }

  /**
   * ✅ Handle Download - Langsung download dari fileUrl
   */
  const handleDownload = async () => {
    if (!book.fileUrl) {
      alert('File buku tidak tersedia')
      return
    }

    try {
      setDownloadLoading(true)
      
      // Langsung download dari URL yang sudah ada
      const link = document.createElement('a')
      link.href = book.fileUrl
      link.download = `${book.title}.${book.fileFormat || 'epub'}`
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      console.log('✅ Download started:', book.fileUrl)
    } catch (error) {
      console.error('❌ Error downloading book:', error)
      alert('Gagal mengunduh buku')
    } finally {
      setDownloadLoading(false)
    }
  }

  /**
   * ✅ Handle Share - Web Share API
   */
  const handleShare = async () => {
    const shareData = {
      title: book.title,
      text: `Baca "${book.title}" oleh ${book.authorNames}`,
      url: window.location.href
    }

    try {
      // Gunakan Web Share API langsung
      if (navigator.share) {
        await navigator.share(shareData)
        console.log('✅ Shared successfully')
      } else {
        // Jika browser tidak support, beri tahu user
        alert('❌ Browser Anda tidak mendukung fitur berbagi. Silakan salin link secara manual.')
      }
    } catch (error) {
      // User membatalkan atau error lain
      if (error.name !== 'AbortError') {
        console.error('❌ Error sharing:', error)
      }
    }
  }

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  if (error || !book) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert type="error" message={error || 'Buku tidak ditemukan'} />
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Book Cover */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <img
                src={book.coverImageUrl || 'https://via.placeholder.com/400x600?text=No+Cover'}
                alt={book.title}
                className="w-full rounded-lg shadow-lg"
              />
              
              <div className="mt-6 space-y-3">
                {/* ✅ Smart reading button with loading state */}
                <Button 
                  fullWidth 
                  variant="primary" 
                  size="lg"
                  onClick={handleStartReading}
                  loading={readingLoading}
                  disabled={readingLoading}
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  {readingLoading ? 'Memuat...' : 'Mulai Membaca'}
                </Button>
                
                {/* ✅ Download button - working */}
                <Button 
                  fullWidth 
                  variant="secondary"
                  onClick={handleDownload}
                  loading={downloadLoading}
                  disabled={downloadLoading || !book.fileUrl}
                >
                  <Download className="w-5 h-5 mr-2" />
                  {downloadLoading ? 'Mengunduh...' : 'Unduh EPUB'}
                </Button>
                
                <div className="flex gap-2">
                  <Button fullWidth variant="outline">
                    <Heart className="w-5 h-5" />
                  </Button>
                  {/* ✅ Share button - working */}
                  <Button fullWidth variant="outline" onClick={handleShare}>
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* ✅ Additional Info Card */}
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3 text-sm">
                {book.publisher && (
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-gray-500 text-xs">Penerbit</div>
                      <div className="font-medium">{book.publisher}</div>
                    </div>
                  </div>
                )}
                
                {book.language && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-gray-500 text-xs">Bahasa</div>
                      <div className="font-medium">{book.language}</div>
                    </div>
                  </div>
                )}

                {book.totalWord && (
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-gray-500 text-xs">Total Kata</div>
                      <div className="font-medium">{book.totalWord.toLocaleString()} kata</div>
                    </div>
                  </div>
                )}

                {book.edition && (
                  <div className="flex items-center gap-2">
                    <Book className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-gray-500 text-xs">Edisi</div>
                      <div className="font-medium">Edisi {book.edition}</div>
                    </div>
                  </div>
                )}

                {book.copyrightStatus && (
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-gray-500 text-xs">Status Hak Cipta</div>
                    <div className="font-medium text-green-600 dark:text-green-400">
                      {book.copyrightStatus}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Book Info */}
          <div className="lg:col-span-2">
            <h1 className="text-4xl font-bold mb-2">{book.title}</h1>
            
            {book.subtitle && (
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
                {book.subtitle}
              </p>
            )}

            {book.authorNames && (
              <div className="flex items-center gap-2 mb-6">
                <User className="w-5 h-5 text-gray-500" />
                <span className="text-lg">
                  {book.authorNames}
                </span>
              </div>
            )}

            {/* Stats */}
            <div className="flex flex-wrap gap-6 mb-6 text-sm text-gray-600 dark:text-gray-400">
              {book.averageRating > 0 && (
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{book.averageRating.toFixed(1)}</span>
                  <span className="text-xs">({book.totalRatings} rating)</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                <span>{book.viewCount || 0} views</span>
              </div>
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                <span>{book.downloadCount || 0} unduhan</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                <span>{book.readCount || 0} pembaca</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{book.estimatedReadTime} menit</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{book.publicationYear}</span>
              </div>
            </div>

            {/* Genres */}
            {book.genres && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {/* Genres - reversed order */}
                  {book.genres.split(',').reverse().map((genre, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm hover:bg-primary hover:text-white transition-colors cursor-pointer"
                    >
                      {genre.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Contributors */}
            {book.contributors && (
              <div className="mb-8">
                <h3 className="font-semibold mb-3">Kontributor</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {book.contributors}
                </p>
              </div>
            )}

            {/* Description */}
            <div className="prose dark:prose-invert max-w-none mb-8">
              <h2 className="text-2xl font-bold mb-4">Deskripsi</h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                {book.description || 'Tidak ada deskripsi tersedia.'}
              </p>
            </div>

            {/* Category Badge */}
            {book.category && (
              <div className="mb-6">
                <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  {book.category}
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
              <div className="flex gap-4">
                <Link to={`/buku/${bookSlug}/daftar-isi`}>
                  <Button variant="secondary">
                    <Book className="w-5 h-5 mr-2" />
                    Daftar Isi
                  </Button>
                </Link>
                <Link to={`/buku/${bookSlug}/ulasan`}>
                  <Button variant="secondary">
                    <Star className="w-5 h-5 mr-2" />
                    Lihat Ulasan
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookDetailPage
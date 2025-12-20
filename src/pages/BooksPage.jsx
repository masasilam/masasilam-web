import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import bookService from '../services/bookService'
import BookGrid from '../components/Book/BookGrid'
import Button from '../components/Common/Button'
import Input from '../components/Common/Input'
import { Search, SlidersHorizontal, X } from 'lucide-react'

const BooksPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sortField, setSortField] = useState('updateAt')
  const [sortOrder, setSortOrder] = useState('DESC')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [criteria, setCriteria] = useState({
    searchTitle: '', searchInBook: '', authorName: '', contributor: '', genre: '',
    minChapters: '', maxChapters: '', minFileSize: '', maxFileSize: '',
    publicationYearFrom: '', publicationYearTo: '', difficultyLevel: '',
    fileFormat: '', isFeatured: '', languageId: '', minRating: '', minViewCount: '', minReadCount: ''
  })

  useEffect(() => { 
    document.title = criteria.searchTitle 
      ? `${criteria.searchTitle} - Koleksi Buku Digital` 
      : 'Koleksi Buku Digital | Perpustakaan Online'
  }, [criteria.searchTitle])

  useEffect(() => { fetchBooks() }, [currentPage, sortField, sortOrder])

  const fetchBooks = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage, limit: 12, sortField, sortOrder,
        ...Object.fromEntries(Object.entries(criteria).filter(([_, v]) => v !== '' && v !== null))
      }
      const response = await bookService.getBooks(params)
      setBooks(response.data?.data || [])
      setTotalPages(Math.ceil((response.data?.total || 0) / 12))
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (field) => {
    if (sortField === field) setSortOrder(prev => prev === 'DESC' ? 'ASC' : 'DESC')
    else { setSortField(field); setSortOrder('DESC') }
    setCurrentPage(1)
  }

  const handleChange = (field, value) => setCriteria(prev => ({ ...prev, [field]: value }))

  const handleApply = () => { setCurrentPage(1); fetchBooks() }

  const handleReset = () => {
    setCriteria({
      searchTitle: '', searchInBook: '', authorName: '', contributor: '', genre: '',
      minChapters: '', maxChapters: '', minFileSize: '', maxFileSize: '',
      publicationYearFrom: '', publicationYearTo: '', difficultyLevel: '',
      fileFormat: '', isFeatured: '', languageId: '', minRating: '', minViewCount: '', minReadCount: ''
    })
    setCurrentPage(1)
    setTimeout(fetchBooks, 100)
  }

  const metaDescription = useMemo(() => 
    `Jelajahi ${books.length > 0 ? `${books.length}+ ` : ''}koleksi buku digital lengkap. Download EPUB & PDF gratis. ${criteria.searchTitle ? `Cari: ${criteria.searchTitle}` : 'Buku terbaru dan terpopuler'}`,
    [books.length, criteria.searchTitle]
  )

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Koleksi Buku Digital</h1>
          <p className="text-gray-600 dark:text-gray-400">Jelajahi ribuan buku berkualitas</p>
        </header>

        <div className="mb-6">
          <div className="flex gap-3">
            <div className="flex-1">
              <Input 
                type="text" 
                placeholder="Cari judul buku..." 
                value={criteria.searchTitle}
                onChange={(e) => handleChange('searchTitle', e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleApply()} 
              />
            </div>
            <Button variant="primary" onClick={handleApply}>
              <Search className="w-5 h-5 mr-2" />Cari
            </Button>
            <Button 
              variant={showAdvanced ? 'primary' : 'secondary'} 
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <SlidersHorizontal className="w-5 h-5 mr-2" />Filter
            </Button>
          </div>
        </div>

          {showAdvanced && (
            <div className="mb-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Filter Lanjutan</h3>
                <button onClick={() => setShowAdvanced(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div><label className="block text-sm font-medium mb-2">Cari dalam Isi Buku</label>
                  <Input type="text" placeholder="Kata kunci..." value={criteria.searchInBook} onChange={(e) => handleChange('searchInBook', e.target.value)} /></div>
                
                <div><label className="block text-sm font-medium mb-2">Penulis</label>
                  <Input type="text" placeholder="Nama penulis..." value={criteria.authorName} onChange={(e) => handleChange('authorName', e.target.value)} /></div>
                
                <div><label className="block text-sm font-medium mb-2">Kontributor</label>
                  <Input type="text" placeholder="Penerjemah, editor..." value={criteria.contributor} onChange={(e) => handleChange('contributor', e.target.value)} /></div>
                
                <div><label className="block text-sm font-medium mb-2">Genre</label>
                  <Input type="text" placeholder="Genre..." value={criteria.genre} onChange={(e) => handleChange('genre', e.target.value)} /></div>
                
                <div><label className="block text-sm font-medium mb-2">Tingkat Kesulitan</label>
                  <select value={criteria.difficultyLevel} onChange={(e) => handleChange('difficultyLevel', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary">
                    <option value="">Semua</option><option value="BEGINNER">Pemula</option><option value="INTERMEDIATE">Menengah</option><option value="ADVANCED">Lanjutan</option>
                  </select></div>
                
                <div><label className="block text-sm font-medium mb-2">Format</label>
                  <select value={criteria.fileFormat} onChange={(e) => handleChange('fileFormat', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary">
                    <option value="">Semua</option><option value="epub">EPUB</option><option value="pdf">PDF</option><option value="mobi">MOBI</option>
                  </select></div>
                
                <div><label className="block text-sm font-medium mb-2">Status</label>
                  <select value={criteria.isFeatured} onChange={(e) => handleChange('isFeatured', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary">
                    <option value="">Semua</option><option value="true">Unggulan</option><option value="false">Biasa</option>
                  </select></div>
                
                <div><label className="block text-sm font-medium mb-2">Bahasa</label>
                  <select value={criteria.languageId} onChange={(e) => handleChange('languageId', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary">
                    <option value="">Semua</option><option value="1">Indonesia</option><option value="2">English</option><option value="3">Jawa</option>
                  </select></div>
                
                <div><label className="block text-sm font-medium mb-2">Rating Min</label>
                  <select value={criteria.minRating} onChange={(e) => handleChange('minRating', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary">
                    <option value="">Semua</option><option value="4.5">4.5+ ⭐</option><option value="4.0">4.0+ ⭐</option><option value="3.5">3.5+ ⭐</option><option value="3.0">3.0+ ⭐</option>
                  </select></div>
                
                <div><label className="block text-sm font-medium mb-2">Jumlah Chapter</label>
                  <div className="flex gap-2">
                    <Input type="number" placeholder="Min" value={criteria.minChapters} onChange={(e) => handleChange('minChapters', e.target.value)} />
                    <Input type="number" placeholder="Max" value={criteria.maxChapters} onChange={(e) => handleChange('maxChapters', e.target.value)} />
                  </div></div>
                
                <div><label className="block text-sm font-medium mb-2">Ukuran File (MB)</label>
                  <div className="flex gap-2">
                    <Input type="number" placeholder="Min" value={criteria.minFileSize} onChange={(e) => handleChange('minFileSize', e.target.value)} />
                    <Input type="number" placeholder="Max" value={criteria.maxFileSize} onChange={(e) => handleChange('maxFileSize', e.target.value)} />
                  </div></div>
                
                <div><label className="block text-sm font-medium mb-2">Tahun Terbit</label>
                  <div className="flex gap-2">
                    <Input type="number" placeholder="Dari" value={criteria.publicationYearFrom} onChange={(e) => handleChange('publicationYearFrom', e.target.value)} />
                    <Input type="number" placeholder="Sampai" value={criteria.publicationYearTo} onChange={(e) => handleChange('publicationYearTo', e.target.value)} />
                  </div></div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="primary" onClick={handleApply} fullWidth><Search className="w-5 h-5 mr-2" />Terapkan</Button>
                <Button variant="secondary" onClick={handleReset} fullWidth><X className="w-5 h-5 mr-2" />Reset</Button>
              </div>
            </div>
          )}

        <BookGrid books={books} loading={loading} />

        {totalPages > 1 && (
          <nav className="mt-12 flex justify-center gap-2" aria-label="Pagination">
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
          </nav>
        )}
      </div>
    </div>
  )
}

export default BooksPage
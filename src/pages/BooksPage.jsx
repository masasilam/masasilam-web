// ============================================
// src/pages/BooksPage.jsx - FIXED TO MATCH BACKEND
// ============================================

import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import bookService from '../services/bookService'
import BookGrid from '../components/Book/BookGrid'
import LoadingSpinner from '../components/Common/LoadingSpinner'
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
  
  // Advanced Search States - SESUAI BACKEND
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
  const [searchCriteria, setSearchCriteria] = useState({
    searchTitle: '',
    searchInBook: '',
    authorName: '',
    contributor: '',
    genre: '', // FIXED: backend pakai 'genre' bukan 'category'
    minPages: '',
    maxPages: '',
    minFileSize: '',
    maxFileSize: '',
    publicationYearFrom: '',
    publicationYearTo: '',
    difficultyLevel: '',
    fileFormat: '',
    isFeatured: '',
    languageId: '',
    minRating: '',
    minViewCount: '',
    minReadCount: ''
  })

  useEffect(() => {
    fetchBooks()
  }, [currentPage, sortField, sortOrder])

  const fetchBooks = async () => {
    try {
      setLoading(true)
      
      // Build params with advanced search criteria
      const params = {
        page: currentPage,
        limit: 12,
        sortField,
        sortOrder,
        ...Object.fromEntries(
          Object.entries(searchCriteria).filter(([_, v]) => v !== '' && v !== null)
        )
      }
      
      const response = await bookService.getBooks(params)
      
      setBooks(response.data?.data || [])
      setTotalPages(Math.ceil((response.data?.total || 0) / 12))
    } catch (error) {
      console.error('Error fetching books:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSortChange = (field) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'DESC' ? 'ASC' : 'DESC')
    } else {
      setSortField(field)
      setSortOrder('DESC')
    }
    setCurrentPage(1)
  }

  const handleSearchChange = (field, value) => {
    setSearchCriteria(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleApplySearch = () => {
    setCurrentPage(1)
    fetchBooks()
  }

  const handleResetSearch = () => {
    setSearchCriteria({
      searchTitle: '',
      searchInBook: '',
      authorName: '',
      contributor: '',
      genre: '',
      minPages: '',
      maxPages: '',
      minFileSize: '',
      maxFileSize: '',
      publicationYearFrom: '',
      publicationYearTo: '',
      difficultyLevel: '',
      fileFormat: '',
      isFeatured: '',
      languageId: '',
      minRating: '',
      minViewCount: '',
      minReadCount: ''
    })
    setCurrentPage(1)
    setTimeout(() => fetchBooks(), 100)
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Buku</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Jelajahi koleksi lengkap buku kami
          </p>
        </div>

        {/* Quick Search */}
        <div className="mb-6">
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Cari judul buku..."
                value={searchCriteria.searchTitle}
                onChange={(e) => handleSearchChange('searchTitle', e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleApplySearch()}
              />
            </div>
            <Button
              variant="primary"
              onClick={handleApplySearch}
            >
              <Search className="w-5 h-5 mr-2" />
              Cari
            </Button>
            <Button
              variant={showAdvancedSearch ? 'primary' : 'secondary'}
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
            >
              <SlidersHorizontal className="w-5 h-5 mr-2" />
              Filter Lanjutan
            </Button>
          </div>
        </div>

        {/* Advanced Search Panel */}
        {showAdvancedSearch && (
          <div className="mb-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Pencarian Lanjutan</h3>
              <button
                onClick={() => setShowAdvancedSearch(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Search in Book */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Cari dalam Isi Buku
                </label>
                <Input
                  type="text"
                  placeholder="Kata kunci di dalam buku..."
                  value={searchCriteria.searchInBook}
                  onChange={(e) => handleSearchChange('searchInBook', e.target.value)}
                />
              </div>

              {/* Author Name */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nama Penulis
                </label>
                <Input
                  type="text"
                  placeholder="Cari penulis..."
                  value={searchCriteria.authorName}
                  onChange={(e) => handleSearchChange('authorName', e.target.value)}
                />
              </div>

              {/* Contributor */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Kontributor
                </label>
                <Input
                  type="text"
                  placeholder="Penerjemah, editor, dll..."
                  value={searchCriteria.contributor}
                  onChange={(e) => handleSearchChange('contributor', e.target.value)}
                />
              </div>

              {/* Genre - FIXED */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Genre
                </label>
                <Input
                  type="text"
                  placeholder="Cari genre..."
                  value={searchCriteria.genre}
                  onChange={(e) => handleSearchChange('genre', e.target.value)}
                />
              </div>

              {/* Difficulty Level - ADDED */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tingkat Kesulitan
                </label>
                <select
                  value={searchCriteria.difficultyLevel}
                  onChange={(e) => handleSearchChange('difficultyLevel', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Semua Tingkat</option>
                  <option value="BEGINNER">Pemula</option>
                  <option value="INTERMEDIATE">Menengah</option>
                  <option value="ADVANCED">Lanjutan</option>
                </select>
              </div>

              {/* File Format */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Format File
                </label>
                <select
                  value={searchCriteria.fileFormat}
                  onChange={(e) => handleSearchChange('fileFormat', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Semua Format</option>
                  <option value="epub">EPUB</option>
                  <option value="pdf">PDF</option>
                  <option value="mobi">MOBI</option>
                </select>
              </div>

              {/* Is Featured - ADDED */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Status Unggulan
                </label>
                <select
                  value={searchCriteria.isFeatured}
                  onChange={(e) => handleSearchChange('isFeatured', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Semua</option>
                  <option value="true">Buku Unggulan</option>
                  <option value="false">Buku Biasa</option>
                </select>
              </div>

              {/* Language ID - ADDED */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Bahasa
                </label>
                <select
                  value={searchCriteria.languageId}
                  onChange={(e) => handleSearchChange('languageId', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Semua Bahasa</option>
                  <option value="1">Indonesia</option>
                  <option value="2">English</option>
                  <option value="3">Jawa</option>
                </select>
              </div>

              {/* Min Rating */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Rating Minimal
                </label>
                <select
                  value={searchCriteria.minRating}
                  onChange={(e) => handleSearchChange('minRating', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Semua Rating</option>
                  <option value="4.5">4.5+ ⭐</option>
                  <option value="4.0">4.0+ ⭐</option>
                  <option value="3.5">3.5+ ⭐</option>
                  <option value="3.0">3.0+ ⭐</option>
                </select>
              </div>

              {/* Page Range */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Jumlah Halaman
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={searchCriteria.minPages}
                    onChange={(e) => handleSearchChange('minPages', e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={searchCriteria.maxPages}
                    onChange={(e) => handleSearchChange('maxPages', e.target.value)}
                  />
                </div>
              </div>

              {/* File Size Range - ADDED */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Ukuran File (MB)
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={searchCriteria.minFileSize}
                    onChange={(e) => handleSearchChange('minFileSize', e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={searchCriteria.maxFileSize}
                    onChange={(e) => handleSearchChange('maxFileSize', e.target.value)}
                  />
                </div>
              </div>

              {/* Publication Year */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tahun Terbit
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Dari"
                    value={searchCriteria.publicationYearFrom}
                    onChange={(e) => handleSearchChange('publicationYearFrom', e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Sampai"
                    value={searchCriteria.publicationYearTo}
                    onChange={(e) => handleSearchChange('publicationYearTo', e.target.value)}
                  />
                </div>
              </div>

              {/* Min View Count */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Minimal Views
                </label>
                <Input
                  type="number"
                  placeholder="Contoh: 1000"
                  value={searchCriteria.minViewCount}
                  onChange={(e) => handleSearchChange('minViewCount', e.target.value)}
                />
              </div>

              {/* Min Read Count - ADDED */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Minimal Dibaca
                </label>
                <Input
                  type="number"
                  placeholder="Contoh: 500"
                  value={searchCriteria.minReadCount}
                  onChange={(e) => handleSearchChange('minReadCount', e.target.value)}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <Button
                variant="primary"
                onClick={handleApplySearch}
                fullWidth
              >
                <Search className="w-5 h-5 mr-2" />
                Terapkan Filter
              </Button>
              <Button
                variant="secondary"
                onClick={handleResetSearch}
                fullWidth
              >
                <X className="w-5 h-5 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        )}

        {/* Books Grid */}
        <BookGrid books={books} loading={loading} />

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
  )
}

export default BooksPage
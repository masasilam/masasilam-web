// src/pages/dashboard/AdminPage.jsx
import { useState, useCallback } from 'react'
import { Upload, FileText, AlertCircle, CheckCircle, Loader, Film, Book, Link as LinkIcon } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import api from '../../services/api'

const AdminPage = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('books') // 'books' | 'films'

  // Books state
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState(null)
  const [message, setMessage] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)

  // Films state
  const [wikidataQid, setWikidataQid] = useState('')
  const [fetchingFilm, setFetchingFilm] = useState(false)
  const [filmStatus, setFilmStatus] = useState(null)
  const [filmMessage, setFilmMessage] = useState('')

  // Check if user is admin
  const isAdmin = user?.roles?.includes('ADMIN')

  // ==================== BOOKS HANDLERS ====================
  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.epub')) {
      setUploadStatus('error')
      setMessage('Hanya file EPUB yang didukung')
      setSelectedFile(null)
      return
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      setUploadStatus('error')
      setMessage('Ukuran file maksimal 50MB')
      setSelectedFile(null)
      return
    }

    setSelectedFile(file)
    setUploadStatus(null)
    setMessage('')
  }, [])

  const handleUpload = useCallback(async () => {
    if (!selectedFile) {
      setUploadStatus('error')
      setMessage('Pilih file EPUB terlebih dahulu')
      return
    }

    setUploading(true)
    setUploadStatus(null)
    setMessage('')

    try {
      const formData = new FormData()
      formData.append('bookFile', selectedFile)

      const response = await api.post('/books', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      setUploadStatus('success')
      setMessage(`Buku "${response.data?.data?.title || 'berhasil'}" telah ditambahkan!`)
      setSelectedFile(null)

      // Reset file input
      const fileInput = document.getElementById('book-file')
      if (fileInput) fileInput.value = ''

    } catch (error) {
      setUploadStatus('error')
      setMessage(error.response?.data?.detail || 'Gagal mengupload buku. Pastikan metadata EPUB lengkap.')
    } finally {
      setUploading(false)
    }
  }, [selectedFile])

  // ==================== FILMS HANDLERS ====================
  const handleFetchFilm = useCallback(async () => {
    if (!wikidataQid.trim()) {
      setFilmStatus('error')
      setFilmMessage('Masukkan Wikidata QID terlebih dahulu')
      return
    }

    // Validate QID format (should start with Q followed by numbers)
    const qidPattern = /^Q\d+$/
    if (!qidPattern.test(wikidataQid.trim())) {
      setFilmStatus('error')
      setFilmMessage('Format QID tidak valid. Contoh: Q623051')
      return
    }

    setFetchingFilm(true)
    setFilmStatus(null)
    setFilmMessage('')

    try {
      const response = await api.get(`/films/wikidata/${wikidataQid.trim()}`)

      setFilmStatus('success')
      setFilmMessage(`Film "${response.data?.judul || 'berhasil'}" telah ditambahkan!`)
      setWikidataQid('')

    } catch (error) {
      setFilmStatus('error')
      setFilmMessage(
        error.response?.data?.message ||
        error.response?.data?.detail ||
        'Gagal mengambil data film dari Wikidata. Pastikan QID valid.'
      )
    } finally {
      setFetchingFilm(false)
    }
  }, [wikidataQid])

  const handleWikidataQidChange = useCallback((e) => {
    setWikidataQid(e.target.value)
    setFilmStatus(null)
    setFilmMessage('')
  }, [])

  // ==================== RENDER ACCESS DENIED ====================
  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-600 dark:text-yellow-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Akses Terbatas</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Halaman ini hanya dapat diakses oleh Administrator
          </p>
        </div>
      </div>
    )
  }

  // ==================== RENDER ADMIN PAGE ====================
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Kelola Perpustakaan</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Tambahkan buku dan film ke dalam perpustakaan
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('books')}
            className={`flex-1 px-6 py-4 font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'books'
                ? 'bg-primary text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Book className="w-5 h-5" />
            <span>Buku</span>
          </button>
          <button
            onClick={() => setActiveTab('films')}
            className={`flex-1 px-6 py-4 font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'films'
                ? 'bg-primary text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <Film className="w-5 h-5" />
            <span>Film</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* ==================== BOOKS TAB ==================== */}
          {activeTab === 'books' && (
            <div className="space-y-6">
              {/* File Input */}
              <div>
                <label
                  htmlFor="book-file"
                  className="block text-sm font-medium mb-2"
                >
                  File Buku (EPUB)
                </label>
                <div className="relative">
                  <input
                    id="book-file"
                    type="file"
                    accept=".epub"
                    onChange={handleFileChange}
                    disabled={uploading}
                    className="block w-full text-sm text-gray-500 dark:text-gray-400
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-semibold
                      file:bg-primary file:text-white
                      hover:file:bg-primary-dark
                      file:cursor-pointer
                      disabled:opacity-50 disabled:cursor-not-allowed
                      cursor-pointer"
                  />
                </div>
                {selectedFile && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <FileText className="w-4 h-4" />
                    <span className="font-medium">{selectedFile.name}</span>
                    <span className="text-gray-400">
                      ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                )}
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800 dark:text-blue-300">
                    <p className="font-semibold mb-1">Persyaratan File EPUB:</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-400">
                      <li>Metadata lengkap: Title, Author, Publisher, Publication Year</li>
                      <li>Format: EPUB (.epub)</li>
                      <li>Ukuran maksimal: 50MB</li>
                      <li>Sistem akan otomatis mengekstrak metadata dan konten</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Status Messages */}
              {uploadStatus === 'success' && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-green-800 dark:text-green-300">
                    <p className="font-semibold">Berhasil!</p>
                    <p>{message}</p>
                  </div>
                </div>
              )}

              {uploadStatus === 'error' && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-800 dark:text-red-300">
                    <p className="font-semibold">Gagal!</p>
                    <p>{message}</p>
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="w-full sm:w-auto px-6 py-3 bg-primary text-white rounded-lg
                  hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors flex items-center justify-center gap-2 font-medium"
              >
                {uploading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Mengupload...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    <span>Upload Buku</span>
                  </>
                )}
              </button>

              {/* Instructions */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 mt-6">
                <h3 className="text-sm font-semibold mb-3">Cara Kerja Sistem</h3>
                <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex gap-2">
                    <span className="font-semibold text-primary flex-shrink-0">1.</span>
                    <span>Pilih file EPUB dengan metadata lengkap</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-primary flex-shrink-0">2.</span>
                    <span>Sistem akan otomatis mengekstrak: Title, Subtitle, Author, Publisher, Genre, Description, Cover Image</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-primary flex-shrink-0">3.</span>
                    <span>Sistem memproses chapter dan menghitung estimasi waktu baca</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-primary flex-shrink-0">4.</span>
                    <span>Jika buku dengan slug dan author yang sama sudah ada, sistem akan mengupdate buku tersebut</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-primary flex-shrink-0">5.</span>
                    <span>Buku siap dibaca oleh pengguna!</span>
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* ==================== FILMS TAB ==================== */}
          {activeTab === 'films' && (
            <div className="space-y-6">
              {/* Wikidata QID Input */}
              <div>
                <label
                  htmlFor="wikidata-qid"
                  className="block text-sm font-medium mb-2"
                >
                  Wikidata QID
                </label>
                <div className="flex gap-3">
                  <input
                    id="wikidata-qid"
                    type="text"
                    value={wikidataQid}
                    onChange={handleWikidataQidChange}
                    disabled={fetchingFilm}
                    placeholder="Contoh: Q623051"
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600
                      bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                      focus:ring-2 focus:ring-primary focus:border-transparent
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Masukkan QID dari Wikidata. Contoh: Q623051 untuk "Night of the Living Dead"
                </p>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800 dark:text-blue-300">
                    <p className="font-semibold mb-1">Cara Menemukan Wikidata QID:</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-400">
                      <li>Kunjungi <a href="https://www.wikidata.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">wikidata.org</a></li>
                      <li>Cari judul film yang ingin ditambahkan</li>
                      <li>Buka halaman film tersebut</li>
                      <li>QID akan terlihat di URL (contoh: Q623051) dan di bagian atas halaman</li>
                      <li>Sistem akan otomatis mengekstrak semua metadata dari Wikidata</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Status Messages */}
              {filmStatus === 'success' && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-green-800 dark:text-green-300">
                    <p className="font-semibold">Berhasil!</p>
                    <p>{filmMessage}</p>
                  </div>
                </div>
              )}

              {filmStatus === 'error' && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-800 dark:text-red-300">
                    <p className="font-semibold">Gagal!</p>
                    <p>{filmMessage}</p>
                  </div>
                </div>
              )}

              {/* Fetch Button */}
              <button
                onClick={handleFetchFilm}
                disabled={!wikidataQid.trim() || fetchingFilm}
                className="w-full sm:w-auto px-6 py-3 bg-primary text-white rounded-lg
                  hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors flex items-center justify-center gap-2 font-medium"
              >
                {fetchingFilm ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Mengambil Data...</span>
                  </>
                ) : (
                  <>
                    <LinkIcon className="w-5 h-5" />
                    <span>Tambahkan Film</span>
                  </>
                )}
              </button>

              {/* Instructions */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 mt-6">
                <h3 className="text-sm font-semibold mb-3">Cara Kerja Sistem</h3>
                <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex gap-2">
                    <span className="font-semibold text-primary flex-shrink-0">1.</span>
                    <span>Cari film di Wikidata dan salin QID-nya</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-primary flex-shrink-0">2.</span>
                    <span>Masukkan QID (contoh: Q623051) ke form di atas</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-primary flex-shrink-0">3.</span>
                    <span>Sistem akan mengambil metadata lengkap: judul, sutradara, pemeran, genre, poster, trailer, dll</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-primary flex-shrink-0">4.</span>
                    <span>Data disimpan ke database termasuk informasi kru, perusahaan produksi, dan rating</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-primary flex-shrink-0">5.</span>
                    <span>Film siap ditonton oleh pengguna!</span>
                  </li>
                </ol>
              </div>

              {/* Example */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                <h3 className="text-sm font-semibold mb-2">Contoh Film:</h3>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <p><strong>Night of the Living Dead:</strong> Q623051</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminPage
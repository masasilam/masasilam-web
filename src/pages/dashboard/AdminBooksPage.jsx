// src/pages/dashboard/AdminBooksPage.jsx
import { useState, useCallback } from 'react'
import { Upload, FileText, AlertCircle, CheckCircle, Loader } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import api from '../../services/api'

const AdminBooksPage = () => {
  const { user } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState(null) // 'success' | 'error' | null
  const [message, setMessage] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)

  // Check if user is admin
  const isAdmin = user?.roles?.includes('ADMIN')

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
      // Create FormData
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Kelola Buku</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Upload buku baru dalam format EPUB dengan metadata lengkap
        </p>
      </div>

      {/* Upload Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
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
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold mb-4">Cara Kerja Sistem</h2>
        <ol className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <li className="flex gap-3">
            <span className="font-semibold text-primary flex-shrink-0">1.</span>
            <span>Pilih file EPUB dengan metadata lengkap</span>
          </li>
          <li className="flex gap-3">
            <span className="font-semibold text-primary flex-shrink-0">2.</span>
            <span>Sistem akan otomatis mengekstrak: Title, Subtitle, Author, Publisher, Genre, Description, Cover Image, dll</span>
          </li>
          <li className="flex gap-3">
            <span className="font-semibold text-primary flex-shrink-0">3.</span>
            <span>Sistem memproses chapter dan menghitung estimasi waktu baca</span>
          </li>
          <li className="flex gap-3">
            <span className="font-semibold text-primary flex-shrink-0">4.</span>
            <span>Jika buku dengan slug dan author yang sama sudah ada, sistem akan mengupdate buku tersebut</span>
          </li>
          <li className="flex gap-3">
            <span className="font-semibold text-primary flex-shrink-0">5.</span>
            <span>Buku siap dibaca oleh pengguna!</span>
          </li>
        </ol>
      </div>
    </div>
  )
}

export default AdminBooksPage
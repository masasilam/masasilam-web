// src/components/Reader/ExportAnnotations.jsx
import { useState } from 'react'
import { Download, FileText, Check, X } from 'lucide-react'
import { chapterService } from '../../services/chapterService'

const ExportAnnotations = ({ bookSlug, onClose }) => {
  const [exportType, setExportType] = useState('pdf')
  const [includeBookmarks, setIncludeBookmarks] = useState(true)
  const [includeHighlights, setIncludeHighlights] = useState(true)
  const [includeNotes, setIncludeNotes] = useState(true)
  const [chapterFrom, setChapterFrom] = useState('')
  const [chapterTo, setChapterTo] = useState('')
  const [loading, setLoading] = useState(false)
  const [exportId, setExportId] = useState(null)
  const [exportStatus, setExportStatus] = useState(null)

  const handleExport = async () => {
    if (!includeBookmarks && !includeHighlights && !includeNotes) {
      alert('Pilih minimal satu jenis anotasi untuk diekspor')
      return
    }

    try {
      setLoading(true)
      
      const options = {
        exportType,
        includeBookmarks,
        includeHighlights,
        includeNotes
      }
      
      if (chapterFrom) options.chapterFrom = parseInt(chapterFrom)
      if (chapterTo) options.chapterTo = parseInt(chapterTo)

      const result = await chapterService.exportAnnotations(bookSlug, options)
      setExportId(result.exportId)
      setExportStatus(result.status)

      // Poll for completion
      pollExportStatus(result.exportId)
    } catch (error) {
      console.error('Error exporting annotations:', error)
      alert('Gagal membuat ekspor: ' + (error.response?.data?.message || error.message))
      setLoading(false)
    }
  }

  const pollExportStatus = async (id) => {
    const interval = setInterval(async () => {
      try {
        const status = await chapterService.getExportStatus(bookSlug, id)
        setExportStatus(status.status)

        if (status.status === 'COMPLETED') {
          clearInterval(interval)
          setLoading(false)
          // Auto download
          if (status.fileUrl) {
            window.open(status.fileUrl, '_blank')
          }
        } else if (status.status === 'FAILED') {
          clearInterval(interval)
          setLoading(false)
          alert('Ekspor gagal: ' + status.errorMessage)
        }
      } catch (error) {
        console.error('Error polling export status:', error)
        clearInterval(interval)
        setLoading(false)
      }
    }, 2000) // Poll every 2 seconds

    // Stop polling after 2 minutes
    setTimeout(() => clearInterval(interval), 120000)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Download className="w-6 h-6 text-primary" />
            Ekspor Anotasi
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Export Type */}
          <div>
            <label className="block text-sm font-medium mb-3">Format File</label>
            <div className="grid grid-cols-3 gap-3">
              {['pdf', 'docx', 'txt'].map((type) => (
                <button
                  key={type}
                  onClick={() => setExportType(type)}
                  className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                    exportType === type
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-300 dark:border-gray-600 hover:border-primary'
                  }`}
                >
                  {type.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Include Options */}
          <div>
            <label className="block text-sm font-medium mb-3">Sertakan</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <input
                  type="checkbox"
                  checked={includeBookmarks}
                  onChange={(e) => setIncludeBookmarks(e.target.checked)}
                  className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
                />
                <span className="flex-1">Penanda Buku</span>
              </label>
              
              <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <input
                  type="checkbox"
                  checked={includeHighlights}
                  onChange={(e) => setIncludeHighlights(e.target.checked)}
                  className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
                />
                <span className="flex-1">Highlight</span>
              </label>
              
              <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <input
                  type="checkbox"
                  checked={includeNotes}
                  onChange={(e) => setIncludeNotes(e.target.checked)}
                  className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
                />
                <span className="flex-1">Catatan</span>
              </label>
            </div>
          </div>

          {/* Chapter Range */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Rentang Bab (Opsional)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                value={chapterFrom}
                onChange={(e) => setChapterFrom(e.target.value)}
                placeholder="Dari"
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <span className="text-gray-500">—</span>
              <input
                type="number"
                min="1"
                value={chapterTo}
                onChange={(e) => setChapterTo(e.target.value)}
                placeholder="Sampai"
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Kosongkan untuk mengekspor semua bab
            </p>
          </div>

          {/* Export Status */}
          {exportStatus && (
            <div className={`p-4 rounded-lg border-2 ${
              exportStatus === 'COMPLETED' 
                ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                : exportStatus === 'PROCESSING'
                ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
            }`}>
              <div className="flex items-center gap-3">
                {exportStatus === 'COMPLETED' ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : exportStatus === 'PROCESSING' ? (
                  <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full" />
                ) : (
                  <X className="w-5 h-5 text-red-600" />
                )}
                <span className="text-sm font-medium">
                  {exportStatus === 'COMPLETED' && 'Ekspor selesai!'}
                  {exportStatus === 'PROCESSING' && 'Sedang memproses...'}
                  {exportStatus === 'PENDING' && 'Menunggu diproses...'}
                  {exportStatus === 'FAILED' && 'Ekspor gagal'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            {exportStatus === 'COMPLETED' ? 'Tutup' : 'Batal'}
          </button>
          <button
            onClick={handleExport}
            disabled={loading || exportStatus === 'PROCESSING'}
            className="flex-1 px-4 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                Memproses...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Ekspor
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ExportAnnotations
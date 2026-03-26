// ============================================
// FILE: src/components/Reader/CorrectionModal.jsx
// ============================================
// Modal yang muncul ketika user klik "Laporkan Typo"
// dari TextSelectionPopup.
//
// User mengisi:
//  - Teks salah (sudah terisi otomatis dari selection)
//  - Koreksi yang benar
//  - Catatan opsional
//
// Dipanggil dari ChapterReaderPage.jsx

import { useState } from 'react'
import { X, AlertTriangle, CheckCircle, Loader } from 'lucide-react'

const CorrectionModal = ({
  selectedText,      // teks yang di-select user (teks yang salah)
  contextBefore,     // 50 char sebelum selection (untuk presisi replace)
  contextAfter,      // 50 char sesudah selection
  startPosition,     // character offset
  endPosition,
  onSave,            // async (data) => void — dipanggil saat submit
  onClose,
}) => {
  const [correctedText, setCorrectedText] = useState(selectedText)
  const [userNote, setUserNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null) // 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async () => {
    // Validasi dasar
    if (!correctedText.trim()) {
      setSubmitStatus('error')
      setErrorMessage('Teks koreksi tidak boleh kosong.')
      return
    }

    if (correctedText.trim() === selectedText.trim()) {
      setSubmitStatus('error')
      setErrorMessage('Teks koreksi sama dengan teks asli. Tidak ada perubahan.')
      return
    }

    setIsSubmitting(true)
    setSubmitStatus(null)
    setErrorMessage('')

    try {
      await onSave({
        originalText:  selectedText,
        correctedText: correctedText.trim(),
        contextBefore,
        contextAfter,
        startPosition,
        endPosition,
        userNote: userNote.trim() || null,
      })

      setSubmitStatus('success')

      // Tutup modal otomatis setelah 1.5 detik
      setTimeout(() => {
        onClose()
      }, 1500)

    } catch (err) {
      setSubmitStatus('error')
      setErrorMessage(
        err?.response?.data?.message ||
        err?.message ||
        'Gagal mengirim laporan. Coba lagi.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-500" />
            Laporkan Typo
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">

          {/* Teks asli (readonly) */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
              Teks yang Salah
            </label>
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 text-sm text-red-800 dark:text-red-300 italic line-clamp-3 select-text">
              "{selectedText}"
            </div>
          </div>

          {/* Teks koreksi (editable, pre-filled dengan selectedText) */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
              Koreksi yang Benar <span className="text-red-500">*</span>
            </label>
            <textarea
              value={correctedText}
              onChange={e => {
                setCorrectedText(e.target.value)
                setSubmitStatus(null)
              }}
              rows={3}
              autoFocus
              disabled={isSubmitting || submitStatus === 'success'}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm resize-none
                focus:outline-none focus:ring-2 focus:ring-amber-400
                disabled:opacity-60 disabled:cursor-not-allowed"
              placeholder="Ketik teks yang benar di sini..."
            />
          </div>

          {/* Catatan opsional */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
              Catatan <span className="text-gray-400 font-normal">(opsional)</span>
            </label>
            <input
              type="text"
              value={userNote}
              onChange={e => setUserNote(e.target.value)}
              disabled={isSubmitting || submitStatus === 'success'}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm
                focus:outline-none focus:ring-2 focus:ring-amber-400
                disabled:opacity-60 disabled:cursor-not-allowed"
              placeholder="Contoh: Sesuai ejaan KBBI edisi ke-5"
              maxLength={200}
            />
          </div>

          {/* Status feedback */}
          {submitStatus === 'success' && (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <CheckCircle size={16} className="text-green-600 dark:text-green-400 flex-shrink-0" />
              <p className="text-sm text-green-700 dark:text-green-300">
                Laporan berhasil dikirim! Terima kasih kontribusinya. 🙏
              </p>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <AlertTriangle size={16} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-300">{errorMessage}</p>
            </div>
          )}

          {/* Tombol */}
          {submitStatus !== 'success' && (
            <div className="flex gap-3 pt-1">
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                  text-gray-700 dark:text-gray-300 text-sm font-medium
                  hover:bg-gray-50 dark:hover:bg-gray-800 transition
                  disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !correctedText.trim()}
                className="flex-1 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600
                  text-white text-sm font-medium transition flex items-center justify-center gap-2
                  disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader size={14} className="animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  'Kirim Laporan'
                )}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default CorrectionModal
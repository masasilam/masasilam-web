// ============================================
// FILE: src/pages/dashboard/CorrectionQueuePage.jsx
// Route: /dasbor/koreksi
// ============================================

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { dashboardService } from '../../services/dashboardService'
import {
  CheckCircle, XCircle, AlertTriangle, Loader,
  BookOpen, ChevronLeft, ChevronRight, Clock,
  User, MessageSquare
} from 'lucide-react'

// ─── Status Badge ─────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    PENDING:  { label: 'Menunggu', cls: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' },
    APPROVED: { label: 'Disetujui', cls: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
    REJECTED: { label: 'Ditolak',  cls: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
  }
  const { label, cls } = map[status] || map.PENDING
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {label}
    </span>
  )
}

// ─── Diff Preview ─────────────────────────────────────────────
const DiffPreview = ({ originalText, correctedText, contextBefore, contextAfter }) => {
  const before = contextBefore || ''
  const after  = contextAfter  || ''
  return (
    <div className="space-y-1.5 mt-2">
      <div className="p-2.5 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 text-sm font-mono">
        <span className="text-gray-500 dark:text-gray-400 text-xs mr-1">−</span>
        <span className="text-gray-500">{before}</span>
        <span className="bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 px-1 rounded font-semibold">
          {originalText}
        </span>
        <span className="text-gray-500">{after}</span>
      </div>
      <div className="p-2.5 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 text-sm font-mono">
        <span className="text-gray-500 dark:text-gray-400 text-xs mr-1">+</span>
        <span className="text-gray-500">{before}</span>
        <span className="bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 px-1 rounded font-semibold">
          {correctedText}
        </span>
        <span className="text-gray-500">{after}</span>
      </div>
    </div>
  )
}

// ─── Correction Card ──────────────────────────────────────────
const CorrectionCard = ({ correction, onApprove, onReject, isProcessing, isAdmin }) => {
  const [showRejectInput, setShowRejectInput] = useState(false)
  const [rejectNote, setRejectNote] = useState('')

  const handleReject = () => {
    onReject(correction.id, rejectNote.trim() || null)
    setShowRejectInput(false)
    setRejectNote('')
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(new Date(dateStr))
  }

  return (
    <article className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-shadow">

      {/* Header card */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <BookOpen size={14} className="text-amber-500 flex-shrink-0" />
            <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {correction.bookTitle}
            </span>
            <span className="text-gray-400">·</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Bab {correction.chapterNumber}: {correction.chapterTitle}
            </span>
          </div>
          <div className="flex items-center gap-3 flex-wrap text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <User size={11} />
              {correction.submittedByUsername}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {formatDate(correction.createdAt)}
            </span>
            <StatusBadge status={correction.status} />
          </div>
        </div>
      </div>

      {/* Diff */}
      <DiffPreview
        originalText={correction.originalText}
        correctedText={correction.correctedText}
        contextBefore={correction.contextBefore}
        contextAfter={correction.contextAfter}
      />

      {/* Catatan user */}
      {correction.userNote && (
        <div className="mt-3 flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
          <MessageSquare size={12} className="flex-shrink-0 mt-0.5" />
          <span className="italic">"{correction.userNote}"</span>
        </div>
      )}

      {/* Review note */}
      {correction.reviewNote && (
        <div className="mt-3 p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-xs text-gray-600 dark:text-gray-400">
          <span className="font-medium">Catatan admin: </span>
          {correction.reviewNote}
        </div>
      )}

      {/* Tombol aksi — hanya admin, hanya PENDING */}
      {correction.status === 'PENDING' && isAdmin && (
        <div className="mt-4 space-y-3">
          {!showRejectInput ? (
            <div className="flex gap-2">
              <button
                onClick={() => onApprove(correction.id)}
                disabled={isProcessing}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5
                  bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg
                  transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isProcessing ? <Loader size={14} className="animate-spin" /> : <CheckCircle size={15} />}
                Setujui
              </button>
              <button
                onClick={() => setShowRejectInput(true)}
                disabled={isProcessing}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5
                  bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20
                  border border-gray-300 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-700
                  text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400
                  text-sm font-medium rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <XCircle size={15} />
                Tolak
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                value={rejectNote}
                onChange={e => setRejectNote(e.target.value)}
                placeholder="Alasan penolakan (opsional)"
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600
                  bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                  focus:outline-none focus:ring-2 focus:ring-red-400"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowRejectInput(false); setRejectNote('') }}
                  className="flex-1 px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600
                    text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  Batal
                </button>
                <button
                  onClick={handleReject}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 text-sm rounded-lg bg-red-600 hover:bg-red-700
                    text-white font-medium transition disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isProcessing ? <Loader size={14} className="animate-spin" /> : null}
                  Konfirmasi Tolak
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </article>
  )
}

// ─── Pagination ───────────────────────────────────────────────
const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="p-2 rounded-lg border border-gray-300 dark:border-gray-600
          hover:bg-gray-50 dark:hover:bg-gray-700 transition
          disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="text-sm text-gray-600 dark:text-gray-400">
        Halaman {page} dari {totalPages}
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="p-2 rounded-lg border border-gray-300 dark:border-gray-600
          hover:bg-gray-50 dark:hover:bg-gray-700 transition
          disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────
const CorrectionQueuePage = () => {
  const { user } = useAuth()
  const isAdmin = user?.roles?.includes('ADMIN')

  const [activeTab, setActiveTab]       = useState('PENDING')
  const [corrections, setCorrections]   = useState([])
  const [loading, setLoading]           = useState(true)
  const [page, setPage]                 = useState(1)
  const [totalPages, setTotalPages]     = useState(1)
  const [totalItems, setTotalItems]     = useState(0)
  const [processingId, setProcessingId] = useState(null)
  const [actionFeedback, setActionFeedback] = useState(null)

  const LIMIT = 10

    const fetchCorrections = useCallback(async (tab, p) => {
      setLoading(true)
      try {
        const res = await dashboardService.getCorrections(tab, p, LIMIT)
        setCorrections(res.data?.items || [])
        const total = res.data?.total || 0
        setTotalItems(total)
        setTotalPages(Math.ceil(total / LIMIT) || 1)
      } catch (err) {
        console.error('Failed to fetch corrections:', err)
        setCorrections([])
      } finally {
        setLoading(false)
      }
    }, []) // ← isAdmin dihapus dari dependency

  useEffect(() => {
    fetchCorrections(activeTab, page)
  }, [activeTab, page, fetchCorrections])

  const showFeedback = (type, message) => {
    setActionFeedback({ type, message })
    setTimeout(() => setActionFeedback(null), 3000)
  }

  const handleApprove = useCallback(async (correctionId) => {
    setProcessingId(correctionId)
    try {
      await dashboardService.approveCorrection(correctionId)
      showFeedback('success', '✓ Koreksi disetujui. Epub sedang diperbarui di background.')
      await fetchCorrections(activeTab, page)
    } catch (err) {
      showFeedback('error', '✗ Gagal menyetujui koreksi: ' + (err?.response?.data?.message || err.message))
    } finally {
      setProcessingId(null)
    }
  }, [activeTab, page, fetchCorrections])

  const handleReject = useCallback(async (correctionId, note) => {
    setProcessingId(correctionId)
    try {
      await dashboardService.rejectCorrection(correctionId, note)
      showFeedback('success', '✓ Koreksi ditolak.')
      await fetchCorrections(activeTab, page)
    } catch (err) {
      showFeedback('error', '✗ Gagal menolak koreksi: ' + (err?.response?.data?.message || err.message))
    } finally {
      setProcessingId(null)
    }
  }, [activeTab, page, fetchCorrections])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setPage(1)
  }

  // Tabs: semua user bisa lihat PENDING, APPROVED, REJECTED
  // Bedanya: label berbeda, dan tombol aksi hanya muncul untuk admin
  const tabs = [
    { id: 'PENDING',  label: isAdmin ? 'Menunggu Review'   : 'Menunggu',          color: 'amber' },
    { id: 'APPROVED', label: isAdmin ? 'Disetujui'         : 'Riwayat Perbaikan', color: 'green' },
    { id: 'REJECTED', label: 'Ditolak',                                            color: 'red'   },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-1">
          {isAdmin ? 'Antrian Koreksi Teks' : 'Riwayat Koreksi Saya'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          {isAdmin
            ? 'Review laporan typo dari pembaca. Setujui untuk langsung mengupdate konten dan rebuild epub.'
            : 'Lihat status koreksi teks yang pernah kamu kirimkan.'}
        </p>
      </div>

      {/* Feedback toast */}
      {actionFeedback && (
        <div className={`p-4 rounded-xl border text-sm font-medium transition-all ${
          actionFeedback.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
        }`}>
          {actionFeedback.message}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex-1 px-4 py-3.5 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-b-2 border-amber-500'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && totalItems > 0 && (
                <span className="ml-2 bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {totalItems}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-3 text-gray-400">
                <Loader size={28} className="animate-spin text-amber-500" />
                <p className="text-sm">Memuat koreksi...</p>
              </div>
            </div>
          ) : corrections.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <CheckCircle size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">Tidak ada koreksi</p>
              <p className="text-sm mt-1">
                {activeTab === 'PENDING'
                  ? isAdmin
                    ? 'Semua laporan sudah diproses!'
                    : 'Belum ada laporan yang menunggu review.'
                  : 'Belum ada koreksi dengan status ini.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {corrections.map(correction => (
                <CorrectionCard
                  key={correction.id}
                  correction={correction}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  isProcessing={processingId === correction.id}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          )}

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>

    </div>
  )
}

export default CorrectionQueuePage
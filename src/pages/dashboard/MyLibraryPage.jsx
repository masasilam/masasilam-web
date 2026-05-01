// src/pages/dashboard/MyLibraryPage.jsx
// Perubahan dari versi sebelumnya:
//   - Tambah penanganan error 401 → tampil state "Sesi berakhir" + tombol masuk
//   - Semua fitur rak buku, tooltip, warna, dll TIDAK berubah

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { dashboardService } from '../../services/dashboardService'
import LoadingSpinner from '../../components/Common/LoadingSpinner'
import { Filter, SortAsc, BookOpen, Book } from 'lucide-react'
import { useDarkMode } from '../../hooks/useDarkMode'
import { chapterDisplayLabel } from '../../utils/epubUtils'

const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap'

function extractDominantColor(imgEl) {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 10; canvas.height = 15
    const ctx = canvas.getContext('2d')
    ctx.drawImage(imgEl, 0, 0, 10, 15)
    const data = ctx.getImageData(0, 0, 10, 15).data
    let r = 0, g = 0, b = 0, count = 0
    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3
      if (brightness > 20 && brightness < 235) { r += data[i]; g += data[i + 1]; b += data[i + 2]; count++ }
    }
    if (count === 0) return null
    r = Math.round(r / count); g = Math.round(g / count); b = Math.round(b / count)
    const max = Math.max(r, g, b)
    const factor = max > 0 ? Math.min(255 / max, 1.6) : 1
    r = Math.min(255, Math.round(r * factor)); g = Math.min(255, Math.round(g * factor)); b = Math.min(255, Math.round(b * factor))
    const hex = (v) => v.toString(16).padStart(2, '0')
    const bg    = `#${hex(r)}${hex(g)}${hex(b)}`
    const light = `#${hex(Math.min(255, r + 60))}${hex(Math.min(255, g + 60))}${hex(Math.min(255, b + 60))}`
    const dark  = `#${hex(Math.round(r * 0.45))}${hex(Math.round(g * 0.45))}${hex(Math.round(b * 0.45))}`
    const lum   = 0.299 * r + 0.587 * g + 0.114 * b
    const text  = lum > 145 ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.92)'
    return { bg, light, dark, text }
  } catch { return null }
}

const FALLBACK_COLORS = [
  { bg: '#4a2c8a', light: '#7a5cba', dark: '#200c4a', text: 'rgba(255,255,255,0.92)' },
  { bg: '#3a6b2a', light: '#6a9b5a', dark: '#143b0a', text: 'rgba(255,255,255,0.92)' },
  { bg: '#8a4a1a', light: '#ba7a4a', dark: '#3a1a00', text: 'rgba(255,255,255,0.92)' },
  { bg: '#6b2a50', light: '#9b5a80', dark: '#2b0a22', text: 'rgba(255,255,255,0.92)' },
  { bg: '#2a5a8a', light: '#5a8aba', dark: '#0a2050', text: 'rgba(255,255,255,0.92)' },
  { bg: '#7a5010', light: '#aa8040', dark: '#302000', text: 'rgba(255,255,255,0.92)' },
  { bg: '#1a6b5a', light: '#4a9b8a', dark: '#003b2a', text: 'rgba(255,255,255,0.92)' },
  { bg: '#5a2a10', light: '#8a5a40', dark: '#200a00', text: 'rgba(255,255,255,0.92)' },
]

const SPINE_HEIGHTS = [148, 132, 156, 122, 152, 136, 142, 126, 160, 134, 150, 124]
const SPINE_WIDTHS  = [28,  32,  26,  34,  30,  28,  32,  26,  30,  34,  28,  32]

function useBookColor(coverUrl, fallbackIndex) {
  const [colors, setColors] = useState(null)
  const imgRef = useRef(null)
  useEffect(() => {
    if (!coverUrl) { setColors(FALLBACK_COLORS[fallbackIndex % FALLBACK_COLORS.length]); return }
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload  = () => { setColors(extractDominantColor(img) || FALLBACK_COLORS[fallbackIndex % FALLBACK_COLORS.length]) }
    img.onerror = () => { setColors(FALLBACK_COLORS[fallbackIndex % FALLBACK_COLORS.length]) }
    img.src = coverUrl.includes('?') ? coverUrl : `${coverUrl}?x=spine`
    imgRef.current = img
    return () => { if (imgRef.current) { imgRef.current.onload = null; imgRef.current.onerror = null } }
  }, [coverUrl, fallbackIndex])
  return colors
}

const BookTooltip = ({ book, anchorRef, pct, badgeColor, statusLabel }) => {
  const isDark = useDarkMode()
  const [pos, setPos] = useState({ top: 0, left: 0, visible: false })

  useEffect(() => {
    if (!anchorRef.current) return
    const rect = anchorRef.current.getBoundingClientRect()
    const TOOLTIP_WIDTH = 200
    let left = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2 + window.scrollX
    let top  = rect.top + window.scrollY - 12
    left = Math.max(8, Math.min(left, window.innerWidth - TOOLTIP_WIDTH - 8))
    setPos({ top, left, visible: true })
  }, [anchorRef])

  if (!pos.visible) return null

  const bgColor    = isDark ? '#111827' : '#ffffff'
  const borderClr  = isDark ? '#374151' : '#e5e7eb'
  const titleClr   = isDark ? '#f9fafb' : '#111827'
  const subtitleClr = isDark ? '#9ca3af' : '#6b7280'
  const barBg      = isDark ? '#374151' : '#e5e7eb'

  const positionLabel = chapterDisplayLabel(book?.currentChapter, book?.totalChapters, book?.lastCfi)

  return createPortal(
    <div style={{
      position: 'absolute', top: pos.top, left: pos.left, width: 200,
      transform: 'translateY(-100%)', zIndex: 99999, pointerEvents: 'none',
      background: bgColor, border: `1px solid ${borderClr}`, borderRadius: 8,
      padding: '10px 12px', boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
    }}>
      <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', border: '7px solid transparent', borderTopColor: borderClr }} />
      <div style={{ position: 'absolute', top: 'calc(100% - 1px)', left: '50%', transform: 'translateX(-50%)', border: '6px solid transparent', borderTopColor: bgColor }} />
      {book?.coverImageUrl && (
        <div style={{ width: '100%', aspectRatio: '2/3', marginBottom: 8, borderRadius: 4, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.25)' }}>
          <img src={book.coverImageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      )}
      <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 12, fontWeight: 700, color: titleClr, lineHeight: 1.4, margin: '0 0 3px', wordBreak: 'break-word' }}>
        {book?.bookTitle}
      </p>
      <p style={{ fontSize: 11, fontStyle: 'italic', color: subtitleClr, margin: '0 0 5px' }}>{book?.authorName}</p>
      {book?.genre && <p style={{ fontSize: 10, color: '#e11d48', margin: '0 0 5px', letterSpacing: 0.5 }}>{book.genre}</p>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: badgeColor, flexShrink: 0 }} />
        <span style={{ fontSize: 10, color: subtitleClr }}>{statusLabel}</span>
      </div>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: subtitleClr, marginBottom: 3 }}>
          <span>{positionLabel}</span>
          <span>{pct}%</span>
        </div>
        <div style={{ height: 3, background: barBg, borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#c8901a,#f0d040)', borderRadius: 2 }} />
        </div>
      </div>
      {(book?.bookmarkCount > 0 || book?.highlightCount > 0 || book?.noteCount > 0) && (
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          {book.bookmarkCount  > 0 && <span style={{ fontSize: 10, color: subtitleClr }}>📑 {book.bookmarkCount}</span>}
          {book.highlightCount > 0 && <span style={{ fontSize: 10, color: subtitleClr }}>✨ {book.highlightCount}</span>}
          {book.noteCount      > 0 && <span style={{ fontSize: 10, color: subtitleClr }}>📝 {book.noteCount}</span>}
        </div>
      )}
    </div>,
    document.body
  )
}

const BookSpine = ({ book, index }) => {
  const navigate = useNavigate()
  const colors   = useBookColor(book?.coverImageUrl, index)
  const [hovered, setHovered] = useState(false)
  const spineRef = useRef(null)

  const height = SPINE_HEIGHTS[index % SPINE_HEIGHTS.length]
  const width  = SPINE_WIDTHS[index  % SPINE_WIDTHS.length]
  const pct    = Math.round(book?.progressPercentage || 0)

  const bg        = colors?.bg   ?? '#3a2810'
  const light     = colors?.light ?? '#5a4820'
  const dark      = colors?.dark  ?? '#1a0c04'
  const textColor = colors?.text  ?? 'rgba(255,255,255,0.92)'

  const badgeColor  = book?.readingStatus === 'completed' ? '#4caf50' : book?.readingStatus === 'reading' ? '#4a9eff' : 'rgba(255,255,255,0.25)'
  const statusLabel = book?.readingStatus === 'completed' ? 'Selesai' : book?.readingStatus === 'reading' ? 'Sedang Dibaca' : 'Belum Dibaca'

  const handleClick = useCallback(() => {
    if (!book?.bookSlug) return
    navigate(`/buku/${book.bookSlug}/baca`, { state: book.lastCfi ? { lastCfi: book.lastCfi } : {} })
  }, [navigate, book?.bookSlug, book?.lastCfi])

  return (
    <>
      <div ref={spineRef} onClick={handleClick}
        style={{ position: 'relative', flexShrink: 0, width, display: 'block', cursor: 'pointer' }}
        onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        aria-label={book?.bookTitle} role="link" tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && handleClick()}>
        <div style={{
          height, width, borderRadius: '1px 3px 3px 1px',
          background: colors ? `linear-gradient(150deg, ${light} 0%, ${bg} 50%, ${dark} 100%)` : '#2a1c0a',
          boxShadow: '-2px 0 4px rgba(0,0,0,0.55), inset -2px 0 6px rgba(0,0,0,0.3), inset 1px 0 2px rgba(255,255,255,0.12)',
          position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', transition: 'transform 0.2s ease, filter 0.2s ease, background 0.5s ease',
          transform: hovered ? 'translateY(-14px) scale(1.05)' : 'none',
          filter: hovered ? 'brightness(1.25)' : 'none',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: 5, height: '100%', background: 'linear-gradient(90deg,rgba(0,0,0,0.4),rgba(255,255,255,0.1),transparent)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 0, right: 0, width: 3, height: '100%', background: 'linear-gradient(90deg,transparent,rgba(0,0,0,0.5))', pointerEvents: 'none' }} />
          <p style={{
            writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'rotate(180deg)',
            fontFamily: "'Crimson Text',Georgia,serif", fontSize: 10, fontWeight: 600,
            letterSpacing: 0.4, color: textColor, textShadow: '0 1px 3px rgba(0,0,0,0.8)',
            padding: '6px 2px', lineHeight: 1.1, maxHeight: 115, overflow: 'hidden', margin: 0,
          }}>{book?.bookTitle}</p>
          <div style={{ position: 'absolute', bottom: 5, left: '50%', transform: 'translateX(-50%)', width: 12, height: 3, borderRadius: 2, background: badgeColor }} />
        </div>
      </div>
      {hovered && <BookTooltip book={book} anchorRef={spineRef} pct={pct} badgeColor={badgeColor} statusLabel={statusLabel} />}
    </>
  )
}

const Shelf = ({ books, startIndex }) => (
  <div>
    <div style={{
      padding: '18px 16px 0',
      background: `repeating-linear-gradient(90deg,transparent 0,transparent 18px,rgba(0,0,0,0.035) 18px,rgba(0,0,0,0.035) 20px),linear-gradient(180deg,#2e1f0a 0%,#3d2a10 30%,#4a3418 60%,#3a2810 100%)`,
      borderLeft: '14px solid', borderRight: '14px solid',
      borderImage: 'linear-gradient(180deg,#5c3d18,#3a2508,#6b4c1e) 1',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, minHeight: 170, paddingBottom: 6 }}>
        {books.map((book, i) => <BookSpine key={book?.bookId || i} book={book} index={startIndex + i} />)}
      </div>
      <div style={{
        height: 22, margin: '0 -16px',
        background: 'linear-gradient(180deg,#9a6e30 0%,#7a5020 25%,#a07038 50%,#8B5E2A 75%,#6b4418 100%)',
        borderTop: '2px solid #d4a030', boxShadow: '0 5px 14px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,210,80,0.25)',
        position: 'relative',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(180deg,rgba(255,190,70,0.35),transparent)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 9, background: 'linear-gradient(180deg,transparent,rgba(0,0,0,0.45))' }} />
      </div>
    </div>
    <div style={{ height: 12, background: 'linear-gradient(180deg,rgba(0,0,0,0.55),transparent)' }} />
  </div>
)

const MyLibraryPage = () => {
  const navigate = useNavigate()
  const [books,      setBooks]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [filter,     setFilter]     = useState('all')
  const [sortBy,     setSortBy]     = useState('last_read')
  const [page,       setPage]       = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalData,  setTotalData]  = useState(0)
  const BOOKS_PER_PAGE  = 16
  const BOOKS_PER_SHELF = 8

  useEffect(() => {
    if (document.querySelector(`link[href="${FONT_HREF}"]`)) return
    const link = document.createElement('link')
    link.rel = 'stylesheet'; link.href = FONT_HREF
    document.head.appendChild(link)
  }, [])

  useEffect(() => {
    document.title = 'Perpustakaan Saya - Dashboard MasasilaM'
  }, [])

  const fetchLibrary = useCallback(async () => {
    try {
      setLoading(true); setError(null)
      const response = await dashboardService.getLibrary(filter, page, BOOKS_PER_PAGE, sortBy)
      if (response?.data) {
        setBooks(response.data.items || [])
        const total = response.data.totalData || response.data.total || 0
        setTotalData(total)
        setTotalPages(Math.max(1, Math.ceil(total / BOOKS_PER_PAGE)))
      } else {
        setBooks([]); setTotalData(0); setTotalPages(1)
        setError('network')
      }
    } catch (err) {
      console.error('Error:', err)
      // FIX: bedakan 401 vs network error
      if (err?.response?.status === 401) setError('auth')
      else setError('network')
      setBooks([]); setTotalData(0); setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }, [filter, page, sortBy])

  useEffect(() => { fetchLibrary() }, [fetchLibrary])

  const filterOptions = useMemo(() => [
    { value: 'all',       label: 'Semua Buku'    },
    { value: 'reading',   label: 'Sedang Dibaca' },
    { value: 'completed', label: 'Selesai'       },
    { value: 'bookmarked',label: 'Ada Bookmark'  },
  ], [])

  const sortOptions = useMemo(() => [
    { value: 'last_read', label: 'Terakhir Dibaca' },
    { value: 'progress',  label: 'Progress'        },
    { value: 'title',     label: 'Judul'           },
    { value: 'rating',    label: 'Rating'          },
  ], [])

  const handleFilterChange = useCallback((v) => { setFilter(v); setPage(1) }, [])
  const handleSortChange   = useCallback((v) => { setSortBy(v); setPage(1) }, [])
  const handlePageChange   = useCallback((p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }, [])

  const shelves = useMemo(() => {
    const rows = []
    for (let i = 0; i < books.length; i += BOOKS_PER_SHELF)
      rows.push(books.slice(i, i + BOOKS_PER_SHELF))
    return rows
  }, [books])

  const countReading   = books.filter(b => b?.readingStatus === 'reading').length
  const countCompleted = books.filter(b => b?.readingStatus === 'completed').length

  // ── Error state untuk auth (session expired) ──────────────────────────────
  if (error === 'auth') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
          <Book className="w-8 h-8 text-amber-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Sesi telah berakhir</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">Silakan masuk kembali untuk melanjutkan.</p>
        </div>
        <button
          onClick={() => navigate('/masuk', { state: { from: '/dasbor/perpustakaan' } })}
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition"
        >
          Masuk Kembali
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-serif">
      <div className="mb-6 sm:mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100" style={{ fontFamily: "'Playfair Display',serif" }}>
            Perpustakaan Saya
          </h1>
          <p className="text-gray-600 dark:text-gray-400 italic text-sm">Semua buku yang pernah Anda baca</p>
        </div>
        <div className="flex items-center gap-2">
          <SortAsc size={14} className="text-gray-500 dark:text-gray-400" />
          <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest">Urutkan:</label>
          <select value={sortBy} onChange={e => handleSortChange(e.target.value)}
            className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
            {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* Filter bar + stats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6 flex flex-wrap gap-3 items-center">
        <Filter size={14} className="text-gray-400 flex-shrink-0" />
        {filterOptions.map(o => (
          <button key={o.value} onClick={() => handleFilterChange(o.value)}
            className={`px-4 py-1.5 rounded-full text-sm transition-colors border focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
              filter === o.value
                ? 'bg-primary text-white border-primary'
                : 'bg-transparent text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:border-primary hover:text-primary'
            }`}>
            {o.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-6">
          {[
            { num: totalData,      lbl: 'Total'  },
            { num: countReading,   lbl: 'Dibaca' },
            { num: countCompleted, lbl: 'Selesai'},
          ].map((s, i) => (
            <div key={i} className="text-center">
              <span className="block text-xl font-bold text-gray-900 dark:text-gray-100" style={{ fontFamily: "'Playfair Display',serif" }}>{s.num}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{s.lbl}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Network error */}
      {error && error !== 'auth' && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <p className="text-red-700 dark:text-red-400 mb-2">Gagal memuat data perpustakaan</p>
          <button onClick={fetchLibrary} className="text-sm px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            Coba Lagi
          </button>
        </div>
      )}

      {/* Konten utama */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <p className="text-xs tracking-widest uppercase text-gray-400 dark:text-gray-500 px-6 py-4 border-b border-gray-100 dark:border-gray-700"
          style={{ fontFamily: "'Playfair Display',serif", letterSpacing: '0.2em' }}>
          — Koleksi Anda —
        </p>
        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner /></div>
        ) : books.length === 0 ? (
          <div className="text-center py-16 text-gray-400 dark:text-gray-500">
            <BookOpen size={48} className="mx-auto mb-3 opacity-40" />
            <p className="italic text-base">Belum ada buku di perpustakaan</p>
          </div>
        ) : (
          <div className="p-4 sm:p-6 space-y-2">
            {shelves.map((row, ri) => <Shelf key={ri} books={row} startIndex={ri * BOOKS_PER_SHELF} />)}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <nav aria-label="Pagination" className="flex items-center justify-center gap-2 mt-6">
          <button onClick={() => handlePageChange(Math.max(1, page - 1))} disabled={page === 1 || loading}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition">
            ← Sebelumnya
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400 px-2">Halaman {page} dari {totalPages}</span>
          <button onClick={() => handlePageChange(Math.min(totalPages, page + 1))} disabled={page === totalPages || loading}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition">
            Selanjutnya →
          </button>
        </nav>
      )}
    </div>
  )
}

export default MyLibraryPage
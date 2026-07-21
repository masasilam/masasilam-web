import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { dashboardService } from '../../services/dashboardService'
import LoadingSpinner from '../../components/Common/LoadingSpinner'
import { SortAsc, BookOpen, Book, Library, RefreshCw } from 'lucide-react'
import { useDarkMode } from '../../hooks/useDarkMode'
import { chapterDisplayLabel } from '../../utils/epubUtils'

// ─────────────────────────────────────────────────────────────────────────────
// Google Fonts (spine text only)
// ─────────────────────────────────────────────────────────────────────────────
const FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap'

// ─────────────────────────────────────────────────────────────────────────────
// Colour extraction
// ─────────────────────────────────────────────────────────────────────────────
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
      if (brightness > 20 && brightness < 235) {
        r += data[i]; g += data[i + 1]; b += data[i + 2]; count++
      }
    }
    if (count === 0) return null
    r = Math.round(r / count); g = Math.round(g / count); b = Math.round(b / count)
    const max    = Math.max(r, g, b)
    const factor = max > 0 ? Math.min(255 / max, 1.6) : 1
    r = Math.min(255, Math.round(r * factor))
    g = Math.min(255, Math.round(g * factor))
    b = Math.min(255, Math.round(b * factor))
    const hex   = (v) => v.toString(16).padStart(2, '0')
    const bg    = `#${hex(r)}${hex(g)}${hex(b)}`
    const light = `#${hex(Math.min(255, r + 60))}${hex(Math.min(255, g + 60))}${hex(Math.min(255, b + 60))}`
    const dark  = `#${hex(Math.round(r * 0.45))}${hex(Math.round(g * 0.45))}${hex(Math.round(b * 0.45))}`
    const lum   = 0.299 * r + 0.587 * g + 0.114 * b
    return { bg, light, dark, text: lum > 145 ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.92)' }
  } catch { return null }
}

const FALLBACK_COLORS = [
  { bg:'#4a2c8a', light:'#7a5cba', dark:'#200c4a', text:'rgba(255,255,255,0.92)' },
  { bg:'#3a6b2a', light:'#6a9b5a', dark:'#143b0a', text:'rgba(255,255,255,0.92)' },
  { bg:'#8a4a1a', light:'#ba7a4a', dark:'#3a1a00', text:'rgba(255,255,255,0.92)' },
  { bg:'#6b2a50', light:'#9b5a80', dark:'#2b0a22', text:'rgba(255,255,255,0.92)' },
  { bg:'#2a5a8a', light:'#5a8aba', dark:'#0a2050', text:'rgba(255,255,255,0.92)' },
  { bg:'#7a5010', light:'#aa8040', dark:'#302000', text:'rgba(255,255,255,0.92)' },
  { bg:'#1a6b5a', light:'#4a9b8a', dark:'#003b2a', text:'rgba(255,255,255,0.92)' },
  { bg:'#5a2a10', light:'#8a5a40', dark:'#200a00', text:'rgba(255,255,255,0.92)' },
]

const SPINE_HEIGHTS = [148,132,156,122,152,136,142,126,160,134,150,124]
const SPINE_WIDTHS  = [28, 32, 26, 34, 30, 28, 32, 26, 30, 34, 28, 32]
const AVG_SPINE_W   = 30  // used for fit estimation
const SPINE_GAP     = 3

function useBookColor(coverUrl, fallbackIndex) {
  const [colors, setColors] = useState(null)
  const imgRef = useRef(null)
  useEffect(() => {
    if (!coverUrl) { setColors(FALLBACK_COLORS[fallbackIndex % FALLBACK_COLORS.length]); return }
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload  = () => setColors(extractDominantColor(img) || FALLBACK_COLORS[fallbackIndex % FALLBACK_COLORS.length])
    img.onerror = () => setColors(FALLBACK_COLORS[fallbackIndex % FALLBACK_COLORS.length])
    img.src = coverUrl.includes('?') ? coverUrl : `${coverUrl}?x=spine`
    imgRef.current = img
    return () => { if (imgRef.current) { imgRef.current.onload = null; imgRef.current.onerror = null } }
  }, [coverUrl, fallbackIndex])
  return colors
}

// ─────────────────────────────────────────────────────────────────────────────
// Progress ring (tooltip)
// ─────────────────────────────────────────────────────────────────────────────
const ProgressRing = ({ pct, size = 34, stroke = 3 }) => {
  const r   = (size - stroke * 2) / 2
  const c   = 2 * Math.PI * r
  const off = c * (1 - Math.min(pct, 100) / 100)
  return (
    <svg width={size} height={size} className="-rotate-90" viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke={pct >= 100 ? '#4ade80' : '#f59e0b'}
        strokeWidth={stroke} strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// BookTooltip — portal
// ─────────────────────────────────────────────────────────────────────────────
const BookTooltip = ({ book, anchorRef, pct, badgeColor, statusLabel }) => {
  const isDark = useDarkMode()
  const [pos, setPos] = useState({ top: 0, left: 0, visible: false })

  useEffect(() => {
    if (!anchorRef.current) return
    const rect    = anchorRef.current.getBoundingClientRect()
    const TW      = 210
    let left      = rect.left + rect.width / 2 - TW / 2 + window.scrollX
    const top     = rect.top + window.scrollY - 14
    left = Math.max(8, Math.min(left, window.innerWidth - TW - 8))
    setPos({ top, left, visible: true })
  }, [anchorRef])

  if (!pos.visible) return null

  const bg      = isDark ? '#0f172a' : '#ffffff'
  const border  = isDark ? '#334155' : '#e2e8f0'
  const title   = isDark ? '#f8fafc' : '#0f172a'
  const sub     = isDark ? '#94a3b8' : '#64748b'
  const barBg   = isDark ? '#334155' : '#f1f5f9'
  const posLbl  = chapterDisplayLabel(book?.currentChapter, book?.totalChapters, book?.lastCfi)

  return createPortal(
    <div style={{ position:'absolute', top:pos.top, left:pos.left, width:210, transform:'translateY(-100%)', zIndex:99999, pointerEvents:'none' }}>
      <div style={{ background:bg, border:`1px solid ${border}`, borderRadius:16, padding:14,
        boxShadow: isDark
          ? '0 20px 60px rgba(0,0,0,0.7),0 0 0 1px rgba(255,255,255,0.04)'
          : '0 20px 60px rgba(0,0,0,0.15),0 0 0 1px rgba(0,0,0,0.04)' }}>
        <div style={{ position:'absolute', top:'100%', left:'50%', transform:'translateX(-50%)', border:'8px solid transparent', borderTopColor:border }} />
        <div style={{ position:'absolute', top:'calc(100% - 1px)', left:'50%', transform:'translateX(-50%)', border:'7px solid transparent', borderTopColor:bg }} />
        {book?.coverImageUrl && (
          <div style={{ width:'100%', aspectRatio:'2/3', marginBottom:10, borderRadius:8, overflow:'hidden', boxShadow:'0 4px 16px rgba(0,0,0,0.3)' }}>
            <img src={book.coverImageUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
          </div>
        )}
        <p style={{ fontFamily:"'Crimson Text',Georgia,serif", fontSize:13, fontWeight:700, color:title, lineHeight:1.35, margin:'0 0 3px', wordBreak:'break-word' }}>
          {book?.bookTitle}
        </p>
        <p style={{ fontSize:11, fontStyle:'italic', color:sub, margin:'0 0 8px' }}>{book?.authorName}</p>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:badgeColor }} />
            <span style={{ fontSize:11, color:sub }}>{statusLabel}</span>
          </div>
          <div style={{ position:'relative', flexShrink:0 }}>
            <ProgressRing pct={pct} />
            <span style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:8, fontWeight:700, color: pct>=100?'#4ade80':'#f59e0b' }}>{pct}%</span>
          </div>
        </div>
        <div style={{ height:4, background:barBg, borderRadius:99, overflow:'hidden', marginBottom:6 }}>
          <div style={{ height:'100%', width:`${Math.min(pct,100)}%`, background:pct>=100?'#4ade80':'linear-gradient(90deg,#f59e0b,#fcd34d)', borderRadius:99 }} />
        </div>
        <p style={{ fontSize:10, color:sub, margin:'0 0 8px' }}>{posLbl}</p>
        {(book?.bookmarkCount>0||book?.highlightCount>0||book?.noteCount>0) && (
          <div style={{ display:'flex', gap:10, borderTop:`1px solid ${border}`, paddingTop:8 }}>
            {book.bookmarkCount  > 0 && <span style={{ fontSize:10, color:sub }}>📑 {book.bookmarkCount}</span>}
            {book.highlightCount > 0 && <span style={{ fontSize:10, color:sub }}>✨ {book.highlightCount}</span>}
            {book.noteCount      > 0 && <span style={{ fontSize:10, color:sub }}>📝 {book.noteCount}</span>}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// BookSpine
// ─────────────────────────────────────────────────────────────────────────────
const BookSpine = ({ book, index }) => {
  const navigate    = useNavigate()
  const colors      = useBookColor(book?.coverImageUrl, index)
  const [hovered, setHovered] = useState(false)
  const spineRef    = useRef(null)

  const height      = SPINE_HEIGHTS[index % SPINE_HEIGHTS.length]
  const width       = SPINE_WIDTHS[index  % SPINE_WIDTHS.length]
  const pct         = Math.round(book?.progressPercentage || 0)
  const bg          = colors?.bg    ?? '#3a2810'
  const light       = colors?.light ?? '#5a4820'
  const dark        = colors?.dark  ?? '#1a0c04'
  const textColor   = colors?.text  ?? 'rgba(255,255,255,0.92)'
  const isCompleted = book?.readingStatus === 'completed'
  const isReading   = book?.readingStatus === 'reading'
  const badgeColor  = isCompleted ? '#4ade80' : isReading ? '#60a5fa' : 'rgba(255,255,255,0.2)'
  const statusLabel = isCompleted ? 'Selesai' : isReading ? 'Sedang Dibaca' : 'Belum Dibaca'

  const handleClick = useCallback(() => {
    if (!book?.bookSlug) return
    navigate(`/buku/${book.bookSlug}/baca`, { state: book.lastCfi ? { lastCfi: book.lastCfi } : {} })
  }, [navigate, book?.bookSlug, book?.lastCfi])

  return (
    <>
      <div ref={spineRef} onClick={handleClick}
        style={{ position:'relative', flexShrink:0, width, cursor:'pointer' }}
        onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        aria-label={book?.bookTitle} role="link" tabIndex={0}
        onKeyDown={e => e.key==='Enter' && handleClick()}
      >
        <div style={{
          height, width, borderRadius:'1px 4px 4px 1px',
          background: colors ? `linear-gradient(150deg,${light} 0%,${bg} 45%,${dark} 100%)` : '#2a1c0a',
          boxShadow: hovered
            ? '-3px 0 8px rgba(0,0,0,0.7),inset -2px 0 6px rgba(0,0,0,0.35),inset 1px 0 3px rgba(255,255,255,0.15),0 -4px 16px rgba(0,0,0,0.5)'
            : '-2px 0 5px rgba(0,0,0,0.55),inset -2px 0 5px rgba(0,0,0,0.3),inset 1px 0 2px rgba(255,255,255,0.1)',
          position:'relative', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
          overflow:'hidden',
          transition:'transform 0.22s cubic-bezier(0.34,1.56,0.64,1),filter 0.2s ease,box-shadow 0.2s ease',
          transform: hovered ? 'translateY(-16px) scale(1.06)' : 'none',
          filter: hovered ? 'brightness(1.3)' : 'none',
          willChange:'transform',
        }}>
          <div style={{ position:'absolute', top:0, left:0, width:5, height:'100%', background:'linear-gradient(90deg,rgba(0,0,0,0.45),rgba(255,255,255,0.12),transparent)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', top:0, right:0, width:4, height:'100%', background:'linear-gradient(90deg,transparent,rgba(0,0,0,0.55))', pointerEvents:'none' }} />
          <div style={{ position:'absolute', top:0, left:0, right:0, height:6, background:'linear-gradient(180deg,rgba(255,255,255,0.18),transparent)', pointerEvents:'none' }} />
          {/* Only Crimson Text here — does NOT bleed to the page wrapper */}
          <p style={{
            writingMode:'vertical-rl', textOrientation:'mixed', transform:'rotate(180deg)',
            fontFamily:"'Crimson Text',Georgia,serif",
            fontSize:10, fontWeight:600, letterSpacing:0.5,
            color:textColor, textShadow:'0 1px 4px rgba(0,0,0,0.9)',
            padding:'6px 2px', lineHeight:1.1, maxHeight:height-24, overflow:'hidden', margin:0,
          }}>
            {book?.bookTitle}
          </p>
          <div style={{ position:'absolute', bottom:6, left:'50%', transform:'translateX(-50%)', width:10, height:3, borderRadius:99, background:badgeColor, boxShadow:`0 0 6px ${badgeColor}` }} />
        </div>
      </div>
      {hovered && <BookTooltip book={book} anchorRef={spineRef} pct={pct} badgeColor={badgeColor} statusLabel={statusLabel} />}
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Shelf row
// ─────────────────────────────────────────────────────────────────────────────
const Shelf = ({ books, startIndex }) => (
  <div>
    <div style={{
      padding:'20px 18px 0',
      background:`repeating-linear-gradient(90deg,transparent 0,transparent 18px,rgba(0,0,0,0.04) 18px,rgba(0,0,0,0.04) 20px),linear-gradient(180deg,#2e1f0a 0%,#3d2a10 25%,#4a3418 55%,#402e14 80%,#3a2810 100%)`,
      borderLeft:'16px solid', borderRight:'16px solid',
      borderImage:'linear-gradient(180deg,#6b4c1e,#3d2508,#7a5828) 1',
    }}>
      <div style={{ display:'flex', alignItems:'flex-end', gap:SPINE_GAP, minHeight:175, paddingBottom:6 }}>
        {books.map((book, i) => (
          <BookSpine key={book?.bookId || i} book={book} index={startIndex + i} />
        ))}
      </div>
      <div style={{
        height:24, margin:'0 -18px',
        background:'linear-gradient(180deg,#b07830 0%,#8a5c20 20%,#a87030 45%,#8B5E2A 70%,#6b4418 100%)',
        borderTop:'2px solid #e0b040',
        boxShadow:'0 6px 18px rgba(0,0,0,0.7),inset 0 1px 0 rgba(255,215,80,0.3),inset 0 -2px 4px rgba(0,0,0,0.4)',
        position:'relative',
      }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:4, background:'linear-gradient(180deg,rgba(255,200,70,0.4),transparent)' }} />
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:10, background:'linear-gradient(180deg,transparent,rgba(0,0,0,0.5))' }} />
      </div>
    </div>
    <div style={{ height:14, background:'linear-gradient(180deg,rgba(0,0,0,0.55),rgba(0,0,0,0.1),transparent)' }} />
  </div>
)

// Skeleton shelf
const SkeletonShelf = ({ count }) => (
  <div>
    <div style={{ padding:'20px 18px 0', background:'linear-gradient(180deg,#2e1f0a,#3d2a10 25%,#4a3418 55%,#3a2810)', borderLeft:'16px solid #5c3d18', borderRight:'16px solid #5c3d18' }}>
      <div style={{ display:'flex', alignItems:'flex-end', gap:SPINE_GAP, minHeight:175, paddingBottom:6 }}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} style={{ flexShrink:0, width:SPINE_WIDTHS[i%SPINE_WIDTHS.length], height:SPINE_HEIGHTS[i%SPINE_HEIGHTS.length], borderRadius:'1px 4px 4px 1px', background:'rgba(255,255,255,0.07)' }} />
        ))}
      </div>
      <div style={{ height:24, margin:'0 -18px', background:'linear-gradient(180deg,#b07830,#6b4418)', borderTop:'2px solid #e0b040', boxShadow:'0 6px 18px rgba(0,0,0,0.7)' }} />
    </div>
    <div style={{ height:14, background:'linear-gradient(180deg,rgba(0,0,0,0.5),transparent)' }} />
  </div>
)

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────
const FILTER_OPTIONS = [
  { value:'all',        label:'Semua'         },
  { value:'reading',    label:'Sedang Dibaca'  },
  { value:'completed',  label:'Selesai'        },
  { value:'bookmarked', label:'Ada Bookmark'   },
]
const SORT_OPTIONS = [
  { value:'last_read', label:'Terakhir Dibaca' },
  { value:'progress',  label:'Progress'        },
  { value:'title',     label:'Judul'           },
  { value:'rating',    label:'Rating'          },
]

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
const MyLibraryPage = () => {
  const navigate   = useNavigate()
  const shelfRef   = useRef(null)

  const [books,      setBooks]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [filter,     setFilter]     = useState('all')
  const [sortBy,     setSortBy]     = useState('last_read')
  const [page,       setPage]       = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalData,  setTotalData]  = useState(0)

  // ── Dynamic books-per-shelf via ResizeObserver ─────────────────────────
  const [booksPerShelf, setBooksPerShelf] = useState(14)

  useEffect(() => {
    const calc = () => {
      if (!shelfRef.current) return
      // subtract: left border (16) + left pad (18) + right pad (18) + right border (16) = 68px
      const innerW = shelfRef.current.offsetWidth - 68
      setBooksPerShelf(Math.max(4, Math.floor(innerW / (AVG_SPINE_W + SPINE_GAP))))
    }
    calc()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(calc) : null
    if (ro && shelfRef.current) ro.observe(shelfRef.current)
    window.addEventListener('resize', calc)
    return () => { ro?.disconnect(); window.removeEventListener('resize', calc) }
  }, [])

  const BOOKS_PER_PAGE = booksPerShelf * 2   // always show 2 full shelves

  // ── Fonts ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (document.querySelector(`link[href="${FONT_HREF}"]`)) return
    const link = document.createElement('link')
    link.rel = 'stylesheet'; link.href = FONT_HREF
    document.head.appendChild(link)
  }, [])

  useEffect(() => { document.title = 'Perpustakaan Saya - Dashboard' }, [])

  // ── Fetch ───────────────────────────────────────────────────────────────
  const fetchLibrary = useCallback(async () => {
    try {
      setLoading(true); setError(null)
      const res = await dashboardService.getLibrary(filter, page, BOOKS_PER_PAGE, sortBy)
      if (res?.data) {
        setBooks(res.data.items || [])
        const total = res.data.totalData || res.data.total || 0
        setTotalData(total)
        setTotalPages(Math.max(1, Math.ceil(total / BOOKS_PER_PAGE)))
      } else {
        setBooks([]); setTotalData(0); setTotalPages(1); setError('network')
      }
    } catch (err) {
      setError(err?.response?.status === 401 ? 'auth' : 'network')
      setBooks([]); setTotalData(0); setTotalPages(1)
    } finally { setLoading(false) }
  }, [filter, page, BOOKS_PER_PAGE, sortBy])

  useEffect(() => { fetchLibrary() }, [fetchLibrary])

  const handleFilterChange = useCallback((v) => { setFilter(v); setPage(1) }, [])
  const handleSortChange   = useCallback((v) => { setSortBy(v); setPage(1)  }, [])
  const handlePageChange   = useCallback((p) => {
    setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const shelves = useMemo(() => {
    const rows = []
    for (let i = 0; i < books.length; i += booksPerShelf)
      rows.push(books.slice(i, i + booksPerShelf))
    return rows
  }, [books, booksPerShelf])

  const countReading   = books.filter(b => b?.readingStatus === 'reading').length
  const countCompleted = books.filter(b => b?.readingStatus === 'completed').length

  // ── Auth error ───────────────────────────────────────────────────────────
  if (error === 'auth') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
          <Book className="w-8 h-8 text-amber-500" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-stone-900 dark:text-slate-100 mb-1">Sesi telah berakhir</h2>
          <p className="text-sm text-stone-500 dark:text-slate-400 max-w-xs">Silakan masuk kembali untuk melanjutkan.</p>
        </div>
        <button onClick={() => navigate('/masuk', { state: { from: '/dasbor/perpustakaan' } })}
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 text-sm font-bold rounded-xl transition-all">
          Masuk Kembali
        </button>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Library className="w-5 h-5 text-amber-500" />
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-slate-50">
              Perpustakaan Saya
            </h1>
          </div>
          <p className="text-sm text-stone-500 dark:text-slate-400 italic">
            Semua buku yang pernah Anda baca
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <SortAsc className="w-4 h-4 text-stone-400 flex-shrink-0" />
          <select value={sortBy} onChange={e => handleSortChange(e.target.value)}
            className="px-3 py-2 text-sm rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-stone-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400/40 transition cursor-pointer">
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* ── Stats ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label:'Total',   value:totalData,       color:'text-stone-900 dark:text-slate-100'       },
          { label:'Dibaca',  value:countReading,    color:'text-blue-600 dark:text-blue-400'          },
          { label:'Selesai', value:countCompleted,  color:'text-emerald-600 dark:text-emerald-400'   },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-slate-700 py-3 px-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-stone-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Filter pills ────────────────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap">
        {FILTER_OPTIONS.map(o => (
          <button key={o.value} onClick={() => handleFilterChange(o.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
              filter === o.value
                ? 'bg-amber-500 text-stone-950 border-amber-500 font-bold shadow-sm shadow-amber-200 dark:shadow-amber-900/30'
                : 'bg-white dark:bg-slate-900 text-stone-600 dark:text-slate-400 border-stone-200 dark:border-slate-700 hover:border-amber-400 hover:text-amber-600 dark:hover:border-amber-500 dark:hover:text-amber-400'
            }`}>
            {o.label}
            {filter === o.value && totalData > 0 && (
              <span className="ml-1.5 text-[11px] bg-stone-950/15 rounded-full px-1.5 py-0.5">{totalData}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Network error ─────────────────────────────────────────────── */}
      {error && error !== 'auth' && (
        <div className="flex items-center justify-between gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4">
          <p className="text-sm text-red-700 dark:text-red-400">Gagal memuat data perpustakaan</p>
          <button onClick={fetchLibrary}
            className="flex items-center gap-1.5 text-sm font-semibold px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Coba Lagi
          </button>
        </div>
      )}

      {/* ── Bookshelf (ref here for ResizeObserver) ─────────────────── */}
      <div ref={shelfRef} className="overflow-hidden rounded-2xl border border-stone-200 dark:border-slate-700 shadow-lg">
        {/* Header */}
        <div className="px-5 py-3 border-b border-stone-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-stone-400 dark:text-slate-500">
            — Koleksi Anda —
          </p>
          {!loading && books.length > 0 && (
            <p className="text-xs text-stone-400 dark:text-slate-500">
              {totalPages > 1 ? `Hal. ${page} / ${totalPages}` : `${books.length} buku ditampilkan`}
            </p>
          )}
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5" style={{ background:'linear-gradient(180deg,#1a1208 0%,#221810 50%,#1a120a 100%)' }}>
          {loading ? (
            <div className="space-y-2">
              <SkeletonShelf count={booksPerShelf} />
              <SkeletonShelf count={Math.floor(booksPerShelf * 0.65)} />
            </div>
          ) : books.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background:'rgba(255,255,255,0.06)' }}>
                <BookOpen className="w-8 h-8 text-amber-400 opacity-40" />
              </div>
              <p className="text-sm text-amber-200/50 italic mb-1">Rak kosong...</p>
              <p className="text-xs text-amber-200/30">Mulai membaca untuk mengisi rak ini</p>
            </div>
          ) : (
            <div className="space-y-2">
              {shelves.map((row, ri) => (
                <Shelf key={ri} books={row} startIndex={ri * booksPerShelf} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Pagination ──────────────────────────────────────────────── */}
      {totalPages > 1 && !loading && (
        <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
          <button onClick={() => handlePageChange(Math.max(1, page - 1))} disabled={page === 1}
            className="px-4 py-2 text-sm font-medium rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-stone-600 dark:text-slate-400 disabled:opacity-40 disabled:cursor-not-allowed hover:border-amber-400 hover:text-amber-600 dark:hover:border-amber-500 transition-all">
            ← Sebelumnya
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              let p
              if (totalPages <= 5)          p = i + 1
              else if (page <= 3)           p = i + 1
              else if (page >= totalPages - 2) p = totalPages - 4 + i
              else                          p = page - 2 + i
              return (
                <button key={p} onClick={() => handlePageChange(p)}
                  className={`w-9 h-9 text-sm font-medium rounded-xl transition-all ${
                    p === page
                      ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                      : 'text-stone-500 dark:text-slate-400 hover:bg-stone-100 dark:hover:bg-slate-800'
                  }`}>
                  {p}
                </button>
              )
            })}
          </div>
          <button onClick={() => handlePageChange(Math.min(totalPages, page + 1))} disabled={page === totalPages}
            className="px-4 py-2 text-sm font-medium rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-stone-600 dark:text-slate-400 disabled:opacity-40 disabled:cursor-not-allowed hover:border-amber-400 hover:text-amber-600 dark:hover:border-amber-500 transition-all">
            Selanjutnya →
          </button>
        </nav>
      )}
    </div>
  )
}

export default MyLibraryPage
import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, BookOpen, Calendar, Clock, Download, Eye,
  Layers, User, Star, ChevronRight, FileText,
  BookMarked, AlignLeft, ChevronDown, ChevronUp,
  ChevronLeft, ChevronsLeft, ChevronsRight
} from 'lucide-react'
import bookService from '../services/bookService'
import SEO from '../components/Common/SEO'

const BOOKS_PER_PAGE = 10

const StarDisplay = ({ avg }) => {
  const filled   = Math.floor(avg)
  const hasHalf  = avg - filled >= 0.25 && avg - filled < 0.75
  const hasAlmost = avg - filled >= 0.75
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => {
        const isFull = s <= filled || (s === filled + 1 && hasAlmost)
        const isHalf = s === filled + 1 && hasHalf
        return (
          <span key={s} className="relative inline-block">
            <Star className="w-3 h-3 text-stone-200 dark:text-slate-700" />
            {(isFull || isHalf) && (
              <Star
                className="w-3 h-3 absolute inset-0 fill-amber-400 text-amber-400"
                style={isHalf ? { clipPath: 'polygon(0 0,50% 0,50% 100%,0 100%)' } : {}}
              />
            )}
          </span>
        )
      })}
    </div>
  )
}

const CoverStack = ({ books }) => {
  // Show at most 5 covers; pick evenly distributed items if > 5
  const pickCovers = (arr, max) => {
    if (arr.length <= max) return arr
    const step = arr.length / max
    return Array.from({ length: max }, (_, i) => arr[Math.round(i * step)] || arr[i])
  }

  const previews = pickCovers(books.filter(b => b.coverImageUrl), 5)
  if (previews.length === 0) previews.push(...books.slice(0, 5))

  const configs = [
    { rotate: '-10deg', top: 28, left: 0,  z: 1, opacity: 0.35, scale: 0.88 },
    { rotate: '-5deg',  top: 16, left: 14, z: 2, opacity: 0.55, scale: 0.92 },
    { rotate: '-1deg',  top: 8,  left: 26, z: 3, opacity: 0.72, scale: 0.96 },
    { rotate: '3deg',   top: 4,  left: 36, z: 4, opacity: 0.88, scale: 0.99 },
    { rotate: '6deg',   top: 0,  left: 44, z: 5, opacity: 1,    scale: 1    },
  ]

  const visibleConfigs = configs.slice(configs.length - previews.length)
  const coverW = 118
  const coverH = 166
  const containerW = 200
  const containerH = 210

  return (
    <div className="relative flex-shrink-0" style={{ width: containerW, height: containerH }}>
      {previews.map((book, idx) => {
        const cfg = visibleConfigs[idx]
        return (
          <div
            key={book.id || idx}
            className="absolute rounded-xl overflow-hidden border border-white/15 shadow-xl bg-slate-800"
            style={{
              width: coverW,
              height: coverH,
              top: cfg.top,
              left: cfg.left,
              transform: `rotate(${cfg.rotate}) scale(${cfg.scale})`,
              zIndex: cfg.z,
              opacity: cfg.opacity,
              transformOrigin: 'bottom center',
            }}
          >
            {book.coverImageUrl ? (
              <img
                src={book.coverImageUrl}
                alt={book.title || ''}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-800/60 to-slate-900">
                <BookOpen className="w-8 h-8 text-violet-400/50" />
              </div>
            )}
          </div>
        )
      })}

      {/* Book count badge — bottom right of stack */}
      {books.length > 1 && (
        <div
          className="absolute bottom-2 right-0 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full
                     bg-black/60 backdrop-blur-sm border border-white/20"
          style={{ fontSize: 11 }}
        >
          <Layers className="w-3 h-3 text-violet-300" />
          <span className="font-bold text-white">{books.length}</span>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// StatPill
// ─────────────────────────────────────────────────────────────────────────────
const StatPill = ({ icon: Icon, value, label }) => (
  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full
                  bg-white/10 backdrop-blur-sm border border-white/15">
    <Icon className="w-3.5 h-3.5 text-white/70 flex-shrink-0" />
    <span className="text-sm font-bold text-white">{value}</span>
    <span className="text-xs text-white/60">{label}</span>
  </div>
)

// ─────────────────────────────────────────────────────────────────────────────
// CollapsibleDescription — shows 3 lines with toggle on mobile, full on desktop
// ─────────────────────────────────────────────────────────────────────────────
const CollapsibleDescription = ({ text }) => {
  const [expanded, setExpanded] = useState(false)
  const [isClamped, setIsClamped] = useState(false)
  const textRef = useRef(null)

  useEffect(() => {
    const el = textRef.current
    if (!el) return
    const check = () => {
      // Temporarily remove clamp to measure true height
      el.style.webkitLineClamp = 'unset'
      el.style.display = 'block'
      const fullH = el.scrollHeight
      el.style.webkitLineClamp = ''
      el.style.display = '-webkit-box'
      const clampedH = el.clientHeight
      setIsClamped(fullH > clampedH + 4)
    }
    check()
    const ro = new ResizeObserver(check)
    ro.observe(el)
    return () => ro.disconnect()
  }, [text])

  return (
    <div className="mb-4 max-w-xl">
      <p
        ref={textRef}
        className="text-sm sm:text-base leading-relaxed text-white/65 transition-all duration-300"
        style={
          expanded
            ? {}
            : {
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 3,
                overflow: 'hidden',
              }
        }
      >
        {text}
      </p>

      {/* Toggle only shown when text is actually clamped */}
      {isClamped && (
        <button
          onClick={() => setExpanded(v => !v)}
          className="mt-1.5 flex items-center gap-1 text-xs font-semibold
                     text-violet-300 hover:text-violet-200 transition-colors"
          aria-expanded={expanded}
        >
          {expanded ? (
            <>Sembunyikan <ChevronUp className="w-3.5 h-3.5" /></>
          ) : (
            <>Selengkapnya <ChevronDown className="w-3.5 h-3.5" /></>
          )}
        </button>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// BookCard
// ─────────────────────────────────────────────────────────────────────────────
const BookCard = ({ book, index, globalIndex }) => {
  const [coverLoaded, setCoverLoaded] = useState(false)
  const [coverError, setCoverError]   = useState(false)

  const formatBytes = (bytes) => {
    if (!bytes) return null
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  const isFirst = globalIndex === 0

  return (
    <Link
      to={`/buku/${book.slug}`}
      className="group flex items-stretch rounded-2xl border transition-all duration-200 overflow-hidden
                 bg-white border-stone-200 hover:border-amber-300 hover:shadow-lg hover:shadow-amber-100/60
                 dark:bg-slate-900 dark:border-slate-700/80 dark:hover:border-amber-700/60 dark:hover:shadow-amber-900/20"
    >
      {/* Nomor urut */}
      <div
        className={`flex-shrink-0 flex items-center justify-center w-11 transition-colors
                     ${isFirst
                       ? 'bg-amber-500'
                       : 'bg-stone-100 dark:bg-slate-800 group-hover:bg-amber-50 dark:group-hover:bg-amber-900/20'
                     }`}
      >
        <span
          className={`text-sm font-bold transition-colors
                      ${isFirst
                        ? 'text-white'
                        : 'text-stone-400 dark:text-slate-500 group-hover:text-amber-600 dark:group-hover:text-amber-400'
                      }`}
        >
          {book.seriesOrder || globalIndex + 1}
        </span>
      </div>

      {/* Cover */}
      <div
        className="flex-shrink-0 bg-stone-100 dark:bg-slate-800 overflow-hidden self-stretch"
        style={{ width: 72, minHeight: 108 }}
      >
        {!coverError && book.coverImageUrl ? (
          <>
            {!coverLoaded && (
              <div className="w-full h-full animate-pulse bg-stone-200 dark:bg-slate-700" />
            )}
            <img
              src={book.coverImageUrl}
              alt={`Cover ${book.title}`}
              loading="lazy"
              onLoad={() => setCoverLoaded(true)}
              onError={() => setCoverError(true)}
              className={`w-full h-full object-contain transition-opacity duration-300
                           ${coverLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center
                          bg-gradient-to-br from-amber-50 to-stone-100 dark:from-slate-800 dark:to-slate-700">
            <BookOpen className="w-5 h-5 text-stone-300 dark:text-slate-600" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between px-4 py-3.5">
        <div>
          <h3 className="font-bold text-sm sm:text-base leading-snug mb-1 line-clamp-2
                         text-stone-900 dark:text-slate-50
                         group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
            {book.title}
          </h3>
          {book.authorNames && (
            <div className="flex items-center gap-1 mb-2">
              <User className="w-3 h-3 flex-shrink-0 text-stone-400 dark:text-slate-500" />
              <span className="text-xs truncate text-stone-500 dark:text-slate-400">
                {book.authorNames}
              </span>
            </div>
          )}
          {book.description && (
            <p className="hidden sm:block text-xs leading-relaxed line-clamp-2
                          text-stone-500 dark:text-slate-400">
              {book.description}
            </p>
          )}
        </div>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2.5">
          {book.estimatedReadTime && (
            <span className="flex items-center gap-1 text-[11px] text-stone-400 dark:text-slate-500">
              <Clock className="w-3 h-3" />{book.estimatedReadTime} mnt
            </span>
          )}
          {book.totalWord && (
            <span className="flex items-center gap-1 text-[11px] text-stone-400 dark:text-slate-500">
              <AlignLeft className="w-3 h-3" />{book.totalWord.toLocaleString('id-ID')} kata
            </span>
          )}
          {book.fileSize && (
            <span className="flex items-center gap-1 text-[11px] text-stone-400 dark:text-slate-500">
              <FileText className="w-3 h-3" />{formatBytes(book.fileSize)}
            </span>
          )}
          {book.viewCount > 0 && (
            <span className="flex items-center gap-1 text-[11px] text-stone-400 dark:text-slate-500">
              <Eye className="w-3 h-3" />{book.viewCount.toLocaleString('id-ID')}
            </span>
          )}
          {book.firstPublished && (
            <span className="flex items-center gap-1 text-[11px] text-stone-400 dark:text-slate-500">
              <Calendar className="w-3 h-3" />
              {book.firstPublisher && `${book.firstPublisher}, `}
              {book.firstPublished?.slice(0, 4)}
            </span>
          )}
        </div>
      </div>

      {/* Arrow */}
      <div className="flex-shrink-0 flex items-center pr-4">
        <ChevronRight className="w-4 h-4 text-stone-300 dark:text-slate-600
                                  group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors" />
      </div>
    </Link>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// BookCardSkeleton
// ─────────────────────────────────────────────────────────────────────────────
const BookCardSkeleton = () => (
  <div className="flex rounded-2xl border overflow-hidden
                  bg-white border-stone-100 dark:bg-slate-900 dark:border-slate-800">
    <div className="w-11 bg-stone-100 dark:bg-slate-800 flex-shrink-0" />
    <div className="w-20 flex-shrink-0 animate-pulse bg-stone-200 dark:bg-slate-700" style={{ minHeight: 120 }} />
    <div className="flex-1 p-4 space-y-2.5">
      <div className="h-4 rounded-md animate-pulse bg-stone-100 dark:bg-slate-800 w-4/5" />
      <div className="h-3 rounded-md animate-pulse bg-stone-100 dark:bg-slate-800 w-2/5" />
      <div className="h-3 rounded-md animate-pulse bg-stone-100 dark:bg-slate-800 w-3/5 hidden sm:block" />
      <div className="flex gap-3 pt-2">
        <div className="h-2.5 rounded animate-pulse bg-stone-100 dark:bg-slate-800 w-16" />
        <div className="h-2.5 rounded animate-pulse bg-stone-100 dark:bg-slate-800 w-20" />
      </div>
    </div>
  </div>
)

// ─────────────────────────────────────────────────────────────────────────────
// Pagination
// ─────────────────────────────────────────────────────────────────────────────
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null

  // Build page numbers with ellipsis
  const pages = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (currentPage > 3) pages.push('...')
    const start = Math.max(2, currentPage - 1)
    const end   = Math.min(totalPages - 1, currentPage + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (currentPage < totalPages - 2) pages.push('...')
    pages.push(totalPages)
  }

  const btn = (content, onClick, disabled, active = false, ariaLabel) => (
    <button
      key={`${content}-${active}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel || String(content)}
      aria-current={active ? 'page' : undefined}
      className={`
        min-w-[36px] h-9 px-2 rounded-xl text-sm font-semibold transition-all
        focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500
        ${active
          ? 'bg-amber-500 text-white shadow-md shadow-amber-200/60 dark:shadow-amber-900/40'
          : disabled
            ? 'text-stone-300 dark:text-slate-600 cursor-not-allowed'
            : 'text-stone-500 dark:text-slate-400 hover:bg-stone-100 dark:hover:bg-slate-800 hover:text-stone-800 dark:hover:text-slate-100'
        }
      `}
    >
      {content}
    </button>
  )

  return (
    <nav
      aria-label="Navigasi halaman"
      className="flex items-center justify-center gap-1 flex-wrap py-2"
    >
      {/* First */}
      {btn(
        <ChevronsLeft className="w-4 h-4" />,
        () => onPageChange(1),
        currentPage === 1,
        false,
        'Halaman pertama'
      )}
      {/* Prev */}
      {btn(
        <ChevronLeft className="w-4 h-4" />,
        () => onPageChange(currentPage - 1),
        currentPage === 1,
        false,
        'Halaman sebelumnya'
      )}

      {/* Page numbers */}
      {pages.map((p, i) =>
        p === '...'
          ? <span key={`ellipsis-${i}`} className="px-1 text-stone-400 dark:text-slate-600 select-none">…</span>
          : btn(p, () => onPageChange(p), false, p === currentPage)
      )}

      {/* Next */}
      {btn(
        <ChevronRight className="w-4 h-4" />,
        () => onPageChange(currentPage + 1),
        currentPage === totalPages,
        false,
        'Halaman berikutnya'
      )}
      {/* Last */}
      {btn(
        <ChevronsRight className="w-4 h-4" />,
        () => onPageChange(totalPages),
        currentPage === totalPages,
        false,
        'Halaman terakhir'
      )}
    </nav>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SeriesDetailPage
// ─────────────────────────────────────────────────────────────────────────────
const SeriesDetailPage = () => {
  const { seriesSlug } = useParams()
  const navigate       = useNavigate()

  const [books,       setBooks]       = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)
  const [currentPage, setCurrentPage] = useState(1)

  const listRef = useRef(null)
  const backUrl = useRef(sessionStorage.getItem('booksPageUrl') || '/buku')

  const fetchSeries = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await bookService.getBooksBySeries(seriesSlug, 1, 999)
      if (!result?.data?.length) {
        setError('Seri tidak ditemukan atau belum ada buku.')
        setBooks([])
      } else {
        const sorted = [...result.data].sort((a, b) => (a.seriesOrder || 0) - (b.seriesOrder || 0))
        setBooks(sorted)
      }
    } catch {
      setError('Gagal memuat seri. Silakan coba lagi.')
      setBooks([])
    } finally {
      setLoading(false)
    }
  }, [seriesSlug])

  useEffect(() => { fetchSeries() }, [fetchSeries])

  // Pagination
  const totalPages   = Math.ceil(books.length / BOOKS_PER_PAGE)
  const pageStart    = (currentPage - 1) * BOOKS_PER_PAGE
  const pageBooks    = books.slice(pageStart, pageStart + BOOKS_PER_PAGE)

  const handlePageChange = (page) => {
    setCurrentPage(page)
    // Scroll to top of list smoothly
    listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Derived series info
  const seriesInfo        = books[0] || null
  const seriesName        = seriesInfo?.seriesName        || 'Seri Buku'
  const seriesDescription = seriesInfo?.seriesDescription || null
  const backdropUrl       = seriesInfo?.coverImageUrl     || null

  const totalWords     = books.reduce((s, b) => s + (b.totalWord        || 0), 0)
  const totalReadTime  = books.reduce((s, b) => s + (b.estimatedReadTime || 0), 0)
  const totalViews     = books.reduce((s, b) => s + (b.viewCount         || 0), 0)
  const totalDownloads = books.reduce((s, b) => s + (b.downloadCount     || 0), 0)
  const avgRatings     = books.filter(b => b.averageRating > 0)
  const avgRating      = avgRatings.length
    ? avgRatings.reduce((s, b) => s + b.averageRating, 0) / avgRatings.length
    : 0

  useEffect(() => {
    if (seriesName) document.title = `${seriesName} | Perpustakaan Digital MasasilaM`
  }, [seriesName])

  // ── Error / empty state ───────────────────────────────────────────────────
  if (!loading && error && books.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4
                      bg-stone-50 dark:bg-slate-950">
        <Layers className="w-12 h-12 text-stone-300 dark:text-slate-600" />
        <p className="text-center text-stone-500 dark:text-slate-400 max-w-sm">{error}</p>
        <button
          onClick={() => navigate(backUrl.current)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                     bg-amber-500 hover:bg-amber-400 text-white transition-all"
        >
          <ArrowLeft className="w-4 h-4" />Kembali ke Koleksi
        </button>
      </div>
    )
  }

  return (
    <>
      <SEO
        title={`${seriesName} | Perpustakaan Digital MasasilaM`}
        description={seriesDescription || `Koleksi buku dalam seri ${seriesName}`}
        url={`/seri/${seriesSlug}`}
        type="website"
      />

      <div className="min-h-screen bg-stone-50 dark:bg-slate-950 transition-colors duration-300">

        {/* ══════════════════════════════════════════════════
            HERO
        ══════════════════════════════════════════════════ */}
        <div className="relative overflow-hidden">

          {/* Blurred backdrop */}
          {backdropUrl && (
            <div
              className="absolute inset-0 pointer-events-none"
              aria-hidden="true"
              style={{
                height: '100%',
                backgroundImage: `url(${backdropUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(80px) brightness(0.18) saturate(2)',
                transform: 'scale(1.15)',
              }}
            />
          )}

          {/* Gradient overlay */}
          <div
            className="absolute inset-0 pointer-events-none
                        bg-gradient-to-b from-violet-950/70 via-violet-950/30 to-stone-50
                        dark:from-violet-950/85 dark:via-slate-950/40 dark:to-slate-950"
            aria-hidden="true"
          />

          <div className="relative container mx-auto px-3 sm:px-4 max-w-4xl">

            {/* Breadcrumb + back */}
            <div className="pt-5 pb-3">
              <nav className="flex items-center gap-1.5 text-xs mb-3 text-white/40" aria-label="Breadcrumb">
                <Link to="/" className="hover:text-white/80 transition-colors whitespace-nowrap">Beranda</Link>
                <span aria-hidden="true">/</span>
                <Link to={backUrl.current} className="hover:text-white/80 transition-colors whitespace-nowrap">Koleksi Buku</Link>
                <span aria-hidden="true">/</span>
                <span className="text-white/60 truncate max-w-[160px]">{seriesName}</span>
              </nav>
              <button
                onClick={() => navigate(backUrl.current)}
                className="inline-flex items-center gap-1.5 text-sm font-medium group transition-colors
                           text-white/50 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                Kembali
              </button>
            </div>

            {/* Hero content */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8 pb-10 pt-2">

              {/* Cover stack */}
              {loading ? (
                <div className="flex-shrink-0 w-48 h-52 rounded-xl animate-pulse bg-white/10 dark:bg-slate-800/60" />
              ) : (
                <CoverStack books={books} />
              )}

              {/* Text */}
              <div className="flex-1 min-w-0">
                {/* Badge */}
                <div className="inline-flex items-center gap-1.5 mb-3 px-2.5 py-1 rounded-full
                                bg-violet-500/20 border border-violet-400/30">
                  <Layers className="w-3 h-3 text-violet-300" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-violet-300">
                    Seri Buku
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight mb-3
                               text-white drop-shadow-lg">
                  {loading
                    ? <div className="h-8 w-3/4 rounded-lg animate-pulse bg-white/15" />
                    : seriesName}
                </h1>

                {/* Collapsible description */}
                {seriesDescription && !loading && (
                  <CollapsibleDescription text={seriesDescription} />
                )}

                {/* Stats */}
                {!loading && books.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <StatPill icon={BookMarked} value={books.length} label="buku" />
                    {totalReadTime > 0 && (
                      <StatPill icon={Clock} value={`${totalReadTime} mnt`} label="total baca" />
                    )}
                    {totalWords > 0 && (
                      <StatPill icon={AlignLeft} value={totalWords.toLocaleString('id-ID')} label="kata" />
                    )}
                    {totalViews > 0 && (
                      <StatPill icon={Eye} value={totalViews.toLocaleString('id-ID')} label="dilihat" />
                    )}
                    {avgRating > 0 && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full
                                      bg-white/10 backdrop-blur-sm border border-white/15">
                        <StarDisplay avg={avgRating} />
                        <span className="text-sm font-bold text-white">{avgRating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                )}

                {loading && (
                  <div className="flex gap-2">
                    {[80, 100, 90].map((w, i) => (
                      <div key={i} className="h-8 rounded-full animate-pulse bg-white/10" style={{ width: w }} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            DAFTAR BUKU
        ══════════════════════════════════════════════════ */}
        <div className="container mx-auto px-3 sm:px-4 max-w-4xl pb-16">

          {/* Section header */}
          <div ref={listRef} className="flex items-center justify-between mb-4 scroll-mt-20">
            <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2
                           text-stone-500 dark:text-slate-400">
              <Layers className="w-4 h-4 text-violet-500" />
              {loading
                ? 'Memuat buku…'
                : `${books.length} Buku dalam Seri`
              }
            </h2>

            <div className="flex items-center gap-3">
              {!loading && totalDownloads > 0 && (
                <span className="flex items-center gap-1 text-xs text-stone-400 dark:text-slate-500">
                  <Download className="w-3 h-3" />
                  {totalDownloads.toLocaleString('id-ID')} diunduh
                </span>
              )}
              {/* Page info */}
              {!loading && totalPages > 1 && (
                <span className="text-xs text-stone-400 dark:text-slate-500">
                  Hal. {currentPage}/{totalPages}
                </span>
              )}
            </div>
          </div>

          {/* Book list */}
          <div className="space-y-2 sm:space-y-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <BookCardSkeleton key={i} />)
            ) : pageBooks.length > 0 ? (
              pageBooks.map((book, i) => (
                <BookCard
                  key={book.id || i}
                  book={book}
                  index={i}
                  globalIndex={pageStart + i}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 py-16
                              rounded-2xl border border-dashed
                              bg-stone-50 border-stone-200 dark:bg-slate-900/60 dark:border-slate-700">
                <BookOpen className="w-10 h-10 text-stone-300 dark:text-slate-600" />
                <p className="text-sm text-stone-400 dark:text-slate-500">
                  Belum ada buku dalam seri ini.
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="mt-6 mb-2 rounded-2xl border bg-white dark:bg-slate-900
                            border-stone-200 dark:border-slate-700/80 px-3 py-1">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}

          {/* CTA — start from book 1 */}
          {!loading && books.length > 0 && (
            <div className="mt-6 p-5 rounded-2xl border text-center
                            bg-gradient-to-br from-violet-50 to-amber-50/40 border-violet-200/60
                            dark:from-violet-900/15 dark:to-amber-900/10 dark:border-violet-800/40">
              <p className="text-sm font-semibold mb-3 text-stone-700 dark:text-slate-300">
                Mulai baca dari awal seri
              </p>
              <Link
                to={`/buku/${books[0].slug}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
                           text-sm font-bold transition-all active:scale-[0.98]
                           bg-amber-500 hover:bg-amber-400 text-white
                           shadow-lg shadow-amber-200/60 dark:shadow-amber-900/40"
              >
                <BookOpen className="w-4 h-4" />
                Mulai Buku ke-1
                <span className="opacity-70">—</span>
                <span className="font-medium opacity-80 truncate max-w-[120px]">{books[0].title}</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default SeriesDetailPage
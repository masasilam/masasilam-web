import { useState, useEffect, useRef, useCallback, useTransition } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  BookOpen, Calendar, Clock, Download, Eye, Heart, Share2, Star,
  User, FileText, Globe, Building2, X, MessageCircle, ThumbsUp,
  ArrowLeft, ChevronDown, CheckCircle2, ChevronRight,
  Bookmark, Layers, Info, ExternalLink, Feather,
  Users, Tag, AlignLeft, List, Newspaper, Printer,
  ThumbsDown, Frown, Angry, Zap, Activity,
  Award, BarChart2, Heart as HeartIcon, TrendingUp
} from 'lucide-react'
import bookService from '../services/bookService'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from '../components/Common/LoadingSpinner'
import Alert from '../components/Common/Alert'
import SEO from '../components/Common/SEO'
import BookDetailSocialSection from '../components/Social/BookDetailSocialSection'
import feedEvents, { FEED_EVENTS } from '../services/feedEvents'

// ─────────────────────────────────────────────────────────────────────────────
// CoverImage
// ─────────────────────────────────────────────────────────────────────────────
const CoverImage = ({ url, alt, className = '' }) => {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const imgRef = useRef(null)

  useEffect(() => { setLoaded(false); setError(false) }, [url])
  useEffect(() => { if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) setLoaded(true) }, [url])

  if (!url || error) {
    return (
      <div className={`flex flex-col items-center justify-center gap-3
                       bg-gradient-to-br from-amber-50 to-stone-100
                       dark:from-amber-950/50 dark:to-slate-900 ${className}`}>
        <BookOpen className="w-10 h-10 text-amber-300/60" />
        <p className="text-xs text-stone-400 px-3 text-center leading-snug line-clamp-3">{alt}</p>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!loaded && <div className="absolute inset-0 animate-pulse bg-stone-200 dark:bg-slate-700" />}
      <img
        ref={imgRef}
        src={url} alt={alt} loading="eager" fetchpriority="high"
        onLoad={() => setLoaded(true)} onError={() => setError(true)}
        className={`w-full h-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// RatingModal
// ─────────────────────────────────────────────────────────────────────────────
const RatingModal = ({ isOpen, onClose, onSubmit, bookTitle }) => {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!rating) return alert('Pilih rating bintang')
    setSubmitting(true)
    await onSubmit({ rating })
    setSubmitting(false)
    setRating(0)
  }

  if (!isOpen) return null

  const ratingLabels = {
    0.5: '⭐ 0.5 – Sangat Buruk', 1: '⭐ 1.0 – Sangat Buruk',
    1.5: '⭐ 1.5 – Buruk',        2: '⭐⭐ 2.0 – Buruk',
    2.5: '⭐⭐ 2.5 – Kurang',     3: '⭐⭐⭐ 3.0 – Cukup',
    3.5: '⭐⭐⭐ 3.5 – Lumayan',  4: '⭐⭐⭐⭐ 4.0 – Bagus',
    4.5: '⭐⭐⭐⭐ 4.5 – Sangat Bagus', 5: '⭐⭐⭐⭐⭐ 5.0 – Sempurna',
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl bg-white dark:bg-slate-900 border-t border-x sm:border border-stone-200 dark:border-slate-700">
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-stone-200 dark:bg-slate-700" />
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-stone-900 dark:text-slate-50">Beri Rating</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-all text-stone-400 hover:text-stone-700 hover:bg-stone-100 dark:text-slate-500 dark:hover:text-slate-200 dark:hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <p className="text-xs mb-0.5 text-stone-400 dark:text-slate-500">Buku</p>
            <p className="font-semibold text-stone-900 dark:text-slate-100 leading-snug line-clamp-2">{bookTitle}</p>
          </div>
          <div>
            <p className="text-sm font-medium mb-4 text-stone-700 dark:text-slate-300">Rating Bintang <span className="text-red-500">*</span></p>
            <div className="flex gap-1.5 items-center justify-center">
              {[1, 2, 3, 4, 5].map(star => {
                const active = hoverRating || rating
                const isFull = active >= star
                const isHalf = active === star - 0.5
                return (
                  <div key={star} className="relative cursor-pointer">
                    <Star className={`w-11 h-11 transition-all duration-150 ${isFull ? 'fill-amber-400 text-amber-400 scale-110' : 'fill-stone-100 text-stone-200 dark:fill-slate-800 dark:text-slate-700'}`} />
                    {isHalf && !isFull && <Star className="w-11 h-11 absolute top-0 left-0 fill-amber-400 text-amber-400" style={{ clipPath: 'polygon(0 0,50% 0,50% 100%,0 100%)' }} />}
                    <div className="absolute inset-0 flex">
                      <button type="button" className="w-1/2 h-full" onClick={() => setRating(star - 0.5)} onMouseEnter={() => setHoverRating(star - 0.5)} onMouseLeave={() => setHoverRating(0)} />
                      <button type="button" className="w-1/2 h-full" onClick={() => setRating(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} />
                    </div>
                  </div>
                )
              })}
            </div>
            {rating > 0 && <p className="text-sm text-center mt-3 font-semibold text-amber-600 dark:text-amber-400">{ratingLabels[rating]}</p>}
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} disabled={submitting} className="flex-1 py-3 rounded-xl border text-sm font-medium transition border-stone-200 text-stone-600 hover:bg-stone-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 disabled:opacity-50">Batal</button>
            <button type="submit" disabled={submitting || !rating} className="flex-1 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50 bg-amber-500 hover:bg-amber-400 active:scale-95 text-white">{submitting ? 'Mengirim...' : 'Kirim Rating'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// StarDisplay
// ─────────────────────────────────────────────────────────────────────────────
const StarDisplay = ({ avg, size = 'sm' }) => {
  const filled = Math.floor(avg)
  const hasHalf = avg - filled >= 0.25 && avg - filled < 0.75
  const hasAlmost = avg - filled >= 0.75
  const cls = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => {
        const isFull = s <= filled || (s === filled + 1 && hasAlmost)
        const isHalf = s === filled + 1 && hasHalf
        return (
          <span key={s} className="relative inline-block">
            <Star className={`${cls} text-stone-200 dark:text-slate-700`} />
            {(isFull || isHalf) && <Star className={`${cls} absolute inset-0 fill-amber-400 text-amber-400`} style={isHalf ? { clipPath: 'polygon(0 0,50% 0,50% 100%,0 100%)' } : {}} />}
          </span>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// RatingSummary
// ─────────────────────────────────────────────────────────────────────────────
const RatingSummary = ({ ratingStats, onRate, userRating }) => {
  const hasStats = ratingStats?.totalRatings > 0

  if (!hasStats) {
    return (
      <div className="flex items-center gap-4 p-4 rounded-2xl border border-dashed bg-stone-50 border-stone-200 dark:bg-slate-800/60 dark:border-slate-700">
        <div className="text-center flex-shrink-0">
          <div className="text-3xl font-bold text-stone-200 dark:text-slate-700">—</div>
          <div className="flex gap-0.5 mt-1 justify-center">
            {[1,2,3,4,5].map(s => <Star key={s} className="w-3.5 h-3.5 text-stone-200 dark:text-slate-700" />)}
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm mb-2 text-stone-500 dark:text-slate-400">Belum ada rating</p>
          <button onClick={onRate} className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300">
            <Star className="w-4 h-4" />
            {userRating ? `Rating Anda: ${userRating.rating} ⭐` : 'Jadilah yang pertama memberi rating'}
          </button>
        </div>
      </div>
    )
  }

  const avg = ratingStats.averageRating
  const total = ratingStats.totalRatings
  const ratingLabel = avg >= 4.5 ? 'Luar Biasa' : avg >= 4 ? 'Sangat Bagus' : avg >= 3.5 ? 'Bagus' : avg >= 3 ? 'Cukup' : avg >= 2 ? 'Kurang' : 'Buruk'
  const bars = [
    { label: '5', count: ratingStats.rating50Count || 0 },
    { label: '4', count: (ratingStats.rating45Count || 0) + (ratingStats.rating40Count || 0) },
    { label: '3', count: (ratingStats.rating35Count || 0) + (ratingStats.rating30Count || 0) },
    { label: '2', count: (ratingStats.rating25Count || 0) + (ratingStats.rating20Count || 0) },
    { label: '1', count: (ratingStats.rating15Count || 0) + (ratingStats.rating10Count || 0) + (ratingStats.rating05Count || 0) },
  ]

  return (
    <div className="p-4 rounded-2xl border bg-white border-stone-200 dark:bg-slate-900 dark:border-slate-700">
      <div className="flex gap-5">
        <div className="flex flex-col items-center justify-center flex-shrink-0 min-w-[80px]">
          <div className="text-5xl font-extrabold tabular-nums leading-none mb-1 text-stone-900 dark:text-slate-50">{avg.toFixed(1)}</div>
          <StarDisplay avg={avg} size="md" />
          <div className="text-xs font-semibold mt-1 text-amber-600 dark:text-amber-400">{ratingLabel}</div>
          <div className="text-[10px] mt-0.5 text-stone-400 dark:text-slate-500">{total} rating</div>
        </div>
        <div className="flex-1 space-y-1.5 flex flex-col justify-center">
          {bars.map(({ label, count }) => {
            const pct = total > 0 ? (count / total) * 100 : 0
            return (
              <div key={label} className="flex items-center gap-2">
                <div className="flex items-center gap-0.5 w-10 justify-end flex-shrink-0">
                  <span className="text-xs font-medium text-stone-500 dark:text-slate-400">{label}</span>
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                </div>
                <div className="flex-1 h-2 rounded-full overflow-hidden bg-stone-100 dark:bg-slate-700">
                  <div className="h-full bg-amber-400 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-[10px] w-6 text-right text-stone-400 dark:text-slate-500">{count}</span>
              </div>
            )
          })}
        </div>
      </div>
      <div className="mt-4 pt-3 border-t flex items-center justify-between flex-wrap gap-2 border-stone-100 dark:border-slate-700">
        {userRating && (
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-500" />
            <span className="text-sm text-stone-600 dark:text-slate-400">Rating Anda: <span className="font-semibold text-stone-900 dark:text-slate-100">{userRating.rating} ⭐</span></span>
          </div>
        )}
        <button onClick={onRate} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-300 dark:hover:bg-amber-900/40">
          <Star className={`w-3.5 h-3.5 ${userRating ? 'fill-amber-400 text-amber-400' : ''}`} />
          {userRating ? 'Ubah Rating' : 'Beri Rating'}
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SeriesBookCard
// ─────────────────────────────────────────────────────────────────────────────
const SeriesBookCard = ({ seriesBook, currentSlug }) => {
  const isCurrent = seriesBook.slug === currentSlug
  return (
    <Link to={isCurrent ? '#' : `/buku/${seriesBook.slug}`}
      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isCurrent ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700 cursor-default' : 'bg-white border-stone-100 hover:border-amber-300 hover:shadow-sm dark:bg-slate-900 dark:border-slate-700 dark:hover:border-amber-700/50 group'}`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold ${isCurrent ? 'bg-amber-400 text-white' : 'bg-stone-100 text-stone-500 dark:bg-slate-800 dark:text-slate-400'}`}>
        {seriesBook.seriesOrder || '?'}
      </div>
      {seriesBook.coverImageUrl && (
        <div className="w-9 h-12 rounded-md overflow-hidden flex-shrink-0 bg-stone-100 dark:bg-slate-800">
          <img src={seriesBook.coverImageUrl} alt={seriesBook.title} className="w-full h-full object-cover" loading="lazy" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className={`text-xs font-semibold truncate transition-colors ${isCurrent ? 'text-amber-700 dark:text-amber-400' : 'text-stone-800 dark:text-slate-200 group-hover:text-amber-700 dark:group-hover:text-amber-400'}`}>{seriesBook.title}</div>
        {seriesBook.authorNames && <div className="text-[10px] truncate text-stone-400 dark:text-slate-500 mt-0.5">{seriesBook.authorNames}</div>}
      </div>
      {isCurrent
        ? <span className="flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-400/20 text-amber-700 dark:text-amber-400">Ini</span>
        : <ChevronRight className="w-4 h-4 text-stone-300 dark:text-slate-600 flex-shrink-0 group-hover:text-amber-400 transition-colors" />
      }
    </Link>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ContributorCard
// ─────────────────────────────────────────────────────────────────────────────
const ContributorCard = ({ name, role, photoUrl, slug, isAuthor = false }) => {
  const inner = (
    <div className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all group cursor-pointer ${isAuthor ? 'bg-amber-50 border-amber-200 hover:border-amber-400 hover:shadow-sm dark:bg-amber-900/15 dark:border-amber-800/50' : 'bg-white border-stone-100 hover:border-amber-200 hover:shadow-sm dark:bg-slate-900 dark:border-slate-700 dark:hover:border-amber-700/50'}`}>
      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${isAuthor ? 'bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/40 dark:to-slate-800' : 'bg-gradient-to-br from-stone-100 to-stone-50 dark:from-slate-800 dark:to-slate-700'}`}>
        {photoUrl ? <img src={photoUrl} alt={name} className="w-9 h-9 object-cover" loading="lazy" /> : <User className={`w-4 h-4 ${isAuthor ? 'text-amber-500' : 'text-stone-400 dark:text-slate-500'}`} />}
      </div>
      <div className="min-w-0 flex-1">
        <div className={`text-xs font-semibold truncate transition-colors ${isAuthor ? 'text-amber-800 dark:text-amber-300 group-hover:text-amber-700' : 'text-stone-800 dark:text-slate-200 group-hover:text-amber-700 dark:group-hover:text-amber-400'}`}>{name}</div>
        <div className="text-[10px] truncate text-stone-400 dark:text-slate-500 mt-0.5 capitalize">{role}</div>
      </div>
      {isAuthor && <Feather className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
    </div>
  )
  return slug ? <Link to={`/penulis/${slug}`}>{inner}</Link> : inner
}

// ─────────────────────────────────────────────────────────────────────────────
// InfoRow
// ─────────────────────────────────────────────────────────────────────────────
const InfoRow = ({ label, value, icon: Icon, accent = false }) => {
  if (!value && value !== 0) return null
  return (
    <div className="flex items-start gap-2 py-2.5 border-b border-stone-100 dark:border-slate-800 last:border-0">
      {Icon && (
        <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 bg-amber-50 dark:bg-amber-900/20">
          <Icon className="w-3 h-3 text-amber-500" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-[9px] uppercase tracking-wider text-stone-400 dark:text-slate-500 mb-0.5 leading-tight">{label}</div>
        <div className={`text-xs font-semibold break-words leading-snug ${accent ? 'text-amber-600 dark:text-amber-400' : 'text-stone-800 dark:text-slate-200'}`}>{value}</div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// StatCard
// ─────────────────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color = 'text-amber-500', bg = 'bg-amber-50 dark:bg-amber-900/20' }) => {
  if (!value && value !== 0) return null
  return (
    <div className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl ${bg}`}>
      <Icon className={`w-5 h-5 ${color}`} />
      <div className="text-base font-bold text-stone-800 dark:text-slate-200 tabular-nums">
        {typeof value === 'number' ? value.toLocaleString('id-ID') : value}
      </div>
      <div className="text-[10px] text-stone-400 dark:text-slate-500 text-center leading-tight">{label}</div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SectionTitle
// ─────────────────────────────────────────────────────────────────────────────
const SectionTitle = ({ icon: Icon, title, iconColor = 'text-amber-500' }) => (
  <h2 className="text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2 text-stone-500 dark:text-slate-400">
    <Icon className={`w-4 h-4 ${iconColor}`} />{title}
  </h2>
)

// ─────────────────────────────────────────────────────────────────────────────
// BookDetailPage
// ─────────────────────────────────────────────────────────────────────────────
const BookDetailPage = () => {
  const { bookSlug } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [downloadLoading, setDownloadLoading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(null)
  const [readingLoading, setReadingLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false)
  const [userRating, setUserRating] = useState(null)
  const [ratingStats, setRatingStats] = useState(null)
  const [recentReviews, setRecentReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [showFullDesc, setShowFullDesc] = useState(false)
  const [showAllDetails, setShowAllDetails] = useState(false)
  const [activeTab, setActiveTab] = useState('info')
  const [isFavorited, setIsFavorited] = useState(false)
  const [seriesBooks, setSeriesBooks] = useState([])
  const [seriesLoading, setSeriesLoading] = useState(false)
  const [authorPhotos, setAuthorPhotos] = useState({})

  const [, startTransition] = useTransition()
  const backUrl = useRef(sessionStorage.getItem('booksPageUrl') || '/buku')

  const fetchUserRating = useCallback(async () => {
    try { const r = await bookService.getMyRating(bookSlug); setUserRating(r?.data || null) }
    catch { setUserRating(null) }
  }, [bookSlug])

  const fetchRatingStats = useCallback(async () => {
    try { const r = await bookService.getRatingStats(bookSlug); setRatingStats(r?.data || null) }
    catch { }
  }, [bookSlug])

  const fetchRecentReviews = useCallback(async () => {
    try {
      setReviewsLoading(true)
      const r = await bookService.getReviews(bookSlug, 1, 5, 'helpful')
      setRecentReviews(r?.data?.list || [])
    } catch { setRecentReviews([]) }
    finally { setReviewsLoading(false) }
  }, [bookSlug])

  const fetchSeriesBooks = useCallback(async (seriesSlug) => {
    if (!seriesSlug) return
    try {
      setSeriesLoading(true)
      const result = await bookService.getBooksBySeries(seriesSlug)
      setSeriesBooks(result?.data || [])
    } catch { setSeriesBooks([]) }
    finally { setSeriesLoading(false) }
  }, [])

  const fetchAuthorPhotos = useCallback(async (slugsStr, photoUrlsStr) => {
    const slugs = (slugsStr || '').split(',').map(s => s.trim()).filter(Boolean)
    const photos = (photoUrlsStr || '').split(',').map(s => s.trim()).filter(Boolean)
    const map = {}
    slugs.forEach((slug, i) => { if (photos[i]) map[slug] = photos[i] })
    startTransition(() => setAuthorPhotos(map))
  }, []) // eslint-disable-line

  useEffect(() => {
    let cancelled = false
    const init = async () => {
      setLoading(true); setError(null)
      try {
        const bookData = await bookService.getBookBySlug(bookSlug)
        if (!cancelled) {
          setBook(bookData)
          if (bookData?.authorSlugs) fetchAuthorPhotos(bookData.authorSlugs, bookData.authorPhotoUrls)
          if (bookData?.seriesSlug) fetchSeriesBooks(bookData.seriesSlug)
        }
      } catch {
        if (!cancelled) setError('Buku tidak ditemukan')
      } finally {
        if (!cancelled) setLoading(false)
      }
      if (!cancelled) {
        await Promise.allSettled([
          fetchRatingStats(), fetchRecentReviews(),
          ...(isAuthenticated ? [fetchUserRating()] : [])
        ])
      }
    }
    init()
    return () => { cancelled = true }
  }, [bookSlug, isAuthenticated]) // eslint-disable-line

  useEffect(() => {
    if (book) document.title = `${book.title} — ${book.authorNames} | Perpustakaan Digital MasasilaM`
  }, [book])

  const handleRead = async () => {
    try {
      setReadingLoading(true)
      navigate(`/buku/${bookSlug}/baca`)
      feedEvents.emit(FEED_EVENTS.ACTIVITY_CREATED, { activityType: 'started_reading', entityType: 'BOOK', entitySlug: bookSlug, entityTitle: book?.title, entityCover: book?.coverImageUrl })
    } catch (e) { alert(`Gagal: ${e.message}`) }
    finally { setReadingLoading(false) }
  }

  const handleDownload = async () => {
    if (!book?.fileUrl) return alert('File buku tidak tersedia')
    try {
      setDownloadLoading(true)
      const { downloadUrl, filename } = await bookService.getDownloadUrl(bookSlug)
      setDownloadProgress({ percent: 0, loaded: 0, total: null })
      const response = await fetch(downloadUrl)
      if (!response.ok) throw new Error('Gagal mengunduh file')
      const total = response.headers.get('Content-Length') ? parseInt(response.headers.get('Content-Length')) : null
      const reader = response.body.getReader()
      const chunks = []; let loaded = 0
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(value); loaded += value.length
        setDownloadProgress({ loaded, total, percent: total ? Math.round((loaded / total) * 100) : null })
      }
      const blob = new Blob(chunks, { type: 'application/epub+zip' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url; link.download = filename
      document.body.appendChild(link); link.click()
      document.body.removeChild(link); window.URL.revokeObjectURL(url)
      setDownloadProgress(null)
    } catch {
      setDownloadProgress(null); alert('❌ Gagal mengunduh buku.')
    } finally { setDownloadLoading(false) }
  }

  const handleShare = async () => {
    try {
      if (navigator.share) await navigator.share({ title: book?.title, url: window.location.href })
      else { await navigator.clipboard.writeText(window.location.href); alert('✅ Link disalin!') }
    } catch { }
  }

  const handleFavorite = () => {
    if (!isAuthenticated) return navigate('/masuk')
    setIsFavorited(v => !v)
  }

  const handleOpenRatingModal = () => {
    if (!isAuthenticated) { alert('Silakan login terlebih dahulu'); return navigate('/masuk') }
    setIsRatingModalOpen(true)
  }

  const handleDeleteRating = async () => {
    if (!confirm('Hapus rating Anda?')) return
    try {
      await bookService.deleteRating(bookSlug)
      alert('✅ Rating dihapus!'); setUserRating(null); fetchRatingStats()
    } catch { alert('❌ Gagal menghapus rating') }
  }

  const handleSubmitRating = async (ratingData) => {
    try {
      await bookService.addRating(bookSlug, { rating: ratingData.rating })
      alert('✅ Rating ditambahkan!')
      setIsRatingModalOpen(false)
      fetchUserRating(); fetchRatingStats()
      feedEvents.emit(FEED_EVENTS.ACTIVITY_CREATED, { activityType: 'reviewed', entityType: 'BOOK', entitySlug: bookSlug, entityTitle: book?.title, entityCover: book?.coverImageUrl })
    } catch (e) { alert(`❌ Gagal: ${e.response?.data?.detail || e.message}`) }
  }

  const getSourceDomain = (url) => {
    try {
      const { hostname, pathname } = new URL(url)
      const domain = hostname.replace('www.', '')
      const social = ['x.com','twitter.com','instagram.com','threads.com','facebook.com','tiktok.com','youtube.com']
      if (social.includes(domain)) {
        const username = pathname.split('/').filter(Boolean)[0]
        return username ? `${domain}/${username}` : domain
      }
      return domain
    } catch { return url }
  }

  const formatBytes = (bytes) => {
    if (!bytes) return null
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  const formatDate = (dateStr) => {
      if (!dateStr) return null
      // Kalau cuma tahun (mis. "1925"), jangan dipaksa jadi tanggal lengkap —
      // new Date("1925") akan salah diinterpretasikan sebagai 1 Januari 1925.
      if (/^\d{4}$/.test(String(dateStr).trim())) return String(dateStr).trim()
      try {
        const d = new Date(dateStr)
        if (isNaN(d.getTime())) return dateStr
        return d.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
      }
      catch { return dateStr }
    }

  const formatDateTime = (dateStr) => {
    if (!dateStr) return null
    try { return new Date(dateStr).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }
    catch { return dateStr }
  }

  if (loading) return <LoadingSpinner fullScreen />
  if (error || !book) return (
    <div className="min-h-screen flex items-center justify-center">
      <Alert type="error" message={error || 'Buku tidak ditemukan'} />
    </div>
  )

  const authorList = book.authorNames
    ? book.authorNames.split(',').map((name, i) => {
        const slug = book.authorSlugs?.split(',')[i]?.trim()
        const photoUrl = authorPhotos[slug] || null
        return { name: name.trim(), slug, photoUrl }
      })
    : []

  const contributorList = book.contributors
    ? book.contributors.split(',').map(contributor => {
        const match = contributor.trim().match(/(.+?)\s*\((.+?)\)/)
        return match ? { name: match[1].trim(), role: match[2].trim() } : { name: contributor.trim(), role: '' }
      })
    : []

  const genreList = book.genres ? book.genres.split(',').map(g => g.trim()).filter(Boolean) : []
  const avgRating = ratingStats?.averageRating || book.averageRating || 0
  const totalRatings = ratingStats?.totalRatings || book.totalRatings || 0
  const hasSeries = !!(book.seriesId && book.seriesName)
  const hasContributors = contributorList.length > 0
  const totalEngagement = (book.totalAngry || 0) + (book.totalLikes || 0) + (book.totalLoves || 0) + (book.totalDislikes || 0) + (book.totalSad || 0)
  const hasReactions = totalEngagement > 0 || book.totalComments > 0

  const tabs = [
    { id: 'info', label: 'Info', icon: Info },
    { id: 'penulis', label: 'Kontributor', icon: Users },
    { id: 'seri', label: 'Dalam Seri', icon: Layers, hidden: !hasSeries },
    { id: 'ulasan', label: 'Ulasan', icon: MessageCircle },
  ].filter(t => !t.hidden)

  return (
    <>
      <SEO
        title={`${book.title} — ${book.authorNames}`}
        description={(book.description || '').slice(0, 160)}
        url={`/buku/${bookSlug}`}
        type="book"
        image={book.coverImageUrl}
        author={book.authorNames}
        publishedTime={book.publishedAt}
      />

      {/*
        ══════════════════════════════════════════════════════════════
        ROOT WRAPPER
        overflow-x-hidden → cegah elemen manapun memicu scrollbar horizontal
        yang akan mempersempit viewport dan merusak fixed bottom bar
        ══════════════════════════════════════════════════════════════
      */}
      <div className="min-h-screen overflow-x-hidden transition-colors duration-300 bg-stone-50 dark:bg-slate-950">

        {/* ════════════════════════════════════════════════════════════
            HERO — dibungkus overflow-hidden agar scale(1.1) tidak bocor
        ════════════════════════════════════════════════════════════ */}
        <div className="relative overflow-hidden">
          {book.coverImageUrl && (
            <div
              className="absolute inset-0 h-64 sm:h-72 pointer-events-none"
              aria-hidden="true"
              style={{
                backgroundImage: `url(${book.coverImageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center top',
                filter: 'blur(60px) brightness(0.25) saturate(1.5)',
                // KUNCI: transform scale tanpa translate tidak bocor ke kanan
                // karena parent sudah overflow-hidden
                transform: 'scale(1.1)',
              }}
            />
          )}
          <div
            className="absolute inset-0 h-64 sm:h-72 pointer-events-none bg-gradient-to-b from-transparent via-stone-50/40 to-stone-50 dark:via-slate-950/40 dark:to-slate-950"
            aria-hidden="true"
          />

          <div className="relative container mx-auto px-3 sm:px-4 max-w-5xl">
            {/* Breadcrumb */}
            <div className="pt-4 pb-2">
              <nav className="flex items-center gap-1.5 text-xs mb-2 overflow-x-auto scrollbar-none text-stone-300 dark:text-slate-600">
                <Link to="/" className="transition hover:text-stone-100 whitespace-nowrap">Beranda</Link>
                <span>/</span>
                <Link to={backUrl.current} className="transition hover:text-stone-100 whitespace-nowrap">Koleksi Buku</Link>
                {hasSeries && (<><span>/</span><Link to={`/buku/seri/${book.seriesSlug}`} className="transition hover:text-stone-100 whitespace-nowrap truncate max-w-[100px]">{book.seriesName}</Link></>)}
                <span>/</span>
                <span className="truncate max-w-[140px] text-stone-200 dark:text-slate-500">{book.title}</span>
              </nav>
              <button onClick={() => navigate(backUrl.current)}
                className="inline-flex items-center gap-1.5 text-sm font-medium group transition-colors text-stone-300 hover:text-white dark:text-slate-500 dark:hover:text-slate-300">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />Kembali
              </button>
            </div>

            {/* Cover + Info */}
            <div className="flex gap-4 sm:gap-6 pt-2 pb-6">
              {/* COVER */}
              <div className="flex-shrink-0">
                <div className="relative w-[110px] sm:w-[160px] lg:w-[192px]">
                  <div className="w-full rounded-xl overflow-hidden shadow-2xl shadow-black/40 border border-white/10 dark:border-white/5" style={{ aspectRatio: '2/3' }}>
                    <CoverImage url={book.coverImageUrl} alt={`Cover ${book.title}`} className="w-full h-full" />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {book.isFeatured && <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700 text-[9px] font-bold dark:bg-amber-900/30 dark:text-amber-400"><Star className="w-2 h-2 fill-current" />Pilihan</span>}
                    {book.fileUrl && <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[9px] font-bold dark:bg-emerald-900/30 dark:text-emerald-400"><Download className="w-2 h-2" />{(book.fileFormat || 'epub').toUpperCase()}</span>}
                    {hasSeries && <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-violet-100 text-violet-700 text-[9px] font-bold dark:bg-violet-900/30 dark:text-violet-400"><Layers className="w-2 h-2" />#{book.seriesOrder}</span>}
                  </div>
                  {avgRating > 0 && (
                    <div className="hidden sm:flex mt-2 items-center gap-1 justify-center px-2 py-1.5 rounded-lg border bg-white/80 dark:bg-slate-900/80 border-stone-200 dark:border-slate-700 backdrop-blur-sm">
                      <StarDisplay avg={avgRating} />
                      <span className="text-xs font-bold text-stone-800 dark:text-slate-200">{avgRating.toFixed(1)}</span>
                      {totalRatings > 0 && <span className="text-[9px] text-stone-400 dark:text-slate-500">({totalRatings})</span>}
                    </div>
                  )}
                </div>
              </div>

              {/* INFO */}
              <div className="flex-1 min-w-0 pt-1">
                {genreList.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {genreList.slice(0, 3).map((g, i) => (
                      <Link key={i} to={`/kategori/${g.toLowerCase().replace(/\s*&\s*/g, '-').replace(/\s+/g, '-')}`}
                        className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-400/20 text-amber-200 border border-amber-400/30 hover:bg-amber-400/30 transition-colors dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50">
                        {g}
                      </Link>
                    ))}
                  </div>
                )}
                <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold leading-tight mb-1 text-white dark:text-slate-50 drop-shadow-md">
                  {book.title}
                  {book.edition && book.edition > 1 && <span className="ml-2 text-sm font-normal text-white/60">(Edisi {book.edition})</span>}
                </h1>
                {book.subtitle && <p className="text-sm text-white/70 mb-2 leading-snug italic">{book.subtitle}</p>}
                {authorList.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {authorList.map((a, i) => (
                      <Link key={i} to={a.slug ? `/penulis/${a.slug}` : '#'} className="flex items-center gap-1.5 group">
                        {a.photoUrl
                          ? <img src={a.photoUrl} alt={a.name} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover border border-amber-300/40" />
                          : <div className="w-5 h-5 rounded-full bg-amber-400/20 flex items-center justify-center"><User className="w-3 h-3 text-amber-300" /></div>
                        }
                        <span className="text-sm font-semibold text-amber-300 group-hover:text-amber-200 transition-colors">{a.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
                {hasSeries && (
                  <Link to={`/buku/seri/${book.seriesSlug}`} className="inline-flex items-center gap-1.5 mb-3 px-2.5 py-1.5 rounded-lg bg-violet-400/20 border border-violet-400/30 text-violet-200 text-xs font-medium hover:bg-violet-400/30 transition-colors">
                    <Layers className="w-3 h-3" />{book.seriesName} · Bagian {book.seriesOrder}
                  </Link>
                )}
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-white/60">
                  {book.publicationYear && <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-amber-400" />{book.publicationYear}</span>}
                  {book.language && <span className="flex items-center gap-1"><Globe className="w-3 h-3 text-amber-400" />{book.language}</span>}
                  {book.estimatedReadTime && <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-amber-400" />{book.estimatedReadTime} mnt</span>}
                  {book.firstPublished && <span className="flex items-center gap-1"><Printer className="w-3 h-3 text-amber-400" />{new Date(book.firstPublished).getFullYear()}{book.firstPublisher && ` · ${book.firstPublisher}`}</span>}
                </div>
                {avgRating > 0 && (
                  <div className="sm:hidden flex items-center gap-2 mt-2">
                    <StarDisplay avg={avgRating} />
                    <span className="text-sm font-bold text-white">{avgRating.toFixed(1)}</span>
                    {totalRatings > 0 && <span className="text-xs text-white/50">({totalRatings})</span>}
                  </div>
                )}
                {/* Desktop action buttons */}
                <div className="hidden sm:flex flex-wrap gap-2 mt-4">
                  <button onClick={handleRead} disabled={readingLoading}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-[0.98] disabled:opacity-60 bg-amber-500 hover:bg-amber-400 text-white shadow-lg shadow-amber-900/40">
                    <BookOpen className="w-4 h-4" />{readingLoading ? 'Memuat...' : 'Baca Sekarang'}
                  </button>
                  {book.fileUrl && (
                    <button onClick={handleDownload} disabled={downloadLoading}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-60 bg-white/15 hover:bg-white/25 text-white backdrop-blur-sm border border-white/20">
                      <Download className="w-4 h-4" />
                      {downloadLoading ? (downloadProgress?.percent != null ? `${downloadProgress.percent}%` : 'Mengunduh...') : `Unduh ${(book.fileFormat || 'EPUB').toUpperCase()}`}
                    </button>
                  )}
                  <button onClick={handleFavorite} className={`p-2.5 rounded-xl border transition-all active:scale-95 ${isFavorited ? 'bg-red-500/80 border-red-400/50 text-white' : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20 hover:text-white'}`}>
                    <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                  </button>
                  <button onClick={handleOpenRatingModal} className={`p-2.5 rounded-xl border transition-all active:scale-95 ${userRating ? 'bg-amber-500/80 border-amber-400/50 text-white' : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20 hover:text-white'}`}>
                    <Star className={`w-5 h-5 ${userRating ? 'fill-current' : ''}`} />
                  </button>
                  <button onClick={handleShare} className="p-2.5 rounded-xl border bg-white/10 border-white/20 text-white/70 hover:bg-white/20 hover:text-white transition-all active:scale-95">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* ── END HERO ── */}

        {/* ════════════════════════════════════════════════════════════
            MAIN CONTENT
            pb-[88px] → ruang untuk fixed bottom bar di mobile
        ════════════════════════════════════════════════════════════ */}
        <div className="container mx-auto px-3 sm:px-4 max-w-5xl pb-[88px] lg:pb-10">

          {/* Download progress bar */}
          {downloadLoading && downloadProgress && (
            <div className="w-full h-1.5 rounded-full overflow-hidden bg-stone-200 dark:bg-slate-700 mb-4">
              {downloadProgress.percent != null
                ? <div className="h-full bg-amber-500 rounded-full transition-all duration-300" style={{ width: `${downloadProgress.percent}%` }} />
                : <div className="h-full bg-amber-500 animate-pulse w-full rounded-full" />
              }
            </div>
          )}

          {/* User rating pill */}
          {userRating && (
            <div className="flex items-center justify-between p-3 rounded-xl border mb-4 bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-800">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-medium text-amber-700 dark:text-amber-300">Rating Anda: {userRating.rating} ⭐</span>
              </div>
              <button onClick={handleDeleteRating} className="text-xs font-medium px-2 py-1 rounded-lg transition text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">Hapus</button>
            </div>
          )}

          {/* Engagement stats */}
          {(book.viewCount > 0 || book.readCount > 0 || book.downloadCount > 0 || hasReactions) && (
            <div className="mb-5">
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {book.viewCount > 0 && <StatCard icon={Eye} label="Dilihat" value={book.viewCount} color="text-blue-500" bg="bg-blue-50 dark:bg-blue-900/20" />}
                {book.readCount > 0 && <StatCard icon={BookOpen} label="Pembaca" value={book.readCount} color="text-amber-500" bg="bg-amber-50 dark:bg-amber-900/20" />}
                {book.downloadCount > 0 && <StatCard icon={Download} label="Diunduh" value={book.downloadCount} color="text-emerald-500" bg="bg-emerald-50 dark:bg-emerald-900/20" />}
                {book.totalComments > 0 && <StatCard icon={MessageCircle} label="Komentar" value={book.totalComments} color="text-violet-500" bg="bg-violet-50 dark:bg-violet-900/20" />}
                {book.totalLikes > 0 && <StatCard icon={ThumbsUp} label="Suka" value={book.totalLikes} color="text-green-500" bg="bg-green-50 dark:bg-green-900/20" />}
                {book.totalLoves > 0 && <StatCard icon={HeartIcon} label="Cinta" value={book.totalLoves} color="text-rose-500" bg="bg-rose-50 dark:bg-rose-900/20" />}
                {book.totalAngry > 0 && <StatCard icon={Angry} label="Marah" value={book.totalAngry} color="text-red-500" bg="bg-red-50 dark:bg-red-900/20" />}
              </div>
            </div>
          )}

          {/* Rating summary */}
          <div className="mb-5">
            <RatingSummary ratingStats={ratingStats} onRate={handleOpenRatingModal} userRating={userRating} />
          </div>

          {/* Series banner */}
          {hasSeries && (
            <div className="mb-5 p-4 rounded-2xl border overflow-hidden bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200 dark:from-violet-900/20 dark:to-slate-900 dark:border-violet-800/50">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center flex-shrink-0">
                  <Layers className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] uppercase tracking-wide font-semibold mb-0.5 text-violet-500 dark:text-violet-400">Bagian dari Seri</div>
                  <Link to={`/buku/seri/${book.seriesSlug}`} className="text-sm font-bold text-violet-800 dark:text-violet-300 hover:text-violet-600 dark:hover:text-violet-200 transition-colors">{book.seriesName}</Link>
                  {book.seriesDescription && <p className="text-xs mt-1 text-violet-600/70 dark:text-violet-400/60 leading-relaxed line-clamp-2">{book.seriesDescription}</p>}
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs font-semibold text-violet-700 dark:text-violet-300">Buku ke-{book.seriesOrder} dalam seri ini</span>
                    <Link to={`/buku/seri/${book.seriesSlug}`} className="text-xs text-violet-500 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-200 underline underline-offset-2">Lihat semua →</Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TABS */}
          <div className="flex gap-1 p-1 rounded-xl mb-5 overflow-x-auto scrollbar-none bg-stone-100 dark:bg-slate-800/60">
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${activeTab === tab.id ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm' : 'text-stone-500 dark:text-slate-400 hover:text-stone-700 dark:hover:text-slate-200'}`}>
                  <Icon className="w-3.5 h-3.5" />{tab.label}
                </button>
              )
            })}
          </div>

          {/* ── TAB: INFO ── */}
          {activeTab === 'info' && (
            <div className="space-y-5">

              {/* Sinopsis */}
              <div className="rounded-2xl border bg-white border-stone-200 dark:bg-slate-900 dark:border-slate-700 overflow-hidden">
                <div className="px-4 sm:px-5 pt-4 pb-1"><SectionTitle icon={BookOpen} title={<>Sinopsis <span className="text-sm text-stone-400 dark:text-slate-500">(Dibikin Otomatis)</span></>} /></div>
                <div className="px-4 sm:px-5 pb-4">
                  {book.description ? (
                    <>
                      <p className={`whitespace-pre-line leading-relaxed text-sm sm:text-base text-justify text-stone-700 dark:text-slate-300 ${!showFullDesc && book.description.length > 500 ? 'line-clamp-5' : ''}`}>
                        {book.description}
                      </p>
                      {book.description.length > 500 && (
                        <button onClick={() => setShowFullDesc(v => !v)} className="mt-2 text-sm font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 flex items-center gap-1">
                          {showFullDesc ? 'Sembunyikan' : 'Baca selengkapnya'}
                          <ChevronDown className={`w-4 h-4 transition-transform ${showFullDesc ? 'rotate-180' : ''}`} />
                        </button>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-stone-400 dark:text-slate-500 italic">Tidak ada sinopsis tersedia.</p>
                  )}
                </div>
              </div>

              {/* Riwayat Penerbitan */}
              {(book.firstPublished || book.firstPublisher || book.publisher) && (
                <div className="rounded-2xl border bg-white border-stone-200 dark:bg-slate-900 dark:border-slate-700 overflow-hidden">
                  <div className="px-4 sm:px-5 pt-4 pb-0"><SectionTitle icon={Printer} title="Riwayat Penerbitan" iconColor="text-stone-500" /></div>
                  {(book.firstPublished || book.firstPublisher) && (
                    <div className="px-4 sm:px-5 pb-4">
                      <div className="text-[10px] uppercase tracking-wider font-semibold mb-3 text-stone-400 dark:text-slate-500">Penerbitan Asli</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {book.firstPublished && (
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center flex-shrink-0"><Calendar className="w-4 h-4 text-amber-500" /></div>
                            <div>
                              <div className="text-[10px] uppercase tracking-wide text-stone-400 dark:text-slate-500 mb-0.5">Tanggal Terbit</div>
                              <div className="text-sm font-semibold text-stone-800 dark:text-slate-200">{formatDate(book.firstPublished)}</div>
                            </div>
                          </div>
                        )}
                        {book.firstPublisher && (
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center flex-shrink-0"><Newspaper className="w-4 h-4 text-amber-500" /></div>
                            <div>
                              <div className="text-[10px] uppercase tracking-wide text-stone-400 dark:text-slate-500 mb-0.5">Media / Penerbit</div>
                              <div className="text-sm font-semibold text-stone-800 dark:text-slate-200">{book.firstPublisher}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {book.publisher && (
                    <>
                      {(book.firstPublished || book.firstPublisher) && <div className="border-t border-stone-100 dark:border-slate-800 mx-4" />}
                      <div className="px-4 sm:px-5 py-4">
                        <div className="text-[10px] uppercase tracking-wider font-semibold mb-3 text-stone-400 dark:text-slate-500">Edisi Digital</div>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0"><Building2 className="w-4 h-4 text-stone-400 dark:text-slate-500" /></div>
                          <div>
                            <div className="text-sm font-semibold text-stone-800 dark:text-slate-200">{book.publisher}</div>
                            {book.publicationYear && <div className="text-xs text-stone-400 dark:text-slate-500 mt-0.5">{book.publicationYear}{book.edition && book.edition > 1 && ` · Edisi ke-${book.edition}`}</div>}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ═══════════════════════════════════════════════════
                  DETAIL BUKU
                  FIX C: grid-cols-2 aktif di SEMUA ukuran layar
                  InfoRow juga diperkecil agar muat di 2 kolom sempit
              ═══════════════════════════════════════════════════ */}
              <div className="rounded-2xl border bg-white border-stone-200 dark:bg-slate-900 dark:border-slate-700 overflow-hidden">
                <div className="px-4 sm:px-5 pt-4 pb-2"><SectionTitle icon={FileText} title="Detail Buku" /></div>

                <div className="px-3 sm:px-5 pb-3">
                  <div className="grid grid-cols-2 gap-x-2 sm:gap-x-6">
                    <div>
                      <InfoRow icon={FileText} label="Format" value={book.fileFormat?.toUpperCase()} />
                      <InfoRow icon={Activity} label="Ukuran" value={formatBytes(book.fileSize)} />
                      <InfoRow icon={List} label="Bab" value={book.totalPages ? `${Math.max(0, book.totalPages - 3)} bab` : null} />
                      <InfoRow icon={AlignLeft} label="Kata" value={book.totalWord ? `${book.totalWord.toLocaleString('id-ID')}` : null} />
                    </div>
                    <div>
                      <InfoRow icon={Clock} label="Est. Baca" value={book.estimatedReadTime ? `${book.estimatedReadTime} mnt` : null} />
                      <InfoRow icon={Globe} label="Bahasa" value={book.language} />
                      <InfoRow icon={Building2} label="Diterbitkan Ulang Oleh" value={book.publisher} />
                      <InfoRow icon={Calendar} label="Terbit" value={book.publicationYear ? String(book.publicationYear) : null} />
                    </div>
                  </div>
                </div>

                {showAllDetails && (
                  <div className="border-t border-stone-100 dark:border-slate-800">
                    <div className="px-3 sm:px-5 pt-3 pb-3">
                      <div className="grid grid-cols-2 gap-x-2 sm:gap-x-6">
                        <div>
                          <InfoRow icon={Calendar} label="Terbit Pertama" value={formatDate(book.firstPublished)} />
                          <InfoRow icon={Newspaper} label="Penerbit Asli" value={book.firstPublisher} />
                          <InfoRow icon={Bookmark} label="Edisi Digital" value={book.edition ? `ke-${book.edition}` : null} />
                          <InfoRow icon={Award} label="Kesulitan" value={book.difficultyLevel} />
                        </div>
                        <div>
                          <InfoRow icon={Calendar} label="Rilis Digital" value={formatDate(book.publishedAt)} />
                          <InfoRow icon={TrendingUp} label="Status" value={book.isActive ? 'Aktif' : 'Nonaktif'} />
                          <InfoRow icon={Calendar} label="Ditambahkan" value={formatDateTime(book.createdAt)} />
                          <InfoRow icon={Calendar} label="Diperbarui" value={formatDateTime(book.updatedAt)} />
                        </div>
                      </div>
                    </div>
                    {book.copyrightStatus && (
                      <div className="px-4 sm:px-5 py-3 border-t border-stone-100 dark:border-slate-800 bg-amber-50/50 dark:bg-amber-900/10">
                        <div className="text-[10px] uppercase tracking-wider text-stone-400 dark:text-slate-500 mb-1">Status Hak Cipta</div>
                        <div className="text-sm font-bold text-amber-600 dark:text-amber-400">{book.copyrightStatus}</div>
                      </div>
                    )}
                    {book.source && (
                      <div className="px-4 sm:px-5 py-3 border-t border-stone-100 dark:border-slate-800">
                        <div className="text-[10px] uppercase tracking-wider text-stone-400 dark:text-slate-500 mb-1">Sumber Data</div>
                        <a href={book.source} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition-colors break-all">
                          <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />{getSourceDomain(book.source)}
                        </a>
                      </div>
                    )}
                  </div>
                )}

                <button onClick={() => setShowAllDetails(v => !v)}
                  className="w-full flex items-center justify-center gap-1.5 py-3 text-xs font-semibold border-t border-stone-100 dark:border-slate-800 transition-colors text-stone-400 dark:text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-stone-50 dark:hover:bg-slate-800/60">
                  {showAllDetails ? 'Sembunyikan' : 'Tampilkan semua detail'}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showAllDetails ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Statistik interaksi */}
              {(hasReactions || book.totalRatings > 0) && (
                <div className="rounded-2xl border bg-white border-stone-200 dark:bg-slate-900 dark:border-slate-700 p-4 sm:p-5">
                  <SectionTitle icon={BarChart2} title="Statistik Interaksi" iconColor="text-violet-500" />
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {book.totalRatings > 0 && <StatCard icon={Star} label="Total Rating" value={book.totalRatings} color="text-amber-500" bg="bg-amber-50 dark:bg-amber-900/20" />}
                    {book.viewCount > 0 && <StatCard icon={Eye} label="Dilihat" value={book.viewCount} color="text-blue-500" bg="bg-blue-50 dark:bg-blue-900/20" />}
                    {book.readCount > 0 && <StatCard icon={BookOpen} label="Pembaca" value={book.readCount} color="text-emerald-600" bg="bg-emerald-50 dark:bg-emerald-900/20" />}
                    {book.downloadCount > 0 && <StatCard icon={Download} label="Diunduh" value={book.downloadCount} color="text-teal-500" bg="bg-teal-50 dark:bg-teal-900/20" />}
                    {book.totalComments > 0 && <StatCard icon={MessageCircle} label="Komentar" value={book.totalComments} color="text-violet-500" bg="bg-violet-50 dark:bg-violet-900/20" />}
                    {book.totalLikes > 0 && <StatCard icon={ThumbsUp} label="Suka" value={book.totalLikes} color="text-green-500" bg="bg-green-50 dark:bg-green-900/20" />}
                    {book.totalLoves > 0 && <StatCard icon={HeartIcon} label="Cinta" value={book.totalLoves} color="text-rose-500" bg="bg-rose-50 dark:bg-rose-900/20" />}
                    {book.totalSad > 0 && <StatCard icon={Frown} label="Sedih" value={book.totalSad} color="text-sky-500" bg="bg-sky-50 dark:bg-sky-900/20" />}
                    {book.totalAngry > 0 && <StatCard icon={Angry} label="Marah" value={book.totalAngry} color="text-red-500" bg="bg-red-50 dark:bg-red-900/20" />}
                    {book.totalDislikes > 0 && <StatCard icon={ThumbsDown} label="Tidak Suka" value={book.totalDislikes} color="text-orange-500" bg="bg-orange-50 dark:bg-orange-900/20" />}
                    {(book.totalReactions > 0 || totalEngagement > 0) && <StatCard icon={Zap} label="Total Reaksi" value={book.totalReactions || totalEngagement} color="text-pink-500" bg="bg-pink-50 dark:bg-pink-900/20" />}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── TAB: PENULIS ── */}
          {activeTab === 'penulis' && (
            <div className="space-y-5">
              {authorList.length > 0 && (
                <div className="rounded-2xl border bg-white border-stone-200 dark:bg-slate-900 dark:border-slate-700 p-4 sm:p-5">
                  <SectionTitle icon={Feather} title="Penulis" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {authorList.map((a, i) => <ContributorCard key={i} name={a.name} role="Penulis" photoUrl={a.photoUrl} slug={a.slug} isAuthor={true} />)}
                  </div>
                  <div className="mt-4 pt-3 border-t border-stone-100 dark:border-slate-800 flex flex-wrap gap-2">
                    {authorList.map((a, i) => (
                      <Link key={i} to={`/penulis/${a.slug}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 hover:border-amber-400 transition-all dark:bg-slate-800 dark:border-amber-800/50 dark:text-amber-400">
                        <User className="w-3 h-3" />{a.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {hasContributors && (
                <div className="rounded-2xl border bg-white border-stone-200 dark:bg-slate-900 dark:border-slate-700 p-4 sm:p-5">
                  <SectionTitle icon={Users} title="Kontributor" iconColor="text-purple-500" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                    {contributorList.map((c, i) => <ContributorCard key={i} name={c.name} role={c.role} />)}
                  </div>
                  <div className="p-3 rounded-xl border border-dashed bg-purple-50 border-purple-200 dark:bg-purple-900/10 dark:border-purple-800/40">
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                      {contributorList.map((c, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0" />
                          <span className="text-xs text-stone-600 dark:text-slate-400">
                            <span className="font-semibold text-stone-800 dark:text-slate-200">{c.name}</span>
                            {c.role && <span className="text-stone-400"> — {c.role}</span>}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── TAB: SERI ── */}
          {activeTab === 'seri' && hasSeries && (
            <div className="space-y-4">
              <div className="p-4 sm:p-5 rounded-2xl border bg-white border-violet-200 dark:bg-slate-900 dark:border-violet-800/50">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center flex-shrink-0">
                    <Layers className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-stone-900 dark:text-slate-50">{book.seriesName}</h3>
                    {book.seriesDescription && <p className="text-sm mt-1 text-stone-600 dark:text-slate-400 leading-relaxed">{book.seriesDescription}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-700 dark:text-violet-300">
                    <Bookmark className="w-3.5 h-3.5" />Anda sedang membaca buku ke-{book.seriesOrder}
                  </span>
                  <Link to={`/buku/seri/${book.seriesSlug}`} className="inline-flex items-center gap-1 text-xs font-medium text-violet-600 hover:text-violet-800 dark:text-violet-400 dark:hover:text-violet-200 transition-colors">
                    Halaman seri <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
              <div>
                <SectionTitle icon={Layers} title="Buku dalam seri ini" iconColor="text-violet-500" />
                {seriesLoading ? (
                  <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 rounded-xl animate-pulse bg-stone-100 dark:bg-slate-800" />)}</div>
                ) : seriesBooks.length > 0 ? (
                  <div className="space-y-2">
                    {[...seriesBooks].sort((a,b) => (a.seriesOrder||0)-(b.seriesOrder||0)).map((sb,i) => (
                      <SeriesBookCard key={sb.id || i} seriesBook={sb} currentSlug={bookSlug} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <SeriesBookCard seriesBook={{ slug: bookSlug, title: book.title, authorNames: book.authorNames, coverImageUrl: book.coverImageUrl, seriesOrder: book.seriesOrder }} currentSlug={bookSlug} />
                    <div className="p-4 rounded-xl border border-dashed text-sm text-center bg-stone-50 border-stone-200 dark:bg-slate-800/60 dark:border-slate-700 text-stone-400 dark:text-slate-500">Buku lain dalam seri ini belum tersedia.</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── TAB: ULASAN ── */}
          {activeTab === 'ulasan' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-stone-900 dark:text-slate-50">Ulasan Pembaca</h2>
                <div className="flex gap-2">
                  <button onClick={() => navigate(isAuthenticated ? `/buku/${bookSlug}/ulasan` : '/masuk')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold transition-all bg-amber-500 hover:bg-amber-400 text-white">
                    <MessageCircle className="w-3.5 h-3.5" />Tulis Ulasan
                  </button>
                  {recentReviews.length > 0 && (
                    <button onClick={() => navigate(`/buku/${bookSlug}/ulasan`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all border border-stone-200 text-stone-600 hover:border-amber-300 hover:text-amber-700 dark:border-slate-700 dark:text-slate-400">
                      Lihat Semua
                    </button>
                  )}
                </div>
              </div>
              {reviewsLoading ? (
                <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 rounded-xl animate-pulse bg-stone-100 dark:bg-slate-800" />)}</div>
              ) : recentReviews.length === 0 ? (
                <div className="rounded-2xl p-10 text-center border border-dashed bg-stone-50 border-stone-200 dark:bg-slate-800/60 dark:border-slate-700">
                  <MessageCircle className="w-10 h-10 mx-auto mb-3 text-stone-300 dark:text-slate-600" />
                  <p className="mb-4 text-sm text-stone-500 dark:text-slate-400">Belum ada ulasan</p>
                  <button onClick={() => navigate(isAuthenticated ? `/buku/${bookSlug}/ulasan` : '/masuk')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-400 text-white transition-all">
                    <MessageCircle className="w-4 h-4" />{isAuthenticated ? 'Jadilah yang Pertama' : 'Login untuk Ulasan'}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentReviews.map(review => (
                    <article key={review.id} className="rounded-xl p-4 sm:p-5 border transition-all hover:shadow-md bg-white border-stone-100 dark:bg-slate-900 dark:border-slate-700">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden bg-amber-50 dark:bg-amber-900/20">
                          {review.userPhotoUrl
                            ? <img src={review.userPhotoUrl} alt={review.userName} className="w-9 h-9 object-cover" loading="lazy" />
                            : <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{review.userName?.charAt(0)?.toUpperCase() || '?'}</span>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-stone-900 dark:text-slate-100 truncate">{review.userName}</span>
                            {review.isOwner && <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">Anda</span>}
                            <time className="text-xs ml-auto flex-shrink-0 text-stone-400 dark:text-slate-500" dateTime={review.createdAt}>
                              {new Date(review.createdAt).toLocaleDateString('id-ID', { year:'numeric', month:'short', day:'numeric' })}
                            </time>
                          </div>
                        </div>
                      </div>
                      {review.title && <h3 className="font-bold mb-1.5 text-sm text-stone-900 dark:text-slate-100">{review.title}</h3>}
                      <p className="mb-3 line-clamp-3 text-sm leading-relaxed text-stone-600 dark:text-slate-300">{review.content}</p>
                      <div className="flex items-center gap-4 text-xs text-stone-400 dark:text-slate-500">
                        <div className="flex items-center gap-1"><ThumbsUp className="w-3.5 h-3.5" /><span>{review.helpfulCount || 0} membantu</span></div>
                        {review.replyCount > 0 && <div className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /><span>{review.replyCount} balasan</span></div>}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="mt-8 mb-8"><BookDetailSocialSection book={book} /></div>
        </div>

        {/* ════════════════════════════════════════════════════════════
            FIXED BOTTOM BAR — mobile & tablet (< lg)
            FIX A: overflow-x-hidden di root + inset-x-0 di sini
            memastikan bar selalu penuh lebar viewport tanpa terpotong
        ════════════════════════════════════════════════════════════ */}
        <div
          className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-stone-200 dark:border-slate-800"
          style={{ paddingLeft: '12px', paddingRight: '12px', paddingTop: '8px', paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
        >
          <div className="flex gap-2">
            {/* Baca — flex-1 mengisi sisa */}
            <button
              onClick={handleRead}
              disabled={readingLoading}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-400 text-white shadow-md shadow-amber-200/80 dark:shadow-amber-900/40 transition-all active:scale-[0.98] disabled:opacity-60 min-w-0"
            >
              <BookOpen className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{readingLoading ? 'Memuat...' : 'Baca Sekarang'}</span>
            </button>

            {/* Unduh */}
            {book.fileUrl && (
              <button
                onClick={handleDownload}
                disabled={downloadLoading}
                className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl border transition-all disabled:opacity-60 bg-white border-stone-200 text-stone-600 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400 active:scale-95"
              >
                <Download className="w-5 h-5" />
              </button>
            )}

            {/* Favorit */}
            <button
              onClick={handleFavorite}
              className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl border transition-all active:scale-95 ${isFavorited ? 'bg-red-50 border-red-300 text-red-500 dark:bg-red-900/20 dark:border-red-700 dark:text-red-400' : 'bg-white border-stone-200 text-stone-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400'}`}
            >
              <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
            </button>

            {/* Bagikan */}
            <button
              onClick={handleShare}
              className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl border border-stone-200 dark:border-slate-700 text-stone-500 dark:text-slate-400 bg-white dark:bg-slate-900 transition-all active:scale-95"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <RatingModal isOpen={isRatingModalOpen} onClose={() => setIsRatingModalOpen(false)} onSubmit={handleSubmitRating} bookTitle={book.title} />
      </div>
    </>
  )
}

export default BookDetailPage
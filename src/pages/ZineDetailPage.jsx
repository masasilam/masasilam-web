import { useState, useEffect, useRef, useCallback, useTransition } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  BookOpen, Calendar, Clock, Download, Eye, Heart, Share2, Star,
  User, FileText, Globe, Building2, X, MessageCircle, ThumbsUp,
  ArrowLeft, ChevronDown, ChevronRight, Layers, Hash,
  ExternalLink, Database, Info, Tag, AlignLeft, List,
  Activity, Award, BarChart2, TrendingUp, Printer, Newspaper,
  Users, Bookmark,
} from 'lucide-react'
import zineService from '../services/zineService'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from '../components/Common/LoadingSpinner'
import Alert from '../components/Common/Alert'
import SEO from '../components/Common/SEO'
import ZineDetailSocialSection from '../components/Social/ZineDetailSocialSection'
import feedEvents, { FEED_EVENTS } from '../services/feedEvents'

// ─────────────────────────────────────────────────────────────────────────────
// CoverImage
// ─────────────────────────────────────────────────────────────────────────────
const CoverImage = ({ url, alt, className = '' }) => {
  const [loaded, setLoaded] = useState(false)
  const [error,  setError]  = useState(false)
  const imgRef = useRef(null)

  useEffect(() => { setLoaded(false); setError(false) }, [url])
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) setLoaded(true)
  }, [url])

  if (!url || error) {
    return (
      <div className={`flex flex-col items-center justify-center gap-3
                       bg-gradient-to-br from-emerald-50 to-stone-100
                       dark:from-emerald-950/50 dark:to-slate-900 ${className}`}>
        <BookOpen className="w-10 h-10 text-emerald-300/60" />
        <p className="text-xs text-stone-400 px-3 text-center leading-snug line-clamp-3">{alt}</p>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!loaded && <div className="absolute inset-0 animate-pulse bg-stone-200 dark:bg-slate-700" />}
      <img
        ref={imgRef}
        src={url} alt={alt} loading="eager"
        onLoad={() => setLoaded(true)} onError={() => setError(true)}
        className={`w-full h-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// StarDisplay
// ─────────────────────────────────────────────────────────────────────────────
const StarDisplay = ({ avg, size = 'sm' }) => {
  const filled   = Math.floor(avg)
  const hasHalf  = avg - filled >= 0.25 && avg - filled < 0.75
  const hasAlmost = avg - filled >= 0.75
  const cls = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(s => {
        const isFull = s <= filled || (s === filled + 1 && hasAlmost)
        const isHalf = s === filled + 1 && hasHalf
        return (
          <span key={s} className="relative inline-block">
            <Star className={`${cls} text-stone-200 dark:text-slate-700`} />
            {(isFull || isHalf) && (
              <Star className={`${cls} absolute inset-0 fill-emerald-400 text-emerald-400`}
                style={isHalf ? { clipPath:'polygon(0 0,50% 0,50% 100%,0 100%)' } : {}} />
            )}
          </span>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// RatingModal
// ─────────────────────────────────────────────────────────────────────────────
const RatingModal = ({ isOpen, onClose, onSubmit, zineTitle }) => {
  const [rating,      setRating]      = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [submitting,  setSubmitting]  = useState(false)

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
            <p className="text-xs mb-0.5 text-stone-400 dark:text-slate-500">Zine</p>
            <p className="font-semibold text-stone-900 dark:text-slate-100 leading-snug line-clamp-2">{zineTitle}</p>
          </div>
          <div>
            <p className="text-sm font-medium mb-4 text-stone-700 dark:text-slate-300">Rating Bintang <span className="text-red-500">*</span></p>
            <div className="flex gap-1.5 items-center justify-center">
              {[1,2,3,4,5].map(star => {
                const active = hoverRating || rating
                const isFull = active >= star
                const isHalf = active === star - 0.5
                return (
                  <div key={star} className="relative cursor-pointer">
                    <Star className={`w-11 h-11 transition-all duration-150 ${isFull ? 'fill-emerald-400 text-emerald-400 scale-110' : 'fill-stone-100 text-stone-200 dark:fill-slate-800 dark:text-slate-700'}`} />
                    {isHalf && !isFull && (
                      <Star className="w-11 h-11 absolute top-0 left-0 fill-emerald-400 text-emerald-400"
                        style={{ clipPath:'polygon(0 0,50% 0,50% 100%,0 100%)' }} />
                    )}
                    <div className="absolute inset-0 flex">
                      <button type="button" className="w-1/2 h-full"
                        onClick={() => setRating(star - 0.5)}
                        onMouseEnter={() => setHoverRating(star - 0.5)}
                        onMouseLeave={() => setHoverRating(0)} />
                      <button type="button" className="w-1/2 h-full"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)} />
                    </div>
                  </div>
                )
              })}
            </div>
            {rating > 0 && (
              <p className="text-sm text-center mt-3 font-semibold text-emerald-600 dark:text-emerald-400">
                {ratingLabels[rating]}
              </p>
            )}
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} disabled={submitting}
              className="flex-1 py-3 rounded-xl border text-sm font-medium transition border-stone-200 text-stone-600 hover:bg-stone-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 disabled:opacity-50">
              Batal
            </button>
            <button type="submit" disabled={submitting || !rating}
              className="flex-1 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white">
              {submitting ? 'Mengirim...' : 'Kirim Rating'}
            </button>
          </div>
        </form>
      </div>
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
      <div className="flex items-center gap-4 p-4 rounded-2xl border border-dashed
                      bg-stone-50 border-stone-200 dark:bg-slate-800/60 dark:border-slate-700">
        <div className="text-center flex-shrink-0">
          <div className="text-3xl font-bold text-stone-200 dark:text-slate-700">—</div>
          <div className="flex gap-0.5 mt-1 justify-center">
            {[1,2,3,4,5].map(s => <Star key={s} className="w-3.5 h-3.5 text-stone-200 dark:text-slate-700" />)}
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm mb-2 text-stone-500 dark:text-slate-400">Belum ada rating</p>
          <button onClick={onRate}
            className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300">
            <Star className="w-4 h-4" />
            {userRating ? `Rating Anda: ${userRating.rating} ⭐` : 'Jadilah yang pertama memberi rating'}
          </button>
        </div>
      </div>
    )
  }

  const avg   = ratingStats.averageRating
  const total = ratingStats.totalRatings
  const ratingLabel = avg >= 4.5 ? 'Luar Biasa' : avg >= 4 ? 'Sangat Bagus'
    : avg >= 3.5 ? 'Bagus' : avg >= 3 ? 'Cukup' : avg >= 2 ? 'Kurang' : 'Buruk'

  const bars = [
    { label:'5', count: ratingStats.rating50Count || 0 },
    { label:'4', count:(ratingStats.rating45Count || 0)+(ratingStats.rating40Count || 0) },
    { label:'3', count:(ratingStats.rating35Count || 0)+(ratingStats.rating30Count || 0) },
    { label:'2', count:(ratingStats.rating25Count || 0)+(ratingStats.rating20Count || 0) },
    { label:'1', count:(ratingStats.rating15Count || 0)+(ratingStats.rating10Count || 0)+(ratingStats.rating05Count || 0) },
  ]

  return (
    <div className="p-4 rounded-2xl border bg-white border-stone-200 dark:bg-slate-900 dark:border-slate-700">
      <div className="flex gap-5">
        <div className="flex flex-col items-center justify-center flex-shrink-0 min-w-[80px]">
          <div className="text-5xl font-extrabold tabular-nums leading-none mb-1 text-stone-900 dark:text-slate-50">
            {avg.toFixed(1)}
          </div>
          <StarDisplay avg={avg} size="md" />
          <div className="text-xs font-semibold mt-1 text-emerald-600 dark:text-emerald-400">{ratingLabel}</div>
          <div className="text-[10px] mt-0.5 text-stone-400 dark:text-slate-500">{total} rating</div>
        </div>
        <div className="flex-1 space-y-1.5 flex flex-col justify-center">
          {bars.map(({ label, count }) => {
            const pct = total > 0 ? (count / total) * 100 : 0
            return (
              <div key={label} className="flex items-center gap-2">
                <div className="flex items-center gap-0.5 w-10 justify-end flex-shrink-0">
                  <span className="text-xs font-medium text-stone-500 dark:text-slate-400">{label}</span>
                  <Star className="w-3 h-3 fill-emerald-400 text-emerald-400" />
                </div>
                <div className="flex-1 h-2 rounded-full overflow-hidden bg-stone-100 dark:bg-slate-700">
                  <div className="h-full bg-emerald-400 rounded-full transition-all duration-700"
                    style={{ width:`${pct}%` }} />
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
            <Star className="w-4 h-4 fill-emerald-400 text-emerald-400" />
            <span className="text-sm text-stone-600 dark:text-slate-400">
              Rating Anda: <span className="font-semibold text-stone-900 dark:text-slate-100">{userRating.rating} ⭐</span>
            </span>
          </div>
        )}
        <button onClick={onRate}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                     bg-emerald-50 text-emerald-700 hover:bg-emerald-100
                     dark:bg-emerald-900/20 dark:text-emerald-300 dark:hover:bg-emerald-900/40">
          <Star className={`w-3.5 h-3.5 ${userRating ? 'fill-emerald-400 text-emerald-400' : ''}`} />
          {userRating ? 'Ubah Rating' : 'Beri Rating'}
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// InfoRow
// ─────────────────────────────────────────────────────────────────────────────
const InfoRow = ({ label, value, icon: Icon, accent = false }) => {
  if (!value && value !== 0) return null
  return (
    <div className="flex items-start gap-2 py-2.5 border-b border-stone-100 dark:border-slate-800 last:border-0">
      {Icon && (
        <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5
                        bg-emerald-50 dark:bg-emerald-900/20">
          <Icon className="w-3 h-3 text-emerald-500" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-[9px] uppercase tracking-wider text-stone-400 dark:text-slate-500 mb-0.5 leading-tight">{label}</div>
        <div className={`text-xs font-semibold break-words leading-snug ${accent ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-800 dark:text-slate-200'}`}>
          {value}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// StatCard
// ─────────────────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color = 'text-emerald-500', bg = 'bg-emerald-50 dark:bg-emerald-900/20' }) => {
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
const SectionTitle = ({ icon: Icon, title, iconColor = 'text-emerald-500' }) => (
  <h2 className="text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2
                 text-stone-500 dark:text-slate-400">
    <Icon className={`w-4 h-4 ${iconColor}`} />{title}
  </h2>
)

// ─────────────────────────────────────────────────────────────────────────────
// SeriesIssueCard — edisi lain dalam koleksi yang sama
// ─────────────────────────────────────────────────────────────────────────────
const SeriesIssueCard = ({ issue, currentSlug }) => {
  const isCurrent = issue.slug === currentSlug
  return (
    <Link to={isCurrent ? '#' : `/zine/${issue.slug}`}
      className={`flex items-center gap-3 p-3 rounded-xl border transition-all
        ${isCurrent
          ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700 cursor-default'
          : 'bg-white border-stone-100 hover:border-emerald-300 hover:shadow-sm dark:bg-slate-900 dark:border-slate-700 dark:hover:border-emerald-700/50 group'
        }`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold
        ${isCurrent
          ? 'bg-emerald-400 text-white'
          : 'bg-stone-100 text-stone-500 dark:bg-slate-800 dark:text-slate-400'
        }`}>
        {issue.issueNumber || '?'}
      </div>
      {issue.coverImageUrl && (
        <div className="w-9 h-12 rounded-md overflow-hidden flex-shrink-0 bg-stone-100 dark:bg-slate-800">
          <img src={issue.coverImageUrl} alt={issue.title} className="w-full h-full object-cover" loading="lazy" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className={`text-xs font-semibold truncate transition-colors
          ${isCurrent
            ? 'text-emerald-700 dark:text-emerald-400'
            : 'text-stone-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400'
          }`}>
          {issue.subtitle || issue.title}
        </div>
        {issue.publicationYear && (
          <div className="text-[10px] truncate text-stone-400 dark:text-slate-500 mt-0.5">
            {issue.publicationYear}
          </div>
        )}
      </div>
      {isCurrent
        ? <span className="flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-400/20 text-emerald-700 dark:text-emerald-400">Ini</span>
        : <ChevronRight className="w-4 h-4 text-stone-300 dark:text-slate-600 flex-shrink-0 group-hover:text-emerald-400 transition-colors" />
      }
    </Link>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ZineDetailPage
// ─────────────────────────────────────────────────────────────────────────────
const ZineDetailPage = () => {
  const { zineSlug }       = useParams()
  const navigate           = useNavigate()
  const { isAuthenticated } = useAuth()

  const [zine,             setZine]             = useState(null)
  const [loading,          setLoading]          = useState(true)
  const [error,            setError]            = useState(null)
  const [downloadLoading,  setDownloadLoading]  = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(null)
  const [readingLoading,   setReadingLoading]   = useState(false)
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false)
  const [userRating,       setUserRating]       = useState(null)
  const [ratingStats,      setRatingStats]      = useState(null)
  const [recentReviews,    setRecentReviews]    = useState([])
  const [reviewsLoading,   setReviewsLoading]   = useState(false)
  const [showFullDesc,     setShowFullDesc]      = useState(false)
  const [showAllDetails,   setShowAllDetails]   = useState(false)
  const [activeTab,        setActiveTab]         = useState('info')
  const [isFavorited,      setIsFavorited]      = useState(false)
  const [seriesIssues,     setSeriesIssues]     = useState([])
  const [seriesLoading,    setSeriesLoading]    = useState(false)

  const [, startTransition] = useTransition()

  // ── Fetch helpers ──────────────────────────────────────────────────────────
  const fetchUserRating = useCallback(async () => {
    try { const r = await zineService.getMyRating(zineSlug); setUserRating(r.data || null) }
    catch { setUserRating(null) }
  }, [zineSlug])

  const fetchRatingStats = useCallback(async () => {
    try { const r = await zineService.getRatingStats(zineSlug); setRatingStats(r.data || null) }
    catch {}
  }, [zineSlug])

  const fetchRecentReviews = useCallback(async () => {
    try {
      setReviewsLoading(true)
      const r = await zineService.getReviews(zineSlug, 1, 5, 'helpful')
      setRecentReviews(r.data?.list || [])
    } catch { setRecentReviews([]) }
    finally { setReviewsLoading(false) }
  }, [zineSlug])

  const fetchZineDetail = useCallback(async () => {
    try { const d = await zineService.getZineBySlug(zineSlug); setZine(d) } catch {}
  }, [zineSlug])

  // Ambil edisi lain dalam koleksi yang sama
  const fetchSeriesIssues = useCallback(async (collectionName) => {
    if (!collectionName) return
    try {
      setSeriesLoading(true)
      const res = await zineService.getZines({
        page: 1, limit: 50,
        sortField: 'publishedAt', sortOrder: 'ASC',
        searchTitle: collectionName,
      })
      const list = res.data?.data || []
      // Filter yang benar-benar satu koleksi
      const filtered = list.filter(z =>
        (z.collectionName || z.title) === collectionName
      )
      startTransition(() => setSeriesIssues(filtered.length ? filtered : list))
    } catch { setSeriesIssues([]) }
    finally { setSeriesLoading(false) }
  }, []) // eslint-disable-line

  // ── Main init ──────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    const init = async () => {
      setLoading(true); setError(null)
      try {
        const zineData = await zineService.getZineBySlug(zineSlug)
        if (!cancelled) {
          setZine(zineData)
          if (zineData?.collectionName) fetchSeriesIssues(zineData.collectionName)
        }
      } catch {
        if (!cancelled) setError('Zine tidak ditemukan')
      } finally {
        if (!cancelled) setLoading(false)
      }
      if (!cancelled) {
        await Promise.allSettled([
          fetchRatingStats(),
          fetchRecentReviews(),
          ...(isAuthenticated ? [fetchUserRating()] : [])
        ])
      }
    }
    init()
    return () => { cancelled = true }
  }, [zineSlug, isAuthenticated]) // eslint-disable-line

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleRead = async () => {
    try {
      setReadingLoading(true)
      navigate(`/zine/${zineSlug}/baca`)
      feedEvents.emit(FEED_EVENTS.ACTIVITY_CREATED, {
        activityType: 'started_reading',
        entityType:   'ZINE',
        entitySlug:   zineSlug,
        entityTitle:  zine?.title,
        entityCover:  zine?.coverImageUrl,
      })
    } catch (e) { alert(`Gagal: ${e.message}`) }
    finally { setReadingLoading(false) }
  }

  const handleDownload = async () => {
    if (!zine?.fileUrl) return alert('File zine tidak tersedia')
    try {
      setDownloadLoading(true)
      const { downloadUrl, filename } = await zineService.getDownloadUrl(zineSlug)
      setDownloadProgress({ percent: 0, loaded: 0, total: null })
      const response = await fetch(downloadUrl)
      if (!response.ok) throw new Error('Gagal mengunduh file')
      const total = response.headers.get('Content-Length')
        ? parseInt(response.headers.get('Content-Length')) : null
      const reader = response.body.getReader()
      const chunks = []; let loaded = 0
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(value); loaded += value.length
        setDownloadProgress({ loaded, total, percent: total ? Math.round((loaded / total) * 100) : null })
      }
      const blob = new Blob(chunks, { type: 'application/epub+zip' })
      const url  = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url; link.download = filename
      document.body.appendChild(link); link.click()
      document.body.removeChild(link); window.URL.revokeObjectURL(url)
      await fetchZineDetail(); setDownloadProgress(null)
    } catch (e) {
      console.error(e); setDownloadProgress(null); alert('❌ Gagal mengunduh zine.')
    } finally { setDownloadLoading(false) }
  }

  const handleShare = async () => {
    const shareData = { title: zine?.title, text: `Baca "${zine?.title}"`, url: window.location.href }
    try {
      if (navigator.share) await navigator.share(shareData)
      else { await navigator.clipboard.writeText(window.location.href); alert('✅ Link disalin!') }
    } catch {}
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
      await zineService.deleteRating(zineSlug); alert('✅ Rating dihapus!')
      setUserRating(null); fetchZineDetail(); fetchRatingStats()
    } catch { alert('❌ Gagal menghapus rating') }
  }

  const handleSubmitRating = async (ratingData) => {
    try {
      await zineService.addRating(zineSlug, { rating: ratingData.rating })
      alert('✅ Rating ditambahkan!'); setIsRatingModalOpen(false)
      fetchZineDetail(); fetchUserRating(); fetchRatingStats()
      feedEvents.emit(FEED_EVENTS.ACTIVITY_CREATED, {
        activityType: 'reviewed',
        entityType:   'ZINE',
        entitySlug:   zineSlug,
        entityTitle:  zine?.title,
        entityCover:  zine?.coverImageUrl,
      })
    } catch (e) { alert(`❌ Gagal: ${e.response?.data?.detail || e.message}`) }
  }

  // ── Utils ─────────────────────────────────────────────────────────────────
  const formatBytes = (bytes) => {
    if (!bytes) return null
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return null
    try { return new Date(dateStr).toLocaleDateString('id-ID', { year:'numeric', month:'long', day:'numeric' }) }
    catch { return dateStr }
  }

  const formatDateTime = (dateStr) => {
    if (!dateStr) return null
    try { return new Date(dateStr).toLocaleDateString('id-ID', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' }) }
    catch { return dateStr }
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

  // ── Loading / Error ────────────────────────────────────────────────────────
  if (loading) return <LoadingSpinner fullScreen />
  if (error || !zine) return (
    <div className="min-h-screen flex items-center justify-center">
      <Alert type="error" message={error || 'Zine tidak ditemukan'} />
    </div>
  )

  // ── Derived data ──────────────────────────────────────────────────────────
  const avgRating   = ratingStats?.averageRating || zine.averageRating || 0
  const totalRatings = ratingStats?.totalRatings || zine.totalRatings || 0
  const hasCollection = !!(zine.collectionName && zine.collectionName !== zine.title)

  // Slug seri dari collectionName
  const seriesSlug = zine.collectionName
    ? zine.collectionName.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, '-')
    : null

  // Kontributor (dari field contributors jika ada)
  const contributorList = zine.contributors
    ? zine.contributors.split(',').map(c => {
        const match = c.trim().match(/(.+?)\s*\((.+?)\)/)
        return match ? { name: match[1].trim(), role: match[2].trim() } : { name: c.trim(), role: '' }
      })
    : []

  // Genre list
  const genreList = zine.genres
    ? zine.genres.split(',').map(g => g.trim()).filter(Boolean)
    : []

  const tabs = [
    { id:'info',      label:'Info',        icon: Info  },
    { id:'kontributor', label:'Kontributor', icon: Users, hidden: !contributorList.length && !zine.source },
    { id:'koleksi',   label:'Edisi Lain',  icon: Layers, hidden: !hasCollection },
    { id:'ulasan',    label:'Ulasan',      icon: MessageCircle },
  ].filter(t => !t.hidden)

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <SEO
        title={`${zine.collectionName || zine.title}${zine.issueNumber ? ` No.${zine.issueNumber}` : ''}${zine.volume ? ` Vol.${zine.volume}` : ''} — Zine Digital`}
        description={zine.description ? zine.description.slice(0, 160) : `${zine.title}.`}
        url={`/zine/${zineSlug}`}
        type="website"
        image={zine.coverImageUrl}
      />

      {/*
        ROOT WRAPPER
        overflow-x-hidden → cegah elemen manapun memicu scrollbar horizontal
      */}
      <div className="min-h-screen overflow-x-hidden transition-colors duration-300 bg-stone-50 dark:bg-slate-950">

        {/* ════════════════════════════════════════════════════════════
            HERO — blurred cover backdrop, sama seperti BookDetailPage
        ════════════════════════════════════════════════════════════ */}
        <div className="relative overflow-hidden">
          {/* Blurred backdrop */}
          {zine.coverImageUrl && (
            <div
              className="absolute inset-0 h-64 sm:h-72 pointer-events-none"
              aria-hidden="true"
              style={{
                backgroundImage: `url(${zine.coverImageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center top',
                filter: 'blur(60px) brightness(0.25) saturate(1.5)',
                transform: 'scale(1.1)',
              }}
            />
          )}
          {/* Gradient overlay */}
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
                <Link to="/zine" className="transition hover:text-stone-100 whitespace-nowrap">Zine</Link>
                {hasCollection && (
                  <>
                    <span>/</span>
                    <Link to={`/zine/seri/${seriesSlug}`}
                      className="transition hover:text-stone-100 whitespace-nowrap truncate max-w-[100px]">
                      {zine.collectionName}
                    </Link>
                  </>
                )}
                <span>/</span>
                <span className="truncate max-w-[140px] text-stone-200 dark:text-slate-500">
                  {zine.subtitle || zine.title}
                </span>
              </nav>
              <button onClick={() => navigate('/zine')}
                className="inline-flex items-center gap-1.5 text-sm font-medium group transition-colors
                           text-stone-300 hover:text-white dark:text-slate-500 dark:hover:text-slate-300">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />Kembali
              </button>
            </div>

            {/* Cover + Info */}
            <div className="flex gap-4 sm:gap-6 pt-2 pb-6">
              {/* COVER */}
              <div className="flex-shrink-0">
                <div className="relative w-[110px] sm:w-[160px] lg:w-[192px]">
                  <div className="w-full rounded-xl overflow-hidden shadow-2xl shadow-black/40 border border-white/10 dark:border-white/5"
                    style={{ aspectRatio:'2/3' }}>
                    <CoverImage url={zine.coverImageUrl} alt={`Cover ${zine.title}`} className="w-full h-full" />
                  </div>
                  {/* Badges di bawah cover */}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {zine.isFeatured && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[9px] font-bold dark:bg-emerald-900/30 dark:text-emerald-400">
                        <Star className="w-2 h-2 fill-current" />Pilihan
                      </span>
                    )}
                    {zine.fileUrl && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-teal-100 text-teal-700 text-[9px] font-bold dark:bg-teal-900/30 dark:text-teal-400">
                        <Download className="w-2 h-2" />{(zine.fileFormat || 'epub').toUpperCase()}
                      </span>
                    )}
                    {zine.volume && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[9px] font-bold dark:bg-emerald-900/30 dark:text-emerald-400">
                        <Layers className="w-2 h-2" />Vol.{zine.volume}
                      </span>
                    )}
                    {zine.issueNumber && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-stone-200 text-stone-700 text-[9px] font-bold dark:bg-slate-700 dark:text-slate-300">
                        <Hash className="w-2 h-2" />No.{zine.issueNumber}
                      </span>
                    )}
                  </div>
                  {/* Rating pill (desktop) */}
                  {avgRating > 0 && (
                    <div className="hidden sm:flex mt-2 items-center gap-1 justify-center px-2 py-1.5 rounded-lg border
                                    bg-white/80 dark:bg-slate-900/80 border-stone-200 dark:border-slate-700 backdrop-blur-sm">
                      <StarDisplay avg={avgRating} />
                      <span className="text-xs font-bold text-stone-800 dark:text-slate-200">{avgRating.toFixed(1)}</span>
                      {totalRatings > 0 && <span className="text-[9px] text-stone-400 dark:text-slate-500">({totalRatings})</span>}
                    </div>
                  )}
                </div>
              </div>

              {/* INFO */}
              <div className="flex-1 min-w-0 pt-1">
                {/* Kategori pills */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {zine.category && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold
                                     bg-emerald-400/20 text-emerald-200 border border-emerald-400/30
                                     dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50">
                      {zine.category}
                    </span>
                  )}
                  {genreList.slice(0,2).map((g, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-full text-[10px] font-semibold
                                             bg-white/10 text-white/70 border border-white/20">
                      {g}
                    </span>
                  ))}
                </div>

                {/* Judul koleksi (collectionName) */}
                {hasCollection && (
                  <Link to={`/zine/seri/${seriesSlug}`}
                    className="inline-flex items-center gap-1.5 mb-1.5 px-2.5 py-1 rounded-lg
                               bg-emerald-400/20 border border-emerald-400/30 text-emerald-200 text-xs font-medium
                               hover:bg-emerald-400/30 transition-colors">
                    <Layers className="w-3 h-3" />{zine.collectionName}
                    {zine.volume && ` · Vol.${zine.volume}`}
                    {zine.issueNumber && ` · No.${zine.issueNumber}`}
                  </Link>
                )}

                {/* Title — dari subtitle (lebih deskriptif) atau title */}
                <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold leading-tight mb-1 text-white dark:text-slate-50 drop-shadow-md">
                  {zine.subtitle || zine.title}
                </h1>

                {/* Penerbit asli */}
                {(zine.firstPublisher || zine.publisher) && (
                  <p className="text-sm text-white/70 mb-2 leading-snug">
                    {zine.firstPublisher || zine.publisher}
                  </p>
                )}

                {/* Meta baris */}
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-white/60">
                  {zine.publicationYear && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-emerald-400" />{zine.publicationYear}
                    </span>
                  )}
                  {zine.languageName && (
                    <span className="flex items-center gap-1">
                      <Globe className="w-3 h-3 text-emerald-400" />{zine.languageName}
                    </span>
                  )}
                  {zine.estimatedReadTime && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-400" />{zine.estimatedReadTime} mnt
                    </span>
                  )}
                  {zine.firstPublisher && zine.firstPublisher !== zine.publisher && (
                    <span className="flex items-center gap-1">
                      <Printer className="w-3 h-3 text-emerald-400" />Oleh: {zine.firstPublisher}
                    </span>
                  )}
                </div>

                {/* Rating mobile */}
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
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all
                               active:scale-[0.98] disabled:opacity-60
                               bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-900/40">
                    <BookOpen className="w-4 h-4" />
                    {readingLoading ? 'Memuat...' : 'Baca Sekarang'}
                  </button>
                  {zine.fileUrl && (
                    <button onClick={handleDownload} disabled={downloadLoading}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all
                                 active:scale-[0.98] disabled:opacity-60
                                 bg-white/15 hover:bg-white/25 text-white backdrop-blur-sm border border-white/20">
                      <Download className="w-4 h-4" />
                      {downloadLoading
                        ? (downloadProgress?.percent != null ? `${downloadProgress.percent}%` : 'Mengunduh...')
                        : `Unduh ${(zine.fileFormat || 'EPUB').toUpperCase()}`}
                    </button>
                  )}
                  <button onClick={handleFavorite}
                    className={`p-2.5 rounded-xl border transition-all active:scale-95
                      ${isFavorited
                        ? 'bg-red-500/80 border-red-400/50 text-white'
                        : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20 hover:text-white'
                      }`}>
                    <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                  </button>
                  <button onClick={handleOpenRatingModal}
                    className={`p-2.5 rounded-xl border transition-all active:scale-95
                      ${userRating
                        ? 'bg-emerald-500/80 border-emerald-400/50 text-white'
                        : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20 hover:text-white'
                      }`}>
                    <Star className={`w-5 h-5 ${userRating ? 'fill-current' : ''}`} />
                  </button>
                  <button onClick={handleShare}
                    className="p-2.5 rounded-xl border bg-white/10 border-white/20 text-white/70 hover:bg-white/20 hover:text-white transition-all active:scale-95">
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
                ? <div className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width:`${downloadProgress.percent}%` }} />
                : <div className="h-full bg-emerald-500 animate-pulse w-full rounded-full" />
              }
            </div>
          )}

          {/* User rating pill */}
          {userRating && (
            <div className="flex items-center justify-between p-3 rounded-xl border mb-4
                            bg-emerald-50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-800">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 fill-emerald-400 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  Rating Anda: {userRating.rating} ⭐
                </span>
              </div>
              <button onClick={handleDeleteRating}
                className="text-xs font-medium px-2 py-1 rounded-lg transition text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
                Hapus
              </button>
            </div>
          )}

          {/* Engagement stats */}
          {(zine.viewCount > 0 || zine.readCount > 0 || zine.downloadCount > 0) && (
            <div className="mb-5">
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                {zine.viewCount     > 0 && <StatCard icon={Eye}        label="Dilihat"  value={zine.viewCount}     color="text-blue-500"    bg="bg-blue-50 dark:bg-blue-900/20"    />}
                {zine.readCount     > 0 && <StatCard icon={BookOpen}   label="Pembaca"  value={zine.readCount}     color="text-emerald-500" bg="bg-emerald-50 dark:bg-emerald-900/20" />}
                {zine.downloadCount > 0 && <StatCard icon={Download}   label="Diunduh"  value={zine.downloadCount} color="text-teal-500"    bg="bg-teal-50 dark:bg-teal-900/20"    />}
                {totalRatings       > 0 && <StatCard icon={Star}       label="Rating"   value={totalRatings}       color="text-emerald-500" bg="bg-emerald-50 dark:bg-emerald-900/20" />}
                {zine.totalWord     > 0 && <StatCard icon={AlignLeft}  label="Kata"     value={zine.totalWord}     color="text-violet-500"  bg="bg-violet-50 dark:bg-violet-900/20"  />}
              </div>
            </div>
          )}

          {/* Rating summary */}
          <div className="mb-5">
            <RatingSummary ratingStats={ratingStats} onRate={handleOpenRatingModal} userRating={userRating} />
          </div>

          {/* Koleksi banner (setara series banner di BookDetailPage) */}
          {hasCollection && (
            <div className="mb-5 p-4 rounded-2xl border overflow-hidden
                            bg-gradient-to-r from-emerald-50 to-teal-50
                            border-emerald-200
                            dark:from-emerald-900/20 dark:to-slate-900 dark:border-emerald-800/50">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/40
                                flex items-center justify-center flex-shrink-0">
                  <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] uppercase tracking-wide font-semibold mb-0.5
                                  text-emerald-500 dark:text-emerald-400">Bagian dari Koleksi</div>
                  <Link to={`/zine/seri/${seriesSlug}`}
                    className="text-sm font-bold text-emerald-800 dark:text-emerald-300
                               hover:text-emerald-600 dark:hover:text-emerald-200 transition-colors">
                    {zine.collectionName}
                  </Link>
                  <div className="flex items-center gap-3 mt-1.5">
                    {zine.issueNumber && (
                      <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                        Nomor {zine.issueNumber} dalam koleksi ini
                      </span>
                    )}
                    <Link to={`/zine/seri/${seriesSlug}`}
                      className="text-xs text-emerald-500 hover:text-emerald-700
                                 dark:text-emerald-400 dark:hover:text-emerald-200
                                 underline underline-offset-2">
                      Lihat semua →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TABS */}
          <div className="flex gap-1 p-1 rounded-xl mb-5 overflow-x-auto scrollbar-none
                          bg-stone-100 dark:bg-slate-800/60">
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm
                              font-medium whitespace-nowrap transition-all flex-shrink-0
                              ${activeTab === tab.id
                                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                                : 'text-stone-500 dark:text-slate-400 hover:text-stone-700 dark:hover:text-slate-200'
                              }`}>
                  <Icon className="w-3.5 h-3.5" />{tab.label}
                </button>
              )
            })}
          </div>

          {/* ══════════════════════════════════════════════════════════
              TAB: INFO
          ══════════════════════════════════════════════════════════ */}
          {activeTab === 'info' && (
            <div className="space-y-5">

              {/* Deskripsi */}
              <div className="rounded-2xl border bg-white border-stone-200 dark:bg-slate-900 dark:border-slate-700 overflow-hidden">
                <div className="px-4 sm:px-5 pt-4 pb-1">
                  <SectionTitle icon={BookOpen} title="Deskripsi (Dibikin Otomatis)" />
                </div>
                <div className="px-4 sm:px-5 pb-4">
                  {zine.description ? (
                    <>
                      <p className={`whitespace-pre-line leading-relaxed text-sm sm:text-base text-justify
                                     text-stone-700 dark:text-slate-300
                                     ${!showFullDesc && zine.description.length > 500 ? 'line-clamp-5' : ''}`}>
                        {zine.description}
                      </p>
                      {zine.description.length > 500 && (
                        <button onClick={() => setShowFullDesc(v => !v)}
                          className="mt-2 text-sm font-medium flex items-center gap-1
                                     text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300">
                          {showFullDesc ? 'Sembunyikan' : 'Baca selengkapnya'}
                          <ChevronDown className={`w-4 h-4 transition-transform ${showFullDesc ? 'rotate-180' : ''}`} />
                        </button>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-stone-400 dark:text-slate-500 italic">Tidak ada deskripsi tersedia.</p>
                  )}
                </div>
              </div>

              {/* Genre */}
              {genreList.length > 0 && (
                <div className="rounded-2xl border bg-white border-stone-200 dark:bg-slate-900 dark:border-slate-700 p-4 sm:p-5">
                  <SectionTitle icon={Tag} title="Genre & Kategori" />
                  <div className="flex flex-wrap gap-2">
                    {genreList.map((g, i) => (
                      <span key={i}
                        className="px-3 py-1.5 rounded-xl text-sm font-medium border
                                   bg-emerald-50 border-emerald-200 text-emerald-700
                                   dark:bg-emerald-900/20 dark:border-emerald-700/50 dark:text-emerald-300">
                        {g}
                      </span>
                    ))}
                    {zine.category && !genreList.includes(zine.category) && (
                      <span className="px-3 py-1.5 rounded-xl text-sm font-medium border
                                       bg-stone-50 border-stone-200 text-stone-600
                                       dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
                        {zine.category}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Riwayat Penerbitan */}
              {(zine.firstPublisher || zine.publisher || zine.firstPublishedDate) && (
                <div className="rounded-2xl border bg-white border-stone-200 dark:bg-slate-900 dark:border-slate-700 overflow-hidden">
                  <div className="px-4 sm:px-5 pt-4 pb-0">
                    <SectionTitle icon={Printer} title="Riwayat Penerbitan" iconColor="text-stone-500" />
                  </div>

                  {/* Penerbit asli */}
                  {(zine.firstPublisher || zine.firstPublishedDate) && (
                    <div className="px-4 sm:px-5 pb-4">
                      <div className="text-[10px] uppercase tracking-wider font-semibold mb-3
                                      text-stone-400 dark:text-slate-500">Penerbitan Asli</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {zine.firstPublishedDate && (
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20
                                            flex items-center justify-center flex-shrink-0">
                              <Calendar className="w-4 h-4 text-emerald-500" />
                            </div>
                            <div>
                              <div className="text-[10px] uppercase tracking-wide text-stone-400 dark:text-slate-500 mb-0.5">Tanggal Terbit</div>
                              <div className="text-sm font-semibold text-stone-800 dark:text-slate-200">
                                {zine.firstPublishedDate}
                              </div>
                            </div>
                          </div>
                        )}
                        {zine.firstPublisher && (
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20
                                            flex items-center justify-center flex-shrink-0">
                              <Newspaper className="w-4 h-4 text-emerald-500" />
                            </div>
                            <div>
                              <div className="text-[10px] uppercase tracking-wide text-stone-400 dark:text-slate-500 mb-0.5">Lembaga / Penerbit</div>
                              <div className="text-sm font-semibold text-stone-800 dark:text-slate-200">
                                {zine.firstPublisher}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Edisi digital (publisher MasasilaM) */}
                  {zine.publisher && (
                    <>
                      {(zine.firstPublisher || zine.firstPublishedDate) && (
                        <div className="border-t border-stone-100 dark:border-slate-800 mx-4" />
                      )}
                      <div className="px-4 sm:px-5 py-4">
                        <div className="text-[10px] uppercase tracking-wider font-semibold mb-3
                                        text-stone-400 dark:text-slate-500">Edisi Digital</div>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-slate-800
                                          flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-4 h-4 text-stone-400 dark:text-slate-500" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-stone-800 dark:text-slate-200">
                              {zine.publisher}
                            </div>
                            {zine.publicationYear && (
                              <div className="text-xs text-stone-400 dark:text-slate-500 mt-0.5">
                                {zine.publicationYear}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Detail Zine */}
              <div className="rounded-2xl border bg-white border-stone-200 dark:bg-slate-900 dark:border-slate-700 overflow-hidden">
                <div className="px-4 sm:px-5 pt-4 pb-2">
                  <SectionTitle icon={FileText} title="Detail Zine" />
                </div>

                <div className="px-3 sm:px-5 pb-3">
                  <div className="grid grid-cols-2 gap-x-2 sm:gap-x-6">
                    <div>
                      <InfoRow icon={FileText}  label="Format"   value={zine.fileFormat?.toUpperCase()} />
                      <InfoRow icon={Activity}  label="Ukuran"   value={formatBytes(zine.fileSize)} />
                      <InfoRow icon={AlignLeft} label="Kata"     value={zine.totalWord ? zine.totalWord.toLocaleString('id-ID') : null} />
                    </div>
                    <div>
                      <InfoRow icon={Clock}       label="Est. Baca" value={zine.estimatedReadTime ? `${zine.estimatedReadTime} mnt` : null} />
                      <InfoRow icon={Globe}       label="Bahasa"    value={zine.languageName} />
                      <InfoRow icon={Layers}      label="Volume"    value={zine.volume ? `Vol. ${zine.volume}` : null} />
                      <InfoRow icon={Hash}        label="No. Edisi" value={zine.issueNumber ? `No. ${zine.issueNumber}` : null} />
                    </div>
                  </div>
                </div>

                {showAllDetails && (
                  <div className="border-t border-stone-100 dark:border-slate-800">
                    <div className="px-3 sm:px-5 pt-3 pb-3">
                      <div className="grid grid-cols-2 gap-x-2 sm:gap-x-6">
                        <div>
                          <InfoRow icon={Calendar}   label="Thn Terbit"  value={zine.publicationYear ? String(zine.publicationYear) : null} />
                          <InfoRow icon={Building2}  label="Penerbit"    value={zine.publisher} />
                          <InfoRow icon={Award}      label="Kesulitan"   value={zine.difficultyLevel} />
                          <InfoRow icon={Bookmark}   label="Kategori"    value={zine.category} />
                        </div>
                        <div>
                          <InfoRow icon={Calendar}   label="Rilis Digital" value={formatDate(zine.publishedAt)} />
                          <InfoRow icon={TrendingUp} label="Status"       value={zine.isActive ? 'Aktif' : 'Nonaktif'} />
                          <InfoRow icon={Calendar}   label="Ditambahkan"  value={formatDateTime(zine.createdAt)} />
                          <InfoRow icon={Calendar}   label="Diperbarui"   value={formatDateTime(zine.updatedAt)} />
                        </div>
                      </div>
                    </div>

                    {zine.copyrightStatus && (
                      <div className="px-4 sm:px-5 py-3 border-t border-stone-100 dark:border-slate-800
                                      bg-emerald-50/50 dark:bg-emerald-900/10">
                        <div className="text-[10px] uppercase tracking-wider text-stone-400 dark:text-slate-500 mb-1">
                          Status Hak Cipta
                        </div>
                        <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          {zine.copyrightStatus}
                        </div>
                      </div>
                    )}

                    {zine.source && (
                      <div className="px-4 sm:px-5 py-3 border-t border-stone-100 dark:border-slate-800">
                        <div className="text-[10px] uppercase tracking-wider text-stone-400 dark:text-slate-500 mb-1">
                          Sumber Data
                        </div>
                        <a href={zine.source} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm transition-colors break-all
                                     text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300">
                          <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                          {getSourceDomain(zine.source)}
                        </a>
                      </div>
                    )}
                  </div>
                )}

                <button onClick={() => setShowAllDetails(v => !v)}
                  className="w-full flex items-center justify-center gap-1.5 py-3 text-xs font-semibold
                             border-t border-stone-100 dark:border-slate-800 transition-colors
                             text-stone-400 dark:text-slate-500
                             hover:text-emerald-600 dark:hover:text-emerald-400
                             hover:bg-stone-50 dark:hover:bg-slate-800/60">
                  {showAllDetails ? 'Sembunyikan' : 'Tampilkan semua detail'}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showAllDetails ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Statistik interaksi */}
              {(zine.viewCount > 0 || zine.readCount > 0 || totalRatings > 0) && (
                <div className="rounded-2xl border bg-white border-stone-200 dark:bg-slate-900 dark:border-slate-700 p-4 sm:p-5">
                  <SectionTitle icon={BarChart2} title="Statistik Interaksi" iconColor="text-violet-500" />
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {totalRatings       > 0 && <StatCard icon={Star}      label="Total Rating" value={totalRatings}       color="text-emerald-500" bg="bg-emerald-50 dark:bg-emerald-900/20"   />}
                    {zine.viewCount     > 0 && <StatCard icon={Eye}       label="Dilihat"      value={zine.viewCount}     color="text-blue-500"    bg="bg-blue-50 dark:bg-blue-900/20"         />}
                    {zine.readCount     > 0 && <StatCard icon={BookOpen}  label="Pembaca"      value={zine.readCount}     color="text-emerald-600" bg="bg-emerald-50 dark:bg-emerald-900/20"   />}
                    {zine.downloadCount > 0 && <StatCard icon={Download}  label="Diunduh"      value={zine.downloadCount} color="text-teal-500"    bg="bg-teal-50 dark:bg-teal-900/20"         />}
                    {zine.totalWord     > 0 && <StatCard icon={AlignLeft} label="Total Kata"   value={zine.totalWord}     color="text-violet-500"  bg="bg-violet-50 dark:bg-violet-900/20"     />}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              TAB: KONTRIBUTOR
          ══════════════════════════════════════════════════════════ */}
          {activeTab === 'kontributor' && (
            <div className="space-y-5">

              {/* Sumber digitalisasi */}
              {zine.source && (
                <div className="rounded-2xl border bg-white border-stone-200 dark:bg-slate-900 dark:border-slate-700 p-4 sm:p-5">
                  <SectionTitle icon={Database} title="Sumber & Digitalisasi" iconColor="text-teal-500" />
                  <a href={zine.source} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl border transition-all group
                               bg-teal-50 border-teal-200 hover:border-teal-400
                               dark:bg-teal-900/10 dark:border-teal-800/50 dark:hover:border-teal-600">
                    <div className="w-9 h-9 rounded-full bg-teal-100 dark:bg-teal-900/30
                                    flex items-center justify-center flex-shrink-0">
                      <Database className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-teal-800 dark:text-teal-300 truncate
                                      group-hover:text-teal-600 dark:group-hover:text-teal-200 transition-colors">
                        {getSourceDomain(zine.source)}
                      </div>
                      <div className="text-[10px] text-teal-600/70 dark:text-teal-400/60">Digitalisasi & Sumber Asli</div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-teal-400 flex-shrink-0" />
                  </a>
                </div>
              )}

              {/* Kontributor list */}
              {contributorList.length > 0 && (
                <div className="rounded-2xl border bg-white border-stone-200 dark:bg-slate-900 dark:border-slate-700 p-4 sm:p-5">
                  <SectionTitle icon={Users} title="Kontributor" iconColor="text-purple-500" />
                  <div className="space-y-2">
                    {contributorList.map((c, i) => (
                      <div key={i}
                        className="flex items-center gap-3 p-3 rounded-xl border
                                   bg-stone-50 border-stone-100 dark:bg-slate-800/60 dark:border-slate-700">
                        <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-900/20
                                        flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-purple-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold truncate text-stone-800 dark:text-slate-200">{c.name}</div>
                          {c.role && <div className="text-[10px] text-stone-400 dark:text-slate-500 capitalize mt-0.5">{c.role}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {!zine.source && contributorList.length === 0 && (
                <div className="rounded-2xl p-10 text-center border border-dashed
                                bg-stone-50 border-stone-200 dark:bg-slate-800/60 dark:border-slate-700">
                  <Users className="w-10 h-10 mx-auto mb-3 text-stone-300 dark:text-slate-600" />
                  <p className="text-sm text-stone-500 dark:text-slate-400">Informasi kontributor belum tersedia</p>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              TAB: EDISI LAIN (Koleksi)
          ══════════════════════════════════════════════════════════ */}
          {activeTab === 'koleksi' && hasCollection && (
            <div className="space-y-4">

              {/* Koleksi info header */}
              <div className="p-4 sm:p-5 rounded-2xl border bg-white border-emerald-200
                              dark:bg-slate-900 dark:border-emerald-800/50">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40
                                  flex items-center justify-center flex-shrink-0">
                    <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-stone-900 dark:text-slate-50">
                      {zine.collectionName}
                    </h3>
                    <p className="text-sm mt-0.5 text-stone-500 dark:text-slate-400">
                      Penerbit: {zine.firstPublisher || zine.publisher}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  {zine.issueNumber && (
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                      <Bookmark className="w-3.5 h-3.5" />Anda membaca Nomor {zine.issueNumber}
                    </span>
                  )}
                  <Link to={`/zine/seri/${seriesSlug}`}
                    className="inline-flex items-center gap-1 text-xs font-medium underline underline-offset-2 transition-colors
                               text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-200">
                    Halaman koleksi <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Daftar edisi */}
              <div>
                <SectionTitle icon={Layers} title="Semua Edisi dalam Koleksi" iconColor="text-emerald-500" />
                {seriesLoading ? (
                  <div className="space-y-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="h-16 rounded-xl animate-pulse bg-stone-100 dark:bg-slate-800" />
                    ))}
                  </div>
                ) : seriesIssues.length > 0 ? (
                  <div className="space-y-2">
                    {seriesIssues.map((issue, i) => (
                      <SeriesIssueCard key={issue.id || i} issue={issue} currentSlug={zineSlug} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <SeriesIssueCard
                      issue={{
                        slug:          zineSlug,
                        title:         zine.title,
                        subtitle:      zine.subtitle,
                        coverImageUrl: zine.coverImageUrl,
                        issueNumber:   zine.issueNumber,
                        publicationYear: zine.publicationYear,
                      }}
                      currentSlug={zineSlug}
                    />
                    <div className="p-4 rounded-xl border border-dashed text-sm text-center
                                    bg-stone-50 border-stone-200 dark:bg-slate-800/60 dark:border-slate-700
                                    text-stone-400 dark:text-slate-500">
                      Edisi lain dalam koleksi ini belum tersedia.
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              TAB: ULASAN
          ══════════════════════════════════════════════════════════ */}
          {activeTab === 'ulasan' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-stone-900 dark:text-slate-50">Ulasan Pembaca</h2>
                <div className="flex gap-2">
                  <button onClick={() => navigate(isAuthenticated ? `/zine/${zineSlug}/ulasan` : '/masuk')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold transition-all
                               bg-emerald-500 hover:bg-emerald-400 text-white">
                    <MessageCircle className="w-3.5 h-3.5" />Tulis Ulasan
                  </button>
                  {recentReviews.length > 0 && (
                    <button onClick={() => navigate(`/zine/${zineSlug}/ulasan`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all
                                 border border-stone-200 text-stone-600
                                 hover:border-emerald-300 hover:text-emerald-700
                                 dark:border-slate-700 dark:text-slate-400">
                      Lihat Semua
                    </button>
                  )}
                </div>
              </div>

              {reviewsLoading ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => <div key={i} className="h-24 rounded-xl animate-pulse bg-stone-100 dark:bg-slate-800" />)}
                </div>
              ) : recentReviews.length === 0 ? (
                <div className="rounded-2xl p-10 text-center border border-dashed
                                bg-stone-50 border-stone-200 dark:bg-slate-800/60 dark:border-slate-700">
                  <MessageCircle className="w-10 h-10 mx-auto mb-3 text-stone-300 dark:text-slate-600" />
                  <p className="mb-4 text-sm text-stone-500 dark:text-slate-400">Belum ada ulasan</p>
                  <button onClick={() => navigate(isAuthenticated ? `/zine/${zineSlug}/ulasan` : '/masuk')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold
                               bg-emerald-500 hover:bg-emerald-400 text-white transition-all">
                    <MessageCircle className="w-4 h-4" />
                    {isAuthenticated ? 'Jadilah yang Pertama' : 'Login untuk Ulasan'}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentReviews.map(review => (
                    <article key={review.id}
                      className="rounded-xl p-4 sm:p-5 border transition-all hover:shadow-md
                                 bg-white border-stone-100 dark:bg-slate-900 dark:border-slate-700">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden
                                        bg-emerald-50 dark:bg-emerald-900/20">
                          {review.userPhotoUrl
                            ? <img src={review.userPhotoUrl} alt={review.userName}
                                className="w-9 h-9 object-cover" loading="lazy" />
                            : <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                {review.userName?.charAt(0)?.toUpperCase() || '?'}
                              </span>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-stone-900 dark:text-slate-100 truncate">
                              {review.userName}
                            </span>
                            {review.isOwner && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded font-bold
                                               bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                                Anda
                              </span>
                            )}
                            <time className="text-xs ml-auto flex-shrink-0 text-stone-400 dark:text-slate-500"
                              dateTime={review.createdAt}>
                              {new Date(review.createdAt).toLocaleDateString('id-ID', {
                                year:'numeric', month:'short', day:'numeric'
                              })}
                            </time>
                          </div>
                        </div>
                      </div>
                      {review.title && (
                        <h3 className="font-bold mb-1.5 text-sm text-stone-900 dark:text-slate-100">
                          {review.title}
                        </h3>
                      )}
                      <p className="mb-3 line-clamp-3 text-sm leading-relaxed text-stone-600 dark:text-slate-300">
                        {review.content}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-stone-400 dark:text-slate-500">
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>{review.helpfulCount || 0} membantu</span>
                        </div>
                        {review.replyCount > 0 && (
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>{review.replyCount} balasan</span>
                          </div>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Social Integration */}
          <div className="mt-8">
            <ZineDetailSocialSection zine={zine} />
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════
            FIXED BOTTOM BAR — mobile & tablet (< lg)
            overflow-x-hidden di root + inset-x-0 di sini
        ════════════════════════════════════════════════════════════ */}
        <div
          className="lg:hidden fixed inset-x-0 bottom-0 z-40
                     bg-white/95 dark:bg-slate-950/95 backdrop-blur-md
                     border-t border-stone-200 dark:border-slate-800"
          style={{
            paddingLeft: '12px',
            paddingRight: '12px',
            paddingTop: '8px',
            paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
          }}
        >
          <div className="flex gap-2">
            {/* Baca — flex-1 */}
            <button
              onClick={handleRead}
              disabled={readingLoading}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
                         text-sm font-bold transition-all active:scale-[0.98] disabled:opacity-60 min-w-0
                         bg-emerald-500 hover:bg-emerald-400 text-white
                         shadow-md shadow-emerald-200/80 dark:shadow-emerald-900/40"
            >
              <BookOpen className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{readingLoading ? 'Memuat...' : 'Baca Sekarang'}</span>
            </button>

            {/* Unduh */}
            {zine.fileUrl && (
              <button
                onClick={handleDownload}
                disabled={downloadLoading}
                className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl border transition-all
                           disabled:opacity-60 active:scale-95
                           bg-white border-stone-200 text-stone-600
                           dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400"
              >
                <Download className="w-5 h-5" />
              </button>
            )}

            {/* Favorit */}
            <button
              onClick={handleFavorite}
              className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl border transition-all active:scale-95
                ${isFavorited
                  ? 'bg-red-50 border-red-300 text-red-500 dark:bg-red-900/20 dark:border-red-700 dark:text-red-400'
                  : 'bg-white border-stone-200 text-stone-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400'
                }`}
            >
              <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
            </button>

            {/* Bagikan */}
            <button
              onClick={handleShare}
              className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl border transition-all active:scale-95
                         border-stone-200 dark:border-slate-700 text-stone-500 dark:text-slate-400
                         bg-white dark:bg-slate-900"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <RatingModal
          isOpen={isRatingModalOpen}
          onClose={() => setIsRatingModalOpen(false)}
          onSubmit={handleSubmitRating}
          zineTitle={zine.title}
        />
      </div>
    </>
  )
}

export default ZineDetailPage
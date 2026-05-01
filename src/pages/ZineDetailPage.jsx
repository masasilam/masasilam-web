// ============================================
// src/pages/ZineDetailPage.jsx
// LIGHT: Warm cream — stone-* tokens, emerald accent
// DARK:  Deep navy  — slate-* tokens, emerald accent
// ============================================
import { useState, useEffect, useRef } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  BookOpen, Calendar, Clock, Download, Eye, Heart, Share2, Star,
  User, FileText, Globe, Building2, X, MessageCircle, ThumbsUp,
  ArrowLeft, ChevronDown, Layers, Hash, Database, ExternalLink
} from 'lucide-react'
import zineService from '../services/zineService'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from '../components/Common/LoadingSpinner'
import Button from '../components/Common/Button'
import Alert from '../components/Common/Alert'
import SEO from '../components/Common/SEO'
import ZineDetailSocialSection from '../components/Social/ZineDetailSocialSection'
import feedEvents, { FEED_EVENTS } from '../services/feedEvents'

// ── Rating Modal ──────────────────────────────────────────────────────────────
const RatingModal = ({ isOpen, onClose, onSubmit, zineTitle }) => {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0) return alert('Pilih rating bintang')
    setSubmitting(true)
    await onSubmit({ rating })
    setSubmitting(false)
    setRating(0)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="rounded-2xl shadow-2xl max-w-md w-full transition-colors
                      bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-700">
        <div className="flex items-center justify-between p-6 border-b border-stone-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-stone-900 dark:text-slate-50">Beri Rating</h2>
          <button onClick={onClose}
            className="p-1.5 rounded-lg transition-all text-stone-400 hover:text-stone-700 hover:bg-stone-100
                       dark:text-slate-500 dark:hover:text-slate-200 dark:hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <p className="text-sm mb-1 text-stone-500 dark:text-slate-400">Zine</p>
            <p className="font-semibold leading-snug text-stone-900 dark:text-slate-100">{zineTitle}</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-4 text-stone-700 dark:text-slate-300">
              Rating Bintang <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-1 items-center justify-center">
              {[1,2,3,4,5].map(star => {
                const isFull = (hoverRating || rating) >= star
                return (
                  <div key={star} className="relative cursor-pointer group">
                    <Star className={`w-12 h-12 transition-all ${
                      isFull ? 'fill-emerald-400 text-emerald-400 scale-110'
                             : 'fill-stone-200 text-stone-300 dark:fill-slate-700 dark:text-slate-600'
                    } group-hover:scale-110`} />
                    <div className="absolute inset-0 flex">
                      <button type="button" className="w-1/2 h-full"
                        onClick={() => setRating(star - 0.5)} onMouseEnter={() => setHoverRating(star - 0.5)} onMouseLeave={() => setHoverRating(0)} />
                      <button type="button" className="w-1/2 h-full"
                        onClick={() => setRating(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} />
                    </div>
                  </div>
                )
              })}
            </div>
            {rating > 0 && (
              <p className="text-sm text-center mt-3 font-medium text-emerald-600 dark:text-emerald-400">
                {rating} bintang
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="secondary" fullWidth onClick={onClose} disabled={submitting}>Batal</Button>
            <Button type="submit" variant="primary-emerald" fullWidth loading={submitting} disabled={submitting || rating === 0}>
              {submitting ? 'Mengirim...' : 'Kirim Rating'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Rating Summary ────────────────────────────────────────────────────────────
const RatingSummary = ({ ratingStats, onRate, userRating }) => {
  if (!ratingStats || ratingStats.totalRatings === 0) {
    return (
      <div className="flex items-center gap-4 p-4 rounded-2xl border border-dashed transition-colors
                      bg-stone-50 border-stone-200 dark:bg-slate-800/60 dark:border-slate-700">
        <div className="text-center">
          <div className="text-4xl font-bold text-stone-200 dark:text-slate-700">—</div>
          <div className="flex gap-0.5 mt-1 justify-center">
            {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 text-stone-200 dark:text-slate-700" />)}
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm mb-2 text-stone-500 dark:text-slate-400">Belum ada rating</p>
          <button onClick={onRate}
            className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors
                       text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300">
            <Star className="w-4 h-4" />
            {userRating ? `Rating Anda: ${userRating.rating} ⭐` : 'Beri rating pertama'}
          </button>
        </div>
      </div>
    )
  }

  const avg = ratingStats.averageRating || 0
  const total = ratingStats.totalRatings || 0
  const filledStars = Math.floor(avg)
  const hasHalf = avg - filledStars >= 0.25 && avg - filledStars < 0.75
  const hasAlmostFull = avg - filledStars >= 0.75
  const ratingLabel = avg >= 4.5 ? 'Luar Biasa' : avg >= 4 ? 'Sangat Bagus'
    : avg >= 3.5 ? 'Bagus' : avg >= 3 ? 'Cukup' : 'Kurang'

  const bars = [
    { label: '5', count: (ratingStats.rating50Count || 0) },
    { label: '4', count: (ratingStats.rating45Count || 0) + (ratingStats.rating40Count || 0) },
    { label: '3', count: (ratingStats.rating35Count || 0) + (ratingStats.rating30Count || 0) },
    { label: '2', count: (ratingStats.rating25Count || 0) + (ratingStats.rating20Count || 0) },
    { label: '1', count: (ratingStats.rating15Count || 0) + (ratingStats.rating10Count || 0) + (ratingStats.rating05Count || 0) },
  ]

  return (
    <div className="p-4 sm:p-5 rounded-2xl border shadow-sm transition-colors
                    bg-white border-stone-200 shadow-stone-100/80 dark:bg-slate-900 dark:border-slate-700 dark:shadow-none">
      <div className="flex gap-5 sm:gap-6">
        <div className="flex flex-col items-center justify-center flex-shrink-0 min-w-[80px]">
          <div className="text-5xl sm:text-6xl font-extrabold tabular-nums leading-none mb-1 text-stone-900 dark:text-slate-50">
            {avg.toFixed(1)}
          </div>
          <div className="flex gap-0.5 mb-1">
            {[1,2,3,4,5].map(s => {
              const isFull = s <= filledStars || (s === filledStars + 1 && hasAlmostFull)
              const isHalf = s === filledStars + 1 && hasHalf
              return (
                <span key={s} className="relative inline-block">
                  <Star className="w-4 h-4 text-stone-200 dark:text-slate-600" />
                  {(isFull || isHalf) && (
                    <Star className="w-4 h-4 absolute inset-0 fill-emerald-400 text-emerald-400"
                      style={isHalf ? { clipPath:'polygon(0 0,50% 0,50% 100%,0 100%)' } : {}} />
                  )}
                </span>
              )
            })}
          </div>
          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{ratingLabel}</div>
          <div className="text-[10px] mt-0.5 text-stone-400 dark:text-slate-500">{total} rating</div>
        </div>
        <div className="flex-1 min-w-0 space-y-1.5 flex flex-col justify-center">
          {bars.map(({ label, count }) => {
            const pct = total > 0 ? (count / total) * 100 : 0
            return (
              <div key={label} className="flex items-center gap-2">
                <div className="flex items-center gap-0.5 w-10 justify-end flex-shrink-0">
                  <span className="text-xs font-medium text-stone-500 dark:text-slate-400">{label}</span>
                  <Star className="w-3 h-3 fill-emerald-400 text-emerald-400" />
                </div>
                <div className="flex-1 h-2 rounded-full overflow-hidden bg-stone-100 dark:bg-slate-700">
                  <div className="h-full bg-emerald-400 rounded-full transition-all duration-700" style={{ width:`${pct}%` }} />
                </div>
                <span className="text-[10px] w-6 text-right flex-shrink-0 text-stone-400 dark:text-slate-500">{count}</span>
              </div>
            )
          })}
        </div>
      </div>
      <div className="mt-4 pt-3 border-t flex items-center justify-between flex-wrap gap-2 border-stone-100 dark:border-slate-700">
        {userRating ? (
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 fill-emerald-400 text-emerald-400" />
            <span className="text-sm text-stone-600 dark:text-slate-400">
              Rating Anda: <span className="font-semibold text-stone-900 dark:text-slate-100">{userRating.rating} ⭐</span>
            </span>
          </div>
        ) : (
          <span className="text-sm text-stone-500 dark:text-slate-400">Sudah baca? Beri rating kamu</span>
        )}
        <button onClick={onRate}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all active:scale-95
                     bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300 dark:hover:bg-emerald-900/40">
          <Star className={`w-3.5 h-3.5 ${userRating ? 'fill-emerald-400 text-emerald-400' : ''}`} />
          {userRating ? 'Ubah Rating' : 'Beri Rating'}
        </button>
      </div>
    </div>
  )
}

// ── MetaItem ──────────────────────────────────────────────────────────────────
const MetaItem = ({ icon: Icon, label, value, accent }) => (
  <div className={`flex items-start gap-2.5 p-2.5 rounded-xl transition-colors ${accent || 'bg-stone-50 dark:bg-slate-800/60'}`}>
    <Icon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-stone-400 dark:text-slate-500" />
    <div>
      <div className="text-[10px] uppercase tracking-wide mb-0.5 text-stone-400 dark:text-slate-500">{label}</div>
      <div className="text-xs font-medium text-stone-800 dark:text-slate-200">{value}</div>
    </div>
  </div>
)

// ── ZineDetailPage ─────────────────────────────────────────────────────────────
const ZineDetailPage = () => {
  const { zineSlug } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [zine, setZine] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [downloadLoading, setDownloadLoading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(null)
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false)
  const [userRating, setUserRating] = useState(null)
  const [ratingStats, setRatingStats] = useState(null)
  const [recentReviews, setRecentReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [coverLoaded, setCoverLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    const init = async () => {
      setLoading(true); setError(null)
      try {
        const zineData = await zineService.getZineBySlug(zineSlug)
        if (!cancelled) setZine(zineData)
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

  const fetchUserRating = async () => {
    try { const r = await zineService.getMyRating(zineSlug); setUserRating(r.data || null) }
    catch { setUserRating(null) }
  }
  const fetchRatingStats = async () => {
    try { const r = await zineService.getRatingStats(zineSlug); setRatingStats(r.data || null) }
    catch {}
  }
  const fetchRecentReviews = async () => {
    try {
      setReviewsLoading(true)
      const r = await zineService.getReviews(zineSlug, 1, 5, 'helpful')
      setRecentReviews(r.data?.list || [])
    } catch { setRecentReviews([]) }
    finally { setReviewsLoading(false) }
  }
  const fetchZineDetail = async () => {
    try { const d = await zineService.getZineBySlug(zineSlug); setZine(d) } catch {}
  }

  const handleDownload = async () => {
    if (!zine.fileUrl) return alert('File zine tidak tersedia')
    try {
      setDownloadLoading(true)
      const { downloadUrl, filename } = await zineService.getDownloadUrl(zineSlug)
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
      await fetchZineDetail(); setDownloadProgress(null)
    } catch (e) {
      console.error(e); setDownloadProgress(null); alert('❌ Gagal mengunduh zine.')
    } finally { setDownloadLoading(false) }
  }

  const handleRead = () => {
    navigate(`/zine/${zineSlug}/baca`)

    feedEvents.emit(FEED_EVENTS.ACTIVITY_CREATED, {
      activityType: 'started_reading',
      entityType:   'ZINE',
      entitySlug:   zineSlug,
      entityTitle:  zine?.title,
      entityCover:  zine?.coverImageUrl,
    })
  }
  const handleShare = async () => {
    const shareData = { title: zine.title, text: `Baca "${zine.title}"`, url: window.location.href }
    try {
      if (navigator.share) await navigator.share(shareData)
      else { await navigator.clipboard.writeText(window.location.href); alert('✅ Link disalin!') }
    } catch {}
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

  const formatBytes = (bytes) => {
    if (!bytes) return ''
    return bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  const getSourceDomain = (url) => {
    try {
      const { hostname, pathname } = new URL(url)
      const domain = hostname.replace('www.', '')
      const socialDomains = ['x.com', 'twitter.com', 'instagram.com', 'threads.com', 'facebook.com', 'tiktok.com', 'youtube.com']
      if (socialDomains.includes(domain)) {
        const username = pathname.split('/').filter(Boolean)[0]
        return username ? `${domain}/${username}` : domain
      }
      return domain
    } catch {
      return url
    }
  }

  if (loading) return <LoadingSpinner fullScreen />
  if (error || !zine) return (
    <div className="min-h-screen flex items-center justify-center">
      <Alert type="error" message={error || 'Zine tidak ditemukan'} />
    </div>
  )

  const authorNames = zine.authorNames || zine.publisher || ''
  const authorList = authorNames
    ? authorNames.split(',').map(name => ({ name: name.trim() }))
    : []

  const actionButtons = [
    { icon: Heart,  label: 'Favorit', action: () => isAuthenticated ? alert('Fitur segera hadir!') : navigate('/masuk') },
    { icon: Star,   label: zine.averageRating > 0 ? `${Number(zine.averageRating).toFixed(1)}⭐` : 'Rating', action: handleOpenRatingModal, active: !!userRating },
    { icon: Share2, label: 'Bagikan', action: handleShare },
  ]

  return (
    <>
      <SEO
        title={`${zine.title}${zine.volume ? ` Vol.${zine.volume}` : ''} — Zine Digital`}
        description={zine.description ? zine.description.slice(0, 160) : `${zine.title} oleh ${zine.authorNames}.`}
        url={`/zine/${zineSlug}`}
        type="website"
        image={zine.coverImageUrl}
      />
      <div className="min-h-screen pb-16 lg:pb-0 transition-colors duration-300 bg-stone-50 dark:bg-slate-950">
        {/* Top accent stripe */}
        <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

        <div className="container mx-auto px-4 max-w-6xl">
          {/* Breadcrumb */}
          <div className="pt-4 pb-2">
            <nav className="flex items-center gap-1.5 text-xs mb-3 text-stone-400 dark:text-slate-500">
              <Link to="/" className="transition hover:text-stone-700 dark:hover:text-slate-300">Beranda</Link>
              <span>/</span>
              <Link to="/zine" className="transition hover:text-stone-700 dark:hover:text-slate-300">Zine</Link>
              <span>/</span>
              <span className="truncate max-w-[160px] text-stone-600 dark:text-slate-400">{zine.title}</span>
            </nav>
            <button onClick={() => navigate('/zine')}
              className="inline-flex items-center gap-1.5 text-sm font-medium group transition-colors
                         text-stone-500 hover:text-stone-900 dark:text-slate-500 dark:hover:text-slate-100">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Kembali
            </button>
          </div>

          <div className="lg:grid lg:grid-cols-3 lg:gap-10 lg:items-start">
            {/* ── Sidebar ─────────────────────────────────────────── */}
            <aside className="lg:col-span-1">
              <div className="lg:sticky lg:top-24 space-y-4">

                {/* Mobile hero */}
                <div className="flex gap-4 py-4 lg:hidden">
                  <div className="flex-shrink-0 w-28 sm:w-36">
                    <div className="relative rounded-xl overflow-hidden shadow-lg aspect-[2/3] bg-stone-100 dark:bg-slate-800">
                      <img src={zine.coverImageUrl || 'https://via.placeholder.com/200x300?text=No+Cover'}
                        alt={`Cover ${zine.title}`}
                        className={`w-full h-full object-cover transition-opacity duration-500 ${coverLoaded ? 'opacity-100' : 'opacity-0'}`}
                        onLoad={() => setCoverLoaded(true)} loading="eager" />
                      {!coverLoaded && <div className="absolute inset-0 animate-pulse bg-stone-200 dark:bg-slate-700" />}
                      {zine.isFeatured && (
                        <div className="absolute top-2 left-2 z-20 flex items-center gap-0.5 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                          <Star className="w-2.5 h-2.5 fill-current" />PILIHAN
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 py-1 flex flex-col gap-1.5">
                    <h1 className="text-base sm:text-lg font-bold leading-snug line-clamp-3 text-stone-900 dark:text-slate-50">{zine.title}</h1>
                    {zine.subtitle && <p className="text-xs line-clamp-1 text-stone-500 dark:text-slate-400">{zine.subtitle}</p>}
                    <div className="flex flex-wrap gap-1">
                      {zine.volume && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold
                                         bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-700/50 dark:text-emerald-300">
                          <Layers className="w-2.5 h-2.5" />Vol.{zine.volume}
                        </span>
                      )}
                      {zine.issueNumber && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold
                                         bg-teal-50 border border-teal-200 text-teal-700 dark:bg-teal-900/20 dark:border-teal-700/50 dark:text-teal-300">
                          <Hash className="w-2.5 h-2.5" />{zine.issueNumber}
                        </span>
                      )}
                    </div>
                    {authorList.map((a, i) => (
                      <span key={i} className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{a.name}</span>
                    ))}
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-auto pt-0.5">
                      {zine.averageRating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-emerald-400 text-emerald-400" />
                          <span className="text-xs font-semibold text-stone-800 dark:text-slate-200">{Number(zine.averageRating).toFixed(1)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-stone-400 dark:text-slate-500">
                        <Eye className="w-3 h-3" /><span className="text-xs">{zine.viewCount || 0}</span>
                      </div>
                      <div className="flex items-center gap-1 text-stone-400 dark:text-slate-500">
                        <Clock className="w-3 h-3" /><span className="text-xs">{zine.estimatedReadTime}m</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop cover */}
                <div className="hidden lg:block relative rounded-2xl overflow-hidden shadow-xl aspect-[2/3]
                                bg-stone-100 dark:bg-slate-800 shadow-stone-200/80 dark:shadow-black/50">
                  <img src={zine.coverImageUrl || 'https://via.placeholder.com/400x600?text=No+Cover'}
                    alt={`Cover ${zine.title}`}
                    className={`w-full h-full object-cover transition-opacity duration-500 ${coverLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setCoverLoaded(true)} loading="eager" />
                  {!coverLoaded && <div className="absolute inset-0 animate-pulse bg-stone-200 dark:bg-slate-700" />}
                  {zine.isFeatured && (
                    <div className="absolute top-3 left-3 z-20 flex items-center gap-1 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                      <Star className="w-3 h-3 fill-current" />PILIHAN
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="space-y-2">
                  <Button fullWidth variant="primary-emerald" size="lg" onClick={handleRead}>
                    <BookOpen className="w-5 h-5 mr-2" />Baca
                  </Button>
                  <div>
                    <Button fullWidth variant="secondary"
                      onClick={handleDownload}
                      loading={downloadLoading && !downloadProgress}
                      disabled={downloadLoading || !zine.fileUrl}>
                      <Download className="w-5 h-5 mr-2" />
                      {downloadLoading
                        ? downloadProgress?.percent != null
                          ? `Mengunduh ${downloadProgress.percent}%`
                          : `Mengunduh ${formatBytes(downloadProgress?.loaded)}...`
                        : 'Unduh EPUB'}
                    </Button>
                    {downloadLoading && downloadProgress && (
                      <div className="mt-1.5 w-full h-1.5 rounded-full overflow-hidden bg-stone-200 dark:bg-slate-700">
                        {downloadProgress.percent != null
                          ? <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width:`${downloadProgress.percent}%` }} />
                          : <div className="h-full bg-emerald-500 animate-pulse w-full rounded-full" />
                        }
                      </div>
                    )}
                  </div>

                  {/* Icon buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    {actionButtons.map(({ icon: Icon, label, action, active }) => (
                      <button key={label} onClick={action}
                        className={`flex flex-col items-center gap-1 py-2.5 lg:py-3 px-1 rounded-xl border
                                    text-xs font-medium transition-all active:scale-95 hover:scale-105
                                    ${active
                                      ? 'bg-emerald-50 border-emerald-300 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-700 dark:text-emerald-400'
                                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:border-emerald-300 hover:text-emerald-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:border-emerald-600 dark:hover:text-emerald-400'
                                    }`}>
                        <Icon className={`w-4 h-4 lg:w-5 lg:h-5 ${active ? 'fill-emerald-400 text-emerald-400' : ''}`} />
                        <span className="leading-tight text-center">{label}</span>
                      </button>
                    ))}
                  </div>

                  {/* User rating pill */}
                  {userRating && (
                    <div className="flex items-center justify-between p-3 rounded-xl border
                                    bg-emerald-50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-800">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 fill-emerald-400 text-emerald-400" />
                        <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                          Rating Anda: {userRating.rating}
                        </span>
                      </div>
                      <button onClick={handleDeleteRating}
                        className="text-xs font-medium px-2 py-1 rounded-lg transition text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
                        Hapus
                      </button>
                    </div>
                  )}
                </div>

                {/* Mobile rating summary */}
                <div className="lg:hidden">
                  <RatingSummary ratingStats={ratingStats} onRate={handleOpenRatingModal} userRating={userRating} />
                </div>

                {/* Desktop sidebar meta */}
                {(zine.publisher || zine.language || zine.totalWord || zine.copyrightStatus || zine.source) && (
                  <div className="hidden lg:block p-4 rounded-2xl border space-y-3 text-sm transition-colors
                                  bg-emerald-50/60 border-emerald-200 dark:bg-slate-800/60 dark:border-slate-700">
                    {zine.publisher && (
                      <div className="flex items-start gap-2.5">
                        <Building2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-stone-400 dark:text-slate-500" />
                        <div>
                          <div className="text-[10px] uppercase tracking-wide mb-0.5 text-stone-400 dark:text-slate-500">Penerbit</div>
                          <div className="font-medium text-stone-800 dark:text-slate-200">{zine.publisher}</div>
                        </div>
                      </div>
                    )}
                    {zine.language && (
                      <div className="flex items-start gap-2.5">
                        <Globe className="w-4 h-4 flex-shrink-0 mt-0.5 text-stone-400 dark:text-slate-500" />
                        <div>
                          <div className="text-[10px] uppercase tracking-wide mb-0.5 text-stone-400 dark:text-slate-500">Bahasa</div>
                          <div className="font-medium text-stone-800 dark:text-slate-200">{zine.language}</div>
                        </div>
                      </div>
                    )}
                    {zine.totalWord && (
                      <div className="flex items-start gap-2.5">
                        <FileText className="w-4 h-4 flex-shrink-0 mt-0.5 text-stone-400 dark:text-slate-500" />
                        <div>
                          <div className="text-[10px] uppercase tracking-wide mb-0.5 text-stone-400 dark:text-slate-500">Total Kata</div>
                          <div className="font-medium text-stone-800 dark:text-slate-200">{zine.totalWord.toLocaleString()} kata</div>
                        </div>
                      </div>
                    )}
                    {zine.copyrightStatus && (
                      <div className="pt-3 border-t border-emerald-200 dark:border-slate-700">
                        <div className="text-[10px] uppercase tracking-wide mb-0.5 text-stone-400 dark:text-slate-500">Status Hak Cipta</div>
                        <div className="font-medium text-emerald-600 dark:text-emerald-400">{zine.copyrightStatus}</div>
                      </div>
                    )}
                    {zine.source && (
                      <div className="pt-3 border-t border-emerald-200 dark:border-slate-700">
                        <div className="text-[10px] uppercase tracking-wide mb-1 text-stone-400 dark:text-slate-500">Sumber</div>
                        <a href={zine.source} target="_blank" rel="noopener noreferrer"
                          className="text-sm flex items-center gap-1.5 transition-colors
                                     text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300">
                          <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                          {getSourceDomain(zine.source)}
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </aside>

            {/* ── Main content ─────────────────────────────────────── */}
            <article className="lg:col-span-2 pb-8">

              {/* Desktop title */}
              <div className="hidden lg:block mb-6">
                <div className="flex items-center gap-2 mb-3">
                  {zine.volume && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                                     bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800/60">
                      <Layers className="w-3.5 h-3.5" />Volume {zine.volume}
                    </span>
                  )}
                  {zine.issueNumber && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                                     bg-teal-100 text-teal-700 border border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800/60">
                      <Hash className="w-3.5 h-3.5" />{zine.issueNumber}
                    </span>
                  )}
                  {zine.isFeatured && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold
                                     bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800/60">
                      <Star className="w-3.5 h-3.5 mr-1 fill-current" />Pilihan Editor
                    </span>
                  )}
                </div>

                <h1 className="text-3xl xl:text-4xl font-bold leading-tight mb-2 text-stone-900 dark:text-slate-50">
                  {zine.title}
                </h1>
                {zine.subtitle && <p className="text-lg mb-4 text-stone-500 dark:text-slate-400">{zine.subtitle}</p>}

                {/* Authors */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/30">
                    <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex flex-wrap items-center gap-1">
                    {authorList.map((a, i) => (
                      <span key={i} className="text-base font-medium text-emerald-600 dark:text-emerald-400">{a.name}</span>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-5 text-sm py-3 mb-4 border-y text-stone-500 border-stone-100 dark:text-slate-400 dark:border-slate-800">
                  {zine.averageRating > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 fill-emerald-400 text-emerald-400" />
                      <span className="font-semibold text-stone-800 dark:text-slate-200">{Number(zine.averageRating).toFixed(1)}</span>
                      <span className="text-xs text-stone-400 dark:text-slate-500">({zine.totalRatings} rating)</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5"><Eye className="w-4 h-4" /><span>{zine.viewCount || 0} dilihat</span></div>
                  <div className="flex items-center gap-1.5"><Download className="w-4 h-4" /><span>{zine.downloadCount || 0} diunduh</span></div>
                  <div className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" /><span>{zine.readCount || 0} pembaca</span></div>
                  <div className="flex items-center gap-1.5"><Clock className="w-4 h-4" /><span>{zine.estimatedReadTime} menit</span></div>
                  {zine.publicationYear && <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /><span>{zine.publicationYear}</span></div>}
                </div>

                {/* Genre tags */}
                {zine.genres && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {zine.genres.split(',').map((genre, i) => {
                      const g = genre.trim()
                      return (
                        <span key={i}
                          className="px-3 py-1.5 rounded-lg text-sm font-medium border
                                     bg-emerald-50 border-emerald-200 text-emerald-700
                                     dark:bg-emerald-900/20 dark:border-emerald-700/50 dark:text-emerald-300">
                          {g}
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Desktop rating */}
              <div className="hidden lg:block mb-6">
                <RatingSummary ratingStats={ratingStats} onRate={handleOpenRatingModal} userRating={userRating} />
              </div>

              {/* Contributors */}
              {(zine.contributors || zine.source) && (
                <div className="mb-6">
                  <h3 className="text-xs font-semibold uppercase tracking-wider mb-2.5
                                 text-stone-400 dark:text-slate-500">Kontributor</h3>
                  <div className="rounded-xl p-3.5 border bg-gradient-to-r
                                  from-purple-50 to-emerald-50/40 border-purple-200
                                  dark:from-purple-900/20 dark:to-slate-900 dark:border-purple-800">
                    <div className="flex flex-wrap gap-2">
                      {zine.source && (
                        <a href={zine.source} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 rounded-lg shadow-sm border transition-colors
                                     bg-white border-purple-100 hover:border-emerald-300
                                     dark:bg-slate-800 dark:border-purple-900 dark:hover:border-emerald-700">
                          <Database className="w-3.5 h-3.5 flex-shrink-0 text-emerald-500" />
                          <div>
                            <div className="text-xs font-medium text-stone-800 dark:text-slate-200">
                              {getSourceDomain(zine.source)}
                            </div>
                            <div className="text-[10px] text-stone-400 dark:text-slate-500">Digitalisasi</div>
                          </div>
                        </a>
                      )}
                      {zine.contributors && zine.contributors.split(',').map((contributor, i) => {
                        const parts = contributor.trim().match(/(.+?)\s*\((.+?)\)/)
                        const name = parts ? parts[1].trim() : contributor.trim()
                        const role = parts ? parts[2].trim() : ''
                        return (
                          <div key={i}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg shadow-sm border
                                       bg-white border-purple-100
                                       dark:bg-slate-800 dark:border-purple-900">
                            <User className="w-3.5 h-3.5 flex-shrink-0 text-purple-500" />
                            <div>
                              <div className="text-xs font-medium text-stone-800 dark:text-slate-200">{name}</div>
                              {role && <div className="text-[10px] text-stone-400 dark:text-slate-500">{role}</div>}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              <section className="mb-8">
                <h2 className="text-xl font-bold mb-3 text-stone-900 dark:text-slate-50">Deskripsi</h2>
                <div className="whitespace-pre-line leading-relaxed text-justify text-sm sm:text-base text-stone-700 dark:text-slate-300">
                  {zine.description || 'Tidak ada deskripsi tersedia.'}
                </div>
              </section>

              {/* Detail accordion */}
              <section className="mb-6">
                <button onClick={() => setShowDetails(!showDetails)}
                  className="flex items-center justify-between w-full p-4 rounded-xl border transition-all
                             bg-stone-50 border-stone-200 hover:bg-emerald-50/60 hover:border-emerald-200
                             dark:bg-slate-800/60 dark:border-slate-700 dark:hover:bg-slate-800">
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-stone-500 dark:text-slate-400" />
                    <span className="font-semibold text-sm text-stone-800 dark:text-slate-200">Detail Zine Lengkap</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform text-stone-400 dark:text-slate-500 ${showDetails ? 'rotate-180' : ''}`} />
                </button>
                {showDetails && (
                  <div className="mt-2 p-4 rounded-xl border transition-colors bg-stone-50 border-stone-200 dark:bg-slate-800/60 dark:border-slate-700">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { label: 'Volume', val: zine.volume },
                        { label: 'Nomor Edisi', val: zine.issueNumber },
                        { label: 'Kategori', val: zine.category },
                        { label: 'Format File', val: zine.fileFormat?.toUpperCase() },
                        { label: 'Ukuran File', val: zine.fileSize ? `${(zine.fileSize / 1024 / 1024).toFixed(2)} MB` : null },
                        { label: 'Total Halaman', val: zine.totalPages ? `${zine.totalPages} bab` : null },
                        { label: 'Total Kata', val: zine.totalWord ? `${zine.totalWord.toLocaleString()} kata` : null },
                        { label: 'Estimasi Baca', val: zine.estimatedReadTime ? `${zine.estimatedReadTime} menit` : null },
                        { label: 'Bahasa', val: zine.language },
                        { label: 'Tahun Terbit', val: zine.publicationYear },
                        { label: 'Penerbit', val: zine.publisher },
                      ].filter(({ val }) => val).map(({ label, val }) => (
                        <div key={label}>
                          <div className="text-[10px] uppercase tracking-wide mb-0.5 text-stone-400 dark:text-slate-500">{label}</div>
                          <div className="text-sm font-medium text-stone-800 dark:text-slate-200">{val}</div>
                        </div>
                      ))}
                    </div>
                    {zine.copyrightStatus && (
                      <div className="pt-3 border-t border-stone-200 dark:border-slate-700 mt-3">
                        <div className="text-[10px] uppercase tracking-wide mb-0.5 text-stone-400 dark:text-slate-500">Status Hak Cipta</div>
                        <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{zine.copyrightStatus}</div>
                      </div>
                    )}
                  </div>
                )}
              </section>

              {/* Reviews */}
              <section className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-stone-900 dark:text-slate-50">Ulasan Terbaik</h2>
                  <Button variant="primary-emerald" size="sm"
                    onClick={() => navigate(isAuthenticated ? `/zine/${zineSlug}/ulasan` : '/masuk')}>
                    <MessageCircle className="w-3.5 h-3.5 mr-1" />
                    <span className="hidden sm:inline">Tulis </span>Ulasan
                  </Button>
                </div>

                {reviewsLoading ? (
                  <div className="text-center py-10"><LoadingSpinner /></div>
                ) : recentReviews.length === 0 ? (
                  <div className="rounded-2xl p-8 text-center border border-dashed transition-colors
                                  bg-stone-50 border-stone-200 dark:bg-slate-800/60 dark:border-slate-700">
                    <MessageCircle className="w-10 h-10 mx-auto mb-3 text-stone-300 dark:text-slate-600" />
                    <p className="mb-4 text-sm text-stone-500 dark:text-slate-400">Belum ada ulasan</p>
                    <Button variant="primary-emerald" size="sm"
                      onClick={() => navigate(isAuthenticated ? `/zine/${zineSlug}/ulasan` : '/masuk')}>
                      {isAuthenticated ? 'Jadilah yang Pertama' : 'Login untuk Ulasan'}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentReviews.map(review => (
                      <article key={review.id}
                        className="rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition border
                                   bg-white border-stone-100 shadow-stone-50/80 dark:bg-slate-900 dark:border-slate-700 dark:shadow-none">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 bg-emerald-50 dark:bg-emerald-900/20">
                            <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm truncate text-stone-900 dark:text-slate-100">{review.userName}</span>
                              <span className="text-xs ml-auto text-stone-400 dark:text-slate-500">
                                {new Date(review.createdAt).toLocaleDateString('id-ID', { year:'numeric', month:'short', day:'numeric' })}
                              </span>
                            </div>
                          </div>
                        </div>
                        {review.title && <h3 className="font-semibold mb-1.5 text-sm text-stone-900 dark:text-slate-100">{review.title}</h3>}
                        <p className="mb-3 line-clamp-3 text-sm leading-relaxed text-stone-600 dark:text-slate-300">{review.content}</p>
                        <div className="flex items-center gap-4 text-xs text-stone-400 dark:text-slate-500">
                          <div className="flex items-center gap-1"><ThumbsUp className="w-3.5 h-3.5" /><span>{review.helpfulCount || 0} membantu</span></div>
                          {review.replyCount > 0 && <div className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /><span>{review.replyCount} balasan</span></div>}
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              {/* ── Social Integration ── */}
              <ZineDetailSocialSection zine={zine} />

            </article>
          </div>
        </div>

        <RatingModal isOpen={isRatingModalOpen} onClose={() => setIsRatingModalOpen(false)}
          onSubmit={handleSubmitRating} zineTitle={zine.title} />
      </div>
    </>
  )
}

export default ZineDetailPage
// src/pages/BookDetailPage.jsx
// ============================================
// FIXES: CLS, LCP, INP — Core Web Vitals
//
//  CLS  → author photo slot selalu ada (tidak muncul tiba-tiba);
//          hapus mt-auto dari mobile stats row;
//          min-height pada reviews section;
//          width/height eksplisit pada cover img
//
//  LCP  → fetchPriority="high" + loading="eager" pada cover img;
//          decoding="sync" untuk gambar above-fold
//
//  INP  → useCallback pada SEMUA event handler + fetch helpers;
//          startTransition untuk akordion non-kritis;
//          useTransition di level komponen
//
// LIGHT: stone-* tokens, amber accent
// DARK:  slate-* tokens, amber accent
// ============================================

import { useState, useEffect, useRef, useCallback, useTransition } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  Book, BookOpen, Calendar, Clock, Download, Eye, Heart, Share2, Star,
  User, FileText, Globe, Building2, X, MessageCircle, ThumbsUp,
  ArrowLeft, Pencil, ChevronDown, Database
} from 'lucide-react'
import bookService from '../services/bookService'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from '../components/Common/LoadingSpinner'
import Button from '../components/Common/Button'
import Alert from '../components/Common/Alert'
import SEO from '../components/Common/SEO'
import {
  generateBookStructuredData,
  generateBreadcrumbStructuredData,
  generateReviewStructuredData,
  generateMetaDescription,
  generateKeywords
} from '../utils/seoHelpers'
import BookDetailSocialSection from '../components/Social/BookDetailSocialSection'
import feedEvents, { FEED_EVENTS } from '../services/feedEvents'

// ── RatingModal ───────────────────────────────────────────────────────────────
const RatingModal = ({ isOpen, onClose, onSubmit, bookTitle }) => {
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

  const ratingLabels = {
    0.5: '⭐ 0.5 - Sangat Buruk', 1:   '⭐ 1.0 - Sangat Buruk',
    1.5: '⭐ 1.5 - Buruk',        2:   '⭐⭐ 2.0 - Buruk',
    2.5: '⭐⭐ 2.5 - Kurang',     3:   '⭐⭐⭐ 3.0 - Cukup',
    3.5: '⭐⭐⭐ 3.5 - Lumayan',  4:   '⭐⭐⭐⭐ 4.0 - Bagus',
    4.5: '⭐⭐⭐⭐ 4.5 - Sangat Bagus', 5: '⭐⭐⭐⭐⭐ 5.0 - Sempurna'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="rounded-2xl shadow-2xl max-w-md w-full transition-colors
                      bg-white dark:bg-slate-900
                      border border-stone-200 dark:border-slate-700">
        <div className="flex items-center justify-between p-6 border-b
                        border-stone-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-stone-900 dark:text-slate-50">Beri Rating</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-all
                       text-stone-400 hover:text-stone-700 hover:bg-stone-100
                       dark:text-slate-500 dark:hover:text-slate-200 dark:hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <p className="text-sm mb-1 text-stone-500 dark:text-slate-400">Buku</p>
            <p className="font-semibold leading-snug text-stone-900 dark:text-slate-100">{bookTitle}</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-4 text-stone-700 dark:text-slate-300">
              Rating Bintang <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-1 items-center justify-center">
              {[1, 2, 3, 4, 5].map(star => {
                const isHalf = (hoverRating || rating) === star - 0.5
                const isFull = (hoverRating || rating) >= star
                return (
                  <div key={star} className="relative cursor-pointer group">
                    <Star className={`w-12 h-12 transition-all ${
                      isFull
                        ? 'fill-amber-400 text-amber-400 scale-110'
                        : 'fill-stone-200 text-stone-300 dark:fill-slate-700 dark:text-slate-600'
                    } group-hover:scale-110`} />
                    {isHalf && !isFull && (
                      <Star
                        className="w-12 h-12 absolute top-0 left-0 fill-amber-400 text-amber-400"
                        style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' }}
                      />
                    )}
                    <div className="absolute inset-0 flex">
                      <button
                        type="button"
                        className="w-1/2 h-full"
                        onClick={() => setRating(star - 0.5)}
                        onMouseEnter={() => setHoverRating(star - 0.5)}
                        onMouseLeave={() => setHoverRating(0)}
                      />
                      <button
                        type="button"
                        className="w-1/2 h-full"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
            {rating > 0 && (
              <p className="text-sm text-center mt-3 font-medium text-amber-600 dark:text-amber-400">
                {ratingLabels[rating]}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="secondary" fullWidth onClick={onClose} disabled={submitting}>
              Batal
            </Button>
            <Button type="submit" variant="primary" fullWidth loading={submitting}
              disabled={submitting || rating === 0}>
              {submitting ? 'Mengirim...' : 'Kirim Rating'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── StatPill ──────────────────────────────────────────────────────────────────
const StatPill = ({ icon: Icon, value, label }) => (
  <div className="flex flex-col items-center gap-0.5 min-w-0">
    <div className="flex items-center gap-1 text-stone-700 dark:text-slate-200">
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      <span className="text-sm font-semibold tabular-nums">{value}</span>
    </div>
    {label && <span className="text-[10px] whitespace-nowrap text-stone-400 dark:text-slate-500">{label}</span>}
  </div>
)

// ── RatingSummary ─────────────────────────────────────────────────────────────
const RatingSummary = ({ ratingStats, onRate, userRating }) => {
  if (!ratingStats || ratingStats.totalRatings === 0) {
    return (
      <div className="flex items-center gap-4 p-4 rounded-2xl border border-dashed transition-colors
                      bg-stone-50 border-stone-200
                      dark:bg-slate-800/60 dark:border-slate-700">
        <div className="text-center">
          <div className="text-4xl font-bold text-stone-200 dark:text-slate-700">—</div>
          <div className="flex gap-0.5 mt-1 justify-center">
            {[1, 2, 3, 4, 5].map(s => (
              <Star key={s} className="w-4 h-4 text-stone-200 dark:text-slate-700" />
            ))}
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm mb-2 text-stone-500 dark:text-slate-400">Belum ada rating</p>
          <button
            onClick={onRate}
            className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors
                       text-amber-600 hover:text-amber-700
                       dark:text-amber-400 dark:hover:text-amber-300">
            <Star className="w-4 h-4" />
            {userRating ? `Rating Anda: ${userRating.rating} ⭐` : 'Beri rating pertama'}
          </button>
        </div>
      </div>
    )
  }

  const avg   = ratingStats.averageRating
  const total = ratingStats.totalRatings
  const filledStars   = Math.floor(avg)
  const hasHalf       = avg - filledStars >= 0.25 && avg - filledStars < 0.75
  const hasAlmostFull = avg - filledStars >= 0.75
  const ratingLabel   = avg >= 4.5 ? 'Luar Biasa' : avg >= 4 ? 'Sangat Bagus'
    : avg >= 3.5 ? 'Bagus' : avg >= 3 ? 'Cukup' : avg >= 2 ? 'Kurang' : 'Buruk'

  const bars = [
    { label: '5', count: (ratingStats.rating50Count || 0) },
    { label: '4', count: (ratingStats.rating45Count || 0) + (ratingStats.rating40Count || 0) },
    { label: '3', count: (ratingStats.rating35Count || 0) + (ratingStats.rating30Count || 0) },
    { label: '2', count: (ratingStats.rating25Count || 0) + (ratingStats.rating20Count || 0) },
    { label: '1', count: (ratingStats.rating15Count || 0) + (ratingStats.rating10Count || 0) + (ratingStats.rating05Count || 0) },
  ]

  return (
    <div className="p-4 sm:p-5 rounded-2xl border shadow-sm transition-colors
                    bg-white border-stone-200 shadow-stone-100/80
                    dark:bg-slate-900 dark:border-slate-700 dark:shadow-none">
      <div className="flex gap-5 sm:gap-6">
        <div className="flex flex-col items-center justify-center flex-shrink-0 min-w-[80px]">
          <div className="text-5xl sm:text-6xl font-extrabold tabular-nums leading-none mb-1
                          text-stone-900 dark:text-slate-50">
            {avg.toFixed(1)}
          </div>
          <div className="flex gap-0.5 mb-1">
            {[1, 2, 3, 4, 5].map(s => {
              const isFull = s <= filledStars || (s === filledStars + 1 && hasAlmostFull)
              const isHalf = s === filledStars + 1 && hasHalf
              return (
                <span key={s} className="relative inline-block">
                  <Star className="w-4 h-4 text-stone-200 dark:text-slate-600" />
                  {(isFull || isHalf) && (
                    <Star
                      className="w-4 h-4 absolute inset-0 fill-amber-400 text-amber-400"
                      style={isHalf ? { clipPath: 'polygon(0 0,50% 0,50% 100%,0 100%)' } : {}}
                    />
                  )}
                </span>
              )
            })}
          </div>
          <div className="text-xs font-semibold text-amber-600 dark:text-amber-400">{ratingLabel}</div>
          <div className="text-[10px] mt-0.5 text-stone-400 dark:text-slate-500">{total} rating</div>
        </div>

        <div className="flex-1 min-w-0 space-y-1.5 flex flex-col justify-center">
          {bars.map(({ label, count }) => {
            const pct = total > 0 ? (count / total) * 100 : 0
            return (
              <div key={label} className="flex items-center gap-2">
                <div className="flex items-center gap-0.5 w-10 justify-end flex-shrink-0">
                  <span className="text-xs font-medium text-stone-500 dark:text-slate-400">{label}</span>
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                </div>
                <div className="flex-1 h-2 rounded-full overflow-hidden bg-stone-100 dark:bg-slate-700">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[10px] w-6 text-right flex-shrink-0 text-stone-400 dark:text-slate-500">
                  {count}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t flex items-center justify-between flex-wrap gap-2
                      border-stone-100 dark:border-slate-700">
        {userRating ? (
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-sm text-stone-600 dark:text-slate-400">
              Rating Anda:{' '}
              <span className="font-semibold text-stone-900 dark:text-slate-100">{userRating.rating} ⭐</span>
            </span>
          </div>
        ) : (
          <span className="text-sm text-stone-500 dark:text-slate-400">Sudah baca? Beri rating kamu</span>
        )}
        <button
          onClick={onRate}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all active:scale-95
                     bg-amber-50 text-amber-700 hover:bg-amber-100
                     dark:bg-amber-900/20 dark:text-amber-300 dark:hover:bg-amber-900/40">
          <Star className={`w-3.5 h-3.5 ${userRating ? 'fill-amber-400 text-amber-400' : ''}`} />
          {userRating ? 'Ubah Rating' : 'Beri Rating'}
        </button>
      </div>
    </div>
  )
}

// ── BookDetailPage ─────────────────────────────────────────────────────────────
const BookDetailPage = () => {
  const { bookSlug }        = useParams()
  const navigate            = useNavigate()
  const { isAuthenticated } = useAuth()

  const [book,             setBook]             = useState(null)
  const [loading,          setLoading]          = useState(true)
  const [downloadLoading,  setDownloadLoading]  = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(null)
  const [readingLoading,   setReadingLoading]   = useState(false)
  const [error,            setError]            = useState(null)
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false)
  const [userRating,       setUserRating]       = useState(null)
  const [ratingStats,      setRatingStats]      = useState(null)
  const [recentReviews,    setRecentReviews]    = useState([])
  const [reviewsLoading,   setReviewsLoading]   = useState(false)
  const [showBookDetails,  setShowBookDetails]  = useState(false)
  const [authorPhotos,     setAuthorPhotos]     = useState({})
  const [coverLoaded,      setCoverLoaded]      = useState(false)

  // FIX INP: startTransition untuk update akordion & update non-kritis
  const [, startTransition] = useTransition()

  const backUrl = useRef(sessionStorage.getItem('booksPageUrl') || '/buku')

  // ── Fetch helpers (useCallback agar tidak dibuat ulang) ──────────────────
  const fetchUserRating = useCallback(async () => {
    try {
      const r = await bookService.getMyRating(bookSlug)
      setUserRating(r.data || null)
    } catch { setUserRating(null) }
  }, [bookSlug])

  const fetchRatingStats = useCallback(async () => {
    try {
      const r = await bookService.getRatingStats(bookSlug)
      setRatingStats(r.data || null)
    } catch {}
  }, [bookSlug])

  const fetchRecentReviews = useCallback(async () => {
    try {
      setReviewsLoading(true)
      const r = await bookService.getReviews(bookSlug, 1, 5, 'helpful')
      setRecentReviews(r.data?.list || [])
    } catch { setRecentReviews([]) }
    finally { setReviewsLoading(false) }
  }, [bookSlug])

  const fetchBookDetail = useCallback(async () => {
    try {
      const d = await bookService.getBookBySlug(bookSlug)
      setBook(d)
    } catch {}
  }, [bookSlug])

  const fetchAuthorPhotos = useCallback(async (authorSlugs) => {
    const slugs = authorSlugs.split(',').map(s => s.trim())
    const photos = {}
    try {
      const res = await bookService.getAuthors(1, 1000)
      slugs.forEach(slug => {
        const found = res.data?.list?.find(a => a.slug === slug)
        if (found?.photoUrl) photos[slug] = found.photoUrl
      })
    } catch {}
    // FIX INP: startTransition agar update foto penulis tidak blok interaksi
    startTransition(() => { setAuthorPhotos(photos) })
  }, []) // eslint-disable-line

  // ── Init ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    const init = async () => {
      setLoading(true); setError(null)
      // reset foto penulis setiap slug buku berubah
      setAuthorPhotos({})
      try {
        const bookData = await bookService.getBookBySlug(bookSlug)
        if (!cancelled) setBook(bookData)
      } catch {
        if (!cancelled) setError('Buku tidak ditemukan')
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
  }, [bookSlug, isAuthenticated, fetchRatingStats, fetchRecentReviews, fetchUserRating])

  useEffect(() => {
    if (book) document.title = `${book.title} - ${book.authorNames} | Perpustakaan Digital`
  }, [book])

  useEffect(() => {
    if (book?.authorSlugs) fetchAuthorPhotos(book.authorSlugs)
  }, [book, fetchAuthorPhotos])

  // ── Event handlers (semua useCallback agar stabil antar render) ──────────
  const handleRead = useCallback(async () => {
    try {
      setReadingLoading(true)
      navigate(`/buku/${bookSlug}/baca`)

      feedEvents.emit(FEED_EVENTS.ACTIVITY_CREATED, {
        activityType: 'started_reading',
        entityType:   'BOOK',
        entitySlug:   bookSlug,
        entityTitle:  book?.title,
        entityCover:  book?.coverImageUrl,
      })
    } catch (e) { alert(`Gagal: ${e.message}`) }
    finally { setReadingLoading(false) }
  }, [bookSlug, book, navigate])

  const handleStartReading = useCallback(async () => {
    try {
      setReadingLoading(true)
      const last = localStorage.getItem(`lastChapter_${bookSlug}`)
      navigate(last ? `/buku/${bookSlug}/${last}` : `/buku/${bookSlug}/daftar-isi`)
    } catch (e) { alert(`Gagal: ${e.message}`) }
    finally { setReadingLoading(false) }
  }, [bookSlug, navigate])

  const handleDownload = useCallback(async () => {
    if (!book?.fileUrl) return alert('File buku tidak tersedia')
    try {
      setDownloadLoading(true)
      const { downloadUrl, filename } = await bookService.getDownloadUrl(bookSlug)
      setDownloadProgress({ percent: 0, loaded: 0, total: null })
      const response = await fetch(downloadUrl)
      if (!response.ok) throw new Error('Gagal mengunduh file')
      const total = response.headers.get('Content-Length')
        ? parseInt(response.headers.get('Content-Length'))
        : null
      const reader = response.body.getReader()
      const chunks = []; let loaded = 0
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(value); loaded += value.length
        setDownloadProgress({
          loaded, total,
          percent: total ? Math.round((loaded / total) * 100) : null
        })
      }
      const blob = new Blob(chunks, { type: 'application/epub+zip' })
      const url  = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url; link.download = filename
      document.body.appendChild(link); link.click()
      document.body.removeChild(link); window.URL.revokeObjectURL(url)
      await fetchBookDetail(); setDownloadProgress(null)
    } catch (e) {
      console.error(e); setDownloadProgress(null); alert('❌ Gagal mengunduh buku.')
    } finally { setDownloadLoading(false) }
  }, [book, bookSlug, fetchBookDetail])

  const handleShare = useCallback(async () => {
    const shareData = {
      title: book?.title,
      text:  `Baca "${book?.title}" oleh ${book?.authorNames}`,
      url:   window.location.href
    }
    try {
      if (navigator.share) await navigator.share(shareData)
      else { await navigator.clipboard.writeText(window.location.href); alert('✅ Link disalin!') }
    } catch {}
  }, [book])

  const handleAddToFavorite = useCallback(() => {
    if (!isAuthenticated) return navigate('/masuk')
    alert('Fitur favorite segera hadir!')
  }, [isAuthenticated, navigate])

  const handleOpenRatingModal = useCallback(() => {
    if (!isAuthenticated) { alert('Silakan login terlebih dahulu'); return navigate('/masuk') }
    setIsRatingModalOpen(true)
  }, [isAuthenticated, navigate])

  const handleCloseRatingModal = useCallback(() => setIsRatingModalOpen(false), [])

  const handleDeleteRating = useCallback(async () => {
    if (!confirm('Hapus rating Anda?')) return
    try {
      await bookService.deleteRating(bookSlug)
      alert('✅ Rating dihapus!'); setUserRating(null)
      fetchBookDetail(); fetchRatingStats()
    } catch { alert('❌ Gagal menghapus rating') }
  }, [bookSlug, fetchBookDetail, fetchRatingStats])

  const handleSubmitRating = useCallback(async (ratingData) => {
    try {
      await bookService.addRating(bookSlug, { rating: ratingData.rating })
      alert('✅ Rating ditambahkan!')
      setIsRatingModalOpen(false)
      fetchBookDetail(); fetchUserRating(); fetchRatingStats()

      feedEvents.emit(FEED_EVENTS.ACTIVITY_CREATED, {
        activityType: 'reviewed',
        entityType:   'BOOK',
        entitySlug:   bookSlug,
        entityTitle:  book?.title,
        entityCover:  book?.coverImageUrl,
      })
    } catch (e) { alert(`❌ Gagal: ${e.response?.data?.detail || e.message}`) }
  }, [bookSlug, book, fetchBookDetail, fetchUserRating, fetchRatingStats])

  // FIX INP: akordion pakai startTransition — tidak perlu blok frame interaksi
  const handleToggleBookDetails = useCallback(() => {
    startTransition(() => {
      setShowBookDetails(prev => !prev)
    })
  }, []) // eslint-disable-line

  const handleNavigateToc     = useCallback(() => navigate(`/buku/${bookSlug}/daftar-isi`), [bookSlug, navigate])
  const handleNavigateReviews = useCallback(() => navigate(isAuthenticated ? `/buku/${bookSlug}/ulasan` : '/masuk'), [bookSlug, isAuthenticated, navigate])
  const handleNavigateAllReviews = useCallback(() => navigate(`/buku/${bookSlug}/ulasan`), [bookSlug, navigate])

  // ── Helpers ──────────────────────────────────────────────────────────────
  const getSourceDomain = useCallback((url) => {
    try {
      const { hostname, pathname } = new URL(url)
      const domain = hostname.replace('www.', '')
      const socialDomains = ['x.com', 'twitter.com', 'instagram.com', 'threads.com', 'facebook.com', 'tiktok.com', 'youtube.com']
      if (socialDomains.includes(domain)) {
        const username = pathname.split('/').filter(Boolean)[0]
        return username ? `${domain}/${username}` : domain
      }
      return domain
    } catch { return url }
  }, [])

  const formatBytes = useCallback((bytes) => {
    if (!bytes) return ''
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }, [])

  const handleCoverLoad = useCallback(() => setCoverLoaded(true), [])

  // ── Early returns ────────────────────────────────────────────────────────
  if (loading) return <LoadingSpinner fullScreen />
  if (error || !book) return (
    <div className="min-h-screen flex items-center justify-center">
      <Alert type="error" message={error || 'Buku tidak ditemukan'} />
    </div>
  )

  // ── Derived data ─────────────────────────────────────────────────────────
  const breadcrumbs = [
    { name: 'Beranda',      url: '/' },
    { name: 'Koleksi Buku', url: '/buku' },
    { name: book.title,     url: '#' }
  ]
  const bookSchema       = generateBookStructuredData(book)
  const breadcrumbSchema = generateBreadcrumbStructuredData(breadcrumbs)
  const reviewSchema     = recentReviews.length > 0 ? generateReviewStructuredData(recentReviews, book) : null
  const metaDescription  = generateMetaDescription(book.description || `${book.title} oleh ${book.authorNames}.`, 160)
  const keywords         = generateKeywords(book.genres, book.authorNames, book.title)
  const structuredData   = reviewSchema
    ? [bookSchema, breadcrumbSchema, reviewSchema]
    : [bookSchema, breadcrumbSchema]

  const authorList = book.authorNames
    ? book.authorNames.split(',').map((name, i) => ({
        name:     name.trim(),
        slug:     name.trim().toLowerCase()
          .replace(/\.\s*/g, '-').replace(/\s+/g, '-')
          .replace(/-+/g, '-').replace(/^-|-$/g, ''),
        // FIX CLS: baca dari authorPhotos state; null awalnya, terisi setelah fetch
        photoUrl: book.authorSlugs
          ? authorPhotos[book.authorSlugs.split(',')[i]?.trim()]
          : null
      }))
    : []

  const actionButtons = [
    { icon: Book,   label: 'Daftar Isi', action: handleNavigateToc },
    { icon: Heart,  label: 'Favorit',    action: handleAddToFavorite },
    {
      icon:   Star,
      label:  book.averageRating > 0 ? `${book.averageRating.toFixed(1)}⭐` : 'Rating',
      action: handleOpenRatingModal,
      active: !!userRating
    },
    { icon: Share2, label: 'Bagikan', action: handleShare },
  ]

  const MetaItem = ({ icon: Icon, label, value, accent }) => (
    <div className={`flex items-start gap-2.5 p-2.5 rounded-xl transition-colors ${accent || 'bg-stone-50 dark:bg-slate-800/60'}`}>
      <Icon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-stone-400 dark:text-slate-500" />
      <div>
        <div className="text-[10px] uppercase tracking-wide mb-0.5 text-stone-400 dark:text-slate-500">{label}</div>
        <div className="text-xs font-medium text-stone-800 dark:text-slate-200">{value}</div>
      </div>
    </div>
  )

  // ─────────────────────────────────────────────────────────────────────────
  // FIX CLS: AuthorAvatars — slot SELALU ada, foto mengisi setelah load
  // ─────────────────────────────────────────────────────────────────────────
  const AuthorAvatars = () => (
    <div className="flex -space-x-2">
      {authorList.length > 0
        ? authorList.map((a, i) => (
            <div
              key={i}
              className="w-9 h-9 rounded-full flex-shrink-0 overflow-hidden border-2
                         border-white dark:border-slate-900">
              {a.photoUrl
                ? <img
                    src={a.photoUrl}
                    alt={a.name}
                    width={36}
                    height={36}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                : <div className="w-full h-full flex items-center justify-center
                                  bg-amber-100 dark:bg-amber-900/30">
                    <User className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
              }
            </div>
          ))
        : (
          <div className="w-9 h-9 rounded-full flex items-center justify-center
                          bg-amber-100 dark:bg-amber-900/30">
            <User className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
        )
      }
    </div>
  )

  return (
    <>
      <SEO
        title={`${book.title} - ${book.authorNames}`}
        description={metaDescription}
        url={`/buku/${bookSlug}`}
        type="book"
        image={book.coverImageUrl}
        keywords={keywords}
        author={book.authorNames}
        publishedTime={book.publishedAt}
        modifiedTime={book.updatedAt}
        structuredData={structuredData}
        ogType="book"
      />

      <div className="min-h-screen pb-16 lg:pb-0 transition-colors duration-300
                      bg-stone-50 dark:bg-slate-950">
        <div className="container mx-auto px-4 max-w-6xl">

          {/* ── Breadcrumb ───────────────────────────────────────── */}
          <div className="pt-4 pb-2">
            <nav
              className="flex items-center gap-1.5 text-xs mb-3 overflow-x-auto scrollbar-none
                         text-stone-400 dark:text-slate-500"
              aria-label="Breadcrumb">
              <Link to="/" className="transition hover:text-stone-700 dark:hover:text-slate-300 whitespace-nowrap">
                Beranda
              </Link>
              <span>/</span>
              <Link
                to={backUrl.current}
                className="transition hover:text-stone-700 dark:hover:text-slate-300 whitespace-nowrap">
                Koleksi Buku
              </Link>
              <span>/</span>
              <span className="truncate max-w-[160px] text-stone-600 dark:text-slate-400">{book.title}</span>
            </nav>
            <button
              onClick={() => navigate(backUrl.current)}
              className="inline-flex items-center gap-1.5 text-sm font-medium group transition-colors
                         text-stone-500 hover:text-stone-900
                         dark:text-slate-500 dark:hover:text-slate-100">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Kembali
            </button>
          </div>

          {/* ═══ MAIN LAYOUT GRID ═══════════════════════════════════ */}
          <div className="lg:grid lg:grid-cols-3 lg:gap-10 lg:items-start">

            {/* ── SIDEBAR ─────────────────────────────────────────── */}
            <aside className="lg:col-span-1">
              <div className="lg:sticky lg:top-24 space-y-4">

                {/* ── Mobile: horizontal hero ──────────────────────── */}
                <div className="flex gap-4 py-4 lg:hidden">

                  {/* Cover — FIX CLS: eksplisit w/h; FIX LCP: eager + fetchPriority */}
                  <div className="flex-shrink-0 w-28 sm:w-36">
                    <div className="relative rounded-xl overflow-hidden shadow-lg aspect-[2/3]
                                    bg-stone-100 dark:bg-slate-800">
                      <img
                        src={book.coverImageUrl || 'https://via.placeholder.com/200x300?text=No+Cover'}
                        alt={`Cover ${book.title}`}
                        loading="eager"
                        fetchPriority="high"
                        decoding="sync"
                        width={200}
                        height={300}
                        className={`w-full h-full object-cover transition-opacity duration-500
                                    ${coverLoaded ? 'opacity-100' : 'opacity-0'}`}
                        onLoad={handleCoverLoad}
                      />
                      {!coverLoaded && (
                        <div className="absolute inset-0 animate-pulse bg-stone-200 dark:bg-slate-700" />
                      )}
                      {book.isFeatured && (
                        <div className="absolute top-1.5 left-1.5 flex items-center gap-0.5
                                        bg-amber-400 text-stone-900 text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                          <Star className="w-2.5 h-2.5 fill-current" />PILIHAN
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info kolom kanan */}
                  <div className="flex-1 min-w-0 py-1 flex flex-col gap-1.5">
                    <h1 className="text-base sm:text-lg font-bold leading-snug line-clamp-3
                                   text-stone-900 dark:text-slate-50">
                      {book.title}
                    </h1>
                    {book.subtitle && (
                      <p className="text-xs line-clamp-1 text-stone-500 dark:text-slate-400">{book.subtitle}</p>
                    )}

                    {/* Penulis */}
                    <div className="flex flex-wrap gap-x-1 gap-y-0.5">
                      {authorList.map((author, i) => (
                        <span key={i} className="inline-flex items-center">
                          <Link
                            to={`/penulis/${author.slug}`}
                            className="text-xs font-medium hover:underline text-amber-600 dark:text-amber-400">
                            {author.name}
                          </Link>
                          {i < authorList.length - 1 && (
                            <span className="text-xs text-stone-400">,</span>
                          )}
                        </span>
                      ))}
                    </div>

                    {/* Genre */}
                    {book.genres && (
                      <div className="flex flex-wrap gap-1.5">
                        {book.genres.split(',').map((genre, i) => {
                          const g    = genre.trim()
                          const slug = g.toLowerCase().replace(/\s*&\s*/g, '-').replace(/\s+/g, '-')
                          return (
                            <Link
                              key={i}
                              to={`/kategori/${slug}`}
                              className="px-2 py-0.5 rounded-full text-[10px] font-medium transition whitespace-nowrap border
                                         bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100
                                         dark:bg-blue-900/20 dark:border-blue-700/50 dark:text-blue-300 dark:hover:bg-blue-900/40">
                              {g}
                            </Link>
                          )
                        })}
                      </div>
                    )}

                    {/* Stats row — FIX CLS: mt-2 eksplisit, bukan mt-auto */}
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                      {book.averageRating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-semibold text-stone-800 dark:text-slate-200">
                            {book.averageRating.toFixed(1)}
                          </span>
                          <span className="text-[10px] text-stone-400 dark:text-slate-500">
                            ({book.totalRatings})
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-stone-400 dark:text-slate-500">
                        <Eye className="w-3 h-3" />
                        <span className="text-xs">{book.viewCount || 0}</span>
                      </div>
                      <div className="flex items-center gap-1 text-stone-400 dark:text-slate-500">
                        <Download className="w-3 h-3" />
                        <span className="text-xs">{book.downloadCount || 0}</span>
                      </div>
                      <div className="flex items-center gap-1 text-stone-400 dark:text-slate-500">
                        <BookOpen className="w-3 h-3" />
                        <span className="text-xs">{book.readCount || 0}</span>
                      </div>
                      <div className="flex items-center gap-1 text-stone-400 dark:text-slate-500">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs">{book.estimatedReadTime}m</span>
                      </div>
                      {book.publicationYear && (
                        <div className="flex items-center gap-1 text-stone-400 dark:text-slate-500">
                          <Calendar className="w-3 h-3" />
                          <span className="text-xs">{book.publicationYear}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Desktop: large cover */}
                <div className="hidden lg:block relative rounded-2xl overflow-hidden shadow-xl aspect-[2/3]
                                bg-stone-100 dark:bg-slate-800
                                shadow-stone-200/80 dark:shadow-black/50">
                  <img
                    src={book.coverImageUrl || 'https://via.placeholder.com/400x600?text=No+Cover'}
                    alt={`Cover buku ${book.title}`}
                    loading="eager"
                    fetchPriority="high"
                    decoding="sync"
                    width={400}
                    height={600}
                    className={`w-full h-full object-cover transition-opacity duration-500
                                ${coverLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={handleCoverLoad}
                  />
                  {!coverLoaded && (
                    <div className="absolute inset-0 animate-pulse bg-stone-200 dark:bg-slate-700" />
                  )}
                  {book.isFeatured && (
                    <div className="absolute top-3 left-3 flex items-center gap-1
                                    bg-amber-400 text-stone-900 text-xs font-bold px-2 py-1 rounded-lg">
                      <Star className="w-3 h-3 fill-current" />PILIHAN
                    </div>
                  )}
                </div>

                {/* ── Action buttons ── */}
                <div className="space-y-2">
                  <Button fullWidth variant="primary" size="lg"
                    onClick={handleRead} loading={readingLoading} disabled={readingLoading}>
                    <BookOpen className="w-5 h-5 mr-2" />Baca
                  </Button>
                  <Button fullWidth variant="outline"
                    onClick={handleStartReading} loading={readingLoading} disabled={readingLoading}>
                    <Pencil className="w-5 h-5 mr-2" />Koreksi Teks
                  </Button>
                  <div>
                    <Button
                      fullWidth
                      variant="secondary"
                      onClick={handleDownload}
                      loading={downloadLoading && !downloadProgress}
                      disabled={downloadLoading || !book.fileUrl}>
                      <Download className="w-5 h-5 mr-2" />
                      {downloadLoading
                        ? downloadProgress?.percent != null
                          ? `Mengunduh ${downloadProgress.percent}%`
                          : `Mengunduh ${formatBytes(downloadProgress?.loaded)}...`
                        : 'Unduh EPUB'
                      }
                    </Button>
                    {downloadLoading && downloadProgress && (
                      <div className="mt-1.5 w-full h-1.5 rounded-full overflow-hidden
                                      bg-stone-200 dark:bg-slate-700">
                        {downloadProgress.percent != null
                          ? <div
                              className="h-full bg-amber-500 rounded-full transition-all duration-300"
                              style={{ width: `${downloadProgress.percent}%` }}
                            />
                          : <div className="h-full bg-amber-500 animate-pulse w-full rounded-full" />
                        }
                      </div>
                    )}
                  </div>

                  {/* Icon grid buttons */}
                  <div className="grid grid-cols-4 gap-2">
                    {actionButtons.map(({ icon: Icon, label, action, active }) => (
                      <button
                        key={label}
                        onClick={action}
                        className={`flex flex-col items-center gap-1 py-2.5 lg:py-3 px-1 rounded-xl border
                                    text-xs font-medium transition-all active:scale-95 hover:scale-105
                                    ${active
                                      ? `bg-amber-50 border-amber-300 text-amber-600
                                         dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-400`
                                      : `bg-stone-50 border-stone-200 text-stone-600
                                         hover:border-amber-300 hover:text-amber-600
                                         dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400
                                         dark:hover:border-amber-600 dark:hover:text-amber-400`
                                    }`}>
                        <Icon className={`w-4 h-4 lg:w-5 lg:h-5 ${active ? 'fill-amber-400 text-amber-400' : ''}`} />
                        <span className="leading-tight text-center">{label}</span>
                      </button>
                    ))}
                  </div>

                  {/* User rating pill */}
                  {userRating && (
                    <div className="flex items-center justify-between p-3 rounded-xl border
                                    bg-amber-50 border-amber-200
                                    dark:bg-amber-900/10 dark:border-amber-800">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                          Rating Anda: {userRating.rating}
                        </span>
                      </div>
                      <button
                        onClick={handleDeleteRating}
                        className="text-xs font-medium px-2 py-1 rounded-lg transition
                                   text-red-500 hover:text-red-700 hover:bg-red-50
                                   dark:hover:bg-red-900/20">
                        Hapus
                      </button>
                    </div>
                  )}
                </div>

                {/* Mobile Rating Summary */}
                <div className="lg:hidden">
                  <RatingSummary ratingStats={ratingStats} onRate={handleOpenRatingModal} userRating={userRating} />
                </div>

                {/* Mobile meta pills */}
                {(book.publisher || book.language || book.totalWord || book.copyrightStatus) && (
                  <div className="lg:hidden grid grid-cols-2 gap-2">
                    {book.language && (
                      <MetaItem icon={Globe} label="Bahasa" value={book.language} />
                    )}
                    {book.publisher && (
                      <MetaItem icon={Building2} label="Penerbit" value={book.publisher} />
                    )}
                    {book.totalWord && (
                      <MetaItem icon={FileText} label="Total Kata" value={book.totalWord.toLocaleString()} />
                    )}
                    {book.copyrightStatus && (
                      <MetaItem icon={FileText} label="Hak Cipta" value={book.copyrightStatus}
                        accent="bg-amber-50/60 dark:bg-amber-900/10" />
                    )}
                  </div>
                )}

                {/* Desktop sidebar meta panel */}
                {(book.publisher || book.language || book.totalWord || book.updatedAt ||
                  book.createdAt || book.copyrightStatus || book.source) && (
                  <div className="hidden lg:block p-4 rounded-2xl border space-y-3 text-sm transition-colors
                                  bg-amber-50/60 border-amber-200
                                  dark:bg-slate-800/60 dark:border-slate-700">
                    {book.publisher && (
                      <div className="flex items-start gap-2.5">
                        <Building2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-stone-400 dark:text-slate-500" />
                        <div>
                          <div className="text-[10px] uppercase tracking-wide mb-0.5 text-stone-400 dark:text-slate-500">
                            Diterbitkan Ulang Oleh
                          </div>
                          <div className="font-medium text-stone-800 dark:text-slate-200">{book.publisher}</div>
                        </div>
                      </div>
                    )}
                    {book.language && (
                      <div className="flex items-start gap-2.5">
                        <Globe className="w-4 h-4 flex-shrink-0 mt-0.5 text-stone-400 dark:text-slate-500" />
                        <div>
                          <div className="text-[10px] uppercase tracking-wide mb-0.5 text-stone-400 dark:text-slate-500">Bahasa</div>
                          <div className="font-medium text-stone-800 dark:text-slate-200">{book.language}</div>
                        </div>
                      </div>
                    )}
                    {book.totalWord && (
                      <div className="flex items-start gap-2.5">
                        <FileText className="w-4 h-4 flex-shrink-0 mt-0.5 text-stone-400 dark:text-slate-500" />
                        <div>
                          <div className="text-[10px] uppercase tracking-wide mb-0.5 text-stone-400 dark:text-slate-500">Total Kata</div>
                          <div className="font-medium text-stone-800 dark:text-slate-200">
                            {book.totalWord.toLocaleString()} kata
                          </div>
                        </div>
                      </div>
                    )}
                    {book.updatedAt && (
                      <div className="flex items-start gap-2.5">
                        <Calendar className="w-4 h-4 flex-shrink-0 mt-0.5 text-stone-400 dark:text-slate-500" />
                        <div>
                          <div className="text-[10px] uppercase tracking-wide mb-0.5 text-stone-400 dark:text-slate-500">Diperbarui</div>
                          <div className="font-medium text-stone-800 dark:text-slate-200">
                            {new Date(book.updatedAt).toLocaleDateString('id-ID',
                              { year: 'numeric', month: 'long', day: 'numeric' })}
                          </div>
                        </div>
                      </div>
                    )}
                    {book.createdAt && (
                      <div className="flex items-start gap-2.5">
                        <Clock className="w-4 h-4 flex-shrink-0 mt-0.5 text-stone-400 dark:text-slate-500" />
                        <div>
                          <div className="text-[10px] uppercase tracking-wide mb-0.5 text-stone-400 dark:text-slate-500">Ditambahkan</div>
                          <div className="font-medium text-stone-800 dark:text-slate-200">
                            {new Date(book.createdAt).toLocaleDateString('id-ID',
                              { year: 'numeric', month: 'long', day: 'numeric' })}
                          </div>
                        </div>
                      </div>
                    )}
                    {book.copyrightStatus && (
                      <div className="pt-3 border-t border-amber-200 dark:border-slate-700">
                        <div className="text-[10px] uppercase tracking-wide mb-0.5 text-stone-400 dark:text-slate-500">
                          Status Hak Cipta
                        </div>
                        <div className="font-medium text-amber-600 dark:text-amber-400">{book.copyrightStatus}</div>
                      </div>
                    )}
                    {book.source && (
                      <div className="pt-3 border-t border-amber-200 dark:border-slate-700">
                        <div className="text-[10px] uppercase tracking-wide mb-1 text-stone-400 dark:text-slate-500">Sumber</div>
                        <a
                          href={book.source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm flex items-center gap-1 break-all transition-colors
                                     text-amber-600 hover:text-amber-700
                                     dark:text-amber-400 dark:hover:text-amber-300">
                          <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          <span className="truncate">{getSourceDomain(book.source)}</span>
                        </a>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </aside>

            {/* ── ARTICLE col-2-3 ─────────────────────────────────── */}
            <article className="lg:col-span-2 pb-8">

              {/* Desktop title block */}
              <div className="hidden lg:block mb-6">
                <div className="flex items-center gap-2 mb-3">
                  {book.isFeatured && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold
                                     bg-amber-100 text-amber-700 border border-amber-200
                                     dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800/60">
                      <Star className="w-3.5 h-3.5 mr-1 fill-current" />Pilihan Editor
                    </span>
                  )}
                  {book.isActive === false && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold
                                     bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                      Tidak Aktif
                    </span>
                  )}
                </div>

                <h1 className="text-3xl xl:text-4xl font-bold leading-tight mb-2
                               text-stone-900 dark:text-slate-50">
                  {book.title}
                </h1>
                {book.subtitle && (
                  <p className="text-lg mb-4 text-stone-500 dark:text-slate-400">{book.subtitle}</p>
                )}

                {/* Author row */}
                <div className="flex items-center gap-3 mb-5">
                  <AuthorAvatars />
                  <div className="flex flex-wrap items-center gap-1">
                    {authorList.map((author, i) => (
                      <span key={i} className="inline-flex items-center">
                        <Link
                          to={`/penulis/${author.slug}`}
                          className="text-base font-medium transition-colors
                                     text-stone-700 hover:text-amber-600
                                     dark:text-slate-300 dark:hover:text-amber-400">
                          {author.name}
                        </Link>
                        {i < authorList.length - 1 && <span className="mx-1 text-stone-400">,</span>}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stat row */}
                <div className="flex flex-wrap gap-5 text-sm py-3 mb-4 border-y
                                text-stone-500 border-stone-100
                                dark:text-slate-400 dark:border-slate-800">
                  {book.averageRating > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="font-semibold text-stone-800 dark:text-slate-200">
                        {book.averageRating.toFixed(1)}
                      </span>
                      <span className="text-xs text-stone-400 dark:text-slate-500">
                        ({book.totalRatings} rating)
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4" /><span>{book.viewCount || 0} dilihat</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Download className="w-4 h-4" /><span>{book.downloadCount || 0} diunduh</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" /><span>{book.readCount || 0} pembaca</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /><span>{book.estimatedReadTime} menit</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" /><span>{book.publicationYear}</span>
                  </div>
                </div>

                {/* Genre tags desktop */}
                {book.genres && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {book.genres.split(',').map((genre, i) => {
                      const g    = genre.trim()
                      const slug = g.toLowerCase().replace(/\s*&\s*/g, '-').replace(/\s+/g, '-')
                      return (
                        <Link
                          key={i}
                          to={`/kategori/${slug}`}
                          className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all border
                                     bg-amber-50 border-amber-200 text-amber-700
                                     hover:bg-amber-100 hover:border-amber-300 hover:shadow-sm hover:scale-105
                                     dark:bg-amber-900/20 dark:border-amber-700/50 dark:text-amber-300
                                     dark:hover:bg-amber-900/40">
                          {g}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Desktop Rating Summary */}
              <div className="hidden lg:block mb-6">
                <RatingSummary ratingStats={ratingStats} onRate={handleOpenRatingModal} userRating={userRating} />
              </div>

              {/* Contributors */}
              {(book.contributors || book.source) && (
                <div className="mb-6">
                  <h3 className="text-xs font-semibold uppercase tracking-wider mb-2.5
                                 text-stone-400 dark:text-slate-500">Kontributor</h3>
                  <div className="rounded-xl p-3.5 border bg-gradient-to-r
                                  from-purple-50 to-amber-50/40 border-purple-200
                                  dark:from-purple-900/20 dark:to-slate-900 dark:border-purple-800">
                    <div className="flex flex-wrap gap-2">
                      {book.source && (
                        <a
                          href={book.source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 rounded-lg shadow-sm border transition-colors
                                     bg-white border-purple-100 hover:border-amber-300
                                     dark:bg-slate-800 dark:border-purple-900 dark:hover:border-amber-700">
                          <Database className="w-3.5 h-3.5 flex-shrink-0 text-amber-500" />
                          <div>
                            <div className="text-xs font-medium text-stone-800 dark:text-slate-200">
                              {getSourceDomain(book.source)}
                            </div>
                            <div className="text-[10px] text-stone-400 dark:text-slate-500">Digitalisasi</div>
                          </div>
                        </a>
                      )}
                      {book.contributors && book.contributors.split(',').map((contributor, i) => {
                        const parts = contributor.trim().match(/(.+?)\s*\((.+?)\)/)
                        const name  = parts ? parts[1].trim() : contributor.trim()
                        const role  = parts ? parts[2].trim() : ''
                        return (
                          <div
                            key={i}
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
                <h2 className="text-xl font-bold mb-3 text-stone-900 dark:text-slate-50">
                  Deskripsi{' '}
                  <span className="text-xs font-normal text-stone-400 dark:text-slate-500">
                    (Dibuat otomatis)
                  </span>
                </h2>
                <div className="whitespace-pre-line leading-relaxed text-justify text-sm sm:text-base
                                text-stone-700 dark:text-slate-300">
                  {book.description || 'Tidak ada deskripsi tersedia.'}
                </div>
              </section>

              {/* Book Details Accordion */}
              {(book.fileFormat || book.fileSize || book.totalPages || book.totalWord ||
                book.publicationYear || book.publishedAt || book.createdAt || book.updatedAt ||
                book.source || book.language || book.publisher || book.copyrightStatus ||
                book.estimatedReadTime) && (
                <section className="mb-6">
                  <button
                    onClick={handleToggleBookDetails}
                    className="flex items-center justify-between w-full p-4 rounded-xl border transition-all
                               bg-stone-50 border-stone-200 hover:bg-amber-50/60 hover:border-amber-200
                               dark:bg-slate-800/60 dark:border-slate-700 dark:hover:bg-slate-800">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-stone-500 dark:text-slate-400" />
                      <span className="font-semibold text-sm text-stone-800 dark:text-slate-200">
                        Detail Buku Lengkap
                      </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform text-stone-400 dark:text-slate-500
                                            ${showBookDetails ? 'rotate-180' : ''}`} />
                  </button>

                  {showBookDetails && (
                    <div className="mt-2 p-4 rounded-xl border transition-colors
                                    bg-stone-50 border-stone-200
                                    dark:bg-slate-800/60 dark:border-slate-700">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                        <div className="space-y-3">
                          {book.fileFormat && (
                            <div>
                              <div className="text-[10px] uppercase tracking-wide mb-0.5 text-stone-400 dark:text-slate-500">Format File</div>
                              <div className="text-sm font-medium text-stone-800 dark:text-slate-200">{book.fileFormat.toUpperCase()}</div>
                            </div>
                          )}
                          {book.fileSize && (
                            <div>
                              <div className="text-[10px] uppercase tracking-wide mb-0.5 text-stone-400 dark:text-slate-500">Ukuran File</div>
                              <div className="text-sm font-medium text-stone-800 dark:text-slate-200">
                                {(book.fileSize / 1024 / 1024).toFixed(2)} MB
                              </div>
                            </div>
                          )}
                          {book.totalPages && (
                            <div>
                              <div className="text-[10px] uppercase tracking-wide mb-0.5 text-stone-400 dark:text-slate-500">Total Bab & Subbab</div>
                              <div className="text-sm font-medium text-stone-800 dark:text-slate-200">
                                {book.totalPages} bab & subbab
                              </div>
                            </div>
                          )}
                          {book.totalWord && (
                            <div>
                              <div className="text-[10px] uppercase tracking-wide mb-0.5 text-stone-400 dark:text-slate-500">Total Kata</div>
                              <div className="text-sm font-medium text-stone-800 dark:text-slate-200">
                                {book.totalWord.toLocaleString()} kata
                              </div>
                            </div>
                          )}
                          {book.estimatedReadTime && (
                            <div>
                              <div className="text-[10px] uppercase tracking-wide mb-0.5 text-stone-400 dark:text-slate-500">Estimasi Baca</div>
                              <div className="text-sm font-medium text-stone-800 dark:text-slate-200">
                                {book.estimatedReadTime} menit
                              </div>
                            </div>
                          )}
                          {book.language && (
                            <div>
                              <div className="text-[10px] uppercase tracking-wide mb-0.5 text-stone-400 dark:text-slate-500">Bahasa</div>
                              <div className="text-sm font-medium text-stone-800 dark:text-slate-200">{book.language}</div>
                            </div>
                          )}
                        </div>
                        <div className="space-y-3">
                          {book.publicationYear && (
                            <div>
                              <div className="text-[10px] uppercase tracking-wide mb-0.5 text-stone-400 dark:text-slate-500">Tahun Terbit</div>
                              <div className="text-sm font-medium text-stone-800 dark:text-slate-200">{book.publicationYear}</div>
                            </div>
                          )}
                          {book.publishedAt && (
                            <div>
                              <div className="text-[10px] uppercase tracking-wide mb-0.5 text-stone-400 dark:text-slate-500">Tanggal Terbit</div>
                              <div className="text-sm font-medium text-stone-800 dark:text-slate-200">
                                {new Date(book.publishedAt).toLocaleDateString('id-ID',
                                  { year: 'numeric', month: 'long', day: 'numeric' })}
                              </div>
                            </div>
                          )}
                          {book.publisher && (
                            <div>
                              <div className="text-[10px] uppercase tracking-wide mb-0.5 text-stone-400 dark:text-slate-500">Diterbitkan Ulang Oleh</div>
                              <div className="text-sm font-medium text-stone-800 dark:text-slate-200">{book.publisher}</div>
                            </div>
                          )}
                          {book.createdAt && (
                            <div>
                              <div className="text-[10px] uppercase tracking-wide mb-0.5 text-stone-400 dark:text-slate-500">Ditambahkan</div>
                              <div className="text-sm font-medium text-stone-800 dark:text-slate-200">
                                {new Date(book.createdAt).toLocaleDateString('id-ID',
                                  { year: 'numeric', month: 'long', day: 'numeric' })}
                              </div>
                            </div>
                          )}
                          {book.updatedAt && (
                            <div>
                              <div className="text-[10px] uppercase tracking-wide mb-0.5 text-stone-400 dark:text-slate-500">Diperbarui</div>
                              <div className="text-sm font-medium text-stone-800 dark:text-slate-200">
                                {new Date(book.updatedAt).toLocaleDateString('id-ID',
                                  { year: 'numeric', month: 'long', day: 'numeric' })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      {book.copyrightStatus && (
                        <div className="pt-3 border-t border-stone-200 dark:border-slate-700">
                          <div className="text-[10px] uppercase tracking-wide mb-0.5 text-stone-400 dark:text-slate-500">
                            Status Hak Cipta
                          </div>
                          <div className="text-sm font-medium text-amber-600 dark:text-amber-400">
                            {book.copyrightStatus}
                          </div>
                        </div>
                      )}
                      {book.source && (
                        <div className="pt-3 border-t border-stone-200 dark:border-slate-700">
                          <div className="text-[10px] uppercase tracking-wide mb-1 text-stone-400 dark:text-slate-500">Sumber</div>
                          <a
                            href={book.source}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm flex items-center gap-1.5 break-all transition-colors
                                       text-amber-600 hover:text-amber-700
                                       dark:text-amber-400 dark:hover:text-amber-300">
                            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            {getSourceDomain(book.source)}
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </section>
              )}

              {/* Reviews — FIX CLS: min-height */}
              <section className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-stone-900 dark:text-slate-50">Ulasan Terbaik</h2>
                  <div className="flex gap-2">
                    <Button variant="primary" size="sm" onClick={handleNavigateReviews}>
                      <MessageCircle className="w-3.5 h-3.5 mr-1" />
                      <span className="hidden sm:inline">Tulis </span>Ulasan
                    </Button>
                    {recentReviews.length > 0 && (
                      <Button variant="outline" size="sm" onClick={handleNavigateAllReviews}>
                        Lihat Semua
                      </Button>
                    )}
                  </div>
                </div>

                <div style={{ minHeight: '200px' }}>
                  {reviewsLoading ? (
                    <div className="text-center py-10"><LoadingSpinner /></div>
                  ) : recentReviews.length === 0 ? (
                    <div className="rounded-2xl p-8 text-center border border-dashed transition-colors
                                    bg-stone-50 border-stone-200
                                    dark:bg-slate-800/60 dark:border-slate-700">
                      <MessageCircle className="w-10 h-10 mx-auto mb-3 text-stone-300 dark:text-slate-600" />
                      <p className="mb-4 text-sm text-stone-500 dark:text-slate-400">Belum ada ulasan</p>
                      <Button variant="primary" size="sm" onClick={handleNavigateReviews}>
                        <MessageCircle className="w-4 h-4 mr-2" />
                        {isAuthenticated ? 'Jadilah yang Pertama' : 'Login untuk Ulasan'}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentReviews.map(review => (
                        <article
                          key={review.id}
                          className="rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition border
                                     bg-white border-stone-100 shadow-stone-50/80
                                     dark:bg-slate-900 dark:border-slate-700 dark:shadow-none">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden
                                            bg-amber-50 dark:bg-amber-900/20">
                              {review.userPhotoUrl
                                ? <img
                                    src={review.userPhotoUrl}
                                    alt={review.userName}
                                    width={36}
                                    height={36}
                                    className="w-9 h-9 object-cover"
                                    loading="lazy"
                                    decoding="async"
                                  />
                                : <User className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                              }
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-sm truncate text-stone-900 dark:text-slate-100">
                                  {review.userName}
                                </span>
                                {review.isOwner && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded font-medium flex-shrink-0
                                                   bg-amber-50 text-amber-600
                                                   dark:bg-amber-900/20 dark:text-amber-400">
                                    Anda
                                  </span>
                                )}
                                <span className="text-xs ml-auto text-stone-400 dark:text-slate-500">
                                  {new Date(review.createdAt).toLocaleDateString('id-ID',
                                    { year: 'numeric', month: 'short', day: 'numeric' })}
                                </span>
                              </div>
                            </div>
                          </div>
                          {review.title && (
                            <h3 className="font-semibold mb-1.5 text-sm text-stone-900 dark:text-slate-100">
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
              </section>

              {/* ── Social Integration ── */}
              <BookDetailSocialSection book={book} />

            </article>
          </div>{/* end grid */}
        </div>

        <RatingModal
          isOpen={isRatingModalOpen}
          onClose={handleCloseRatingModal}
          onSubmit={handleSubmitRating}
          bookTitle={book.title}
        />
      </div>
    </>
  )
}

export default BookDetailPage
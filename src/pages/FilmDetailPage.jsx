// ============================================
// src/pages/FilmDetailPage.jsx
// LIGHT: Cool slate/white — sinema siang bersih
// DARK:  Deep navy/slate  — bioskop malam elegan
// ============================================

import { useState, useEffect, useRef } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  Film as FilmIcon, Play, Calendar, Clock, Heart, Share2, Star,
  Globe, X, MessageCircle, ThumbsUp, ArrowLeft, Video as VideoIcon,
  ChevronDown, User, Users
} from 'lucide-react'
import { filmService } from '../services/filmService'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from '../components/Common/LoadingSpinner'
import Button from '../components/Common/Button'
import Alert from '../components/Common/Alert'
import SEO from '../components/Common/SEO'
import TrailerModal from '../components/Film/TrailerModal'
import FilmDetailSocialSection from '../components/Social/FilmDetailSocialSection'

// ── Wikimedia thumb helper ────────────────────────────────────────────────────
const getWikimediaThumb = (url, w = 600) => {
  if (!url) return null
  if (url.includes('/thumb/')) return url
  const m = url.match(
    /^(https:\/\/upload\.wikimedia\.org\/wikipedia\/(?:commons|[a-z]+)\/)([^/]\/[^/]{2}\/)(.+)$/
  )
  if (!m) return url
  const [, base, hash, filename] = m
  const isSvg = filename.toLowerCase().endsWith('.svg')
  const thumbFilename = isSvg ? `${filename}.png` : filename
  return `${base}thumb/${hash}${filename}/${w}px-${thumbFilename}`
}

// ─────────────────────────────────────────────────────────────────────────────
// Normalisasi field dari API ke field internal yang konsisten
// ─────────────────────────────────────────────────────────────────────────────
const normalizeFilm = (raw) => ({
  ...raw,
  year: raw.tahunRilis
    ? (typeof raw.tahunRilis === 'string' && raw.tahunRilis.length === 4
        ? raw.tahunRilis
        : new Date(raw.tahunRilis).getFullYear())
    : null,
  negara:   raw.negaraAsal || raw.negara || null,
  bahasa:   raw.originalLanguage || raw.bahasa || null,
  sinopsis: raw.deskripsi || raw.sinopsis || raw.description || null,
  anggaran: raw.budget?.displayValue || raw.anggaran || null,
  directorList:   Array.isArray(raw.sutradara)       ? raw.sutradara       : [],
  castList:       Array.isArray(raw.pemeran)         ? raw.pemeran         : [],
  writerList:     Array.isArray(raw.penulisSkenario) ? raw.penulisSkenario : [],
  producerList:   Array.isArray(raw.produser)        ? raw.produser        : [],
  genreList:      Array.isArray(raw.genre)           ? raw.genre           : [],
  reviewScores:   Array.isArray(raw.reviewScores)    ? raw.reviewScores    : [],
})

// ── RatingModal ───────────────────────────────────────────────────────────────
const RatingModal = ({ isOpen, onClose, onSubmit, filmTitle }) => {
  const [rating, setRating]           = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [submitting, setSubmitting]   = useState(false)

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
    0.5:'⭐ 0.5 - Sangat Buruk', 1:'⭐ 1.0 - Sangat Buruk',
    1.5:'⭐ 1.5 - Buruk',        2:'⭐⭐ 2.0 - Buruk',
    2.5:'⭐⭐ 2.5 - Kurang',     3:'⭐⭐⭐ 3.0 - Cukup',
    3.5:'⭐⭐⭐ 3.5 - Lumayan',  4:'⭐⭐⭐⭐ 4.0 - Bagus',
    4.5:'⭐⭐⭐⭐ 4.5 - Sangat Bagus', 5:'⭐⭐⭐⭐⭐ 5.0 - Sempurna',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="rounded-2xl shadow-2xl max-w-md w-full
                      bg-white dark:bg-slate-900
                      border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Beri Rating</h2>
          <button onClick={onClose}
            className="p-1.5 rounded-lg transition-all
                       text-slate-400 hover:text-slate-700 hover:bg-slate-100
                       dark:text-slate-500 dark:hover:text-slate-200 dark:hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <p className="text-sm mb-1 text-slate-500 dark:text-slate-400">Film</p>
            <p className="font-semibold leading-snug text-slate-900 dark:text-slate-100">{filmTitle}</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-4 text-slate-700 dark:text-slate-300">
              Rating Bintang <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-1 items-center justify-center">
              {[1,2,3,4,5].map(star => {
                const isHalf = (hoverRating || rating) === star - 0.5
                const isFull = (hoverRating || rating) >= star
                return (
                  <div key={star} className="relative cursor-pointer group">
                    <Star className={`w-12 h-12 transition-all ${
                      isFull
                        ? 'fill-blue-400 text-blue-400 scale-110'
                        : 'fill-slate-200 text-slate-300 dark:fill-slate-700 dark:text-slate-600'
                    } group-hover:scale-110`} />
                    {isHalf && !isFull && (
                      <Star className="w-12 h-12 absolute top-0 left-0 fill-blue-400 text-blue-400"
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
              <p className="text-sm text-center mt-3 font-medium text-blue-600 dark:text-blue-400">
                {ratingLabels[rating]}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="secondary" fullWidth onClick={onClose} disabled={submitting}>
              Batal
            </Button>
            <button type="submit" disabled={submitting || !rating}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                         text-sm font-semibold transition-all disabled:opacity-50
                         bg-blue-500 hover:bg-blue-400 text-white
                         shadow-sm shadow-blue-200/80 hover:shadow-md
                         dark:shadow-blue-900/30">
              {submitting ? 'Mengirim...' : 'Kirim Rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── RatingSummary ─────────────────────────────────────────────────────────────
const RatingSummary = ({ ratingStats, reviewScores, onRate, userRating }) => {
  const hasApiStats     = ratingStats?.totalRatings > 0
  const hasReviewScores = reviewScores?.length > 0

  if (!hasApiStats && !hasReviewScores) {
    return (
      <div className="flex items-center gap-4 p-4 rounded-2xl border border-dashed transition-colors
                      bg-slate-50 border-slate-200 dark:bg-slate-800/60 dark:border-slate-700">
        <div className="text-center flex-shrink-0">
          <div className="text-3xl font-bold text-slate-200 dark:text-slate-700">—</div>
          <div className="flex gap-0.5 mt-1 justify-center">
            {[1,2,3,4,5].map(s => (
              <Star key={s} className="w-3.5 h-3.5 text-slate-200 dark:text-slate-700" />
            ))}
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm mb-2 text-slate-500 dark:text-slate-400">Belum ada rating</p>
          <button onClick={onRate}
            className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors
                       text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
            <Star className="w-4 h-4" />
            {userRating ? `Rating Anda: ${userRating.rating} ⭐` : 'Beri rating pertama'}
          </button>
        </div>
      </div>
    )
  }

  if (!hasApiStats && hasReviewScores) {
    return (
      <div className="p-4 sm:p-5 rounded-2xl border shadow-sm transition-colors
                      bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-700">
        <p className="text-xs font-bold uppercase tracking-wider mb-3 text-slate-400 dark:text-slate-500">
          Skor Kritikus
        </p>
        <div className="flex flex-wrap gap-3 mb-4">
          {reviewScores.map((score, i) => (
            <div key={i}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border
                         bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700">
              <Star className="w-4 h-4 fill-blue-400 text-blue-400 flex-shrink-0" />
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{score.value}</div>
                {score.source && (
                  <div className="text-[10px] text-slate-400 dark:text-slate-500">{score.source}</div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="pt-3 border-t border-slate-100 dark:border-slate-700
                        flex items-center justify-between flex-wrap gap-2">
          {userRating ? (
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 fill-blue-400 text-blue-400" />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Rating Anda:{' '}
                <span className="font-semibold text-slate-900 dark:text-slate-100">{userRating.rating} ⭐</span>
              </span>
            </div>
          ) : (
            <span className="text-sm text-slate-500 dark:text-slate-400">Sudah nonton? Beri rating kamu</span>
          )}
          <button onClick={onRate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                       transition-all active:scale-95
                       bg-blue-50 text-blue-700 hover:bg-blue-100
                       dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/40">
            <Star className={`w-3.5 h-3.5 ${userRating ? 'fill-blue-400 text-blue-400' : ''}`} />
            {userRating ? 'Ubah Rating' : 'Beri Rating'}
          </button>
        </div>
      </div>
    )
  }

  const avg           = ratingStats.averageRating
  const total         = ratingStats.totalRatings
  const filledStars   = Math.floor(avg)
  const hasHalf       = avg - filledStars >= 0.25 && avg - filledStars < 0.75
  const hasAlmostFull = avg - filledStars >= 0.75
  const ratingLabel   = avg >= 4.5 ? 'Luar Biasa' : avg >= 4 ? 'Sangat Bagus'
    : avg >= 3.5 ? 'Bagus' : avg >= 3 ? 'Cukup' : avg >= 2 ? 'Kurang' : 'Buruk'

  const bars = [
    { label:'5', count: ratingStats.rating50Count || 0 },
    { label:'4', count: (ratingStats.rating45Count||0)+(ratingStats.rating40Count||0) },
    { label:'3', count: (ratingStats.rating35Count||0)+(ratingStats.rating30Count||0) },
    { label:'2', count: (ratingStats.rating25Count||0)+(ratingStats.rating20Count||0) },
    { label:'1', count: (ratingStats.rating15Count||0)+(ratingStats.rating10Count||0)+(ratingStats.rating05Count||0) },
  ]

  return (
    <div className="p-4 sm:p-5 rounded-2xl border shadow-sm transition-colors
                    bg-white border-slate-200 shadow-slate-100/80
                    dark:bg-slate-900 dark:border-slate-700 dark:shadow-none">
      <div className="flex gap-5 sm:gap-6">
        <div className="flex flex-col items-center justify-center flex-shrink-0 min-w-[80px]">
          <div className="text-5xl sm:text-6xl font-extrabold tabular-nums leading-none mb-1
                          text-slate-900 dark:text-slate-50">
            {avg.toFixed(1)}
          </div>
          <div className="flex gap-0.5 mb-1">
            {[1,2,3,4,5].map(s => {
              const isFull = s <= filledStars || (s === filledStars+1 && hasAlmostFull)
              const isHalf = s === filledStars+1 && hasHalf
              return (
                <span key={s} className="relative inline-block">
                  <Star className="w-4 h-4 text-slate-200 dark:text-slate-600" />
                  {(isFull||isHalf) && (
                    <Star className="w-4 h-4 absolute inset-0 fill-blue-400 text-blue-400"
                      style={isHalf?{clipPath:'polygon(0 0,50% 0,50% 100%,0 100%)'}:{}} />
                  )}
                </span>
              )
            })}
          </div>
          <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">{ratingLabel}</div>
          <div className="text-[10px] mt-0.5 text-slate-400 dark:text-slate-500">{total} rating</div>
        </div>
        <div className="flex-1 min-w-0 space-y-1.5 flex flex-col justify-center">
          {bars.map(({label,count}) => {
            const pct = total > 0 ? (count/total)*100 : 0
            return (
              <div key={label} className="flex items-center gap-2">
                <div className="flex items-center gap-0.5 w-10 justify-end flex-shrink-0">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
                  <Star className="w-3 h-3 fill-blue-400 text-blue-400" />
                </div>
                <div className="flex-1 h-2 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700">
                  <div className="h-full bg-blue-400 rounded-full transition-all duration-700"
                    style={{width:`${pct}%`}} />
                </div>
                <span className="text-[10px] w-6 text-right flex-shrink-0
                                 text-slate-400 dark:text-slate-500">{count}</span>
              </div>
            )
          })}
        </div>
      </div>
      <div className="mt-4 pt-3 border-t flex items-center justify-between flex-wrap gap-2
                      border-slate-100 dark:border-slate-700">
        {userRating ? (
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 fill-blue-400 text-blue-400" />
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Rating Anda:{' '}
              <span className="font-semibold text-slate-900 dark:text-slate-100">{userRating.rating} ⭐</span>
            </span>
          </div>
        ) : (
          <span className="text-sm text-slate-500 dark:text-slate-400">Sudah nonton? Beri rating kamu</span>
        )}
        <button onClick={onRate}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                     transition-all active:scale-95
                     bg-blue-50 text-blue-700 hover:bg-blue-100
                     dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/40">
          <Star className={`w-3.5 h-3.5 ${userRating?'fill-blue-400 text-blue-400':''}`} />
          {userRating ? 'Ubah Rating' : 'Beri Rating'}
        </button>
      </div>
    </div>
  )
}

// ── Poster image dengan fallback chain ───────────────────────────────────────
const PosterImage = ({ rawUrl, alt, className }) => {
  const [src, setSrc]       = useState(() => getWikimediaThumb(rawUrl, 600) || rawUrl)
  const [loaded, setLoaded] = useState(false)
  const [error, setError]   = useState(!rawUrl)

  const handleError = () => {
    if (src !== rawUrl && rawUrl) {
      setSrc(rawUrl)
    } else {
      setError(true)
    }
  }

  if (error || !rawUrl) {
    return (
      <div className={`flex flex-col items-center justify-center gap-3
                       bg-gradient-to-br from-blue-50 to-slate-100
                       dark:from-blue-950/50 dark:to-slate-900 ${className}`}>
        <FilmIcon className="w-12 h-12 text-blue-400/40" />
        <p className="text-xs text-slate-400 px-4 text-center line-clamp-2">{alt}</p>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-slate-200 dark:bg-slate-700 rounded-[inherit]" />
      )}
      <img
        src={src}
        alt={alt}
        loading="eager"
        onLoad={() => setLoaded(true)}
        onError={handleError}
        className={`w-full h-full object-cover transition-opacity duration-500
                    ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  )
}

// ── FilmDetailPage ─────────────────────────────────────────────────────────────
const FilmDetailPage = () => {
  const { filmSlug } = useParams()
  const navigate     = useNavigate()
  const { isAuthenticated } = useAuth()

  const [film,              setFilm]              = useState(null)
  const [loading,           setLoading]           = useState(true)
  const [error,             setError]             = useState(null)
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false)
  const [isTrailerOpen,     setIsTrailerOpen]     = useState(false)
  const [userRating,        setUserRating]        = useState(null)
  const [ratingStats,       setRatingStats]       = useState(null)
  const [recentReviews,     setRecentReviews]     = useState([])
  const [reviewsLoading,    setReviewsLoading]    = useState(false)
  const [showDetails,       setShowDetails]       = useState(false)

  const backUrl = useRef(sessionStorage.getItem('filmsPageUrl') || '/film')

  useEffect(() => {
    let cancelled = false
    const init = async () => {
      setLoading(true); setError(null)
      try {
        const res = await filmService.getFilmBySlug(filmSlug)
        if (!cancelled) setFilm(normalizeFilm(res?.data || res))
      } catch {
        if (!cancelled) setError('Film tidak ditemukan')
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
  }, [filmSlug, isAuthenticated]) // eslint-disable-line

  useEffect(() => {
    if (film) {
      document.title = `${film.judul}${film.year ? ` (${film.year})` : ''} | Perpustakaan Digital`
    }
  }, [film])

  const fetchUserRating    = async () => {
    try { const r = await filmService.getMyRating?.(filmSlug); setUserRating(r?.data || null) }
    catch { setUserRating(null) }
  }
  const fetchRatingStats   = async () => {
    try { const r = await filmService.getRatingStats?.(filmSlug); setRatingStats(r?.data || null) }
    catch {}
  }
  const fetchRecentReviews = async () => {
    try {
      setReviewsLoading(true)
      const r = await filmService.getReviews?.(filmSlug, 1, 5, 'helpful')
      setRecentReviews(r?.data?.list || [])
    } catch { setRecentReviews([]) }
    finally { setReviewsLoading(false) }
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: film.judul, url: window.location.href })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        alert('✅ Link disalin!')
      }
    } catch {}
  }

  const handleFavorite = () => {
    if (!isAuthenticated) return navigate('/masuk')
    alert('Fitur favorit segera hadir!')
  }

  const handleOpenRatingModal = () => {
    if (!isAuthenticated) { alert('Silakan login terlebih dahulu'); return navigate('/masuk') }
    setIsRatingModalOpen(true)
  }

  const handleDeleteRating = async () => {
    if (!confirm('Hapus rating Anda?')) return
    try {
      await filmService.deleteRating?.(filmSlug)
      alert('✅ Rating dihapus!')
      setUserRating(null)
      fetchRatingStats()
    } catch { alert('❌ Gagal menghapus rating') }
  }

  const handleSubmitRating = async (ratingData) => {
    try {
      await filmService.addRating?.(filmSlug, { rating: ratingData.rating })
      alert('✅ Rating ditambahkan!')
      setIsRatingModalOpen(false)
      fetchUserRating()
      fetchRatingStats()
    } catch (e) { alert(`❌ Gagal: ${e.response?.data?.detail || e.message}`) }
  }

  // ── Guards ──────────────────────────────────────────────────────────────────
  if (loading) return <LoadingSpinner fullScreen />
  if (error || !film) return (
    <div className="min-h-screen flex items-center justify-center">
      <Alert type="error" message={error || 'Film tidak ditemukan'} />
    </div>
  )

  const {
    year, negara, bahasa, sinopsis, anggaran,
    directorList, castList, writerList, producerList,
    genreList, reviewScores,
  } = film

  const rawPosterUrl =
    film.posterUrl || film.poster_url || film.poster ||
    film.thumbnailUrl || film.thumbnail || film.coverUrl || film.imageUrl ||
    (Array.isArray(film.imageUrls) && film.imageUrls.length > 0
      ? film.imageUrls[0]
      : typeof film.imageUrls === 'string' && film.imageUrls
        ? film.imageUrls.split(',')[0].trim()
        : null) ||
    null

  const avgRating      = ratingStats?.averageRating
  const avgReviewScore = reviewScores?.[0]?.value || null

  const MetaItem = ({ icon: Icon, label, value, accent }) => (
    <div className={`flex items-start gap-2.5 p-2.5 rounded-xl transition-colors
                     ${accent || 'bg-slate-50 dark:bg-slate-800/60'}`}>
      <Icon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-slate-400 dark:text-slate-500" />
      <div>
        <div className="text-[10px] uppercase tracking-wide mb-0.5 text-slate-400 dark:text-slate-500">
          {label}
        </div>
        <div className="text-xs font-medium text-slate-800 dark:text-slate-200">{value}</div>
      </div>
    </div>
  )

  const actionButtons = [
    { icon: Heart,  label: 'Favorit',  action: handleFavorite, active: false },
    {
      icon:   Star,
      label:  avgRating ? `${avgRating.toFixed(1)}⭐` : 'Rating',
      action: handleOpenRatingModal,
      active: !!userRating,
    },
    { icon: Share2, label: 'Bagikan', action: handleShare, active: false },
  ]

  const seoTitle = `${film.judul}${year ? ` (${year})` : ''} - Film Klasik`
  const seoDesc  = (sinopsis || '').slice(0, 160)

  return (
    <>
      <SEO
        title={seoTitle}
        description={seoDesc}
        url={`/film/${filmSlug}`}
        type="video.movie"
        image={rawPosterUrl}
        keywords={`${film.judul}, film ${year}, ${genreList.join(', ')}, film klasik, domain publik`}
      />

      <div className="min-h-screen pb-16 lg:pb-0 transition-colors duration-300
                      bg-slate-50 dark:bg-slate-950">
        <div className="container mx-auto px-4 max-w-6xl">

          {/* ── Breadcrumb ───────────────────────────────────────── */}
          <div className="pt-4 pb-2">
            <nav className="flex items-center gap-1.5 text-xs mb-3 overflow-x-auto scrollbar-none
                            text-slate-400 dark:text-slate-500"
              aria-label="Breadcrumb">
              <Link to="/"
                className="transition hover:text-slate-700 dark:hover:text-slate-300 whitespace-nowrap">
                Beranda
              </Link>
              <span>/</span>
              <Link to={backUrl.current}
                className="transition hover:text-slate-700 dark:hover:text-slate-300 whitespace-nowrap">
                Koleksi Film
              </Link>
              <span>/</span>
              <span className="truncate max-w-[160px] text-slate-600 dark:text-slate-400">
                {film.judul}
              </span>
            </nav>
            <button onClick={() => navigate(backUrl.current)}
              className="inline-flex items-center gap-1.5 text-sm font-medium group transition-colors
                         text-slate-500 hover:text-slate-900
                         dark:text-slate-500 dark:hover:text-slate-100">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Kembali
            </button>
          </div>

          {/* ═══ MAIN LAYOUT GRID ═══════════════════════════════════ */}
          <div className="lg:grid lg:grid-cols-3 lg:gap-10 lg:items-start">

            {/* ═══════════════ SIDEBAR ════════════════════════════ */}
            <aside className="lg:col-span-1">
              <div className="lg:sticky lg:top-24 space-y-4">

                {/* ─── MOBILE: horizontal hero ─────────────────────── */}
                <div className="flex gap-4 py-4 lg:hidden">
                  <div className="flex-shrink-0 w-28 sm:w-36">
                    <div className="relative rounded-xl overflow-hidden shadow-lg aspect-[2/3]">
                      <PosterImage
                        rawUrl={rawPosterUrl}
                        alt={film.judul}
                        className="absolute inset-0 w-full h-full"
                      />
                      {year && (
                        <div className="absolute top-1.5 left-1.5 z-10 px-1.5 py-0.5 rounded-md
                                        bg-gray-900/80 backdrop-blur-sm
                                        text-white text-[10px] font-bold">
                          {year}
                        </div>
                      )}
                      <div className="absolute top-1.5 right-1.5 z-10 flex flex-col gap-1">
                        {film.videoUrl && (
                          <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded-md
                                           bg-emerald-600/90 backdrop-blur-sm
                                           text-white text-[8px] font-bold">
                            <Play className="w-1.5 h-1.5" fill="currentColor" />Full
                          </span>
                        )}
                        {film.trailerUrl && (
                          <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded-md
                                           bg-blue-600/90 backdrop-blur-sm
                                           text-white text-[8px] font-bold">
                            <VideoIcon className="w-1.5 h-1.5" />Trailer
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 py-1 flex flex-col gap-1.5">
                    <h1 className="text-base sm:text-lg font-bold leading-snug line-clamp-3
                                   text-slate-900 dark:text-slate-50">
                      {film.judul}
                    </h1>
                    {directorList.length > 0 && (
                      <p className="text-xs font-medium line-clamp-1 text-blue-600 dark:text-blue-400">
                        {directorList.map(d => d.name || d).join(', ')}
                      </p>
                    )}
                    {genreList.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {genreList.slice(0, 3).map((g, i) => (
                          <span key={i}
                            className="px-2 py-0.5 rounded-full text-[10px] font-medium border whitespace-nowrap
                                       bg-blue-50 border-blue-200 text-blue-700
                                       dark:bg-blue-900/20 dark:border-blue-700/50 dark:text-blue-300">
                            {g}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-auto pt-0.5">
                      {(avgReviewScore || avgRating) && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-blue-400 text-blue-400" />
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {avgRating ? avgRating.toFixed(1) : avgReviewScore}
                          </span>
                        </div>
                      )}
                      {film.durasi && (
                        <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
                          <Clock className="w-3 h-3" />
                          <span className="text-xs">{film.durasi}</span>
                        </div>
                      )}
                      {negara && (
                        <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
                          <Globe className="w-3 h-3" />
                          <span className="text-xs">{negara}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ─── DESKTOP: poster besar ────────────────────────── */}
                <div className="hidden lg:block relative rounded-2xl overflow-hidden shadow-xl aspect-[2/3]
                                shadow-slate-200/80 dark:shadow-black/50">
                  <PosterImage
                    rawUrl={rawPosterUrl}
                    alt={`Poster ${film.judul}`}
                    className="absolute inset-0 w-full h-full"
                  />
                  {year && (
                    <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg
                                    bg-gray-900/80 backdrop-blur-sm
                                    text-white text-xs font-bold tracking-wide">
                      {year}
                    </div>
                  )}
                  {film.videoUrl && (
                    <button
                      onClick={() => navigate(`/film/${filmSlug}/tonton`)}
                      className="absolute inset-0 z-10 flex items-center justify-center
                                 bg-black/0 hover:bg-black/25 cursor-pointer
                                 transition-colors duration-300 group">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-16 h-16 rounded-full bg-white/90
                                        flex items-center justify-center shadow-xl">
                          <Play className="w-8 h-8 text-blue-600 ml-1" fill="currentColor" />
                        </div>
                      </div>
                    </button>
                  )}
                </div>

                {/* ─── ACTION BUTTONS ─── */}
                <div className="space-y-2">
                  {film.videoUrl && (
                    <button
                      onClick={() => navigate(`/film/${filmSlug}/tonton`)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                                 text-base font-semibold transition-all active:scale-[0.98]
                                 bg-blue-500 hover:bg-blue-400 text-white
                                 shadow-md shadow-blue-200/80 hover:shadow-lg
                                 dark:shadow-blue-900/40">
                      <Play className="w-5 h-5" fill="currentColor" />
                      Tonton Film Lengkap
                    </button>
                  )}

                  {film.trailerUrl && (
                    <button
                      onClick={() => setIsTrailerOpen(true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                                 text-sm font-semibold transition-all active:scale-[0.98]
                                 border border-blue-300 text-blue-700
                                 hover:bg-blue-50 hover:border-blue-400
                                 dark:border-blue-700 dark:text-blue-400
                                 dark:hover:bg-blue-900/20 dark:hover:border-blue-500">
                      <VideoIcon className="w-4 h-4" />
                      Tonton Trailer
                    </button>
                  )}

                  {!film.videoUrl && !film.trailerUrl && (
                    <div className="p-3 rounded-xl border border-dashed text-center
                                    border-slate-200 dark:border-slate-700">
                      <p className="text-xs text-slate-400 dark:text-slate-500">Video tidak tersedia</p>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2">
                    {actionButtons.map(({ icon: Icon, label, action, active }) => (
                      <button key={label} onClick={action}
                        className={`flex flex-col items-center gap-1 py-2.5 lg:py-3 px-1
                                    rounded-xl border text-xs font-medium
                                    transition-all active:scale-95 hover:scale-105
                                    ${active
                                      ? `bg-blue-50 border-blue-300 text-blue-600
                                         dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-400`
                                      : `bg-slate-50 border-slate-200 text-slate-600
                                         hover:border-blue-300 hover:text-blue-600
                                         dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400
                                         dark:hover:border-blue-600 dark:hover:text-blue-400`
                                    }`}>
                        <Icon className={`w-4 h-4 lg:w-5 lg:h-5
                                         ${active ? 'fill-blue-400 text-blue-400' : ''}`} />
                        <span className="leading-tight text-center">{label}</span>
                      </button>
                    ))}
                  </div>

                  {userRating && (
                    <div className="flex items-center justify-between p-3 rounded-xl border
                                    bg-blue-50 border-blue-200
                                    dark:bg-blue-900/10 dark:border-blue-800">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 fill-blue-400 text-blue-400" />
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                          Rating Anda: {userRating.rating}
                        </span>
                      </div>
                      <button onClick={handleDeleteRating}
                        className="text-xs font-medium px-2 py-1 rounded-lg transition
                                   text-red-500 hover:text-red-700 hover:bg-red-50
                                   dark:hover:bg-red-900/20">
                        Hapus
                      </button>
                    </div>
                  )}
                </div>

                {/* Rating Summary — mobile */}
                <div className="lg:hidden">
                  <RatingSummary
                    ratingStats={ratingStats}
                    reviewScores={reviewScores}
                    onRate={handleOpenRatingModal}
                    userRating={userRating}
                  />
                </div>

                {/* Meta pills — mobile */}
                {(year || film.durasi || negara || bahasa) && (
                  <div className="lg:hidden grid grid-cols-2 gap-2">
                    {year       && <MetaItem icon={Calendar} label="Tahun Rilis" value={String(year)} />}
                    {film.durasi && <MetaItem icon={Clock}   label="Durasi"      value={film.durasi} />}
                    {negara     && <MetaItem icon={Globe}    label="Negara"      value={negara} />}
                    {bahasa     && <MetaItem icon={Globe}    label="Bahasa"      value={bahasa} />}
                  </div>
                )}

                {/* Meta panel — desktop */}
                <div className="hidden lg:block p-4 rounded-2xl border space-y-3 transition-colors
                                bg-blue-50/60 border-blue-200
                                dark:bg-slate-800/60 dark:border-slate-700">
                  {directorList.length > 0 && (
                    <div className="flex items-start gap-2.5">
                      <FilmIcon className="w-4 h-4 flex-shrink-0 mt-0.5 text-slate-400 dark:text-slate-500" />
                      <div>
                        <div className="text-[10px] uppercase tracking-wide mb-0.5 text-slate-400 dark:text-slate-500">Sutradara</div>
                        <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                          {directorList.map(d => d.name||d).join(', ')}
                        </div>
                      </div>
                    </div>
                  )}
                  {year && (
                    <div className="flex items-start gap-2.5">
                      <Calendar className="w-4 h-4 flex-shrink-0 mt-0.5 text-slate-400 dark:text-slate-500" />
                      <div>
                        <div className="text-[10px] uppercase tracking-wide mb-0.5 text-slate-400 dark:text-slate-500">Tahun Rilis</div>
                        <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{year}</div>
                      </div>
                    </div>
                  )}
                  {film.durasi && (
                    <div className="flex items-start gap-2.5">
                      <Clock className="w-4 h-4 flex-shrink-0 mt-0.5 text-slate-400 dark:text-slate-500" />
                      <div>
                        <div className="text-[10px] uppercase tracking-wide mb-0.5 text-slate-400 dark:text-slate-500">Durasi</div>
                        <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{film.durasi}</div>
                      </div>
                    </div>
                  )}
                  {negara && (
                    <div className="flex items-start gap-2.5">
                      <Globe className="w-4 h-4 flex-shrink-0 mt-0.5 text-slate-400 dark:text-slate-500" />
                      <div>
                        <div className="text-[10px] uppercase tracking-wide mb-0.5 text-slate-400 dark:text-slate-500">Negara</div>
                        <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{negara}</div>
                      </div>
                    </div>
                  )}
                  {bahasa && (
                    <div className="flex items-start gap-2.5">
                      <Globe className="w-4 h-4 flex-shrink-0 mt-0.5 text-slate-400 dark:text-slate-500" />
                      <div>
                        <div className="text-[10px] uppercase tracking-wide mb-0.5 text-slate-400 dark:text-slate-500">Bahasa</div>
                        <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{bahasa}</div>
                      </div>
                    </div>
                  )}
                  {film.color && (
                    <div className="flex items-start gap-2.5">
                      <FilmIcon className="w-4 h-4 flex-shrink-0 mt-0.5 text-slate-400 dark:text-slate-500" />
                      <div>
                        <div className="text-[10px] uppercase tracking-wide mb-0.5 text-slate-400 dark:text-slate-500">Warna</div>
                        <div className="text-sm font-medium capitalize text-slate-800 dark:text-slate-200">{film.color}</div>
                      </div>
                    </div>
                  )}
                  {genreList.length > 0 && (
                    <div className="pt-3 border-t border-blue-200 dark:border-slate-700">
                      <div className="text-[10px] uppercase tracking-wide mb-2 text-slate-400 dark:text-slate-500">Genre</div>
                      <div className="flex flex-wrap gap-1.5">
                        {genreList.map((g, i) => (
                          <span key={i}
                            className="px-2 py-0.5 rounded-full text-[10px] font-medium border
                                       bg-white border-blue-200 text-blue-700
                                       dark:bg-slate-900 dark:border-slate-600 dark:text-blue-300">
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {anggaran && (
                    <div className="pt-3 border-t border-blue-200 dark:border-slate-700">
                      <div className="text-[10px] uppercase tracking-wide mb-0.5 text-slate-400 dark:text-slate-500">Anggaran</div>
                      <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{anggaran}</div>
                    </div>
                  )}
                  {film.boxOffice?.length > 0 && (
                    <div className="pt-3 border-t border-blue-200 dark:border-slate-700">
                      <div className="text-[10px] uppercase tracking-wide mb-0.5 text-slate-400 dark:text-slate-500">Box Office</div>
                      <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        {film.boxOffice[0].displayValue}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </aside>

            {/* ═══════════════ ARTICLE ════════════════════════════ */}
            <article className="lg:col-span-2 pb-8">

              {/* Desktop title block */}
              <div className="hidden lg:block mb-6">
                <h1 className="text-3xl xl:text-4xl font-bold leading-tight mb-2
                               text-slate-900 dark:text-slate-50">
                  {film.judul}
                  {year && (
                    <span className="ml-3 text-xl font-normal text-slate-400 dark:text-slate-500">
                      ({year})
                    </span>
                  )}
                </h1>

                {directorList.length > 0 && (
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0
                                    bg-blue-100 dark:bg-blue-900/30">
                      <FilmIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="text-sm text-slate-500 dark:text-slate-400 mr-0.5">Sutradara:</span>
                      {directorList.map((d, i) => (
                        <span key={i} className="inline-flex items-center">
                          <span className="text-base font-medium text-slate-700 dark:text-slate-300">
                            {d.name || d}
                          </span>
                          {i < directorList.length - 1 && (
                            <span className="mx-1 text-slate-400">,</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-5 text-sm py-3 mb-4 border-y
                                text-slate-500 border-slate-100
                                dark:text-slate-400 dark:border-slate-800">
                  {(avgReviewScore || avgRating) && (
                    <div className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 fill-blue-400 text-blue-400" />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {avgRating ? avgRating.toFixed(1) : avgReviewScore}
                      </span>
                    </div>
                  )}
                  {film.durasi && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" /><span>{film.durasi}</span>
                    </div>
                  )}
                  {negara && (
                    <div className="flex items-center gap-1.5">
                      <Globe className="w-4 h-4" /><span>{negara}</span>
                    </div>
                  )}
                  {film.color && (
                    <div className="flex items-center gap-1.5">
                      <FilmIcon className="w-4 h-4" />
                      <span className="capitalize">{film.color}</span>
                    </div>
                  )}
                </div>

                {genreList.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {genreList.map((g, i) => (
                      <span key={i}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all border cursor-default
                                   bg-blue-50 border-blue-200 text-blue-700
                                   hover:bg-blue-100 hover:border-blue-300 hover:shadow-sm hover:scale-105
                                   dark:bg-blue-900/20 dark:border-blue-700/50 dark:text-blue-300
                                   dark:hover:bg-blue-900/40">
                        {g}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Desktop Rating Summary */}
              <div className="hidden lg:block mb-6">
                <RatingSummary
                  ratingStats={ratingStats}
                  reviewScores={reviewScores}
                  onRate={handleOpenRatingModal}
                  userRating={userRating}
                />
              </div>

              {/* Cast */}
              {castList.length > 0 && (
                <section className="mb-6">
                  <h2 className="text-xl font-bold mb-3 flex items-center gap-2
                                 text-slate-900 dark:text-slate-50">
                    <Users className="w-5 h-5 text-blue-500" />
                    Pemeran
                  </h2>
                  <div className="rounded-xl p-4 border transition-colors
                                  bg-blue-50/60 border-blue-200
                                  dark:bg-slate-800/60 dark:border-slate-700">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {castList.map((actor, i) => (
                        <div key={i}
                          className="flex items-center gap-2.5 p-2.5 rounded-lg shadow-sm border
                                     bg-white border-slate-100
                                     dark:bg-slate-900 dark:border-slate-700">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                                          bg-blue-100 dark:bg-blue-900/30">
                            <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-medium truncate
                                            text-slate-800 dark:text-slate-200">
                              {actor.name || actor}
                            </div>
                            {actor.character && (
                              <div className="text-[10px] truncate text-slate-400 dark:text-slate-500">
                                {actor.character}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* Sinopsis */}
              <section className="mb-8">
                <h2 className="text-xl font-bold mb-3 text-slate-900 dark:text-slate-50">
                  Sinopsis
                </h2>
                <div className="whitespace-pre-line leading-relaxed text-justify text-sm sm:text-base
                                text-slate-700 dark:text-slate-300">
                  {sinopsis || 'Tidak ada sinopsis tersedia untuk film ini.'}
                </div>
              </section>

              {/* Film Details Accordion */}
              {(writerList.length > 0 || producerList.length > 0 ||
                film.perusahaanProduksi?.length > 0 || film.distributor?.length > 0 ||
                anggaran || film.boxOffice?.length > 0 ||
                film.contentRatings?.length > 0) && (
                <section className="mb-6">
                  <button onClick={() => setShowDetails(!showDetails)}
                    className="flex items-center justify-between w-full p-4 rounded-xl border transition-all
                               bg-slate-50 border-slate-200
                               hover:bg-blue-50/60 hover:border-blue-200
                               dark:bg-slate-800/60 dark:border-slate-700 dark:hover:bg-slate-800">
                    <div className="flex items-center gap-2.5">
                      <FilmIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                      <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                        Detail Film Lengkap
                      </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform
                                            text-slate-400 dark:text-slate-500
                                            ${showDetails ? 'rotate-180' : ''}`} />
                  </button>

                  {showDetails && (
                    <div className="mt-2 p-4 rounded-xl border transition-colors
                                    bg-slate-50 border-slate-200
                                    dark:bg-slate-800/60 dark:border-slate-700">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {writerList.length > 0 && (
                          <div>
                            <div className="text-[10px] uppercase tracking-wide mb-1
                                            text-slate-400 dark:text-slate-500">Penulis Skenario</div>
                            <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                              {writerList.map(w => w.name||w).join(', ')}
                            </div>
                          </div>
                        )}
                        {producerList.length > 0 && (
                          <div>
                            <div className="text-[10px] uppercase tracking-wide mb-1
                                            text-slate-400 dark:text-slate-500">Produser</div>
                            <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                              {producerList.map(p => p.name||p).join(', ')}
                            </div>
                          </div>
                        )}
                        {film.perusahaanProduksi?.length > 0 && (
                          <div>
                            <div className="text-[10px] uppercase tracking-wide mb-1
                                            text-slate-400 dark:text-slate-500">Perusahaan Produksi</div>
                            <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                              {film.perusahaanProduksi.map(p => p.name||p).join(', ')}
                            </div>
                          </div>
                        )}
                        {film.distributor?.length > 0 && (
                          <div>
                            <div className="text-[10px] uppercase tracking-wide mb-1
                                            text-slate-400 dark:text-slate-500">Distributor</div>
                            <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                              {film.distributor.map(d => d.name||d).join(', ')}
                            </div>
                          </div>
                        )}
                        {anggaran && (
                          <div>
                            <div className="text-[10px] uppercase tracking-wide mb-1
                                            text-slate-400 dark:text-slate-500">Anggaran</div>
                            <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                              {anggaran}
                            </div>
                          </div>
                        )}
                        {film.boxOffice?.length > 0 && (
                          <div>
                            <div className="text-[10px] uppercase tracking-wide mb-1
                                            text-slate-400 dark:text-slate-500">Box Office</div>
                            <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                              {film.boxOffice[0].displayValue}
                            </div>
                          </div>
                        )}
                      </div>

                      {film.contentRatings?.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                          <div className="text-[10px] uppercase tracking-wide mb-2
                                          text-slate-400 dark:text-slate-500">Rating Konten</div>
                          <div className="flex flex-wrap gap-2">
                            {film.contentRatings.map((cr, i) => (
                              <span key={i}
                                className="px-2.5 py-1 rounded-lg text-xs font-medium border
                                           bg-white border-slate-200 text-slate-700
                                           dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300">
                                {cr.system}: {cr.value}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {film.wikidataQid && (
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                          <div className="text-[10px] uppercase tracking-wide mb-1
                                          text-slate-400 dark:text-slate-500">Sumber</div>
                          <a
                            href={`https://www.wikidata.org/wiki/${film.wikidataQid}`}
                            target="_blank" rel="noopener noreferrer"
                            className="text-sm flex items-center gap-1.5 transition-colors
                                       text-blue-600 hover:text-blue-700
                                       dark:text-blue-400 dark:hover:text-blue-300">
                            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Wikidata ({film.wikidataQid})
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </section>
              )}

              {/* Reviews */}
              <section className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                    Ulasan Penonton
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(isAuthenticated ? `/film/${filmSlug}/ulasan` : '/masuk')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold
                                 transition-all bg-blue-500 hover:bg-blue-400 text-white
                                 shadow-sm shadow-blue-200/80 dark:shadow-blue-900/30">
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Tulis </span>Ulasan
                    </button>
                    {recentReviews.length > 0 && (
                      <button
                        onClick={() => navigate(`/film/${filmSlug}/ulasan`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium
                                   transition-all border
                                   border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-700
                                   dark:border-slate-700 dark:text-slate-400
                                   dark:hover:border-blue-600 dark:hover:text-blue-400">
                        Lihat Semua
                      </button>
                    )}
                  </div>
                </div>

                {reviewsLoading ? (
                  <div className="text-center py-10"><LoadingSpinner /></div>
                ) : recentReviews.length === 0 ? (
                  <div className="rounded-2xl p-8 text-center border border-dashed transition-colors
                                  bg-slate-50 border-slate-200
                                  dark:bg-slate-800/60 dark:border-slate-700">
                    <MessageCircle className="w-10 h-10 mx-auto mb-3
                                             text-slate-300 dark:text-slate-600" />
                    <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">Belum ada ulasan</p>
                    <button
                      onClick={() => navigate(isAuthenticated ? `/film/${filmSlug}/ulasan` : '/masuk')}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                                 bg-blue-500 hover:bg-blue-400 text-white transition-all
                                 shadow-sm shadow-blue-200/80 dark:shadow-blue-900/30">
                      <MessageCircle className="w-4 h-4" />
                      {isAuthenticated ? 'Jadilah yang Pertama' : 'Login untuk Ulasan'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentReviews.map(review => (
                      <article key={review.id}
                        className="rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition border
                                   bg-white border-slate-100 shadow-slate-50/80
                                   dark:bg-slate-900 dark:border-slate-700 dark:shadow-none">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center
                                          flex-shrink-0 overflow-hidden
                                          bg-blue-50 dark:bg-blue-900/20">
                            {review.userPhotoUrl
                              ? <img src={review.userPhotoUrl} alt={review.userName}
                                  className="w-9 h-9 object-cover" loading="lazy" />
                              : <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm truncate
                                               text-slate-900 dark:text-slate-100">
                                {review.userName}
                              </span>
                              {review.isOwner && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded font-medium flex-shrink-0
                                                 bg-blue-50 text-blue-600
                                                 dark:bg-blue-900/20 dark:text-blue-400">
                                  Anda
                                </span>
                              )}
                              <span className="text-xs ml-auto text-slate-400 dark:text-slate-500">
                                {new Date(review.createdAt).toLocaleDateString('id-ID',
                                  { year:'numeric', month:'short', day:'numeric' })}
                              </span>
                            </div>
                          </div>
                        </div>
                        {review.title && (
                          <h3 className="font-semibold mb-1.5 text-sm
                                         text-slate-900 dark:text-slate-100">
                            {review.title}
                          </h3>
                        )}
                        <p className="mb-3 line-clamp-3 text-sm leading-relaxed
                                      text-slate-600 dark:text-slate-300">
                          {review.content}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
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
              </section>

              {/* ── Social Integration ── */}
              <FilmDetailSocialSection film={film} />

            </article>
          </div>
        </div>

        {/* Modals */}
        <TrailerModal
          isOpen={isTrailerOpen}
          onClose={() => setIsTrailerOpen(false)}
          trailerUrl={film.trailerUrl}
          filmTitle={film.judul}
        />
        <RatingModal
          isOpen={isRatingModalOpen}
          onClose={() => setIsRatingModalOpen(false)}
          onSubmit={handleSubmitRating}
          filmTitle={film.judul}
        />
      </div>
    </>
  )
}

export default FilmDetailPage
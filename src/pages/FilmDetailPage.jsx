import { useState, useEffect, useRef } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  Film as FilmIcon, Play, Calendar, Clock, Heart, Share2, Star,
  Globe, X, MessageCircle, ThumbsUp, ArrowLeft, Video as VideoIcon,
  ChevronDown, User, Users, Building2, MapPin, Mic2, Pencil,
  Camera, Music2, Clapperboard, Award, BookOpen, Eye, Bookmark,
  ExternalLink, ChevronRight, Info, Copyright
} from 'lucide-react'
import { filmService } from '../services/filmService'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from '../components/Common/LoadingSpinner'
import Button from '../components/Common/Button'
import Alert from '../components/Common/Alert'
import SEO from '../components/Common/SEO'
import TrailerModal from '../components/Film/TrailerModal'
import FilmDetailSocialSection from '../components/Social/FilmDetailSocialSection'
import feedEvents, { FEED_EVENTS } from '../services/feedEvents'

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

// ── Mapping copyrightStatusId → label (selaras FilmCard) ─────────────────────
const COPYRIGHT_STATUS_NAME = {
  1: 'Domain Publik',
  2: 'Berhak Cipta',
  3: 'Creative Commons',
  4: 'Hak Cipta Penuh (Dilindungi)',
  5: 'GNU GPL',
  6: 'Lisensi MIT',
  7: 'Lisensi Apache',
  8: 'Lisensi Artistic',
  9: 'Fair Use',
  10: 'Status Tidak Diketahui',
}

// ── Normalize ─────────────────────────────────────────────────────────────────
const normalizeFilm = (raw) => {
  const mainVideo    = raw.videoSources?.find(v => !v.isTrailer)
  const trailerVideo = raw.videoSources?.find(v => v.isTrailer)
  return {
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
    directorList:        Array.isArray(raw.sutradara)          ? raw.sutradara          : [],
    castList:            Array.isArray(raw.pemeran)            ? raw.pemeran            : [],
    writerList:          Array.isArray(raw.penulisSkenario)    ? raw.penulisSkenario    : [],
    producerList:        Array.isArray(raw.produser)           ? raw.produser           : [],
    editorList:          Array.isArray(raw.filmEditor)         ? raw.filmEditor         : [],
    cinematographerList: Array.isArray(raw.cinematographer)    ? raw.cinematographer    : [],
    composerList:        Array.isArray(raw.composer)           ? raw.composer           : [],
    narratorList:        Array.isArray(raw.narator)            ? raw.narator            : [],
    productionList:      Array.isArray(raw.perusahaanProduksi) ? raw.perusahaanProduksi : [],
    distributorList:     Array.isArray(raw.distributor)        ? raw.distributor        : [],
    narrativeLocList:    Array.isArray(raw.narrativeLocation)  ? raw.narrativeLocation  : [],
    filmingLocList:      Array.isArray(raw.filmingLocation)    ? raw.filmingLocation    : [],
    genreList:           Array.isArray(raw.genre)              ? raw.genre              : [],
    reviewScores:        Array.isArray(raw.reviewScores)       ? raw.reviewScores       : [],
    videoUrl:   raw.videoUrl   || mainVideo?.embedUrl    || mainVideo?.directUrl    || null,
    trailerUrl: raw.trailerUrl || trailerVideo?.embedUrl || trailerVideo?.directUrl || null,
    posterUrl:  raw.posterUrl
      || mainVideo?.thumbnailUrl
      || trailerVideo?.thumbnailUrl
      || null,
  }
}

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
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
                         bg-blue-500 hover:bg-blue-400 text-white">
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
      <div className="p-4 rounded-2xl border transition-colors
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
          <button onClick={onRate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                       transition-all bg-blue-50 text-blue-700 hover:bg-blue-100
                       dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/40">
            <Star className={`w-3.5 h-3.5 ${userRating ? 'fill-blue-400 text-blue-400' : ''}`} />
            {userRating ? `Ubah Rating (${userRating.rating}⭐)` : 'Beri Rating'}
          </button>
        </div>
      </div>
    )
  }

  const avg         = ratingStats.averageRating
  const total       = ratingStats.totalRatings
  const filledStars = Math.floor(avg)
  const hasHalf     = avg - filledStars >= 0.25 && avg - filledStars < 0.75
  const hasAlmost   = avg - filledStars >= 0.75
  const ratingLabel = avg >= 4.5 ? 'Luar Biasa' : avg >= 4 ? 'Sangat Bagus'
    : avg >= 3.5 ? 'Bagus' : avg >= 3 ? 'Cukup' : avg >= 2 ? 'Kurang' : 'Buruk'

  const bars = [
    { label:'5', count: ratingStats.rating50Count || 0 },
    { label:'4', count: (ratingStats.rating45Count||0)+(ratingStats.rating40Count||0) },
    { label:'3', count: (ratingStats.rating35Count||0)+(ratingStats.rating30Count||0) },
    { label:'2', count: (ratingStats.rating25Count||0)+(ratingStats.rating20Count||0) },
    { label:'1', count: (ratingStats.rating15Count||0)+(ratingStats.rating10Count||0)+(ratingStats.rating05Count||0) },
  ]

  return (
    <div className="p-4 rounded-2xl border transition-colors
                    bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-700">
      <div className="flex gap-5">
        <div className="flex flex-col items-center justify-center flex-shrink-0 min-w-[80px]">
          <div className="text-5xl font-extrabold tabular-nums leading-none mb-1
                          text-slate-900 dark:text-slate-50">
            {avg.toFixed(1)}
          </div>
          <div className="flex gap-0.5 mb-1">
            {[1,2,3,4,5].map(s => {
              const isFull = s <= filledStars || (s === filledStars+1 && hasAlmost)
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
        <div className="flex-1 space-y-1.5 flex flex-col justify-center">
          {bars.map(({label, count}) => {
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
                <span className="text-[10px] w-6 text-right text-slate-400 dark:text-slate-500">{count}</span>
              </div>
            )
          })}
        </div>
      </div>
      <div className="mt-4 pt-3 border-t flex items-center justify-between flex-wrap gap-2
                      border-slate-100 dark:border-slate-700">
        {userRating && (
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 fill-blue-400 text-blue-400" />
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Rating Anda: <span className="font-semibold text-slate-900 dark:text-slate-100">{userRating.rating} ⭐</span>
            </span>
          </div>
        )}
        <button onClick={onRate}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                     transition-all bg-blue-50 text-blue-700 hover:bg-blue-100
                     dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/40">
          <Star className={`w-3.5 h-3.5 ${userRating?'fill-blue-400 text-blue-400':''}`} />
          {userRating ? 'Ubah Rating' : 'Beri Rating'}
        </button>
      </div>
    </div>
  )
}

// ── PosterImage — support landscape & portrait ────────────────────────────────
const PosterImage = ({ rawUrl, alt, className, isLandscape = false }) => {
  const [src, setSrc]       = useState(() => getWikimediaThumb(rawUrl, isLandscape ? 900 : 600) || rawUrl)
  const [loaded, setLoaded] = useState(false)
  const [error, setError]   = useState(!rawUrl)

  const handleError = () => {
    if (src !== rawUrl && rawUrl) setSrc(rawUrl)
    else setError(true)
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
        className={`w-full h-full transition-opacity duration-500
                    ${isLandscape ? 'object-cover' : 'object-cover'}
                    ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  )
}

// ── PersonCard ────────────────────────────────────────────────────────────────
const PersonCard = ({ person, role }) => {
  const name = typeof person === 'string' ? person : person?.name || '—'
  const photo = typeof person === 'object' ? person?.photoUrl : null
  const slug  = typeof person === 'object' ? person?.slug : null
  const desc  = typeof person === 'object' ? person?.description : null

  const inner = (
    <div className="flex items-center gap-2.5 p-2.5 rounded-xl border transition-all
                    bg-white border-slate-100 hover:border-blue-200 hover:shadow-sm
                    dark:bg-slate-900 dark:border-slate-700 dark:hover:border-blue-700/50
                    group cursor-pointer">
      <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden
                      bg-gradient-to-br from-blue-100 to-blue-50
                      dark:from-blue-900/40 dark:to-slate-800">
        {photo
          ? <img src={photo} alt={name} className="w-9 h-9 object-cover" loading="lazy" />
          : <User className="w-4 h-4 text-blue-500 dark:text-blue-400" />
        }
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-semibold truncate text-slate-800 dark:text-slate-200
                        group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
          {name}
        </div>
        {desc && (
          <div className="text-[10px] truncate text-slate-400 dark:text-slate-500 mt-0.5">{desc}</div>
        )}
        {role && !desc && (
          <div className="text-[10px] truncate text-slate-400 dark:text-slate-500 mt-0.5 capitalize">{role}</div>
        )}
      </div>
    </div>
  )

  return slug ? <Link to={`/orang/${slug}`}>{inner}</Link> : inner
}

// ── CompanyCard ───────────────────────────────────────────────────────────────
const CompanyCard = ({ company }) => {
  const name = typeof company === 'string' ? company : company?.name || '—'
  const logo = typeof company === 'object' ? company?.logoUrl : null
  const slug = typeof company === 'object' ? company?.slug : null
  const desc = typeof company === 'object' ? company?.description : null

  const inner = (
    <div className="flex items-center gap-3 p-3 rounded-xl border transition-all
                    bg-white border-slate-100 hover:border-blue-200 hover:shadow-sm
                    dark:bg-slate-900 dark:border-slate-700 dark:hover:border-blue-700/50
                    group cursor-pointer">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden
                      bg-gradient-to-br from-slate-100 to-slate-50
                      dark:from-slate-800 dark:to-slate-700 border border-slate-200 dark:border-slate-600">
        {logo
          ? <img src={logo} alt={name} className="w-10 h-10 object-contain p-1" loading="lazy" />
          : <Building2 className="w-4 h-4 text-slate-400 dark:text-slate-500" />
        }
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold truncate text-slate-800 dark:text-slate-200
                        group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
          {name}
        </div>
        {desc && (
          <div className="text-xs line-clamp-2 text-slate-400 dark:text-slate-500 mt-0.5 leading-relaxed">
            {desc}
          </div>
        )}
      </div>
    </div>
  )

  return slug ? <Link to={`/perusahaan/${slug}`}>{inner}</Link> : inner
}

// ── SectionBlock ──────────────────────────────────────────────────────────────
const SectionBlock = ({ icon: Icon, title, children, iconColor = 'text-blue-500' }) => (
  <section className="mb-6">
    <h2 className={`text-base sm:text-lg font-bold mb-3 flex items-center gap-2
                   text-slate-900 dark:text-slate-50`}>
      <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${iconColor}`} />
      {title}
    </h2>
    {children}
  </section>
)

// ── VideoSourceItem ───────────────────────────────────────────────────────────
const VideoSourceItem = ({ source, onPlay, onWatch }) => (
  <div className="flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer
                  bg-white border-slate-100 hover:border-blue-300 hover:shadow-sm
                  dark:bg-slate-900 dark:border-slate-700 dark:hover:border-blue-600
                  group"
    onClick={() => source.isTrailer ? onPlay(source) : onWatch()}>
    <div className="relative w-16 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-800">
      {source.thumbnailUrl
        ? <img src={source.thumbnailUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
        : <div className="w-full h-full flex items-center justify-center">
            <VideoIcon className="w-5 h-5 text-slate-400" />
          </div>
      }
      <div className="absolute inset-0 bg-black/30 flex items-center justify-center
                      group-hover:bg-black/10 transition-colors">
        <Play className="w-4 h-4 text-white" fill="currentColor" />
      </div>
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-xs font-semibold truncate text-slate-800 dark:text-slate-200
                      group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
        {source.title || (source.isTrailer ? 'Trailer' : 'Film Lengkap')}
      </div>
      <div className="flex items-center gap-2 mt-0.5">
        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md
                         ${source.isTrailer
                           ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                           : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
          {source.isTrailer ? <VideoIcon className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5" fill="currentColor" />}
          {source.isTrailer ? 'Trailer' : 'Full'}
        </span>
        <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide">
          {source.providerType?.replace('_', ' ')}
        </span>
        {source.durationSeconds && (
          <span className="text-[10px] text-slate-400 dark:text-slate-500">
            {Math.floor(source.durationSeconds / 60)}m
          </span>
        )}
      </div>
    </div>
    <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 flex-shrink-0
                             group-hover:text-blue-400 transition-colors" />
  </div>
)

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
  const [activeVideo,       setActiveVideo]       = useState(null)
  const [userRating,        setUserRating]        = useState(null)
  const [ratingStats,       setRatingStats]       = useState(null)
  const [recentReviews,     setRecentReviews]     = useState([])
  const [reviewsLoading,    setReviewsLoading]    = useState(false)
  const [showFullSynopsis,  setShowFullSynopsis]  = useState(false)
  const [activeTab,         setActiveTab]         = useState('info') // 'info' | 'crew' | 'video' | 'ulasan'
  const [isFavorited,       setIsFavorited]       = useState(false)

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
      document.title = `${film.judul}${film.year ? ` (${film.year})` : ''} | Perpustakaan Digital MasasilaM`
    }
  }, [film])

  const fetchUserRating    = async () => {
    try { const r = await filmService.getMyRating?.(filmSlug); setUserRating(r?.data || null) } catch { setUserRating(null) }
  }
  const fetchRatingStats   = async () => {
    try { const r = await filmService.getRatingStats?.(filmSlug); setRatingStats(r?.data || null) } catch {}
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
      if (navigator.share) await navigator.share({ title: film.judul, url: window.location.href })
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
      feedEvents.emit(FEED_EVENTS.ACTIVITY_CREATED, {
        activityType: 'reviewed',
        entityType:   'FILM',
        entitySlug:   filmSlug,
        entityTitle:  film?.judul,
        entityCover:  rawPosterUrl,
      })
    } catch (e) { alert(`❌ Gagal: ${e.response?.data?.detail || e.message}`) }
  }

  // ── Trailer modal — HANYA untuk trailer ───────────────────────────────────
  const handlePlayTrailer = (source) => {
    setActiveVideo(source)
    setIsTrailerOpen(true)
  }

  // ── Navigate ke FilmWatchPage — untuk film lengkap ────────────────────────
  const handleWatchFilm = () => {
    feedEvents.emit(FEED_EVENTS.ACTIVITY_CREATED, {
      activityType: 'started_reading',
      entityType:   'FILM',
      entitySlug:   filmSlug,
      entityTitle:  film?.judul,
      entityCover:  rawPosterUrl,
    })
    navigate(`/film/${filmSlug}/tonton`)
  }

  if (loading) return <LoadingSpinner fullScreen />
  if (error || !film) return (
    <div className="min-h-screen flex items-center justify-center">
      <Alert type="error" message={error || 'Film tidak ditemukan'} />
    </div>
  )

  const {
    year, negara, bahasa, sinopsis, anggaran,
    directorList, castList, writerList, producerList,
    editorList, cinematographerList, composerList, narratorList,
    productionList, distributorList,
    narrativeLocList, filmingLocList,
    genreList, reviewScores,
  } = film

  const rawPosterUrl =
    film.posterUrl || film.poster_url || film.poster ||
    film.thumbnailUrl || film.thumbnail || film.coverUrl ||
    (Array.isArray(film.imageUrls) && film.imageUrls.length > 0 ? film.imageUrls[0] : null) ||
    null

  const avgRating      = ratingStats?.averageRating
  const avgReviewScore = reviewScores?.[0]?.value || null

  const videoSources  = Array.isArray(film.videoSources) ? film.videoSources : []
  const trailerSource = videoSources.find(v => v.isTrailer)
  const mainSource    = videoSources.find(v => !v.isTrailer)

  const hasCrew = writerList.length > 0 || producerList.length > 0 || editorList.length > 0 ||
    cinematographerList.length > 0 || composerList.length > 0 || narratorList.length > 0

  const copyrightStatusName = film.copyrightStatusId
    ? (COPYRIGHT_STATUS_NAME[film.copyrightStatusId] || 'Status Tidak Diketahui')
    : null

  const tabs = [
    { id: 'info',   label: 'Info',      icon: Info },
    { id: 'crew',   label: 'Kru',       icon: Users,       hidden: !hasCrew && castList.length === 0 },
    { id: 'video',  label: 'Video',     icon: VideoIcon,   hidden: videoSources.length === 0 },
    { id: 'ulasan', label: 'Ulasan',    icon: MessageCircle },
  ].filter(t => !t.hidden)

  const seoTitle = `${film.judul}${year ? ` (${year})` : ''} - Film`
  const seoDesc  = (sinopsis || '').slice(0, 160)

  return (
    <>
      <SEO
        title={seoTitle}
        description={seoDesc}
        url={`/film/${filmSlug}`}
        type="video.movie"
        image={rawPosterUrl}
        keywords={`${film.judul}, film ${year}, ${genreList.join(', ')}`}
      />

      <div className="min-h-screen pb-20 lg:pb-0 transition-colors duration-300
                      bg-slate-50 dark:bg-slate-950">
        <div className="container mx-auto px-3 sm:px-4 max-w-5xl">

          {/* ── Breadcrumb ────────────────────────────────────────── */}
          <div className="pt-4 pb-2">
            <nav className="flex items-center gap-1.5 text-xs mb-3 overflow-x-auto scrollbar-none
                            text-slate-400 dark:text-slate-500">
              <Link to="/" className="transition hover:text-slate-700 dark:hover:text-slate-300 whitespace-nowrap">Beranda</Link>
              <span>/</span>
              <Link to={backUrl.current} className="transition hover:text-slate-700 dark:hover:text-slate-300 whitespace-nowrap">Kumpulan Film</Link>
              <span>/</span>
              <span className="truncate max-w-[160px] text-slate-600 dark:text-slate-400">{film.judul}</span>
            </nav>
            <button onClick={() => navigate(backUrl.current)}
              className="inline-flex items-center gap-1.5 text-sm font-medium group transition-colors
                         text-slate-500 hover:text-slate-900 dark:text-slate-500 dark:hover:text-slate-100">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Kembali
            </button>
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              HERO SECTION — Poster LANDSCAPE + info di kanan
          ═══════════════════════════════════════════════════════════════ */}
          <div className="mb-6">

            {/* ── POSTER LANDSCAPE ────────────────────────────────────── */}
            {rawPosterUrl && (
              <div className="relative w-full rounded-2xl overflow-hidden shadow-xl mb-4
                              shadow-slate-200/80 dark:shadow-black/50
                              aspect-video sm:aspect-[16/7] lg:aspect-[16/6]">
                <PosterImage
                  rawUrl={rawPosterUrl}
                  alt={`Poster ${film.judul}`}
                  className="absolute inset-0 w-full h-full"
                  isLandscape={true}
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

                {/* Year badge */}
                {year && (
                  <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-lg
                                  bg-black/60 backdrop-blur-sm text-white text-xs font-bold">
                    {year}
                  </div>
                )}

                {/* Video badges top-left */}
                <div className="absolute top-3 left-3 z-10 flex gap-1.5">
                  {mainSource && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md
                                     bg-emerald-600/90 backdrop-blur-sm text-white text-[10px] font-bold">
                      <Play className="w-2.5 h-2.5" fill="currentColor" />Full
                    </span>
                  )}
                  {trailerSource && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md
                                     bg-blue-600/90 backdrop-blur-sm text-white text-[10px] font-bold">
                      <VideoIcon className="w-2.5 h-2.5" />Trailer
                    </span>
                  )}
                </div>

                {/* Content overlay bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 z-10">
                  {/* Genre pills */}
                  {genreList.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2 sm:mb-3">
                      {genreList.slice(0, 4).map((g, i) => (
                        <span key={i}
                          className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold
                                     bg-white/15 backdrop-blur-sm border border-white/25 text-white">
                          {g}
                        </span>
                      ))}
                    </div>
                  )}

                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-tight mb-1 sm:mb-2
                                 drop-shadow-lg">
                    {film.judul}
                    {film.judulSlug && film.judulSlug !== film.judul && (
                      <span className="ml-2 text-sm sm:text-base font-normal text-white/70">
                        ({film.judulSlug})
                      </span>
                    )}
                  </h1>

                  {directorList.length > 0 && (
                    <p className="text-xs sm:text-sm text-blue-300 font-medium mb-2 sm:mb-3">
                      Sutradara: {directorList.map(d => d.name || d).join(', ')}
                    </p>
                  )}

                  {/* Meta row */}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-white/80 text-xs sm:text-sm">
                    {year && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />{year}
                      </span>
                    )}
                    {film.durasi && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />{film.durasi}
                      </span>
                    )}
                    {negara && (
                      <span className="flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5" />{negara}
                      </span>
                    )}
                    {film.jenis && (
                      <span className="flex items-center gap-1">
                        <Clapperboard className="w-3.5 h-3.5" />{film.jenis}
                      </span>
                    )}
                    {(avgRating || avgReviewScore) && (
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-white">
                          {avgRating ? avgRating.toFixed(1) : avgReviewScore}
                        </span>
                      </span>
                    )}
                  </div>
                </div>

                {/* ── Play overlay poster → navigate ke FilmWatchPage ── */}
                {mainSource && (
                  <button
                    onClick={handleWatchFilm}
                    className="absolute inset-0 flex items-center justify-center z-5
                               opacity-0 hover:opacity-100 transition-opacity duration-300
                               bg-black/10">
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-2xl">
                      <Play className="w-8 h-8 text-blue-600 ml-1" fill="currentColor" />
                    </div>
                  </button>
                )}
              </div>
            )}

            {/* ── ACTION BUTTONS ──────────────────────────────────────── */}
            <div className="flex items-center gap-2">

              {/* ✅ TONTON FILM → navigate ke FilmWatchPage */}
              {mainSource && (
                <button
                  onClick={handleWatchFilm}
                  className="flex-1 flex items-center justify-center gap-2
                             px-4 py-2.5 rounded-xl min-w-0
                             text-sm font-semibold transition-all active:scale-[0.98]
                             bg-blue-500 hover:bg-blue-400 text-white
                             shadow-md shadow-blue-200/80 hover:shadow-lg dark:shadow-blue-900/40">
                  <Play className="w-4 h-4 flex-shrink-0" fill="currentColor" />
                  <span className="truncate">Tonton Film</span>
                </button>
              )}

              {/* ✅ TRAILER → buka TrailerModal */}
              {trailerSource && (
                <button
                  onClick={() => handlePlayTrailer(trailerSource)}
                  className="flex-1 flex items-center justify-center gap-2
                             px-4 py-2.5 rounded-xl min-w-0
                             text-sm font-semibold transition-all active:scale-[0.98]
                             border border-blue-300 text-blue-700 hover:bg-blue-50
                             dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20">
                  <VideoIcon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">Trailer</span>
                </button>
              )}

              {/* Icon actions — flex-shrink-0 agar tidak tercompress */}
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={handleFavorite}
                  className={`p-2.5 rounded-xl border transition-all active:scale-95
                              ${isFavorited
                                ? 'bg-red-50 border-red-300 text-red-500 dark:bg-red-900/20 dark:border-red-700 dark:text-red-400'
                                : 'bg-white border-slate-200 text-slate-500 hover:border-red-300 hover:text-red-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400'
                              }`}>
                  <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={handleOpenRatingModal}
                  className={`p-2.5 rounded-xl border transition-all active:scale-95
                              ${userRating
                                ? 'bg-blue-50 border-blue-300 text-blue-600 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-400'
                                : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400'
                              }`}>
                  <Star className={`w-5 h-5 ${userRating ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2.5 rounded-xl border transition-all active:scale-95
                             bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700
                             dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* User rating display */}
            {userRating && (
              <div className="flex items-center justify-between p-3 rounded-xl border mt-2
                              bg-blue-50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 fill-blue-400 text-blue-400" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Rating Anda: {userRating.rating} ⭐
                  </span>
                </div>
                <button onClick={handleDeleteRating}
                  className="text-xs font-medium px-2 py-1 rounded-lg transition
                             text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
                  Hapus
                </button>
              </div>
            )}
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              QUICK META STRIP — mobile-friendly pills
          ═══════════════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mb-6">
            {year && (
              <div className="flex items-center gap-2 p-3 rounded-xl border transition-colors
                              bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-700">
                <Calendar className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500">Tahun</div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{year}</div>
                </div>
              </div>
            )}
            {film.durasi && (
              <div className="flex items-center gap-2 p-3 rounded-xl border transition-colors
                              bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-700">
                <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500">Durasi</div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{film.durasi}</div>
                </div>
              </div>
            )}
            {negara && (
              <div className="flex items-center gap-2 p-3 rounded-xl border transition-colors
                              bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-700">
                <Globe className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500">Negara</div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{negara}</div>
                </div>
              </div>
            )}
            {bahasa && (
              <div className="flex items-center gap-2 p-3 rounded-xl border transition-colors
                              bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-700">
                <BookOpen className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500">Bahasa</div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{bahasa}</div>
                </div>
              </div>
            )}
            {film.jenis && (
              <div className="flex items-center gap-2 p-3 rounded-xl border transition-colors
                              bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-700">
                <Clapperboard className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500">Jenis</div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{film.jenis}</div>
                </div>
              </div>
            )}
            {film.color && (
              <div className="flex items-center gap-2 p-3 rounded-xl border transition-colors
                              bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-700">
                <Eye className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500">Warna</div>
                  <div className="text-sm font-semibold capitalize text-slate-800 dark:text-slate-200">{film.color}</div>
                </div>
              </div>
            )}
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              RATING SUMMARY
          ═══════════════════════════════════════════════════════════════ */}
          <div className="mb-6">
            <RatingSummary
              ratingStats={ratingStats}
              reviewScores={reviewScores}
              onRate={handleOpenRatingModal}
              userRating={userRating}
            />
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              TABS
          ═══════════════════════════════════════════════════════════════ */}
          <div className="flex gap-1 p-1 rounded-xl mb-6 overflow-x-auto scrollbar-none
                          bg-slate-100 dark:bg-slate-800/60">
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium
                              whitespace-nowrap transition-all flex-shrink-0
                              ${activeTab === tab.id
                                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                              }`}>
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              TAB: INFO
          ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'info' && (
            <div className="space-y-6">

              {/* ── Sinopsis ───────────────────────────────────────────── */}
              <SectionBlock icon={BookOpen} title="Sinopsis">
                <div className="rounded-2xl p-4 sm:p-5 border transition-colors
                                bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-700">
                  {sinopsis ? (
                    <>
                      <p className={`whitespace-pre-line leading-relaxed text-sm sm:text-base text-justify
                                     text-slate-700 dark:text-slate-300
                                     ${!showFullSynopsis && sinopsis.length > 300 ? 'line-clamp-4' : ''}`}>
                        {sinopsis}
                      </p>
                      {sinopsis.length > 300 && (
                        <button
                          onClick={() => setShowFullSynopsis(v => !v)}
                          className="mt-2 text-sm font-medium text-blue-600 dark:text-blue-400
                                     hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1">
                          {showFullSynopsis ? 'Sembunyikan' : 'Baca selengkapnya'}
                          <ChevronDown className={`w-4 h-4 transition-transform ${showFullSynopsis ? 'rotate-180' : ''}`} />
                        </button>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-slate-400 dark:text-slate-500 italic">
                      Tidak ada sinopsis tersedia untuk film ini.
                    </p>
                  )}
                </div>
              </SectionBlock>

              {/* ── Genre ─────────────────────────────────────────────── */}
              {genreList.length > 0 && (
                <SectionBlock icon={Award} title="Genre">
                  <div className="flex flex-wrap gap-2">
                    {genreList.map((g, i) => (
                      <span key={i}
                        className="px-3 py-1.5 rounded-xl text-sm font-medium border cursor-default
                                   transition-all hover:scale-105
                                   bg-blue-50 border-blue-200 text-blue-700
                                   dark:bg-blue-900/20 dark:border-blue-700/50 dark:text-blue-300">
                        {g}
                      </span>
                    ))}
                  </div>
                </SectionBlock>
              )}

              {/* ── Hak Cipta & Lisensi ─────────────────────────────────
                  Menampilkan status hak cipta (dari copyrightStatusId)
                  berdampingan dengan `catatan` — catatan bebas dari
                  penginput data yang mengklarifikasi status tersebut
                  (mis. alasan, sumber izin, batasan penggunaan, dll). ── */}
              {(copyrightStatusName || film.catatan) && (
                <SectionBlock icon={Copyright} title="Hak Cipta & Lisensi" iconColor="text-slate-500">
                  <div className="rounded-2xl p-4 sm:p-5 border transition-colors
                                  bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-700">
                    {copyrightStatusName && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                                       text-sm font-semibold border
                                       bg-slate-50 border-slate-200 text-slate-700
                                       dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
                        <Copyright className="w-3.5 h-3.5 flex-shrink-0" />
                        {copyrightStatusName}
                      </span>
                    )}
                    {film.catatan && (
                      <p className={`text-sm leading-relaxed text-slate-600 dark:text-slate-400
                                     ${copyrightStatusName ? 'mt-3 pt-3 border-t border-slate-100 dark:border-slate-700' : ''}`}>
                        {film.catatan}
                      </p>
                    )}
                  </div>
                </SectionBlock>
              )}

              {/* ── Alias ─────────────────────────────────────────────── */}
              {Array.isArray(film.aliasIndonesia) && film.aliasIndonesia.length > 0 && (
                <SectionBlock icon={FilmIcon} title="Nama Alternatif">
                  <div className="flex flex-wrap gap-2">
                    {film.aliasIndonesia.map((alias, i) => (
                      <span key={i}
                        className="px-3 py-1.5 rounded-xl text-sm border
                                   bg-slate-50 border-slate-200 text-slate-600
                                   dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
                        {alias}
                      </span>
                    ))}
                  </div>
                </SectionBlock>
              )}

              {/* ── Perusahaan Produksi ────────────────────────────────── */}
              {productionList.length > 0 && (
                <SectionBlock icon={Building2} title="Perusahaan Produksi" iconColor="text-purple-500">
                  <div className="space-y-2">
                    {productionList.map((company, i) => (
                      <CompanyCard key={i} company={company} />
                    ))}
                  </div>
                </SectionBlock>
              )}

              {/* ── Distributor ───────────────────────────────────────── */}
              {distributorList.length > 0 && (
                <SectionBlock icon={Building2} title="Distributor" iconColor="text-indigo-500">
                  <div className="space-y-2">
                    {distributorList.map((company, i) => (
                      <CompanyCard key={i} company={company} />
                    ))}
                  </div>
                </SectionBlock>
              )}

              {/* ── Lokasi ────────────────────────────────────────────── */}
              {(narrativeLocList.length > 0 || filmingLocList.length > 0) && (
                <SectionBlock icon={MapPin} title="Lokasi" iconColor="text-rose-500">
                  <div className="rounded-2xl border overflow-hidden transition-colors
                                  bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-700">
                    {narrativeLocList.length > 0 && (
                      <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                        <div className="text-[10px] uppercase tracking-wide font-semibold mb-2
                                        text-slate-400 dark:text-slate-500">Lokasi Cerita</div>
                        <div className="flex flex-wrap gap-2">
                          {narrativeLocList.map((loc, i) => (
                            <span key={i}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs
                                         bg-rose-50 border border-rose-200 text-rose-700
                                         dark:bg-rose-900/20 dark:border-rose-700/50 dark:text-rose-300">
                              <MapPin className="w-2.5 h-2.5" />{loc}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {filmingLocList.length > 0 && (
                      <div className="p-4">
                        <div className="text-[10px] uppercase tracking-wide font-semibold mb-2
                                        text-slate-400 dark:text-slate-500">Lokasi Syuting</div>
                        <div className="flex flex-wrap gap-2">
                          {filmingLocList.map((loc, i) => (
                            <span key={i}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs
                                         bg-amber-50 border border-amber-200 text-amber-700
                                         dark:bg-amber-900/20 dark:border-amber-700/50 dark:text-amber-300">
                              <Camera className="w-2.5 h-2.5" />{loc}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </SectionBlock>
              )}

              {/* ── Finansial ─────────────────────────────────────────── */}
              {(anggaran || film.boxOffice?.length > 0) && (
                <SectionBlock icon={Award} title="Finansial" iconColor="text-emerald-500">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {anggaran && (
                      <div className="p-4 rounded-xl border transition-colors
                                      bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-700">
                        <div className="text-[10px] uppercase tracking-wide mb-1
                                        text-slate-400 dark:text-slate-500">Anggaran</div>
                        <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{anggaran}</div>
                      </div>
                    )}
                    {film.boxOffice?.map((bo, i) => (
                      <div key={i} className="p-4 rounded-xl border transition-colors
                                              bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-700">
                        <div className="text-[10px] uppercase tracking-wide mb-1
                                        text-slate-400 dark:text-slate-500">
                          Box Office {bo.region ? `(${bo.region})` : ''}
                        </div>
                        <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                          {bo.displayValue}
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionBlock>
              )}

              {/* ── Review Scores ──────────────────────────────────────── */}
              {reviewScores.length > 0 && (
                <SectionBlock icon={Star} title="Skor Kritikus" iconColor="text-yellow-500">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {reviewScores.map((score, i) => (
                      <div key={i}
                        className="p-3 rounded-xl border text-center transition-colors
                                   bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-700">
                        <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{score.value}</div>
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{score.source}</div>
                        {score.scoreType && (
                          <div className="text-[10px] text-slate-400 dark:text-slate-500">{score.scoreType}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </SectionBlock>
              )}

              {/* ── Content Ratings ────────────────────────────────────── */}
              {film.contentRatings?.length > 0 && (
                <SectionBlock icon={Info} title="Rating Konten">
                  <div className="flex flex-wrap gap-2">
                    {film.contentRatings.map((cr, i) => (
                      <div key={i}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl border
                                   bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-700">
                        <span className="text-lg font-black text-slate-900 dark:text-slate-100">{cr.value}</span>
                        <div>
                          <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">{cr.system}</div>
                          {cr.contentDescriptors && (
                            <div className="text-[10px] text-slate-400 dark:text-slate-500">{cr.contentDescriptors}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionBlock>
              )}

              {/* ── Seri / Sekuel ──────────────────────────────────────── */}
              {(film.partOfSeries || film.followedBy) && (
                <SectionBlock icon={Bookmark} title="Seri" iconColor="text-violet-500">
                  <div className="space-y-2">
                    {film.partOfSeries && (
                      <div className="flex items-center gap-3 p-3 rounded-xl border transition-colors
                                      bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-700">
                        <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30
                                        flex items-center justify-center flex-shrink-0">
                          <FilmIcon className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500">Bagian dari</div>
                          <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{film.partOfSeries}</div>
                        </div>
                      </div>
                    )}
                    {film.followedBy && (
                      <div className="flex items-center gap-3 p-3 rounded-xl border transition-colors
                                      bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-700">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30
                                        flex items-center justify-center flex-shrink-0">
                          <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500">Dilanjutkan oleh</div>
                          <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{film.followedBy}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </SectionBlock>
              )}

              {/* ── Sumber / Wikidata ──────────────────────────────────── */}
              {film.wikidataQid && !film.wikidataQid.startsWith('MANUAL_') && (
                <div className="p-4 rounded-xl border transition-colors
                                bg-slate-50 border-slate-200 dark:bg-slate-800/60 dark:border-slate-700">
                  <div className="text-[10px] uppercase tracking-wide mb-1 text-slate-400 dark:text-slate-500">Sumber Data</div>
                  <a
                    href={`https://www.wikidata.org/wiki/${film.wikidataQid}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-sm flex items-center gap-1.5 text-blue-600 hover:text-blue-700
                               dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                    <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                    Wikidata ({film.wikidataQid})
                  </a>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              TAB: CREW & CAST
          ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'crew' && (
            <div className="space-y-6">

              {/* ── Sutradara ─────────────────────────────────────────── */}
              {directorList.length > 0 && (
                <SectionBlock icon={Clapperboard} title="Sutradara">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {directorList.map((p, i) => <PersonCard key={i} person={p} role="Sutradara" />)}
                  </div>
                </SectionBlock>
              )}

              {/* ── Pemeran ───────────────────────────────────────────── */}
              {castList.length > 0 && (
                <SectionBlock icon={Users} title="Pemeran">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {castList.map((p, i) => <PersonCard key={i} person={p} role="Pemeran" />)}
                  </div>
                </SectionBlock>
              )}

              {/* ── Narator ───────────────────────────────────────────── */}
              {narratorList.length > 0 && (
                <SectionBlock icon={Mic2} title="Narator" iconColor="text-amber-500">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {narratorList.map((p, i) => <PersonCard key={i} person={p} role="Narator" />)}
                  </div>
                </SectionBlock>
              )}

              {/* ── Penulis Skenario ──────────────────────────────────── */}
              {writerList.length > 0 && (
                <SectionBlock icon={Pencil} title="Penulis Skenario" iconColor="text-emerald-500">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {writerList.map((p, i) => <PersonCard key={i} person={p} role="Penulis" />)}
                  </div>
                </SectionBlock>
              )}

              {/* ── Produser ──────────────────────────────────────────── */}
              {producerList.length > 0 && (
                <SectionBlock icon={Award} title="Produser" iconColor="text-violet-500">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {producerList.map((p, i) => <PersonCard key={i} person={p} role="Produser" />)}
                  </div>
                </SectionBlock>
              )}

              {/* ── Film Editor ───────────────────────────────────────── */}
              {editorList.length > 0 && (
                <SectionBlock icon={Pencil} title="Editor Film" iconColor="text-rose-500">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {editorList.map((p, i) => <PersonCard key={i} person={p} role="Editor" />)}
                  </div>
                </SectionBlock>
              )}

              {/* ── Sinematografer ────────────────────────────────────── */}
              {cinematographerList.length > 0 && (
                <SectionBlock icon={Camera} title="Sinematografer" iconColor="text-indigo-500">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {cinematographerList.map((p, i) => <PersonCard key={i} person={p} role="Sinematografer" />)}
                  </div>
                </SectionBlock>
              )}

              {/* ── Komposer ──────────────────────────────────────────── */}
              {composerList.length > 0 && (
                <SectionBlock icon={Music2} title="Komposer Musik" iconColor="text-pink-500">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {composerList.map((p, i) => <PersonCard key={i} person={p} role="Komposer" />)}
                  </div>
                </SectionBlock>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              TAB: VIDEO
          ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'video' && videoSources.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                {videoSources.length} sumber video tersedia
              </p>
              {videoSources.map((source, i) => (
                <VideoSourceItem
                  key={i}
                  source={source}
                  onPlay={handlePlayTrailer}
                  onWatch={handleWatchFilm}
                />
              ))}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              TAB: ULASAN
          ═══════════════════════════════════════════════════════════════ */}
          {activeTab === 'ulasan' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">Ulasan Penonton</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(isAuthenticated ? `/film/${filmSlug}/ulasan` : '/masuk')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold
                               transition-all bg-blue-500 hover:bg-blue-400 text-white
                               shadow-sm shadow-blue-200/80 dark:shadow-blue-900/30">
                    <MessageCircle className="w-3.5 h-3.5" />
                    Tulis Ulasan
                  </button>
                  {recentReviews.length > 0 && (
                    <button
                      onClick={() => navigate(`/film/${filmSlug}/ulasan`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium
                                 transition-all border border-slate-200 text-slate-600
                                 hover:border-blue-300 hover:text-blue-700
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
                <div className="rounded-2xl p-10 text-center border border-dashed transition-colors
                                bg-slate-50 border-slate-200 dark:bg-slate-800/60 dark:border-slate-700">
                  <MessageCircle className="w-10 h-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                  <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">Belum ada ulasan</p>
                  <button
                    onClick={() => navigate(isAuthenticated ? `/film/${filmSlug}/ulasan` : '/masuk')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                               bg-blue-500 hover:bg-blue-400 text-white transition-all">
                    <MessageCircle className="w-4 h-4" />
                    {isAuthenticated ? 'Jadilah yang Pertama' : 'Login untuk Ulasan'}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentReviews.map(review => (
                    <article key={review.id}
                      className="rounded-xl p-4 sm:p-5 border transition-all hover:shadow-md
                                 bg-white border-slate-100 dark:bg-slate-900 dark:border-slate-700">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center
                                        flex-shrink-0 overflow-hidden bg-blue-50 dark:bg-blue-900/20">
                          {review.userPhotoUrl
                            ? <img src={review.userPhotoUrl} alt={review.userName}
                                className="w-9 h-9 object-cover" loading="lazy" />
                            : <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                              {review.userName}
                            </span>
                            {review.isOwner && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded font-medium
                                               bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
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
                        <h3 className="font-semibold mb-1.5 text-sm text-slate-900 dark:text-slate-100">
                          {review.title}
                        </h3>
                      )}
                      <p className="mb-3 line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
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
            </div>
          )}

          {/* ── Social Integration ── */}
          <div className="mt-8">
            <FilmDetailSocialSection film={film} />
          </div>

        </div>

        {/* ── Fixed bottom bar mobile ─────────────────────────────────── */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-2
                        bg-white/95 dark:bg-slate-950/95 backdrop-blur-md
                        border-t border-slate-200 dark:border-slate-800">
          <div className="flex gap-2">
            {/* ✅ Film lengkap → FilmWatchPage */}
            {mainSource ? (
              <button
                onClick={handleWatchFilm}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
                           text-sm font-bold bg-blue-500 hover:bg-blue-400 text-white
                           shadow-md shadow-blue-200/80 dark:shadow-blue-900/40 transition-all">
                <Play className="w-4 h-4" fill="currentColor" />
                Tonton Film
              </button>
            ) : trailerSource ? (
              /* ✅ Kalau tidak ada film lengkap, baru trailer → modal */
              <button
                onClick={() => handlePlayTrailer(trailerSource)}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
                           text-sm font-bold bg-blue-500 hover:bg-blue-400 text-white transition-all">
                <VideoIcon className="w-4 h-4" />
                Tonton Trailer
              </button>
            ) : (
              <button
                onClick={handleOpenRatingModal}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
                           text-sm font-bold bg-blue-500 hover:bg-blue-400 text-white transition-all">
                <Star className="w-4 h-4" />
                Beri Rating
              </button>
            )}
            <button
              onClick={handleShare}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-700
                         text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 transition-all">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modals */}
        <TrailerModal
          isOpen={isTrailerOpen}
          onClose={() => { setIsTrailerOpen(false); setActiveVideo(null) }}
          trailerUrl={activeVideo?.embedUrl || activeVideo?.directUrl || film.trailerUrl}
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
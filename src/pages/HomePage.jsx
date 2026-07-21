import {
  useState, useEffect, memo, useCallback, useRef, useTransition
} from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, ChevronLeft, ChevronRight, Film, Newspaper, Layers, Sprout } from 'lucide-react'
import bookService from '../services/bookService'
import { filmService } from '../services/filmService'
import zineService from '../services/zineService'
import api from '../services/api'
import SEO from '../components/Common/SEO'
import FeaturedBanner from '../components/Home/FeaturedBanner'
import {
  generateWebsiteStructuredData,
  generateOrganizationStructuredData,
  combineStructuredData
} from '../utils/seoHelpers'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers — module-level, tidak pernah dibuat ulang
// ─────────────────────────────────────────────────────────────────────────────
const getWikimediaThumb = (url, w = 300) => {
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

const getFilmPoster = (film) => {
  if (!film) return null
  const videoSources = Array.isArray(film.videoSources) ? film.videoSources : []
  const mainThumb    = videoSources.find(v => !v.isTrailer)?.thumbnailUrl
  const trailerThumb = videoSources.find(v => v.isTrailer)?.thumbnailUrl
  return (
    film.posterUrl || film.poster_url || film.poster ||
    mainThumb || trailerThumb ||
    film.thumbnailUrl || film.thumbnail || film.coverUrl ||
    film.imageUrl || film.image ||
    (typeof film.imageUrls === 'string' && film.imageUrls
      ? film.imageUrls.split(',')[0].trim() : null) ||
    null
  )
}

// Newspaper fallback — module-level
const fetchArticlesFromCategories = async (limit = 10) => {
  const catRes = await api.get('/newspapers/categories')
  const categories = (catRes.data?.data || []).filter(c => (c.articleCount || 0) > 0)
  if (!categories.length) return []
  const perCat = Math.max(1, Math.ceil(limit / categories.length))
  const results = await Promise.allSettled(
    categories.map(cat =>
      api.get(`/newspapers/categories/${cat.slug}`, {
        params: { page: 1, limit: perCat, sortBy: 'date', sortOrder: 'DESC' }
      })
    )
  )
  return results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => r.value.data?.data?.list || r.value.data?.data || [])
    .slice(0, limit)
}

// ─────────────────────────────────────────────────────────────────────────────
// Accent configs — satu sumber kebenaran untuk semua warna
// ─────────────────────────────────────────────────────────────────────────────
const ACCENTS = {
  book: {
    text:   'text-amber-600 dark:text-amber-400',
    bg:     'bg-amber-50 dark:bg-amber-500/10',
    border: 'border-amber-500 dark:border-amber-400',
    btn:    'hover:border-amber-400 hover:text-amber-600 dark:hover:border-amber-500 dark:hover:text-amber-400',
    badge:  'bg-amber-500',
  },
  zine: {
    text:   'text-emerald-600 dark:text-emerald-400',
    bg:     'bg-emerald-50 dark:bg-emerald-500/10',
    border: 'border-emerald-500 dark:border-emerald-400',
    btn:    'hover:border-emerald-400 hover:text-emerald-600 dark:hover:border-emerald-500 dark:hover:text-emerald-400',
    badge:  'bg-emerald-500',
  },
  film: {
    text:   'text-blue-600 dark:text-blue-400',
    bg:     'bg-blue-50 dark:bg-blue-500/10',
    border: 'border-blue-500 dark:border-blue-400',
    btn:    'hover:border-blue-400 hover:text-blue-600 dark:hover:border-blue-500 dark:hover:text-blue-400',
    badge:  'bg-blue-500',
  },
  newspaper: {
    text:   'text-violet-600 dark:text-violet-400',
    bg:     'bg-violet-50 dark:bg-violet-500/10',
    border: 'border-violet-500 dark:border-violet-400',
    btn:    'hover:border-violet-400 hover:text-violet-600 dark:hover:border-violet-500 dark:hover:text-violet-400',
    badge:  'bg-violet-500',
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeletons — dimensi IDENTIK dengan kartu asli untuk mencegah CLS
// ─────────────────────────────────────────────────────────────────────────────
const SkeletonCard = memo(() => (
  <div className="flex-shrink-0 w-36 sm:w-44 animate-pulse" aria-hidden="true">
    {/* aspect-[2/3] identik dengan BookCard / ZineCard / FilmCard */}
    <div className="aspect-[2/3] rounded-xl mb-3 bg-gradient-to-br from-stone-200 via-stone-100 to-stone-200 dark:from-slate-700 dark:via-slate-800 dark:to-slate-700" />
    <div className="h-3 rounded-full w-full mb-1.5 bg-stone-200 dark:bg-slate-700" />
    <div className="h-2.5 rounded-full w-2/3 bg-stone-200 dark:bg-slate-700" />
  </div>
))
SkeletonCard.displayName = 'SkeletonCard'

const SkeletonNewspaper = memo(() => (
  <div
    className="flex-shrink-0 w-64 sm:w-72 animate-pulse rounded-xl p-5 border
                bg-white border-stone-200 dark:bg-slate-900 dark:border-slate-700"
    aria-hidden="true">
    <div className="flex items-center justify-between mb-3">
      <div className="h-3 rounded-full w-1/3 bg-stone-200 dark:bg-slate-700" />
      <div className="h-2.5 rounded-full w-1/4 bg-stone-200 dark:bg-slate-700" />
    </div>
    <div className="h-px rounded mb-3 bg-stone-200 dark:bg-slate-700" />
    <div className="h-4 rounded-full w-full mb-2 bg-stone-200 dark:bg-slate-700" />
    <div className="h-4 rounded-full w-4/5 mb-2 bg-stone-200 dark:bg-slate-700" />
    <div className="h-4 rounded-full w-3/5 mb-3 bg-stone-200 dark:bg-slate-700" />
    <div className="h-2.5 rounded-full w-1/2 bg-stone-200 dark:bg-slate-700" />
  </div>
))
SkeletonNewspaper.displayName = 'SkeletonNewspaper'

// ─────────────────────────────────────────────────────────────────────────────
// BookCard — amber accent
// LCP: priority prop → eager + fetchPriority high untuk 2 kartu pertama
// ─────────────────────────────────────────────────────────────────────────────
const BookCard = memo(({ book, priority = false }) => {
  const [loaded, setLoaded] = useState(false)
  const thumbUrl = getWikimediaThumb(book.cover_image, 300)
  const handleLoad = useCallback(() => setLoaded(true), [])

  return (
    <Link
      to={`/buku/${book.slug || book.id}`}
      className="group flex-shrink-0 w-36 sm:w-44 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-xl"
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl mb-3 shadow-md border transition-all duration-300
                      bg-stone-100 border-stone-200
                      group-hover:shadow-amber-200/60 group-hover:border-amber-400/60
                      dark:bg-slate-800 dark:border-slate-700
                      dark:shadow-black/30 dark:group-hover:shadow-amber-900/40 dark:group-hover:border-amber-500/50">
        {!loaded && thumbUrl && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-stone-200 via-stone-100 to-stone-200 dark:from-slate-700 dark:via-slate-800 dark:to-slate-700" />
        )}
        {thumbUrl ? (
          <img
            src={thumbUrl}
            alt={book.title}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            decoding={priority ? 'sync' : 'async'}
            width={300}
            height={450}
            onLoad={handleLoad}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-amber-50 to-amber-100/60 dark:from-amber-900/20 dark:to-slate-900">
            <BookOpen className="w-8 h-8 text-amber-500/60" />
            <p className="text-[9px] text-center px-2 line-clamp-3 text-stone-500 dark:text-slate-400">{book.title}</p>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-500 text-white px-2 py-1 rounded-full shadow-sm">
            <BookOpen className="w-2.5 h-2.5" /> Baca
          </span>
        </div>
      </div>
      <h3 className="text-xs sm:text-sm font-semibold line-clamp-2 mb-0.5 leading-snug transition-colors
                     text-stone-800 group-hover:text-amber-600 dark:text-slate-100 dark:group-hover:text-amber-400">
        {book.title}
      </h3>
      <p className="text-[10px] sm:text-xs text-stone-400 dark:text-slate-500 line-clamp-1">
        {book.authorNames || book.author || 'Anonim'}
      </p>
    </Link>
  )
})
BookCard.displayName = 'BookCard'

// ─────────────────────────────────────────────────────────────────────────────
// ZineCard — emerald accent
// BUG-1 FIX: rendering dikontrol dari parent (loadingZines guard)
// ─────────────────────────────────────────────────────────────────────────────
const ZineCard = memo(({ zine, priority = false }) => {
  const [loaded, setLoaded] = useState(false)
  const thumbUrl = getWikimediaThumb(zine.coverImageUrl, 300)
  const handleLoad = useCallback(() => setLoaded(true), [])

  return (
    <Link
      to={`/zine/${zine.slug || zine.id}`}
      className="group flex-shrink-0 w-36 sm:w-44 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-xl"
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl mb-3 shadow-md border transition-all duration-300
                      bg-stone-100 border-stone-200
                      group-hover:shadow-emerald-200/60 group-hover:border-emerald-400/60
                      dark:bg-slate-800 dark:border-slate-700
                      dark:shadow-black/30 dark:group-hover:shadow-emerald-900/40 dark:group-hover:border-emerald-500/50">
        {!loaded && thumbUrl && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-stone-200 via-stone-100 to-stone-200 dark:from-slate-700 dark:via-slate-800 dark:to-slate-700" />
        )}
        {thumbUrl ? (
          <img
            src={thumbUrl}
            alt={zine.title}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            decoding={priority ? 'sync' : 'async'}
            width={300}
            height={450}
            onLoad={handleLoad}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-emerald-50 to-teal-100/60 dark:from-emerald-900/20 dark:to-slate-900">
            <Layers className="w-8 h-8 text-emerald-500/60" />
            <p className="text-[9px] text-center px-2 line-clamp-3 text-stone-500 dark:text-slate-400">{zine.title}</p>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-500 text-white px-2 py-1 rounded-full shadow-sm">
            <Layers className="w-2.5 h-2.5" /> Baca
          </span>
        </div>
      </div>
      <h3 className="text-xs sm:text-sm font-semibold line-clamp-2 mb-0.5 leading-snug transition-colors
                     text-stone-800 group-hover:text-emerald-600 dark:text-slate-100 dark:group-hover:text-emerald-400">
        {zine.subtitle ? `${zine.title} ${zine.subtitle}` : zine.title}
      </h3>
      <p className="text-[10px] sm:text-xs text-stone-400 dark:text-slate-500 line-clamp-1">
        {zine.authorNames || zine.author || zine.firstPublisher || zine.publisher || 'Anonim'}
      </p>
    </Link>
  )
})
ZineCard.displayName = 'ZineCard'

// ─────────────────────────────────────────────────────────────────────────────
// FilmCard — blue accent
// ─────────────────────────────────────────────────────────────────────────────
const FilmCard = memo(({ film, priority = false }) => {
  const [loaded, setLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)
  const rawPosterUrl = getFilmPoster(film)
  const thumbUrl = rawPosterUrl ? getWikimediaThumb(rawPosterUrl, 300) : null
  const year = film.tahunRilis
    ? (typeof film.tahunRilis === 'string' && film.tahunRilis.length === 4
        ? film.tahunRilis
        : new Date(film.tahunRilis).getFullYear())
    : null
  const showImage = thumbUrl && !imgError

  const handleError = useCallback((e) => {
    if (rawPosterUrl && e.target.src !== rawPosterUrl) { e.target.src = rawPosterUrl; return }
    setImgError(true); setLoaded(false)
  }, [rawPosterUrl])

  const handleLoad = useCallback(() => setLoaded(true), [])

  return (
    <Link
      to={`/film/${film.slug || film.id}`}
      className="group flex-shrink-0 w-56 sm:w-64 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl"
    >
      <div className="relative aspect-video overflow-hidden rounded-xl mb-3 shadow-md border transition-all duration-300
                      bg-stone-100 border-stone-200
                      group-hover:shadow-blue-200/60 group-hover:border-blue-300
                      dark:bg-slate-800 dark:border-slate-700
                      dark:shadow-black/30 dark:group-hover:shadow-blue-900/40 dark:group-hover:border-blue-700/60">
        {showImage && !loaded && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-stone-200 via-stone-100 to-stone-200 dark:from-slate-700 dark:via-slate-800 dark:to-slate-700" />
        )}
        {showImage ? (
          <img
            src={thumbUrl}
            alt={film.judul}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            decoding={priority ? 'sync' : 'async'}
            width={300}
            height={450}
            onLoad={handleLoad}
            onError={handleError}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-blue-50 to-blue-100/60 dark:from-blue-950 dark:to-slate-900">
            <Film className="w-8 h-8 text-blue-500/60" />
            <p className="text-[9px] text-center px-2 line-clamp-3 text-stone-500 dark:text-slate-400">{film.judul}</p>
          </div>
        )}
        {year && (
          <div className="absolute top-2 right-2 bg-black/50 dark:bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
            {year}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-blue-500 text-white px-2 py-1 rounded-full shadow-sm">
            <Film className="w-2.5 h-2.5" /> Tonton
          </span>
        </div>
      </div>
      <h3 className="text-xs sm:text-sm font-semibold line-clamp-2 mb-0.5 leading-snug transition-colors
                     text-stone-800 group-hover:text-blue-600 dark:text-slate-100 dark:group-hover:text-blue-400">
        {film.judul}
      </h3>
      <p className="text-[10px] sm:text-xs text-stone-400 dark:text-slate-500">{year || '—'}</p>
    </Link>
  )
})
FilmCard.displayName = 'FilmCard'

// ─────────────────────────────────────────────────────────────────────────────
// NewspaperCard — violet accent
// ─────────────────────────────────────────────────────────────────────────────
const NewspaperCard = memo(({ article }) => {
  const sourceName = article.sourceName || article.source?.name || null
  const category = article.categoryName || article.category
  return (
    <Link
      to={`/koran/${article.category}/${article.publishDate}/${article.slug}`}
      className="group flex-shrink-0 w-64 sm:w-72 rounded-xl p-5 border transition-all duration-300
                 bg-white border-stone-200 shadow-sm
                 hover:border-violet-400 hover:shadow-lg hover:shadow-violet-100/80
                 dark:bg-slate-900 dark:border-slate-700 dark:shadow-none
                 dark:hover:border-violet-500/60 dark:hover:shadow-violet-900/20
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full
                         text-violet-600 bg-violet-50 border border-violet-200
                         dark:text-violet-400 dark:bg-violet-500/10 dark:border-violet-700/50">
          {category}
        </span>
        <span className="text-[10px] text-stone-400 dark:text-slate-500">
          {article.dateFormatted || article.publishDate}
        </span>
      </div>
      <div className="w-full h-px mb-3 bg-gradient-to-r from-violet-300 to-transparent dark:from-violet-500/40" />
      <h3
        className="text-sm font-bold line-clamp-3 leading-relaxed mb-3 transition-colors
                   text-stone-800 group-hover:text-violet-700 dark:text-slate-200 dark:group-hover:text-violet-300"
        style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
        {article.title}
      </h3>
      {sourceName && (
        <p className="text-[10px] flex items-center gap-1 text-stone-400 dark:text-slate-500">
          <Newspaper className="w-3 h-3 flex-shrink-0" />{sourceName}
        </p>
      )}
    </Link>
  )
})
NewspaperCard.displayName = 'NewspaperCard'

// ─────────────────────────────────────────────────────────────────────────────
// EmptyState — komponen generik untuk semua seksi kosong
// ─────────────────────────────────────────────────────────────────────────────
const EmptyState = memo(({ icon: Icon, color, message, linkTo, linkLabel }) => (
  <div className="flex-1 flex flex-col items-center justify-center py-14 text-center min-w-[200px]">
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 ${color.bg}`}>
      <Icon className={`w-7 h-7 opacity-40 ${color.text}`} />
    </div>
    <p className="text-sm text-stone-400 dark:text-slate-500 mb-3">{message}</p>
    {linkTo && (
      <Link to={linkTo} className={`text-xs font-semibold hover:underline ${color.text}`}>
        {linkLabel} →
      </Link>
    )}
  </div>
))
EmptyState.displayName = 'EmptyState'

// ─────────────────────────────────────────────────────────────────────────────
// SectionHeader — INP: scroll handler pakai useCallback
// ─────────────────────────────────────────────────────────────────────────────
const SectionHeader = memo(({
  icon: Icon, title, subtitle,
  accentText, accentBg, accentBorder, accentBtn,
  actionPath, scrollRef
}) => {
  const scroll = useCallback(
    (d) => scrollRef?.current?.scrollBy({ left: d === 'left' ? -500 : 500, behavior: 'smooth' }),
    [scrollRef]
  )
  return (
    <div className={`flex items-center justify-between mb-5 gap-4 pl-4 border-l-4 ${accentBorder}`}>
      <div className="flex items-center gap-3 min-w-0">
        {Icon && (
          <div className={`hidden sm:flex p-2 rounded-lg flex-shrink-0 ${accentBg}`}>
            <Icon className={`w-4 h-4 ${accentText}`} />
          </div>
        )}
        <div className="min-w-0">
          <h2 className="font-serif text-xl sm:text-2xl font-bold leading-none text-stone-900 dark:text-slate-50">
            {title}
          </h2>
          {subtitle && <p className="text-xs mt-0.5 text-stone-500 dark:text-slate-400">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {actionPath && (
          <Link
            to={actionPath}
            className={`text-xs font-semibold uppercase tracking-wider hover:opacity-70 transition-opacity whitespace-nowrap ${accentText}`}>
            Lihat Semua
          </Link>
        )}
        {scrollRef && (
          <div className="hidden lg:flex gap-1.5">
            {(['left', 'right'] ).map(dir => (
              <button
                key={dir}
                onClick={() => scroll(dir)}
                aria-label={`Geser ${dir === 'left' ? 'kiri' : 'kanan'}`}
                className={`p-1.5 rounded-lg border transition-all
                            bg-white border-stone-200 text-stone-500
                            dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400
                            ${accentBtn}`}>
                {dir === 'left' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
})
SectionHeader.displayName = 'SectionHeader'

// INP: will-change agar browser siapkan compositing layer
const ScrollRow = memo(({ children, scrollRef, label }) => (
  <div
    ref={scrollRef}
    role="list"
    aria-label={label}
    className="flex gap-4 sm:gap-5 overflow-x-auto pb-3 snap-x snap-mandatory"
    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', willChange: 'scroll-position' }}>
    {children}
  </div>
))
ScrollRow.displayName = 'ScrollRow'

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
const HomePage = () => {
  const [books,     setBooks]     = useState({ popular: [], new: [] })
  const [zines,     setZines]     = useState({ latest: [] })
  const [films,     setFilms]     = useState({ popular: [] })
  const [newspaper, setNewspaper] = useState({ trending: [] })

  const [loadingBooks,     setLoadingBooks]     = useState(true)
  const [loadingZines,     setLoadingZines]     = useState(true)
  const [loadingFilms,     setLoadingFilms]     = useState(true)
  const [loadingNewspaper, setLoadingNewspaper] = useState(true)

  // INP: startTransition agar update data dari fetch tidak blok frame interaksi
  const [, startTransition] = useTransition()

  const newBooksRef = useRef(null)
  const popBooksRef = useRef(null)
  const zinesRef    = useRef(null)
  const filmsRef    = useRef(null)
  const koranRef    = useRef(null)

  useEffect(() => {
    // ── Books ──────────────────────────────────────────────────────────────
    const fetchBooks = async () => {
      try {
        const [pop, nw] = await Promise.all([
          bookService.getBooks({ page: 1, limit: 16, sortField: 'viewCount', sortOrder: 'DESC' }),
          bookService.getBooks({ page: 1, limit: 16, sortField: 'updateAt',  sortOrder: 'DESC' }),
        ])
        const map = (r) => (r.data?.list || r.data?.data || []).map(b => ({
          ...b, cover_image: b.coverImageUrl || b.cover_image || b.coverImage || b.image
        }))
        startTransition(() => setBooks({ popular: map(pop), new: map(nw) }))
      } catch (err) { console.error('Error fetching books:', err) }
      finally { setLoadingBooks(false) }
    }

    // ── Zines ──────────────────────────────────────────────────────────────
    const fetchZines = async () => {
      try {
        const res = await zineService.getZines({ page: 1, limit: 16, sortField: 'updateAt', sortOrder: 'DESC' })
        startTransition(() => setZines({ latest: res.data?.data || [] }))
      } catch (err) { console.error('Error fetching zines:', err) }
      finally { setLoadingZines(false) }
    }

    // ── Films ──────────────────────────────────────────────────────────────
    const fetchFilms = async () => {
      try {
        const res = await filmService.getFilms({ page: 0, size: 16, sortField: 'tahunRilis', sortOrder: 'DESC' })
        startTransition(() => setFilms({ popular: res.data?.data || [] }))
      } catch (err) { console.error('Error fetching films:', err) }
      finally { setLoadingFilms(false) }
    }

    // ── Newspaper ──────────────────────────────────────────────────────────
    const fetchNewspaper = async () => {
      try {
        const res = await api.get('/newspapers/trending', { params: { days: 30, limit: 10 } })
        let trending = res.data?.data || []
        if (!trending.length) trending = await fetchArticlesFromCategories(10)
        startTransition(() => setNewspaper({ trending }))
      } catch {
        try {
          const trending = await fetchArticlesFromCategories(10)
          startTransition(() => setNewspaper({ trending }))
        } catch (err2) { console.error('Error fetching newspaper:', err2) }
      } finally { setLoadingNewspaper(false) }
    }

    fetchBooks()
    fetchZines()
    fetchFilms()
    fetchNewspaper()
  }, []) // eslint-disable-line

  const structuredData = combineStructuredData(
    generateWebsiteStructuredData(),
    generateOrganizationStructuredData()
  )

  return (
    <>
      <SEO
        title="Perpustakaan Digital — Perpustakaan Domain Publik dan yang Terbengkalai dan yang Terdegradasi"
        description="Temukan buku, koran, majalah, zine dan film domain publik dan yang terbengkalai dan yang terdegradasi. Masa silaM menghadirkan kembali semuanya."
        url="/"
        type="website"
        keywords="buku gratis, zine, majalah digital, domain publik, perpustakaan digital, buku klasik indonesia, literasi digital, arsip koran"
        structuredData={structuredData}
        image="/og-image.jpg"
      />

      <div className="min-h-screen transition-colors duration-300 bg-stone-50 dark:bg-slate-950">

        {/* ── Featured Banner ───────────────────────────────────────────── */}
        <FeaturedBanner
          books={books.popular}
          films={films.popular}
          articles={newspaper.trending}
          zines={zines.latest}
        />

        {/* ════════════════════════════════════════════════════════════
            BUKU TERBARU — amber  (above fold, no content-visibility)
        ════════════════════════════════════════════════════════════ */}
        <section
          aria-labelledby="section-buku-terbaru"
          className="container mx-auto px-4 sm:px-6 mt-6 sm:mt-14 lg:mt-16 pb-2"
        >
          <SectionHeader
            icon={BookOpen}
            title="Buku Terbaru dan Terupdate"
            accentText={ACCENTS.book.text}
            accentBg={ACCENTS.book.bg}
            accentBorder={ACCENTS.book.border}
            accentBtn={ACCENTS.book.btn}
            actionPath="/buku?sortField=updateAt&sortOrder=DESC"
            scrollRef={newBooksRef}
          />
          <ScrollRow scrollRef={newBooksRef} label="Daftar buku terbaru">
            {loadingBooks
              ? Array.from({ length: 8 }, (_, i) => <SkeletonCard key={i} />)
              : books.new.length > 0
                ? books.new.map((b, i) => (
                    <BookCard key={b.id || i} book={b} priority={i < 2} />
                  ))
                : <EmptyState
                    icon={BookOpen}
                    color={ACCENTS.book}
                    message="Belum ada buku tersedia"
                    linkTo="/buku"
                    linkLabel="Jelajahi Koleksi Buku"
                  />
            }
          </ScrollRow>
        </section>

        {/* ════════════════════════════════════════════════════════════
            BUKU TERPOPULER — amber
        ════════════════════════════════════════════════════════════ */}
        <section
          aria-labelledby="section-buku-populer"
          className="container mx-auto px-4 sm:px-6 mt-6 sm:mt-14 lg:mt-16 pb-2"
        >
          <SectionHeader
            icon={BookOpen}
            title="Buku Terpopuler"
            accentText={ACCENTS.book.text}
            accentBg={ACCENTS.book.bg}
            accentBorder={ACCENTS.book.border}
            accentBtn={ACCENTS.book.btn}
            actionPath="/buku?sortField=viewCount&sortOrder=DESC"
            scrollRef={popBooksRef}
          />
          <ScrollRow scrollRef={popBooksRef} label="Daftar buku terpopuler">
            {loadingBooks
              ? Array.from({ length: 8 }, (_, i) => <SkeletonCard key={i} />)
              : books.popular.length > 0
                ? books.popular.map((b, i) => (
                    <BookCard key={b.id || i} book={b} priority={i < 2} />
                  ))
                : <EmptyState
                    icon={BookOpen}
                    color={ACCENTS.book}
                    message="Belum ada buku tersedia"
                    linkTo="/buku"
                    linkLabel="Jelajahi Koleksi Buku"
                  />
            }
          </ScrollRow>
        </section>

        {/* ════════════════════════════════════════════════════════════
            ZINE — emerald
            BUG-1 FIX: guard loadingZines SEBELUM cek .length
            Tanpa guard ini, saat loading array masih [] sehingga
            `zines.latest.length > 0` false → empty state muncul.
        ════════════════════════════════════════════════════════════ */}
        <section
          aria-labelledby="section-zine"
          className="container mx-auto px-4 sm:px-6 mt-6 sm:mt-14 lg:mt-16 pb-2"
          style={{ contentVisibility: 'auto', containIntrinsicSize: '0 380px' }}
        >
          <SectionHeader
            icon={Layers}
            title="Zine & Magazine"
            accentText={ACCENTS.zine.text}
            accentBg={ACCENTS.zine.bg}
            accentBorder={ACCENTS.zine.border}
            accentBtn={ACCENTS.zine.btn}
            actionPath="/zine"
            scrollRef={zinesRef}
          />
          <ScrollRow scrollRef={zinesRef} label="Daftar zine dan magazine">
            {/* ▼ FIX: loadingZines dicek PERTAMA — baru cek isi array */}
            {loadingZines
              ? Array.from({ length: 8 }, (_, i) => <SkeletonCard key={i} />)
              : zines.latest.length > 0
                ? zines.latest.map((z, i) => (
                    <ZineCard key={z.id || i} zine={z} priority={i < 2} />
                  ))
                : <EmptyState
                    icon={Layers}
                    color={ACCENTS.zine}
                    message="Belum ada zine tersedia"
                    linkTo="/zine"
                    linkLabel="Jelajahi Koleksi Zine"
                  />
            }
          </ScrollRow>
        </section>

        {/* ════════════════════════════════════════════════════════════
            FILM — blue
        ════════════════════════════════════════════════════════════ */}
        <section
          aria-labelledby="section-film"
          className="container mx-auto px-4 sm:px-6 mt-6 sm:mt-14 lg:mt-16 pb-2"
          style={{ contentVisibility: 'auto', containIntrinsicSize: '0 380px' }}
        >
          <SectionHeader
            icon={Film}
            title="Film"
            accentText={ACCENTS.film.text}
            accentBg={ACCENTS.film.bg}
            accentBorder={ACCENTS.film.border}
            accentBtn={ACCENTS.film.btn}
            actionPath="/film"
            scrollRef={filmsRef}
          />
          <ScrollRow scrollRef={filmsRef} label="Daftar film">
            {loadingFilms
              ? Array.from({ length: 8 }, (_, i) => <SkeletonCard key={i} />)
              : films.popular.length > 0
                ? films.popular.map((f, i) => (
                    <FilmCard key={f.id || i} film={f} priority={i < 2} />
                  ))
                : <EmptyState
                    icon={Film}
                    color={ACCENTS.film}
                    message="Belum ada film tersedia"
                    linkTo="/film"
                    linkLabel="Jelajahi Kumpulan Film"
                  />
            }
          </ScrollRow>
        </section>

        {/* ════════════════════════════════════════════════════════════
            KORAN — violet  (paling jauh di bawah fold)
        ════════════════════════════════════════════════════════════ */}
        <section
          aria-labelledby="section-koran"
          className="container mx-auto px-4 sm:px-6 mt-6 sm:mt-14 lg:mt-16 pb-2"
          style={{ contentVisibility: 'auto', containIntrinsicSize: '0 320px' }}
        >
          <SectionHeader
            icon={Newspaper}
            title="Arsip Koran"
            accentText={ACCENTS.newspaper.text}
            accentBg={ACCENTS.newspaper.bg}
            accentBorder={ACCENTS.newspaper.border}
            accentBtn={ACCENTS.newspaper.btn}
            actionPath="/koran"
            scrollRef={koranRef}
          />
          <ScrollRow scrollRef={koranRef} label="Arsip artikel koran">
            {loadingNewspaper
              ? Array.from({ length: 5 }, (_, i) => <SkeletonNewspaper key={i} />)
              : newspaper.trending.length > 0
                ? newspaper.trending.map((art, i) => (
                    <NewspaperCard key={art.id || i} article={art} />
                  ))
                : <EmptyState
                    icon={Newspaper}
                    color={ACCENTS.newspaper}
                    message="Belum ada artikel koran"
                    linkTo="/koran"
                    linkLabel="Jelajahi Arsip Koran"
                  />
            }
          </ScrollRow>
        </section>

        {/* Bottom spacer */}
        <div className="pb-12 sm:pb-16" />
      </div>
    </>
  )
}

export default HomePage
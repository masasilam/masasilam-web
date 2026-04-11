// src/pages/HomePage.jsx

import { useState, useEffect, memo, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, ChevronLeft, ChevronRight, Film, Newspaper } from 'lucide-react'
import bookService from '../services/bookService'
import { filmService } from '../services/filmService'
import api from '../services/api'
import SEO from '../components/Common/SEO'
import FeaturedBanner from '../components/Home/FeaturedBanner'
import {
  generateWebsiteStructuredData,
  generateOrganizationStructuredData,
  combineStructuredData
} from '../utils/seoHelpers'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
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
  return (
    film.posterUrl ||
    film.poster_url ||
    film.poster ||
    film.thumbnailUrl ||
    film.thumbnail ||
    film.coverUrl ||
    film.imageUrl ||
    film.image ||
    (typeof film.imageUrls === 'string' && film.imageUrls
      ? film.imageUrls.split(',')[0].trim()
      : null) ||
    null
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// BookCard  — warna selaras dengan BookDetailPage (amber / primary)
// ─────────────────────────────────────────────────────────────────────────────
const BookCard = memo(({ book }) => {
  const [loaded, setLoaded] = useState(false)
  const thumbUrl = getWikimediaThumb(book.cover_image, 300)

  return (
    <Link to={`/buku/${book.slug || book.id}`} className="group flex-shrink-0 w-36 sm:w-44">
      <div className="relative aspect-[2/3] bg-gray-100 dark:bg-gray-800 overflow-hidden rounded-xl mb-3 shadow-md dark:shadow-black/30 border border-gray-200 dark:border-gray-700">
        {!loaded && thumbUrl && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-800 dark:to-gray-700" />
        )}
        {thumbUrl ? (
          <img
            src={thumbUrl}
            alt={book.title}
            loading="lazy"
            decoding="async"
            onLoad={() => setLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950 dark:to-gray-900">
            <BookOpen className="w-8 h-8 text-amber-500/60" />
            <p className="text-[9px] text-center text-gray-500 dark:text-gray-400 px-2 line-clamp-3">{book.title}</p>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-500 text-gray-950 px-2 py-1 rounded-full">
            <BookOpen className="w-2.5 h-2.5" /> Baca
          </span>
        </div>
      </div>
      {/* Judul & author — warna hover selaras BookDetailPage */}
      <h3 className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 mb-0.5 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-snug">
        {book.title}
      </h3>
      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-500 line-clamp-1">
        {book.authorNames || book.author || 'Anonim'}
      </p>
    </Link>
  )
})
BookCard.displayName = 'BookCard'

// ─────────────────────────────────────────────────────────────────────────────
// FilmCard  — warna selaras dengan FilmDetailPage (blue)
// ─────────────────────────────────────────────────────────────────────────────
const FilmCard = memo(({ film }) => {
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

  const handleError = (e) => {
    if (rawPosterUrl && e.target.src !== rawPosterUrl) {
      e.target.src = rawPosterUrl
      return
    }
    setImgError(true)
    setLoaded(false)
  }

  return (
    <Link to={`/film/${film.slug || film.id}`} className="group flex-shrink-0 w-36 sm:w-44">
      <div className="relative aspect-[2/3] bg-gray-100 dark:bg-gray-800 overflow-hidden rounded-xl mb-3 shadow-md dark:shadow-black/30 border border-gray-200 dark:border-gray-700">
        {showImage && !loaded && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-800 dark:to-gray-700" />
        )}
        {showImage ? (
          <img
            src={thumbUrl}
            alt={film.judul}
            loading="lazy"
            decoding="async"
            onLoad={() => setLoaded(true)}
            onError={handleError}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-gray-900">
            <Film className="w-8 h-8 text-blue-500/60" />
            <p className="text-[9px] text-center text-gray-500 dark:text-gray-400 px-2 line-clamp-3">{film.judul}</p>
          </div>
        )}
        {year && (
          <div className="absolute top-2 right-2 bg-black/50 dark:bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
            {year}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-blue-500 text-white px-2 py-1 rounded-full">
            <Film className="w-2.5 h-2.5" /> Tonton
          </span>
        </div>
      </div>
      {/* Judul & tahun — warna hover selaras FilmDetailPage */}
      <h3 className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 mb-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
        {film.judul}
      </h3>
      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-500">{year || '—'}</p>
    </Link>
  )
})
FilmCard.displayName = 'FilmCard'

// ─────────────────────────────────────────────────────────────────────────────
// NewspaperCard
// ─────────────────────────────────────────────────────────────────────────────
const NewspaperCard = memo(({ article }) => {
  const sourceName = article.sourceName || article.source?.name || null
  const category = article.categoryName || article.category

  return (
    <Link
      to={`/koran/${article.category}/${article.publishDate}/${article.slug}`}
      className="group flex-shrink-0 w-64 sm:w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-violet-400 dark:hover:border-violet-500/60 hover:shadow-lg dark:hover:shadow-violet-900/20 transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 px-2 py-0.5 rounded-full">
          {category}
        </span>
        <span className="text-[10px] text-gray-400 dark:text-gray-600">{article.dateFormatted || article.publishDate}</span>
      </div>
      <div className="w-full h-px bg-gradient-to-r from-violet-300 dark:from-violet-500/40 to-transparent mb-3" />
      <h3
        className="text-sm font-bold text-gray-800 dark:text-gray-200 line-clamp-3 group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors leading-relaxed mb-3"
        style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
      >
        {article.title}
      </h3>
      {sourceName && (
        <p className="text-[10px] text-gray-400 dark:text-gray-600 flex items-center gap-1">
          <Newspaper className="w-3 h-3" />{sourceName}
        </p>
      )}
    </Link>
  )
})
NewspaperCard.displayName = 'NewspaperCard'

// ─────────────────────────────────────────────────────────────────────────────
// Skeletons
// ─────────────────────────────────────────────────────────────────────────────
const SkeletonCard = memo(() => (
  <div className="flex-shrink-0 w-36 sm:w-44 animate-pulse">
    <div className="aspect-[2/3] bg-gray-200 dark:bg-gray-800 rounded-xl mb-3" />
    <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-full mb-1.5" />
    <div className="h-2.5 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
  </div>
))
SkeletonCard.displayName = 'SkeletonCard'

const SkeletonNewspaper = memo(() => (
  <div className="flex-shrink-0 w-64 sm:w-72 animate-pulse bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3" />
    <div className="h-px bg-gray-200 dark:bg-gray-700 rounded mb-3" />
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1.5" />
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5 mb-1.5" />
    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-3" />
  </div>
))
SkeletonNewspaper.displayName = 'SkeletonNewspaper'

// ─────────────────────────────────────────────────────────────────────────────
// Section header
// accentClass: Tailwind text color class agar konsisten dengan detail pages
// ─────────────────────────────────────────────────────────────────────────────
const SectionHeader = ({ icon: Icon, title, subtitle, accentClass, actionPath, scrollRef }) => {
  const scroll = useCallback((d) =>
    scrollRef?.current?.scrollBy({ left: d === 'left' ? -500 : 500, behavior: 'smooth' }), [scrollRef])

  return (
    <div className="flex items-center justify-between mb-5 gap-4">
      <div className="flex items-center gap-3 min-w-0">
        {Icon && <Icon className={`w-5 h-5 flex-shrink-0 ${accentClass}`} />}
        <div className="min-w-0">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-none">
            {title}
          </h2>
          {subtitle && <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {actionPath && (
          <Link
            to={actionPath}
            className={`text-xs font-semibold uppercase tracking-wider hover:opacity-70 transition-opacity whitespace-nowrap ${accentClass}`}
          >
            Lihat Semua
          </Link>
        )}
        {scrollRef && (
          <div className="hidden lg:flex gap-1.5">
            <button
              onClick={() => scroll('left')}
              className="p-1.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-1.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Scroll row
// ─────────────────────────────────────────────────────────────────────────────
const ScrollRow = ({ children, scrollRef }) => (
  <div
    ref={scrollRef}
    className="flex gap-4 sm:gap-5 overflow-x-auto pb-3"
    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
  >
    {children}
  </div>
)

// ─────────────────────────────────────────────────────────────────────────────
// Newspaper fallback
// ─────────────────────────────────────────────────────────────────────────────
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
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
const HomePage = () => {
  const [books, setBooks] = useState({ popular: [], new: [] })
  const [films, setFilms] = useState({ popular: [] })
  const [newspaper, setNewspaper] = useState({ trending: [] })

  const [loadingBooks, setLoadingBooks] = useState(true)
  const [loadingFilms, setLoadingFilms] = useState(true)
  const [loadingNewspaper, setLoadingNewspaper] = useState(true)

  const newBooksRef = useRef(null)
  const popBooksRef = useRef(null)
  const filmsRef    = useRef(null)
  const koranRef    = useRef(null)

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const [pop, nw] = await Promise.all([
          bookService.getBooks({ page: 1, limit: 16, sortField: 'viewCount', sortOrder: 'DESC' }),
          bookService.getBooks({ page: 1, limit: 16, sortField: 'updateAt',  sortOrder: 'DESC' }),
        ])
        const map = (r) => (r.data?.list || r.data?.data || []).map(b => ({
          ...b, cover_image: b.coverImageUrl || b.cover_image || b.coverImage || b.image
        }))
        setBooks({ popular: map(pop), new: map(nw) })
      } catch (err) { console.error('Error fetching books:', err) }
        finally     { setLoadingBooks(false) }
    }

    const fetchFilms = async () => {
      try {
        const res = await filmService.getFilms({ page: 0, size: 16 })
        const filmList = res.data?.data || []
        setFilms({ popular: filmList })
      } catch (err) { console.error('Error fetching films:', err) }
        finally     { setLoadingFilms(false) }
    }

    const fetchNewspaper = async () => {
      try {
        const res = await api.get('/newspapers/trending', { params: { days: 30, limit: 10 } })
        let trending = res.data?.data || []
        if (!trending.length) trending = await fetchArticlesFromCategories(10)
        setNewspaper({ trending })
      } catch {
        try   { setNewspaper({ trending: await fetchArticlesFromCategories(10) }) }
        catch (err2) { console.error('Error fetching newspaper:', err2) }
      } finally { setLoadingNewspaper(false) }
    }

    fetchBooks(); fetchFilms(); fetchNewspaper()
  }, [])

  const websiteSchema      = generateWebsiteStructuredData()
  const organizationSchema = generateOrganizationStructuredData()
  const structuredData     = combineStructuredData(websiteSchema, organizationSchema)

  return (
    <>
      <SEO
        title="MasasilaM — Perpustakaan Digital Buku Domain Publik"
        description="Perpustakaan digital gratis untuk buku klasik domain publik. Akses buku-buku dengan fitur smart reading, bookmark, dan highlight."
        url="/"
        type="website"
        keywords="buku gratis, domain publik, perpustakaan digital, buku klasik indonesia, literasi digital, baca buku online gratis"
        structuredData={structuredData}
        image="/og-image.jpg"
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">

        {/* ── Featured Banner ──────────────────────────────────────── */}
        <FeaturedBanner books={books.popular} films={films.popular} articles={newspaper.trending} />

        {/* ── Buku Baru ────────────────────────────────────────────── */}

        <section className="container mx-auto px-4 sm:px-6 mt-14 sm:mt-16 pb-2">
          <SectionHeader
            title="Buku Terbaru dan Terupdate"
            accentClass="text-amber-500 dark:text-amber-400"
            actionPath="/buku?sortField=updateAt&sortOrder=DESC"
            scrollRef={newBooksRef}
          />
          <ScrollRow scrollRef={newBooksRef}>
            {loadingBooks
              ? Array.from({ length: 8 }, (_, i) => <SkeletonCard key={i} />)
              : books.new.map((b, i) => <BookCard key={b.id || i} book={b} />)
            }
          </ScrollRow>
        </section>


        {/* ── Buku Terpopuler ──────────────────────────────────────── */}
        <section className="container mx-auto px-4 sm:px-6 mt-14 sm:mt-16 pb-2">
          <SectionHeader
            title="Buku Terpopuler"
            accentClass="text-amber-500 dark:text-amber-400"
            actionPath="/buku?sortField=viewCount&sortOrder=DESC"
            scrollRef={popBooksRef}
          />
          <ScrollRow scrollRef={popBooksRef}>
            {loadingBooks
              ? Array.from({ length: 8 }, (_, i) => <SkeletonCard key={i} />)
              : books.popular.map((b, i) => <BookCard key={b.id || i} book={b} />)
            }
          </ScrollRow>
        </section>


        {/* ── Film Klasik ──────────────────────────────────────────── */}
        <section className="container mx-auto px-4 sm:px-6 mt-14 sm:mt-16 pb-2">
          <SectionHeader
            title="Film Klasik"
            accentClass="text-blue-500 dark:text-blue-400"
            actionPath="/film"
            scrollRef={filmsRef}
          />
          <ScrollRow scrollRef={filmsRef}>
            {loadingFilms
              ? Array.from({ length: 8 }, (_, i) => <SkeletonCard key={i} />)
              : films.popular.map((f, i) => <FilmCard key={f.id || i} film={f} />)
            }
          </ScrollRow>
        </section>


        {/* ── Arsip Koran ──────────────────────────────────────────── */}
        <section className="container mx-auto px-4 sm:px-6 mt-14 sm:mt-16 pb-12 sm:pb-16">
          <SectionHeader
            title="Arsip Koran"
            accentClass="text-violet-600 dark:text-violet-400"
            actionPath="/koran"
            scrollRef={koranRef}
          />
          <ScrollRow scrollRef={koranRef}>
            {loadingNewspaper
              ? Array.from({ length: 5 }, (_, i) => <SkeletonNewspaper key={i} />)
              : newspaper.trending.length > 0
                ? newspaper.trending.map((art, i) => <NewspaperCard key={art.id || i} article={art} />)
                : (
                  <div className="flex-1 text-center py-12 text-gray-400 dark:text-gray-600">
                    <Newspaper className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Belum ada artikel koran</p>
                  </div>
                )
            }
          </ScrollRow>
        </section>

      </div>
    </>
  )
}

export default HomePage
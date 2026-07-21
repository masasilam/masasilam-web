import { useState, useEffect, useCallback, memo, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import bookService from '../services/bookService'
import { filmService } from '../services/filmService'
import zineService from '../services/zineService'
import api from '../services/api'
import SEO from '../components/Common/SEO'
import {
  Search, BookOpen, Film, Layers, Newspaper,
  User, Tag, Building2, Globe, Calendar,
  ChevronLeft, ChevronRight, X, AlertCircle,
  Sparkles,
} from 'lucide-react'

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
    film.posterUrl || film.poster_url || film.poster ||
    film.thumbnailUrl || film.thumbnail || film.coverUrl ||
    film.imageUrl || film.image ||
    (typeof film.imageUrls === 'string' && film.imageUrls
      ? film.imageUrls.split(',')[0].trim() : null) || null
  )
}

const detectMatchFields = (item, query, type) => {
  if (!query) return []
  const q = query.toLowerCase()
  const matches = []
  const check = (value, label) => {
    if (value && String(value).toLowerCase().includes(q)) matches.push(label)
  }
  if (type === 'book') {
    check(item.title, 'Judul'); check(item.authorNames, 'Pengarang'); check(item.author, 'Pengarang')
    check(item.publisher, 'Penerbit'); check(item.genre, 'Genre'); check(item.language, 'Bahasa')
    check(item.description, 'Deskripsi'); check(item.isbn, 'ISBN')
  } else if (type === 'film') {
    check(item.judul, 'Judul'); check(item.sutradara, 'Sutradara'); check(item.pemain, 'Pemain')
    check(item.genre, 'Genre'); check(item.genres, 'Genre'); check(item.produser, 'Produser')
    check(item.negara, 'Negara'); check(item.deskripsi, 'Deskripsi'); check(item.sinopsis, 'Sinopsis')
    check(String(item.tahunRilis || ''), 'Tahun')
  } else if (type === 'zine') {
    check(item.title, 'Judul'); check(item.authorNames, 'Pengarang'); check(item.author, 'Pengarang')
    check(item.publisher, 'Penerbit'); check(item.genre, 'Genre'); check(item.genres, 'Genre')
    check(item.description, 'Deskripsi'); check(String(item.volume || ''), 'Volume'); check(item.language, 'Bahasa')
  } else if (type === 'newspaper') {
    check(item.title, 'Judul'); check(item.summary, 'Ringkasan'); check(item.excerpt, 'Kutipan')
    check(item.categoryName, 'Kategori'); check(item.category, 'Kategori')
    check(item.sourceName, 'Sumber'); check(item.author, 'Penulis')
  }
  return [...new Set(matches)]
}

// ─────────────────────────────────────────────────────────────────────────────
// Accent config
// ─────────────────────────────────────────────────────────────────────────────
const ACCENTS = {
  book: {
    text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10',
    border: 'border-amber-500 dark:border-amber-400',
    hover: 'hover:border-amber-400 hover:shadow-amber-100/80 dark:hover:border-amber-500/60 dark:hover:shadow-amber-900/20',
    ring: 'focus-visible:ring-amber-400',
    badge: 'bg-amber-100 border-amber-300 text-amber-700 dark:bg-amber-900/20 dark:border-amber-700/50 dark:text-amber-300',
  },
  film: {
    text: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10',
    border: 'border-blue-500 dark:border-blue-400',
    hover: 'hover:border-blue-300 hover:shadow-blue-100/80 dark:hover:border-blue-700/60 dark:hover:shadow-blue-900/20',
    ring: 'focus-visible:ring-blue-400',
    badge: 'bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700/50 dark:text-blue-300',
  },
  zine: {
    text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    border: 'border-emerald-500 dark:border-emerald-400',
    hover: 'hover:border-emerald-400 hover:shadow-emerald-100/80 dark:hover:border-emerald-500/60 dark:hover:shadow-emerald-900/20',
    ring: 'focus-visible:ring-emerald-400',
    badge: 'bg-emerald-100 border-emerald-300 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-700/50 dark:text-emerald-300',
  },
  newspaper: {
    text: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-500/10',
    border: 'border-violet-500 dark:border-violet-400',
    hover: 'hover:border-violet-400 hover:shadow-violet-100/80 dark:hover:border-violet-500/60 dark:hover:shadow-violet-900/20',
    ring: 'focus-visible:ring-violet-400',
    badge: 'bg-violet-100 border-violet-300 text-violet-700 dark:bg-violet-900/20 dark:border-violet-700/50 dark:text-violet-300',
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// MatchChips
// ─────────────────────────────────────────────────────────────────────────────
const MatchChips = memo(({ fields, accent }) => {
  if (!fields || fields.length === 0) return null
  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {fields.slice(0, 4).map(f => (
        <span key={f} className={`inline-flex items-center gap-0.5 text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border ${accent.badge}`}>
          <Sparkles className="w-2 h-2 opacity-70" />{f}
        </span>
      ))}
    </div>
  )
})
MatchChips.displayName = 'MatchChips'

// ─────────────────────────────────────────────────────────────────────────────
// Cards
// ─────────────────────────────────────────────────────────────────────────────
const BookCard = memo(({ book, query }) => {
  const [loaded, setLoaded] = useState(false)
  const thumbUrl = getWikimediaThumb(book.cover_image || book.coverImageUrl || book.coverImage || book.image, 300)
  const acc = ACCENTS.book
  const matchFields = detectMatchFields(book, query, 'book')
  return (
    <Link to={`/buku/${book.slug || book.id}`}
      className={`group flex gap-3 p-3 rounded-xl border transition-all duration-200 shadow-sm bg-white border-stone-200 dark:bg-slate-900 dark:border-slate-700 hover:shadow-md ${acc.hover} focus:outline-none ${acc.ring} focus-visible:ring-2`}>
      <div className="flex-shrink-0 w-14 sm:w-16">
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden border bg-stone-100 border-stone-200 dark:bg-slate-800 dark:border-slate-700">
          {thumbUrl ? (<>
            {!loaded && <div className="absolute inset-0 animate-pulse bg-stone-200 dark:bg-slate-700" />}
            <img src={thumbUrl} alt={book.title} className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${loaded ? 'opacity-100' : 'opacity-0'}`} loading="lazy" onLoad={() => setLoaded(true)} />
          </>) : (
            <div className="w-full h-full flex items-center justify-center bg-amber-50 dark:bg-amber-900/20">
              <BookOpen className="w-5 h-5 text-amber-400/60" />
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest mb-1 px-1.5 py-0.5 rounded ${acc.badge} border`}>
          <BookOpen className="w-2.5 h-2.5" /> Buku
        </div>
        <h3 className="text-sm font-bold line-clamp-2 leading-snug mb-0.5 text-stone-900 dark:text-slate-100 transition-colors">{book.title}</h3>
        {(book.authorNames || book.author) && (
          <p className="text-xs flex items-center gap-1 text-stone-500 dark:text-slate-400 line-clamp-1 mb-0.5">
            <User className="w-3 h-3 flex-shrink-0" />{book.authorNames || book.author}
          </p>
        )}
        {book.publisher && (
          <p className="text-xs flex items-center gap-1 text-stone-400 dark:text-slate-500 line-clamp-1 mb-0.5">
            <Building2 className="w-3 h-3 flex-shrink-0" />{book.publisher}
          </p>
        )}
        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
          {book.genre && <p className="text-xs flex items-center gap-1 text-stone-400 dark:text-slate-500"><Tag className="w-3 h-3 flex-shrink-0" />{book.genre}</p>}
          {book.language && <p className="text-xs flex items-center gap-1 text-stone-400 dark:text-slate-500"><Globe className="w-3 h-3 flex-shrink-0" />{book.language}</p>}
        </div>
        <MatchChips fields={matchFields} accent={acc} />
      </div>
    </Link>
  )
})
BookCard.displayName = 'BookCard'

const FilmCard = memo(({ film, query }) => {
  const [loaded, setLoaded] = useState(false)
  const [imgErr, setImgErr] = useState(false)
  const rawPoster = getFilmPoster(film)
  const thumbUrl = rawPoster ? getWikimediaThumb(rawPoster, 300) : null
  const acc = ACCENTS.film
  const matchFields = detectMatchFields(film, query, 'film')
  const year = film.tahunRilis
    ? (typeof film.tahunRilis === 'string' && film.tahunRilis.length === 4
      ? film.tahunRilis : new Date(film.tahunRilis).getFullYear()) : null
  return (
    <Link to={`/film/${film.slug || film.id}`}
      className={`group flex gap-3 p-3 rounded-xl border transition-all duration-200 shadow-sm bg-white border-stone-200 dark:bg-slate-900 dark:border-slate-700 hover:shadow-md ${acc.hover} focus:outline-none ${acc.ring} focus-visible:ring-2`}>
      <div className="flex-shrink-0 w-14 sm:w-16">
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden border bg-stone-100 border-stone-200 dark:bg-slate-800 dark:border-slate-700">
          {thumbUrl && !imgErr ? (<>
            {!loaded && <div className="absolute inset-0 animate-pulse bg-stone-200 dark:bg-slate-700" />}
            <img src={thumbUrl} alt={film.judul} className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${loaded ? 'opacity-100' : 'opacity-0'}`} loading="lazy"
              onLoad={() => setLoaded(true)}
              onError={(e) => { if (rawPoster && e.target.src !== rawPoster) { e.target.src = rawPoster; return } setImgErr(true) }} />
          </>) : (
            <div className="w-full h-full flex items-center justify-center bg-blue-50 dark:bg-blue-900/20">
              <Film className="w-5 h-5 text-blue-400/60" />
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest mb-1 px-1.5 py-0.5 rounded ${acc.badge} border`}>
          <Film className="w-2.5 h-2.5" /> Film
        </div>
        <h3 className="text-sm font-bold line-clamp-2 leading-snug mb-0.5 text-stone-900 dark:text-slate-100 transition-colors">{film.judul}</h3>
        {film.sutradara && <p className="text-xs flex items-center gap-1 text-stone-500 dark:text-slate-400 line-clamp-1 mb-0.5"><User className="w-3 h-3 flex-shrink-0" />{film.sutradara}</p>}
        {film.pemain && <p className="text-xs flex items-center gap-1 text-stone-400 dark:text-slate-500 line-clamp-1 mb-0.5"><User className="w-3 h-3 flex-shrink-0 opacity-60" /><span className="line-clamp-1">{film.pemain}</span></p>}
        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
          {(film.genre || film.genres) && <p className="text-xs flex items-center gap-1 text-stone-400 dark:text-slate-500"><Tag className="w-3 h-3 flex-shrink-0" />{film.genre || film.genres}</p>}
          {year && <p className="text-xs flex items-center gap-1 text-stone-400 dark:text-slate-500"><Calendar className="w-3 h-3 flex-shrink-0" />{year}</p>}
          {film.negara && <p className="text-xs flex items-center gap-1 text-stone-400 dark:text-slate-500"><Globe className="w-3 h-3 flex-shrink-0" />{film.negara}</p>}
        </div>
        <MatchChips fields={matchFields} accent={acc} />
      </div>
    </Link>
  )
})
FilmCard.displayName = 'FilmCard'

const ZineCard = memo(({ zine, query }) => {
  const [loaded, setLoaded] = useState(false)
  const thumbUrl = getWikimediaThumb(zine.coverImageUrl || zine.cover_image || zine.image, 300)
  const acc = ACCENTS.zine
  const matchFields = detectMatchFields(zine, query, 'zine')
  return (
    <Link to={`/zine/${zine.slug || zine.id}`}
      className={`group flex gap-3 p-3 rounded-xl border transition-all duration-200 shadow-sm bg-white border-stone-200 dark:bg-slate-900 dark:border-slate-700 hover:shadow-md ${acc.hover} focus:outline-none ${acc.ring} focus-visible:ring-2`}>
      <div className="flex-shrink-0 w-14 sm:w-16">
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden border bg-stone-100 border-stone-200 dark:bg-slate-800 dark:border-slate-700">
          {thumbUrl ? (<>
            {!loaded && <div className="absolute inset-0 animate-pulse bg-stone-200 dark:bg-slate-700" />}
            <img src={thumbUrl} alt={zine.title} className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${loaded ? 'opacity-100' : 'opacity-0'}`} loading="lazy" onLoad={() => setLoaded(true)} />
          </>) : (
            <div className="w-full h-full flex items-center justify-center bg-emerald-50 dark:bg-emerald-900/20">
              <Layers className="w-5 h-5 text-emerald-400/60" />
            </div>
          )}
          {zine.volume && <div className="absolute top-1 right-1 text-[8px] font-black bg-black/50 text-white px-1 py-0.5 rounded backdrop-blur-sm">V{zine.volume}</div>}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest mb-1 px-1.5 py-0.5 rounded ${acc.badge} border`}>
          <Layers className="w-2.5 h-2.5" /> Zine
        </div>
        <h3 className="text-sm font-bold line-clamp-2 leading-snug mb-0.5 text-stone-900 dark:text-slate-100 transition-colors">{zine.title}</h3>
        {(zine.authorNames || zine.author) && <p className="text-xs flex items-center gap-1 text-stone-500 dark:text-slate-400 line-clamp-1 mb-0.5"><User className="w-3 h-3 flex-shrink-0" />{zine.authorNames || zine.author}</p>}
        {zine.publisher && <p className="text-xs flex items-center gap-1 text-stone-400 dark:text-slate-500 line-clamp-1 mb-0.5"><Building2 className="w-3 h-3 flex-shrink-0" />{zine.publisher}</p>}
        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
          {(zine.genre || zine.genres) && <p className="text-xs flex items-center gap-1 text-stone-400 dark:text-slate-500"><Tag className="w-3 h-3 flex-shrink-0" />{zine.genre || zine.genres}</p>}
          {zine.language && <p className="text-xs flex items-center gap-1 text-stone-400 dark:text-slate-500"><Globe className="w-3 h-3 flex-shrink-0" />{zine.language}</p>}
        </div>
        <MatchChips fields={matchFields} accent={acc} />
      </div>
    </Link>
  )
})
ZineCard.displayName = 'ZineCard'

const NewspaperCard = memo(({ article, query }) => {
  const acc = ACCENTS.newspaper
  const matchFields = detectMatchFields(article, query, 'newspaper')
  return (
    <Link to={`/koran/${article.category}/${article.publishDate}/${article.slug}`}
      className={`group flex gap-3 p-3 rounded-xl border transition-all duration-200 shadow-sm bg-white border-stone-200 dark:bg-slate-900 dark:border-slate-700 hover:shadow-md ${acc.hover} focus:outline-none ${acc.ring} focus-visible:ring-2`}>
      <div className="flex-shrink-0 w-14 sm:w-16">
        <div className="aspect-[2/3] rounded-lg flex items-center justify-center border bg-violet-50 border-violet-200 dark:bg-violet-900/20 dark:border-violet-800">
          <Newspaper className="w-6 h-6 text-violet-400/60" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${acc.badge} border`}>
            <Newspaper className="w-2.5 h-2.5" /> Koran
          </div>
          {(article.dateFormatted || article.publishDate) && (
            <span className="text-[10px] text-stone-400 dark:text-slate-500 flex-shrink-0">{article.dateFormatted || article.publishDate}</span>
          )}
        </div>
        <h3 className="text-sm font-bold line-clamp-2 leading-snug mb-0.5 text-stone-900 dark:text-slate-100 transition-colors" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>{article.title}</h3>
        {article.author && <p className="text-xs flex items-center gap-1 text-stone-500 dark:text-slate-400 line-clamp-1 mb-0.5"><User className="w-3 h-3 flex-shrink-0" />{article.author}</p>}
        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
          {(article.categoryName || article.category) && <p className="text-xs flex items-center gap-1 text-stone-400 dark:text-slate-500"><Tag className="w-3 h-3 flex-shrink-0" />{article.categoryName || article.category}</p>}
          {(article.sourceName || article.source?.name) && <p className="text-xs flex items-center gap-1 text-stone-400 dark:text-slate-500 line-clamp-1"><Building2 className="w-3 h-3 flex-shrink-0" />{article.sourceName || article.source?.name}</p>}
        </div>
        {(article.summary || article.excerpt) && <p className="text-xs text-stone-400 dark:text-slate-500 line-clamp-1 mt-0.5">{article.summary || article.excerpt}</p>}
        <MatchChips fields={matchFields} accent={acc} />
      </div>
    </Link>
  )
})
NewspaperCard.displayName = 'NewspaperCard'

const SkeletonCard = memo(() => (
  <div className="flex gap-3 p-3 rounded-xl border border-stone-200 dark:border-slate-700 animate-pulse bg-white dark:bg-slate-900">
    <div className="flex-shrink-0 w-14 sm:w-16"><div className="aspect-[2/3] rounded-lg bg-stone-200 dark:bg-slate-700" /></div>
    <div className="flex-1 space-y-2 py-1">
      <div className="h-2.5 rounded-full w-1/4 bg-stone-200 dark:bg-slate-700" />
      <div className="h-3.5 rounded-full w-full bg-stone-200 dark:bg-slate-700" />
      <div className="h-3 rounded-full w-3/4 bg-stone-200 dark:bg-slate-700" />
      <div className="h-2.5 rounded-full w-1/2 bg-stone-200 dark:bg-slate-700" />
    </div>
  </div>
))
SkeletonCard.displayName = 'SkeletonCard'

// ─────────────────────────────────────────────────────────────────────────────
// SectionBlock
// ─────────────────────────────────────────────────────────────────────────────
const SECTION_ICONS = { book: BookOpen, film: Film, zine: Layers, newspaper: Newspaper }

const SectionBlock = memo(({ type, items, query, loading, count }) => {
  const acc = ACCENTS[type]
  const Icon = SECTION_ICONS[type]
  const LABELS = { book: 'Buku', film: 'Film', zine: 'Zine & Majalah', newspaper: 'Arsip Koran' }
  if (!loading && items.length === 0) return null
  return (
    <section className="mb-8 sm:mb-10">
      <div className={`flex items-center justify-between mb-3 sm:mb-4 pl-3 sm:pl-4 border-l-4 ${acc.border}`}>
        <div className="flex items-center gap-2.5">
          <div className={`hidden sm:flex p-1.5 rounded-lg ${acc.bg}`}>
            <Icon className={`w-4 h-4 ${acc.text}`} />
          </div>
          <div>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900 dark:text-slate-50">{LABELS[type]}</h2>
            {!loading && <p className="text-xs text-stone-400 dark:text-slate-500">{count > items.length ? `${items.length} dari ${count.toLocaleString('id-ID')} hasil` : `${count} hasil`}</p>}
          </div>
        </div>
        {!loading && count > 0 && (() => {
          const paths = {
            book: `/buku?searchTitle=${encodeURIComponent(query)}`,
            film: `/film?q=${encodeURIComponent(query)}`,
            zine: `/zine?searchTitle=${encodeURIComponent(query)}`,
            newspaper: `/koran?q=${encodeURIComponent(query)}`,
          }
          return <Link to={paths[type]} className={`text-xs font-semibold uppercase tracking-wider transition-opacity hover:opacity-70 ${acc.text}`}>Lihat Semua →</Link>
        })()}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
        {loading
          ? Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)
          : type === 'book' ? items.map((item, i) => <BookCard key={item.id || i} book={item} query={query} />)
          : type === 'film' ? items.map((item, i) => <FilmCard key={item.id || i} film={item} query={query} />)
          : type === 'zine' ? items.map((item, i) => <ZineCard key={item.id || i} zine={item} query={query} />)
          : items.map((item, i) => <NewspaperCard key={item.id || i} article={item} query={query} />)
        }
      </div>
    </section>
  )
})
SectionBlock.displayName = 'SectionBlock'

// ─────────────────────────────────────────────────────────────────────────────
// TabBar
// ─────────────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'all', label: 'Semua', icon: Search },
  { id: 'book', label: 'Buku', icon: BookOpen },
  { id: 'film', label: 'Film', icon: Film },
  { id: 'zine', label: 'Zine', icon: Layers },
  { id: 'newspaper', label: 'Koran', icon: Newspaper },
]

const TabBar = memo(({ active, counts, onChange }) => {
  const totalAll = Object.values(counts).reduce((s, v) => s + v, 0)
  return (
    <div className="flex gap-1 overflow-x-auto pb-1 mb-6 sm:mb-8" style={{ scrollbarWidth: 'none' }} role="tablist">
      {TABS.map(({ id, label, icon: Icon }) => {
        const isActive = active === id
        const count = id === 'all' ? totalAll : (counts[id] || 0)
        const acc = id !== 'all' ? ACCENTS[id] : null
        return (
          <button key={id} role="tab" aria-selected={isActive} onClick={() => onChange(id)}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1
              ${isActive
                ? acc ? `${acc.bg} ${acc.border} ${acc.text}` : 'bg-stone-900 border-stone-900 text-white dark:bg-slate-100 dark:border-slate-100 dark:text-slate-900'
                : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600'
              }`}>
            <Icon className="w-3.5 h-3.5 flex-shrink-0" />
            {label}
            {count > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 dark:bg-black/20' : 'bg-stone-100 text-stone-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                {count > 999 ? '999+' : count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
})
TabBar.displayName = 'TabBar'

// ─────────────────────────────────────────────────────────────────────────────
// Helper: merge + deduplicate results dari multiple parallel requests
// ─────────────────────────────────────────────────────────────────────────────
const mergeResults = (settledResults, getList, getId) => {
  const seen = new Set()
  const merged = []
  let maxTotal = 0
  for (const r of settledResults) {
    if (r.status !== 'fulfilled') continue
    const list = getList(r.value) || []
    const total = r.value?.data?.total || r.value?.data?.totalElements || 0
    if (total > maxTotal) maxTotal = total
    for (const item of list) {
      const key = getId(item)
      if (!seen.has(key)) { seen.add(key); merged.push(item) }
    }
  }
  return { merged, maxTotal }
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
const SearchResultsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = (searchParams.get('q') || '').trim()
  const activeTab = searchParams.get('tab') || 'all'
  const currentPage = parseInt(searchParams.get('page') || '1', 10)

  const [results, setResults] = useState({ book: [], film: [], zine: [], newspaper: [] })
  const [totals, setTotals] = useState({ book: 0, film: 0, zine: 0, newspaper: 0 })
  const [loading, setLoading] = useState({ book: false, film: false, zine: false, newspaper: false })
  const [totalPages, setTotalPages] = useState(1)
  const [error, setError] = useState(null)

  const setTab = useCallback((tab) => {
    setSearchParams(p => { const n = new URLSearchParams(p); n.set('tab', tab); n.delete('page'); return n })
  }, [setSearchParams])

  const goToPage = useCallback((page) => {
    setSearchParams(p => {
      const n = new URLSearchParams(p)
      if (page === 1) n.delete('page'); else n.set('page', String(page))
      return n
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [setSearchParams])

  const LIMIT_PER_TYPE = 12
  const LIMIT_ALL = 6

  // ── fetchAll — FIXED: parallel per-field requests + dedup ────────────────
  const fetchAll = useCallback(async () => {
    if (!query) return

    const isAll = activeTab === 'all'
    const limit = isAll ? LIMIT_ALL : LIMIT_PER_TYPE
    const page = isAll ? 1 : currentPage

    setError(null)

    // ── Book ──────────────────────────────────────────────────────────────
    // Kirim 3 request terpisah: by judul, by penulis, by genre — lalu gabungkan
    if (isAll || activeTab === 'book') {
      setLoading(p => ({ ...p, book: true }))
      try {
        const baseBookParams = { page, limit, sortField: 'viewCount', sortOrder: 'DESC' }
        const [byTitle, byAuthor, byGenre] = await Promise.allSettled([
          bookService.getBooks({ ...baseBookParams, searchTitle: query }),
          bookService.getBooks({ ...baseBookParams, authorName: query }),
          bookService.getBooks({ ...baseBookParams, genre: query }),
        ])
        const getBookList = r => r?.data?.data || r?.data?.list || []
        const { merged, maxTotal } = mergeResults(
          [byTitle, byAuthor, byGenre],
          getBookList,
          item => item.id || item.slug
        )
        const sliced = merged.slice(0, limit)
        // Total: jumlahkan unik estimasi (pakai terbesar sebagai estimasi konservatif)
        const totalEst = Math.max(
          byTitle.value?.data?.total || 0,
          byAuthor.value?.data?.total || 0,
          byGenre.value?.data?.total || 0,
          merged.length
        )
        setResults(p => ({ ...p, book: sliced }))
        setTotals(p => ({ ...p, book: totalEst }))
        if (!isAll) setTotalPages(Math.ceil(totalEst / limit))
      } catch (e) {
        console.error('Book search error:', e)
        setResults(p => ({ ...p, book: [] }))
      } finally {
        setLoading(p => ({ ...p, book: false }))
      }
    }

    // ── Film ──────────────────────────────────────────────────────────────
    // Coba searchFilms (full-text) dulu, kalau gagal fallback ke parallel by field
    if (isAll || activeTab === 'film') {
      setLoading(p => ({ ...p, film: true }))
      try {
        let filmList = []
        let filmTotal = 0

        try {
          // Kalau filmService.searchFilms ada dan support full-text
          const res = await filmService.searchFilms(query, page - 1, limit)
          filmList = res.data?.data || res.data?.list || []
          filmTotal = res.data?.total || res.data?.totalElements || filmList.length
        } catch {
          // Fallback: parallel by judul / sutradara / genre
          const [byJudul, bySutradara, byGenre] = await Promise.allSettled([
            filmService.getFilms({ page: page - 1, size: limit, judul: query }),
            filmService.getFilms({ page: page - 1, size: limit, sutradara: query }),
            filmService.getFilms({ page: page - 1, size: limit, genre: query }),
          ])
          const getFilmList = r => r?.data?.data || r?.data?.list || []
          const { merged, maxTotal } = mergeResults(
            [byJudul, bySutradara, byGenre],
            getFilmList,
            item => item.id || item.slug
          )
          filmList = merged
          filmTotal = maxTotal || merged.length
        }

        const sliced = filmList.slice(0, limit)
        setResults(p => ({ ...p, film: sliced }))
        setTotals(p => ({ ...p, film: filmTotal }))
        if (!isAll) setTotalPages(Math.ceil(filmTotal / limit))
      } catch (e) {
        console.error('Film search error:', e)
        setResults(p => ({ ...p, film: [] }))
      } finally {
        setLoading(p => ({ ...p, film: false }))
      }
    }

    // ── Zine ──────────────────────────────────────────────────────────────
    // Sama dengan Book: parallel by judul / penulis / genre
    if (isAll || activeTab === 'zine') {
      setLoading(p => ({ ...p, zine: true }))
      try {
        const baseZineParams = { page, limit, sortField: 'updateAt', sortOrder: 'DESC' }
        const [byTitle, byAuthor, byGenre] = await Promise.allSettled([
          zineService.getZines({ ...baseZineParams, searchTitle: query }),
          zineService.getZines({ ...baseZineParams, authorName: query }),
          zineService.getZines({ ...baseZineParams, genre: query }),
        ])
        const getZineList = r => r?.data?.data || r?.data?.list || []
        const { merged, maxTotal } = mergeResults(
          [byTitle, byAuthor, byGenre],
          getZineList,
          item => item.id || item.slug
        )
        const sliced = merged.slice(0, limit)
        const totalEst = Math.max(
          byTitle.value?.data?.total || 0,
          byAuthor.value?.data?.total || 0,
          byGenre.value?.data?.total || 0,
          merged.length
        )
        setResults(p => ({ ...p, zine: sliced }))
        setTotals(p => ({ ...p, zine: totalEst }))
        if (!isAll) setTotalPages(Math.ceil(totalEst / limit))
      } catch (e) {
        console.error('Zine search error:', e)
        setResults(p => ({ ...p, zine: [] }))
      } finally {
        setLoading(p => ({ ...p, zine: false }))
      }
    }

    // ── Newspaper ─────────────────────────────────────────────────────────
    // Sudah benar (full-text endpoint), tidak diubah
    if (isAll || activeTab === 'newspaper') {
      setLoading(p => ({ ...p, newspaper: true }))
      try {
        const res = await api.get('/newspapers/search', {
          params: { q: query, search: query, keyword: query, page, limit }
        }).catch(() =>
          api.get('/newspapers/trending', { params: { q: query, limit } })
        )
        const list = res.data?.data?.list || res.data?.data || res.data?.list || []
        const total = res.data?.data?.total || res.data?.total || list.length
        setResults(p => ({ ...p, newspaper: list }))
        setTotals(p => ({ ...p, newspaper: total }))
        if (!isAll) setTotalPages(Math.ceil(total / limit))
      } catch (e) {
        console.error('Newspaper search error:', e)
        setResults(p => ({ ...p, newspaper: [] }))
      } finally {
        setLoading(p => ({ ...p, newspaper: false }))
      }
    }
  }, [query, activeTab, currentPage])

  useEffect(() => {
    fetchAll()
    // eslint-disable-next-line
  }, [query, activeTab, currentPage])

  const isAnyLoading = Object.values(loading).some(Boolean)
  const totalAll = Object.values(totals).reduce((s, v) => s + v, 0)
  const hasAnyResults = Object.values(results).some(arr => arr.length > 0)

  const pageTitle = query ? `Hasil Pencarian: "${query}" — Perpustakaan Digital` : 'Cari Konten — Perpustakaan Digital MasasilaM'
  const pageDesc = query
    ? `Ditemukan ${totalAll.toLocaleString('id-ID')} hasil untuk "${query}" meliputi buku, film, zine, dan koran.`
    : 'Cari buku, film, zine, dan koran di perpustakaan digital MasasilaM.'

  if (!query) {
    return (
      <>
        <SEO title="Cari Konten — Perpustakaan Digital" description={pageDesc} url="/cari" type="website" />
        <div className="min-h-screen flex items-center justify-center py-16 bg-stone-50 dark:bg-slate-950">
          <div className="text-center px-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-stone-100 dark:bg-slate-800">
              <Search className="w-8 h-8 text-stone-300 dark:text-slate-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2 text-stone-900 dark:text-slate-50">Cari Konten</h1>
            <p className="text-stone-500 dark:text-slate-400 text-sm">Ketik kata kunci di bilah pencarian untuk mulai</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <SEO title={pageTitle} description={pageDesc}
        url={`/cari?q=${encodeURIComponent(query)}${currentPage > 1 ? `&page=${currentPage}` : ''}`}
        type="website"
        keywords={`${query}, buku, film, zine, koran, pencarian, perpustakaan digital`}
        noindex={totalAll === 0} />

      <div className="min-h-screen py-4 sm:py-8 transition-colors duration-300 bg-stone-50 dark:bg-slate-950">
        <div className="container mx-auto px-3 sm:px-4 max-w-6xl">

          {/* Header */}
          <header className="mb-5 sm:mb-7">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-stone-900 dark:bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Search className="w-5 h-5 text-white dark:text-slate-900" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-stone-900 dark:text-slate-50 leading-tight">
                  Hasil untuk{' '}
                  <span className="relative">
                    <span className="relative z-10">"{query}"</span>
                    <span className="absolute bottom-0 left-0 right-0 h-2 sm:h-2.5 bg-amber-300/40 dark:bg-amber-500/20 rounded" />
                  </span>
                </h1>
                {!isAnyLoading ? (
                  totalAll > 0
                    ? <p className="text-sm text-stone-500 dark:text-slate-400 mt-1">Ditemukan <span className="font-semibold text-stone-800 dark:text-slate-200">{totalAll.toLocaleString('id-ID')}</span> konten</p>
                    : <p className="text-sm text-stone-500 dark:text-slate-400 mt-1">Tidak ada hasil yang cocok</p>
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-3 h-3 rounded-full border-2 border-stone-400 border-t-transparent animate-spin" />
                    <span className="text-sm text-stone-400 dark:text-slate-500">Mencari…</span>
                  </div>
                )}
              </div>
              <Link to="/cari"
                className="flex-shrink-0 p-2 rounded-lg border transition-all text-stone-400 hover:text-stone-700 hover:border-stone-300 border-stone-200 bg-white dark:bg-slate-900 dark:border-slate-700 dark:hover:text-slate-200"
                aria-label="Hapus pencarian">
                <X className="w-4 h-4" />
              </Link>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5 text-xs text-stone-400 dark:text-slate-500">
              <span>Dicari di:</span>
              {[{ icon: BookOpen, label: 'judul' }, { icon: User, label: 'pengarang / sutradara' }, { icon: Tag, label: 'genre' }, { icon: Building2, label: 'penerbit' }].map(({ icon: Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-1"><Icon className="w-3 h-3" />{label}</span>
              ))}
            </div>
          </header>

          <TabBar active={activeTab} counts={totals} onChange={setTab} />

          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl border mb-6 bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" /><p className="text-sm">{error}</p>
            </div>
          )}

          {activeTab === 'all' ? (
            <>
              <SectionBlock type="book"      items={results.book}      query={query} loading={loading.book}      count={totals.book} />
              <SectionBlock type="film"      items={results.film}      query={query} loading={loading.film}      count={totals.film} />
              <SectionBlock type="zine"      items={results.zine}      query={query} loading={loading.zine}      count={totals.zine} />
              <SectionBlock type="newspaper" items={results.newspaper} query={query} loading={loading.newspaper} count={totals.newspaper} />
              {!isAnyLoading && !hasAnyResults && (
                <div className="text-center py-16 sm:py-20">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-stone-100 dark:bg-slate-800">
                    <Search className="w-7 h-7 text-stone-300 dark:text-slate-600" />
                  </div>
                  <p className="text-base font-semibold text-stone-500 dark:text-slate-400 mb-1">Tidak ditemukan konten untuk "{query}"</p>
                  <p className="text-sm text-stone-400 dark:text-slate-500">Coba kata kunci lain atau periksa ejaan</p>
                </div>
              )}
            </>
          ) : (
            <>
              {activeTab === 'book'      && <SectionBlock type="book"      items={results.book}      query={query} loading={loading.book}      count={totals.book} />}
              {activeTab === 'film'      && <SectionBlock type="film"      items={results.film}      query={query} loading={loading.film}      count={totals.film} />}
              {activeTab === 'zine'      && <SectionBlock type="zine"      items={results.zine}      query={query} loading={loading.zine}      count={totals.zine} />}
              {activeTab === 'newspaper' && <SectionBlock type="newspaper" items={results.newspaper} query={query} loading={loading.newspaper} count={totals.newspaper} />}

              {!isAnyLoading && totalPages > 1 && (
                <nav className="mt-8 flex items-center justify-center gap-2 flex-wrap" aria-label="Navigasi halaman">
                  <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-all disabled:opacity-40 disabled:pointer-events-none bg-white border-stone-200 text-stone-600 hover:border-stone-400 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-500">
                    <ChevronLeft className="w-4 h-4" /><span className="hidden sm:inline">Sebelumnya</span>
                  </button>
                  <span className="px-4 py-2 text-sm text-stone-500 dark:text-slate-400">
                    Halaman <span className="font-semibold text-stone-800 dark:text-slate-200">{currentPage}</span> dari <span className="font-semibold text-stone-800 dark:text-slate-200">{totalPages}</span>
                  </span>
                  <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-all disabled:opacity-40 disabled:pointer-events-none bg-white border-stone-200 text-stone-600 hover:border-stone-400 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-500">
                    <span className="hidden sm:inline">Berikutnya</span><ChevronRight className="w-4 h-4" />
                  </button>
                </nav>
              )}
            </>
          )}

          <div className="pb-12 sm:pb-16" />
        </div>
      </div>
    </>
  )
}

export default SearchResultsPage
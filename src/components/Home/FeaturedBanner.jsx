// src/components/Home/FeaturedBanner.jsx
import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Film, Newspaper, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'

// ── Hanya konversi kalau memang URL Wikimedia, sisanya return as-is ──────────
const getWikimediaThumb = (url, w = 800) => {
  if (!url) return null
  // Kalau sudah ada /thumb/ di URL, return langsung
  if (url.includes('/thumb/')) return url
  // Kalau bukan Wikimedia, return URL asli tanpa modifikasi
  if (!url.includes('upload.wikimedia.org')) return url
  const m = url.match(
    /^(https:\/\/upload\.wikimedia\.org\/wikipedia\/(?:commons|[a-z]+)\/)([^/]\/[^/]{2}\/)(.+)$/
  )
  if (!m) return url
  const [, base, hash, filename] = m
  const isSvg = filename.toLowerCase().endsWith('.svg')
  const thumbFilename = isSvg ? `${filename}.png` : filename
  return `${base}thumb/${hash}${filename}/${w}px-${thumbFilename}`
}

// ── Ambil poster film — coba semua field yang mungkin ───────────────────────
const getFilmPoster = (film) => {
  if (!film) return null
  // Coba satu per satu field yang umum dipakai backend
  const candidates = [
    film.posterUrl,
    film.poster_url,
    film.poster,
    film.thumbnailUrl,
    film.thumbnail_url,
    film.thumbnail,
    film.coverUrl,
    film.cover_url,
    film.imageUrl,
    film.image_url,
    film.image,
    film.foto,
    film.gambar,
    // imageUrls bisa berupa string CSV
    typeof film.imageUrls === 'string' && film.imageUrls
      ? film.imageUrls.split(',')[0].trim()
      : null,
    // atau array
    Array.isArray(film.imageUrls) && film.imageUrls.length
      ? film.imageUrls[0]
      : null,
  ]
  return candidates.find(v => v && typeof v === 'string' && v.trim() !== '') || null
}

const TYPE_CONFIG = {
  book: {
    label: 'Buku Pilihan', icon: BookOpen,
    accent: 'text-amber-400',
    gradient: 'from-amber-900/90 via-amber-900/40 to-transparent',
    badgeClass: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    btnClass: 'bg-amber-500 text-gray-950 hover:bg-amber-400',
    link: (item) => `/buku/${item.slug || item.id}`, cta: 'Baca Sekarang',
    fallbackGradient: 'from-amber-950 via-gray-900 to-gray-950',
  },
  film: {
    label: 'Film Klasik', icon: Film,
    accent: 'text-blue-400',
    gradient: 'from-blue-900/90 via-blue-900/40 to-transparent',
    badgeClass: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    btnClass: 'bg-blue-500 text-white hover:bg-blue-400',
    link: (item) => `/film/${item.slug || item.id}`, cta: 'Tonton Film',
    fallbackGradient: 'from-blue-950 via-gray-900 to-gray-950',
  },
  newspaper: {
    label: 'Arsip Koran', icon: Newspaper,
    accent: 'text-violet-400',
    gradient: 'from-violet-900/90 via-violet-900/40 to-transparent',
    badgeClass: 'bg-violet-500/20 text-violet-300 border border-violet-500/30',
    btnClass: 'bg-violet-600 text-white hover:bg-violet-500',
    link: (item) => `/koran/${item.category}/${item.publishDate}/${item.slug}`,
    cta: 'Baca Artikel',
    fallbackGradient: 'from-violet-950 via-gray-900 to-gray-950',
  },
}

const FeaturedBanner = ({ books = [], films = [], articles = [] }) => {
  const [activeIdx, setActiveIdx] = useState(0)
  const [fading, setFading] = useState(false)
  const [bgErrors, setBgErrors] = useState({})
  const [posterErrors, setPosterErrors] = useState({})
  const touchStartX = useRef(null)

  const featured = [
    ...books.slice(0, 2).map(b => ({
      ...b, _type: 'book',
      _image: b.cover_image || b.coverImageUrl || b.coverImage || b.image || null,
      _title: b.title,
      _sub: b.authorNames || b.author || 'Anonim',
      _desc: b.description,
    })),
    ...films.slice(0, 2).map(f => {
      const poster = getFilmPoster(f)
      // DEBUG: hapus setelah poster muncul
      console.log('[FeaturedBanner] film:', f.judul, '| poster:', poster, '| keys:', Object.keys(f).join(', '))
      return {
      ...f, _type: 'film',
      _image: poster,
      _title: f.judul,
      _sub: f.tahunRilis
        ? (typeof f.tahunRilis === 'string' && f.tahunRilis.length === 4
            ? f.tahunRilis : new Date(f.tahunRilis).getFullYear())
        : '',
      _desc: f.deskripsi || f.sinopsis || f.description,
    }}),
    ...articles.slice(0, 1).map(a => ({
      ...a, _type: 'newspaper',
      _image: null, _title: a.title,  // ← Added comma here
      _sub: a.categoryName || a.category,
      _desc: a.summary || a.excerpt,
    })),
  ].filter(Boolean).slice(0, 5)

  const goTo = useCallback((idx) => {
    if (fading || !featured.length) return
    setFading(true)
    setTimeout(() => { setActiveIdx(idx); setFading(false) }, 260)
  }, [fading, featured.length])

  useEffect(() => {
    if (featured.length <= 1) return
    const t = setInterval(() => goTo((activeIdx + 1) % featured.length), 6000)
    return () => clearInterval(t)
  }, [activeIdx, featured.length, goTo])

  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX
  }, [])

  const handleTouchEnd = useCallback((e) => {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) {
      if (diff > 0) goTo((activeIdx + 1) % featured.length)
      else goTo((activeIdx - 1 + featured.length) % featured.length)
    }
    touchStartX.current = null
  }, [activeIdx, featured.length, goTo])

  if (!featured.length) return null

  const item = featured[activeIdx]
  const cfg = TYPE_CONFIG[item._type]
  const Icon = cfg.icon
  const rawImage = item._image

  // FIX: getWikimediaThumb sekarang aman untuk semua URL — return as-is jika bukan Wikimedia
  // Untuk non-Wikimedia URL, getWikimediaThumb return URL asli — jadi selalu gunakan langsung
  const bgThumb     = rawImage ? getWikimediaThumb(rawImage, 900) : null
  const posterThumb = rawImage ? getWikimediaThumb(rawImage, 400) : null

  return (
    <div
      className="relative w-full overflow-hidden bg-gray-900 mb-6 sm:mb-10"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Background ──────────────────────────────────────────────────── */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${fading ? 'opacity-0' : 'opacity-100'}`}
        aria-hidden="true"
      >
        {bgThumb ? (
          <img
            key={`bg-${activeIdx}`}
            src={bgThumb}
            alt=""
            className="w-full h-full object-cover object-center"
            style={{ filter: 'blur(6px) brightness(0.25)', transform: 'scale(1.1)' }}
            onError={() => setBgErrors(prev => ({ ...prev, [activeIdx]: true }))}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${cfg.fallbackGradient}`} />
        )}
        <div className={`absolute inset-0 bg-gradient-to-r ${cfg.gradient}`} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-950/10 to-gray-950/60" />
      </div>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <div
        className={`relative z-10 transition-all duration-300 ${
          fading ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
        }`}
      >
        <div className="container mx-auto px-4 sm:px-8 py-8 sm:py-10 flex gap-4 sm:gap-6 items-center">

          {/* Poster */}
          <div className="flex-shrink-0 w-20 sm:w-28 lg:w-36">
            <div className="aspect-[2/3] rounded-lg sm:rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-gray-800">
              {posterThumb ? (
                <img
                  key={`poster-${activeIdx}`}
                  src={posterThumb}
                  alt={item._title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Jika thumb gagal, coba URL asli (untuk URL non-Wikimedia yang sudah sama)
                    if (rawImage && e.target.src !== rawImage) {
                      e.target.src = rawImage
                    } else {
                      setPosterErrors(prev => ({ ...prev, [activeIdx]: true }))
                    }
                  }}
                />
              ) : (
                <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${cfg.fallbackGradient}`}>
                  <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white/20" />
                </div>
              )}
            </div>
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-2.5 ${cfg.badgeClass}`}>
              <Icon className="w-3 h-3" />
              {cfg.label}
            </span>

            <h2 className="font-serif text-xl sm:text-3xl lg:text-4xl font-bold text-white mb-1.5 leading-tight line-clamp-2">
              {item._title}
            </h2>

            {item._sub && (
              <p className={`text-xs sm:text-sm font-semibold mb-1.5 ${cfg.accent}`}>
                {item._sub}
              </p>
            )}

            {item._desc && (
              <p className="text-xs sm:text-sm text-gray-300 line-clamp-2 sm:line-clamp-3 mb-4 max-w-xl leading-relaxed">
                {item._desc}
              </p>
            )}

            <Link
              to={cfg.link(item)}
              className={`inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all hover:scale-105 hover:shadow-lg active:scale-95 ${cfg.btnClass}`}
            >
              {cfg.cta} <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Dots ────────────────────────────────────────────────────────── */}
      {featured.length > 1 && (
        <div className="relative z-20 flex justify-center gap-1.5 pb-4">
          {featured.map((_, i) => (
            <button
              key={i} onClick={() => goTo(i)} aria-label={`Slide ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === activeIdx ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      )}

      {/* ── Arrows ──────────────────────────────────────────────────────── */}
      {featured.length > 1 && (
        <>
          <button
            onClick={() => goTo((activeIdx - 1 + featured.length) % featured.length)}
            aria-label="Sebelumnya"
            className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-20 p-1.5 sm:p-2 rounded-full bg-black/30 hover:bg-black/60 text-white transition-all active:scale-90"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={() => goTo((activeIdx + 1) % featured.length)}
            aria-label="Berikutnya"
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-20 p-1.5 sm:p-2 rounded-full bg-black/30 hover:bg-black/60 text-white transition-all active:scale-90"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </>
      )}
    </div>
  )
}

export default FeaturedBanner
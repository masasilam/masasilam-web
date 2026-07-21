import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen, Film, Newspaper, Layers,
  ArrowRight, ChevronLeft, ChevronRight, Play
} from 'lucide-react'

const getWikimediaThumb = (url, w = 900) => {
  if (!url) return null
  if (url.includes('/thumb/')) return url
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

const TYPE_CONFIG = {
  book: {
    label: 'Buku Pilihan',
    icon: BookOpen,
    color: '#D97706',             // amber-600 — readable di light & dark
    colorDark: '#F59E0B',         // amber-400 untuk dark mode
    colorDim: '#78350F',
    colorMid: '#D97706',
    glow: 'rgba(217,119,6,0.25)',
    // gradient light: warm cream ke putih
    gradientLight: 'linear-gradient(135deg, rgba(254,243,199,0.97) 0%, rgba(255,251,235,0.92) 55%, rgba(255,255,255,0.0) 100%)',
    // gradient dark: tetap gelap seperti sebelumnya
    gradientDark:  'linear-gradient(135deg, rgba(120,53,15,0.95) 0%, rgba(17,24,39,0.85) 60%, transparent 100%)',
    fallbackLight: 'linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 60%, #FFF8E1 100%)',
    fallbackDark:  'linear-gradient(135deg, #78350F 0%, #111827 60%, #030712 100%)',
    badgeBgLight: 'rgba(217,119,6,0.1)',
    badgeBgDark:  'rgba(245,158,11,0.15)',
    badgeBorderLight: 'rgba(217,119,6,0.3)',
    badgeBorderDark:  'rgba(245,158,11,0.35)',
    btnBg: '#D97706',
    btnText: '#ffffff',
    link: (item) => `/buku/${item.slug || item.id}`,
    cta: 'Baca Sekarang',
  },
  film: {
    label: 'Film',
    icon: Film,
    color: '#2563EB',
    colorDark: '#60A5FA',
    colorDim: '#1E3A8A',
    colorMid: '#2563EB',
    glow: 'rgba(37,99,235,0.2)',
    gradientLight: 'linear-gradient(135deg, rgba(219,234,254,0.97) 0%, rgba(239,246,255,0.92) 55%, rgba(255,255,255,0.0) 100%)',
    gradientDark:  'linear-gradient(135deg, rgba(30,58,138,0.95) 0%, rgba(17,24,39,0.85) 60%, transparent 100%)',
    fallbackLight: 'linear-gradient(135deg, #DBEAFE 0%, #EFF6FF 60%, #F0F9FF 100%)',
    fallbackDark:  'linear-gradient(135deg, #1E3A8A 0%, #111827 60%, #030712 100%)',
    badgeBgLight: 'rgba(37,99,235,0.08)',
    badgeBgDark:  'rgba(96,165,250,0.15)',
    badgeBorderLight: 'rgba(37,99,235,0.25)',
    badgeBorderDark:  'rgba(96,165,250,0.35)',
    btnBg: '#2563EB',
    btnText: '#ffffff',
    link: (item) => `/film/${item.slug || item.id}`,
    cta: 'Tonton Film',
  },
  newspaper: {
    label: 'Arsip Koran',
    icon: Newspaper,
    color: '#7C3AED',
    colorDark: '#A78BFA',
    colorDim: '#3B0764',
    colorMid: '#7C3AED',
    glow: 'rgba(124,58,237,0.2)',
    gradientLight: 'linear-gradient(135deg, rgba(237,233,254,0.97) 0%, rgba(245,243,255,0.92) 55%, rgba(255,255,255,0.0) 100%)',
    gradientDark:  'linear-gradient(135deg, rgba(59,7,100,0.95) 0%, rgba(17,24,39,0.85) 60%, transparent 100%)',
    fallbackLight: 'linear-gradient(135deg, #EDE9FE 0%, #F5F3FF 60%, #FAF5FF 100%)',
    fallbackDark:  'linear-gradient(135deg, #3B0764 0%, #111827 60%, #030712 100%)',
    badgeBgLight: 'rgba(124,58,237,0.08)',
    badgeBgDark:  'rgba(167,139,250,0.15)',
    badgeBorderLight: 'rgba(124,58,237,0.25)',
    badgeBorderDark:  'rgba(167,139,250,0.35)',
    btnBg: '#7C3AED',
    btnText: '#ffffff',
    link: (item) => `/koran/${item.category}/${item.publishDate}/${item.slug}`,
    cta: 'Baca Artikel',
  },
  zine: {
    label: 'Zine & Majalah',
    icon: Layers,
    color: '#059669',
    colorDark: '#34D399',
    colorDim: '#064E3B',
    colorMid: '#059669',
    glow: 'rgba(5,150,105,0.2)',
    gradientLight: 'linear-gradient(135deg, rgba(209,250,229,0.97) 0%, rgba(236,253,245,0.92) 55%, rgba(255,255,255,0.0) 100%)',
    gradientDark:  'linear-gradient(135deg, rgba(6,78,59,0.95) 0%, rgba(17,24,39,0.85) 60%, transparent 100%)',
    fallbackLight: 'linear-gradient(135deg, #D1FAE5 0%, #ECFDF5 60%, #F0FDF4 100%)',
    fallbackDark:  'linear-gradient(135deg, #064E3B 0%, #111827 60%, #030712 100%)',
    badgeBgLight: 'rgba(5,150,105,0.08)',
    badgeBgDark:  'rgba(52,211,153,0.15)',
    badgeBorderLight: 'rgba(5,150,105,0.25)',
    badgeBorderDark:  'rgba(52,211,153,0.35)',
    btnBg: '#059669',
    btnText: '#ffffff',
    link: (item) => `/zine/${item.slug || item.id}`,
    cta: 'Baca Zine',
  },
}

// ─── Komponen Utama ───────────────────────────────────────────────────────────
const FeaturedBanner = ({ books = [], films = [], articles = [], zines = [] }) => {
  const [activeIdx, setActiveIdx]       = useState(0)
  const [phase, setPhase]               = useState('visible')
  const [bgLoaded, setBgLoaded]         = useState({})
  const [posterLoaded, setPosterLoaded] = useState({})
  const [posterError, setPosterError]   = useState({})
  const [isPaused, setIsPaused]         = useState(false)

  // PERBAIKAN: deteksi dark mode via matchMedia agar bisa reactive
  const [isDark, setIsDark] = useState(
    () => document.documentElement.classList.contains('dark')
  )
  useEffect(() => {
    const obs = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'))
    })
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])

  const touchStartX = useRef(null)
  const touchStartY = useRef(null)
  const autoplayRef = useRef(null)

  // ── Build featured list ─────────────────────────────────────────────────────
  const featured = [
    ...books.slice(0, 2).map(b => ({
      ...b, _type: 'book',
      _image:  b.cover_image || b.coverImageUrl || b.coverImage || b.image || null,
      _title:  b.title,
      _sub:    b.authorNames || b.author || 'Anonim',
      _desc:   b.description,
      _extra:  null,
    })),
    ...films.slice(0, 2).map(f => ({
      ...f, _type: 'film',
      _image: getFilmPoster(f),
      _title: f.judul,
      _sub:   f.tahunRilis
        ? (typeof f.tahunRilis === 'string' && f.tahunRilis.length === 4
            ? f.tahunRilis : new Date(f.tahunRilis).getFullYear())
        : '',
      _desc:  f.deskripsi || f.sinopsis || f.description,
      _extra: f.genre || f.genres || null,
    })),
    ...articles.slice(0, 1).map(a => ({
      ...a, _type: 'newspaper',
      _image: null,
      _title: a.title,
      _sub:   a.categoryName || a.category,
      _desc:  a.summary || a.excerpt,
      _extra: a.dateFormatted || a.publishDate,
    })),
    ...zines.slice(0, 2).map(z => ({
      ...z, _type: 'zine',
      _image: z.coverImageUrl || z.cover_image || z.coverImage || z.image || null,
      _title: z.title,
      _sub:   z.authorNames || z.author || z.publisher || 'Anonim',
      _desc:  z.description,
      _extra: z.volume ? `Vol. ${z.volume}` : (z.issueNumber || null),
    })),
  ].filter(Boolean).slice(0, 6)

  // ── Transisi slide ──────────────────────────────────────────────────────────
  const goTo = useCallback((idx) => {
    if (phase !== 'visible' || !featured.length) return
    setPhase('out')
    setTimeout(() => {
      setActiveIdx(idx)
      setPhase('in')
      setTimeout(() => setPhase('visible'), 50)
    }, 320)
  }, [phase, featured.length])

  // ── Auto-play ───────────────────────────────────────────────────────────────
  const scheduleNext = useCallback(() => {
    clearTimeout(autoplayRef.current)
    if (featured.length <= 1 || isPaused) return
    autoplayRef.current = setTimeout(() => {
      goTo((activeIdx + 1) % featured.length)
    }, 6500)
  }, [activeIdx, featured.length, isPaused, goTo])

  useEffect(() => {
    scheduleNext()
    return () => clearTimeout(autoplayRef.current)
  }, [scheduleNext])

  // ── Touch / Swipe ───────────────────────────────────────────────────────────
  const onTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }, [])

  const onTouchEnd = useCallback((e) => {
    if (touchStartX.current === null) return
    const dx = touchStartX.current - e.changedTouches[0].clientX
    const dy = Math.abs(touchStartY.current - e.changedTouches[0].clientY)
    if (Math.abs(dx) > 44 && dy < 60) {
      if (dx > 0) goTo((activeIdx + 1) % featured.length)
      else goTo((activeIdx - 1 + featured.length) % featured.length)
    }
    touchStartX.current = null
  }, [activeIdx, featured.length, goTo])

  // ── Keyboard nav ────────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft')  goTo((activeIdx - 1 + featured.length) % featured.length)
      if (e.key === 'ArrowRight') goTo((activeIdx + 1) % featured.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeIdx, featured.length, goTo])

  if (!featured.length) return null

  const item = featured[activeIdx]
  const cfg  = TYPE_CONFIG[item._type]
  const Icon = cfg.icon

  // Warna dinamis berdasar tema
  const accentColor    = isDark ? cfg.colorDark : cfg.color
  const gradient       = isDark ? cfg.gradientDark  : cfg.gradientLight
  const fallback       = isDark ? cfg.fallbackDark  : cfg.fallbackLight
  const badgeBg        = isDark ? cfg.badgeBgDark   : cfg.badgeBgLight
  const badgeBorder    = isDark ? cfg.badgeBorderDark : cfg.badgeBorderLight
  const titleColor     = isDark ? '#ffffff' : '#1a1a1a'
  const descColor      = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(30,30,30,0.65)'
  const bottomBarBg    = isDark ? 'rgba(10,10,15,0.6)'   : 'rgba(255,255,255,0.7)'
  const arrowBg        = isDark ? 'rgba(10,10,15,0.55)'  : 'rgba(255,255,255,0.8)'
  const arrowBorder    = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'
  const arrowColor     = isDark ? 'rgba(255,255,255,0.8)'  : 'rgba(30,30,30,0.75)'
  const counterColor   = isDark ? 'rgba(255,255,255,0.3)'  : 'rgba(0,0,0,0.35)'
  const counterSepColor= isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)'
  const progressBg     = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'
  const posterCardBg   = isDark ? '#1a1a2e' : '#f8f8f8'
  const posterBorder   = `${accentColor}30`
  const sectionBg      = isDark ? '#0a0a0f' : 'transparent'

  const rawImage    = item._image
  const bgThumb     = rawImage ? getWikimediaThumb(rawImage, 1200) : null
  const posterThumb = rawImage ? getWikimediaThumb(rawImage, 500)  : null

  const isOut = phase === 'out'

  return (
    <section
      className="relative w-full overflow-hidden select-none mb-8 sm:mb-12 lg:mb-16
                 bg-stone-50 dark:bg-[#0a0a0f]"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Featured content carousel"
      aria-roledescription="carousel"
    >
      {/* ── Grain overlay — hanya di dark mode ─── */}
      {isDark && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 opacity-[0.035] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '128px 128px',
          }}
        />
      )}

      {/* ── Background Image Layer ──────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0"
        style={{
          transition: 'opacity 320ms cubic-bezier(0.4,0,0.2,1)',
          opacity: isOut ? 0 : 1,
        }}
      >
        {bgThumb && !bgLoaded[activeIdx + 'err'] ? (
          <>
            <div className="absolute inset-0" style={{ background: fallback }} />
            <img
              key={`bg-${activeIdx}`}
              src={bgThumb}
              alt=""
              className="absolute inset-0 w-full h-full object-cover object-center"
              style={{
                // PERBAIKAN: blur lebih lembut di light mode agar tidak terlalu gelap
                filter: isDark
                  ? 'blur(28px) brightness(0.18) saturate(1.4)'
                  : 'blur(28px) brightness(0.85) saturate(1.2)',
                transform: 'scale(1.12)',
                transition: 'opacity 500ms',
                opacity: bgLoaded[activeIdx] ? (isDark ? 1 : 0.35) : 0,
              }}
              onLoad={() => setBgLoaded(p => ({ ...p, [activeIdx]: true }))}
              onError={() => setBgLoaded(p => ({ ...p, [activeIdx + 'err']: true }))}
            />
          </>
        ) : (
          <div className="absolute inset-0" style={{ background: fallback }} />
        )}

        {/* Directional gradient */}
        <div className="absolute inset-0" style={{ background: gradient }} />

        {/* Bottom vignette */}
        <div
          className="absolute inset-0"
          style={{
            background: isDark
              ? 'linear-gradient(to bottom, transparent 30%, rgba(10,10,15,0.7) 80%, rgba(10,10,15,0.95) 100%)'
              : 'linear-gradient(to bottom, transparent 40%, rgba(255,255,255,0.5) 85%, rgba(255,255,255,0.9) 100%)',
          }}
        />

        {/* Accent glow bottom-left */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1"
          style={{ background: `linear-gradient(to right, ${accentColor}50, transparent 60%)` }}
        />
      </div>

      {/* ── Decorative right-side image — desktop only ───────────────── */}
      {posterThumb && (
        <div
          aria-hidden="true"
          className="absolute right-0 top-0 bottom-0 z-5 hidden lg:block"
          style={{
            width: 'clamp(180px, 22vw, 320px)',
            transition: 'opacity 350ms, transform 350ms cubic-bezier(0.4,0,0.2,1)',
            opacity: isOut ? 0 : (posterLoaded[activeIdx] ? (isDark ? 0.22 : 0.12) : 0),
            transform: isOut ? 'scale(1.08)' : 'scale(1)',
          }}
        >
          {!posterError[activeIdx] && (
            <img
              key={`deco-${activeIdx}`}
              src={posterThumb}
              alt=""
              className="w-full h-full object-cover"
              style={{
                maskImage: 'linear-gradient(to left, transparent, rgba(0,0,0,0.6) 40%, transparent)',
                WebkitMaskImage: 'linear-gradient(to left, transparent, rgba(0,0,0,0.6) 40%, transparent)',
              }}
              onLoad={() => setPosterLoaded(p => ({ ...p, [activeIdx]: true }))}
              onError={() => setPosterError(p => ({ ...p, [activeIdx]: true }))}
            />
          )}
        </div>
      )}

      {/* ── Main Content ─────────────────────────────────────────────────
          PERBAIKAN HEIGHT: pakai min-h + max-h yang dikontrol per breakpoint
          Mobile tetap bebas (content-driven), desktop dibatasi 340px
      ──────────────────────────────────────────────────────────────── */}
      <div
        className="relative z-20"
        style={{
          transition: 'opacity 320ms cubic-bezier(0.4,0,0.2,1), transform 320ms cubic-bezier(0.4,0,0.2,1)',
          opacity: isOut ? 0 : 1,
          transform: isOut ? 'translateY(10px)' : 'translateY(0)',
        }}
        aria-live="polite"
        aria-atomic="true"
      >
        <div
          className="container mx-auto"
          style={{ padding: 'clamp(16px, 3vw, 36px) clamp(16px, 4vw, 48px)' }}
        >
          {/*
            PERBAIKAN HEIGHT:
            - Mobile: tidak dibatasi, konten menentukan tinggi (seperti sebelumnya)
            - sm+: max-h 260px — konten terpotong rapi, tidak melar
            - lg+: max-h 300px
            items-center agar poster & teks sejajar di tengah secara vertikal
          */}
          <div
            className="flex items-center gap-4 sm:gap-6 lg:gap-8 sm:max-h-[260px] lg:max-h-[300px] sm:overflow-hidden"
            style={{ maxWidth: '820px' }}
          >

            {/* ── Poster Card ──────────────────────────────────────── */}
            <div
              className="flex-shrink-0"
              style={{ width: 'clamp(100px, 18vw, 200px)' }}
            >
              <div
                className="relative overflow-hidden rounded-lg sm:rounded-xl"
                style={{
                  // PERBAIKAN: poster film aspect-video, lainnya 2/3
                  // di sm+ kita batasi tinggi poster agar tidak overflow
                  aspectRatio: item._type === 'film' ? '16/9' : '2/3',
                  maxHeight: '220px',        // ← batas tinggi poster di semua breakpoint
                  boxShadow: `0 12px 36px ${cfg.glow}, 0 4px 12px rgba(0,0,0,${isDark ? 0.6 : 0.2})`,
                  border: `1px solid ${posterBorder}`,
                  background: posterCardBg,
                }}
              >
                {item._extra && (
                  <div
                    className="absolute top-1.5 right-1.5 z-10 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md"
                    style={{
                      background: badgeBg,
                      border: `1px solid ${badgeBorder}`,
                      color: accentColor,
                      backdropFilter: 'blur(6px)',
                      fontSize: 'clamp(8px, 1.5vw, 10px)',
                    }}
                  >
                    {item._extra}
                  </div>
                )}

                {posterThumb && !posterError[activeIdx] ? (
                  <img
                    key={`poster-${activeIdx}`}
                    src={posterThumb}
                    alt={item._title}
                    className="w-full h-full object-cover"
                    style={{
                      transition: 'opacity 400ms',
                      opacity: posterLoaded[activeIdx] ? 1 : 0,
                    }}
                    onLoad={() => setPosterLoaded(p => ({ ...p, [activeIdx]: true }))}
                    onError={(e) => {
                      if (rawImage && e.target.src !== rawImage) { e.target.src = rawImage; return }
                      setPosterError(p => ({ ...p, [activeIdx]: true }))
                    }}
                  />
                ) : (
                  <div
                    className="w-full h-full flex flex-col items-center justify-center gap-2"
                    style={{
                      background: isDark
                        ? `linear-gradient(160deg, ${cfg.colorDim}, #0a0a0f)`
                        : `linear-gradient(160deg, ${fallback.includes('#') ? fallback.split(',')[0].replace('linear-gradient(135deg, ', '') : '#f0f0f0'}, #fff)`,
                    }}
                  >
                    <Icon
                      style={{
                        width: 'clamp(20px, 5vw, 32px)',
                        height: 'clamp(20px, 5vw, 32px)',
                        color: `${accentColor}60`,
                      }}
                    />
                    <p
                      className="text-center px-2 line-clamp-3 leading-tight"
                      style={{
                        fontSize: 'clamp(7px, 1.5vw, 10px)',
                        color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.4)',
                      }}
                    >
                      {item._title}
                    </p>
                  </div>
                )}

                {!posterLoaded[activeIdx] && !posterError[activeIdx] && posterThumb && (
                  <div className="absolute inset-0" style={{ background: posterCardBg }} />
                )}

                {/* Poster shine overlay */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%)',
                  }}
                />
              </div>
            </div>

            {/* ── Text Content ─────────────────────────────────────── */}
            <div className="flex-1 min-w-0">
              {/* Category badge */}
              <div
                className="inline-flex items-center gap-1.5 rounded-full mb-2 sm:mb-2.5"
                style={{
                  background: badgeBg,
                  border: `1px solid ${badgeBorder}`,
                  padding: 'clamp(3px,1vw,5px) clamp(8px,2vw,12px)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <Icon
                  style={{
                    width: 'clamp(9px, 2vw, 12px)',
                    height: 'clamp(9px, 2vw, 12px)',
                    color: accentColor,
                  }}
                />
                <span
                  className="font-black uppercase tracking-widest"
                  style={{
                    fontSize: 'clamp(7px, 1.5vw, 10px)',
                    color: accentColor,
                  }}
                >
                  {cfg.label}
                </span>
              </div>

              {/* Title */}
              <h2
                className="font-serif font-bold leading-tight mb-1 sm:mb-1.5"
                style={{
                  // PERBAIKAN: clamp lebih ketat di atas — max 28px di desktop
                  // agar judul tidak terlalu besar dan makan ruang
                  fontSize: 'clamp(15px, 3vw, 28px)',
                  color: titleColor,
                  textShadow: isDark ? '0 2px 12px rgba(0,0,0,0.7)' : 'none',
                  letterSpacing: '-0.02em',
                  // Batas 2 baris untuk judull
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {item._title}
              </h2>

              {/* Subtitle / author */}
              {item._sub && (
                <p
                  className="font-semibold mb-1 sm:mb-2 line-clamp-1"
                  style={{
                    fontSize: 'clamp(10px, 1.8vw, 13px)',
                    color: accentColor,
                    textShadow: isDark ? `0 0 20px ${cfg.glow}` : 'none',
                  }}
                >
                  {item._sub}
                </p>
              )}

              {/* Description — dibatasi 2 baris saja di semua ukuran */}
              {item._desc && (
                <p
                  className="leading-relaxed mb-3 sm:mb-3.5"
                  style={{
                    fontSize: 'clamp(10px, 1.5vw, 12px)',
                    color: descColor,
                    display: '-webkit-box',
                    // PERBAIKAN: kurangi dari 3 → 2 baris agar tidak terlalu panjang
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    maxWidth: '480px',
                  }}
                >
                  {item._desc}
                </p>
              )}

              {/* CTA Button */}
              <Link
                to={cfg.link(item)}
                className="inline-flex items-center gap-1.5 font-bold rounded-full transition-all duration-200 active:scale-95 hover:scale-105 group"
                style={{
                  background: cfg.btnBg,
                  color: cfg.btnText,
                  padding: 'clamp(6px,1.5vw,9px) clamp(12px,3vw,20px)',
                  fontSize: 'clamp(10px, 1.6vw, 12px)',
                  boxShadow: `0 4px 16px ${cfg.glow}, 0 2px 6px rgba(0,0,0,${isDark ? 0.4 : 0.15})`,
                  textDecoration: 'none',
                }}
                aria-label={`${cfg.cta}: ${item._title}`}
              >
                {item._type === 'film' ? (
                  <Play style={{ width: 'clamp(10px, 2vw, 13px)', height: 'clamp(10px, 2vw, 13px)', fill: 'currentColor' }} />
                ) : (
                  <Icon style={{ width: 'clamp(10px, 2vw, 12px)', height: 'clamp(10px, 2vw, 12px)' }} />
                )}
                {cfg.cta}
                <ArrowRight
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                  style={{ width: 'clamp(10px, 2vw, 12px)', height: 'clamp(10px, 2vw, 12px)' }}
                />
              </Link>
            </div>

          </div>
        </div>
      </div>

      {/* ── Bottom Bar: dots + counter ───────────────────────────────────── */}
      {featured.length > 1 && (
        <div
          className="relative z-20 flex items-center justify-between px-4 sm:px-6 pb-3 sm:pb-4"
          style={{ backdropFilter: 'blur(4px)' }}
        >
          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {featured.map((f, i) => {
              const c      = TYPE_CONFIG[f._type]
              const accent = isDark ? c.colorDark : c.color
              const isActive = i === activeIdx
              return (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Slide ${i + 1}: ${f._title}`}
                  aria-current={isActive ? 'true' : undefined}
                  className="flex items-center gap-1 rounded-full transition-all duration-300 focus:outline-none whitespace-nowrap"
                  style={{
                    background: isActive
                      ? (isDark ? `${accent}20` : `${accent}15`)
                      : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'),
                    border: `1px solid ${isActive ? accent + '50' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)')}`,
                    padding: 'clamp(3px,0.8vw,5px) clamp(6px,1.5vw,10px)',
                  }}
                >
                  <span
                    className="rounded-full flex-shrink-0 transition-all duration-300"
                    style={{
                      width: isActive ? 'clamp(16px, 3vw, 20px)' : 'clamp(4px, 1vw, 6px)',
                      height: 'clamp(4px, 0.8vw, 5px)',
                      background: isActive ? accent : (isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)'),
                    }}
                  />
                  {isActive && (
                    <span
                      className="font-bold uppercase tracking-widest hidden sm:inline"
                      style={{ fontSize: 'clamp(7px, 1.3vw, 9px)', color: accent }}
                    >
                      {c.label}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          <span
            className="font-mono flex-shrink-0 ml-3"
            style={{ fontSize: 'clamp(9px, 1.5vw, 11px)', color: counterColor }}
          >
            {String(activeIdx + 1).padStart(2, '0')}
            <span style={{ color: counterSepColor }}> / </span>
            {String(featured.length).padStart(2, '0')}
          </span>
        </div>
      )}

      {/* ── Arrow Buttons ──────────────────────────────────────────────── */}
      {featured.length > 1 && (
        <>
          <button
            onClick={() => goTo((activeIdx - 1 + featured.length) % featured.length)}
            aria-label="Slide sebelumnya"
            className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-30 transition-all duration-200 active:scale-90 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-full"
            style={{
              background: arrowBg,
              border: `1px solid ${arrowBorder}`,
              backdropFilter: 'blur(8px)',
              padding: 'clamp(6px, 1.5vw, 10px)',
              boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.12)',
            }}
          >
            <ChevronLeft style={{ width: 'clamp(14px, 2.5vw, 20px)', height: 'clamp(14px, 2.5vw, 20px)', color: arrowColor }} />
          </button>
          <button
            onClick={() => goTo((activeIdx + 1) % featured.length)}
            aria-label="Slide berikutnya"
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-30 transition-all duration-200 active:scale-90 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-full"
            style={{
              background: arrowBg,
              border: `1px solid ${arrowBorder}`,
              backdropFilter: 'blur(8px)',
              padding: 'clamp(6px, 1.5vw, 10px)',
              boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.12)',
            }}
          >
            <ChevronRight style={{ width: 'clamp(14px, 2.5vw, 20px)', height: 'clamp(14px, 2.5vw, 20px)', color: arrowColor }} />
          </button>
        </>
      )}

      {/* ── Progress bar ───────────────────────────────────────────────── */}
      {featured.length > 1 && (
        <div
          className="absolute bottom-0 left-0 right-0 z-30"
          style={{ height: '2px', background: progressBg }}
        >
          <div
            key={`progress-${activeIdx}`}
            style={{
              height: '100%',
              background: `linear-gradient(to right, ${accentColor}, ${cfg.colorMid})`,
              animation: isPaused ? 'none' : 'progressBar 6.5s linear forwards',
              transformOrigin: 'left',
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes progressBar {
          from { width: 0% }
          to   { width: 100% }
        }
        @media (min-width: 400px) {
          .xs\\:block { display: block !important; }
        }
      `}</style>
    </section>
  )
}

export default FeaturedBanner
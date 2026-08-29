import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Film, Newspaper, Layers, ArrowRight, ChevronLeft, ChevronRight, Play, RotateCcw } from 'lucide-react'
import { sourceHref } from '../../utils/newspaperUtils'
import { useAuth } from '../../hooks/useAuth'
import bookService from '../../services/bookService'
import zineService from '../../services/zineService'

const getWikimediaThumb = (url, w = 900) => {
  if (!url) return null
  if (url.includes('/thumb/')) return url
  if (!url.includes('upload.wikimedia.org')) return url
  const m = url.match(/^(https:\/\/upload\.wikimedia\.org\/wikipedia\/(?:commons|[a-z]+)\/)([^/]\/[^/]{2}\/)(.+)$/)
  if (!m) return url
  const [, base, hash, filename] = m
  const isSvg = filename.toLowerCase().endsWith('.svg')
  const thumbFilename = isSvg ? `${filename}.png` : filename
  return `${base}thumb/${hash}${filename}/${w}px-${thumbFilename}`
}

const getFilmPoster = (film) => {
  if (!film) return null
  const videoSources = Array.isArray(film.videoSources) ? film.videoSources : []
  const mainThumb = videoSources.find(v => !v.isTrailer)?.thumbnailUrl
  const trailerThumb = videoSources.find(v => v.isTrailer)?.thumbnailUrl
  return (
    film.posterUrl || film.poster_url || film.poster ||
    mainThumb || trailerThumb ||
    film.thumbnailUrl || film.thumbnail || film.coverUrl ||
    film.imageUrl || film.image ||
    (typeof film.imageUrls === 'string' && film.imageUrls ? film.imageUrls.split(',')[0].trim() : null) ||
    null
  )
}

const TYPE_CONFIG = {
  book: { label: 'Buku Pilihan', icon: BookOpen, color: '#D97706', colorDark: '#F59E0B', colorDim: '#78350F', colorMid: '#D97706', glow: 'rgba(217,119,6,0.25)', gradientLight: 'linear-gradient(135deg, rgba(254,243,199,0.97) 0%, rgba(255,251,235,0.92) 55%, rgba(255,255,255,0.0) 100%)', gradientDark: 'linear-gradient(135deg, rgba(120,53,15,0.95) 0%, rgba(17,24,39,0.85) 60%, transparent 100%)', fallbackLight: 'linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 60%, #FFF8E1 100%)', fallbackDark: 'linear-gradient(135deg, #78350F 0%, #111827 60%, #030712 100%)', badgeBgLight: 'rgba(217,119,6,0.1)', badgeBgDark: 'rgba(245,158,11,0.15)', badgeBorderLight: 'rgba(217,119,6,0.3)', badgeBorderDark: 'rgba(245,158,11,0.35)', btnBg: '#D97706', btnText: '#ffffff', link: (item) => `/buku/${item.slug || item.id}`, cta: 'Baca Sekarang' },
  film: { label: 'Film', icon: Film, color: '#2563EB', colorDark: '#60A5FA', colorDim: '#1E3A8A', colorMid: '#2563EB', glow: 'rgba(37,99,235,0.2)', gradientLight: 'linear-gradient(135deg, rgba(219,234,254,0.97) 0%, rgba(239,246,255,0.92) 55%, rgba(255,255,255,0.0) 100%)', gradientDark: 'linear-gradient(135deg, rgba(30,58,138,0.95) 0%, rgba(17,24,39,0.85) 60%, transparent 100%)', fallbackLight: 'linear-gradient(135deg, #DBEAFE 0%, #EFF6FF 60%, #F0F9FF 100%)', fallbackDark: 'linear-gradient(135deg, #1E3A8A 0%, #111827 60%, #030712 100%)', badgeBgLight: 'rgba(37,99,235,0.08)', badgeBgDark: 'rgba(96,165,250,0.15)', badgeBorderLight: 'rgba(37,99,235,0.25)', badgeBorderDark: 'rgba(96,165,250,0.35)', btnBg: '#2563EB', btnText: '#ffffff', link: (item) => `/film/${item.slug || item.id}`, cta: 'Tonton Film' },
  newspaper: { label: 'Arsip Koran', icon: Newspaper, color: '#7C3AED', colorDark: '#A78BFA', colorDim: '#3B0764', colorMid: '#7C3AED', glow: 'rgba(124,58,237,0.2)', gradientLight: 'linear-gradient(135deg, rgba(237,233,254,0.97) 0%, rgba(245,243,255,0.92) 55%, rgba(255,255,255,0.0) 100%)', gradientDark: 'linear-gradient(135deg, rgba(59,7,100,0.95) 0%, rgba(17,24,39,0.85) 60%, transparent 100%)', fallbackLight: 'linear-gradient(135deg, #EDE9FE 0%, #F5F3FF 60%, #FAF5FF 100%)', fallbackDark: 'linear-gradient(135deg, #3B0764 0%, #111827 60%, #030712 100%)', badgeBgLight: 'rgba(124,58,237,0.08)', badgeBgDark: 'rgba(167,139,250,0.15)', badgeBorderLight: 'rgba(124,58,237,0.25)', badgeBorderDark: 'rgba(167,139,250,0.35)', btnBg: '#7C3AED', btnText: '#ffffff', link: (item) => sourceHref(item.slug || item.id), cta: 'Jelajahi Arsip' },
  zine: { label: 'Zine & Majalah', icon: Layers, color: '#059669', colorDark: '#34D399', colorDim: '#064E3B', colorMid: '#059669', glow: 'rgba(5,150,105,0.2)', gradientLight: 'linear-gradient(135deg, rgba(209,250,229,0.97) 0%, rgba(236,253,245,0.92) 55%, rgba(255,255,255,0.0) 100%)', gradientDark: 'linear-gradient(135deg, rgba(6,78,59,0.95) 0%, rgba(17,24,39,0.85) 60%, transparent 100%)', fallbackLight: 'linear-gradient(135deg, #D1FAE5 0%, #ECFDF5 60%, #F0FDF4 100%)', fallbackDark: 'linear-gradient(135deg, #064E3B 0%, #111827 60%, #030712 100%)', badgeBgLight: 'rgba(5,150,105,0.08)', badgeBgDark: 'rgba(52,211,153,0.15)', badgeBorderLight: 'rgba(5,150,105,0.25)', badgeBorderDark: 'rgba(52,211,153,0.35)', btnBg: '#059669', btnText: '#ffffff', link: (item) => `/zine/${item.slug || item.id}`, cta: 'Baca Zine' },
}

const READER_PATH = {
  book: (item) => `/buku/${item.slug || item.id}/baca`,
  zine: (item) => `/zine/${item.slug || item.id}/baca`,
  film: (item) => `/film/${item.slug || item.id}/tonton`,
}

const POSTER_RATIO = { book: '2 / 3', zine: '2 / 3', film: '16 / 9', newspaper: '576 / 224' }

const READABLE_TYPES = ['book', 'zine']

const FeaturedBanner = ({ books = [], films = [], articles = [], zines = [] }) => {
  const { isAuthenticated } = useAuth()
  const [activeIdx, setActiveIdx] = useState(0)
  const [phase, setPhase] = useState('visible')
  const [bgLoaded, setBgLoaded] = useState({})
  const [posterLoaded, setPosterLoaded] = useState({})
  const [posterError, setPosterError] = useState({})
  const [isPaused, setIsPaused] = useState(false)
  const [progressMap, setProgressMap] = useState({})

  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'))
  useEffect(() => {
    const obs = new MutationObserver(() => setIsDark(document.documentElement.classList.contains('dark')))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])

  const touchStartX = useRef(null)
  const touchStartY = useRef(null)
  const autoplayRef = useRef(null)

  const featured = [
    ...books.slice(0, 2).map(b => ({ ...b, _type: 'book', _image: b.cover_image || b.coverImageUrl || b.coverImage || b.image || null, _title: b.title, _sub: b.authorNames || b.author || 'Anonim', _desc: b.description, _extra: null, _progressKey: `book:${b.slug || b.id}` })),
    ...zines.slice(0, 2).map(z => ({ ...z, _type: 'zine', _image: z.coverImageUrl || z.cover_image || z.coverImage || z.image || null, _title: z.title, _sub: z.authorNames || z.author || z.publisher || 'Anonim', _desc: z.description, _extra: z.volume ? `Vol. ${z.volume}` : (z.issueNumber || null), _progressKey: `zine:${z.slug || z.id}` })),
    ...articles.slice(0, 1).map(a => ({ ...a, _type: 'newspaper', _image: a.logoUrl || null, _title: a.name, _sub: a.location || null, _desc: a.description, _extra: a.totalArticles ? `${a.totalArticles.toLocaleString('id-ID')} Artikel` : null, _progressKey: null })),
    ...films.slice(0, 2).map(f => ({ ...f, _type: 'film', _image: getFilmPoster(f), _title: f.judul, _sub: f.tahunRilis ? (typeof f.tahunRilis === 'string' && f.tahunRilis.length === 4 ? f.tahunRilis : new Date(f.tahunRilis).getFullYear()) : '', _desc: f.deskripsi || f.sinopsis || f.description, _extra: f.genre || f.genres || null, _progressKey: null })),
  ].filter(Boolean).slice(0, 6)

  const readableKey = featured.filter(f => READABLE_TYPES.includes(f._type)).map(f => f._progressKey).join('|')

  useEffect(() => {
    let cancelled = false
    const targets = featured.filter(f => READABLE_TYPES.includes(f._type) && (f.slug || f.id))

    const load = async () => {
      const entries = await Promise.all(targets.map(async (t) => {
        const slug = t.slug || t.id
        if (isAuthenticated) {
          try {
            const service = t._type === 'book' ? bookService : zineService
            const res = await service.getReadingProgress(slug)
            if (res?.hasProgress) {
              return [t._progressKey, { hasProgress: true, percent: typeof res.percentageCompleted === 'number' ? Math.round(res.percentageCompleted) : null }]
            }
            return [t._progressKey, { hasProgress: false, percent: null }]
          } catch {
            return [t._progressKey, { hasProgress: false, percent: null }]
          }
        }
        const savedCfi = localStorage.getItem(`epub_progress_${slug}`)
        return [t._progressKey, { hasProgress: !!savedCfi, percent: null }]
      }))
      if (!cancelled) setProgressMap(Object.fromEntries(entries))
    }

    if (targets.length) load()
    else setProgressMap({})

    return () => { cancelled = true }
  }, [readableKey, isAuthenticated]) // eslint-disable-line

  const goTo = useCallback((idx) => {
    if (phase !== 'visible' || !featured.length) return
    setPhase('out')
    setTimeout(() => {
      setActiveIdx(idx)
      setPhase('in')
      setTimeout(() => setPhase('visible'), 50)
    }, 320)
  }, [phase, featured.length])

  const scheduleNext = useCallback(() => {
    clearTimeout(autoplayRef.current)
    if (featured.length <= 1 || isPaused) return
    autoplayRef.current = setTimeout(() => goTo((activeIdx + 1) % featured.length), 6500)
  }, [activeIdx, featured.length, isPaused, goTo])

  useEffect(() => {
    scheduleNext()
    return () => clearTimeout(autoplayRef.current)
  }, [scheduleNext])

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

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') goTo((activeIdx - 1 + featured.length) % featured.length)
      if (e.key === 'ArrowRight') goTo((activeIdx + 1) % featured.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeIdx, featured.length, goTo])

  if (!featured.length) {
    return <section className="relative w-full overflow-hidden bg-stone-100 dark:bg-[#0a0a0f] animate-pulse mb-8 sm:mb-12 lg:mb-16" style={{ height: 'clamp(220px, 32vw, 380px)' }} aria-hidden="true" />
  }

  const item = featured[activeIdx]
  const cfg = TYPE_CONFIG[item._type]
  const Icon = cfg.icon
  const progress = item._progressKey ? progressMap[item._progressKey] : null
  const isContinuing = READABLE_TYPES.includes(item._type) && !!progress?.hasProgress
  const CtaIcon = isContinuing ? RotateCcw : (item._type === 'film' ? Play : Icon)
  const ctaLabel = isContinuing ? (progress.percent != null ? `Lanjutkan · ${progress.percent}%` : 'Lanjutkan Membaca') : cfg.cta

  const accentColor = isDark ? cfg.colorDark : cfg.color
  const gradient = isDark ? cfg.gradientDark : cfg.gradientLight
  const fallback = isDark ? cfg.fallbackDark : cfg.fallbackLight
  const badgeBg = isDark ? cfg.badgeBgDark : cfg.badgeBgLight
  const badgeBorder = isDark ? cfg.badgeBorderDark : cfg.badgeBorderLight
  const titleColor = isDark ? '#ffffff' : '#1a1a1a'
  const descColor = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(30,30,30,0.65)'
  const arrowBg = isDark ? 'rgba(10,10,15,0.55)' : 'rgba(255,255,255,0.8)'
  const arrowBorder = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'
  const arrowColor = isDark ? 'rgba(255,255,255,0.8)' : 'rgba(30,30,30,0.75)'
  const counterColor = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)'
  const counterSepColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)'
  const progressBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'
  const posterCardBg = isDark ? '#1a1a2e' : '#f8f8f8'
  const posterBorder = `${accentColor}30`

  const rawImage = item._image
  const bgThumb = rawImage ? getWikimediaThumb(rawImage, 1200) : null
  const posterThumb = rawImage ? getWikimediaThumb(rawImage, 500) : null
  const isOut = phase === 'out'
  const ctaHref = READER_PATH[item._type] ? READER_PATH[item._type](item) : cfg.link(item)

  return (
    <section className="relative w-full overflow-hidden select-none mb-8 sm:mb-12 lg:mb-16 bg-stone-50 dark:bg-[#0a0a0f]" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)} aria-label="Featured content carousel" aria-roledescription="carousel">
      {isDark && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 opacity-[0.035] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`, backgroundRepeat: 'repeat', backgroundSize: '128px 128px' }} />
      )}

      <div aria-hidden="true" className="absolute inset-0 z-0" style={{ transition: 'opacity 320ms cubic-bezier(0.4,0,0.2,1)', opacity: isOut ? 0 : 1 }}>
        {bgThumb && !bgLoaded[activeIdx + 'err'] ? (
          <>
            <div className="absolute inset-0" style={{ background: fallback }} />
            <img
              key={`bg-${activeIdx}`}
              src={bgThumb}
              alt=""
              fetchPriority="high"
              loading="eager"
              decoding="sync"
              className="absolute inset-0 w-full h-full object-cover object-center"
              style={{ filter: isDark ? 'blur(28px) brightness(0.18) saturate(1.4)' : 'blur(28px) brightness(0.85) saturate(1.2)', transform: 'scale(1.12)', transition: 'opacity 500ms', opacity: bgLoaded[activeIdx] ? (isDark ? 1 : 0.35) : 0 }}
              onLoad={() => setBgLoaded(p => ({ ...p, [activeIdx]: true }))}
              onError={() => setBgLoaded(p => ({ ...p, [activeIdx + 'err']: true }))}
            />
          </>
        ) : (
          <div className="absolute inset-0" style={{ background: fallback }} />
        )}

        <div className="absolute inset-0" style={{ background: gradient }} />
        <div className="absolute inset-0" style={{ background: isDark ? 'linear-gradient(to bottom, transparent 30%, rgba(10,10,15,0.7) 80%, rgba(10,10,15,0.95) 100%)' : 'linear-gradient(to bottom, transparent 40%, rgba(255,255,255,0.5) 85%, rgba(255,255,255,0.9) 100%)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: `linear-gradient(to right, ${accentColor}50, transparent 60%)` }} />
      </div>

      {posterThumb && (
        <div aria-hidden="true" className="absolute right-0 top-0 bottom-0 z-5 hidden lg:block" style={{ width: 'clamp(180px, 22vw, 320px)', transition: 'opacity 350ms, transform 350ms cubic-bezier(0.4,0,0.2,1)', opacity: isOut ? 0 : (posterLoaded[activeIdx] ? (isDark ? 0.22 : 0.12) : 0), transform: isOut ? 'scale(1.08)' : 'scale(1)' }}>
          {!posterError[activeIdx] && (
            <img
              key={`deco-${activeIdx}`}
              src={posterThumb}
              alt=""
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
              style={{ maskImage: 'linear-gradient(to left, transparent, rgba(0,0,0,0.6) 40%, transparent)', WebkitMaskImage: 'linear-gradient(to left, transparent, rgba(0,0,0,0.6) 40%, transparent)' }}
              onLoad={() => setPosterLoaded(p => ({ ...p, [activeIdx]: true }))}
              onError={() => setPosterError(p => ({ ...p, [activeIdx]: true }))}
            />
          )}
        </div>
      )}

      <div className="relative z-20" style={{ transition: 'opacity 320ms cubic-bezier(0.4,0,0.2,1), transform 320ms cubic-bezier(0.4,0,0.2,1)', opacity: isOut ? 0 : 1, transform: isOut ? 'translateY(10px)' : 'translateY(0)' }} aria-live="polite" aria-atomic="true">
        <div className="container mx-auto" style={{ padding: 'clamp(16px, 3vw, 36px) clamp(16px, 4vw, 48px)' }}>
          <div className="flex items-center gap-4 sm:gap-6 lg:gap-8 h-[190px] sm:h-auto sm:max-h-[260px] lg:max-h-[300px] overflow-hidden" style={{ maxWidth: '820px' }}>

            <div className={`flex-shrink-0 relative overflow-hidden rounded-lg sm:rounded-xl ${(item._type === 'newspaper' || item._type === 'film') ? 'w-[clamp(130px,44vw,220px)] h-auto sm:w-auto sm:h-[clamp(120px,22vw,220px)]' : ''}`} style={{ ...((item._type === 'newspaper' || item._type === 'film') ? {} : { height: 'clamp(120px, 22vw, 220px)' }), aspectRatio: POSTER_RATIO[item._type], boxShadow: `0 12px 36px ${cfg.glow}, 0 4px 12px rgba(0,0,0,${isDark ? 0.6 : 0.2})`, border: `1px solid ${posterBorder}`, background: posterCardBg }}>
              {item._extra && (
                <div className="absolute top-1.5 right-1.5 z-10 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md" style={{ background: badgeBg, border: `1px solid ${badgeBorder}`, color: accentColor, backdropFilter: 'blur(6px)', fontSize: 'clamp(8px, 1.5vw, 10px)' }}>{item._extra}</div>
              )}

              {posterThumb && !posterError[activeIdx] ? (
                <img
                  key={`poster-${activeIdx}`}
                  src={posterThumb}
                  alt={item._title}
                  fetchPriority="high"
                  loading="eager"
                  decoding="sync"
                  className="w-full h-full object-cover"
                  style={{ transition: 'opacity 400ms', opacity: posterLoaded[activeIdx] ? 1 : 0 }}
                  onLoad={() => setPosterLoaded(p => ({ ...p, [activeIdx]: true }))}
                  onError={(e) => {
                    if (rawImage && e.target.src !== rawImage) { e.target.src = rawImage; return }
                    setPosterError(p => ({ ...p, [activeIdx]: true }))
                  }}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2" style={{ background: isDark ? `linear-gradient(160deg, ${cfg.colorDim}, #0a0a0f)` : `linear-gradient(160deg, ${fallback.includes('#') ? fallback.split(',')[0].replace('linear-gradient(135deg, ', '') : '#f0f0f0'}, #fff)` }}>
                  <Icon style={{ width: 'clamp(20px, 5vw, 32px)', height: 'clamp(20px, 5vw, 32px)', color: `${accentColor}60` }} />
                  <p className="text-center px-2 line-clamp-3 leading-tight" style={{ fontSize: 'clamp(7px, 1.5vw, 10px)', color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.4)' }}>{item._title}</p>
                </div>
              )}

              {!posterLoaded[activeIdx] && !posterError[activeIdx] && posterThumb && <div className="absolute inset-0" style={{ background: posterCardBg }} />}
              <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%)' }} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 rounded-full mb-2 sm:mb-2.5" style={{ background: badgeBg, border: `1px solid ${badgeBorder}`, padding: 'clamp(3px,1vw,5px) clamp(8px,2vw,12px)', backdropFilter: 'blur(8px)' }}>
                <Icon style={{ width: 'clamp(9px, 2vw, 12px)', height: 'clamp(9px, 2vw, 12px)', color: accentColor }} />
                <span className="font-black uppercase tracking-widest" style={{ fontSize: 'clamp(7px, 1.5vw, 10px)', color: accentColor }}>{cfg.label}</span>
              </div>

              <h2 className="font-serif font-bold leading-tight mb-1 sm:mb-1.5 line-clamp-2" style={{ fontSize: 'clamp(15px, 3vw, 28px)', color: titleColor, textShadow: isDark ? '0 2px 12px rgba(0,0,0,0.7)' : 'none', letterSpacing: '-0.02em' }}>{item._title}</h2>

              {item._sub && <p className="font-semibold mb-1 sm:mb-2 line-clamp-1" style={{ fontSize: 'clamp(10px, 1.8vw, 13px)', color: accentColor, textShadow: isDark ? `0 0 20px ${cfg.glow}` : 'none' }}>{item._sub}</p>}

              {item._desc && <p className="leading-relaxed mb-2 sm:mb-3.5 line-clamp-1 sm:line-clamp-2" style={{ fontSize: 'clamp(10px, 1.5vw, 12px)', color: descColor, maxWidth: '480px' }}>{item._desc}</p>}

              <Link to={ctaHref} className="inline-flex items-center gap-1.5 font-bold rounded-full transition-all duration-200 active:scale-95 hover:scale-105 group" style={{ background: cfg.btnBg, color: cfg.btnText, padding: 'clamp(6px,1.5vw,9px) clamp(12px,3vw,20px)', fontSize: 'clamp(10px, 1.6vw, 12px)', boxShadow: `0 4px 16px ${cfg.glow}, 0 2px 6px rgba(0,0,0,${isDark ? 0.4 : 0.15})`, textDecoration: 'none' }} aria-label={`${ctaLabel}: ${item._title}`}>
                <CtaIcon style={{ width: 'clamp(10px, 2vw, 13px)', height: 'clamp(10px, 2vw, 13px)', fill: item._type === 'film' && !isContinuing ? 'currentColor' : 'none' }} />
                {ctaLabel}
                <ArrowRight className="transition-transform duration-200 group-hover:translate-x-0.5" style={{ width: 'clamp(10px, 2vw, 12px)', height: 'clamp(10px, 2vw, 12px)' }} />
              </Link>
            </div>

          </div>
        </div>
      </div>

      {featured.length > 1 && (
        <div className="relative z-20 flex items-center justify-between px-4 sm:px-6 pb-3 sm:pb-4" style={{ backdropFilter: 'blur(4px)' }}>
          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {featured.map((f, i) => {
              const c = TYPE_CONFIG[f._type]
              const accent = isDark ? c.colorDark : c.color
              const isActive = i === activeIdx
              return (
                <button key={i} onClick={() => goTo(i)} aria-label={`Slide ${i + 1}: ${f._title}`} aria-current={isActive ? 'true' : undefined} className="flex items-center gap-1 rounded-full transition-all duration-300 focus:outline-none whitespace-nowrap" style={{ background: isActive ? (isDark ? `${accent}20` : `${accent}15`) : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'), border: `1px solid ${isActive ? accent + '50' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)')}`, padding: 'clamp(3px,0.8vw,5px) clamp(6px,1.5vw,10px)' }}>
                  <span className="rounded-full flex-shrink-0 transition-all duration-300" style={{ width: isActive ? 'clamp(16px, 3vw, 20px)' : 'clamp(4px, 1vw, 6px)', height: 'clamp(4px, 0.8vw, 5px)', background: isActive ? accent : (isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)') }} />
                  {isActive && <span className="font-bold uppercase tracking-widest hidden sm:inline" style={{ fontSize: 'clamp(7px, 1.3vw, 9px)', color: accent }}>{c.label}</span>}
                </button>
              )
            })}
          </div>

          <span className="font-mono flex-shrink-0 ml-3" style={{ fontSize: 'clamp(9px, 1.5vw, 11px)', color: counterColor }}>
            {String(activeIdx + 1).padStart(2, '0')}<span style={{ color: counterSepColor }}> / </span>{String(featured.length).padStart(2, '0')}
          </span>
        </div>
      )}

      {featured.length > 1 && (
        <>
          <button onClick={() => goTo((activeIdx - 1 + featured.length) % featured.length)} aria-label="Slide sebelumnya" className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-30 transition-all duration-200 active:scale-90 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-full" style={{ background: arrowBg, border: `1px solid ${arrowBorder}`, backdropFilter: 'blur(8px)', padding: 'clamp(6px, 1.5vw, 10px)', boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.12)' }}>
            <ChevronLeft style={{ width: 'clamp(14px, 2.5vw, 20px)', height: 'clamp(14px, 2.5vw, 20px)', color: arrowColor }} />
          </button>
          <button onClick={() => goTo((activeIdx + 1) % featured.length)} aria-label="Slide berikutnya" className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-30 transition-all duration-200 active:scale-90 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-full" style={{ background: arrowBg, border: `1px solid ${arrowBorder}`, backdropFilter: 'blur(8px)', padding: 'clamp(6px, 1.5vw, 10px)', boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.12)' }}>
            <ChevronRight style={{ width: 'clamp(14px, 2.5vw, 20px)', height: 'clamp(14px, 2.5vw, 20px)', color: arrowColor }} />
          </button>
        </>
      )}

      {featured.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 z-30" style={{ height: '2px', background: progressBg }}>
          <div key={`progress-${activeIdx}`} style={{ height: '100%', background: `linear-gradient(to right, ${accentColor}, ${cfg.colorMid})`, animation: isPaused ? 'none' : 'progressBar 6.5s linear forwards', transformOrigin: 'left' }} />
        </div>
      )}

      <style>{`
        @keyframes progressBar { from { width: 0% } to { width: 100% } }
        @media (min-width: 400px) { .xs\\:block { display: block !important; } }
      `}</style>
    </section>
  )
}

export default FeaturedBanner
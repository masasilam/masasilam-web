// ============================================
// src/components/Film/FilmCard.jsx
// LIGHT: White card, cool slate shadows, blue accent
// DARK:  Slate-900 card, deep shadows, blue accent
//
// LIGHT MODE PALETTE:
//   Card bg     : white      (#ffffff)
//   Border      : slate-200  (#e2e8f0)
//   Text primary: slate-900  (#0f172a)
//   Text muted  : slate-500  (#64748b)
//   Genre pill  : blue-50/blue-100/blue-600
//   Hover border: blue-300
//
// DARK MODE PALETTE:
//   Card bg     : slate-900  (#0f172a)
//   Border      : slate-800  (#1e293b)
//   Text primary: slate-100  (#f1f5f9)
//   Text muted  : slate-500  (#64748b)
//   Genre pill  : blue-900/20 / blue-400
//   Hover border: slate-600
// ============================================

import { useState, memo } from 'react'
import { Link } from 'react-router-dom'
import { Clock, Film as FilmIcon, Play, Video, Star, Globe, User } from 'lucide-react'

/**
 * Konversi URL Wikimedia Commons ke URL thumbnail.
 * Regex pakai [^/] karena hash dir bisa berisi huruf kapital & angka.
 */
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

// ── Stat chip ─────────────────────────────────────────────────────────────────
const Stat = ({ icon: Icon, value, className = '' }) => (
  <span className={`inline-flex items-center gap-1 text-[11px] leading-none ${className}`}>
    <Icon className="w-3 h-3 flex-shrink-0" />
    {value}
  </span>
)

// ── FilmCard ──────────────────────────────────────────────────────────────────
const FilmCard = memo(({ film }) => {
  const [imgStatus, setImgStatus] = useState('loading') // 'loading' | 'loaded' | 'error'

  const year = film.tahunRilis
    ? (typeof film.tahunRilis === 'string' && film.tahunRilis.length === 4
        ? film.tahunRilis
        : new Date(film.tahunRilis).getFullYear())
    : null

  // Fallback chain untuk URL poster
  const rawPosterUrl =
    film.posterUrl   ||
    film.poster_url  ||
    film.poster      ||
    film.thumbnailUrl ||
    film.thumbnail   ||
    film.coverUrl    ||
    film.imageUrl    ||
    (typeof film.imageUrls === 'string' && film.imageUrls
      ? film.imageUrls.split(',')[0].trim()
      : null) ||
    null

  const thumbUrl = getWikimediaThumb(rawPosterUrl, 300)

  // Fallback bertingkat: thumb → URL asli → icon
  const handleError = (e) => {
    const currentSrc = e.target.src
    if (rawPosterUrl && currentSrc !== rawPosterUrl && thumbUrl !== rawPosterUrl) {
      e.target.src = rawPosterUrl
      return
    }
    setImgStatus('error')
  }

  const rating = film.reviewScores?.length > 0 ? film.reviewScores[0].value : null
  const genreList = film.genre
    ? (Array.isArray(film.genre) ? film.genre : [film.genre]).slice(0, 2)
    : []
  const director = film.sutradara?.[0]?.name || null

  return (
    <Link
      to={`/film/${film.slug || film.id}`}
      className="group relative flex flex-col rounded-xl overflow-hidden
                 transition-all duration-300 ease-out
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                 border shadow-sm hover:shadow-xl hover:-translate-y-1
                 bg-white border-slate-200 shadow-slate-100/80
                 hover:border-blue-300 hover:shadow-blue-100/60
                 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none
                 dark:hover:border-slate-600 dark:hover:shadow-black/60 dark:hover:shadow-xl"
    >
      {/* ── Cover ─────────────────────────────────────────────────────── */}
      <div className="relative aspect-[2/3] overflow-hidden flex-shrink-0
                      bg-slate-100 dark:bg-slate-800">

        {/* Shimmer skeleton saat loading */}
        {imgStatus === 'loading' && thumbUrl && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br
                          from-slate-200 via-slate-100 to-slate-200
                          dark:from-slate-700 dark:via-slate-600 dark:to-slate-700" />
        )}

        {/* Poster image */}
        {thumbUrl && imgStatus !== 'error' ? (
          <img
            src={thumbUrl}
            alt={film.judul}
            loading="lazy"
            decoding="async"
            onLoad={() => setImgStatus('loaded')}
            onError={handleError}
            className={`w-full h-full object-cover group-hover:scale-[1.04]
                        transition-transform duration-500 ease-out
                        ${imgStatus === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2
                          bg-gradient-to-br from-blue-50 to-slate-100
                          dark:from-blue-950/50 dark:to-slate-900">
            <FilmIcon className="w-10 h-10 text-blue-400/60 dark:text-blue-500/40" />
            <p className="text-[9px] text-center text-slate-500 dark:text-slate-400 px-2 line-clamp-2">
              {film.judul}
            </p>
          </div>
        )}

        {/* Bottom gradient vignette */}
        <div className="absolute inset-x-0 bottom-0 h-1/3
                        bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

        {/* Play overlay (hanya jika ada videoUrl) */}
        {film.videoUrl && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30
                          transition-colors duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-11 h-11 rounded-full bg-white/90 flex items-center justify-center
                              shadow-lg shadow-black/30">
                <Play className="w-5 h-5 text-blue-600 ml-0.5" fill="currentColor" />
              </div>
            </div>
          </div>
        )}

        {/* ── Top-left: year badge ──────────────────────────────────── */}
        {year && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md
                          bg-gray-900/80 backdrop-blur-sm
                          text-white text-[10px] font-bold tracking-wide">
            {year}
          </div>
        )}

        {/* ── Top-right: Video / Trailer badges ────────────────────── */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {film.videoUrl && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md shadow-sm
                             bg-emerald-600/90 backdrop-blur-sm
                             text-white text-[9px] font-bold">
              <Play className="w-2 h-2" fill="currentColor" />
              <span className="hidden sm:inline">Full</span>
            </span>
          )}
          {film.trailerUrl && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md shadow-sm
                             bg-blue-600/90 backdrop-blur-sm
                             text-white text-[9px] font-bold">
              <Video className="w-2 h-2" />
              <span className="hidden sm:inline">Trailer</span>
            </span>
          )}
        </div>

        {/* ── Bottom: rating + durasi ───────────────────────────────── */}
        <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between">
          {rating ? (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full
                            bg-black/20 backdrop-blur-[2px]">
              <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400 flex-shrink-0" />
              <span className="text-white/90 text-[10px] font-semibold tabular-nums">{rating}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full
                            bg-black/15 backdrop-blur-[2px]">
              <Star className="w-2.5 h-2.5 text-white/40" />
              <span className="text-white/40 text-[9px]">—</span>
            </div>
          )}
          {film.durasi && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full
                            bg-black/20 backdrop-blur-[2px]">
              <Clock className="w-2.5 h-2.5 text-white/60 flex-shrink-0" />
              <span className="text-white/80 text-[9px] font-medium">{film.durasi}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Info Panel ────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-2.5 sm:p-3 gap-1.5">

        {/* Genre pills */}
        {genreList.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {genreList.map((g, i) => (
              <span key={i}
                className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full
                           text-[9px] font-medium leading-none
                           bg-blue-50 border border-blue-100 text-blue-600
                           dark:bg-blue-900/20 dark:border-blue-800/50 dark:text-blue-400">
                {g}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h3 className="font-semibold text-sm leading-snug line-clamp-2 hyphens-auto
                       transition-colors duration-200
                       text-slate-900 group-hover:text-blue-700
                       dark:text-slate-100 dark:group-hover:text-blue-400">
          {film.judul}
        </h3>

        {/* Director */}
        {director && (
          <p className="text-xs truncate leading-none text-slate-500 dark:text-slate-500">
            {director}
          </p>
        )}

        {/* Stats strip — country */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-auto pt-1.5
                        border-t border-slate-100 dark:border-slate-800">
          {film.negara && (
            <Stat icon={Globe} value={film.negara}
              className="text-slate-400 dark:text-slate-600 truncate max-w-full" />
          )}
          {!film.negara && film.durasi && (
            <Stat icon={Clock} value={film.durasi}
              className="text-slate-400 dark:text-slate-600" />
          )}
        </div>
      </div>

      {/* ── Hover glow border (decorative) ───────────────────────────── */}
      <div className="absolute inset-0 rounded-xl border-2 border-transparent
                      pointer-events-none transition-colors duration-300
                      group-hover:border-blue-300/40
                      dark:group-hover:border-blue-500/20" />
    </Link>
  )
})

FilmCard.displayName = 'FilmCard'
export default FilmCard
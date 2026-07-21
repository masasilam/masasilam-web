import { useState, memo } from 'react'
import { Link } from 'react-router-dom'
import {
  Clock, Film as FilmIcon, Play, Video, Star, Globe, Lock, HelpCircle,
} from 'lucide-react'

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

// ── Mapping copyrightStatusId → label ────────────────────────────────────────
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

// ── Mini icon: gembok terbuka, dibuat custom agar tetap simetris &
//    legible di ukuran 12px (ikon Lucide bawaan "pecah" sekecil itu) ────────
const OpenPadlockIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" aria-hidden="true">
    <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M8 11V8a4 4 0 0 1 7.5-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

// ── Copyright icon (overlay cover) — versi numeric ID untuk Film ────────────
const CopyrightIcon = ({ statusId }) => {
  if (!statusId) return null
  const statusName = COPYRIGHT_STATUS_NAME[statusId] || 'Status Tidak Diketahui'

  return (
    <span
      title={statusName}
      className="inline-flex items-center justify-center rounded-full px-1
                 bg-black/55 backdrop-blur-sm text-[9px] font-bold leading-none select-none
                 min-w-[20px] h-5 shadow-sm shadow-black/20"
    >
      {/* Teks untuk screen reader — ikon di bawah ini semuanya dekoratif */}
      <span className="sr-only">{statusName}</span>

      {statusId === 1 ? (
        // PUBLIC_DOMAIN: © dengan garis coret diagonal merah
        <span
          aria-hidden="true"
          style={{ position: 'relative', display: 'inline-block', color: 'rgba(255,255,255,0.75)', fontSize: '11px', lineHeight: 1 }}
        >
          ©
          <span style={{
            position: 'absolute',
            top: '45%',
            left: '-5%',
            width: '110%',
            height: 0,
            borderTop: '0.09em solid #ff4444',
            transform: 'rotate(-45deg)',
          }} />
        </span>
      ) : statusId === 2 ? (
        // COPYRIGHTED: gembok terbuka (masih ada hak cipta, tapi boleh ditonton)
        <span aria-hidden="true" className="text-gray-200">
          <OpenPadlockIcon />
        </span>
      ) : statusId === 3 ? (
        // CREATIVE_COMMONS
        <span aria-hidden="true" className="text-blue-300" style={{ fontSize: '9px' }}>CC</span>
      ) : statusId === 9 ? (
        // FAIR_USE
        <span aria-hidden="true" className="text-amber-300 tracking-tight" style={{ fontSize: '7px', whiteSpace: 'nowrap' }}>
          FAIR USE
        </span>
      ) : [5, 6, 7, 8].includes(statusId) ? (
        // GNU_GPL / MIT / Apache / Artistic
        <span aria-hidden="true" className="text-emerald-300 tracking-tight" style={{ fontSize: '7px', whiteSpace: 'nowrap' }}>
          {{ 5: 'GPL', 6: 'MIT', 7: 'APACHE', 8: 'ARTISTIC' }[statusId]}
        </span>
      ) : statusId === 10 ? (
        // UNKNOWN: dibedakan dari "hak cipta penuh" supaya tidak menyesatkan
        <HelpCircle className="w-3 h-3 text-gray-300" aria-hidden="true" />
      ) : (
        // ALL_RIGHTS_RESERVED (4): gembok tertutup
        <Lock className="w-3 h-3 text-gray-300" aria-hidden="true" />
      )}
    </span>
  )
}

// ── FilmCard ──────────────────────────────────────────────────────────────────
const FilmCard = memo(({ film }) => {
  const [imgStatus, setImgStatus] = useState('loading')

  const year = film.tahunRilis
    ? (typeof film.tahunRilis === 'string' && film.tahunRilis.length === 4
        ? film.tahunRilis
        : new Date(film.tahunRilis).getFullYear())
    : null

  const videoSources = Array.isArray(film.videoSources) ? film.videoSources : []
  const mainThumb    = videoSources.find(v => !v.isTrailer)?.thumbnailUrl
  const trailerThumb = videoSources.find(v => v.isTrailer)?.thumbnailUrl

  const rawPosterUrl =
    film.posterUrl   ||
    film.poster_url  ||
    film.poster      ||
    mainThumb        ||
    trailerThumb     ||
    film.thumbnailUrl ||
    film.thumbnail   ||
    film.coverUrl    ||
    film.imageUrl    ||
    (typeof film.imageUrls === 'string' && film.imageUrls
      ? film.imageUrls.split(',')[0].trim()
      : null) ||
    null

  const thumbUrl = getWikimediaThumb(rawPosterUrl, 600)

  // Hanya retry jika thumbUrl berbeda dari rawPosterUrl (kasus Wikimedia)
  const handleError = (e) => {
    if (thumbUrl && thumbUrl !== rawPosterUrl && e.target.src !== rawPosterUrl && rawPosterUrl) {
      e.target.src = rawPosterUrl
      return
    }
    setImgStatus('error')
  }

  const hasVideo   = Boolean(videoSources.find(v => !v.isTrailer))
  const hasTrailer = Boolean(videoSources.find(v => v.isTrailer))

  const rawRating = film.reviewScores?.[0]?.value
  const rating    = rawRating != null && !isNaN(Number(rawRating))
    ? Number(rawRating).toFixed(1)
    : null

  const allGenres       = film.genre ? (Array.isArray(film.genre) ? film.genre : [film.genre]) : []
  const genreList        = allGenres.slice(0, 2)
  const extraGenreCount   = allGenres.length - genreList.length

  const director = film.sutradara?.[0]?.name || null

  return (
    <Link
      to={`/film/${film.slug || film.id}`}
      className="group relative flex flex-col rounded-xl overflow-hidden
                 transition-all duration-300 ease-out motion-reduce:transition-none
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                 focus-visible:ring-offset-2 focus-visible:ring-offset-white
                 dark:focus-visible:ring-offset-slate-950
                 border shadow-sm hover:shadow-xl hover:-translate-y-1
                 motion-reduce:hover:translate-y-0
                 bg-white border-slate-200 shadow-slate-100/80
                 hover:border-blue-300 hover:shadow-blue-100/60
                 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none
                 dark:hover:border-slate-600 dark:hover:shadow-black/60"
    >
      {/* ── Cover LANDSCAPE — aspect-video (16:9) ──────────────────── */}
      <div className="relative aspect-video overflow-hidden flex-shrink-0
                      bg-slate-100 dark:bg-slate-800">

        {/* Shimmer */}
        {imgStatus === 'loading' && thumbUrl && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br
                          from-slate-200 via-slate-100 to-slate-200
                          dark:from-slate-700 dark:via-slate-600 dark:to-slate-700" />
        )}

        {/* Poster image */}
        {thumbUrl && imgStatus !== 'error' ? (
          <img
            src={thumbUrl}
            alt={film.judul ? `Poster film ${film.judul}` : 'Poster film'}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onLoad={() => setImgStatus('loaded')}
            onError={handleError}
            className={`w-full h-full object-cover
                        group-hover:scale-[1.04] motion-reduce:group-hover:scale-100
                        transition-transform duration-500 ease-out motion-reduce:transition-none
                        ${imgStatus === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2
                          bg-gradient-to-br from-blue-50 to-slate-100
                          dark:from-blue-950/50 dark:to-slate-900">
            <FilmIcon className="w-8 h-8 text-blue-400/60 dark:text-blue-500/40" />
            <p className="text-[9px] text-center text-slate-500 dark:text-slate-400 px-2 line-clamp-2">
              {film.judul}
            </p>
          </div>
        )}

        {/* Bottom gradient */}
        <div className="absolute inset-x-0 bottom-0 h-2/3
                        bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

        {/* Play overlay — bonus polish saat hover/tap di device yang mendukung;
            BUKAN satu-satunya sinyal "ada video", karena badge Full/Trailer
            di pojok kanan-atas sudah terlihat permanen di semua device. */}
        {hasVideo && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 group-active:bg-black/25
                          transition-colors duration-300 motion-reduce:transition-none
                          flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 group-active:opacity-100
                            transition-opacity duration-300 motion-reduce:transition-none">
              <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                <Play className="w-5 h-5 text-blue-600 ml-0.5" fill="currentColor" />
              </div>
            </div>
          </div>
        )}

        {/* ── Pojok kiri-atas: tahun saja ─────────────────────────────── */}
        {year && (
          <div className="absolute top-2 left-2 z-20">
            <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm
                             text-white text-[10px] font-bold tracking-wide">
              {year}
            </span>
          </div>
        )}

        {/* ── Pojok kanan-atas: status hak cipta + badge Full/Trailer,
               ditumpuk vertikal sehingga tidak pernah saling tumpang-tindih ── */}
        {(film.copyrightStatusId || hasVideo || hasTrailer) && (
          <div className="absolute top-2 right-2 z-20 flex flex-col items-end gap-1">
            {film.copyrightStatusId && <CopyrightIcon statusId={film.copyrightStatusId} />}
            {hasVideo && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md
                               bg-emerald-600/90 backdrop-blur-sm text-white text-[9px] font-bold
                               shadow-sm shadow-black/20">
                <Play className="w-2 h-2" fill="currentColor" aria-hidden="true" />Full
              </span>
            )}
            {hasTrailer && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md
                               bg-blue-600/90 backdrop-blur-sm text-white text-[9px] font-bold
                               shadow-sm shadow-black/20">
                <Video className="w-2 h-2" aria-hidden="true" />Trailer
              </span>
            )}
          </div>
        )}

        {/* Bottom overlay: rating + durasi */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
          {rating ? (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full
                            bg-black/30 backdrop-blur-[2px]">
              <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400 flex-shrink-0" aria-hidden="true" />
              <span className="text-white/90 text-[10px] font-semibold tabular-nums">{rating}</span>
            </div>
          ) : (
            <div />
          )}
          {film.durasi && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full
                            bg-black/30 backdrop-blur-[2px]">
              <Clock className="w-2.5 h-2.5 text-white/70 flex-shrink-0" aria-hidden="true" />
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
                className="inline-flex items-center px-1.5 py-0.5 rounded-full
                           text-[9px] font-medium leading-none
                           bg-blue-50 border border-blue-100 text-blue-600
                           dark:bg-blue-900/20 dark:border-blue-800/50 dark:text-blue-400">
                {g}
              </span>
            ))}
            {extraGenreCount > 0 && (
              <span
                title={allGenres.slice(2).join(', ')}
                className="inline-flex items-center px-1.5 py-0.5 rounded-full
                           text-[9px] font-medium leading-none
                           bg-slate-50 border border-slate-200 text-slate-500
                           dark:bg-slate-800/60 dark:border-slate-700 dark:text-slate-400"
              >
                +{extraGenreCount}
              </span>
            )}
          </div>
        )}

        {/* Title */}
        <h3 className="font-semibold text-sm leading-snug line-clamp-2
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

        {/* Country — hanya dirender kalau datanya ada, supaya tidak ada
            garis pembatas kosong menggantung di kartu tanpa data negara */}
        {film.negaraAsal && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-auto pt-1.5
                          border-t border-slate-100 dark:border-slate-800">
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-600">
              <Globe className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
              {film.negaraAsal}
            </span>
          </div>
        )}
      </div>

      {/* Hover glow border */}
      <div className="absolute inset-0 rounded-xl border-2 border-transparent
                      pointer-events-none transition-colors duration-300 motion-reduce:transition-none
                      group-hover:border-blue-300/40 dark:group-hover:border-blue-500/20" />
    </Link>
  )
})

FilmCard.displayName = 'FilmCard'
export default FilmCard
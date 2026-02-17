// ============================================
// src/components/Film/FilmCard.jsx - PORTRAIT (2:3) + MOBILE OPTIMIZED
// ============================================

import { Link } from 'react-router-dom'
import { Clock, Star, Film as FilmIcon, Play, Video } from 'lucide-react'

const FilmCard = ({ film }) => {
  const year = film.tahunRilis ? new Date(film.tahunRilis).getFullYear() : null

  return (
    <Link
      to={`/film/${film.slug}`}
      className="group block bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700"
    >
      {/* Poster - PORTRAIT 2:3 seperti poster film bioskop */}
      <div className="relative aspect-[2/3] overflow-hidden bg-gray-100 dark:bg-gray-700">
        {film.posterUrl ? (
          <img
            src={film.posterUrl}
            alt={film.judul}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FilmIcon className="w-10 h-10 text-gray-400 dark:text-gray-500" />
          </div>
        )}

        {/* Play overlay */}
        {film.videoUrl && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                <Play className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 ml-0.5" fill="currentColor" />
              </div>
            </div>
          </div>
        )}

        {/* Year badge */}
        {year && (
          <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-gray-900/80 backdrop-blur-sm rounded text-[10px] sm:text-xs text-white font-semibold">
            {year}
          </div>
        )}

        {/* Video/Trailer badges */}
        <div className="absolute top-1.5 right-1.5 flex flex-col gap-1">
          {film.videoUrl && (
            <div className="px-1.5 py-0.5 bg-green-600/90 backdrop-blur-sm rounded text-[9px] sm:text-[10px] text-white font-semibold flex items-center gap-0.5">
              <Play className="w-2 h-2" fill="currentColor" />
              <span className="hidden sm:inline">Full</span>
            </div>
          )}
          {film.trailerUrl && (
            <div className="px-1.5 py-0.5 bg-blue-600/90 backdrop-blur-sm rounded text-[9px] sm:text-[10px] text-white font-semibold flex items-center gap-0.5">
              <Video className="w-2 h-2" />
              <span className="hidden sm:inline">Trailer</span>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-2 sm:p-3">
        {/* Title */}
        <h3 className="font-semibold text-xs sm:text-sm leading-snug text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-1">
          {film.judul}
        </h3>

        {/* Director - hidden di mobile kecil */}
        {film.sutradara && film.sutradara.length > 0 && (
          <p className="hidden sm:block text-[10px] text-gray-500 dark:text-gray-400 mb-1 truncate">
            {film.sutradara[0].name}
          </p>
        )}

        {/* Duration */}
        {film.durasi && (
          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-1">
            <Clock className="w-2.5 h-2.5" />
            <span>{film.durasi}</span>
          </div>
        )}

        {/* Genre */}
        {film.genre && film.genre.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            <span className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 rounded text-[9px] sm:text-[10px] font-medium max-w-full truncate">
              {film.genre[0]}
            </span>
            {film.genre[1] && (
              <span className="hidden sm:inline px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 rounded text-[10px] font-medium">
                {film.genre[1]}
              </span>
            )}
          </div>
        )}

        {/* Review score */}
        {film.reviewScores && film.reviewScores.length > 0 && (
          <div className="mt-1 flex items-center gap-0.5">
            <Star className="w-2.5 h-2.5 text-yellow-500" fill="currentColor" />
            <span className="text-[10px] sm:text-xs font-semibold text-gray-700 dark:text-gray-300">
              {film.reviewScores[0].value}
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}

export default FilmCard
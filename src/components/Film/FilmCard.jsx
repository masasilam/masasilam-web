// ============================================
// src/components/Film/FilmCard.jsx - WARNA SEMPURNA SEPERTI BUKU
// ============================================

import { Link } from 'react-router-dom'
import { Calendar, Clock, Eye, Star, Film as FilmIcon, Play } from 'lucide-react'

const FilmCard = ({ film }) => {
  const year = film.tahunRilis ? new Date(film.tahunRilis).getFullYear() : null

  return (
    <Link
      to={`/film/${film.slug}`}
      className="group block bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700"
    >
      {/* Poster Image with Play Overlay */}
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
            <FilmIcon className="w-16 h-16 text-gray-400 dark:text-gray-500" />
          </div>
        )}

        {/* Play Button Overlay */}
        {film.videoUrl && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-16 h-16 rounded-full bg-white/90 dark:bg-gray-900/90 flex items-center justify-center shadow-lg">
                <Play className="w-8 h-8 text-blue-600 dark:text-blue-400 ml-1" fill="currentColor" />
              </div>
            </div>
          </div>
        )}

        {/* Year Badge */}
        {year && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-gray-900/80 dark:bg-gray-950/90 backdrop-blur-sm rounded text-xs text-white font-semibold">
            {year}
          </div>
        )}

        {/* Video Available Badge */}
        {film.videoUrl && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-green-600/90 dark:bg-green-700/90 backdrop-blur-sm rounded text-xs text-white font-semibold flex items-center gap-1">
            <Play className="w-3 h-3" fill="currentColor" />
            <span>Video</span>
          </div>
        )}
      </div>

      {/* Film Info */}
      <div className="p-3 sm:p-4">
        {/* Title - Word wrap enabled */}
        <h3 className="font-semibold text-sm sm:text-base lg:text-lg mb-2 leading-snug text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors break-words hyphens-auto line-clamp-2">
          {film.judul}
        </h3>

        {/* Director */}
        {film.sutradara && film.sutradara.length > 0 && (
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 truncate">
            {film.sutradara[0].name}
          </p>
        )}

        {/* Stats */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-gray-500 dark:text-gray-500">
          {/* Duration */}
          {film.durasi && (
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              <Clock className="w-3 h-3" />
              <span className="text-xs">{film.durasi}</span>
            </div>
          )}

          {/* Year (mobile fallback) */}
          {year && (
            <div className="flex items-center gap-1 sm:hidden text-gray-600 dark:text-gray-400">
              <Calendar className="w-3 h-3" />
              <span className="text-xs">{year}</span>
            </div>
          )}

          {/* Country */}
          {film.negaraAsal && (
            <div className="hidden sm:flex items-center gap-1 text-gray-600 dark:text-gray-400">
              <span className="text-xs">{film.negaraAsal}</span>
            </div>
          )}
        </div>

        {/* Genres */}
        {film.genre && film.genre.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {film.genre.slice(0, 2).map((genre, index) => (
              <span
                key={index}
                className="px-2 py-0.5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 rounded text-xs font-medium"
              >
                {genre}
              </span>
            ))}
            {film.genre.length > 2 && (
              <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs font-medium border border-gray-200 dark:border-gray-600">
                +{film.genre.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}

export default FilmCard
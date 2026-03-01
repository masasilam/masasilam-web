// ============================================
// src/components/Film/FilmGrid.jsx
// ============================================

import { memo } from 'react'
import FilmCard from './FilmCard'
import { Film } from 'lucide-react'

// Skeleton card — sama persis ukurannya dengan FilmCard
// Tidak ada layout shift saat data masuk
const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm animate-pulse">
    {/* Poster skeleton 2:3 */}
    <div className="aspect-[2/3] bg-gray-200 dark:bg-gray-700" />
    {/* Info skeleton */}
    <div className="p-2 sm:p-3 space-y-2">
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
      <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-1" />
    </div>
  </div>
)

const FilmGrid = memo(({ films, loading = false, emptyMessage = 'Tidak ada film ditemukan' }) => {
  // Saat loading: tampilkan 12 skeleton (sesuai page size) — tidak ada layout jump
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
        {Array.from({ length: 12 }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (!films || films.length === 0) {
    return (
      <div className="text-center py-12">
        <Film className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
        <p className="text-gray-600 dark:text-gray-400">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
      {films.map(film => (
        <FilmCard key={film.id} film={film} />
      ))}
    </div>
  )
})

FilmGrid.displayName = 'FilmGrid'

export default FilmGrid
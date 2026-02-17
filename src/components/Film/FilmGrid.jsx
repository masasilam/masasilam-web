// ============================================
// src/components/Film/FilmGrid.jsx
// ============================================

import FilmCard from './FilmCard'
import LoadingSpinner from '../Common/LoadingSpinner'
import { Film } from 'lucide-react'

const FilmGrid = ({ films, loading = false, emptyMessage = 'Tidak ada film ditemukan' }) => {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
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
}

export default FilmGrid
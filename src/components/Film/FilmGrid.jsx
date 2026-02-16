// ============================================
// src/components/Film/FilmGrid.jsx - LANDSCAPE FORMAT
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
      {films.map(film => (
        <FilmCard key={film.id} film={film} />
      ))}
    </div>
  )
}

export default FilmGrid
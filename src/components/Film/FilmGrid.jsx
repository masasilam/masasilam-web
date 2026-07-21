import { memo } from 'react'
import FilmCard from './FilmCard'

// ── Skeleton card — LANDSCAPE ─────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="rounded-xl border overflow-hidden animate-pulse
                  bg-white border-slate-200
                  dark:bg-slate-900 dark:border-slate-800">
    {/* Cover skeleton — aspect-video landscape */}
    <div className="aspect-video relative overflow-hidden
                    bg-gradient-to-br from-slate-100 to-slate-200
                    dark:from-slate-800 dark:to-slate-700">
      <div className="absolute inset-0 -translate-x-full
                      bg-gradient-to-r from-transparent via-white/30 to-transparent
                      dark:via-white/5
                      animate-[shimmer_1.5s_infinite]" />
      <div className="absolute top-2 left-2 h-4 w-10 rounded-md bg-slate-200/60 dark:bg-slate-600/40" />
      <div className="absolute top-2 right-2 h-4 w-8 rounded-md bg-slate-200/60 dark:bg-slate-600/40" />
      <div className="absolute bottom-2 left-2 h-4 w-12 rounded-full bg-black/15" />
      <div className="absolute bottom-2 right-2 h-4 w-14 rounded-full bg-black/15" />
    </div>
    {/* Info skeleton */}
    <div className="p-3 space-y-2.5">
      <div className="flex gap-1">
        <div className="h-4 w-12 rounded-full bg-slate-200 dark:bg-slate-700" />
        <div className="h-4 w-10 rounded-full bg-slate-200 dark:bg-slate-700" />
      </div>
      <div className="space-y-1.5">
        <div className="h-3 rounded-md w-full bg-slate-200 dark:bg-slate-700" />
        <div className="h-3 rounded-md w-3/4 bg-slate-200 dark:bg-slate-700" />
      </div>
      <div className="h-2.5 rounded-md w-1/2 bg-slate-100 dark:bg-slate-800" />
      <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800">
        <div className="h-2.5 w-2.5 rounded-full bg-slate-100 dark:bg-slate-800" />
        <div className="h-2 w-16 rounded bg-slate-100 dark:bg-slate-800" />
      </div>
    </div>
  </div>
)

// ── FilmGrid ──────────────────────────────────────────────────────────────────
const FilmGrid = memo(({
  films,
  loading       = false,
  emptyMessage  = 'Tidak ada film ditemukan',
  skeletonCount = 12,
}) => {
  // Landscape card lebih lebar → lebih sedikit kolom
  const gridClass = 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4'

  if (loading) {
    return (
      <>
        <style>{`@keyframes shimmer { 100% { transform: translateX(200%); } }`}</style>
        <div className={gridClass} aria-busy="true" aria-label="Memuat film…">
          {Array.from({ length: skeletonCount }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </>
    )
  }

  if (!films || films.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 mb-5 rounded-2xl flex items-center justify-center text-4xl
                        bg-slate-100 dark:bg-slate-800">
          🎬
        </div>
        <p className="text-base font-medium mb-1 text-slate-500 dark:text-slate-400">
          {emptyMessage}
        </p>
        <p className="text-sm text-slate-400 dark:text-slate-600">
          Coba ubah filter atau kata kunci pencarian
        </p>
      </div>
    )
  }

  return (
    <div className={gridClass}>
      {films.map(film => <FilmCard key={film.id} film={film} />)}
    </div>
  )
})

FilmGrid.displayName = 'FilmGrid'
export default FilmGrid
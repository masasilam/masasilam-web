import BookCard from './BookCard'

const SkeletonCard = () => (
  <div className="rounded-xl border overflow-hidden animate-pulse
                  bg-white border-stone-200
                  dark:bg-slate-900 dark:border-slate-800">
    {/* Cover skeleton */}
    <div className="aspect-[2/3] relative overflow-hidden
                    bg-gradient-to-br from-stone-100 to-stone-200
                    dark:from-slate-800 dark:to-slate-750">
      <div className="absolute inset-0 -translate-x-full
                      bg-gradient-to-r from-transparent via-white/30 to-transparent
                      dark:via-white/5
                      animate-[shimmer_1.5s_infinite]" />
    </div>
    {/* Info skeleton */}
    <div className="p-3 space-y-2.5">
      {/* Genre pill */}
      <div className="h-2 w-14 rounded-full
                      bg-stone-200 dark:bg-slate-700" />
      {/* Title lines */}
      <div className="space-y-1.5">
        <div className="h-3 rounded-md w-full bg-stone-200 dark:bg-slate-700" />
        <div className="h-3 rounded-md w-3/4 bg-stone-200 dark:bg-slate-700" />
      </div>
      {/* Author */}
      <div className="h-2.5 rounded-md w-1/2 bg-stone-100 dark:bg-slate-800" />
      {/* Stats */}
      <div className="flex gap-2 pt-1">
        <div className="h-2 w-8 rounded bg-stone-100 dark:bg-slate-800" />
        <div className="h-2 w-8 rounded bg-stone-100 dark:bg-slate-800" />
        <div className="h-2 w-8 rounded bg-stone-100 dark:bg-slate-800" />
      </div>
    </div>
  </div>
)

// ── BookGrid ──────────────────────────────────────────────────────────────────
const BookGrid = ({
  books,
  loading       = false,
  emptyMessage  = 'Tidak ada buku ditemukan',
  skeletonCount = 12,
}) => {
  const gridClass = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4'

  if (loading) {
    return (
      <>
        <style>{`@keyframes shimmer { 100% { transform: translateX(200%); } }`}</style>
        <div className={gridClass} aria-busy="true" aria-label="Memuat buku…">
          {Array.from({ length: skeletonCount }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </>
    )
  }

  if (!books || books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        {/* Empty icon
            LIGHT: bg-stone-100 text
            DARK:  bg-slate-800 */}
        <div className="w-20 h-20 mb-5 rounded-2xl flex items-center justify-center text-4xl
                        bg-stone-100 dark:bg-slate-800">
          📚
        </div>
        <p className="text-base font-medium mb-1
                      text-stone-500 dark:text-slate-400">
          {emptyMessage}
        </p>
        <p className="text-sm text-stone-400 dark:text-slate-600">
          Coba ubah filter atau kata kunci pencarian
        </p>
      </div>
    )
  }

  return (
    <div className={gridClass}>
      {books.map((book) => <BookCard key={book.id} book={book} />)}
    </div>
  )
}

export default BookGrid
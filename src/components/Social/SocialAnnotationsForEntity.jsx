import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Quote, Heart, MessageCircle, ChevronDown, Loader2, RefreshCw } from 'lucide-react'
import { annotationService } from '../../services/socialService'

// ── Single annotation card (ringkas) ─────────────────────────────────────────
const AnnotationMiniCard = ({ ann }) => {
  const [liked,     setLiked]     = useState(ann.isLiked || false)
  const [likeCount, setLikeCount] = useState(ann.likeCount || 0)
  const [pending,   setPending]   = useState(false)

  const isAuthenticated = !!localStorage.getItem('token')

  const toggleLike = async () => {
    if (!isAuthenticated) return
    if (pending) return
    setPending(true)
    try {
      if (liked) {
        await annotationService.unlike(ann.id)
        setLiked(false); setLikeCount(p => Math.max(0, p - 1))
      } else {
        await annotationService.like(ann.id)
        setLiked(true); setLikeCount(p => p + 1)
      }
    } catch {}
    finally { setPending(false) }
  }

  return (
    <article className="rounded-xl border p-4 transition-all hover:border-rose-200 dark:hover:border-rose-800
                         bg-white border-stone-100 dark:bg-slate-900 dark:border-slate-800">
      {/* Color bar */}
      <div className="h-0.5 w-8 rounded-full mb-3" style={{ backgroundColor: ann.color || '#FDE68A' }} />

      {/* Quote */}
      <blockquote className="relative pl-3 mb-3">
        <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full"
          style={{ backgroundColor: ann.color || '#FDE68A' }} />
        <p className="text-sm text-stone-700 dark:text-slate-300 leading-relaxed italic line-clamp-3">
          "{ann.selectedText}"
        </p>
      </blockquote>

      {/* Note */}
      {ann.note && (
        <p className="text-xs text-stone-500 dark:text-slate-400 mb-3 line-clamp-2">{ann.note}</p>
      )}

      {/* Footer */}
      <div className="flex items-center gap-3">
        <Link to={`/sosial/profil/${ann.username}`}
          className="flex items-center gap-1.5 min-w-0 flex-1">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-rose-400 to-pink-500
                          flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">
            {(ann.username || 'U').charAt(0).toUpperCase()}
          </div>
          <span className="text-xs font-medium text-stone-600 dark:text-slate-400 truncate
                           hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
            {ann.displayName || ann.username}
          </span>
        </Link>

        {ann.chapterLabel && (
          <span className="text-[10px] text-stone-400 dark:text-slate-500 flex-shrink-0">
            {ann.chapterLabel}
          </span>
        )}

        <button
          onClick={toggleLike}
          className={`flex items-center gap-1 text-xs transition-all hover:scale-110 flex-shrink-0
                      ${liked ? 'text-rose-500' : 'text-stone-400 hover:text-rose-400'}`}
        >
          <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-rose-500' : ''}`} />
          {likeCount > 0 && <span>{likeCount}</span>}
        </button>
      </div>
    </article>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
const SocialAnnotationsForEntity = ({ entityType, entityId }) => {
  const [annotations, setAnnotations] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page,        setPage]        = useState(1)
  const [hasMore,     setHasMore]     = useState(false)
  const [total,       setTotal]       = useState(0)
  const LIMIT = 4

  const load = useCallback(async (p = 1, append = false) => {
    if (p === 1) setLoading(true); else setLoadingMore(true)
    try {
      const res  = await annotationService.getByEntity(entityType, entityId, p, LIMIT)
      const d    = res.data?.data
      const list = d?.list || d?.data || []
      const tot  = d?.total || 0
      setAnnotations(prev => append ? [...prev, ...list] : list)
      setTotal(tot)
      setHasMore(p * LIMIT < tot)
      setPage(p)
    } catch (err) {
      console.warn('[SocialAnnotationsForEntity] load error:', err.message)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [entityType, entityId])

  useEffect(() => { load(1, false) }, [load])

  if (loading) return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="w-5 h-5 animate-spin text-stone-300 dark:text-slate-600" />
    </div>
  )

  if (annotations.length === 0) return (
    <div className="flex flex-col items-center py-8 gap-2 rounded-xl border border-dashed
                    border-stone-200 dark:border-slate-700">
      <Quote className="w-8 h-8 text-stone-200 dark:text-slate-700" />
      <p className="text-sm text-stone-400 dark:text-slate-500">Belum ada kutipan untuk konten ini</p>
    </div>
  )

  return (
    <div className="space-y-3">
      {/* List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {annotations.map(ann => (
          <AnnotationMiniCard key={ann.id} ann={ann} />
        ))}
      </div>

      {/* Load more */}
      {hasMore && (
        <button
          onClick={() => load(page + 1, true)}
          disabled={loadingMore}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border
                     text-sm text-stone-500 hover:text-rose-600 hover:border-rose-300
                     border-stone-200 dark:border-slate-700 dark:text-slate-400
                     dark:hover:border-rose-700 dark:hover:text-rose-400
                     transition-all disabled:opacity-50">
          {loadingMore
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <ChevronDown className="w-4 h-4" />
          }
          {loadingMore
            ? 'Memuat...'
            : `Lihat ${Math.min(LIMIT, total - annotations.length)} kutipan lagi`
          }
        </button>
      )}

      {/* Link to full page */}
      {total > 0 && (
        <p className="text-center text-xs text-stone-400 dark:text-slate-500">
          {total} kutipan total ·{' '}
          <Link to="/sosial/anotasi"
            className="text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 hover:underline">
            Lihat semua di Kutipan Sosial
          </Link>
        </p>
      )}
    </div>
  )
}

export default SocialAnnotationsForEntity
import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  ListChecks, Heart, Eye, GitFork, Globe, Lock,
  Loader2, ChevronRight, Tag
} from 'lucide-react'
import { readingListService } from '../../services/socialService'

// ── Single list mini card ─────────────────────────────────────────────────────
const ListMiniCard = ({ list }) => {
  const tags = list.tags
    ? (Array.isArray(list.tags)
        ? list.tags
        : list.tags.split(',').map(t => t.trim()).filter(Boolean))
    : []

  return (
    <Link
      to={`/sosial/daftar/${list.id}`}
      className="flex items-start gap-3 p-3.5 rounded-xl border transition-all group
                 bg-white border-stone-100 hover:border-teal-200 hover:shadow-sm
                 dark:bg-slate-900 dark:border-slate-800 dark:hover:border-teal-800"
    >
      {/* Icon */}
      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-400 to-amber-400
                      flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
        <ListChecks className="w-4 h-4 text-white" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          {list.visibility === 'private'
            ? <Lock className="w-3 h-3 text-stone-400 dark:text-slate-500" />
            : <Globe className="w-3 h-3 text-stone-400 dark:text-slate-500" />
          }
          <span className="text-[10px] text-stone-400 dark:text-slate-500 truncate">
            {list.username || list.owner?.username || 'Anonim'}
          </span>
        </div>

        <h4 className="text-sm font-semibold line-clamp-1 mb-1
                        text-stone-900 dark:text-slate-100
                        group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
          {list.title}
        </h4>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1.5">
            {tags.slice(0, 3).map(t => (
              <span key={t}
                className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full
                           bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
                <Tag className="w-2 h-2" />{t}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 text-[10px] text-stone-400 dark:text-slate-500">
          <span className="flex items-center gap-0.5">
            <ListChecks className="w-3 h-3" />
            {list.itemCount || 0} item
          </span>
          <span className="flex items-center gap-0.5">
            <Heart className="w-3 h-3" />
            {list.likeCount || 0}
          </span>
          <span className="flex items-center gap-0.5">
            <Eye className="w-3 h-3" />
            {list.viewCount || 0}
          </span>
          {(list.forkedCount || 0) > 0 && (
            <span className="flex items-center gap-0.5">
              <GitFork className="w-3 h-3" />
              {list.forkedCount}
            </span>
          )}
        </div>
      </div>

      <ChevronRight className="w-4 h-4 flex-shrink-0 mt-1
                               text-stone-300 dark:text-slate-600
                               group-hover:text-teal-500 dark:group-hover:text-teal-400 transition-colors" />
    </Link>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
const ListsContainingEntity = ({ entityType, entityId }) => {
  const [lists,   setLists]   = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await readingListService.findContaining(entityType, entityId)
      const data = res.data?.data
      // API bisa return array langsung atau { list: [...] }
      const list = Array.isArray(data) ? data : (data?.list || data?.data || [])
      setLists(list)
    } catch (err) {
      console.warn('[ListsContainingEntity] load error:', err.message)
    } finally {
      setLoading(false)
    }
  }, [entityType, entityId])

  useEffect(() => { load() }, [load])

  if (loading) return (
    <div className="flex items-center justify-center py-6">
      <Loader2 className="w-5 h-5 animate-spin text-stone-300 dark:text-slate-600" />
    </div>
  )

  if (lists.length === 0) return (
    <div className="flex flex-col items-center py-6 gap-2 rounded-xl border border-dashed
                    border-stone-200 dark:border-slate-700">
      <ListChecks className="w-7 h-7 text-stone-200 dark:text-slate-700" />
      <p className="text-sm text-stone-400 dark:text-slate-500">
        Belum ada daftar baca yang menyimpan konten ini
      </p>
    </div>
  )

  return (
    <div className="space-y-2">
      {lists.slice(0, 6).map(list => (
        <ListMiniCard key={list.id} list={list} />
      ))}

      {lists.length > 6 && (
        <p className="text-center text-xs text-stone-400 dark:text-slate-500 pt-1">
          +{lists.length - 6} daftar lainnya ·{' '}
          <Link to="/sosial/daftar"
            className="text-teal-600 hover:underline dark:text-teal-400">
            Jelajahi daftar baca
          </Link>
        </p>
      )}
    </div>
  )
}

export default ListsContainingEntity
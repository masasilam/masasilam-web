// src/pages/social/SocialFeedPage.jsx
import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Heart, MessageCircle, BookOpen, Film, Layers, Users, Trophy,
  Bookmark, PenLine, Share2, ChevronDown, Globe, UserCheck, Loader2,
  UserPlus, ListChecks, Send, X, MoreHorizontal
} from 'lucide-react'
import { feedService } from '../../services/socialService'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'

// ── Activity type config ──────────────────────────────────────────────────────
const ACTIVITY_CONFIG = {
  finished_book:        { label: 'selesai membaca',    icon: BookOpen,    color: 'text-amber-500'   },
  started_reading:      { label: 'mulai membaca',      icon: BookOpen,    color: 'text-blue-500'    },
  reading:              { label: 'sedang membaca',     icon: BookOpen,    color: 'text-blue-400'    },
  reviewed:             { label: 'menulis ulasan',     icon: PenLine,     color: 'text-purple-500'  },
  shared_annotation:    { label: 'membagikan kutipan', icon: PenLine,     color: 'text-rose-500'    },
  added_to_list:        { label: 'menambah ke daftar', icon: ListChecks,  color: 'text-teal-500'    },
  created_reading_list: { label: 'membuat daftar baca',icon: ListChecks,  color: 'text-teal-500'    },
  joined_challenge:     { label: 'bergabung tantangan',icon: Trophy,      color: 'text-yellow-500'  },
  completed_challenge:  { label: 'menyelesaikan tantangan', icon: Trophy, color: 'text-yellow-500' },
  joined_group:         { label: 'bergabung grup',     icon: Users,       color: 'text-indigo-500'  },
  created_group:        { label: 'membuat grup',       icon: Users,       color: 'text-indigo-500'  },
  followed_user:        { label: 'mengikuti',          icon: UserPlus,    color: 'text-pink-500'    },
  default:              { label: 'beraktivitas',       icon: BookOpen,    color: 'text-gray-500'    },
}

const ENTITY_LINK = {
  BOOK:         (slug) => `/buku/${slug}`,
  ZINE:         (slug) => `/zine/${slug}`,
  FILM:         (slug) => `/film/${slug}`,
  CHALLENGE:    (slug) => `/sosial/tantangan/${slug}`,
  GROUP:        (slug) => `/sosial/grup/${slug}`,
  READING_LIST: (slug) => `/sosial/daftar/${slug}`,
  USER:         (slug) => `/sosial/profil/${slug}`,
}

// ── Comment Section ───────────────────────────────────────────────────────────
const CommentSection = ({ activityId, commentCount, onClose }) => {
  const { user } = useAuth()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await feedService.getComments(activityId)
        setComments(res.data?.data?.items || [])
      } catch { setComments([]) }
      finally { setLoading(false) }
    }
    load()
  }, [activityId])

  const submit = async () => {
    if (!text.trim()) return
    setSubmitting(true)
    try {
      const res = await feedService.addComment(activityId, { content: text })
      setComments(prev => [...prev, res.data?.data])
      setText('')
    } catch { toast.error('Gagal mengirim komentar') }
    finally { setSubmitting(false) }
  }

  const deleteComment = async (commentId) => {
    try {
      await feedService.deleteComment(commentId)
      setComments(prev => prev.filter(c => c.id !== commentId))
    } catch { toast.error('Gagal menghapus komentar') }
  }

  const startEdit = (c) => { setEditingId(c.id); setEditText(c.content) }
  const saveEdit = async (commentId) => {
    try {
      await feedService.updateComment(commentId, { content: editText })
      setComments(prev => prev.map(c => c.id === commentId ? { ...c, content: editText } : c))
      setEditingId(null)
    } catch { toast.error('Gagal memperbarui komentar') }
  }

  return (
    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
      {loading ? (
        <div className="flex justify-center py-4"><Loader2 className="w-4 h-4 animate-spin text-gray-400" /></div>
      ) : (
        <div className="space-y-3 mb-3">
          {comments.map(c => (
            <div key={c.id} className="flex gap-2.5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {(c.username || 'U').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2">
                  <span className="text-xs font-semibold text-gray-800 dark:text-gray-100 mr-1.5">{c.username}</span>
                  {editingId === c.id ? (
                    <div className="mt-1 flex gap-2">
                      <input value={editText} onChange={e => setEditText(e.target.value)}
                        className="flex-1 text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-amber-500/30" />
                      <button onClick={() => saveEdit(c.id)} className="text-xs text-amber-600 font-semibold">Simpan</button>
                      <button onClick={() => setEditingId(null)} className="text-xs text-gray-400">Batal</button>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-700 dark:text-gray-300">{c.content}</span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 px-1">
                  <span className="text-[10px] text-gray-400">{c.timeAgo || c.createdAt}</span>
                  {c.isOwner && (
                    <>
                      <button onClick={() => startEdit(c)} className="text-[10px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">Edit</button>
                      <button onClick={() => deleteComment(c.id)} className="text-[10px] text-gray-400 hover:text-red-500">Hapus</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
          {comments.length === 0 && <p className="text-xs text-gray-400 text-center py-2">Belum ada komentar</p>}
        </div>
      )}
      {/* Input */}
      <div className="flex gap-2">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {(user?.username || 'U').charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 flex gap-2">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && submit()}
            placeholder="Tulis komentar..."
            className="flex-1 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500/30 text-gray-900 dark:text-gray-100 placeholder-gray-400"
          />
          <button
            onClick={submit}
            disabled={submitting || !text.trim()}
            className="p-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 rounded-full text-white transition-all"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Activity Card ─────────────────────────────────────────────────────────────
const ActivityCard = ({ item }) => {
  const [liked, setLiked] = useState(item.isLiked || false)
  const [likeCount, setLikeCount] = useState(item.likeCount || 0)
  const [showComments, setShowComments] = useState(false)
  const [commentCount, setCommentCount] = useState(item.commentCount || 0)
  const [likePending, setLikePending] = useState(false)

  const cfg = ACTIVITY_CONFIG[item.activityType] || ACTIVITY_CONFIG.default
  const Icon = cfg.icon
  const entityLink = ENTITY_LINK[item.entityType]?.(item.entitySlug || item.entityId)

  const toggleLike = async () => {
    if (likePending) return
    setLikePending(true)
    try {
      if (liked) {
        await feedService.unlikeActivity(item.id)
        setLiked(false)
        setLikeCount(p => Math.max(0, p - 1))
      } else {
        await feedService.likeActivity(item.id)
        setLiked(true)
        setLikeCount(p => p + 1)
      }
    } catch (e) {
      if (e?.response?.status === 400) {
        setLiked(true)
        setLikeCount(p => p)
      }
    } finally { setLikePending(false) }
  }

  return (
    <article className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 hover:border-gray-200 dark:hover:border-gray-700 transition-colors">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <Link to={`/sosial/profil/${item.username}`}>
          {item.userPhoto ? (
            <img src={item.userPhoto} alt={item.username} className="w-9 h-9 rounded-full object-cover" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-sm font-bold">
              {(item.username || 'U').charAt(0).toUpperCase()}
            </div>
          )}
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-sm leading-snug">
            <Link to={`/sosial/profil/${item.username}`} className="font-semibold text-gray-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400">
              {item.displayName || item.username}
            </Link>
            {' '}
            <span className="text-gray-500 dark:text-gray-400">{cfg.label}</span>
            {item.entityTitle && entityLink && (
              <>
                {' '}
                <Link to={entityLink} className="font-medium text-gray-800 dark:text-gray-200 hover:text-amber-600 dark:hover:text-amber-400">
                  {item.entityTitle}
                </Link>
              </>
            )}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{item.timeAgo}</p>
        </div>
        <div className="flex items-center gap-1">
          <span className={`p-1 rounded-lg ${cfg.color} bg-gray-50 dark:bg-gray-800`}>
            <Icon className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* Entity cover */}
      {item.entityCover && (
        <div className="mb-3 rounded-xl overflow-hidden">
          {entityLink ? (
            <Link to={entityLink}>
              <img src={item.entityCover} alt={item.entityTitle} className="w-full h-32 object-cover hover:scale-105 transition-transform duration-300" />
            </Link>
          ) : (
            <img src={item.entityCover} alt={item.entityTitle} className="w-full h-32 object-cover" />
          )}
        </div>
      )}

      {/* Metadata (e.g. annotation text) */}
      {item.metadata && (() => {
        try {
          const meta = typeof item.metadata === 'string' ? JSON.parse(item.metadata) : item.metadata
          if (meta.selectedText) return (
            <blockquote className="mb-3 pl-3 border-l-2 border-amber-400 text-sm text-gray-600 dark:text-gray-300 italic line-clamp-3">
              "{meta.selectedText}"
            </blockquote>
          )
        } catch {}
        return null
      })()}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-2 border-t border-gray-50 dark:border-gray-800">
        <button
          onClick={toggleLike}
          className={`flex items-center gap-1.5 text-sm transition-all hover:scale-110 ${liked ? 'text-rose-500' : 'text-gray-400 hover:text-rose-400'}`}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-rose-500' : ''}`} />
          <span className="text-xs">{likeCount > 0 ? likeCount : ''}</span>
        </button>
        <button
          onClick={() => setShowComments(v => !v)}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-blue-400 transition-all"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-xs">{commentCount > 0 ? commentCount : ''}</span>
        </button>
      </div>

      {showComments && (
        <CommentSection activityId={item.id} commentCount={commentCount} />
      )}
    </article>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
const FeedSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 animate-pulse">
        <div className="flex gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-3/5" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          </div>
        </div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/5 mb-2" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
      </div>
    ))}
  </div>
)

// ── Main Page ─────────────────────────────────────────────────────────────────
const SocialFeedPage = () => {
  const { isAuthenticated } = useAuth()
  const [tab, setTab] = useState(isAuthenticated ? 'following' : 'public')
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const initialized = useRef(false)

  const load = useCallback(async (p = 1, reset = false) => {
    if (p === 1) setLoading(true); else setLoadingMore(true)
    try {
      const fn = tab === 'following' ? feedService.getFollowingFeed : feedService.getPublicFeed
      const res = await fn(p, 20)
      const data = res.data?.data
      const newItems = data?.items || []
      setItems(prev => reset ? newItems : [...prev, ...newItems])
      setHasMore(data?.hasMore || false)
      setPage(p)
    } catch { toast.error('Gagal memuat feed') }
    finally { setLoading(false); setLoadingMore(false) }
  }, [tab])

  useEffect(() => {
    setItems([])
    setPage(1)
    setHasMore(true)
    load(1, true)
  }, [tab])

  return (
    <div className="max-w-xl mx-auto">
      {/* Tab switcher */}
      <div className="flex gap-1 mb-5 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
        {isAuthenticated && (
          <button
            onClick={() => setTab('following')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${
              tab === 'following' ? 'bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <UserCheck className="w-4 h-4" /> Mengikuti
          </button>
        )}
        <button
          onClick={() => setTab('public')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${
            tab === 'public' ? 'bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          <Globe className="w-4 h-4" /> Publik
        </button>
      </div>

      {loading ? <FeedSkeleton /> : (
        <>
          {items.length === 0 ? (
            <div className="text-center py-16">
              <Globe className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {tab === 'following' ? 'Ikuti pengguna untuk melihat aktivitas mereka' : 'Belum ada aktivitas'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, i) => <ActivityCard key={item.id || i} item={item} />)}
            </div>
          )}

          {hasMore && !loading && (
            <div className="mt-6 text-center">
              <button
                onClick={() => load(page + 1)}
                disabled={loadingMore}
                className="px-6 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-400 transition-all disabled:opacity-50 flex items-center gap-2 mx-auto"
              >
                {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronDown className="w-4 h-4" />}
                Muat lebih banyak
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default SocialFeedPage
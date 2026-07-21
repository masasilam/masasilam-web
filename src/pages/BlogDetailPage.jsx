import { useState, useEffect, useCallback, useRef, useTransition } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  Heart, Share2, MessageCircle, Eye, Calendar, Clock, User,
  ArrowLeft, Tag, ChevronDown, BookOpen, ThumbsUp, Send,
  X, Rss, ExternalLink, Bookmark, BookmarkCheck,
  Type, Minus, Plus,
} from 'lucide-react'
import api from '../services/api'
import '../styles/epub-styles.css'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from '../components/Common/LoadingSpinner'
import Alert from '../components/Common/Alert'
import SEO from '../components/Common/SEO'
import feedEvents, { FEED_EVENTS } from '../services/feedEvents'

const FONT_SIZES = [
  { label: 'XS',  value: '0.82rem' },
  { label: 'S',   value: '0.92rem' },
  { label: 'M',   value: '1rem'    },
  { label: 'L',   value: '1.1rem'  },
  { label: 'XL',  value: '1.2rem'  },
  { label: 'XXL', value: '1.35rem' },
]
const FONT_FAMILIES = [
  { key: 'garamond', label: 'Garamond', stack: '"Minion Pro","Adobe Garamond Pro","Garamond","Times New Roman","Liberation Serif",serif' },
  { key: 'georgia',  label: 'Georgia',  stack: 'Georgia,"Times New Roman",serif' },
  { key: 'times',    label: 'Times',    stack: '"Times New Roman",Times,serif' },
  { key: 'palatino', label: 'Palatino', stack: '"Palatino Linotype","Book Antiqua",Palatino,serif' },
  { key: 'system',   label: 'Sans',     stack: 'ui-sans-serif,system-ui,-apple-system,sans-serif' },
]
const READ_MODES = [
  { key: 'light', label: 'Terang', bg: '#ffffff', color: '#1c1917', cardBg: '#fafaf9', border: '#e7e5e4', articleBg: '#ffffff' },
  { key: 'sepia', label: 'Sepia',  bg: '#f5f0e8', color: '#3b2d1f', cardBg: '#ede8de', border: '#d6c9b0', articleBg: '#f5f0e8' },
  { key: 'dark',  label: 'Gelap',  bg: '#020617', color: '#f1f5f9', cardBg: '#0f172a', border: '#334155', articleBg: '#0f172a' },
]
const LS_FONT_SIZE   = 'blog_reader_fontSize'
const LS_FONT_FAMILY = 'blog_reader_fontFamily'
const LS_MODE        = 'blog_reader_mode'

const preprocessContent = (html) => {
  if (!html) return html
  const MIN_LEN    = 7
  const CHUNK_SIZE = 4
  const withSoftHyphens = html.replace(
    />([^<]+)</g,
    (match, textNode) => {
      const processed = textNode.replace(
        /\b([a-zA-ZÀ-ÿА-яёÀ-ÖØ-öø-ÿ]{7,})\b/g,
        (word) => {
          if (word.length < MIN_LEN) return word
          let result = ''
          for (let i = 0; i < word.length; i++) {
            result += word[i]
            const remaining = word.length - i - 1
            if ((i + 1) % CHUNK_SIZE === 0 && remaining >= 3) {
              result += '\u00AD'
            }
          }
          return result
        }
      )
      return `>${processed}<`
    }
  )
  const withFixedIndent = withSoftHyphens.replace(
    /<p(?!\s[^>]*class[^>]*>)(\s*)>([\s\S]*?)<\/p>(\s*)<(h[1-6])/g,
    (match, space, content, whitespace, heading) => {
      return `<p${space} class="no-indent">${content}</p>${whitespace}<${heading}`
    }
  )
  return withFixedIndent
}

const formatDate = (dateStr, opts = {}) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric', ...opts
  })
}
const readTime = (content) => {
  if (!content) return null
  return Math.ceil(content.trim().split(/\s+/).length / 200)
}
const CATEGORY_ACCENTS = {
  default:   'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-900/20 dark:border-amber-700/50 dark:text-amber-300',
  Buku:      'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-700/40 dark:text-amber-300',
  Film:      'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700/40 dark:text-blue-300',
  Budaya:    'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:border-purple-700/40 dark:text-purple-300',
  Teknologi: 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-700/40 dark:text-emerald-300',
  Sejarah:   'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-900/20 dark:border-rose-700/40 dark:text-rose-300',
}
const getCatCls = (cat) => CATEGORY_ACCENTS[cat] || CATEGORY_ACCENTS.default

const ReaderToolbar = ({ fontIdx, setFontIdx, fontFamilyKey, setFontFamilyKey, modeKey, setModeKey }) => {
  const [open, setOpen] = useState(false)
  const ref  = useRef(null)
  const mode = READ_MODES.find(m => m.key === modeKey) || READ_MODES[0]
  const currentFont = FONT_FAMILIES.find(f => f.key === fontFamilyKey) || FONT_FAMILIES[0]

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        title="Pengaturan Tampilan"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all"
        style={{
          borderColor:     open ? '#f59e0b' : mode.border,
          color:           open ? '#f59e0b' : mode.color,
          backgroundColor: open ? 'rgba(245,158,11,0.08)' : mode.cardBg,
        }}
      >
        <Type className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Tampilan</span>
      </button>

      {open && (
        <div
          className="absolute top-full right-0 mt-2 z-50 rounded-2xl shadow-2xl border p-5 w-80"
          style={{ background: mode.bg, borderColor: mode.border }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider"
              style={{ color: mode.color, opacity: 0.5 }}>
              Pengaturan Baca
            </span>
            <button onClick={() => setOpen(false)}
              style={{ color: mode.color, opacity: 0.4 }}
              className="hover:opacity-70 transition-opacity">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mb-5">
            <p className="text-xs font-semibold mb-2" style={{ color: mode.color, opacity: 0.55 }}>
              Ukuran Huruf
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFontIdx(i => Math.max(0, i - 1))}
                disabled={fontIdx === 0}
                className="w-8 h-8 rounded-lg border flex items-center justify-center disabled:opacity-25 transition-opacity"
                style={{ borderColor: mode.border, color: mode.color, background: mode.cardBg }}>
                <Minus className="w-3.5 h-3.5" />
              </button>
              <div className="flex flex-1 gap-1">
                {FONT_SIZES.map((f, i) => (
                  <button key={f.label} onClick={() => setFontIdx(i)}
                    className="flex-1 h-8 rounded-lg border text-xs font-mono font-bold transition-all"
                    style={{
                      borderColor: i === fontIdx ? '#f59e0b' : mode.border,
                      background:  i === fontIdx ? '#f59e0b' : mode.cardBg,
                      color:       i === fontIdx ? '#ffffff' : mode.color,
                    }}>
                    {f.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setFontIdx(i => Math.min(FONT_SIZES.length - 1, i + 1))}
                disabled={fontIdx === FONT_SIZES.length - 1}
                className="w-8 h-8 rounded-lg border flex items-center justify-center disabled:opacity-25 transition-opacity"
                style={{ borderColor: mode.border, color: mode.color, background: mode.cardBg }}>
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="mt-2 text-center transition-all"
              style={{ fontSize: FONT_SIZES[fontIdx].value, color: mode.color, fontFamily: currentFont.stack, opacity: 0.55 }}>
              Contoh teks dengan ukuran ini
            </p>
          </div>

          <div className="mb-5">
            <p className="text-xs font-semibold mb-2" style={{ color: mode.color, opacity: 0.55 }}>
              Jenis Huruf
            </p>
            <div className="flex flex-wrap gap-1.5">
              {FONT_FAMILIES.map(f => (
                <button key={f.key} onClick={() => setFontFamilyKey(f.key)}
                  className="px-3 py-1.5 rounded-lg border text-xs transition-all"
                  style={{
                    fontFamily:  f.stack,
                    borderColor: fontFamilyKey === f.key ? '#f59e0b' : mode.border,
                    background:  fontFamilyKey === f.key ? '#f59e0b' : mode.cardBg,
                    color:       fontFamilyKey === f.key ? '#ffffff' : mode.color,
                    fontWeight:  fontFamilyKey === f.key ? 600 : 400,
                  }}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: mode.color, opacity: 0.55 }}>
              Mode Baca
            </p>
            <div className="flex gap-2">
              {READ_MODES.map(m => (
                <button key={m.key} onClick={() => setModeKey(m.key)}
                  className="flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-xl border transition-all"
                  style={{
                    background:  modeKey === m.key ? '#f59e0b' : m.cardBg,
                    borderColor: modeKey === m.key ? '#f59e0b' : mode.border,
                    color:       modeKey === m.key ? '#ffffff' : mode.color,
                  }}>
                  <div className="w-6 h-6 rounded-full border-2"
                    style={{ background: m.bg, borderColor: modeKey === m.key ? '#fff' : m.border }} />
                  <span className="text-xs font-semibold">{m.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const ReadingProgress = ({ color }) => {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const el    = document.documentElement
      const total = el.scrollHeight - el.clientHeight
      if (total <= 0) return
      setProgress(Math.min(100, (window.scrollY / total) * 100))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-stone-100/80 dark:bg-slate-800/80">
      <div className="h-full rounded-r-full transition-all duration-100 ease-linear"
        style={{ width: `${progress}%`, backgroundColor: color || '#f59e0b' }} />
    </div>
  )
}

const CommentForm = ({ postSlug, onSuccess, parentId = null, onCancel }) => {
  const [content,    setContent]    = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) return
    if (!isAuthenticated) return navigate('/masuk')
    setSubmitting(true)
    try {
      await api.post(`/blog/${postSlug}/comments`, { content: content.trim(), parentId })
      setContent('')
      onSuccess?.()
    } catch { alert('❌ Gagal mengirim komentar') }
    finally { setSubmitting(false) }
  }

  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
                      bg-amber-100 dark:bg-amber-900/30">
        <User className="w-4 h-4 text-amber-600 dark:text-amber-400" />
      </div>
      <div className="flex-1">
        <textarea value={content} onChange={(e) => setContent(e.target.value)}
          placeholder={isAuthenticated ? (parentId ? 'Tulis balasan...' : 'Tulis komentar...') : 'Login untuk berkomentar'}
          rows={3} disabled={!isAuthenticated}
          className="w-full px-3 py-2.5 text-sm rounded-xl resize-none transition-all focus:outline-none
                     border border-stone-200 bg-white text-stone-800 placeholder-stone-400
                     focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400
                     disabled:opacity-50 disabled:cursor-not-allowed
                     dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500
                     dark:focus:ring-amber-500/40 dark:focus:border-amber-500/60" />
        <div className="flex justify-end gap-2 mt-2">
          {onCancel && (
            <button type="button" onClick={onCancel}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                         border border-stone-200 text-stone-600 hover:bg-stone-100
                         dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800">
              Batal
            </button>
          )}
          <button onClick={handleSubmit} disabled={submitting || !content.trim() || !isAuthenticated}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all
                       bg-amber-500 hover:bg-amber-400 text-white disabled:opacity-50
                       shadow-sm shadow-amber-200/80 dark:shadow-amber-900/30">
            <Send className="w-3.5 h-3.5" />
            {submitting ? 'Mengirim...' : 'Kirim'}
          </button>
        </div>
      </div>
    </div>
  )
}

const CommentItem = ({ comment, postSlug, onRefresh }) => {
  const [showReply, setShowReply] = useState(false)
  const [liking,    setLiking]    = useState(false)
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleLike = async () => {
    if (!isAuthenticated) return navigate('/masuk')
    setLiking(true)
    try { await api.post(`/blog/comments/${comment.id}/like`); onRefresh?.() }
    catch {} finally { setLiking(false) }
  }

  return (
    <article className="flex gap-3">
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden
                      bg-amber-50 dark:bg-amber-900/20">
        {comment.userPhotoUrl
          ? <img src={comment.userPhotoUrl} alt={comment.userName} className="w-8 h-8 object-cover" />
          : <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
              {comment.userName?.charAt(0)?.toUpperCase() || '?'}
            </span>
        }
      </div>
      <div className="flex-1 min-w-0">
        <div className="inline-block px-3.5 py-2.5 rounded-2xl rounded-tl-sm mb-1 max-w-full
                        bg-stone-50 dark:bg-slate-800/80
                        border border-stone-100 dark:border-slate-700/60">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-stone-900 dark:text-slate-100">{comment.userName}</span>
            {comment.isOwner && (
              <span className="text-[9px] px-1.5 py-0.5 rounded font-bold
                               bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">Anda</span>
            )}
          </div>
          <p className="text-sm leading-relaxed text-stone-700 dark:text-slate-300">{comment.content}</p>
        </div>
        <div className="flex items-center gap-3 px-1 text-[11px] text-stone-400 dark:text-slate-500">
          <time>{formatDate(comment.createdAt, { day:'numeric', month:'short', year:'numeric' })}</time>
          <button onClick={handleLike} disabled={liking}
            className="flex items-center gap-1 font-medium transition-colors hover:text-amber-600 dark:hover:text-amber-400">
            <ThumbsUp className="w-3 h-3" />{comment.likeCount > 0 && comment.likeCount}{' '}Suka
          </button>
          <button onClick={() => setShowReply(v => !v)}
            className="font-medium transition-colors hover:text-amber-600 dark:hover:text-amber-400">
            Balas
          </button>
        </div>
        {showReply && (
          <div className="mt-2">
            <CommentForm postSlug={postSlug} parentId={comment.id}
              onSuccess={() => { setShowReply(false); onRefresh?.() }}
              onCancel={() => setShowReply(false)} />
          </div>
        )}
        {comment.replies?.length > 0 && (
          <div className="mt-2 space-y-2 pl-2 border-l-2 border-stone-100 dark:border-slate-700">
            {comment.replies.map(reply => (
              <CommentItem key={reply.id} comment={reply} postSlug={postSlug} onRefresh={onRefresh} />
            ))}
          </div>
        )}
      </div>
    </article>
  )
}

const RelatedCard = ({ post }) => {
  const cats = post.categories ? post.categories.split(',').map(c => c.trim()) : []
  return (
    <Link to={`/blog/${post.slug}`} className="flex gap-3 group py-3 first:pt-0">
      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-stone-100 dark:bg-slate-800">
        {post.featuredImage ? (
          <img src={post.featuredImage} alt={post.title} loading="lazy"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-stone-300 dark:text-slate-600" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        {cats[0] && (
          <span className={`inline-block self-start text-[9px] font-bold uppercase tracking-wider mb-1 px-1.5 py-0.5 rounded border ${getCatCls(cats[0])}`}>
            {cats[0]}
          </span>
        )}
        <h4 className="text-xs font-semibold leading-snug line-clamp-2 mb-1
                       text-stone-900 dark:text-slate-100
                       group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
          {post.title}
        </h4>
        <span className="text-[10px] text-stone-400 dark:text-slate-500">
          {formatDate(post.publishedAt, { day:'numeric', month:'short' })}
        </span>
      </div>
    </Link>
  )
}

const BlogDetailPage = () => {
  const { slug }                  = useParams()
  const navigate                  = useNavigate()
  const { isAuthenticated, user } = useAuth()

  const [fontIdx, setFontIdxRaw] = useState(() => {
    const s = parseInt(localStorage.getItem(LS_FONT_SIZE))
    return isNaN(s) ? 2 : Math.max(0, Math.min(FONT_SIZES.length - 1, s))
  })
  const [fontFamilyKey, setFontFamilyKeyRaw] = useState(() => {
    const s = localStorage.getItem(LS_FONT_FAMILY)
    return FONT_FAMILIES.find(f => f.key === s) ? s : 'garamond'
  })
  const [modeKey, setModeKeyRaw] = useState(() => {
    const s = localStorage.getItem(LS_MODE)
    return READ_MODES.find(m => m.key === s) ? s : 'light'
  })

  const setFontIdx = useCallback((v) => {
    const n = typeof v === 'function' ? v(fontIdx) : v
    setFontIdxRaw(n); localStorage.setItem(LS_FONT_SIZE, String(n))
  }, [fontIdx])
  const setFontFamilyKey = useCallback((k) => {
    setFontFamilyKeyRaw(k); localStorage.setItem(LS_FONT_FAMILY, k)
  }, [])
  const setModeKey = useCallback((k) => {
    setModeKeyRaw(k); localStorage.setItem(LS_MODE, k)
  }, [])

  const mode       = READ_MODES.find(m => m.key === modeKey) || READ_MODES[0]
  const fontSize   = FONT_SIZES[fontIdx].value
  const fontFamily = (FONT_FAMILIES.find(f => f.key === fontFamilyKey) || FONT_FAMILIES[0]).stack

  const [post,             setPost]             = useState(null)
  const [loading,          setLoading]          = useState(true)
  const [error,            setError]            = useState(null)
  const [liked,            setLiked]            = useState(false)
  const [likeCount,        setLikeCount]        = useState(0)
  const [liking,           setLiking]           = useState(false)
  const [saved,            setSaved]            = useState(false)
  const [comments,         setComments]         = useState([])
  const [commentsLoading,  setCommentsLoading]  = useState(false)
  const [commentPage,      setCommentPage]      = useState(1)
  const [totalComments,    setTotalComments]    = useState(0)
  const [relatedPosts,     setRelatedPosts]     = useState([])
  const [showAllTags,      setShowAllTags]      = useState(false)
  const [imgLoaded,        setImgLoaded]        = useState(false)

  const [, startTransition] = useTransition()
  const backUrl = useRef(sessionStorage.getItem('blogPageUrl') || '/blog')

  useEffect(() => {
    const prev = document.documentElement.lang
    document.documentElement.lang = 'id'
    return () => { document.documentElement.lang = prev }
  }, [])

  useEffect(() => {
    let cancelled = false
    const init = async () => {
      setLoading(true); setError(null)
      try {
        const res  = await api.get(`/blog/${slug}`)
        const data = res.data?.data || res.data
        if (!cancelled) {
          setPost(data)
          setLikeCount(data.likeCount || 0)
          setLiked(data.isLiked || false)
          setSaved(data.isSaved || false)
        }
      } catch {
        if (!cancelled) setError('Artikel tidak ditemukan')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    init()
    return () => { cancelled = true }
  }, [slug])

  const fetchComments = useCallback(async (page = 1) => {
    setCommentsLoading(true)
    try {
      const res  = await api.get(`/blog/${slug}/comments`, { params: { page, limit: 10 } })
      const data = res.data?.data
      setComments(prev => page === 1 ? (data?.list || []) : [...prev, ...(data?.list || [])])
      setTotalComments(data?.total || 0)
    } catch {} finally { setCommentsLoading(false) }
  }, [slug])

  useEffect(() => { fetchComments(1) }, [fetchComments])

  useEffect(() => {
    if (!post) return
    const cats = post.categories ? post.categories.split(',')[0].trim() : ''
    api.get('/blog', { params: { limit: 4, status: 'PUBLISHED', category: cats, excludeSlug: slug } })
      .then(res => {
        const list = res.data?.data?.list || res.data?.data?.data || []
        startTransition(() => setRelatedPosts(list.filter(p => p.slug !== slug).slice(0, 3)))
      }).catch(() => {})
  }, [post, slug]) // eslint-disable-line

  const handleLike = useCallback(async () => {
    if (!isAuthenticated) return navigate('/masuk')
    setLiking(true)
    try {
      if (liked) {
        await api.delete(`/blog/${slug}/like`)
        setLiked(false); setLikeCount(c => Math.max(0, c - 1))
      } else {
        await api.post(`/blog/${slug}/like`)
        setLiked(true); setLikeCount(c => c + 1)
        feedEvents.emit(FEED_EVENTS.ACTIVITY_CREATED, {
          activityType: 'liked', entityType: 'BLOG',
          entitySlug: slug, entityTitle: post?.title,
        })
      }
    } catch {} finally { setLiking(false) }
  }, [isAuthenticated, liked, slug, post, navigate])

  const handleSave = useCallback(async () => {
    if (!isAuthenticated) return navigate('/masuk')
    try {
      if (saved) { await api.delete(`/blog/${slug}/save`); setSaved(false) }
      else       { await api.post(`/blog/${slug}/save`);   setSaved(true)  }
    } catch {}
  }, [isAuthenticated, saved, slug, navigate])

  const handleShare = useCallback(async () => {
    const shareData = { title: post?.title, text: post?.excerpt || post?.title, url: window.location.href }
    try {
      if (navigator.share) await navigator.share(shareData)
      else { await navigator.clipboard.writeText(window.location.href); alert('✅ Link disalin!') }
    } catch {}
  }, [post])

  const handleLoadMoreComments = useCallback(() => {
    const next = commentPage + 1
    setCommentPage(next); fetchComments(next)
  }, [commentPage, fetchComments])

  if (loading) return <LoadingSpinner fullScreen />
  if (error || !post) return (
    <div className="min-h-screen flex items-center justify-center">
      <Alert type="error" message={error || 'Artikel tidak ditemukan'} />
    </div>
  )

  const cats        = post.categories ? post.categories.split(',').map(c => c.trim()) : []
  const tags        = post.tags       ? post.tags.split(',').map(t => t.trim())       : []
  const mins        = post.readTime || readTime(post.content)
  const visibleTags = showAllTags ? tags : tags.slice(0, 8)
  const processedContent = preprocessContent(post.content || post.body || '')

  const breadcrumbs = [
    { name: 'Beranda', url: '/' },
    { name: 'Blog',    url: '/blog' },
    { name: post.title, url: '#' }
  ]
  const articleSchema = {
    '@context': 'https://schema.org', '@type': 'Article',
    headline: post.title, description: post.excerpt || post.title,
    image: post.featuredImage,
    author: { '@type': 'Person', name: post.authorName || 'Tim Redaksi' },
    publisher: { '@type': 'Organization', name: 'Perpustakaan Digital MasasilaM' },
    datePublished: post.publishedAt, dateModified: post.updatedAt || post.publishedAt,
    url: `${window.location.origin}/blog/${slug}`,
  }
  const breadcrumbSchema = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, i) => ({
      '@type': 'ListItem', position: i + 1, name: crumb.name,
      item: crumb.url === '#' ? undefined : `${window.location.origin}${crumb.url}`
    }))
  }

  return (
    <>
      <SEO
        title={post.title}
        description={post.excerpt || `${post.title} — Blog Perpustakaan Digital MasasilaM`}
        url={`/blog/${slug}`}
        type="article"
        image={post.featuredImage}
        author={post.authorName}
        publishedTime={post.publishedAt}
        modifiedTime={post.updatedAt}
        keywords={tags.join(', ')}
        structuredData={[articleSchema, breadcrumbSchema]}
      />

      <ReadingProgress color={modeKey === 'sepia' ? '#c2822a' : '#f59e0b'} />

      <div className="min-h-screen transition-colors duration-300 bg-stone-50 dark:bg-slate-950">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">

          {/* Breadcrumb */}
          <div className="pt-4 pb-2">
            <nav className="flex items-center gap-1.5 text-xs mb-3 overflow-x-auto scrollbar-none
                            text-stone-400 dark:text-slate-500"
              aria-label="Breadcrumb"
              itemScope itemType="https://schema.org/BreadcrumbList">
              {breadcrumbs.map((crumb, i) => (
                <span key={i} className="flex items-center gap-1.5 flex-shrink-0"
                  itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                  <meta itemProp="position" content={String(i + 1)} />
                  {i > 0 && <span className="text-stone-300 dark:text-slate-700">/</span>}
                  {crumb.url === '#'
                    ? <span className="text-stone-600 dark:text-slate-400 max-w-[180px] truncate" itemProp="name">
                        {crumb.name}
                      </span>
                    : <Link to={crumb.url}
                        className="hover:text-stone-700 dark:hover:text-slate-300 transition whitespace-nowrap"
                        itemProp="item">
                        <span itemProp="name">{crumb.name}</span>
                      </Link>
                  }
                </span>
              ))}
            </nav>
            <button onClick={() => navigate(backUrl.current)}
              className="inline-flex items-center gap-1.5 text-sm font-medium group transition-colors
                         text-stone-500 hover:text-stone-900
                         dark:text-slate-500 dark:hover:text-slate-100">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Kembali
            </button>
          </div>

          {/* Main Grid */}
          <div className="lg:grid lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px] lg:gap-10 lg:items-start pb-16 lg:pb-12">

            {/* ARTICLE */}
            <article className="pb-8 pt-1 lg:pt-0"
              itemScope itemType="https://schema.org/Article">
              <meta itemProp="datePublished" content={post.publishedAt} />
              <meta itemProp="dateModified"  content={post.updatedAt || post.publishedAt} />

              {/* Header */}
              <header className="mb-6">
                {cats.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {cats.map((cat, i) => (
                      <Link key={i} to={`/blog?category=${encodeURIComponent(cat)}`}
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border transition-all hover:scale-105 ${getCatCls(cat)}`}>
                        {cat}
                      </Link>
                    ))}
                  </div>
                )}

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-3 tracking-tight
                               text-stone-900 dark:text-slate-50"
                  itemProp="headline">
                  {post.title}
                </h1>

                {post.excerpt && (
                  <p className="text-base sm:text-lg leading-relaxed mb-4
                                text-stone-600 dark:text-slate-400">
                    {post.excerpt}
                  </p>
                )}

                {/* Author & meta row */}
                <div className="flex items-center gap-3 py-4 border-y
                                border-stone-100 dark:border-slate-800">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0
                                  bg-amber-100 dark:bg-amber-900/30">
                    {post.authorPhotoUrl ? (
                      <img src={post.authorPhotoUrl} alt={post.authorName}
                        className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center
                                      text-sm font-bold text-amber-700 dark:text-amber-300">
                        {(post.authorName || 'T').charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-stone-900 dark:text-slate-100" itemProp="author">
                      {post.authorName || 'Tim Redaksi'}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs
                                    text-stone-400 dark:text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />{formatDate(post.publishedAt)}
                      </span>
                      {mins && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />{mins} menit baca
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />{(post.viewCount || 0).toLocaleString()} dilihat
                      </span>
                    </div>
                  </div>
                  {/* Mobile: like + share */}
                  <div className="flex items-center gap-1 lg:hidden">
                    <button onClick={handleLike} disabled={liking}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all
                                  ${liked
                                    ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-700 dark:text-red-400'
                                    : 'bg-white border-stone-200 text-stone-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'
                                  }`}>
                      <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
                      {likeCount > 0 && likeCount}
                    </button>
                    <button onClick={handleShare}
                      className="p-1.5 rounded-lg border transition-all
                                 bg-white border-stone-200 text-stone-500
                                 hover:border-amber-300 hover:text-amber-600
                                 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400">
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </header>

              {/* Cover image */}
              {post.featuredImage && (
                <div className="relative mb-0 rounded-t-2xl overflow-hidden
                                bg-stone-100 dark:bg-slate-800"
                  style={{ aspectRatio: '16/9' }}>
                  <img src={post.featuredImage} alt={post.title}
                    loading="eager" fetchpriority="high" decoding="sync"
                    className={`w-full h-full object-cover transition-opacity duration-500
                                ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setImgLoaded(true)} />
                  {!imgLoaded && (
                    <div className="absolute inset-0 animate-pulse bg-stone-200 dark:bg-slate-700" />
                  )}
                </div>
              )}

              {/* Article Content Card */}
              <div
                className={`mb-8 border shadow-sm transition-colors duration-300 ${post.featuredImage ? 'rounded-b-2xl' : 'rounded-2xl'}`}
                style={{ background: mode.cardBg, borderColor: mode.border }}
              >
                {/* Reader toolbar */}
                <div className="flex items-center justify-between gap-3 px-5 sm:px-8 pt-5 pb-4"
                  style={{ borderBottom: `1px solid ${mode.border}` }}>
                  <div className="flex items-center gap-3 text-xs" style={{ color: mode.color, opacity: 0.5 }}>
                    {mins && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />{mins} menit baca
                      </span>
                    )}
                    {post.wordCount && (
                      <span className="hidden sm:flex items-center gap-1">
                        · {post.wordCount.toLocaleString('id-ID')} kata
                      </span>
                    )}
                  </div>
                  <ReaderToolbar
                    fontIdx={fontIdx}             setFontIdx={setFontIdx}
                    fontFamilyKey={fontFamilyKey} setFontFamilyKey={setFontFamilyKey}
                    modeKey={modeKey}             setModeKey={setModeKey}
                  />
                </div>

                <div
                  className="chapter-content"
                  lang="id"
                  itemProp="articleBody"
                  style={{
                    fontFamily,
                    fontSize,
                    lineHeight: 1.7,
                    color:      mode.color,
                    padding:    '1.75em 1.5em',
                    textAlign:  'justify',
                    hyphens:    'auto',
                    WebkitHyphens: 'auto',
                    MozHyphens:    'auto',
                    margin:     '0 auto',
                    transition: 'font-size 0.15s, color 0.2s, font-family 0.1s',
                  }}
                  dangerouslySetInnerHTML={{ __html: processedContent }}
                />
              </div>

              {/* Tags */}
              {tags.length > 0 && (
                <div className="mb-8 pt-6 border-t border-stone-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="w-3.5 h-3.5 text-stone-400 dark:text-slate-500" />
                    <span className="text-xs font-bold uppercase tracking-wider
                                     text-stone-400 dark:text-slate-500">Tags</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {visibleTags.map((tag, i) => (
                      <Link key={i} to={`/blog?tag=${encodeURIComponent(tag)}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all hover:scale-105
                                   bg-stone-100 border-stone-200 text-stone-600
                                   hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700
                                   dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400
                                   dark:hover:bg-amber-900/20 dark:hover:border-amber-700 dark:hover:text-amber-300">
                        #{tag}
                      </Link>
                    ))}
                    {tags.length > 8 && (
                      <button onClick={() => setShowAllTags(v => !v)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all
                                   bg-stone-100 border-stone-200 text-stone-500
                                   dark:bg-slate-800 dark:border-slate-700 dark:text-slate-500">
                        {showAllTags ? 'Sembunyikan' : `+${tags.length - 8} lainnya`}
                        <ChevronDown className={`w-3 h-3 transition-transform ${showAllTags ? 'rotate-180' : ''}`} />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Action bar */}
              <div className="mb-8 flex flex-wrap items-center gap-3 p-4 rounded-2xl border
                              bg-white border-stone-200 shadow-sm
                              dark:bg-slate-900 dark:border-slate-700">
                <button onClick={handleLike} disabled={liking}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all active:scale-95
                              ${liked
                                ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-700 dark:text-red-400'
                                : 'bg-white border-stone-200 text-stone-600 hover:border-red-300 hover:text-red-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:border-red-700'
                              }`}>
                  <Heart className={`w-4 h-4 transition-all ${liked ? 'fill-red-500 text-red-500 scale-110' : ''}`} />
                  <span>{liked ? 'Disukai' : 'Suka'}</span>
                  {likeCount > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold
                                      ${liked ? 'bg-red-100 text-red-600 dark:bg-red-900/40' : 'bg-stone-100 text-stone-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                      {likeCount}
                    </span>
                  )}
                </button>
                <button onClick={handleSave}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all active:scale-95
                              ${saved
                                ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-300'
                                : 'bg-white border-stone-200 text-stone-600 hover:border-amber-300 hover:text-amber-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:border-amber-700'
                              }`}>
                  {saved ? <BookmarkCheck className="w-4 h-4 fill-amber-500 text-amber-500" /> : <Bookmark className="w-4 h-4" />}
                  {saved ? 'Tersimpan' : 'Simpan'}
                </button>
                <button onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all active:scale-95
                             bg-white border-stone-200 text-stone-600
                             hover:border-amber-300 hover:text-amber-600
                             dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:border-amber-700 dark:hover:text-amber-400">
                  <Share2 className="w-4 h-4" />Bagikan
                </button>
                <div className="flex items-center gap-4 ml-auto text-xs text-stone-400 dark:text-slate-500">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />{(post.viewCount || 0).toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5" />{totalComments.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Source */}
              {post.source && (
                <div className="mb-8 flex items-start gap-2 text-xs text-stone-400 dark:text-slate-500">
                  <span className="flex-shrink-0 mt-0.5">Sumber:</span>
                  <a
                    href={post.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-start gap-1 text-amber-600 hover:text-amber-700 dark:text-amber-400 underline underline-offset-2 break-all"
                  >
                    {post.source}
                    <ExternalLink className="w-3 h-3 flex-shrink-0 mt-0.5" />
                  </a>
                </div>
              )}

              {/* Author card */}
              {(post.authorName || post.authorBio) && (
                <div className="mb-8 p-5 rounded-2xl border
                                bg-amber-50/60 border-amber-200/80
                                dark:bg-slate-800/60 dark:border-slate-700">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0
                                    bg-amber-100 dark:bg-amber-900/30 ring-2 ring-amber-200 dark:ring-amber-800">
                      {post.authorPhotoUrl ? (
                        <img src={post.authorPhotoUrl} alt={post.authorName}
                          className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl font-bold
                                        text-amber-700 dark:text-amber-300">
                          {(post.authorName || 'T').charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] uppercase tracking-wider font-medium mb-0.5
                                      text-stone-400 dark:text-slate-500">Tentang Penulis</div>
                      <h3 className="font-bold text-stone-900 dark:text-slate-100 mb-1">
                        {post.authorName || 'Tim Redaksi'}
                      </h3>
                      {post.authorBio && (
                        <p className="text-sm leading-relaxed text-stone-600 dark:text-slate-400">{post.authorBio}</p>
                      )}
                      {post.authorSlug && (
                        <Link to={`/penulis/${post.authorSlug}`}
                          className="inline-flex items-center gap-1 mt-2 text-xs font-semibold transition-colors
                                     text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300">
                          Lihat semua artikel<ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Comments */}
              <section aria-label="Komentar" className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-stone-900 dark:text-slate-50">
                    Komentar
                    {totalComments > 0 && (
                      <span className="ml-2 text-sm font-normal text-stone-400 dark:text-slate-500">
                        ({totalComments.toLocaleString()})
                      </span>
                    )}
                  </h2>
                </div>
                <div className="mb-6 p-4 rounded-2xl border bg-white border-stone-200 dark:bg-slate-900 dark:border-slate-700">
                  <CommentForm postSlug={slug} onSuccess={() => fetchComments(1)} />
                </div>
                <div style={{ minHeight: '120px' }}>
                  {commentsLoading && comments.length === 0 ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex gap-3 animate-pulse">
                          <div className="w-8 h-8 rounded-full bg-stone-200 dark:bg-slate-700 flex-shrink-0" />
                          <div className="flex-1"><div className="h-16 rounded-2xl bg-stone-100 dark:bg-slate-800" /></div>
                        </div>
                      ))}
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="rounded-2xl p-8 text-center border border-dashed
                                    bg-stone-50 border-stone-200 dark:bg-slate-800/60 dark:border-slate-700">
                      <MessageCircle className="w-10 h-10 mx-auto mb-3 text-stone-200 dark:text-slate-700" />
                      <p className="text-sm text-stone-500 dark:text-slate-400">
                        Belum ada komentar. Jadilah yang pertama!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {comments.map(comment => (
                        <CommentItem key={comment.id} comment={comment}
                          postSlug={slug} onRefresh={() => fetchComments(1)} />
                      ))}
                      {comments.length < totalComments && (
                        <button onClick={handleLoadMoreComments} disabled={commentsLoading}
                          className="w-full py-2.5 rounded-xl text-sm font-medium border transition-all
                                     border-stone-200 text-stone-600 hover:bg-stone-50 hover:border-amber-300
                                     dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800
                                     disabled:opacity-50">
                          {commentsLoading ? 'Memuat...' : `Muat ${totalComments - comments.length} komentar lagi`}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </section>

            </article>

            {/* SIDEBAR */}
            <aside className="lg:col-span-1">
              <div className="lg:sticky lg:top-6 space-y-5">

                {/* Post info */}
                <div className="p-4 rounded-2xl border bg-amber-50/60 border-amber-200/80 dark:bg-slate-800/60 dark:border-slate-700">
                  <div className="text-[10px] uppercase tracking-wider font-medium mb-3 text-stone-400 dark:text-slate-500">
                    Info Artikel
                  </div>
                  <div className="space-y-3">
                    {[
                      post.authorName  && { icon: User,     label: 'Dipublikasikan Ulang oleh', value: post.authorName },
                      post.publishedAt && { icon: Calendar, label: 'Diterbitkan',               value: formatDate(post.publishedAt, { day:'numeric', month:'short', year:'numeric' }) },
                      mins             && { icon: Clock,    label: 'Estimasi Baca',             value: `${mins} menit` },
                      post.updatedAt   && { icon: Calendar, label: 'Diperbarui',                value: formatDate(post.updatedAt,   { day:'numeric', month:'short', year:'numeric' }) },
                    ].filter(Boolean).map(({ icon: Icon, label, value }, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <Icon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-stone-400 dark:text-slate-500" />
                        <div>
                          <div className="text-[10px] uppercase tracking-wider mb-0.5 text-stone-400 dark:text-slate-500">{label}</div>
                          <div className="text-xs font-semibold text-stone-800 dark:text-slate-200">{value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="p-4 rounded-2xl border bg-white border-stone-200 shadow-sm dark:bg-slate-900 dark:border-slate-700">
                  <div className="text-[10px] uppercase tracking-wider font-medium mb-3 text-stone-400 dark:text-slate-500">
                    Statistik
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { icon: Eye,           label: 'Views',    value: (post.viewCount || 0).toLocaleString() },
                      { icon: Heart,         label: 'Suka',     value: likeCount.toLocaleString() },
                      { icon: MessageCircle, label: 'Komentar', value: totalComments.toLocaleString() },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="text-center p-2 rounded-xl bg-stone-50 dark:bg-slate-800/60">
                        <Icon className="w-4 h-4 mx-auto mb-1 text-amber-500" />
                        <div className="text-sm font-bold text-stone-800 dark:text-slate-200">{value}</div>
                        <div className="text-[10px] text-stone-400 dark:text-slate-500">{label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick actions */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: Heart,  label: liked ? 'Disukai' : 'Suka',         action: handleLike,  active: liked,  activeCls: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700',           iconCls: liked  ? 'fill-red-500 text-red-500'    : '' },
                    { icon: saved ? BookmarkCheck : Bookmark, label: saved ? 'Tersimpan' : 'Simpan', action: handleSave, active: saved, activeCls: 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700', iconCls: saved  ? 'fill-amber-500 text-amber-500' : '' },
                    { icon: Share2, label: 'Bagikan',                           action: handleShare, active: false,  activeCls: '',                                                                             iconCls: '' },
                  ].map(({ icon: Icon, label, action, active, activeCls, iconCls }) => (
                    <button key={label} onClick={action}
                      className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border
                                  text-xs font-semibold transition-all active:scale-95
                                  ${active
                                    ? activeCls
                                    : 'bg-white border-stone-200 hover:border-amber-300 hover:bg-amber-50/50 dark:bg-slate-800 dark:border-slate-700 dark:hover:border-amber-700'
                                  }`}>
                      <Icon className={`w-4 h-4 transition-colors ${iconCls || 'text-stone-400 dark:text-slate-500'}`} />
                      <span className={active ? 'text-stone-700 dark:text-slate-200' : 'text-stone-500 dark:text-slate-400'}>
                        {label}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Categories */}
                {cats.length > 0 && (
                  <div className="p-4 rounded-2xl border bg-white border-stone-200 shadow-sm dark:bg-slate-900 dark:border-slate-700">
                    <div className="text-[10px] uppercase tracking-wider font-medium mb-3 text-stone-400 dark:text-slate-500">
                      Kategori
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {cats.map((cat, i) => (
                        <Link key={i} to={`/blog?category=${encodeURIComponent(cat)}`}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all hover:scale-105 ${getCatCls(cat)}`}>
                          <Tag className="w-2.5 h-2.5" />{cat}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related posts */}
                {relatedPosts.length > 0 && (
                  <div className="p-4 rounded-2xl border bg-white border-stone-200 shadow-sm dark:bg-slate-900 dark:border-slate-700">
                    <div className="text-[10px] uppercase tracking-wider font-medium mb-2 text-stone-400 dark:text-slate-500">
                      Artikel Terkait
                    </div>
                    <div className="divide-y divide-stone-100 dark:divide-slate-800">
                      {relatedPosts.map(rp => <RelatedCard key={rp.id} post={rp} />)}
                    </div>
                    <Link to="/blog"
                      className="flex items-center justify-center gap-1.5 mt-3 pt-3 border-t text-xs font-semibold transition-colors
                                 border-stone-100 dark:border-slate-800
                                 text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300">
                      <Rss className="w-3.5 h-3.5" />Semua Artikel
                    </Link>
                  </div>
                )}

              </div>
            </aside>

          </div>
        </div>
      </div>
    </>
  )
}

export default BlogDetailPage
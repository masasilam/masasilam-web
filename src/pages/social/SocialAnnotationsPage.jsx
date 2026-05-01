// src/pages/social/SocialAnnotationsPage.jsx
import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  PenLine, Heart, MessageCircle, Share2, BookOpen, Layers, Film,
  Globe, UserCheck, Plus, X, Loader2, Send, ChevronDown,
  Quote, Eye, MoreHorizontal, Trash2, Edit2, RefreshCw
} from 'lucide-react'
import { annotationService } from '../../services/socialService'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'
import feedEvents, { FEED_EVENTS } from '../../services/feedEvents'

// ── Publish Annotation Modal ──────────────────────────────────────────────────
const PublishAnnotationModal = ({ onClose, onPublished }) => {
  const [form, setForm] = useState({
    entityType: 'BOOK', entityId: '', entityTitle: '', entitySlug: '',
    selectedText: '', note: '', color: '#FDE68A',
    chapterLabel: '', visibility: 'public',
  })
  const [saving, setSaving] = useState(false)
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const COLORS = ['#FDE68A', '#BFDBFE', '#BBF7D0', '#FECACA', '#E9D5FF', '#FED7AA']

  const submit = async () => {
    if (!form.selectedText.trim()) { toast.error('Teks kutipan wajib diisi'); return }
    if (!form.entityId) { toast.error('ID konten wajib diisi'); return }
    setSaving(true)
    try {
      const res = await annotationService.publish({ ...form, entityId: Number(form.entityId) })
      onPublished(res.data?.data)
      onClose()
      toast.success('Kutipan berhasil dipublikasikan!')
    } catch (e) { toast.error(e?.response?.data?.detail || 'Gagal mempublikasikan kutipan') }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-900 flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 z-10">
          <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Quote className="w-4 h-4 text-rose-500" /> Publikasikan Kutipan
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Teks Kutipan *</label>
            <textarea value={form.selectedText} onChange={e => f('selectedText', e.target.value)}
              rows={4} placeholder="Salin teks yang ingin dikutip..."
              className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-rose-500/30 text-gray-900 dark:text-gray-100 resize-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Catatan / Refleksi</label>
            <textarea value={form.note} onChange={e => f('note', e.target.value)}
              rows={2} placeholder="Tambahkan pemikiranmu..."
              className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-rose-500/30 text-gray-900 dark:text-gray-100 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Tipe Konten</label>
              <select value={form.entityType} onChange={e => f('entityType', e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-900 dark:text-gray-100">
                {['BOOK','ZINE','FILM','NEWSPAPER'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">ID Konten *</label>
              <input type="number" value={form.entityId} onChange={e => f('entityId', e.target.value)}
                placeholder="ID..."
                className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-rose-500/30 text-gray-900 dark:text-gray-100" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Judul Konten</label>
            <input value={form.entityTitle} onChange={e => f('entityTitle', e.target.value)}
              placeholder="Judul buku/zine/film..."
              className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-rose-500/30 text-gray-900 dark:text-gray-100" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Bab / Halaman</label>
            <input value={form.chapterLabel} onChange={e => f('chapterLabel', e.target.value)}
              placeholder="Misal: Bab 3, Halaman 42..."
              className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-rose-500/30 text-gray-900 dark:text-gray-100" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Warna Sorotan</label>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button key={c} onClick={() => f('color', c)}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${form.color === c ? 'border-gray-600 dark:border-gray-300 scale-110' : 'border-transparent hover:border-gray-400'}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Visibilitas</label>
            <div className="flex gap-2">
              {[{ v: 'public', l: 'Publik' }, { v: 'followers', l: 'Pengikut' }, { v: 'private', l: 'Pribadi' }].map(({ v, l }) => (
                <button key={v} onClick={() => f('visibility', v)}
                  className={`flex-1 py-2 text-xs rounded-xl border transition-all ${form.visibility === v ? 'border-rose-400 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300' : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t border-gray-100 dark:border-gray-800">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">Batal</button>
          <button onClick={submit} disabled={saving}
            className="flex-1 py-2.5 text-sm bg-rose-500 hover:bg-rose-400 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Publikasikan
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Comment Section ───────────────────────────────────────────────────────────
const AnnotationComments = ({ annotationId }) => {
  const { user } = useAuth()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await annotationService.getComments(annotationId)
        setComments(res.data?.data?.list || [])
      } catch {} finally { setLoading(false) }
    }
    load()
  }, [annotationId])

  const submit = async () => {
    if (!text.trim()) return
    setSubmitting(true)
    try {
      const res = await annotationService.addComment(annotationId, { content: text })
      setComments(prev => [...prev, res.data?.data])
      setText('')
    } catch { toast.error('Gagal mengirim komentar') }
    finally { setSubmitting(false) }
  }

  const deleteComment = async (commentId) => {
    try {
      await annotationService.deleteComment(commentId)
      setComments(prev => prev.filter(c => c.id !== commentId))
    } catch {}
  }

  if (loading) return <div className="flex justify-center py-3"><Loader2 className="w-4 h-4 animate-spin text-gray-300" /></div>

  return (
    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
      <div className="space-y-2 mb-3">
        {comments.map(c => (
          <div key={c.id} className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
              {(c.username || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2">
              <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 mr-1.5">{c.username}</span>
              <span className="text-xs text-gray-600 dark:text-gray-300">{c.content}</span>
            </div>
            {c.isOwner && (
              <button onClick={() => deleteComment(c.id)} className="p-1 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg self-start">
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
        {comments.length === 0 && <p className="text-xs text-gray-400 text-center py-1">Belum ada komentar</p>}
      </div>
      <div className="flex gap-2">
        <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="Tulis komentar..."
          className="flex-1 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-full px-3 py-2 outline-none focus:ring-2 focus:ring-rose-500/30 text-gray-900 dark:text-gray-100 placeholder-gray-400" />
        <button onClick={submit} disabled={submitting || !text.trim()}
          className="p-2 bg-rose-500 hover:bg-rose-400 disabled:opacity-40 rounded-full text-white">
          <Send className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}

// ── Annotation Card ───────────────────────────────────────────────────────────
const AnnotationCard = ({ ann, onDelete }) => {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [liked, setLiked] = useState(ann.isLiked || false)
  const [likeCount, setLikeCount] = useState(ann.likeCount || 0)
  const [showComments, setShowComments] = useState(false)
  const [commentCount, setCommentCount] = useState(ann.commentCount || 0)
  const [resharing, setResharing] = useState(false)
  const [pending, setPending] = useState(false)

  const isOwner = user?.id === ann.userId

  const ENTITY_ICON = { BOOK: BookOpen, ZINE: Layers, FILM: Film }
  const EntityIcon = ENTITY_ICON[ann.entityType] || BookOpen

  const ENTITY_LINK = { BOOK: `/buku/${ann.entitySlug}`, ZINE: `/zine/${ann.entitySlug}`, FILM: `/film/${ann.entitySlug}` }
  const entityLink = ann.entitySlug ? ENTITY_LINK[ann.entityType] : null

  const toggleLike = async () => {
    if (!isAuthenticated) { navigate('/masuk'); return }
    if (pending) return
    setPending(true)
    try {
      if (liked) { await annotationService.unlike(ann.id); setLiked(false); setLikeCount(p => Math.max(0, p - 1)) }
      else        { await annotationService.like(ann.id);   setLiked(true);  setLikeCount(p => p + 1) }
    } catch {} finally { setPending(false) }
  }

  const handleDelete = async () => {
    if (!confirm('Hapus kutipan ini?')) return
    try {
      await annotationService.delete(ann.id)
      onDelete(ann.id)
      toast.success('Kutipan dihapus')
      feedEvents.emit(FEED_EVENTS.REFRESH) // ← TAMBAH
    } catch { toast.error('Gagal menghapus') }
  }

  // handleReshare di AnnotationCard
  const handleReshare = async () => {
    if (!isAuthenticated) { navigate('/masuk'); return }
    setResharing(true)
    try {
      await annotationService.reshare(ann.id)
      toast.success('Kutipan berhasil dibagikan ulang!')
      feedEvents.emit(FEED_EVENTS.REFRESH) // ← TAMBAH
    } catch (e) { toast.error(e?.response?.data?.detail || 'Gagal membagikan') }
    finally { setResharing(false) }
  }

  return (
    <article className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:border-rose-200 dark:hover:border-rose-800 transition-all">
      {/* Color bar */}
      <div className="h-1" style={{ backgroundColor: ann.color || '#FDE68A' }} />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <Link to={`/sosial/profil/${ann.username}`}>
            {ann.userPhoto ? (
              <img src={ann.userPhoto} alt={ann.username} className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                {(ann.username || 'U').charAt(0).toUpperCase()}
              </div>
            )}
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <Link to={`/sosial/profil/${ann.username}`} className="font-semibold text-sm text-gray-900 dark:text-white hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                {ann.displayName || ann.username}
              </Link>
              {ann.sourceAnnotationId && (
                <span className="text-[10px] text-gray-400">membagikan ulang</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <EntityIcon className="w-3 h-3" />
              {entityLink ? (
                <Link to={entityLink} className="hover:text-rose-500 transition-colors line-clamp-1">{ann.entityTitle || ann.entityType}</Link>
              ) : (
                <span className="line-clamp-1">{ann.entityTitle || ann.entityType}</span>
              )}
              {ann.chapterLabel && <span>· {ann.chapterLabel}</span>}
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="text-[10px] text-gray-400">{ann.timeAgo || ''}</span>
            {isOwner && (
              <button onClick={handleDelete} className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-400">
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Quote */}
        <blockquote className="relative pl-4 mb-3">
          <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full" style={{ backgroundColor: ann.color || '#FDE68A' }} />
          <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed italic">
            "{ann.selectedText}"
          </p>
        </blockquote>

        {/* Note */}
        {ann.note && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">{ann.note}</p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 pt-2 border-t border-gray-50 dark:border-gray-800">
          <button onClick={toggleLike}
            className={`flex items-center gap-1.5 text-xs transition-all hover:scale-110 ${liked ? 'text-rose-500' : 'text-gray-400 hover:text-rose-400'}`}>
            <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-rose-500' : ''}`} />
            {likeCount > 0 ? likeCount : ''}
          </button>
          <button onClick={() => setShowComments(v => !v)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-400 transition-all">
            <MessageCircle className="w-3.5 h-3.5" />
            {commentCount > 0 ? commentCount : ''}
          </button>
          {!isOwner && (
            <button onClick={handleReshare} disabled={resharing}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-green-500 transition-all ml-auto">
              {resharing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              Bagikan Ulang
            </button>
          )}
        </div>

        {showComments && <AnnotationComments annotationId={ann.id} />}
      </div>
    </article>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
const AnnotationSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 animate-pulse">
        <div className="flex gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          </div>
        </div>
        <div className="pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-1.5 mb-3">
          <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-full" />
          <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-4/5" />
        </div>
      </div>
    ))}
  </div>
)

// ── Main Page ─────────────────────────────────────────────────────────────────
const SocialAnnotationsPage = () => {
  const { isAuthenticated } = useAuth()
  const [tab, setTab] = useState(isAuthenticated ? 'following' : 'public')
  const [annotations, setAnnotations] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [publishModal, setPublishModal] = useState(false)

  const load = useCallback(async (p = 1, reset = false) => {
    if (p === 1) setLoading(true); else setLoadingMore(true)
    try {
      const fn = tab === 'following' ? annotationService.getFollowing : annotationService.getPublic
      const res = await fn(p, 20)
      const d = res.data?.data
      const items = d?.list || d?.data || []
      const total = d?.total || 0
      setAnnotations(prev => reset ? items : [...prev, ...items])
      setHasMore((p * 20) < total)
      setPage(p)
    } catch { toast.error('Gagal memuat kutipan') }
    finally { setLoading(false); setLoadingMore(false) }
  }, [tab])

  useEffect(() => {
    setAnnotations([])
    setPage(1)
    setHasMore(true)
    load(1, true)
  }, [tab])

  const handleDelete = (id) => setAnnotations(prev => prev.filter(a => a.id !== id))

  return (
    <div className="max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Quote className="w-5 h-5 text-rose-500" /> Kutipan Sosial
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Koleksi kutipan dari komunitas</p>
        </div>
        {isAuthenticated && (
          <button onClick={() => setPublishModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-400 text-white text-sm font-semibold rounded-xl transition-all hover:scale-105">
            <Plus className="w-4 h-4" /> Publikasikan
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-5">
        {isAuthenticated && (
          <button onClick={() => setTab('following')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${tab === 'following' ? 'bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500'}`}>
            <UserCheck className="w-3.5 h-3.5" /> Mengikuti
          </button>
        )}
        <button onClick={() => setTab('public')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${tab === 'public' ? 'bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500'}`}>
          <Globe className="w-3.5 h-3.5" /> Publik
        </button>
      </div>

      {/* Content */}
      {loading ? <AnnotationSkeleton /> : (
        <>
          {annotations.length === 0 ? (
            <div className="text-center py-16">
              <Quote className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {tab === 'following' ? 'Ikuti pengguna untuk melihat kutipan mereka' : 'Belum ada kutipan'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {annotations.map(a => <AnnotationCard key={a.id} ann={a} onDelete={handleDelete} />)}
            </div>
          )}
          {hasMore && (
            <div className="mt-6 text-center">
              <button onClick={() => load(page + 1)} disabled={loadingMore}
                className="px-6 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-rose-400 hover:text-rose-600 transition-all disabled:opacity-50 flex items-center gap-2 mx-auto">
                {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronDown className="w-4 h-4" />}
                Muat lebih banyak
              </button>
            </div>
          )}
        </>
      )}

      {publishModal && (
        <PublishAnnotationModal
          onClose={() => setPublishModal(false)}
          onPublished={ann => {
            setAnnotations(prev => [ann, ...prev])
            feedEvents.emit(FEED_EVENTS.REFRESH) // ← TAMBAH
            setPublishModal(false)
          }}
        />
      )}
    </div>
  )
}

export default SocialAnnotationsPage
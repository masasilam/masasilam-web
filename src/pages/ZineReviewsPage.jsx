// ============================================
// src/pages/ZineReviewsPage.jsx
// LIGHT: stone palette, emerald accent
// DARK:  slate palette, emerald accent
// ============================================
import { useState, useEffect, useCallback } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, MessageCircle, ThumbsUp, ThumbsDown, Star,
  User, Pencil, Trash2, ChevronDown, Send, X
} from 'lucide-react'
import zineService from '../services/zineService'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from '../components/Common/LoadingSpinner'
import SEO from '../components/Common/SEO'

const SORT_OPTIONS = [
  { v: 'helpful', l: 'Paling Membantu' },
  { v: 'recent',  l: 'Terbaru'         },
  { v: 'oldest',  l: 'Terlama'         },
]

// ── Review Form ───────────────────────────────────────────────────────────────
const ReviewForm = ({ existing, onSubmit, onCancel, loading }) => {
  const [title,   setTitle]   = useState(existing?.title   || '')
  const [content, setContent] = useState(existing?.content || '')
  const isEdit = !!existing

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!content.trim()) return alert('Isi ulasan tidak boleh kosong')
    onSubmit({ title: title.trim() || null, content: content.trim() })
  }

  return (
    <form onSubmit={handleSubmit}
      className="p-4 sm:p-5 rounded-2xl border transition-colors
                 bg-emerald-50/60 border-emerald-200 dark:bg-slate-800/80 dark:border-slate-700">
      <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-stone-800 dark:text-slate-100">
        <Pencil className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        {isEdit ? 'Edit Ulasan' : 'Tulis Ulasan'}
      </h3>
      <div className="space-y-3">
        <input
          type="text" placeholder="Judul ulasan (opsional)" value={title}
          onChange={(e) => setTitle(e.target.value)} maxLength={100}
          className="w-full px-3 py-2 rounded-xl text-sm transition-all focus:outline-none
                     border border-stone-200 bg-white text-stone-800 placeholder-stone-400
                     focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400
                     dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:placeholder-slate-500
                     dark:focus:ring-emerald-500/40 dark:focus:border-emerald-500/60"
        />
        <textarea
          placeholder="Tulis pengalaman membaca Anda…" value={content} required
          onChange={(e) => setContent(e.target.value)} rows={4} maxLength={2000}
          className="w-full px-3 py-2 rounded-xl text-sm transition-all focus:outline-none resize-none
                     border border-stone-200 bg-white text-stone-800 placeholder-stone-400
                     focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400
                     dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:placeholder-slate-500
                     dark:focus:ring-emerald-500/40 dark:focus:border-emerald-500/60"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-stone-400 dark:text-slate-500">{content.length}/2000</span>
          <div className="flex gap-2">
            {onCancel && (
              <button type="button" onClick={onCancel}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all
                           bg-stone-100 hover:bg-stone-200 text-stone-700
                           dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-300">
                Batal
              </button>
            )}
            <button type="submit" disabled={loading || !content.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all
                         bg-emerald-500 hover:bg-emerald-400 text-white
                         disabled:opacity-50 disabled:cursor-not-allowed
                         shadow-sm shadow-emerald-200/80 dark:shadow-emerald-900/30">
              {loading ? <LoadingSpinner size="sm" /> : <Send className="w-3.5 h-3.5" />}
              {isEdit ? 'Simpan' : 'Kirim'}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}

// ── Reply Form ────────────────────────────────────────────────────────────────
const ReplyForm = ({ onSubmit, onCancel, loading }) => {
  const [content, setContent] = useState('')
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!content.trim()) return
    onSubmit({ content: content.trim() })
    setContent('')
  }
  return (
    <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
      <input
        type="text" placeholder="Tulis balasan…" value={content}
        onChange={(e) => setContent(e.target.value)} maxLength={500}
        className="flex-1 px-3 py-2 rounded-xl text-sm transition-all focus:outline-none
                   border border-stone-200 bg-white text-stone-800 placeholder-stone-400
                   focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400
                   dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:placeholder-slate-500
                   dark:focus:ring-emerald-500/40"
      />
      <button type="submit" disabled={loading || !content.trim()}
        className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-semibold transition-all
                   bg-emerald-500 hover:bg-emerald-400 text-white disabled:opacity-50">
        <Send className="w-3.5 h-3.5" />
      </button>
      <button type="button" onClick={onCancel}
        className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100
                   dark:text-slate-500 dark:hover:text-slate-300 dark:hover:bg-slate-800 transition-all">
        <X className="w-4 h-4" />
      </button>
    </form>
  )
}

// ── ReviewCard ────────────────────────────────────────────────────────────────
const ReviewCard = ({ review, zineSlug, currentUserId, onRefresh }) => {
  const [showReplies,  setShowReplies]  = useState(false)
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [isEditing,    setIsEditing]    = useState(false)
  const [loading,      setLoading]      = useState(false)
  const isOwner = review.userId === currentUserId || review.isOwner

  const handleFeedback = async (isHelpful) => {
    try {
      await zineService.addFeedback(zineSlug, review.id, { isHelpful })
      onRefresh()
    } catch (e) { console.error(e) }
  }

  const handleDelete = async () => {
    if (!confirm('Hapus ulasan ini?')) return
    try { await zineService.deleteReview(zineSlug); onRefresh() }
    catch { alert('Gagal menghapus ulasan') }
  }

  const handleEdit = async (data) => {
    setLoading(true)
    try { await zineService.updateReview(zineSlug, data); setIsEditing(false); onRefresh() }
    catch { alert('Gagal mengupdate ulasan') }
    finally { setLoading(false) }
  }

  const handleReply = async (data) => {
    setLoading(true)
    try { await zineService.addReply(zineSlug, review.id, data); setShowReplyForm(false); onRefresh() }
    catch { alert('Gagal mengirim balasan') }
    finally { setLoading(false) }
  }

  const handleDeleteReply = async (replyId) => {
    if (!confirm('Hapus balasan ini?')) return
    try { await zineService.deleteReply(zineSlug, replyId); onRefresh() }
    catch { alert('Gagal menghapus balasan') }
  }

  return (
    <article className="rounded-2xl border shadow-sm transition-all
                        bg-white border-stone-100 shadow-stone-50/80
                        dark:bg-slate-900 dark:border-slate-700 dark:shadow-none">
      {isEditing ? (
        <div className="p-4 sm:p-5">
          <ReviewForm existing={review} onSubmit={handleEdit} onCancel={() => setIsEditing(false)} loading={loading} />
        </div>
      ) : (
        <div className="p-4 sm:p-5">
          {/* Header */}
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden
                            bg-emerald-50 dark:bg-emerald-900/20">
              {review.userPhotoUrl
                ? <img src={review.userPhotoUrl} alt={review.userName} className="w-10 h-10 object-cover" loading="lazy" />
                : <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm text-stone-900 dark:text-slate-100">{review.userName}</span>
                {isOwner && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-medium
                                   bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                    Anda
                  </span>
                )}
                <span className="text-xs ml-auto text-stone-400 dark:text-slate-500">
                  {new Date(review.createdAt).toLocaleDateString('id-ID', { year:'numeric', month:'long', day:'numeric' })}
                </span>
              </div>
            </div>
          </div>

          {/* Body */}
          {review.title && (
            <h3 className="font-bold text-base mb-1.5 text-stone-900 dark:text-slate-100">{review.title}</h3>
          )}
          <p className="text-sm leading-relaxed text-stone-600 dark:text-slate-300 mb-4">{review.content}</p>

          {/* Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1">
              <button onClick={() => handleFeedback(true)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all
                             ${review.currentUserFeedback === true
                               ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                               : 'bg-stone-100 text-stone-500 hover:bg-emerald-50 hover:text-emerald-600 dark:bg-slate-800 dark:text-slate-500 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400'}`}>
                <ThumbsUp className="w-3.5 h-3.5" />{review.helpfulCount || 0}
              </button>
              <button onClick={() => handleFeedback(false)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all
                             ${review.currentUserFeedback === false
                               ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                               : 'bg-stone-100 text-stone-500 hover:bg-red-50 hover:text-red-600 dark:bg-slate-800 dark:text-slate-500 dark:hover:bg-red-900/20 dark:hover:text-red-400'}`}>
                <ThumbsDown className="w-3.5 h-3.5" />{review.notHelpfulCount || 0}
              </button>
            </div>

            {(review.replies?.length > 0 || review.replyCount > 0) && (
              <button onClick={() => setShowReplies(!showReplies)}
                className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-emerald-600 dark:text-slate-500 dark:hover:text-emerald-400 transition-colors">
                <MessageCircle className="w-3.5 h-3.5" />
                {review.replyCount || review.replies?.length || 0} balasan
                <ChevronDown className={`w-3 h-3 transition-transform ${showReplies ? 'rotate-180' : ''}`} />
              </button>
            )}

            {!isOwner && currentUserId && (
              <button onClick={() => setShowReplyForm(!showReplyForm)}
                className="text-xs text-stone-400 hover:text-emerald-600 dark:text-slate-500 dark:hover:text-emerald-400 transition-colors ml-auto">
                Balas
              </button>
            )}
            {isOwner && (
              <div className="flex gap-1 ml-auto">
                <button onClick={() => setIsEditing(true)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 dark:text-slate-500 dark:hover:text-emerald-400 dark:hover:bg-emerald-900/20 transition-all">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={handleDelete}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 dark:text-slate-500 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Reply form */}
          {showReplyForm && (
            <ReplyForm onSubmit={handleReply} onCancel={() => setShowReplyForm(false)} loading={loading} />
          )}

          {/* Replies */}
          {showReplies && review.replies?.length > 0 && (
            <div className="mt-4 pl-4 border-l-2 border-emerald-100 dark:border-emerald-900/40 space-y-3">
              {review.replies.map(reply => (
                <div key={reply.id} className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0
                                  bg-stone-100 dark:bg-slate-800">
                    {reply.userPhotoUrl
                      ? <img src={reply.userPhotoUrl} alt={reply.userName} className="w-7 h-7 rounded-full object-cover" />
                      : <User className="w-3.5 h-3.5 text-stone-400 dark:text-slate-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-semibold text-stone-800 dark:text-slate-200">{reply.userName}</span>
                      {reply.isOwner && (
                        <span className="text-[9px] px-1 py-0.5 rounded bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">Anda</span>
                      )}
                      <span className="text-[10px] ml-auto text-stone-400 dark:text-slate-500">
                        {new Date(reply.createdAt).toLocaleDateString('id-ID', { month:'short', day:'numeric' })}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-stone-600 dark:text-slate-400">{reply.content}</p>
                    {reply.isOwner && (
                      <button onClick={() => handleDeleteReply(reply.id)}
                        className="mt-1 text-[10px] text-stone-400 hover:text-red-500 transition-colors">
                        Hapus
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  )
}

// ── ZineReviewsPage ───────────────────────────────────────────────────────────
const ZineReviewsPage = () => {
  const { zineSlug } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()

  const [zine,       setZine]       = useState(null)
  const [reviews,    setReviews]    = useState([])
  const [myReview,   setMyReview]   = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [formLoading, setFormLoading] = useState(false)
  const [sortBy,     setSortBy]     = useState('helpful')
  const [page,       setPage]       = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [showForm,   setShowForm]   = useState(false)
  const LIMIT = 10

  const fetchZine = useCallback(async () => {
    try { setZine(await zineService.getZineBySlug(zineSlug)) } catch {}
  }, [zineSlug])

  const fetchReviews = useCallback(async () => {
    setLoading(true)
    try {
      const res = await zineService.getReviews(zineSlug, page, LIMIT, sortBy)
      const data = res.data
      setReviews(data?.list || [])
      setTotalCount(data?.total || 0)
      setTotalPages(Math.ceil((data?.total || 0) / LIMIT))
    } catch { setReviews([]) }
    finally { setLoading(false) }
  }, [zineSlug, page, sortBy])

  const fetchMyReview = useCallback(async () => {
    if (!isAuthenticated) return
    try { const r = await zineService.getMyReview(zineSlug); setMyReview(r.data || null) }
    catch { setMyReview(null) }
  }, [zineSlug, isAuthenticated])

  useEffect(() => { fetchZine() }, [fetchZine])
  useEffect(() => { fetchReviews() }, [fetchReviews])
  useEffect(() => { fetchMyReview() }, [fetchMyReview])

  const handleRefresh = () => { fetchReviews(); fetchMyReview() }

  const handleSubmitReview = async (data) => {
    setFormLoading(true)
    try {
      if (myReview) await zineService.updateReview(zineSlug, data)
      else          await zineService.addReview(zineSlug, data)
      setShowForm(false); handleRefresh()
    } catch (e) { alert(`Gagal: ${e.response?.data?.detail || e.message}`) }
    finally { setFormLoading(false) }
  }

  const handleDeleteMyReview = async () => {
    if (!confirm('Hapus ulasan Anda?')) return
    try { await zineService.deleteReview(zineSlug); setMyReview(null); handleRefresh() }
    catch { alert('Gagal menghapus ulasan') }
  }

  return (
    <>
      <SEO
        title={`Ulasan — ${zine?.title || 'Zine'}`}
        description="Baca dan tulis ulasan untuk zine ini"
        url={`/zine/${zineSlug}/ulasan`}
      />
      <div className="min-h-screen py-4 sm:py-8 transition-colors bg-stone-50 dark:bg-slate-950">
        <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 fixed top-0 z-10" />
        <div className="container mx-auto px-3 sm:px-4 max-w-3xl">

          {/* Back */}
          <button onClick={() => navigate(`/zine/${zineSlug}`)}
            className="flex items-center gap-2 mb-6 group text-sm font-medium transition-colors
                       text-stone-500 hover:text-stone-900 dark:text-slate-500 dark:hover:text-slate-100">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Kembali ke detail zine
          </button>

          {/* Header */}
          <header className="mb-6">
            <div className="flex items-start gap-4">
              {zine?.coverImageUrl && (
                <div className="flex-shrink-0 w-14 sm:w-16 aspect-[2/3] rounded-lg overflow-hidden shadow-md
                                bg-stone-100 dark:bg-slate-800">
                  <img src={zine.coverImageUrl} alt={zine.title} className="w-full h-full object-cover" loading="lazy" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-widest mb-1 text-emerald-600 dark:text-emerald-400">Ulasan Zine</p>
                <h1 className="text-xl sm:text-2xl font-bold leading-snug text-stone-900 dark:text-slate-50">
                  {zine?.title || '…'}
                </h1>
                {zine?.authorNames && (
                  <p className="text-sm text-stone-500 dark:text-slate-400 mt-0.5">{zine.authorNames}</p>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-sm font-semibold text-stone-700 dark:text-slate-300">
                    {totalCount} ulasan
                  </span>
                  {zine?.averageRating > 0 && (
                    <span className="flex items-center gap-1 text-sm">
                      <Star className="w-4 h-4 fill-emerald-400 text-emerald-400" />
                      <span className="font-semibold text-stone-800 dark:text-slate-200">{Number(zine.averageRating).toFixed(1)}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Write review CTA */}
          {isAuthenticated && !showForm && (
            <div className="mb-6">
              {myReview ? (
                <div className="p-4 rounded-2xl border transition-colors
                                bg-emerald-50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Ulasan Anda</span>
                    <div className="flex gap-2">
                      <button onClick={() => setShowForm(true)}
                        className="text-xs text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-200 font-medium">
                        Edit
                      </button>
                      <button onClick={handleDeleteMyReview}
                        className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 font-medium">
                        Hapus
                      </button>
                    </div>
                  </div>
                  {myReview.title && <p className="text-sm font-medium text-stone-800 dark:text-slate-200 mb-1">{myReview.title}</p>}
                  <p className="text-sm text-stone-600 dark:text-slate-400 line-clamp-3">{myReview.content}</p>
                </div>
              ) : (
                <button onClick={() => setShowForm(true)}
                  className="w-full p-4 rounded-2xl border-2 border-dashed text-sm font-medium transition-all
                             border-emerald-300 text-emerald-600 hover:border-emerald-400 hover:bg-emerald-50
                             dark:border-emerald-700/50 dark:text-emerald-400 dark:hover:border-emerald-600 dark:hover:bg-emerald-900/10">
                  <MessageCircle className="w-5 h-5 mx-auto mb-1.5" />
                  Tulis Ulasan Anda
                </button>
              )}
            </div>
          )}

          {!isAuthenticated && (
            <div className="mb-6 p-4 rounded-2xl border text-center transition-colors
                            bg-stone-50 border-stone-200 dark:bg-slate-900 dark:border-slate-700">
              <p className="text-sm text-stone-500 dark:text-slate-400 mb-3">Login untuk menulis ulasan</p>
              <Link to="/masuk"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                           bg-emerald-500 hover:bg-emerald-400 text-white transition-all">
                Masuk Sekarang
              </Link>
            </div>
          )}

          {/* Review form */}
          {showForm && (
            <div className="mb-6">
              <ReviewForm
                existing={myReview}
                onSubmit={handleSubmitReview}
                onCancel={() => setShowForm(false)}
                loading={formLoading}
              />
            </div>
          )}

          {/* Sort & count */}
          <div className="flex items-center justify-between mb-4 gap-3">
            <p className="text-sm text-stone-500 dark:text-slate-400">
              <span className="font-semibold text-stone-800 dark:text-slate-200">{totalCount}</span> ulasan
            </p>
            <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1) }}
              className="text-sm px-3 py-1.5 rounded-xl border transition-all focus:outline-none
                         border-stone-200 bg-white text-stone-700
                         focus:ring-2 focus:ring-emerald-400/50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300">
              {SORT_OPTIONS.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
          </div>

          {/* Reviews list */}
          {loading ? (
            <div className="flex justify-center py-16"><LoadingSpinner /></div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-16">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 text-stone-200 dark:text-slate-700" />
              <p className="text-stone-500 dark:text-slate-400">Belum ada ulasan untuk zine ini</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map(review => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  zineSlug={zineSlug}
                  currentUserId={user?.id}
                  onRefresh={handleRefresh}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-4 py-2 text-sm rounded-xl border transition-all disabled:opacity-40
                           border-stone-200 bg-white text-stone-600 hover:border-emerald-400 hover:text-emerald-600
                           dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-emerald-500 dark:hover:text-emerald-400">
                ← Sebelumnya
              </button>
              <span className="text-sm text-stone-500 dark:text-slate-400 px-2">
                {page} / {totalPages}
              </span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-4 py-2 text-sm rounded-xl border transition-all disabled:opacity-40
                           border-stone-200 bg-white text-stone-600 hover:border-emerald-400 hover:text-emerald-600
                           dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-emerald-500 dark:hover:text-emerald-400">
                Berikutnya →
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default ZineReviewsPage
// src/pages/BlogDetailPage.jsx
import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Heart, Eye, MessageCircle, Clock, Share2, ArrowLeft,
  Tag, Folder, Trash2, Edit, Send, User
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import api from '../services/api'
import toast from 'react-hot-toast'
// ✅ Import epub-styles yang sama persis dengan chapter reader
import '../styles/epub-styles.css'

// ─── BLOG CONTENT RENDERER ────────────────────────────────────────────────────
// Menggunakan class .chapter-content dari epub-styles.css
const BlogContent = ({ html, fontSize = 16 }) => {
  const contentRef = useRef(null)

  useEffect(() => {
    if (!contentRef.current) return
    const links = contentRef.current.querySelectorAll('a')
    links.forEach(link => {
      const href = link.getAttribute('href') || ''
      if (href.startsWith('http://') || href.startsWith('https://')) {
        link.setAttribute('target', '_blank')
        link.setAttribute('rel', 'noopener noreferrer')
      }
    })
  }, [html])

  return (
    <div
      lang="id"
      className="rounded-lg my-4 mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
      style={{ maxWidth: '42em', padding: '1.25em' }}
    >
      <div
        ref={contentRef}
        lang="id"
        className="chapter-content"
        style={{ fontSize: `${fontSize}px` }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
const BlogDetailPage = () => {
  const { slug } = useParams()
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const isAdmin = user?.roles?.includes('ADMIN')

  const [post,              setPost]              = useState(null)
  const [loading,           setLoading]           = useState(true)
  const [liked,             setLiked]             = useState(false)
  const [likeCount,         setLikeCount]         = useState(0)
  const [comments,          setComments]          = useState([])
  const [commentText,       setCommentText]       = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [commentsPage]                            = useState(1)
  const [loadingComments,   setLoadingComments]   = useState(false)
  const [totalComments,     setTotalComments]     = useState(0)

  useEffect(() => { fetchPost() }, [slug])
  useEffect(() => { if (post) fetchComments() }, [post, commentsPage])

  const fetchPost = async () => {
    setLoading(true)
    try {
      const res  = await api.get(`/blog/${slug}`)
      const data = res.data?.data
      setPost(data)
      setLiked(data?.isLiked || false)
      setLikeCount(data?.likeCount || 0)
    } catch {
      toast.error('Artikel tidak ditemukan')
      navigate('/blog')
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    setLoadingComments(true)
    try {
      const res  = await api.get(`/blog/${post.id}/comments`, {
        params: { page: commentsPage, limit: 10 }
      })
      const data = res.data?.data
      setComments(data?.list || data?.data || [])
      setTotalComments(data?.total || 0)
    } catch { /* silent */ }
    finally { setLoadingComments(false) }
  }

  const handleLike = async () => {
    if (!isAuthenticated) { toast.error('Login untuk menyukai artikel'); return }
    try {
      const res = await api.post(`/blog/${post.id}/like`)
      setLiked(res.data?.data?.isLiked)
      setLikeCount(res.data?.data?.totalLikes)
    } catch { toast.error('Gagal memproses like') }
  }

  const handleDelete = async () => {
    if (!window.confirm('Hapus artikel ini?')) return
    try {
      await api.delete(`/blog/${post.id}`)
      toast.success('Artikel dihapus')
      navigate('/blog')
    } catch { toast.error('Gagal menghapus artikel') }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) { toast.error('Login untuk berkomentar'); return }
    if (!commentText.trim()) return
    setSubmittingComment(true)
    try {
      await api.post(`/blog/${post.id}/comments`, { content: commentText })
      setCommentText('')
      toast.success('Komentar ditambahkan')
      fetchComments()
    } catch { toast.error('Gagal menambah komentar') }
    finally { setSubmittingComment(false) }
  }

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Hapus komentar ini?')) return
    try {
      await api.delete(`/blog/comments/${commentId}`)
      toast.success('Komentar dihapus')
      fetchComments()
    } catch { toast.error('Gagal menghapus komentar') }
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link disalin!')
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-4xl animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4" />
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6" />
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!post) return null

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">

        {/* Back & Actions */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/blog')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors text-sm font-medium group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
            Kembali ke Blog
          </button>
          {isAdmin && (
            <div className="flex gap-2">
              <Link
                to={`/dasbor/blog/edit/${post.id}`}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors"
              >
                <Edit className="w-3.5 h-3.5" />Edit
              </Link>
              <button
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />Hapus
              </button>
            </div>
          )}
        </div>

        <article className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-md">
          {/* Featured Image */}
          {post.featuredImage && (
            <div className="h-72 sm:h-96 overflow-hidden">
              <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="p-6 sm:p-10">
            {/* Categories */}
            {post.categories && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.categories.split('|').map((cat, i) => {
                  const parts = cat.split(':')
                  return (
                    <Link key={i} to={`/blog?category=${parts[2] || ''}`}
                      className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold hover:bg-primary/20 transition-colors">
                      <Folder className="w-3 h-3" />{parts[1] || cat}
                    </Link>
                  )
                })}
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6 pb-6 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
                {post.authorAvatar ? (
                  <img src={post.authorAvatar} alt={post.authorName} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                    {post.authorName?.charAt(0) || 'A'}
                  </div>
                )}
                <span className="font-medium text-gray-700 dark:text-gray-300">{post.authorName}</span>
              </div>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />{formatDate(post.publishedAt)}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />{post.viewCount || 0} dilihat
              </span>
            </div>

            {/* ── KONTEN — menggunakan .chapter-content dari epub-styles.css ── */}
            <BlogContent html={post.content || ''} />

            {/* Tags */}
            {post.tags && (
              <div className="flex flex-wrap gap-2 mt-8 mb-4 pt-6 border-t border-gray-100 dark:border-gray-700">
                {post.tags.split('|').map((tag, i) => {
                  const parts = tag.split(':')
                  return (
                    <Link key={i} to={`/blog?tag=${parts[2] || ''}`}
                      className="flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs hover:bg-primary/10 hover:text-primary transition-colors">
                      <Tag className="w-3 h-3" />{parts[1] || tag}
                    </Link>
                  )
                })}
              </div>
            )}

            {/* Engagement */}
            <div className="flex items-center gap-4 py-4 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  liked
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 border border-red-200 dark:border-red-800'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-red-50 hover:text-red-500'
                }`}
              >
                <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                {likeCount} Suka
              </button>
              <span className="flex items-center gap-2 text-sm text-gray-500">
                <MessageCircle className="w-4 h-4" />
                {totalComments} Komentar
              </span>
              <button
                onClick={handleShare}
                className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Bagikan
              </button>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        {post.relatedPosts?.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Artikel Terkait</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {post.relatedPosts.slice(0, 3).map((related) => (
                <Link key={related.id} to={`/blog/${related.slug}`} className="group block">
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md hover:border-primary/50 transition-all shadow-md">
                    <div className="h-32 bg-primary/5 dark:bg-gray-700 overflow-hidden">
                      {related.featuredImage ? (
                        <img src={related.featuredImage} alt={related.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl opacity-20">📝</div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 group-hover:text-primary transition-colors">
                        {related.title}
                      </h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Comments */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-md">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            Komentar ({totalComments})
          </h2>

          {isAuthenticated ? (
            <form onSubmit={handleComment} className="mb-8">
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Tulis komentar..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      type="submit"
                      disabled={submittingComment || !commentText.trim()}
                      className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {submittingComment ? 'Mengirim...' : 'Kirim'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="mb-6 p-4 bg-primary/5 rounded-lg text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <Link to="/masuk" className="font-semibold text-primary hover:underline">Login</Link>{' '}
                untuk berkomentar
              </p>
            </div>
          )}

          {loadingComments ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-600 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/4" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-6">
              Belum ada komentar. Jadilah yang pertama!
            </p>
          ) : (
            <div className="space-y-5">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">
                    {comment.userAvatar ? (
                      <img src={comment.userAvatar} alt={comment.userName} className="w-9 h-9 rounded-full object-cover" />
                    ) : (
                      comment.userName?.charAt(0)?.toUpperCase() || <User className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-gray-900 dark:text-white">
                        {comment.userName}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(comment.createdAt).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
                    {(isAdmin || comment.userId === user?.id) && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="mt-1 text-xs text-red-400 hover:text-red-600 flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" /> Hapus
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default BlogDetailPage
import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Plus, Edit, Trash2, Eye, Search,
  Globe, FileText, Heart, MessageCircle,
  ChevronLeft, ChevronRight, Loader, Calendar
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import api from '../../services/api'
import toast from 'react-hot-toast'

const STATUS_BADGE = {
  PUBLISHED: { label: 'Terbit', className: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400', icon: Globe },
  DRAFT: { label: 'Draft', className: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400', icon: FileText },
  SCHEDULED: { label: 'Terjadwal', className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400', icon: Calendar },
}

const BlogManagePage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isAdmin = user?.roles?.includes('ADMIN')

  const [posts, setPosts] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filterStatus, setFilterStatus] = useState('')
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState(null)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/blog/my-posts', {
        params: { page, limit: 10, status: filterStatus || undefined, sortOrder: 'DESC' }
      })
      const data = res.data?.data
      const list = data?.list || data?.data || []
      setPosts(list)
      setTotalPages(Math.ceil((data?.total || list.length || 0) / 10) || 1)
    } catch {
      toast.error('Gagal memuat daftar artikel')
    } finally {
      setLoading(false)
    }
  }, [page, filterStatus])

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/blog/stats')
      setStats(res.data?.data)
    } catch { /* silent */ }
  }, [])

  useEffect(() => {
    if (!isAdmin) { navigate('/dasbor'); return }
    fetchPosts()
    fetchStats()
  }, [fetchPosts])

  const handleDelete = async (post) => {
    if (!window.confirm(`Hapus artikel "${post.title}"?`)) return
    setDeleting(post.id)
    try {
      await api.delete(`/blog/${post.id}`)
      toast.success('Artikel dihapus')
      fetchPosts()
      fetchStats()
    } catch {
      toast.error('Gagal menghapus artikel')
    } finally {
      setDeleting(null)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const filteredPosts = search
    ? posts.filter(p => p.title?.toLowerCase().includes(search.toLowerCase()))
    : posts

  if (!isAdmin) return null

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Blog</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Kelola artikel dan postingan blog</p>
        </div>
        <Link
          to="/dasbor/blog/baru"
          className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Tulis Artikel
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Total Artikel', value: stats.totalPosts, icon: FileText, color: 'text-gray-600' },
            { label: 'Terbit', value: stats.publishedPosts, icon: Globe, color: 'text-green-600' },
            { label: 'Draft', value: stats.draftPosts, icon: FileText, color: 'text-gray-400' },
            { label: 'Total Tayang', value: stats.totalViews, icon: Eye, color: 'text-blue-600' },
            { label: 'Total Suka', value: stats.totalLikes, icon: Heart, color: 'text-red-500' },
            { label: 'Komentar', value: stats.totalComments, icon: MessageCircle, color: 'text-purple-600' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center shadow-sm">
              <Icon className={`w-5 h-5 ${color} mx-auto mb-1`} />
              <p className="text-xl font-bold text-gray-900 dark:text-white">{(value || 0).toLocaleString()}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari artikel..."
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex gap-2">
            {['', 'PUBLISHED', 'DRAFT', 'SCHEDULED'].map((s) => (
              <button
                key={s}
                onClick={() => { setFilterStatus(s); setPage(1) }}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  filterStatus === s
                    ? 'bg-primary text-white'
                    : 'border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {s === '' ? 'Semua' : STATUS_BADGE[s]?.label || s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Belum ada artikel</p>
            <p className="text-sm mt-1">Klik "Tulis Artikel" untuk memulai</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="sm:hidden divide-y divide-gray-100 dark:divide-gray-700">
              {filteredPosts.map((post) => {
                const badge = STATUS_BADGE[post.status] || STATUS_BADGE.DRAFT
                const BadgeIcon = badge.icon
                return (
                  <div key={post.id} className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 mb-1">{post.title}</h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>
                          <BadgeIcon className="w-3 h-3" />{badge.label}
                        </span>
                      </div>
                      {post.featuredImage && (
                        <img src={post.featuredImage} alt="" className="w-16 h-12 object-cover rounded-lg flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.viewCount || 0}</span>
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{post.likeCount || 0}</span>
                      <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/blog/${post.slug}`} className="flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 transition-colors">
                        <Eye className="w-3 h-3" /> Lihat
                      </Link>
                      <Link to={`/dasbor/blog/edit/${post.id}`} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">
                        <Edit className="w-3 h-3" /> Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(post)}
                        disabled={deleting === post.id}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        {deleting === post.id ? <Loader className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                        Hapus
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Desktop Table View */}
            <table className="hidden sm:table w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 px-5 py-3 uppercase tracking-wider">Artikel</th>
                  <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 py-3 uppercase tracking-wider">Status</th>
                  <th className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 py-3 uppercase tracking-wider">Statistik</th>
                  <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 py-3 uppercase tracking-wider">Tanggal</th>
                  <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 px-5 py-3 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredPosts.map((post) => {
                  const badge = STATUS_BADGE[post.status] || STATUS_BADGE.DRAFT
                  const BadgeIcon = badge.icon
                  return (
                    <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                            {post.featuredImage ? (
                              <img src={post.featuredImage} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-lg opacity-20">📝</div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1 max-w-xs">{post.title}</p>
                            {post.categories && (
                              <p className="text-xs text-primary mt-0.5">{post.categories.split(',')[0].trim()}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${badge.className}`}>
                          <BadgeIcon className="w-3 h-3" />{badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.viewCount || 0}</span>
                          <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{post.likeCount || 0}</span>
                          <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{post.commentCount || 0}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(post.publishedAt || post.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/blog/${post.slug}`} className="p-1.5 rounded-lg text-gray-500 hover:text-primary hover:bg-primary/10 transition-colors" title="Lihat artikel">
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link to={`/dasbor/blog/edit/${post.id}`} className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="Edit artikel">
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(post)}
                            disabled={deleting === post.id}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                            title="Hapus artikel"
                          >
                            {deleting === post.id ? <Loader className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 p-4 border-t border-gray-100 dark:border-gray-700">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">Halaman {page} dari {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default BlogManagePage
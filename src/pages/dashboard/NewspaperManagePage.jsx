// src/pages/dashboard/NewspaperManagePage.jsx
// Halaman admin: manajemen artikel koran + analytics overview

import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Plus, Edit, Trash2, Eye, Search, ChevronLeft, ChevronRight,
  Loader, Newspaper, BarChart3, TrendingUp, BookOpen, Filter,
  Calendar, Layers, Clock
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import api from '../../services/api'
import toast from 'react-hot-toast'

const IMPORTANCE_BADGE = {
  high:   { label: 'Utama',    className: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' },
  medium: { label: 'Reguler',  className: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400' },
  low:    { label: 'Tambahan', className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' },
}

// ✅ FIXED: Lengkap 27 kategori — sama persis dengan NewspaperEditorPage
const CATEGORIES = [
  { value: 'nasional',          label: 'Nasional',           icon: '🇮🇩' },
  { value: 'internasional',     label: 'Internasional',      icon: '🌏' },
  { value: 'daerah',            label: 'Daerah / Lokal',     icon: '📍' },
  { value: 'politik',           label: 'Politik',            icon: '🏛️' },
  { value: 'hukum',             label: 'Hukum & Kriminal',   icon: '⚖️' },
  { value: 'pemerintahan',      label: 'Pemerintahan',       icon: '🏢' },
  { value: 'ekonomi',           label: 'Ekonomi',            icon: '💰' },
  { value: 'bisnis',            label: 'Bisnis & Keuangan',  icon: '📈' },
  { value: 'pertanian',         label: 'Pertanian',          icon: '🌾' },
  { value: 'sosial',            label: 'Sosial',             icon: '👥' },
  { value: 'pendidikan',        label: 'Pendidikan',         icon: '📚' },
  { value: 'kesehatan',         label: 'Kesehatan',          icon: '🏥' },
  { value: 'agama',             label: 'Agama',              icon: '🕌' },
  { value: 'lingkungan',        label: 'Lingkungan',         icon: '🌿' },
  { value: 'teknologi',         label: 'Teknologi',          icon: '💻' },
  { value: 'sains',             label: 'Sains & Iptek',      icon: '🔬' },
  { value: 'budaya',            label: 'Budaya',             icon: '🎭' },
  { value: 'hiburan',           label: 'Hiburan',            icon: '🎬' },
  { value: 'olahraga',          label: 'Olahraga',           icon: '⚽' },
  { value: 'gaya-hidup',        label: 'Gaya Hidup',         icon: '✨' },
  { value: 'kuliner',           label: 'Kuliner',            icon: '🍜' },
  { value: 'wisata',            label: 'Wisata',             icon: '✈️' },
  { value: 'opini',             label: 'Opini / Kolom',      icon: '✍️' },
  { value: 'sastra',            label: 'Sastra & Cerita',    icon: '📖' },
  { value: 'cerita-bersambung', label: 'Cerita Bersambung',  icon: '📜' },
  { value: 'iklan',             label: 'Iklan / Pengumuman', icon: '📢' },
  { value: 'lainnya',           label: 'Lainnya',            icon: '📰' },
]

// Derived maps untuk lookup cepat
const CATEGORY_MAP   = Object.fromEntries(CATEGORIES.map(c => [c.value, c]))
const ALL_CATEGORIES = CATEGORIES.map(c => c.value)

const getCategoryLabel = (value) => CATEGORY_MAP[value]?.label || value
const getCategoryIcon  = (value) => CATEGORY_MAP[value]?.icon  || '📰'

const NewspaperManagePage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isAdmin  = user?.roles?.includes('ADMIN')

  const [articles, setArticles] = useState([])
  const [stats, setStats]       = useState(null)
  const [loading, setLoading]   = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [page, setPage]         = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch]     = useState('')
  const [filterCat, setFilterCat]   = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [activeTab, setActiveTab]   = useState('articles') // 'articles' | 'analytics'

  const fetchArticles = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 20, sortOrder: 'DESC' }
      if (filterDate) { params.dateFrom = filterDate; params.dateTo = filterDate }

      let list = []
      let total = 0

      if (filterCat) {
        // Filter spesifik kategori
        const res = await api.get(`/newspapers/categories/${filterCat}`, { params })
        const data = res.data?.data
        list  = data?.list  || []
        total = data?.total || list.length

      } else if (filterDate) {
        // Filter berdasarkan tanggal
        const res = await api.get(`/newspapers/date/${filterDate}`, { params })
        const data = res.data?.data
        list  = data?.list  || []
        total = data?.total || list.length

      } else {
        // Fetch semua 27 kategori secara paralel, lalu gabungkan
        const results = await Promise.allSettled(
          ALL_CATEGORIES.map(cat =>
            api.get(`/newspapers/categories/${cat}`, {
              params: { page: 1, limit: 5, sortOrder: 'DESC' },
            })
          )
        )
        results.forEach(r => {
          if (r.status === 'fulfilled') {
            list.push(...(r.value.data?.data?.list || []))
            total += r.value.data?.data?.total || 0
          }
        })
        // Urutkan berdasarkan tanggal terbit terbaru
        list.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate))
      }

      setArticles(list)
      setTotalPages(Math.ceil(total / 20) || 1)
    } catch {
      toast.error('Gagal memuat artikel')
    } finally {
      setLoading(false)
    }
  }, [page, filterCat, filterDate])

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/newspapers/stats')
      setStats(res.data?.data)
    } catch { /* silent */ }
  }, [])

  useEffect(() => {
    if (!isAdmin) { navigate('/dasbor'); return }
    fetchArticles()
    fetchStats()
  }, [fetchArticles, isAdmin])

  const handleDelete = async (article) => {
    if (!window.confirm(`Hapus artikel "${article.title}"?`)) return
    setDeleting(article.id)
    try {
      await api.delete(`/newspapers/articles/${article.id}`)
      toast.success('Artikel dihapus')
      fetchArticles()
      fetchStats()
    } catch {
      toast.error('Gagal menghapus artikel')
    } finally {
      setDeleting(null)
    }
  }

  const filteredArticles = search
    ? articles.filter(a => a.title?.toLowerCase().includes(search.toLowerCase()))
    : articles

  if (!isAdmin) return null

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Koran</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Kelola artikel dan arsip berita koran</p>
        </div>
        <Link to="/dasbor/koran/baru"
          className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium text-sm transition shadow-sm">
          <Plus className="w-4 h-4" />Tambah Artikel
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Artikel', value: (stats.totalArticles||0).toLocaleString('id-ID'), icon: BookOpen, color: 'text-gray-600' },
            { label: 'Sumber Media', value: (stats.totalSources||0).toLocaleString('id-ID'), icon: Newspaper, color: 'text-blue-600' },
            { label: 'Kategori', value: (stats.totalCategories||0).toLocaleString('id-ID'), icon: Layers, color: 'text-green-600' },
            { label: 'Rentang Arsip', value: stats.dateRange || '-', icon: Calendar, color: 'text-amber-600' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
              <Icon className={`w-5 h-5 ${color} mb-2`} />
              <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'articles',  label: 'Daftar Artikel',  icon: BookOpen },
          { id: 'analytics', label: 'Analitik',         icon: BarChart3 },
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition ${
              activeTab === id
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}>
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {activeTab === 'articles' && (
        <>
          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Cari judul artikel..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              {/* ✅ FIXED: Dropdown kategori lengkap 27 item */}
              <select value={filterCat} onChange={e => { setFilterCat(e.target.value); setPage(1) }}
                className="px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">Semua Kategori</option>
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                ))}
              </select>
              <input type="date" value={filterDate} onChange={e => { setFilterDate(e.target.value); setPage(1) }}
                className="px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>

          {/* Articles Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Newspaper className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Belum ada artikel</p>
              </div>
            ) : (
              <>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                      {['Artikel', 'Kategori', 'Tanggal', 'Prioritas', 'Statistik', 'Aksi'].map(h => (
                        <th key={h} className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 py-3 uppercase tracking-wider first:pl-5 last:pr-5 last:text-right">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {filteredArticles.map(art => {
                      const imp = IMPORTANCE_BADGE[art.importance] || IMPORTANCE_BADGE.medium
                      return (
                        <tr key={art.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                          <td className="px-4 pl-5 py-3 max-w-xs">
                            <p className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2"
                               style={{ fontFamily: 'Georgia, serif' }}>
                              {art.title}
                            </p>
                            {art.source && <p className="text-xs text-gray-400 mt-0.5">{art.source}</p>}
                          </td>
                          {/* ✅ FIXED: Pakai helper getCategoryIcon / getCategoryLabel */}
                          <td className="px-4 py-3">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {getCategoryIcon(art.category)} {getCategoryLabel(art.category)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                            {art.dateFormatted || art.publishDate}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${imp.className}`}>
                              {imp.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{art.viewCount||0}</span>
                              {art.wordCount > 0 && (
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{art.wordCount} kata</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 pr-5 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <Link to={`/koran/${art.category}/${art.publishDate}/${art.slug}`}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition" title="Lihat">
                                <Eye className="w-4 h-4" />
                              </Link>
                              <Link to={`/dasbor/koran/edit/${art.id}`}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition" title="Edit">
                                <Edit className="w-4 h-4" />
                              </Link>
                              <button onClick={() => handleDelete(art)} disabled={deleting === art.id}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition disabled:opacity-50" title="Hapus">
                                {deleting === art.id ? <Loader className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>

                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 p-4 border-t border-gray-100 dark:border-gray-700">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                      className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-gray-500">Hal. {page} / {totalPages}</span>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                      className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}

      {activeTab === 'analytics' && (
        <NewspaperAnalyticsPanel />
      )}
    </div>
  )
}

// ── Analytics Sub-Component ──────────────────────────────────────────────────

const NewspaperAnalyticsPanel = () => {
  const [analytics, setAnalytics] = useState(null)
  const [trending,  setTrending]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [dateFrom, setDateFrom]   = useState('')
  const [dateTo,   setDateTo]     = useState('')

  const today = new Date().toISOString().split('T')[0]
  const thirtyDaysAgo = new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0]

  useEffect(() => {
    const from = dateFrom || thirtyDaysAgo
    const to   = dateTo   || today
    setLoading(true)
    Promise.all([
      api.get('/newspapers/analytics/overview', { params: { dateFrom: from, dateTo: to } }),
      api.get('/newspapers/trending', { params: { days: 30, limit: 10 } }),
    ]).then(([a, t]) => {
      setAnalytics(a.data?.data)
      setTrending(t.data?.data || [])
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [dateFrom, dateTo])

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <Loader className="w-8 h-8 animate-spin text-primary" />
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Date Range */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm flex gap-4 items-end flex-wrap">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Dari</label>
          <input type="date" value={dateFrom} defaultValue={thirtyDaysAgo}
            onChange={e => setDateFrom(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Sampai</label>
          <input type="date" value={dateTo} defaultValue={today}
            onChange={e => setDateTo(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
      </div>

      {/* Analytics Data */}
      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: 'Artikel Baru', value: analytics.newArticles || 0, icon: Plus },
            { label: 'Total Tayangan', value: (analytics.totalViews || 0).toLocaleString('id-ID'), icon: Eye },
            { label: 'Rata-rata Harian', value: analytics.avgArticlesPerDay || 0, icon: TrendingUp },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
              <Icon className="w-5 h-5 text-primary mb-3" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Trending */}
      {trending.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-orange-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Artikel Trending (30 hari)</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {trending.map((art, idx) => (
              <div key={art.id} className="flex items-center gap-3 py-3">
                <span className="text-2xl font-black text-gray-200 dark:text-gray-700 w-6 text-center leading-none">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1">{art.title}</p>
                  <p className="text-xs text-gray-400">{art.dateFormatted || art.publishDate} · {art.source}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
                  <Eye className="w-3 h-3" />{(art.viewCount||0).toLocaleString('id-ID')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default NewspaperManagePage
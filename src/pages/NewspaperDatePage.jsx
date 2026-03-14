// src/pages/NewspaperDatePage.jsx

import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Calendar, BookOpen } from 'lucide-react'
import api from '../services/api'

// ✅ Lengkap 27 kategori
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
const CAT_MAP = Object.fromEntries(CATEGORIES.map(c => [c.value, c]))
const getCatLabel = (v) => CAT_MAP[v]?.label || v
const getCatIcon  = (v) => CAT_MAP[v]?.icon  || '📰'

const NewspaperDatePage = () => {
  const { date } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [articles, setArticles] = useState([])
  const [total, setTotal]       = useState(0)
  const [loading, setLoading]   = useState(true)
  const [grouped, setGrouped]   = useState({})

  const page     = parseInt(searchParams.get('page') || '1')
  const category = searchParams.get('category') || ''
  const limit    = 50
  const totalPages = Math.ceil(total / limit)

  const formatDate = (d) => {
    try {
      return new Date(d + 'T00:00:00').toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      })
    } catch { return d }
  }

  const offsetDate = (d, days) => {
    const dt = new Date(d + 'T00:00:00')
    dt.setDate(dt.getDate() + days)
    return dt.toISOString().split('T')[0]
  }

  const fetchArticles = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit, sortBy: 'importance' }
      if (category) params.category = category
      const res = await api.get(`/newspapers/date/${date}`, { params })
      const data = res.data?.data
      const list = data?.list || []
      setArticles(list)
      setTotal(data?.total || 0)
      const g = {}
      list.forEach(art => {
        const cat = art.category || 'lainnya'
        if (!g[cat]) g[cat] = []
        g[cat].push(art)
      })
      setGrouped(g)
    } catch (e) { console.error(e) }
      finally   { setLoading(false) }
  }, [date, page, category])

  useEffect(() => {
    document.title = `Edisi ${formatDate(date)} — Arsip Koran`
    fetchArticles()
  }, [fetchArticles, date])

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value); else next.delete(key)
    next.delete('page')
    setSearchParams(next)
  }

  const today   = new Date().toISOString().split('T')[0]
  const prevDay = offsetDate(date, -1)
  const nextDay = offsetDate(date, 1)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b-4 border-double border-gray-900 dark:border-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
            <Link to="/koran" className="hover:text-gray-900 dark:hover:text-white transition">Koran</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>Edisi Tanggal</span>
          </div>
          <div className="flex items-center justify-between">
            <Link to={`/koran/tanggal/${prevDay}`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Edisi Sebelumnya</span>
            </Link>
            <div className="text-center">
              <p className="text-xs tracking-[0.3em] uppercase text-gray-500 mb-1">Edisi</p>
              <h1 className="text-xl sm:text-3xl font-black text-gray-900 dark:text-white"
                  style={{ fontFamily: 'Georgia, serif' }}>{formatDate(date)}</h1>
              {total > 0 && <p className="text-sm text-gray-500 mt-1">{total.toLocaleString('id-ID')} artikel</p>}
            </div>
            <Link to={`/koran/tanggal/${nextDay}`}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition ${
                nextDay > today
                  ? 'border-gray-100 dark:border-gray-700 text-gray-300 dark:text-gray-600 cursor-not-allowed pointer-events-none'
                  : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}>
              <span className="hidden sm:inline">Edisi Berikutnya</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex items-center gap-3 mt-4 justify-center">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input type="date" value={date} max={today}
              onChange={e => e.target.value && (window.location.href = `/koran/tanggal/${e.target.value}`)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
            <button onClick={() => setParam('category', '')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                !category ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}>Semua</button>
            {Object.keys(grouped).map(cat => (
              <button key={cat} onClick={() => setParam('category', cat)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  category === cat ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}>
                {getCatIcon(cat)} {getCatLabel(cat)}
                <span className="opacity-60">({grouped[cat].length})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-20 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 animate-pulse" />
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-24">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-200 dark:text-gray-700" />
            <p className="text-gray-400 font-medium">Tidak ada artikel pada tanggal ini</p>
          </div>
        ) : (
          <div className="space-y-8">
            {category ? (
              <div className="space-y-3">
                {articles.filter(a => a.category === category).map(art => (
                  <ArticleRow key={art.id} article={art} />
                ))}
              </div>
            ) : (
              Object.entries(grouped).map(([cat, arts]) => (
                <section key={cat}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{getCatIcon(cat)}</span>
                    <h2 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-wider"
                        style={{ fontFamily: 'Georgia, serif' }}>
                      {getCatLabel(cat)}
                    </h2>
                    <span className="text-xs text-gray-400">({arts.length})</span>
                    <div className="flex-1 border-t border-gray-200 dark:border-gray-700 ml-2" />
                    <Link to={`/koran/${cat}/${date}`}
                      className="text-xs text-primary hover:underline whitespace-nowrap">Lihat semua</Link>
                  </div>
                  <div className="space-y-2">
                    {arts.map(art => <ArticleRow key={art.id} article={art} />)}
                  </div>
                </section>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const ArticleRow = ({ article }) => (
  <Link to={`/koran/${article.category}/${article.publishDate}/${article.slug}`}
    className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition group">
    {article.imageUrl && (
      <img src={article.imageUrl} alt="" className="w-20 h-14 object-cover rounded-lg flex-shrink-0" />
    )}
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        {article.importance === 'high' && (
          <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold rounded">UTAMA</span>
        )}
        {article.sourceName && <span className="text-xs text-gray-400">{article.sourceName}</span>}
        {article.pageNumber && <span className="text-xs text-gray-300 dark:text-gray-600">· Hal. {article.pageNumber}</span>}
      </div>
      <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2 group-hover:text-primary transition"
          style={{ fontFamily: 'Georgia, serif' }}>
        {article.title}
      </h3>
      {article.author && <p className="text-xs text-gray-400 mt-1">Oleh {article.author}</p>}
    </div>
  </Link>
)

export default NewspaperDatePage
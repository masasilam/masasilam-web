// src/pages/NewspaperCategoryPage.jsx

import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import {
  ChevronLeft, ChevronRight, Eye, BookOpen, X, SlidersHorizontal
} from 'lucide-react'
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

const IMPORTANCE_LABELS = { high: 'Utama', medium: 'Reguler', low: 'Tambahan' }

const ArticleCard = ({ article }) => (
  <Link to={`/koran/${article.category}/${article.publishDate}/${article.slug}`}
    className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-md hover:border-gray-300 dark:hover:border-gray-500 transition-all">
    {article.imageUrl && (
      <div className="aspect-video overflow-hidden bg-gray-100 dark:bg-gray-700">
        <img src={article.imageUrl} alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      </div>
    )}
    <div className="p-4">
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        {article.importance === 'high' && (
          <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold rounded">UTAMA</span>
        )}
        {article.sourceName && <span className="text-xs text-gray-400 font-medium">{article.sourceName}</span>}
        {article.pageNumber && <span className="text-xs text-gray-400">Hal. {article.pageNumber}</span>}
      </div>
      <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base leading-snug mb-2 group-hover:text-primary transition line-clamp-3"
          style={{ fontFamily: 'Georgia, serif' }}>
        {article.title}
      </h3>
      <div className="flex items-center gap-3 text-xs text-gray-400">
        <span>{article.dateFormatted || article.publishDate}</span>
        {article.author && <><span>·</span><span>{article.author}</span></>}
        {article.viewCount > 0 && (
          <span className="flex items-center gap-0.5 ml-auto">
            <Eye className="w-3 h-3" />{article.viewCount}
          </span>
        )}
      </div>
    </div>
  </Link>
)

const NewspaperCategoryPage = () => {
  const { categorySlug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()

  const [articles, setArticles] = useState([])
  const [total, setTotal]       = useState(0)
  const [loading, setLoading]   = useState(true)
  const [sources, setSources]   = useState([])
  const [showFilter, setShowFilter] = useState(false)

  const page       = parseInt(searchParams.get('page') || '1')
  const dateFrom   = searchParams.get('dateFrom') || ''
  const dateTo     = searchParams.get('dateTo') || ''
  const source     = searchParams.get('source') || ''
  const importance = searchParams.get('importance') || ''
  const sortBy     = searchParams.get('sortBy') || 'date'
  const sortOrder  = searchParams.get('sortOrder') || 'DESC'
  const limit      = 20
  const totalPages = Math.ceil(total / limit)

  const catName = getCatLabel(categorySlug)
  const catIcon = getCatIcon(categorySlug)

  const fetchArticles = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit, sortBy, sortOrder }
      if (dateFrom)   params.dateFrom   = dateFrom
      if (dateTo)     params.dateTo     = dateTo
      if (source)     params.source     = source
      if (importance) params.importance = importance
      const res = await api.get(`/newspapers/categories/${categorySlug}`, { params })
      const data = res.data?.data
      setArticles(data?.list || [])
      setTotal(data?.total || 0)
    } catch (e) { console.error(e) }
      finally   { setLoading(false) }
  }, [categorySlug, page, sortBy, sortOrder, dateFrom, dateTo, source, importance])

  useEffect(() => {
    document.title = `${catName} — Arsip Koran`
    fetchArticles()
  }, [fetchArticles, catName])

  useEffect(() => {
    api.get('/newspapers/sources', { params: { page: 1, limit: 100 } })
      .then(r => setSources(r.data?.data?.list || []))
      .catch(() => {})
  }, [])

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value); else next.delete(key)
    next.delete('page')
    setSearchParams(next)
  }

  const clearFilters = () => setSearchParams({ page: '1' })
  const hasFilters = dateFrom || dateTo || source || importance

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
            <Link to="/koran" className="hover:text-gray-900 dark:hover:text-white transition">Koran</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-700 dark:text-gray-300 font-medium">{catName}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{catIcon}</span>
              <div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white"
                    style={{ fontFamily: 'Georgia, serif' }}>{catName}</h1>
                <p className="text-sm text-gray-500">{total.toLocaleString('id-ID')} artikel ditemukan</p>
              </div>
            </div>
            <button onClick={() => setShowFilter(v => !v)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition ${
                showFilter || hasFilters
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white'
                  : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}>
              <SlidersHorizontal className="w-4 h-4" />
              Filter {hasFilters && <span className="w-2 h-2 bg-red-500 rounded-full" />}
            </button>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilter && (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Dari Tanggal</label>
                <input type="date" value={dateFrom} onChange={e => setParam('dateFrom', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Sampai Tanggal</label>
                <input type="date" value={dateTo} onChange={e => setParam('dateTo', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Sumber</label>
                <select value={source} onChange={e => setParam('source', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">Semua Sumber</option>
                  {sources.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Prioritas</label>
                <select value={importance} onChange={e => setParam('importance', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">Semua</option>
                  {Object.entries(IMPORTANCE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </div>
            {hasFilters && (
              <button onClick={clearFilters}
                className="flex items-center gap-1.5 mt-3 text-xs text-red-500 hover:text-red-700 transition">
                <X className="w-3.5 h-3.5" />Hapus semua filter
              </button>
            )}
          </div>
        </div>
      )}

      {/* Sort Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3 border-b border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50">
        <span className="text-xs text-gray-500">Urutkan:</span>
        {[['date', 'Terbaru'], ['importance', 'Prioritas']].map(([v, l]) => (
          <button key={v} onClick={() => setParam('sortBy', v)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
              sortBy === v ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}>{l}</button>
        ))}
        <button onClick={() => setParam('sortOrder', sortOrder === 'DESC' ? 'ASC' : 'DESC')}
          className="ml-auto flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white transition">
          {sortOrder === 'DESC' ? '↓ Terbaru' : '↑ Terlama'}
        </button>
      </div>

      {/* Articles Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
                <div className="aspect-video bg-gray-200 dark:bg-gray-700" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-24">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-200 dark:text-gray-700" />
            <p className="text-gray-400 font-medium">Tidak ada artikel ditemukan</p>
            <p className="text-sm text-gray-400 mt-1">Coba ubah filter pencarian</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {articles.map(art => <ArticleCard key={art.id} article={art} />)}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button onClick={() => setParam('page', String(page - 1))} disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let p
                    if (totalPages <= 5) p = i + 1
                    else if (page <= 3) p = i + 1
                    else if (page >= totalPages - 2) p = totalPages - 4 + i
                    else p = page - 2 + i
                    return (
                      <button key={p} onClick={() => setParam('page', String(p))}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
                          page === p ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' : 'border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}>{p}</button>
                    )
                  })}
                </div>
                <button onClick={() => setParam('page', String(page + 1))} disabled={page === totalPages}
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                  <ChevronRight className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-400 ml-2">{page}/{totalPages}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default NewspaperCategoryPage
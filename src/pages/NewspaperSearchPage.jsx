// src/pages/NewspaperSearchPage.jsx

import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, ChevronRight, ChevronLeft, Filter, X, BookOpen } from 'lucide-react'
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

const NewspaperSearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [articles, setArticles] = useState([])
  const [total, setTotal]       = useState(0)
  const [loading, setLoading]   = useState(false)
  const [inputQ, setInputQ]     = useState(searchParams.get('q') || '')
  const [showFilter, setShowFilter] = useState(false)

  const q          = searchParams.get('q') || ''
  const page       = parseInt(searchParams.get('page') || '1')
  const category   = searchParams.get('category') || ''
  const dateFrom   = searchParams.get('dateFrom') || ''
  const dateTo     = searchParams.get('dateTo') || ''
  const source     = searchParams.get('source') || ''
  const importance = searchParams.get('importance') || ''
  const limit      = 20
  const totalPages = Math.ceil(total / limit)

  const fetchResults = useCallback(async () => {
    if (!q.trim()) return
    setLoading(true)
    try {
      const params = { q, page, limit }
      if (category)   params.category   = category
      if (dateFrom)   params.dateFrom   = dateFrom
      if (dateTo)     params.dateTo     = dateTo
      if (source)     params.source     = source
      if (importance) params.importance = importance
      const res = await api.get('/newspapers/search', { params })
      const data = res.data?.data
      setArticles(data?.list || [])
      setTotal(data?.total || 0)
    } catch (e) { console.error(e) }
      finally   { setLoading(false) }
  }, [q, page, category, dateFrom, dateTo, source, importance])

  useEffect(() => {
    document.title = q ? `"${q}" — Cari Koran` : 'Cari Artikel — Koran'
    fetchResults()
  }, [fetchResults, q])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (inputQ.trim()) setSearchParams(new URLSearchParams({ q: inputQ.trim() }))
  }

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value); else next.delete(key)
    next.delete('page')
    setSearchParams(next)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
            <Link to="/koran" className="hover:text-gray-900 dark:hover:text-white transition">Koran</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>Pencarian</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-4"
              style={{ fontFamily: 'Georgia, serif' }}>Cari Artikel</h1>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={inputQ} onChange={e => setInputQ(e.target.value)}
                placeholder="Ketik kata kunci, judul, topik..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-gray-900 dark:focus:border-white outline-none transition text-sm" />
            </div>
            <button type="submit"
              className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-semibold text-sm hover:opacity-90 transition">
              Cari
            </button>
            <button type="button" onClick={() => setShowFilter(v => !v)}
              className={`px-3 py-3 rounded-lg border text-sm transition ${
                showFilter ? 'bg-gray-100 dark:bg-gray-700 border-gray-300' : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}>
              <Filter className="w-4 h-4" />
            </button>
          </form>

          {showFilter && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Kategori</label>
                <select value={category} onChange={e => setParam('category', e.target.value)}
                  className="w-full px-2 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">Semua</option>
                  {CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Dari Tanggal</label>
                <input type="date" value={dateFrom} onChange={e => setParam('dateFrom', e.target.value)}
                  className="w-full px-2 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Sampai Tanggal</label>
                <input type="date" value={dateTo} onChange={e => setParam('dateTo', e.target.value)}
                  className="w-full px-2 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Prioritas</label>
                <select value={importance} onChange={e => setParam('importance', e.target.value)}
                  className="w-full px-2 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">Semua</option>
                  <option value="high">Utama</option>
                  <option value="medium">Reguler</option>
                  <option value="low">Tambahan</option>
                </select>
              </div>
              {(category || dateFrom || dateTo || importance) && (
                <button onClick={() => { setSearchParams({ q }); setShowFilter(false) }}
                  className="col-span-full flex items-center gap-1 text-xs text-red-500 hover:text-red-700">
                  <X className="w-3.5 h-3.5" />Hapus filter
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {!q ? (
          <div className="text-center py-24">
            <Search className="w-16 h-16 mx-auto mb-4 text-gray-200 dark:text-gray-700" />
            <p className="text-gray-400">Masukkan kata kunci untuk mencari artikel</p>
          </div>
        ) : loading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-24 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 animate-pulse" />
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-24">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-200 dark:text-gray-700" />
            <p className="text-gray-500 font-medium">Tidak ada hasil untuk "{q}"</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">
              Menampilkan <span className="font-semibold text-gray-900 dark:text-white">{total.toLocaleString('id-ID')}</span> hasil untuk{' '}
              <span className="font-semibold text-primary">"{q}"</span>
            </p>
            <div className="space-y-3">
              {articles.map(art => (
                <Link key={art.id} to={`/koran/${art.category}/${art.publishDate}/${art.slug}`}
                  className="block bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500 p-4 transition group">
                  <div className="flex items-start gap-4">
                    {art.imageUrl && (
                      <img src={art.imageUrl} alt="" className="w-20 h-14 object-cover rounded-lg flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-semibold text-primary">
                          {getCatIcon(art.category)} {getCatLabel(art.category)}
                        </span>
                        <span className="text-gray-300 dark:text-gray-600">·</span>
                        <span className="text-xs text-gray-400">{art.dateFormatted || art.publishDate}</span>
                        {art.sourceName && <>
                          <span className="text-gray-300 dark:text-gray-600">·</span>
                          <span className="text-xs text-gray-400">{art.sourceName}</span>
                        </>}
                      </div>
                      <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-primary transition line-clamp-2"
                          style={{ fontFamily: 'Georgia, serif' }}>
                        {art.title}
                      </h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button onClick={() => setParam('page', String(page - 1))} disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-500">Hal. {page} / {totalPages}</span>
                <button onClick={() => setParam('page', String(page + 1))} disabled={page === totalPages}
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
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

export default NewspaperSearchPage
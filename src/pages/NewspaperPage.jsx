// src/pages/NewspaperPage.jsx
// Halaman utama Koran — menampilkan stats, kategori, trending, & on this day

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Newspaper, TrendingUp, Calendar, Search, ChevronRight,
  BookOpen, Eye, Clock, Flame, ArrowRight, Layers
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
const getCatIcon  = (v) => CAT_MAP[v]?.icon  || '📰'
const getCatLabel = (v) => CAT_MAP[v]?.label || v

const NewspaperPage = () => {
  const [stats, setStats]           = useState(null)
  const [categories, setCategories] = useState([])
  const [trending, setTrending]     = useState([])
  const [onThisDay, setOnThisDay]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [searchQ, setSearchQ]       = useState('')

  useEffect(() => {
    document.title = 'Koran Digital — Arsip Berita'
    Promise.all([
      api.get('/newspapers/stats'),
      api.get('/newspapers/categories'),
      api.get('/newspapers/trending', { params: { days: 7, limit: 5 } }),
      api.get('/newspapers/on-this-day', { params: { page: 1, limit: 5 } }),
    ]).then(([s, c, t, o]) => {
      setStats(s.data?.data)
      setCategories(c.data?.data || [])
      setTrending(t.data?.data || [])
      setOnThisDay(o.data?.data?.list || [])
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQ.trim()) window.location.href = `/koran/cari?q=${encodeURIComponent(searchQ.trim())}`
  }

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const todayFormatted = today.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

      {/* ── MASTHEAD ── */}
      <div className="bg-white dark:bg-gray-800 border-b-4 border-gray-900 dark:border-white">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-gray-500 mb-2">{todayFormatted}</p>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-gray-900 dark:text-white mb-1"
              style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.02em' }}>
            Arsip Koran
          </h1>
          <p className="text-sm text-gray-500 tracking-widest uppercase">Koleksi Berita Bersejarah</p>

          {/* Stats Bar */}
          {stats && (
            <div className="flex items-center justify-center gap-6 mt-4 text-xs text-gray-500">
              <span>{(stats.totalArticles || 0).toLocaleString('id-ID')} artikel</span>
              <span className="w-1 h-1 bg-gray-400 rounded-full" />
              <span>{(stats.totalSources || 0).toLocaleString('id-ID')} sumber</span>
              <span className="w-1 h-1 bg-gray-400 rounded-full" />
              <span>{(stats.totalCategories || 0).toLocaleString('id-ID')} kategori</span>
              {stats.dateRange && <>
                <span className="w-1 h-1 bg-gray-400 rounded-full" />
                <span>{stats.dateRange}</span>
              </>}
            </div>
          )}

          {/* Search */}
          <form onSubmit={handleSearch} className="mt-6 max-w-xl mx-auto">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  placeholder="Cari artikel, topik, atau kata kunci..."
                  className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-gray-900 dark:focus:border-white outline-none transition text-sm"
                />
              </div>
              <button type="submit"
                className="px-5 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-semibold text-sm hover:opacity-90 transition">
                Cari
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── NAV CATEGORIES ── */}
      <div className="bg-gray-900 dark:bg-gray-950 text-white sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-2">
            <Link to={`/koran/tanggal/${todayStr}`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-xs font-semibold whitespace-nowrap">
              <Calendar className="w-3.5 h-3.5" />Hari Ini
            </Link>
            <Link to="/koran/hari-ini"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg hover:bg-white/10 transition text-xs whitespace-nowrap text-gray-300">
              <Clock className="w-3.5 h-3.5" />Pada Hari Ini
            </Link>
            {categories.map(cat => (
              <Link key={cat.slug} to={`/koran/kategori/${cat.slug}`}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg hover:bg-white/10 transition text-xs whitespace-nowrap text-gray-300">
                <span>{getCatIcon(cat.slug)}</span>
                {cat.name}
                {cat.articleCount > 0 && (
                  <span className="text-gray-500 text-xs">({cat.articleCount.toLocaleString('id-ID')})</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ── LEFT: CATEGORIES GRID ── */}
            <div className="lg:col-span-2 space-y-8">

              {/* Category Cards */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-wider"
                      style={{ fontFamily: 'Georgia, serif' }}>Rubrik</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {categories.map(cat => (
                    <Link key={cat.slug} to={`/koran/kategori/${cat.slug}`}
                      className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-gray-900 dark:hover:border-white transition-all hover:shadow-md">
                      <div className="text-3xl mb-2">{getCatIcon(cat.slug)}</div>
                      <h3 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-gray-600 dark:group-hover:text-gray-300 transition">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {(cat.articleCount || 0).toLocaleString('id-ID')} artikel
                      </p>
                    </Link>
                  ))}
                </div>
              </section>

              {/* Trending Articles */}
              {trending.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-wider"
                        style={{ fontFamily: 'Georgia, serif' }}>Trending Minggu Ini</h2>
                  </div>
                  <div className="space-y-3">
                    {trending.map((art, idx) => (
                      <Link key={art.id}
                        to={`/koran/${art.category}/${art.publishDate}/${art.slug}`}
                        className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition group">
                        <span className="text-3xl font-black text-gray-100 dark:text-gray-700 group-hover:text-gray-200 dark:group-hover:text-gray-600 transition leading-none w-8 flex-shrink-0"
                              style={{ fontFamily: 'Georgia, serif' }}>
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-gray-500 uppercase">
                              {getCatIcon(art.category)} {art.categoryName || getCatLabel(art.category)}
                            </span>
                            <span className="text-gray-300 dark:text-gray-600">·</span>
                            <span className="text-xs text-gray-400">{art.dateFormatted || art.publishDate}</span>
                          </div>
                          <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2 group-hover:text-primary transition">
                            {art.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                            {art.source && <span>{art.source}</span>}
                            {art.viewCount > 0 && (
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />{art.viewCount.toLocaleString('id-ID')}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link to="/koran/kategori/politik"
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white mt-3 transition">
                    Lihat lebih banyak <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </section>
              )}

              {/* Browse by Date */}
              <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-wider"
                      style={{ fontFamily: 'Georgia, serif' }}>Telusuri Berdasarkan Tanggal</h2>
                </div>
                <p className="text-sm text-gray-500 mb-4">Pilih tanggal untuk melihat berita yang terbit pada hari itu.</p>
                <div className="flex gap-3">
                  <input type="date"
                    defaultValue={todayStr}
                    max={todayStr}
                    onChange={e => e.target.value && (window.location.href = `/koran/tanggal/${e.target.value}`)}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  <Link to={`/koran/tanggal/${todayStr}`}
                    className="px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-semibold hover:opacity-90 transition">
                    Lihat
                  </Link>
                </div>
              </section>
            </div>

            {/* ── RIGHT: SIDEBAR ── */}
            <div className="space-y-6">

              {/* On This Day */}
              {onThisDay.length > 0 && (
                <section className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <h2 className="text-sm font-black text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                      Pada Hari Ini
                    </h2>
                  </div>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mb-4">
                    {today.toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })} dalam sejarah
                  </p>
                  <div className="space-y-3">
                    {onThisDay.map(art => (
                      <Link key={art.id}
                        to={`/koran/${art.category}/${art.publishDate}/${art.slug}`}
                        className="block group">
                        <div className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-0.5">
                          {art.publishDate?.split('-')[0]}
                        </div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition">
                          {art.title}
                        </h3>
                        {art.source && <p className="text-xs text-gray-500 mt-0.5">{art.source}</p>}
                      </Link>
                    ))}
                  </div>
                  <Link to="/koran/hari-ini"
                    className="flex items-center gap-1 text-xs text-amber-700 dark:text-amber-400 hover:underline mt-4">
                    Lihat semua <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </section>
              )}

              {/* Quick Links per Category */}
              <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
                <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider mb-4"
                    style={{ fontFamily: 'Georgia, serif' }}>
                  Akses Cepat
                </h2>
                <div className="space-y-1">
                  {[
                    { label: 'Berita Hari Ini', path: `/koran/tanggal/${todayStr}`, icon: Calendar },
                    { label: 'Artikel Trending', path: '/koran/kategori/politik', icon: TrendingUp },
                    { label: 'Telusuri Kategori', path: '/koran/kategori/teknologi', icon: Layers },
                    { label: 'Pada Hari Ini', path: '/koran/hari-ini', icon: Clock },
                    { label: 'Pencarian Lanjutan', path: '/koran/cari', icon: Search },
                  ].map(({ label, path, icon: Icon }) => (
                    <Link key={path} to={path}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition group">
                      <Icon className="w-4 h-4 text-gray-400 group-hover:text-primary transition" />
                      <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition">
                        {label}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-300 ml-auto group-hover:text-primary transition" />
                    </Link>
                  ))}
                </div>
              </section>

              {/* Stats Card */}
              {stats && (
                <section className="bg-gray-900 dark:bg-gray-950 text-white rounded-xl p-5">
                  <h2 className="text-sm font-black uppercase tracking-wider mb-4 text-gray-300">Statistik Arsip</h2>
                  <div className="space-y-3">
                    {[
                      { label: 'Total Artikel', value: (stats.totalArticles || 0).toLocaleString('id-ID'), icon: BookOpen },
                      { label: 'Sumber Media', value: (stats.totalSources || 0).toLocaleString('id-ID'), icon: Newspaper },
                      { label: 'Kategori', value: (stats.totalCategories || 0).toLocaleString('id-ID'), icon: Layers },
                    ].map(({ label, value, icon: Icon }) => (
                      <div key={label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Icon className="w-3.5 h-3.5" />
                          <span className="text-xs">{label}</span>
                        </div>
                        <span className="font-bold text-sm">{value}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default NewspaperPage
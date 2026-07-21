import { useState, useEffect, memo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Newspaper, TrendingUp, Calendar, Search, ChevronRight,
  BookOpen, Eye, Clock, Flame, ArrowRight, Layers, Hash
} from 'lucide-react'
import api from '../services/api'

// ── Categories ────────────────────────────────────────────────────────────────
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
const CAT_MAP   = Object.fromEntries(CATEGORIES.map(c => [c.value, c]))
const getCatIcon  = (v) => CAT_MAP[v]?.icon  || '📰'
const getCatLabel = (v) => CAT_MAP[v]?.label || v

// ── Skeletons ─────────────────────────────────────────────────────────────────
const SkeletonCat = memo(() => (
  <div className="animate-pulse rounded-2xl border p-5
                  bg-white border-stone-200 dark:bg-slate-900 dark:border-slate-700">
    <div className="text-3xl mb-3">⬜</div>
    <div className="h-3.5 rounded w-3/4 mb-1.5 bg-stone-200 dark:bg-slate-700" />
    <div className="h-2.5 rounded w-1/2 bg-stone-200 dark:bg-slate-700" />
  </div>
))
SkeletonCat.displayName = 'SkeletonCat'

const SkeletonTrend = memo(() => (
  <div className="animate-pulse flex items-start gap-4 p-4 rounded-xl border
                  bg-white border-stone-100 dark:bg-slate-900 dark:border-slate-800">
    <div className="w-8 h-8 rounded bg-stone-200 dark:bg-slate-700 flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3 rounded w-1/3 bg-stone-200 dark:bg-slate-700" />
      <div className="h-4 rounded w-full bg-stone-200 dark:bg-slate-700" />
      <div className="h-4 rounded w-3/4 bg-stone-200 dark:bg-slate-700" />
    </div>
  </div>
))
SkeletonTrend.displayName = 'SkeletonTrend'

// ── TrendingCard ──────────────────────────────────────────────────────────────
const TrendingCard = memo(({ article, index }) => (
  <Link
    to={`/koran/${article.category}/${article.publishDate}/${article.slug}`}
    className="group flex items-start gap-4 p-4 rounded-xl border transition-all duration-200
               bg-white border-stone-100 hover:border-violet-300 hover:shadow-md hover:shadow-violet-100/60
               dark:bg-slate-900 dark:border-slate-800 dark:hover:border-violet-700/60 dark:hover:shadow-violet-900/20"
  >
    <span className="text-3xl font-black leading-none w-8 flex-shrink-0 tabular-nums select-none
                     text-stone-200 group-hover:text-violet-300 transition-colors
                     dark:text-slate-700 dark:group-hover:text-violet-700"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
      {index + 1}
    </span>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
        <span className="text-[10px] font-semibold uppercase tracking-wider
                         text-violet-600 dark:text-violet-400">
          {getCatIcon(article.category)} {article.categoryName || getCatLabel(article.category)}
        </span>
        <span className="text-stone-200 dark:text-slate-700">·</span>
        <span className="text-[10px] text-stone-400 dark:text-slate-500">
          {article.dateFormatted || article.publishDate}
        </span>
      </div>
      <h3 className="font-bold text-sm leading-snug line-clamp-2 mb-1.5 transition-colors
                     text-stone-800 group-hover:text-violet-700
                     dark:text-slate-200 dark:group-hover:text-violet-300"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
        {article.title}
      </h3>
      <div className="flex items-center gap-3 text-[10px] text-stone-400 dark:text-slate-500">
        {article.source && <span>{article.source}</span>}
        {article.viewCount > 0 && (
          <span className="flex items-center gap-1">
            <Eye className="w-2.5 h-2.5" />
            {article.viewCount.toLocaleString('id-ID')}
          </span>
        )}
      </div>
    </div>
  </Link>
))
TrendingCard.displayName = 'TrendingCard'

// ── OnThisDayCard ─────────────────────────────────────────────────────────────
const OnThisDayCard = memo(({ article }) => (
  <Link
    to={`/koran/${article.category}/${article.publishDate}/${article.slug}`}
    className="group flex gap-3 py-3 border-b last:border-b-0 transition-colors
               border-amber-100 dark:border-amber-900/30"
  >
    <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
                    bg-amber-100 dark:bg-amber-900/30">
      <span className="text-xs font-black text-amber-700 dark:text-amber-400 leading-none tabular-nums">
        {article.publishDate?.split('-')[0]}
      </span>
    </div>
    <div className="min-w-0">
      <p className="text-[10px] text-amber-600 dark:text-amber-500 mb-0.5">
        {getCatIcon(article.category)} {getCatLabel(article.category)}
      </p>
      <h3 className="text-xs font-semibold line-clamp-2 leading-snug transition-colors
                     text-stone-800 group-hover:text-amber-700
                     dark:text-slate-200 dark:group-hover:text-amber-400"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
        {article.title}
      </h3>
    </div>
  </Link>
))
OnThisDayCard.displayName = 'OnThisDayCard'

// ── CategoryCard ──────────────────────────────────────────────────────────────
const CategoryCard = memo(({ cat }) => (
  <Link
    to={`/koran/kategori/${cat.slug}`}
    className="group rounded-2xl border p-4 sm:p-5 transition-all duration-200
               bg-white border-stone-200 hover:border-violet-400 hover:shadow-lg hover:shadow-violet-100/80 hover:-translate-y-0.5
               dark:bg-slate-900 dark:border-slate-700 dark:hover:border-violet-600/60 dark:hover:shadow-violet-900/20"
  >
    <div className="text-3xl mb-3 transition-transform group-hover:scale-110 duration-200 origin-left">
      {getCatIcon(cat.slug)}
    </div>
    <h3 className="font-bold text-sm leading-snug mb-1 transition-colors
                   text-stone-800 group-hover:text-violet-700
                   dark:text-slate-200 dark:group-hover:text-violet-300">
      {cat.name}
    </h3>
    <p className="text-[10px] text-stone-400 dark:text-slate-500">
      {(cat.articleCount || 0).toLocaleString('id-ID')} artikel
    </p>
  </Link>
))
CategoryCard.displayName = 'CategoryCard'

// ── Main ──────────────────────────────────────────────────────────────────────
const NewspaperPage = () => {
  const navigate = useNavigate()
  const [stats,      setStats]      = useState(null)
  const [categories, setCategories] = useState([])
  const [trending,   setTrending]   = useState([])
  const [onThisDay,  setOnThisDay]  = useState([])
  const [loading,    setLoading]    = useState(true)
  const [searchQ,    setSearchQ]    = useState('')

  useEffect(() => {
    document.title = 'Arsip Koran Digital — Koleksi Berita Bersejarah'
    Promise.all([
      api.get('/newspapers/stats'),
      api.get('/newspapers/categories'),
      api.get('/newspapers/trending', { params: { days: 7, limit: 6 } }),
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
    if (searchQ.trim()) navigate(`/koran/cari?q=${encodeURIComponent(searchQ.trim())}`)
  }

  const today        = new Date()
  const todayStr     = today.toISOString().split('T')[0]
  const todayFormatted = today.toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  return (
    <div className="min-h-screen transition-colors duration-300
                    bg-stone-50 dark:bg-slate-950">

      {/* ── MASTHEAD ──────────────────────────────────────────────── */}
      <div className="border-b transition-colors
                      bg-white border-stone-200
                      dark:bg-slate-900 dark:border-slate-700">
        <div className="container mx-auto px-4 max-w-7xl py-8 sm:py-12">

          {/* Date line */}
          <p className="text-[10px] sm:text-xs tracking-[0.3em] uppercase mb-3 text-center
                        text-stone-400 dark:text-slate-500">
            {todayFormatted}
          </p>

          {/* Nameplate */}
          <div className="text-center mb-4">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-none mb-2
                           text-stone-900 dark:text-slate-50"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif', letterSpacing: '-0.03em' }}>
              Arsip Koran
            </h1>
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="h-px flex-1 max-w-24 bg-stone-200 dark:bg-slate-700" />
              <p className="text-[10px] tracking-[0.4em] uppercase font-medium
                            text-stone-400 dark:text-slate-500">
                Koleksi Berita Bersejarah
              </p>
              <div className="h-px flex-1 max-w-24 bg-stone-200 dark:bg-slate-700" />
            </div>

            {/* Stats bar */}
            {stats && (
              <div className="flex items-center justify-center gap-3 sm:gap-6 flex-wrap">
                {[
                  { v: stats.totalArticles,  l: 'artikel'  },
                  { v: stats.totalSources,   l: 'sumber'   },
                  { v: stats.totalCategories,l: 'kategori' },
                ].filter(x => x.v).map(({ v, l }) => (
                  <span key={l} className="text-xs text-stone-500 dark:text-slate-400">
                    <span className="font-semibold text-stone-800 dark:text-slate-200">
                      {Number(v).toLocaleString('id-ID')}
                    </span>{' '}{l}
                  </span>
                ))}
                {stats.dateRange && (
                  <span className="text-xs text-stone-400 dark:text-slate-500">
                    {stats.dateRange}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto mt-6">
            <div className="flex items-stretch gap-2 h-11">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none
                                   text-stone-400 dark:text-slate-500" />
                <input
                  type="text"
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  placeholder="Cari artikel, topik, kata kunci…"
                  className="h-full w-full pl-10 pr-4 text-sm rounded-xl transition-all focus:outline-none
                             border border-stone-200 bg-stone-50 text-stone-900 placeholder-stone-400
                             focus:ring-2 focus:ring-violet-400/40 focus:border-violet-400
                             dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500
                             dark:focus:ring-violet-500/40 dark:focus:border-violet-500/60"
                />
              </div>
              <button
                type="submit"
                className="flex-shrink-0 flex items-center gap-1.5 px-5 rounded-xl text-sm font-semibold
                           transition-all bg-violet-600 hover:bg-violet-500 text-white
                           shadow-sm shadow-violet-200/80 hover:shadow-md
                           dark:shadow-violet-900/40">
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Cari</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── NAV STRIP ─────────────────────────────────────────────── */}
      <div className="border-b sticky top-0 z-20 transition-colors
                      bg-stone-900 dark:bg-slate-950 border-stone-800 dark:border-slate-800">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center gap-1 overflow-x-auto py-2"
               style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {/* Hari Ini */}
            <Link
              to={`/koran/tanggal/${todayStr}`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg
                         bg-violet-600 text-white text-xs font-semibold whitespace-nowrap
                         hover:bg-violet-500 transition flex-shrink-0">
              <Calendar className="w-3.5 h-3.5" />Hari Ini
            </Link>
            <Link
              to="/koran/hari-ini"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg
                         text-stone-400 hover:text-white hover:bg-white/10
                         text-xs whitespace-nowrap transition flex-shrink-0">
              <Clock className="w-3.5 h-3.5" />Pada Hari Ini
            </Link>
            <div className="w-px h-4 mx-1 bg-stone-700 flex-shrink-0" />
            {categories.map(cat => (
              <Link
                key={cat.slug}
                to={`/koran/kategori/${cat.slug}`}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg
                           text-stone-400 hover:text-white hover:bg-white/10
                           text-xs whitespace-nowrap transition flex-shrink-0">
                <span>{getCatIcon(cat.slug)}</span>
                <span>{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ──────────────────────────────────────────── */}
      <div className="container mx-auto px-4 max-w-7xl py-8 sm:py-10">
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Array.from({ length: 8 }, (_, i) => <SkeletonCat key={i} />)}
              </div>
              <div className="space-y-3">
                {Array.from({ length: 5 }, (_, i) => <SkeletonTrend key={i} />)}
              </div>
            </div>
            <div className="space-y-6">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="animate-pulse rounded-2xl border p-5 h-40
                                        bg-white border-stone-200 dark:bg-slate-900 dark:border-slate-700" />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ── LEFT / MAIN ───────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-10">

              {/* Category Grid */}
              <section>
                <div className="flex items-center justify-between mb-5 pl-4 border-l-4 border-violet-500 dark:border-violet-400">
                  <div>
                    <h2 className="font-serif text-xl sm:text-2xl font-bold leading-none
                                   text-stone-900 dark:text-slate-50"
                        style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
                      Rubrik
                    </h2>
                    <p className="text-xs mt-0.5 text-stone-500 dark:text-slate-400">
                      {categories.length} kategori tersedia
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {categories.map(cat => (
                    <CategoryCard key={cat.slug} cat={cat} />
                  ))}
                </div>
              </section>

              {/* Trending */}
              {trending.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-5 pl-4 border-l-4 border-violet-500 dark:border-violet-400">
                    <div className="flex items-center gap-2">
                      <div className="hidden sm:flex p-2 rounded-lg bg-violet-50 dark:bg-violet-500/10">
                        <Flame className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                      </div>
                      <div>
                        <h2 className="font-serif text-xl sm:text-2xl font-bold leading-none
                                       text-stone-900 dark:text-slate-50"
                            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
                          Trending Minggu Ini
                        </h2>
                        <p className="text-xs mt-0.5 text-stone-500 dark:text-slate-400">
                          Artikel paling banyak dibaca
                        </p>
                      </div>
                    </div>
                    <Link
                      to="/koran/kategori/nasional"
                      className="text-xs font-semibold uppercase tracking-wider hover:opacity-70 transition-opacity whitespace-nowrap
                                 text-violet-600 dark:text-violet-400">
                      Lihat Semua
                    </Link>
                  </div>
                  <div className="space-y-2">
                    {trending.map((art, i) => (
                      <TrendingCard key={art.id} article={art} index={i} />
                    ))}
                  </div>
                </section>
              )}

              {/* Browse by Date */}
              <section>
                <div className="flex items-center gap-3 mb-5 pl-4 border-l-4 border-violet-500 dark:border-violet-400">
                  <div className="hidden sm:flex p-2 rounded-lg bg-violet-50 dark:bg-violet-500/10">
                    <Calendar className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <h2 className="font-serif text-xl sm:text-2xl font-bold leading-none
                                   text-stone-900 dark:text-slate-50"
                        style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
                      Telusuri Berdasarkan Tanggal
                    </h2>
                    <p className="text-xs mt-0.5 text-stone-500 dark:text-slate-400">
                      Pilih tanggal untuk melihat edisi tersebut
                    </p>
                  </div>
                </div>
                <div className="p-5 sm:p-6 rounded-2xl border transition-colors
                                bg-white border-stone-200
                                dark:bg-slate-900 dark:border-slate-700">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="date"
                      defaultValue={todayStr}
                      max={todayStr}
                      onChange={e => e.target.value && navigate(`/koran/tanggal/${e.target.value}`)}
                      className="flex-1 px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none
                                 border-stone-200 bg-stone-50 text-stone-900
                                 focus:ring-2 focus:ring-violet-400/40 focus:border-violet-400
                                 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100
                                 dark:focus:ring-violet-500/40 dark:focus:border-violet-500/60"
                    />
                    <Link
                      to={`/koran/tanggal/${todayStr}`}
                      className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl
                                 text-sm font-semibold transition-all whitespace-nowrap
                                 bg-violet-600 hover:bg-violet-500 text-white
                                 shadow-sm shadow-violet-200/80 dark:shadow-violet-900/40">
                      <Calendar className="w-4 h-4" />
                      Edisi Hari Ini
                    </Link>
                  </div>
                </div>
              </section>
            </div>

            {/* ── RIGHT SIDEBAR ─────────────────────────────────── */}
            <div className="space-y-6">

              {/* On This Day */}
              {onThisDay.length > 0 && (
                <div className="rounded-2xl border p-5 transition-colors
                                bg-gradient-to-br from-amber-50 to-amber-100/40 border-amber-200
                                dark:from-amber-900/20 dark:to-slate-900 dark:border-amber-800/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider
                                   text-amber-800 dark:text-amber-300">
                      Pada Hari Ini
                    </h3>
                  </div>
                  <p className="text-[10px] mb-4 text-amber-600/80 dark:text-amber-500">
                    {today.toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })} dalam sejarah
                  </p>
                  {onThisDay.map(art => <OnThisDayCard key={art.id} article={art} />)}
                  <Link
                    to="/koran/hari-ini"
                    className="flex items-center gap-1 text-xs font-medium mt-4 transition-colors
                               text-amber-700 hover:text-amber-900
                               dark:text-amber-400 dark:hover:text-amber-300">
                    Lihat semua <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              {/* Quick Links */}
              <div className="rounded-2xl border p-5 transition-colors
                              bg-white border-stone-200
                              dark:bg-slate-900 dark:border-slate-700">
                <h3 className="text-xs font-bold uppercase tracking-wider mb-4
                               text-stone-400 dark:text-slate-500">
                  Akses Cepat
                </h3>
                <div className="space-y-1">
                  {[
                    { label: 'Berita Hari Ini',     path: `/koran/tanggal/${todayStr}`, icon: Calendar },
                    { label: 'Artikel Trending',    path: '/koran/kategori/nasional',   icon: TrendingUp },
                    { label: 'Telusuri Kategori',   path: '/koran/kategori/teknologi',  icon: Layers },
                    { label: 'Pada Hari Ini',       path: '/koran/hari-ini',            icon: Clock },
                    { label: 'Pencarian Lanjutan',  path: '/koran/cari',                icon: Search },
                  ].map(({ label, path, icon: Icon }) => (
                    <Link
                      key={path}
                      to={path}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group
                                 hover:bg-violet-50 hover:border-violet-200
                                 dark:hover:bg-violet-500/10">
                      <Icon className="w-4 h-4 flex-shrink-0 transition-colors
                                       text-stone-400 group-hover:text-violet-600
                                       dark:text-slate-500 dark:group-hover:text-violet-400" />
                      <span className="text-sm transition-colors
                                       text-stone-700 group-hover:text-violet-700
                                       dark:text-slate-300 dark:group-hover:text-violet-300">
                        {label}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 ml-auto flex-shrink-0 transition-colors
                                              text-stone-300 group-hover:text-violet-500
                                              dark:text-slate-600 dark:group-hover:text-violet-500" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Stats Card */}
              {stats && (
                <div className="rounded-2xl p-5 transition-colors
                                bg-stone-900 dark:bg-slate-800/60">
                  <h3 className="text-xs font-bold uppercase tracking-wider mb-4
                                 text-stone-400">
                    Statistik Arsip
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Total Artikel', value: (stats.totalArticles  || 0).toLocaleString('id-ID'), icon: BookOpen },
                      { label: 'Sumber Media',  value: (stats.totalSources   || 0).toLocaleString('id-ID'), icon: Newspaper },
                      { label: 'Kategori',      value: (stats.totalCategories|| 0).toLocaleString('id-ID'), icon: Hash },
                    ].map(({ label, value, icon: Icon }) => (
                      <div key={label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-stone-400">
                          <Icon className="w-3.5 h-3.5" />
                          <span className="text-xs">{label}</span>
                        </div>
                        <span className="font-bold text-sm text-white">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default NewspaperPage
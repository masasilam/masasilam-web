import { useState, useEffect, useCallback, memo, useRef } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import {
  Search, TrendingUp, Clock, Eye, Heart, MessageCircle,
  ChevronLeft, ChevronRight, Calendar, ArrowLeft, X,
  PenLine, BookOpen, Tag, User, ArrowUpDown, ArrowUp, ArrowDown,
  Rss, SlidersHorizontal, Flame
} from 'lucide-react'
import api from '../services/api'
import SEO from '../components/Common/SEO'

// ── Shared input className — warm light / cool dark ─────────────────────────
const inputCls = `
  w-full px-3 py-2 rounded-lg text-sm transition-all focus:outline-none
  border border-stone-200 bg-white text-stone-800 placeholder-stone-400
  focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400
  dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500
  dark:focus:ring-amber-500/40 dark:focus:border-amber-500/60
`

// ── Sort options ─────────────────────────────────────────────────────────────
const SORTS = [
  { v: 'publishedAt', l: 'Terbaru'   },
  { v: 'viewCount',   l: 'Views'     },
  { v: 'likeCount',   l: 'Disukai'   },
  { v: 'commentCount',l: 'Komentar'  },
  { v: 'title',       l: 'Judul A–Z' },
]

// ── Category pills ────────────────────────────────────────────────────────────
const CATEGORY_ACCENTS = {
  default:   { pill: 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-900/20 dark:border-amber-700/50 dark:text-amber-300', active: 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-200/80 dark:shadow-amber-900/50' },
  Buku:      { pill: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-700/40 dark:text-amber-300', active: 'bg-amber-500 text-white border-amber-500' },
  Film:      { pill: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700/40 dark:text-blue-300', active: 'bg-blue-500 text-white border-blue-500' },
  Budaya:    { pill: 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:border-purple-700/40 dark:text-purple-300', active: 'bg-purple-500 text-white border-purple-500' },
  Teknologi: { pill: 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-700/40 dark:text-emerald-300', active: 'bg-emerald-500 text-white border-emerald-500' },
  Sejarah:   { pill: 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-900/20 dark:border-rose-700/40 dark:text-rose-300', active: 'bg-rose-500 text-white border-rose-500' },
}

const getCatAccent = (cat) => CATEGORY_ACCENTS[cat] || CATEGORY_ACCENTS.default

// ── Sort button ───────────────────────────────────────────────────────────────
const SortBtn = memo(({ opt, active, order, loading, onClick }) => (
  <button onClick={onClick} disabled={loading}
    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                transition-all duration-200 disabled:opacity-50 whitespace-nowrap
                ${active
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-200/80 dark:shadow-amber-900/50'
                  : `bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-800
                     dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200`
                }`}>
    {opt.l}
    {active
      ? order === 'DESC' ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />
      : <ArrowUpDown className="w-3 h-3 opacity-30" />}
  </button>
))

// ── Page input ────────────────────────────────────────────────────────────────
const PageInput = memo(({ currentPage, totalPages, onGo, disabled }) => {
  const [val, setVal] = useState(String(currentPage))
  const inputRef = useRef(null)
  useEffect(() => { setVal(String(currentPage)) }, [currentPage])
  const commit = useCallback(() => {
    const n = parseInt(val, 10)
    if (!isNaN(n) && n >= 1 && n <= totalPages) onGo(n)
    else setVal(String(currentPage))
  }, [val, currentPage, totalPages, onGo])

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs whitespace-nowrap text-stone-400 dark:text-slate-500">Hal</span>
      <input ref={inputRef} type="number" min={1} max={totalPages}
        value={val} disabled={disabled}
        onChange={(e) => setVal(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && (commit(), inputRef.current?.blur())}
        className="w-14 px-2 py-1.5 text-center text-xs rounded-lg transition-all focus:outline-none
                   border border-stone-200 bg-white text-stone-800
                   focus:ring-2 focus:ring-amber-400/50
                   disabled:opacity-50
                   dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200
                   dark:focus:ring-amber-500/40"
      />
      <span className="text-xs whitespace-nowrap text-stone-400 dark:text-slate-500">dari {totalPages}</span>
    </div>
  )
})
PageInput.displayName = 'PageInput'

// ── Reading time helper ──────────────────────────────────────────────────────
const readTime = (content) => {
  if (!content) return null
  const words = content.trim().split(/\s+/).length
  const mins  = Math.ceil(words / 200)
  return mins
}

// ── Format date ──────────────────────────────────────────────────────────────
const formatDate = (dateStr, opts = {}) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric', ...opts
  })
}

// ── Blog Card ─────────────────────────────────────────────────────────────────
// LIGHT: bg-white border-stone-200 shadow-stone-100
// DARK:  bg-slate-900 border-slate-700
const BlogCard = memo(({ post, featured = false }) => {
  const [imgLoaded, setImgLoaded] = useState(false)
  const cats = post.categories ? post.categories.split(',').map(c => c.trim()) : []
  const firstCat = cats[0] || ''
  const accent = getCatAccent(firstCat)
  const mins = post.readTime || readTime(post.content)

  if (featured) {
    return (
      <Link to={`/blog/${post.slug}`} className="block group">
        <article className="rounded-2xl overflow-hidden border shadow-lg transition-all duration-300
                            hover:shadow-xl hover:-translate-y-0.5
                            bg-white border-stone-200 shadow-stone-100/80
                            dark:bg-slate-900 dark:border-slate-700 dark:shadow-black/50
                            md:grid md:grid-cols-[1fr_1.1fr]">
          {/* Cover */}
          <div className="relative h-56 md:h-auto overflow-hidden
                          bg-stone-100 dark:bg-slate-800">
            {post.featuredImage ? (
              <>
                <img src={post.featuredImage} alt={post.title}
                  loading="eager" fetchpriority="high"
                  className={`w-full h-full object-cover transition-all duration-700
                              group-hover:scale-105
                              ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => setImgLoaded(true)} />
                {!imgLoaded && (
                  <div className="absolute inset-0 animate-pulse bg-stone-200 dark:bg-slate-700" />
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <PenLine className="w-16 h-16 opacity-10 text-stone-900 dark:text-slate-100" />
              </div>
            )}
            {/* Featured badge */}
            <div className="absolute top-3 left-3 flex items-center gap-1
                            bg-amber-400 text-stone-900 text-[10px] font-bold
                            px-2.5 py-1 rounded-lg shadow-md">
              ✦ Artikel Unggulan
            </div>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8 flex flex-col justify-center">
            {/* Categories */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {cats.slice(0, 2).map((cat, i) => {
                const a = getCatAccent(cat)
                return (
                  <span key={i}
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border
                                ${a.pill}`}>
                    {cat}
                  </span>
                )
              })}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold leading-snug mb-2
                           text-stone-900 dark:text-slate-50
                           group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              {post.title}
            </h2>
            {post.excerpt && (
              <p className="text-sm sm:text-base leading-relaxed mb-4 line-clamp-3
                            text-stone-500 dark:text-slate-400">
                {post.excerpt}
              </p>
            )}

            {/* Author & meta */}
            <div className="flex items-center gap-3 mb-3">
              {post.authorPhotoUrl ? (
                <img src={post.authorPhotoUrl} alt={post.authorName}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                                bg-amber-100 dark:bg-amber-900/30">
                  <User className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
              )}
              <div>
                <div className="text-xs font-semibold text-stone-800 dark:text-slate-200">
                  {post.authorName || 'Tim Redaksi'}
                </div>
                <div className="text-[10px] text-stone-400 dark:text-slate-500">
                  {formatDate(post.publishedAt, { day:'numeric', month:'short', year:'numeric' })}
                  {mins && ` · ${mins} mnt baca`}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-stone-400 dark:text-slate-500
                            pt-3 border-t border-stone-100 dark:border-slate-800">
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />{(post.viewCount || 0).toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5" />{(post.likeCount || 0).toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3.5 h-3.5" />{(post.commentCount || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </article>
      </Link>
    )
  }

  return (
    <Link to={`/blog/${post.slug}`} className="block group">
      <article className="h-full flex flex-col rounded-2xl overflow-hidden border transition-all duration-300
                          hover:shadow-lg hover:-translate-y-0.5
                          bg-white border-stone-200 shadow-sm shadow-stone-100/60
                          dark:bg-slate-900 dark:border-slate-700 dark:shadow-none">
        {/* Cover */}
        <div className="relative h-44 overflow-hidden flex-shrink-0
                        bg-stone-100 dark:bg-slate-800">
          {post.featuredImage ? (
            <>
              <img src={post.featuredImage} alt={post.title}
                loading="lazy" decoding="async"
                className={`w-full h-full object-cover transition-all duration-500
                            group-hover:scale-105
                            ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImgLoaded(true)} />
              {!imgLoaded && (
                <div className="absolute inset-0 animate-pulse bg-stone-200 dark:bg-slate-700" />
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <PenLine className="w-10 h-10 opacity-10 text-stone-900 dark:text-slate-100" />
            </div>
          )}
          {/* Category badge */}
          {firstCat && (
            <div className={`absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold border
                             ${accent.pill}`}>
              {firstCat}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-4 sm:p-5">
          <h3 className="font-bold leading-snug mb-2 line-clamp-2 transition-colors
                         text-stone-900 dark:text-slate-50
                         group-hover:text-amber-600 dark:group-hover:text-amber-400">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="text-sm line-clamp-2 mb-3 flex-1
                          text-stone-500 dark:text-slate-400 leading-relaxed">
              {post.excerpt}
            </p>
          )}

          {/* Author */}
          <div className="flex items-center gap-2 mb-3">
            {post.authorPhotoUrl ? (
              <img src={post.authorPhotoUrl} alt={post.authorName}
                className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0
                              bg-amber-100 dark:bg-amber-900/30 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                {(post.authorName || 'T').charAt(0)}
              </div>
            )}
            <span className="text-[11px] font-medium text-stone-600 dark:text-slate-400 truncate">
              {post.authorName || 'Tim Redaksi'}
            </span>
          </div>

          {/* Footer stats */}
          <div className="flex items-center justify-between text-[10px] pt-3 border-t
                          text-stone-400 dark:text-slate-500
                          border-stone-100 dark:border-slate-800">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(post.publishedAt, { day:'numeric', month:'short' })}
              {mins && ` · ${mins}m`}
            </span>
            <div className="flex items-center gap-2.5">
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />{(post.viewCount || 0).toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3" />{(post.likeCount || 0).toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />{(post.commentCount || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
})
BlogCard.displayName = 'BlogCard'

// ── Skeleton card ─────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="rounded-2xl overflow-hidden border animate-pulse
                  bg-white border-stone-200 dark:bg-slate-900 dark:border-slate-700">
    <div className="h-44 bg-stone-200 dark:bg-slate-700" />
    <div className="p-5 space-y-3">
      <div className="h-4 bg-stone-200 dark:bg-slate-700 rounded w-1/4" />
      <div className="h-5 bg-stone-200 dark:bg-slate-700 rounded w-3/4" />
      <div className="h-4 bg-stone-200 dark:bg-slate-700 rounded w-full" />
      <div className="h-4 bg-stone-200 dark:bg-slate-700 rounded w-5/6" />
    </div>
  </div>
)

// ─────────────────────────────────────────────────────────────────────────────
// BlogPage
// ─────────────────────────────────────────────────────────────────────────────
const BlogPage = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const pageFromUrl  = parseInt(searchParams.get('page') || '1', 10)
  const queryFromUrl = searchParams.get('q') || ''
  const catFromUrl   = searchParams.get('category') || ''
  const tagFromUrl   = searchParams.get('tag') || ''
  const sortFromUrl  = searchParams.get('sort') || 'publishedAt'
  const orderFromUrl = searchParams.get('order') || 'DESC'
  const modeFromUrl  = searchParams.get('mode') || 'latest'

  const [posts,      setPosts]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [totalPosts, setTotalPosts] = useState(0)
  const [showSort,   setShowSort]   = useState(false)
  const [searchInput, setSearchInput] = useState(queryFromUrl)
  const [categories,  setCategories]  = useState([])

  const updateParams = useCallback((updates) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      Object.entries(updates).forEach(([k, v]) => {
        if (v === null || v === undefined || v === '') next.delete(k)
        else next.set(k, String(v))
      })
      return next
    }, { replace: false })
  }, [setSearchParams])

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      let response
      const commonParams = { page: pageFromUrl, limit: 12, sortField: sortFromUrl, sortOrder: orderFromUrl }

      if (modeFromUrl === 'trending') {
        response = await api.get('/blog/trending', { params: { ...commonParams } })
      } else if (queryFromUrl) {
        response = await api.get('/blog/search', {
          params: { ...commonParams, query: queryFromUrl, category: catFromUrl, tag: tagFromUrl }
        })
      } else if (catFromUrl) {
        response = await api.get(`/blog/category/${catFromUrl}`, { params: commonParams })
      } else if (tagFromUrl) {
        response = await api.get(`/blog/tag/${tagFromUrl}`, { params: commonParams })
      } else {
        response = await api.get('/blog', {
          params: { ...commonParams, status: 'PUBLISHED' }
        })
      }

      const data = response.data?.data
      const list = data?.list || data?.data || []
      setPosts(list)
      const total = data?.total || 0
      setTotalPosts(total)
      setTotalPages(Math.ceil(total / 12) || 1)
    } catch (err) {
      console.error('Failed to fetch blog posts', err)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }, [pageFromUrl, queryFromUrl, catFromUrl, tagFromUrl, sortFromUrl, orderFromUrl, modeFromUrl])

  // Fetch categories for filter pills
  useEffect(() => {
    api.get('/blog/categories').then(r => {
      setCategories(r.data?.data || [])
    }).catch(() => {})
  }, [])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  useEffect(() => {
    sessionStorage.setItem('blogPageUrl', window.location.pathname + window.location.search)
  }, [searchParams])

  const goToPage = useCallback((page) => {
    updateParams({ page: page === 1 ? null : page })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [updateParams])

  const handleSearch = useCallback(() => {
    const q = searchInput.trim()
    updateParams({ q: q || null, page: null, mode: null })
  }, [searchInput, updateParams])

  const handleSort = useCallback((field) => {
    const newOrder = sortFromUrl === field ? (orderFromUrl === 'DESC' ? 'ASC' : 'DESC') : 'DESC'
    updateParams({ sort: field, order: newOrder, page: null })
  }, [sortFromUrl, orderFromUrl, updateParams])

  const handleMode = useCallback((mode) => {
    updateParams({ mode: mode === 'latest' ? null : mode, page: null, q: null, category: null })
  }, [updateParams])

  const handleCategory = useCallback((cat) => {
    updateParams({ category: cat === catFromUrl ? null : cat, page: null, q: null, tag: null })
  }, [catFromUrl, updateParams])

  const paginationPages = (() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const pages = new Set([1, totalPages, pageFromUrl])
    for (let i = Math.max(2, pageFromUrl - 1); i <= Math.min(totalPages - 1, pageFromUrl + 1); i++) pages.add(i)
    return [...pages].sort((a, b) => a - b)
  })()

  const featuredPost = pageFromUrl === 1 && modeFromUrl !== 'trending' && !queryFromUrl ? posts[0] : null
  const gridPosts    = featuredPost ? posts.slice(1) : posts

  const pageTitle = queryFromUrl
    ? `"${queryFromUrl}" — Blog`
    : catFromUrl
    ? `Kategori: ${catFromUrl} — Blog`
    : modeFromUrl === 'trending'
    ? 'Artikel Trending — Blog'
    : `Blog & Artikel — Halaman ${pageFromUrl}`

  const pageDescription = queryFromUrl
    ? `Hasil pencarian "${queryFromUrl}" di blog Perpustakaan Digital MasasilaM`
    : `Jelajahi ${totalPosts.toLocaleString('id-ID')} artikel tentang buku, film, budaya, dan literasi. Halaman ${pageFromUrl} dari ${totalPages}.`

  return (
    <>
      <SEO
        title={pageTitle}
        description={pageDescription}
        url={pageFromUrl > 1 ? `/blog?page=${pageFromUrl}` : '/blog'}
        type="website"
        keywords="blog, artikel, buku, film, budaya, literasi, ulasan"
        prevUrl={pageFromUrl > 1 ? (pageFromUrl === 2 ? '/blog' : `/blog?page=${pageFromUrl - 1}`) : null}
        nextUrl={pageFromUrl < totalPages ? `/blog?page=${pageFromUrl + 1}` : null}
      />

      {/*
        ══════════════════════════════════════════════════════════════
        LIGHT: stone-50 background, white surfaces, amber accent
        DARK:  slate-950 background, slate-900 surfaces, amber accent
        ══════════════════════════════════════════════════════════════
      */}
      <div className="min-h-screen py-4 sm:py-8 transition-colors duration-300
                      bg-stone-50 dark:bg-slate-950">
        <div className="container mx-auto px-3 sm:px-4 max-w-7xl">

          {/* Back button */}
          <button onClick={() => navigate('/')}
            className="flex items-center gap-2 mb-4 sm:mb-6 group transition-colors text-sm font-medium
                       text-stone-500 hover:text-stone-900
                       dark:text-slate-500 dark:hover:text-slate-100">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Kembali ke Beranda
          </button>

          {/* ── Page header ────────────────────────────────────────── */}
          <header className="mb-6 sm:mb-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1.5">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold transition-colors
                                 text-stone-900 dark:text-slate-50">
                    Blog &amp; Artikel
                  </h1>
                </div>
                <p className="text-sm sm:text-base transition-colors
                              text-stone-500 dark:text-slate-400">
                  {loading ? 'Memuat artikel…' : (
                    <>
                      <span className="font-semibold text-stone-800 dark:text-slate-200">
                        {totalPosts.toLocaleString('id-ID')}
                      </span>{' '}artikel tersedia
                    </>
                  )}
                </p>
              </div>

              {/* Page indicator */}
              {totalPages > 1 && (
                <div className="hidden sm:flex flex-col items-end px-4 py-2.5 rounded-xl border flex-shrink-0 transition-colors
                                bg-white border-stone-200 shadow-sm
                                dark:bg-slate-900 dark:border-slate-700 dark:shadow-none">
                  <span className="text-[10px] uppercase tracking-widest font-medium
                                   text-stone-400 dark:text-slate-500">Halaman</span>
                  <span className="text-xl font-bold text-stone-800 dark:text-slate-200">
                    {pageFromUrl}
                    <span className="text-sm font-normal text-stone-400 dark:text-slate-500"> / {totalPages}</span>
                  </span>
                </div>
              )}
            </div>
          </header>

          {/* ── Search & controls ───────────────────────────────────── */}
          <div className="mb-4 space-y-3">
            <div className="flex items-stretch gap-2 h-10">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none
                                   text-stone-400 dark:text-slate-500" />
                <input type="text" placeholder="Cari judul, topik, penulis…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="h-full w-full pl-10 pr-8 text-sm rounded-xl transition-all focus:outline-none
                             border border-stone-200 bg-white text-stone-900 placeholder-stone-400
                             shadow-sm focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400
                             dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500
                             dark:shadow-none dark:focus:ring-amber-500/40 dark:focus:border-amber-500/60"
                />
                {searchInput && (
                  <button onClick={() => { setSearchInput(''); updateParams({ q: null, page: null }) }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 transition-colors
                               text-stone-400 hover:text-stone-700
                               dark:text-slate-500 dark:hover:text-slate-300">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Cari */}
              <button onClick={handleSearch}
                className="flex-shrink-0 flex items-center gap-1.5 px-4 rounded-xl text-sm font-semibold
                           transition-all bg-amber-500 hover:bg-amber-400 text-white
                           shadow-sm shadow-amber-200/80 hover:shadow-md
                           dark:shadow-amber-900/30">
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Cari</span>
              </button>

              {/* Mode: Terbaru / Trending */}
              <button
                onClick={() => handleMode(modeFromUrl === 'trending' ? 'latest' : 'trending')}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 rounded-xl text-sm font-medium border transition-all
                            ${modeFromUrl === 'trending'
                              ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-200/80 dark:shadow-amber-900/40'
                              : `bg-white border-stone-200 text-stone-600 hover:border-amber-300 hover:text-amber-700 shadow-sm
                                 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:border-amber-600 dark:hover:text-amber-400 dark:shadow-none`
                            }`}>
                <Flame className="w-4 h-4" />
                <span className="hidden sm:inline">Trending</span>
              </button>

              {/* Urutkan */}
              <button onClick={() => setShowSort(!showSort)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 rounded-xl text-sm font-medium border transition-all
                            ${showSort
                              ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-200/80 dark:shadow-amber-900/40'
                              : `bg-white border-stone-200 text-stone-600 hover:border-amber-300 hover:text-amber-700 shadow-sm
                                 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:border-amber-600 dark:hover:text-amber-400 dark:shadow-none`
                            }`}>
                <ArrowUpDown className="w-4 h-4" />
                <span className="hidden sm:inline">Urutkan</span>
              </button>
            </div>

            {/* Sort panel */}
            {showSort && (
              <div className="rounded-2xl p-4 border shadow-lg transition-colors
                              bg-white border-stone-200 shadow-stone-100/80
                              dark:bg-slate-900 dark:border-slate-700 dark:shadow-black/50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2
                                 text-stone-600 dark:text-slate-400">
                    <ArrowUpDown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    Urutkan berdasarkan
                  </h3>
                  <button onClick={() => setShowSort(false)}
                    className="p-1 rounded-lg transition-all
                               text-stone-400 hover:text-stone-700 hover:bg-stone-100
                               dark:text-slate-500 dark:hover:text-slate-200 dark:hover:bg-slate-800">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SORTS.map(o => (
                    <SortBtn key={o.v} opt={o} active={sortFromUrl === o.v}
                      order={orderFromUrl} loading={loading} onClick={() => handleSort(o.v)} />
                  ))}
                </div>
              </div>
            )}

            {/* Category filter pills */}
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs text-stone-400 dark:text-slate-500 flex-shrink-0">Kategori:</span>
                {categories.map((cat) => {
                  const name   = typeof cat === 'string' ? cat : cat.name || cat.slug
                  const active = catFromUrl === name
                  const a      = getCatAccent(name)
                  return (
                    <button key={name} onClick={() => handleCategory(name)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all
                                  ${active ? a.active : a.pill}`}>
                      <Tag className="w-2.5 h-2.5" />
                      {name}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Active filters display */}
            {(queryFromUrl || catFromUrl || tagFromUrl) && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs text-stone-400 dark:text-slate-500">Filter aktif:</span>
                {queryFromUrl && (
                  <span className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full text-xs font-medium
                                   bg-amber-100 border border-amber-300 text-amber-800
                                   dark:bg-amber-900/20 dark:border-amber-700/50 dark:text-amber-300">
                    Pencarian: {queryFromUrl}
                    <button onClick={() => { setSearchInput(''); updateParams({ q: null, page: null }) }}
                      className="w-3.5 h-3.5 rounded-full flex items-center justify-center hover:bg-amber-200 dark:hover:bg-amber-800/60">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                )}
                {catFromUrl && (
                  <span className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full text-xs font-medium
                                   bg-amber-100 border border-amber-300 text-amber-800
                                   dark:bg-amber-900/20 dark:border-amber-700/50 dark:text-amber-300">
                    Kategori: {catFromUrl}
                    <button onClick={() => updateParams({ category: null, page: null })}
                      className="w-3.5 h-3.5 rounded-full flex items-center justify-center hover:bg-amber-200 dark:hover:bg-amber-800/60">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                )}
                {tagFromUrl && (
                  <span className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full text-xs font-medium
                                   bg-amber-100 border border-amber-300 text-amber-800
                                   dark:bg-amber-900/20 dark:border-amber-700/50 dark:text-amber-300">
                    Tag: {tagFromUrl}
                    <button onClick={() => updateParams({ tag: null, page: null })}
                      className="w-3.5 h-3.5 rounded-full flex items-center justify-center hover:bg-amber-200 dark:hover:bg-amber-800/60">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* ── Results info row ─────────────────────────────────────── */}
          {!loading && posts.length > 0 && (
            <div className="flex items-center justify-between mb-4 text-sm">
              <span className="text-stone-500 dark:text-slate-500">
                Menampilkan{' '}
                <span className="font-semibold text-stone-800 dark:text-slate-200">
                  {((pageFromUrl - 1) * 12) + 1}–{Math.min(pageFromUrl * 12, totalPosts)}
                </span>
                {' '}dari{' '}
                <span className="font-semibold text-stone-800 dark:text-slate-200">
                  {totalPosts.toLocaleString('id-ID')}
                </span>{' '}artikel
              </span>
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors
                               bg-stone-100 text-stone-500
                               dark:bg-slate-900 dark:border dark:border-slate-700/60 dark:text-slate-500">
                {modeFromUrl === 'trending'
                  ? <><Flame className="w-3 h-3 text-amber-500" /> Trending</>
                  : <>{SORTS.find(s => s.v === sortFromUrl)?.l || sortFromUrl}{orderFromUrl === 'DESC' ? ' ↓' : ' ↑'}</>
                }
              </span>
            </div>
          )}

          {/* ── Content ──────────────────────────────────────────────── */}
          {loading ? (
            <div className="space-y-6">
              {/* Featured skeleton */}
              {pageFromUrl === 1 && modeFromUrl !== 'trending' && !queryFromUrl && (
                <div className="rounded-2xl overflow-hidden border animate-pulse
                                bg-white border-stone-200 dark:bg-slate-900 dark:border-slate-700
                                md:grid md:grid-cols-[1fr_1.1fr]">
                  <div className="h-56 md:h-64 bg-stone-200 dark:bg-slate-700" />
                  <div className="p-8 space-y-4">
                    <div className="h-3 bg-stone-200 dark:bg-slate-700 rounded w-1/4" />
                    <div className="h-6 bg-stone-200 dark:bg-slate-700 rounded w-3/4" />
                    <div className="h-4 bg-stone-200 dark:bg-slate-700 rounded w-full" />
                    <div className="h-4 bg-stone-200 dark:bg-slate-700 rounded w-5/6" />
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {Array.from({ length: featuredPost ? 11 : 12 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <PenLine className="w-16 h-16 mb-4 text-stone-200 dark:text-slate-700" />
              <p className="text-lg font-semibold mb-1 text-stone-700 dark:text-slate-300">
                Belum ada artikel
              </p>
              <p className="text-sm mb-6 text-stone-400 dark:text-slate-500">
                {queryFromUrl ? `Tidak ada hasil untuk "${queryFromUrl}"` : 'Coba kata kunci atau kategori lain'}
              </p>
              <button onClick={() => { setSearchInput(''); updateParams({ q: null, category: null, tag: null, mode: null, page: null }) }}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all
                           bg-amber-500 hover:bg-amber-400 text-white shadow-sm">
                Lihat Semua Artikel
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Featured post */}
              {featuredPost && <BlogCard post={featuredPost} featured />}

              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {gridPosts.map(post => <BlogCard key={post.id} post={post} />)}
              </div>
            </div>
          )}

          {/* ── Pagination ────────────────────────────────────────────── */}
          {totalPages > 1 && !loading && (
            <nav className="mt-10 flex flex-row flex-wrap items-center justify-center gap-2"
              aria-label="Navigasi halaman">

              <button onClick={() => goToPage(pageFromUrl - 1)} disabled={pageFromUrl === 1}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium
                           border transition-all disabled:opacity-40 disabled:pointer-events-none
                           bg-white border-stone-200 text-stone-600 shadow-sm
                           hover:border-amber-400 hover:text-amber-600
                           dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400 dark:shadow-none
                           dark:hover:border-amber-500/70 dark:hover:text-amber-400">
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Sebelumnya</span>
              </button>

              <div className="hidden sm:flex items-center gap-1">
                {paginationPages.map((p, i) => {
                  const prev = paginationPages[i - 1]
                  const showEllipsis = prev && p - prev > 1
                  return (
                    <span key={p} className="flex items-center gap-1">
                      {showEllipsis && (
                        <span className="w-6 text-center text-sm text-stone-300 dark:text-slate-600">…</span>
                      )}
                      <button onClick={() => goToPage(p)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-all
                          ${p === pageFromUrl
                            ? 'bg-amber-500 text-white shadow-md shadow-amber-200/80 dark:shadow-amber-900/50'
                            : `bg-white border border-stone-200 text-stone-600
                               hover:border-amber-400 hover:text-amber-600
                               dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400
                               dark:hover:border-amber-500/70 dark:hover:text-amber-400`
                          }`}>
                        {p}
                      </button>
                    </span>
                  )
                })}
              </div>

              <PageInput currentPage={pageFromUrl} totalPages={totalPages}
                onGo={goToPage} disabled={loading} />

              <button onClick={() => goToPage(pageFromUrl + 1)} disabled={pageFromUrl === totalPages}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium
                           border transition-all disabled:opacity-40 disabled:pointer-events-none
                           bg-white border-stone-200 text-stone-600 shadow-sm
                           hover:border-amber-400 hover:text-amber-600
                           dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400 dark:shadow-none
                           dark:hover:border-amber-500/70 dark:hover:text-amber-400">
                <span className="hidden sm:inline">Berikutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </nav>
          )}

        </div>
      </div>
    </>
  )
}

export default BlogPage
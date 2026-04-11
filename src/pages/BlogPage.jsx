// src/pages/BlogPage.jsx
import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, TrendingUp, Clock, Eye, Heart, MessageCircle, ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import api from '../services/api'

const BlogPage = () => {
  const [searchParams] = useSearchParams()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || '')
  const [activeTag, setActiveTag] = useState(searchParams.get('tag') || '')
  const [viewMode, setViewMode] = useState('latest')

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      let response
      if (viewMode === 'trending') {
        response = await api.get('/blog/trending', { params: { page, limit: 9 } })
      } else if (searchQuery) {
        response = await api.get('/blog/search', {
          params: { query: searchQuery, page, limit: 9, category: activeCategory, tag: activeTag }
        })
      } else if (activeCategory) {
        response = await api.get(`/blog/category/${activeCategory}`, { params: { page, limit: 9 } })
      } else if (activeTag) {
        response = await api.get(`/blog/tag/${activeTag}`, { params: { page, limit: 9 } })
      } else {
        response = await api.get('/blog', {
          params: { page, limit: 9, status: 'PUBLISHED', category: activeCategory, tag: activeTag }
        })
      }
      const data = response.data?.data
      setPosts(data?.list || data?.data || [])
      if (data?.total && data?.limit) {
        setTotalPages(Math.ceil(data.total / data.limit))
      }
    } catch (err) {
      console.error('Failed to fetch blog posts', err)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }, [page, searchQuery, activeCategory, activeTag, viewMode])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    setActiveCategory('')
    setActiveTag('')
    setViewMode('latest')
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const featuredPost = posts[0]
  const gridPosts = posts.slice(1)

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">

        {/* Hero Banner */}
        <div className="text-center mb-10">
          <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold uppercase tracking-widest rounded-full mb-4">
            Blog & Artikel
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
            Cerita & Ulasan{' '}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto mb-8">
            Jelajahi artikel tentang buku, film, budaya, dan dunia literasi.
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2 max-w-lg mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari artikel..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium text-sm transition-colors"
            >
              Cari
            </button>
          </form>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => { setViewMode('latest'); setPage(1); setActiveCategory(''); setActiveTag('') }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              viewMode === 'latest' && !activeCategory && !activeTag
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-700 hover:border-primary'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Terbaru
          </button>
          <button
            onClick={() => { setViewMode('trending'); setPage(1) }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              viewMode === 'trending'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-700 hover:border-primary'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Trending
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md animate-pulse">
                <div className="h-48 bg-gray-200 dark:bg-gray-700" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-gray-500 dark:text-gray-400">
            <div className="text-5xl mb-4">📝</div>
            <p className="text-lg font-medium">Belum ada artikel</p>
            <p className="text-sm mt-1">Coba kata kunci lain atau lihat semua artikel</p>
          </div>
        ) : (
          <>
            {/* Featured Post */}
            {featuredPost && page === 1 && viewMode === 'latest' && !searchQuery && !activeCategory && !activeTag && (
              <Link to={`/blog/${featuredPost.slug}`} className="block mb-8 group">
                <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-shadow md:flex">
                  <div className="md:w-1/2 h-64 md:h-auto bg-primary/5 dark:bg-primary/10 overflow-hidden">
                    {featuredPost.featuredImage ? (
                      <img src={featuredPost.featuredImage} alt={featuredPost.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-7xl opacity-30">📖</div>
                    )}
                  </div>
                  <div className="md:w-1/2 p-8 flex flex-col justify-center">
                    <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded mb-3">
                      ⭐ Artikel Unggulan
                    </span>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary transition-colors leading-snug">
                      {featuredPost.title}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                      {featuredPost.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {featuredPost.viewCount || 0}</span>
                      <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {featuredPost.likeCount || 0}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {formatDate(featuredPost.publishedAt)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Grid Posts */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(page === 1 && viewMode === 'latest' && !searchQuery ? gridPosts : posts).map((post) => (
                <BlogCard key={post.id} post={post} formatDate={formatDate} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="flex justify-center items-center gap-2 mt-10" aria-label="Pagination">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {[...Array(Math.min(totalPages, 5))].map((_, i) => (
                  <button key={i + 1} onClick={() => setPage(i + 1)} className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${page === i + 1 ? 'bg-primary text-white' : 'border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                    {i + 1}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  )
}

const BlogCard = ({ post, formatDate }) => (
  <Link to={`/blog/${post.slug}`} className="group block">
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 h-full flex flex-col shadow-md">
      <div className="h-44 bg-primary/5 dark:bg-gray-700 overflow-hidden flex-shrink-0">
        {post.featuredImage ? (
          <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">📝</div>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        {post.categories && (
          <span className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">
            {post.categories.split(',')[0].trim()}
          </span>
        )}
        <h3 className="font-bold text-gray-900 dark:text-white mb-2 leading-snug group-hover:text-primary transition-colors line-clamp-2">
          {post.title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-1">
          {post.excerpt}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-700">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(post.publishedAt)}</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {post.viewCount || 0}</span>
            <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {post.likeCount || 0}</span>
            <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {post.commentCount || 0}</span>
          </div>
        </div>
      </div>
    </div>
  </Link>
)

export default BlogPage
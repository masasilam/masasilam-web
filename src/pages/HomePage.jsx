// src/pages/HomePage.jsx - OPTIMIZED

import { useState, useEffect, memo, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, ArrowRight, ChevronLeft, ChevronRight, Film, Newspaper } from 'lucide-react'
import bookService from '../services/bookService'
import { filmService } from '../services/filmService'
import api from '../services/api'
import Button from '../components/Common/Button'
import SEO from '../components/Common/SEO'
import {
  generateWebsiteStructuredData,
  generateOrganizationStructuredData,
  combineStructuredData
} from '../utils/seoHelpers'

// ── Wikimedia thumbnail helper ────────────────────────────────────────────────
const getThumb = (url, w = 200) => {
  if (!url) return null
  const m = url.match(/^(https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/)([a-f0-9]\/[a-f0-9]{2}\/)(.+)$/)
  if (!m) return url
  const [, base, hash, filename] = m
  const isSvg = filename.toLowerCase().endsWith('.svg')
  const thumbName = isSvg ? `${filename}.png` : filename
  return `${base}thumb/${hash}${filename}/${w}px-${thumbName}`
}

// ── BookCard ──────────────────────────────────────────────────────────────────
const BookCard = memo(({ book }) => {
  const [loaded, setLoaded] = useState(false)
  const thumbUrl = getThumb(book.cover_image, 200)
  return (
    <Link to={`/buku/${book.slug || book.id}`} className="group flex-shrink-0 w-32 sm:w-40 lg:w-48">
      <div className="relative aspect-[2/3] bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 overflow-hidden mb-2 sm:mb-3 hover:shadow-2xl hover:border-primary transition-all duration-300 rounded-lg">
        {!loaded && thumbUrl && <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700" />}
        {thumbUrl ? (
          <img src={thumbUrl} alt={book.title} loading="lazy" decoding="async"
            onLoad={() => setLoaded(true)}
            className={`w-full h-full object-cover group-hover:scale-110 transition-all duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`} />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-2 sm:p-3">
            <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          </div>
        )}
      </div>
      <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 mb-0.5 group-hover:text-primary transition-colors">{book.title}</h3>
      <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 line-clamp-1">{book.authorNames || book.author || 'Anonim'}</p>
    </Link>
  )
})
BookCard.displayName = 'BookCard'

// ── FilmCard ──────────────────────────────────────────────────────────────────
const FilmCard = memo(({ film }) => {
  const [loaded, setLoaded] = useState(false)
  const thumbUrl = getThumb(film.posterUrl, 200)
  return (
    <Link to={`/film/${film.slug || film.id}`} className="group flex-shrink-0 w-32 sm:w-40 lg:w-48">
      <div className="relative aspect-[2/3] bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 overflow-hidden mb-2 hover:shadow-2xl hover:border-primary transition-all duration-300 rounded-lg">
        {!loaded && thumbUrl && <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700" />}
        {thumbUrl ? (
          <img src={thumbUrl} alt={film.judul} loading="lazy" decoding="async"
            onLoad={() => setLoaded(true)}
            className={`w-full h-full object-cover group-hover:scale-110 transition-all duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`} />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-2">
            <Film className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          </div>
        )}
      </div>
      <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 mb-0.5 group-hover:text-primary transition-colors">{film.judul}</h3>
      <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
        {film.tahunRilis ? new Date(film.tahunRilis).getFullYear() : 'Tahun tidak diketahui'}
      </p>
    </Link>
  )
})
FilmCard.displayName = 'FilmCard'

// ── NewspaperCard — artikel koran ─────────────────────────────────────────────
const NewspaperCard = memo(({ article }) => {
  // ✅ FIX: source adalah object { id, name, ... }, bukan string langsung
  const sourceName = article.sourceName || article.source?.name || null

  return (
    <Link
      to={`/koran/${article.category}/${article.publishDate}/${article.slug}`}
      className="group flex-shrink-0 w-56 sm:w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-primary hover:shadow-md transition-all">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-semibold text-primary uppercase tracking-wide">
          {article.categoryName || article.category}
        </span>
        <span className="text-gray-300 dark:text-gray-600">·</span>
        <span className="text-xs text-gray-400">{article.dateFormatted || article.publishDate}</span>
      </div>
      <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-3 group-hover:text-primary transition-colors mb-2"
          style={{ fontFamily: 'Georgia, serif' }}>
        {article.title}
      </h3>
      {sourceName && (
        <p className="text-xs text-gray-400 flex items-center gap-1">
          <Newspaper className="w-3 h-3" />{sourceName}
        </p>
      )}
    </Link>
  )
})
NewspaperCard.displayName = 'NewspaperCard'

// ── Skeleton card ─────────────────────────────────────────────────────────────
const SkeletonCard = memo(() => (
  <div className="flex-shrink-0 w-32 sm:w-40 lg:w-48 animate-pulse">
    <div className="aspect-[2/3] bg-gray-200 dark:bg-gray-700 rounded-lg mb-2 sm:mb-3" />
    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1" />
    <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
  </div>
))
SkeletonCard.displayName = 'SkeletonCard'

const SkeletonNewspaperCard = memo(() => (
  <div className="flex-shrink-0 w-56 sm:w-64 animate-pulse bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3" />
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
  </div>
))
SkeletonNewspaperCard.displayName = 'SkeletonNewspaperCard'

// ── Scroll section ────────────────────────────────────────────────────────────
const ScrollSection = memo(({ items, title, actionText, actionPath, renderItem, loading = false }) => {
  const scrollRef = useRef(null)
  const scroll = useCallback((d) =>
    scrollRef.current?.scrollBy({ left: d === 'left' ? -400 : 400, behavior: 'smooth' }), [])

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-6 sm:mb-8 gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-4xl font-light text-gray-900 dark:text-white mb-1">{title}</h2>
          <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-base">{actionText}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <a href={actionPath}
            className="inline-flex items-center justify-center whitespace-nowrap text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors">
            Lihat Semua
          </a>
          <div className="hidden lg:flex gap-2">
            <button onClick={() => scroll('left')} className="p-2 bg-white dark:bg-gray-700 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-primary hover:shadow-lg transition-all" aria-label="Scroll left">
              <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            <button onClick={() => scroll('right')} className="p-2 bg-white dark:bg-gray-700 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-primary hover:shadow-lg transition-all" aria-label="Scroll right">
              <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        </div>
      </div>
      <div ref={scrollRef} className="flex gap-4 sm:gap-6 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {loading
          ? Array.from({ length: 8 }, (_, i) => <SkeletonCard key={i} />)
          : items.map((item, i) => renderItem(item, i))
        }
      </div>
    </div>
  )
})
ScrollSection.displayName = 'ScrollSection'

// ── Helper: ambil artikel dari tiap kategori yang ada ────────────────────────
// Dipakai sebagai fallback saat /trending kosong atau error
const fetchArticlesFromCategories = async (limit = 10) => {
  // 1. Ambil daftar kategori yang punya artikel
  const catRes = await api.get('/newspapers/categories')
  const categories = (catRes.data?.data || []).filter(c => (c.articleCount || 0) > 0)
  if (categories.length === 0) return []

  // 2. Tentukan berapa artikel per kategori
  const perCat = Math.max(1, Math.ceil(limit / categories.length))

  // 3. Fetch paralel dari tiap kategori
  const results = await Promise.allSettled(
    categories.map(cat =>
      api.get(`/newspapers/categories/${cat.slug}`, {
        params: { page: 1, limit: perCat, sortBy: 'date', sortOrder: 'DESC' }
      })
    )
  )

  // 4. Gabungkan & potong sesuai limit
  return results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => r.value.data?.data?.list || r.value.data?.data || [])
    .slice(0, limit)
}

// ── Halaman utama ─────────────────────────────────────────────────────────────
const HomePage = () => {
  const [books,     setBooks]     = useState({ popular: [], new: [] })
  const [films,     setFilms]     = useState({ popular: [] })
  const [newspaper, setNewspaper] = useState({ trending: [] })
  const [stats,     setStats]     = useState({ totalBooks: 0, totalGenres: 0, totalAuthors: 0 })

  const [loadingBooks,     setLoadingBooks]     = useState(true)
  const [loadingFilms,     setLoadingFilms]     = useState(true)
  const [loadingNewspaper, setLoadingNewspaper] = useState(true)
  const [loadingStats,     setLoadingStats]     = useState(true)

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const [pop, nw] = await Promise.all([
          bookService.getBooks({ page: 1, limit: 12, sortField: 'viewCount',  sortOrder: 'DESC' }),
          bookService.getBooks({ page: 1, limit: 12, sortField: 'updateAt',   sortOrder: 'DESC' }),
        ])
        const map = (r) => (r.data?.list || r.data?.data || []).map(b => ({
          ...b, cover_image: b.coverImageUrl || b.cover_image || b.coverImage || b.image
        }))
        setBooks({ popular: map(pop), new: map(nw) })
      } catch (err) { console.error('Error fetching books:', err) }
        finally     { setLoadingBooks(false) }
    }

    const fetchFilms = async () => {
      try {
        const res = await filmService.getFilms({ page: 0, size: 12 })
        setFilms({ popular: res.data?.data || [] })
      } catch (err) { console.error('Error fetching films:', err) }
        finally     { setLoadingFilms(false) }
    }

    // ✅ FIX: trending → fallback ke /newspapers/categories/{slug}
    const fetchNewspaper = async () => {
      try {
        // 1. Coba trending dulu
        const res = await api.get('/newspapers/trending', { params: { days: 30, limit: 10 } })
        let trending = res.data?.data || []

        // 2. Jika trending kosong (belum cukup data view), fallback ke per-kategori
        if (trending.length === 0) {
          trending = await fetchArticlesFromCategories(10)
        }

        setNewspaper({ trending })
      } catch {
        // 3. Jika trending endpoint sendiri error, langsung ke per-kategori
        try {
          const trending = await fetchArticlesFromCategories(10)
          setNewspaper({ trending })
        } catch (err2) {
          console.error('Error fetching newspaper:', err2)
        }
      } finally {
        setLoadingNewspaper(false)
      }
    }

    const fetchStats = async () => {
      try {
        const [genres, allBooks, authors] = await Promise.all([
          bookService.getGenres(true),
          bookService.getBooks({ page: 1, limit: 1 }),
          bookService.getAuthors(1, 1),
        ])
        const genresWithBooks = (genres.data || []).filter(g => (g.bookCount || 0) >= 1)
        setStats({
          totalBooks:   allBooks.data?.total || 0,
          totalGenres:  genresWithBooks.length,
          totalAuthors: authors.data?.total || 0,
        })
      } catch (err) { console.error('Error fetching stats:', err) }
        finally     { setLoadingStats(false) }
    }

    fetchBooks()
    fetchFilms()
    fetchNewspaper()
    fetchStats()
  }, [])

  const displayStats = [
    { num: stats.totalBooks.toLocaleString('id-ID'),  label: 'Buku Tersedia',     link: '/buku'     },
    { num: stats.totalGenres.toString(),               label: 'Genre Berbeda',      link: '/kategori' },
    { num: stats.totalAuthors.toLocaleString('id-ID'), label: 'Penulis',            link: '/penulis'  },
    { num: '∞',                                        label: 'Gratis Tanpa Batas', link: null        },
  ]

  const websiteSchema      = generateWebsiteStructuredData()
  const organizationSchema = generateOrganizationStructuredData()
  const structuredData     = combineStructuredData(websiteSchema, organizationSchema)

  return (
    <>
      <SEO
        title="MasasilaM - Perpustakaan Digital Buku Domain Publik"
        description="Perpustakaan digital gratis untuk buku klasik domain publik. Akses buku-buku dengan fitur smart reading, bookmark, dan highlight."
        url="/"
        type="website"
        keywords="buku gratis, domain publik, perpustakaan digital, buku klasik indonesia, literasi digital, baca buku online gratis, sastra klasik, perpustakaan online"
        structuredData={structuredData}
        image="/og-image.jpg"
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

        {/* ── Header masthead ─────────────────────────────────────────── */}
        <header className="bg-white dark:bg-gray-800 border-b-2 border-primary shadow-sm">
          <div className="max-w-[240px] sm:max-w-2xl lg:max-w-4xl mx-auto px-3 sm:px-6 pt-4 pb-3 sm:py-8">
            <div className="text-center">
              <div className="text-[9px] tracking-[0.2em] text-primary mb-2 sm:mb-4 uppercase font-medium">Perpustakaan Digital</div>
              <h1 className="font-serif text-xl sm:text-6xl lg:text-8xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-2" style={{ letterSpacing: '0.08em' }}>MASASILAM</h1>
              <p className="text-[7px] sm:text-xs tracking-[0.2em] text-gray-600 dark:text-gray-400 uppercase mb-0.5">Domain Publik • Literatur Klasik</p>
            </div>
          </div>
        </header>

        {/* ── Hero + Koleksi Pilihan ───────────────────────────────────── */}
        <section className="bg-white dark:bg-gray-800 py-8 sm:py-12 lg:py-16">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">
              <div className="hidden lg:block lg:col-span-7 lg:order-2">
                <article className="relative bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-800 dark:to-gray-700 rounded-sm shadow-2xl border-2 border-amber-200 dark:border-amber-700 flex items-center justify-center">
                  <div className="p-12 w-full">
                    <div className="bg-white/90 dark:bg-gray-900/90 p-10 rounded-xl border-l-4 border-primary shadow-2xl backdrop-blur-sm">
                      <header className="text-center mb-6">
                        <h2 className="font-serif text-3xl font-bold text-gray-900 dark:text-white mb-2">Catetan Th. 1946</h2>
                        <p className="text-base text-gray-600 dark:text-gray-400">oleh <span className="font-semibold">Chairil Anwar</span></p>
                      </header>
                      <div className="font-serif text-lg leading-relaxed text-gray-800 dark:text-gray-200 space-y-5">
                        <p>Ada tanganku, sekali akan jemu terkulai,<br/>Mainan cahaya di air hilang bentuk dalam kabut,<br/>Dan suara yang kucintai 'kan berhenti membelai.<br/>Kupahat batu nisan sendiri dan kupagut.</p>
                        <p>Kita—anjing diburu—hanya melihat sebagian dari sandiwara sekarang<br/>Tidak tahu Romeo &amp; Juliet berpeluk di kubur atau di ranjang<br/>Lahir seorang besar dan tenggelam beratus ribu<br/>Keduanya harus dicatet, keduanya dapat tempat.</p>
                        <p>Dan kita nanti tiada sawan lagi diburu<br/>Jika bedil sudah disimpan, cuma kenangan berdebu;<br/>Kita memburu arti atau diserahkan kepada anak lahir sempat</p>
                        <p>Karena itu jangan mengerdip, tatap dan penamu asah,<br/>Tulis karena kertas gersang; tenggorokan kering sedikit mau basah!</p>
                      </div>
                    </div>
                  </div>
                </article>
              </div>

              <aside className="lg:col-span-5 lg:order-1">
                {/* Desktop */}
                <div className="hidden lg:block">
                  <h2 className="font-serif text-3xl sm:text-5xl font-light mb-2 text-gray-900 dark:text-white">Koleksi Pilihan</h2>
                  <p className="font-serif text-lg sm:text-2xl text-gray-700 dark:text-gray-300 mb-6">Karya Terpopuler Domain Publik</p>
                  <nav className="grid grid-cols-4 gap-2 sm:gap-3 mb-6" aria-label="Koleksi buku populer">
                    {loadingBooks
                      ? Array.from({ length: 12 }, (_, i) => <div key={i} className="aspect-[2/3] bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />)
                      : books.popular.slice(0, 12).map((b, i) => (
                          <Link key={b.id || i} to={`/buku/${b.slug || b.id}`} className="group">
                            <div className="relative aspect-[2/3] bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 overflow-hidden hover:shadow-2xl hover:border-primary transition-all rounded-lg">
                              {b.cover_image ? (
                                <img src={getThumb(b.cover_image, 150)} alt={b.title} loading="lazy" decoding="async"
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center p-2">
                                  <BookOpen className="w-4 h-4 text-primary mb-1" />
                                  <div className="text-[7px] text-center text-gray-700 dark:text-gray-300 line-clamp-3">{b.title}</div>
                                </div>
                              )}
                            </div>
                          </Link>
                        ))
                    }
                  </nav>
                  <Button onClick={() => window.location.href = '/buku/terpopuler'} className="w-full sm:w-auto inline-flex items-center justify-center">
                    Lihat Semua Koleksi Pilihan <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
                {/* Mobile */}
                <div className="block lg:hidden">
                  <ScrollSection
                    items={books.popular}
                    title="Koleksi Pilihan"
                    actionText="Karya Terpopuler Domain Publik"
                    actionPath="/buku/terpopuler"
                    loading={loadingBooks}
                    renderItem={(b, i) => <BookCard key={b.id || i} book={b} />}
                  />
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* ── Stats ───────────────────────────────────────────────────── */}
        <section className="hidden lg:block bg-gray-100 dark:bg-gray-900 border-y-2 border-primary py-8 sm:py-10" aria-label="Statistik perpustakaan">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 text-center">
              {displayStats.map((s, i) => {
                const content = loadingStats ? (
                  <>
                    <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto mb-2" />
                    <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto" />
                  </>
                ) : (
                  <>
                    <div className="text-3xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-primary transition-colors">{s.num}</div>
                    <div className="text-[10px] sm:text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wider font-semibold">{s.label}</div>
                  </>
                )
                return s.link ? (
                  <a key={i} href={s.link} className="group hover:scale-105 transition-transform cursor-pointer">{content}</a>
                ) : (
                  <div key={i} className="group hover:scale-105 transition-transform">{content}</div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── Buku Terbaru ────────────────────────────────────────────── */}
        <section className="bg-white dark:bg-gray-800 py-4 sm:py-8 lg:py-16">
          <div className="container mx-auto px-4 sm:px-6">
            <ScrollSection
              items={books.new}
              title="Buku Terbaru"
              actionText="Karya yang baru ditambahkan minggu ini"
              actionPath="/buku/terbaru"
              loading={loadingBooks}
              renderItem={(b, i) => <BookCard key={b.id || i} book={b} />}
            />
            <div className="mt-6 text-center hidden lg:block">
              <Button onClick={() => window.location.href = '/buku/terbaru'} className="w-full sm:w-auto inline-flex items-center justify-center">
                Lihat Semua Buku Terbaru <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>

        {/* ── Film Klasik ─────────────────────────────────────────────── */}
        <section className="bg-gray-50 dark:bg-gray-900 border-t-2 border-primary py-4 sm:py-8 lg:py-16">
          <div className="container mx-auto px-4 sm:px-6">
            <ScrollSection
              items={films.popular}
              title="Film Klasik"
              actionText="Koleksi Film Domain Publik"
              actionPath="/film"
              loading={loadingFilms}
              renderItem={(f, i) => <FilmCard key={f.id || i} film={f} />}
            />
            <div className="mt-6 text-center hidden lg:block">
              <Button onClick={() => window.location.href = '/film'} className="w-full sm:w-auto inline-flex items-center justify-center">
                Lihat Semua Film <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>

        {/* ── Arsip Koran ─────────────────────────────────────────────── */}
        <section className="bg-white dark:bg-gray-800 border-t-2 border-primary py-4 sm:py-8 lg:py-16">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-6 sm:mb-8 gap-4">
              <div>
                <h2 className="font-serif text-2xl sm:text-4xl font-light text-gray-900 dark:text-white mb-1 flex items-center gap-3">
                  <Newspaper className="w-7 h-7 sm:w-10 sm:h-10 text-primary flex-shrink-0" />
                  Arsip Koran
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-base">Berita bersejarah dari berbagai era</p>
              </div>
              <Link to="/koran"
                className="inline-flex items-center gap-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-primary font-medium transition-colors flex-shrink-0">
                Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {loadingNewspaper
                ? Array.from({ length: 6 }, (_, i) => <SkeletonNewspaperCard key={i} />)
                : newspaper.trending.length > 0
                  ? newspaper.trending.map((art, i) => <NewspaperCard key={art.id || i} article={art} />)
                  : (
                    <div className="flex-1 text-center py-12 text-gray-400">
                      <Newspaper className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">Belum ada artikel koran</p>
                    </div>
                  )
              }
            </div>

            <div className="mt-6 text-center hidden lg:block">
              <Button onClick={() => window.location.href = '/koran'} className="w-full sm:w-auto inline-flex items-center justify-center">
                Jelajahi Arsip Koran <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────────────────────── */}
        <section className="bg-gray-50 dark:bg-gray-900 border-t-2 border-primary py-8 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="font-serif text-3xl sm:text-5xl font-light text-gray-900 dark:text-white mb-3 sm:mb-6">
                Mulai Membaca <span className="italic">Sekarang</span>
              </h2>
              <p className="text-sm sm:text-lg text-gray-600 dark:text-gray-400 mb-6 sm:mb-10">
                Jelajahi karya-karya sastra klasik, film bersejarah, dan arsip koran tempo dulu.<br/>
                Gratis. Legal. Tanpa batas waktu.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button size="lg" onClick={() => window.location.href = '/buku'} className="inline-flex items-center justify-center">
                  Koleksi Buku <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button size="lg" variant="secondary" onClick={() => window.location.href = '/blog'} className="inline-flex items-center justify-center">
                  Blog
                </Button>
                <Button size="lg" variant="secondary" onClick={() => window.location.href = '/koran'} className="inline-flex items-center justify-center">
                  Arsip Koran
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default HomePage
import { useState, useEffect, memo, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, ArrowRight, ChevronLeft, ChevronRight, Film } from 'lucide-react'
import bookService from '../services/bookService'
import { filmService } from '../services/filmService'
import LoadingSpinner from './../components/Common/LoadingSpinner'
import Button from '../components/Common/Button'
import SEO from '../components/Common/SEO'
import {
  generateWebsiteStructuredData,
  generateOrganizationStructuredData,
  combineStructuredData
} from '../utils/seoHelpers'

const BookCard = memo(({ book }) => (
  <Link to={`/buku/${book.slug || book.id}`} className="group flex-shrink-0 w-32 sm:w-40 lg:w-48">
    <div className="aspect-[2/3] bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 overflow-hidden mb-2 sm:mb-3 hover:shadow-2xl hover:border-primary transition-all duration-300 rounded-lg">
      {book.cover_image ? (
        <img src={book.cover_image} alt={book.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
      ) : (
        <div className="w-full h-full flex items-center justify-center p-2 sm:p-3">
          <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
        </div>
      )}
    </div>
    <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 mb-0.5 group-hover:text-primary transition-colors">{book.title}</h3>
    <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 line-clamp-1">{book.authorNames || book.author || 'Anonim'}</p>
  </Link>
))

const FilmCard = memo(({ film }) => (
  <Link to={`/film/${film.slug || film.id}`} className="group flex-shrink-0 w-32 sm:w-40 lg:w-48">
    {/* PORTRAIT 2:3 - bukan 16:9 */}
    <div className="aspect-[2/3] bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 overflow-hidden mb-2 hover:shadow-2xl hover:border-primary transition-all duration-300 rounded-lg">
      {film.posterUrl ? (
        <img
          src={film.posterUrl}
          alt={film.judul}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center p-2">
          <Film className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
        </div>
      )}
    </div>
    <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 mb-0.5 group-hover:text-primary transition-colors">
      {film.judul}
    </h3>
    <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
      {film.tahunRilis ? new Date(film.tahunRilis).getFullYear() : 'Tahun tidak diketahui'}
    </p>
  </Link>
))

const ScrollableBooks = memo(({ books, title, actionText, actionPath, buttonText }) => {
  const scrollRef = useRef(null)
  const scroll = useCallback((d) => scrollRef.current?.scrollBy({ left: d === 'left' ? -400 : 400, behavior: 'smooth' }), [])

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-6 sm:mb-8 gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-4xl font-light text-gray-900 dark:text-white mb-1">{title}</h2>
          <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-base">{actionText}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href={actionPath}
            className="inline-flex items-center justify-center whitespace-nowrap text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
          >
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
        {books.map((b, i) => <BookCard key={b.id || i} book={b} />)}
      </div>
    </div>
  )
})

const ScrollableFilms = memo(({ films, title, actionText, actionPath }) => {
  const scrollRef = useRef(null)
  const scroll = useCallback((d) => scrollRef.current?.scrollBy({ left: d === 'left' ? -400 : 400, behavior: 'smooth' }), [])

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-6 sm:mb-8 gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-4xl font-light text-gray-900 dark:text-white mb-1">{title}</h2>
          <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-base">{actionText}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href={actionPath}
            className="inline-flex items-center justify-center whitespace-nowrap text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
          >
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
        {films.map((f, i) => <FilmCard key={f.id || i} film={f} />)}
      </div>
    </div>
  )
})

const HomePage = () => {
  const [books, setBooks] = useState({ popular: [], new: [] })
  const [films, setFilms] = useState({ popular: [] })
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalGenres: 0,
    totalAuthors: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pop, nw, genres, allBooks, authors, popularFilms] = await Promise.all([
          bookService.getBooks({ page: 1, limit: 12, sortField: 'viewCount', sortOrder: 'DESC' }),
          bookService.getBooks({ page: 1, limit: 12, sortField: 'updateAt', sortOrder: 'DESC' }),
          bookService.getGenres(true),
          bookService.getBooks({ page: 1, limit: 1 }),
          bookService.getAuthors(1, 1),
          filmService.getFilms({ page: 0, size: 12 }).catch(() => ({ data: { data: [] } }))
        ])
        const map = (r) => (r.data?.list || r.data?.data || []).map(b => ({
          ...b,
          cover_image: b.coverImageUrl || b.cover_image || b.coverImage || b.image
        }))

        const totalBooks = allBooks.data?.total || 0
        const genresWithBooks = (genres.data || []).filter(g => (g.bookCount || 0) >= 1)
        const totalAuthors = authors.data?.total || 0

        setBooks({ popular: map(pop), new: map(nw) })
        setFilms({ popular: popularFilms.data?.data || [] })
        setStats({
          totalBooks,
          totalGenres: genresWithBooks.length,
          totalAuthors
        })
      } catch (err) {
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <LoadingSpinner fullScreen />

  const displayStats = [
    { num: stats.totalBooks.toLocaleString('id-ID'), label: 'Buku Tersedia' },
    { num: stats.totalGenres.toString(), label: 'Genre Berbeda' },
    { num: stats.totalAuthors.toLocaleString('id-ID'), label: 'Penulis' },
    { num: '∞', label: 'Gratis Tanpa Batas' }
  ]

  // Generate structured data untuk homepage
  const websiteSchema = generateWebsiteStructuredData()
  const organizationSchema = generateOrganizationStructuredData()
  const structuredData = combineStructuredData(websiteSchema, organizationSchema)

  return (
    <>
      {/* SEO Component */}
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
        <header className="bg-white dark:bg-gray-800 border-b-2 border-primary shadow-sm">
          <div className="max-w-[240px] sm:max-w-2xl lg:max-w-4xl mx-auto px-3 sm:px-6 pt-4 pb-3 sm:py-8">
            <div className="text-center">
              <div className="text-[9px] tracking-[0.2em] text-primary mb-2 sm:mb-4 uppercase font-medium">Perpustakaan Digital</div>
              <h1 className="font-serif text-xl sm:text-6xl lg:text-8xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-2" style={{ letterSpacing: '0.08em' }}>MASASILAM</h1>
              <p className="text-[7px] sm:text-xs tracking-[0.2em] text-gray-600 dark:text-gray-400 uppercase mb-0.5">Domain Publik • Literatur Klasik</p>
            </div>
          </div>
        </header>

        <section className="bg-white dark:bg-gray-800 py-8 sm:py-12 lg:py-16">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">
              <div className="hidden lg:block lg:col-span-7 lg:order-2">
                <article className="relative lg:min-h-0 bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-800 dark:to-gray-700 rounded-sm shadow-2xl border-2 border-amber-200 dark:border-amber-700 flex items-center justify-center">
                  <div className="p-12 w-full">
                    <div className="bg-white/90 dark:bg-gray-900/90 p-10 rounded-xl border-l-4 border-primary shadow-2xl backdrop-blur-sm">
                      <header className="text-center mb-6">
                        <h2 className="font-serif text-3xl font-bold text-gray-900 dark:text-white mb-2">Catetan Th. 1946</h2>
                        <p className="text-base text-gray-600 dark:text-gray-400">oleh <span className="font-semibold">Chairil Anwar</span></p>
                      </header>
                      <div className="font-serif text-lg leading-relaxed text-gray-800 dark:text-gray-200 space-y-5">
                        <p>Ada tanganku, sekali akan jemu terkulai,<br/>Mainan cahaya di air hilang bentuk dalam kabut,<br/>Dan suara yang kucintai 'kan berhenti membelai.<br/>Kupahat batu nisan sendiri dan kupagut.</p>
                        <p>Kita—anjing diburu—hanya melihat sebagian dari sandiwara sekarang<br/>Tidak tahu Romeo & Juliet berpeluk di kubur atau di ranjang<br/>Lahir seorang besar dan tenggelam beratus ribu<br/>Keduanya harus dicatet, keduanya dapat tempat.</p>
                        <p>Dan kita nanti tiada sawan lagi diburu<br/>Jika bedil sudah disimpan, cuma kenangan berdebu;<br/>Kita memburu arti atau diserahkan kepada anak lahir sempat</p>
                        <p>Karena itu jangan mengerdip, tatap dan penamu asah,<br/>Tulis karena kertas gersang; tenggorokan kering sedikit mau basah!</p>
                      </div>
                    </div>
                  </div>
                </article>
              </div>

              <aside className="lg:col-span-5 lg:order-1">
                {/* Desktop: Grid 4 kolom */}
                <div className="hidden lg:block">
                  <h2 className="font-serif text-3xl sm:text-5xl font-light mb-2 text-gray-900 dark:text-white">Koleksi Pilihan</h2>
                  <p className="font-serif text-lg sm:text-2xl text-gray-700 dark:text-gray-300 mb-6">Karya Terpopuler Domain Publik</p>
                  <nav className="grid grid-cols-4 gap-2 sm:gap-3 mb-6" aria-label="Koleksi buku populer">
                    {books.popular.slice(0, 12).map((b, i) => (
                      <Link key={b.id || i} to={`/buku/${b.slug || b.id}`} className="group">
                        <div className="aspect-[2/3] bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 overflow-hidden hover:shadow-2xl hover:border-primary transition-all rounded-lg">
                          {b.cover_image ? (
                            <img src={b.cover_image} alt={b.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-2">
                              <BookOpen className="w-4 h-4 text-primary mb-1" />
                              <div className="text-[7px] text-center text-gray-700 dark:text-gray-300 line-clamp-3">{b.title}</div>
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </nav>
                  <Button onClick={() => window.location.href = '/buku/terpopuler'} className="w-full sm:w-auto inline-flex items-center justify-center">Lihat Semua Koleksi Pilihan <ArrowRight className="w-4 h-4 ml-2" /></Button>
                </div>

                {/* Mobile & Tablet: Scrollable seperti Buku Terbaru */}
                <div className="block lg:hidden">
                  <ScrollableBooks books={books.popular} title="Koleksi Pilihan" actionText="Karya Terpopuler Domain Publik" actionPath="/buku/terpopuler" buttonText="Lihat Semua Koleksi Pilihan" />
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="hidden lg:block bg-gray-100 dark:bg-gray-900 border-y-2 border-primary py-8 sm:py-10" aria-label="Statistik perpustakaan">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 text-center">
              {displayStats.map((s, i) => {
                const links = ['/buku', '/kategori', '/penulis', null]
                const link = links[i]

                const content = (
                  <>
                    <div className="text-3xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-primary transition-colors">{s.num}</div>
                    <div className="text-[10px] sm:text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wider font-semibold">{s.label}</div>
                  </>
                )

                return link ? (
                  <a key={i} href={link} className="group hover:scale-105 transition-transform cursor-pointer">
                    {content}
                  </a>
                ) : (
                  <div key={i} className="group hover:scale-105 transition-transform">
                    {content}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-gray-800 py-4 sm:py-8 lg:py-16">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="relative">
              <div className="flex items-center justify-between mb-6 sm:mb-8 gap-4">
                <div>
                  <h2 className="font-serif text-2xl sm:text-4xl font-light text-gray-900 dark:text-white mb-1">Buku Terbaru</h2>
                  <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-base">Karya yang baru ditambahkan minggu ini</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a
                    href="/buku/terbaru"
                    className="lg:hidden inline-flex items-center justify-center whitespace-nowrap text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
                  >
                    Lihat Semua
                  </a>
                  <div className="hidden lg:flex gap-2">
                    <button onClick={() => document.getElementById('buku-terbaru-scroll')?.scrollBy({ left: -400, behavior: 'smooth' })} className="p-2 bg-white dark:bg-gray-700 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-primary hover:shadow-lg transition-all" aria-label="Scroll left">
                      <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    </button>
                    <button onClick={() => document.getElementById('buku-terbaru-scroll')?.scrollBy({ left: 400, behavior: 'smooth' })} className="p-2 bg-white dark:bg-gray-700 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-primary hover:shadow-lg transition-all" aria-label="Scroll right">
                      <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    </button>
                  </div>
                </div>
              </div>
              <div id="buku-terbaru-scroll" className="flex gap-4 sm:gap-6 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {books.new.map((b, i) => <BookCard key={b.id || i} book={b} />)}
              </div>
              <div className="mt-6 text-center hidden lg:block">
                <Button onClick={() => window.location.href = '/buku/terbaru'} className="w-full sm:w-auto inline-flex items-center justify-center">Lihat Semua Buku Terbaru <ArrowRight className="w-4 h-4 ml-2" /></Button>
              </div>
            </div>
          </div>
        </section>

        {/* Film Section */}
        {films.popular.length > 0 && (
          <section className="bg-gray-50 dark:bg-gray-900 border-t-2 border-primary py-4 sm:py-8 lg:py-16">
            <div className="container mx-auto px-4 sm:px-6">
              <ScrollableFilms
                films={films.popular}
                title="Film Klasik"
                actionText="Koleksi Film Domain Publik"
                actionPath="/film"
              />
              <div className="mt-6 text-center hidden lg:block">
                <Button onClick={() => window.location.href = '/film'} className="w-full sm:w-auto inline-flex items-center justify-center">
                  Lihat Semua Film <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </section>
        )}

        <section className="bg-gray-50 dark:bg-gray-900 border-t-2 border-primary py-8 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="font-serif text-3xl sm:text-5xl font-light text-gray-900 dark:text-white mb-3 sm:mb-6">Mulai Membaca <span className="italic">Sekarang</span></h2>
              <p className="text-sm sm:text-lg text-gray-600 dark:text-gray-400 mb-6 sm:mb-10">Jelajahi karya-karya sastra klasik. <br/>Gratis. Legal. Tanpa batas waktu.</p>
              <Button size="lg" onClick={() => window.location.href = '/buku'} className="w-full sm:w-auto inline-flex items-center justify-center">Lihat Semua Koleksi Buku <ArrowRight className="w-5 h-5 ml-2" /></Button>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default HomePage
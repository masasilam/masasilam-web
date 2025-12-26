import { useState, useEffect, memo, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import bookService from '../services/bookService'
import LoadingSpinner from './../components/Common/LoadingSpinner'
import Button from '../components/Common/Button'

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

const ScrollableBooks = memo(({ books, title, actionText, actionPath }) => {
  const scrollRef = useRef(null)
  const scroll = useCallback((d) => scrollRef.current?.scrollBy({ left: d === 'left' ? -400 : 400, behavior: 'smooth' }), [])

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div>
          <h2 className="font-serif text-2xl sm:text-4xl font-light text-gray-900 dark:text-white mb-1">{title}</h2>
          <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-base">{actionText}</p>
        </div>
        <div className="hidden lg:flex gap-2">
          <button onClick={() => scroll('left')} className="p-2 bg-white dark:bg-gray-700 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-primary hover:shadow-lg transition-all" aria-label="Scroll left">
            <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <button onClick={() => scroll('right')} className="p-2 bg-white dark:bg-gray-700 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-primary hover:shadow-lg transition-all" aria-label="Scroll right">
            <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>
      </div>
      <div ref={scrollRef} className="flex gap-4 sm:gap-6 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {books.map((b, i) => <BookCard key={b.id || i} book={b} />)}
      </div>
      <div className="mt-6 text-center">
        <Button onClick={() => window.location.href = actionPath} className="w-full sm:w-auto">Lihat Semua Buku Terbaru <ArrowRight className="w-4 h-4 ml-2" /></Button>
      </div>
    </div>
  )
})

const HomePage = () => {
  const [books, setBooks] = useState({ popular: [], new: [] })
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalGenres: 0,
    totalAuthors: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pop, nw, genres, allBooks, authors] = await Promise.all([
          bookService.getBooks({ page: 1, limit: 24, sortField: 'viewCount', sortOrder: 'DESC' }),
          bookService.getBooks({ page: 1, limit: 24, sortField: 'updateAt', sortOrder: 'DESC' }),
          bookService.getGenres(true),
          bookService.getBooks({ page: 1, limit: 1 }),
          bookService.getAuthors(1, 1) // ✅ Fetch total authors
        ])
        const map = (r) => (r.data?.list || r.data?.data || []).map(b => ({
          ...b,
          cover_image: b.coverImageUrl || b.cover_image || b.coverImage || b.image
        }))

        // Calculate real stats
        const totalBooks = allBooks.data?.total || 0
        const genresWithBooks = (genres.data || []).filter(g => (g.bookCount || 0) >= 1)
        const totalAuthors = authors.data?.total || 0

        setBooks({ popular: map(pop), new: map(nw) })
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

  return (
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
            <div className="lg:col-span-7 lg:order-2">
              <article className="relative min-h-[500px] sm:min-h-[600px] lg:min-h-0 bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-800 dark:to-gray-700 rounded-sm overflow-y-auto lg:overflow-visible shadow-2xl border-2 border-amber-200 dark:border-amber-700 flex items-center justify-center">
                <div className="p-4 sm:p-8 lg:p-12 w-full">
                  <div className="bg-white/90 dark:bg-gray-900/90 p-4 sm:p-6 lg:p-10 rounded-xl border-l-4 border-primary shadow-2xl backdrop-blur-sm">
                    <header className="text-center mb-4 sm:mb-6">
                      <h2 className="font-serif text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">Catetan Th. 1946</h2>
                      <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400">oleh <span className="font-semibold">Chairil Anwar</span></p>
                    </header>
                    <div className="font-serif text-xs sm:text-base lg:text-lg leading-relaxed text-gray-800 dark:text-gray-200 space-y-4 sm:space-y-5">
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
              <h2 className="font-serif text-3xl sm:text-5xl font-light mb-2 text-gray-900 dark:text-white">Koleksi Pilihan</h2>
              <p className="font-serif text-lg sm:text-2xl text-gray-700 dark:text-gray-300 mb-6">Karya Terbaik Domain Publik</p>
              <nav className="grid grid-cols-4 gap-2 sm:gap-3 mb-6" aria-label="Koleksi buku populer">
                {books.popular.slice(0, 16).map((b, i) => (
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
              <Button onClick={() => window.location.href = '/buku/terpopuler'} className="w-full sm:w-auto">Lihat Semua Koleksi Pilihan <ArrowRight className="w-4 h-4 ml-2" /></Button>
            </aside>
          </div>
        </div>
      </section>

      <section className="bg-gray-100 dark:bg-gray-900 border-y-2 border-primary py-8 sm:py-10" aria-label="Statistik perpustakaan">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 text-center">
            {displayStats.map((s, i) => (
              <div key={i} className="group hover:scale-105 transition-transform">
                <div className="text-3xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-primary transition-colors">{s.num}</div>
                <div className="text-[10px] sm:text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wider font-semibold">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-gray-800 py-8 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <ScrollableBooks books={books.new} title="Buku Terbaru" actionText="Karya klasik yang baru ditambahkan minggu ini" actionPath="/buku/terbaru" />
        </div>
      </section>

      <section className="bg-gray-50 dark:bg-gray-900 border-t-2 border-primary py-8 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-serif text-3xl sm:text-5xl font-light text-gray-900 dark:text-white mb-3 sm:mb-6">Mulai Membaca <span className="italic">Sekarang</span></h2>
            <p className="text-sm sm:text-lg text-gray-600 dark:text-gray-400 mb-6 sm:mb-10">Jelajahi karya-karya sastra klasik. Gratis. Legal. Tanpa batas waktu.</p>
            <Button size="lg" onClick={() => window.location.href = '/buku'} className="w-full sm:w-auto">Jelajahi Semua Koleksi Buku <ArrowRight className="w-5 h-5 ml-2" /></Button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
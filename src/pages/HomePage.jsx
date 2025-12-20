import { useState, useEffect, memo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, ArrowRight, Star, TrendingUp, Sparkles } from 'lucide-react'
import bookService from '../services/bookService' 
import LoadingSpinner from './../components/Common/LoadingSpinner'
import Button from '../components/Common/Button'

// Memoized BookCard Component
const BookCard = memo(({ book, showRating }) => (
  <Link to={`/buku/${book.slug || book.id}`} className="group">
    <div className={`aspect-[2/3] bg-gray-100 dark:bg-gray-700 border-2 ${showRating ? 'border-yellow-300 dark:border-yellow-600' : 'border-gray-300 dark:border-gray-600'} overflow-hidden mb-2 sm:mb-3 hover:shadow-2xl hover:border-primary transition-all duration-300 rounded-lg relative`}>
      {showRating && (
        <div className="absolute top-2 right-2 z-10 bg-yellow-500 text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg">
          <Star className="w-3 h-3 fill-current" />
          {book.averageRating?.toFixed(1) || '5.0'}
        </div>
      )}
      {book.cover_image ? (
        <img src={book.cover_image} alt={book.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
      ) : (
        <div className="w-full h-full flex items-center justify-center p-2 sm:p-3">
          <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
        </div>
      )}
    </div>
    <h3 className="text-[10px] sm:text-xs md:text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 mb-0.5 group-hover:text-primary transition-colors">{book.title}</h3>
    <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-600 dark:text-gray-400 line-clamp-1">{book.authorNames || book.author || 'Anonim'}</p>
  </Link>
))

// Memoized MiniBookCard for Hero Grid
const MiniBookCard = memo(({ book }) => (
  <Link to={`/buku/${book.slug || book.id}`} className="group">
    <div className="aspect-[2/3] bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 overflow-hidden hover:shadow-2xl hover:border-primary transition-all rounded-lg">
      {book.cover_image ? (
        <img src={book.cover_image} alt={book.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-2">
          <BookOpen className="w-4 h-4 text-primary mb-1" />
          <div className="text-[7px] text-center text-gray-700 dark:text-gray-300 line-clamp-3">{book.title}</div>
        </div>
      )}
    </div>
  </Link>
))

const HomePage = () => {
  const [books, setBooks] = useState({ popular: [], new: [], recommended: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [popular, newest, recommended] = await Promise.all([
          bookService.getBooks({ page: 1, limit: 16, sortField: 'viewCount', sortOrder: 'DESC' }),
          bookService.getBooks({ page: 1, limit: 12, sortField: 'updateAt', sortOrder: 'DESC' }),
          bookService.getBooks({ page: 1, limit: 8, sortField: 'averageRating', sortOrder: 'DESC' }),
        ])
        
        const map = (res) => (res.data?.list || res.data?.data || []).map(b => ({
          ...b, cover_image: b.coverImageUrl || b.cover_image || b.coverImage || b.image
        }))
        
        setBooks({ popular: map(popular), new: map(newest), recommended: map(recommended) })
      } catch (err) {
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const navigate = useCallback((path) => () => window.location.href = path, [])

  if (loading) return <LoadingSpinner fullScreen />

  const stats = [
    { num: '10,000+', label: 'Buku Tersedia' },
    { num: '50+', label: 'Genre Berbeda' },
    { num: '100%', label: 'Gratis & Legal' },
    { num: '∞', label: 'Tanpa Batas' }
  ]

  const links = [
    { to: '/buku/terpopuler', icon: TrendingUp, color: 'orange', title: 'Terpopuler', desc: 'Buku paling banyak dibaca' },
    { to: '/buku/terbaru', icon: Sparkles, color: 'blue', title: 'Terbaru', desc: 'Buku yang baru ditambahkan' },
    { to: '/buku/rekomendasi', icon: Star, color: 'yellow', title: 'Rekomendasi', desc: 'Buku dengan rating terbaik' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Masthead */}
      <header className="bg-white dark:bg-gray-800 border-b-2 border-primary shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="text-center">
            <div className="text-xs tracking-[0.3em] text-primary mb-5 sm:mb-4 uppercase font-medium">Perpustakaan Digital</div>
            <div className="flex items-center justify-center gap-4 sm:gap-8 mb-3 sm:mb-4">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>
              <img src="/masasilam-logo.svg" alt="masasilam" className="w-24 h-24 sm:w-32 sm:h-32 dark:invert" />
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>
            </div>
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-8xl font-bold text-gray-900 dark:text-white mb-2" style={{ letterSpacing: '0.08em' }}>MASASILAM</h1>
            <div className="text-[9px] sm:text-xs tracking-[0.3em] text-gray-600 dark:text-gray-400 uppercase">Domain Publik • Literatur Klasik • Gratis Selamanya</div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-white dark:bg-gray-800 py-8 sm:py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">
            <div className="lg:col-span-7 lg:order-2">
              <div className="relative h-64 sm:h-80 lg:h-[600px] rounded-sm overflow-hidden shadow-2xl">
                <img src="/perpustakaan-keliling.jpg" alt="Perpustakaan" className="w-full h-full object-cover" loading="eager" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                <div className="absolute bottom-3 sm:bottom-8 left-3 right-3 sm:left-8 sm:right-8 bg-white/95 dark:bg-gray-800/95 p-3 sm:p-6 border-l-4 border-primary shadow-2xl">
                  <p className="font-serif text-sm sm:text-xl italic text-gray-900 dark:text-white">"Buku adalah jendela dunia."</p>
                  <div className="mt-2 text-[10px] sm:text-sm text-gray-600 dark:text-gray-400">— Pepatah Klasik</div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-5 lg:order-1">
              <h2 className="font-serif text-3xl sm:text-5xl font-light mb-2 text-gray-900 dark:text-white">Koleksi Pilihan</h2>
              <p className="font-serif text-lg sm:text-2xl text-gray-700 dark:text-gray-300 mb-6">Karya Terbaik Domain Publik</p>
              <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-6">
                {books.popular.slice(0, 16).map((book, i) => <MiniBookCard key={book.id || i} book={book} />)}
              </div>
              <Button onClick={navigate('/buku/terpopuler')} className="w-full sm:w-auto">
                Lihat Semua Koleksi <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gray-100 dark:bg-gray-900 border-y-2 border-primary py-8 sm:py-10">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 text-center">
            {stats.map((stat, i) => (
              <div key={i} className="group hover:scale-105 transition-transform">
                <div className="text-3xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-primary transition-colors">{stat.num}</div>
                <div className="text-[10px] sm:text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wider font-semibold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Books */}
      <section className="bg-white dark:bg-gray-800 py-8 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 pb-6 border-b-2 border-primary gap-4">
            <div className="flex-1">
              <h2 className="font-serif text-2xl sm:text-4xl font-light text-gray-900 dark:text-white mb-2">Buku Terbaru</h2>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-base">Karya klasik yang baru ditambahkan minggu ini</p>
            </div>
            <Button onClick={navigate('/buku/terbaru')} className="w-full sm:w-auto flex-shrink-0">
              Lihat Semua <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-6">
            {books.new.slice(0, 12).map((book, i) => <BookCard key={book.id || i} book={book} />)}
          </div>
        </div>
      </section>

      {/* Recommended */}
      <section className="bg-gray-50 dark:bg-gray-900 py-8 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 pb-6 border-b-2 border-yellow-500 gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Star className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
                <h2 className="font-serif text-2xl sm:text-4xl font-light text-gray-900 dark:text-white">Buku Rekomendasi</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-base">Buku pilihan dengan rating terbaik</p>
            </div>
            <Button onClick={navigate('/buku/rekomendasi')} className="w-full sm:w-auto flex-shrink-0 bg-yellow-600 hover:bg-yellow-700">
              Lihat Semua <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-8">
            {books.recommended.slice(0, 8).map((book, i) => <BookCard key={book.id || i} book={book} showRating />)}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="bg-white dark:bg-gray-800 py-8 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="font-serif text-3xl sm:text-4xl font-light text-center text-gray-900 dark:text-white mb-8 sm:mb-12">Jelajahi Koleksi Kami</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 max-w-5xl mx-auto">
            {links.map((link, i) => (
              <Link key={i} to={link.to} className={`group bg-gradient-to-br from-${link.color}-50 to-${link.color}-100 dark:from-${link.color}-900/20 dark:to-${link.color}-800/20 p-6 sm:p-8 rounded-2xl border-2 border-${link.color}-200 dark:border-${link.color}-700 hover:border-${link.color}-400 hover:shadow-2xl transition-all`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 bg-${link.color}-500 text-white rounded-xl group-hover:scale-110 transition-transform`}>
                    <link.icon className="w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{link.title}</h3>
                </div>
                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-4">{link.desc}</p>
                <div className={`flex items-center text-${link.color}-600 dark:text-${link.color}-400 font-semibold text-sm group-hover:gap-3 transition-all`}>
                  Lihat Koleksi <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-50 dark:bg-gray-900 border-t-2 border-primary py-8 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <img src="/masasilam-logo.svg" alt="masasilam" className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 sm:mb-6 dark:invert" />
            <h2 className="font-serif text-3xl sm:text-5xl font-light text-gray-900 dark:text-white mb-3 sm:mb-6">Mulai Membaca <span className="italic">Sekarang</span></h2>
            <p className="text-sm sm:text-lg text-gray-600 dark:text-gray-400 mb-6 sm:mb-10">Jelajahi ribuan karya sastra klasik dari seluruh dunia. Gratis. Legal. Tanpa batas waktu.</p>
            <Button size="lg" onClick={navigate('/buku')} className="w-full sm:w-auto">
              Jelajahi Buku <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
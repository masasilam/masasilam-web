import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, ArrowRight, Star } from 'lucide-react'
import bookService from '../services/bookService' 
import LoadingSpinner from './../components/Common/LoadingSpinner'
import Button from '../components/Common/Button'

const HomePage = () => {
  const [popularBooks, setPopularBooks] = useState([])
  const [newBooks, setNewBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentDate] = useState(new Date().toLocaleDateString('id-ID', { 
    day: 'numeric',
    month: 'long', 
    year: 'numeric'
  }))

  useEffect(() => {
    fetchHomeData()
  }, [])

  const fetchHomeData = async () => {
    try {
      setLoading(true)
      
      const [popular, newest] = await Promise.all([
        bookService.getBooks({ page: 1, limit: 12, sortField: 'viewCount', sortOrder: 'DESC' }),
        bookService.getBooks({ page: 1, limit: 12, sortField: 'updateAt', sortOrder: 'DESC' }),
      ])
      
      const mapBookData = (response) => {
        const books = response.data?.list || response.data?.data || []
        return books.map(book => ({
          ...book,
          cover_image: book.coverImageUrl || book.cover_image || book.coverImage || book.image
        }))
      }
      
      setPopularBooks(mapBookData(popular))
      setNewBooks(mapBookData(newest))
    } catch (error) {
      console.error('Error fetching home data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      
      {/* Masthead */}
      <header className="bg-white dark:bg-gray-800 border-b-2 border-primary shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
            
            {/* Left Info */}
            <div className="hidden sm:block sm:col-span-2 text-xs space-y-1 text-gray-700 dark:text-gray-300">
              <div className="font-medium">{currentDate}</div>
              <div className="font-bold text-base">Nº 1</div>
              <div className="border-t border-gray-300 dark:border-gray-600 pt-2 mt-2 uppercase tracking-wider">
                Indonesia
              </div>
            </div>

            {/* Center Masthead */}
            <div className="col-span-1 sm:col-span-8 text-center">
              <div className="text-xs tracking-[0.3em] text-primary mb-3 sm:mb-4 uppercase font-medium">
                Perpustakaan Digital
              </div>
              
              <div className="flex items-center justify-center gap-4 sm:gap-8 mb-3 sm:mb-4">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>
                
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40">
                  <img 
                    src="/masasilam-logo.svg"
                    alt="masasilam Logo" 
                    className="w-full h-full object-contain dark:invert"
                  />
                </div>
                
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-wider text-gray-900 dark:text-white mb-2 sm:mb-3 drop-shadow-sm" 
                  style={{ fontFamily: 'Georgia, Garamond, "Times New Roman", serif', letterSpacing: '0.08em' }}>
                MASASILAM
              </h1>
              
              <div className="text-[9px] sm:text-[10px] md:text-xs tracking-[0.25em] sm:tracking-[0.3em] md:tracking-[0.4em] text-gray-600 dark:text-gray-400 uppercase font-medium px-2">
                Domain Publik • Literatur Klasik • Gratis Selamanya
              </div>
            </div>

            {/* Right QR */}
            <div className="hidden sm:block sm:col-span-2 text-right text-xs text-gray-700 dark:text-gray-300">
              <div className="mb-2 font-medium">Baca Online</div>
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary ml-auto rounded shadow-lg flex items-center justify-center">
                <div className="text-[8px] text-white font-mono">QR</div>
              </div>
              <div className="mt-2 text-[10px] font-medium">masasilam.id</div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12">
            
            {/* Hero Illustration - Shows First on Mobile */}
            <div className="lg:col-span-7 lg:order-2">
              <div className="relative h-64 sm:h-80 md:h-96 lg:h-full lg:min-h-[600px] xl:min-h-[650px] rounded-sm overflow-hidden shadow-2xl">
                {/* Hero Image */}
                <img 
                  src="/perpustakaan-keliling.jpg"
                  alt="Perpustakaan Keliling" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

                <div className="absolute bottom-3 sm:bottom-6 md:bottom-8 left-3 right-3 sm:left-6 sm:right-6 md:left-8 md:right-8 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md p-3 sm:p-5 md:p-6 lg:p-8 border-l-4 border-primary shadow-2xl">
                  <p className="font-serif text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl italic text-gray-900 dark:text-white leading-relaxed mb-1">
                    "Buku adalah jendela dunia."
                  </p>
                  <div className="mt-2 sm:mt-3 md:mt-4 text-[10px] sm:text-xs md:text-sm text-gray-600 dark:text-gray-400 font-medium tracking-wide">
                    — Pepatah Klasik
                  </div>
                </div>
              </div>
            </div>

            {/* Book Grid - Shows Second on Mobile */}
            <div className="lg:col-span-5 lg:order-1">
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light leading-tight mb-2 sm:mb-3 text-gray-900 dark:text-white" 
                  style={{ fontFamily: 'Georgia, Garamond, serif' }}>
                Koleksi Pilihan
              </h2>
              <p className="font-serif text-base sm:text-lg md:text-xl lg:text-2xl font-normal text-gray-700 dark:text-gray-300 mb-4 sm:mb-6 lg:mb-8">
                Karya Terbaik Domain Publik
              </p>

              {/* Book Grid */}
              <div className="grid grid-cols-4 gap-2 sm:gap-3">
                {popularBooks.slice(0, 16).map((book, idx) => (
                  <Link 
                    key={idx}
                    to={`/buku/${book.slug || book.id}`}
                    className="group"
                  >
                    <div className="aspect-[2/3] bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 overflow-hidden hover:shadow-2xl hover:border-primary transition-all duration-300 rounded-lg">
                      {book.cover_image ? (
                        <img 
                          src={book.cover_image} 
                          alt={book.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-2 bg-gray-100 dark:bg-gray-700">
                          <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 text-primary mb-1" />
                          <div className="text-[6px] sm:text-[7px] md:text-[8px] text-center text-gray-700 dark:text-gray-300 font-serif leading-tight line-clamp-3 px-1">
                            {book.title}
                          </div>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>

              <Button 
                onClick={() => window.location.href = '/buku/terpopuler'}
                className="mt-4 sm:mt-6 md:mt-8 w-full sm:w-auto"
              >
                Lihat Semua Koleksi
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="bg-gray-100 dark:bg-gray-900 border-y-2 border-primary">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-10 lg:py-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8 text-center">
            {[
              { num: '10,000+', label: 'Buku Tersedia' },
              { num: '50+', label: 'Genre Berbeda' },
              { num: '100%', label: 'Gratis & Legal' },
              { num: '∞', label: 'Tanpa Batas' }
            ].map((stat, i) => (
              <div key={i} className="group hover:scale-105 transition-transform duration-300">
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2 group-hover:text-primary transition-colors">
                  {stat.num}
                </div>
                <div className="text-[10px] sm:text-xs md:text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wider font-semibold">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Books */}
      <section className="bg-white dark:bg-gray-800 py-8 sm:py-12 md:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-6 sm:mb-8 lg:mb-10 pb-4 sm:pb-6 border-b-2 border-primary gap-3 sm:gap-4">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-gray-900 dark:text-white mb-1 sm:mb-2 md:mb-3">
                Buku Terbaru
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm md:text-base lg:text-lg">
                Karya klasik yang baru ditambahkan minggu ini
              </p>
            </div>
            <Button 
              onClick={() => window.location.href = '/buku/terbaru'}
              className="w-full sm:w-auto"
            >
              Lihat Semua
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
            </Button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
            {newBooks.slice(0, 12).map((book, idx) => (
              <Link 
                key={idx}
                to={`/buku/${book.slug || book.id}`}
                className="group"
              >
                <div className="aspect-[2/3] bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 overflow-hidden mb-2 sm:mb-3 hover:shadow-2xl hover:border-primary transition-all duration-300 rounded-lg">
                  {book.cover_image ? (
                    <img 
                      src={book.cover_image} 
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-2 sm:p-3 bg-gray-100 dark:bg-gray-700">
                      <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 text-primary" />
                    </div>
                  )}
                </div>
                <h3 className="text-[10px] sm:text-xs md:text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 leading-tight mb-0.5 sm:mb-1 group-hover:text-primary transition-colors">
                  {book.title}
                </h3>
                <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-600 dark:text-gray-400 line-clamp-1 font-medium">
                  {book.authorNames || book.author || 'Anonim'}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 dark:bg-gray-900 py-8 sm:py-12 md:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-center text-gray-900 dark:text-white mb-2 sm:mb-3 md:mb-4">
              Mengapa Memilih <span className="font-semibold italic">MasasilaM</span>?
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-400 text-xs sm:text-sm md:text-base lg:text-lg mb-8 sm:mb-10 md:mb-12 lg:mb-16 px-4">
              Platform perpustakaan digital terpercaya untuk pembaca Indonesia
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 md:gap-10 lg:gap-12">
              {[
                {
                  title: 'Akses Tanpa Batas',
                  desc: 'Baca ribuan buku klasik tanpa biaya berlangganan. Semua konten gratis dan dapat diakses selamanya.'
                },
                {
                  title: 'Download Bebas',
                  desc: 'Unduh dalam format EPUB, PDF, atau MOBI. Nikmati bacaan favorit secara offline di perangkat apapun.'
                },
                {
                  title: '100% Legal',
                  desc: 'Semua karya adalah domain publik yang bebas hak cipta. Dijamin aman, sah, dan sesuai hukum.'
                }
              ].map((feature, i) => (
                <div key={i} className="text-center group hover:scale-105 transition-transform duration-300">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-primary text-white rounded-full mb-3 sm:mb-4 md:mb-5 lg:mb-6 shadow-lg group-hover:shadow-2xl transition-shadow">
                    <Star className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" />
                  </div>
                  <h3 className="font-serif text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3 md:mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-xs sm:text-sm md:text-base">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white dark:bg-gray-800 border-t-2 border-primary py-8 sm:py-12 md:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="inline-block mb-3 sm:mb-4 md:mb-6">
              <img 
                src="/masasilam-logo.svg"
                alt="masasilam Logo" 
                className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 object-contain dark:invert"
              />
            </div>
            
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 dark:text-white mb-3 sm:mb-4 md:mb-6">
              Mulai Membaca <span className="italic font-normal">Sekarang</span>
            </h2>
            
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-400 mb-5 sm:mb-6 md:mb-8 lg:mb-10 leading-relaxed px-4">
              Jelajahi ribuan karya sastra klasik dari seluruh dunia.<br className="hidden sm:block" />
              Gratis. Legal. Tanpa batas waktu.
            </p>
            
            <Button 
              size="lg"
              onClick={() => window.location.href = '/buku'}
              className="w-full sm:w-auto"
            >
              Jelajahi Katalog
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ml-2" />
            </Button>

            <div className="mt-6 sm:mt-8 md:mt-10 lg:mt-12 flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-6 lg:gap-8 text-[10px] sm:text-xs md:text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full"></div>
                <span className="font-medium">10,000+ Buku</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full"></div>
                <span className="font-medium">100% Gratis</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full"></div>
                <span className="font-medium">Legal & Aman</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
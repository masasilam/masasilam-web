// ============================================
// src/pages/GenresPage.jsx - FIXED: Show genres with bookCount >= 1
// ============================================

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import bookService from '../services/bookService'
import LoadingSpinner from '../components/Common/LoadingSpinner'
import { 
  BookOpen, ChevronRight, Church, Leaf, BookText, Building2, 
  Gem, Flower2, User, TrendingUp, Palette, Drama, BookMarked,
  Baby, Users, Lightbulb, Camera, PawPrint, Scale, Smile,
  FlaskConical, Landmark, Globe, Stethoscope, ShieldAlert, Heart,
  Scissors, Activity, BookHeart, Image, Laptop,
  Feather, Calculator, ChefHat, Music, GraduationCap, Target,
  Plane, Gamepad2, Brain, Map, Home, Clock,
  Languages, Theater, Wrench, Car, Sparkles, Dumbbell, BookOpenCheck
} from 'lucide-react'

const GenresPage = () => {
  const [genres, setGenres] = useState([])
  const [loading, setLoading] = useState(true)

  // Mapping ikon untuk setiap genre berdasarkan slug
  const genreIcons = {
    'agama': Church,
    'alam': Leaf,
    'alkitab': BookText,
    'arsitektur': Building2,
    'barang-antik-koleksi': Gem,
    'berkebun': Flower2,
    'biografi-otobiografi': User,
    'bisnis-ekonomi': TrendingUp,
    'desain': Palette,
    'drama': Drama,
    'fiksi': BookMarked,
    'fiksi-anak': Baby,
    'fiksi-remaja': Users,
    'filsafat': Lightbulb,
    'fotografi': Camera,
    'hewan-peliharaan': PawPrint,
    'hukum': Scale,
    'humor': Smile,
    'ilmu-pengetahuan': FlaskConical,
    'ilmu-politik': Landmark,
    'ilmu-sosial': Globe,
    'kedokteran': Stethoscope,
    'kejahatan-nyata': ShieldAlert,
    'keluarga-hubungan': Heart,
    'kerajinan-hobi': Scissors,
    'kesehatan-kebugaran': Activity,
    'koleksi-sastra': BookHeart,
    'komik-novel-grafis': Image,
    'komputer': Laptop,
    'kritik-sastra': Feather,
    'matematika': Calculator,
    'memasak-kuliner': ChefHat,
    'musik': Music,
    'nonfiksi-anak': GraduationCap,
    'nonfiksi-remaja': BookOpenCheck,
    'olahraga-rekreasi': Dumbbell,
    'panduan-belajar': Target,
    'pendidikan': GraduationCap,
    'pengembangan-diri': Sparkles,
    'perjalanan': Plane,
    'permainan-aktivitas': Gamepad2,
    'psikologi': Brain,
    'puisi': Feather,
    'referensi': Map,
    'rumah-kehidupan': Home,
    'sejarah': Clock,
    'seni': Palette,
    'seni-disiplin-bahasa': Languages,
    'seni-pertunjukan': Theater,
    'studi-bahasa': Languages,
    'teknologi-rekayasa': Wrench,
    'transportasi': Car,
    'tubuh-pikiran-jiwa': Sparkles
  }

  const getGenreIcon = (slug) => {
    const Icon = genreIcons[slug] || BookOpen
    return Icon
  }

  useEffect(() => {
    fetchGenres()
  }, [])

  const fetchGenres = async () => {
    try {
      setLoading(true)
      const response = await bookService.getGenres(true)
      
      console.log('📚 All genres from API:', response.data)
      
      // ✅ FIXED: Filter genre dengan bookCount >= 1 (tidak hanya > 0)
      const genresWithBooks = (response.data || []).filter(genre => {
        const count = genre.bookCount || 0
        console.log(`Genre: ${genre.name}, bookCount: ${count}`)
        return count >= 1
      })
      
      console.log('✅ Genres with books:', genresWithBooks)
      
      setGenres(genresWithBooks)
    } catch (error) {
      console.error('❌ Error fetching genres:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 sm:py-12 md:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header Section */}
        <div className="mb-8 sm:mb-10 md:mb-12 pb-6 border-b-2 border-primary">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 dark:text-white mb-2 sm:mb-3 md:mb-4">
            Kategori Buku
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base md:text-lg lg:text-xl">
            Jelajahi buku berdasarkan kategori/genre favoritmu
          </p>
        </div>

        {/* Genres Grid */}
        {genres.length === 0 ? (
          <div className="text-center py-12 sm:py-16 md:py-20">
            <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base md:text-lg">
              Belum ada kategori dengan buku tersedia
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {genres.map((genre) => {
              const IconComponent = getGenreIcon(genre.slug)
              
              return (
                <Link
                  key={genre.id}
                  to={`/kategori/${genre.slug}`}
                  className="group relative bg-white dark:bg-gray-800 rounded-lg p-5 sm:p-6 border-2 border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Background Effect on Hover */}
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                  
                  {/* Content */}
                  <div className="relative flex items-start gap-4">
                    {/* Icon Circle */}
                    <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/20 dark:group-hover:bg-primary/30 transition-all duration-300">
                      <IconComponent className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                    </div>
                    
                    {/* Text Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-bold mb-2 text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1">
                        {genre.name}
                      </h3>
                      {genre.description && (
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {genre.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="font-medium">{genre.bookCount || 0} buku</span>
                      </div>
                    </div>
                    
                    {/* Arrow Icon */}
                    <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default GenresPage
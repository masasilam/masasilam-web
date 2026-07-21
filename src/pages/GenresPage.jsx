import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import bookService from '../services/bookService'
import LoadingSpinner from '../components/Common/LoadingSpinner'
import SEO from '../components/Common/SEO'
import {
  generateCollectionPageStructuredData,
  generateBreadcrumbStructuredData,
  combineStructuredData,
} from '../utils/seoHelpers'
import {
  BookOpen, ChevronRight,
  Church, Leaf, BookText, Building2, Gem, Flower2, User, TrendingUp,
  Palette, Drama, BookMarked, Baby, Users, Lightbulb, Camera, PawPrint,
  Scale, Smile, FlaskConical, Landmark, Globe, Stethoscope, ShieldAlert,
  Heart, Scissors, Activity, BookHeart, Image, Laptop, Feather, Calculator,
  ChefHat, Music, GraduationCap, Target, Plane, Gamepad2, Brain, Map, Home,
  Clock, Languages, Theater, Wrench, Car, Sparkles, Dumbbell, BookOpenCheck,
  Tag,
} from 'lucide-react'

const genreIcons = {
  'agama': Church, 'alam': Leaf, 'alkitab': BookText, 'arsitektur': Building2,
  'barang-antik-koleksi': Gem, 'berkebun': Flower2, 'biografi-otobiografi': User,
  'bisnis-ekonomi': TrendingUp, 'desain': Palette, 'drama': Drama, 'fiksi': BookMarked,
  'fiksi-anak': Baby, 'fiksi-remaja': Users, 'filsafat': Lightbulb, 'fotografi': Camera,
  'hewan-peliharaan': PawPrint, 'hukum': Scale, 'humor': Smile, 'ilmu-pengetahuan': FlaskConical,
  'ilmu-politik': Landmark, 'ilmu-sosial': Globe, 'kedokteran': Stethoscope,
  'kejahatan-nyata': ShieldAlert, 'keluarga-hubungan': Heart, 'kerajinan-hobi': Scissors,
  'kesehatan-kebugaran': Activity, 'koleksi-sastra': BookHeart, 'komik-novel-grafis': Image,
  'komputer': Laptop, 'kritik-sastra': Feather, 'matematika': Calculator,
  'memasak-kuliner': ChefHat, 'musik': Music, 'nonfiksi-anak': GraduationCap,
  'nonfiksi-remaja': BookOpenCheck, 'olahraga-rekreasi': Dumbbell, 'panduan-belajar': Target,
  'pendidikan': GraduationCap, 'pengembangan-diri': Sparkles, 'perjalanan': Plane,
  'permainan-aktivitas': Gamepad2, 'psikologi': Brain, 'puisi': Feather, 'referensi': Map,
  'rumah-kehidupan': Home, 'sejarah': Clock, 'seni': Palette, 'seni-disiplin-bahasa': Languages,
  'seni-pertunjukan': Theater, 'studi-bahasa': Languages, 'teknologi-rekayasa': Wrench,
  'transportasi': Car, 'tubuh-pikiran-jiwa': Sparkles,
}

// Per-genre accent colors cycling through amber/emerald/blue/violet/rose
const ACCENT_CYCLE = [
  { text: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-50 dark:bg-amber-900/20',   border: 'border-amber-200 dark:border-amber-800/40',   hover: 'group-hover:border-amber-400 dark:group-hover:border-amber-500',   iconBg: 'bg-amber-100 dark:bg-amber-900/30'   },
  { text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800/40', hover: 'group-hover:border-emerald-400 dark:group-hover:border-emerald-500', iconBg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  { text: 'text-blue-600 dark:text-blue-400',     bg: 'bg-blue-50 dark:bg-blue-900/20',     border: 'border-blue-200 dark:border-blue-800/40',     hover: 'group-hover:border-blue-400 dark:group-hover:border-blue-500',     iconBg: 'bg-blue-100 dark:bg-blue-900/30'     },
  { text: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20', border: 'border-violet-200 dark:border-violet-800/40', hover: 'group-hover:border-violet-400 dark:group-hover:border-violet-500', iconBg: 'bg-violet-100 dark:bg-violet-900/30' },
  { text: 'text-rose-600 dark:text-rose-400',     bg: 'bg-rose-50 dark:bg-rose-900/20',     border: 'border-rose-200 dark:border-rose-800/40',     hover: 'group-hover:border-rose-400 dark:group-hover:border-rose-500',     iconBg: 'bg-rose-100 dark:bg-rose-900/30'     },
]

const GenresPage = () => {
  const [genres,  setGenres]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true)
        const res = await bookService.getGenres(true)
        setGenres((res.data || []).filter(g => (g.bookCount || 0) >= 1))
      } catch (err) {
        console.error('Error fetching genres:', err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const breadcrumbs   = [{ name: 'Beranda', url: '/' }, { name: 'Kategori Buku', url: '#' }]
  const totalBooks    = genres.reduce((s, g) => s + (g.bookCount || 0), 0)
  const structuredData = combineStructuredData(
    generateBreadcrumbStructuredData(breadcrumbs),
    generateCollectionPageStructuredData('genres', genres, 1, genres.length)
  )

  if (loading) return <LoadingSpinner fullScreen />

  return (
    <>
      <SEO
        title="Kategori Buku Domain Publik — MasasilaM"
        description={`Jelajahi ${genres.length} kategori buku klasik domain publik dengan total ${totalBooks} buku. Temukan genre favorit dari fiksi hingga ilmu pengetahuan.`}
        url="/kategori"
        type="website"
        keywords="kategori buku, genre buku, fiksi, non-fiksi, sejarah, ilmu pengetahuan, sastra, biografi, buku gratis"
        structuredData={structuredData}
        canonical="https://masasilam.com/kategori"
      />

      <div className="min-h-screen bg-stone-50 dark:bg-slate-950 transition-colors duration-300">

        {/* ── HERO ──────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-white dark:bg-slate-950 border-b border-stone-200 dark:border-slate-800 py-14 sm:py-20">
          <div className="pointer-events-none absolute inset-0 flex items-start justify-center overflow-hidden">
            <div className="w-[600px] h-[400px] rounded-full bg-amber-100/40 dark:bg-amber-900/10 blur-3xl -translate-y-1/2" />
          </div>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-amber-400 via-emerald-400 to-blue-400 opacity-60" />

          <div className="relative container mx-auto px-4 sm:px-6 max-w-6xl">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs text-stone-400 dark:text-slate-500 mb-6" aria-label="Breadcrumb">
              <Link to="/" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">Beranda</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-stone-600 dark:text-slate-300 font-medium">Kategori</span>
            </nav>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3.5 py-1.5 rounded-full mb-4 border border-amber-200 dark:border-amber-800/40">
                  <Tag className="w-3.5 h-3.5" /> Kategori
                </div>
                <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-stone-900 dark:text-white">
                  Kategori Buku
                </h1>
                <p className="text-stone-500 dark:text-slate-400 text-sm sm:text-base mt-3">
                  Jelajahi{' '}
                  <span className="font-semibold text-stone-800 dark:text-slate-200">{genres.length}</span>{' '}
                  kategori dengan total{' '}
                  <span className="font-semibold text-stone-800 dark:text-slate-200">{totalBooks.toLocaleString('id-ID')}</span>{' '}
                  buku
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── GRID ─────────────────────────────────────────────────── */}
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <section className="mt-8 sm:mt-10">
            {genres.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-7 h-7 text-stone-300 dark:text-slate-600" />
                </div>
                <p className="font-semibold text-stone-600 dark:text-slate-400">Belum ada kategori dengan buku tersedia</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {genres.map((genre, idx) => {
                  const Icon   = genreIcons[genre.slug] || BookOpen
                  const accent = ACCENT_CYCLE[idx % ACCENT_CYCLE.length]

                  return (
                    <Link
                      key={genre.id}
                      to={`/kategori/${genre.slug}`}
                      className={`group relative bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${accent.border} ${accent.hover}`}
                    >
                      {/* Hover tint */}
                      <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${accent.bg}`} />

                      <div className="relative flex items-start gap-4">
                        {/* Icon */}
                        <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${accent.iconBg}`}>
                          <Icon className={`w-6 h-6 ${accent.text}`} />
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <h2 className={`text-sm sm:text-base font-bold mb-1.5 capitalize line-clamp-1 text-stone-900 dark:text-slate-100 group-hover:${accent.text.split(' ')[0]} transition-colors`}>
                            {genre.name}
                          </h2>
                          {genre.description && (
                            <p className="text-xs text-stone-400 dark:text-slate-500 mb-2.5 line-clamp-2 leading-relaxed">
                              {genre.description}
                            </p>
                          )}
                          <div className={`flex items-center gap-1.5 text-xs font-semibold ${accent.text}`}>
                            <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
                            {genre.bookCount || 0} buku
                          </div>
                        </div>

                        <ChevronRight className={`w-4 h-4 flex-shrink-0 opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all ${accent.text}`} />
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </section>
          <div className="pb-16" />
        </div>
      </div>
    </>
  )
}

export default GenresPage
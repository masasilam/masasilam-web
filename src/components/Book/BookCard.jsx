import { Link } from 'react-router-dom'
import {
  Clock, Eye, Download, BookOpen, MessageCircle, Zap, Award, Lock, Star,
  Church, Leaf, BookText, Building2, Gem, Flower2, User, TrendingUp, Palette,
  Drama, BookMarked, Baby, Users, Lightbulb, Camera, PawPrint, Scale, Smile,
  FlaskConical, Landmark, Globe2, Stethoscope, ShieldAlert, Heart, Scissors,
  Activity, BookHeart, Image, Laptop, Feather, Calculator, ChefHat, Music,
  GraduationCap, Target, Plane, Gamepad2, Brain, Map, Home, Languages,
  Theater, Wrench, Car, Sparkles, Dumbbell, BookOpenCheck
} from 'lucide-react'

// ── Genre icon map (selaras GenresPage) ──────────────────────────────────────
const GENRE_ICON_MAP = {
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
  'ilmu-sosial': Globe2,
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
  'tubuh-pikiran-jiwa': Sparkles,
}

// Konversi nama genre → slug (selaras GenresPage & BooksPage)
const genreNameToSlug = (name) =>
  name.trim().toLowerCase()
    .replace(/\s*&\s*/g, '-')
    .replace(/\s*\/\s*/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

const getGenreIcon = (slug) => GENRE_ICON_MAP[slug] || BookOpen

// ── Stat chip ─────────────────────────────────────────────────────────────────
const Stat = ({ icon: Icon, value, className = '' }) => (
  <span className={`inline-flex items-center gap-1 text-[11px] leading-none ${className}`}>
    <Icon className="w-3 h-3 flex-shrink-0" />
    {value}
  </span>
)

// ── Copyright icon (overlay cover) ───────────────────────────────────────────
const CopyrightIcon = ({ status }) => {
  if (!status) return null

  const isDomainPublic =
    status === 'Domain Publik' ||
    status?.toLowerCase().includes('public domain') ||
    status?.toLowerCase().includes('uncopyright')
  const isCC0 = status?.toLowerCase().includes('cc0') || status?.toLowerCase().includes('cc 0')
  const isCC = !isCC0 && status?.toLowerCase().includes('creative commons')

  return (
    <span
      title={status}
      className="inline-flex items-center justify-center rounded-full px-1
                 bg-black/15 backdrop-blur-sm text-[9px] font-bold leading-none select-none
                 min-w-[20px] h-5"
    >
      {isDomainPublic ? (
        /* © dengan garis coret diagonal merah */
        <span style={{ position: 'relative', display: 'inline-block', color: 'rgba(0,0,0,0.35)', fontSize: '11px', lineHeight: 1 }}>
          ©
          <span style={{
            position: 'absolute',
            top: '45%',
            left: '-5%',
            width: '110%',
            height: 0,
            borderTop: '0.09em solid #ff4444',
            transform: 'rotate(-45deg)',
          }} />
        </span>
      ) : isCC0 ? (
        /* CC0 1.0 label */
        <span className="text-emerald-300 tracking-tight" style={{ fontSize: '8px', whiteSpace: 'nowrap' }}>
          CC0 1.0
        </span>
      ) : isCC ? (
        <span className="text-blue-300" style={{ fontSize: '9px' }}>CC</span>
      ) : (
        <Lock className="w-3 h-3 text-gray-300" />
      )}
    </span>
  )
}

// ── BookCard ──────────────────────────────────────────────────────────────────
const BookCard = ({ book }) => {
  const hasRating   = book.averageRating != null && Number(book.averageRating) > 0
  const rating      = hasRating ? Number(book.averageRating) : 0
  const ratingStr   = hasRating ? rating.toFixed(1) : null
  const ratingCount = book.totalRatings || book.ratingCount || 0
  const readTime    = book.estimatedReadTime
    ? book.estimatedReadTime >= 60
      ? `${Math.round(book.estimatedReadTime / 60)}j`
      : `${book.estimatedReadTime}m`
    : null

  // Semua genre → array of { name, slug, Icon }
  const genreList = book.genres
    ? book.genres.split(',').map((g) => {
        const name = g.trim()
        const slug = genreNameToSlug(name)
        return { name, slug, Icon: getGenreIcon(slug) }
      })
    : []

  return (
    <Link
      to={`/buku/${book.slug}`}
      className="group relative flex flex-col rounded-xl overflow-hidden
                 transition-all duration-300 ease-out
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500
                 border shadow-sm hover:shadow-xl hover:-translate-y-1
                 bg-white border-stone-200 shadow-stone-100/80
                 hover:border-amber-300 hover:shadow-amber-100
                 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none
                 dark:hover:border-slate-600 dark:hover:shadow-black/60 dark:hover:shadow-xl"
    >
      {/* ── Cover ─────────────────────────────────────────────────────── */}
      <div className="relative aspect-[2/3] overflow-hidden flex-shrink-0
                      bg-stone-100 dark:bg-slate-800">
        <img
          src={book.coverImageUrl || 'https://via.placeholder.com/300x450?text=No+Cover'}
          alt={`Cover ${book.title}`}
          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Bottom gradient vignette */}
        <div className="absolute inset-x-0 bottom-0 h-1/4
                        bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />

        {/* ── Top-left badges: Featured + Difficulty ─────────────────── */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
          {book.isFeatured && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md
                             bg-amber-400 text-gray-900 text-[10px] font-bold tracking-wide shadow-sm">
              <Award className="w-2.5 h-2.5" />Pilihan
            </span>
          )}
          {book.difficultyLevel === 'BEGINNER' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md
                             bg-emerald-500 text-white text-[10px] font-bold shadow-sm">
              <Zap className="w-2.5 h-2.5" />Pemula
            </span>
          )}
          {book.difficultyLevel === 'ADVANCED' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md
                             bg-red-500 text-white text-[10px] font-bold shadow-sm">
              <Zap className="w-2.5 h-2.5" />Lanjutan
            </span>
          )}
        </div>

        {/* ── Copyright icon top-right ───────────────────────────────── */}
        {book.copyrightStatus && (
          <div className="absolute top-0 right-0 z-10 p-1">
            <CopyrightIcon status={book.copyrightStatus} />
          </div>
        )}
      </div>

      {/* ── Info Panel ────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-2.5 sm:p-3 gap-1.5">

        {/* Genre icons */}
        {genreList.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {genreList.map(({ name, slug, Icon }) => (
              <span
                key={slug}
                title={name}
                className="inline-flex items-center justify-center w-5 h-5 rounded-full
                           bg-blue-50 border border-blue-100 text-blue-600
                           dark:bg-blue-900/20 dark:border-blue-800/50 dark:text-blue-400"
              >
                <Icon className="w-2.5 h-2.5" />
              </span>
            ))}
          </div>
        )}

        {/* ── Rating + read time ─────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          {hasRating ? (
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400 flex-shrink-0" />
              <span className="text-xs font-semibold tabular-nums
                               text-stone-700 dark:text-slate-300">{ratingStr}</span>
              {ratingCount > 0 && (
                <span className="text-[11px] tabular-nums
                                 text-stone-400 dark:text-slate-600">({ratingCount})</span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-stone-300 dark:text-slate-700" />
              <span className="text-[11px] text-stone-300 dark:text-slate-700">—</span>
            </div>
          )}
          {readTime && (
            <div className="flex items-center gap-1
                            text-stone-400 dark:text-slate-600">
              <Clock className="w-3 h-3 flex-shrink-0" />
              <span className="text-[11px]">{readTime}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-sm leading-snug line-clamp-2 hyphens-auto
                       transition-colors duration-200
                       text-stone-900 group-hover:text-amber-700
                       dark:text-slate-100 dark:group-hover:text-amber-400">
          {book.title}
        </h3>

        {/* Author */}
        {(book.authorNames || book.authors) && (
          <p className="text-xs truncate leading-none
                        text-stone-500 dark:text-slate-500">
            {book.authorNames || book.authors}
          </p>
        )}

        {/* Stats strip */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-auto pt-1.5
                        border-t border-stone-100 dark:border-slate-800">
          <Stat icon={Eye}      value={book.viewCount     || 0} className="text-stone-400 dark:text-slate-600" />
          <Stat icon={BookOpen} value={book.readCount     || 0} className="text-stone-400 dark:text-slate-600" />
          <Stat icon={Download} value={book.downloadCount || 0} className="text-stone-400 dark:text-slate-600" />
          {book.totalComments > 0 && (
            <Stat icon={MessageCircle} value={book.totalComments} className="text-stone-400 dark:text-slate-600" />
          )}
        </div>
      </div>

      {/* ── Hover glow border (decorative) ───────────────────────────── */}
      <div className="absolute inset-0 rounded-xl border-2 border-transparent pointer-events-none
                      transition-colors duration-300
                      group-hover:border-amber-300/40
                      dark:group-hover:border-amber-500/20" />
    </Link>
  )
}

export default BookCard
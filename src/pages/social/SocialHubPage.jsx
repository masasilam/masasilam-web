import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Rss, ListChecks, Users, Trophy, Quote, Users2,
  History, ArrowRight, BookOpen, Sparkles, Globe
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const FEATURE_CARDS = [
  {
    to: '/sosial/anotasi',
    icon: Quote,
    color: 'from-rose-400 to-pink-500',
    bg:   'bg-rose-50 dark:bg-rose-900/10',
    border: 'border-rose-200 dark:border-rose-800',
    title: 'Kutipan Sosial',
    desc:  'Bagikan dan temukan kutipan menarik dari buku, zine, dan film.',
  },
  {
    to: '/sosial/daftar',
    icon: ListChecks,
    color: 'from-teal-400 to-emerald-500',
    bg:   'bg-teal-50 dark:bg-teal-900/10',
    border: 'border-teal-200 dark:border-teal-800',
    title: 'Daftar Baca',
    desc:  'Kurasi dan bagikan koleksi bacaan favoritmu ke komunitas.',
  },
  {
    to: '/sosial/grup',
    icon: Users,
    color: 'from-indigo-400 to-purple-500',
    bg:   'bg-indigo-50 dark:bg-indigo-900/10',
    border: 'border-indigo-200 dark:border-indigo-800',
    title: 'Grup Baca',
    desc:  'Bergabung atau buat grup untuk membaca dan berdiskusi bersama.',
  },
  {
    to: '/sosial/tantangan',
    icon: Trophy,
    color: 'from-yellow-400 to-orange-500',
    bg:   'bg-yellow-50 dark:bg-yellow-900/10',
    border: 'border-yellow-200 dark:border-yellow-800',
    title: 'Tantangan Baca',
    desc:  'Ikuti tantangan membaca dan buktikan kemampuanmu.',
  },
  {
    to: '/sosial/twin',
    icon: Users2,
    color: 'from-purple-400 to-violet-500',
    bg:   'bg-purple-50 dark:bg-purple-900/10',
    border: 'border-purple-200 dark:border-purple-800',
    title: 'Reading Twin',
    desc:  'Temukan pengguna dengan selera baca paling mirip denganmu.',
    authOnly: true,
  },
  {
    to: '/sosial/kapsul',
    icon: History,
    color: 'from-amber-400 to-orange-400',
    bg:   'bg-amber-50 dark:bg-amber-900/10',
    border: 'border-amber-200 dark:border-amber-800',
    title: 'Kapsul Waktu',
    desc:  'Baca koran dari hari yang sama puluhan tahun lalu.',
  },
]

const SocialHubPage = () => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // Authenticated users go straight to feed
  useEffect(() => {
    if (isAuthenticated) navigate('/sosial/feed', { replace: true })
  }, [isAuthenticated, navigate])

  if (isAuthenticated) return null

  const cards = FEATURE_CARDS.filter(c => !c.authOnly)

  return (
    <div className="max-w-3xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/20 rounded-full mb-4">
          <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">Komunitas MasasilaM</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Baca Bersama, <span className="text-amber-500">Lebih Bermakna</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto leading-relaxed">
          Bergabunglah dengan komunitas pembaca aktif. Bagikan kutipan, buat daftar baca, diskusi dalam grup, dan ikuti tantangan membaca.
        </p>
        <div className="flex gap-3 justify-center mt-6">
          <Link to="/daftar"
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold rounded-xl transition-all hover:scale-105 shadow-lg shadow-amber-200 dark:shadow-amber-900/30">
            Mulai Sekarang
          </Link>
          <Link to="/masuk"
            className="px-6 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl hover:bg-white dark:hover:bg-gray-900 transition-all">
            Masuk
          </Link>
        </div>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {cards.map(({ to, icon: Icon, color, bg, border, title, desc }) => (
          <Link
            key={to}
            to={to}
            className={`group p-5 rounded-2xl border ${bg} ${border} hover:shadow-md transition-all`}
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
            <div className="flex items-center gap-1 mt-3 text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              Jelajahi <ArrowRight className="w-3 h-3" />
            </div>
          </Link>
        ))}
      </div>

      {/* Public feed preview CTA */}
      <div className="flex items-center gap-4 p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center flex-shrink-0">
          <Globe className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 dark:text-white">Lihat Feed Publik</p>
          <p className="text-xs text-gray-400">Aktivitas terbaru dari seluruh komunitas</p>
        </div>
        <Link to="/sosial/feed"
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-amber-100 dark:hover:bg-amber-900/20 text-gray-700 dark:text-gray-300 hover:text-amber-700 dark:hover:text-amber-300 text-sm font-medium rounded-xl transition-all flex-shrink-0">
          Lihat <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )
}

export default SocialHubPage
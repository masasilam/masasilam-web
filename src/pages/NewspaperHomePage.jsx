import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Search,
  Newspaper,
  Calendar,
  Clock,
  ChevronRight,
  BookOpen,
  Building2
} from 'lucide-react'
import api from '../services/api'
import SEO from '../components/Common/SEO'
import { sourceHref, rubrikHref } from '../utils/newspaperUtils'
import { getGenreIcon } from '../utils/genreIcons'

const SkeletonSource = () => (
  <div
    className="animate-pulse rounded-2xl border p-5 bg-white border-stone-200 dark:bg-slate-900 dark:border-slate-700"
  >
    <div className="h-4 rounded w-2/3 mb-2 bg-stone-200 dark:bg-slate-700" />
    <div className="h-3 rounded w-full mb-1.5 bg-stone-200 dark:bg-slate-700" />
    <div className="h-3 rounded w-1/2 bg-stone-200 dark:bg-slate-700" />
  </div>
)

const SourceCard = ({ source }) => (
  <Link
    to={sourceHref(source.slug || source.id)}
    aria-label={source.name}
    className="group flex flex-col rounded-2xl border overflow-hidden transition-all duration-200
               bg-white border-stone-200
               hover:border-violet-400 hover:shadow-lg hover:shadow-violet-100/60
               dark:bg-slate-900 dark:border-slate-700
               dark:hover:border-violet-600/60 dark:hover:shadow-violet-900/20"
  >
    <div className="w-full h-28 overflow-hidden flex items-center justify-center bg-stone-100 dark:bg-slate-800">
      {source.logoUrl ? (
        <img
          src={source.logoUrl}
          alt={source.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-violet-50 dark:bg-violet-500/10">
          <Newspaper className="w-6 h-6 text-violet-600 dark:text-violet-400" />
        </div>
      )}
    </div>

    <div className="p-5 sm:p-6 flex flex-col flex-1">
      <span className="sr-only">{source.name}</span>

      {source.location && (
        <p className="flex items-center gap-1 text-xs mb-2 text-stone-400 dark:text-slate-500">
          <Building2 className="w-3 h-3 flex-shrink-0" />
          <span className="line-clamp-1">{source.location}</span>
        </p>
      )}

      {source.description && (
        <p className="text-xs text-stone-500 dark:text-slate-400 line-clamp-2 mb-4">
          {source.description}
        </p>
      )}

      <div className="mt-auto flex items-center justify-between pt-3 border-t border-stone-100 dark:border-slate-800">
        <span className="text-xs text-stone-400 dark:text-slate-500">
          <span className="font-semibold text-stone-700 dark:text-slate-300">
            {(source.totalArticles || 0).toLocaleString('id-ID')}
          </span>{' '}
          artikel
        </span>
        <span className="flex items-center gap-1 text-xs font-semibold text-violet-600 dark:text-violet-400">
          Lihat Arsip
          <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  </Link>
)

const NewspaperHomePage = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [categories, setCategories] = useState([])
  const [sources, setSources] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQ, setSearchQ] = useState('')

  useEffect(() => {
    document.title = 'Arsip Koran Digital — Koleksi Surat Kabar Bersejarah'
    Promise.all([
      api.get('/newspapers/stats'),
      api.get('/newspapers/categories'),
      api.get('/newspapers/sources', { params: { page: 1, limit: 100 } })
    ])
      .then(([s, c, src]) => {
        setStats(s.data?.data)
        setCategories(c.data?.data || [])
        setSources(src.data?.data?.list || [])
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQ.trim()) {
      navigate(`/koran/cari?q=${encodeURIComponent(searchQ.trim())}`)
    }
  }

  return (
    <div className="min-h-screen transition-colors duration-300 bg-stone-50 dark:bg-slate-950">
      <SEO
        title="Arsip Koran Digital — Portal Surat Kabar Bersejarah"
        description="Jelajahi arsip surat kabar bersejarah dari berbagai penerbit, lengkap dengan rubrik, edisi, dan tahun terbit."
        url="/koran"
        type="website"
        canonical="https://masasilam.com/koran"
      />

      <div className="border-b transition-colors bg-white border-stone-200 dark:bg-slate-900 dark:border-slate-700">
        <div className="container mx-auto px-4 max-w-7xl pt-10 pb-8 sm:pt-14 sm:pb-12">
          <div className="text-center mb-4">
            <h1
              className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-none mb-2
                         text-stone-900 dark:text-slate-50"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif', letterSpacing: '-0.03em' }}
            >
              Arsip Koran
            </h1>

            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="h-px flex-1 max-w-24 bg-stone-200 dark:bg-slate-700" />
              <p className="text-[10px] tracking-[0.4em] uppercase font-medium text-stone-400 dark:text-slate-500">
                Portal Arsip Surat Kabar
              </p>
              <div className="h-px flex-1 max-w-24 bg-stone-200 dark:bg-slate-700" />
            </div>

            {stats && (
              <div className="flex items-center justify-center gap-3 sm:gap-6 flex-wrap">
                {[
                  { v: stats.totalArticles, l: 'artikel' },
                  { v: stats.totalSources, l: 'surat kabar' },
                  { v: stats.totalCategories, l: 'rubrik' }
                ]
                  .filter((x) => x.v)
                  .map(({ v, l }) => (
                    <span key={l} className="text-xs text-stone-500 dark:text-slate-400">
                      <span className="font-semibold text-stone-800 dark:text-slate-200">
                        {Number(v).toLocaleString('id-ID')}
                      </span>{' '}
                      {l}
                    </span>
                  ))}
              </div>
            )}
          </div>

          <form onSubmit={handleSearch} className="max-w-xl mx-auto mt-6">
            <div className="flex items-stretch gap-2 h-11">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-stone-400 dark:text-slate-500" />
                <input
                  type="text"
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  placeholder="Cari artikel, topik, kata kunci…"
                  className="h-full w-full pl-10 pr-4 text-sm rounded-xl transition-all focus:outline-none
                             border border-stone-200 bg-stone-50 text-stone-900 placeholder-stone-400
                             focus:ring-2 focus:ring-violet-400/40 focus:border-violet-400
                             dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500
                             dark:focus:ring-violet-500/40 dark:focus:border-violet-500/60"
                />
              </div>
              <button
                type="submit"
                className="flex-shrink-0 flex items-center gap-1.5 px-5 rounded-xl text-sm font-semibold transition-all
                           bg-violet-600 hover:bg-violet-500 text-white shadow-sm shadow-violet-200/80 hover:shadow-md
                           dark:shadow-violet-900/40"
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Cari</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl pt-8 pb-16 sm:pt-12 sm:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-10">
            <section>
              <div className="flex items-center justify-between mb-5 pl-4 border-l-4 border-violet-500 dark:border-violet-400">
                <div>
                  <h2
                    className="font-serif text-xl sm:text-2xl font-bold leading-none text-stone-900 dark:text-slate-50"
                    style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                  >
                    Rubrik
                  </h2>
                  <p className="text-xs mt-0.5 text-stone-500 dark:text-slate-400">
                    Artikel lintas surat kabar berdasarkan rubrik
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {loading
                  ? Array.from({ length: 8 }, (_, i) => <SkeletonSource key={i} />)
                  : categories.map((cat) => {
                    const Icon = getGenreIcon(cat.slug)
                    return (
                      <Link
                        key={cat.slug}
                        to={rubrikHref(cat.slug)}
                        className="group rounded-2xl border p-4 transition-all duration-200
                                     bg-white border-stone-200 hover:border-violet-400 hover:shadow-md
                                     dark:bg-slate-900 dark:border-slate-700 dark:hover:border-violet-600/60"
                      >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2 bg-violet-50 dark:bg-violet-500/10">
                          <Icon className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                        </div>
                        <h3 className="font-bold text-xs leading-snug mb-0.5 text-stone-800 group-hover:text-violet-700 dark:text-slate-200 dark:group-hover:text-violet-300">
                          {cat.name}
                        </h3>
                        <p className="text-[10px] text-stone-400 dark:text-slate-500">
                          {(cat.articleCount || 0).toLocaleString('id-ID')} artikel
                        </p>
                      </Link>
                    )
                  })}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-5 pl-4 border-l-4 border-violet-500 dark:border-violet-400">
                <div>
                  <h2
                    className="font-serif text-xl sm:text-2xl font-bold leading-none text-stone-900 dark:text-slate-50"
                    style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                  >
                    Surat Kabar
                  </h2>
                  <p className="text-xs mt-0.5 text-stone-500 dark:text-slate-400">
                    {sources.length} surat kabar tersedia dalam arsip
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {loading
                  ? Array.from({ length: 6 }, (_, i) => <SkeletonSource key={i} />)
                  : sources.map((src) => <SourceCard key={src.id} source={src} />)}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border p-5 transition-colors bg-white border-stone-200 dark:bg-slate-900 dark:border-slate-700">
              <h3 className="text-xs font-bold uppercase tracking-wider mb-4 text-stone-400 dark:text-slate-500">
                Akses Cepat
              </h3>
              <div className="space-y-1">
                {[
                  { label: 'Pada Hari Ini', path: '/koran/hari-ini', icon: Clock },
                  { label: 'Pencarian Lanjutan', path: '/koran/cari', icon: Search }
                ].map(({ label, path, icon: Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group hover:bg-violet-50 dark:hover:bg-violet-500/10"
                  >
                    <Icon className="w-4 h-4 flex-shrink-0 transition-colors text-stone-400 group-hover:text-violet-600 dark:text-slate-500 dark:group-hover:text-violet-400" />
                    <span className="text-sm transition-colors text-stone-700 group-hover:text-violet-700 dark:text-slate-300 dark:group-hover:text-violet-300">
                      {label}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 ml-auto flex-shrink-0 transition-colors text-stone-300 group-hover:text-violet-500 dark:text-slate-600 dark:group-hover:text-violet-500" />
                  </Link>
                ))}
              </div>
            </div>

            {stats && (
              <div className="rounded-2xl border p-5 transition-colors bg-white border-stone-200 dark:bg-slate-800/60 dark:border-slate-700">
                <h3 className="text-xs font-bold uppercase tracking-wider mb-4 text-stone-400 dark:text-slate-500">
                  Statistik Arsip
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      label: 'Total Artikel',
                      value: (stats.totalArticles || 0).toLocaleString('id-ID'),
                      icon: BookOpen
                    },
                    {
                      label: 'Surat Kabar',
                      value: (stats.totalSources || 0).toLocaleString('id-ID'),
                      icon: Newspaper
                    },
                    { label: 'Rentang Arsip', value: stats.dateRange || '-', icon: Calendar }
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-stone-400 dark:text-slate-500">
                        <Icon className="w-3.5 h-3.5" />
                        <span className="text-xs">{label}</span>
                      </div>
                      <span className="font-bold text-sm text-stone-900 dark:text-white">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewspaperHomePage
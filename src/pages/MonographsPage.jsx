import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Archive, BookOpen, Search } from 'lucide-react'
import monographService from '../services/monographService'
import SEO from '../components/Common/SEO'
import { getWikimediaThumb } from '../utils/filmImages'

const MonographListCard = ({ m }) => {
  const thumbUrl = getWikimediaThumb(m.coverImageUrl, 400)
  return (
    <Link to={`/koran/monograf/${m.slug}`}
      className="group flex gap-4 p-4 rounded-2xl border bg-white border-stone-200 hover:border-rose-400 hover:shadow-md transition-all dark:bg-slate-900 dark:border-slate-700 dark:hover:border-rose-600">
      <div className="w-20 sm:w-24 flex-shrink-0 aspect-[2/3] rounded-lg overflow-hidden bg-stone-100 dark:bg-slate-800 relative">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-800 z-10" />
        {thumbUrl ? <img src={thumbUrl} alt={m.title} className="w-full h-full object-cover" loading="lazy" />
          : <div className="w-full h-full flex items-center justify-center"><Archive className="w-6 h-6 text-rose-400" /></div>}
      </div>
      <div className="flex-1 min-w-0">
        <span className="inline-block text-[9px] font-bold tracking-wide text-rose-700 dark:text-rose-400 mb-1">MONOGRAF DOKUMENTER</span>
        <h3 className="font-serif text-base sm:text-lg font-bold leading-snug mb-1 text-stone-900 dark:text-slate-50 group-hover:text-rose-700 dark:group-hover:text-rose-400 transition-colors line-clamp-2">{m.title}</h3>
        {m.subtitle && <p className="text-xs sm:text-sm text-stone-500 dark:text-slate-400 line-clamp-2 mb-2">{m.subtitle}</p>}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-400 dark:text-slate-500">
          <span>{m.newspaperSourceName}</span>
          <span>·</span>
          <span>{m.editionDateFormatted || m.editionDate}</span>
          <span>·</span>
          <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{m.totalArticles ?? 0} dokumen</span>
        </div>
      </div>
    </Link>
  )
}

const MonographsPage = () => {
  const [monographs, setMonographs] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const limit = 12

  const hasMore = monographs.length < totalCount

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    monographService.getMonographs({ page, limit, sortField: 'editionDate', sortOrder: 'DESC', q: query || undefined })
      .then(data => {
        if (cancelled) return
        const list = data?.list || []
        setMonographs(prev => (page === 1 ? list : [...prev, ...list]))
        setTotalCount(data?.totalCount || 0)
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [page, query])

  const handleSearchChange = useCallback((e) => {
    setQuery(e.target.value)
    setPage(1)
  }, [])

  return (
    <>
      <SEO
        title="Monograf Dokumenter — Kurasi Kritis Arsip Koran"
        description="Kumpulan monograf dokumenter hasil kurasi kritis dari edisi-edisi koran arsip, disusun dengan apparatus kritis akademik: kolofon, catatan filologis, indeks, dan glosarium."
        url="/koran/monograf"
      />
      <div className="min-h-screen bg-stone-50 dark:bg-slate-950">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-10 max-w-4xl">
          <div className="mb-8">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wide text-rose-700 dark:text-rose-400 mb-2"><Archive className="w-3.5 h-3.5" />ARSIP KORAN</span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-slate-50 mb-2">Monograf Dokumenter</h1>
            <p className="text-sm text-stone-500 dark:text-slate-400 max-w-2xl">Setiap monograf menata ulang artikel-artikel dari satu edisi koran menjadi satu alur naratif dokumenter, lengkap dengan apparatus kritis: kolofon, catatan filologis, indeks nama/tempat, dan glosarium istilah historis. Teks lengkap tiap dokumen tetap berada di halaman artikel aslinya — monograf ini adalah lapisan kurasi, bukan salinan.</p>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-slate-500" />
            <input value={query} onChange={handleSearchChange}
              placeholder="Cari monograf berdasarkan judul, sumber, atau tema..."
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-full border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-400/60" />
          </div>

          <div className="space-y-3">
            {loading && page === 1
              ? Array.from({ length: 5 }, (_, i) => <div key={i} className="h-28 rounded-2xl animate-pulse bg-stone-100 dark:bg-slate-800" />)
              : monographs.map(m => <MonographListCard key={m.id} m={m} />)}
          </div>

          {!loading && monographs.length === 0 && (
            <div className="text-center py-16">
              <Archive className="w-12 h-12 mx-auto mb-3 text-stone-300 dark:text-slate-700" />
              <p className="text-stone-400 dark:text-slate-500 text-sm">Belum ada monograf yang cocok.</p>
            </div>
          )}

          {hasMore && (
            <button onClick={() => setPage(p => p + 1)} disabled={loading}
              className="w-full mt-6 py-3 rounded-xl border text-sm font-semibold text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors disabled:opacity-50">
              {loading ? 'Memuat...' : 'Muat Lebih Banyak'}
            </button>
          )}
        </div>
      </div>
    </>
  )
}

export default MonographsPage
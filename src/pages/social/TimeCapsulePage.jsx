import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Clock, Calendar, Newspaper, ChevronLeft, ChevronRight,
  Loader2, History, BookOpen, Sparkles
} from 'lucide-react'
import { timeCapsuleService } from '../../services/socialService'
import toast from 'react-hot-toast'

const ArticleCard = ({ article }) => (
  <Link
    to={`/koran/${article.category}/${article.entitySlug}`}
    className="block bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-md transition-all group"
  >
    <div className="flex items-center gap-2 mb-2">
      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300">
        {article.category}
      </span>
    </div>
    <h3
      className="font-semibold text-sm leading-snug text-gray-900 dark:text-gray-100 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors line-clamp-3 mb-2"
      style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
    >
      {article.entityTitle}
    </h3>
    {article.excerpt && (
      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{article.excerpt}</p>
    )}
  </Link>
)

const TimeCapsulePage = () => {
  const [mode, setMode] = useState('today') // 'today' | 'custom'
  const [yearsAgo, setYearsAgo] = useState(78)
  const [customDate, setCustomDate] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const LIMIT = 20

  const load = useCallback(async () => {
    setLoading(true)
    try {
      let res
      if (mode === 'today') {
        res = await timeCapsuleService.getToday(yearsAgo, page, LIMIT)
      } else {
        if (!customDate) return
        res = await timeCapsuleService.get(customDate, page, LIMIT)
      }
      setData(res.data?.data)
    } catch {
      toast.error('Gagal memuat kapsul waktu')
    } finally {
      setLoading(false)
    }
  }, [mode, yearsAgo, customDate, page])

  useEffect(() => {
    load()
  }, [load])

  const totalPages = data ? Math.ceil((data.totalReaders || 0) / LIMIT) : 0

  const PRESET_YEARS = [10, 25, 50, 78]

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
          <History className="w-6 h-6 text-amber-500" />
          Kapsul Waktu
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Baca artikel koran dari hari yang sama di tahun yang berbeda
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 mb-6">
        <div className="flex gap-2 mb-4">
          {[
            { key: 'today', label: 'Hari Ini di Masa Lalu' },
            { key: 'custom', label: 'Tanggal Tertentu' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => { setMode(key); setPage(1) }}
              className={`flex-1 py-2 text-sm font-medium rounded-xl border transition-all ${
                mode === key
                  ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
                  : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {mode === 'today' ? (
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Tampilkan artikel dari berapa tahun lalu?</p>
            <div className="flex flex-wrap gap-2">
              {PRESET_YEARS.map(y => (
                <button
                  key={y}
                  onClick={() => { setYearsAgo(y); setPage(1) }}
                  className={`px-4 py-2 text-sm rounded-xl border transition-all ${
                    yearsAgo === y
                      ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 font-semibold'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-amber-300'
                  }`}
                >
                  {y} tahun lalu
                </button>
              ))}
              <div className="flex items-center gap-2">
                <input
                  type="number" min={1} max={120}
                  value={yearsAgo}
                  onChange={e => setYearsAgo(Number(e.target.value))}
                  className="w-20 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/30 text-gray-900 dark:text-gray-100"
                />
                <span className="text-sm text-gray-400">tahun</span>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Pilih Tanggal</label>
            <input
              type="date"
              value={customDate}
              onChange={e => { setCustomDate(e.target.value); setPage(1) }}
              className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/30 text-gray-900 dark:text-gray-100"
            />
          </div>
        )}
      </div>

      {/* Result Header */}
      {data && (
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 rounded-2xl border border-amber-200 dark:border-amber-800 mb-5">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="font-semibold text-amber-800 dark:text-amber-200">
              {data.formattedDate}
              {data.yearDifference > 0 && (
                <span className="font-normal text-amber-600 dark:text-amber-400"> · {data.yearDifference} tahun yang lalu</span>
              )}
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400">
              {data.totalReaders || (data.articles?.length || 0)} artikel ditemukan
            </p>
          </div>
        </div>
      )}

      {/* Articles */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : !data || (data.articles?.length === 0) ? (
        <div className="text-center py-16">
          <History className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">Tidak ada artikel untuk tanggal ini</p>
          <p className="text-sm text-gray-400 mt-1">Coba tanggal atau tahun yang berbeda</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.articles.map((article, i) => (
              <ArticleCard key={article.entityId || i} article={article} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border border-gray-200 dark:border-gray-700 rounded-xl disabled:opacity-40 hover:border-amber-400 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{page} / {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 border border-gray-200 dark:border-gray-700 rounded-xl disabled:opacity-40 hover:border-amber-400 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default TimeCapsulePage
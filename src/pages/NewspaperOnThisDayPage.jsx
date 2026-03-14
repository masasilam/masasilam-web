// src/pages/NewspaperOnThisDayPage.jsx
// Menampilkan artikel "Pada Hari Ini" — lintas tahun

import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Clock, ChevronRight, ChevronLeft, BookOpen, Calendar } from 'lucide-react'
import api from '../services/api'

const CATEGORY_ICONS = {
  olahraga: '⚽', politik: '🏛️', ekonomi: '💰', budaya: '🎭',
  pendidikan: '📚', kesehatan: '🏥', teknologi: '💻', hiburan: '🎬',
}
const CATEGORY_NAMES = {
  olahraga: 'Olahraga', politik: 'Politik', ekonomi: 'Ekonomi',
  budaya: 'Budaya', pendidikan: 'Pendidikan', kesehatan: 'Kesehatan',
  teknologi: 'Teknologi', hiburan: 'Hiburan',
}

const MONTHS_ID = [
  '', 'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember'
]

const NewspaperOnThisDayPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [articles, setArticles] = useState([])
  const [total, setTotal]       = useState(0)
  const [loading, setLoading]   = useState(true)

  const today = new Date()
  const month = parseInt(searchParams.get('month') || String(today.getMonth() + 1))
  const day   = parseInt(searchParams.get('day')   || String(today.getDate()))
  const page  = parseInt(searchParams.get('page')  || '1')
  const limit = 20
  const totalPages = Math.ceil(total / limit)

  const fetchArticles = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/newspapers/on-this-day', { params: { month, day, page, limit } })
      const data = res.data?.data
      setArticles(data?.list || [])
      setTotal(data?.total || 0)
    } catch (e) { console.error(e) }
      finally { setLoading(false) }
  }, [month, day, page])

  useEffect(() => {
    document.title = `${day} ${MONTHS_ID[month]} dalam Sejarah — Arsip Koran`
    fetchArticles()
  }, [fetchArticles, month, day])

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    next.set(key, String(value))
    next.delete('page')
    setSearchParams(next)
  }

  const prevDay = () => {
    let d = day - 1, m = month
    if (d < 1) { m = m - 1; if (m < 1) m = 12; d = new Date(2024, m, 0).getDate() }
    const next = new URLSearchParams({ month: m, day: d })
    setSearchParams(next)
  }
  const nextDay = () => {
    const daysInMonth = new Date(2024, month, 0).getDate()
    let d = day + 1, m = month
    if (d > daysInMonth) { d = 1; m = m + 1; if (m > 12) m = 1 }
    const next = new URLSearchParams({ month: m, day: d })
    setSearchParams(next)
  }

  const isToday = month === (today.getMonth() + 1) && day === today.getDate()

  // Group by year
  const grouped = {}
  articles.forEach(art => {
    const year = art.publishDate?.split('-')[0] || '?'
    if (!grouped[year]) grouped[year] = []
    grouped[year].push(art)
  })
  const years = Object.keys(grouped).sort((a, b) => b - a)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

      {/* Header */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/20 border-b border-amber-200 dark:border-amber-800">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400 mb-4">
            <Link to="/koran" className="hover:underline">Koran</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>Pada Hari Ini</span>
          </div>

          <div className="flex items-center justify-between">
            <button onClick={prevDay}
              className="p-2.5 rounded-xl border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition">
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="text-center">
              <div className="flex items-center gap-2 justify-center mb-1">
                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                {isToday && (
                  <span className="px-2 py-0.5 bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 text-xs font-bold rounded-full">HARI INI</span>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-amber-900 dark:text-amber-200"
                  style={{ fontFamily: 'Georgia, serif' }}>
                {day} {MONTHS_ID[month]}
              </h1>
              <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                {total.toLocaleString('id-ID')} artikel dari berbagai tahun
              </p>
            </div>

            <button onClick={nextDay}
              className="p-2.5 rounded-xl border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-3 justify-center mt-5">
            <select value={day} onChange={e => setParam('day', e.target.value)}
              className="px-3 py-2 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-gray-800 text-amber-900 dark:text-amber-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
              {Array.from({ length: 31 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
            <select value={month} onChange={e => setParam('month', e.target.value)}
              className="px-3 py-2 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-gray-800 text-amber-900 dark:text-amber-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
              {MONTHS_ID.slice(1).map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Articles by Year */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-3" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-24">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-200 dark:text-gray-700" />
            <p className="text-gray-400 font-medium">Tidak ada artikel untuk tanggal ini</p>
            <p className="text-sm text-gray-400 mt-1">Coba tanggal lain</p>
          </div>
        ) : (
          <div className="space-y-6">
            {years.map(year => (
              <section key={year}>
                {/* Year Marker */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-black text-amber-700 dark:text-amber-400">{year}</span>
                  </div>
                  <div className="flex-1 border-t border-amber-200 dark:border-amber-800" />
                  <span className="text-xs text-amber-600 dark:text-amber-500">{grouped[year].length} artikel</span>
                </div>

                <div className="space-y-2 pl-3 border-l-2 border-amber-100 dark:border-amber-900 ml-6">
                  {grouped[year].map(art => (
                    <Link key={art.id}
                      to={`/koran/${art.category}/${art.publishDate}/${art.slug}`}
                      className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-700 transition group">
                      {art.imageUrl && (
                        <img src={art.imageUrl} alt="" className="w-14 h-10 object-cover rounded-lg flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs text-gray-400">
                            {CATEGORY_ICONS[art.category]} {CATEGORY_NAMES[art.category] || art.category}
                          </span>
                          {art.source && <>
                            <span className="text-gray-200 dark:text-gray-700">·</span>
                            <span className="text-xs text-gray-400">{art.source}</span>
                          </>}
                        </div>
                        <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition"
                            style={{ fontFamily: 'Georgia, serif' }}>
                          {art.title}
                        </h3>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <button onClick={() => setParam('page', page - 1)} disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-500">Hal. {page} / {totalPages}</span>
                <button onClick={() => setParam('page', page + 1)} disabled={page === totalPages}
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default NewspaperOnThisDayPage
import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { ChevronRight, Calendar, Newspaper } from 'lucide-react'
import api from '../services/api'
import SEO from '../components/Common/SEO'
import { editionHref } from '../utils/newspaperUtils'

const MONTHS_ID = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

const SkeletonEdition = () => (
    <div className="animate-pulse flex items-center gap-4 p-4 rounded-xl border bg-white border-stone-100 dark:bg-slate-900 dark:border-slate-800">
        <div className="w-10 h-10 rounded-lg bg-stone-200 dark:bg-slate-700 flex-shrink-0" />
        <div className="flex-1 h-3 rounded bg-stone-200 dark:bg-slate-700" />
    </div>
)

const NewspaperYearPage = () => {
    const { sourceSlug, second: year } = useParams()
    const [searchParams, setSearchParams] = useSearchParams()
    const [editions, setEditions] = useState([])
    const [loading, setLoading] = useState(true)

    const month = searchParams.get('month') || ''

    const fetchEditions = useCallback(() => {
        setLoading(true)
        api.get(`/newspapers/${sourceSlug}/${year}`, { params: month ? { month } : {} })
            .then(res => {
                setEditions(res.data?.data || [])
                document.title = `Edisi Tahun ${year} — ${sourceSlug} — Arsip Koran`
            })
            .catch(() => setEditions([]))
            .finally(() => setLoading(false))
    }, [sourceSlug, year, month])

    useEffect(() => { fetchEditions() }, [fetchEditions])

    const setMonthFilter = value => {
        const next = new URLSearchParams(searchParams)
        if (value) next.set('month', value); else next.delete('month')
        setSearchParams(next)
    }

    const canonicalPath = `/koran/${sourceSlug}/${year}`

    return (
        <div className="min-h-screen transition-colors duration-300 bg-stone-50 dark:bg-slate-950">

            <SEO title={`Edisi Tahun ${year} — ${sourceSlug} — Arsip Koran`} description={`Daftar edisi surat kabar ${sourceSlug} yang terbit sepanjang tahun ${year}.`} url={canonicalPath} type="website" canonical={`https://masasilam.com${canonicalPath}`} />

            <div className="border-b transition-colors bg-white border-stone-200 dark:bg-slate-900 dark:border-slate-700">
                <div className="container mx-auto px-4 max-w-4xl py-6 sm:py-8">
                    <nav className="flex items-center gap-1.5 text-xs mb-5 text-stone-400 dark:text-slate-500">
                        <Link to="/koran" className="hover:text-stone-700 dark:hover:text-slate-300 transition">Koran</Link>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <Link to={`/koran/${sourceSlug}`} className="hover:text-stone-700 dark:hover:text-slate-300 transition">{sourceSlug}</Link>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <span className="font-medium text-stone-600 dark:text-slate-400">{year}</span>
                    </nav>

                    <h1 className="text-2xl sm:text-4xl font-black leading-tight text-stone-900 dark:text-slate-50" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>Edisi Tahun {year}</h1>

                    <div className="flex items-center gap-2 mt-5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                        <button onClick={() => setMonthFilter('')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${!month ? 'bg-violet-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'}`}>Semua Bulan</button>
                        {MONTHS_ID.slice(1).map((m, i) => (
                            <button key={m} onClick={() => setMonthFilter(String(i + 1))}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${month === String(i + 1) ? 'bg-violet-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'}`}>{m}</button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-4xl py-6 sm:py-8">
                {loading ? (
                    <div className="space-y-3">{Array.from({ length: 8 }, (_, i) => <SkeletonEdition key={i} />)}</div>
                ) : editions.length === 0 ? (
                    <div className="text-center py-24">
                        <Calendar className="w-16 h-16 mx-auto mb-4 text-stone-200 dark:text-slate-700" />
                        <p className="font-medium mb-1 text-stone-500 dark:text-slate-400">Tidak ada edisi ditemukan</p>
                        <p className="text-sm text-stone-400 dark:text-slate-500">Coba pilih bulan lain</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {editions.map(ed => (
                            <Link key={ed.publishDate} to={editionHref(sourceSlug, ed.publishDate)}
                                className="group flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 bg-white border-stone-100 hover:border-violet-300 hover:shadow-md dark:bg-slate-900 dark:border-slate-800 dark:hover:border-violet-700/50">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-violet-50 dark:bg-violet-500/10">
                                    <Newspaper className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-sm text-stone-800 group-hover:text-violet-700 dark:text-slate-200 dark:group-hover:text-violet-300" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>{ed.dateFormatted || ed.publishDate}</h3>
                                </div>
                                <span className="text-xs text-stone-400 dark:text-slate-500 flex-shrink-0">{ed.articleCount} artikel</span>
                                <ChevronRight className="w-4 h-4 flex-shrink-0 text-stone-300 group-hover:text-violet-500 dark:text-slate-600" />
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default NewspaperYearPage
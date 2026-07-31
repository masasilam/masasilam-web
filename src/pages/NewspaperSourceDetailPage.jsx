import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronRight, Newspaper, Calendar, BookOpen, Building2 } from 'lucide-react'
import api from '../services/api'
import SEO from '../components/Common/SEO'
import { yearHref } from '../utils/newspaperUtils'

const SkeletonYearCard = () => (
    <div className="animate-pulse rounded-xl border p-5 h-24 bg-white border-stone-200 dark:bg-slate-900 dark:border-slate-700" />
)

const NewspaperSourceDetailPage = () => {
    const { sourceSlug } = useParams()
    const [source, setSource] = useState(null)
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)

    useEffect(() => {
        setLoading(true)
        setNotFound(false)
        api
            .get(`/newspapers/${sourceSlug}`)
            .then((res) => {
                const data = res.data?.data
                setSource(data)
                document.title = `${data?.name || 'Surat Kabar'} — Arsip Koran`
            })
            .catch((err) => {
                if (err.response?.status === 404) setNotFound(true)
            })
            .finally(() => setLoading(false))
    }, [sourceSlug])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-slate-950">
                <div className="w-8 h-8 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
            </div>
        )
    }

    if (notFound || !source) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center p-8 bg-stone-50 dark:bg-slate-950">
                <Newspaper className="w-16 h-16 mb-4 text-stone-200 dark:text-slate-700" />
                <h1 className="text-2xl font-bold mb-2 text-stone-800 dark:text-slate-200">
                    Surat Kabar Tidak Ditemukan
                </h1>
                <Link
                    to="/koran"
                    className="px-5 py-2.5 rounded-xl font-semibold text-sm transition-all bg-violet-600 hover:bg-violet-500 text-white"
                >
                    Kembali ke Arsip Koran
                </Link>
            </div>
        )
    }

    const years = source.years || []
    const canonicalPath = `/koran/${sourceSlug}`

    return (
        <div className="min-h-screen transition-colors duration-300 bg-stone-50 dark:bg-slate-950">
            <SEO
                title={`${source.name} — Arsip Koran`}
                description={
                    source.description ||
                    `Arsip digital surat kabar ${source.name}, ${(source.totalArticles || 0).toLocaleString(
                        'id-ID'
                    )} artikel dari ${source.yearFrom || '-'} hingga ${source.yearTo || '-'}.`
                }
                url={canonicalPath}
                type="website"
                canonical={`https://masasilam.com${canonicalPath}`}
            />

            <div className="border-b transition-colors bg-white border-stone-200 dark:bg-slate-900 dark:border-slate-700">
                <div className="container mx-auto px-4 max-w-5xl py-6 sm:py-8">
                    <nav className="flex items-center gap-1.5 text-xs mb-5 text-stone-400 dark:text-slate-500">
                        <Link to="/koran" className="hover:text-stone-700 dark:hover:text-slate-300 transition">
                            Koran
                        </Link>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <span className="font-medium text-stone-600 dark:text-slate-400">{source.name}</span>
                    </nav>

                    <div className="flex items-center gap-4">
                        {source.logoUrl ? (
                            <div className="w-full sm:w-72 h-20 sm:h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-stone-900 flex items-center justify-center">
                                <img
                                    src={source.logoUrl}
                                    alt={source.name}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        ) : (
                            <div
                                className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0
                           bg-violet-50 dark:bg-violet-500/10"
                            >
                                <Newspaper className="w-8 h-8 text-violet-600 dark:text-violet-400" />
                            </div>
                        )}

                        <div className="min-w-0">
                            <h1
                                className="text-2xl sm:text-4xl font-black leading-tight text-stone-900 dark:text-slate-50"
                                style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                            >
                                {source.name}
                            </h1>
                            {source.location && (
                                <p className="flex items-center gap-1.5 text-sm mt-1.5 text-stone-500 dark:text-slate-400">
                                    <Building2 className="w-3.5 h-3.5" />
                                    {source.location}
                                </p>
                            )}
                            {source.description && (
                                <p className="text-sm mt-3 text-stone-600 dark:text-slate-300 max-w-2xl">
                                    {source.description}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-6 mt-6 flex-wrap">
                        {[
                            { v: source.articleCount, l: 'artikel', icon: BookOpen },
                            { v: source.editionCount, l: 'edisi', icon: Newspaper },
                            {
                                v:
                                    source.yearFrom && source.yearTo
                                        ? `${source.yearFrom}–${source.yearTo}`
                                        : null,
                                l: 'rentang tahun',
                                icon: Calendar
                            }
                        ]
                            .filter((x) => x.v)
                            .map(({ v, l, icon: Icon }) => (
                                <div key={l} className="flex items-center gap-2">
                                    <Icon className="w-4 h-4 text-violet-500" />
                                    <span className="text-sm">
                                        <span className="font-bold text-stone-800 dark:text-slate-200">
                                            {typeof v === 'number' ? v.toLocaleString('id-ID') : v}
                                        </span>{' '}
                                        <span className="text-stone-400 dark:text-slate-500">{l}</span>
                                    </span>
                                </div>
                            ))}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-5xl py-8 sm:py-10">
                <div className="flex items-center gap-3 mb-5 pl-4 border-l-4 border-violet-500 dark:border-violet-400">
                    <div>
                        <h2
                            className="font-serif text-xl sm:text-2xl font-bold leading-none text-stone-900 dark:text-slate-50"
                            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                        >
                            Daftar Tahun Terbit
                        </h2>
                        <p className="text-xs mt-0.5 text-stone-500 dark:text-slate-400">
                            {years.length} tahun tersedia dalam arsip
                        </p>
                    </div>
                </div>

                {years.length === 0 ? (
                    <div className="text-center py-16">
                        <Calendar className="w-16 h-16 mx-auto mb-4 text-stone-200 dark:text-slate-700" />
                        <p className="font-medium text-stone-500 dark:text-slate-400">
                            Belum ada edisi tersedia untuk surat kabar ini
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {years.map((year) => (
                            <Link
                                key={year}
                                to={yearHref(sourceSlug, year)}
                                className="group flex flex-col items-center justify-center gap-1 py-6 rounded-2xl border transition-all duration-200
                           bg-white border-stone-200 hover:border-violet-400 hover:shadow-md
                           dark:bg-slate-900 dark:border-slate-700 dark:hover:border-violet-600/60"
                            >
                                <span
                                    className="text-2xl font-black text-stone-800 group-hover:text-violet-700 dark:text-slate-200 dark:group-hover:text-violet-300"
                                    style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                                >
                                    {year}
                                </span>
                                <span className="text-[10px] uppercase tracking-widest text-stone-400 dark:text-slate-500">
                                    Lihat Edisi
                                </span>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default NewspaperSourceDetailPage
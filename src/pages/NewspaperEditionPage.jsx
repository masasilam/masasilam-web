import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronRight, Calendar, BookOpen } from 'lucide-react'
import api from '../services/api'
import useNewspaperCategories from '../hooks/useNewspaperCategories'
import SEO from '../components/Common/SEO'
import { articleHref, primaryGenreSlug } from '../utils/newspaperUtils'

const formatDate = d => {
    try {
        return new Date(d + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    } catch { return d }
}

const SkeletonRow = () => (
    <div className="animate-pulse flex items-start gap-4 p-4 rounded-xl border bg-white border-stone-100 dark:bg-slate-900 dark:border-slate-800">
        <div className="w-20 h-14 rounded-lg bg-stone-200 dark:bg-slate-700 flex-shrink-0" />
        <div className="flex-1 space-y-2">
            <div className="h-2.5 rounded w-1/3 bg-stone-200 dark:bg-slate-700" />
            <div className="h-4 rounded w-full bg-stone-200 dark:bg-slate-700" />
        </div>
    </div>
)

const ArticleRow = ({ article, getIcon, getLabel }) => (
    <Link to={articleHref(article)} className="group flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 bg-white border-stone-100 hover:border-violet-300 hover:shadow-md dark:bg-slate-900 dark:border-slate-800 dark:hover:border-violet-700/50">
        {article.imageUrl && <img src={article.imageUrl} alt="" className="w-20 h-14 object-cover rounded-lg flex-shrink-0" loading="lazy" />}
        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
                {article.importance === 'high' && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">UTAMA</span>}
                {(() => { const GIcon = getIcon(primaryGenreSlug(article)); return <span className="flex items-center gap-1 text-[10px] text-stone-400 dark:text-slate-500"><GIcon className="w-3 h-3" />{getLabel(primaryGenreSlug(article))}</span> })()}
                {article.pageNumber && <span className="text-[10px] text-stone-300 dark:text-slate-600">· Hal. {article.pageNumber}</span>}
            </div>
            <h3 className="font-bold text-sm leading-snug line-clamp-2 mb-1 transition-colors text-stone-800 group-hover:text-violet-700 dark:text-slate-200 dark:group-hover:text-violet-300" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>{article.title}</h3>
            {article.authorNames && <p className="text-[10px] text-stone-400 dark:text-slate-500">Oleh {article.authorNames}</p>}
        </div>
    </Link>
)

const NewspaperEditionPage = () => {
    const { sourceSlug, year, edition } = useParams()
    const { getLabel, getIcon } = useNewspaperCategories()
    const [articles, setArticles] = useState([])
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)

    useEffect(() => {
        setLoading(true); setNotFound(false)
        api.get(`/newspapers/${sourceSlug}/${year}/${edition}`)
            .then(res => {
                setArticles(res.data?.data || [])
                document.title = `Edisi ${formatDate(edition)} — Arsip Koran`
            })
            .catch(err => { if (err.response?.status === 404) setNotFound(true) })
            .finally(() => setLoading(false))
    }, [sourceSlug, year, edition])

    const canonicalPath = `/koran/${sourceSlug}/${year}/${edition}`

    return (
        <div className="min-h-screen transition-colors duration-300 bg-stone-50 dark:bg-slate-950">

            <SEO title={`Edisi ${formatDate(edition)} — Arsip Koran`} description={`Daftar artikel dalam edisi ${sourceSlug} tanggal ${formatDate(edition)}.`} url={canonicalPath} type="website" canonical={`https://masasilam.com${canonicalPath}`} />

            <div className="border-b transition-colors bg-white border-stone-200 dark:bg-slate-900 dark:border-slate-700">
                <div className="container mx-auto px-4 max-w-4xl py-6 sm:py-8">
                    <nav className="flex items-center gap-1.5 text-xs mb-5 text-stone-400 dark:text-slate-500">
                        <Link to="/koran" className="hover:text-stone-700 dark:hover:text-slate-300 transition">Koran</Link>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <Link to={`/koran/${sourceSlug}`} className="hover:text-stone-700 dark:hover:text-slate-300 transition">{sourceSlug}</Link>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <Link to={`/koran/${sourceSlug}/${year}`} className="hover:text-stone-700 dark:hover:text-slate-300 transition">{year}</Link>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <span className="font-medium text-stone-600 dark:text-slate-400">Edisi</span>
                    </nav>

                    <div className="text-center">
                        <p className="text-[10px] tracking-[0.3em] uppercase mb-1 text-stone-400 dark:text-slate-500">Edisi</p>
                        <h1 className="text-xl sm:text-3xl font-black leading-tight text-stone-900 dark:text-slate-50" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>{formatDate(edition)}</h1>
                        {!loading && articles.length > 0 && <p className="text-xs mt-2 text-stone-400 dark:text-slate-500">{articles.length} artikel dalam edisi ini</p>}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-4xl py-6 sm:py-8">
                {loading ? (
                    <div className="space-y-3">{Array.from({ length: 8 }, (_, i) => <SkeletonRow key={i} />)}</div>
                ) : notFound || articles.length === 0 ? (
                    <div className="text-center py-24">
                        <BookOpen className="w-16 h-16 mx-auto mb-4 text-stone-200 dark:text-slate-700" />
                        <p className="font-medium mb-1 text-stone-500 dark:text-slate-400">Tidak ada artikel pada edisi ini</p>
                    </div>
                ) : (
                    <div className="space-y-3">{articles.map(art => <ArticleRow key={art.id} article={art} getIcon={getIcon} getLabel={getLabel} />)}</div>
                )}
            </div>
        </div>
    )
}

export default NewspaperEditionPage
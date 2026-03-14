// src/pages/NewspaperArticleDetailPage.jsx

import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ChevronRight, Calendar, User, Newspaper, Eye, BookOpen,
  Share2, ChevronLeft, Clock, Tag
} from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

const CATEGORIES = [
  { value: 'nasional',          label: 'Nasional',           icon: '🇮🇩' },
  { value: 'internasional',     label: 'Internasional',      icon: '🌏' },
  { value: 'daerah',            label: 'Daerah / Lokal',     icon: '📍' },
  { value: 'politik',           label: 'Politik',            icon: '🏛️' },
  { value: 'hukum',             label: 'Hukum & Kriminal',   icon: '⚖️' },
  { value: 'pemerintahan',      label: 'Pemerintahan',       icon: '🏢' },
  { value: 'ekonomi',           label: 'Ekonomi',            icon: '💰' },
  { value: 'bisnis',            label: 'Bisnis & Keuangan',  icon: '📈' },
  { value: 'pertanian',         label: 'Pertanian',          icon: '🌾' },
  { value: 'sosial',            label: 'Sosial',             icon: '👥' },
  { value: 'pendidikan',        label: 'Pendidikan',         icon: '📚' },
  { value: 'kesehatan',         label: 'Kesehatan',          icon: '🏥' },
  { value: 'agama',             label: 'Agama',              icon: '🕌' },
  { value: 'lingkungan',        label: 'Lingkungan',         icon: '🌿' },
  { value: 'teknologi',         label: 'Teknologi',          icon: '💻' },
  { value: 'sains',             label: 'Sains & Iptek',      icon: '🔬' },
  { value: 'budaya',            label: 'Budaya',             icon: '🎭' },
  { value: 'hiburan',           label: 'Hiburan',            icon: '🎬' },
  { value: 'olahraga',          label: 'Olahraga',           icon: '⚽' },
  { value: 'gaya-hidup',        label: 'Gaya Hidup',         icon: '✨' },
  { value: 'kuliner',           label: 'Kuliner',            icon: '🍜' },
  { value: 'wisata',            label: 'Wisata',             icon: '✈️' },
  { value: 'opini',             label: 'Opini / Kolom',      icon: '✍️' },
  { value: 'sastra',            label: 'Sastra & Cerita',    icon: '📖' },
  { value: 'cerita-bersambung', label: 'Cerita Bersambung',  icon: '📜' },
  { value: 'iklan',             label: 'Iklan / Pengumuman', icon: '📢' },
  { value: 'lainnya',           label: 'Lainnya',            icon: '📰' },
]
const CAT_MAP = Object.fromEntries(CATEGORIES.map(c => [c.value, c]))
const getCatLabel = (v) => CAT_MAP[v]?.label || v
const getCatIcon  = (v) => CAT_MAP[v]?.icon  || '📰'

// ─── Scoped CSS untuk konten artikel ─────────────────────────────────────────
// Tidak pakai class prose Tailwind agar atribut HTML seperti ol[type="A"] dihormati
const NEWSPAPER_CONTENT_CSS = `
  .newspaper-content ol { list-style: decimal; padding-left: 2em; margin: .75em 0; }
  .newspaper-content ul { list-style: disc;    padding-left: 2em; margin: .75em 0; }
  .newspaper-content ol[type="A"] { list-style-type: upper-alpha; }
  .newspaper-content ol[type="a"] { list-style-type: lower-alpha; }
  .newspaper-content ol[type="I"] { list-style-type: upper-roman; }
  .newspaper-content ol[type="i"] { list-style-type: lower-roman; }
  .newspaper-content ol[type="1"] { list-style-type: decimal; }
  .newspaper-content li { margin-bottom: .4em; display: list-item; }
  .newspaper-content p  { margin-bottom: .75em; }
  .newspaper-content h1 { font-size: 2em;   font-weight: 800; margin: 1.25rem 0 .5rem; }
  .newspaper-content h2 { font-size: 1.6em; font-weight: 700; margin: 1.1rem 0 .4rem; }
  .newspaper-content h3 { font-size: 1.3em; font-weight: 600; margin: .9rem 0 .3rem; }
  .newspaper-content a  { color: #10b981; text-decoration: underline; }
  .newspaper-content blockquote { border-left: 4px solid #10b981; padding: .75rem 1.25rem; margin: 1rem 0; background: rgba(16,185,129,.06); border-radius: 0 .375rem .375rem 0; font-style: italic; }
  .newspaper-content img { max-width: 100%; border-radius: .5rem; margin: .75rem auto; display: block; }
  .newspaper-content pre { background: #1e293b; color: #e2e8f0; padding: 1rem; border-radius: .5rem; overflow-x: auto; font-size: .875em; }
`

const NewspaperArticleDetailPage = () => {
  const { categorySlug, date, articleSlug } = useParams()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    setLoading(true)
    setNotFound(false)
    api.get(`/newspapers/${categorySlug}/${date}/${articleSlug}`)
      .then(res => {
        const data = res.data?.data
        setArticle(data)
        document.title = `${data?.title || 'Artikel'} — Arsip Koran`
      })
      .catch(err => {
        if (err.response?.status === 404) setNotFound(true)
        else toast.error('Gagal memuat artikel')
      })
      .finally(() => setLoading(false))
  }, [categorySlug, date, articleSlug])

  const handleShare = async () => {
    try {
      await navigator.share({ title: article.title, url: window.location.href })
    } catch {
      navigator.clipboard.writeText(window.location.href)
      toast.success('URL disalin!')
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
    </div>
  )

  if (notFound || !article) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center text-center p-8">
      <BookOpen className="w-16 h-16 text-gray-300 mb-4" />
      <h1 className="text-2xl font-bold mb-2">Artikel Tidak Ditemukan</h1>
      <p className="text-gray-500 mb-6">Artikel yang Anda cari mungkin telah dipindahkan atau dihapus.</p>
      <Link to="/koran" className="px-5 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:opacity-90 transition">
        Kembali ke Koran
      </Link>
    </div>
  )

  const catName = article.categoryName || getCatLabel(article.category)
  const catIcon = getCatIcon(article.category)

  const sourceName = article.sourceName || article.source?.name || null

  const htmlContent  = article.bodyOriginal || article.bodyModern || ''
  const plainContent = article.content || ''

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

      {/* ── Scoped CSS untuk konten artikel ── */}
      <style>{NEWSPAPER_CONTENT_CSS}</style>

      {/* Category Banner */}
      <div className="bg-gray-900 dark:bg-gray-950 text-white py-2 px-4">
        <div className="max-w-5xl mx-auto flex items-center gap-2 text-xs">
          <Link to="/koran" className="text-gray-400 hover:text-white transition">Koran</Link>
          <ChevronRight className="w-3 h-3 text-gray-600" />
          <Link to={`/koran/kategori/${article.category}`}
            className="text-gray-400 hover:text-white transition flex items-center gap-1">
            {catIcon} {catName}
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-600" />
          <Link to={`/koran/tanggal/${article.publishDate}`}
            className="text-gray-400 hover:text-white transition">
            {article.dateFormatted || article.publishDate}
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── MAIN ARTICLE ── */}
          <article className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">

              {/* Category Tag */}
              <div className="px-6 pt-6 flex items-center gap-3">
                <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-bold text-gray-700 dark:text-gray-300">
                  {catIcon} {catName}
                </span>
                {article.importance === 'high' && (
                  <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-bold">
                    BERITA UTAMA
                  </span>
                )}
              </div>

              {/* Title */}
              <div className="px-6 py-4">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-tight mb-2"
                    style={{ fontFamily: 'Georgia, serif' }}>
                  {article.title}
                </h1>

                {/* Subtitle */}
                {article.subtitle && (
                  <p className="text-base italic text-gray-600 dark:text-gray-400 mb-4 border-l-4 border-gray-200 dark:border-gray-600 pl-4">
                    {article.subtitle}
                  </p>
                )}

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500 pb-4 border-b border-gray-100 dark:border-gray-700">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {article.dateFormatted || article.publishDate}
                  </span>
                  {sourceName && (
                    <span className="flex items-center gap-1.5">
                      <Newspaper className="w-3.5 h-3.5" />
                      {sourceName}
                    </span>
                  )}
                  {article.author && (
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      {article.author}
                    </span>
                  )}
                  {article.pageNumber && (
                    <span>Halaman {article.pageNumber}</span>
                  )}
                  {article.viewCount > 0 && (
                    <span className="flex items-center gap-1.5 ml-auto">
                      <Eye className="w-3.5 h-3.5" />
                      {article.viewCount.toLocaleString('id-ID')} tayangan
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-3">
                  <button onClick={handleShare}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-xs text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <Share2 className="w-3.5 h-3.5" />Bagikan
                  </button>
                  {article.wordCount > 0 && (
                    <span className="flex items-center gap-1.5 text-xs text-gray-400 ml-auto">
                      <Clock className="w-3.5 h-3.5" />
                      ~{Math.max(1, Math.ceil(article.wordCount / 200))} mnt baca · {article.wordCount.toLocaleString('id-ID')} kata
                    </span>
                  )}
                </div>
              </div>

              {/* Featured Image */}
              {article.imageUrl && (
                <figure className="mx-6 mb-6">
                  <img src={article.imageUrl} alt={article.title}
                    className="w-full rounded-xl object-cover max-h-96" />
                </figure>
              )}

              {/* Konten — pakai .newspaper-content tanpa prose Tailwind */}
              <div className="px-6 pb-8">
                {htmlContent ? (
                  <div
                    className="newspaper-content"
                    style={{ fontFamily: 'Georgia, serif', lineHeight: 1.9, fontSize: '1rem', color: 'inherit' }}
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                  />
                ) : plainContent ? (
                  <div
                    className="text-gray-700 dark:text-gray-300 leading-relaxed text-base whitespace-pre-wrap"
                    style={{ fontFamily: 'Georgia, serif', lineHeight: 1.9 }}>
                    {plainContent}
                  </div>
                ) : (
                  <p className="text-gray-400 italic text-sm">Konten artikel tidak tersedia.</p>
                )}
              </div>

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="px-6 pb-6 flex items-center gap-2 flex-wrap">
                  <Tag className="w-3.5 h-3.5 text-gray-400" />
                  {(typeof article.tags === 'string' ? article.tags.split(',') : article.tags).map(tag => (
                    <span key={tag}
                      className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-xs">
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Same Date Articles */}
            {article.sameDateArticles && article.sameDateArticles.length > 0 && (
              <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-black text-gray-900 dark:text-white text-sm uppercase tracking-wider"
                      style={{ fontFamily: 'Georgia, serif' }}>
                    Edisi yang Sama
                  </h2>
                  <Link to={`/koran/tanggal/${article.publishDate}`}
                    className="text-xs text-primary hover:underline">Lihat semua</Link>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {article.sameDateArticles.map(a => (
                    <Link key={a.id} to={`/koran/${a.category}/${a.publishDate}/${a.slug}`}
                      className="flex items-start gap-3 py-3 group">
                      {a.imageUrl && (
                        <img src={a.imageUrl} alt="" className="w-14 h-10 object-cover rounded-lg flex-shrink-0" />
                      )}
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">
                          {getCatIcon(a.category)} {getCatLabel(a.category)}
                        </p>
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 line-clamp-2 group-hover:text-primary transition">
                          {a.title}
                        </h3>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </article>

          {/* ── SIDEBAR ── */}
          <aside className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Info Artikel</h3>
              <div className="space-y-3 text-sm">
                {[
                  { label: 'Kategori',       value: `${catIcon} ${catName}` },
                  { label: 'Tanggal Terbit', value: article.dateFormatted || article.publishDate },
                  sourceName             && { label: 'Sumber',      value: sourceName },
                  article.author         && { label: 'Penulis',     value: article.author },
                  article.pageNumber     && { label: 'Halaman',     value: `Hal. ${article.pageNumber}` },
                  article.wordCount      && { label: 'Jumlah Kata', value: `${article.wordCount.toLocaleString('id-ID')} kata` },
                  article.viewCount > 0  && { label: 'Tayangan',   value: article.viewCount.toLocaleString('id-ID') },
                ].filter(Boolean).map(({ label, value }) => (
                  <div key={label} className="flex justify-between gap-4">
                    <span className="text-gray-500 flex-shrink-0">{label}</span>
                    <span className="font-medium text-gray-900 dark:text-white text-right">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Related Articles */}
            {article.relatedArticles && article.relatedArticles.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Artikel Terkait</h3>
                <div className="space-y-3">
                  {article.relatedArticles.map(a => (
                    <Link key={a.id} to={`/koran/${a.category}/${a.publishDate}/${a.slug}`}
                      className="block group">
                      <p className="text-xs text-gray-400 mb-0.5">{a.dateFormatted || a.publishDate}</p>
                      <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 line-clamp-2 group-hover:text-primary transition leading-snug">
                        {a.title}
                      </h4>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Link to={`/koran/kategori/${categorySlug}`}
                className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-gray-400 transition">
                <ChevronLeft className="w-4 h-4" />
                Kembali ke {catName}
              </Link>
              <Link to={`/koran/tanggal/${article.publishDate}`}
                className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-gray-400 transition">
                <Calendar className="w-4 h-4" />
                Edisi {article.dateFormatted || article.publishDate}
              </Link>
            </div>
          </aside>

        </div>
      </div>
    </div>
  )
}

export default NewspaperArticleDetailPage
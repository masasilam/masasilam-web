// ============================================
// src/pages/NewspaperArticleDetailPage.jsx
// LIGHT: bg-stone-50, surface=white, border=stone-200, accent=violet
// DARK:  bg-slate-950, surface=slate-900, border=slate-700, accent=violet
// Reader mode uses inline styles for full color control
// ============================================
import '../styles/epub-styles.css'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ChevronRight, Calendar, User, Newspaper, Eye, BookOpen,
  Share2, ChevronLeft, Clock, Tag, Type, Minus, Plus, X,
  ArrowLeft, Hash
} from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'
import NewspaperSocialSection from '../components/Social/NewspaperSocialSection'
import feedEvents, { FEED_EVENTS } from '../services/feedEvents'

// ── Categories ────────────────────────────────────────────────────────────────
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
const CAT_MAP   = Object.fromEntries(CATEGORIES.map(c => [c.value, c]))
const getCatLabel = (v) => CAT_MAP[v]?.label || v
const getCatIcon  = (v) => CAT_MAP[v]?.icon  || '📰'

// ── Reader settings ───────────────────────────────────────────────────────────
const FONT_SIZES = [
  { label: 'XS',  value: '0.82rem' },
  { label: 'S',   value: '0.92rem' },
  { label: 'M',   value: '1rem'    },
  { label: 'L',   value: '1.1rem'  },
  { label: 'XL',  value: '1.2rem'  },
  { label: 'XXL', value: '1.35rem' },
]
const FONT_FAMILIES = [
  { key: 'garamond', label: 'Garamond', stack: '"Minion Pro","Adobe Garamond Pro","Garamond","Times New Roman","Liberation Serif",serif' },
  { key: 'georgia',  label: 'Georgia',  stack: 'Georgia,"Times New Roman",serif' },
  { key: 'times',    label: 'Times',    stack: '"Times New Roman",Times,serif' },
  { key: 'palatino', label: 'Palatino', stack: '"Palatino Linotype","Book Antiqua",Palatino,serif' },
  { key: 'system',   label: 'Sans',     stack: 'ui-sans-serif,system-ui,-apple-system,sans-serif' },
]
const READ_MODES = [
  { key: 'light', label: 'Terang', bg: '#ffffff', color: '#1c1917', cardBg: '#fafaf9', border: '#e7e5e4' },
  { key: 'sepia', label: 'Sepia',  bg: '#f5f0e8', color: '#3b2d1f', cardBg: '#ede8de', border: '#d6c9b0' },
  { key: 'dark',  label: 'Gelap',  bg: '#020617', color: '#f1f5f9', cardBg: '#0f172a', border: '#334155' },
]
const LS_FONT_SIZE_KEY   = 'koran_reader_fontSize'
const LS_FONT_FAMILY_KEY = 'koran_reader_fontFamily'
const LS_MODE_KEY        = 'koran_reader_mode'

// ── EPUB Scoped CSS ───────────────────────────────────────────────────────────
const EPUB_SCOPED_CSS = `
  [data-epub] p {
    margin-top: 0; margin-bottom: 0;
    text-indent: 1.5em !important; text-align: justify;
    -webkit-hyphens: auto !important; hyphens: auto !important;
    -webkit-hyphenate-limit-chars: 6 2 2 !important;
    hyphenate-limit-chars: 6 2 2 !important;
    word-wrap: break-word !important; overflow-wrap: break-word !important;
    line-height: inherit !important;
  }
  [data-epub] blockquote, [data-epub] li, [data-epub] td, [data-epub] th {
    -webkit-hyphens: auto !important; hyphens: auto !important;
    word-wrap: break-word !important; overflow-wrap: break-word !important;
  }
  [data-epub] p:first-child { text-indent: 0 !important; margin-top: 0 !important; }
  [data-epub] h1 + p, [data-epub] h2 + p, [data-epub] h3 + p,
  [data-epub] h4 + p, [data-epub] h5 + p, [data-epub] h6 + p,
  [data-epub] .first-paragraph { text-indent: 0 !important; margin-top: 2em !important; }
  [data-epub] h1, [data-epub] h2, [data-epub] h3,
  [data-epub] h4, [data-epub] h5, [data-epub] h6 {
    font-family: inherit !important; text-align: center !important;
    margin: 2.5em 0 0.25em 0 !important; hyphens: none !important;
  }
  [data-epub] h1 { font-size: 1.5em !important; font-weight: 700 !important; }
  [data-epub] h2 { font-size: 1.3em !important; }
  [data-epub] h3 { font-size: 1.2em !important; }
  [data-epub] blockquote {
    margin: 0.25em 0 !important; padding: 0 0.25em !important;
    border-left: 3px solid #ccc !important; font-style: italic !important;
  }
  [data-epub] blockquote p { text-indent: 0 !important; }
  [data-epub] img { max-width: 100% !important; height: auto !important; display: block !important; margin: 0 auto !important; }
`

// ── ReaderToolbar ─────────────────────────────────────────────────────────────
const ReaderToolbar = ({ fontIdx, setFontIdx, fontFamilyKey, setFontFamilyKey, modeKey, setModeKey }) => {
  const [open, setOpen] = useState(false)
  const ref  = useRef(null)
  const mode = READ_MODES.find(m => m.key === modeKey) || READ_MODES[0]

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const currentFont = FONT_FAMILIES.find(f => f.key === fontFamilyKey) || FONT_FAMILIES[0]

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        title="Pengaturan Tampilan"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all"
        style={{
          borderColor:     open ? '#7c3aed' : mode.border,
          color:           open ? '#7c3aed' : mode.color,
          backgroundColor: open ? 'rgba(124,58,237,0.08)' : mode.cardBg,
        }}
      >
        <Type className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Tampilan</span>
      </button>

      {open && (
        <div
          className="absolute top-full right-0 mt-2 z-50 rounded-2xl shadow-2xl border p-5 w-80"
          style={{ background: mode.bg, borderColor: mode.border }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: mode.color, opacity: 0.5 }}>
              Pengaturan Baca
            </span>
            <button onClick={() => setOpen(false)} style={{ color: mode.color, opacity: 0.4 }}
              className="hover:opacity-70 transition-opacity">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Font Size */}
          <div className="mb-5">
            <p className="text-xs font-semibold mb-2" style={{ color: mode.color, opacity: 0.55 }}>Ukuran Huruf</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setFontIdx(i => Math.max(0, i - 1))} disabled={fontIdx === 0}
                className="w-8 h-8 rounded-lg border flex items-center justify-center disabled:opacity-25 transition-opacity"
                style={{ borderColor: mode.border, color: mode.color, background: mode.cardBg }}>
                <Minus className="w-3.5 h-3.5" />
              </button>
              <div className="flex flex-1 gap-1">
                {FONT_SIZES.map((f, i) => (
                  <button key={f.label} onClick={() => setFontIdx(i)}
                    className="flex-1 h-8 rounded-lg border text-xs font-mono font-bold transition-all"
                    style={{
                      borderColor: i === fontIdx ? '#7c3aed' : mode.border,
                      background:  i === fontIdx ? '#7c3aed' : mode.cardBg,
                      color:       i === fontIdx ? '#ffffff' : mode.color,
                    }}>{f.label}</button>
                ))}
              </div>
              <button onClick={() => setFontIdx(i => Math.min(FONT_SIZES.length - 1, i + 1))}
                disabled={fontIdx === FONT_SIZES.length - 1}
                className="w-8 h-8 rounded-lg border flex items-center justify-center disabled:opacity-25 transition-opacity"
                style={{ borderColor: mode.border, color: mode.color, background: mode.cardBg }}>
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="mt-2 text-center transition-all"
              style={{ fontSize: FONT_SIZES[fontIdx].value, color: mode.color, fontFamily: currentFont.stack, opacity: 0.55 }}>
              Contoh teks dengan ukuran ini
            </p>
          </div>

          {/* Font Family */}
          <div className="mb-5">
            <p className="text-xs font-semibold mb-2" style={{ color: mode.color, opacity: 0.55 }}>Jenis Huruf</p>
            <div className="flex flex-wrap gap-1.5">
              {FONT_FAMILIES.map(f => (
                <button key={f.key} onClick={() => setFontFamilyKey(f.key)}
                  className="px-3 py-1.5 rounded-lg border text-xs transition-all"
                  style={{
                    fontFamily:  f.stack,
                    borderColor: fontFamilyKey === f.key ? '#7c3aed' : mode.border,
                    background:  fontFamilyKey === f.key ? '#7c3aed' : mode.cardBg,
                    color:       fontFamilyKey === f.key ? '#ffffff' : mode.color,
                    fontWeight:  fontFamilyKey === f.key ? 600 : 400,
                  }}>{f.label}</button>
              ))}
            </div>
          </div>

          {/* Reading Mode */}
          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: mode.color, opacity: 0.55 }}>Mode Baca</p>
            <div className="flex gap-2">
              {READ_MODES.map(m => (
                <button key={m.key} onClick={() => setModeKey(m.key)}
                  className="flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-xl border transition-all"
                  style={{
                    background:  modeKey === m.key ? '#7c3aed' : m.cardBg,
                    borderColor: modeKey === m.key ? '#7c3aed' : mode.border,
                    color:       modeKey === m.key ? '#ffffff' : mode.color,
                  }}>
                  <div className="w-6 h-6 rounded-full border-2"
                    style={{ background: m.bg, borderColor: modeKey === m.key ? '#fff' : m.border }} />
                  <span className="text-xs font-semibold">{m.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── ArticleContent ────────────────────────────────────────────────────────────
const ArticleContent = ({ html, fontSize, fontFamily, mode }) => {
  const ref = useRef(null)
  useEffect(() => {
    if (ref.current && html) ref.current.innerHTML = html
  }, [html])

  return (
    <>
      <style>{EPUB_SCOPED_CSS}</style>
      <div
        ref={ref}
        data-epub
        lang="id"
        className="chapter"
        style={{
          fontFamily,
          fontSize,
          lineHeight:      1.7,
          color:           mode.color,
          backgroundColor: 'transparent',
          margin:          '0 auto',
          padding:         '1.5em 1.25em',
          maxWidth:        '38em',
          transition:      'font-size 0.15s, color 0.2s',
        }}
      />
    </>
  )
}

// ── InfoItem ──────────────────────────────────────────────────────────────────
const InfoItem = ({ label, value, mode }) => (
  <div className="flex justify-between gap-4">
    <span className="flex-shrink-0 text-xs" style={{ color: mode.color, opacity: 0.55 }}>{label}</span>
    <span className="font-medium text-right text-xs" style={{ color: mode.color }}>{value}</span>
  </div>
)

// ── Main Page ─────────────────────────────────────────────────────────────────
const NewspaperArticleDetailPage = () => {
  const { categorySlug, date, articleSlug } = useParams()
  const navigate = useNavigate()
  const [article,  setArticle]  = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [fontIdx, setFontIdxRaw] = useState(() => {
    const s = parseInt(localStorage.getItem(LS_FONT_SIZE_KEY))
    return isNaN(s) ? 2 : Math.max(0, Math.min(FONT_SIZES.length - 1, s))
  })
  const [fontFamilyKey, setFontFamilyKeyRaw] = useState(() => {
    const s = localStorage.getItem(LS_FONT_FAMILY_KEY)
    return FONT_FAMILIES.find(f => f.key === s) ? s : 'garamond'
  })
  const [modeKey, setModeKeyRaw] = useState(() => {
    const s = localStorage.getItem(LS_MODE_KEY)
    return READ_MODES.find(m => m.key === s) ? s : 'light'
  })

  useEffect(() => {
    const prevLang = document.documentElement.lang
    document.documentElement.lang = 'id'
    return () => { document.documentElement.lang = prevLang }
  }, [])

  const setFontIdx = useCallback(v => {
    const n = typeof v === 'function' ? v(fontIdx) : v
    setFontIdxRaw(n); localStorage.setItem(LS_FONT_SIZE_KEY, String(n))
  }, [fontIdx])
  const setFontFamilyKey = useCallback(k => {
    setFontFamilyKeyRaw(k); localStorage.setItem(LS_FONT_FAMILY_KEY, k)
  }, [])
  const setModeKey = useCallback(k => {
    setModeKeyRaw(k); localStorage.setItem(LS_MODE_KEY, k)
  }, [])

  const mode       = READ_MODES.find(m => m.key === modeKey) || READ_MODES[0]
  const fontSize   = FONT_SIZES[fontIdx].value
  const fontFamily = (FONT_FAMILIES.find(f => f.key === fontFamilyKey) || FONT_FAMILIES[0]).stack

  useEffect(() => {
    setLoading(true); setNotFound(false)
    api.get(`/newspapers/${categorySlug}/${date}/${articleSlug}`)
      .then(res => {
        const data = res.data?.data
        setArticle(data)
        document.title = `${data?.title || 'Artikel'} — Arsip Koran`

        const token = localStorage.getItem('token')
        if (token && data) {
          feedEvents.emit(FEED_EVENTS.ACTIVITY_CREATED, {
            activityType: 'reading',
            entityType:   'NEWSPAPER',
            entitySlug:   data.slug || articleSlug,
            entityTitle:  data.title,
          })
        }
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
    <div className="min-h-screen flex items-center justify-center transition-colors"
         style={{ background: mode.bg }}>
      <div className="w-8 h-8 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
    </div>
  )

  if (notFound || !article) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-8 transition-colors
                    bg-stone-50 dark:bg-slate-950">
      <BookOpen className="w-16 h-16 mb-4 text-stone-200 dark:text-slate-700" />
      <h1 className="text-2xl font-bold mb-2 text-stone-800 dark:text-slate-200">Artikel Tidak Ditemukan</h1>
      <p className="mb-6 text-stone-500 dark:text-slate-400">
        Artikel yang Anda cari mungkin telah dipindahkan atau dihapus.
      </p>
      <button onClick={() => navigate('/koran')}
        className="px-5 py-2.5 rounded-xl font-semibold text-sm transition-all
                   bg-violet-600 hover:bg-violet-500 text-white">
        Kembali ke Koran
      </button>
    </div>
  )

  const catName    = article.categoryName || getCatLabel(article.category)
  const catIcon    = getCatIcon(article.category)
  const sourceName = article.sourceName || article.source?.name || null
  const htmlContent  = article.bodyOriginal || article.bodyModern || ''
  const plainContent = article.content || ''
  const tags = typeof article.tags === 'string'
    ? article.tags.split(',').map(t => t.trim()).filter(Boolean)
    : Array.isArray(article.tags) ? article.tags : []

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ background: mode.bg }}>

      {/* ── Top Breadcrumb ────────────────────────────────────────── */}
      <div style={{ background: '#0f172a' }} className="py-2.5 px-4">
        <div className="max-w-5xl mx-auto flex items-center gap-2 text-xs">
          <Link to="/koran" className="text-slate-400 hover:text-white transition whitespace-nowrap">Koran</Link>
          <ChevronRight className="w-3 h-3 text-slate-600 flex-shrink-0" />
          <Link to={`/koran/kategori/${article.category}`}
            className="text-slate-400 hover:text-white transition flex items-center gap-1 whitespace-nowrap">
            {catIcon} {catName}
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-600 flex-shrink-0" />
          <Link to={`/koran/tanggal/${article.publishDate}`}
            className="text-slate-400 hover:text-white transition whitespace-nowrap">
            {article.dateFormatted || article.publishDate}
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── MAIN ARTICLE ────────────────────────────────────── */}
          <article className="lg:col-span-2">
            <div
              className="rounded-2xl border overflow-hidden mb-6 shadow-sm transition-all"
              style={{ background: mode.cardBg, borderColor: mode.border }}
            >
              {/* Category + Title */}
              <div className="px-5 sm:px-8 pt-6 sm:pt-8">
                {/* Category tag */}
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <span
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border"
                    style={{ background: mode.bg, color: mode.color, borderColor: mode.border }}>
                    {catIcon} {catName}
                  </span>
                  {article.importance === 'high' && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold
                                     bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                      BERITA UTAMA
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1
                  className="font-black leading-tight mb-3 transition-all"
                  style={{
                    color:      mode.color,
                    fontFamily: `Georgia, "Times New Roman", serif`,
                    fontSize:   `calc(${fontSize} * 1.7)`,
                    lineHeight: 1.25,
                  }}>
                  {article.title}
                </h1>

                {article.subtitle && (
                  <p className="text-base italic mb-4 border-l-4 pl-4"
                    style={{ color: mode.color, opacity: 0.65, borderColor: mode.border }}>
                    {article.subtitle}
                  </p>
                )}

                {/* Divider */}
                <div className="h-px mb-4" style={{ background: `linear-gradient(to right, #7c3aed, transparent)` }} />

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs pb-5 border-b mb-4"
                  style={{ color: mode.color, opacity: 0.6, borderColor: mode.border }}>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {article.dateFormatted || article.publishDate}
                  </span>
                  {sourceName && (
                    <span className="flex items-center gap-1.5">
                      <Newspaper className="w-3.5 h-3.5" />{sourceName}
                    </span>
                  )}
                  {article.author && (
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />{article.author}
                    </span>
                  )}
                  {article.pageNumber && (
                    <span className="flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5" />Halaman {article.pageNumber}
                    </span>
                  )}
                  {article.viewCount > 0 && (
                    <span className="flex items-center gap-1.5 ml-auto">
                      <Eye className="w-3.5 h-3.5" />
                      {article.viewCount.toLocaleString('id-ID')} tayangan
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap pb-5">
                  <button onClick={handleShare}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all"
                    style={{ borderColor: mode.border, color: mode.color, background: mode.bg }}>
                    <Share2 className="w-3.5 h-3.5" />Bagikan
                  </button>
                  {article.wordCount > 0 && (
                    <span className="flex items-center gap-1.5 text-xs"
                      style={{ color: mode.color, opacity: 0.45 }}>
                      <Clock className="w-3.5 h-3.5" />
                      ~{Math.max(1, Math.ceil(article.wordCount / 200))} mnt
                      · {article.wordCount.toLocaleString('id-ID')} kata
                    </span>
                  )}
                  <div className="ml-auto">
                    <ReaderToolbar
                      fontIdx={fontIdx}          setFontIdx={setFontIdx}
                      fontFamilyKey={fontFamilyKey} setFontFamilyKey={setFontFamilyKey}
                      modeKey={modeKey}          setModeKey={setModeKey}
                    />
                  </div>
                </div>
              </div>

              {/* Featured Image */}
              {article.imageUrl && (
                <figure className="mx-5 sm:mx-8 mb-6">
                  <img src={article.imageUrl} alt={article.title}
                    className="w-full rounded-xl object-cover max-h-96" />
                </figure>
              )}

              {/* Content */}
              {htmlContent ? (
                <ArticleContent html={htmlContent} fontSize={fontSize} fontFamily={fontFamily} mode={mode} />
              ) : plainContent ? (
                <>
                  <style>{EPUB_SCOPED_CSS}</style>
                  <div data-epub lang="id" className="chapter"
                    style={{ fontFamily, fontSize, lineHeight: 1.7, color: mode.color, margin: '0 auto', padding: '1.5em 1.25em', maxWidth: '38em' }}>
                    {plainContent.split('\n\n').map((para, i) => <p key={i}>{para}</p>)}
                  </div>
                </>
              ) : (
                <p className="px-5 sm:px-8 pb-8 italic text-sm" style={{ color: mode.color, opacity: 0.4 }}>
                  Konten artikel tidak tersedia.
                </p>
              )}

              {/* Tags */}
              {tags.length > 0 && (
                <div className="px-5 sm:px-8 pb-6 flex items-center gap-2 flex-wrap pt-4 border-t"
                  style={{ borderColor: mode.border }}>
                  <Tag className="w-3.5 h-3.5 flex-shrink-0" style={{ color: mode.color, opacity: 0.4 }} />
                  {tags.map(tag => (
                    <span key={tag} className="px-2.5 py-1 rounded-full text-xs"
                      style={{ background: mode.bg, color: mode.color, border: `1px solid ${mode.border}` }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Same-date articles */}
            {article.sameDateArticles?.length > 0 && (
              <section className="rounded-2xl border p-5 sm:p-6 transition-colors"
                style={{ background: mode.cardBg, borderColor: mode.border }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-black text-sm uppercase tracking-wider" style={{ color: mode.color }}>
                    Edisi yang Sama
                  </h2>
                  <Link to={`/koran/tanggal/${article.publishDate}`}
                    className="text-xs font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400 transition">
                    Lihat semua →
                  </Link>
                </div>
                <div className="space-y-0" style={{ borderTop: `1px solid ${mode.border}` }}>
                  {article.sameDateArticles.map(a => (
                    <Link key={a.id}
                      to={`/koran/${a.category}/${a.publishDate}/${a.slug}`}
                      className="flex items-start gap-3 py-3 group border-b last:border-b-0"
                      style={{ borderColor: mode.border }}>
                      {a.imageUrl && (
                        <img src={a.imageUrl} alt="" className="w-14 h-10 object-cover rounded-lg flex-shrink-0" />
                      )}
                      <div>
                        <p className="text-xs mb-0.5" style={{ color: mode.color, opacity: 0.45 }}>
                          {getCatIcon(a.category)} {getCatLabel(a.category)}
                        </p>
                        <h3 className="text-sm font-semibold line-clamp-2 leading-snug transition-colors group-hover:text-violet-600"
                          style={{ color: mode.color, fontFamily: 'Georgia, "Times New Roman", serif' }}>
                          {a.title}
                        </h3>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </article>

          {/* ── SIDEBAR ─────────────────────────────────────────── */}
          <aside className="space-y-5">

            {/* Info Panel */}
            <div className="rounded-2xl border p-5" style={{ background: mode.cardBg, borderColor: mode.border }}>
              <h3 className="text-xs font-bold uppercase tracking-wider mb-4"
                style={{ color: mode.color, opacity: 0.45 }}>Info Artikel</h3>
              <div className="space-y-3">
                <InfoItem label="Kategori"        value={`${catIcon} ${catName}`} mode={mode} />
                <InfoItem label="Tanggal Terbit"  value={article.dateFormatted || article.publishDate} mode={mode} />
                {sourceName            && <InfoItem label="Sumber"      value={sourceName} mode={mode} />}
                {article.author        && <InfoItem label="Penulis"     value={article.author} mode={mode} />}
                {article.pageNumber    && <InfoItem label="Halaman"     value={`Hal. ${article.pageNumber}`} mode={mode} />}
                {article.wordCount     && <InfoItem label="Jumlah Kata" value={`${article.wordCount.toLocaleString('id-ID')} kata`} mode={mode} />}
                {article.viewCount > 0 && <InfoItem label="Tayangan"   value={article.viewCount.toLocaleString('id-ID')} mode={mode} />}
              </div>
            </div>

            {/* Related Articles */}
            {article.relatedArticles?.length > 0 && (
              <div className="rounded-2xl border p-5" style={{ background: mode.cardBg, borderColor: mode.border }}>
                <h3 className="text-xs font-bold uppercase tracking-wider mb-4"
                  style={{ color: mode.color, opacity: 0.45 }}>Artikel Terkait</h3>
                <div className="space-y-3">
                  {article.relatedArticles.map(a => (
                    <Link key={a.id}
                      to={`/koran/${a.category}/${a.publishDate}/${a.slug}`}
                      className="block group">
                      <p className="text-[10px] mb-0.5" style={{ color: mode.color, opacity: 0.4 }}>
                        {a.dateFormatted || a.publishDate}
                      </p>
                      <h4 className="text-xs font-semibold line-clamp-2 leading-snug transition-colors group-hover:text-violet-600"
                        style={{ color: mode.color, fontFamily: 'Georgia, "Times New Roman", serif' }}>
                        {a.title}
                      </h4>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex flex-col gap-2">
              <Link
                to={`/koran/kategori/${categorySlug}`}
                className="flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all hover:opacity-80"
                style={{ background: mode.cardBg, borderColor: mode.border, color: mode.color }}>
                <ChevronLeft className="w-4 h-4" />
                Kembali ke {catName}
              </Link>
              <Link
                to={`/koran/tanggal/${article.publishDate}`}
                className="flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all hover:opacity-80"
                style={{ background: mode.cardBg, borderColor: mode.border, color: mode.color }}>
                <Calendar className="w-4 h-4" />
                Edisi {article.dateFormatted || article.publishDate}
              </Link>
            </div>

            {/* ── Social Integration ── */}
            <NewspaperSocialSection article={article} mode={mode} />

          </aside>
        </div>
      </div>
    </div>
  )
}

export default NewspaperArticleDetailPage
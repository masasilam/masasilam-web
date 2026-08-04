import '../styles/epub-styles.css'

import { useState, useEffect, useRef, useCallback } from 'react'
import ReactDOM from 'react-dom'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ChevronRight, Calendar, User, Newspaper, Eye, BookOpen,
  Share2, ChevronLeft, Clock, Tag, Type, Minus, Plus, X, Hash
} from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'
import NewspaperSocialSection from '../components/Social/NewspaperSocialSection'
import feedEvents, { FEED_EVENTS } from '../services/feedEvents'
import useNewspaperCategories from '../hooks/useNewspaperCategories'
import SEO from '../components/Common/SEO'
import { articleHref, editionHref, genreChips, rubrikHref, splitList } from '../utils/newspaperUtils'

const FONT_SIZES = [
  { label: 'XS', value: '0.82rem' },
  { label: 'S', value: '0.92rem' },
  { label: 'M', value: '1rem' },
  { label: 'L', value: '1.1rem' },
  { label: 'XL', value: '1.2rem' },
  { label: 'XXL', value: '1.35rem' },
]
const FONT_FAMILIES = [
  { key: 'garamond', label: 'Garamond', stack: '"Minion Pro","Adobe Garamond Pro","Garamond","Times New Roman","Liberation Serif",serif' },
  { key: 'georgia', label: 'Georgia', stack: 'Georgia,"Times New Roman",serif' },
  { key: 'times', label: 'Times', stack: '"Times New Roman",Times,serif' },
  { key: 'palatino', label: 'Palatino', stack: '"Palatino Linotype","Book Antiqua",Palatino,serif' },
  { key: 'system', label: 'Sans', stack: 'ui-sans-serif,system-ui,-apple-system,sans-serif' },
]
const READ_MODES = [
  { key: 'light', label: 'Terang', bg: '#ffffff', color: '#1c1917', cardBg: '#fafaf9', border: '#e7e5e4', accent: '#7c3aed' },
  { key: 'sepia', label: 'Sepia', bg: '#f5f0e8', color: '#3b2d1f', cardBg: '#ede8de', border: '#d6c9b0', accent: '#9a5b13' },
  { key: 'dark', label: 'Gelap', bg: '#020617', color: '#f1f5f9', cardBg: '#0f172a', border: '#334155', accent: '#a78bfa' },
]
const LS_FONT_SIZE_KEY = 'koran_reader_fontSize'
const LS_FONT_FAMILY_KEY = 'koran_reader_fontFamily'
const LS_MODE_KEY = 'koran_reader_mode'

const EPUB_SCOPED_CSS = `
  [data-epub] { hyphens: auto; }
  [data-epub] p {
    margin-top: 0; margin-bottom: 0;
    text-indent: 1.5em !important; text-align: justify;
    -webkit-hyphens: auto !important; hyphens: auto !important;
    -webkit-hyphenate-limit-chars: 6 2 2 !important;
    hyphenate-limit-chars: 6 2 2 !important;
    word-wrap: break-word !important; overflow-wrap: break-word !important;
    line-height: inherit !important;
    orphans: 2; widows: 2;
  }
  [data-epub] blockquote, [data-epub] li, [data-epub] td, [data-epub] th {
    -webkit-hyphens: auto !important; hyphens: auto !important;
    word-wrap: break-word !important; overflow-wrap: break-word !important;
  }
  [data-epub] p:first-child { text-indent: 0 !important; margin-top: 0 !important; }
  [data-epub] h1 + p, [data-epub] h2 + p, [data-epub] h3 + p,
  [data-epub] h4 + p, [data-epub] h5 + p, [data-epub] h6 + p,
  [data-epub] .first-paragraph,
  [data-epub] section > p:first-of-type { text-indent: 0 !important; margin-top: 2em !important; }
  [data-epub] h1, [data-epub] h2, [data-epub] h3,
  [data-epub] h4, [data-epub] h5, [data-epub] h6 {
    font-family: inherit !important; text-align: center !important;
    margin: 2.5em 0 0.25em 0 !important; hyphens: none !important;
    page-break-after: avoid;
  }
  [data-epub] h1 { font-size: 1.5em !important; font-weight: 700 !important; }
  [data-epub] h2 { font-size: 1.3em !important; font-weight: 650; }
  [data-epub] h3 { font-size: 1.2em !important; font-weight: 600; }
  [data-epub] h4 { font-size: 1.1em; font-weight: 550; }
  [data-epub] h5 { font-size: 1.05em; font-weight: 500; }
  [data-epub] h6 { font-size: 1em; font-weight: 450; }
  [data-epub] blockquote {
    margin: 0.25em 0 !important; padding: 0 0.25em !important;
    border-left: 3px solid #ccc !important; font-style: italic !important;
    hyphens: auto;
  }
  [data-epub] blockquote p { text-indent: 0 !important; }
  [data-epub] blockquote p + p { text-indent: 1.5em; }
  [data-epub] img { max-width: 100% !important; height: auto !important; display: block !important; margin: 0 auto !important; }

  [data-epub] p.separator, [data-epub] p.ornament, [data-epub] p.divider {
    text-align: center !important; text-indent: 0 !important; margin: 2em 0 !important; color: #666;
  }
  [data-epub] p.ornament-flower { letter-spacing: 0.3em; font-size: 1.1em; text-align: center; text-indent: 0; }

[data-epub] .poem { margin: 2em 0 !important; text-align: left !important; text-indent: 0 !important; hyphens: none !important; line-height: 1.4 !important; }
  [data-epub] .poem p, [data-epub] .poem div, [data-epub] .poem span {
    text-align: left !important; text-indent: 0 !important; margin: 0 !important; hyphens: none !important;
    display: block !important; line-height: 1.4 !important;
  }
  [data-epub] .poem .note { margin: 2.5em 0 1.5em 0 !important; padding-top: 1em !important; position: relative; font-size: 0.9em; }
  [data-epub] .poem .note::before { content: ""; position: absolute; top: 0; left: 0; width: 50%; height: 0; border-top: 1px solid #999; }
  [data-epub] .poem .note p { text-align: left !important; text-indent: 0 !important; margin: 0.5em 0 !important; }
  [data-epub] .poem h1, [data-epub] .poem h2, [data-epub] .poem h3, [data-epub] .poem h4 {
    text-align: center !important; font-weight: 600 !important; margin: 1.5em 0 1em 0 !important; text-transform: uppercase !important; letter-spacing: 0.1em !important;
  }
  [data-epub] .poem .author { text-align: center !important; font-weight: 500 !important; font-size: 1.1em !important; margin: 2em 0 1em 0 !important; text-transform: uppercase !important; letter-spacing: 0.2em !important; }
  [data-epub] .poem div + div { margin-top: 1.5em !important; }
  [data-epub] .poem p:last-child { text-align: right !important; font-style: italic !important; margin-top: 2em !important; font-size: 0.9em !important; }
  [data-epub] .indent { margin-left: 2em; }

  [data-epub] ol, [data-epub] ul { margin: 0; text-align: justify; hyphens: auto; }
  [data-epub] ul.dash-list { list-style: none; padding-left: 1.5em; margin: 0; }
  [data-epub] ul.dash-list li { text-indent: -0.7em; margin: 0; }
  [data-epub] ul.dash-list li::before { content: "– "; }

  [data-epub] strong, [data-epub] b { font-weight: 600; }
  [data-epub] em, [data-epub] i { font-style: italic; }
  [data-epub] q::before { content: open-quote; }
  [data-epub] q::after { content: close-quote; }

  [data-epub] blockquote .note {
    margin: 2.5em 0 1.5em 0 !important; padding-top: 1em !important;
    padding-left: 0 !important; padding-right: 0 !important;
    position: relative; font-size: 0.9em; border-left: none !important; font-style: normal !important;
  }
  [data-epub] blockquote .note::before { content: ""; position: absolute; top: 0; left: 0; width: 50%; height: 0; border-top: 1px solid #999; }
  [data-epub] blockquote .note p { text-align: left !important; text-indent: 0 !important; margin: 0.5em 0 !important; font-style: normal !important; }

  [data-epub] a { text-decoration: underline; hyphens: none; }
  [data-epub] a:hover { opacity: 0.8; }

  [data-epub] nav { padding: 0.25em; max-width: 38em; margin: 0.25em auto; }
  [data-epub] nav h1 { margin: 2.5em 0 0.25em 0; }
  [data-epub] nav ol, [data-epub] nav li { list-style: none; margin: 0; text-align: left; text-indent: 0; }
  [data-epub] nav a { text-decoration: none; display: block; line-height: 1.6; padding: 0.2em 0; hyphens: none; }
  [data-epub] nav a:hover { text-decoration: underline; opacity: 0.8; }

  [data-epub] .titlepage {
    text-align: center; padding: 0.25em; max-width: 38em; margin: 0.25em auto;
    min-height: 70vh; display: flex; flex-direction: column; justify-content: center;
  }
  [data-epub] .titlepage h1 { font-size: 2em; font-weight: 700; margin: 2.5em 0 0.25em 0; }
  [data-epub] .titlepage .subtitle { font-size: 1.4em; font-weight: 600; margin: 0.5em 0 2em 0; text-align: center; }
  [data-epub] .titlepage h2 { font-size: 1.3em; font-weight: 650; margin: 2.5em 0 0.25em 0; }
  [data-epub] .titlepage h3 { font-size: 1.2em; font-weight: 600; margin: 2.5em 0 0.25em 0; }

  [data-epub].chapter, [data-epub] .colophon, [data-epub] .imprint, [data-epub] .uncopyright {
    padding: 0.25em; max-width: 38em; margin: 0.25em auto;
  }
  [data-epub] .colophon p { text-indent: 0; }
  [data-epub] .colophon > p:first-of-type { text-align: center; }
  [data-epub] .colophon, [data-epub] .imprint, [data-epub] .uncopyright { text-align: justify; }
  [data-epub] .info-box p, [data-epub] .info-box p:first-of-type { text-align: left !important; text-indent: 0 !important; }

  [data-epub] .image-inline { display: inline; vertical-align: middle; height: 2em; width: auto; margin: 0 0.3em; }
  [data-epub] .image-with-caption { margin: 2em auto; text-align: center; }
  [data-epub] .image-with-caption img { margin: 0 auto; }
  [data-epub] .image-caption { text-align: center; font-size: 0.9em; margin: 0.5em 0 0 0; color: #666; line-height: 1.4; text-indent: 0; }
  [data-epub] section.colophon img, [data-epub] section.imprint img,
  [data-epub] .colophon img, [data-epub] .imprint img {
    max-width: 150px !important; max-height: 150px !important; width: auto; height: auto;
    margin: 1em auto 2em auto !important; object-fit: contain;
  }
  [data-epub] .image-small { max-width: 120px !important; max-height: 120px !important; width: auto; height: auto; margin: 1em auto !important; object-fit: contain; }
  [data-epub] .image-medium { max-width: 200px !important; max-height: 200px !important; width: auto; height: auto; margin: 1em auto !important; object-fit: contain; }
  [data-epub] .image-container { margin: 0.25em 0; overflow: hidden; clear: both; }
  [data-epub] .image-left { float: left; margin: 0 0.5em 0.25em 0; max-width: 45%; }
  [data-epub] .image-right { float: right; margin: 0 0 0.25em 0.5em; max-width: 45%; }
  [data-epub] .image-top, [data-epub] .image-bottom { display: block; margin: 0.25em auto; max-width: 100%; }
  [data-epub] .image-container::after { content: ""; display: table; clear: both; }

  [data-epub] .letter {
    margin: 3em auto; padding: 2em; border: 1px solid #ccc; border-radius: 8px;
    background-color: #fdfcf8; max-width: 36em; line-height: 1.6; hyphens: auto;
  }
  [data-epub] .letter p { margin: 0; text-align: justify; }
  [data-epub] .letter .note {
    margin: 2.5em 0 1.5em 0 !important; padding-top: 1em !important; position: relative; font-size: 0.9em;
    background-color: transparent !important; border: none !important; border-radius: 0 !important;
    padding-left: 0 !important; padding-right: 0 !important;
  }
  [data-epub] .letter .note::before { content: ""; position: absolute; top: 0; left: 0; width: 50%; height: 0; border-top: 1px solid #999; }
  [data-epub] .letter .note p { text-align: left !important; text-indent: 0 !important; margin: 0.5em 0 !important; }
  [data-epub] .letter .date { text-align: right; font-style: italic; margin-bottom: 2em; text-indent: 0; }
  [data-epub] .letter .salutation { margin-bottom: 1.5em; text-indent: 0; font-weight: 500; }
  [data-epub] .letter .body { text-indent: 1.5em; text-align: justify; }
  [data-epub] .letter .body:first-of-type { text-indent: 0; margin-top: 0; }
  [data-epub] .letter .closing { margin-top: 2em; text-align: right; font-style: italic; text-indent: 0; }
  [data-epub] .letter .signature { text-align: right; font-weight: 600; margin-top: 0.5em; text-indent: 0; }
  [data-epub] .letter-date { text-align: right; font-style: italic; text-indent: 0; }

  [data-epub] .epigraph { font-style: italic; text-align: center; margin: 3em auto; max-width: 32em; hyphens: none; }
  [data-epub] .epigraph cite { display: block; margin-top: 1em; font-size: 0.9em; text-align: right; font-style: normal; }
  [data-epub] .subtitle { font-size: 1.1em; text-align: center; margin: 1.5em 0; }
  [data-epub] .center { text-align: center; text-indent: 0; }

  [data-epub] .dialog { margin: 1em 0; text-indent: 0; }
  [data-epub] .dialog p { margin: 0.2em 0; text-indent: -1em; padding-left: 1em; }
  [data-epub] .dialog .speaker { font-weight: 600; }
  [data-epub] .dialog .note { margin: 2.5em 0 1.5em 0 !important; padding-top: 1em !important; padding-left: 0 !important; position: relative; font-size: 0.9em; }
  [data-epub] .dialog .note::before { content: ""; position: absolute; top: 0; left: 0; width: 50%; height: 0; border-top: 1px solid #999; }
  [data-epub] .dialog .note p { text-align: left !important; text-indent: 0 !important; margin: 0.5em 0 !important; padding-left: 0 !important; }
  [data-epub] a[epub\:type="noteref"] {
    color: var(--epub-note-color, #7c3aed) !important;
    font-weight: 700 !important;
    text-decoration: none !important;
    cursor: pointer;
    padding: 0 0.05em;
  }
  [data-epub] a[epub\:type="noteref"]:hover {
    text-decoration: underline !important;
    opacity: 0.75;
  }
  [data-epub] sup a[epub\:type="noteref"] { font-size: 0.75em; }

  [data-epub] .scene-break { text-align: center; margin: 2em 0; letter-spacing: 0.3em; color: #666; }
  [data-epub] .scene-break::before { content: "⁂"; }

  [data-epub] .info-box { padding: 0.5em 1em; margin: 1.5em 0; background-color: #f8f8f8; border: 1px solid #ddd; border-radius: 6px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
  [data-epub] .info-box p { text-align: left !important; text-indent: 0 !important; margin: 0.5em 0 !important; }
  [data-epub] .info-box p:first-child { margin-top: 0 !important; }
  [data-epub] .info-box p:last-child { margin-bottom: 0 !important; }

  [data-epub] .note { margin: 2.5em 0 1.5em 0; padding-top: 1em; position: relative; font-size: 0.9em; }
  [data-epub] .note::before { content: ""; position: absolute; top: 0; left: 0; width: 50%; height: 0; border-top: 1px solid #999; }
  [data-epub] .note p { text-align: left !important; text-indent: 0 !important; margin: 0.5em 0 !important; }
  [data-epub] .note p:first-child { margin-top: 0 !important; }
  [data-epub] .note p:last-child { margin-bottom: 0 !important; }

  [data-epub] .formula-list { margin-left: 2em; max-width: 30em; }
  [data-epub] .formula-list p { display: grid; grid-template-columns: auto auto 1fr; gap: 0.5em 1em; align-items: baseline; }

  [data-epub] .music-notation { margin: 1.5em 0; }
  [data-epub] .music-meta { font-size: 0.9em; margin-bottom: 1em; font-style: italic; }
  [data-epub] .music-row { margin-bottom: 0.15em; }
  [data-epub] .notation-line {
    font-family: "Courier New", "Lucida Console", monospace; font-size: 0.88em; display: block;
    white-space: pre; letter-spacing: 0.05em; line-height: 1.3; border-bottom: 0.5px solid #ccc; padding-bottom: 1px;
  }
  [data-epub] .lyric-line { font-size: 0.85em; display: block; white-space: pre; color: #444; line-height: 1.5; margin-bottom: 0.6em; }
  [data-epub] .music-section-label { font-size: 0.9em; font-weight: 600; font-style: italic; margin: 1.2em 0 0.4em 0; }

  [data-epub] table { width: 100%; border-collapse: collapse; margin: 1.5em 0; font-size: 0.95em; }
  [data-epub] th, [data-epub] td { border: 1px solid #ccc; padding: 0.4em 0.6em; text-align: left; hyphens: none; }
  [data-epub] th { background-color: #f0f0f0; font-weight: 600; }
  [data-epub] code, [data-epub] pre { font-family: "Courier New", monospace; background-color: #f6f6f6; border-radius: 4px; }
  [data-epub] pre { padding: 0.5em; overflow-x: auto; font-size: 0.9em; }
  [data-epub] .smallcaps { font-variant: small-caps; letter-spacing: 0.05em; }
  [data-epub] .uppercase { text-transform: uppercase; }

  @media (prefers-color-scheme: dark) {
    [data-epub] { background-color: #121212; color: #e0e0e0; }
    [data-epub] blockquote { border-left-color: #666; }
    [data-epub] .letter { background-color: #1e1e1e; border-color: #444; }
    [data-epub] th { background-color: #222; }
    [data-epub] td, [data-epub] th { border-color: #444; }
    [data-epub] pre { background-color: #1e1e1e; }
    [data-epub] .info-box { background-color: #2d2d2d; border: 1px solid #555; color: #e0e0e0; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3); }
    [data-epub] .note::before { border-top-color: #666; }
    [data-epub] img { filter: invert(1); }
    [data-epub] .image-inline { filter: invert(1); opacity: 0.9; }
    [data-epub] img.photo, [data-epub] img.illustration, [data-epub] img.colored, [data-epub] .chapter img.no-invert { filter: none; opacity: 0.9; }
    [data-epub] img.logo, [data-epub] .colophon img, [data-epub] .imprint img { filter: invert(1) hue-rotate(180deg); }
    [data-epub] .image-caption { color: #aaa; }
    [data-epub] p.separator, [data-epub] p.ornament, [data-epub] p.divider { color: #999; }
    [data-epub] .scene-break { color: #999; }
  }

  @media screen and (max-width: 600px) {
    [data-epub] .image-left, [data-epub] .image-right { float: none; display: block; margin: 0.25em auto; max-width: 90%; }
    [data-epub] .indent { margin-left: 1em; }
    [data-epub] .formula-list { margin-left: 0.5em; }
    [data-epub] .formula-list p { grid-template-columns: auto auto 1fr; gap: 0.3em 0.5em; font-size: 0.9em; }
  }
`

const MetaDot = ({ mode }) => (
  <span aria-hidden="true" style={{ color: mode.color, opacity: 0.3 }}>·</span>
)

const ReaderToolbar = ({ fontIdx, setFontIdx, fontFamilyKey, setFontFamilyKey, modeKey, setModeKey, fullWidth = false }) => {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, right: 12, width: 320 })
  const btnRef = useRef(null)
  const panelRef = useRef(null)
  const mode = READ_MODES.find(m => m.key === modeKey) || READ_MODES[0]

  const updatePosition = useCallback(() => {
    if (!btnRef.current) return
    const rect = btnRef.current.getBoundingClientRect()
    const margin = 12
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const panelWidth = Math.min(320, viewportWidth - margin * 2)
    let right = viewportWidth - rect.right
    if (right < margin) right = margin
    if (right + panelWidth > viewportWidth - margin) right = margin
    let top = rect.bottom + 8
    const maxHeight = viewportHeight - top - margin
    if (maxHeight < 260 && rect.top - margin > 260) top = Math.max(margin, rect.top - 8 - 420)
    setCoords({ top, right, width: panelWidth })
  }, [])

  useEffect(() => {
    const handler = e => {
      if (
        btnRef.current && !btnRef.current.contains(e.target) &&
        panelRef.current && !panelRef.current.contains(e.target)
      ) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open, updatePosition])

  const currentFont = FONT_FAMILIES.find(f => f.key === fontFamilyKey) || FONT_FAMILIES[0]

  return (
    <>
      <button ref={btnRef} onClick={() => setOpen(o => !o)} title="Pengaturan Tampilan"
        className={fullWidth
          ? "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-bold transition-all active:scale-[0.98]"
          : "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all"}
        style={{ borderColor: open ? '#7c3aed' : mode.border, color: open ? '#7c3aed' : mode.color, backgroundColor: open ? 'rgba(124,58,237,0.08)' : mode.cardBg }}>
        <Type className={fullWidth ? "w-4 h-4" : "w-3.5 h-3.5"} />
        <span className={fullWidth ? "" : "hidden sm:inline"}>Tampilan</span>
      </button>

      {open && ReactDOM.createPortal(
        <div ref={panelRef} className="fixed z-[9999] rounded-2xl shadow-2xl border p-5"
          style={{ top: coords.top, right: coords.right, left: 'auto', width: coords.width, background: mode.bg, borderColor: mode.border, maxHeight: 'calc(100vh - 24px)', overflowY: 'auto' }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: mode.color, opacity: 0.5 }}>Pengaturan Baca</span>
            <button onClick={() => setOpen(false)} style={{ color: mode.color, opacity: 0.4 }} className="hover:opacity-70 transition-opacity"><X className="w-4 h-4" /></button>
          </div>

          <div className="mb-5">
            <p className="text-xs font-semibold mb-2" style={{ color: mode.color, opacity: 0.55 }}>Ukuran Huruf</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setFontIdx(i => Math.max(0, i - 1))} disabled={fontIdx === 0} className="w-8 h-8 rounded-lg border flex items-center justify-center disabled:opacity-25 transition-opacity" style={{ borderColor: mode.border, color: mode.color, background: mode.cardBg }}><Minus className="w-3.5 h-3.5" /></button>
              <div className="flex flex-1 gap-1">
                {FONT_SIZES.map((f, i) => (
                  <button key={f.label} onClick={() => setFontIdx(i)} className="flex-1 h-8 rounded-lg border text-xs font-mono font-bold transition-all"
                    style={{ borderColor: i === fontIdx ? '#7c3aed' : mode.border, background: i === fontIdx ? '#7c3aed' : mode.cardBg, color: i === fontIdx ? '#ffffff' : mode.color }}>{f.label}</button>
                ))}
              </div>
              <button onClick={() => setFontIdx(i => Math.min(FONT_SIZES.length - 1, i + 1))} disabled={fontIdx === FONT_SIZES.length - 1} className="w-8 h-8 rounded-lg border flex items-center justify-center disabled:opacity-25 transition-opacity" style={{ borderColor: mode.border, color: mode.color, background: mode.cardBg }}><Plus className="w-3.5 h-3.5" /></button>
            </div>
            <p className="mt-2 text-center transition-all" style={{ fontSize: FONT_SIZES[fontIdx].value, color: mode.color, fontFamily: currentFont.stack, opacity: 0.55 }}>Contoh teks dengan ukuran ini</p>
          </div>

          <div className="mb-5">
            <p className="text-xs font-semibold mb-2" style={{ color: mode.color, opacity: 0.55 }}>Jenis Huruf</p>
            <div className="flex flex-wrap gap-1.5">
              {FONT_FAMILIES.map(f => (
                <button key={f.key} onClick={() => setFontFamilyKey(f.key)} className="px-3 py-1.5 rounded-lg border text-xs transition-all"
                  style={{ fontFamily: f.stack, borderColor: fontFamilyKey === f.key ? '#7c3aed' : mode.border, background: fontFamilyKey === f.key ? '#7c3aed' : mode.cardBg, color: fontFamilyKey === f.key ? '#ffffff' : mode.color, fontWeight: fontFamilyKey === f.key ? 600 : 400 }}>{f.label}</button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: mode.color, opacity: 0.55 }}>Mode Baca</p>
            <div className="flex gap-2">
              {READ_MODES.map(m => (
                <button key={m.key} onClick={() => setModeKey(m.key)} className="flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-xl border transition-all"
                  style={{ background: modeKey === m.key ? '#7c3aed' : m.cardBg, borderColor: modeKey === m.key ? '#7c3aed' : mode.border, color: modeKey === m.key ? '#ffffff' : mode.color }}>
                  <div className="w-6 h-6 rounded-full border-2" style={{ background: m.bg, borderColor: modeKey === m.key ? '#fff' : m.border }} />
                  <span className="text-xs font-semibold">{m.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

const ArticleContent = ({ html, fontSize, fontFamily, mode }) => {
  const ref = useRef(null)
  const [footnote, setFootnote] = useState(null)

  useEffect(() => { if (ref.current && html) ref.current.innerHTML = html }, [html])

  useEffect(() => {
    const container = ref.current
    if (!container) return
    const handleClick = e => {
      const link = e.target.closest('a[epub\\:type="noteref"], a[href^="#fn"]')
      if (!link) return
      e.preventDefault()
      const targetId = link.getAttribute('href')?.slice(1)
      if (!targetId) return
      const targetEl = container.querySelector(`#${CSS.escape(targetId)}`)
      if (!targetEl) return
      const rect = link.getBoundingClientRect()
      const panelWidth = 300
      let left = rect.left
      if (left + panelWidth > window.innerWidth - 12) left = window.innerWidth - panelWidth - 12
      if (left < 12) left = 12
      setFootnote({ html: targetEl.innerHTML, top: rect.bottom + 8, left })
    }
    container.addEventListener('click', handleClick)
    return () => container.removeEventListener('click', handleClick)
  }, [html])

  useEffect(() => {
    if (!footnote) return
    const close = () => setFootnote(null)
    const closeOnKey = e => { if (e.key === 'Escape') setFootnote(null) }
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    document.addEventListener('keydown', closeOnKey)
    return () => {
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
      document.removeEventListener('keydown', closeOnKey)
    }
  }, [footnote])

  return (
    <>
      <style>{EPUB_SCOPED_CSS}</style>
      <div ref={ref} data-epub lang="id" className="chapter"
        style={{ fontFamily, fontSize, lineHeight: 1.7, color: mode.color, backgroundColor: 'transparent', margin: '0 auto', padding: '0 1.25em 1.5em', maxWidth: '38em', transition: 'font-size 0.15s, color 0.2s', '--epub-note-color': mode.accent }} />
      {footnote && ReactDOM.createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setFootnote(null)} />
          <div className="fixed z-[9999] rounded-xl shadow-2xl border p-4 text-sm leading-relaxed"
            style={{ top: footnote.top, left: footnote.left, width: 300, background: mode.cardBg, borderColor: mode.border, color: mode.color }}
            dangerouslySetInnerHTML={{ __html: footnote.html }} />
        </>,
        document.body
      )}
    </>
  )
}

const InfoItem = ({ label, value, mode }) => (
  <div className="flex justify-between gap-4">
    <span className="flex-shrink-0 text-xs" style={{ color: mode.color, opacity: 0.55 }}>{label}</span>
    <span className="font-medium text-right text-xs" style={{ color: mode.color }}>{value}</span>
  </div>
)

const NewspaperArticleDetailPage = () => {
  const { sourceSlug, second } = useParams()
  const articleSlug = second
  const navigate = useNavigate()
  const { getLabel, getIcon } = useNewspaperCategories()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
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
  const setFontFamilyKey = useCallback(k => { setFontFamilyKeyRaw(k); localStorage.setItem(LS_FONT_FAMILY_KEY, k) }, [])
  const setModeKey = useCallback(k => { setModeKeyRaw(k); localStorage.setItem(LS_MODE_KEY, k) }, [])

  const mode = READ_MODES.find(m => m.key === modeKey) || READ_MODES[0]
  const fontSize = FONT_SIZES[fontIdx].value
  const fontFamily = (FONT_FAMILIES.find(f => f.key === fontFamilyKey) || FONT_FAMILIES[0]).stack

  useEffect(() => {
    setLoading(true); setNotFound(false)
    api.get(`/newspapers/${sourceSlug}/${articleSlug}`)
      .then(res => {
        const data = res.data?.data
        setArticle(data)
        document.title = `${data?.title || 'Artikel'} — Arsip Koran`

        const token = localStorage.getItem('token')
        if (token && data) {
          feedEvents.emit(FEED_EVENTS.ACTIVITY_CREATED, {
            activityType: 'reading',
            entityType: 'NEWSPAPER',
            entitySlug: data.slug || articleSlug,
            entityTitle: data.title,
          })
        }
      })
      .catch(err => {
        if (err.response?.status === 404) setNotFound(true)
        else toast.error('Gagal memuat artikel')
      })
      .finally(() => setLoading(false))
  }, [sourceSlug, articleSlug])

  const handleShare = async () => {
    try {
      await navigator.share({ title: article.title, url: window.location.href })
    } catch {
      navigator.clipboard.writeText(window.location.href)
      toast.success('URL disalin!')
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center transition-colors" style={{ background: mode.bg }}>
      <div className="w-8 h-8 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
    </div>
  )

  if (notFound || !article) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-8 transition-colors bg-stone-50 dark:bg-slate-950">
      <BookOpen className="w-16 h-16 mb-4 text-stone-200 dark:text-slate-700" />
      <h1 className="text-2xl font-bold mb-2 text-stone-800 dark:text-slate-200">Artikel Tidak Ditemukan</h1>
      <p className="mb-6 text-stone-500 dark:text-slate-400">Artikel yang Anda cari mungkin telah dipindahkan atau dihapus.</p>
      <button onClick={() => navigate('/koran')} className="px-5 py-2.5 rounded-xl font-semibold text-sm transition-all bg-violet-600 hover:bg-violet-500 text-white">Kembali ke Koran</button>
    </div>
  )

  const chips = genreChips(article)
  const authorNames = splitList(article.authorNames)
  const sourceName = article.sourceName || article.source?.name || sourceSlug
  const htmlContent = article.bodyOriginal || article.bodyModern || ''
  const plainContent = article.content || ''
  const publishYear = article.publishDate ? new Date(article.publishDate).getFullYear() : null
  const tags = typeof article.tags === 'string'
    ? article.tags.split(',').map(t => t.trim()).filter(Boolean)
    : Array.isArray(article.tags) ? article.tags : []

  const canonicalPath = `/koran/${sourceSlug}/${article.slug}`
  const seoDescription = article.subtitle || (plainContent ? plainContent.slice(0, 160) : `${article.title} — ${sourceName}, ${article.dateFormatted || article.publishDate}`)

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ background: mode.bg }}>

      <SEO title={`${article.title} — Arsip Koran`} description={seoDescription} url={canonicalPath} type="article"
        canonical={`https://masasilam.com${canonicalPath}`} image={article.imageUrl} noindex={false} />

      <div style={{ background: '#0f172a' }} className="py-2.5 px-4">
        <div className="max-w-5xl mx-auto flex items-center gap-2 text-xs">
          <Link to="/koran" className="text-slate-400 hover:text-white transition whitespace-nowrap">Koran</Link>
          <ChevronRight className="w-3 h-3 text-slate-600 flex-shrink-0" />
          <Link to={`/koran/${sourceSlug}`} className="text-slate-400 hover:text-white transition flex items-center gap-1 whitespace-nowrap"><Newspaper className="w-3.5 h-3.5" /> {sourceName}</Link>
          <ChevronRight className="w-3 h-3 text-slate-600 flex-shrink-0" />
          <span className="text-slate-500 whitespace-nowrap truncate">{article.title}</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-6 sm:pt-8 pb-24 lg:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <article className="lg:col-span-2">
            <div className="rounded-2xl border overflow-hidden mb-6 shadow-sm transition-all" style={{ background: mode.cardBg, borderColor: mode.border }}>
              <div className="px-5 sm:px-8 pt-6 sm:pt-8">

                <div className="flex items-center justify-center gap-x-2 gap-y-1.5 mb-5 flex-wrap text-center">
                  {article.importance === 'high' && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide" style={{ background: 'rgba(239,68,68,0.12)', color: '#dc2626' }}>BERITA UTAMA</span>
                  )}
                  <div className="flex items-center gap-x-1.5 gap-y-1 flex-wrap justify-center">
                    {chips.map((c, i) => {
                      const ChipIcon = getIcon(c.slug)
                      return (
                        <span key={c.slug} className="flex items-center gap-1.5">
                          {i > 0 && <MetaDot mode={mode} />}
                          <Link to={rubrikHref(c.slug)} title={c.name}
                            className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide transition hover:opacity-70"
                            style={{ color: '#7c3aed' }}>
                            <ChipIcon className="w-3 h-3" />{c.name}
                          </Link>
                        </span>
                      )
                    })}
                  </div>
                </div>

                <div style={{ maxWidth: '38em', margin: '0 auto', textAlign: 'center' }}>
                  <h1 className="font-black leading-tight mb-3 transition-all"
                    style={{ color: mode.color, fontFamily: `Georgia, "Times New Roman", serif`, fontSize: `calc(${fontSize} * 1.7)`, lineHeight: 1.25 }}>
                    {article.title}
                  </h1>

                  {article.subtitle && (
                    <p className="text-base italic mb-4" style={{ color: mode.color, opacity: 0.65 }}>{article.subtitle}</p>
                  )}
                </div>

                <div className="h-px mt-1 mb-4" style={{ background: `linear-gradient(to right, #7c3aed, transparent)` }} />

                <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1.5 text-xs pb-4" style={{ color: mode.color, opacity: 0.6 }}>
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{article.dateFormatted || article.publishDate}</span>
                  <MetaDot mode={mode} />
                  <span className="flex items-center gap-1.5"><Newspaper className="w-3.5 h-3.5" />{sourceName}</span>
                  {authorNames.length > 0 && (
                    <>
                      <MetaDot mode={mode} />
                      <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />{authorNames.join(', ')}</span>
                    </>
                  )}
                  {article.pageNumber && (
                    <>
                      <MetaDot mode={mode} />
                      <span className="flex items-center gap-1.5"><Hash className="w-3.5 h-3.5" />Halaman {article.pageNumber}</span>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-between gap-3 flex-wrap pt-3 pb-4 border-t" style={{ borderColor: mode.border }}>
                  <div className="flex items-center gap-x-3 gap-y-1.5 flex-wrap">
                    <button onClick={handleShare} className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all" style={{ borderColor: mode.border, color: mode.color, background: mode.bg }}>
                      <Share2 className="w-3.5 h-3.5" />Bagikan
                    </button>
                    {article.wordCount > 0 && (
                      <span className="flex items-center gap-1.5 text-xs" style={{ color: mode.color, opacity: 0.45 }}>
                        <Clock className="w-3.5 h-3.5" />~{Math.max(1, Math.ceil(article.wordCount / 200))} mnt · {article.wordCount.toLocaleString('id-ID')} kata
                      </span>
                    )}
                    {article.viewCount > 0 && (
                      <span className="flex items-center gap-1.5 text-xs" style={{ color: mode.color, opacity: 0.45 }}>
                        <Eye className="w-3.5 h-3.5" />{article.viewCount.toLocaleString('id-ID')} tayangan
                      </span>
                    )}
                  </div>
                  <div className="hidden lg:block">
                    <ReaderToolbar fontIdx={fontIdx} setFontIdx={setFontIdx} fontFamilyKey={fontFamilyKey} setFontFamilyKey={setFontFamilyKey} modeKey={modeKey} setModeKey={setModeKey} />
                  </div>
                </div>
              </div>

              {article.imageUrl && (
                <figure className="mx-5 sm:mx-8 mb-6">
                  <img src={article.imageUrl} alt={article.title} className="w-full rounded-xl object-cover max-h-96" />
                </figure>
              )}

              {htmlContent ? (
                <ArticleContent html={htmlContent} fontSize={fontSize} fontFamily={fontFamily} mode={mode} />
              ) : plainContent ? (
                <>
                  <style>{EPUB_SCOPED_CSS}</style>
                  <div data-epub lang="en" className="chapter" style={{ fontFamily, fontSize, lineHeight: 1.7, color: mode.color, margin: '0 auto', padding: '0 1.25em 1.5em', maxWidth: '38em' }}>
                    {plainContent.split('\n\n').map((para, i) => <p key={i}>{para}</p>)}
                  </div>
                </>
              ) : (
                <p className="px-5 sm:px-8 pb-8 italic text-sm" style={{ color: mode.color, opacity: 0.4 }}>Konten artikel tidak tersedia.</p>
              )}

              {tags.length > 0 && (
                <div className="px-5 sm:px-8 pb-6 flex items-center gap-2 flex-wrap pt-4 border-t" style={{ borderColor: mode.border }}>
                  <Tag className="w-3.5 h-3.5 flex-shrink-0" style={{ color: mode.color, opacity: 0.4 }} />
                  {tags.map(tag => (
                    <span key={tag} className="px-2.5 py-1 rounded-full text-xs" style={{ background: mode.bg, color: mode.color, border: `1px solid ${mode.border}` }}>#{tag}</span>
                  ))}
                </div>
              )}

              <div className="px-5 sm:px-8 pb-6 pt-4 border-t flex justify-center" style={{ borderColor: mode.border }}>
                <button onClick={handleShare} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all hover:opacity-80" style={{ borderColor: mode.border, color: mode.color, background: mode.bg }}>
                  <Share2 className="w-4 h-4" />Bagikan Artikel Ini
                </button>
              </div>
            </div>

            {article.sameDateArticles?.length > 0 && (
              <section className="rounded-2xl border p-5 sm:p-6 transition-colors" style={{ background: mode.cardBg, borderColor: mode.border }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-black text-sm uppercase tracking-wider" style={{ color: mode.color }}>Edisi yang Sama</h2>
                  {publishYear && <Link to={editionHref(sourceSlug, article.publishDate)} className="text-xs font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400 transition">Lihat semua →</Link>}
                </div>
                <div className="space-y-0" style={{ borderTop: `1px solid ${mode.border}` }}>
                  {article.sameDateArticles.map(a => (
                    <Link key={a.id} to={articleHref(a)} className="flex items-start gap-3 py-3 group border-b last:border-b-0" style={{ borderColor: mode.border }}>
                      {a.imageUrl && <img src={a.imageUrl} alt="" className="w-14 h-10 object-cover rounded-lg flex-shrink-0" />}
                      <div>
                        <p className="text-xs mb-0.5" style={{ color: mode.color, opacity: 0.45 }}>{splitList(a.genres)[0] || ''}</p>
                        <h3 className="text-sm font-semibold line-clamp-2 leading-snug transition-colors group-hover:text-violet-600" style={{ color: mode.color, fontFamily: 'Georgia, "Times New Roman", serif' }}>{a.title}</h3>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </article>

          <aside className="space-y-5">

            <div className="rounded-2xl border p-5" style={{ background: mode.cardBg, borderColor: mode.border }}>
              <h3 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: mode.color, opacity: 0.45 }}>Info Artikel</h3>
              <div className="space-y-3">
                <InfoItem label="Rubrik" value={chips.map(c => c.name).join(', ') || '-'} mode={mode} />
                <InfoItem label="Tanggal Terbit" value={article.dateFormatted || article.publishDate} mode={mode} />
                <InfoItem label="Sumber" value={sourceName} mode={mode} />
                {authorNames.length > 0 && <InfoItem label="Penulis" value={authorNames.join(', ')} mode={mode} />}
                {article.pageNumber && <InfoItem label="Halaman" value={`Hal. ${article.pageNumber}`} mode={mode} />}
                {article.wordCount && <InfoItem label="Jumlah Kata" value={`${article.wordCount.toLocaleString('id-ID')} kata`} mode={mode} />}
                {article.viewCount > 0 && <InfoItem label="Tayangan" value={article.viewCount.toLocaleString('id-ID')} mode={mode} />}
              </div>
            </div>

            {article.relatedArticles?.length > 0 && (
              <div className="rounded-2xl border p-5" style={{ background: mode.cardBg, borderColor: mode.border }}>
                <h3 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: mode.color, opacity: 0.45 }}>Artikel Terkait</h3>
                <div className="space-y-3">
                  {article.relatedArticles.map(a => (
                    <Link key={a.id} to={articleHref(a)} className="block group">
                      <p className="text-[10px] mb-0.5" style={{ color: mode.color, opacity: 0.4 }}>{a.dateFormatted || a.publishDate}</p>
                      <h4 className="text-xs font-semibold line-clamp-2 leading-snug transition-colors group-hover:text-violet-600" style={{ color: mode.color, fontFamily: 'Georgia, "Times New Roman", serif' }}>{a.title}</h4>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Link to={`/koran/${sourceSlug}`} className="flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all hover:opacity-80" style={{ background: mode.cardBg, borderColor: mode.border, color: mode.color }}>
                <ChevronLeft className="w-4 h-4" />Kembali ke {sourceName}
              </Link>
              {publishYear && (
                <Link to={editionHref(sourceSlug, article.publishDate)} className="flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all hover:opacity-80" style={{ background: mode.cardBg, borderColor: mode.border, color: mode.color }}>
                  <Calendar className="w-4 h-4" />Edisi {article.dateFormatted || article.publishDate}
                </Link>
              )}
            </div>

            <NewspaperSocialSection article={article} mode={mode} />

          </aside>
        </div>
      </div>

      <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 backdrop-blur-md border-t"
        style={{ background: mode.bg, opacity: 0.98, borderColor: mode.border, paddingLeft: '12px', paddingRight: '12px', paddingTop: '8px', paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
        <div className="flex gap-2">
          <ReaderToolbar fontIdx={fontIdx} setFontIdx={setFontIdx} fontFamilyKey={fontFamilyKey} setFontFamilyKey={setFontFamilyKey} modeKey={modeKey} setModeKey={setModeKey} fullWidth />
          <button onClick={handleShare} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-bold transition-all active:scale-[0.98]" style={{ borderColor: mode.border, color: mode.color, background: mode.cardBg }}>
            <Share2 className="w-4 h-4" />Bagikan
          </button>
        </div>
      </div>
    </div>
  )
}

export default NewspaperArticleDetailPage
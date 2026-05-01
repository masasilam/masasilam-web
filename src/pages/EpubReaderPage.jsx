// ============================================
// src/pages/EpubReaderPage.jsx
// ============================================
import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import ePub from 'epubjs'
import bookService from '../services/bookService'
import zineService from '../services/zineService'
import { chapterService } from '../services/chapterService'
import LoadingSpinner from '../components/Common/LoadingSpinner'
import ReadingActivityBanner from '../components/Reader/ReadingActivityBanner'
import {
  ArrowLeft, BookOpen, Bookmark, BookmarkCheck,
  ChevronLeft, ChevronRight, Highlighter, Minus, Moon,
  Plus, Search, Settings, Sun, X, List, StickyNote, Trash2, Coffee, Type,
} from 'lucide-react'
import api from '../services/api'

const HIGHLIGHT_COLORS = [
  { name: 'Kuning', value: '#FDE68A', text: '#92400E' },
  { name: 'Hijau',  value: '#A7F3D0', text: '#065F46' },
  { name: 'Biru',   value: '#BFDBFE', text: '#1E40AF' },
  { name: 'Pink',   value: '#FBCFE8', text: '#9D174D' },
  { name: 'Ungu',   value: '#DDD6FE', text: '#5B21B6' },
]

const FONT_OPTIONS = [
  { label: 'Serif (Default)', value: "'Georgia', 'Times New Roman', serif" },
  { label: 'Garamond',        value: "'Garamond', 'Adobe Garamond Pro', 'Times New Roman', serif" },
  { label: 'Sans-Serif',      value: "'Inter', 'Segoe UI', 'Arial', sans-serif" },
  { label: 'Dyslexic',        value: "'OpenDyslexic', 'Comic Sans MS', sans-serif" },
  { label: 'Monospace',       value: "'Courier New', 'Courier', monospace" },
]

const COLOR_MODES = {
  light: { bg: '#FFFFFF', color: '#1F2937', label: 'Terang',  icon: Sun    },
  cream: { bg: '#f6eee3', color: '#2d1f0e', label: 'Krem',    icon: Coffee },
  dark:  { bg: '#111827', color: '#E5E7EB', label: 'Gelap',   icon: Moon   },
}

const makeEpubBase = (slug, isZine) => isZine ? `/zines/${slug}` : `/books/${slug}`

const epubAnnotationService = {
  getAll: async (slug, isZine = false) => {
    const res = await api.get(`${makeEpubBase(slug, isZine)}/epub-annotations`)
    const bundle = res.data?.data || res.data
    return {
      annotations: bundle?.annotations || [],
      bookmarks:   bundle?.bookmarks   || [],
    }
  },
  addAnnotation: async (slug, isZine = false, annotationData) => {
    const res = await api.post(`${makeEpubBase(slug, isZine)}/epub-annotations`, {
      cfi:          annotationData.cfi,
      selectedText: annotationData.text,
      color:        annotationData.color,
      note:         annotationData.note,
    })
    return res.data?.data || res.data
  },
  deleteAnnotation: async (slug, isZine = false, annotationId) => {
    await api.delete(`${makeEpubBase(slug, isZine)}/epub-annotations/${annotationId}`)
  },
  addBookmark: async (slug, isZine = false, bookmarkData) => {
    const res = await api.post(`${makeEpubBase(slug, isZine)}/epub-bookmarks`, {
      cfi:   bookmarkData.cfi,
      label: bookmarkData.text,
    })
    return res.data?.data || res.data
  },
  deleteBookmark: async (slug, isZine = false, bookmarkId) => {
    await api.delete(`${makeEpubBase(slug, isZine)}/epub-bookmarks/${bookmarkId}`)
  },
}

const generateSessionId = () =>
  `epub_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`

const getDeviceType = () =>
  /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ? 'mobile' : 'desktop'

const extractSpineIndex = (cfi) => {
  if (!cfi) return 0
  try {
    const match = cfi.match(/^epubcfi\(\/6\/(\d+)/)
    if (match) {
      const n = parseInt(match[1], 10)
      return Math.max(0, Math.floor(n / 2) - 1)
    }
  } catch {}
  return 0
}

const normalizeHref = (href) => {
  if (!href) return ''
  const withoutHash = href.split('#')[0]
  return withoutHash.split('/').pop() || ''
}

const findActiveChapter = (tocItems, currentHref) => {
  if (!currentHref || !tocItems?.length) return null
  const currentFile = normalizeHref(currentHref)
  if (!currentFile) return null
  const topLevel = tocItems.filter(t => t.depth === 0)
  let match = topLevel.find(item => normalizeHref(item.href) === currentFile)
  if (!match) {
    match = tocItems.find(item => normalizeHref(item.href) === currentFile)
  }
  return match || null
}

const isLinearSpineItem = (item) => {
  if (!item) return false
  if (item.linear === false || item.linear === 'no') return false
  return true
}

const resolveCanonicalHref = (epubBook, sectionHref) => {
  if (!sectionHref) return ''

  const items = epubBook.spine?.items || []

  const exact = items.find(item => {
    const h = item.href || item.url || ''
    return h === sectionHref
  })
  if (exact) return exact.href || exact.url || sectionHref

  const endsWith = items.find(item => {
    const h = item.href || item.url || ''
    return h.endsWith('/' + sectionHref) || h.endsWith(sectionHref)
  })
  if (endsWith) return endsWith.href || endsWith.url || sectionHref

  const filename = sectionHref.split('/').pop()
  const byFilename = items.find(item => {
    const h = item.href || item.url || ''
    return h.split('/').pop() === filename
  })
  if (byFilename) return byFilename.href || byFilename.url || sectionHref

  try {
    const section = epubBook.spine.get(sectionHref)
    if (section?.href) return section.href
  } catch {}

  try {
    const withPrefix = 'Text/' + filename
    const section = epubBook.spine.get(withPrefix)
    if (section?.href) return section.href
  } catch {}

  for (const prefix of ['OPS/', 'OEBPS/', 'ops/', 'oebps/']) {
    try {
      const section = epubBook.spine.get(prefix + filename)
      if (section?.href) return section.href
    } catch {}
  }

  console.warn('[resolveCanonicalHref] ❌ tidak ditemukan untuk:', sectionHref,
    '| spine hrefs:', items.map(i => i.href || i.url))
  return sectionHref
}

const resolveSpineItem = (epubBook, canonical) => {
  const items = epubBook.spine?.items || []
  const filename = canonical.split('/').pop()

  let item = items.find(i => (i.href || i.url || '') === canonical)
  if (item) return item

  item = items.find(i => (i.href || i.url || '').split('/').pop() === filename)
  if (item) return item

  try {
    const s = epubBook.spine.get(canonical)
    if (s) return s
  } catch {}

  return null
}

const findAnchorInDoc = (doc, anchor) => {
  if (!doc || !anchor) return null
  try { for (const el of doc.querySelectorAll('[id]')) { if (el.getAttribute('id') === anchor) return el } } catch {}
  try { const el = doc.getElementById?.(anchor); if (el) return el } catch {}
  try { const el = doc.querySelector?.(`#${CSS.escape(anchor)}`); if (el) return el } catch {}
  try { const el = doc.querySelector?.(`[name="${CSS.escape(anchor)}"]`); if (el) return el } catch {}
  try {
    const walker = doc.createTreeWalker?.(doc.body || doc.documentElement, NodeFilter.SHOW_ELEMENT, null, false)
    if (walker) {
      let node = walker.nextNode()
      while (node) {
        if (node.getAttribute?.('id')?.trim() === anchor) return node
        if (node.getAttribute?.('name')?.trim() === anchor) return node
        node = walker.nextNode()
      }
    }
  } catch {}
  return null
}

const resolveAnchorToCfi = async (epubBook, canonicalHref, anchor) => {
  console.group(`[resolveAnchorToCfi] href="${canonicalHref}" anchor="${anchor}"`)
  try {
    const section = epubBook.spine.get(canonicalHref)
    console.log('  section found:', section ? `✅ (href: ${section.href})` : '❌ NOT FOUND')

    if (!section) {
      const allItems = epubBook.spine?.items || []
      console.log('  All spine hrefs:', allItems.map(i => i.href || i.url))
      throw new Error('Section tidak ditemukan di spine')
    }

    const sectionDoc = await section.load(epubBook.load.bind(epubBook))
    console.log('  sectionDoc loaded:', sectionDoc ? '✅' : '❌ null')

    if (!sectionDoc) throw new Error('sectionDoc null')

    let allIds = []
    try {
      allIds = Array.from(sectionDoc.querySelectorAll('[id]'))
        .slice(0, 50)
        .map(el => el.getAttribute('id'))
    } catch (e) {
      console.warn('  querySelectorAll [id] gagal:', e.message)
    }
    console.log(`  IDs in doc (first 50):`, allIds)

    const el = findAnchorInDoc(sectionDoc, anchor)
    console.log('  findAnchorInDoc:', el ? `✅ <${el.tagName} id="${el.getAttribute?.('id')}">` : '❌ NOT FOUND')

    if (!el) throw new Error(`Anchor "${anchor}" tidak ditemukan`)

    const cfi = section.cfiFromElement(el)
    console.log('  CFI generated:', cfi || '❌ null')

    if (!cfi) throw new Error('cfiFromElement null')

    section.unload()
    console.log('  ✅ resolveAnchorToCfi sukses via section-api')
    console.groupEnd()
    return { cfi, method: 'section-api' }
  } catch (err) {
    console.warn('  ❌ Error:', err.message)
    console.groupEnd()
    return { cfi: null, method: 'direct-href', canonicalHref }
  }
}

const localKeys = (slug) => ({
  annotations:     `epub_annotations_${slug}`,
  bookmarks:       `epub_bookmarks_${slug}`,
  progress:        `epub_progress_${slug}`,
  progressAt:      `epub_progress_at_${slug}`,
  colorMode:       'epubColorMode',
  fontSize:        'epubFontSize',
  fontFamily:      'epubFontFamily',
  guestNoticeSeen: 'epub_guest_notice_seen',
})

// ─────────────────────────────────────────────────────────────────────────────
// Helper: CSS variables untuk zine stylesheet
// ─────────────────────────────────────────────────────────────────────────────

const getZineVars = (mode) => {
  const cfg = COLOR_MODES[mode] || COLOR_MODES.light
  const isDarkMode  = mode === 'dark'
  const isCreamMode = mode === 'cream'

  if (isDarkMode) return {
    '--zine-ink':        '#EDE4CC',
    '--zine-ink-soft':   '#D4C8A8',
    '--zine-white':      cfg.bg,
    '--zine-cream':      cfg.bg,
    '--zine-cream-dark': '#1C1608',
    '--zine-gray':       '#9A8E7A',
    '--zine-gray-light': '#5A5040',
    '--zine-rule':       '#6B5E40',
    '--zine-orange':     '#E06030',
    '--zine-navy':       '#8AAECC',
  }
  if (isCreamMode) return {
    '--zine-ink':        '#2d1f0e',
    '--zine-ink-soft':   '#3d2c18',
    '--zine-white':      cfg.bg,
    '--zine-cream':      '#f6eee3',
    '--zine-cream-dark': '#ede3d6',
    '--zine-gray':       '#7a6a55',
    '--zine-gray-light': '#c9b89a',
    '--zine-rule':       '#b09070',
    '--zine-orange':     '#C94B1A',
    '--zine-navy':       '#1A2744',
  }
  return {
    '--zine-ink':        '#1A1209',
    '--zine-ink-soft':   '#2E2416',
    '--zine-white':      '#FDFAF4',
    '--zine-cream':      '#F5EFE0',
    '--zine-cream-dark': '#EDE4CC',
    '--zine-gray':       '#6B6055',
    '--zine-gray-light': '#B0A898',
    '--zine-rule':       '#8C7A62',
    '--zine-orange':     '#C94B1A',
    '--zine-navy':       '#1A2744',
  }
}

const injectZineDocStyles = (doc, mode) => {
  if (!doc) return
  try {
    const zineVars = getZineVars(mode)

    let varsEl = doc.getElementById('reader-zine-vars-override')
    if (!varsEl) {
      varsEl = doc.createElement('style')
      varsEl.id = 'reader-zine-vars-override'
      ;(doc.head || doc.documentElement).appendChild(varsEl)
    }
    const vars = Object.entries(zineVars).map(([k, v]) => `${k}:${v};`).join('')
    varsEl.textContent = `:root{${vars}color-scheme:light;}@media(prefers-color-scheme:dark){:root{${vars}}}`

    let fixEl = doc.getElementById('reader-zine-layout-fix')
    if (!fixEl) {
      fixEl = doc.createElement('style')
      fixEl.id = 'reader-zine-layout-fix'
      ;(doc.head || doc.documentElement).appendChild(fixEl)
    }
    fixEl.textContent = `
      .initial {
        float: left !important;
        font-size: 3.5em !important;
        font-weight: 700 !important;
        line-height: 0.82 !important;
        margin: 0.05em 0.1em 0 0 !important;
        display: block !important;
      }
      p:has(> .initial) {
        text-indent: 0 !important;
        overflow: hidden !important;
      }
      .drop-cap::first-letter {
        float: left !important;
        font-size: 3.8em !important;
        font-weight: 700 !important;
        line-height: 0.82 !important;
        margin: 0.05em 0.08em 0 0 !important;
      }
      .figures-right {
        float: right !important;
        width: 42% !important;
        margin: 0 0 0.5em 1em !important;
        overflow: hidden !important;
        display: block !important;
      }
      .figures-left {
        float: left !important;
        width: 42% !important;
        margin: 0 1em 0.5em 0 !important;
        overflow: hidden !important;
        display: block !important;
      }
      .figures-right img,
      .figures-left img {
        width: 100% !important;
        height: auto !important;
        display: block !important;
      }
      .clearfix {
        display: flow-root !important;
      }
      .clearfix::after {
        display: none !important;
      }
      .image-right {
        float: right !important;
        margin: 0 0 0.5em 1em !important;
        max-width: 45% !important;
        display: block !important;
      }
      .image-left {
        float: left !important;
        margin: 0 1em 0.5em 0 !important;
        max-width: 45% !important;
        display: block !important;
      }
      .portrait-box {
        display: block !important;
        overflow: hidden !important;
      }
      .two-column {
        -webkit-column-count: 2 !important;
        column-count: 2 !important;
        -webkit-column-gap: 2em !important;
        column-gap: 2em !important;
        overflow: visible !important;
      }
      .sidebar-box {
        display: block !important;
        overflow: hidden !important;
      }
      .figures-right figcaption,
      .figures-left figcaption {
        text-align: center !important;
        font-size: 0.75em !important;
        font-style: italic !important;
        margin-top: 0.3em !important;
      }
      img {
        filter: ${mode === 'dark' ? 'invert(0.85)' : 'none'} !important;
        opacity: ${mode === 'dark' ? '0.9' : '1'} !important;
      }
      img.ornament, img.icon, img.decoration, img.logo,
      .colophon img, .imprint img {
        filter: ${mode === 'dark' ? 'invert(1) opacity(0.7)' : 'none'} !important;
        opacity: 1 !important;
      }
      img.photo, img.illustration, img.colored,
      img.no-invert, figure img,
      .figures-right img, .figures-left img,
      .portrait-box img {
        filter: none !important;
        opacity: ${mode === 'dark' ? '0.88' : '1'} !important;
      }
    `
  } catch (err) {
    console.warn('[injectZineDocStyles] error:', err.message)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-komponen
// ─────────────────────────────────────────────────────────────────────────────

const NoteModal = ({ selectedText, onSave, onClose }) => {
  const [noteText, setNoteText] = useState('')
  const [color, setColor] = useState(HIGHLIGHT_COLORS[0].value)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <StickyNote size={18} className="text-amber-500" />
            Tambah Catatan
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X size={20} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 text-sm text-amber-800 dark:text-amber-300 italic line-clamp-3">
            "{selectedText}"
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Warna Highlight</label>
            <div className="flex gap-2">
              {HIGHLIGHT_COLORS.map(c => (
                <button key={c.value} onClick={() => setColor(c.value)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${color === c.value ? 'border-gray-600 dark:border-white scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c.value }} title={c.name} />
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Catatan (opsional)</label>
            <textarea value={noteText} onChange={e => setNoteText(e.target.value)}
              placeholder="Tulis catatan kamu di sini..." rows={3} autoFocus
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition">Batal</button>
            <button onClick={() => onSave({ color, note: noteText })} className="flex-1 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium transition">Simpan</button>
          </div>
        </div>
      </div>
    </div>
  )
}

const SelectionPopup = ({ position, onHighlight, onNote, onClose }) => {
  if (!position) return null
  const popupWidth = 220, popupHeight = 44, margin = 8
  const left = Math.min(Math.max(margin, position.x - popupWidth / 2), window.innerWidth - popupWidth - margin)
  const top  = Math.max(margin, position.y - popupHeight - 12)
  return (
    <div className="fixed z-40 flex items-center gap-1 bg-gray-900 dark:bg-gray-700 rounded-xl shadow-2xl px-2 py-1.5 border border-gray-700 dark:border-gray-500"
      style={{ top, left }}>
      {HIGHLIGHT_COLORS.slice(0, 3).map(c => (
        <button key={c.value} onClick={() => onHighlight(c.value)}
          className="w-6 h-6 rounded-full border-2 border-white/30 hover:scale-125 transition-transform"
          style={{ backgroundColor: c.value }} title={`Highlight ${c.name}`} />
      ))}
      <div className="w-px h-5 bg-white/20 mx-1" />
      <button onClick={onNote} className="flex items-center gap-1 px-2 py-1 rounded-lg text-white text-xs hover:bg-white/10 transition">
        <StickyNote size={14} /><span>Catatan</span>
      </button>
      <button onClick={onClose} className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition">
        <X size={14} />
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SearchPanel — pencarian teks penuh dalam isi EPUB
// ─────────────────────────────────────────────────────────────────────────────

const SearchPanel = ({ onClose, onNavigate, colorMode, bookRef, tocRef }) => {
  const [query,       setQuery]       = useState('')
  const [results,     setResults]     = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [searched,    setSearched]    = useState(false)
  const [scanProgress, setScanProgress] = useState({ current: 0, total: 0 })
  const abortRef  = useRef(false)
  const inputRef  = useRef(null)

  const cfg          = COLOR_MODES[colorMode] || COLOR_MODES.light
  const isDark       = colorMode === 'dark'
  const isCream      = colorMode === 'cream'
  const borderClr    = isDark ? '#374151' : isCream ? '#d6c5aa' : '#e5e7eb'
  const mutedClr     = isDark ? '#9CA3AF' : isCream ? '#7a6a55' : '#6B7280'
  const inputBg      = isDark ? '#1F2937' : isCream ? '#e8dcc8' : '#F9FAFB'
  const resultHoverBg = isDark ? '#1F2937' : isCream ? '#ede3d6' : '#F9FAFB'
  const accentClr    = isDark ? '#FCD34D' : '#D97706'

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 80)
  }, [])

  const getChapterLabel = useCallback((sectionHref) => {
    if (!tocRef?.current?.length || !sectionHref) return ''
    const file = sectionHref.split('/').pop()
    const match = tocRef.current.find(t => {
      const tf = (t.href || '').split('/').pop().split('#')[0]
      return tf === file
    })
    return match?.label || ''
  }, [tocRef])

  const renderExcerpt = useCallback((excerpt, q) => {
    if (!excerpt || !q) return excerpt
    try {
      const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const parts   = excerpt.split(new RegExp(`(${escaped})`, 'gi'))
      return parts.map((part, i) =>
        part.toLowerCase() === q.toLowerCase()
          ? (
            <mark key={i} style={{
              backgroundColor: '#FDE68A',
              color:           '#92400E',
              borderRadius:    '2px',
              padding:         '0 1px',
              fontWeight:      600,
            }}>
              {part}
            </mark>
          )
          : part
      )
    } catch {
      return excerpt
    }
  }, [])

  // ── FIX: Manual text search menggantikan section.find() ──────────────────
  // section.find() epubjs hanya bekerja pada section yang sedang di-render
  // di iframe. Section lain yang di-load manual mengisi section.document
  // tapi find() tetap mengembalikan [] karena bergantung pada iframe DOM.
  // Solusi: TreeWalker langsung di section.document setelah load().
  const handleSearch = useCallback(async () => {
    const q = query.trim()
    if (!q || !bookRef?.current) return

    abortRef.current = true
    await new Promise(r => setTimeout(r, 0))
    abortRef.current = false

    setIsSearching(true)
    setResults([])
    setSearched(true)
    setScanProgress({ current: 0, total: 0 })

    try {
      const book  = bookRef.current
      const items = (book.spine?.items || []).filter(isLinearSpineItem)

      console.log('[Search] 📚 Total spine items (linear):', items.length)
      setScanProgress({ current: 0, total: items.length })

      for (let i = 0; i < items.length; i++) {
        if (abortRef.current) break

        const item = items[i]
        setScanProgress({ current: i + 1, total: items.length })

        const href = item.href || item.url || ''

        try {
          const section = book.spine.get(href)
          if (!section) continue

          await section.load(book.load.bind(book))

          const doc = section.document
          const found = []

          // Manual text search via TreeWalker — bekerja di semua section,
          // tidak bergantung pada iframe rendering seperti section.find()
          if (doc?.body) {
            const lowerQ  = q.toLowerCase()
            const walker  = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, null)
            let node = walker.nextNode()

            while (node) {
              const text      = node.nodeValue || ''
              const lowerText = text.toLowerCase()
              let idx = lowerText.indexOf(lowerQ)

              while (idx !== -1) {
				// JADI ini (gunakan 'doc' bukan 'sectionDoc'):
				let cfi = null
				try {
				  // Coba cfiFromRange dulu — lebih akurat
				  try {
					const range = doc.createRange()
					range.setStart(node, idx)
					range.setEnd(node, Math.min(idx + q.length, (node.nodeValue || '').length))
					const rawCfi = section.cfiFromRange(range)
					if (rawCfi) {
					  // Strip range suffix dan character offset untuk hindari IndexSizeError
					  // epubcfi(/6/14!/4/2/26,/1:2,/1:5) → epubcfi(/6/14!/4/2/26)
					  let clean = rawCfi.replace(/,.*\)$/, ')')
					  clean = clean.replace(/:(\d+)(\)|\[)/g, '$2')
					  clean = clean.replace(/:(\d+)\)$/, ')')
					  cfi = clean
					}
				  } catch {
					// Fallback: CFI dari parent element
					const el = node.parentElement || node.parentNode
					if (el && el.tagName !== 'BODY' && el.tagName !== 'HTML') {
					  const elCfi = section.cfiFromElement(el)
					  if (elCfi) {
						// Strip character offset dari element CFI juga
						let clean = elCfi.replace(/:(\d+)(\)|\[)/g, '$2').replace(/:(\d+)\)$/, ')')
						cfi = clean
					  }
					}
				  }
				} catch (cfiErr) {
				  console.warn(`[Search] CFI generation gagal untuk "${q}":`, cfiErr.message)
				}

                // Buat excerpt: ~60 karakter konteks di kiri dan kanan
                const start   = Math.max(0, idx - 60)
                const end     = Math.min(text.length, idx + q.length + 60)
                const excerpt = text.slice(start, end).replace(/\s+/g, ' ').trim()

                if (cfi) {
                  // De-duplikasi: satu CFI per element — ambil excerpt terbaik
                  const existing = found.find(f => f.cfi === cfi)
                  if (!existing) {
                    found.push({ cfi, excerpt })
                  } else if (excerpt.length > existing.excerpt.length) {
                    existing.excerpt = excerpt
                  }
                }

                idx = lowerText.indexOf(lowerQ, idx + 1)
              }

              node = walker.nextNode()
            }
          }

          section.unload()

          if (found.length > 0) {
            const chapterLabel = getChapterLabel(href)
            const mapped = found.map(r => ({
              cfi:         r.cfi,
              excerpt:     r.excerpt || '',
              sectionHref: href,
              chapterLabel,
            }))
            setResults(prev => [...prev, ...mapped])
          }
        } catch (sectionErr) {
          console.warn(`[Search] ❌ Section "${href}" error:`, sectionErr.message)
        }
      }
    } catch (err) {
      console.error('[Search] 💥 Fatal error:', err)
    } finally {
      setIsSearching(false)
    }
  }, [query, bookRef, getChapterLabel])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch()
    if (e.key === 'Escape') onClose()
  }

  const handleClear = () => {
    abortRef.current = true
    setQuery('')
    setResults([])
    setSearched(false)
    setIsSearching(false)
    setScanProgress({ current: 0, total: 0 })
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  return (
    <div className="flex flex-col h-full" style={{ background: cfg.bg, color: cfg.color }}>

      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: `1px solid ${borderClr}` }}
      >
        <span className="font-semibold text-sm flex items-center gap-2" style={{ color: cfg.color }}>
          <Search size={15} style={{ color: accentClr }} />
          Cari dalam Buku
        </span>
        <button onClick={onClose} className="hover:opacity-70 transition" style={{ color: mutedClr }}>
          <X size={18} />
        </button>
      </div>

      {/* ── Input + Tombol Cari ── */}
      <div className="p-3 flex-shrink-0" style={{ borderBottom: `1px solid ${borderClr}` }}>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ketik kata atau kalimat..."
              className="w-full pl-3 pr-8 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
              style={{
                background: inputBg,
                color:      cfg.color,
                border:     `1px solid ${borderClr}`,
              }}
            />
            {query.length > 0 && (
              <button
                onClick={handleClear}
                className="absolute right-2 top-1/2 -translate-y-1/2 hover:opacity-70 transition"
                style={{ color: mutedClr }}
              >
                <X size={13} />
              </button>
            )}
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching || !query.trim()}
            className="px-3 py-2 rounded-lg text-sm font-medium transition disabled:opacity-40 flex items-center gap-1.5 flex-shrink-0"
            style={{ background: '#F59E0B', color: '#fff' }}
            title="Cari (Enter)"
          >
            {isSearching
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Search size={14} />
            }
          </button>
        </div>

        {/* ── Status / Progress bar ── */}
        <div className="mt-2 min-h-[18px]">
          {isSearching && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs" style={{ color: mutedClr }}>
                <span>
                  Memindai {scanProgress.current} / {scanProgress.total} bagian…
                </span>
                {results.length > 0 && (
                  <span style={{ color: accentClr }}>{results.length} ditemukan</span>
                )}
              </div>
              <div className="h-1 rounded-full overflow-hidden" style={{ background: borderClr }}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: scanProgress.total > 0
                      ? `${(scanProgress.current / scanProgress.total) * 100}%`
                      : '0%',
                    background: '#F59E0B',
                  }}
                />
              </div>
            </div>
          )}
          {!isSearching && searched && (
            <p className="text-xs" style={{ color: results.length > 0 ? accentClr : mutedClr }}>
              {results.length > 0
                ? `${results.length} hasil untuk "${query}"`
                : `Tidak ada hasil untuk "${query}"`
              }
            </p>
          )}
        </div>
      </div>

      {/* ── Daftar Hasil ── */}
      <div className="flex-1 overflow-y-auto">

        {!searched && !isSearching && (
          <div className="flex flex-col items-center justify-center py-14 gap-2" style={{ color: mutedClr }}>
            <Search size={36} className="opacity-20" />
            <p className="text-sm">Ketik kata lalu tekan Enter</p>
            <p className="text-xs opacity-70">atau klik tombol cari</p>
          </div>
        )}

        {searched && results.length === 0 && !isSearching && (
          <div className="flex flex-col items-center justify-center py-14 gap-2" style={{ color: mutedClr }}>
            <Search size={36} className="opacity-20" />
            <p className="text-sm font-medium">Tidak ada hasil</p>
            <p className="text-xs text-center px-6 opacity-70">Coba kata lain atau periksa ejaan</p>
          </div>
        )}

        {results.map((result, idx) => (
          <button
            key={`${result.cfi}_${idx}`}
            onClick={() => {
              onNavigate(result.cfi, query)
              onClose()
            }}
            className="w-full text-left px-4 py-3 transition-colors"
            style={{ borderBottom: `1px solid ${borderClr}` }}
            onMouseEnter={e => { e.currentTarget.style.background = resultHoverBg }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            {result.chapterLabel && (
              <p
                className="text-xs font-medium mb-1 truncate flex items-center gap-1"
                style={{ color: accentClr }}
              >
                <BookOpen size={10} />
                {result.chapterLabel}
              </p>
            )}
            <p className="text-xs leading-relaxed" style={{ color: cfg.color }}>
              …{renderExcerpt(result.excerpt, query)}…
            </p>
          </button>
        ))}

        {results.length > 0 && <div className="h-4" />}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SidebarPanel
// ─────────────────────────────────────────────────────────────────────────────

const SidebarPanel = ({
  activeTab, toc, bookmarks, annotations,
  onTocClick, onBookmarkClick, onAnnotationClick,
  onDeleteBookmark, onDeleteAnnotation, onClose,
  colorMode,
}) => {
  const cfg     = COLOR_MODES[colorMode] || COLOR_MODES.light
  const isDark  = colorMode === 'dark'
  const isCream = colorMode === 'cream'

  const borderClr  = isDark ? '#374151' : isCream ? '#d6c5aa' : '#e5e7eb'
  const mutedClr   = isDark ? '#9CA3AF' : isCream ? '#7a6a55' : '#6B7280'
  const hoverBgCls = isDark ? 'hover:bg-gray-800' : isCream ? 'hover:bg-[#e8dcc8]' : 'hover:bg-gray-100'

  const tabs = [
    { id: 'toc',         label: 'Daftar Isi', icon: List        },
    { id: 'bookmarks',   label: 'Penanda',    icon: Bookmark    },
    { id: 'annotations', label: 'Anotasi',    icon: Highlighter },
  ]
  const [tab, setTab] = useState(activeTab || 'toc')

  return (
    <div className="flex flex-col h-full" style={{ background: cfg.bg, color: cfg.color }}>
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${borderClr}` }}>
        <span className="font-semibold text-sm" style={{ color: cfg.color }}>Panel</span>
        <button onClick={onClose} className="hover:opacity-70 transition" style={{ color: mutedClr }}>
          <X size={18} />
        </button>
      </div>
      <div className="flex" style={{ borderBottom: `1px solid ${borderClr}` }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors"
            style={{
              color:        tab === t.id ? '#D97706' : mutedClr,
              borderBottom: tab === t.id ? '2px solid #F59E0B' : '2px solid transparent',
            }}>
            <t.icon size={15} />{t.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        {tab === 'toc' && (
          <div className="py-2">
            {toc.length === 0
              ? <p className="text-center text-sm py-8" style={{ color: mutedClr }}>Tidak ada daftar isi</p>
              : toc.map((item, idx) => (
                <button key={idx} onClick={() => onTocClick(item.href)}
                  className={`w-full text-left py-2.5 text-sm transition-colors ${hoverBgCls}`}
                  style={{
                    paddingLeft:  `${(item.depth || 0) * 12 + 16}px`,
                    paddingRight: '16px',
                    color:        item.depth === 0 ? cfg.color : mutedClr,
                    fontWeight:   item.depth === 0 ? 500 : 400,
                    fontSize:     item.depth === 0 ? '14px' : '12px',
                  }}>
                  {item.label}
                </button>
              ))}
          </div>
        )}
        {tab === 'bookmarks' && (
          <div className="py-2">
            {bookmarks.length === 0
              ? (
                <div className="flex flex-col items-center py-10" style={{ color: mutedClr }}>
                  <Bookmark size={32} className="mb-2 opacity-40" />
                  <p className="text-sm">Belum ada penanda</p>
                </div>
              )
              : bookmarks.map((bm, idx) => (
                <div key={bm.id || idx} className={`flex items-start gap-2 px-4 py-3 group ${hoverBgCls}`}>
                  <button onClick={() => onBookmarkClick(bm.cfi)} className="flex-1 text-left">
                    <p className="text-xs font-medium mb-0.5" style={{ color: '#D97706' }}>Penanda {idx + 1}</p>
                    <p className="text-xs line-clamp-2" style={{ color: mutedClr }}>{bm.text || bm.label}</p>
                  </button>
                  <button onClick={() => onDeleteBookmark(idx)}
                    className="opacity-0 group-hover:opacity-100 transition"
                    style={{ color: '#F87171' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
          </div>
        )}
        {tab === 'annotations' && (
          <div className="py-2">
            {annotations.length === 0
              ? (
                <div className="flex flex-col items-center py-10" style={{ color: mutedClr }}>
                  <Highlighter size={32} className="mb-2 opacity-40" />
                  <p className="text-sm">Belum ada anotasi</p>
                </div>
              )
              : annotations.map((ann, idx) => (
                <div key={ann.id || idx}
                  className={`px-4 py-3 group ${hoverBgCls}`}
                  style={{ borderBottom: `1px solid ${borderClr}` }}>
                  <div className="flex items-start gap-2">
                    <div className="w-3 h-3 rounded-full mt-0.5 flex-shrink-0" style={{ backgroundColor: ann.color }} />
                    <div className="flex-1 min-w-0">
                      <button onClick={() => onAnnotationClick(ann.cfi)} className="text-left w-full">
                        <p className="text-xs line-clamp-2 italic" style={{ color: cfg.color }}>
                          "{ann.text || ann.selectedText}"
                        </p>
                        {ann.note && (
                          <p className="text-xs mt-1" style={{ color: mutedClr }}>{ann.note}</p>
                        )}
                      </button>
                    </div>
                    <button onClick={() => onDeleteAnnotation(idx)}
                      className="opacity-0 group-hover:opacity-100 transition flex-shrink-0"
                      style={{ color: '#F87171' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SettingsPanel
// ─────────────────────────────────────────────────────────────────────────────

const SettingsPanel = ({ fontSize, onFontSizeChange, colorMode, onColorModeChange, fontFamily, onFontChange, onClose }) => {
  const cfg     = COLOR_MODES[colorMode] || COLOR_MODES.light
  const isDark  = colorMode === 'dark'
  const isCream = colorMode === 'cream'

  const borderClr  = isDark ? '#374151' : isCream ? '#d6c5aa' : '#e5e7eb'
  const mutedClr   = isDark ? '#9CA3AF' : isCream ? '#7a6a55' : '#6B7280'
  const controlBg  = isDark ? '#1F2937' : isCream ? '#e8dcc8' : '#F3F4F6'

  return (
    <div className="flex flex-col h-full" style={{ background: cfg.bg, color: cfg.color }}>
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${borderClr}` }}>
        <span className="font-semibold text-sm" style={{ color: cfg.color }}>Pengaturan Tampilan</span>
        <button onClick={onClose} className="hover:opacity-70 transition" style={{ color: mutedClr }}>
          <X size={18} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        <div>
          <label className="block text-xs font-medium mb-2 uppercase tracking-wide" style={{ color: mutedClr }}>
            Ukuran Font
          </label>
          <div className="flex items-center gap-3 rounded-xl p-1" style={{ background: controlBg }}>
            <button
              onClick={() => onFontSizeChange(Math.max(12, fontSize - 2))}
              className="flex-1 flex items-center justify-center h-8 rounded-lg transition hover:opacity-70"
              style={{ color: cfg.color }}>
              <Minus size={14} />
            </button>
            <span className="text-sm font-medium min-w-[3ch] text-center" style={{ color: cfg.color }}>
              {fontSize}
            </span>
            <button
              onClick={() => onFontSizeChange(Math.min(28, fontSize + 2))}
              className="flex-1 flex items-center justify-center h-8 rounded-lg transition hover:opacity-70"
              style={{ color: cfg.color }}>
              <Plus size={14} />
            </button>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium mb-2 uppercase tracking-wide flex items-center gap-1" style={{ color: mutedClr }}>
            <Type size={11} /> Font
          </label>
          <div className="space-y-1">
            {FONT_OPTIONS.map(f => (
              <button key={f.value} onClick={() => onFontChange(f.value)}
                className="w-full text-left px-3 py-2 rounded-lg text-sm transition"
                style={{
                  fontFamily: f.value,
                  background: fontFamily === f.value ? '#F59E0B' : controlBg,
                  color:      fontFamily === f.value ? '#FFFFFF'  : cfg.color,
                }}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium mb-2 uppercase tracking-wide" style={{ color: mutedClr }}>
            Tema
          </label>
          <div className="flex gap-2">
            {Object.entries(COLOR_MODES).map(([key, modeCfg]) => {
              const Icon = modeCfg.icon
              return (
                <button key={key} onClick={() => onColorModeChange(key)}
                  className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl text-xs font-medium transition"
                  style={{
                    background: modeCfg.bg,
                    color:      modeCfg.color,
                    border:     colorMode === key ? '2px solid #F59E0B' : `2px solid ${borderClr}`,
                    boxShadow:  colorMode === key ? '0 0 0 1px #F59E0B33' : 'none',
                  }}>
                  <Icon size={14} />{modeCfg.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// GuestNoticeBanner
// ─────────────────────────────────────────────────────────────────────────────

const GuestNoticeBanner = ({ onDismiss, onRegister, onLogin }) => (
  <div className="fixed bottom-12 left-3 right-3 z-50 md:left-auto md:right-4 md:bottom-6 md:w-80 bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-700 rounded-xl shadow-lg p-3 flex items-start gap-3 animate-in slide-in-from-bottom-2 duration-200">
    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center mt-0.5">
      <Highlighter size={15} className="text-amber-600 dark:text-amber-400" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-gray-800 dark:text-gray-200 mb-0.5">Highlight tersimpan di browser ini saja</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 leading-relaxed">Daftar gratis untuk menyimpan permanen dan sync di semua perangkat.</p>
      <div className="flex items-center gap-2">
        <button onClick={onRegister} className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium rounded-lg transition">Daftar gratis</button>
        <button onClick={onLogin} className="px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition">Masuk</button>
      </div>
    </div>
    <button onClick={onDismiss} className="flex-shrink-0 text-gray-300 hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-400 transition mt-0.5"><X size={14} /></button>
  </div>
)

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

const EpubReaderPage = () => {
  const { bookSlug, zineSlug } = useParams()
  const slug        = bookSlug || zineSlug
  const isZineMode  = !!zineSlug
  const navigate    = useNavigate()
  const location    = useLocation()
  const isAuthenticated = !!localStorage.getItem('token')

  const [book,    setBook]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const viewerRef       = useRef(null)
  const touchWrapperRef = useRef(null)
  const touchStartX     = useRef(0)
  const touchStartY     = useRef(0)
  const bookRef         = useRef(null)
  const renditionRef    = useRef(null)
  const currentCfiRef   = useRef(null)
  const isNavigatingRef = useRef(false)

  const [toc, setToc] = useState([])
  const tocRef        = useRef([])

  const keys = localKeys(slug)

  const sessionIdRef          = useRef(generateSessionId())
  const sessionStartRef       = useRef(Date.now())
  const latestProgressRef     = useRef(0)
  const spineIndexRef         = useRef(0)
  const totalSpineItemsRef    = useRef(0)
  const locationsReadyRef     = useRef(false)
  const sessionSentRef        = useRef(false)
  const startReadingCalledRef = useRef(false)

  const currentChapterLabelRef = useRef('')
  const currentChapterIndexRef = useRef(0)
  const totalChaptersRef       = useRef(0)

  const [currentChapterLabel, setCurrentChapterLabel] = useState('')

  const [colorMode,  setColorMode]  = useState(() => localStorage.getItem(keys.colorMode)  || 'light')
  const [fontSize,   setFontSize]   = useState(() => parseInt(localStorage.getItem(keys.fontSize) || '16'))
  const [fontFamily, setFontFamily] = useState(() => localStorage.getItem(keys.fontFamily) || FONT_OPTIONS[0].value)

  const isDark = colorMode === 'dark'

  const colorModeRef = useRef(colorMode)
  useEffect(() => { colorModeRef.current = colorMode }, [colorMode])

  const [showSidebar,  setShowSidebar]  = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showSearch,   setShowSearch]   = useState(false)
  const [progress,     setProgress]     = useState(0)
  const [isReady,      setIsReady]      = useState(false)
  const [epubError,    setEpubError]    = useState(null)
  const [isSyncing,    setIsSyncing]    = useState(false)

  const [annotations, setAnnotations] = useState(() => {
    try { return JSON.parse(localStorage.getItem(keys.annotations) || '[]') } catch { return [] }
  })
  const [bookmarks, setBookmarks] = useState(() => {
    try { return JSON.parse(localStorage.getItem(keys.bookmarks) || '[]') } catch { return [] }
  })

  const [selection,       setSelection]       = useState(null)
  const [showNoteModal,   setShowNoteModal]   = useState(false)
  const [isBookmarked,    setIsBookmarked]    = useState(false)
  const [showGuestNotice, setShowGuestNotice] = useState(false)

  const triggerGuestNotice = useCallback(() => {
    if (isAuthenticated) return
    if (!localStorage.getItem(keys.guestNoticeSeen)) setShowGuestNotice(true)
  }, [isAuthenticated, keys.guestNoticeSeen])

  const dismissGuestNotice = useCallback(() => {
    setShowGuestNotice(false)
    localStorage.setItem(keys.guestNoticeSeen, '1')
  }, [keys.guestNoticeSeen])

  useEffect(() => { latestProgressRef.current = progress }, [progress])

  // ── Session tracking ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return

    const sessionId  = sessionIdRef.current
    const deviceType = getDeviceType()

    const handleBeforeUnload = () => {
      if (sessionSentRef.current) return
      sessionSentRef.current = true

      const durationSeconds = Math.round((Date.now() - sessionStartRef.current) / 1000)
      if (durationSeconds < 5) return

      const payload = JSON.stringify({
        sessionId,
        durationSeconds,
        progressPercent:    latestProgressRef.current,
        progressIsAccurate: locationsReadyRef.current,
        deviceType,
        spineIndex:      spineIndexRef.current,
        totalSpineItems: totalSpineItemsRef.current,
        chapterLabel:    currentChapterLabelRef.current,
        chapterIndex:    currentChapterIndexRef.current,
        totalChapters:   totalChaptersRef.current,
        lastCfi:         currentCfiRef.current,
      })
      const apiBase       = import.meta.env.VITE_API_BASE_URL || '/api'
      const token         = localStorage.getItem('token')
      const contentPrefix = isZineMode ? 'zines' : 'books'
      fetch(`${apiBase}/${contentPrefix}/${slug}/reading/epub-session`, {
        method: 'POST', keepalive: true,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: payload,
      }).catch(() => {})
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)

      if (sessionSentRef.current) return
      sessionSentRef.current = true

      const durationSeconds = Math.round((Date.now() - sessionStartRef.current) / 1000)
      if (durationSeconds < 5) return

      chapterService.recordEpubSession(slug, {
        sessionId,
        durationSeconds,
        progressPercent:    latestProgressRef.current,
        progressIsAccurate: locationsReadyRef.current,
        deviceType,
        spineIndex:      spineIndexRef.current,
        totalSpineItems: totalSpineItemsRef.current,
        chapterLabel:    currentChapterLabelRef.current,
        chapterIndex:    currentChapterIndexRef.current,
        totalChapters:   totalChaptersRef.current,
        lastCfi:         currentCfiRef.current,
      }, isZineMode).catch(err => console.warn('[EpubReader] Gagal merekam sesi:', err.message))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, isAuthenticated])

  // ── Fetch book / zine ──────────────────────────────────────────────────────
  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true)
        const data = isZineMode
          ? await zineService.getZineBySlug(slug)
          : await bookService.getBookBySlug(slug)
        setBook(data)
      } catch {
        setError('Konten tidak ditemukan atau tidak memiliki file EPUB.')
      } finally {
        setLoading(false)
      }
    }
    fetchBook()
  }, [slug, isZineMode])

  // ── Load annotations & bookmarks from server ───────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !slug) return
    const loadFromServer = async () => {
      try {
        const { annotations: sa, bookmarks: sb } = await epubAnnotationService.getAll(slug, isZineMode)
        const na = sa.map(a => ({ ...a, text: a.selectedText || a.text }))
        const nb = sb.map(b => ({ ...b, text: b.label || b.text }))
        setAnnotations(na)
        setBookmarks(nb)
        localStorage.setItem(keys.annotations, JSON.stringify(na))
        localStorage.setItem(keys.bookmarks,   JSON.stringify(nb))
      } catch (err) {
        console.warn('[EpubReader] Fallback ke localStorage:', err.message)
      }
    }
    loadFromServer()
  }, [slug, isAuthenticated]) // eslint-disable-line

  // ── applyTheme ─────────────────────────────────────────────────────────────
  const applyTheme = useCallback((rendition, mode, size, family) => {
    if (!rendition) return
    const cfg = COLOR_MODES[mode] || COLOR_MODES.light
    const isDarkMode  = mode === 'dark'
    const isCreamMode = mode === 'cream'

    const infoBoxBg        = isDarkMode ? '#2d2d2d' : isCreamMode ? '#ede3d6' : '#f8f8f8'
    const infoBoxBorder    = isDarkMode ? '#555'    : isCreamMode ? '#c9b89a' : '#ddd'
    const letterBg         = isDarkMode ? '#1e1e1e' : isCreamMode ? '#ede3d6' : '#fdfcf8'
    const letterBorder     = isDarkMode ? '#444'    : isCreamMode ? '#c9b89a' : '#ccc'
    const thBg             = isDarkMode ? '#222'    : isCreamMode ? '#e8dcc8' : '#f0f0f0'
    const tdBorder         = isDarkMode ? '#444'    : isCreamMode ? '#c9b89a' : '#ccc'
    const blockquoteBorder = isDarkMode ? '#666'    : isCreamMode ? '#b09070' : '#ccc'
    const separatorColor   = isDarkMode ? '#999'    : isCreamMode ? '#8c7055' : '#666'
    const codeBg           = isDarkMode ? '#1e1e1e' : isCreamMode ? '#ede3d6' : '#f6f6f6'

    const zineVars = getZineVars(mode)

    rendition.themes.register('reader-theme', {
      ':root': {
        ...zineVars,
        'color-scheme': 'light',
      },
      'html':                   { 'background': cfg.bg + ' !important' },
      'body':                   { 'background-color': cfg.bg + ' !important', 'color': cfg.color + ' !important', 'font-size': `${size}px !important`, 'font-family': family, '-webkit-font-smoothing': 'antialiased' },
      'p':                      { 'color': cfg.color },
      'h1,h2,h3,h4,h5,h6':     { 'color': cfg.color },
      'a':                      { 'color': isDarkMode ? '#93c5fd' : isCreamMode ? '#7a5c3a' : '' },
      'li':                     { 'color': cfg.color },
      'td':                     { 'color': cfg.color, 'border-color': tdBorder },
      'th':                     { 'color': cfg.color, 'background-color': thBg, 'border-color': tdBorder },
      'blockquote':             { 'border-left-color': blockquoteBorder, 'color': cfg.color },
      'code':                   { 'background-color': codeBg, 'color': cfg.color },
      'pre':                    { 'background-color': codeBg, 'color': cfg.color },
      'p.separator':            { 'color': separatorColor },
      'p.ornament':             { 'color': separatorColor },
      'p.divider':              { 'color': separatorColor },
      '.scene-break':           { 'color': separatorColor },
      '.note':                  { 'color': cfg.color },
      '.image-caption':         { 'color': separatorColor },
      '.info-box':              { 'background-color': infoBoxBg + ' !important', 'border-color': infoBoxBorder + ' !important', 'color': cfg.color + ' !important' },
      '.info-box p':            { 'color': cfg.color + ' !important' },
      '.letter':                { 'background-color': letterBg + ' !important', 'border-color': letterBorder + ' !important', 'color': cfg.color + ' !important' },
      '.letter p':              { 'color': cfg.color },
      '.letter .date':          { 'color': cfg.color },
      '.letter .salutation':    { 'color': cfg.color },
      '.letter .closing':       { 'color': cfg.color },
      '.letter .signature':     { 'color': cfg.color },
      'img':                    { 'filter': isDarkMode ? 'invert(0.85)' : 'none' },
      'img.ornament':           { 'filter': isDarkMode ? 'invert(1) opacity(0.7)' : 'none' },
      'img.icon':               { 'filter': isDarkMode ? 'invert(1) opacity(0.7)' : 'none' },
      'img.decoration':         { 'filter': isDarkMode ? 'invert(1) opacity(0.7)' : 'none' },
      'img.logo':               { 'filter': isDarkMode ? 'invert(1) opacity(0.7)' : 'none' },
      '.colophon img':          { 'filter': isDarkMode ? 'invert(1) opacity(0.7)' : 'none' },
      '.imprint img':           { 'filter': isDarkMode ? 'invert(1) opacity(0.7)' : 'none' },
      'img.no-invert':          { 'filter': 'none !important' },
      'img.photo':              { 'filter': 'none', 'opacity': isDarkMode ? '0.9' : '1' },
      'img.illustration':       { 'filter': 'none', 'opacity': isDarkMode ? '0.9' : '1' },
      'img.colored':            { 'filter': 'none', 'opacity': isDarkMode ? '0.9' : '1' },
      '.chapter img.no-invert': { 'filter': 'none', 'opacity': isDarkMode ? '0.9' : '1' },
      '.image-inline':          { 'filter': isDarkMode ? 'invert(1)' : 'none', 'opacity': isDarkMode ? '0.9' : '1' },
      '.epub-highlight':        { 'opacity': '0.4' },
    })
    rendition.themes.select('reader-theme')

    try {
      const allContents = rendition.getContents ? rendition.getContents() : []
      allContents.forEach(content => {
        try { injectZineDocStyles(content.document, mode) } catch {}
      })
    } catch {}
  }, [])

  // ── Init epub.js ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!book?.fileUrl || !viewerRef.current) return

    if (bookRef.current) { try { bookRef.current.destroy() } catch {} }
    setIsReady(false)
    setEpubError(null)

    sessionSentRef.current        = false
    startReadingCalledRef.current = false
    locationsReadyRef.current     = false
    sessionStartRef.current       = Date.now()
    sessionIdRef.current          = generateSessionId()

    const epubBook = ePub(book.fileUrl)
    bookRef.current = epubBook

    const rendition = epubBook.renderTo(viewerRef.current, {
      width: '100%', height: '100%', flow: 'paginated',
      spread: 'none', allowScriptedContent: false, manager: 'default',
    })
    renditionRef.current = rendition

    applyTheme(rendition, colorMode, fontSize, fontFamily)

    const calcProgress = (cfi) => {
      if (!cfi) return
      if (locationsReadyRef.current) {
        try {
          const pct = epubBook.locations.percentageFromCfi(cfi)
          if (typeof pct === 'number' && !isNaN(pct)) { setProgress(Math.round(pct * 100)); return }
        } catch {}
      }
      try {
        const spineItems = (epubBook.spine?.items || epubBook.spine?.spineItems || [])
          .filter(isLinearSpineItem)
        const total = spineItems.length
        if (total === 0) return
        const match = cfi.match(/^epubcfi\(\/6\/(\d+)/)
        if (match) {
          const spineIndex = (parseInt(match[1]) / 2) - 1
          setProgress(Math.round((spineIndex / Math.max(total - 1, 1)) * 100))
        }
      } catch {}
    }

    const navigationPromise = epubBook.loaded.navigation.then(nav => {
      const flattenToc = (items, depth = 0) =>
        items.flatMap(item => [
          {
            label:    item.label?.trim() || '',
            href:     item.href,
            fileHref: (item.href || '').split('#')[0],
            depth,
          },
          ...flattenToc(item.subitems || [], depth + 1),
        ])

      const flat = flattenToc(nav.toc)
      setToc(flat)
      tocRef.current = flat
      totalChaptersRef.current = flat.filter(t => t.depth === 0).length
      return flat
    }).catch(err => {
      console.error('[EpubReader] Gagal parse TOC:', err)
      setToc([])
      tocRef.current = []
      totalChaptersRef.current = 0
      return []
    })

    epubBook.ready
      .then(async () => {
        const spineItems = epubBook.spine?.items || epubBook.spine?.spineItems || []
        totalSpineItemsRef.current = spineItems.filter(isLinearSpineItem).length

        const cfiFromState = location.state?.lastCfi
        const savedCfi     = cfiFromState || localStorage.getItem(keys.progress)
        if (savedCfi) {
          await rendition.display(savedCfi).catch(() => {
            localStorage.removeItem(keys.progress)
            localStorage.removeItem(keys.progressAt)
            return rendition.display()
          })
        } else {
          await rendition.display()
        }

        setIsReady(true)
        calcProgress(currentCfiRef.current)

        if (isAuthenticated && !startReadingCalledRef.current) {
          startReadingCalledRef.current = true
          await navigationPromise.catch(() => {})
          try {
            const res = await chapterService.epubStartReading(slug, {
              sessionId:     sessionIdRef.current,
              deviceType:    getDeviceType(),
              source:        'epub',
              chapterLabel:  currentChapterLabelRef.current,
              chapterIndex:  currentChapterIndexRef.current,
              totalChapters: totalChaptersRef.current,
            }, isZineMode)

            const data = res?.data?.data ?? res?.data
            if (data && !data.firstTime && data.lastCfi) {
              const serverCfi   = data.lastCfi
              const localCfi    = localStorage.getItem(keys.progress)
              const localCfiAt  = parseInt(localStorage.getItem(keys.progressAt) || '0', 10)
              const serverCfiAt = data.lastReadAt ? new Date(data.lastReadAt).getTime() : 0
              const shouldUseServer = !localCfi || serverCfiAt > localCfiAt || cfiFromState
              if (shouldUseServer && serverCfi !== localCfi) {
                console.log('[EpubReader] Resume dari server CFI:', serverCfi)
                renditionRef.current?.display(serverCfi).catch(() => {})
              }
            }
          } catch (err) {
            console.warn('[EpubReader] epubStartReading gagal:', err.message)
          }
        }

        try {
          const linearItems = epubBook.spine?.items || epubBook.spine?.spineItems || []
          if (epubBook.locations && linearItems.length > 0) {
            return epubBook.locations.generate(2000)
          }
        } catch (locErr) {
          console.warn('[EpubReader] locations.generate() gagal:', locErr.message)
        }
        return Promise.resolve()
      })
      .then(() => {
        try {
          if (epubBook.locations?.total > 0) {
            locationsReadyRef.current = true
            calcProgress(currentCfiRef.current)
          }
        } catch {}
      })
      .catch(err => {
        console.error('EPUB init error:', err)
        setEpubError('Gagal memuat konten buku. File EPUB mungkin rusak atau tidak didukung.')
        setIsReady(true)
      })

    rendition.on('locationChanged', loc => {
      const cfi = typeof loc?.start === 'string' ? loc.start : loc?.start?.cfi || null
      if (cfi) {
        currentCfiRef.current = cfi
        localStorage.setItem(keys.progress, cfi)
        localStorage.setItem(keys.progressAt, String(Date.now()))
        const bms = JSON.parse(localStorage.getItem(keys.bookmarks) || '[]')
        setIsBookmarked(bms.some(b => b.cfi === cfi))
        spineIndexRef.current = extractSpineIndex(cfi)
      }
      calcProgress(cfi)
      const currentHref = loc?.start?.href || ''
      if (currentHref && tocRef.current.length > 0) {
        const active = findActiveChapter(tocRef.current, currentHref)
        if (active) {
          const topLevel = tocRef.current.filter(t => t.depth === 0)
          const idx      = topLevel.indexOf(active)
          const label    = active.label || ''
          setCurrentChapterLabel(label)
          currentChapterLabelRef.current = label
          if (idx >= 0) {
            currentChapterIndexRef.current = idx
          } else {
            const parentIdx = topLevel.findIndex(t => normalizeHref(t.href) === normalizeHref(active.href))
            if (parentIdx >= 0) currentChapterIndexRef.current = parentIdx
          }
        }
      }
    })

    rendition.on('selected', (cfiRange, contents) => {
      try {
        const selText = contents.window.getSelection()?.toString()?.trim()
        if (!selText || selText.length < 2) return
        const sel = contents.window.getSelection()
        if (!sel || sel.rangeCount === 0) return
        const range      = sel.getRangeAt(0)
        const rangeRect  = range.getBoundingClientRect()
        const iframe     = viewerRef.current?.querySelector('iframe')
        if (!iframe) return
        const iframeRect = iframe.getBoundingClientRect()
        setSelection({
          text: selText, cfi: cfiRange,
          position: {
            x: iframeRect.left + rangeRect.left + rangeRect.width / 2,
            y: iframeRect.top  + rangeRect.top,
          },
        })
      } catch (err) { console.warn('[Selection] Error:', err.message) }
    })

    const attachedDocs = new WeakSet()
    const attachToIframeDoc = (iframeDoc) => {
      if (!iframeDoc || attachedDocs.has(iframeDoc)) return
      attachedDocs.add(iframeDoc)
      let fbStartX = 0, fbStartY = 0
      const onStart = (e) => { if (e.touches.length !== 1) return; fbStartX = e.touches[0].clientX; fbStartY = e.touches[0].clientY }
      const onEnd   = (e) => {
        const t = e.changedTouches?.[0] ?? e.touches?.[0]
        if (!t) return
        const diffX = fbStartX - t.clientX
        const diffY = Math.abs(fbStartY - t.clientY)
        if (Math.abs(diffX) > 50 && Math.abs(diffX) > diffY * 1.5) {
          setSelection(null)
          if (diffX > 0) handleNextRef.current?.()
          else           handlePrevRef.current?.()
        }
      }
      iframeDoc.addEventListener('touchstart', onStart, { passive: true })
      iframeDoc.addEventListener('touchend',   onEnd,   { passive: true })
    }

    rendition.on('rendered', (_section, view) => {
      try {
        const doc = view?.contents?.document
        if (!doc) return
        attachToIframeDoc(doc)

        injectZineDocStyles(doc, colorModeRef.current)

        doc.addEventListener('click', async (e) => {
          const anchor = e.target.closest('a')
          if (!anchor) return
          const href = anchor.getAttribute('href')
          if (!href) return
          e.preventDefault(); e.stopPropagation()
          if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//')) {
            window.open(href, '_blank', 'noopener,noreferrer'); return
          }
          if (href.startsWith('mailto:') || href.startsWith('tel:')) { window.open(href); return }
          const rendition = renditionRef.current
          const epubBook  = bookRef.current
          if (!rendition || !epubBook) return
          try {
            const currentHref = _section?.href || ''
            const baseHref    = currentHref.includes('/') ? currentHref.substring(0, currentHref.lastIndexOf('/') + 1) : ''
            let fullHref      = href
            if (!href.startsWith('/') && !href.startsWith('#')) fullHref = baseHref + href
            const hashIndex   = fullHref.indexOf('#')
            const sectionPath = hashIndex !== -1 ? fullHref.slice(0, hashIndex) : fullHref
            const anchorId    = hashIndex !== -1 ? fullHref.slice(hashIndex + 1) : null
            if (!sectionPath && anchorId) {
              const canonical = resolveCanonicalHref(epubBook, currentHref)
              const { cfi }   = await resolveAnchorToCfi(epubBook, canonical, anchorId)
              if (cfi) await rendition.display(cfi)
              else await rendition.display(currentHref)
            } else if (sectionPath) {
              const canonical = resolveCanonicalHref(epubBook, sectionPath)
              if (anchorId) {
                const { cfi } = await resolveAnchorToCfi(epubBook, canonical, anchorId)
                if (cfi) await rendition.display(cfi)
                else {
                  try { await rendition.display(canonical + '#' + anchorId) } catch {
                    await rendition.display(canonical)
                  }
                }
              } else {
                await rendition.display(canonical)
              }
            }
          } catch (err) {
            console.warn('[LinkClick] Navigasi internal gagal:', err.message)
            try { await renditionRef.current?.display(href) } catch {}
          }
        }, true)
      } catch {}
    })

    return () => { try { epubBook.destroy() } catch {} }
  }, [book]) // eslint-disable-line

  // ── Touch handler di outer wrapper ────────────────────────────────────────
  useEffect(() => {
    const el = touchWrapperRef.current
    if (!el) return
    const onTouchStart = (e) => {
      if (e.touches.length !== 1) return
      touchStartX.current = e.touches[0].clientX
      touchStartY.current = e.touches[0].clientY
    }
    const onTouchEnd = (e) => {
      const touch = e.changedTouches?.[0] ?? e.touches?.[0]
      if (!touch) return
      const diffX = touchStartX.current - touch.clientX
      const diffY = Math.abs(touchStartY.current - touch.clientY)
      if (Math.abs(diffX) > 50 && Math.abs(diffX) > diffY * 1.5) {
        setSelection(null)
        if (diffX > 0) handleNextRef.current?.()
        else           handlePrevRef.current?.()
      }
    }
    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchend',   onTouchEnd,   { passive: true })
    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchend',   onTouchEnd)
    }
  }, [])

  useEffect(() => {
    if (!isReady || !renditionRef.current) return
    annotations.forEach(ann => {
      try { renditionRef.current.annotations.highlight(ann.cfi, {}, null, 'epub-highlight', { fill: ann.color, 'fill-opacity': '0.4' }) } catch {}
    })
  }, [isReady, annotations])

  const prevFontSizeRef = useRef(fontSize)

  useEffect(() => {
    if (!renditionRef.current) return
    const fontSizeChanged = prevFontSizeRef.current !== fontSize
    prevFontSizeRef.current = fontSize
    applyTheme(renditionRef.current, colorMode, fontSize, fontFamily)
    localStorage.setItem(keys.colorMode,  colorMode)
    localStorage.setItem(keys.fontSize,   String(fontSize))
    localStorage.setItem(keys.fontFamily, fontFamily)
    if (!fontSizeChanged) return
    const cfi = currentCfiRef.current || localStorage.getItem(keys.progress)
    if (!cfi) return
    const timer = setTimeout(() => {
      const r = renditionRef.current
      if (!r) return
      try { r.resize('100%', '100%') } catch {}
      setTimeout(() => { r.display(cfi).catch(() => {}) }, 100)
    }, 150)
    return () => clearTimeout(timer)
  }, [colorMode, fontSize, fontFamily, applyTheme]) // eslint-disable-line

  useEffect(() => { localStorage.setItem(keys.annotations, JSON.stringify(annotations)) }, [annotations]) // eslint-disable-line
  useEffect(() => { localStorage.setItem(keys.bookmarks,   JSON.stringify(bookmarks))   }, [bookmarks])   // eslint-disable-line

  useEffect(() => {
    if (!renditionRef.current || isNavigatingRef.current) return
    const cfi = currentCfiRef.current || localStorage.getItem(keys.progress)
    const timer = setTimeout(() => {
      if (isNavigatingRef.current) return
      const r = renditionRef.current
      if (!r) return
      try { r.resize('100%', '100%') } catch {}
      if (cfi) setTimeout(() => {
        if (!isNavigatingRef.current) r.display(cfi).catch(() => {})
      }, 80)
    }, 120)
    return () => clearTimeout(timer)
  }, [showSettings, showSidebar, showSearch]) // eslint-disable-line

  // ── handleNext ────────────────────────────────────────────────────────────
  const handleNext = useCallback(() => {
    setSelection(null)
    renditionRef.current?.next()
  }, [])

  // ── handlePrev ────────────────────────────────────────────────────────────
  const handlePrev = useCallback(async () => {
    if (isNavigatingRef.current) {
      console.log('[handlePrev] ⛔ diabaikan, navigasi sedang berjalan')
      return
    }

    setSelection(null)
    const rendition = renditionRef.current
    const epubBook  = bookRef.current
    if (!rendition || !epubBook) return

    const locBefore  = rendition.currentLocation()
    const hrefBefore = locBefore?.start?.href || ''
    const pageBefore = locBefore?.start?.displayed?.page || 1

    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

    if (pageBefore > 1) {
      rendition.prev()
      return
    }

    const spineItems = epubBook.spine?.items || []
    const currentIdx = spineItems.findIndex(item => {
      const h = item.href || item.url || ''
      return (
        h === hrefBefore ||
        h.endsWith('/' + hrefBefore) ||
        hrefBefore.endsWith('/' + h) ||
        h.split('/').pop() === hrefBefore.split('/').pop()
      )
    })

    if (currentIdx <= 0) {
      rendition.prev()
      return
    }

    let prevIdx = currentIdx - 1
    while (prevIdx >= 0 && !isLinearSpineItem(spineItems[prevIdx])) prevIdx--
    if (prevIdx < 0) { rendition.prev(); return }

    const prevSpineItem = spineItems[prevIdx]
    const prevHref      = prevSpineItem.href || prevSpineItem.url

    isNavigatingRef.current = true

    const waitForRender = (fallbackMs) => {
      const ms = fallbackMs ?? (isMobile ? 280 : 130)
      return new Promise(resolve => {
        let settled = false
        const finish = () => { if (!settled) { settled = true; resolve() } }
        try { rendition.once('rendered', finish) } catch {}
        setTimeout(finish, ms)
      })
    }

    try {
      if (locationsReadyRef.current && epubBook.locations?.total > 0) {
        try {
          const allCfis = JSON.parse(epubBook.locations.save())

          const prevSection = epubBook.spine.get(prevHref)
          const cfiBase     = prevSection?.cfiBase

          let prevSectionCfis = []
          if (cfiBase) {
            const prefix = `epubcfi(${cfiBase}!`
            prevSectionCfis = allCfis.filter(c => typeof c === 'string' && c.startsWith(prefix))
          }

          if (prevSectionCfis.length === 0) {
            const spineN = (prevIdx + 1) * 2
            prevSectionCfis = allCfis.filter(c =>
              typeof c === 'string' &&
              (c.startsWith(`epubcfi(/6/${spineN}[`) || c.startsWith(`epubcfi(/6/${spineN}!`))
            )
          }

          if (prevSectionCfis.length > 0) {
            const lastCfi = prevSectionCfis[prevSectionCfis.length - 1]

            await rendition.display(lastCfi)
            await waitForRender(isMobile ? 350 : 180)

            let safetyLimit = 40
            while (safetyLimit-- > 0) {
              const loc            = rendition.currentLocation()
              const page           = loc?.start?.displayed?.page  ?? 1
              const total          = loc?.start?.displayed?.total ?? 1
              const currentHrefNow = loc?.start?.href || ''

              const sameSection = normalizeHref(currentHrefNow) === normalizeHref(prevHref)

              if (!sameSection) {
                await new Promise(resolve => {
                  let settled = false
                  const finish = () => { if (!settled) { settled = true; resolve() } }
                  try { rendition.once('rendered', finish) } catch {}
                  rendition.prev()
                  setTimeout(finish, isMobile ? 350 : 180)
                })
                break
              }

              if (page >= total) break

              await new Promise(resolve => {
                let settled = false
                const finish = () => { if (!settled) { settled = true; resolve() } }
                try { rendition.once('rendered', finish) } catch {}
                rendition.next()
                setTimeout(finish, isMobile ? 280 : 130)
              })
            }

            return
          }
        } catch (locErr) {
          console.warn('[handlePrev] ❌ strategy locations gagal:', locErr.message)
        }
      }

      await rendition.display(prevIdx)

    } catch (err) {
      console.warn('[handlePrev] ❌ error, fallback prev():', err.message)
      try { rendition.prev() } catch {}
    } finally {
      const releaseDelay = isMobile ? 600 : 400
      setTimeout(() => {
        isNavigatingRef.current = false
      }, releaseDelay)
    }
  }, [fontSize])

  const handleNextRef = useRef(handleNext)
  const handlePrevRef = useRef(handlePrev)
  useEffect(() => { handleNextRef.current = handleNext }, [handleNext])
  useEffect(() => { handlePrevRef.current = handlePrev }, [handlePrev])

	const handleSearchNavigate = useCallback((cfi, searchQuery) => {
	  if (!cfi || !renditionRef.current) return

	  console.group('[SearchNavigate] 🔍 Start')
	  console.log('  CFI:', cfi, '| Query:', searchQuery)

	  const q = searchQuery?.trim() || ''

	  // ── Strip semua character offset dari CFI ──────────────────────────────
	  // IndexSizeError terjadi karena epubjs.locationOf() panggil range.setEnd
	  // dengan offset yang tidak valid di DOM iframe. Fix: hapus semua :N offset.
	  // epubcfi(/6/14!/4/2/26:6) → epubcfi(/6/14!/4/2/26)
	  // epubcfi(/6/14!/4/2/26,/1:2,/1:5) → epubcfi(/6/14!/4/2/26)
	  const sanitizeCfi = (rawCfi) => {
		if (!rawCfi) return rawCfi
		// Hapus range suffix (koma ke depan)
		let clean = rawCfi.replace(/,.*\)$/, ')')
		// Hapus character offset :N sebelum ) atau [
		clean = clean.replace(/:(\d+)(\)|\[)/g, '$2')
		// Hapus :N di ujung sebelum tutup kurung
		clean = clean.replace(/:(\d+)\)$/, ')')
		console.log('  sanitizeCfi:', rawCfi, '→', clean)
		return clean
	  }

	  const navCfi = sanitizeCfi(cfi)

	  // ── Helpers ────────────────────────────────────────────────────────────
	  const getActiveDoc = () => {
		try {
		  const contents = renditionRef.current?.getContents?.()
		  return contents?.[0]?.document
			|| viewerRef.current?.querySelector('iframe')?.contentDocument
			|| null
		} catch { return null }
	  }

	  const getCurrentSpineNum = () => {
		try {
		  const loc = renditionRef.current?.currentLocation()
		  return loc?.start?.cfi?.match(/^epubcfi\(\/6\/(\d+)/)?.[1] || null
		} catch { return null }
	  }

	  // ── Inject highlight ke DOM iframe ────────────────────────────────────
	  const injectHighlight = (doc, searchQ) => {
		if (!doc?.body || !searchQ) return 0
		// Bersihkan highlight lama
		try {
		  doc.querySelectorAll('.epub-search-highlight').forEach(el => {
			const p = el.parentNode
			if (p) { p.replaceChild(doc.createTextNode(el.textContent || ''), el); p.normalize() }
		  })
		} catch {}
		// Inject style jika belum ada
		if (!doc.getElementById('_sh_style')) {
		  const s = doc.createElement('style')
		  s.id = '_sh_style'
		  s.textContent = `.epub-search-highlight{background:#FDE68A!important;color:#92400E!important;border-radius:2px;padding:0 1px;outline:2px solid #F59E0B;}`
		  ;(doc.head || doc.documentElement).appendChild(s)
		}
		const lowerQ = searchQ.toLowerCase()
		const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, null)
		const textNodes = []
		let n = walker.nextNode()
		while (n) { if (n.nodeValue?.toLowerCase().includes(lowerQ)) textNodes.push(n); n = walker.nextNode() }

		let count = 0
		textNodes.forEach(textNode => {
		  try {
			const parent = textNode.parentNode
			if (!parent || ['SCRIPT','STYLE'].includes(parent.tagName)) return
			const text = textNode.nodeValue; const lowerText = text.toLowerCase()
			let pos = lowerText.indexOf(lowerQ); if (pos === -1) return
			const frag = doc.createDocumentFragment(); let last = 0
			while (pos !== -1) {
			  if (pos > last) frag.appendChild(doc.createTextNode(text.slice(last, pos)))
			  const mark = doc.createElement('mark')
			  mark.className = 'epub-search-highlight'
			  mark.textContent = text.slice(pos, pos + searchQ.length)
			  frag.appendChild(mark); last = pos + searchQ.length
			  pos = lowerText.indexOf(lowerQ, last); count++
			}
			if (last < text.length) frag.appendChild(doc.createTextNode(text.slice(last)))
			parent.replaceChild(frag, textNode)
		  } catch {}
		})
		console.log('  injectHighlight: injected', count, 'kata')
		return count
	  }

	  const scheduleCleanup = (doc) => {
		setTimeout(() => {
		  try {
			doc?.querySelectorAll('.epub-search-highlight').forEach(el => {
			  const p = el.parentNode
			  if (p) { p.replaceChild(doc.createTextNode(el.textContent || ''), el); p.normalize() }
			})
		  } catch {}
		}, 5000)
	  }

	  // ── Cari teks di halaman-halaman dalam section (paginated mode) ────────
	  // scrollIntoView tidak bekerja di paginated mode karena konten di-clip
	  // via CSS column. Satu-satunya cara: advance next() sampai teks terlihat
	  // di viewport iframe.
	  const findAndHighlightInSection = async (targetSpineNum) => {
		const MAX_PAGES = 60 // batas keamanan
		let page = 0

		while (page < MAX_PAGES) {
		  page++
		  // Tunggu DOM stabil
		  await new Promise(r => setTimeout(r, 80))

		  const doc = getActiveDoc()
		  if (!doc?.body) { console.warn('  [findInSection] doc null di halaman', page); break }

		  // Cek masih di section yang benar
		  const spineNow = getCurrentSpineNum()
		  if (spineNow && targetSpineNum && spineNow !== targetSpineNum) {
			console.log('  [findInSection] Melewati section di halaman', page, '— berhenti')
			// Mundur satu halaman karena sudah ke section berikutnya
			renditionRef.current?.prev()
			await new Promise(r => setTimeout(r, 150))
			break
		  }

		  const bodyText = doc.body.innerText || doc.body.textContent || ''
		  if (bodyText.toLowerCase().includes(q.toLowerCase())) {
			console.log('  [findInSection] ✅ Teks ditemukan di halaman', page)
			injectHighlight(doc, q)
			scheduleCleanup(doc)
			console.groupEnd()
			return true
		  }

		  console.log('  [findInSection] Halaman', page, '— teks tidak ada, next()')
		  // Advance ke halaman berikutnya dalam section
		  await new Promise(resolve => {
			let done = false
			const fin = () => { if (!done) { done = true; resolve() } }
			try { renditionRef.current?.once('rendered', fin) } catch {}
			renditionRef.current?.next()
			setTimeout(fin, 250)
		  })
		}

		console.warn('  [findInSection] ⚠️ Teks tidak ditemukan setelah', page, 'halaman')
		console.groupEnd()
		return false
	  }

	  // ── Deteksi target section ─────────────────────────────────────────────
	  const targetSpineNum = navCfi.match(/^epubcfi\(\/6\/(\d+)/)?.[1]
	  const currentSpineNum = getCurrentSpineNum()
	  console.log('  targetSpineNum:', targetSpineNum, '| currentSpineNum:', currentSpineNum)

	  // ── Cross-section: pindah section dulu, lalu cari halaman ─────────────
	  if (targetSpineNum && currentSpineNum && targetSpineNum !== currentSpineNum) {
		console.log('  → Cross-section navigation')

		// Hitung spine index (0-based) dari spine number (CFI pakai /6/N, N=2*(idx+1))
		const spineIndex = Math.floor(parseInt(targetSpineNum) / 2) - 1
		console.log('  spine index (0-based):', spineIndex)

		// Pasang listener rendered SEBELUM display
		let rendered = false
		const onRendered = async (_section, _view) => {
		  if (rendered) return
		  rendered = true
		  renditionRef.current?.off('rendered', onRendered)
		  clearTimeout(safety)
		  console.log('  rendered event ✅ section:', _section?.href)
		  await new Promise(r => setTimeout(r, 150))
		  await findAndHighlightInSection(targetSpineNum)
		}
		renditionRef.current.on('rendered', onRendered)

		const safety = setTimeout(async () => {
		  if (rendered) return
		  rendered = true
		  renditionRef.current?.off('rendered', onRendered)
		  console.warn('  safety timeout — rendered tidak terpanggil')
		  await findAndHighlightInSection(targetSpineNum)
		}, 3000)

		// Display pakai spine index (integer) — TIDAK pakai CFI dengan offset
		// karena itu yang menyebabkan IndexSizeError
		renditionRef.current.display(spineIndex)
		  .then(() => console.log('  display(spineIndex) resolved'))
		  .catch(err => {
			console.error('  display(spineIndex) gagal:', err.message)
			clearTimeout(safety)
			rendered = true
			renditionRef.current?.off('rendered', onRendered)
			console.groupEnd()
		  })

	  } else {
		// ── Same-section: display CFI (sanitized) lalu cari halaman ──────────
		console.log('  → Same-section navigation')

		renditionRef.current.display(navCfi)
		  .then(async () => {
			console.log('  display(navCfi) resolved')
			await new Promise(r => setTimeout(r, 120))
			const doc = getActiveDoc()
			if (!doc) { console.warn('  doc null'); console.groupEnd(); return }
			const count = injectHighlight(doc, q)
			if (count === 0) {
			  // Teks tidak di halaman ini — cari di halaman lain dalam section
			  console.log('  Teks tidak di halaman pertama, cari di halaman lain...')
			  await findAndHighlightInSection(targetSpineNum)
			} else {
			  scheduleCleanup(doc)
			  console.groupEnd()
			}
		  })
		  .catch(async (err) => {
			// IndexSizeError dari display(cfi) — tetap lanjut karena display
			// biasanya berhasil meski throw error (epubjs bug)
			console.warn('  display() error (biasanya IndexSizeError, aman diabaikan):', err.message)
			await new Promise(r => setTimeout(r, 200))
			const doc = getActiveDoc()
			const count = doc ? injectHighlight(doc, q) : 0
			if (count === 0) {
			  await findAndHighlightInSection(targetSpineNum || currentSpineNum)
			} else {
			  if (doc) scheduleCleanup(doc)
			  console.groupEnd()
			}
		  })
	  }
	}, [])

  // ── handleTocClick ────────────────────────────────────────────────────────
  const handleTocClick = useCallback(async (href) => {
    const rendition = renditionRef.current
    const epubBook  = bookRef.current
    if (!rendition || !epubBook || !href) return

    setShowSidebar(false)
    isNavigatingRef.current = true

    try {
      const hashIndex   = href.indexOf('#')
      const sectionHref = hashIndex !== -1 ? href.slice(0, hashIndex) : href
      const anchor      = hashIndex !== -1 ? href.slice(hashIndex + 1) : null
      const canonical   = resolveCanonicalHref(epubBook, sectionHref)

      if (!anchor) {
        const spineItem = resolveSpineItem(epubBook, canonical)
        if (spineItem && typeof spineItem.index === 'number') {
          await rendition.display(spineItem.index)
        } else {
          await rendition.display(canonical)
        }
        return
      }

      const { cfi } = await resolveAnchorToCfi(epubBook, canonical, anchor)

      if (cfi) {
        const currentHref      = rendition.currentLocation()?.start?.href || ''
        const alreadyOnSection = currentHref.split('/').pop() === canonical.split('/').pop()

        if (alreadyOnSection) {
          const spineItem  = resolveSpineItem(epubBook, canonical)
          const spineItems = epubBook.spine?.items || []
          const currentIdx = spineItem?.index ??
            spineItems.findIndex(i => (i.href || '').split('/').pop() === canonical.split('/').pop())

          let adjacentIdx = -1
          for (let i = currentIdx - 1; i >= 0; i--) {
            if (isLinearSpineItem(spineItems[i])) { adjacentIdx = i; break }
          }
          if (adjacentIdx < 0) {
            for (let i = currentIdx + 1; i < spineItems.length; i++) {
              if (isLinearSpineItem(spineItems[i])) { adjacentIdx = i; break }
            }
          }
          if (adjacentIdx >= 0) {
            await rendition.display(adjacentIdx)
            await new Promise(resolve => setTimeout(resolve, 300))
          }
        }

        await rendition.display(cfi)
      } else {
        const fullHref = canonical + '#' + anchor
        try {
          await rendition.display(fullHref)
        } catch {
          await rendition.display(canonical)
        }
      }

    } catch (err) {
      console.warn('[handleTocClick] navigasi gagal:', err.message)
      try {
        const hashIndex   = href.indexOf('#')
        const sectionHref = hashIndex !== -1 ? href.slice(0, hashIndex) : href
        const canonical   = resolveCanonicalHref(epubBook, sectionHref)
        await rendition.display(canonical)
      } catch {}
    } finally {
      setTimeout(() => { isNavigatingRef.current = false }, 500)
    }
  }, [])

  const handleBookmarkClick   = (cfi) => { renditionRef.current?.display(cfi); setShowSidebar(false); setSelection(null) }
  const handleAnnotationClick = (cfi) => { renditionRef.current?.display(cfi); setShowSidebar(false); setSelection(null) }

  const handleToggleBookmark = async () => {
    const rendition = renditionRef.current
    if (!rendition) return
    let cfi = currentCfiRef.current
    if (!cfi) {
      try {
        const loc = rendition.currentLocation()
        cfi = typeof loc?.start === 'string' ? loc.start : loc?.start?.cfi || null
      } catch {}
    }
    if (!cfi) return
    if (isBookmarked) {
      const bm = bookmarks.find(b => b.cfi === cfi)
      setBookmarks(prev => prev.filter(b => b.cfi !== cfi))
      setIsBookmarked(false)
      if (isAuthenticated && bm?.id) {
        try { await epubAnnotationService.deleteBookmark(slug, isZineMode, bm.id) }
        catch (err) { console.warn('[Bookmark] delete failed:', err.message); setBookmarks(prev => [...prev, bm]); setIsBookmarked(true) }
      }
    } else {
      const page = rendition.currentLocation()?.start?.displayed?.page
      const text = page ? `Halaman ${page}` : `Posisi ${Math.round(progress)}%`
      const nb   = { cfi, text, createdAt: Date.now() }
      setBookmarks(prev => [...prev, nb])
      setIsBookmarked(true)
      triggerGuestNotice()
      if (isAuthenticated) {
        setIsSyncing(true)
        try {
          const saved = await epubAnnotationService.addBookmark(slug, isZineMode, nb)
          setBookmarks(prev => prev.map(b => b.cfi === cfi && !b.id ? { ...b, id: saved?.id } : b))
        } catch (err) { console.warn('[Bookmark] add failed:', err.message) }
        finally { setIsSyncing(false) }
      }
    }
  }

  const handleDeleteBookmark = async (idx) => {
    const bm = bookmarks[idx]
    setBookmarks(prev => prev.filter((_, i) => i !== idx))
    if (isAuthenticated && bm?.id) {
      try { await epubAnnotationService.deleteBookmark(slug, isZineMode, bm.id) }
      catch (err) { console.warn('[Bookmark] delete failed:', err.message) }
    }
  }

  const handleHighlight = async (color) => {
    if (!selection) return
    try { renditionRef.current?.annotations.highlight(selection.cfi, {}, null, 'epub-highlight', { fill: color, 'fill-opacity': '0.4' }) } catch {}
    const na = { cfi: selection.cfi, text: selection.text, color, note: '', createdAt: Date.now() }
    setAnnotations(prev => [...prev, na])
    setSelection(null)
    triggerGuestNotice()
    if (isAuthenticated) {
      setIsSyncing(true)
      try {
        const saved = await epubAnnotationService.addAnnotation(slug, isZineMode, na)
        setAnnotations(prev => prev.map(a => a.cfi === na.cfi && a.createdAt === na.createdAt && !a.id ? { ...a, id: saved?.id } : a))
      } catch (err) { console.warn('[Highlight] add failed:', err.message) }
      finally { setIsSyncing(false) }
    }
  }

  const handleOpenNote = () => setShowNoteModal(true)

  const handleSaveNote = async ({ color, note }) => {
    if (!selection) return
    try { renditionRef.current?.annotations.highlight(selection.cfi, {}, null, 'epub-highlight', { fill: color, 'fill-opacity': '0.4' }) } catch {}
    const na = { cfi: selection.cfi, text: selection.text, color, note, createdAt: Date.now() }
    setAnnotations(prev => [...prev, na])
    setShowNoteModal(false)
    setSelection(null)
    triggerGuestNotice()
    if (isAuthenticated) {
      setIsSyncing(true)
      try {
        const saved = await epubAnnotationService.addAnnotation(slug, isZineMode, na)
        setAnnotations(prev => prev.map(a => a.cfi === na.cfi && a.createdAt === na.createdAt && !a.id ? { ...a, id: saved?.id } : a))
      } catch (err) { console.warn('[Note] add failed:', err.message) }
      finally { setIsSyncing(false) }
    }
  }

  const handleDeleteAnnotation = async (idx) => {
    const ann = annotations[idx]
    if (ann) { try { renditionRef.current?.annotations.remove(ann.cfi, 'highlight') } catch {} }
    setAnnotations(prev => prev.filter((_, i) => i !== idx))
    if (isAuthenticated && ann?.id) {
      try { await epubAnnotationService.deleteAnnotation(slug, isZineMode, ann.id) }
      catch (err) { console.warn('[Annotation] delete failed:', err.message) }
    }
  }

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') handleNext()
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   handlePrev()
      if (e.key === 'Escape') {
        setShowSidebar(false)
        setShowSettings(false)
        setShowSearch(false)
        setSelection(null)
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault()
        setShowSearch(s => !s)
        setShowSidebar(false)
        setShowSettings(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleNext, handlePrev])

  // ── Loading & Error states ─────────────────────────────────────────────────
  if (loading) return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>

  if (error || !book?.fileUrl) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <BookOpen size={48} className="text-gray-300" />
        <p className="text-gray-500 text-lg">{error || 'File EPUB tidak tersedia.'}</p>
        <Link to={isZineMode ? `/zine/${slug}` : `/buku/${slug}`} className="text-amber-600 hover:underline flex items-center gap-1">
          <ArrowLeft size={16} /> Kembali
        </Link>
      </div>
    )
  }

  const modeCfg = COLOR_MODES[colorMode] || COLOR_MODES.light

  const headerBg     = colorMode === 'dark' ? '#111827' : colorMode === 'cream' ? '#f0e6d3' : '#ffffff'
  const headerBorder = colorMode === 'dark' ? '#374151' : colorMode === 'cream' ? '#d6c5aa' : '#e5e7eb'
  const headerColor  = modeCfg.color

  return (
    <div className={`flex flex-col h-screen select-none ${isDark ? 'dark bg-gray-950' : 'bg-gray-100'}`}>

      {/* ── Header ── */}
      <header
        className="flex items-center justify-between px-4 py-2 z-20 flex-shrink-0"
        style={{ background: headerBg, borderBottom: `1px solid ${headerBorder}`, color: headerColor }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => navigate(isZineMode ? `/zine/${slug}` : `/buku/${slug}`)}
            className="p-1.5 rounded-lg hover:bg-black/10 transition flex-shrink-0"
            style={{ color: headerColor }}
            title="Kembali"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: headerColor }}>{book.title}</p>
            <p className="text-xs truncate" style={{ color: colorMode === 'dark' ? '#9CA3AF' : colorMode === 'cream' ? '#7a6a55' : '#9CA3AF' }}>
              {currentChapterLabel || book.authorNames}
            </p>
          </div>
        </div>

        <div className="hidden md:flex flex-1 items-center px-8 gap-3">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: colorMode === 'dark' ? '#374151' : colorMode === 'cream' ? '#d6c5aa' : '#e5e7eb' }}>
            <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs flex-shrink-0" style={{ color: '#9CA3AF' }}>{progress}%</span>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {isSyncing && (
            <span className="text-xs text-amber-500 animate-pulse mr-1 hidden sm:inline">Menyimpan...</span>
          )}
          {!isAuthenticated && (
            <span
              className="text-xs px-2 py-0.5 rounded-full mr-1 hidden sm:inline cursor-pointer transition"
              style={{ color: '#9CA3AF', border: `1px solid ${headerBorder}` }}
              onClick={() => navigate('/masuk')}
              title="Login untuk sync"
            >
              Masuk untuk sync
            </span>
          )}

          <button
            onClick={handleToggleBookmark}
            className="p-1.5 rounded-lg transition hover:bg-black/10"
            style={{ color: isBookmarked ? '#F59E0B' : headerColor }}
            title={isBookmarked ? 'Hapus penanda' : 'Tambah penanda'}
          >
            {isBookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
          </button>

          <button
            onClick={() => { setShowSearch(s => !s); setShowSidebar(false); setShowSettings(false) }}
            className="p-1.5 rounded-lg hover:bg-black/10 transition"
            style={{ color: showSearch ? '#F59E0B' : headerColor }}
            title="Cari dalam buku (Ctrl+F)"
          >
            <Search size={18} />
          </button>

          <button
            onClick={() => { setShowSidebar(s => !s); setShowSettings(false); setShowSearch(false) }}
            className="p-1.5 rounded-lg hover:bg-black/10 transition"
            style={{ color: showSidebar ? '#F59E0B' : headerColor }}
            title="Panel"
          >
            <List size={18} />
          </button>

          <button
            onClick={() => { setShowSettings(s => !s); setShowSidebar(false); setShowSearch(false) }}
            className="p-1.5 rounded-lg hover:bg-black/10 transition"
            style={{ color: showSettings ? '#F59E0B' : headerColor }}
            title="Pengaturan"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 overflow-hidden relative">

          <button onClick={handlePrev}
            className="hidden md:flex items-center justify-center w-12 flex-shrink-0 hover:bg-black/5 dark:hover:bg-white/5 transition group"
            title="Sebelumnya (←)">
            <ChevronLeft size={20} className="text-gray-300 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition" />
          </button>

          <div
            ref={touchWrapperRef}
            className="flex-1 overflow-hidden relative"
            style={{ background: modeCfg.bg, touchAction: 'pan-y' }}
          >
            <div ref={viewerRef} className="w-full h-full" style={{ userSelect: 'text' }} />

            <button
              onClick={handlePrev}
              className="md:hidden absolute left-0 top-0 bottom-0 w-16 z-10"
              aria-label="Halaman sebelumnya"
            />

            <button
              onClick={handleNext}
              className="md:hidden absolute right-0 top-0 bottom-0 w-16 z-10"
              aria-label="Halaman berikutnya"
            />

            {!isReady && (
              <div
                className="absolute inset-0 flex items-center justify-center z-10"
                style={{ backgroundColor: modeCfg.bg }}
              >
                <div className="flex flex-col items-center gap-3">
                  <img
                    src={isDark ? '/masasilam-logo-inverted.svg' : '/masasilam-logo.svg'}
                    alt="Masasilam"
                    className="w-36 h-36 animate-pulse"
                  />
                  <p className="text-sm opacity-60" style={{ color: modeCfg.color }}>Memuat buku...</p>
                </div>
              </div>
            )}

            {isReady && epubError && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10"
                style={{ backgroundColor: modeCfg.bg }}
              >
                <BookOpen size={48} className="text-gray-300" />
                <p className="text-center max-w-sm px-4" style={{ color: modeCfg.color }}>{epubError}</p>
                <button
                  onClick={() => navigate(isZineMode ? `/zine/${slug}` : `/buku/${slug}`)}
                  className="text-amber-600 hover:underline flex items-center gap-1 text-sm"
                >
                  <ArrowLeft size={16} /> Kembali
                </button>
              </div>
            )}
          </div>

          <button onClick={handleNext}
            className="hidden md:flex items-center justify-center w-12 flex-shrink-0 hover:bg-black/5 dark:hover:bg-white/5 transition group"
            title="Berikutnya (→)">
            <ChevronRight size={20} className="text-gray-300 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition" />
          </button>
        </div>

        {/* ── Search Panel ── */}
        {showSearch && (
          <aside
            className="w-72 flex-shrink-0 overflow-hidden"
            style={{ borderLeft: `1px solid ${headerBorder}` }}
          >
            <SearchPanel
              onClose={() => setShowSearch(false)}
              onNavigate={handleSearchNavigate}
              colorMode={colorMode}
              bookRef={bookRef}
              tocRef={tocRef}
            />
          </aside>
        )}

        {/* ── Sidebar Panel (TOC, Bookmark, Anotasi) ── */}
        {showSidebar && (
          <aside
            className="w-72 flex-shrink-0 overflow-hidden"
            style={{ borderLeft: `1px solid ${headerBorder}` }}
          >
            <SidebarPanel
              activeTab="toc"
              toc={toc}
              bookmarks={bookmarks}
              annotations={annotations}
              onTocClick={handleTocClick}
              onBookmarkClick={handleBookmarkClick}
              onAnnotationClick={handleAnnotationClick}
              onDeleteBookmark={handleDeleteBookmark}
              onDeleteAnnotation={handleDeleteAnnotation}
              onClose={() => setShowSidebar(false)}
              colorMode={colorMode}
            />
          </aside>
        )}

        {/* ── Settings Panel ── */}
        {showSettings && (
          <aside
            className="w-72 flex-shrink-0 overflow-hidden"
            style={{ borderLeft: `1px solid ${headerBorder}` }}
          >
            <SettingsPanel
              fontSize={fontSize}
              onFontSizeChange={setFontSize}
              colorMode={colorMode}
              onColorModeChange={setColorMode}
              fontFamily={fontFamily}
              onFontChange={setFontFamily}
              onClose={() => setShowSettings(false)}
            />
          </aside>
        )}
      </div>

      {/* ── Footer (mobile) ── */}
      <footer
        className="md:hidden flex items-center gap-3 px-5 py-2.5 flex-shrink-0"
        style={{ background: headerBg, borderTop: `1px solid ${headerBorder}` }}
      >
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: colorMode === 'dark' ? '#374151' : colorMode === 'cream' ? '#d6c5aa' : '#e5e7eb' }}>
          <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-xs flex-shrink-0 tabular-nums" style={{ color: '#9CA3AF' }}>{progress}%</span>
      </footer>

      {/* ── Selection Popup ── */}
      {selection && !showNoteModal && (
        <SelectionPopup
          position={selection.position}
          onHighlight={handleHighlight}
          onNote={handleOpenNote}
          onClose={() => setSelection(null)}
        />
      )}

      {/* ── Note Modal ── */}
      {showNoteModal && selection && (
        <NoteModal
          selectedText={selection.text}
          onSave={handleSaveNote}
          onClose={() => { setShowNoteModal(false); setSelection(null) }}
        />
      )}

      {/* ── Guest Notice Banner ── */}
      {showGuestNotice && !isAuthenticated && (
        <GuestNoticeBanner
          onDismiss={dismissGuestNotice}
          onRegister={() => { dismissGuestNotice(); navigate('/daftar') }}
          onLogin={() => { dismissGuestNotice(); navigate('/masuk') }}
        />
      )}

      {/* ── Reading Activity Banner ── */}
      {!isAuthenticated && isReady && (
        <ReadingActivityBanner
          bookTitle={book?.title}
          delayMs={3 * 60 * 1000}
          onLogin={() => navigate('/masuk', { state: { from: location.pathname } })}
          onRegister={() => navigate('/daftar')}
        />
      )}
    </div>
  )
}

export default EpubReaderPage
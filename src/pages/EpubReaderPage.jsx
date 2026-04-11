// ============================================
// FILE: src/pages/EpubReaderPage.jsx
// Route: /buku/:bookSlug/baca
//
// FIXES APPLIED (ditandai // ← FIX):
//   - Import chapterService untuk recordEpubSession
//   - sessionIdRef: ID unik per sesi baca EPUB
//   - sessionStartRef: waktu mulai baca
//   - latestProgressRef: progress terkini (selalu sync, tidak stale di closure)
//   - useEffect sync latestProgressRef setiap progress berubah
//   - useEffect tracking sesi: kirim recordEpubSession saat unmount (navigasi
//     internal React) DAN saat beforeunload (tab ditutup / refresh)
//   - generateSessionId: helper tanpa dependensi eksternal
//
// FIX TAMBAHAN:
//   - Panggil chapterService.startReading saat EPUB ready agar readCount
//     terupdate di backend (BookDetailPage tidak lagi bertanggung jawab ini)
// ============================================
import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import ePub from 'epubjs'
import bookService from '../services/bookService'
import { chapterService } from '../services/chapterService' // ← FIX: import untuk recordEpubSession & startReading
import LoadingSpinner from '../components/Common/LoadingSpinner'
import {
  ArrowLeft,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  Highlighter,
  Minus,
  Moon,
  Plus,
  Settings,
  Sun,
  X,
  List,
  StickyNote,
  Trash2,
  Coffee,
  Type,
} from 'lucide-react'
import api from '../services/api'

// ─── Highlight Colors ─────────────────────────────────────────────────────────
const HIGHLIGHT_COLORS = [
  { name: 'Kuning', value: '#FDE68A', text: '#92400E' },
  { name: 'Hijau',  value: '#A7F3D0', text: '#065F46' },
  { name: 'Biru',   value: '#BFDBFE', text: '#1E40AF' },
  { name: 'Pink',   value: '#FBCFE8', text: '#9D174D' },
  { name: 'Ungu',   value: '#DDD6FE', text: '#5B21B6' },
]

// ─── Font Options ──────────────────────────────────────────────────────────────
const FONT_OPTIONS = [
  { label: 'Serif (Default)', value: "'Georgia', 'Times New Roman', serif" },
  { label: 'Garamond',        value: "'Garamond', 'Adobe Garamond Pro', 'Times New Roman', serif" },
  { label: 'Sans-Serif',      value: "'Inter', 'Segoe UI', 'Arial', sans-serif" },
  { label: 'Dyslexic',        value: "'OpenDyslexic', 'Comic Sans MS', sans-serif" },
  { label: 'Monospace',       value: "'Courier New', 'Courier', monospace" },
]

// ─── Color Modes ──────────────────────────────────────────────────────────────
const COLOR_MODES = {
  light: { bg: '#FFFFFF', color: '#1F2937', label: 'Terang',  icon: Sun    },
  cream: { bg: '#f6eee3', color: '#2d1f0e', label: 'Krem',    icon: Coffee },
  dark:  { bg: '#111827', color: '#E5E7EB', label: 'Gelap',   icon: Moon   },
}

// ─── API Service ──────────────────────────────────────────────────────────────
const epubAnnotationService = {
  getAll: async (slug) => {
    const res = await api.get(`/books/${slug}/epub-annotations`)
    const bundle = res.data?.data || res.data
    return {
      annotations: bundle?.annotations || [],
      bookmarks:   bundle?.bookmarks   || [],
    }
  },
  addAnnotation: async (slug, annotationData) => {
    const res = await api.post(`/books/${slug}/epub-annotations`, {
      cfi:          annotationData.cfi,
      selectedText: annotationData.text,
      color:        annotationData.color,
      note:         annotationData.note,
    })
    return res.data?.data || res.data
  },
  deleteAnnotation: async (slug, annotationId) => {
    await api.delete(`/books/${slug}/epub-annotations/${annotationId}`)
  },
  addBookmark: async (slug, bookmarkData) => {
    const res = await api.post(`/books/${slug}/epub-bookmarks`, {
      cfi:   bookmarkData.cfi,
      label: bookmarkData.text,
    })
    return res.data?.data || res.data
  },
  deleteBookmark: async (slug, bookmarkId) => {
    await api.delete(`/books/${slug}/epub-bookmarks/${bookmarkId}`)
  },
}

// ─── FIX: Helper generate session ID tanpa dependensi eksternal ──────────────
const generateSessionId = () =>
  `epub_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`

// ─── Note Modal ───────────────────────────────────────────────────────────────
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

// ─── Selection Popup ──────────────────────────────────────────────────────────
const SelectionPopup = ({ position, onHighlight, onNote, onClose }) => {
  if (!position) return null
  const popupWidth = 220
  const popupHeight = 44
  const margin = 8
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
      <button onClick={onNote} className="flex items-center gap-1 px-2 py-1 rounded-lg text-white text-xs hover:bg-white/10 transition" title="Tambah Catatan">
        <StickyNote size={14} />
        <span>Catatan</span>
      </button>
      <button onClick={onClose} className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition">
        <X size={14} />
      </button>
    </div>
  )
}

// ─── Sidebar Panel ────────────────────────────────────────────────────────────
const SidebarPanel = ({ activeTab, toc, bookmarks, annotations, onTocClick, onBookmarkClick, onAnnotationClick, onDeleteBookmark, onDeleteAnnotation, onClose }) => {
  const tabs = [
    { id: 'toc',         label: 'Daftar Isi', icon: List        },
    { id: 'bookmarks',   label: 'Penanda',    icon: Bookmark    },
    { id: 'annotations', label: 'Anotasi',    icon: Highlighter },
  ]
  const [tab, setTab] = useState(activeTab || 'toc')
  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <span className="font-semibold text-sm text-gray-700 dark:text-gray-300">Panel</span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"><X size={18} /></button>
      </div>
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors ${tab === t.id ? 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
            <t.icon size={15} />{t.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        {tab === 'toc' && (
          <div className="py-2">
            {toc.length === 0
              ? <p className="text-center text-gray-400 text-sm py-8">Tidak ada daftar isi</p>
              : toc.map((item, idx) => (
                <button key={idx} onClick={() => onTocClick(item.href)}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
                  style={{ paddingLeft: `${(item.depth || 0) * 12 + 16}px` }}>
                  <span className={item.depth === 0 ? 'font-medium' : 'text-gray-500 dark:text-gray-400 text-xs'}>{item.label}</span>
                </button>
              ))}
          </div>
        )}
        {tab === 'bookmarks' && (
          <div className="py-2">
            {bookmarks.length === 0
              ? <div className="flex flex-col items-center py-10 text-gray-400"><Bookmark size={32} className="mb-2 opacity-40" /><p className="text-sm">Belum ada penanda</p></div>
              : bookmarks.map((bm, idx) => (
                <div key={bm.id || idx} className="flex items-start gap-2 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 group">
                  <button onClick={() => onBookmarkClick(bm.cfi)} className="flex-1 text-left">
                    <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-0.5">Penanda {idx + 1}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{bm.text || bm.label}</p>
                  </button>
                  <button onClick={() => onDeleteBookmark(idx)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition"><Trash2 size={13} /></button>
                </div>
              ))}
          </div>
        )}
        {tab === 'annotations' && (
          <div className="py-2">
            {annotations.length === 0
              ? <div className="flex flex-col items-center py-10 text-gray-400"><Highlighter size={32} className="mb-2 opacity-40" /><p className="text-sm">Belum ada anotasi</p></div>
              : annotations.map((ann, idx) => (
                <div key={ann.id || idx} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 group border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <div className="flex items-start gap-2">
                    <div className="w-3 h-3 rounded-full mt-0.5 flex-shrink-0" style={{ backgroundColor: ann.color }} />
                    <div className="flex-1 min-w-0">
                      <button onClick={() => onAnnotationClick(ann.cfi)} className="text-left w-full">
                        <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2 italic">"{ann.text || ann.selectedText}"</p>
                        {ann.note && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{ann.note}</p>}
                      </button>
                    </div>
                    <button onClick={() => onDeleteAnnotation(idx)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition flex-shrink-0"><Trash2 size={13} /></button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Settings Panel ───────────────────────────────────────────────────────────
const SettingsPanel = ({ fontSize, onFontSizeChange, colorMode, onColorModeChange, fontFamily, onFontChange, onClose }) => (
  <div className="flex flex-col h-full bg-white dark:bg-gray-900">
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
      <span className="font-semibold text-sm text-gray-700 dark:text-gray-300">Pengaturan Tampilan</span>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"><X size={18} /></button>
    </div>
    <div className="flex-1 overflow-y-auto p-4 space-y-5">
      <div>
        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Ukuran Font</label>
        <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          <button onClick={() => onFontSizeChange(Math.max(12, fontSize - 2))} className="flex-1 flex items-center justify-center h-8 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition text-gray-700 dark:text-gray-300"><Minus size={14} /></button>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[3ch] text-center">{fontSize}</span>
          <button onClick={() => onFontSizeChange(Math.min(28, fontSize + 2))} className="flex-1 flex items-center justify-center h-8 rounded-lg hover:bg-white dark:hover:bg-gray-700 transition text-gray-700 dark:text-gray-300"><Plus size={14} /></button>
        </div>
      </div>
      <div>
        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide flex items-center gap-1"><Type size={11} /> Font</label>
        <div className="space-y-1">
          {FONT_OPTIONS.map(f => (
            <button key={f.value} onClick={() => onFontChange(f.value)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${fontFamily === f.value ? 'bg-amber-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              style={{ fontFamily: f.value }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Tema</label>
        <div className="flex gap-2">
          {Object.entries(COLOR_MODES).map(([key, cfg]) => {
            const Icon = cfg.icon
            return (
              <button key={key} onClick={() => onColorModeChange(key)}
                className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl text-xs font-medium transition border-2 ${colorMode === key ? 'border-amber-500 shadow' : 'border-transparent'}`}
                style={{ background: cfg.bg, color: cfg.color }}>
                <Icon size={14} />
                {cfg.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  </div>
)

// ─── Guest Notice Banner ──────────────────────────────────────────────────────
const GuestNoticeBanner = ({ onDismiss, onRegister, onLogin }) => (
  <div className="fixed bottom-12 left-3 right-3 z-50 md:left-auto md:right-4 md:bottom-6 md:w-80
    bg-white dark:bg-gray-800
    border border-amber-200 dark:border-amber-700
    rounded-xl shadow-lg
    p-3 flex items-start gap-3
    animate-in slide-in-from-bottom-2 duration-200">
    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40
      flex items-center justify-center mt-0.5">
      <Highlighter size={15} className="text-amber-600 dark:text-amber-400" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-gray-800 dark:text-gray-200 mb-0.5">
        Highlight tersimpan di browser ini saja
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 leading-relaxed">
        Daftar gratis untuk menyimpan permanen dan sync di semua perangkat.
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={onRegister}
          className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white
            text-xs font-medium rounded-lg transition">
          Daftar gratis
        </button>
        <button
          onClick={onLogin}
          className="px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-300
            hover:text-gray-800 dark:hover:text-white transition">
          Masuk
        </button>
      </div>
    </div>
    <button
      onClick={onDismiss}
      className="flex-shrink-0 text-gray-300 hover:text-gray-500
        dark:text-gray-600 dark:hover:text-gray-400 transition mt-0.5">
      <X size={14} />
    </button>
  </div>
)

// ═══════════════════════════════════════════════════════════════════════════════
// CFI helpers
// ═══════════════════════════════════════════════════════════════════════════════
const resolveCanonicalHref = (epubBook, sectionHref) => {
  const filename = sectionHref.split('/').pop()
  const items = epubBook.spine?.items || []
  const exact = items.find(item => { const h = item.href || item.url || ''; return h === sectionHref || h.endsWith('/' + sectionHref) })
  if (exact) return exact.href || exact.url || sectionHref
  const byFilename = items.find(item => { const h = item.href || item.url || ''; return h.split('/').pop() === filename })
  if (byFilename) return byFilename.href || byFilename.url || sectionHref
  return sectionHref
}

const findAnchorInDoc = (doc, anchor) => {
  if (!doc || !anchor) return null
  try { const el = doc.getElementById(anchor); if (el) return el } catch {}
  try { const el = doc.querySelector(`#${CSS.escape(anchor)}`); if (el) return el } catch {}
  try { for (const el of doc.querySelectorAll('[id]')) { if (el.getAttribute('id') === anchor) return el } } catch {}
  try { const el = doc.querySelector(`[name="${CSS.escape(anchor)}"]`); if (el) return el } catch {}
  try {
    const walker = doc.createTreeWalker(doc.body || doc.documentElement, NodeFilter.SHOW_ELEMENT, null, false)
    let node = walker.nextNode()
    while (node) { if (node.getAttribute?.('id')?.trim() === anchor) return node; if (node.getAttribute?.('name')?.trim() === anchor) return node; node = walker.nextNode() }
  } catch {}
  return null
}

const resolveAnchorToCfi = async (epubBook, canonicalHref, anchor) => {
  try {
    const section = epubBook.spine.get(canonicalHref)
    if (!section) throw new Error('Section tidak ditemukan di spine')
    const sectionDoc = await section.load(epubBook.load.bind(epubBook))
    if (!sectionDoc) throw new Error('sectionDoc null')
    const el = findAnchorInDoc(sectionDoc, anchor)
    if (!el) throw new Error(`Anchor "${anchor}" tidak ditemukan`)
    const cfi = section.cfiFromElement(el)
    if (!cfi) throw new Error('cfiFromElement null')
    section.unload()
    return { cfi, method: 'section-api' }
  } catch (err) {
    console.warn('[resolveAnchorToCfi] gagal:', err.message)
  }
  return { cfi: `${canonicalHref}#${anchor}`, method: 'direct-href' }
}

// ─── localStorage keys ────────────────────────────────────────────────────────
const localKeys = (bookSlug) => ({
  annotations:     `epub_annotations_${bookSlug}`,
  bookmarks:       `epub_bookmarks_${bookSlug}`,
  progress:        `epub_progress_${bookSlug}`,
  colorMode:       'epubColorMode',
  fontSize:        'epubFontSize',
  fontFamily:      'epubFontFamily',
  guestNoticeSeen: 'epub_guest_notice_seen',
})

// ─── Helper: ambil CFI last element dari sebuah section ───────────────────────
const getLastElementCfi = async (epubBook, href) => {
  try {
    const section    = epubBook.spine.get(href)
    if (!section) return null
    const sectionDoc = await section.load(epubBook.load.bind(epubBook))
    if (!sectionDoc) return null
    const candidates = sectionDoc.querySelectorAll(
      'p, h1, h2, h3, h4, h5, h6, li, td, blockquote'
    )
    const lastElem = candidates[candidates.length - 1]
    if (!lastElem) { section.unload(); return null }
    const cfi = section.cfiFromElement(lastElem)
    section.unload()
    return cfi || null
  } catch {
    return null
  }
}

// ─── FIX: Helper deteksi device type ─────────────────────────────────────────
const getDeviceType = () =>
  /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ? 'mobile' : 'desktop'

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
const EpubReaderPage = () => {
  const { bookSlug } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const isAuthenticated = !!localStorage.getItem('token')

  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const viewerRef    = useRef(null)
  const bookRef      = useRef(null)
  const renditionRef = useRef(null)
  const currentCfiRef = useRef(null)

  const [toc, setToc] = useState([])
  const [currentLocation, setCurrentLocation] = useState(null)

  const keys = localKeys(bookSlug)

  // ── FIX: Refs untuk session tracking ───────────────────────────
  // sessionIdRef   : ID unik per kunjungan halaman ini
  // sessionStartRef: timestamp saat komponen mount
  // latestProgressRef: selalu berisi progress terkini (tidak stale di closure)
  const sessionIdRef      = useRef(generateSessionId())   // ← FIX
  const sessionStartRef   = useRef(Date.now())            // ← FIX
  const latestProgressRef = useRef(0)                     // ← FIX

  // ── Persisted preferences ──────────────────────────────────────
  const [colorMode,  setColorMode]  = useState(() => localStorage.getItem(keys.colorMode)  || 'light')
  const [fontSize,   setFontSize]   = useState(() => parseInt(localStorage.getItem(keys.fontSize) || '16'))
  const [fontFamily, setFontFamily] = useState(() => localStorage.getItem(keys.fontFamily) || FONT_OPTIONS[0].value)

  const isDark = colorMode === 'dark'

  const [showSidebar,  setShowSidebar]  = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [progress,  setProgress]  = useState(0)
  const [isReady,   setIsReady]   = useState(false)
  const [epubError, setEpubError] = useState(null)
  const [isSyncing, setIsSyncing] = useState(false)

  const [annotations, setAnnotations] = useState(() => {
    try { return JSON.parse(localStorage.getItem(keys.annotations) || '[]') } catch { return [] }
  })
  const [bookmarks, setBookmarks] = useState(() => {
    try { return JSON.parse(localStorage.getItem(keys.bookmarks) || '[]') } catch { return [] }
  })

  const [selection,     setSelection]     = useState(null)
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [isBookmarked,  setIsBookmarked]  = useState(false)
  const [showGuestNotice, setShowGuestNotice] = useState(false)

  const triggerGuestNotice = useCallback(() => {
    if (isAuthenticated) return
    const alreadySeen = localStorage.getItem(keys.guestNoticeSeen)
    if (!alreadySeen) setShowGuestNotice(true)
  }, [isAuthenticated, keys.guestNoticeSeen])

  const dismissGuestNotice = useCallback(() => {
    setShowGuestNotice(false)
    localStorage.setItem(keys.guestNoticeSeen, '1')
  }, [keys.guestNoticeSeen])

  // ── FIX: Sync latestProgressRef setiap progress berubah ────────
  // Ini penting agar closure di beforeunload / cleanup tidak stale.
  useEffect(() => {
    latestProgressRef.current = progress
  }, [progress]) // ← FIX

  // ── FIX: Session tracking — kirim ke backend saat unmount / tab ditutup ──
  // Dipanggil HANYA jika user sudah login (isAuthenticated).
  // Untuk guest, data tidak dikirim ke server (tidak ada akun untuk disimpan).
  useEffect(() => {
    if (!isAuthenticated) return // ← FIX: skip untuk guest

    const sessionId    = sessionIdRef.current
    const startTime    = sessionStartRef.current
    const deviceType   = getDeviceType()

    const handleBeforeUnload = () => {
      const durationSeconds = Math.round((Date.now() - startTime) / 1000)
      if (durationSeconds < 5) return

      const payload = JSON.stringify({
        sessionId,
        durationSeconds,
        progressPercent: latestProgressRef.current,
        deviceType,
      })

      const apiBase = import.meta.env.VITE_API_BASE_URL || '/api'
      const token   = localStorage.getItem('token')

      // sendBeacon tidak support Authorization header → diganti fetch+keepalive
      fetch(`${apiBase}/books/${bookSlug}/chapters/reading/epub-session`, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body:      payload,
        keepalive: true,
      }).catch(() => {})
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    // Cleanup: dipanggil saat React unmount (navigasi internal / back button)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)

      const durationSeconds = Math.round((Date.now() - startTime) / 1000)
      if (durationSeconds < 5) return // abaikan sesi terlalu singkat

      // Untuk navigasi internal, masih bisa pakai fetch biasa dengan token
      chapterService.recordEpubSession(bookSlug, {
        sessionId,
        durationSeconds,
        progressPercent: latestProgressRef.current, // ← FIX: selalu terkini
        deviceType,
      }).catch(err =>
        console.warn('[EpubReader] Gagal merekam sesi:', err.message)
      )
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookSlug, isAuthenticated]) // ← FIX: sengaja tidak memasukkan progress agar
                                  // tidak re-run setiap progress berubah.
                                  // Nilai terkini diambil dari latestProgressRef.

  // ── Fetch book ──────────────────────────────────────────────────
  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true)
        const data = await bookService.getBookBySlug(bookSlug)
        setBook(data)
      } catch {
        setError('Buku tidak ditemukan atau tidak memiliki file EPUB.')
      } finally {
        setLoading(false)
      }
    }
    fetchBook()
  }, [bookSlug])

  // ── Load anotasi dari server ────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !bookSlug) return
    const loadFromServer = async () => {
      try {
        const { annotations: sa, bookmarks: sb } = await epubAnnotationService.getAll(bookSlug)
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
  }, [bookSlug, isAuthenticated]) // eslint-disable-line

  // ── Apply theme helper ──────────────────────────────────────────
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
    const imgFilter        = isDarkMode ? 'invert(1)' : 'none'
    const imgNoInvertFilter = 'none'

    rendition.themes.register('reader-theme', {
      'html': { 'background': cfg.bg + ' !important' },
      'body': {
        'background-color':       cfg.bg + ' !important',
        'color':                  cfg.color + ' !important',
        'font-size':              `${size}px !important`,
        'font-family':            family,
        '-webkit-font-smoothing': 'antialiased',
      },
      'p':                    { 'color': cfg.color },
      'h1,h2,h3,h4,h5,h6':   { 'color': cfg.color },
      'a':                    { 'color': isDarkMode ? '#93c5fd' : isCreamMode ? '#7a5c3a' : '' },
      'li':                   { 'color': cfg.color },
      'td':                   { 'color': cfg.color, 'border-color': tdBorder },
      'th':                   { 'color': cfg.color, 'background-color': thBg, 'border-color': tdBorder },
      'blockquote':           { 'border-left-color': blockquoteBorder, 'color': cfg.color },
      'code':                 { 'background-color': codeBg, 'color': cfg.color },
      'pre':                  { 'background-color': codeBg, 'color': cfg.color },
      'p.separator':          { 'color': separatorColor },
      'p.ornament':           { 'color': separatorColor },
      'p.divider':            { 'color': separatorColor },
      '.scene-break':         { 'color': separatorColor },
      '.note':                { 'color': cfg.color },
      '.image-caption':       { 'color': separatorColor },
      '.info-box': {
        'background-color': infoBoxBg + ' !important',
        'border-color':     infoBoxBorder + ' !important',
        'color':            cfg.color + ' !important',
      },
      '.info-box p': { 'color': cfg.color + ' !important' },
      '.letter': {
        'background-color': letterBg + ' !important',
        'border-color':     letterBorder + ' !important',
        'color':            cfg.color + ' !important',
      },
      '.letter p':            { 'color': cfg.color },
      '.letter .date':        { 'color': cfg.color },
      '.letter .salutation':  { 'color': cfg.color },
      '.letter .closing':     { 'color': cfg.color },
      '.letter .signature':   { 'color': cfg.color },
      'img':                            { 'filter': imgFilter },
      'img.photo':                      { 'filter': imgNoInvertFilter, 'opacity': isDarkMode ? '0.9' : '1' },
      'img.illustration':               { 'filter': imgNoInvertFilter, 'opacity': isDarkMode ? '0.9' : '1' },
      'img.colored':                    { 'filter': imgNoInvertFilter, 'opacity': isDarkMode ? '0.9' : '1' },
      '.chapter img.no-invert':         { 'filter': imgNoInvertFilter, 'opacity': isDarkMode ? '0.9' : '1' },
      '.image-inline':                  { 'filter': imgFilter, 'opacity': isDarkMode ? '0.9' : '1' },
      '.epub-highlight':                { 'opacity': '0.4' },
    })
    rendition.themes.select('reader-theme')
  }, [])

  // ── Init epub.js ─────────────────────────────────────────────────
  useEffect(() => {
    if (!book?.fileUrl || !viewerRef.current) return

    if (bookRef.current) { try { bookRef.current.destroy() } catch {} }
    setIsReady(false)
    setEpubError(null)

    const epubBook = ePub(book.fileUrl)
    bookRef.current = epubBook

    const rendition = epubBook.renderTo(viewerRef.current, {
      width:                '100%',
      height:               '100%',
      flow:                 'paginated',
      spread:               'none',
      allowScriptedContent: false,
      manager:              'default',
    })
    renditionRef.current = rendition

    applyTheme(rendition, colorMode, fontSize, fontFamily)

    let locationsReady = false

    const calcProgress = (cfi) => {
      if (!cfi) return
      if (locationsReady) {
        try {
          const pct = epubBook.locations.percentageFromCfi(cfi)
          if (typeof pct === 'number' && !isNaN(pct)) {
            setProgress(Math.round(pct * 100))
            return
          }
        } catch {}
      }
      try {
        const spineItems = epubBook.spine?.items || epubBook.spine?.spineItems || []
        const total = spineItems.length
        if (total === 0) return
        const match = cfi.match(/^epubcfi\(\/6\/(\d+)/)
        if (match) {
          const spineIndex = (parseInt(match[1]) / 2) - 1
          setProgress(Math.round((spineIndex / Math.max(total - 1, 1)) * 100))
        }
      } catch {}
    }

    epubBook.ready
      .then(() => {
        const cfiFromState = location.state?.cfi
        const savedCfi = cfiFromState || localStorage.getItem(keys.progress)
        if (savedCfi) {
          return rendition.display(savedCfi).catch(() => {
            localStorage.removeItem(keys.progress)
            return rendition.display()
          })
        }
        return rendition.display()
      })
      .then(() => {
        setIsReady(true)
        calcProgress(currentCfiRef.current)

        // ── FIX: Kirim startReading ke backend saat EPUB siap ──────────────
        // Ini yang menyebabkan readCount bertambah di backend (via
        // bookMapper.incrementReadCount) hanya pada sesi pertama user.
        // BookDetailPage tidak lagi bertanggung jawab untuk ini.
        // Hanya dilakukan untuk user yang sudah login — guest tidak memiliki
        // akun sehingga tidak ada yang perlu direkam.
        if (isAuthenticated) {
          chapterService.startReading(bookSlug, {
            sessionId:     sessionIdRef.current,
            chapterNumber: 1,          // chapter pertama sebagai proxy untuk EPUB
            deviceType:    getDeviceType(),
            source:        'epub',
            startPosition: 0,
          }).catch(err =>
            console.warn('[EpubReader] startReading gagal (non-fatal):', err.message)
          )
        }
        // ── END FIX ────────────────────────────────────────────────────────

        return epubBook.locations.generate(2000)
      })
      .then(() => {
        locationsReady = true
        calcProgress(currentCfiRef.current)
      })
      .catch(err => {
        console.error('EPUB init error:', err)
        setEpubError('Gagal memuat konten buku. File EPUB mungkin rusak atau tidak didukung.')
        setIsReady(true)
      })

    epubBook.loaded.navigation.then(nav => {
      const flattenToc = (items, depth = 0) =>
        items.flatMap(item => [
          { label: item.label?.trim() || '', href: item.href, depth },
          ...flattenToc(item.subitems || [], depth + 1),
        ])
      setToc(flattenToc(nav.toc))
    }).catch(() => setToc([]))

    rendition.on('locationChanged', location => {
      setCurrentLocation(location)
      const cfi = typeof location?.start === 'string'
        ? location.start
        : location?.start?.cfi || null
      if (cfi) {
        currentCfiRef.current = cfi
        localStorage.setItem(keys.progress, cfi)
        const bms = JSON.parse(localStorage.getItem(keys.bookmarks) || '[]')
        setIsBookmarked(bms.some(b => b.cfi === cfi))
      }
      calcProgress(cfi)
    })

    rendition.on('selected', (cfiRange, contents) => {
      try {
        const selText = contents.window.getSelection()?.toString()?.trim()
        if (!selText || selText.length < 2) return
        const sel = contents.window.getSelection()
        if (!sel || sel.rangeCount === 0) return
        const range = sel.getRangeAt(0)
        const rangeRect = range.getBoundingClientRect()
        const iframe = viewerRef.current?.querySelector('iframe')
        if (!iframe) return
        const iframeRect = iframe.getBoundingClientRect()
        const x = iframeRect.left + rangeRect.left + rangeRect.width / 2
        const y = iframeRect.top  + rangeRect.top
        setSelection({ text: selText, cfi: cfiRange, position: { x, y } })
      } catch (err) {
        console.warn('[Selection] Error:', err.message)
      }
    })

    const attachedDocs = new WeakSet()
    let startX = 0, startY = 0

    const makeTouchHandlers = () => {
      const onStart = (e) => {
        if (e.touches.length !== 1) return
        startX = e.touches[0].clientX
        startY = e.touches[0].clientY
      }
      const onEnd = (e) => {
        const t = e.changedTouches[0]
        const diffX = startX - t.clientX
        const diffY = Math.abs(startY - t.clientY)
        if (Math.abs(diffX) > 40 && Math.abs(diffX) > diffY) {
          setSelection(null)
          if (diffX > 0) handleNextRef.current?.()
          else           handlePrevRef.current?.()
        }
      }
      return { onStart, onEnd }
    }

    const attachToIframeDoc = (iframeDoc) => {
      if (!iframeDoc || attachedDocs.has(iframeDoc)) return
      attachedDocs.add(iframeDoc)
      const { onStart, onEnd } = makeTouchHandlers()
      iframeDoc.addEventListener('touchstart', onStart, { passive: true })
      iframeDoc.addEventListener('touchend',   onEnd,   { passive: true })
    }

    rendition.on('rendered', (_section, view) => {
      try {
        const doc = view?.contents?.document
        if (!doc) return

        attachToIframeDoc(doc)

        // ── FIX: Intersep semua klik link di dalam EPUB ──────────────
        doc.addEventListener('click', async (e) => {
          const anchor = e.target.closest('a')
          if (!anchor) return

          const href = anchor.getAttribute('href')
          if (!href) return

          e.preventDefault()
          e.stopPropagation()

          // 1. Link eksternal → buka di tab baru via parent frame (tidak kena sandbox)
          if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//')) {
            window.open(href, '_blank', 'noopener,noreferrer')
            return
          }

          // 2. mailto / tel → buka langsung
          if (href.startsWith('mailto:') || href.startsWith('tel:')) {
            window.open(href)
            return
          }

          // 3. Link internal EPUB → navigasi via epub.js
          const rendition = renditionRef.current
          const epubBook  = bookRef.current
          if (!rendition || !epubBook) return

          try {
            const currentHref = _section?.href || ''
            const baseHref    = currentHref.includes('/')
              ? currentHref.substring(0, currentHref.lastIndexOf('/') + 1)
              : ''

            let fullHref = href
            if (!href.startsWith('/') && !href.startsWith('#')) {
              fullHref = baseHref + href
            }

            const hashIndex   = fullHref.indexOf('#')
            const sectionPath = hashIndex !== -1 ? fullHref.slice(0, hashIndex) : fullHref
            const anchorId    = hashIndex !== -1 ? fullHref.slice(hashIndex + 1) : null

            if (!sectionPath && anchorId) {
              // Pure anchor (#id) di section yang sama
              const canonical = resolveCanonicalHref(epubBook, currentHref)
              const { cfi } = await resolveAnchorToCfi(epubBook, canonical, anchorId)
              await rendition.display(cfi)
            } else if (sectionPath) {
              const canonical = resolveCanonicalHref(epubBook, sectionPath)
              if (anchorId) {
                const { cfi } = await resolveAnchorToCfi(epubBook, canonical, anchorId)
                await rendition.display(cfi)
              } else {
                await rendition.display(canonical)
              }
            }
          } catch (err) {
            console.warn('[LinkClick] Navigasi internal gagal:', err.message)
            try { await renditionRef.current?.display(href) } catch {}
          }
        }, true) // useCapture=true agar intercept sebelum handler epub.js
        // ── END FIX ──────────────────────────────────────────────────

      } catch {}
    })

    return () => { try { epubBook.destroy() } catch {} }
  }, [book]) // eslint-disable-line

  // ── Re-apply highlights setelah ready ───────────────────────────
  useEffect(() => {
    if (!isReady || !renditionRef.current) return
    annotations.forEach(ann => {
      try {
        renditionRef.current.annotations.highlight(ann.cfi, {}, null, 'epub-highlight', { fill: ann.color, 'fill-opacity': '0.4' })
      } catch {}
    })
  }, [isReady, annotations])

  // ── Apply theme + re-anchor posisi saat font size berubah ───────
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

  // ── Persist annotations/bookmarks ───────────────────────────────
  useEffect(() => { localStorage.setItem(keys.annotations, JSON.stringify(annotations)) }, [annotations]) // eslint-disable-line
  useEffect(() => { localStorage.setItem(keys.bookmarks,   JSON.stringify(bookmarks))   }, [bookmarks])   // eslint-disable-line

  // ── handleNext / handlePrev ──────────────────────────────────────
  const handleNext = useCallback(() => {
    setSelection(null)
    renditionRef.current?.next()
  }, [])

  const handlePrev = useCallback(async () => {
    setSelection(null)
    const rendition = renditionRef.current
    const epubBook  = bookRef.current
    if (!rendition || !epubBook) return
    const locBefore  = rendition.currentLocation()
    const hrefBefore = locBefore?.start?.href || ''
    await rendition.prev()
    const locAfter  = rendition.currentLocation()
    const hrefAfter = locAfter?.start?.href || ''
    if (!hrefAfter || !hrefBefore || hrefAfter === hrefBefore) return
    const lastCfi = await getLastElementCfi(epubBook, hrefAfter)
    if (lastCfi) {
      try { await rendition.display(lastCfi) }
      catch (err) { console.warn('[handlePrev] re-anchor gagal:', err) }
    }
  }, [])

  const handleNextRef = useRef(handleNext)
  const handlePrevRef = useRef(handlePrev)
  useEffect(() => { handleNextRef.current = handleNext }, [handleNext])
  useEffect(() => { handlePrevRef.current = handlePrev }, [handlePrev])

  // ── TOC ───────────────────────────────────────────────────────────
  const handleTocClick = useCallback(async (href) => {
    const rendition = renditionRef.current
    const epubBook  = bookRef.current
    if (!rendition || !epubBook || !href) return
    setShowSidebar(false)
    const hashIndex   = href.indexOf('#')
    const sectionHref = hashIndex !== -1 ? href.slice(0, hashIndex) : href
    const anchor      = hashIndex !== -1 ? href.slice(hashIndex + 1) : null
    const canonical   = resolveCanonicalHref(epubBook, sectionHref)
    if (!anchor) { try { await rendition.display(canonical) } catch (err) { console.error('[TOC]', err) }; return }
    try {
      const { cfi, method } = await resolveAnchorToCfi(epubBook, canonical, anchor)
      console.log(`[TOC] via ${method}:`, cfi)
      await rendition.display(cfi)
    } catch (err) {
      console.error('[TOC] fallback:', err)
      try { await rendition.display(canonical) } catch {}
    }
  }, [])

  // ── Bookmark ──────────────────────────────────────────────────────
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
        try { await epubAnnotationService.deleteBookmark(bookSlug, bm.id) }
        catch (err) { console.warn('[Bookmark] delete failed:', err.message); setBookmarks(prev => [...prev, bm]); setIsBookmarked(true) }
      }
    } else {
      const page = rendition.currentLocation()?.start?.displayed?.page
      const text = page ? `Halaman ${page}` : `Posisi ${Math.round(progress)}%`
      const nb = { cfi, text, createdAt: Date.now() }
      setBookmarks(prev => [...prev, nb])
      setIsBookmarked(true)
      triggerGuestNotice()
      if (isAuthenticated) {
        setIsSyncing(true)
        try {
          const saved = await epubAnnotationService.addBookmark(bookSlug, nb)
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
      try { await epubAnnotationService.deleteBookmark(bookSlug, bm.id) }
      catch (err) { console.warn('[Bookmark] delete failed:', err.message) }
    }
  }

  // ── Annotations ──────────────────────────────────────────────────
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
        const saved = await epubAnnotationService.addAnnotation(bookSlug, na)
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
        const saved = await epubAnnotationService.addAnnotation(bookSlug, na)
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
      try { await epubAnnotationService.deleteAnnotation(bookSlug, ann.id) }
      catch (err) { console.warn('[Annotation] delete failed:', err.message) }
    }
  }

  // ── Keyboard shortcuts ────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') handleNext()
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   handlePrev()
      if (e.key === 'Escape') { setShowSidebar(false); setShowSettings(false); setSelection(null) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleNext, handlePrev])

  // ── Render guards ─────────────────────────────────────────────────
  if (loading) return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>

  if (error || !book?.fileUrl) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <BookOpen size={48} className="text-gray-300" />
        <p className="text-gray-500 text-lg">{error || 'File EPUB tidak tersedia untuk buku ini.'}</p>
        <Link to={`/buku/${bookSlug}`} className="text-amber-600 hover:underline flex items-center gap-1">
          <ArrowLeft size={16} /> Kembali ke halaman buku
        </Link>
      </div>
    )
  }

  const modeCfg = COLOR_MODES[colorMode] || COLOR_MODES.light

  return (
    <div className={`flex flex-col h-screen select-none ${isDark ? 'dark bg-gray-950' : 'bg-gray-100'}`}>

      {/* ── TOP BAR ── */}
      <header className={`flex items-center justify-between px-4 py-2 border-b z-20 flex-shrink-0 ${isDark ? 'bg-gray-900 border-gray-700 text-gray-200' : colorMode === 'cream' ? 'bg-[#f0e6d3] border-[#d6c5aa] text-gray-800' : 'bg-white border-gray-200 text-gray-800'}`}>
        <div className="flex items-center gap-2 min-w-0">
          <button onClick={() => navigate(`/buku/${bookSlug}`)} className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition flex-shrink-0" title="Kembali">
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{book.title}</p>
            <p className="text-xs text-gray-400 truncate">{book.authorNames}</p>
          </div>
        </div>

        {/* Progress bar — desktop */}
        <div className="hidden md:flex flex-1 items-center px-8 gap-3">
          <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs text-gray-400 flex-shrink-0">{progress}%</span>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {isSyncing && <span className="text-xs text-amber-500 animate-pulse mr-1 hidden sm:inline">Menyimpan...</span>}
          {!isAuthenticated && (
            <span className="text-xs text-gray-400 border border-gray-300 dark:border-gray-600 px-2 py-0.5 rounded-full mr-1 hidden sm:inline cursor-pointer hover:text-amber-600 hover:border-amber-400 transition"
              onClick={() => navigate('/masuk')} title="Login untuk sync">Masuk untuk sync</span>
          )}
          <button onClick={handleToggleBookmark}
            className={`p-1.5 rounded-lg transition ${isBookmarked ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20' : 'hover:bg-black/10 dark:hover:bg-white/10'}`}
            title={isBookmarked ? 'Hapus penanda' : 'Tambah penanda'}>
            {isBookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
          </button>
          <button onClick={() => { setShowSidebar(s => !s); setShowSettings(false) }} className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition" title="Panel">
            <List size={18} />
          </button>
          <button onClick={() => { setShowSettings(s => !s); setShowSidebar(false) }} className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition" title="Pengaturan">
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* ── BODY ── */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 overflow-hidden relative">

          {/* Desktop prev button */}
          <button onClick={handlePrev}
            className="hidden md:flex items-center justify-center w-12 flex-shrink-0 hover:bg-black/5 dark:hover:bg-white/5 transition group" title="Sebelumnya (←)">
            <ChevronLeft size={20} className="text-gray-300 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition" />
          </button>

          {/* EPUB viewer */}
          <div className="flex-1 overflow-hidden relative" style={{ background: modeCfg.bg }}>
            <div ref={viewerRef} className="w-full h-full" style={{ userSelect: 'text' }} />

            {!isReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-900 bg-opacity-90 z-10">
                <div className="flex flex-col items-center gap-3 text-gray-400">
                  <BookOpen size={36} className="animate-pulse text-amber-500" />
                  <p className="text-sm">Memuat buku...</p>
                </div>
              </div>
            )}

            {isReady && epubError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white dark:bg-gray-900 z-10">
                <BookOpen size={48} className="text-gray-300" />
                <p className="text-gray-500 text-center max-w-sm px-4">{epubError}</p>
                <button onClick={() => navigate(`/buku/${bookSlug}`)} className="text-amber-600 hover:underline flex items-center gap-1 text-sm">
                  <ArrowLeft size={16} /> Kembali ke halaman buku
                </button>
              </div>
            )}
          </div>

          {/* Desktop next button */}
          <button onClick={handleNext}
            className="hidden md:flex items-center justify-center w-12 flex-shrink-0 hover:bg-black/5 dark:hover:bg-white/5 transition group" title="Berikutnya (→)">
            <ChevronRight size={20} className="text-gray-300 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition" />
          </button>
        </div>

        {showSidebar && (
          <aside className="w-72 flex-shrink-0 border-l border-gray-200 dark:border-gray-700 overflow-hidden">
            <SidebarPanel
              activeTab="toc" toc={toc} bookmarks={bookmarks} annotations={annotations}
              onTocClick={handleTocClick} onBookmarkClick={handleBookmarkClick}
              onAnnotationClick={handleAnnotationClick} onDeleteBookmark={handleDeleteBookmark}
              onDeleteAnnotation={handleDeleteAnnotation} onClose={() => setShowSidebar(false)}
            />
          </aside>
        )}

        {showSettings && (
          <aside className="w-72 flex-shrink-0 border-l border-gray-200 dark:border-gray-700 overflow-hidden">
            <SettingsPanel
              fontSize={fontSize} onFontSizeChange={setFontSize}
              colorMode={colorMode} onColorModeChange={setColorMode}
              fontFamily={fontFamily} onFontChange={setFontFamily}
              onClose={() => setShowSettings(false)}
            />
          </aside>
        )}
      </div>

      {/* ── BOTTOM BAR (mobile only) ── */}
      <footer className={`md:hidden flex items-center gap-3 px-5 py-2.5 border-t flex-shrink-0 ${isDark ? 'bg-gray-900 border-gray-700' : colorMode === 'cream' ? 'bg-[#f0e6d3] border-[#d6c5aa]' : 'bg-white border-gray-200'}`}>
        <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-xs text-gray-400 flex-shrink-0 tabular-nums">{progress}%</span>
      </footer>

      {/* ── Selection popup ── */}
      {selection && !showNoteModal && (
        <SelectionPopup position={selection.position} onHighlight={handleHighlight} onNote={handleOpenNote} onClose={() => setSelection(null)} />
      )}

      {/* ── Note modal ── */}
      {showNoteModal && selection && (
        <NoteModal selectedText={selection.text} onSave={handleSaveNote} onClose={() => { setShowNoteModal(false); setSelection(null) }} />
      )}

      {/* ── Guest notice banner ── */}
      {showGuestNotice && !isAuthenticated && (
        <GuestNoticeBanner
          onDismiss={dismissGuestNotice}
          onRegister={() => { dismissGuestNotice(); navigate('/daftar') }}
          onLogin={() => { dismissGuestNotice(); navigate('/masuk') }}
        />
      )}

    </div>
  )
}

export default EpubReaderPage
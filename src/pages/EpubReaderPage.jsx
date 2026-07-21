import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import ePub from 'epubjs'
import bookService from '../services/bookService'
import zineService from '../services/zineService'
import { chapterService } from '../services/chapterService'
import LoadingSpinner from '../components/Common/LoadingSpinner'
import ReadingActivityBanner from '../components/Reader/ReadingActivityBanner'
import ShareAnnotationModal from '../components/Social/ShareAnnotationModal'
import feedEvents, { FEED_EVENTS } from '../services/feedEvents'
import epubAnnotationService from '../services/epubAnnotationService'

// ── Sub-components ────────────────────────────────────────────────────────
import FootnotePopup     from '../components/Reader/FootnotePopup'
import NoteModal         from '../components/Reader/NoteModal'
import SelectionPopup    from '../components/Reader/SelectionPopup'
import SearchPanel       from '../components/Reader/SearchPanel'
import SidebarPanel      from '../components/Reader/SidebarPanel'
import SettingsPanel     from '../components/Reader/SettingsPanel'
import GuestNoticeBanner from '../components/Reader/GuestNoticeBanner'
import CorrectionModal   from '../components/Reader/CorrectionModal'
// import TTSPlayer         from '../components/Reader/TTSPlayer'  // TTS dinonaktifkan sementara

// ── Hooks ─────────────────────────────────────────────────────────────────
import { useEpubTheme }   from '../hooks/useEpubTheme'
import { useEpubSession } from '../hooks/useEpubSession'
// import { useTTS }         from '../hooks/useTTS'  // TTS dinonaktifkan sementara

// ── Constants ─────────────────────────────────────────────────────────────
import { COLOR_MODES, HIGHLIGHT_COLORS } from '../constants/readerConstants'

// ── Utils ─────────────────────────────────────────────────────────────────
import {
  generateSessionId,
  getDeviceType,
  extractSpineIndex,
  isLinearSpineItem,
  normalizeHref,
  findActiveChapter,
  resolveCanonicalHref,
  resolveSpineItem,
  resolveAnchorToCfi,
  findAnchorInDoc,
  localKeys,
  getHighlightOpacity,
  isFootnoteElement,
  extractFootnoteHtml,
} from '../utils/epubUtils'
import { injectZineDocStyles } from '../utils/zineTheme'

// ── Icons ─────────────────────────────────────────────────────────────────
import {
  ArrowLeft, BookOpen, Bookmark, BookmarkCheck,
  ChevronLeft, ChevronRight, Search, Settings, List,
  // Headphones,  // TTS dinonaktifkan sementara
} from 'lucide-react'

// ── Correction helpers ────────────────────────────────────────────────────
const NON_CORRECTABLE_EPUB_HREFS = ['toc', 'nav', 'ncx', 'colophon', 'copyright', 'cover']

const isCorrectableEpubSection = (href = '') => {
  if (!href) return false
  const base = href.split('/').pop().toLowerCase().replace(/\.[^.]+$/, '')
  return !NON_CORRECTABLE_EPUB_HREFS.some(skip => base.includes(skip))
}

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

  // ── FIX: Shared navigation lock — mencegah double-navigation dari semua sumber ──
  const navLockRef = useRef(false)
  const acquireNavLock = useCallback((ms = 700) => {
    if (navLockRef.current) return false
    navLockRef.current = true
    setTimeout(() => { navLockRef.current = false }, ms)
    return true
  }, [])

  const [toc, setToc] = useState([])
  const tocRef        = useRef([])

  const keys = localKeys(slug)

  // ── Session refs ──────────────────────────────────────────────────────────
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

  // ── Reader settings ───────────────────────────────────────────────────────
  const [colorMode,  setColorMode]  = useState(() => localStorage.getItem(keys.colorMode)  || 'light')
  const [fontSize,   setFontSize]   = useState(() => parseInt(localStorage.getItem(keys.fontSize) || '16'))
  const [fontFamily, setFontFamily] = useState(() => localStorage.getItem(keys.fontFamily) || "'Georgia', 'Times New Roman', serif")

  const isDark = colorMode === 'dark'

  // Refs untuk nilai terkini agar tidak stale di dalam closure
  const colorModeRef  = useRef(colorMode)
  const fontSizeRef   = useRef(fontSize)
  const fontFamilyRef = useRef(fontFamily)

  // ── UI state ──────────────────────────────────────────────────────────────
  const [showSidebar,  setShowSidebar]  = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showSearch,   setShowSearch]   = useState(false)
  const [progress,     setProgress]     = useState(0)
  const [isReady,      setIsReady]      = useState(false)
  const [epubError,    setEpubError]    = useState(null)
  const [isSyncing,    setIsSyncing]    = useState(false)

  // ── Annotations & bookmarks ───────────────────────────────────────────────
  const [annotations, setAnnotations] = useState(() => {
    try { return JSON.parse(localStorage.getItem(keys.annotations) || '[]') } catch { return [] }
  })
  const [bookmarks, setBookmarks] = useState(() => {
    try { return JSON.parse(localStorage.getItem(keys.bookmarks) || '[]') } catch { return [] }
  })

  // ── Pending corrections ───────────────────────────────────────────────────
  const [pendingCorrections, setPendingCorrections] = useState(() => {
    try { return JSON.parse(localStorage.getItem(keys.corrections) || '[]') } catch { return [] }
  })

  // ── Modals / overlays ─────────────────────────────────────────────────────
  const [selection,       setSelection]       = useState(null)
  const [showNoteModal,   setShowNoteModal]   = useState(false)
  const [isBookmarked,    setIsBookmarked]    = useState(false)
  const [showGuestNotice, setShowGuestNotice] = useState(false)
  const [shareModal,      setShareModal]      = useState(null)
  const [footnotePopup,   setFootnotePopup]   = useState(null)

  // ── Correction state ──────────────────────────────────────────────────────
  const [showCorrectionModal, setShowCorrectionModal] = useState(false)
  const [correctionContext,   setCorrectionContext]   = useState(null)
  const [currentSectionHref,  setCurrentSectionHref] = useState('')
  const currentSectionHrefRef = useRef('')

  // ── Hooks ─────────────────────────────────────────────────────────────────
  const { applyTheme } = useEpubTheme()

  useEpubSession({
    slug,
    isAuthenticated,
    isZineMode,
    refs: {
      sessionIdRef, sessionStartRef, latestProgressRef, locationsReadyRef,
      sessionSentRef, spineIndexRef, totalSpineItemsRef,
      currentChapterLabelRef, currentChapterIndexRef, totalChaptersRef,
      currentCfiRef,
    },
  })

  // ── Guest notice ──────────────────────────────────────────────────────────
  const triggerGuestNotice = useCallback(() => {
    if (isAuthenticated) return
    if (!localStorage.getItem(keys.guestNoticeSeen)) setShowGuestNotice(true)
  }, [isAuthenticated, keys.guestNoticeSeen])

  const dismissGuestNotice = useCallback(() => {
    setShowGuestNotice(false)
    localStorage.setItem(keys.guestNoticeSeen, '1')
  }, [keys.guestNoticeSeen])

  useEffect(() => { latestProgressRef.current = progress }, [progress])

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

  // ── Load annotations & bookmarks dari server ───────────────────────────────
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

  // ── Load pending corrections dari server ──────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !slug) return
    const loadPendingCorrections = async () => {
      try {
        const list = await epubAnnotationService.getMyPendingCorrections(slug, isZineMode)
        const withCfi = list
          .filter(c => c.epubCfi)
          .map(c => ({ cfi: c.epubCfi, text: c.originalText, id: c.id, createdAt: c.createdAt }))

        const prevStored = JSON.parse(localStorage.getItem(keys.corrections) || '[]')
        const newCfiSet  = new Set(withCfi.map(c => c.cfi))
        prevStored.forEach(old => {
          if (!newCfiSet.has(old.cfi)) {
            try { renditionRef.current?.annotations.remove(old.cfi, 'epub-correction') } catch {}
          }
        })

        setPendingCorrections(withCfi)
        localStorage.setItem(keys.corrections, JSON.stringify(withCfi))
      } catch (err) {
        console.warn('[EpubReader] Gagal load pending corrections:', err.message)
      }
    }
    loadPendingCorrections()
  }, [slug, isAuthenticated]) // eslint-disable-line

  // ── Progress calculation helper ────────────────────────────────────────────
  const calcProgress = useCallback((cfi, epubBook) => {
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
  }, [])

  // ── Correction: open modal ─────────────────────────────────────────────────
  const handleOpenCorrection = useCallback(() => {
    if (!selection) return
    setCorrectionContext({
      selectedText:  selection.text,
      cfi:           selection.cfi,
      contextBefore: '',
      contextAfter:  '',
      startPosition: 0,
      endPosition:   selection.text.length,
    })
    setSelection(null)
    setShowCorrectionModal(true)
  }, [selection])

  // ── Submit correction ─────────────────────────────────────────────────────
  const handleSubmitCorrection = useCallback(async (correctionData) => {
    if (!slug) throw new Error('Slug tidak ditemukan')
    await chapterService.submitEpubCorrection(slug, {
      ...correctionData,
      epubCfi:     correctionData.cfi || currentCfiRef.current || '',
      sectionHref: currentSectionHrefRef.current || '',
    }, isZineMode)

    const cfi = correctionData.cfi || currentCfiRef.current
    if (cfi) {
      const nc = { cfi, text: correctionData.selectedText, createdAt: Date.now() }
      try {
        renditionRef.current?.annotations.highlight(
          cfi, {}, null, 'epub-correction',
          { fill: '#EF4444', 'fill-opacity': '0.30' }
        )
      } catch {}
      setPendingCorrections(prev => {
        const updated = [...prev.filter(c => c.cfi !== cfi), nc]
        localStorage.setItem(keys.corrections, JSON.stringify(updated))
        return updated
      })
    }
  }, [slug, isZineMode, keys.corrections])

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

    applyTheme(rendition, colorModeRef.current, fontSizeRef.current, fontFamilyRef.current)

    // ── FIX: Guard navigation ─────────────────────────────────────────────
    const navigationPromise = (epubBook.loaded?.navigation
      ? epubBook.loaded.navigation
      : Promise.reject(new Error('navigation not available'))
    ).then(nav => {
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
        calcProgress(currentCfiRef.current, epubBook)

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
            calcProgress(currentCfiRef.current, epubBook)
          }
        } catch {}
      })
      .catch(err => {
        console.error('EPUB init error:', err)
        setEpubError('Gagal memuat konten buku. File EPUB mungkin rusak atau tidak didukung.')
        setIsReady(true)
      })

    // ── locationChanged ────────────────────────────────────────────────────
    rendition.on('locationChanged', loc => {
      setFootnotePopup(null)

      const cfi = typeof loc?.start === 'string' ? loc.start : loc?.start?.cfi || null
      if (cfi) {
        currentCfiRef.current = cfi
        localStorage.setItem(keys.progress, cfi)
        localStorage.setItem(keys.progressAt, String(Date.now()))
        const bms = JSON.parse(localStorage.getItem(keys.bookmarks) || '[]')
        setIsBookmarked(bms.some(b => b.cfi === cfi))
        spineIndexRef.current = extractSpineIndex(cfi)
      }
      calcProgress(cfi, epubBook)

      const currentHref = loc?.start?.href || ''
      if (currentHref) {
        currentSectionHrefRef.current = currentHref
        setCurrentSectionHref(currentHref)
      }

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

    // ── selected ───────────────────────────────────────────────────────────
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

    // ── FIX: Touch swipe di dalam iframe ──────────────────────────────────
    // passive:false pada touchend agar stopPropagation bisa bekerja
    // mencegah event naik ke touchWrapperRef (double-fire)
    const attachedDocs = new WeakSet()
    const attachToIframeDoc = (iframeDoc) => {
      if (!iframeDoc || attachedDocs.has(iframeDoc)) return
      attachedDocs.add(iframeDoc)
      let fbStartX = 0, fbStartY = 0

      const onStart = (e) => {
        if (e.touches.length !== 1) return
        fbStartX = e.touches[0].clientX
        fbStartY = e.touches[0].clientY
      }

      const onEnd = (e) => {
        const t = e.changedTouches?.[0] ?? e.touches?.[0]
        if (!t) return
        const diffX = fbStartX - t.clientX
        const diffY = Math.abs(fbStartY - t.clientY)
        if (Math.abs(diffX) > 50 && Math.abs(diffX) > diffY * 1.5) {
          // ── FIX: Stop propagation agar tidak double-fire ke outer handler ──
          e.stopPropagation()
          setSelection(null)
          if (diffX > 0) handleNextRef.current?.()
          else           handlePrevRef.current?.()
        }
      }

      iframeDoc.addEventListener('touchstart', onStart, { passive: true })
      // ── FIX: passive:false agar stopPropagation bisa dipanggil ──
      iframeDoc.addEventListener('touchend', onEnd, { passive: false })
    }

    // ── rendered ───────────────────────────────────────────────────────────
    rendition.on('rendered', (_section, view) => {
      if (_section?.href) {
        currentSectionHrefRef.current = _section.href
        setCurrentSectionHref(_section.href)
      }

      try {
        applyTheme(
          renditionRef.current,
          colorModeRef.current,
          fontSizeRef.current,
          fontFamilyRef.current
        )

        const doc = view?.contents?.document
        if (!doc) return
        attachToIframeDoc(doc)
        injectDyslexicFont(doc)
        injectZineDocStyles(doc, colorModeRef.current)

        // Link click handler
        doc.addEventListener('click', async (e) => {
          const anchor = e.target.closest('a')
          if (!anchor) return
          const href = anchor.getAttribute('href')
          if (!href) return
          e.preventDefault()
          e.stopPropagation()

          if (href.startsWith('#')) {
            const targetId = href.slice(1)
            const targetEl = findAnchorInDoc(doc, targetId)

            if (targetEl && isFootnoteElement(targetEl)) {
              const rawHtml    = extractFootnoteHtml(targetEl)
              const iframe     = viewerRef.current?.querySelector('iframe')
              const iframeRect = iframe?.getBoundingClientRect() || { left: 0, top: 0 }
              const linkRect   = anchor.getBoundingClientRect()
              setFootnotePopup({
                html: rawHtml,
                x:    iframeRect.left + linkRect.left + linkRect.width / 2,
                y:    iframeRect.top  + linkRect.bottom,
              })
              return
            }

            if (targetEl && !isFootnoteElement(targetEl)) {
              try {
                const section = epubBook.spine.get(_section?.href || '')
                if (section) {
                  const cfi = section.cfiFromElement(targetEl)
                  if (cfi) { renditionRef.current?.display(cfi); return }
                }
              } catch {}
              return
            }
            return
          }

          if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//')) {
            window.open(href, '_blank', 'noopener,noreferrer')
            return
          }
          if (href.startsWith('mailto:') || href.startsWith('tel:')) {
            window.open(href)
            return
          }

          const renditionInner = renditionRef.current
          const epubBookInner  = bookRef.current
          if (!renditionInner || !epubBookInner) return

          try {
            const currentHref = _section?.href || ''
            const baseHref    = currentHref.includes('/')
              ? currentHref.substring(0, currentHref.lastIndexOf('/') + 1)
              : ''
            let fullHref = href
            if (!href.startsWith('/') && !href.startsWith('#')) fullHref = baseHref + href

            const hashIndex   = fullHref.indexOf('#')
            const sectionPath = hashIndex !== -1 ? fullHref.slice(0, hashIndex) : fullHref
            const anchorId    = hashIndex !== -1 ? fullHref.slice(hashIndex + 1) : null

            if (!sectionPath && anchorId) {
              const canonical = resolveCanonicalHref(epubBookInner, currentHref)
              const { cfi }   = await resolveAnchorToCfi(epubBookInner, canonical, anchorId)
              if (cfi) await renditionInner.display(cfi)
              else await renditionInner.display(currentHref)
              return
            }

            if (sectionPath) {
              const canonical = resolveCanonicalHref(epubBookInner, sectionPath)

              if (anchorId) {
                try {
                  const targetSection = epubBookInner.spine.get(canonical)
                  if (targetSection) {
                    const targetDoc = await targetSection.load(epubBookInner.load.bind(epubBookInner))
                    const targetEl  = targetDoc ? findAnchorInDoc(targetDoc, anchorId) : null

                    if (targetEl && isFootnoteElement(targetEl)) {
                      const rawHtml    = extractFootnoteHtml(targetEl)
                      targetSection.unload()
                      const iframe     = viewerRef.current?.querySelector('iframe')
                      const iframeRect = iframe?.getBoundingClientRect() || { left: 0, top: 0 }
                      const linkRect   = anchor.getBoundingClientRect()
                      setFootnotePopup({
                        html: rawHtml,
                        x:    iframeRect.left + linkRect.left + linkRect.width / 2,
                        y:    iframeRect.top  + linkRect.bottom,
                      })
                      return
                    }
                    if (targetSection.unload) targetSection.unload()
                  }
                } catch (fnErr) {
                  console.warn('[FootnoteCheck] cross-section gagal:', fnErr.message)
                }

                const { cfi } = await resolveAnchorToCfi(epubBookInner, canonical, anchorId)
                if (cfi) {
                  await renditionInner.display(cfi)
                } else {
                  try {
                    await renditionInner.display(canonical + '#' + anchorId)
                  } catch {
                    await renditionInner.display(canonical)
                  }
                }
              } else {
                await renditionInner.display(canonical)
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

  // ── Touch handler (outer wrapper) ─────────────────────────────────────────
  // Outer handler hanya sebagai fallback jika swipe tidak terjadi di atas iframe
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

  // ── Re-render highlights (annotations) ────────────────────────────────────
  useEffect(() => {
    if (!isReady || !renditionRef.current) return
    annotations.forEach(ann => {
      try {
        renditionRef.current.annotations.highlight(
          ann.cfi, {}, null, 'epub-highlight',
          { fill: ann.color, 'fill-opacity': getHighlightOpacity(colorMode) }
        )
      } catch {}
    })
  }, [isReady, annotations]) // eslint-disable-line

  // ── Re-render pending corrections ─────────────────────────────────────────
  useEffect(() => {
    if (!isReady || !renditionRef.current) return
    pendingCorrections.forEach(c => {
      try {
        renditionRef.current.annotations.highlight(
          c.cfi, {}, null, 'epub-correction',
          { fill: '#EF4444', 'fill-opacity': '0.30' }
        )
      } catch {}
    })
  }, [isReady, pendingCorrections]) // eslint-disable-line

  // ── Apply theme when settings change ──────────────────────────────────────
  const prevFontSizeRef = useRef(fontSize)
  useEffect(() => {
    colorModeRef.current  = colorMode
    fontSizeRef.current   = fontSize
    fontFamilyRef.current = fontFamily

    if (!renditionRef.current) return

    const fontSizeChanged = prevFontSizeRef.current !== fontSize
    prevFontSizeRef.current = fontSize

    applyTheme(renditionRef.current, colorMode, fontSize, fontFamily)

    localStorage.setItem(keys.colorMode,  colorMode)
    localStorage.setItem(keys.fontSize,   String(fontSize))
    localStorage.setItem(keys.fontFamily, fontFamily)

    if (!fontSizeChanged) return

    const timer = setTimeout(() => {
      try { renditionRef.current?.resize('100%', '100%') } catch {}
    }, 80)
    return () => clearTimeout(timer)
  }, [colorMode, fontSize, fontFamily, applyTheme]) // eslint-disable-line

  // ── Persist state ─────────────────────────────────────────────────────────
  useEffect(() => { localStorage.setItem(keys.annotations, JSON.stringify(annotations)) }, [annotations]) // eslint-disable-line
  useEffect(() => { localStorage.setItem(keys.bookmarks,   JSON.stringify(bookmarks))   }, [bookmarks])   // eslint-disable-line

  // ── Re-display setelah panel open/close ───────────────────────────────────
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

  // ── Navigation ────────────────────────────────────────────────────────────

  // ── FIX: handleNext kini memakai navLockRef — mencegah swipe ganda / double-tap ──
  const handleNext = useCallback(() => {
    if (!acquireNavLock(700)) return
    setSelection(null)
    setFootnotePopup(null)
    renditionRef.current?.next()
  }, [acquireNavLock])

  // ── FIX: handlePrev memakai navLockRef yang sama + strategi 3-tier ──────
  const handlePrev = useCallback(async () => {
    if (!acquireNavLock(900)) return

    setSelection(null)
    setFootnotePopup(null)

    const rendition = renditionRef.current
    const epubBook  = bookRef.current
    if (!rendition || !epubBook) { navLockRef.current = false; return }

    const locBefore  = rendition.currentLocation()
    const hrefBefore = locBefore?.start?.href || ''
    const pageBefore = locBefore?.start?.displayed?.page || 1
    const isMobile   = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

    // Masih di halaman pertama dalam section → cukup prev()
    if (pageBefore > 1) {
      rendition.prev()
      return
    }

    // Cari spine item sebelumnya
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

    if (currentIdx <= 0) { rendition.prev(); return }

    let prevIdx = currentIdx - 1
    while (prevIdx >= 0 && !isLinearSpineItem(spineItems[prevIdx])) prevIdx--
    if (prevIdx < 0) { rendition.prev(); return }

    const prevSpineItem = spineItems[prevIdx]
    const prevHref      = prevSpineItem.href || prevSpineItem.url

    // Helper: tunggu satu event rendered atau timeout
    const waitRender = (ms) => new Promise(resolve => {
      let done = false
      const finish = () => { if (!done) { done = true; resolve() } }
      try { rendition.once('rendered', finish) } catch {}
      setTimeout(finish, ms ?? (isMobile ? 350 : 200))
    })

    try {
      // ── Strategi 1: pakai CFI akhir section dari locations.generate() ──
      if (locationsReadyRef.current && epubBook.locations?.total > 0) {
        const allCfis = JSON.parse(epubBook.locations.save())

        // Coba match via spine number (paling reliable)
        const spineN = (prevIdx + 1) * 2
        let prevSectionCfis = allCfis.filter(c =>
          typeof c === 'string' &&
          (c.startsWith(`epubcfi(/6/${spineN}[`) || c.startsWith(`epubcfi(/6/${spineN}!`))
        )

        // Fallback: match via cfiBase
        if (prevSectionCfis.length === 0) {
          try {
            const prevSection = epubBook.spine.get(prevHref)
            const cfiBase     = prevSection?.cfiBase
            if (cfiBase) {
              const prefix = `epubcfi(${cfiBase}!`
              prevSectionCfis = allCfis.filter(c => typeof c === 'string' && c.startsWith(prefix))
            }
          } catch {}
        }

        if (prevSectionCfis.length > 0) {
          const lastCfi = prevSectionCfis[prevSectionCfis.length - 1]
          await rendition.display(lastCfi)
          await waitRender(isMobile ? 400 : 250)

          // ── FIX: Loop advance ke halaman terakhir — lebih reliable ──
          let guard = 40
          while (guard-- > 0) {
            const loc            = rendition.currentLocation()
            const page           = loc?.start?.displayed?.page  ?? 1
            const total          = loc?.start?.displayed?.total ?? 1
            const currentHrefNow = loc?.start?.href || ''
            const sameSection    = normalizeHref(currentHrefNow) === normalizeHref(prevHref)

            // Nyasar ke section lain → balik satu halaman
            if (!sameSection) {
              await waitRender(isMobile ? 400 : 250).then(() => rendition.prev()).catch(() => {})
              await waitRender(isMobile ? 400 : 250)
              break
            }

            // Sudah di halaman terakhir section → selesai
            if (page >= total) break

            // Masih ada halaman berikutnya → maju
            rendition.next()
            await waitRender(isMobile ? 300 : 180)
          }
          return
        }
      }

      // ── Strategi 2: navigasi ke akhir section via DOM element terakhir ──
      try {
        const prevSection = epubBook.spine.get(prevHref)
        if (prevSection) {
          const sectionDoc = await prevSection.load(epubBook.load.bind(epubBook))
          const body = sectionDoc?.body

          if (body) {
            // Ambil node teks terakhir yang visible
            const walker  = sectionDoc.createTreeWalker(body, NodeFilter.SHOW_ELEMENT, null)
            let lastEl = null
            let node   = walker.nextNode()
            while (node) { lastEl = node; node = walker.nextNode() }

            if (lastEl) {
              try {
                const endCfi = prevSection.cfiFromElement(lastEl)
                if (prevSection.unload) prevSection.unload()
                if (endCfi) {
                  await rendition.display(endCfi)
                  await waitRender(isMobile ? 400 : 250)
                  return
                }
              } catch {}
            }
            if (prevSection.unload) prevSection.unload()
          }
        }
      } catch (domErr) {
        console.warn('[handlePrev] DOM strategy gagal:', domErr.message)
      }

      // ── Strategi 3 (ultimate fallback): navigasi ke index spine ──────
      await rendition.display(prevIdx)

    } catch (err) {
      console.warn('[handlePrev] error, fallback prev():', err.message)
      try { rendition.prev() } catch {}
    } finally {
      // Lock dilepas sedikit lebih lama di mobile untuk anti double-tap
      setTimeout(() => { navLockRef.current = false }, isMobile ? 700 : 400)
    }
  }, [acquireNavLock, fontSize]) // eslint-disable-line

  const handleNextRef = useRef(handleNext)
  const handlePrevRef = useRef(handlePrev)
  useEffect(() => { handleNextRef.current = handleNext }, [handleNext])
  useEffect(() => { handlePrevRef.current = handlePrev }, [handlePrev])

  // ── Search navigation ─────────────────────────────────────────────────────
  const handleSearchNavigate = useCallback(async (cfi, searchQuery) => {
    if (!cfi || !renditionRef.current) return

    const q = searchQuery?.trim() || ''

    const collapseRangeCfi = (rawCfi) => {
      const m = rawCfi.match(/^epubcfi\((.+?),(.+?),(.+?)\)$/)
      if (!m) return rawCfi
      return `epubcfi(${m[1]}${m[2]})`
    }

    const pointCfi = collapseRangeCfi(cfi)

    await new Promise(r => setTimeout(r, 350))

    try {
      renditionRef.current.resize('100%', '100%')
      await new Promise(r => setTimeout(r, 100))
      await renditionRef.current.display(pointCfi)
    } catch {
      const match = pointCfi.match(/^epubcfi\(\/6\/(\d+)/)
      if (match) {
        const spineIndex = Math.floor(parseInt(match[1]) / 2) - 1
        await renditionRef.current.display(spineIndex).catch(() => {})
      }
    }

    await new Promise(r => setTimeout(r, 300))

    try {
      const contents = renditionRef.current.getContents?.()
      const doc = contents?.[0]?.document
        || viewerRef.current?.querySelector('iframe')?.contentDocument
      if (!doc?.body) return

      if (!doc.getElementById('_search_style')) {
        const s = doc.createElement('style')
        s.id = '_search_style'
        s.textContent = `
          .epub-search-highlight {
            background: #FDE68A !important;
            color: #92400E !important;
            border-radius: 2px;
            padding: 0 1px;
            outline: 2px solid #F59E0B;
          }
        `
        ;(doc.head || doc.documentElement).appendChild(s)
      }

      doc.querySelectorAll('.epub-search-highlight').forEach(el => {
        const p = el.parentNode
        if (p) { p.replaceChild(doc.createTextNode(el.textContent || ''), el); p.normalize() }
      })

      const lowerQ = q.toLowerCase()
      const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, null)
      const textNodes = []
      let n = walker.nextNode()
      while (n) {
        if (n.nodeValue?.toLowerCase().includes(lowerQ)) textNodes.push(n)
        n = walker.nextNode()
      }

      let firstMark = null
      textNodes.forEach(textNode => {
        try {
          const parent = textNode.parentNode
          if (!parent || ['SCRIPT', 'STYLE'].includes(parent.tagName)) return
          const text = textNode.nodeValue
          const lowerText = text.toLowerCase()
          let pos = lowerText.indexOf(lowerQ)
          if (pos === -1) return

          const frag = doc.createDocumentFragment()
          let last = 0
          while (pos !== -1) {
            if (pos > last) frag.appendChild(doc.createTextNode(text.slice(last, pos)))
            const mark = doc.createElement('mark')
            mark.className = 'epub-search-highlight'
            mark.textContent = text.slice(pos, pos + q.length)
            if (!firstMark) firstMark = mark
            frag.appendChild(mark)
            last = pos + q.length
            pos = lowerText.indexOf(lowerQ, last)
          }
          if (last < text.length) frag.appendChild(doc.createTextNode(text.slice(last)))
          parent.replaceChild(frag, textNode)
        } catch {}
      })

      if (firstMark) firstMark.scrollIntoView({ behavior: 'smooth', block: 'center' })

      setTimeout(() => {
        try {
          doc.querySelectorAll('.epub-search-highlight').forEach(el => {
            const p = el.parentNode
            if (p) { p.replaceChild(doc.createTextNode(el.textContent || ''), el); p.normalize() }
          })
        } catch {}
      }, 5000)

    } catch (err) {
      console.warn('[SearchNavigate] highlight gagal:', err.message)
    }
  }, [])

  // ── TOC navigation ────────────────────────────────────────────────────────
  const handleTocClick = useCallback(async (href) => {
    const rendition = renditionRef.current
    const epubBook  = bookRef.current
    if (!rendition || !epubBook || !href) return

    setShowSidebar(false)
    setFootnotePopup(null)
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

  // ── Bookmark & annotation navigation ─────────────────────────────────────
  const collapseRangeCfi = (rawCfi) => {
    if (!rawCfi) return rawCfi
    const rangeMatch = rawCfi.match(/^epubcfi\((.+?),(.+?),(.+?)\)$/)
    if (!rangeMatch) return rawCfi
    return `epubcfi(${rangeMatch[1]}${rangeMatch[2]})`
  }

  const handleBookmarkClick = useCallback(async (cfi) => {
    if (!cfi || !renditionRef.current) return
    setShowSidebar(false)
    setSelection(null)
    setFootnotePopup(null)
    await new Promise(r => setTimeout(r, 300))
    renditionRef.current.display(collapseRangeCfi(cfi)).catch(err => {
      console.warn('[BookmarkClick] display gagal:', err.message)
    })
  }, [])

  const handleAnnotationClick = useCallback(async (cfi) => {
    if (!cfi || !renditionRef.current) return
    setShowSidebar(false)
    setSelection(null)
    setFootnotePopup(null)
    await new Promise(r => setTimeout(r, 300))
    renditionRef.current.display(collapseRangeCfi(cfi)).catch(err => {
      console.warn('[AnnotationClick] display gagal:', err.message)
    })
  }, [])

  // ── Toggle bookmark ───────────────────────────────────────────────────────
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
      const nb   = { cfi, text, label: text, createdAt: Date.now() }
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

  // ── Highlight / note ──────────────────────────────────────────────────────
  const handleHighlight = async (color) => {
      if (!selection) return

      // ── FIX: Cek apakah CFI ini sudah punya highlight lama → hapus dulu ──
      const existing = annotations.find(a => a.cfi === selection.cfi)
      if (existing) {
        try { renditionRef.current?.annotations.remove(existing.cfi, 'highlight') } catch {}
        if (isAuthenticated && existing.id) {
          try { await epubAnnotationService.deleteAnnotation(slug, isZineMode, existing.id) }
          catch (err) { console.warn('[Highlight] delete lama gagal:', err.message) }
        }
      }

      try {
        renditionRef.current?.annotations.highlight(
          selection.cfi, {}, null, 'epub-highlight',
          { fill: color, 'fill-opacity': getHighlightOpacity(colorMode) }
        )
      } catch {}

      const na = { cfi: selection.cfi, text: selection.text, color, note: existing?.note || '', createdAt: Date.now() }
      // ── FIX: Ganti (bukan tambah) entry lama dengan yang baru ──
      setAnnotations(prev => [...prev.filter(a => a.cfi !== selection.cfi), na])
      setSelection(null)
      triggerGuestNotice()
      if (isAuthenticated) {
        setIsSyncing(true)
        try {
          const saved = await epubAnnotationService.addAnnotation(slug, isZineMode, na)
          setAnnotations(prev => prev.map(a =>
            a.cfi === na.cfi && a.createdAt === na.createdAt && !a.id ? { ...a, id: saved?.id } : a
          ))
        } catch (err) { console.warn('[Highlight] add failed:', err.message) }
        finally { setIsSyncing(false) }
      }
    }

  const handleOpenNote = () => setShowNoteModal(true)

  const handleSaveNote = async ({ color, note }) => {
    if (!selection) return
    try {
      renditionRef.current?.annotations.highlight(
        selection.cfi, {}, null, 'epub-highlight',
        { fill: color, 'fill-opacity': getHighlightOpacity(colorMode) }
      )
    } catch {}
    const na = { cfi: selection.cfi, text: selection.text, color, note, createdAt: Date.now() }
    setAnnotations(prev => [...prev, na])
    setShowNoteModal(false)
    setSelection(null)
    triggerGuestNotice()
    if (isAuthenticated) {
      setIsSyncing(true)
      try {
        const saved = await epubAnnotationService.addAnnotation(slug, isZineMode, na)
        setAnnotations(prev => prev.map(a =>
          a.cfi === na.cfi && a.createdAt === na.createdAt && !a.id ? { ...a, id: saved?.id } : a
        ))
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

  // ── Share selection ───────────────────────────────────────────────────────
  const handleShareSelection = useCallback(() => {
    if (!selection) return
    if (!isAuthenticated) {
      setSelection(null)
      navigate('/masuk', { state: { from: location.pathname } })
      return
    }
    setShareModal({
      text:         selection.text,
      cfi:          selection.cfi,
      chapterLabel: currentChapterLabelRef.current,
    })
    setSelection(null)
  }, [selection, isAuthenticated, navigate, location.pathname])

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') handleNext()
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   handlePrev()
      if (e.key === 'Escape') {
        if (showCorrectionModal) { setShowCorrectionModal(false); setCorrectionContext(null); return }
        if (footnotePopup)       { setFootnotePopup(null); return }
        setShowSidebar(false)
        setShowSettings(false)
        setShowSearch(false)
        setSelection(null)
        setShareModal(null)
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
  }, [handleNext, handlePrev, footnotePopup, showCorrectionModal])

  // ── Loading & Error states ─────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner />
    </div>
  )

  if (error || !book?.fileUrl) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <BookOpen size={48} className="text-gray-300" />
        <p className="text-gray-500 text-lg">{error || 'File EPUB tidak tersedia.'}</p>
        <Link
          to={isZineMode ? `/zine/${slug}` : `/buku/${slug}`}
          className="text-amber-600 hover:underline flex items-center gap-1"
        >
          <ArrowLeft size={16} /> Kembali
        </Link>
      </div>
    )
  }

  const modeCfg      = COLOR_MODES[colorMode] || COLOR_MODES.light
  const headerBg     = colorMode === 'dark' ? '#111827' : colorMode === 'cream' ? '#f0e6d3' : '#ffffff'
  const headerBorder = colorMode === 'dark' ? '#374151' : colorMode === 'cream' ? '#d6c5aa' : '#e5e7eb'
  const headerColor  = modeCfg.color
  const mutedClr     = colorMode === 'dark' ? '#9CA3AF' : colorMode === 'cream' ? '#7a6a55' : '#9CA3AF'
  const progressBg   = colorMode === 'dark' ? '#374151' : colorMode === 'cream' ? '#d6c5aa' : '#e5e7eb'

  const canCorrect = isCorrectableEpubSection(currentSectionHref)

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
            <p className="text-xs truncate" style={{ color: mutedClr }}>
              {currentChapterLabel || book.authorNames}
            </p>
          </div>
        </div>

        <div className="hidden md:flex flex-1 items-center px-8 gap-3">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: progressBg }}>
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

          <button
            onClick={handlePrev}
            className="hidden md:flex items-center justify-center w-12 flex-shrink-0 hover:bg-black/5 dark:hover:bg-white/5 transition group"
            title="Sebelumnya (←)"
          >
            <ChevronLeft size={20} className="text-gray-300 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition" />
          </button>

          <div
            ref={touchWrapperRef}
            className="flex-1 overflow-hidden relative"
            style={{
              background:  modeCfg.bg,
              touchAction: 'pan-y',
            }}
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

          <button
            onClick={handleNext}
            className="hidden md:flex items-center justify-center w-12 flex-shrink-0 hover:bg-black/5 dark:hover:bg-white/5 transition group"
            title="Berikutnya (→)"
          >
            <ChevronRight size={20} className="text-gray-300 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition" />
          </button>
        </div>

        {showSearch && (
          <aside className="w-72 flex-shrink-0 overflow-hidden" style={{ borderLeft: `1px solid ${headerBorder}` }}>
            <SearchPanel
              onClose={() => setShowSearch(false)}
              onNavigate={handleSearchNavigate}
              colorMode={colorMode}
              bookRef={bookRef}
              tocRef={tocRef}
            />
          </aside>
        )}

        {showSidebar && (
          <aside className="w-72 flex-shrink-0 overflow-hidden" style={{ borderLeft: `1px solid ${headerBorder}` }}>
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

        {showSettings && (
          <aside className="w-72 flex-shrink-0 overflow-hidden" style={{ borderLeft: `1px solid ${headerBorder}` }}>
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

      {/* ── Footer (mobile progress) ── */}
      <footer
        className="md:hidden flex items-center gap-3 px-5 py-2.5 flex-shrink-0"
        style={{ background: headerBg, borderTop: `1px solid ${headerBorder}` }}
      >
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: progressBg }}>
          <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-xs flex-shrink-0 tabular-nums" style={{ color: '#9CA3AF' }}>{progress}%</span>
      </footer>

      {/* ── Overlays & Modals ── */}

      {footnotePopup && (
        <FootnotePopup
          popup={footnotePopup}
          onClose={() => setFootnotePopup(null)}
          colorMode={colorMode}
        />
      )}

      {selection && !showNoteModal && (
        <SelectionPopup
          position={selection.position}
          onHighlight={handleHighlight}
          onNote={handleOpenNote}
          onShare={handleShareSelection}
          onClose={() => setSelection(null)}
          canCorrect={canCorrect}
          onReport={handleOpenCorrection}
        />
      )}

      {showNoteModal && selection && (
        <NoteModal
          selectedText={selection.text}
          onSave={handleSaveNote}
          onClose={() => { setShowNoteModal(false); setSelection(null) }}
        />
      )}

      {showCorrectionModal && correctionContext && (
        <CorrectionModal
          selectedText={correctionContext.selectedText}
          contextBefore={correctionContext.contextBefore}
          contextAfter={correctionContext.contextAfter}
          startPosition={correctionContext.startPosition}
          endPosition={correctionContext.endPosition}
          onSave={handleSubmitCorrection}
          onClose={() => { setShowCorrectionModal(false); setCorrectionContext(null) }}
          onNavigateToLogin={() => {
            setShowCorrectionModal(false)
            setCorrectionContext(null)
            navigate('/masuk', { state: { from: location.pathname } })
          }}
        />
      )}

      {shareModal && isAuthenticated && (
        <ShareAnnotationModal
          selectedText={shareModal.text}
          entityType={isZineMode ? 'ZINE' : 'BOOK'}
          entityId={book?.id}
          entityTitle={book?.title}
          entitySlug={slug}
          chapterLabel={shareModal.chapterLabel}
          onClose={() => setShareModal(null)}
          onPublished={(activityData) => {
            setShareModal(null)
            feedEvents.emit(FEED_EVENTS.ACTIVITY_CREATED, {
              ...activityData,
              activityType: 'shared_annotation',
              entityType:   isZineMode ? 'ZINE' : 'BOOK',
              entitySlug:   slug,
              entityTitle:  book?.title,
              entityCover:  book?.coverImageUrl,
              metadata:     { selectedText: shareModal.text },
            })
          }}
        />
      )}

      {showGuestNotice && !isAuthenticated && (
        <GuestNoticeBanner
          colorMode={colorMode}
          onDismiss={dismissGuestNotice}
          onRegister={() => { dismissGuestNotice(); navigate('/daftar') }}
          onLogin={() => { dismissGuestNotice(); navigate('/masuk') }}
        />
      )}

      {!isAuthenticated && isReady && (
        <ReadingActivityBanner
          bookTitle={book?.title}
          colorMode={colorMode}
          delayMs={3 * 60 * 1000}
          onLogin={() => navigate('/masuk', { state: { from: location.pathname } })}
          onRegister={() => navigate('/daftar')}
        />
      )}

    </div>
  )
}

export default EpubReaderPage
export function parseCfiChapter(cfi) {
  if (!cfi || typeof cfi !== 'string') return null
  try {
    const base = cfi.split('!')[0]
    const parts = base.replace('epubcfi(', '').split('/')
    const spineStep = parseInt(parts[2], 10)
    if (isNaN(spineStep) || spineStep < 2) return null
    return spineStep / 2
  } catch {
    return null
  }
}

export function chapterDisplayLabel(currentChapter, totalChapters, lastCfi) {
  const cfiChapter = parseCfiChapter(lastCfi)
  const chapter = cfiChapter ?? currentChapter
  if (!chapter && !totalChapters) return 'EPUB'
  if (!totalChapters) return `Bab ${chapter || 0}`
  return `Bab ${chapter || 0}/${totalChapters}`
}

export function readingPositionLabel(currentChapter, totalChapters, progressPercentage, lastCfi) {
  const pct = (progressPercentage || 0).toFixed(0)
  const chapLabel = chapterDisplayLabel(currentChapter, totalChapters, lastCfi)
  if (chapLabel === 'EPUB') return `${pct}% selesai`
  return `${chapLabel} · ${pct}%`
}

// ── Session / Device ───────────────────────────────────────────────────────
export const generateSessionId = () =>
  `epub_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`

export const getDeviceType = () =>
  /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ? 'mobile' : 'desktop'

// ── CFI / Spine helpers ────────────────────────────────────────────────────
export const extractSpineIndex = (cfi) => {
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

export const isLinearSpineItem = (item) => {
  if (!item) return false
  if (item.linear === false || item.linear === 'no') return false
  return true
}

// ── TOC helpers ────────────────────────────────────────────────────────────
export const normalizeHref = (href) => {
  if (!href) return ''
  const withoutHash = href.split('#')[0]
  return withoutHash.split('/').pop() || ''
}

export const findActiveChapter = (tocItems, currentHref) => {
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

// ── Spine resolution ───────────────────────────────────────────────────────
export const resolveCanonicalHref = (epubBook, sectionHref) => {
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

export const resolveSpineItem = (epubBook, canonical) => {
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

// ── Anchor / CFI resolution ────────────────────────────────────────────────
export const findAnchorInDoc = (doc, anchor) => {
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

export const resolveAnchorToCfi = async (epubBook, canonicalHref, anchor) => {
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

// ── Local storage keys ─────────────────────────────────────────────────────
export const localKeys = (slug) => ({
  annotations:     `epub_annotations_${slug}`,
  bookmarks:       `epub_bookmarks_${slug}`,
  corrections:     `epub_corrections_${slug}`,   // ← pending correction highlights merah
  progress:        `epub_progress_${slug}`,
  progressAt:      `epub_progress_at_${slug}`,
  colorMode:       'epubColorMode',
  fontSize:        'epubFontSize',
  fontFamily:      'epubFontFamily',
  guestNoticeSeen: 'epub_guest_notice_seen',
})

// ── Highlight opacity ──────────────────────────────────────────────────────
export const getHighlightOpacity = (mode) =>
  mode === 'dark' ? '0.35' : mode === 'cream' ? '0.45' : '0.4'

// ── Footnote helpers ───────────────────────────────────────────────────────
export const isFootnoteElement = (el) => {
  if (!el) return false
  return (
    el.closest?.('.note') != null ||
    el.closest?.('[epub\\:type="footnote"]') != null ||
    el.closest?.('[epub\\:type="endnote"]') != null ||
    el.closest?.('aside[epub\\:type]') != null ||
    el.closest?.('.footnote') != null ||
    el.closest?.('.endnote') != null
  )
}

export const extractFootnoteHtml = (el) => {
  const clone = el.cloneNode(true)
  clone.querySelectorAll('a').forEach(a => {
    const h = a.getAttribute('href') || ''
    if (h.startsWith('#')) {
      const text = a.textContent || ''
      const textNode = clone.ownerDocument?.createTextNode(text) || document.createTextNode(text)
      a.parentNode?.replaceChild(textNode, a)
    }
  })
  return clone.innerHTML.trim()
}
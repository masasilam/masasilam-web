import { useState, useRef, useEffect, useCallback } from 'react'
import { X, Search, BookOpen } from 'lucide-react'
import { COLOR_MODES } from '../../constants/readerConstants'
import { isLinearSpineItem } from '../../utils/epubUtils'

const SearchPanel = ({ onClose, onNavigate, colorMode, bookRef, tocRef }) => {
  const [query,        setQuery]        = useState('')
  const [results,      setResults]      = useState([])
  const [isSearching,  setIsSearching]  = useState(false)
  const [searched,     setSearched]     = useState(false)
  const [scanProgress, setScanProgress] = useState({ current: 0, total: 0 })
  const abortRef = useRef(false)
  const inputRef = useRef(null)

  const cfg           = COLOR_MODES[colorMode] || COLOR_MODES.light
  const isDark        = colorMode === 'dark'
  const isCream       = colorMode === 'cream'
  const borderClr     = isDark ? '#374151' : isCream ? '#d6c5aa' : '#e5e7eb'
  const mutedClr      = isDark ? '#9CA3AF' : isCream ? '#7a6a55' : '#6B7280'
  const inputBg       = isDark ? '#1F2937' : isCream ? '#e8dcc8' : '#F9FAFB'
  const resultHoverBg = isDark ? '#1F2937' : isCream ? '#ede3d6' : '#F9FAFB'
  const accentClr     = isDark ? '#FCD34D' : '#D97706'

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 80) }, [])

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
    } catch { return excerpt }
  }, [])

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
          const doc   = section.document
          const found = []

          if (doc?.body) {
            const lowerQ  = q.toLowerCase()
            const walker  = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, null)
            let node = walker.nextNode()

            while (node) {
              const text      = node.nodeValue || ''
              const lowerText = text.toLowerCase()
              let idx = lowerText.indexOf(lowerQ)

              while (idx !== -1) {
                let cfi = null
                try {
                  try {
                    const range = doc.createRange()
                      range.setStart(node, idx)
                      range.setEnd(node, Math.min(idx + q.length, (node.nodeValue || '').length))
                      const rawCfi = section.cfiFromRange(range)
                      if (rawCfi) cfi = rawCfi
                  } catch {
                    const el = node.parentElement || node.parentNode
                    if (el && el.tagName !== 'BODY' && el.tagName !== 'HTML') {
                      const elCfi = section.cfiFromElement(el)
                      if (elCfi) {
                        let clean = elCfi.replace(/:(\d+)(\)|\[)/g, '$2').replace(/:(\d+)\)$/, ')')
                        cfi = clean
                      }
                    }
                  }
                } catch (cfiErr) {
                  console.warn(`[Search] CFI generation gagal untuk "${q}":`, cfiErr.message)
                }

                const start   = Math.max(0, idx - 60)
                const end     = Math.min(text.length, idx + q.length + 60)
                const excerpt = text.slice(start, end).replace(/\s+/g, ' ').trim()

                if (cfi) {
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
      {/* Header */}
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

      {/* Search input */}
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
              style={{ background: inputBg, color: cfg.color, border: `1px solid ${borderClr}` }}
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

        {/* Progress / status */}
        <div className="mt-2 min-h-[18px]">
          {isSearching && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs" style={{ color: mutedClr }}>
                <span>Memindai {scanProgress.current} / {scanProgress.total} bagian…</span>
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

      {/* Results */}
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
            onClick={() => { onClose(); onNavigate(result.cfi, query) }}
            className="w-full text-left px-4 py-3 transition-colors"
            style={{ borderBottom: `1px solid ${borderClr}` }}
            onMouseEnter={e => { e.currentTarget.style.background = resultHoverBg }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            {result.chapterLabel && (
              <p className="text-xs font-medium mb-1 truncate flex items-center gap-1" style={{ color: accentClr }}>
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

export default SearchPanel
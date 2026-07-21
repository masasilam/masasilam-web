import { useState, useEffect, useRef, useCallback } from 'react'
import {
  isTTSSupported,
  waitForVoices,
  selectBestVoice,
  prepareTextChunks,
  extractTextFromEpubDoc,
  ttsPlayer,
} from '../services/ttsService'

export const useTTS = ({
  renditionRef,
  viewerRef,
  colorMode = 'light',
  lang      = 'id-ID',
} = {}) => {
  // ── Support check ──────────────────────────────────────────────────────
  const [isSupported,  setIsSupported]  = useState(false)

  // ── UI state ───────────────────────────────────────────────────────────
  const [isPlaying,    setIsPlaying]    = useState(false)
  const [isPaused,     setIsPaused]     = useState(false)
  const [isLoading,    setIsLoading]    = useState(false)
  const [error,        setError]        = useState(null)

  // ── Progress ───────────────────────────────────────────────────────────
  const [chunkIndex,   setChunkIndex]   = useState(0)
  const [totalChunks,  setTotalChunks]  = useState(0)

  // ── Highlight tracking ─────────────────────────────────────────────────
  const [activeChunkText, setActiveChunkText] = useState('')

  // ── Settings ───────────────────────────────────────────────────────────
  const [voices,        setVoices]       = useState([])
  const [selectedVoice, setSelectedVoice] = useState(null)
  const [rate,          setRateState]    = useState(1.0)
  const [pitch,         setPitchState]   = useState(1.0)
  const [volume,        setVolumeState]  = useState(1.0)

  // ── Refs ───────────────────────────────────────────────────────────────
  const playerRef    = useRef(ttsPlayer)
  const isPlayingRef = useRef(false)
  const isPausedRef  = useRef(false)

  // FIX: Flag transisi — saat true, semua DOM write dari TTS diblokir
  const isTransitioningRef = useRef(false)

  useEffect(() => { isPlayingRef.current = isPlaying }, [isPlaying])
  useEffect(() => { isPausedRef.current  = isPaused  }, [isPaused])

  // ── Init: cek support & load voices ───────────────────────────────────
  useEffect(() => {
    if (!isTTSSupported()) { setIsSupported(false); return }
    setIsSupported(true)

    waitForVoices().then(allVoices => {
      setVoices(allVoices)
      const best = selectBestVoice(allVoices, lang)
      setSelectedVoice(best)
      playerRef.current.setVoice(best)
    })

    const handler = () => {
      const v = window.speechSynthesis.getVoices()
      setVoices(v)
    }
    window.speechSynthesis.addEventListener('voiceschanged', handler)
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', handler)
    }
  }, [lang])

  // ── Stop TTS saat komponen unmount ────────────────────────────────────
  useEffect(() => {
    return () => {
      playerRef.current.stop()
      _clearEpubHighlight()
    }
  }, []) // eslint-disable-line

  // ── Sync player settings ───────────────────────────────────────────────
  useEffect(() => { playerRef.current.setRate(rate)          }, [rate])
  useEffect(() => { playerRef.current.setPitch(pitch)        }, [pitch])
  useEffect(() => { playerRef.current.setVolume(volume)      }, [volume])
  useEffect(() => { playerRef.current.setVoice(selectedVoice) }, [selectedVoice])

  // ── Setup callbacks ke player ──────────────────────────────────────────
  useEffect(() => {
    const player = playerRef.current

    player.onProgress((idx, total) => {
      setChunkIndex(idx)
      setTotalChunks(total)
      const currentText = player._chunks[idx] || ''
      setActiveChunkText(currentText)
    })

    player.onEnd(() => {
      setIsPlaying(false)
      setIsPaused(false)
      setChunkIndex(0)
      setActiveChunkText('')
      _clearEpubHighlight()
    })

    player.onError((err) => {
      setError(typeof err === 'string' ? err : 'Terjadi kesalahan saat membaca.')
      setIsPlaying(false)
      setIsPaused(false)
      setActiveChunkText('')
      _clearEpubHighlight()
    })

    player.onWordBoundary((charIndex, fullText) => {
      _highlightWordInEpub(charIndex, fullText)
    })
  }, []) // eslint-disable-line

  // ── Sync highlight kalimat saat activeChunkText berubah ───────────────
  useEffect(() => {
    if (isTransitioningRef.current) return
    if (activeChunkText) {
      _highlightSentenceInEpub(activeChunkText)
    } else {
      _clearEpubHighlight()
    }
  }, [activeChunkText]) // eslint-disable-line

  // ─────────────────────────────────────────────────────────────────────
  // Highlight helpers
  // ─────────────────────────────────────────────────────────────────────

  const _getEpubDoc = useCallback(() => {
    try {
      const contents = renditionRef?.current?.getContents?.()
      if (contents?.[0]?.document) return contents[0].document
      return viewerRef?.current?.querySelector('iframe')?.contentDocument || null
    } catch {
      return null
    }
  }, [renditionRef, viewerRef])

  const _ensureTTSStyle = useCallback((doc) => {
    if (!doc || doc.getElementById('_tts_style')) return
    const s = doc.createElement('style')
    s.id = '_tts_style'
    s.textContent = `
      .tts-highlight-sentence {
        background: rgba(245, 158, 11, 0.22) !important;
        border-bottom: 2px solid rgba(245, 158, 11, 0.8);
        border-radius: 2px;
        transition: background 0.2s;
      }
      .tts-highlight-word {
        background: rgba(245, 158, 11, 0.60) !important;
        border-radius: 2px;
        padding: 0 1px;
        transition: background 0.1s;
      }
    `
    ;(doc.head || doc.documentElement).appendChild(s)
  }, [])

  const _clearEpubHighlight = useCallback(() => {
    try {
      const doc = _getEpubDoc()
      if (!doc) return
      doc.querySelectorAll('.tts-highlight-sentence, .tts-highlight-word').forEach(el => {
        const p = el.parentNode
        if (p) {
          p.replaceChild(doc.createTextNode(el.textContent || ''), el)
          p.normalize()
        }
      })
    } catch {}
  }, [_getEpubDoc])

  const _highlightSentenceInEpub = useCallback((chunkText) => {
    if (isTransitioningRef.current) return
    if (!chunkText?.trim()) return
    try {
      const doc = _getEpubDoc()
      if (!doc?.body) return

      _ensureTTSStyle(doc)

      doc.querySelectorAll('.tts-highlight-sentence').forEach(el => {
        const p = el.parentNode
        if (p) { p.replaceChild(doc.createTextNode(el.textContent || ''), el); p.normalize() }
      })

      const searchKey = chunkText.slice(0, 30).toLowerCase().replace(/\s+/g, ' ').trim()
      if (!searchKey) return

      const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, null)
      let node = walker.nextNode()

      while (node) {
        const val      = (node.nodeValue || '').replace(/\s+/g, ' ')
        const valLower = val.toLowerCase()
        const matchIdx = valLower.indexOf(searchKey)

        if (matchIdx !== -1) {
          const parent = node.parentNode
          if (!parent || ['SCRIPT', 'STYLE', 'MARK'].includes(parent.tagName)) {
            node = walker.nextNode()
            continue
          }

          const endIdx = Math.min(matchIdx + chunkText.length, val.length)
          const frag   = doc.createDocumentFragment()
          if (matchIdx > 0) frag.appendChild(doc.createTextNode(val.slice(0, matchIdx)))

          const mark = doc.createElement('mark')
          mark.className   = 'tts-highlight-sentence'
          mark.textContent = val.slice(matchIdx, endIdx)
          frag.appendChild(mark)

          if (endIdx < val.length) frag.appendChild(doc.createTextNode(val.slice(endIdx)))

          parent.replaceChild(frag, node)
          try { mark.scrollIntoView({ behavior: 'smooth', block: 'center' }) } catch {}
          break
        }

        node = walker.nextNode()
      }
    } catch (err) {
      console.warn('[useTTS] _highlightSentenceInEpub error:', err.message)
    }
  }, [_getEpubDoc, _ensureTTSStyle])

  const _highlightWordInEpub = useCallback((charIndex, sentenceText) => {
    if (isTransitioningRef.current) return
    if (!sentenceText || charIndex < 0) return
    try {
      const doc = _getEpubDoc()
      if (!doc) return

      doc.querySelectorAll('.tts-highlight-word').forEach(el => {
        const p = el.parentNode
        if (!p) return
        p.replaceChild(doc.createTextNode(el.textContent || ''), el)
        p.normalize()
      })

      const sentenceMark = doc.querySelector('.tts-highlight-sentence')
      if (!sentenceMark) return

      const text = sentenceMark.textContent || ''
      if (charIndex >= text.length) return

      let endIdx = charIndex
      while (endIdx < text.length && !/\s/.test(text[endIdx])) endIdx++

      const word = text.slice(charIndex, endIdx)
      if (!word.trim()) return

      const frag = doc.createDocumentFragment()
      if (charIndex > 0) frag.appendChild(doc.createTextNode(text.slice(0, charIndex)))

      const wordMark = doc.createElement('mark')
      wordMark.className   = 'tts-highlight-word'
      wordMark.textContent = word
      frag.appendChild(wordMark)

      if (endIdx < text.length) frag.appendChild(doc.createTextNode(text.slice(endIdx)))

      sentenceMark.textContent = ''
      sentenceMark.appendChild(frag)
    } catch (err) {
      console.warn('[useTTS] _highlightWordInEpub error:', err.message)
    }
  }, [_getEpubDoc])

  // ─────────────────────────────────────────────────────────────────────
  // Text extraction
  // ─────────────────────────────────────────────────────────────────────

  const _extractCurrentPageText = useCallback(() => {
    try {
      const contents = renditionRef?.current?.getContents?.()
      if (contents?.[0]?.document) return extractTextFromEpubDoc(contents[0].document)
      const iframe = viewerRef?.current?.querySelector('iframe')
      if (iframe?.contentDocument) return extractTextFromEpubDoc(iframe.contentDocument)
    } catch (err) {
      console.warn('[useTTS] Gagal ekstrak teks:', err.message)
    }
    return ''
  }, [renditionRef, viewerRef])

  // ─────────────────────────────────────────────────────────────────────
  // Public actions
  // ─────────────────────────────────────────────────────────────────────

  const handlePlay = useCallback(async () => {
    setError(null)
    setIsLoading(true)
    try {
      const rawText = _extractCurrentPageText()
      if (!rawText.trim()) {
        setError('Tidak ada teks yang bisa dibaca di halaman ini.')
        setIsLoading(false)
        return
      }
      const chunks = prepareTextChunks(rawText)
      if (!chunks.length) {
        setError('Teks tidak dapat diproses.')
        setIsLoading(false)
        return
      }
      playerRef.current.load(chunks)
      setTotalChunks(chunks.length)
      setChunkIndex(0)
      setActiveChunkText('')
      playerRef.current.play()
      setIsPlaying(true)
      setIsPaused(false)
    } catch (err) {
      setError('Gagal memulai pembacaan.')
      console.error('[useTTS] handlePlay error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [_extractCurrentPageText])

  const handlePauseResume = useCallback(() => {
    if (isPausedRef.current) {
      playerRef.current.play()
      setIsPlaying(true)
      setIsPaused(false)
    } else {
      playerRef.current.pause()
      setIsPlaying(false)
      setIsPaused(true)
    }
  }, [])

  const handleStop = useCallback(() => {
    playerRef.current.stop()
    setIsPlaying(false)
    setIsPaused(false)
    setChunkIndex(0)
    setActiveChunkText('')
    _clearEpubHighlight()
  }, [_clearEpubHighlight])

  const handleSkipForward  = useCallback(() => { playerRef.current.skipForward(1)  }, [])
  const handleSkipBackward = useCallback(() => { playerRef.current.skipBackward(1) }, [])

  const handleVoiceChange = useCallback((voice) => {
    setSelectedVoice(voice)
    playerRef.current.setVoice(voice)
    if (isPlayingRef.current || isPausedRef.current) {
      const idx = playerRef.current.currentIndex
      playerRef.current.stop()
      setTimeout(() => {
        playerRef.current.seekToChunk(idx)
        playerRef.current.play()
        setIsPlaying(true)
        setIsPaused(false)
      }, 200)
    }
  }, [])

  /**
   * handlePageChange — dipanggil dari locationChanged di EpubReaderPage.
   *
   * Alur yang BENAR:
   * 1. Set isTransitioningRef=true → blokir highlight DOM write
   * 2. Stop player + clear highlight lama
   * 3. Tunggu rendition.once('rendered') secara langsung dari sini
   *    — bukan lewat callback dari EpubReaderPage (rentan stale closure)
   * 4. Setelah rendered → tunggu microtask → extract teks → play
   * 5. Unlock isTransitioningRef
   *
   * Kenapa tidak pakai notifyRendered dari luar:
   * — ttsNotifyRendered di rendered handler EpubReaderPage adalah stale closure
   *   (nilai dari saat useEffect([book]) pertama jalan, sebelum useTTS mount)
   * — Lebih simpel dan reliable: hook sendiri yang listen rendered event.
   */
  const handlePageChange = useCallback(() => {
    if (!isPlayingRef.current && !isPausedRef.current) return

    // 1. Kunci semua DOM write TTS
    isTransitioningRef.current = true

    // 2. Stop + bersihkan highlight halaman lama
    playerRef.current.stop()
    setIsPlaying(false)
    setIsPaused(false)
    setChunkIndex(0)
    setActiveChunkText('')
    _clearEpubHighlight()

    const rendition = renditionRef?.current
    if (!rendition) {
      isTransitioningRef.current = false
      return
    }

    // 3. Listen rendered event LANGSUNG dari sini — tidak lewat EpubReaderPage
    //    rendered hanya fire 1x setelah halaman baru selesai dirender epub.js.
    //    Fallback timeout 3s agar tidak hang kalau epub.js gagal render.
    const fallbackTimer = setTimeout(() => {
      console.warn('[useTTS] handlePageChange: fallback 3s, unlock transisi')
      isTransitioningRef.current = false
    }, 3000)

    const onRendered = () => {
      clearTimeout(fallbackTimer)

      // Mikrotask: pastikan DOM sudah benar-benar settled
      // sebelum inject highlight / extract teks
      Promise.resolve().then(async () => {
        try {
          const rawText = _extractCurrentPageText()
          if (!rawText?.trim()) {
            console.warn('[useTTS] handlePageChange: halaman baru tidak ada teks')
            return
          }
          const chunks = prepareTextChunks(rawText)
          if (!chunks.length) return

          playerRef.current.load(chunks)
          setTotalChunks(chunks.length)
          setChunkIndex(0)
          setActiveChunkText('')
          playerRef.current.play()
          setIsPlaying(true)
          setIsPaused(false)
        } catch (err) {
          console.warn('[useTTS] handlePageChange auto-play error:', err.message)
        } finally {
          isTransitioningRef.current = false
        }
      })
    }

    // epub.js: rendition.once() — fire sekali saat halaman baru selesai dirender
    try {
      rendition.once('rendered', onRendered)
    } catch {
      // Fallback kalau once() tidak tersedia
      setTimeout(onRendered, 800)
    }
  }, [_extractCurrentPageText, _clearEpubHighlight, renditionRef])

  // ── Derived ────────────────────────────────────────────────────────────
  const progressPercent = totalChunks > 0
    ? Math.round((chunkIndex / totalChunks) * 100)
    : 0

  const isActive = isPlaying || isPaused

  return {
    isSupported,
    isPlaying,
    isPaused,
    isLoading,
    isActive,
    error,
    chunkIndex,
    totalChunks,
    progressPercent,
    activeChunkText,
    voices,
    selectedVoice,
    rate,
    pitch,
    volume,
    setRate:   setRateState,
    setPitch:  setPitchState,
    setVolume: setVolumeState,
    handlePlay,
    handlePauseResume,
    handleStop,
    handleSkipForward,
    handleSkipBackward,
    handleVoiceChange,
    handlePageChange,
  }
}
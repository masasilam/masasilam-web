export const isTTSSupported = () =>
  typeof window !== 'undefined' && 'speechSynthesis' in window

export const getAvailableVoices = (langFilter = null) => {
  if (!isTTSSupported()) return []
  const voices = window.speechSynthesis.getVoices()
  if (!langFilter) return voices
  const filtered = voices.filter(v => v.lang.toLowerCase().startsWith(langFilter.toLowerCase()))
  return filtered.length > 0 ? filtered : voices
}

export const waitForVoices = () => {
  return new Promise((resolve) => {
    if (!isTTSSupported()) { resolve([]); return }
    const voices = window.speechSynthesis.getVoices()
    if (voices.length > 0) { resolve(voices); return }
    const handler = () => {
      resolve(window.speechSynthesis.getVoices())
      window.speechSynthesis.removeEventListener('voiceschanged', handler)
    }
    window.speechSynthesis.addEventListener('voiceschanged', handler)
    setTimeout(() => {
      resolve(window.speechSynthesis.getVoices())
      window.speechSynthesis.removeEventListener('voiceschanged', handler)
    }, 3000)
  })
}

export const selectBestVoice = (voices, lang = 'id-ID') => {
  if (!voices.length) return null
  const langPrefix = lang.split('-')[0].toLowerCase()

  const exactLocal   = voices.find(v => v.lang === lang && v.localService)
  if (exactLocal)   return exactLocal
  const exactRemote  = voices.find(v => v.lang === lang)
  if (exactRemote)  return exactRemote
  const prefixLocal  = voices.find(v => v.lang.toLowerCase().startsWith(langPrefix) && v.localService)
  if (prefixLocal)  return prefixLocal
  const prefixRemote = voices.find(v => v.lang.toLowerCase().startsWith(langPrefix))
  if (prefixRemote) return prefixRemote
  return voices.find(v => v.default) || voices[0] || null
}

export const prepareTextChunks = (raw, maxChunkLength = 200) => {
  if (!raw) return []

  let text = raw.replace(/<[^>]*>/g, ' ')
  text = text
    .replace(/&amp;/g,  '&')
    .replace(/&lt;/g,   '<')
    .replace(/&gt;/g,   '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g,  "'")
  text = text.replace(/\s+/g, ' ').trim()
  text = text.replace(/[^\x20-\x7E\u00A0-\uFFFF]/g, '')

  if (!text) return []

  const sentences = text.match(/[^.!?]+[.!?]*/g) || [text]

  const chunks = []
  let current  = ''

  sentences.forEach(sentence => {
    const trimmed = sentence.trim()
    if (!trimmed) return

    if ((current + ' ' + trimmed).length <= maxChunkLength) {
      current = current ? current + ' ' + trimmed : trimmed
    } else {
      if (current) chunks.push(current.trim())
      if (trimmed.length > maxChunkLength) {
        const words = trimmed.split(' ')
        let wordChunk = ''
        words.forEach(word => {
          if ((wordChunk + ' ' + word).length <= maxChunkLength) {
            wordChunk = wordChunk ? wordChunk + ' ' + word : word
          } else {
            if (wordChunk) chunks.push(wordChunk)
            wordChunk = word
          }
        })
        current = wordChunk
      } else {
        current = trimmed
      }
    }
  })

  if (current) chunks.push(current.trim())
  return chunks.filter(Boolean)
}

export const extractTextFromEpubDoc = (iframeDoc) => {
  if (!iframeDoc?.body) return ''

  const clone = iframeDoc.body.cloneNode(true)

  const skipSelectors = [
    'script', 'style', 'noscript', 'nav', 'aside',
    '.footnote', '.endnote', '[epub\\:type="footnote"]',
    '[epub\\:type="endnote"]', '[role="doc-footnote"]',
    'figure > figcaption',
  ]
  skipSelectors.forEach(sel => {
    try { clone.querySelectorAll(sel).forEach(el => el.remove()) } catch {}
  })

  return clone.innerText || clone.textContent || ''
}

export class TTSPlayer {
  constructor() {
    this._chunks        = []
    this._currentIndex  = 0
    this._isPlaying     = false
    this._isPaused      = false
    this._voice         = null
    this._rate          = 1.0
    this._pitch         = 1.0
    this._volume        = 1.0
    this._utterance     = null
    this._onProgress    = null
    this._onEnd         = null
    this._onError       = null
    this._onWordBoundary = null
    this._cancelledRef  = { v: false }
    this._isMobile      = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator?.userAgent || '')
  }

  setVoice(voice)  { this._voice  = voice }
  setRate(rate)    { this._rate   = Math.min(Math.max(rate,  0.1), 10) }
  setPitch(pitch)  { this._pitch  = Math.min(Math.max(pitch, 0),   2) }
  setVolume(vol)   { this._volume = Math.min(Math.max(vol,   0),   1) }

  onProgress(cb)     { this._onProgress    = cb }
  onEnd(cb)          { this._onEnd         = cb }
  onError(cb)        { this._onError       = cb }
  onWordBoundary(cb) { this._onWordBoundary = cb }

  get isPlaying()  { return this._isPlaying  }
  get isPaused()   { return this._isPaused   }
  get isStopped()  { return !this._isPlaying && !this._isPaused }
  get currentIndex() { return this._currentIndex }
  get totalChunks()  { return this._chunks.length }

  get progressPercent() {
    if (!this._chunks.length) return 0
    return Math.round((this._currentIndex / this._chunks.length) * 100)
  }

  load(chunks) {
    this.stop()
    this._chunks       = chunks
    this._currentIndex = 0
  }

  play() {
    if (!isTTSSupported()) {
      this._onError?.('Browser tidak mendukung Text-to-Speech.')
      return
    }
    if (this._isPlaying) return

    if (this._isPaused && window.speechSynthesis.paused) {
      window.speechSynthesis.resume()
      this._isPlaying = true
      this._isPaused  = false
      return
    }

    this._isPlaying     = true
    this._isPaused      = false
    this._cancelledRef  = { v: false }
    this._speakChunk(this._currentIndex)
  }

  pause() {
    if (!this._isPlaying) return
    this._isPlaying = false
    this._isPaused  = true
    try { window.speechSynthesis.pause() } catch {}
    try { window.speechSynthesis.cancel() } catch {}
  }

  stop() {
    this._isPlaying    = false
    this._isPaused     = false
    this._currentIndex = 0
    this._cancelledRef = { v: true }
    this._utterance    = null
    try { window.speechSynthesis.cancel() } catch {}
  }

  seekToChunk(index) {
    const wasPlaying = this._isPlaying
    this.pause()
    this._currentIndex = Math.min(Math.max(index, 0), this._chunks.length - 1)
    this._isPaused     = false
    if (wasPlaying) {
      setTimeout(() => this.play(), this._isMobile ? 300 : 100)
    }
  }

  skipForward(n = 1) { this.seekToChunk(this._currentIndex + n) }

  skipBackward(n = 1) { this.seekToChunk(Math.max(this._currentIndex - n, 0)) }

  _speakChunk(index) {
    const ref = this._cancelledRef
    if (ref.v || index >= this._chunks.length) {
      if (!ref.v) {
        this._isPlaying    = false
        this._isPaused     = false
        this._currentIndex = 0
        this._onEnd?.()
      }
      return
    }

    const resumeHack = this._isMobile ? setInterval(() => {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause()
        window.speechSynthesis.resume()
      }
    }, 10000) : null

    const text = this._chunks[index]
    const utt  = new SpeechSynthesisUtterance(text)

    utt.voice  = this._voice
    utt.rate   = this._rate
    utt.pitch  = this._pitch
    utt.volume = this._volume

    utt.onboundary = (e) => {
      if (e.name === 'word') {
        this._onWordBoundary?.(e.charIndex, text)
      }
    }

    utt.onend = () => {
      if (resumeHack) clearInterval(resumeHack)
      if (ref.v) return
      this._currentIndex = index + 1
      this._onProgress?.(this._currentIndex, this._chunks.length)
      setTimeout(() => this._speakChunk(this._currentIndex), this._isMobile ? 50 : 0)
    }

    utt.onerror = (e) => {
      if (resumeHack) clearInterval(resumeHack)
      if (['interrupted', 'canceled', 'cancelled'].includes(e.error)) return
      console.warn('[TTS] utterance error:', e.error)
      this._onError?.(e.error)
      if (!ref.v) {
        this._currentIndex = index + 1
        setTimeout(() => this._speakChunk(this._currentIndex), 200)
      }
    }

    this._utterance = utt
    this._onProgress?.(index, this._chunks.length)

    try {
      window.speechSynthesis.cancel()
      setTimeout(() => {
        if (!ref.v) window.speechSynthesis.speak(utt)
      }, this._isMobile ? 100 : 0)
    } catch (err) {
      console.error('[TTS] speak failed:', err)
      this._onError?.(err.message)
    }
  }
}

export const ttsPlayer = new TTSPlayer()
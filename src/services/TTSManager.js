/**
 * Text-to-Speech Manager
 * Handles chunked reading for long content to avoid Chrome's character limit
 */
class TTSManager {
  constructor() {
    this.synth = window.speechSynthesis
    this.utterances = []
    this.currentUtteranceIndex = 0
    this.isPlaying = false
    this.isPaused = false
    this.isEnabled = false
    this.currentCharIndex = 0
    this.totalChars = 0
    this.htmlContent = ''
    this.textContent = ''
    this.chunks = []
    this.isStopping = false
    
    // Settings
    this.rate = 1.0
    this.pitch = 1.0
    this.voiceIndex = 0
    this.availableVoices = []
    
    // Callbacks
    this.onStateChange = null
    this.onProgressChange = null
    this.onError = null
    
    // Chrome has ~4000 char limit, we use 3000 to be safe
    this.MAX_CHUNK_SIZE = 3000
    
    this.initVoices()
  }

  initVoices() {
    const loadVoices = () => {
      this.availableVoices = this.synth.getVoices()
      
      // Prioritize Indonesian voices
      const indonesianVoices = this.availableVoices.filter(v => 
        v.lang.startsWith('id') || v.lang.startsWith('ms')
      )
      
      if (indonesianVoices.length > 0) {
        this.availableVoices = [
          ...indonesianVoices,
          ...this.availableVoices.filter(v => 
            !v.lang.startsWith('id') && !v.lang.startsWith('ms')
          )
        ]
      }
    }

    loadVoices()
    
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices
    }
  }

  /**
   * Extract text from HTML and split into chunks
   */
  extractAndChunkText(htmlContent) {
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = htmlContent
    
    // Remove script and style tags
    const scripts = tempDiv.querySelectorAll('script, style')
    scripts.forEach(el => el.remove())
    
    const text = tempDiv.textContent || tempDiv.innerText || ''
    const cleanText = text.replace(/\s+/g, ' ').trim()
    
    // Split into chunks
    const chunks = []
    let currentChunk = ''
    
    // Split by sentences first
    const sentences = cleanText.match(/[^.!?]+[.!?]+/g) || [cleanText]
    
    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > this.MAX_CHUNK_SIZE) {
        if (currentChunk) {
          chunks.push(currentChunk.trim())
          currentChunk = ''
        }
        
        // If single sentence is too long, split by words
        if (sentence.length > this.MAX_CHUNK_SIZE) {
          const words = sentence.split(' ')
          let wordChunk = ''
          
          for (const word of words) {
            if ((wordChunk + ' ' + word).length > this.MAX_CHUNK_SIZE) {
              if (wordChunk) chunks.push(wordChunk.trim())
              wordChunk = word
            } else {
              wordChunk += (wordChunk ? ' ' : '') + word
            }
          }
          
          if (wordChunk) currentChunk = wordChunk
        } else {
          currentChunk = sentence
        }
      } else {
        currentChunk += (currentChunk ? ' ' : '') + sentence
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk.trim())
    }
    
    return { text: cleanText, chunks }
  }

  /**
   * Start TTS
   */
  start(htmlContent) {
    if (!htmlContent) {
      console.warn('No content provided for TTS')
      return
    }

    // Cancel any existing speech first
    if (this.synth.speaking) {
      this.synth.cancel()
    }
    
    // Reset flags
    this.isStopping = false
    this.isPlaying = false
    this.isPaused = false
    
    this.htmlContent = htmlContent
    const { text, chunks } = this.extractAndChunkText(htmlContent)
    
    this.textContent = text
    this.chunks = chunks
    this.totalChars = text.length
    this.currentCharIndex = 0
    this.currentUtteranceIndex = 0
    this.utterances = []
    
    console.log(`TTS: Starting playback of ${chunks.length} chunks (${this.totalChars} chars)`)
    
    // SET STATE FIRST
    this.isPlaying = true
    this.isPaused = false
    this.isEnabled = true
    
    console.log('TTS: State set:', {
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      isEnabled: this.isEnabled,
      isStopping: this.isStopping
    })
    
    // Force load voices if not loaded
    if (this.availableVoices.length === 0) {
      this.availableVoices = this.synth.getVoices()
    }
    
    // Create utterances for each chunk
    for (let i = 0; i < chunks.length; i++) {
      const utterance = new SpeechSynthesisUtterance(chunks[i])
      utterance.rate = this.rate
      utterance.pitch = this.pitch
      
      if (this.availableVoices.length > 0) {
        utterance.voice = this.availableVoices[this.voiceIndex] || this.availableVoices[0]
      }
      
      // Track progress
      utterance.onboundary = (event) => {
        if (event.name === 'word' && !this.isStopping) {
          const chunkStart = this.getChunkStartPosition(i)
          this.currentCharIndex = chunkStart + event.charIndex
          
          if (this.onProgressChange) {
            this.onProgressChange(this.currentCharIndex, this.totalChars)
          }
        }
      }
      
      utterance.onend = () => {
        if (this.isStopping) return
        
        console.log(`TTS: Chunk ${i + 1}/${chunks.length} completed`)
        
        // Move to next chunk
        if (i < chunks.length - 1) {
          this.currentUtteranceIndex = i + 1
          this.playCurrentChunk()
        } else {
          // All chunks completed
          this.stop()
          console.log('TTS: Playback completed')
        }
      }
      
      utterance.onerror = (event) => {
        // Ignore interrupted errors when stopping intentionally
        if (this.isStopping && event.error === 'interrupted') {
          return
        }
        
        // Ignore interrupted errors during chunk transitions
        if (event.error === 'interrupted') {
          console.log(`TTS: Chunk ${i + 1} interrupted (normal during transitions)`)
          return
        }
        
        // Log other errors
        console.error(`TTS: Error in chunk ${i + 1}:`, event)
        
        if (this.onError) {
          this.onError(event)
        }
        
        // Try to continue to next chunk on non-critical errors
        if (i < chunks.length - 1 && !this.isStopping) {
          setTimeout(() => {
            this.currentUtteranceIndex = i + 1
            this.playCurrentChunk()
          }, 100)
        } else {
          this.stop()
        }
      }
      
      this.utterances.push(utterance)
    }
    
    // EMIT STATE CHANGE
    this.emitStateChange()
    
    // PLAY immediately
    this.playCurrentChunk()
  }

  /**
   * Get character position where chunk starts
   */
  getChunkStartPosition(chunkIndex) {
    let position = 0
    for (let i = 0; i < chunkIndex; i++) {
      position += this.chunks[i].length + 1
    }
    return position
  }

  /**
   * Play current chunk - FIXED VERSION
   */
  playCurrentChunk() {
    if (this.isStopping) {
      console.log('TTS: Stopping, skip playback')
      return
    }
    
    if (this.currentUtteranceIndex >= this.utterances.length) {
      console.log('TTS: No more chunks')
      return
    }
    
    const utterance = this.utterances[this.currentUtteranceIndex]
    
    console.log('TTS: Playing chunk', {
      index: this.currentUtteranceIndex + 1,
      total: this.utterances.length,
      text: utterance.text.substring(0, 50) + '...',
      voice: utterance.voice?.name || 'default',
      isPlaying: this.isPlaying,
      isStopping: this.isStopping
    })
    
    // ✅ LANGSUNG SPEAK - tidak pakai cancel, tidak pakai setTimeout
    this.synth.speak(utterance)
    
    console.log('TTS: synth.speak() called')
  }

  /**
   * Pause TTS
   */
  pause() {
    if (!this.isPlaying || this.isPaused) return
    
    this.synth.pause()
    this.isPaused = true
    this.isPlaying = false
    this.emitStateChange()
  }

  /**
   * Resume TTS
   */
  resume() {
    if (!this.isPaused) return
    
    this.isStopping = false
    this.synth.resume()
    this.isPaused = false
    this.isPlaying = true
    this.emitStateChange()
  }

  /**
   * Stop TTS
   */
  stop() {
    // Guard: Don't emit if already stopped
    if (!this.isPlaying && !this.isPaused && !this.isEnabled) {
      return
    }
    
    this.isStopping = true
    this.synth.cancel()
    
    this.isPlaying = false
    this.isPaused = false
    this.isEnabled = false
    this.currentCharIndex = 0
    this.currentUtteranceIndex = 0
    this.utterances = []
    this.chunks = []
    
    this.emitStateChange()
    
    setTimeout(() => {
      this.isStopping = false
    }, 200)
  }

  /**
   * Toggle play/pause
   */
  toggle() {
    if (this.isPlaying) {
      this.pause()
      return true
    } else if (this.isPaused) {
      this.resume()
      return true
    }
    return false
  }

  /**
   * Update settings without restarting
   */
  updateSettings({ rate, pitch, voiceIndex }) {
    if (rate !== undefined) this.rate = rate
    if (pitch !== undefined) this.pitch = pitch
    if (voiceIndex !== undefined) this.voiceIndex = voiceIndex
  }

  /**
   * Apply settings (restart if playing)
   */
  applySettings({ rate, pitch, voiceIndex }) {
    this.updateSettings({ rate, pitch, voiceIndex })
    
    if (this.isPlaying || this.isPaused) {
      const wasPlaying = this.isPlaying
      this.start(this.htmlContent)
      
      if (!wasPlaying) {
        this.pause()
      }
    }
  }

  /**
   * Get progress percentage
   */
  getProgress() {
    if (this.totalChars === 0) return 0
    return Math.round((this.currentCharIndex / this.totalChars) * 100)
  }

  /**
   * Emit state change
   */
  emitStateChange() {
    if (this.onStateChange) {
      this.onStateChange({
        isPlaying: this.isPlaying,
        isPaused: this.isPaused,
        isEnabled: this.isEnabled,
        currentCharIndex: this.currentCharIndex
      })
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    this.stop()
    this.onStateChange = null
    this.onProgressChange = null
    this.onError = null
  }
}

export default TTSManager
// src/services/TTSManager.js
/**
 * Text-to-Speech Manager
 * Handles chunked reading for long content with mobile support
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
    
    // Settings
    this.rate = 1.0
    this.pitch = 1.0
    this.voiceIndex = 0
    this.availableVoices = []
    
    // Callbacks
    this.onStateChange = null
    this.onProgressChange = null
    this.onError = null
    
    // Mobile detection
    this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    this.isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)
    
    // Chrome has ~4000 char limit, mobile even lower
    this.MAX_CHUNK_SIZE = this.isMobile ? 2000 : 3000
    
    // Track speaking state
    this.currentUtterance = null
    this.isInitialized = false
    
    this.initVoices()
    this.setupVisibilityListener()
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
      
      if (this.availableVoices.length > 0) {
        this.isInitialized = true
      }
    }

    loadVoices()
    
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices
    }
    
    // Force load voices on mobile
    if (this.isMobile) {
      setTimeout(loadVoices, 100)
    }
  }

  /**
   * Setup visibility change listener to handle background/foreground
   */
  setupVisibilityListener() {
    if (this.isMobile) {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          // Page is hidden, pause but don't stop
          if (this.isPlaying) {
            this.synth.pause()
          }
        } else {
          // Page is visible again, resume if was playing
          if (this.isPlaying && this.isPaused) {
            this.synth.resume()
          }
        }
      })
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
   * Start TTS - Mobile optimized
   */
  start(htmlContent) {
    if (!htmlContent) {
      console.warn('No content provided for TTS')
      return
    }

    // Wait for voices to be loaded (critical for mobile)
    if (!this.isInitialized || this.availableVoices.length === 0) {
      console.warn('Voices not loaded yet, waiting...')
      setTimeout(() => this.start(htmlContent), 200)
      return
    }

    this.stop() // Stop any existing playback
    
    this.htmlContent = htmlContent
    const { text, chunks } = this.extractAndChunkText(htmlContent)
    
    this.textContent = text
    this.chunks = chunks
    this.totalChars = text.length
    this.currentCharIndex = 0
    this.currentUtteranceIndex = 0
    this.utterances = []
    
    console.log(`TTS: Starting playback of ${chunks.length} chunks (${this.totalChars} chars)`)
    
    // Create utterances for each chunk
    for (let i = 0; i < chunks.length; i++) {
      const utterance = new SpeechSynthesisUtterance(chunks[i])
      utterance.rate = this.rate
      utterance.pitch = this.pitch
      
      // Set voice (critical for mobile)
      if (this.availableVoices.length > 0) {
        const selectedVoice = this.availableVoices[this.voiceIndex] || this.availableVoices[0]
        utterance.voice = selectedVoice
        utterance.lang = selectedVoice.lang
      }
      
      // Track progress
      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          const chunkStart = this.getChunkStartPosition(i)
          this.currentCharIndex = chunkStart + event.charIndex
          
          if (this.onProgressChange) {
            this.onProgressChange(this.currentCharIndex, this.totalChars)
          }
        }
      }
      
      utterance.onstart = () => {
        console.log(`TTS: Chunk ${i + 1}/${chunks.length} started`)
        this.isPlaying = true
        this.isPaused = false
        this.emitStateChange()
      }
      
      utterance.onend = () => {
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
        console.error(`TTS: Error in chunk ${i + 1}:`, event.error)
        
        // iOS specific: "interrupted" error is normal when starting new speech
        if (event.error === 'interrupted' && this.isIOS) {
          console.log('TTS: iOS interruption (expected behavior)')
          return
        }
        
        if (this.onError) {
          this.onError(event)
        }
        
        // Try to continue to next chunk
        if (i < chunks.length - 1) {
          this.currentUtteranceIndex = i + 1
          setTimeout(() => this.playCurrentChunk(), 100)
        } else {
          this.stop()
        }
      }
      
      this.utterances.push(utterance)
    }
    
    this.isPlaying = true
    this.isPaused = false
    this.isEnabled = true
    
    this.emitStateChange()
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
   * Play current chunk - Mobile optimized
   */
  playCurrentChunk() {
    if (this.currentUtteranceIndex >= this.utterances.length) {
      return
    }
    
    const utterance = this.utterances[this.currentUtteranceIndex]
    this.currentUtterance = utterance
    
    // CRITICAL FIX for mobile: Don't cancel if already speaking
    // Just queue the new utterance
    if (this.isMobile) {
      // On mobile, especially iOS, we need to be more careful
      if (this.isIOS) {
        // iOS: Cancel only if nothing is speaking
        if (!this.synth.speaking) {
          this.synth.cancel()
        }
      } else {
        // Android: Can cancel, but with delay
        this.synth.cancel()
      }
      
      // Longer delay for mobile
      setTimeout(() => {
        this.synth.speak(utterance)
        console.log(`TTS: Playing chunk ${this.currentUtteranceIndex + 1}/${this.utterances.length}`)
      }, this.isIOS ? 100 : 50)
    } else {
      // Desktop: Cancel and speak
      this.synth.cancel()
      setTimeout(() => {
        this.synth.speak(utterance)
        console.log(`TTS: Playing chunk ${this.currentUtteranceIndex + 1}/${this.utterances.length}`)
      }, 50)
    }
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
    
    // Mobile fix: Resume might not work, need to restart current chunk
    if (this.isMobile && !this.synth.speaking) {
      console.log('TTS: Resume failed on mobile, restarting chunk')
      this.playCurrentChunk()
    } else {
      this.synth.resume()
    }
    
    this.isPaused = false
    this.isPlaying = true
    this.emitStateChange()
  }

  /**
   * Stop TTS
   */
  stop() {
    this.synth.cancel()
    this.isPlaying = false
    this.isPaused = false
    this.isEnabled = false
    this.currentCharIndex = 0
    this.currentUtteranceIndex = 0
    this.utterances = []
    this.chunks = []
    this.currentUtterance = null
    this.emitStateChange()
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
      const currentProgress = this.currentCharIndex
      
      // Restart from current position
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
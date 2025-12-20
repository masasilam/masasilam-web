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
    this.isInitialized = false
    
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
      const voices = this.synth.getVoices()
      if (voices.length > 0) {
        this.availableVoices = voices
        
        // Prioritize Indonesian voices
        const indonesianVoices = voices.filter(v => 
          v.lang.startsWith('id') || v.lang.startsWith('ms')
        )
        
        if (indonesianVoices.length > 0) {
          this.availableVoices = [
            ...indonesianVoices,
            ...voices.filter(v => 
              !v.lang.startsWith('id') && !v.lang.startsWith('ms')
            )
          ]
        }
        
        this.isInitialized = true
        console.log('✅ TTS: Voices loaded:', this.availableVoices.length)
      }
    }

    loadVoices()
    
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices
    }
    
    // Force load after delay if not loaded
    setTimeout(() => {
      if (this.availableVoices.length === 0) {
        loadVoices()
      }
    }, 100)
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
   * Start TTS - FIXED VERSION
   */
  start(htmlContent) {
    if (!htmlContent) {
      console.warn('❌ TTS: No content provided')
      return
    }

    console.log('🎬 TTS: Starting playback...')
    
    // CRITICAL: Cancel any existing speech FIRST
    this.synth.cancel()
    
    // Wait for cancel to complete before starting new playback
    setTimeout(() => {
      this._startPlayback(htmlContent)
    }, 100)
  }

  /**
   * Internal method to start playback after cleanup
   */
  _startPlayback(htmlContent) {
    // Reset all flags
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
    
    console.log(`📝 TTS: Processing ${chunks.length} chunks (${this.totalChars} chars)`)
    
    // Ensure voices are loaded
    if (this.availableVoices.length === 0) {
      this.availableVoices = this.synth.getVoices()
      console.log('🔄 TTS: Force loaded voices:', this.availableVoices.length)
    }
    
    // Create utterances for each chunk
    for (let i = 0; i < chunks.length; i++) {
      const utterance = new SpeechSynthesisUtterance(chunks[i])
      utterance.rate = this.rate
      utterance.pitch = this.pitch
      
      // Set voice if available
      if (this.availableVoices.length > 0) {
        const selectedVoice = this.availableVoices[this.voiceIndex] || this.availableVoices[0]
        utterance.voice = selectedVoice
        console.log(`🎤 TTS: Using voice: ${selectedVoice.name} (${selectedVoice.lang})`)
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
      
      // Chunk completion handler
      utterance.onend = () => {
        if (this.isStopping) {
          console.log('⏹️ TTS: Stopping, skip transition')
          return
        }
        
        console.log(`✅ TTS: Chunk ${i + 1}/${chunks.length} completed`)
        
        // Move to next chunk
        if (i < chunks.length - 1) {
          this.currentUtteranceIndex = i + 1
          
          // CRITICAL: Add delay between chunks to prevent race conditions
          setTimeout(() => {
            if (!this.isStopping) {
              this.playCurrentChunk()
            }
          }, 50)
        } else {
          // All chunks completed
          console.log('🎉 TTS: All chunks completed')
          this.stop()
        }
      }
      
      // Error handler
      utterance.onerror = (event) => {
        // Ignore interrupted errors when stopping intentionally
        if (this.isStopping && event.error === 'interrupted') {
          console.log('⚠️ TTS: Interrupted (intentional)')
          return
        }
        
        // Ignore interrupted errors during chunk transitions
        if (event.error === 'interrupted') {
          console.log('⚠️ TTS: Interrupted (transition)')
          return
        }
        
        // Log other errors
        console.error(`❌ TTS: Error in chunk ${i + 1}:`, event.error)
        
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
    
    // Set state BEFORE playing
    this.isPlaying = true
    this.isPaused = false
    this.isEnabled = true
    
    console.log('📊 TTS: State set:', {
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      isEnabled: this.isEnabled
    })
    
    // Emit state change
    this.emitStateChange()
    
    // Start playing immediately
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
      console.log('⏹️ TTS: Stopping flag set, skip playback')
      return
    }
    
    if (this.currentUtteranceIndex >= this.utterances.length) {
      console.log('⚠️ TTS: No more chunks to play')
      return
    }
    
    const utterance = this.utterances[this.currentUtteranceIndex]
    
    console.log('▶️ TTS: Playing chunk', {
      index: this.currentUtteranceIndex + 1,
      total: this.utterances.length,
      preview: utterance.text.substring(0, 50) + '...',
      voice: utterance.voice?.name || 'default'
    })
    
    // CRITICAL: Direct speak without any cancel or delays
    try {
      this.synth.speak(utterance)
      console.log('✅ TTS: synth.speak() called successfully')
    } catch (error) {
      console.error('❌ TTS: Error calling speak():', error)
    }
  }

  /**
   * Pause TTS
   */
  pause() {
    if (!this.isPlaying || this.isPaused) {
      console.log('⚠️ TTS: Cannot pause - not playing or already paused')
      return
    }
    
    console.log('⏸️ TTS: Pausing...')
    this.synth.pause()
    this.isPaused = true
    this.isPlaying = false
    this.emitStateChange()
  }

  /**
   * Resume TTS
   */
  resume() {
    if (!this.isPaused) {
      console.log('⚠️ TTS: Cannot resume - not paused')
      return
    }
    
    console.log('▶️ TTS: Resuming...')
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
      console.log('⚠️ TTS: Already stopped')
      return
    }
    
    console.log('⏹️ TTS: Stopping...')
    
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
      console.log('✅ TTS: Stop complete')
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
    console.log('⚙️ TTS: Settings updated:', { rate: this.rate, pitch: this.pitch, voiceIndex: this.voiceIndex })
  }

  /**
   * Apply settings (restart if playing)
   */
  applySettings({ rate, pitch, voiceIndex }) {
    this.updateSettings({ rate, pitch, voiceIndex })
    
    if (this.isPlaying || this.isPaused) {
      console.log('🔄 TTS: Restarting with new settings...')
      const wasPlaying = this.isPlaying
      this.start(this.htmlContent)
      
      if (!wasPlaying) {
        setTimeout(() => this.pause(), 100)
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
    console.log('🗑️ TTS: Destroying manager...')
    this.stop()
    this.onStateChange = null
    this.onProgressChange = null
    this.onError = null
  }
}

export default TTSManager
// src/services/TTSManager.js
/**
 * Text-to-Speech Manager
 * Handles chunked reading for long content to avoid Chrome's character limit
 * Fixed for mobile autoplay policy compliance
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
   * Ensure audio context is ready (for mobile autoplay policy)
   */
  async ensureAudioContextReady() {
    try {
      // Resume if paused (critical for mobile)
      if (this.synth.paused) {
        this.synth.resume()
      }
      // Wait a bit for the context to be ready
      await new Promise(resolve => setTimeout(resolve, 100))
      return true
    } catch (error) {
      console.warn('Audio context not ready:', error)
      return false
    }
  }

  /**
   * Start TTS
   */
  async start(htmlContent) {
    if (!htmlContent) {
      console.warn('No content provided for TTS')
      return
    }

    // Ensure audio context is ready (critical for mobile)
    await this.ensureAudioContextReady()

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
      
      if (this.availableVoices.length > 0) {
        utterance.voice = this.availableVoices[this.voiceIndex] || this.availableVoices[0]
      }
      
      // Track progress
      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          // Calculate approximate character position
          const chunkStart = this.getChunkStartPosition(i)
          this.currentCharIndex = chunkStart + event.charIndex
          
          if (this.onProgressChange) {
            this.onProgressChange(this.currentCharIndex, this.totalChars)
          }
        }
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
        console.error(`TTS: Error in chunk ${i + 1}:`, event)
        
        if (this.onError) {
          this.onError(event)
        }
        
        // Try to continue to next chunk
        if (i < chunks.length - 1) {
          this.currentUtteranceIndex = i + 1
          this.playCurrentChunk()
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
      position += this.chunks[i].length + 1 // +1 for space between chunks
    }
    return position
  }

  /**
   * Play current chunk
   */
  playCurrentChunk() {
    if (this.currentUtteranceIndex >= this.utterances.length) {
      return
    }
    
    const utterance = this.utterances[this.currentUtteranceIndex]
    
    // Cancel any existing speech
    this.synth.cancel()
    
    // Small delay to ensure cancel completes
    setTimeout(() => {
      this.synth.speak(utterance)
      console.log(`TTS: Playing chunk ${this.currentUtteranceIndex + 1}/${this.utterances.length}`)
    }, 50)
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
    
    this.synth.resume()
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
   * Resume audio context (for mobile autoplay policy)
   */
  async resumeAudioContext() {
    try {
      if (this.synth.paused) {
        await this.synth.resume()
      }
      return true
    } catch (error) {
      console.error('Failed to resume audio context:', error)
      return false
    }
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
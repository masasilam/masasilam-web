/**
 * Text-to-Speech Manager - MOBILE COMPATIBLE VERSION
 * Handles chunked reading with mobile browser quirks fixed
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
    this.isMobile = this.detectMobile()
    this.resumeInfinityWorkaround = null

    // Settings
    this.rate = 1.0
    this.pitch = 1.0
    this.voiceIndex = 0
    this.availableVoices = []

    // Callbacks
    this.onStateChange = null
    this.onProgressChange = null
    this.onError = null

    // ✅ Mobile has stricter limits - use smaller chunks
    this.MAX_CHUNK_SIZE = this.isMobile ? 500 : 3000

    console.log('🎯 TTS: Device type:', this.isMobile ? 'Mobile' : 'Desktop')
    console.log('📏 TTS: Chunk size:', this.MAX_CHUNK_SIZE)

    this.initVoices()
    this.setupMobileWorkarounds()
  }

  detectMobile() {
    const ua = navigator.userAgent
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua)
  }

  setupMobileWorkarounds() {
    // ✅ iOS Safari requires resume workaround
    if (/iphone|ipad|ipod/i.test(navigator.userAgent)) {
      console.log('📱 TTS: iOS detected - applying workarounds')

      // iOS pauses speech after ~15 seconds of inactivity
      this.resumeInfinityWorkaround = setInterval(() => {
        if (this.isPlaying && !this.isPaused) {
          // Touch the synth to keep it alive
          this.synth.pause()
          this.synth.resume()
        }
      }, 14000)
    }

    // ✅ Android Chrome workaround - cancel and restart helps
    if (/android/i.test(navigator.userAgent)) {
      console.log('🤖 TTS: Android detected - applying workarounds')
    }

    // ✅ Force load voices on mobile
    document.addEventListener('touchstart', () => {
      if (this.availableVoices.length === 0) {
        this.availableVoices = this.synth.getVoices()
      }
    }, { once: true })
  }

  initVoices() {
    const loadVoices = () => {
      const voices = this.synth.getVoices()
      if (voices.length > 0) {
        this.availableVoices = voices

        // Prioritize Indonesian voices with fallback to Malay
        const indonesianVoices = voices.filter(v =>
          v.lang.startsWith('id') ||
          v.lang.startsWith('ms') ||
          v.lang.toLowerCase().includes('indonesia') ||
          v.lang.toLowerCase().includes('malay')
        )

        if (indonesianVoices.length > 0) {
          this.availableVoices = [
            ...indonesianVoices,
            ...voices.filter(v =>
              !v.lang.startsWith('id') &&
              !v.lang.startsWith('ms') &&
              !v.lang.toLowerCase().includes('indonesia') &&
              !v.lang.toLowerCase().includes('malay')
            )
          ]
        }

        this.isInitialized = true
        console.log('✅ TTS: Voices loaded:', this.availableVoices.length)

        // Log available voices for debugging
        if (this.isMobile) {
          console.log('📱 Available voices:', this.availableVoices.map(v => `${v.name} (${v.lang})`))

          // Check specifically for Indonesian
          const hasIndonesian = this.availableVoices.some(v =>
            v.lang.startsWith('id') || v.lang.toLowerCase().includes('indonesia')
          )

          if (!hasIndonesian) {
            console.warn('⚠️ No Indonesian voice found on this device')
            console.log('💡 User should install Indonesian language pack')

            // Trigger callback if no Indonesian voice
            if (this.onError) {
              this.onError({
                error: 'no-indonesian-voice',
                message: 'Indonesian voice not found. Please install language pack.',
                availableVoices: this.availableVoices.length
              })
            }
          }
        }
      }
    }

    loadVoices()

    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices
    }

    // ✅ Multiple attempts to load voices (mobile needs this)
    setTimeout(() => {
      if (this.availableVoices.length === 0) {
        loadVoices()
      }
    }, 100)

    setTimeout(() => {
      if (this.availableVoices.length === 0) {
        loadVoices()
      }
    }, 500)

    setTimeout(() => {
      if (this.availableVoices.length === 0) {
        loadVoices()
      }
    }, 1000)

    // ✅ Final check after 2 seconds
    setTimeout(() => {
      loadVoices()
      if (this.availableVoices.length > 0) {
        console.log('📊 Final voice check - Available:', this.availableVoices.length)
      }
    }, 2000)
  }

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

  start(htmlContent) {
    if (!htmlContent) {
      console.warn('❌ TTS: No content provided')
      return
    }

    console.log('🎬 TTS: Starting playback...')

    // ✅ MOBILE FIX: Cancel with extra delay
    this.synth.cancel()

    const delay = this.isMobile ? 200 : 100
    setTimeout(() => {
      this._startPlayback(htmlContent)
    }, delay)
  }

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

    // ✅ MOBILE: Check if voices are available
    if (this.availableVoices.length === 0) {
      console.error('❌ TTS: No voices available on this device')
      if (this.onError) {
        this.onError({ error: 'no-voices-available', message: 'No TTS voices found on this device' })
      }
      return
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

        // ✅ MOBILE: Explicitly set language
        utterance.lang = selectedVoice.lang

        if (i === 0) {
          console.log(`🎤 TTS: Using voice: ${selectedVoice.name} (${selectedVoice.lang})`)
        }
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

      // ✅ MOBILE FIX: onstart handler
      utterance.onstart = () => {
        console.log(`▶️ TTS: Chunk ${i + 1}/${chunks.length} started`)
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

          // ✅ MOBILE: Longer delay between chunks
          const transitionDelay = this.isMobile ? 100 : 50
          setTimeout(() => {
            if (!this.isStopping) {
              this.playCurrentChunk()
            }
          }, transitionDelay)
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

        // ✅ MOBILE: synthesis-failed is common - try to continue
        if (event.error === 'synthesis-failed') {
          console.warn(`⚠️ TTS: Synthesis failed on chunk ${i + 1}, attempting to continue...`)

          // Try next chunk after a delay
          if (i < chunks.length - 1 && !this.isStopping) {
            setTimeout(() => {
              this.currentUtteranceIndex = i + 1
              this.playCurrentChunk()
            }, 300)
          } else {
            this.stop()
          }
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

  getChunkStartPosition(chunkIndex) {
    let position = 0
    for (let i = 0; i < chunkIndex; i++) {
      position += this.chunks[i].length + 1
    }
    return position
  }

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

    // ✅ MOBILE FIX: Resume synth before speaking (iOS fix)
    if (this.isMobile) {
      this.synth.resume()
    }

    try {
      this.synth.speak(utterance)
      console.log('✅ TTS: synth.speak() called successfully')
    } catch (error) {
      console.error('❌ TTS: Error calling speak():', error)

      // ✅ Fallback: Try again after delay
      setTimeout(() => {
        if (!this.isStopping) {
          this.synth.speak(utterance)
        }
      }, 200)
    }
  }

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

  resume() {
    if (!this.isPaused) {
      console.log('⚠️ TTS: Cannot resume - not paused')
      return
    }

    console.log('▶️ TTS: Resuming...')
    this.isStopping = false

    // ✅ MOBILE FIX: Resume might need multiple calls
    this.synth.resume()

    if (this.isMobile) {
      setTimeout(() => this.synth.resume(), 50)
    }

    this.isPaused = false
    this.isPlaying = true
    this.emitStateChange()
  }

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

  updateSettings({ rate, pitch, voiceIndex }) {
    if (rate !== undefined) this.rate = rate
    if (pitch !== undefined) this.pitch = pitch
    if (voiceIndex !== undefined) this.voiceIndex = voiceIndex
    console.log('⚙️ TTS: Settings updated:', { rate: this.rate, pitch: this.pitch, voiceIndex: this.voiceIndex })
  }

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

  getProgress() {
    if (this.totalChars === 0) return 0
    return Math.round((this.currentCharIndex / this.totalChars) * 100)
  }

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

  destroy() {
    console.log('🗑️ TTS: Destroying manager...')

    // Clear iOS workaround
    if (this.resumeInfinityWorkaround) {
      clearInterval(this.resumeInfinityWorkaround)
      this.resumeInfinityWorkaround = null
    }

    this.stop()
    this.onStateChange = null
    this.onProgressChange = null
    this.onError = null
  }
}

export default TTSManager
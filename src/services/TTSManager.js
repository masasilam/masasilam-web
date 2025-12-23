// src/utils/TTSManager.js
/**
 * Text-to-Speech Manager - MOBILE COMPATIBLE VERSION WITH WAKE LOCK
 * Handles chunked reading with mobile browser quirks fixed
 * ✅ ADVANCED FIX: Mobile pause/resume now continues from last word position
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

    // ✅ NEW: Track word-level position for better mobile resume
    this.lastWordBoundaryChar = 0
    this.pausedAtChar = 0

    // ✅ Wake Lock untuk mencegah layar mati
    this.wakeLock = null
    this.wakeLockSupported = 'wakeLock' in navigator

    // Settings
    this.rate = 1.0
    this.pitch = 1.0
    this.voiceIndex = 0
    this.availableVoices = []

    // Callbacks
    this.onStateChange = null
    this.onProgressChange = null
    this.onError = null

    this.MAX_CHUNK_SIZE = this.isMobile ? 500 : 3000

    console.log('🎯 TTS: Device type:', this.isMobile ? 'Mobile' : 'Desktop')
    console.log('📏 TTS: Chunk size:', this.MAX_CHUNK_SIZE)
    console.log('🔒 TTS: Wake Lock supported:', this.wakeLockSupported)

    this.initVoices()
    this.setupMobileWorkarounds()
    this.setupWakeLock()
  }

  detectMobile() {
    const ua = navigator.userAgent
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua)
  }

  setupWakeLock() {
    if (!this.wakeLockSupported) {
      console.warn('⚠️ TTS: Wake Lock API not supported on this device')
      return
    }

    document.addEventListener('visibilitychange', async () => {
      if (this.wakeLock !== null && document.visibilityState === 'visible') {
        await this.requestWakeLock()
      }
    })
  }

  async requestWakeLock() {
    if (!this.wakeLockSupported) return

    try {
      this.wakeLock = await navigator.wakeLock.request('screen')
      console.log('🔒 TTS: Wake Lock acquired')

      this.wakeLock.addEventListener('release', () => {
        console.log('🔓 TTS: Wake Lock released')
      })
    } catch (err) {
      console.warn('⚠️ TTS: Wake Lock request failed:', err.message)
    }
  }

  async releaseWakeLock() {
    if (this.wakeLock !== null) {
      try {
        await this.wakeLock.release()
        this.wakeLock = null
        console.log('🔓 TTS: Wake Lock released manually')
      } catch (err) {
        console.warn('⚠️ TTS: Wake Lock release failed:', err.message)
      }
    }
  }

  setupMobileWorkarounds() {
    if (/iphone|ipad|ipod/i.test(navigator.userAgent)) {
      console.log('📱 TTS: iOS detected - applying workarounds')

      this.resumeInfinityWorkaround = setInterval(() => {
        if (this.isPlaying && !this.isPaused) {
          this.synth.pause()
          this.synth.resume()
        }
      }, 14000)
    }

    if (/android/i.test(navigator.userAgent)) {
      console.log('🤖 TTS: Android detected - applying workarounds')
    }

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

        const indonesianVoices = voices.filter(v => {
          const lang = v.lang.toLowerCase()
          const name = v.name.toLowerCase()
          return lang.startsWith('id') ||
                 lang.startsWith('in') ||
                 lang.startsWith('ms') ||
                 lang.includes('indonesia') ||
                 lang.includes('malay') ||
                 name.includes('indonesia') ||
                 name.includes('indonesian')
        })

        if (indonesianVoices.length > 0) {
          this.availableVoices = [
            ...indonesianVoices,
            ...voices.filter(v => {
              const lang = v.lang.toLowerCase()
              const name = v.name.toLowerCase()
              return !lang.startsWith('id') &&
                     !lang.startsWith('in') &&
                     !lang.startsWith('ms') &&
                     !lang.includes('indonesia') &&
                     !lang.includes('malay') &&
                     !name.includes('indonesia') &&
                     !name.includes('indonesian')
            })
          ]
        }

        this.isInitialized = true
        console.log('✅ TTS: Voices loaded:', this.availableVoices.length)

        if (this.isMobile) {
          console.log('📱 Available voices:', this.availableVoices.map(v => `${v.name} (${v.lang})`))

          const hasIndonesian = this.availableVoices.some(v => {
            const lang = v.lang.toLowerCase()
            const name = v.name.toLowerCase()
            return lang.startsWith('id') ||
                   lang.startsWith('in') ||
                   lang.includes('indonesia') ||
                   name.includes('indonesia') ||
                   name.includes('indonesian')
          })

          if (!hasIndonesian) {
            console.warn('⚠️ No Indonesian voice found on this device')
            console.log('💡 User should install Indonesian language pack')

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

    setTimeout(() => { if (this.availableVoices.length === 0) loadVoices() }, 100)
    setTimeout(() => { if (this.availableVoices.length === 0) loadVoices() }, 500)
    setTimeout(() => { if (this.availableVoices.length === 0) loadVoices() }, 1000)
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

    const scripts = tempDiv.querySelectorAll('script, style')
    scripts.forEach(el => el.remove())

    const text = tempDiv.textContent || tempDiv.innerText || ''
    const cleanText = text.replace(/\s+/g, ' ').trim()

    const chunks = []
    let currentChunk = ''

    const sentences = cleanText.match(/[^.!?]+[.!?]+/g) || [cleanText]

    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > this.MAX_CHUNK_SIZE) {
        if (currentChunk) {
          chunks.push(currentChunk.trim())
          currentChunk = ''
        }

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

    if (this.isMobile) {
      this.requestWakeLock()
    }

    this.synth.cancel()

    const delay = this.isMobile ? 200 : 100
    setTimeout(() => {
      this._startPlayback(htmlContent)
    }, delay)
  }

  _startPlayback(htmlContent) {
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
    this.lastWordBoundaryChar = 0
    this.pausedAtChar = 0

    console.log(`📝 TTS: Processing ${chunks.length} chunks (${this.totalChars} chars)`)

    if (this.availableVoices.length === 0) {
      this.availableVoices = this.synth.getVoices()
      console.log('🔄 TTS: Force loaded voices:', this.availableVoices.length)
    }

    if (this.availableVoices.length === 0) {
      console.error('❌ TTS: No voices available on this device')
      if (this.onError) {
        this.onError({ error: 'no-voices-available', message: 'No TTS voices found on this device' })
      }
      return
    }

    for (let i = 0; i < chunks.length; i++) {
      const utterance = new SpeechSynthesisUtterance(chunks[i])
      utterance.rate = this.rate
      utterance.pitch = this.pitch

      if (this.availableVoices.length > 0) {
        const selectedVoice = this.availableVoices[this.voiceIndex] || this.availableVoices[0]
        utterance.voice = selectedVoice
        utterance.lang = selectedVoice.lang

        if (i === 0) {
          console.log(`🎤 TTS: Using voice: ${selectedVoice.name} (${selectedVoice.lang})`)
        }
      }

      utterance.onboundary = (event) => {
        if (event.name === 'word' && !this.isStopping) {
          const chunkStart = this.getChunkStartPosition(i)
          this.currentCharIndex = chunkStart + event.charIndex

          // ✅ Track last word boundary for mobile resume
          this.lastWordBoundaryChar = this.currentCharIndex

          if (this.onProgressChange) {
            this.onProgressChange(this.currentCharIndex, this.totalChars)
          }
        }
      }

      utterance.onstart = () => {
        console.log(`▶️ TTS: Chunk ${i + 1}/${chunks.length} started`)
      }

      utterance.onend = () => {
        if (this.isStopping) {
          console.log('⏹️ TTS: Stopping, skip transition')
          return
        }

        console.log(`✅ TTS: Chunk ${i + 1}/${chunks.length} completed`)

        if (i < chunks.length - 1) {
          this.currentUtteranceIndex = i + 1

          const transitionDelay = this.isMobile ? 100 : 50
          setTimeout(() => {
            if (!this.isStopping) {
              this.playCurrentChunk()
            }
          }, transitionDelay)
        } else {
          console.log('🎉 TTS: All chunks completed')
          this.stop()
        }
      }

      utterance.onerror = (event) => {
        if (this.isStopping && event.error === 'interrupted') {
          console.log('⚠️ TTS: Interrupted (intentional)')
          return
        }

        if (event.error === 'interrupted') {
          console.log('⚠️ TTS: Interrupted (transition)')
          return
        }

        if (event.error === 'synthesis-failed') {
          console.warn(`⚠️ TTS: Synthesis failed on chunk ${i + 1}, attempting to continue...`)

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

        console.error(`❌ TTS: Error in chunk ${i + 1}:`, event.error)

        if (this.onError) {
          this.onError(event)
        }

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

    this.isPlaying = true
    this.isPaused = false
    this.isEnabled = true

    console.log('📊 TTS: State set:', {
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      isEnabled: this.isEnabled
    })

    this.emitStateChange()
    this.playCurrentChunk()
  }

  getChunkStartPosition(chunkIndex) {
    let position = 0
    for (let i = 0; i < chunkIndex; i++) {
      position += this.chunks[i].length + 1
    }
    return position
  }

  // ✅ NEW: Create partial chunk from last word position
  createPartialChunk(chunkIndex, startChar) {
    if (chunkIndex >= this.chunks.length) return null

    const fullChunk = this.chunks[chunkIndex]
    const chunkStart = this.getChunkStartPosition(chunkIndex)
    const relativeChar = startChar - chunkStart

    if (relativeChar <= 0) return fullChunk

    // Find the start of the word at or after relativeChar
    let text = fullChunk.substring(relativeChar)

    // Trim leading whitespace
    text = text.trimStart()

    console.log('✂️ TTS: Created partial chunk:', {
      original: fullChunk.substring(0, 50) + '...',
      partial: text.substring(0, 50) + '...',
      skipped: relativeChar + ' chars'
    })

    return text
  }

  playCurrentChunk(fromChar = null) {
    if (this.isStopping) {
      console.log('⏹️ TTS: Stopping flag set, skip playback')
      return
    }

    if (this.currentUtteranceIndex >= this.utterances.length) {
      console.log('⚠️ TTS: No more chunks to play')
      return
    }

    let utterance

    // ✅ If resuming from a specific character, create partial chunk
    if (fromChar !== null && this.isMobile) {
      const partialText = this.createPartialChunk(this.currentUtteranceIndex, fromChar)

      if (partialText) {
        utterance = new SpeechSynthesisUtterance(partialText)
        utterance.rate = this.rate
        utterance.pitch = this.pitch

        if (this.availableVoices.length > 0) {
          const selectedVoice = this.availableVoices[this.voiceIndex] || this.availableVoices[0]
          utterance.voice = selectedVoice
          utterance.lang = selectedVoice.lang
        }

        // Setup handlers for partial chunk
        const i = this.currentUtteranceIndex

        utterance.onboundary = (event) => {
          if (event.name === 'word' && !this.isStopping) {
            this.currentCharIndex = fromChar + event.charIndex
            this.lastWordBoundaryChar = this.currentCharIndex

            if (this.onProgressChange) {
              this.onProgressChange(this.currentCharIndex, this.totalChars)
            }
          }
        }

        utterance.onend = () => {
          if (this.isStopping) return

          if (i < this.chunks.length - 1) {
            this.currentUtteranceIndex = i + 1
            setTimeout(() => {
              if (!this.isStopping) {
                this.playCurrentChunk()
              }
            }, 100)
          } else {
            this.stop()
          }
        }

        utterance.onerror = (event) => {
          if (event.error === 'interrupted' || this.isStopping) return

          console.error('❌ TTS: Error in partial chunk:', event.error)

          if (i < this.chunks.length - 1) {
            setTimeout(() => {
              this.currentUtteranceIndex = i + 1
              this.playCurrentChunk()
            }, 100)
          }
        }
      } else {
        utterance = this.utterances[this.currentUtteranceIndex]
      }
    } else {
      utterance = this.utterances[this.currentUtteranceIndex]
    }

    console.log('▶️ TTS: Playing chunk', {
      index: this.currentUtteranceIndex + 1,
      total: this.utterances.length,
      preview: utterance.text.substring(0, 50) + '...',
      voice: utterance.voice?.name || 'default',
      isPartial: fromChar !== null
    })

    if (this.isMobile) {
      this.synth.resume()
    }

    try {
      this.synth.speak(utterance)
      console.log('✅ TTS: synth.speak() called successfully')
    } catch (error) {
      console.error('❌ TTS: Error calling speak():', error)

      setTimeout(() => {
        if (!this.isStopping) {
          this.synth.speak(utterance)
        }
      }, 200)
    }
  }

  // ✅ ADVANCED FIX: Save word position on pause
  pause() {
    if (!this.isPlaying || this.isPaused) {
      console.log('⚠️ TTS: Cannot pause - not playing or already paused')
      return
    }

    console.log('⏸️ TTS: Pausing...')

    // ✅ Save the last word boundary position
    this.pausedAtChar = this.lastWordBoundaryChar

    console.log('💾 TTS: Saved position:', {
      char: this.pausedAtChar,
      progress: Math.round((this.pausedAtChar / this.totalChars) * 100) + '%'
    })

    if (this.isMobile) {
      this.synth.cancel()
      console.log('📱 TTS: Mobile pause - will resume from char', this.pausedAtChar)
    } else {
      this.synth.pause()
    }

    this.isPaused = true
    this.isPlaying = false
    this.emitStateChange()
  }

  // ✅ ADVANCED FIX: Resume from saved word position
  resume() {
    if (!this.isPaused) {
      console.log('⚠️ TTS: Cannot resume - not paused')
      return
    }

    console.log('▶️ TTS: Resuming...')
    this.isStopping = false

    if (this.isMobile) {
      console.log('📱 TTS: Mobile resume from char', this.pausedAtChar)
      this.isPaused = false
      this.isPlaying = true
      this.emitStateChange()

      // ✅ Resume from saved word position
      setTimeout(() => {
        this.playCurrentChunk(this.pausedAtChar)
      }, 100)
    } else {
      this.synth.resume()
      setTimeout(() => this.synth.resume(), 50)
      this.isPaused = false
      this.isPlaying = true
      this.emitStateChange()
    }
  }

  stop() {
    if (!this.isPlaying && !this.isPaused && !this.isEnabled) {
      console.log('⚠️ TTS: Already stopped')
      return
    }

    console.log('⏹️ TTS: Stopping...')

    this.isStopping = true
    this.synth.cancel()

    if (this.isMobile) {
      this.releaseWakeLock()
    }

    this.isPlaying = false
    this.isPaused = false
    this.isEnabled = false
    this.currentCharIndex = 0
    this.currentUtteranceIndex = 0
    this.utterances = []
    this.chunks = []
    this.lastWordBoundaryChar = 0
    this.pausedAtChar = 0

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

    if (this.resumeInfinityWorkaround) {
      clearInterval(this.resumeInfinityWorkaround)
      this.resumeInfinityWorkaround = null
    }

    if (this.isMobile) {
      this.releaseWakeLock()
    }

    this.stop()
    this.onStateChange = null
    this.onProgressChange = null
    this.onError = null
  }
}

export default TTSManager
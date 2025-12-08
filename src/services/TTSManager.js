// src/services/TTSManager.js
import { isNormalInterruption } from '../utils/TTSErrorTypes'

/**
 * Text-to-Speech Manager
 * Handles all TTS functionality including playback, pause/resume, and settings
 * 
 * Note: The Web Speech API may emit 'interrupted' or 'canceled' errors when:
 * - User pauses/stops playback
 * - Browser tab loses focus
 * - User navigates to another page
 * These are normal behaviors and not actual errors.
 */

class TTSManager {
  constructor() {
    this.utterance = null
    this.fullText = ''
    this.currentCharIndex = 0
    this.startTime = 0
    this.startChar = 0
    this.isPlaying = false
    this.isPaused = false
    this.isEnabled = false
    
    // Settings
    this.rate = 1.0
    this.pitch = 1.0
    this.voiceIndex = 0
    this.availableVoices = []
    
    // Callbacks
    this.onStateChange = null
    this.onProgressChange = null
    this.onError = null
    
    this.initializeVoices()
  }

  /**
   * Initialize available voices
   */
  initializeVoices() {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices()
      // Prioritize Indonesian voices
      const indonesianVoices = voices.filter(v => v.lang.startsWith('id'))
      this.availableVoices = indonesianVoices.length > 0 ? indonesianVoices : voices
    }

    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices
  }

  /**
   * Extract text content from HTML
   */
  extractTextFromHTML(html) {
    const temp = document.createElement('div')
    temp.innerHTML = html
    return temp.textContent || temp.innerText || ''
  }

  /**
   * Estimate character position based on time elapsed
   * Average speaking rate: ~150 words per minute at rate 1.0
   * Average word length: ~5 characters
   * So roughly 12.5 chars per second at rate 1.0
   */
  estimateCharPosition(text, startChar, elapsedMs, rate) {
    const charsPerSecond = 12.5 * rate
    const elapsedSeconds = elapsedMs / 1000
    const estimatedChars = Math.floor(elapsedSeconds * charsPerSecond)
    return Math.min(startChar + estimatedChars, text.length)
  }

  /**
   * Update internal state and notify listeners
   */
  updateState(updates) {
    Object.assign(this, updates)
    
    if (this.onStateChange) {
      this.onStateChange({
        isPlaying: this.isPlaying,
        isPaused: this.isPaused,
        isEnabled: this.isEnabled,
        currentCharIndex: this.currentCharIndex,
        fullText: this.fullText
      })
    }
  }

  /**
   * Speak text from a specific character position
   */
  speak(text, startFromChar = 0) {
    if (!text) {
      console.warn('TTSManager: No text to speak')
      return
    }

    // Cancel any existing speech
    window.speechSynthesis.cancel()

    // Get text from the starting position
    const textToSpeak = startFromChar > 0 ? text.substring(startFromChar) : text
    
    if (!textToSpeak.trim()) {
      console.warn('TTSManager: No more text to speak')
      this.updateState({ isPlaying: false, isEnabled: false })
      return
    }

    console.log('🔊 TTSManager: Speaking from char:', startFromChar)

    const utterance = new SpeechSynthesisUtterance(textToSpeak)
    
    // Set voice
    if (this.availableVoices.length > 0 && this.availableVoices[this.voiceIndex]) {
      utterance.voice = this.availableVoices[this.voiceIndex]
    }
    
    utterance.rate = this.rate
    utterance.pitch = this.pitch
    utterance.lang = 'id-ID'

    utterance.onstart = () => {
      this.startTime = Date.now()
      this.startChar = startFromChar
      this.updateState({ isPlaying: true, isPaused: false, isEnabled: true })
      console.log('▶️ TTSManager: Started at:', startFromChar)
    }

    utterance.onboundary = (event) => {
      // Update actual position in full text
      const actualPosition = startFromChar + event.charIndex
      this.currentCharIndex = actualPosition
      
      if (this.onProgressChange) {
        this.onProgressChange(actualPosition, text.length)
      }
    }

    utterance.onpause = () => {
      const elapsed = Date.now() - this.startTime
      const estimatedPos = this.estimateCharPosition(text, this.startChar, elapsed, this.rate)
      this.updateState({ currentCharIndex: estimatedPos, isPaused: true, isPlaying: false })
      console.log('⏸️ TTSManager: Native paused at:', estimatedPos)
    }

    utterance.onresume = () => {
      this.startTime = Date.now()
      this.startChar = this.currentCharIndex
      this.updateState({ isPlaying: true, isPaused: false })
      console.log('▶️ TTSManager: Resumed from:', this.currentCharIndex)
    }

    utterance.onend = () => {
      this.updateState({ 
        isPlaying: false, 
        isPaused: false, 
        isEnabled: false, 
        currentCharIndex: 0 
      })
      console.log('⏹️ TTSManager: Ended')
    }

    utterance.onerror = (event) => {
      // 'interrupted' is a normal error when user pauses/stops or navigates away
      // Don't treat it as an actual error
      if (event.error === 'interrupted' || event.error === 'canceled') {
        console.log('⏸️ TTSManager: Speech interrupted (normal)')
        this.updateState({ isPlaying: false, isPaused: false })
        return
      }
      
      // Only log/report actual errors
      console.error('❌ TTSManager: Error:', event.error)
      this.updateState({ isPlaying: false, isPaused: false })
      
      if (this.onError) {
        this.onError(event.error)
      }
    }

    this.utterance = utterance
    window.speechSynthesis.speak(utterance)
  }

  /**
   * Start TTS from the beginning
   */
  start(htmlContent) {
    if (!htmlContent) {
      console.warn('TTSManager: No content provided')
      return
    }

    const text = this.extractTextFromHTML(htmlContent)
    
    if (!text.trim()) {
      console.warn('TTSManager: No text to speak')
      return
    }

    this.fullText = text
    this.currentCharIndex = 0
    this.speak(text, 0)
  }

  /**
   * Pause TTS playback
   */
  pause() {
    if (!window.speechSynthesis.speaking) return
    
    console.log('🛑 TTSManager: Pause requested')
    
    // Calculate current position before canceling
    const elapsed = Date.now() - this.startTime
    const estimatedPos = this.estimateCharPosition(
      this.fullText, 
      this.startChar, 
      elapsed, 
      this.rate
    )
    
    // Update position BEFORE canceling
    this.currentCharIndex = estimatedPos
    
    // Try native pause first
    try {
      window.speechSynthesis.pause()
    } catch (e) {
      console.log('⚠️ TTSManager: Native pause not supported')
    }
    
    // Check if pause worked, if not cancel
    setTimeout(() => {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        // Native pause didn't work, need to cancel
        // This will trigger 'interrupted' error, which is normal
        window.speechSynthesis.cancel()
        console.log('⏸️ TTSManager: Cancelled at position:', estimatedPos)
      } else {
        console.log('⏸️ TTSManager: Native pause at position:', estimatedPos)
      }
      this.updateState({ isPlaying: false, isPaused: true })
    }, 50)
  }

  /**
   * Resume TTS playback
   */
  resume() {
    if (!this.fullText) {
      console.warn('TTSManager: No text to resume')
      return
    }
    
    // Try native resume first
    if (window.speechSynthesis.paused) {
      try {
        window.speechSynthesis.resume()
        console.log('▶️ TTSManager: Native resume')
        return
      } catch (e) {
        console.log('❌ TTSManager: Native resume failed:', e)
      }
    }
    
    // Fallback: restart from saved position
    console.log('🔄 TTSManager: Restart from position:', this.currentCharIndex)
    this.speak(this.fullText, this.currentCharIndex)
  }

  /**
   * Stop TTS playback completely
   */
  stop() {
    // Cancel will trigger 'interrupted' error, which is normal
    window.speechSynthesis.cancel()
    this.updateState({
      isPlaying: false,
      isPaused: false,
      isEnabled: false,
      fullText: '',
      currentCharIndex: 0
    })
    console.log('⏹️ TTSManager: Stopped')
  }

  /**
   * Toggle play/pause
   */
  toggle() {
    if (!this.isEnabled && !this.isPaused) {
      // Not started yet - need content to start
      return false // Caller should provide content
    } else if (this.isPlaying) {
      this.pause()
    } else if (this.isPaused || this.isEnabled) {
      this.resume()
    }
    return true
  }

  /**
   * Update TTS settings
   */
  updateSettings({ rate, pitch, voiceIndex }) {
    let changed = false
    
    if (rate !== undefined && rate !== this.rate) {
      this.rate = rate
      changed = true
    }
    
    if (pitch !== undefined && pitch !== this.pitch) {
      this.pitch = pitch
      changed = true
    }
    
    if (voiceIndex !== undefined && voiceIndex !== this.voiceIndex) {
      this.voiceIndex = voiceIndex
      changed = true
    }
    
    return changed
  }

  /**
   * Apply new settings (restart if playing)
   */
  applySettings({ rate, pitch, voiceIndex }) {
    const wasPlaying = this.isPlaying
    const changed = this.updateSettings({ rate, pitch, voiceIndex })
    
    if (changed && wasPlaying) {
      this.stop()
      setTimeout(() => {
        this.speak(this.fullText, this.currentCharIndex)
      }, 100)
    }
  }

  /**
   * Get current progress as percentage
   */
  getProgress() {
    if (!this.fullText) return 0
    return Math.round((this.currentCharIndex / this.fullText.length) * 100)
  }

  /**
   * Get current state
   */
  getState() {
    return {
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      isEnabled: this.isEnabled,
      currentCharIndex: this.currentCharIndex,
      fullText: this.fullText,
      rate: this.rate,
      pitch: this.pitch,
      voiceIndex: this.voiceIndex,
      availableVoices: this.availableVoices,
      progress: this.getProgress()
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
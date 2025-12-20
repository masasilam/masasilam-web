// src/hooks/useTTS.js
import { useState, useEffect, useRef } from 'react'
import TTSManager from '../services/TTSManager'
import { isNormalInterruption, getTTSErrorMessage } from '../utils/TTSErrorTypes'

/**
 * React Hook for Text-to-Speech functionality
 *
 * @returns {Object} TTS state and control functions
 */
export const useTTS = () => {
  const ttsManagerRef = useRef(null)

  const [state, setState] = useState({
    isPlaying: false,
    isPaused: false,
    isEnabled: false,
    currentCharIndex: 0,
    progress: 0,
    rate: 1.0,
    pitch: 1.0,
    voiceIndex: 0,
    availableVoices: [],
    showSettings: false
  })

  // Initialize TTSManager
  useEffect(() => {
    const ttsManager = new TTSManager()
    ttsManagerRef.current = ttsManager

    // Set up callbacks
    ttsManager.onStateChange = (newState) => {
      setState(prev => ({
        ...prev,
        isPlaying: newState.isPlaying,
        isPaused: newState.isPaused,
        isEnabled: newState.isEnabled,
        currentCharIndex: newState.currentCharIndex,
        progress: ttsManager.getProgress()
      }))
    }

    ttsManager.onProgressChange = (currentChar, totalChars) => {
      setState(prev => ({
        ...prev,
        currentCharIndex: currentChar,
        progress: Math.round((currentChar / totalChars) * 100)
      }))
    }

    ttsManager.onError = (error) => {
      // Only log actual errors, not normal interruptions
      if (!isNormalInterruption(error)) {
        const message = getTTSErrorMessage(error)
        console.error('TTS Error:', error, '-', message)

        // Optional: Show toast notification
        // toast.error(message)
      }
    }

    // Update available voices when loaded
    const checkVoices = setInterval(() => {
      if (ttsManager.availableVoices.length > 0) {
        setState(prev => ({
          ...prev,
          availableVoices: ttsManager.availableVoices
        }))
        clearInterval(checkVoices)
      }
    }, 100)

    // Cleanup
    return () => {
      clearInterval(checkVoices)
      ttsManager.destroy()
    }
  }, [])

  /**
   * Start TTS with HTML content
   */
  const start = (htmlContent) => {
    if (!ttsManagerRef.current) return
    ttsManagerRef.current.start(htmlContent)
  }

  /**
   * Pause TTS
   */
  const pause = () => {
    if (!ttsManagerRef.current) return
    ttsManagerRef.current.pause()
  }

  /**
   * Resume TTS
   */
  const resume = () => {
    if (!ttsManagerRef.current) return
    ttsManagerRef.current.resume()
  }

  /**
   * Stop TTS
   */
  const stop = () => {
    if (!ttsManagerRef.current) return
    ttsManagerRef.current.stop()
  }

  /**
   * Toggle play/pause
   */
  const toggle = (htmlContent) => {
    if (!ttsManagerRef.current) return

    const handled = ttsManagerRef.current.toggle()

    // If not handled (not started yet), start with content
    if (!handled && htmlContent) {
      start(htmlContent)
    }
  }

  /**
   * Update settings
   */
  const updateSettings = ({ rate, pitch, voiceIndex }) => {
    if (!ttsManagerRef.current) return

    const updates = {}
    if (rate !== undefined) updates.rate = rate
    if (pitch !== undefined) updates.pitch = pitch
    if (voiceIndex !== undefined) updates.voiceIndex = voiceIndex

    ttsManagerRef.current.updateSettings(updates)

    setState(prev => ({
      ...prev,
      ...updates
    }))
  }

  /**
   * Apply settings (restart if playing)
   */
  const applySettings = ({ rate, pitch, voiceIndex }) => {
    if (!ttsManagerRef.current) return

    ttsManagerRef.current.applySettings({ rate, pitch, voiceIndex })

    setState(prev => ({
      ...prev,
      rate: ttsManagerRef.current.rate,
      pitch: ttsManagerRef.current.pitch,
      voiceIndex: ttsManagerRef.current.voiceIndex
    }))
  }

  /**
   * Toggle settings panel
   */
  const toggleSettings = () => {
    setState(prev => ({
      ...prev,
      showSettings: !prev.showSettings
    }))
  }

  return {
    // State
    isPlaying: state.isPlaying,
    isPaused: state.isPaused,
    isEnabled: state.isEnabled,
    progress: state.progress,
    currentCharIndex: state.currentCharIndex,
    rate: state.rate,
    pitch: state.pitch,
    voiceIndex: state.voiceIndex,
    availableVoices: state.availableVoices,
    showSettings: state.showSettings,
    
    // Actions
    start,
    pause,
    resume,
    stop,
    toggle,
    updateSettings,
    applySettings,
    toggleSettings
  }
}
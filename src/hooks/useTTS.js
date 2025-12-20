import { useState, useEffect, useRef, useCallback } from 'react'
import TTSManager from '../services/TTSManager'
import { isNormalInterruption, getTTSErrorMessage } from '../utils/TTSErrorTypes'

export const useTTS = () => {
  const ttsManagerRef = useRef(null)
  const isInitializedRef = useRef(false)

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

  useEffect(() => {
    if (isInitializedRef.current) return
    isInitializedRef.current = true

    const ttsManager = new TTSManager()
    ttsManagerRef.current = ttsManager

    ttsManager.onStateChange = (newState) => {
      setState(prev => {
        // ✅ Kembalikan kondisi untuk mencegah loop
        if (
          prev.isPlaying === newState.isPlaying &&
          prev.isPaused === newState.isPaused &&
          prev.isEnabled === newState.isEnabled &&
          prev.currentCharIndex === newState.currentCharIndex
        ) {
          return prev // Tidak ada perubahan, skip update
        }

        return {
          ...prev,
          isPlaying: newState.isPlaying,
          isPaused: newState.isPaused,
          isEnabled: newState.isEnabled,
          currentCharIndex: newState.currentCharIndex,
          progress: ttsManager.getProgress()
        }
      })
    }

    ttsManager.onProgressChange = (currentChar, totalChars) => {
      const newProgress = Math.round((currentChar / totalChars) * 100)
      setState(prev => ({
        ...prev,
        currentCharIndex: currentChar,
        progress: newProgress
      }))
    }

    ttsManager.onError = (error) => {
      if (!isNormalInterruption(error)) {
        console.warn('TTS Warning:', getTTSErrorMessage(error))
      }
    }

    const checkVoices = setInterval(() => {
      if (ttsManager.availableVoices.length > 0) {
        setState(prev => ({
          ...prev,
          availableVoices: ttsManager.availableVoices
        }))
        clearInterval(checkVoices)
      }
    }, 100)

    return () => {
      clearInterval(checkVoices)
      if (ttsManagerRef.current) {
        ttsManagerRef.current.destroy()
        ttsManagerRef.current = null
      }
      isInitializedRef.current = false
    }
  }, [])

  const start = useCallback((htmlContent) => {
    if (!ttsManagerRef.current) return
    ttsManagerRef.current.start(htmlContent)
  }, [])

  const pause = useCallback(() => {
    if (!ttsManagerRef.current) return
    ttsManagerRef.current.pause()
  }, [])

  const resume = useCallback(() => {
    if (!ttsManagerRef.current) return
    ttsManagerRef.current.resume()
  }, [])

  const stop = useCallback(() => {
    if (!ttsManagerRef.current) return
    ttsManagerRef.current.stop()
  }, [])

  const toggle = useCallback((htmlContent) => {
    if (!ttsManagerRef.current) return
    const handled = ttsManagerRef.current.toggle()
    if (!handled && htmlContent) {
      start(htmlContent)
    }
  }, [start])

  const updateSettings = useCallback(({ rate, pitch, voiceIndex }) => {
    if (!ttsManagerRef.current) return

    const updates = {}
    if (rate !== undefined) updates.rate = rate
    if (pitch !== undefined) updates.pitch = pitch
    if (voiceIndex !== undefined) updates.voiceIndex = voiceIndex

    ttsManagerRef.current.updateSettings(updates)
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  const applySettings = useCallback(({ rate, pitch, voiceIndex }) => {
    if (!ttsManagerRef.current) return
    ttsManagerRef.current.applySettings({ rate, pitch, voiceIndex })
    setState(prev => ({
      ...prev,
      rate: ttsManagerRef.current.rate,
      pitch: ttsManagerRef.current.pitch,
      voiceIndex: ttsManagerRef.current.voiceIndex
    }))
  }, [])

  const toggleSettings = useCallback(() => {
    setState(prev => ({ ...prev, showSettings: !prev.showSettings }))
  }, [])

  return {
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
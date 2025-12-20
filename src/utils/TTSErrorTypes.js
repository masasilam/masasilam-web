/**
 * TTS Error Type Utilities
 * Helper functions to handle Speech Synthesis errors
 */

export const isNormalInterruption = (error) => {
  if (!error) return false
  const errorStr = error.error || error.type || String(error)
  return errorStr === 'interrupted' || errorStr === 'canceled'
}

export const getTTSErrorMessage = (error) => {
  if (!error) return 'Unknown error'
  const errorStr = error.error || error.type || String(error)
  
  const messages = {
    'interrupted': 'Playback was interrupted',
    'canceled': 'Playback was canceled',
    'network': 'Network error occurred',
    'synthesis-failed': 'Speech synthesis failed',
    'synthesis-unavailable': 'Speech synthesis not available',
    'not-allowed': 'Speech synthesis not allowed',
    'audio-busy': 'Audio device is busy',
    'audio-hardware': 'Audio hardware error',
    'language-unavailable': 'Selected language not available',
    'voice-unavailable': 'Selected voice not available',
    'text-too-long': 'Text is too long',
    'invalid-argument': 'Invalid argument provided'
  }
  
  return messages[errorStr] || `TTS Error: ${errorStr}`
}

export const isRecoverableError = (error) => {
  if (!error) return false
  const errorStr = error.error || error.type || String(error)
  
  const recoverableErrors = [
    'interrupted',
    'canceled',
    'audio-busy'
  ]
  
  return recoverableErrors.includes(errorStr)
}

export const isCriticalError = (error) => {
  if (!error) return false
  const errorStr = error.error || error.type || String(error)
  
  const criticalErrors = [
    'synthesis-unavailable',
    'not-allowed',
    'audio-hardware'
  ]
  
  return criticalErrors.includes(errorStr)
}
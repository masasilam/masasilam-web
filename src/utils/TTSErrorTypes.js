// src/utils/TTSErrorTypes.js

/**
 * TTS Error Types and their handling
 */

export const TTS_ERROR_TYPES = {
  // Normal interruptions - NOT actual errors
  INTERRUPTED: 'interrupted',
  CANCELED: 'canceled',
  
  // Actual errors that need handling
  NOT_ALLOWED: 'not-allowed',
  NETWORK: 'network',
  SYNTHESIS_FAILED: 'synthesis-failed',
  SYNTHESIS_UNAVAILABLE: 'synthesis-unavailable',
  AUDIO_BUSY: 'audio-busy',
  AUDIO_HARDWARE: 'audio-hardware',
  LANGUAGE_UNAVAILABLE: 'language-unavailable',
  VOICE_UNAVAILABLE: 'voice-unavailable',
  TEXT_TOO_LONG: 'text-too-long',
  INVALID_ARGUMENT: 'invalid-argument'
}

/**
 * Check if an error is a normal interruption (not an actual error)
 */
export const isNormalInterruption = (errorCode) => {
  return errorCode === TTS_ERROR_TYPES.INTERRUPTED || 
         errorCode === TTS_ERROR_TYPES.CANCELED
}

/**
 * Get user-friendly error message
 */
export const getTTSErrorMessage = (errorCode) => {
  const messages = {
    [TTS_ERROR_TYPES.NOT_ALLOWED]: 'Browser tidak mengizinkan TTS. Coba refresh halaman.',
    [TTS_ERROR_TYPES.NETWORK]: 'Masalah koneksi jaringan. Periksa koneksi internet Anda.',
    [TTS_ERROR_TYPES.SYNTHESIS_FAILED]: 'TTS gagal. Coba lagi.',
    [TTS_ERROR_TYPES.SYNTHESIS_UNAVAILABLE]: 'TTS tidak tersedia di browser Anda.',
    [TTS_ERROR_TYPES.AUDIO_BUSY]: 'Audio sedang digunakan aplikasi lain.',
    [TTS_ERROR_TYPES.AUDIO_HARDWARE]: 'Masalah dengan hardware audio.',
    [TTS_ERROR_TYPES.LANGUAGE_UNAVAILABLE]: 'Bahasa tidak tersedia untuk TTS.',
    [TTS_ERROR_TYPES.VOICE_UNAVAILABLE]: 'Suara tidak tersedia. Pilih suara lain.',
    [TTS_ERROR_TYPES.TEXT_TOO_LONG]: 'Teks terlalu panjang untuk diproses.',
    [TTS_ERROR_TYPES.INVALID_ARGUMENT]: 'Pengaturan TTS tidak valid.'
  }
  
  return messages[errorCode] || 'Terjadi kesalahan pada TTS.'
}

/**
 * Check if error needs user action
 */
export const needsUserAction = (errorCode) => {
  return [
    TTS_ERROR_TYPES.NOT_ALLOWED,
    TTS_ERROR_TYPES.SYNTHESIS_UNAVAILABLE,
    TTS_ERROR_TYPES.AUDIO_HARDWARE,
    TTS_ERROR_TYPES.VOICE_UNAVAILABLE
  ].includes(errorCode)
}
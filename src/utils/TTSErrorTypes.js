/**
 * Check if error is a normal interruption (not a real error)
 */
export const isNormalInterruption = (error) => {
  if (!error) return false
  
  const errorType = error.error || error.type || ''
  
  // These are normal interruptions, not errors
  const normalInterruptions = [
    'interrupted',
    'canceled',
    'cancelled'
  ]
  
  return normalInterruptions.includes(errorType.toLowerCase())
}

/**
 * Get user-friendly error message
 */
export const getTTSErrorMessage = (error) => {
  if (!error) return 'Terjadi kesalahan tidak diketahui'
  
  const errorType = error.error || error.type || ''
  
  switch (errorType.toLowerCase()) {
    case 'interrupted':
    case 'canceled':
    case 'cancelled':
      return 'TTS dihentikan'
    
    case 'audio-busy':
      return 'Audio sedang digunakan oleh aplikasi lain'
    
    case 'audio-hardware':
      return 'Masalah dengan perangkat audio'
    
    case 'network':
      return 'Masalah koneksi jaringan'
    
    case 'synthesis-unavailable':
      return 'Layanan TTS tidak tersedia'
    
    case 'synthesis-failed':
      return 'Gagal mensintesis audio'
    
    case 'language-unavailable':
      return 'Bahasa tidak didukung'
    
    case 'voice-unavailable':
      return 'Suara tidak tersedia'
    
    case 'text-too-long':
      return 'Teks terlalu panjang'
    
    case 'invalid-argument':
      return 'Parameter tidak valid'
    
    default:
      return 'Terjadi kesalahan pada TTS'
  }
}

/**
 * Log TTS error for debugging
 */
export const logTTSError = (error, context = '') => {
  if (isNormalInterruption(error)) {
    console.log(`TTS: ${context} - Normal interruption:`, error.error)
  } else {
    console.error(`TTS Error ${context}:`, {
      error: error.error,
      message: getTTSErrorMessage(error),
      charIndex: error.charIndex,
      elapsedTime: error.elapsedTime
    })
  }
}

export default {
  isNormalInterruption,
  getTTSErrorMessage,
  logTTSError
}
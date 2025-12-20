// src/components/Reader/TTSVoiceSetupBanner.jsx
import { AlertCircle, X, ExternalLink } from 'lucide-react'
import { useState, useEffect } from 'react'

/**
 * TTS Voice Setup Banner - Shows once if Indonesian voice not available
 */
const TTSVoiceSetupBanner = ({ availableVoices, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if user has dismissed this before
    const dismissed = localStorage.getItem('tts-voice-setup-dismissed')
    if (dismissed) return

    // Check if Indonesian voice is available
    const hasIndonesian = availableVoices.some(v =>
      v.lang.startsWith('id') || v.lang.toLowerCase().includes('indonesia')
    )

    // Check if mobile
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent)

    // Show banner if: mobile + no Indonesian voice + has other voices
    if (isMobile && !hasIndonesian && availableVoices.length > 0) {
      setIsVisible(true)
    }
  }, [availableVoices])

  const handleDismiss = () => {
    localStorage.setItem('tts-voice-setup-dismissed', 'true')
    setIsVisible(false)
    if (onDismiss) onDismiss()
  }

  const detectOS = () => {
    const ua = navigator.userAgent
    if (/android/i.test(ua)) return 'Android'
    if (/iphone|ipad|ipod/i.test(ua)) return 'iOS'
    return 'Unknown'
  }

  const os = detectOS()

  if (!isVisible) return null

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-lg">🇮🇩</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Tingkatkan Pengalaman TTS Anda!
          </h4>

          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
            Kami mendeteksi bahwa <strong>suara Bahasa Indonesia belum terinstall</strong> di perangkat Anda.
            Install sekarang untuk pengalaman mendengarkan yang lebih natural dan jelas!
          </p>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 mb-3 border border-gray-200 dark:border-gray-700">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              📱 Langkah Cepat ({os}):
            </p>

            {os === 'Android' && (
              <ol className="text-xs space-y-1 text-gray-600 dark:text-gray-400 list-decimal list-inside">
                <li>Settings → System → Languages & Input</li>
                <li>Text-to-speech → Google TTS → Install voice data</li>
                <li>Download "Indonesian (Indonesia)"</li>
                <li>Refresh halaman ini</li>
              </ol>
            )}

            {os === 'iOS' && (
              <ol className="text-xs space-y-1 text-gray-600 dark:text-gray-400 list-decimal list-inside">
                <li>Settings → Accessibility → Spoken Content</li>
                <li>Voices → Indonesian → Enhanced Quality</li>
                <li>Download (~200MB)</li>
                <li>Refresh halaman ini</li>
              </ol>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={os === 'Android'
                ? 'https://support.google.com/accessibility/android/answer/6006983'
                : 'https://support.apple.com/en-us/HT202362'
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              Panduan Lengkap
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              onClick={handleDismiss}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Nanti saja
            </button>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </button>
      </div>
    </div>
  )
}

export default TTSVoiceSetupBanner
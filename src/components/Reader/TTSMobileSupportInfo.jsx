// src/components/Reader/TTSMobileSupportInfo.jsx
import { AlertCircle, Smartphone, Check, X } from 'lucide-react'

/**
 * TTS Mobile Support Information Component
 * Shows browser compatibility and troubleshooting tips
 */
const TTSMobileSupportInfo = ({ onClose }) => {
  const detectBrowser = () => {
    const ua = navigator.userAgent
    if (/chrome|crios|crmo/i.test(ua) && !/edge|edg/i.test(ua)) return 'Chrome'
    if (/safari/i.test(ua) && !/chrome|crios|crmo/i.test(ua)) return 'Safari'
    if (/firefox|fxios/i.test(ua)) return 'Firefox'
    if (/edge|edg/i.test(ua)) return 'Edge'
    return 'Unknown'
  }

  const detectOS = () => {
    const ua = navigator.userAgent
    if (/android/i.test(ua)) return 'Android'
    if (/iphone|ipad|ipod/i.test(ua)) return 'iOS'
    return 'Desktop'
  }

  const browser = detectBrowser()
  const os = detectOS()
  const isMobile = os === 'Android' || os === 'iOS'

  const browserSupport = {
    'Chrome-Android': { supported: true, notes: 'Full support' },
    'Chrome-iOS': { supported: true, notes: 'Full support' },
    'Safari-iOS': { supported: true, notes: 'Requires user interaction first' },
    'Firefox-Android': { supported: false, notes: 'Not supported' },
    'Firefox-iOS': { supported: false, notes: 'Not supported' },
    'Edge-Android': { supported: true, notes: 'Full support' },
    'Chrome-Desktop': { supported: true, notes: 'Full support' },
    'Safari-Desktop': { supported: true, notes: 'Full support' },
    'Firefox-Desktop': { supported: true, notes: 'Synthesis only' },
    'Edge-Desktop': { supported: true, notes: 'Full support' }
  }

  const currentSupport = browserSupport[`${browser}-${os}`] || { supported: false, notes: 'Unknown browser' }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-lg">TTS Mobile Support</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Current Status */}
          <div className={`p-4 rounded-lg border ${
            currentSupport.supported
              ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
              : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
          }`}>
            <div className="flex items-start gap-3">
              {currentSupport.supported ? (
                <Check className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <X className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <h4 className="font-semibold mb-1">
                  {browser} on {os}
                </h4>
                <p className="text-sm">
                  {currentSupport.supported
                    ? `✅ TTS is supported - ${currentSupport.notes}`
                    : `❌ TTS is not supported - ${currentSupport.notes}`
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Mobile-Specific Info */}
          {isMobile && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm space-y-2">
                  <p className="font-semibold">Mobile Optimization Active</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                    <li>Smaller chunk size (500 chars vs 3000)</li>
                    <li>Longer delays between chunks</li>
                    <li>Enhanced error recovery</li>
                    {os === 'iOS' && <li>iOS-specific workarounds applied</li>}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Troubleshooting */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Troubleshooting Tips
            </h4>

            <div className="space-y-2 text-sm">
              <details className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                <summary className="font-medium cursor-pointer">
                  ❓ TTS tidak berbunyi sama sekali
                </summary>
                <div className="mt-2 space-y-1 text-gray-700 dark:text-gray-300 pl-4">
                  <p>• Pastikan volume perangkat tidak di-mute</p>
                  <p>• Coba tap layar sekali sebelum klik TTS (iOS)</p>
                  <p>• Check permission audio di browser settings</p>
                  <p>• Tutup aplikasi musik/audio lain</p>
                  <p>• Restart browser dan coba lagi</p>
                </div>
              </details>

              <details className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                <summary className="font-medium cursor-pointer">
                  ❓ TTS berhenti di tengah jalan
                </summary>
                <div className="mt-2 space-y-1 text-gray-700 dark:text-gray-300 pl-4">
                  <p>• Normal untuk konten sangat panjang</p>
                  <p>• Sistem akan otomatis lanjut ke chunk berikutnya</p>
                  <p>• Jika macet, tekan Stop lalu Play lagi</p>
                  <p>• Hindari minimize browser saat TTS aktif</p>
                </div>
              </details>

              <details className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                <summary className="font-medium cursor-pointer">
                  ❓ Suara terlalu cepat/lambat
                </summary>
                <div className="mt-2 space-y-1 text-gray-700 dark:text-gray-300 pl-4">
                  <p>• Buka Settings di TTS control panel</p>
                  <p>• Adjust "Kecepatan" slider (0.5x - 2.0x)</p>
                  <p>• Klik "Terapkan Pengaturan"</p>
                  <p>• TTS akan restart dengan setting baru</p>
                </div>
              </details>

              <details className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                <summary className="font-medium cursor-pointer">
                  ❓ Suara tidak tersedia (No voices)
                </summary>
                <div className="mt-2 space-y-1 text-gray-700 dark:text-gray-300 pl-4">
                  <p>• Tunggu beberapa detik, voices loading async</p>
                  <p>• Refresh halaman</p>
                  <p>• Check language settings di perangkat</p>
                  <p>• Download language pack di system settings</p>
                  {os === 'Android' && <p>• Install Google Text-to-Speech app</p>}
                  {os === 'iOS' && <p>• Check Siri voice di iOS Settings</p>}
                </div>
              </details>
            </div>
          </div>

          {/* Browser Compatibility Table */}
          <div className="space-y-2">
            <h4 className="font-semibold">Browser Compatibility</h4>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="text-left p-2">Browser</th>
                    <th className="text-center p-2">Android</th>
                    <th className="text-center p-2">iOS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr>
                    <td className="p-2">Chrome</td>
                    <td className="text-center p-2">✅</td>
                    <td className="text-center p-2">✅</td>
                  </tr>
                  <tr className="bg-gray-50 dark:bg-gray-900">
                    <td className="p-2">Safari</td>
                    <td className="text-center p-2">-</td>
                    <td className="text-center p-2">✅</td>
                  </tr>
                  <tr>
                    <td className="p-2">Firefox</td>
                    <td className="text-center p-2">❌</td>
                    <td className="text-center p-2">❌</td>
                  </tr>
                  <tr className="bg-gray-50 dark:bg-gray-900">
                    <td className="p-2">Edge</td>
                    <td className="text-center p-2">✅</td>
                    <td className="text-center p-2">-</td>
                  </tr>
                  <tr>
                    <td className="p-2">Samsung Internet</td>
                    <td className="text-center p-2">⚠️</td>
                    <td className="text-center p-2">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500">
              ✅ Full support | ⚠️ Partial support | ❌ Not supported
            </p>
          </div>

          {/* Recommendations */}
          {!currentSupport.supported && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <h4 className="font-semibold mb-2 text-yellow-800 dark:text-yellow-400">
                📱 Recommended Browsers
              </h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                For the best TTS experience on mobile, we recommend:
              </p>
              <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                {os === 'Android' && (
                  <>
                    <li>• <strong>Chrome for Android</strong> - Best support</li>
                    <li>• <strong>Edge for Android</strong> - Good alternative</li>
                  </>
                )}
                {os === 'iOS' && (
                  <>
                    <li>• <strong>Safari</strong> - Native iOS support</li>
                    <li>• <strong>Chrome for iOS</strong> - Good alternative</li>
                  </>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4">
          <button
            onClick={onClose}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  )
}

export default TTSMobileSupportInfo
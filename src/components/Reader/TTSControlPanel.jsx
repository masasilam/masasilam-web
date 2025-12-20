// src/components/Reader/TTSControlPanel.jsx
import { Volume2, VolumeX, Pause, Play, SkipForward, SkipBack, Settings, HelpCircle } from 'lucide-react'
import { useState } from 'react'
import TTSMobileSupportInfo from './TTSMobileSupportInfo'

/**
 * TTS Control Panel Component
 * Displays floating control panel for Text-to-Speech
 */
const TTSControlPanel = ({
  isPlaying,
  progress,
  rate,
  pitch,
  voiceIndex,
  availableVoices,
  showSettings,
  onTogglePlay,
  onStop,
  onPrevChapter,
  onNextChapter,
  onToggleSettings,
  onRateChange,
  onPitchChange,
  onVoiceChange,
  onApplySettings,
  hasPrevChapter,
  hasNextChapter
}) => {
  const [showSupportInfo, setShowSupportInfo] = useState(false)

  // Check if Indonesian voice is available
  const hasIndonesianVoice = availableVoices.some(v =>
    v.lang.startsWith('id') ||
    v.lang.toLowerCase().includes('indonesia')
  )

  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent)

  return (
    <>
      {showSupportInfo && (
        <TTSMobileSupportInfo onClose={() => setShowSupportInfo(false)} />
      )}
    <div className="fixed top-20 right-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-4 w-80">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          Text to Speech
        </h4>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSupportInfo(true)}
            className="p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400"
            title="Help & Troubleshooting"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
          <button
            onClick={onStop}
            className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
            title="Stop TTS"
          >
            <VolumeX className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="mb-3">
        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1 flex justify-between">
          <span>Progress</span>
          <span className="font-medium">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* No Indonesian Voice Warning */}
      {isMobile && !hasIndonesianVoice && availableVoices.length > 0 && (
        <div className="mb-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <span className="text-yellow-600 dark:text-yellow-400 text-lg">⚠️</span>
            <div className="flex-1 text-xs">
              <p className="font-semibold text-yellow-800 dark:text-yellow-400 mb-1">
                Suara Indonesia tidak tersedia
              </p>
              <p className="text-yellow-700 dark:text-yellow-300 mb-2">
                Menggunakan suara default. Untuk hasil terbaik, install bahasa Indonesia di perangkat Anda.
              </p>
              <button
                onClick={() => setShowSupportInfo(true)}
                className="text-yellow-800 dark:text-yellow-400 underline hover:no-underline"
              >
                Cara install suara Indonesia →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Playback Controls */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <button
          onClick={onPrevChapter}
          disabled={!hasPrevChapter}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Bab sebelumnya"
        >
          <SkipBack className="w-5 h-5" />
        </button>

        <button
          onClick={onTogglePlay}
          className="p-3 rounded-full bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-lg"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
        </button>

        <button
          onClick={onNextChapter}
          disabled={!hasNextChapter}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Bab selanjutnya"
        >
          <SkipForward className="w-5 h-5" />
        </button>
      </div>

      {/* Settings Toggle */}
      <button
        onClick={onToggleSettings}
        className="w-full text-xs text-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium py-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center justify-center gap-1"
      >
        <Settings className="w-3 h-3" />
        {showSettings ? 'Sembunyikan Pengaturan' : 'Pengaturan'}
      </button>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-3">
          {/* Speed Control */}
          <div>
            <label className="text-xs font-medium block mb-2 text-gray-700 dark:text-gray-300">
              Kecepatan: {rate.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={rate}
              onChange={(e) => onRateChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>0.5x</span>
              <span>1.0x</span>
              <span>2.0x</span>
            </div>
          </div>

          {/* Pitch Control */}
          <div>
            <label className="text-xs font-medium block mb-2 text-gray-700 dark:text-gray-300">
              Nada: {pitch.toFixed(1)}
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={pitch}
              onChange={(e) => onPitchChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>0.5</span>
              <span>1.0</span>
              <span>2.0</span>
            </div>
          </div>

          {/* Voice Selection */}
          {availableVoices.length > 0 && (
            <div>
              <label className="text-xs font-medium block mb-2 text-gray-700 dark:text-gray-300">
                Suara ({availableVoices.length} tersedia)
              </label>
              <select
                value={voiceIndex}
                onChange={(e) => onVoiceChange(parseInt(e.target.value))}
                className="w-full text-xs p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500"
              >
                {availableVoices.map((voice, index) => {
                  const isIndonesian = voice.lang.startsWith('id') || voice.lang.toLowerCase().includes('indonesia')
                  return (
                    <option key={index} value={index}>
                      {isIndonesian ? '🇮🇩 ' : ''}{voice.name} ({voice.lang})
                    </option>
                  )
                })}
              </select>

              {/* Current voice info */}
              {availableVoices[voiceIndex] && (
                <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 rounded p-2">
                  <div className="flex items-center justify-between">
                    <span>
                      {availableVoices[voiceIndex].lang.startsWith('id') ? '✅' : '⚠️'}
                      {' '}{availableVoices[voiceIndex].name}
                    </span>
                    {!availableVoices[voiceIndex].lang.startsWith('id') && (
                      <span className="text-yellow-600 dark:text-yellow-400">
                        Non-ID
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* No Voices Warning */}
          {availableVoices.length === 0 && (
            <div className="text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
              ⚠️ Loading voices...
            </div>
          )}

          {/* Apply Button */}
          <button
            onClick={onApplySettings}
            className="w-full py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow"
          >
            Terapkan Pengaturan
          </button>
        </div>
      )}
    </div>
    </>
  )
}

export default TTSControlPanel
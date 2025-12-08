// src/components/Reader/TTSControlPanel.jsx
import { Volume2, VolumeX, Pause, Play, SkipForward, SkipBack } from 'lucide-react'

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
  return (
    <div className="fixed top-20 right-4 z-40 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 w-72">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <Volume2 className="w-4 h-4" />
          Text to Speech
        </h4>
        <button 
          onClick={onStop} 
          className="text-red-500 hover:text-red-700 transition-colors"
          title="Stop TTS"
        >
          <VolumeX className="w-4 h-4" />
        </button>
      </div>

      {/* Progress indicator */}
      <div className="mb-3">
        <div className="text-xs text-gray-500 mb-1">
          Progress: {progress}%
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
          <div 
            className="bg-primary h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <button
          onClick={onPrevChapter}
          disabled={!hasPrevChapter}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Bab sebelumnya"
        >
          <SkipBack className="w-5 h-5" />
        </button>
        
        <button
          onClick={onTogglePlay}
          className="p-3 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
        </button>
        
        <button
          onClick={onNextChapter}
          disabled={!hasNextChapter}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Bab selanjutnya"
        >
          <SkipForward className="w-5 h-5" />
        </button>
      </div>

      {/* Settings Toggle */}
      <button
        onClick={onToggleSettings}
        className="w-full text-xs text-center text-primary hover:underline transition-colors"
      >
        {showSettings ? 'Sembunyikan' : 'Pengaturan'} ⚙️
      </button>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-3">
          {/* Speed Control */}
          <div>
            <label className="text-xs font-medium block mb-1">
              Kecepatan: {rate.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={rate}
              onChange={(e) => onRateChange(parseFloat(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0.5x</span>
              <span>1.0x</span>
              <span>2.0x</span>
            </div>
          </div>

          {/* Pitch Control */}
          <div>
            <label className="text-xs font-medium block mb-1">
              Nada: {pitch.toFixed(1)}
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={pitch}
              onChange={(e) => onPitchChange(parseFloat(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0.5</span>
              <span>1.0</span>
              <span>2.0</span>
            </div>
          </div>

          {/* Voice Selection */}
          {availableVoices.length > 0 && (
            <div>
              <label className="text-xs font-medium block mb-1">Suara</label>
              <select
                value={voiceIndex}
                onChange={(e) => onVoiceChange(parseInt(e.target.value))}
                className="w-full text-xs p-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white cursor-pointer"
              >
                {availableVoices.map((voice, index) => (
                  <option key={index} value={index}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Apply Button */}
          <button
            onClick={onApplySettings}
            className="w-full py-2 bg-primary text-white rounded-lg text-xs hover:bg-primary/90 transition-colors"
          >
            Terapkan Pengaturan
          </button>
        </div>
      )}
    </div>
  )
}

export default TTSControlPanel
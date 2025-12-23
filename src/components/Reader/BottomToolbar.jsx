// src/components/Reader/BottomToolbar.jsx
import {
  ChevronLeft,
  ChevronRight,
  Volume2,
  Pause,
  Lock,
  Search,
  Menu,
  Bookmark,
  Download,
  ChevronUp
} from 'lucide-react'

const BottomToolbar = ({
  chapter,
  isAuthenticated,
  isTTSPlaying,
  readingMode,
  showTTSPanel, // ✅ NEW
  onPrevChapter,
  onNextChapter,
  onTTSToggle,
  onToggleTTSPanel, // ✅ NEW
  onSearchClick,
  onToolbarToggle,
  onBookmarkClick,
  onExportClick,
  onReadingModeToggle
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50 shadow-lg overflow-visible">
      {/* ✅ NEW: TTS Minimized Indicator - Show when TTS is playing but panel is hidden */}
      {isAuthenticated && isTTSPlaying && !showTTSPanel && (
        <div className="border-b border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <button
            onClick={onToggleTTSPanel}
            className="w-full px-4 py-2 flex items-center justify-between hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  Audio sedang diputar
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-blue-600 dark:text-blue-400">Aktif</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <span className="text-xs">Buka Panel</span>
              <ChevronUp className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      <div className="flex items-center py-3 px-2 sm:px-4 gap-2 overflow-visible">
        {/* Left: Previous Button - FIXED POSITION */}
        <button
          onClick={onPrevChapter}
          disabled={!chapter?.previousChapter}
          className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-all min-w-[50px] flex-shrink-0 ${
            chapter?.previousChapter
              ? 'hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105'
              : 'opacity-30 cursor-not-allowed'
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-[9px] sm:text-xs font-medium">Prev</span>
        </button>

        {/* Center: Scrollable Action Buttons */}
        <div className="flex-1 overflow-x-auto hide-scrollbar overflow-y-visible">
          <div className="flex items-center gap-1 sm:gap-2 justify-center min-w-max px-1 py-2">
            {/* Reading Mode Toggle */}
            <button
              onClick={onReadingModeToggle}
              className={`flex flex-col items-center gap-1 px-2 sm:px-3 py-2 rounded-lg transition-all flex-shrink-0 ${
                readingMode
                  ? 'bg-[#8B7355] text-white shadow-md scale-105'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105'
              }`}
              title={readingMode ? 'Mode Normal' : 'Mode Baca'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="text-[9px] sm:text-xs whitespace-nowrap">
                {readingMode ? 'Normal' : 'Baca'}
              </span>
            </button>

            {/* ✅ MODIFIED: TTS Button - dengan indicator panel tersembunyi */}
            <button
              onClick={onTTSToggle}
              className={`flex flex-col items-center gap-1 px-2 sm:px-3 py-2 rounded-lg transition-all relative flex-shrink-0 overflow-visible ${
                isAuthenticated && isTTSPlaying
                  ? 'bg-primary text-white shadow-md scale-105'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105'
              }`}
            >
              {!isAuthenticated && (
                <div className="absolute -top-1 -right-1 bg-primary text-white rounded-full p-0.5 shadow-md z-10">
                  <Lock className="w-3 h-3" />
                </div>
              )}
              {/* ✅ Show green dot when playing with panel hidden */}
              {isAuthenticated && isTTSPlaying && !showTTSPanel && (
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full animate-pulse border border-white dark:border-gray-900"></div>
              )}
              {isAuthenticated && isTTSPlaying ? <Pause className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              <span className="text-[9px] sm:text-xs whitespace-nowrap">
                {isAuthenticated && isTTSPlaying ? 'Pause' : 'Dengar'}
              </span>
            </button>

            {/* Search Button */}
            <button
              onClick={onSearchClick}
              className="flex flex-col items-center gap-1 px-2 sm:px-3 py-2 rounded-lg transition-all hover:scale-105 hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0 relative overflow-visible"
            >
              {!isAuthenticated && (
                <div className="absolute -top-1 -right-1 bg-primary text-white rounded-full p-0.5 shadow-md z-10">
                  <Lock className="w-3 h-3" />
                </div>
              )}
              <Search className="w-5 h-5" />
              <span className="text-[9px] sm:text-xs whitespace-nowrap">Cari</span>
            </button>

            {/* Annotation Button */}
            <button
              onClick={onToolbarToggle}
              className="flex flex-col items-center gap-1 px-2 sm:px-3 py-2 rounded-lg transition-all relative hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105 flex-shrink-0 overflow-visible"
            >
              {!isAuthenticated && (
                <div className="absolute -top-1 -right-1 bg-primary text-white rounded-full p-0.5 shadow-md z-10">
                  <Lock className="w-3 h-3" />
                </div>
              )}
              <Menu className="w-5 h-5" />
              <span className="text-[9px] sm:text-xs whitespace-nowrap">Anotasi</span>
            </button>

            {/* Bookmark Button */}
            <button
              onClick={onBookmarkClick}
              className="flex flex-col items-center gap-1 px-2 sm:px-3 py-2 rounded-lg transition-all hover:scale-105 relative hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0 overflow-visible"
            >
              {!isAuthenticated && (
                <div className="absolute -top-1 -right-1 bg-primary text-white rounded-full p-0.5 shadow-md z-10">
                  <Lock className="w-3 h-3" />
                </div>
              )}
              <Bookmark className="w-5 h-5" />
              <span className="text-[9px] sm:text-xs whitespace-nowrap">Penanda</span>
            </button>

            {/* Export Button */}
            <button
              onClick={() => alert('Fitur ekspor segera hadir!')}
              className="flex flex-col items-center gap-1 px-2 sm:px-3 py-2 rounded-lg transition-all hover:scale-105 hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0 relative overflow-visible"
            >
              <Download className="w-5 h-5" />
              <span className="text-[9px] sm:text-xs whitespace-nowrap">Ekspor</span>
            </button>
          </div>
        </div>

        {/* Right: Next Button - FIXED POSITION */}
        <button
          onClick={onNextChapter}
          disabled={!chapter?.nextChapter}
          className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-all min-w-[50px] flex-shrink-0 ${
            chapter?.nextChapter
              ? 'hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105'
              : 'opacity-30 cursor-not-allowed'
          }`}
        >
          <ChevronRight className="w-5 h-5" />
          <span className="text-[9px] sm:text-xs font-medium">Next</span>
        </button>
      </div>
    </div>
  )
}

export default BottomToolbar
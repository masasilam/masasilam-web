// ============================================
// FILE 14: src/hooks/useKeyboardShortcuts.js
// ============================================
import { useEffect } from 'react'

const useKeyboardShortcuts = ({
  chapter,
  isAuthenticated,
  isTTSPlaying,
  footnotePopup,
  showSearchModal,
  showExportModal,
  onPrevChapter,
  onNextChapter,
  onTTSToggle,
  onSearchOpen,
  onFootnoteClose,
  onSearchClose,
  onExportClose
}) => {
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
        return
      }

      // Navigation
      if ((e.key === 'ArrowLeft' || e.key.toLowerCase() === 'p') && chapter?.previousChapter) {
        e.preventDefault()
        onPrevChapter()
      }
      if ((e.key === 'ArrowRight' || e.key.toLowerCase() === 'n') && chapter?.nextChapter) {
        e.preventDefault()
        onNextChapter()
      }

      // TTS
      if ((e.key === ' ' || e.key.toLowerCase() === 'k') && chapter?.htmlContent) {
        e.preventDefault()
        onTTSToggle()
      }

      // Search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault()
        if (isAuthenticated) {
          onSearchOpen()
        }
      }

      // Close modals
      if (e.key === 'Escape') {
        if (footnotePopup) onFootnoteClose()
        if (showSearchModal) onSearchClose()
        if (showExportModal) onExportClose()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [
    chapter,
    isAuthenticated,
    isTTSPlaying,
    footnotePopup,
    showSearchModal,
    showExportModal,
    onPrevChapter,
    onNextChapter,
    onTTSToggle,
    onSearchOpen,
    onFootnoteClose,
    onSearchClose,
    onExportClose
  ])
}

export default useKeyboardShortcuts
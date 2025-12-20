// ============================================
// FILE 13: src/hooks/useTextSelection.js
// ============================================
import { useState, useEffect } from 'react'

const useTextSelection = (contentRef, isInteractingWithPopup) => {
  const [selectedText, setSelectedText] = useState('')
  const [selectionRange, setSelectionRange] = useState(null)
  const [selectionCoords, setSelectionCoords] = useState(null)

  useEffect(() => {
    const handleSelection = () => {
      if (isInteractingWithPopup) return
      const selection = window.getSelection()
      const text = selection.toString().trim()
      const target = selection.anchorNode
      if (!target) return

      const isInForm = target.nodeType === Node.TEXT_NODE
        ? (target.parentElement?.closest('textarea, input, [contenteditable="true"]') !== null)
        : (target.closest?.('textarea, input, [contenteditable="true"]') !== null)
      if (isInForm) return

      const chapterContentDiv = contentRef.current?.querySelector('.chapter-content')
      const isInChapterContent = chapterContentDiv?.contains(selection.anchorNode)

      if (text && isInChapterContent) {
        setSelectedText(text)
        const range = selection.getRangeAt(0).cloneRange()
        setSelectionRange(range)
        const rect = range.getBoundingClientRect()
        const popupHeight = 400
        const spaceBelow = window.innerHeight - rect.bottom
        const spaceAbove = rect.top
        const showAbove = spaceAbove > spaceBelow || spaceBelow < popupHeight
        const top = showAbove
          ? rect.top + window.scrollY - popupHeight - 10
          : rect.bottom + window.scrollY + 10
        const left = rect.left + (rect.width / 2)
        setSelectionCoords({ top, left })
      } else if (!isInteractingWithPopup && !isInForm) {
        clearSelection()
      }
    }

    const clearSelection = () => {
      setSelectedText('')
      setSelectionRange(null)
      setSelectionCoords(null)
    }

    document.addEventListener('mouseup', handleSelection)
    document.addEventListener('touchend', handleSelection)
    return () => {
      document.removeEventListener('mouseup', handleSelection)
      document.removeEventListener('touchend', handleSelection)
    }
  }, [isInteractingWithPopup, contentRef])

  const clearSelection = () => {
    setSelectedText('')
    setSelectionRange(null)
    setSelectionCoords(null)
  }

  return {
    selectedText,
    selectionRange,
    selectionCoords,
    clearSelection
  }
}

export default useTextSelection
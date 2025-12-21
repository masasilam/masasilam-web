// ============================================
// FILE: src/hooks/useTextSelection.js - ULTIMATE FIX
// ============================================
import { useState, useEffect } from 'react'

const useTextSelection = (contentRef, isInteractingWithPopup) => {
  const [selectedText, setSelectedText] = useState('')
  const [selectionRange, setSelectionRange] = useState(null)
  const [selectionCoords, setSelectionCoords] = useState(null)

  // ✅ Normalize text by removing extra whitespace but keeping line breaks
  const normalizeText = (text) => {
    // Replace multiple spaces/tabs with single space
    // But keep newlines
    return text.replace(/[ \t]+/g, ' ').trim()
  }

  // ✅ Get normalized text content
  const getNormalizedContent = (container) => {
    const text = container.textContent || ''
    return normalizeText(text)
  }

  useEffect(() => {
    const handleSelection = () => {
      if (isInteractingWithPopup) return
      const selection = window.getSelection()
      const rawText = selection.toString()
      const text = normalizeText(rawText)

      if (!text) return

      const target = selection.anchorNode
      if (!target) return

      const isInForm = target.nodeType === Node.TEXT_NODE
        ? (target.parentElement?.closest('textarea, input, [contenteditable="true"]') !== null)
        : (target.closest?.('textarea, input, [contenteditable="true"]') !== null)
      if (isInForm) return

      const chapterContentDiv = contentRef.current?.querySelector('.chapter-content')
      const isInChapterContent = chapterContentDiv?.contains(selection.anchorNode)

      if (text && isInChapterContent && chapterContentDiv) {
        const range = selection.getRangeAt(0).cloneRange()

        // Get normalized full content
        const fullContent = getNormalizedContent(chapterContentDiv)

        // Get preceding text (normalized)
        const precedingRange = document.createRange()
        precedingRange.setStart(chapterContentDiv, 0)
        precedingRange.setEnd(range.startContainer, range.startOffset)
        const precedingText = normalizeText(precedingRange.toString())

        // Calculate offsets in normalized text
        const startOffset = precedingText.length
        const endOffset = startOffset + text.length

        // Verify
        const textAtPosition = fullContent.substring(startOffset, endOffset)
        const matches = textAtPosition === text

        console.log('📝 Selection captured:', {
          text: text.substring(0, 50),
          startOffset,
          endOffset,
          length: text.length,
          verification: matches ? '✅ Match' : '⚠️ Mismatch',
          textAtPosition: textAtPosition.substring(0, 50)
        })

        if (!matches) {
          console.warn('⚠️ Text verification failed')
          console.warn('Expected:', text)
          console.warn('Found:', textAtPosition)
        }

        setSelectedText(text)
        setSelectionRange({
          range,
          startOffset,
          endOffset
        })

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
    window.getSelection()?.removeAllRanges()
  }

  return {
    selectedText,
    selectionRange,
    selectionCoords,
    clearSelection
  }
}

export default useTextSelection
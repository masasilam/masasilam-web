import { useState, useEffect } from 'react'

const useTextSelection = (contentRef, isInteractingWithPopup) => {
  const [selectedText, setSelectedText] = useState('')
  const [selectionRange, setSelectionRange] = useState(null)
  const [selectionCoords, setSelectionCoords] = useState(null)

  const normalizeText = (text) => {
    return text.replace(/\s+/g, ' ').trim()
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

        const walker = document.createTreeWalker(
          chapterContentDiv,
          NodeFilter.SHOW_TEXT,
          {
            acceptNode: (node) => {
              if (node.parentElement?.closest('script, style')) {
                return NodeFilter.FILTER_REJECT
              }
              return NodeFilter.FILTER_ACCEPT
            }
          }
        )

        let currentPos = 0
        let startOffset = -1
        let node

        while (node = walker.nextNode()) {
          const nodeText = normalizeText(node.textContent)
          const nodeLength = nodeText.length

          if (node === range.startContainer) {
            startOffset = currentPos + Math.min(range.startOffset, node.textContent.length)
            break
          }

          currentPos = currentPos + nodeLength + 1
        }

        if (startOffset === -1) startOffset = 0

        const endOffset = startOffset + text.length

        setSelectedText(text)
        setSelectionRange({
          range,
          startOffset,
          endOffset
        })

        // ✅ PERBAIKAN: Gunakan getBoundingClientRect() tanpa menambahkan scrollY
        const rect = range.getBoundingClientRect()
        const popupHeight = 400
        const popupWidth = 320
        const padding = 10

        // Hitung posisi vertikal relatif terhadap viewport
        const spaceBelow = window.innerHeight - rect.bottom
        const spaceAbove = rect.top
        const showAbove = spaceBelow < popupHeight && spaceAbove > spaceBelow

        // ✅ FIXED: Gunakan posisi fixed, jadi tidak perlu scrollY
        const top = showAbove
          ? rect.top - popupHeight - padding
          : rect.bottom + padding

        // Hitung posisi horizontal (center of selection)
        const centerX = rect.left + (rect.width / 2)
        let left = centerX

        // Batasi agar tidak keluar viewport
        const minLeft = (popupWidth / 2) + padding
        const maxLeft = window.innerWidth - (popupWidth / 2) - padding

        if (left < minLeft) {
          left = minLeft
        } else if (left > maxLeft) {
          left = maxLeft
        }

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
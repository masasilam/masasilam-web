// ============================================
// FILE: src/components/Reader/ChapterContent.jsx - MULTI-PARAGRAPH SUPPORT
// ============================================
import { memo, useEffect, useRef } from 'react'

const ChapterContent = memo(({ htmlContent, fontSize, readingMode, highlights = [], notes = [] }) => {
  const contentRef = useRef(null)

  const normalizeText = (text) => {
    return text.replace(/\s+/g, ' ').trim()
  }

  // Force list styles after render
  useEffect(() => {
    if (!contentRef.current) return

    const container = contentRef.current

    const allOls = container.querySelectorAll('ol')
    allOls.forEach((ol) => {
      const type = ol.getAttribute('type')
      ol.style.setProperty('display', 'block', 'important')
      ol.style.setProperty('padding-left', '2.5em', 'important')
      ol.style.setProperty('list-style-position', 'outside', 'important')

      if (type === 'A') {
        ol.style.setProperty('list-style-type', 'upper-alpha', 'important')
      } else if (type === 'a') {
        ol.style.setProperty('list-style-type', 'lower-alpha', 'important')
      } else if (type === 'I') {
        ol.style.setProperty('list-style-type', 'upper-roman', 'important')
      } else if (type === 'i') {
        ol.style.setProperty('list-style-type', 'lower-roman', 'important')
      } else {
        ol.style.setProperty('list-style-type', 'decimal', 'important')
      }
    })

    const allLis = container.querySelectorAll('li')
    allLis.forEach((li) => {
      li.style.setProperty('display', 'list-item', 'important')
      li.style.setProperty('padding-left', '0.3em', 'important')
    })
  }, [htmlContent])

  // Handle highlights AND notes
  useEffect(() => {
    if (!contentRef.current) return

    const container = contentRef.current

    // ALWAYS remove existing marks first (important for cleanup)
    // Use a more robust cleanup method
    const cleanupMarks = () => {
      const existingMarks = container.querySelectorAll('mark.highlight-mark, mark.note-mark')
      existingMarks.forEach((mark) => {
        const parent = mark.parentNode
        if (parent) {
          // Move all child nodes out of the mark
          while (mark.firstChild) {
            parent.insertBefore(mark.firstChild, mark)
          }
          // Remove the empty mark element
          parent.removeChild(mark)
        }
      })

      // Also check for any orphaned marks without class
      const allMarks = container.querySelectorAll('mark')
      allMarks.forEach((mark) => {
        // Only remove marks with our data attributes
        if (mark.hasAttribute('data-highlight-id') || mark.hasAttribute('data-note-id')) {
          const parent = mark.parentNode
          if (parent) {
            while (mark.firstChild) {
              parent.insertBefore(mark.firstChild, mark)
            }
            parent.removeChild(mark)
          }
        }
      })
    }

    cleanupMarks()
    container.normalize()

    // If no annotations, just return after cleanup
    if ((!highlights || highlights.length === 0) && (!notes || notes.length === 0)) {
      return
    }

    // Build text position map
    const { textNodes, fullText } = buildTextNodeMap(container)

    // Process highlights with position-based approach
    highlights.forEach((highlight) => {
      const { id, highlightedText, color, startPosition, endPosition } = highlight
      const start = parseInt(startPosition)
      const end = parseInt(endPosition)

      if (isNaN(start) || isNaN(end) || start < 0 || end <= start) return

      // Make colors lighter for better readability
      let lighterColor = color || '#FFEB3B'
      const colorMap = {
        '#FFEB3B': '#FFF9C4', // Yellow - lighter
        '#4CAF50': '#C8E6C9', // Green - lighter
        '#2196F3': '#BBDEFB', // Blue - lighter
        '#FF9800': '#FFE0B2', // Orange - lighter
        '#F44336': '#FFCDD2'  // Red - lighter
      }
      lighterColor = colorMap[color] || lighterColor

      applyAnnotationByPosition(textNodes, fullText, {
        id,
        start,
        end,
        color: lighterColor,
        type: 'highlight',
        expectedText: normalizeText(highlightedText)
      })
    })

    // Process notes
    notes.forEach((note) => {
      const { id, selectedText } = note

      if (!selectedText || !selectedText.trim()) return

      const text = normalizeText(selectedText)

      // Try to find the note text in fullText
      const searchText = text.toLowerCase()
      const fullTextLower = fullText.toLowerCase()
      const index = fullTextLower.indexOf(searchText)

      if (index !== -1) {
        applyAnnotationByPosition(textNodes, fullText, {
          id,
          start: index,
          end: index + text.length,
          color: '#E9D5FF',
          type: 'note',
          expectedText: text
        })
      }
    })

    container.normalize()
  }, [highlights, notes])

  // Build a map of all text nodes with their positions
  const buildTextNodeMap = (container) => {
    const textNodes = []
    let fullText = ''

    const walker = document.createTreeWalker(
      container,
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

    let node
    while ((node = walker.nextNode())) {
      const text = node.textContent
      const startPos = fullText.length
      const endPos = startPos + text.length

      textNodes.push({
        node,
        startPos,
        endPos,
        text
      })

      fullText += text
    }

    return { textNodes, fullText }
  }

  // Apply annotation using position-based approach
  const applyAnnotationByPosition = (textNodes, fullText, annotation) => {
    const { id, start, end, color, type, expectedText } = annotation

    try {
      const normalizedExpected = normalizeText(expectedText)
      let adjustedStart = start
      let adjustedEnd = end

      // Find the actual position of the expected text in fullText
      // This handles discrepancies between backend and frontend text extraction
      const searchWindow = fullText.substring(Math.max(0, start - 50), Math.min(fullText.length, end + 50))
      const normalizedWindow = normalizeText(searchWindow)
      const expectedIndex = normalizedWindow.toLowerCase().indexOf(normalizedExpected.toLowerCase())

      if (expectedIndex !== -1) {
        // Calculate actual positions based on where we found the text
        const windowStart = Math.max(0, start - 50)

        // Map back from normalized to actual positions
        let actualStartInWindow = 0
        let actualEndInWindow = 0
        let normalizedPos = 0

        for (let i = 0; i < searchWindow.length && normalizedPos <= expectedIndex + normalizedExpected.length; i++) {
          if (normalizedPos === expectedIndex) {
            actualStartInWindow = i
          }
          if (normalizedPos === expectedIndex + normalizedExpected.length) {
            actualEndInWindow = i
            break
          }

          // Count position in normalized text
          const char = searchWindow[i]
          if (!/\s/.test(char)) {
            normalizedPos++
          } else if (i > 0 && !/\s/.test(searchWindow[i - 1])) {
            normalizedPos++
          }
        }

        // If we didn't find the end, use the rest of the match
        if (actualEndInWindow === 0) {
          actualEndInWindow = actualStartInWindow + normalizedExpected.length
        }

        adjustedStart = windowStart + actualStartInWindow
        adjustedEnd = windowStart + actualEndInWindow

        // Extend to include trailing punctuation
        while (adjustedEnd < fullText.length && /[.,;:!?)\]]/.test(fullText[adjustedEnd])) {
          adjustedEnd++
        }

      } else {
        // Fallback: just extend end to include punctuation
        while (adjustedEnd < fullText.length && /[.,;:!?)\]]/.test(fullText[adjustedEnd])) {
          adjustedEnd++
        }
      }

      // Verify the final extracted text
      const extractedText = normalizeText(fullText.substring(adjustedStart, adjustedEnd))

      if (extractedText !== normalizedExpected) {
        // Last resort: try to find the exact text anywhere in a reasonable range
        const largeWindow = fullText.substring(Math.max(0, start - 100), Math.min(fullText.length, end + 100))
        const exactIndex = largeWindow.toLowerCase().indexOf(normalizedExpected.toLowerCase())

        if (exactIndex !== -1) {
          const windowStart = Math.max(0, start - 100)
          adjustedStart = windowStart + exactIndex
          adjustedEnd = adjustedStart + normalizedExpected.length

          // Extend to include trailing punctuation
          while (adjustedEnd < fullText.length && /[.,;:!?)\]]/.test(fullText[adjustedEnd])) {
            adjustedEnd++
          }

          console.log(`Position corrected for ${type} ${id}: [${start},${end}] → [${adjustedStart},${adjustedEnd}]`)
        } else {
          console.warn(`Could not find exact match for ${type} ${id}:`, {
            expected: normalizedExpected.substring(0, 100) + '...',
            found: extractedText.substring(0, 100) + '...'
          })
        }
      }

      // Find all text nodes that overlap with [adjustedStart, adjustedEnd]
      const affectedNodes = textNodes.filter(({ startPos, endPos }) =>
        endPos > adjustedStart && startPos < adjustedEnd
      )

      if (affectedNodes.length === 0) {
        console.warn(`No nodes found for ${type} ${id}`)
        return
      }

      // Apply mark to each affected node
      affectedNodes.forEach(({ node, startPos, endPos }) => {
        // Calculate the overlap within this specific node
        const nodeStart = Math.max(0, adjustedStart - startPos)
        const nodeEnd = Math.min(node.textContent.length, adjustedEnd - startPos)

        if (nodeEnd > nodeStart) {
          applyMarkToNode(node, nodeStart, nodeEnd, id, color, type)
        }
      })

    } catch (error) {
      console.error(`Error applying ${type}:`, error)
    }
  }

  // Apply mark to a portion of a text node
  const applyMarkToNode = (node, startOffset, endOffset, id, color, type) => {
    try {
      // Skip if already marked
      if (node.parentElement?.closest('mark')) {
        return
      }

      const range = document.createRange()
      range.setStart(node, startOffset)
      range.setEnd(node, endOffset)

      const mark = createMarkElement(id, color, type)

      try {
        range.surroundContents(mark)
      } catch (e) {
        // Fallback: extract and wrap
        const contents = range.extractContents()
        mark.appendChild(contents)
        range.insertNode(mark)
      }
    } catch (error) {
      console.error('Error applying mark to node:', error)
    }
  }

  // Create mark element with consistent styling
  const createMarkElement = (id, color, type) => {
    const mark = document.createElement('mark')
    mark.className = type === 'highlight' ? 'highlight-mark' : 'note-mark'
    mark.style.backgroundColor = color
    mark.style.padding = '2px 0'
    mark.style.borderRadius = '2px'
    mark.style.transition = 'all 0.2s'
    mark.setAttribute(`data-${type}-id`, id)

    // Add visual distinction for notes
    if (type === 'note') {
      mark.style.borderBottom = '2px dotted #9333EA'
      mark.style.cursor = 'help'
      mark.title = 'Catatan tersedia'
    }

    return mark
  }

  return (
    <div
      ref={contentRef}
      lang="id"
      className={`chapter-content max-w-none ${
        readingMode ? 'reading-mode-active' : ''
      }`}
      style={{
        fontSize: `${fontSize}px`,
        lineHeight: '1.8',
        userSelect: 'text',
        color: readingMode ? '#2d2d2d' : undefined
      }}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  )
})

ChapterContent.displayName = 'ChapterContent'
export default ChapterContent
// ============================================
// FILE: src/components/Reader/ChapterContent.jsx - ROBUST HIGHLIGHTING
// ============================================
import { memo, useEffect, useRef } from 'react'

const ChapterContent = memo(({ htmlContent, fontSize, readingMode, highlights = [] }) => {
  const contentRef = useRef(null)

  // ✅ Normalize text function (same as useTextSelection)
  const normalizeText = (text) => {
    return text.replace(/[ \t]+/g, ' ').trim()
  }

  const getNormalizedContent = (container) => {
    const text = container.textContent || ''
    return normalizeText(text)
  }

  // Apply highlights after content is rendered
  useEffect(() => {
    if (!contentRef.current || !highlights || highlights.length === 0) return

    const container = contentRef.current

    // Remove existing highlights first
    const existingMarks = container.querySelectorAll('mark.highlight-mark')
    existingMarks.forEach(mark => {
      const textNode = document.createTextNode(mark.textContent)
      mark.parentNode.replaceChild(textNode, mark)
    })

    // ✅ Use normalized text (same method as selection)
    const plainText = getNormalizedContent(container)

    console.log('🎨 Applying highlights:', highlights.length, 'Total text length:', plainText.length)

    // Apply highlights using position-based approach
    highlights.forEach(highlight => {
      const startPos = parseInt(highlight.startPosition)
      const endPos = parseInt(highlight.endPosition)
      const text = highlight.highlightedText

      console.log('📍 Processing highlight:', {
        id: highlight.id,
        startPos,
        endPos,
        text: text?.substring(0, 50),
        color: highlight.color
      })

      // Validation
      if (!text || text.trim() === '') {
        console.warn('⚠️ Empty highlight text')
        return
      }

      if (isNaN(startPos) || isNaN(endPos)) {
        console.warn('⚠️ Invalid positions:', { startPos, endPos })
        return
      }

      if (startPos < 0 || endPos <= startPos || endPos > plainText.length) {
        console.warn('⚠️ Out of bounds:', { startPos, endPos, textLength: plainText.length })
        return
      }

      // Verify the text matches at the specified position
      const textAtPosition = plainText.substring(startPos, endPos)

      console.log('🔍 Verification:', {
        expected: text,
        found: textAtPosition,
        match: textAtPosition === text
      })

      if (textAtPosition !== text) {
        console.warn('⚠️ Text mismatch at position:', {
          expected: text,
          found: textAtPosition,
          startPos,
          endPos
        })
        return
      }

      console.log('✅ Text match verified, applying highlight')

      // Find the text node that contains this position using Range
      const range = document.createRange()

      try {
        // Walk through to find the correct text node
        const walker = document.createTreeWalker(
          container,
          NodeFilter.SHOW_TEXT,
          {
            acceptNode: (node) => {
              if (node.parentElement.closest('mark, script, style')) {
                return NodeFilter.FILTER_REJECT
              }
              return NodeFilter.FILTER_ACCEPT
            }
          },
          false
        )

        let currentPos = 0
        let node
        let applied = false

        while (node = walker.nextNode()) {
          const nodeLength = node.textContent.length
          const nodeStart = currentPos
          const nodeEnd = currentPos + nodeLength

          // Check if highlight falls within this text node
          if (startPos >= nodeStart && startPos < nodeEnd) {
            const offsetInNode = startPos - nodeStart
            const lengthInNode = Math.min(text.length, nodeLength - offsetInNode)

            range.setStart(node, offsetInNode)
            range.setEnd(node, offsetInNode + lengthInNode)

            const mark = document.createElement('mark')
            mark.className = 'highlight-mark'
            mark.style.backgroundColor = highlight.color || '#FFEB3B'
            mark.style.padding = '2px 4px'
            mark.style.borderRadius = '2px'
            mark.style.transition = 'all 0.2s'
            mark.setAttribute('data-highlight-id', highlight.id)

            range.surroundContents(mark)
            applied = true
            console.log('✅ Highlight applied successfully')
            break
          }

          currentPos += nodeLength
        }

        if (!applied) {
          console.warn('❌ Failed to apply highlight - position not found in DOM')
        }
      } catch (error) {
        console.error('❌ Error applying highlight:', error)
      }
    })

    // Normalize the container
    container.normalize()

  }, [highlights])

  return (
    <div
      ref={contentRef}
      className={`chapter-content prose dark:prose-invert max-w-none ${
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
// ============================================
// FILE 1: src/components/Reader/ChapterContent.jsx
// ============================================
import { memo, useEffect, useRef } from 'react'

const ChapterContent = memo(({ htmlContent, fontSize, readingMode, highlights = [] }) => {
  const contentRef = useRef(null)

  const normalizeText = (text) => {
    return text.replace(/\s+/g, ' ').trim()
  }

  useEffect(() => {
    if (!contentRef.current || !highlights || highlights.length === 0) return

    const container = contentRef.current
    const existingMarks = container.querySelectorAll('mark.highlight-mark')
    existingMarks.forEach(mark => {
      const textNode = document.createTextNode(mark.textContent)
      mark.parentNode.replaceChild(textNode, mark)
    })
    container.normalize()

    highlights.forEach(highlight => {
      const { id, highlightedText, color, startPosition, endPosition } = highlight
      const text = normalizeText(highlightedText)
      const start = parseInt(startPosition)
      const end = parseInt(endPosition)

      if (!text || isNaN(start) || isNaN(end) || start < 0 || end <= start) return

      try {
        const walker = document.createTreeWalker(
          container,
          NodeFilter.SHOW_TEXT,
          {
            acceptNode: (node) => {
              if (node.parentElement?.closest('mark, script, style')) {
                return NodeFilter.FILTER_REJECT
              }
              return NodeFilter.FILTER_ACCEPT
            }
          }
        )

        let currentPos = 0
        let node
        const nodesToHighlight = []

        while (node = walker.nextNode()) {
          const nodeText = normalizeText(node.textContent)
          const nodeLength = nodeText.length
          const nodeStart = currentPos
          const nodeEnd = currentPos + nodeLength

          if (end > nodeStart && start < nodeEnd) {
            const overlapStart = Math.max(0, start - nodeStart)
            const overlapEnd = Math.min(nodeLength, end - nodeStart)
            nodesToHighlight.push({ node, overlapStart, overlapEnd })
          }

          currentPos = nodeEnd + 1
        }

        nodesToHighlight.forEach(({ node, overlapStart, overlapEnd }) => {
          const range = document.createRange()

          const actualStart = Math.min(overlapStart, node.textContent.length)
          const actualEnd = Math.min(overlapEnd, node.textContent.length)

          if (actualEnd > actualStart) {
            range.setStart(node, actualStart)
            range.setEnd(node, actualEnd)

            const mark = document.createElement('mark')
            mark.className = 'highlight-mark'
            mark.style.backgroundColor = color || '#FFEB3B'
            mark.style.padding = '2px 0'
            mark.style.borderRadius = '2px'
            mark.style.transition = 'all 0.2s'
            mark.setAttribute('data-highlight-id', id)

            try {
              range.surroundContents(mark)
            } catch (e) {
              const contents = range.extractContents()
              mark.appendChild(contents)
              range.insertNode(mark)
            }
          }
        })

        container.normalize()
      } catch (error) {
        // Highlight gagal, skip
      }
    })
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
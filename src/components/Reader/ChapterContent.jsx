// ============================================
// FILE: src/components/Reader/ChapterContent.jsx - CLEAN VERSION
// ============================================
import { memo, useEffect, useRef } from 'react'

const ChapterContent = memo(({ htmlContent, fontSize, readingMode, highlights = [] }) => {
  const contentRef = useRef(null)

  const normalizeText = (text) => {
    return text.replace(/\s+/g, ' ').trim()
  }

  // Force list styles after render
  useEffect(() => {
    if (!contentRef.current) return

    const container = contentRef.current

    // Force list styles with !important
    const allOls = container.querySelectorAll('ol')

    allOls.forEach((ol) => {
      const type = ol.getAttribute('type')

      // Use setProperty with !important flag
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

  // Handle highlights
  useEffect(() => {
    if (!contentRef.current || !highlights || highlights.length === 0) return

    const container = contentRef.current
    const existingMarks = container.querySelectorAll('mark.highlight-mark')

    existingMarks.forEach((mark) => {
      const textNode = document.createTextNode(mark.textContent)
      mark.parentNode.replaceChild(textNode, mark)
    })

    container.normalize()

    highlights.forEach((highlight) => {
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

        while ((node = walker.nextNode())) {
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
        console.error('Highlight error:', error)
      }
    })
  }, [highlights])

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
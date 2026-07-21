import { memo, useEffect, useRef } from 'react'

const ChapterContent = memo(({ htmlContent, fontSize, readingMode, highlights = [], notes = [] }) => {
  const contentRef = useRef(null)

  const normalizeText = (text) => {
    return text
      .replace(/\u00AD/g, '') // Remove soft hyphens
      .replace(/\s+/g, ' ')
      .trim()
  }

  // Add soft hyphens to long Indonesian words for better hyphenation
  const addSoftHyphens = (html) => {
    const temp = document.createElement('div')
    temp.innerHTML = html

    const processTextNode = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        let text = node.textContent

        text = text.replace(/\b[\wÀ-ÿ]{8,}\b/g, (word) => {
          if (word.includes('-') || word.includes('/')) return word

          let hyphenated = word

          const patterns = [
            [/^(me)(ng)([aiueo])/i, '$1\u00AD$2$3'],
            [/^(me)(ny)([aiueo])/i, '$1\u00AD$2$3'],
            [/^(me)(m)([aiueo])/i, '$1\u00AD$2$3'],
            [/^(me)(n)([aiueo])/i, '$1\u00AD$2$3'],
            [/^(me)(l)([aiueo])/i, '$1\u00AD$2$3'],
            [/^(me)(r)([aiueo])/i, '$1\u00AD$2$3'],
            [/^(me)(w)([aiueo])/i, '$1\u00AD$2$3'],
            [/^(ber)(t)([aiueo])/i, '$1\u00AD$2$3'],
            [/^(ber)([aiueo])/i, '$1\u00AD$2'],
            [/^(ter)([aiueo])/i, '$1\u00AD$2'],
            [/^(per)([aiueo])/i, '$1\u00AD$2'],
            [/^(pe)(ng)([aiueo])/i, '$1\u00AD$2$3'],
            [/^(pe)(ny)([aiueo])/i, '$1\u00AD$2$3'],
            [/^(pe)(m)([aiueo])/i, '$1\u00AD$2$3'],
            [/^(pe)(n)([aiueo])/i, '$1\u00AD$2$3'],
            [/^(pe)(l)([aiueo])/i, '$1\u00AD$2$3'],
            [/^(pe)(r)([aiueo])/i, '$1\u00AD$2$3'],
            [/^(di)([aiueo])/i, '$1\u00AD$2'],
            [/^(ke)([aiueo])/i, '$1\u00AD$2'],
            [/^(se)([aiueo])/i, '$1\u00AD$2'],
            [/([aiueo])(kan)$/i, '$1\u00AD$2'],
            [/([aiueo])([bcdfghjklmnpqrstvwxyz]an)$/i, '$1\u00AD$2'],
            [/([aiueo])(nya)$/i, '$1\u00AD$2'],
            [/([aiueo])(lah)$/i, '$1\u00AD$2'],
            [/([aiueo])(kah)$/i, '$1\u00AD$2'],
            [/([aiueo])(tah)$/i, '$1\u00AD$2'],
            [/([aiueo])(pun)$/i, '$1\u00AD$2'],
            [/([bcdfghjklmnpqrstvwxyz]{2,})([aiueo])/gi, '$1\u00AD$2'],
            [/([aiueo])([bcdfghjklmnpqrstvwxyz][aiueo])/gi, '$1\u00AD$2'],
          ]

          patterns.forEach(([pattern, replacement]) => {
            hyphenated = hyphenated.replace(pattern, replacement)
          })

          return hyphenated
        })

        node.textContent = text
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (['SCRIPT', 'STYLE', 'CODE', 'PRE'].includes(node.tagName)) {
          return
        }
        Array.from(node.childNodes).forEach(processTextNode)
      }
    }

    processTextNode(temp)
    return temp.innerHTML
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

    // Remove existing marks
    const cleanupMarks = () => {
      const existingMarks = container.querySelectorAll('mark.highlight-mark, mark.note-mark')
      existingMarks.forEach((mark) => {
        const parent = mark.parentNode
        if (parent) {
          while (mark.firstChild) {
            parent.insertBefore(mark.firstChild, mark)
          }
          parent.removeChild(mark)
        }
      })

      const allMarks = container.querySelectorAll('mark')
      allMarks.forEach((mark) => {
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

    if ((!highlights || highlights.length === 0) && (!notes || notes.length === 0)) {
      return
    }

    // Build text position map - rebuild after each annotation to handle splits
    const applyAllAnnotations = () => {
      const allAnnotations = []

      highlights.forEach((highlight) => {
        const { id, highlightedText, color, startPosition, endPosition } = highlight
        const start = parseInt(startPosition)
        const end = parseInt(endPosition)

        if (isNaN(start) || isNaN(end) || start < 0 || end <= start) return

        let lighterColor = color || '#FFEB3B'
        const colorMap = {
          '#FFEB3B': '#FFF9C4',
          '#4CAF50': '#C8E6C9',
          '#2196F3': '#BBDEFB',
          '#FF9800': '#FFE0B2',
          '#F44336': '#FFCDD2'
        }
        lighterColor = colorMap[color] || lighterColor

        allAnnotations.push({
          id,
          start,
          end,
          color: lighterColor,
          type: 'highlight',
          expectedText: normalizeText(highlightedText),
          originalText: highlightedText
        })
      })

      notes.forEach((note) => {
        const { id, selectedText, startPosition, endPosition } = note

        if (!selectedText || !selectedText.trim()) return

        const start = parseInt(startPosition)
        const end = parseInt(endPosition)

        if (isNaN(start) || isNaN(end) || start < 0 || end <= start) {
          console.warn(`Invalid positions for note ${id}`)
          return
        }

        allAnnotations.push({
          id,
          start,
          end,
          color: '#E9D5FF',
          type: 'note',
          expectedText: normalizeText(selectedText),
          originalText: selectedText
        })
      })

      // Sort by start position
      allAnnotations.sort((a, b) => a.start - b.start)

      // Apply each annotation one by one, rebuilding text map each time
      allAnnotations.forEach((annotation) => {
        const { textNodes, fullText } = buildTextNodeMap(container)
        applyAnnotationByPosition(textNodes, fullText, annotation)
        container.normalize()
      })
    }

    applyAllAnnotations()
  }, [highlights, notes, htmlContent])

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
    const { id, start, end, color, type, expectedText, originalText } = annotation

    try {
      const normalizedFullText = normalizeText(fullText)
      const normalizedExpected = expectedText

      let adjustedStart = start
      let adjustedEnd = end

      const extractedAtPosition = fullText.substring(start, end)
      const normalizedExtracted = normalizeText(extractedAtPosition)

      if (normalizedExtracted === normalizedExpected) {
        // Exact match at position
      } else {
        // Search in window
        const windowStart = Math.max(0, start - 100)
        const windowEnd = Math.min(fullText.length, end + 100)
        const searchWindow = fullText.substring(windowStart, windowEnd)
        const normalizedWindow = normalizeText(searchWindow)

        const foundIndex = normalizedWindow.toLowerCase().indexOf(normalizedExpected.toLowerCase())

        if (foundIndex !== -1) {
          // Map back to actual position
          let actualPos = 0
          let normalizedPos = 0

          for (let i = 0; i < searchWindow.length; i++) {
            if (normalizedPos === foundIndex) {
              actualPos = i
              break
            }

            const char = searchWindow[i]
            if (char !== '\u00AD') {
              if (!/\s/.test(char) || (i > 0 && !/\s/.test(searchWindow[i - 1]))) {
                normalizedPos++
              }
            }
          }

          // Calculate length in actual text
          let actualLength = 0
          normalizedPos = 0
          for (let i = actualPos; i < searchWindow.length && normalizedPos < normalizedExpected.length; i++) {
            const char = searchWindow[i]
            actualLength++

            if (char !== '\u00AD') {
              if (!/\s/.test(char) || (i > 0 && !/\s/.test(searchWindow[i - 1]))) {
                normalizedPos++
              }
            }
          }

          adjustedStart = windowStart + actualPos
          adjustedEnd = windowStart + actualPos + actualLength
        } else {
          // Last resort - full text search
          const fullNormalized = normalizeText(fullText)
          const lastResortIndex = fullNormalized.toLowerCase().indexOf(normalizedExpected.toLowerCase())

          if (lastResortIndex !== -1) {
            let actualPos = 0
            let normalizedPos = 0

            for (let i = 0; i < fullText.length; i++) {
              if (normalizedPos === lastResortIndex) {
                actualPos = i
                break
              }

              const char = fullText[i]
              if (char !== '\u00AD') {
                if (!/\s/.test(char) || (i > 0 && !/\s/.test(fullText[i - 1]))) {
                  normalizedPos++
                }
              }
            }

            adjustedStart = actualPos
            let actualLength = normalizedExpected.length + 10
            adjustedEnd = Math.min(fullText.length, adjustedStart + actualLength)
          } else {
            console.error(`Cannot find: "${normalizedExpected}"`)
            return
          }
        }
      }

      // Find all text nodes that overlap
      const affectedNodes = textNodes.filter(({ startPos, endPos }) =>
        endPos > adjustedStart && startPos < adjustedEnd
      )

      if (affectedNodes.length === 0) {
        console.warn(`No nodes found for ${type} ${id}`)
        return
      }

      // Apply mark to each affected node
      affectedNodes.forEach(({ node, startPos, endPos }) => {
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

  // Apply mark to a portion of a text node - REMOVED "already marked" check
  const applyMarkToNode = (node, startOffset, endOffset, id, color, type) => {
    try {
      // Check if this exact range is already marked with the same annotation
      const existingMark = node.parentElement
      if (existingMark?.tagName === 'MARK' &&
          existingMark.getAttribute(`data-${type}-id`) === String(id)) {
        return // Skip exact duplicate
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

    if (type === 'note') {
      mark.style.borderBottom = '2px dotted #9333EA'
      mark.style.cursor = 'help'
      mark.title = 'Catatan tersedia'
    }

    return mark
  }

  // Process HTML with soft hyphens
  const processedHtml = addSoftHyphens(htmlContent)

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
        color: readingMode ? '#2d2d2d' : undefined,
        WebkitHyphens: 'auto',
        MozHyphens: 'auto',
        msHyphens: 'auto',
        hyphens: 'auto',
        wordWrap: 'break-word',
        overflowWrap: 'break-word'
      }}
      dangerouslySetInnerHTML={{ __html: processedHtml }}
    />
  )
})

ChapterContent.displayName = 'ChapterContent'
export default ChapterContent
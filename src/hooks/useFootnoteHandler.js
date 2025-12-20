// ============================================
// FILE 12: src/hooks/useFootnoteHandler.js
// ============================================
import { useState, useEffect } from 'react'
import { chapterService } from '../services/chapterService'

const useFootnoteHandler = (contentRef, chapter, bookSlug) => {
  const [footnotePopup, setFootnotePopup] = useState(null)

  useEffect(() => {
    if (!contentRef.current) return

    const handleFootnoteClick = async (e) => {
      const target = e.target.closest('a[href*="#"]')
      if (!target) return

      const href = target.getAttribute('href')
      const hashMatch = href.match(/#(.+)$/)
      if (!hashMatch) return

      e.preventDefault()
      const footnoteId = hashMatch[1]

      let footnoteElement = contentRef.current.querySelector(`#${footnoteId}`)

      if (footnoteElement) {
        const content = footnoteElement.innerHTML
        setFootnotePopup({ id: footnoteId, content, isLocal: true })
        return
      }

      try {
        setFootnotePopup({
          id: footnoteId,
          content: `<div class="text-center py-4">
            <svg class="animate-spin h-5 w-5 mx-auto mb-2 text-primary" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
              <circle class="opacity-75" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" stroke-dasharray="32"></circle>
            </svg>
            <p class="text-gray-500 text-sm">Memuat catatan...</p>
          </div>`,
          isLocal: false
        })

        const possibleChapters = ['muka', 'kolofon', 'catatan-kaki', 'catatan', 'keterangan', 'pendahuluan', 'prakata', 'kata-pengantar', 'daftar-pustaka', 'lampiran']

        for (const slug of possibleChapters) {
          try {
            const chapterData = await chapterService.readChapterByPath(bookSlug, slug)
            const tempDiv = document.createElement('div')
            tempDiv.innerHTML = chapterData.htmlContent
            footnoteElement = tempDiv.querySelector(`#${footnoteId}`)

            if (footnoteElement) {
              const content = footnoteElement.innerHTML
              setFootnotePopup({
                id: footnoteId,
                content,
                isLocal: false,
                sourceChapter: chapterData.chapterTitle,
                sourceSlug: slug
              })
              return
            }
          } catch (err) {
            continue
          }
        }

        setFootnotePopup({
          id: footnoteId,
          content: `<div class="text-center py-6 px-4">
            <div class="text-5xl mb-3">📚</div>
            <p class="text-amber-600 font-semibold mb-2">Catatan referensi tidak ditemukan</p>
            <p class="text-sm text-gray-600 mb-4">Catatan ini mungkin ada di bab lain.</p>
            <p class="text-xs text-gray-500">ID: <code class="bg-gray-100 px-2 py-1 rounded">${footnoteId}</code></p>
          </div>`,
          isLocal: false
        })
      } catch (error) {
        console.error('Error fetching footnote:', error)
        setFootnotePopup({
          id: footnoteId,
          content: `<div class="text-center py-6 px-4">
            <div class="text-5xl mb-3">❌</div>
            <p class="text-red-500 font-semibold mb-2">Gagal memuat catatan</p>
            <p class="text-sm text-gray-600">Terjadi kesalahan saat mengambil data catatan.</p>
          </div>`,
          isLocal: false
        })
      }
    }

    const contentElement = contentRef.current
    contentElement.addEventListener('click', handleFootnoteClick)
    return () => {
      contentElement.removeEventListener('click', handleFootnoteClick)
    }
  }, [chapter, bookSlug, contentRef])

  const handleGoToFootnote = () => {
    if (footnotePopup?.id) {
      const element = document.getElementById(footnotePopup.id)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        setFootnotePopup(null)
      }
    }
  }

  return { footnotePopup, setFootnotePopup, handleGoToFootnote }
}

export default useFootnoteHandler
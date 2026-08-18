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
        setFootnotePopup({ id: footnoteId, content: footnoteElement.innerHTML, isLocal: true })
        return
      }

      try {
        setFootnotePopup({
          id: footnoteId,
          content: '<div style="text-align: center; padding: 1rem;"><p>Memuat catatan...</p></div>',
          isLocal: false
        })

        // Check parent chapter
        if (chapter?.parentChapter?.slug && chapter?.breadcrumbs?.length > 0) {
          const parentPath = chapter.breadcrumbs.filter(b => b.chapterLevel === 1).map(b => b.slug).join('/')
          if (parentPath) {
            try {
              const parentData = await chapterService.readChapterByPath(bookSlug, parentPath)
              const tempDiv = document.createElement('div')
              tempDiv.innerHTML = parentData.htmlContent
              footnoteElement = tempDiv.querySelector(`#${footnoteId}`)
              if (footnoteElement) {
                setFootnotePopup({
                  id: footnoteId,
                  content: footnoteElement.innerHTML,
                  isLocal: false,
                  sourceChapter: parentData.chapterTitle,
                  sourceSlug: parentPath
                })
                return
              }
            } catch (err) {}
          }
        }

        // Check siblings (level 2 chapters only)
        if (chapter?.chapterLevel === 2 && chapter?.breadcrumbs?.length > 0) {
          try {
            const allChaptersResponse = await chapterService.getAllChapters(bookSlug)
            const allChapters = allChaptersResponse.data?.data || []
            const parentChapterId = chapter.breadcrumbs[0]?.chapterId

            if (parentChapterId) {
              const parentChapter = allChapters.find(ch => ch.id === parentChapterId)
              if (parentChapter?.subChapters) {
                const siblings = parentChapter.subChapters.filter(sub => sub.id !== chapter.chapterId).reverse()
                const parentSlug = chapter.breadcrumbs[0]?.slug

                for (const sibling of siblings) {
                  try {
                    const siblingPath = `${parentSlug}/${sibling.slug}`
                    const siblingData = await chapterService.readChapterByPath(bookSlug, siblingPath)
                    const tempDiv = document.createElement('div')
                    tempDiv.innerHTML = siblingData.htmlContent
                    footnoteElement = tempDiv.querySelector(`#${footnoteId}`)
                    if (footnoteElement) {
                      setFootnotePopup({
                        id: footnoteId,
                        content: footnoteElement.innerHTML,
                        isLocal: false,
                        sourceChapter: siblingData.chapterTitle,
                        sourceSlug: siblingPath
                      })
                      return
                    }
                  } catch (err) {}
                }
              }
            }
          } catch (err) {}
        }

        // Check common chapters
        const commonChapters = ['catatan-kaki', 'catatan', 'keterangan', 'muka', 'kolofon', 'pendahuluan', 'prakata', 'kata-pengantar', 'daftar-pustaka', 'lampiran']
        for (const slug of commonChapters) {
          try {
            const chapterData = await chapterService.readChapterByPath(bookSlug, slug)
            const tempDiv = document.createElement('div')
            tempDiv.innerHTML = chapterData.htmlContent
            footnoteElement = tempDiv.querySelector(`#${footnoteId}`)
            if (footnoteElement) {
              setFootnotePopup({
                id: footnoteId,
                content: footnoteElement.innerHTML,
                isLocal: false,
                sourceChapter: chapterData.chapterTitle,
                sourceSlug: slug
              })
              return
            }
          } catch (err) {}
        }

        setFootnotePopup({
          id: footnoteId,
          content: '<div style="text-align: center; padding: 2rem;"><p>Catatan tidak ditemukan</p></div>',
          isLocal: false
        })
      } catch (error) {
        setFootnotePopup({
          id: footnoteId,
          content: '<div style="text-align: center; padding: 2rem;"><p>Gagal memuat catatan</p></div>',
          isLocal: false
        })
      }
    }

    const contentElement = contentRef.current
    contentElement.addEventListener('click', handleFootnoteClick)
    return () => contentElement.removeEventListener('click', handleFootnoteClick)
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
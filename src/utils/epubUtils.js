// src/utils/epubUtils.js

export function parseCfiChapter(cfi) {
  if (!cfi || typeof cfi !== 'string') return null
  try {
    const base = cfi.split('!')[0]
    const parts = base.replace('epubcfi(', '').split('/')
    const spineStep = parseInt(parts[2], 10)
    if (isNaN(spineStep) || spineStep < 2) return null
    return spineStep / 2
  } catch {
    return null
  }
}

export function chapterDisplayLabel(currentChapter, totalChapters, lastCfi) {
  const cfiChapter = parseCfiChapter(lastCfi)
  const chapter = cfiChapter ?? currentChapter
  if (!chapter && !totalChapters) return 'EPUB'
  if (!totalChapters) return `Bab ${chapter || 0}`
  return `Bab ${chapter || 0}/${totalChapters}`
}

export function readingPositionLabel(currentChapter, totalChapters, progressPercentage, lastCfi) {
  const pct = (progressPercentage || 0).toFixed(0)
  const chapLabel = chapterDisplayLabel(currentChapter, totalChapters, lastCfi)
  if (chapLabel === 'EPUB') return `${pct}% selesai`
  return `${chapLabel} · ${pct}%`
}
import api from './api'

const makeEpubBase = (slug, isZine) => isZine ? `/zines/${slug}` : `/books/${slug}`

const epubAnnotationService = {
  getAll: async (slug, isZine = false) => {
    const res = await api.get(`${makeEpubBase(slug, isZine)}/epub-annotations`)
    const bundle = res.data?.data || res.data
    return {
      annotations: bundle?.annotations || [],
      bookmarks:   bundle?.bookmarks   || [],
    }
  },

  addAnnotation: async (slug, isZine = false, annotationData) => {
    const res = await api.post(`${makeEpubBase(slug, isZine)}/epub-annotations`, {
      cfi:          annotationData.cfi,
      selectedText: annotationData.text,
      color:        annotationData.color,
      note:         annotationData.note,
    })
    return res.data?.data || res.data
  },

  deleteAnnotation: async (slug, isZine = false, annotationId) => {
    await api.delete(`${makeEpubBase(slug, isZine)}/epub-annotations/${annotationId}`)
  },

  addBookmark: async (slug, isZine = false, bookmarkData) => {
    const res = await api.post(`${makeEpubBase(slug, isZine)}/epub-bookmarks`, {
      cfi:   bookmarkData.cfi,
      label: bookmarkData.label,
    })
    return res.data?.data || res.data
  },

  deleteBookmark: async (slug, isZine = false, bookmarkId) => {
    await api.delete(`${makeEpubBase(slug, isZine)}/epub-bookmarks/${bookmarkId}`)
  },

  // ── Pending corrections ───────────────────────────────────────────────────
  // Backend endpoint masih buggy (@PathVariable tanpa {slug} di path).
  // Highlight merah tetap berjalan dari localStorage — tidak ada data yang hilang.
  // Aktifkan kembali setelah backend difix.
  getMyPendingCorrections: async (slug, isZine = false) => {
    return []
  },
}

export default epubAnnotationService
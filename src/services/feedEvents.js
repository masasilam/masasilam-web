// src/services/feedEvents.js
// ─────────────────────────────────────────────────────────────────────────────
// Global Feed Event Bus
//
// Cara kerja:
//   1. Halaman manapun (BookDetailPage, EpubReaderPage, FilmDetailPage, dll)
//      memanggil feedEvents.emit(type, payload) setelah aksi berhasil.
//   2. SocialFeedPage (dan hook useFeedEvents) mendengarkan event ini dan
//      melakukan update lokal atau full-refresh sesuai kebutuhan.
//
// Ini menggunakan native CustomEvent browser sehingga tidak butuh library tambahan
// dan bekerja lintas komponen tanpa prop drilling atau Context overhead.
// ─────────────────────────────────────────────────────────────────────────────

export const FEED_EVENTS = {
  // Aktivitas baru dibuat dari halaman manapun → feed perlu refresh/prepend
  ACTIVITY_CREATED:       'feed:activity_created',

  // Aktivitas dihapus (misal user un-like sebuah buku dari BookDetailPage)
  ACTIVITY_DELETED:       'feed:activity_deleted',

  // Like/unlike pada activity card di dalam feed itu sendiri
  ACTIVITY_LIKED:         'feed:activity_liked',
  ACTIVITY_UNLIKED:       'feed:activity_unliked',

  // Komentar di dalam feed
  COMMENT_ADDED:          'feed:comment_added',
  COMMENT_UPDATED:        'feed:comment_updated',
  COMMENT_DELETED:        'feed:comment_deleted',

  // Trigger refresh penuh (fallback kalau tidak tahu payload persisnya)
  REFRESH:                'feed:refresh',
}

const feedEvents = {
  /**
   * Broadcast event ke semua listener
   * @param {string} type  - Salah satu dari FEED_EVENTS
   * @param {object} payload - Data yang dikirim bersama event
   *
   * Contoh payload per type:
   *   ACTIVITY_CREATED  → { activityType, entityType, entityId, entitySlug, entityTitle, entityCover, metadata }
   *   ACTIVITY_DELETED  → { activityId }
   *   ACTIVITY_LIKED    → { activityId, likeCount }
   *   ACTIVITY_UNLIKED  → { activityId, likeCount }
   *   COMMENT_ADDED     → { activityId, comment }
   *   COMMENT_UPDATED   → { activityId, commentId, content }
   *   COMMENT_DELETED   → { activityId, commentId }
   *   REFRESH           → {}
   */
  emit(type, payload = {}) {
    window.dispatchEvent(new CustomEvent(type, { detail: payload }))
  },

  /**
   * Subscribe ke event
   * @returns cleanup function (gunakan di useEffect return)
   */
  on(type, handler) {
    const wrapped = (e) => handler(e.detail)
    window.addEventListener(type, wrapped)
    return () => window.removeEventListener(type, wrapped)
  },
}

export default feedEvents
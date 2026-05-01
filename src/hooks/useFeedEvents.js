// src/hooks/useFeedEvents.js
// ─────────────────────────────────────────────────────────────────────────────
// Hook ini dipakai di SocialFeedPage untuk mendengarkan semua feed events
// dan melakukan update state secara optimistik tanpa full-reload.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react'
import feedEvents, { FEED_EVENTS } from '../services/feedEvents'
import { useAuth } from './useAuth'

/**
 * @param {object} opts
 * @param {Function} opts.setItems     - setState untuk array items feed
 * @param {Function} opts.refresh      - fungsi untuk full-refresh feed (load page 1)
 * @param {object}   opts.currentUser  - user object dari useAuth
 */
export function useFeedEvents({ setItems, refresh, currentUser }) {
  useEffect(() => {
    // ── ACTIVITY_CREATED ──────────────────────────────────────────────────────
    // Prepend aktivitas baru ke atas feed (optimistik)
    const unsubCreated = feedEvents.on(FEED_EVENTS.ACTIVITY_CREATED, (payload) => {
      // Kalau payload sudah berisi full activity object dari server response,
      // langsung prepend. Kalau tidak, fallback ke refresh.
      if (payload?.id) {
        setItems(prev => {
          // Hindari duplikat jika feed juga di-poll
          if (prev.some(i => i.id === payload.id)) return prev
          return [payload, ...prev]
        })
      } else {
        // Tidak ada data lengkap → refresh halaman pertama
        refresh()
      }
    })

    // ── ACTIVITY_DELETED ──────────────────────────────────────────────────────
    const unsubDeleted = feedEvents.on(FEED_EVENTS.ACTIVITY_DELETED, ({ activityId }) => {
      if (!activityId) return
      setItems(prev => prev.filter(i => i.id !== activityId))
    })

    // ── ACTIVITY_LIKED ────────────────────────────────────────────────────────
    const unsubLiked = feedEvents.on(FEED_EVENTS.ACTIVITY_LIKED, ({ activityId, likeCount }) => {
      setItems(prev => prev.map(i =>
        i.id === activityId ? { ...i, isLiked: true, likeCount: likeCount ?? (i.likeCount + 1) } : i
      ))
    })

    // ── ACTIVITY_UNLIKED ──────────────────────────────────────────────────────
    const unsubUnliked = feedEvents.on(FEED_EVENTS.ACTIVITY_UNLIKED, ({ activityId, likeCount }) => {
      setItems(prev => prev.map(i =>
        i.id === activityId ? { ...i, isLiked: false, likeCount: likeCount ?? Math.max(0, i.likeCount - 1) } : i
      ))
    })

    // ── COMMENT_ADDED ─────────────────────────────────────────────────────────
    const unsubCommentAdded = feedEvents.on(FEED_EVENTS.COMMENT_ADDED, ({ activityId }) => {
      setItems(prev => prev.map(i =>
        i.id === activityId ? { ...i, commentCount: (i.commentCount || 0) + 1 } : i
      ))
    })

    // ── COMMENT_DELETED ───────────────────────────────────────────────────────
    const unsubCommentDeleted = feedEvents.on(FEED_EVENTS.COMMENT_DELETED, ({ activityId }) => {
      setItems(prev => prev.map(i =>
        i.id === activityId ? { ...i, commentCount: Math.max(0, (i.commentCount || 1) - 1) } : i
      ))
    })

    // ── REFRESH ───────────────────────────────────────────────────────────────
    const unsubRefresh = feedEvents.on(FEED_EVENTS.REFRESH, () => refresh())

    return () => {
      unsubCreated()
      unsubDeleted()
      unsubLiked()
      unsubUnliked()
      unsubCommentAdded()
      unsubCommentDeleted()
      unsubRefresh()
    }
  }, [setItems, refresh])
}
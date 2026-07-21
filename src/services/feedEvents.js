export const FEED_EVENTS = {
  ACTIVITY_CREATED: 'feed:activity_created',
  ACTIVITY_DELETED: 'feed:activity_deleted',
  ACTIVITY_LIKED: 'feed:activity_liked',
  ACTIVITY_UNLIKED: 'feed:activity_unliked',
  COMMENT_ADDED: 'feed:comment_added',
  COMMENT_UPDATED: 'feed:comment_updated',
  COMMENT_DELETED: 'feed:comment_deleted',
  REFRESH: 'feed:refresh',
}

const feedEvents = {
  emit(type, payload = {}) {
    window.dispatchEvent(new CustomEvent(type, { detail: payload }))
  },

  on(type, handler) {
    const wrapped = (e) => handler(e.detail)
    window.addEventListener(type, wrapped)
    return () => window.removeEventListener(type, wrapped)
  },
}

export default feedEvents
import api from './api'

// ── FEED ──────────────────────────────────────────────────────────────────────
export const feedService = {
  getFollowingFeed:  (page = 1, limit = 20) => api.get('/social/feed/following', { params: { page, limit } }),
  getPublicFeed:     (page = 1, limit = 20) => api.get('/social/feed/public',    { params: { page, limit } }),
  getUserFeed:       (userId, page = 1, limit = 20) => api.get(`/social/feed/user/${userId}`, { params: { page, limit } }),
  likeActivity:      (activityId) => api.post(`/social/feed/activities/${activityId}/like`),
  unlikeActivity:    (activityId) => api.delete(`/social/feed/activities/${activityId}/like`),
  getComments:       (activityId, page = 1, limit = 20) => api.get(`/social/feed/activities/${activityId}/comments`, { params: { page, limit } }),
  addComment:        (activityId, data) => api.post(`/social/feed/activities/${activityId}/comments`, data),
  updateComment:     (commentId, data) => api.put(`/social/feed/activities/comments/${commentId}`, data),
  deleteComment:     (commentId) => api.delete(`/social/feed/activities/comments/${commentId}`),
}

// ── READING LISTS ──────────────────────────────────────────────────────────────
export const readingListService = {
  create:               (data) => api.post('/social/lists', data),
  getPublic:            (params) => api.get('/social/lists/public', { params }),
  getMine:              (page = 1, limit = 20) => api.get('/social/lists/me', { params: { page, limit } }),
  getByUser:            (userId, page = 1, limit = 20) => api.get(`/social/lists/user/${userId}`, { params: { page, limit } }),
  getById:              (listId) => api.get(`/social/lists/${listId}`),
  getBySlug:            (userId, slug) => api.get(`/social/lists/user/${userId}/slug/${slug}`),
  getBySlugOnly:        (slug) => api.get(`/social/lists/slug/${slug}`), // ← TAMBAHAN: untuk akses by slug tanpa userId
  update:               (listId, data) => api.put(`/social/lists/${listId}`, data),
  delete:               (listId) => api.delete(`/social/lists/${listId}`),
  getItems:             (listId, page = 1, limit = 50) => api.get(`/social/lists/${listId}/items`, { params: { page, limit } }),
  addItem:              (listId, data) => api.post(`/social/lists/${listId}/items`, data),
  removeItem:           (listId, entityType, entityId) => api.delete(`/social/lists/${listId}/items`, { params: { entityType, entityId } }),
  reorderItems:         (listId, orderedItemIds) => api.put(`/social/lists/${listId}/items/reorder`, orderedItemIds),
  like:                 (listId) => api.post(`/social/lists/${listId}/like`),
  unlike:               (listId) => api.delete(`/social/lists/${listId}/like`),
  follow:               (listId) => api.post(`/social/lists/${listId}/follow`),
  unfollow:             (listId) => api.delete(`/social/lists/${listId}/follow`),
  fork:                 (listId) => api.post(`/social/lists/${listId}/fork`),
  findContaining:       (entityType, entityId) => api.get('/social/lists/containing', { params: { entityType, entityId } }),
}

// ── READING GROUPS ─────────────────────────────────────────────────────────────
export const groupService = {
  create:               (data) => api.post('/social/groups', data),
  getPublic:            (params) => api.get('/social/groups', { params }),
  getMine:              (page = 1, limit = 20) => api.get('/social/groups/me', { params: { page, limit } }),
  getBySlug:            (slug) => api.get(`/social/groups/${slug}`),
  update:               (groupId, data) => api.put(`/social/groups/${groupId}`, data),
  delete:               (groupId) => api.delete(`/social/groups/${groupId}`),
  join:                 (groupId, data = {}) => api.post(`/social/groups/${groupId}/join`, data),
  leave:                (groupId) => api.delete(`/social/groups/${groupId}/leave`),
  getMembers:           (groupId, page = 1, limit = 50) => api.get(`/social/groups/${groupId}/members`, { params: { page, limit } }),
  kickMember:           (groupId, userId) => api.delete(`/social/groups/${groupId}/members/${userId}`),
  promoteMember:        (groupId, userId, role) => api.put(`/social/groups/${groupId}/members/${userId}/role`, null, { params: { role } }),
  getJoinRequests:      (groupId) => api.get(`/social/groups/${groupId}/join-requests`),
  reviewJoinRequest:    (groupId, requestId, data) => api.put(`/social/groups/${groupId}/join-requests/${requestId}`, data),
  setCurrentRead:       (groupId, data) => api.put(`/social/groups/${groupId}/current-read`, data),
  getSchedules:         (groupId) => api.get(`/social/groups/${groupId}/schedules`),
  createSchedule:       (groupId, data) => api.post(`/social/groups/${groupId}/schedules`, data),
  completeSchedule:     (groupId, scheduleId) => api.put(`/social/groups/${groupId}/schedules/${scheduleId}/complete`),
  getDiscussions:       (groupId, params) => api.get(`/social/groups/${groupId}/discussions`, { params }),
  createDiscussion:     (groupId, data) => api.post(`/social/groups/${groupId}/discussions`, data),
  updateDiscussion:     (groupId, discussionId, data) => api.put(`/social/groups/${groupId}/discussions/${discussionId}`, data),
  deleteDiscussion:     (groupId, discussionId) => api.delete(`/social/groups/${groupId}/discussions/${discussionId}`),
  likeDiscussion:       (groupId, discussionId) => api.post(`/social/groups/${groupId}/discussions/${discussionId}/like`),
  unlikeDiscussion:     (groupId, discussionId) => api.delete(`/social/groups/${groupId}/discussions/${discussionId}/like`),
  getPolls:             (groupId) => api.get(`/social/groups/${groupId}/polls`),
  createPoll:           (groupId, data) => api.post(`/social/groups/${groupId}/polls`, data),
  vote:                 (groupId, pollId, data) => api.post(`/social/groups/${groupId}/polls/${pollId}/vote`, data),
}

// ── READING CHALLENGES ─────────────────────────────────────────────────────────
export const challengeService = {
  getActive:            (page = 1, limit = 20) => api.get('/social/challenges', { params: { page, limit } }),
  getMine:              (status, page = 1, limit = 20) => api.get('/social/challenges/me', { params: { status, page, limit } }),
  getById:              (challengeId) => api.get(`/social/challenges/${challengeId}`),
  getBySlug:            (slug) => api.get(`/social/challenges/slug/${slug}`),
  create:               (data) => api.post('/social/challenges', data),
  update:               (challengeId, data) => api.put(`/social/challenges/${challengeId}`, data),
  delete:               (challengeId) => api.delete(`/social/challenges/${challengeId}`),
  join:                 (challengeId) => api.post(`/social/challenges/${challengeId}/join`),
  abandon:              (challengeId) => api.delete(`/social/challenges/${challengeId}/join`),
  recordProgress:       (challengeId, entityType, entityId) => api.post(`/social/challenges/${challengeId}/progress`, null, { params: { entityType, entityId } }),
  getLeaderboard:       (challengeId, page = 1, limit = 50) => api.get(`/social/challenges/${challengeId}/leaderboard`, { params: { page, limit } }),
}

// ── SOCIAL ANNOTATIONS ─────────────────────────────────────────────────────────
export const annotationService = {
  getPublic:            (page = 1, limit = 20) => api.get('/social/annotations/public', { params: { page, limit } }),
  getFollowing:         (page = 1, limit = 20) => api.get('/social/annotations/following', { params: { page, limit } }),
  getByUser:            (userId, page = 1, limit = 20) => api.get(`/social/annotations/user/${userId}`, { params: { page, limit } }),
  getByEntity:          (entityType, entityId, page = 1, limit = 20) => api.get('/social/annotations/entity', { params: { entityType, entityId, page, limit } }),
  getById:              (annotationId) => api.get(`/social/annotations/${annotationId}`),
  publish:              (data) => api.post('/social/annotations', data),
  update:               (annotationId, data) => api.put(`/social/annotations/${annotationId}`, data),
  delete:               (annotationId) => api.delete(`/social/annotations/${annotationId}`),
  like:                 (annotationId) => api.post(`/social/annotations/${annotationId}/like`),
  unlike:               (annotationId) => api.delete(`/social/annotations/${annotationId}/like`),
  reshare:              (annotationId) => api.post(`/social/annotations/${annotationId}/reshare`),
  getComments:          (annotationId, page = 1, limit = 20) => api.get(`/social/annotations/${annotationId}/comments`, { params: { page, limit } }),
  addComment:           (annotationId, data) => api.post(`/social/annotations/${annotationId}/comments`, data),
  updateComment:        (commentId, data) => api.put(`/social/annotations/comments/${commentId}`, data),
  deleteComment:        (commentId) => api.delete(`/social/annotations/comments/${commentId}`),
}

// ── SOCIAL PROFILES ────────────────────────────────────────────────────────────
export const profileService = {
  getById:              (userId) => api.get(`/social/profiles/by-id/${userId}`),
  getByUsername:        (username) => api.get(`/social/profiles/${username}`),
  updateMine:           (data) => api.put('/social/profiles/me', data),
  getMyStats:           () => api.get('/social/profiles/me/stats'),
  follow:               (userId) => api.post(`/social/profiles/${userId}/follow`),
  unfollow:             (userId) => api.delete(`/social/profiles/${userId}/follow`),
  checkFollowing:       (userId) => api.get(`/social/profiles/${userId}/is-following`),
  getFollowers:         (userId, page = 1, limit = 20) => api.get(`/social/profiles/${userId}/followers`, { params: { page, limit } }),
  getFollowing:         (userId, page = 1, limit = 20) => api.get(`/social/profiles/${userId}/following`, { params: { page, limit } }),
}

// ── NOTIFICATIONS ──────────────────────────────────────────────────────────────
export const notificationService = {
  getAll:               (page = 1, limit = 20) => api.get('/social/notifications', { params: { page, limit } }),
  getUnreadCount:       () => api.get('/social/notifications/unread-count'),
  markRead:             (notificationId) => api.put(`/social/notifications/${notificationId}/read`),
  markAllRead:          () => api.put('/social/notifications/read-all'),
}

// ── READING TWINS ──────────────────────────────────────────────────────────────
export const twinService = {
  getMine:              (page = 1, limit = 10) => api.get('/social/twins', { params: { page, limit } }),
  getTwinWith:          (userId) => api.get(`/social/twins/${userId}`),
  recalculate:          () => api.post('/social/twins/recalculate'),
}

// ── TIME CAPSULE ───────────────────────────────────────────────────────────────
export const timeCapsuleService = {
  get:                  (date, page = 1, limit = 20) => api.get('/social/time-capsule', { params: { date, page, limit } }),
  getToday:             (yearsAgo = 78, page = 1, limit = 20) => api.get('/social/time-capsule/today', { params: { yearsAgo, page, limit } }),
}

export default {
  feed: feedService,
  lists: readingListService,
  groups: groupService,
  challenges: challengeService,
  annotations: annotationService,
  profiles: profileService,
  notifications: notificationService,
  twins: twinService,
  timeCapsule: timeCapsuleService,
}
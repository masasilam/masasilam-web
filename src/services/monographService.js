import api from './api'

const monographService = {
  getMonographs: ({ page = 1, limit = 12, sortField = 'editionDate', sortOrder = 'DESC', q, sourceSlug, decade } = {}) =>
    api.get('/monographs', { params: { page, limit, sortField, sortOrder, q, sourceSlug, decade } })
      .then(res => res.data?.data),

  getManageList: ({ page = 1, limit = 20, sortField = 'editionDate', sortOrder = 'DESC', q, status } = {}) =>
    api.get('/monographs/manage', { params: { page, limit, sortField, sortOrder, q, status } })
      .then(res => res.data?.data),

  getLatest: (limit = 10) =>
    api.get('/monographs/latest', { params: { limit } })
      .then(res => res.data?.data || []),

  getScaffold: ({ sourceId, from, to }) =>
    api.get('/monographs/scaffold', { params: { sourceId, from, to } })
      .then(res => res.data?.data),

  getMonographBySlug: (slug) =>
    api.get(`/monographs/${slug}`).then(res => res.data?.data),

  createMonograph: (payload) => api.post('/monographs', payload).then(res => res.data?.data),
  updateMonograph: (id, payload) => api.put(`/monographs/${id}`, payload).then(res => res.data?.data),
  saveStructure: (id, payload) => api.put(`/monographs/${id}/structure`, payload).then(res => res.data?.data),
  validateMonograph: (id) => api.get(`/monographs/${id}/validate`).then(res => res.data?.data),
  updateStatus: (id, status) => api.patch(`/monographs/${id}/status`, { status }).then(res => res.data?.data),
  deleteMonograph: (id) => api.delete(`/monographs/${id}`).then(res => res.data?.data),
}

export default monographService
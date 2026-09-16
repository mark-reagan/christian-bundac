import { api } from '../../lib/apiClient'

export const usersApi = {
  list: (params, signal) => api.get('/users', params, signal),
  get: (id, signal) => api.get(`/users/${id}`, undefined, signal),
  create: (payload) => api.post('/users', payload),
  update: (id, payload) => api.put(`/users/${id}`, payload),
  activate: (id) => api.post(`/users/${id}/activate`),
  deactivate: (id) => api.post(`/users/${id}/deactivate`),
  remove: (id) => api.del(`/users/${id}`),
}

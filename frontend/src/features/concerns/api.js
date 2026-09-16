import { api } from '../../lib/apiClient'

export const concernsApi = {
  list: (params, signal) => api.get('/concerns', params, signal),
  get: (id, signal) => api.get(`/concerns/${id}`, undefined, signal),
  create: (payload) => api.post('/concerns', payload),
  review: (id, payload) => api.post(`/concerns/${id}/review`, payload),
}

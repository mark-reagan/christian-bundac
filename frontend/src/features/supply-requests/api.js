import { api } from '../../lib/apiClient'

export const supplyRequestsApi = {
  list: (params, signal) => api.get('/supply-requests', params, signal),
  get: (id, signal) => api.get(`/supply-requests/${id}`, undefined, signal),
  create: (payload) => api.post('/supply-requests', payload),
  approve: (id) => api.post(`/supply-requests/${id}/approve`),
  decline: (id, decline_reason) => api.post(`/supply-requests/${id}/decline`, { decline_reason }),
  cancel: (id) => api.post(`/supply-requests/${id}/cancel`),
}

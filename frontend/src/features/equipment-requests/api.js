import { api } from '../../lib/apiClient'

export const equipmentRequestsApi = {
  list: (params, signal) => api.get('/equipment-requests', params, signal),
  get: (id, signal) => api.get(`/equipment-requests/${id}`, undefined, signal),
  create: (payload) => api.post('/equipment-requests', payload),
  approve: (id) => api.post(`/equipment-requests/${id}/approve`),
  decline: (id, decline_reason) => api.post(`/equipment-requests/${id}/decline`, { decline_reason }),
  cancel: (id) => api.post(`/equipment-requests/${id}/cancel`),
}

import { api } from '../../lib/apiClient'

export const releaseReturnApi = {
  releaseEquipment: (equipmentRequestId, payload) =>
    api.post(`/equipment-requests/${equipmentRequestId}/release`, payload ?? {}),
  returnEquipment: (equipmentTransactionId, payload) =>
    api.post(`/equipment-transactions/${equipmentTransactionId}/return`, payload),
  releaseSupply: (supplyRequestId) => api.post(`/supply-requests/${supplyRequestId}/release`),
}

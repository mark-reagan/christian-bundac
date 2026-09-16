import { api } from '../../lib/apiClient';

export const qrCodeApi = {
	scan: (code) => api.post('/barcode/scan', { code }),
};

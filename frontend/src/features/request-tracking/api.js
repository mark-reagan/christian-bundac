import { api } from '../../lib/apiClient';

export const requestTrackingApi = {
	get: (token, signal) =>
		api.get(`/public/requests/${token}`, undefined, signal),
};

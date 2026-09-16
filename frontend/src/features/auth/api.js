import { api } from '../../lib/apiClient';

function unwrapUserResponse(response) {
	return response?.data ?? response;
}

export const authApi = {
	login: async (credentials) => {
		const response = await api.post('/login', credentials);
		return { token: response.token, user: unwrapUserResponse(response) };
	},
	logout: () => api.post('/logout'),
	me: async () => unwrapUserResponse(await api.get('/me')),
	updateProfile: (payload) => api.put('/profile', payload),
};

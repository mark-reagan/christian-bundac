const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const configuredApiIsLoopback =
	configuredApiUrl &&
	/^https?:\/\/(?:localhost|127(?:\.\d{1,3}){3}|\[::1\])(?::\d+)?(?:\/|$)/i.test(
		configuredApiUrl,
	);
const BASE_URL =
	configuredApiUrl ||
	(import.meta.env.DEV ? 'http://localhost:8000/api/v1' : '');

if (import.meta.env.PROD && configuredApiIsLoopback) {
	throw new Error(
		'VITE_API_URL must not point to a loopback address in production.',
	);
}
if (import.meta.env.PROD && !BASE_URL) {
	throw new Error(
		'VITE_API_URL must be configured in the production environment.',
	);
}
const TOKEN_KEY = 'sipms_token';

export class ApiError extends Error {
	constructor(message, status, errors = null) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
		this.errors = errors;
	}
}

export function getToken() {
	return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
	if (token) {
		localStorage.setItem(TOKEN_KEY, token);
	} else {
		localStorage.removeItem(TOKEN_KEY);
	}
}

/**
 * Thin fetch wrapper around the Laravel API.
 * - Attaches the bearer token automatically.
 * - Parses JSON responses and throws ApiError on failure with
 *   Laravel's {message, errors} validation payload attached.
 */
async function request(path, { method = 'GET', body, params, signal } = {}) {
	let url = `${BASE_URL}${path}`;

	if (params) {
		const query = new URLSearchParams(
			Object.entries(params).filter(
				([, v]) => v !== undefined && v !== null && v !== '',
			),
		).toString();
		if (query) url += `?${query}`;
	}

	const headers = {
		Accept: 'application/json',
	};
	if (body !== undefined) headers['Content-Type'] = 'application/json';

	const token = getToken();
	if (token) headers['Authorization'] = `Bearer ${token}`;

	let response;
	try {
		response = await fetch(url, {
			method,
			headers,
			body: body !== undefined ? JSON.stringify(body) : undefined,
			signal,
		});
	} catch {
		throw new ApiError(
			'Unable to reach the server. Please check your connection.',
			0,
		);
	}

	const isJson = response.headers
		.get('content-type')
		?.includes('application/json');
	const payload = isJson ? await response.json().catch(() => null) : null;

	if (!response.ok) {
		if (response.status === 401) {
			setToken(null);
		}
		throw new ApiError(
			payload?.message || `Request failed with status ${response.status}`,
			response.status,
			payload?.errors || null,
		);
	}

	return payload;
}

export const api = {
	get: (path, params, signal) =>
		request(path, { method: 'GET', params, signal }),
	post: (path, body, params) =>
		request(path, { method: 'POST', body: body ?? {}, params }),
	put: (path, body) => request(path, { method: 'PUT', body: body ?? {} }),
	del: (path) => request(path, { method: 'DELETE' }),
};

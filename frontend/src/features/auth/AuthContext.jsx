import { useCallback, useEffect, useMemo, useState } from 'react';
import { getToken, setToken as persistToken } from '../../lib/apiClient';
import { authApi } from './api';
import AuthContext from './authContext';

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [initializing, setInitializing] = useState(() => Boolean(getToken()));

	useEffect(() => {
		const token = getToken();
		if (!token) return;
		let active = true;
		authApi
			.me()
			.then((freshUser) => {
				if (active) setUser(freshUser);
			})
			.catch(() => {
				persistToken(null);
				if (active) setUser(null);
			})
			.finally(() => {
				if (active) setInitializing(false);
			});
		return () => {
			active = false;
		};
	}, []);

	const login = useCallback(async (credentials) => {
		const res = await authApi.login(credentials);
		persistToken(res.token);
		setUser(res.user);
		return res.user;
	}, []);

	const logout = useCallback(async () => {
		try {
			await authApi.logout();
		} catch {
			// ignore network errors on logout — clear local state regardless
		}
		persistToken(null);
		setUser(null);
	}, []);

	const refreshUser = useCallback(async () => {
		const fresh = await authApi.me();
		setUser(fresh);
		return fresh;
	}, []);

	const value = useMemo(
		() => ({
			user,
			initializing,
			login,
			logout,
			refreshUser,
			isAuthenticated: !!user,
		}),
		[user, initializing, login, logout, refreshUser],
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

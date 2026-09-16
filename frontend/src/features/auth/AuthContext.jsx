import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';
import { getToken, setToken as persistToken } from '../../lib/apiClient';
import { authApi } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [initializing, setInitializing] = useState(true);

	useEffect(() => {
		const token = getToken();
		if (!token) {
			setInitializing(false);
			return;
		}
		authApi
			.me()
			.then(setUser)
			.catch(() => {
				persistToken(null);
				setUser(null);
			})
			.finally(() => setInitializing(false));
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

export function useAuth() {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
	return ctx;
}

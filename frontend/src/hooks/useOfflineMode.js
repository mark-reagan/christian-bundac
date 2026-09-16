import { useEffect, useState } from 'react';
import { useAuth } from '../features/auth/AuthContext';
import { ROLES } from '../lib/constants';

export function useOfflineMode() {
	const { user } = useAuth();
	const [isOffline, setIsOffline] = useState(() => !navigator.onLine);

	useEffect(() => {
		const markOnline = () => setIsOffline(false);
		const markOffline = () => setIsOffline(true);

		window.addEventListener('online', markOnline);
		window.addEventListener('offline', markOffline);
		return () => {
			window.removeEventListener('online', markOnline);
			window.removeEventListener('offline', markOffline);
		};
	}, []);

	return {
		isOffline,
		isReadOnlyAdmin: user?.role === ROLES.ADMIN && isOffline,
	};
}

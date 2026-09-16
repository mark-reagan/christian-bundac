import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Spinner from '../../components/ui/Spinner';

/**
 * Keeps already-authenticated users away from /login.
 */
export default function PublicOnlyRoute() {
	const { isAuthenticated, initializing } = useAuth();

	if (initializing) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<Spinner label="Loading…" />
			</div>
		);
	}

	if (isAuthenticated) {
		return <Navigate to="/" replace />;
	}

	return <Outlet />;
}

import { Navigate, Outlet, useLocation } from 'react-router-dom'
import Spinner from '../../components/ui/Spinner'
import { useAuth } from './AuthContext'

export default function ProtectedRoute({ roles }) {
  const { isAuthenticated, initializing, user } = useAuth()
  const location = useLocation()

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Loading your session…" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

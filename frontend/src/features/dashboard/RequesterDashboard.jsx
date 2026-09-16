import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useApiRequest } from '../../hooks/useApiRequest'
import Spinner from '../../components/ui/Spinner'
import ErrorAlert from '../../components/ui/ErrorAlert'
import Badge from '../../components/ui/Badge'
import Icon from '../../components/ui/Icon'
import { ROLES } from '../../lib/constants'
import { equipmentRequestsApi } from '../equipment-requests/api'
import { supplyRequestsApi } from '../supply-requests/api'

function QuickLink({ to, icon, label, description }) {
  return (
    <Link to={to} className="card flex items-start gap-3 transition-shadow hover:shadow-md">
      <span className="rounded-lg bg-brand-50 p-2 text-brand-700">
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <span>
        <span className="block text-sm font-semibold text-slate-900">{label}</span>
        <span className="block text-sm text-slate-500">{description}</span>
      </span>
    </Link>
  )
}

export default function RequesterDashboard() {
  const { user } = useAuth()
  const isFaculty = user.role === ROLES.FACULTY

  const equipmentRequests = useApiRequest((signal) => equipmentRequestsApi.list({ page: 1 }, signal), [])
  const supplyRequests = useApiRequest(
    (signal) => (isFaculty ? supplyRequestsApi.list({ page: 1 }, signal) : Promise.resolve(null)),
    [isFaculty]
  )

  return (
    <div className="space-y-6">
      <div className={`grid grid-cols-1 gap-4 ${isFaculty ? 'sm:grid-cols-2' : ''}`}>
        <QuickLink to="/equipment" icon="box" label="Browse Equipment" description="Find and request equipment for your event." />
        {isFaculty && (
          <QuickLink to="/supplies" icon="archive" label="Browse Supplies" description="Request consumable supplies." />
        )}
      </div>

      <div className="card">
        <h2 className="mb-3 text-base font-semibold text-slate-900">Your recent equipment requests</h2>
        {equipmentRequests.loading && <Spinner />}
        <ErrorAlert error={equipmentRequests.error} />
        {!equipmentRequests.loading && !equipmentRequests.error && (
          <ul className="divide-y divide-slate-100">
            {equipmentRequests.data?.data?.length ? (
              equipmentRequests.data.data.slice(0, 5).map((r) => (
                <li key={r.id} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-slate-700">{r.equipment?.name}</span>
                  <Badge status={r.status} />
                </li>
              ))
            ) : (
              <p className="py-4 text-sm text-slate-400">No equipment requests yet.</p>
            )}
          </ul>
        )}
      </div>

      {isFaculty && (
        <div className="card">
          <h2 className="mb-3 text-base font-semibold text-slate-900">Your recent supply requests</h2>
          {supplyRequests.loading && <Spinner />}
          <ErrorAlert error={supplyRequests.error} />
          {!supplyRequests.loading && !supplyRequests.error && (
            <ul className="divide-y divide-slate-100">
              {supplyRequests.data?.data?.length ? (
                supplyRequests.data.data.slice(0, 5).map((r) => (
                  <li key={r.id} className="flex items-center justify-between py-2 text-sm">
                    <span className="text-slate-700">{r.supply?.name}</span>
                    <Badge status={r.status} />
                  </li>
                ))
              ) : (
                <p className="py-4 text-sm text-slate-400">No supply requests yet.</p>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

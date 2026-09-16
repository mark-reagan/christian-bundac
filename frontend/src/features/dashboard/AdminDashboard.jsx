import { useApiRequest } from '../../hooks/useApiRequest';
import Spinner from '../../components/ui/Spinner';
import ErrorAlert from '../../components/ui/ErrorAlert';
import { dashboardApi } from './api';

function StatCard({ label, value, tone = 'default' }) {
	const toneClass =
		tone === 'warning'
			? 'text-amber-600'
			: tone === 'danger'
				? 'text-red-600'
				: 'text-slate-900';
	return (
		<div className="card">
			<p className="text-sm text-slate-500">{label}</p>
			<p className={`mt-1 text-3xl font-bold ${toneClass}`}>{value ?? '—'}</p>
		</div>
	);
}

export default function AdminDashboard() {
	const { data, error, loading } = useApiRequest(
		(signal) => dashboardApi.summary(signal),
		[],
	);

	if (loading) return <Spinner />;
	if (error) return <ErrorAlert error={error} />;

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<StatCard label="Total equipment" value={data.total_equipment} />
			<StatCard label="Total supplies" value={data.total_supplies} />
			<StatCard
				label="Low stock supplies"
				value={data.low_stock_supplies}
				tone={data.low_stock_supplies > 0 ? 'warning' : 'default'}
			/>
			<StatCard
				label="Pending equipment requests"
				value={data.pending_equipment_requests}
				tone={data.pending_equipment_requests > 0 ? 'warning' : 'default'}
			/>
			<StatCard
				label="Pending supply requests"
				value={data.pending_supply_requests}
				tone={data.pending_supply_requests > 0 ? 'warning' : 'default'}
			/>
			<StatCard
				label="Awaiting equipment release"
				value={data.awaiting_equipment_release}
				tone={data.awaiting_equipment_release > 0 ? 'warning' : 'default'}
			/>
			<StatCard
				label="Awaiting supply release"
				value={data.awaiting_supply_release}
				tone={data.awaiting_supply_release > 0 ? 'warning' : 'default'}
			/>
			<StatCard
				label="Active equipment loans"
				value={data.active_equipment_loans}
			/>
			<StatCard
				label="Open concerns"
				value={data.open_concerns}
				tone={data.open_concerns > 0 ? 'danger' : 'default'}
			/>
		</div>
	);
}

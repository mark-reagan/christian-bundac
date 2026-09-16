import { Link } from 'react-router-dom';
import { useApiRequest } from '../../hooks/useApiRequest';
import Spinner from '../../components/ui/Spinner';
import ErrorAlert from '../../components/ui/ErrorAlert';
import Icon from '../../components/ui/Icon';
import { equipmentRequestsApi } from '../equipment-requests/api';
import { supplyRequestsApi } from '../supply-requests/api';

function QuickLink({ to, icon, label, description }) {
	return (
		<Link
			to={to}
			className="card flex items-start gap-3 transition-shadow hover:shadow-md"
		>
			<span className="rounded-lg bg-brand-50 p-2 text-brand-700">
				<Icon name={icon} className="h-5 w-5" />
			</span>
			<span>
				<span className="block text-sm font-semibold text-slate-900">
					{label}
				</span>
				<span className="block text-sm text-slate-500">{description}</span>
			</span>
		</Link>
	);
}

export default function StaffDashboard() {
	const approvedEquipment = useApiRequest(
		(signal) =>
			equipmentRequestsApi.list({ status: 'approved', page: 1 }, signal),
		[],
	);
	const releasedEquipment = useApiRequest(
		(signal) =>
			equipmentRequestsApi.list({ status: 'released', page: 1 }, signal),
		[],
	);
	const approvedSupplies = useApiRequest(
		(signal) => supplyRequestsApi.list({ status: 'approved', page: 1 }, signal),
		[],
	);

	const loading =
		approvedEquipment.loading ||
		releasedEquipment.loading ||
		approvedSupplies.loading;
	const error =
		approvedEquipment.error ||
		releasedEquipment.error ||
		approvedSupplies.error;

	return (
		<div className="space-y-6">
			{loading && <Spinner />}
			<ErrorAlert error={error} />
			{!loading && !error && (
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
					<div className="card">
						<p className="text-sm text-slate-500">Awaiting equipment release</p>
						<p
							className={`mt-1 text-3xl font-bold ${approvedEquipment.data?.meta?.total > 0 ? 'text-amber-600' : 'text-slate-900'}`}
						>
							{approvedEquipment.data?.meta?.total ?? 0}
						</p>
					</div>
					<div className="card">
						<p className="text-sm text-slate-500">Equipment out for return</p>
						<p className="mt-1 text-3xl font-bold text-slate-900">
							{releasedEquipment.data?.meta?.total ?? 0}
						</p>
					</div>
					<div className="card">
						<p className="text-sm text-slate-500">Awaiting supply release</p>
						<p
							className={`mt-1 text-3xl font-bold ${approvedSupplies.data?.meta?.total > 0 ? 'text-amber-600' : 'text-slate-900'}`}
						>
							{approvedSupplies.data?.meta?.total ?? 0}
						</p>
					</div>
				</div>
			)}

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<QuickLink
					to="/release-return"
					icon="exchange"
					label="Release & Return"
					description="Process approved requests."
				/>
				<QuickLink
					to="/qr-scan"
					icon="camera"
					label="QR Scan"
					description="Scan a request QR code to view its status."
				/>
			</div>
		</div>
	);
}

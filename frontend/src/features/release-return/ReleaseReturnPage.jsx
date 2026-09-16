import { useState } from 'react';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import Spinner from '../../components/ui/Spinner';
import ErrorAlert from '../../components/ui/ErrorAlert';
import { useApiRequest } from '../../hooks/useApiRequest';
import { formatDate } from '../../lib/format';
import { equipmentRequestsApi } from '../equipment-requests/api';
import { supplyRequestsApi } from '../supply-requests/api';
import { releaseReturnApi } from './api';
import ReturnEquipmentModal from './ReturnEquipmentModal';

const TABS = [
	{ key: 'release-equipment', label: 'Release Equipment' },
	{ key: 'return-equipment', label: 'Return Equipment' },
	{ key: 'release-supply', label: 'Release Supplies' },
];

export default function ReleaseReturnPage() {
	const [tab, setTab] = useState('release-equipment');
	const [page, setPage] = useState(1);
	const [actionError, setActionError] = useState(null);
	const [returnTarget, setReturnTarget] = useState(null);

	const equipmentStatus = tab === 'release-equipment' ? 'approved' : 'released';
	const equipmentRequests = useApiRequest(
		(signal) =>
			equipmentRequestsApi.list({ page, status: equipmentStatus }, signal),
		[page, equipmentStatus, tab],
	);
	const supplyRequests = useApiRequest(
		(signal) =>
			tab === 'release-supply'
				? supplyRequestsApi.list({ page, status: 'approved' }, signal)
				: Promise.resolve(null),
		[page, tab],
	);

	function switchTab(next) {
		setTab(next);
		setPage(1);
		setActionError(null);
	}

	async function handleReleaseEquipment(id) {
		setActionError(null);
		try {
			await releaseReturnApi.releaseEquipment(id);
			equipmentRequests.refetch();
		} catch (err) {
			setActionError(err);
		}
	}

	async function handleReleaseSupply(id) {
		setActionError(null);
		try {
			await releaseReturnApi.releaseSupply(id);
			supplyRequests.refetch();
		} catch (err) {
			setActionError(err);
		}
	}

	async function openReturnModal(request) {
		setActionError(null);
		try {
			const response = await equipmentRequestsApi.get(request.id);
			const full = response?.data ?? response;
			if (!full.transaction) {
				setActionError({
					message: 'No active transaction found for this request.',
				});
				return;
			}
			setReturnTarget({ request: full, transactionId: full.transaction.id });
		} catch (err) {
			setActionError(err);
		}
	}

	const releaseEquipmentColumns = [
		{
			key: 'equipment',
			header: 'Equipment',
			render: (r) => r.equipment?.name || '—',
		},
		{
			key: 'requester',
			header: 'Requester',
			render: (r) => r.user?.name || '—',
		},
		{ key: 'quantity', header: 'Qty' },
		{
			key: 'purpose',
			header: 'Purpose',
			render: (r) => (
				<span className="line-clamp-1 max-w-xs">{r.purpose || '—'}</span>
			),
		},
		{
			key: 'dates',
			header: 'Reservation',
			render: (r) => `${formatDate(r.start_date)} – ${formatDate(r.end_date)}`,
		},
		{
			key: 'actions',
			header: '',
			render: (r) => (
				<button
					className="btn-primary btn-sm"
					onClick={() => handleReleaseEquipment(r.id)}
				>
					Release
				</button>
			),
		},
	];

	const returnEquipmentColumns = [
		{
			key: 'equipment',
			header: 'Equipment',
			render: (r) => r.equipment?.name || '—',
		},
		{
			key: 'requester',
			header: 'Requester',
			render: (r) => r.user?.name || '—',
		},
		{ key: 'quantity', header: 'Qty' },
		{
			key: 'purpose',
			header: 'Purpose',
			render: (r) => (
				<span className="line-clamp-1 max-w-xs">{r.purpose || '—'}</span>
			),
		},
		{ key: 'end_date', header: 'Due', render: (r) => formatDate(r.end_date) },
		{
			key: 'actions',
			header: '',
			render: (r) => (
				<button
					className="btn-primary btn-sm"
					onClick={() => openReturnModal(r)}
				>
					Return
				</button>
			),
		},
	];

	const releaseSupplyColumns = [
		{ key: 'supply', header: 'Supply', render: (r) => r.supply?.name || '—' },
		{
			key: 'requester',
			header: 'Requester',
			render: (r) => r.user?.name || '—',
		},
		{ key: 'quantity', header: 'Qty' },
		{
			key: 'purpose',
			header: 'Purpose',
			render: (r) => <span className="line-clamp-1 max-w-xs">{r.purpose}</span>,
		},
		{
			key: 'actions',
			header: '',
			render: (r) => (
				<button
					className="btn-primary btn-sm"
					onClick={() => handleReleaseSupply(r.id)}
				>
					Release
				</button>
			),
		},
	];

	const activeRequest =
		tab === 'release-supply' ? supplyRequests : equipmentRequests;
	const columns =
		tab === 'release-equipment'
			? releaseEquipmentColumns
			: tab === 'return-equipment'
				? returnEquipmentColumns
				: releaseSupplyColumns;

	return (
		<div className="space-y-4">
			<div>
				<h1 className="text-xl font-bold text-slate-900">
					Release &amp; Return
				</h1>
				<p className="text-sm text-slate-500">
					Execute admin-approved requests: physical release, return, and
					condition checks.
				</p>
			</div>

			<div className="flex gap-1 rounded-lg bg-slate-100 p-1 sm:inline-flex">
				{TABS.map((t) => (
					<button
						key={t.key}
						onClick={() => switchTab(t.key)}
						className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
							tab === t.key
								? 'bg-white text-brand-700 shadow-sm'
								: 'text-slate-500 hover:text-slate-700'
						}`}
					>
						{t.label}
					</button>
				))}
			</div>

			<Card>
				<ErrorAlert error={actionError} className="mb-4" />
				{activeRequest.loading && <Spinner />}
				<ErrorAlert error={activeRequest.error} />
				{!activeRequest.loading && !activeRequest.error && (
					<>
						<Table
							columns={columns}
							rows={activeRequest.data?.data}
							emptyMessage={
								tab === 'release-equipment'
									? 'No approved equipment awaiting release.'
									: tab === 'return-equipment'
										? 'No equipment currently out for return.'
										: 'No approved supply requests awaiting release.'
							}
						/>
						<Pagination meta={activeRequest.data} onPageChange={setPage} />
					</>
				)}
			</Card>

			<ReturnEquipmentModal
				open={!!returnTarget}
				onClose={() => setReturnTarget(null)}
				equipmentRequest={returnTarget?.request}
				transactionId={returnTarget?.transactionId}
				onSaved={() => equipmentRequests.refetch()}
			/>
		</div>
	);
}

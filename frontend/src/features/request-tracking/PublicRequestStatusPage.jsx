import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import DeclineReasonModal from '../../components/ui/DeclineReasonModal';
import ErrorAlert from '../../components/ui/ErrorAlert';
import ReturnEquipmentModal from '../release-return/ReturnEquipmentModal';
import { useAuth } from '../auth/AuthContext';
import { ROLES } from '../../lib/constants';
import { formatDate } from '../../lib/format';
import { equipmentRequestsApi } from '../equipment-requests/api';
import { supplyRequestsApi } from '../supply-requests/api';
import { releaseReturnApi } from '../release-return/api';
import { requestTrackingApi } from './api';
import { useApiRequest } from '../../hooks/useApiRequest';
import { useOfflineMode } from '../../hooks/useOfflineMode';

export default function PublicRequestStatusPage() {
	const { trackingToken } = useParams();
	const navigate = useNavigate();
	const { user } = useAuth();
	const { isReadOnlyAdmin } = useOfflineMode();
	const [actionError, setActionError] = useState(null);
	const [declineOpen, setDeclineOpen] = useState(false);
	const [returnOpen, setReturnOpen] = useState(false);
	const [downloading, setDownloading] = useState(false);
	const {
		data: result,
		error,
		refetch,
	} = useApiRequest(
		(signal) => requestTrackingApi.get(trackingToken, signal),
		[trackingToken],
	);

	if (error) {
		return (
			<div className="mx-auto max-w-xl">
				<ErrorAlert error={error} />
			</div>
		);
	}

	if (!result) {
		return (
			<div className="mx-auto max-w-xl text-sm text-slate-500">
				Loading request status…
			</div>
		);
	}

	const request = result.request;
	const isAdmin = user?.role === ROLES.ADMIN;
	const isStaff = user?.role === ROLES.STAFF;
	const isEquipment = result.type === 'equipment';
	const itemName =
		request.equipment?.name || request.supply?.name || 'Inventory request';

	async function downloadQr() {
		setDownloading(true);
		setActionError(null);
		try {
			const response = await fetch(request.qr_url);
			if (!response.ok) throw new Error('Unable to download the QR code.');

			const blob = await response.blob();
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = `request-${request.tracking_token}.png`;
			document.body.appendChild(link);
			link.click();
			link.remove();
			URL.revokeObjectURL(url);
		} catch (downloadError) {
			setActionError({ message: downloadError.message });
		} finally {
			setDownloading(false);
		}
	}

	async function refreshAfterAction(action) {
		if (isReadOnlyAdmin) return;
		setActionError(null);
		try {
			await action();
			refetch();
			setDeclineOpen(false);
		} catch (requestError) {
			setActionError(requestError);
		}
	}

	const transactionId = request.transaction?.id;

	return (
		<div className="mx-auto mt-2 max-w-2xl space-y-4">
			<div className="flex items-center">
				<Button
					type="button"
					variant="secondary"
					size="sm"
					onClick={() => navigate(-1)}
				>
					← Back
				</Button>
			</div>
			<div>
				<p className="text-sm font-medium text-brand-700">Request status</p>
				<h1 className="text-2xl font-bold text-slate-900">{itemName}</h1>
				<p className="text-sm text-slate-500">
					Tracking code: {request.tracking_token}
				</p>
			</div>

			<Card>
				<div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
					<dl className="grid flex-1 grid-cols-2 gap-4 text-sm">
						<div>
							<dt className="text-slate-500">Status</dt>
							<dd>
								<Badge status={request.status} />
							</dd>
						</div>
						<div>
							<dt className="text-slate-500">Quantity</dt>
							<dd className="font-medium text-slate-900">{request.quantity}</dd>
						</div>
						{request.start_date && (
							<div>
								<dt className="text-slate-500">Reservation</dt>
								<dd className="font-medium text-slate-900">
									{formatDate(request.start_date)} –{' '}
									{formatDate(request.end_date)}
								</dd>
							</div>
						)}
						{request.purpose && (
							<div className="col-span-2">
								<dt className="text-slate-500">Purpose</dt>
								<dd className="font-medium text-slate-900">
									{request.purpose}
								</dd>
							</div>
						)}
						<div>
							<dt className="text-slate-500">Submitted</dt>
							<dd className="font-medium text-slate-900">
								{formatDate(request.created_at)}
							</dd>
						</div>
						{request.decline_reason && (
							<div className="col-span-2">
								<dt className="text-slate-500">Reason</dt>
								<dd className="font-medium text-slate-900">
									{request.decline_reason}
								</dd>
							</div>
						)}
					</dl>
					<div className="shrink-0 text-center">
						<img
							src={request.qr_url}
							alt="QR code for request status"
							className="mx-auto h-36 w-36"
						/>
						<p className="mt-1 text-xs text-slate-500">Scan to reopen status</p>
						<Button
							type="button"
							variant="secondary"
							size="sm"
							onClick={downloadQr}
							loading={downloading}
						>
							Download QR
						</Button>
					</div>
				</div>

				<ErrorAlert error={actionError} className="mt-5" />
				{(isAdmin || isStaff) && (
					<div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
						{isAdmin && request.status === 'pending' && (
							<>
								<Button
									disabled={isReadOnlyAdmin}
									onClick={() =>
										refreshAfterAction(() =>
											isEquipment
												? equipmentRequestsApi.approve(request.id)
												: supplyRequestsApi.approve(request.id),
										)
									}
								>
									Approve
								</Button>
								<Button
									variant="danger"
									disabled={isReadOnlyAdmin}
									onClick={() => setDeclineOpen(true)}
								>
									Decline
								</Button>
							</>
						)}
						{isStaff && request.status === 'approved' && (
							<Button
								onClick={() =>
									refreshAfterAction(() =>
										isEquipment
											? releaseReturnApi.releaseEquipment(request.id)
											: releaseReturnApi.releaseSupply(request.id),
									)
								}
							>
								Release
							</Button>
						)}
						{isStaff &&
							isEquipment &&
							request.status === 'released' &&
							transactionId && (
								<Button onClick={() => setReturnOpen(true)}>Return</Button>
							)}
					</div>
				)}
			</Card>

			{!user && (
				<p className="text-center text-sm text-slate-500">
					<Link className="text-brand-700 hover:underline" to="/login">
						Sign in
					</Link>{' '}
					to manage this request.
				</p>
			)}

			<DeclineReasonModal
				open={declineOpen}
				onClose={() => setDeclineOpen(false)}
				disabled={isReadOnlyAdmin}
				title={`Decline ${isEquipment ? 'Equipment' : 'Supply'} Request`}
				onConfirm={(reason) =>
					refreshAfterAction(() =>
						isEquipment
							? equipmentRequestsApi.decline(request.id, reason)
							: supplyRequestsApi.decline(request.id, reason),
					)
				}
			/>

			{isEquipment && transactionId && (
				<ReturnEquipmentModal
					open={returnOpen}
					onClose={() => setReturnOpen(false)}
					equipmentRequest={request}
					transactionId={transactionId}
					onSaved={async () => {
						setReturnOpen(false);
						refetch();
					}}
				/>
			)}
		</div>
	);
}

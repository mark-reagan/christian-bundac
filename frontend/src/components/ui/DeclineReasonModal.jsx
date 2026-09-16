import { useState } from 'react';
import Modal from './Modal';
import Textarea from './Textarea';
import Button from './Button';
import ErrorAlert from './ErrorAlert';

export default function DeclineReasonModal({
	open,
	onClose,
	onConfirm,
	title = 'Decline Request',
	disabled = false,
}) {
	const [reason, setReason] = useState('');
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);

	async function handleSubmit(e) {
		e.preventDefault();
		if (disabled) return;
		setError(null);
		setLoading(true);
		try {
			await onConfirm(reason);
			setReason('');
			onClose();
		} catch (err) {
			setError(err);
		} finally {
			setLoading(false);
		}
	}

	return (
		<Modal open={open} onClose={onClose} title={title} size="sm">
			<form onSubmit={handleSubmit} className="space-y-4">
				<Textarea
					label="Reason for declining"
					required
					value={reason}
					onChange={(e) => setReason(e.target.value)}
					placeholder="Let the requester know why this was declined…"
				/>
				<ErrorAlert error={error} />
				<div className="flex justify-end gap-2">
					<Button type="button" variant="secondary" onClick={onClose}>
						Cancel
					</Button>
					<Button
						type="submit"
						variant="danger"
						loading={loading}
						disabled={disabled}
					>
						Decline
					</Button>
				</div>
			</form>
		</Modal>
	);
}

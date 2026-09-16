import { useEffect, useState } from 'react';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import ErrorAlert from '../../components/ui/ErrorAlert';
import { usersApi } from './api';
import { useOfflineMode } from '../../hooks/useOfflineMode';

const EMPTY = {
	name: '',
	email: '',
	password: '',
	role: 'faculty',
	department: '',
	contact_number: '',
};

export default function UserFormModal({ open, onClose, onSaved, user }) {
	const isEdit = !!user;
	const { isReadOnlyAdmin } = useOfflineMode();
	const [form, setForm] = useState(EMPTY);
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (open) {
			setForm(
				user
					? {
							name: user.name,
							email: user.email,
							password: '',
							role: user.role,
							department: user.department || '',
							contact_number: user.contact_number || '',
						}
					: EMPTY,
			);
			setError(null);
		}
	}, [open, user]);

	function update(field, value) {
		setForm((f) => ({ ...f, [field]: value }));
	}

	async function handleSubmit(e) {
		e.preventDefault();
		if (isReadOnlyAdmin) return;
		setError(null);
		setLoading(true);
		try {
			const payload = { ...form };
			if (isEdit && !payload.password) delete payload.password;
			const saved = isEdit
				? await usersApi.update(user.id, payload)
				: await usersApi.create(payload);
			onSaved(saved);
			onClose();
		} catch (err) {
			setError(err);
		} finally {
			setLoading(false);
		}
	}

	return (
		<Modal
			open={open}
			onClose={onClose}
			title={isEdit ? 'Edit User' : 'Add User'}
		>
			<form onSubmit={handleSubmit} className="space-y-4">
				<Input
					label="Full name"
					name="name"
					required
					value={form.name}
					onChange={(e) => update('name', e.target.value)}
				/>
				<Input
					label="Email address"
					type="email"
					name="email"
					required
					value={form.email}
					onChange={(e) => update('email', e.target.value)}
				/>
				<Select
					label="Role"
					name="role"
					value={form.role}
					onChange={(e) => update('role', e.target.value)}
				>
					<option value="admin">Admin</option>
					<option value="staff">Staff</option>
					<option value="faculty">Faculty</option>
					<option value="outsider">Outsider / Municipal / LGU</option>
				</Select>
				<div className="grid grid-cols-2 gap-4">
					<Input
						label="Department (optional)"
						name="department"
						value={form.department}
						onChange={(e) => update('department', e.target.value)}
					/>
					<Input
						label="Contact number (optional)"
						name="contact_number"
						value={form.contact_number}
						onChange={(e) => update('contact_number', e.target.value)}
					/>
				</div>
				<Input
					label={
						isEdit ? 'New password (leave blank to keep current)' : 'Password'
					}
					type="password"
					name="password"
					required={!isEdit}
					value={form.password}
					onChange={(e) => update('password', e.target.value)}
				/>

				<ErrorAlert error={error} />

				<div className="flex justify-end gap-2 pt-2">
					<Button type="button" variant="secondary" onClick={onClose}>
						Cancel
					</Button>
					<Button type="submit" loading={loading} disabled={isReadOnlyAdmin}>
						{isEdit ? 'Save changes' : 'Create user'}
					</Button>
				</div>
			</form>
		</Modal>
	);
}

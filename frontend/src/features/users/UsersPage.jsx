import { useState } from 'react';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Spinner from '../../components/ui/Spinner';
import ErrorAlert from '../../components/ui/ErrorAlert';
import Icon from '../../components/ui/Icon';
import { useApiRequest } from '../../hooks/useApiRequest';
import { useAuth } from '../auth/useAuth';
import { usersApi } from './api';
import UserFormModal from './UserFormModal';
import { useOfflineMode } from '../../hooks/useOfflineMode';

export default function UsersPage() {
	const { user: currentUser } = useAuth();
	const { isReadOnlyAdmin } = useOfflineMode();
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState('');
	const [role, setRole] = useState('');
	const [formOpen, setFormOpen] = useState(false);
	const [editing, setEditing] = useState(null);
	const [actionError, setActionError] = useState(null);

	const { data, error, loading, refetch } = useApiRequest(
		(signal) => usersApi.list({ page, search, role }, signal),
		[page, search, role],
	);

	async function handleToggleActive(u) {
		if (isReadOnlyAdmin) return;
		setActionError(null);
		try {
			if (u.is_active) {
				await usersApi.deactivate(u.id);
			} else {
				await usersApi.activate(u.id);
			}
			refetch();
		} catch (err) {
			setActionError(err);
		}
	}

	async function handleRemove(u) {
		if (isReadOnlyAdmin) return;
		if (!confirm(`Permanently delete "${u.name}"? This cannot be undone.`))
			return;
		setActionError(null);
		try {
			await usersApi.remove(u.id);
			refetch();
		} catch (err) {
			setActionError(err);
		}
	}

	const columns = [
		{
			key: 'name',
			header: 'Name',
			render: (r) => (
				<span className="font-medium text-slate-900">{r.name}</span>
			),
		},
		{ key: 'email', header: 'Email' },
		{
			key: 'role',
			header: 'Role',
			render: (r) => <Badge status={r.role}>{r.role}</Badge>,
		},
		{
			key: 'department',
			header: 'Department',
			render: (r) => r.department || '—',
		},
		{
			key: 'status',
			header: 'Status',
			render: (r) => (
				<span
					className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${r.is_active ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-600'}`}
				>
					{r.is_active ? 'Active' : 'Deactivated'}
				</span>
			),
		},
		{
			key: 'actions',
			header: '',
			render: (r) => (
				<div className="flex justify-end gap-2">
					<button
						className="btn-secondary btn-sm"
						disabled={isReadOnlyAdmin}
						onClick={() => {
							setEditing(r);
							setFormOpen(true);
						}}
					>
						Edit
					</button>
					{r.id !== currentUser.id && (
						<>
							<button
								className={
									r.is_active ? 'btn-danger btn-sm' : 'btn-primary btn-sm'
								}
								disabled={isReadOnlyAdmin}
								onClick={() => handleToggleActive(r)}
							>
								{r.is_active ? 'Deactivate' : 'Activate'}
							</button>
							<button
								className="btn-danger btn-sm"
								disabled={isReadOnlyAdmin}
								onClick={() => handleRemove(r)}
							>
								Delete
							</button>
						</>
					)}
				</div>
			),
		},
	];

	return (
		<div className="space-y-4">
			<div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
				<div>
					<h1 className="text-xl font-bold text-slate-900">User Management</h1>
					<p className="text-sm text-slate-500">
						Create accounts, assign roles, and manage access.
					</p>
				</div>
				<Button
					disabled={isReadOnlyAdmin}
					onClick={() => {
						setEditing(null);
						setFormOpen(true);
					}}
				>
					<Icon name="plus" className="h-4 w-4" /> Add User
				</Button>
			</div>

			<Card>
				<div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
					<Input
						placeholder="Search by name or email"
						value={search}
						onChange={(e) => {
							setPage(1);
							setSearch(e.target.value);
						}}
					/>
					<Select
						value={role}
						onChange={(e) => {
							setPage(1);
							setRole(e.target.value);
						}}
					>
						<option value="">All roles</option>
						<option value="admin">Admin</option>
						<option value="staff">Staff</option>
						<option value="faculty">Faculty</option>
						<option value="outsider">Outsider / LGU</option>
					</Select>
				</div>

				<ErrorAlert error={actionError} className="mb-4" />
				{loading && <Spinner />}
				<ErrorAlert error={error} />
				{!loading && !error && (
					<>
						<Table
							columns={columns}
							rows={data?.data}
							emptyMessage="No users found."
						/>
						<Pagination meta={data} onPageChange={setPage} />
					</>
				)}
			</Card>

			<UserFormModal
				open={formOpen}
				onClose={() => setFormOpen(false)}
				user={editing}
				onSaved={refetch}
			/>
		</div>
	);
}

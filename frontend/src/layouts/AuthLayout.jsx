import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
			<div className="w-full max-w-sm">
				<div className="mb-8 flex flex-col items-center gap-2 text-center">
					<img
						src="/logo.svg"
						alt="School Inventory Property Management System logo"
						className="h-12 w-12"
					/>
					<p className="text-sm font-semibold text-slate-600">
						School Inventory Property Management System
					</p>
				</div>
				<Outlet />
			</div>
		</div>
	);
}

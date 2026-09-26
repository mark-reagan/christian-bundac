import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '../lib/apiClient';

/**
 * Generic data-fetching hook.
 * fetcher: (signal) => Promise<data>
 * deps: dependency array that re-triggers the fetch
 */
export function useApiRequest(fetcher, deps = []) {
	const [data, setData] = useState(null);
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(true);
	const fetcherRef = useRef(fetcher);
	useEffect(() => {
		fetcherRef.current = fetcher;
	}, [fetcher]);

	const refetch = useCallback(() => {
		setLoading(true);
		setError(null);
		fetcherRef
			.current()
			.then((result) => setData(result))
			.catch((err) => {
				if (err?.name === 'AbortError') return;
				setError(
					err instanceof ApiError
						? err
						: new ApiError('Something went wrong.', 0),
				);
			})
			.finally(() => setLoading(false));
	}, []);

	useEffect(() => {
		let active = true;
		const controller = new AbortController();
		Promise.resolve()
			.then(() => fetcherRef.current(controller.signal))
			.then((result) => {
				if (active) {
					setData(result);
					setError(null);
				}
			})
			.catch((err) => {
				if (!active || err?.name === 'AbortError') return;
				setError(
					err instanceof ApiError
						? err
						: new ApiError('Something went wrong.', 0),
				);
			})
			.finally(() => {
				if (active) setLoading(false);
			});
		return () => {
			active = false;
			controller.abort();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, deps);

	return { data, error, loading, refetch };
}

/**
 * Hook for imperative write actions (create/update/delete) with
 * loading + error state, without auto-fetching on mount.
 */
export function useApiAction(action) {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const run = useCallback(
		async (...args) => {
			setLoading(true);
			setError(null);
			try {
				return await action(...args);
			} catch (err) {
				const apiErr =
					err instanceof ApiError
						? err
						: new ApiError('Something went wrong.', 0);
				setError(apiErr);
				throw apiErr;
			} finally {
				setLoading(false);
			}
		},
		[action],
	);

	return { run, loading, error, setError };
}

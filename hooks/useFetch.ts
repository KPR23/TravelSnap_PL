import { useEffect, useState } from "react";

interface FetchState<T> {
	data: T | null;
	loading: boolean;
	error: string | null;
}

export function useFetch<T>(url: string, init?: RequestInit): FetchState<T> {
	const [data, setData] = useState<T | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;

		if (!url) {
			setData(null);
			setError(null);
			setLoading(false);
			return;
		}

		setLoading(true);
		setError(null);

		fetch(url, init)
			.then((response) =>
				response.ok
					? response.json()
					: Promise.reject(new Error(`HTTP ${response.status}`)),
			)
			.then((json) => {
				if (cancelled) return;
				setData(json);
			})
			.catch((error) => {
				if (cancelled) return;
				setError(String(error));
			})
			.finally(() => {
				if (cancelled) return;
				setLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, [url, init]);

	return { data, loading, error };
}

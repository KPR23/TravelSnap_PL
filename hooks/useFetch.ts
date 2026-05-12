import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

const CACHE_KEY_PREFIX = "cache:v1:";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

interface CacheValue<T> {
	ts: number;
	data: T;
}

interface FetchState<T> {
	data: T | null;
	loading: boolean;
	error: string | null;
	// Refetch jest asynchroniczny (wykonuje request + zapis cache), wiec zwraca Promise.
	refetch: () => Promise<void>;
}

export function useFetch<T>(url: string, init?: RequestInit): FetchState<T> {
	const [data, setData] = useState<T | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchData = useCallback(
		async (isCancelled: () => boolean = () => false) => {
			if (!url) {
				setData(null);
				setError(null);
				setLoading(false);
				return;
			}

			const cacheKey = `${CACHE_KEY_PREFIX}${url}`;
			let hasFreshCache = false;

			try {
				const cachedData = await AsyncStorage.getItem(cacheKey);
				if (cachedData) {
					const parsed = JSON.parse(cachedData) as CacheValue<T>;
					hasFreshCache = Date.now() - parsed.ts < CACHE_TTL_MS;

					if (hasFreshCache && !isCancelled()) {
						setData(parsed.data);
						setError(null);
						setLoading(false);
					}
				}
			} catch {}

			if (!hasFreshCache) {
				setLoading(true);
				setError(null);
			}

			try {
				const response = await fetch(url, init);
				if (isCancelled()) return;
				if (!response.ok) {
					throw new Error(`HTTP ${response.status}`);
				}
				const json = await response.json();
				if (isCancelled()) return;
				setData(json);
				await AsyncStorage.setItem(
					cacheKey,
					JSON.stringify({ ts: Date.now(), data: json }),
				);
			} catch (error) {
				if (isCancelled()) return;
				if (hasFreshCache) return;
				setError(String(error));
			} finally {
				if (isCancelled()) return;
				if (hasFreshCache) return;
				setLoading(false);
			}
		},
		[url, init],
	);

	useEffect(() => {
		let cancelled = false;

		// Effect nie awaituje Promise; wystarczy odpalic go i pozwolic hookowi zarzadzac stanem.
		void fetchData(() => cancelled);

		return () => {
			cancelled = true;
		};
	}, [fetchData]);

	// Zwracamy wrapper bez argumentow, aby API hooka bylo jednoznaczne: refetch() => Promise<void>.
	return { data, loading, error, refetch: () => fetchData() };
}

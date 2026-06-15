import { COUNTRY_API, RESTCOUNTRIES_BASE_URL } from "@/constants/api";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import type { Country } from "@/types/country";
import { useQuery } from "@tanstack/react-query";

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
	const res = await fetch(url, init);
	if (!res.ok) {
		const error = new Error(`HTTP ${res.status}`) as Error & { status: number };
		error.status = res.status;
		throw error;
	}
	return res.json() as Promise<T>;
}

export function useCountriesQuery() {
	const { isConnected } = useNetworkStatus();

	return useQuery<Country[]>({
		queryKey: ["countries"],
		queryFn: () => fetchJson<Country[]>(COUNTRY_API),
		staleTime: 1000 * 60 * 60,
		enabled: isConnected,
	});
}

export function useCountryQuery(countryName: string) {
	const { isConnected } = useNetworkStatus();

	return useQuery<Country[]>({
		queryKey: ["countries", countryName],
		queryFn: () =>
			fetchJson<Country[]>(
				`${RESTCOUNTRIES_BASE_URL}/name/${encodeURIComponent(countryName)}`,
			),
		staleTime: 1000 * 60 * 60,
		enabled: isConnected && !!countryName,
	});
}

import { UNSPLASH_ACCESS_KEY, UNSPLASH_BASE_URL } from "@/constants/api";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import type { UnsplashResponse } from "@/types/unsplash";
import { useQuery } from "@tanstack/react-query";

async function fetchUnsplash(
	searchTerm: string,
	page = 1,
	perPage = 10,
): Promise<UnsplashResponse> {
	const res = await fetch(
		`${UNSPLASH_BASE_URL}/search/photos?query=${encodeURIComponent(searchTerm)}&page=${page}&per_page=${perPage}`,
		{ headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` } },
	);
	if (!res.ok) {
		const error = new Error(`Unsplash error: ${res.status}`) as Error & {
			status: number;
		};
		error.status = res.status;
		throw error;
	}
	return res.json();
}

export function useUnsplashQuery(searchTerm: string, perPage = 10) {
	const { isConnected } = useNetworkStatus();

	return useQuery<UnsplashResponse>({
		queryKey: ["unsplash", searchTerm, perPage],
		queryFn: () => fetchUnsplash(searchTerm, 1, perPage),
		enabled: isConnected && !!searchTerm,
		staleTime: 1000 * 60 * 30,
	});
}

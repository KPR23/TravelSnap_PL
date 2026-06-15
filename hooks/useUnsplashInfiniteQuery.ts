import {
	UNSPLASH_ACCESS_KEY,
	UNSPLASH_BASE_URL,
} from "@/constants/api";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import type { UnsplashResponse } from "@/types/unsplash";
import { useInfiniteQuery } from "@tanstack/react-query";

const PAGE_SIZE = 10;

async function fetchUnsplashPage(
	searchTerm: string,
	page: number,
): Promise<UnsplashResponse> {
	const res = await fetch(
		`${UNSPLASH_BASE_URL}/search/photos` +
			`?query=${encodeURIComponent(searchTerm)}&page=${page}&per_page=${PAGE_SIZE}`,
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

export function useUnsplashInfiniteQuery(searchTerm: string) {
	const { isConnected } = useNetworkStatus();

	return useInfiniteQuery({
		queryKey: ["unsplash", searchTerm, "infinite"],
		queryFn: ({ pageParam }) => fetchUnsplashPage(searchTerm, pageParam),
		initialPageParam: 1,
		getNextPageParam: (lastPage, allPages) =>
			lastPage.results.length === PAGE_SIZE ? allPages.length + 1 : undefined,
		enabled: isConnected && !!searchTerm,
		staleTime: 1000 * 60 * 30,
	});
}

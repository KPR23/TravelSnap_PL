import { loadTrips } from "@/utils/tripStorage";
import type { Trip } from "@/types/tripSchema";
import { useQuery } from "@tanstack/react-query";

export function useTripsQuery() {
	return useQuery<Trip[]>({
		queryKey: ["trips"],
		queryFn: loadTrips,
		staleTime: Infinity,
	});
}

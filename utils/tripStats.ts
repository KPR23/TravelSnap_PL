import type { Trip } from "@/types/trip";

export function getTripStats(trips: Trip[]) {
	const tripCount = trips.length;
	const averageRating =
		tripCount > 0
			? trips.reduce((acc, trip) => acc + trip.rating, 0) / tripCount
			: 0;
	const uniqueDestinations = new Set(
		trips.map((trip) => trip.destination.toLowerCase().trim()),
	).size;

	return {
		tripCount,
		averageRating,
		uniqueDestinations,
	};
}

import { Trip } from "@/types/tripSchema";

export function generateDummyTrips(count: number): Trip[] {
	return Array.from({ length: count }, (_, index) => ({
		id: index.toString(),
		title: `Trip ${index + 1}`,
		destination: `Destination ${index + 1}`,
		date: `2026-01-01` as Trip["date"],
		rating: (Math.floor(Math.random() * 5) + 1) as Trip["rating"],
		imageUri: `https://picsum.photos/200/300?random=${index}`,
		galleryUris: Array.from(
			{ length: Math.floor(Math.random() * 5) + 1 },
			(_, i) => `https://picsum.photos/200/300?random=${index * 10 + i}`,
		),
		isFavorite: false,
	}));
}

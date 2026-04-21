import type { Trip, TripData } from "@/types/trip";
import { createContext, useContext, useMemo, useState } from "react";

type TripsContextValue = {
	trips: Trip[];
	addTrip: (data: TripData) => string;
	deleteTrip: (id: string) => void;
	addGalleryImage: (tripId: string, uri: string) => void;
	removeGalleryImage: (tripId: string, uri: string) => void;
	getTripById: (id: string) => Trip | undefined;
};

const MOCK_TRIPS: Trip[] = [
	{
		id: "mock-1",
		title: "Weekend w Porto",
		destination: "Porto",
		date: "2026-03",
		rating: 5,
		imageUri:
			"https://images.unsplash.com/photo-1513735492246-483525079686?w=1200",
		galleryUris: [
			"https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=900",
			"https://images.unsplash.com/photo-1548707309-dcebeab9ea9b?w=900",
			"https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=900",
		],
	},
	{
		id: "mock-2",
		title: "Miejski wypad do Berlina",
		destination: "Berlin",
		date: "2025-11",
		rating: 4,
		galleryUris: [],
	},
];

const TripsContext = createContext<TripsContextValue | undefined>(undefined);

export function TripsProvider({ children }: { children: React.ReactNode }) {
	const [trips, setTrips] = useState<Trip[]>(MOCK_TRIPS);

	const value = useMemo<TripsContextValue>(
		() => ({
			trips,
			addTrip: (data) => {
				const id = Date.now().toString();
				setTrips((prev) => [...prev, { id, ...data }]);
				return id;
			},
			deleteTrip: (id) => {
				setTrips((prev) => prev.filter((trip) => trip.id !== id));
			},
			addGalleryImage: (tripId, uri) => {
				setTrips((prev) =>
					prev.map((trip) =>
						trip.id === tripId
							? { ...trip, galleryUris: [...(trip.galleryUris ?? []), uri] }
							: trip,
					),
				);
			},
			removeGalleryImage: (tripId, uri) => {
				setTrips((prev) =>
					prev.map((trip) =>
						trip.id === tripId
							? {
									...trip,
									galleryUris: (trip.galleryUris ?? []).filter(
										(itemUri) => itemUri !== uri,
									),
								}
							: trip,
					),
				);
			},
			getTripById: (id) => trips.find((trip) => trip.id === id),
		}),
		[trips],
	);

	return <TripsContext.Provider value={value}>{children}</TripsContext.Provider>;
}

export function useTrips(): TripsContextValue {
	const context = useContext(TripsContext);
	if (!context) {
		throw new Error("useTrips must be used within TripsProvider");
	}
	return context;
}

import { Colors } from "@/constants/Colors";
import type { Trip, TripData } from "@/types/trip";
import { loadTrips, saveTrips } from "@/utils/tripStorage";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

type TripsContextValue = {
	trips: Trip[];
	addTrip: (data: TripData) => Promise<string>;
	updateTrip: (id: string, data: Partial<TripData>) => Promise<void>;
	deleteTrip: (id: string) => Promise<void>;
	addGalleryImage: (tripId: string, uri: string) => Promise<void>;
	removeGalleryImage: (tripId: string, uri: string) => Promise<void>;
	setMainImage: (tripId: string, uri: string) => Promise<void>;
	toggleFavorite: (tripId: string) => Promise<void>;
	getTripById: (id: string) => Trip | undefined;
};

const TripsContext = createContext<TripsContextValue | undefined>(undefined);

export function TripsProvider({ children }: { children: React.ReactNode }) {
	const [trips, setTrips] = useState<Trip[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function loadTripsAsync() {
			const trips = await loadTrips();
			setTrips(trips);
			setLoading(false);
		}

		loadTripsAsync();
	}, []);

	const value = useMemo<TripsContextValue>(() => {
		const persistTrips = async (updatedTrips: Trip[]) => {
			setTrips(updatedTrips);
			await saveTrips(updatedTrips);
		};

		return {
			trips,
			addTrip: async (data: TripData) => {
				const id = Date.now().toString();
				const mergedGalleryUris = Array.from(
					new Set([data.imageUri, ...(data.galleryUris ?? [])].filter(Boolean)),
				) as string[];

				const newTrip = { id, ...data, galleryUris: mergedGalleryUris };
				const updatedTrips = [...trips, newTrip];

				await persistTrips(updatedTrips);

				return id;
			},
			updateTrip: async (id: string, data: Partial<TripData>) => {
				const updatedTrips = trips.map((trip) =>
					trip.id === id ? { ...trip, ...data } : trip,
				);
				await persistTrips(updatedTrips);
			},
			deleteTrip: async (id: string) => {
				const updatedTrips = trips.filter((trip) => trip.id !== id);
				await persistTrips(updatedTrips);
			},
			setMainImage: async (tripId: string, uri: string) => {
				const updatedTrips = trips.map((trip) =>
					trip.id === tripId
						? {
								...trip,
								imageUri: uri,
								galleryUris: Array.from(
									new Set([uri, ...(trip.galleryUris ?? [])]),
								),
							}
						: trip,
				);
				await persistTrips(updatedTrips);
			},
			addGalleryImage: async (tripId, uri) => {
				const updatedTrips = trips.map((trip) =>
					trip.id === tripId
						? {
								...trip,
								galleryUris: Array.from(
									new Set([...(trip.galleryUris ?? []), uri]),
								),
							}
						: trip,
				);
				await persistTrips(updatedTrips);
			},
			removeGalleryImage: async (tripId, uri) => {
				const updatedTrips = trips.map((trip) =>
					trip.id === tripId
						? {
								...trip,
								galleryUris: (trip.galleryUris ?? []).filter(
									(itemUri) => itemUri !== uri,
								),
							}
						: trip,
				);
				await persistTrips(updatedTrips);
			},
			toggleFavorite: async (tripId: string) => {
				const updatedTrips = trips.map((trip) =>
					trip.id === tripId
						? { ...trip, isFavorite: !trip.isFavorite }
						: trip,
				);
				await persistTrips(updatedTrips);
			},
			getTripById: (id) => trips.find((trip) => trip.id === id),
		};
	}, [trips]);

	if (loading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color={Colors.primary} />
			</View>
		);
	}

	return (
		<TripsContext.Provider value={value}>{children}</TripsContext.Provider>
	);
}

export function useTrips(): TripsContextValue {
	const context = useContext(TripsContext);

	if (!context) {
		throw new Error("useTrips must be used within TripsProvider");
	}

	return context;
}

const styles = StyleSheet.create({
	loadingContainer: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Colors.background,
	},
});

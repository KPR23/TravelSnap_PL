import { Colors } from "@/constants/Colors";
import type { Trip, TripFormData } from "@/types/tripSchema";
import { saveImageToTrip } from "@/utils/imageStorage";
import { loadTrips, saveTrips } from "@/utils/tripStorage";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

type TripsContextValue = {
	trips: Trip[];
	addTrip: (data: TripFormData) => Promise<string>;
	updateTrip: (id: string, data: Partial<TripFormData>) => Promise<void>;
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
		const persistTrips = async (
			getNextTrips: (prevTrips: Trip[]) => Trip[],
		) => {
			let nextTrips: Trip[] | undefined;

			setTrips((prevTrips) => {
				nextTrips = getNextTrips(prevTrips);
				return nextTrips;
			});

			if (nextTrips) {
				await saveTrips(nextTrips);
			}
		};

		return {
			trips,
			addTrip: async (data: TripFormData) => {
				const id = Date.now().toString();

				let imageUri = data.imageUri;

				if (imageUri) {
					imageUri = await saveImageToTrip(imageUri, id);
				}

				const mergedGalleryUris = Array.from(
					new Set([imageUri, ...(data.galleryUris ?? [])].filter(Boolean)),
				) as string[];

				const newTrip = { id, ...data, imageUri, galleryUris: mergedGalleryUris };
				await persistTrips((prevTrips) => [...prevTrips, newTrip]);

				return id;
			},
			updateTrip: async (id: string, data: Partial<TripFormData>) => {
				await persistTrips((prevTrips) =>
					prevTrips.map((trip) =>
						trip.id === id ? { ...trip, ...data } : trip,
					),
				);
			},
			deleteTrip: async (id: string) => {
				await persistTrips((prevTrips) =>
					prevTrips.filter((trip) => trip.id !== id),
				);
			},
			setMainImage: async (tripId: string, uri: string) => {
				await persistTrips((prevTrips) =>
					prevTrips.map((trip) =>
						trip.id === tripId
							? {
									...trip,
									imageUri: uri,
									galleryUris: Array.from(
										new Set([uri, ...(trip.galleryUris ?? [])]),
									),
								}
							: trip,
					),
				);
			},
			addGalleryImage: async (tripId, uri) => {
				await persistTrips((prevTrips) =>
					prevTrips.map((trip) =>
						trip.id === tripId
							? {
									...trip,
									galleryUris: Array.from(
										new Set([...(trip.galleryUris ?? []), uri]),
									),
								}
							: trip,
					),
				);
			},
			removeGalleryImage: async (tripId, uri) => {
				await persistTrips((prevTrips) =>
					prevTrips.map((trip) =>
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
			toggleFavorite: async (tripId: string) => {
				await persistTrips((prevTrips) =>
					prevTrips.map((trip) =>
						trip.id === tripId
							? { ...trip, isFavorite: !trip.isFavorite }
							: trip,
					),
				);
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

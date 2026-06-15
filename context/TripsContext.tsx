import { Colors } from "@/constants/Colors";
import type { Trip } from "@/types/tripSchema";
import { useTripsQuery } from "@/hooks/useTripsQuery";
import { queryClient } from "@/lib/queryClient";
import { saveTrips } from "@/utils/tripStorage";
import { createContext, useContext, useMemo } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

type TripsContextValue = {
	trips: Trip[];
	addGalleryImage: (tripId: string, uri: string) => Promise<void>;
	removeGalleryImage: (tripId: string, uri: string) => Promise<void>;
	setMainImage: (tripId: string, uri: string) => Promise<void>;
	toggleFavorite: (tripId: string) => Promise<void>;
	getTripById: (id: string) => Trip | undefined;
};

const TripsContext = createContext<TripsContextValue | undefined>(undefined);

export function TripsProvider({ children }: { children: React.ReactNode }) {
	const { data: trips = [], isLoading: loading } = useTripsQuery();

	const value = useMemo<TripsContextValue>(() => {
		const persistTrips = async (
			getNextTrips: (prevTrips: Trip[]) => Trip[],
		) => {
			const current = queryClient.getQueryData<Trip[]>(["trips"]) ?? trips;
			const nextTrips = getNextTrips(current);
			await saveTrips(nextTrips);
			await queryClient.invalidateQueries({ queryKey: ["trips"] });
		};

		return {
			trips,
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

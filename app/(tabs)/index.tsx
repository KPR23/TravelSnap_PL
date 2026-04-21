import EmptyState from "@/components/EmptyState";
import ScreenHeader from "@/components/ScreenHeader";
import TripCard from "@/components/TripCard";
import TripStats from "@/components/TripStats";
import { Colors } from "@/constants/Colors";
import { Spacing } from "@/constants/Spacing";
import type { Trip } from "@/types/trip";
import { Ionicons } from "@expo/vector-icons";
import { Link, router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
	const [trips, setTrips] = useState<Trip[]>([]);
	const {
		newTripId,
		newTripTitle,
		newTripDestination,
		newTripDate,
		newTripRating,
	} = useLocalSearchParams<{
		newTripId?: string;
		newTripTitle?: string;
		newTripDestination?: string;
		newTripDate?: string;
		newTripRating?: string;
	}>();

	useEffect(() => {
		if (
			!newTripId ||
			!newTripTitle ||
			!newTripDestination ||
			!newTripDate ||
			!newTripRating
		) {
			return;
		}

		const rating = Number(newTripRating);
		if (Number.isNaN(rating)) {
			return;
		}

		setTrips((prev) => [
			...prev,
			{
				id: newTripId,
				title: newTripTitle,
				destination: newTripDestination,
				date: newTripDate,
				rating,
			},
		]);
		router.setParams({
			newTripId: undefined,
			newTripTitle: undefined,
			newTripDestination: undefined,
			newTripDate: undefined,
			newTripRating: undefined,
		});
	}, [newTripId, newTripTitle, newTripDestination, newTripDate, newTripRating]);

	const handleDeleteTrip = (id: string) => {
		setTrips((prev) => prev.filter((trip) => trip.id !== id));
	};

	const averageRating =
		trips.length > 0
			? trips.reduce((acc, trip) => acc + trip.rating, 0) / trips.length
			: 0;

	const uniqueDestinations = new Set(
		trips.map((trip) => trip.destination.toLowerCase().trim()),
	).size;

	return (
		<SafeAreaView style={styles.container}>
			<ScreenHeader
				tripCount={trips.length}
				title="TravelSnap"
				subtitle="Twój dziennik podróży"
				showBadge={true}
			/>
			<TripStats
				tripCount={trips.length}
				averageRating={averageRating}
				uniqueDestinations={uniqueDestinations}
			/>
			<ScrollView contentContainerStyle={styles.content}>
				{trips.length === 0 ? (
					<EmptyState />
				) : (
					trips.map((trip) => (
						<Link
							key={trip.id}
							href={{
								pathname: "/trip/[id]",
								params: {
									id: trip.id,
									title: trip.title,
									destination: trip.destination,
									date: trip.date,
									rating: trip.rating.toString(),
								},
							}}
							asChild
						>
							<TripCard {...trip} onDelete={() => handleDeleteTrip(trip.id)} />
						</Link>
					))
				)}
			</ScrollView>
			<Pressable style={styles.fab} onPress={() => router.push("/add-trip")}>
				<Ionicons name="add" size={30} color={Colors.background} />
			</Pressable>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.background,
		paddingHorizontal: Spacing.lg,
	},
	content: {
		paddingTop: Spacing.lg,
		paddingBottom: Spacing.xl + 72,
	},
	fab: {
		position: "absolute",
		right: Spacing.lg,
		bottom: Spacing.xl,
		width: 56,
		height: 56,
		borderRadius: 28,
		backgroundColor: Colors.primary,
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#000",
		shadowOpacity: 0.3,
		shadowRadius: 6,
		elevation: 6,
	},
});

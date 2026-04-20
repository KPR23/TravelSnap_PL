import AddTripForm from "@/components/AddTripForm";
import EmptyState from "@/components/EmptyState";
import ScreenHeader from "@/components/ScreenHeader";
import TripCard from "@/components/TripCard";
import TripStats from "@/components/TripStats";
import { Colors } from "@/constants/Colors";
import { Spacing } from "@/constants/Spacing";
import type { Trip, TripData } from "@/types/trip";
import { Link } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
	const [trips, setTrips] = useState<Trip[]>([]);

	const handleAddTrip = (data: TripData) => {
		const id = Date.now().toString();
		setTrips((prev) => [...prev, { id, ...data }]);
	};

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
			<AddTripForm onAddTrip={handleAddTrip} />
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
		paddingBottom: Spacing.xl,
	},
});

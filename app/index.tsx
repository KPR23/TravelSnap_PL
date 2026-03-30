import AddTripForm from "@/components/AddTripForm";
import EmptyState from "@/components/EmptyState";
import ScreenHeader from "@/components/ScreenHeader";
import TripCard from "@/components/TripCard";
import TripStats from "@/components/TripStats";
import { Colors } from "@/constants/Colors";
import type { Trip, TripData } from "@/types/trip";
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
			<ScreenHeader tripCount={trips.length} />
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
						<TripCard
							key={trip.id}
							{...trip}
							onDelete={() => handleDeleteTrip(trip.id)}
						/>
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
		padding: 16,
	},
	content: {
		padding: 16,
	},
});

import { ScrollView, StyleSheet, Text } from "react-native";

import AddTripForm from "@/components/AddTripForm";
import TripCard from "@/components/TripCard";
import type { Trip, TripData } from "@/types/trip";
import { useState } from "react";
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

	return (
		<SafeAreaView style={styles.container}>
			<AddTripForm onAddTrip={handleAddTrip} />
			<Text>Liczba podróży: {trips.length}</Text>
			<ScrollView contentContainerStyle={styles.content}>
				{trips.map((trip) => (
					<TripCard
						key={trip.id}
						{...trip}
						onDelete={() => handleDeleteTrip(trip.id)}
					/>
				))}
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f5f5f5",
		padding: 16,
	},
	content: {
		padding: 16,
	},
});

import { ScrollView, StyleSheet, View } from "react-native";

import AddTripForm from "@/components/AddTripForm";
import type { TripCardProps } from "@/components/TripCard";
import TripCard from "@/components/TripCard";
import { useState } from "react";

const initialTrips: TripCardProps[] = [
	{
		title: "Wakacje w Polsce",
		destination: "Warszawa",
		date: "2026-03-07",
		rating: 5,
	},
	{
		title: "Weekend w Krakowie",
		destination: "Kraków",
		date: "2026-03-14",
		rating: 4,
	},
	{
		title: "Wyjazd na Bali",
		destination: "Ubud",
		date: "2026-07-20",
		rating: 3,
	},
];

export default function HomeScreen() {
	const [trips, setTrips] = useState<TripCardProps[]>();

	const handleAddTrip = (
		title: string,
		destination: string,
		date: string,
		rating: number,
	) => {
		setTrips([
			...(trips || []),
			{ title, destination, date, rating } as TripCardProps,
		]);
	};

	return (
		<View style={styles.container}>
			<AddTripForm onAddTrip={handleAddTrip} />

			<ScrollView contentContainerStyle={styles.content}>
				{trips?.map((trip) => (
					<TripCard
						key={`${trip.title}-${trip.date}`}
						title={trip.title}
						destination={trip.destination}
						date={trip.date}
						rating={trip.rating}
					/>
				))}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		marginTop: 100,
		backgroundColor: "#f5f5f5",
		padding: 16,
	},
	content: {
		padding: 16,
	},
});

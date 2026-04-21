import AddTripForm from "@/components/AddTripForm";
import { Colors } from "@/constants/Colors";
import type { TripData } from "@/types/trip";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddTripScreen() {
	const handleAddTrip = (data: TripData) => {
		const id = Date.now().toString();
		router.replace({
			pathname: "/(tabs)",
			params: {
				newTripId: id,
				newTripTitle: data.title,
				newTripDestination: data.destination,
				newTripDate: data.date,
				newTripRating: data.rating.toString(),
			},
		});
	};

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.content}>
				<AddTripForm onAddTrip={handleAddTrip} />
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.card,
	},
	content: {
		flex: 1,
		padding: 16,
	},
});

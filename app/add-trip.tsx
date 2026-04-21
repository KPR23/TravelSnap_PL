import AddTripForm from "@/components/AddTripForm";
import { Colors } from "@/constants/Colors";
import { useTrips } from "@/context/TripsContext";
import type { TripData } from "@/types/trip";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddTripScreen() {
	const { addTrip } = useTrips();

	const handleAddTrip = (data: TripData) => {
		addTrip(data);
		router.replace({
			pathname: "/(tabs)",
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

import TripForm from "@/components/TripForm";
import { Colors } from "@/constants/Colors";
import { Spacing } from "@/constants/Spacing";
import { useTrips } from "@/context/TripsContext";
import { TripFormData } from "@/types/tripSchema";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditTripScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const router = useRouter();
	const { trips, updateTrip } = useTrips();
	const trip = useMemo(() => trips.find((t) => t.id === id), [trips, id]);

	const onSubmit = async (data: TripFormData) => {
		if (!trip) return;
		await updateTrip(trip.id, data);
		router.back();
	};

	if (!trip) {
		return (
			<View style={styles.empty}>
				<Text style={styles.emptyText}>Nie znaleziono podróży.</Text>
				<Pressable onPress={() => router.back()}>
					<Text>Wróć</Text>
				</Pressable>
			</View>
		);
	}

	return (
		<SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
			<TripForm
				defaultValues={trip}
				onSubmit={onSubmit}
				buttonLabel="Zapisz zmiany"
				tripId={trip.id}
			/>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingHorizontal: Spacing.lg,
		paddingTop: Spacing.md,
		paddingBottom: Spacing.lg,
		gap: Spacing.lg,
		backgroundColor: Colors.background,
	},
	empty: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		gap: Spacing.sm,
	},
	emptyText: {
		fontSize: 16,
		color: Colors.textSecondary,
	},
});

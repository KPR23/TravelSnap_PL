import ScreenHeader from "@/components/ScreenHeader";
import { TripCard } from "@/components/TripCard";
import TripStats from "@/components/TripStats";
import { Colors } from "@/constants/Colors";
import { Spacing } from "@/constants/Spacing";
import { useTrips } from "@/context/TripsContext";
import { getTripStats } from "@/utils/tripStats";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback } from "react";
import { FlatList, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CARD_HEIGHT = 140;

export default function HomeScreen() {
	const { trips } = useTrips();
	const { tripCount, averageRating, uniqueDestinations } = getTripStats(trips);

	const handleTripPress = useCallback(
		(id: string) => {
			router.push(`/trip/${id}`);
		},
		[router],
	);

	return (
		<SafeAreaView style={styles.container}>
			<ScreenHeader
				tripCount={tripCount}
				title="TravelSnap"
				subtitle="Twój dziennik podróży"
				showBadge={true}
			/>
			<TripStats
				tripCount={tripCount}
				averageRating={averageRating}
				uniqueDestinations={uniqueDestinations}
			/>
			<FlatList
				data={trips}
				keyExtractor={(item) => item.id}
				getItemLayout={(_, index) => ({
					length: CARD_HEIGHT,
					offset: CARD_HEIGHT * index,
					index,
				})}
				initialNumToRender={10}
				windowSize={5}
				renderItem={({ item }) => (
					<TripCard trip={item} onPress={handleTripPress} />
				)}
			/>
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

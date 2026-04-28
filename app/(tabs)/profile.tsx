import Avatar from "@/components/Avatar";
import ScreenHeader from "@/components/ScreenHeader";
import TripStats from "@/components/TripStats";
import { Colors } from "@/constants/Colors";
import { Spacing } from "@/constants/Spacing";
import { useTrips } from "@/context/TripsContext";
import { getTripStats } from "@/utils/tripStats";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ExploreScreen() {
	const { trips } = useTrips();
	const { tripCount, averageRating, uniqueDestinations } = getTripStats(trips);

	const NAME = "Kacper Zabłudowski";
	const JOINED_DATE = "March 2026";

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<Avatar name={NAME} size={48} />
				<ScreenHeader
					title={NAME}
					subtitle={`Joined ${JOINED_DATE}`}
					showBadge={false}
				/>
			</View>
			<View>
				<TripStats
					tripCount={tripCount}
					averageRating={averageRating}
					uniqueDestinations={uniqueDestinations}
				/>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.background,
		paddingHorizontal: Spacing.lg,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.md,
	},
	name: {
		fontSize: 22,
		fontWeight: "bold",
		color: Colors.textPrimary,
	},
	subtitle: {
		fontSize: 16,
		color: Colors.textSecondary,
	},
});

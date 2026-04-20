import Avatar from "@/components/Avatar";
import ScreenHeader from "@/components/ScreenHeader";
import TripStats from "@/components/TripStats";
import { Colors } from "@/constants/Colors";
import { Spacing } from "@/constants/Spacing";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ExploreScreen() {
	const NAME = "Kacper Zabłudowski";
	const JOINED_DATE = "March 2026";
	const COUNTRIES_VISITED = 10;
	const AVERAGE_RATING = 4.5;
	const UNIQUE_DESTINATIONS = 10;

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
					tripCount={COUNTRIES_VISITED}
					averageRating={AVERAGE_RATING}
					uniqueDestinations={UNIQUE_DESTINATIONS}
				/>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: Spacing.lg,
		backgroundColor: Colors.background,
		paddingHorizontal: Spacing.lg,
		gap: Spacing.xs,
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

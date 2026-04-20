import RatingStars from "@/components/RatingStars";
import { Colors } from "@/constants/Colors";
import { Spacing } from "@/constants/Spacing";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TripDetailScreen() {
	const { id, title, destination, date, rating } = useLocalSearchParams<{
		id: string;
		title: string;
		destination: string;
		date: string;
		rating: string;
	}>();
	const parsedRating = Number(rating) || 0;

	return (
		<>
			<Stack.Screen
				options={{
					title: title || "Trip Detail",
					headerStyle: { backgroundColor: Colors.background },
					headerTintColor: Colors.primary,
					headerBackButtonDisplayMode: "minimal",
					headerBackTitle: "",
				}}
			/>
			<SafeAreaView
				style={styles.container}
				edges={["left", "right", "bottom"]}
			>
				<ScrollView contentContainerStyle={styles.content}>
					<View style={styles.topSection}>
						<Text style={styles.title}>{title}</Text>
						<View style={styles.row}>
							<Ionicons
								name="location-outline"
								size={16}
								color={Colors.textSecondary}
							/>
							<Text style={styles.meta}>{destination}</Text>
						</View>
						<View style={styles.row}>
							<Ionicons
								name="calendar-outline"
								size={14}
								color={Colors.textSecondary}
							/>
							<Text style={styles.meta}>{date}</Text>
						</View>
						<RatingStars rating={parsedRating} />
					</View>
				</ScrollView>
			</SafeAreaView>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.background,
		paddingHorizontal: Spacing.lg,
	},
	content: {
		paddingBottom: Spacing.xl,
	},
	topSection: {
		gap: Spacing.sm,
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		color: Colors.textPrimary,
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.xs,
	},
	meta: {
		fontSize: 14,
		color: Colors.textSecondary,
	},
});

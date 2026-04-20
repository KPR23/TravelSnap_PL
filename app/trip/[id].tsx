import RatingStars from "@/components/RatingStars";
import { Colors } from "@/constants/Colors";
import { Spacing } from "@/constants/Spacing";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TripDetailScreen() {
	const { id, title, destination, date, rating } = useLocalSearchParams<{
		id: string;
		title: string;
		destination: string;
		date: string;
		rating: string;
	}>();
	const router = useRouter();
	const parsedRating = Number(rating) || 0;
	const [isFavorite, setIsFavorite] = useState(false);

	return (
		<>
			<Stack.Screen
				options={{
					title: title || "Trip Detail",
					headerStyle: { backgroundColor: Colors.background },
					headerTintColor: Colors.primary,
					headerBackVisible: false,
					headerRight: () => (
						<Pressable
							style={styles.favoriteButton}
							onPress={() => setIsFavorite(!isFavorite)}
						>
							<Ionicons
								name={isFavorite ? "heart" : "heart-outline"}
								size={24}
								color={isFavorite ? Colors.accent : Colors.textSecondary}
							/>
						</Pressable>
					),
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
						<Pressable style={styles.backButton} onPress={() => router.back()}>
							<Text style={styles.backButtonText}>Powrót do listy</Text>
						</Pressable>
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
	backButton: {
		marginTop: Spacing.md,
		backgroundColor: Colors.primary,
		borderRadius: 8,
		padding: 12,
		alignItems: "center",
		justifyContent: "center",
	},
	backButtonText: {
		color: Colors.background,
		fontSize: 16,
		fontWeight: "600",
	},
	favoriteButton: {
		padding: Spacing.sm,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
	},
});

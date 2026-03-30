import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import type { ReactElement } from "react";
import { StyleSheet, View } from "react-native";
interface RatingStarsProps {
	rating: number;
	maxStars?: number;
}

export default function RatingStars({
	rating,
	maxStars = 5,
}: RatingStarsProps) {
	const normalizedRating = Math.max(0, Math.min(rating, maxStars));
	const stars: ReactElement[] = [];

	for (let i = 1; i <= maxStars; i++) {
		stars.push(
			<View key={i} style={styles.starContainer}>
				{i <= normalizedRating ? (
					<Ionicons name="star" style={styles.starIcon} />
				) : (
					<Ionicons name="star-outline" style={styles.starIcon} />
				)}
			</View>,
		);
	}

	return <View style={styles.row}>{stars}</View>;
}

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		marginTop: 2,
	},
	starContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
	},
	starIcon: {
		fontSize: 16,
		color: Colors.accent,
		marginRight: 2,
	},
});

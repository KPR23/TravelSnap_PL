import { Colors } from "@/constants/Colors";
import { Spacing } from "@/constants/Spacing";
import { Ionicons } from "@expo/vector-icons";
import type { ReactElement } from "react";
import { Pressable, StyleSheet, View } from "react-native";
interface RatingStarsProps {
	rating: number;
	maxStars?: number;
	onChange?: (rating: number) => void;
}

export default function RatingStars({
	rating,
	maxStars = 5,
	onChange,
}: RatingStarsProps) {
	const normalizedRating = Math.max(0, Math.min(rating, maxStars));
	const stars: ReactElement[] = [];

	for (let i = 1; i <= maxStars; i++) {
		stars.push(
			<Pressable key={i} onPress={() => onChange?.(i)}>
				<View style={styles.starContainer}>
					{i <= normalizedRating ? (
						<Ionicons name="star" style={styles.starIcon} />
					) : (
						<Ionicons name="star-outline" style={styles.starIcon} />
					)}
				</View>
			</Pressable>,
		);
	}

	return <View style={styles.row}>{stars}</View>;
}

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		marginTop: Spacing.xs - 2,
	},
	starContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
	},
	starIcon: {
		fontSize: 24,
		color: Colors.accent,
		marginRight: Spacing.xs - 2,
	},
});

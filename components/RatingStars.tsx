import { Colors } from "@/constants/Colors";
import { Spacing } from "@/constants/Spacing";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, type ReactElement } from "react";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useSharedValue } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

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
	const containerWidth = useSharedValue(0);
	const lastRating = useSharedValue(normalizedRating);
	const stars: ReactElement[] = [];

	useEffect(() => {
		lastRating.value = normalizedRating;
	}, [lastRating, normalizedRating]);

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

	const panGesture = Gesture.Pan()
		.enabled(!!onChange)
		.onUpdate((e) => {
			if (!onChange || containerWidth.value === 0) return;

			const starWidth = containerWidth.value / maxStars;
			const newRating = Math.max(
				1,
				Math.min(maxStars, Math.ceil(e.x / starWidth)),
			);

			if (newRating !== lastRating.value) {
				lastRating.value = newRating;
				scheduleOnRN(onChange, newRating);
			}
		});

	return (
		<GestureDetector gesture={panGesture}>
			<View
				style={styles.row}
				onLayout={(event) => {
					containerWidth.value = event.nativeEvent.layout.width;
				}}
			>
				{stars}
			</View>
		</GestureDetector>
	);
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

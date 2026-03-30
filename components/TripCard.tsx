import { Pressable, StyleSheet, Text, View } from "react-native";

import { Colors } from "@/constants/Colors";
import { Trip } from "@/types/trip";
import RatingStars from "./RatingStars";

type TripCardProps = Trip & { onDelete: () => void };

export default function TripCard({
	onDelete,
	title,
	destination,
	date,
	rating,
}: TripCardProps) {
	return (
		<View style={styles.card}>
			<Text style={styles.title}>{title}</Text>
			<Text style={styles.meta}>
				{destination} | {date}
			</Text>
			<RatingStars rating={rating} />
			<Pressable onPress={onDelete} style={styles.deleteButton}>
				<Text style={styles.deleteButtonText}>Usuń</Text>
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		backgroundColor: Colors.card,
		padding: 16,
		borderRadius: 16,
		marginBottom: 12,
		shadowColor: "#000",
		shadowOpacity: 0.2,
		shadowRadius: 8,
		elevation: 4,
	},
	title: {
		fontSize: 18,
		fontWeight: "bold",
		color: Colors.textPrimary,
	},
	meta: {
		fontSize: 13,
		color: Colors.textSecondary,
		marginTop: 4,
	},
	deleteButton: {
		alignSelf: "flex-start",
		marginTop: 12,
		backgroundColor: `${Colors.accent}26`,
		borderRadius: 12,
		padding: 6,
	},
	deleteButtonText: {
		color: Colors.accent,
		fontSize: 15,
		fontWeight: "600",
	},
});

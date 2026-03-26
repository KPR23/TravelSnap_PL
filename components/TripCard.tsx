import { Button, StyleSheet, Text, View } from "react-native";

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
			<RatingStars rating={Number(rating)} />
			<Button title="Usuń" onPress={onDelete} />
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		backgroundColor: "#fff",
		padding: 16,
		borderRadius: 32,
		marginBottom: 12,
		shadowColor: "#000",
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 3,
	},
	title: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#1a1a2e",
	},
	meta: {
		fontSize: 14,
		color: "#888",
	},
});

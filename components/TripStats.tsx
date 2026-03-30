import { Colors } from "@/constants/Colors";
import { StyleSheet, Text, View } from "react-native";

interface TripStatsProps {
	tripCount: number;
	averageRating: number;
	uniqueDestinations: number;
}

export default function TripStats({
	tripCount,
	averageRating,
	uniqueDestinations,
}: TripStatsProps) {
	return (
		<View style={styles.container}>
			<View style={styles.stat}>
				<Text style={styles.statText}>{tripCount}</Text>
				<Text style={styles.label}>Podróże</Text>
			</View>
			<View style={styles.stat}>
				<Text style={styles.statText}>{averageRating.toFixed(1)}</Text>
				<Text style={styles.label}>Średnia ocena</Text>
			</View>
			<View style={styles.stat}>
				<Text style={styles.statText}>{uniqueDestinations}</Text>
				<Text style={styles.label}>Kraje</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		gap: 8,
		marginBottom: 12,
	},
	stat: {
		flex: 1,
		backgroundColor: Colors.card,
		padding: 12,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
	},
	statText: {
		fontSize: 16,
		fontWeight: "bold",
		color: Colors.textPrimary,
	},
	label: {
		fontSize: 12,
		color: Colors.textSecondary,
	},
});

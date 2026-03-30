import { Colors } from "@/constants/Colors";
import { StyleSheet, Text, View } from "react-native";

interface ScreenHeaderProps {
	tripCount: number;
}

export default function ScreenHeader({ tripCount }: ScreenHeaderProps) {
	return (
		<View style={styles.container}>
			<View>
				<Text style={styles.title}>TravelSnap</Text>
				<Text style={styles.subtitle}>Twój dziennik podróży</Text>
			</View>
			<View style={styles.badgeContainer}>
				<Text style={styles.badgeText}>{tripCount}</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		paddingTop: 20,
		paddingBottom: 12,
		paddingLeft: 16,
		paddingRight: 16,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		gap: 4,
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		color: Colors.textPrimary,
	},
	subtitle: {
		fontSize: 16,
		color: Colors.textSecondary,
	},
	badgeContainer: {
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: Colors.accent,
		justifyContent: "center",
		alignItems: "center",
	},
	badgeText: {
		color: Colors.textPrimary,
		fontSize: 16,
		fontWeight: "bold",
	},
});

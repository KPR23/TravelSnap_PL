import { Colors } from "@/constants/Colors";
import { StyleSheet, Text, View } from "react-native";

interface ScreenHeaderProps {
	tripCount: number;
}

export default function ScreenHeader({ tripCount }: ScreenHeaderProps) {
	return (
		<View>
			<Text style={styles.title}>TravelSnap</Text>
			<Text style={styles.subtitle}>Twój dziennik podróży</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	title: {
		fontSize: 24,
		fontWeight: "bold",
		color: Colors.textPrimary,
	},
	subtitle: {
		fontSize: 16,
		color: Colors.textSecondary,
	},
});

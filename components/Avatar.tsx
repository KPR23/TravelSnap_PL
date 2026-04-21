import { Colors } from "@/constants/Colors";
import { Spacing } from "@/constants/Spacing";
import { StyleSheet, Text, View } from "react-native";

interface AvatarProps {
	name: string;
	size: number;
}

export default function Avatar({ name, size = 40 }: AvatarProps) {
	return (
		<View style={[styles.container, { width: size, height: size }]}>
			<Text style={[styles.text, { fontSize: size / 2 - Spacing.sm }]}>
				{name.charAt(0).toUpperCase()}
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		borderRadius: 999,
		backgroundColor: Colors.border,
		justifyContent: "center",
		alignItems: "center",
	},
	text: {
		color: Colors.textPrimary,
		fontWeight: "bold",
	},
});

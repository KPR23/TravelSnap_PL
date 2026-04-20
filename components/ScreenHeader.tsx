import { Colors } from "@/constants/Colors";
import { Spacing } from "@/constants/Spacing";
import { StyleSheet, Text, View } from "react-native";

interface ScreenHeaderProps {
	title: string;
	subtitle: string;
	showBadge: boolean;
	tripCount?: number;
}

export default function ScreenHeader({
	tripCount,
	title,
	subtitle,
	showBadge,
}: ScreenHeaderProps) {
	return (
		<View style={styles.container}>
			<View>
				<Text style={styles.title}>{title}</Text>
				<Text style={styles.subtitle}>{subtitle}</Text>
			</View>
			{showBadge && (
				<View style={styles.badgeContainer}>
					<Text style={styles.badgeText}>{tripCount}</Text>
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		paddingTop: Spacing.sm,
		paddingBottom: Spacing.lg,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		gap: Spacing.xs,
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

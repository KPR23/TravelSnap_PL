import { Colors } from "@/constants/Colors";
import { Spacing } from "@/constants/Spacing";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface ErrorViewProps {
	message: string;
	onRetry?: () => void;
	retryLabel?: string;
}

export function ErrorView({ message, onRetry, retryLabel }: ErrorViewProps) {
	return (
		<View style={styles.container}>
			<Ionicons name="alert-circle" size={24} color={Colors.error} />
			<Text style={styles.message}>{message}</Text>
			{onRetry ? (
				<Pressable style={styles.button} onPress={onRetry}>
					<Text style={styles.buttonText}>
						{retryLabel ?? "Spróbuj ponownie"}
					</Text>
				</Pressable>
			) : null}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		gap: Spacing.md,
	},
	message: {
		fontSize: 16,
		color: Colors.textPrimary,
	},
	button: {
		paddingHorizontal: Spacing.lg,
		paddingVertical: Spacing.sm,
		borderRadius: Spacing.sm,
		backgroundColor: Colors.primary,
	},
	buttonText: {
		color: Colors.background,
		fontSize: 16,
		fontWeight: "600",
	},
});

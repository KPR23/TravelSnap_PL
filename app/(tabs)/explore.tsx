import ScreenHeader from "@/components/ScreenHeader";
import { Colors } from "@/constants/Colors";
import { Spacing } from "@/constants/Spacing";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ExploreScreen() {
	return (
		<SafeAreaView style={styles.container}>
			<ScreenHeader
				title="Discover new places"
				subtitle="Coming soon..."
				showBadge={false}
			/>

			<View style={styles.iconContainer}>
				<Ionicons name="compass" size={64} color={Colors.primary} />
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingHorizontal: Spacing.lg,
		backgroundColor: Colors.background,
	},
	iconContainer: {
		alignItems: "center",
		justifyContent: "center",
		flex: 1,
	},
});

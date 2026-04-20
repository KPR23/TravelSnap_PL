import { Colors } from "@/constants/Colors";
import { StyleSheet, Text, View } from "react-native";

export default function ExploreScreen() {
	return (
		<View style={styles.container}>
			<Text>Profile</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.background,
	},
});

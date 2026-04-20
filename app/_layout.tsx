import { Colors } from "@/constants/Colors";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

export default function RootLayout() {
	return (
		<>
			<Stack
				screenOptions={{
					headerShown: false,
					headerStyle: {
						backgroundColor: Colors.background,
					},
					headerTintColor: Colors.primary,
				}}
			>
				<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
				<Stack.Screen name="trip/[id]" options={{ headerShown: true }} />
			</Stack>
			<StatusBar style="light" />
		</>
	);
}

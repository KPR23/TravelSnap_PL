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
				<Stack.Screen
					name="trip/[id]"
					options={{
						headerShown: true,
						animation: "default",
						headerBackButtonDisplayMode: "default",
						headerBackTitle: "Powrót",
					}}
				/>
				<Stack.Screen
					name="add-trip"
					options={{
						headerShown: true,
						title: "Dodaj podróż",
						presentation: "modal",
					}}
				/>
			</Stack>
			<StatusBar style="light" />
		</>
	);
}

import { Colors } from "@/constants/Colors";
import { TripsProvider } from "@/context/TripsContext";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

export default function RootLayout() {
	return (
		<TripsProvider>
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
						// Najbardziej mi sie podoba defaultowa animacja
						animation: "default",
						headerBackButtonDisplayMode: "default",
						headerBackTitle: "Powrót",
					}}
				/>
				<Stack.Screen
					name="add-trip"
					options={{
						headerShown: true,
						headerStyle: {
							backgroundColor: Colors.card,
						},
						headerTintColor: Colors.primary,
						title: "Dodaj podróż",
						presentation: "modal",
					}}
				/>
			</Stack>
			<StatusBar style="light" />
		</TripsProvider>
	);
}

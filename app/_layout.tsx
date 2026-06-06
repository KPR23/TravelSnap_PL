import { Colors } from "@/constants/Colors";
import { TripsProvider } from "@/context/TripsContext";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

export default function RootLayout() {
	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<TripsProvider>
				<Stack
					screenOptions={{
						headerShown: false,
						headerBackButtonMenuEnabled: false,
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
						name="trip/edit/[id]"
						options={{
							headerShown: true,
							title: "Edytuj podróż",
							headerStyle: {
								backgroundColor: Colors.background,
							},
							headerTintColor: Colors.primary,
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
		</GestureHandlerRootView>
	);
}

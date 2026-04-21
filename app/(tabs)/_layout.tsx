import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import "react-native-reanimated";

export default function RootLayout() {
	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarActiveTintColor: Colors.primary,
				tabBarInactiveTintColor: Colors.textSecondary,
				tabBarStyle: { backgroundColor: Colors.background, borderTopWidth: 0 },
				tabBarLabelStyle: { fontSize: 12, fontWeight: "500" },
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Home",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="home" color={color} size={size} />
					),
				}}
			/>
			<Tabs.Screen
				name="explore"
				options={{
					title: "Explore",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="compass" color={color} size={size} />
					),
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: "Profile",
					tabBarIcon: ({ color, size }) => (
						<Ionicons name="person" color={color} size={size} />
					),
				}}
			/>
		</Tabs>
	);
}

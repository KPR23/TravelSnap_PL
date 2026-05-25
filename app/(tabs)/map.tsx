import { ErrorView } from "@/components/ErrorView";
import { Colors } from "@/constants/Colors";
import { useTrips } from "@/context/TripsContext";
import { useLocation } from "@/hooks/useLocation";
import { useMemo } from "react";
import { ActivityIndicator, Button, Linking, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

export default function MapScreen() {
	const { location, error, loading } = useLocation();
	const { trips } = useTrips();

	const tripsWithCoords = useMemo(
		() => trips.filter((t) => t.coordinates),
		[trips],
	);

	return (
		<View style={{ flex: 1 }}>
			{loading ? (
				<ActivityIndicator size="large" color={Colors.primary} />
			) : error ? (
				<View
					style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
				>
					<ErrorView message={error} />
					<Button
						title="Otwórz ustawienia"
						onPress={() => Linking.openSettings()}
					/>
				</View>
			) : (
				<MapView
					style={{ flex: 1 }}
					initialRegion={{
						latitude: location?.coords.latitude ?? 52.2297,
						longitude: location?.coords.longitude ?? 21.0122,
						latitudeDelta: 0.1,
						longitudeDelta: 0.1,
					}}
				>
					{tripsWithCoords.map((trip) => (
						<Marker
							key={trip.id}
							coordinate={trip.coordinates!}
							title={trip.title}
							description={trip.destination}
						/>
					))}
				</MapView>
			)}
		</View>
	);
}

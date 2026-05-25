import { ErrorView } from "@/components/ErrorView";
import { Colors } from "@/constants/Colors";
import { useTrips } from "@/context/TripsContext";
import { useLocation } from "@/hooks/useLocation";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useMemo, useRef } from "react";
import {
	ActivityIndicator,
	Button,
	Linking,
	StyleSheet,
	Text,
	View,
} from "react-native";
import MapView, { Callout, Marker } from "react-native-maps";

export default function MapScreen() {
	const { location, error, loading } = useLocation();
	const { trips } = useTrips();

	const mapRef = useRef<MapView>(null);

	const tripsWithCoords = useMemo(
		() => trips.filter((t) => t.coordinates),
		[trips],
	);

	useEffect(() => {
		const coords = tripsWithCoords.map((t) => t.coordinates!);
		if (coords.length === 0 || !mapRef.current) return;
		if (coords.length === 1) {
			mapRef.current.animateToRegion(
				{
					...coords[0],
					latitudeDelta: 0.05,
					longitudeDelta: 0.05,
				},
				1000,
			);
			return;
		}
		mapRef.current.fitToCoordinates(coords, {
			edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
			animated: true,
		});
	}, [tripsWithCoords]);

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
					ref={mapRef}
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
							tracksViewChanges={false}
						>
							<View style={styles.customMarker}>
								{trip.imageUri ? (
									<Image
										source={{ uri: trip.imageUri }}
										style={styles.markerImage}
										contentFit="cover"
									/>
								) : (
									<View style={styles.markerPlaceholder} />
								)}
							</View>
							<Callout onPress={() => router.push(`/trip/${trip.id}`)}>
								<View style={styles.calloutContainer}>
									{trip.imageUri ? (
										<Image
											source={{ uri: trip.imageUri }}
											style={styles.calloutImage}
											contentFit="cover"
										/>
									) : null}
									<View style={styles.calloutText}>
										<Text style={styles.calloutTitle} numberOfLines={1}>
											{trip.title}
										</Text>
										<Text style={styles.calloutDestination} numberOfLines={1}>
											{trip.destination}
										</Text>
									</View>
								</View>
							</Callout>
						</Marker>
					))}
				</MapView>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	calloutContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		maxWidth: 200,
		padding: 8,
	},
	calloutText: {
		flex: 1,
	},
	calloutTitle: {
		fontSize: 14,
		fontWeight: "bold",
	},
	calloutDestination: {
		fontSize: 12,
		color: Colors.textSecondary,
	},
	calloutImage: {
		width: 60,
		height: 60,
		borderRadius: 8,
	},
	customMarker: {
		width: 40,
		height: 40,
		borderRadius: 20,
		borderWidth: 2,
		borderColor: Colors.accent,
		overflow: "hidden",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Colors.card,
	},
	markerImage: {
		width: 40,
		height: 40,
		borderRadius: 20,
	},
	markerPlaceholder: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: Colors.inputBg,
	},
});

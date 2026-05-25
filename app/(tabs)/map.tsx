import { ErrorView } from "@/components/ErrorView";
import { Colors } from "@/constants/Colors";
import { darkMapStyle } from "@/constants/mapStyle";
import { Spacing } from "@/constants/Spacing";
import { useTrips } from "@/context/TripsContext";
import { useLocation } from "@/hooks/useLocation";
import { Ionicons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
	ActivityIndicator,
	Button,
	Image,
	Linking,
	Platform,
	Pressable,
	StyleSheet,
	Text,
	View,
} from "react-native";
import ClusteredMapView from "react-native-map-clustering";
import MapView, { Callout, Marker } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MapScreen() {
	const { location, error, loading } = useLocation();
	const { trips } = useTrips();
	const insets = useSafeAreaInsets();
	const [isDarkMap, setIsDarkMap] = useState(false);
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
				<View style={styles.mapContainer}>
					<ClusteredMapView
						style={styles.map}
						ref={mapRef}
						clusterColor={Colors.primary}
						clusterTextColor={Colors.background}
						initialRegion={{
							latitude: location?.coords.latitude ?? 52.2297,
							longitude: location?.coords.longitude ?? 21.0122,
							latitudeDelta: 0.1,
							longitudeDelta: 0.1,
						}}
						customMapStyle={isDarkMap ? darkMapStyle : undefined}
						userInterfaceStyle={isDarkMap ? "dark" : "light"}
					>
						{tripsWithCoords.map((trip) => (
							<Marker
								key={trip.id}
								coordinate={trip.coordinates!}
								tracksViewChanges={false}
							>
								<View style={styles.customMarker}>
									{trip.imageUri ? (
										<ExpoImage
											source={{ uri: trip.imageUri }}
											style={styles.markerImage}
											contentFit="cover"
										/>
									) : (
										<View style={styles.markerPlaceholder} />
									)}
								</View>
								<Callout
									tooltip
									onPress={() => router.push(`/trip/${trip.id}`)}
								>
									<View style={styles.calloutContainer}>
										{trip.imageUri ? (
											<Image
												source={{ uri: trip.imageUri }}
												style={styles.calloutImage}
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
					</ClusteredMapView>
					<Pressable
						style={[styles.darkModeToggle, { top: insets.top + Spacing.sm }]}
						onPress={() => setIsDarkMap((prev) => !prev)}
						accessibilityRole="switch"
						accessibilityState={{ checked: isDarkMap }}
						accessibilityLabel={
							isDarkMap ? "Wyłącz ciemny styl mapy" : "Włącz ciemny styl mapy"
						}
					>
						<Ionicons
							name={isDarkMap ? "sunny" : "moon"}
							size={22}
							color={Colors.textPrimary}
						/>
					</Pressable>
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	mapContainer: {
		flex: 1,
	},
	map: {
		flex: 1,
	},
	darkModeToggle: {
		position: "absolute",
		right: Spacing.md,
		width: 44,
		height: 44,
		borderRadius: 22,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Colors.card,
		borderWidth: 1,
		borderColor: Colors.border,
		...Platform.select({
			ios: {
				shadowColor: "#000",
				shadowOffset: { width: 0, height: 2 },
				shadowOpacity: 0.25,
				shadowRadius: 4,
			},
			android: {
				elevation: 4,
			},
		}),
	},
	calloutContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		width: 200,
		padding: 8,
		backgroundColor: "#FFFFFF",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#E0E0E0",
	},
	calloutText: {
		flexShrink: 1,
		flexGrow: 1,
	},
	calloutTitle: {
		fontSize: 14,
		fontWeight: "bold",
		color: "#1A1A1A",
	},
	calloutDestination: {
		fontSize: 12,
		color: "#666666",
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

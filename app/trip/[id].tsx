import { LikeButton } from "@/components/animated/LikeButton";
import { SharedTripImage } from "@/components/animated/SharedTripImage";
import { CountryCard } from "@/components/CountryCard";
import { DestinationPhoto } from "@/components/DestinationPhoto";
import { ErrorView } from "@/components/ErrorView";
import RatingStars from "@/components/RatingStars";
import { Colors } from "@/constants/Colors";
import { Spacing } from "@/constants/Spacing";
import { useTrips } from "@/context/TripsContext";
import { useDeleteTrip } from "@/hooks/useTripMutations";
import { useTripsQuery } from "@/hooks/useTripsQuery";
import { extractCountry } from "@/utils/extractCountry";
import { formatGeocodedAddress } from "@/utils/formatGeocodedAddress";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { Link, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Pressable,
	StyleSheet,
	Text,
	View,
} from "react-native";
import Animated, {
	Extrapolation,
	interpolate,
	useAnimatedRef,
	useAnimatedStyle,
	useScrollViewOffset,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const HEADER_HEIGHT = 280;

export default function TripDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const { data: trips = [] } = useTripsQuery();
	const { toggleFavorite } = useTrips();
	const { mutateAsync: deleteTrip } = useDeleteTrip();
	const router = useRouter();
	const trip = trips.find((t) => t.id === id);
	const isFavorite = !!trip?.isFavorite;
	const parsedRating = trip?.rating ?? 0;
	const [formattedAddress, setFormattedAddress] = useState<string | null>(null);
	const [addressLoading, setAddressLoading] = useState(false);
	const scrollRef = useAnimatedRef<Animated.ScrollView>();
	const scrollY = useScrollViewOffset(scrollRef);

	const headerStyle = useAnimatedStyle(() => {
		const translateY = interpolate(
			scrollY.value,
			[-HEADER_HEIGHT, 0, HEADER_HEIGHT],
			[-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75],
			Extrapolation.CLAMP,
		);
		const scale = interpolate(
			scrollY.value,
			[-HEADER_HEIGHT, 0],
			[2, 1],
			Extrapolation.CLAMP,
		);

		return {
			transform: [{ translateY }, { scale }],
		};
	});

	const galleryCount = trip
		? Array.from(
				new Set([trip.imageUri, ...(trip.galleryUris ?? [])].filter(Boolean)),
			).length
		: 0;

	useEffect(() => {
		if (!trip?.coordinates) {
			setFormattedAddress(null);
			setAddressLoading(false);
			return;
		}

		let cancelled = false;

		const loadAddress = async () => {
			setAddressLoading(true);
			setFormattedAddress(null);

			try {
				const results = await Location.reverseGeocodeAsync(trip.coordinates!);
				if (cancelled) return;

				const address = results[0];
				if (address) {
					const formatted = formatGeocodedAddress(address);
					if (formatted) {
						setFormattedAddress(formatted);
					}
				}
			} catch {
			} finally {
				if (!cancelled) {
					setAddressLoading(false);
				}
			}
		};

		void loadAddress();

		return () => {
			cancelled = true;
		};
	}, [trip?.coordinates, trip?.id]);

	const handleToggleFavorite = async () => {
		await toggleFavorite(id);
	};

	const handleDeleteTrip = async () => {
		Alert.alert("Usuń podróż", "Tej operacji nie można cofnąć. Czy na pewno?", [
			{ text: "Anuluj", style: "cancel" },
			{ text: "Usuń", style: "destructive", onPress: handleDeleteTripConfirm },
		]);
	};

	const handleDeleteTripConfirm = async () => {
		await deleteTrip(id);
		router.back();
	};

	if (!trip) {
		return (
			<SafeAreaView style={styles.container}>
				<ErrorView
					message="Nie znaleziono podróży"
					onRetry={() => router.back()}
					retryLabel="Wróć"
				/>
			</SafeAreaView>
		);
	}

	return (
		<>
			<Stack.Screen
				options={{
					title: trip.title || "Trip Detail",
					headerStyle: { backgroundColor: Colors.background },
					headerTintColor: Colors.primary,
					headerBackVisible: false,
					headerRight: () => (
						<View style={styles.headerActions}>
							<Link
								href={{
									pathname: "/trip/edit/[id]",
									params: {
										id: id as string,
									},
								}}
								asChild
							>
								<Pressable style={styles.headerButton}>
									<Ionicons
										name="create-outline"
										size={24}
										color={Colors.textSecondary}
									/>
								</Pressable>
							</Link>
							<LikeButton
								isLiked={isFavorite}
								onToggle={handleToggleFavorite}
							/>
						</View>
					),
				}}
			/>
			<SafeAreaView
				style={styles.container}
				edges={["left", "right", "bottom"]}
			>
				<Animated.ScrollView
					ref={scrollRef}
					contentContainerStyle={styles.content}
					showsVerticalScrollIndicator={false}
				>
					<View style={styles.header}>
						<Animated.View style={[styles.headerImageWrapper, headerStyle]}>
							{trip.imageUri ? (
								<SharedTripImage
									uri={trip.imageUri}
									sharedTransitionTag={`trip-image-${trip.id}`}
									style={styles.headerImage}
								/>
							) : (
								<DestinationPhoto
									city={trip.destination}
									fallbackUri={trip.imageUri}
								/>
							)}
						</Animated.View>
					</View>
					<View style={styles.topSection}>
						<CountryCard countryName={extractCountry(trip.destination)} />

						<Link
							href={{
								pathname: "/trip/gallery/[id]",
								params: {
									id: id as string,
								},
							}}
							asChild
						>
							<Pressable style={styles.galleryButton}>
								<Ionicons
									name="images-outline"
									size={24}
									color={Colors.primary}
								/>
								<Text style={styles.galleryButtonText}>
									Galeria {galleryCount}
								</Text>
							</Pressable>
						</Link>
						<Text style={styles.title}>{trip.title}</Text>
						<View style={styles.locationBlock}>
							<View style={styles.row}>
								<Ionicons
									name="location-outline"
									size={16}
									color={Colors.textSecondary}
								/>
								<Text style={styles.meta}>{trip.destination}</Text>
							</View>
							{trip.coordinates && addressLoading ? (
								<ActivityIndicator
									size="small"
									color={Colors.primary}
									style={styles.addressSpinner}
								/>
							) : null}
							{formattedAddress ? (
								<Text style={styles.address}>{formattedAddress}</Text>
							) : null}
						</View>
						<View style={styles.row}>
							<Ionicons
								name="calendar-outline"
								size={14}
								color={Colors.textSecondary}
							/>
							<Text style={styles.meta}>{trip.date}</Text>
						</View>
						<RatingStars rating={parsedRating} />
					</View>
					<View style={styles.buttonsContainer}>
						<Pressable
							style={[styles.actionButton, styles.backButton]}
							onPress={() => router.back()}
						>
							<Ionicons
								name="arrow-back-outline"
								size={20}
								color={Colors.background}
							/>
							<Text style={styles.backButtonText}>Powrót do listy</Text>
						</Pressable>
						<Pressable
							style={[styles.actionButton, styles.deleteButton]}
							onPress={handleDeleteTrip}
						>
							<Text style={styles.deleteButtonText}>Usuń podróż</Text>
							<Ionicons
								name="trash-outline"
								size={20}
								color={Colors.background}
							/>
						</Pressable>
					</View>
				</Animated.ScrollView>
			</SafeAreaView>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.background,
		paddingHorizontal: Spacing.lg,
	},
	content: {
		flexGrow: 1,
		paddingBottom: Spacing.xl,
	},
	topSection: {
		flex: 1,
		gap: Spacing.sm,
	},
	header: {
		height: HEADER_HEIGHT,
		overflow: "hidden",
		borderRadius: Spacing.sm,
		marginBottom: Spacing.sm,
	},
	headerImageWrapper: {
		height: HEADER_HEIGHT,
		width: "100%",
	},
	headerImage: {
		width: "100%",
		height: "100%",
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		color: Colors.textPrimary,
	},
	placeholder: {
		width: "100%",
		height: 250,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		gap: Spacing.sm,
		borderRadius: Spacing.sm,
		backgroundColor: Colors.card,
	},
	placeholderText: {
		fontSize: 16,
		color: Colors.placeholder,
	},
	galleryButton: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.xs,
	},
	galleryButtonText: {
		color: Colors.primary,
		fontSize: 16,
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.xs,
	},
	locationBlock: {
		gap: Spacing.xs,
	},
	addressSpinner: {
		marginLeft: 24,
	},
	address: {
		marginLeft: 24,
		fontSize: 13,
		color: Colors.textSecondary,
	},
	meta: {
		fontSize: 14,
		color: Colors.textSecondary,
	},
	actionButton: {
		flex: 1,
		minHeight: 48,
		borderRadius: Spacing.sm,
		paddingHorizontal: Spacing.sm,
		alignItems: "center",
		justifyContent: "center",
		flexDirection: "row",
		gap: Spacing.xs,
	},
	backButton: {
		backgroundColor: Colors.primary,
	},
	backButtonText: {
		color: Colors.background,
		fontSize: 16,
		fontWeight: "600",
	},
	headerActions: {
		flexDirection: "row",
		alignItems: "center",
	},
	headerButton: {
		padding: Spacing.sm,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
	},
	deleteButton: {
		backgroundColor: Colors.accent,
	},
	deleteButtonText: {
		color: Colors.background,
		fontSize: 16,
		fontWeight: "600",
	},
	buttonsContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.sm,
		marginTop: Spacing.lg,
	},
});

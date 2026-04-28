import RatingStars from "@/components/RatingStars";
import { Colors } from "@/constants/Colors";
import { Spacing } from "@/constants/Spacing";
import { useTrips } from "@/context/TripsContext";
import { Ionicons } from "@expo/vector-icons";
import { Link, Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
	Alert,
	Image,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TripDetailScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const { getTripById, toggleFavorite, deleteTrip } = useTrips();
	const router = useRouter();
	const trip = getTripById(id);
	const isFavorite = !!trip?.isFavorite;
	const parsedRating = trip?.rating ?? 0;
	const galleryCount = trip
		? Array.from(
				new Set([trip.imageUri, ...(trip.galleryUris ?? [])].filter(Boolean)),
			).length
		: 0;

	const handleToggleFavorite = async () => {
		await toggleFavorite(id);
	};

	const handleDeleteTrip = async () => {
		Alert.alert("Usuń podróż?", "Tej operacji nie można cofnąć.", [
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
				<View style={styles.placeholder}>
					<Ionicons
						name="alert-circle-outline"
						size={56}
						color={Colors.placeholder}
					/>
					<Text style={styles.placeholderText}>Nie znaleziono podróży</Text>
				</View>
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
						<Pressable
							style={styles.favoriteButton}
							onPress={handleToggleFavorite}
						>
							<Ionicons
								name={isFavorite ? "heart" : "heart-outline"}
								size={24}
								color={isFavorite ? Colors.accent : Colors.textSecondary}
							/>
						</Pressable>
					),
				}}
			/>
			<SafeAreaView
				style={styles.container}
				edges={["left", "right", "bottom"]}
			>
				<ScrollView contentContainerStyle={styles.content}>
					<View style={styles.topSection}>
						{trip.imageUri ? (
							<Image source={{ uri: trip.imageUri }} style={styles.image} />
						) : (
							<View style={styles.placeholder}>
								<Ionicons
									name="image-outline"
									size={64}
									color={Colors.placeholder}
								/>
								<Text style={styles.placeholderText}>Brak zdjęcia</Text>
							</View>
						)}
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
						<View style={styles.row}>
							<Ionicons
								name="location-outline"
								size={16}
								color={Colors.textSecondary}
							/>
							<Text style={styles.meta}>{trip.destination}</Text>
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
				</ScrollView>
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
	title: {
		fontSize: 24,
		fontWeight: "bold",
		color: Colors.textPrimary,
	},
	image: {
		width: "100%",
		height: 250,
		borderRadius: Spacing.sm,
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
	favoriteButton: {
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

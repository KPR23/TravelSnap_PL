import { Colors } from "@/constants/Colors";
import { Spacing } from "@/constants/Spacing";
import { useTrips } from "@/context/TripsContext";
import type { Trip } from "@/types/tripSchema";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import RatingStars from "./RatingStars";

type TripCardProps = {
	trip: Trip;
	onPress: (id: string) => void;
};
export const TripCard = React.memo(function TripCard({
	trip,
	onPress,
}: TripCardProps) {
	const { deleteTrip } = useTrips();
	const handleDeleteTrip = async (id: string) => {
		await deleteTrip(id);
	};

	return (
		<Pressable onPress={() => onPress(trip.id)}>
			<View style={styles.card}>
				{trip.imageUri && (
					<Image
						source={{ uri: trip.imageUri }}
						style={styles.image}
						contentFit="cover"
						cachePolicy="memory-disk"
						transition={200}
					/>
				)}
				{trip.galleryUris && trip.galleryUris.length > 0 && (
					<View style={styles.galleryContainer}>
						<Ionicons
							name="images-outline"
							size={14}
							color={Colors.textPrimary}
						/>
						<Text style={styles.galleryCount}>{trip.galleryUris.length}</Text>
					</View>
				)}
				<Text style={styles.title} numberOfLines={1}>
					{trip.title}
				</Text>
				<Text style={styles.meta} numberOfLines={1}>
					{trip.destination} | {trip.date}
				</Text>
				<RatingStars rating={trip.rating} />
				<Pressable
					onPress={() => handleDeleteTrip(trip.id)}
					style={styles.deleteButton}
				>
					<Text style={styles.deleteButtonText}>Usuń</Text>
				</Pressable>
			</View>
		</Pressable>
	);
});

const styles = StyleSheet.create({
	card: {
		backgroundColor: Colors.card,
		padding: Spacing.lg,
		borderRadius: Spacing.lg,
		marginBottom: Spacing.md,
		shadowColor: "#000",
		shadowOpacity: 0.2,
		shadowRadius: 8,
		elevation: 4,
		overflow: "hidden",
	},
	galleryContainer: {
		position: "absolute",
		top: 24,
		right: 24,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: Spacing.xs,
		marginBottom: Spacing.sm,
		paddingHorizontal: Spacing.sm,
		paddingVertical: Spacing.xs,
		borderRadius: 999,
		backgroundColor: `${Colors.accent}`,
	},
	galleryCount: {
		fontSize: 12,
		color: Colors.textPrimary,
	},
	image: {
		width: "100%",
		height: 180,
		marginBottom: Spacing.sm,
		borderTopLeftRadius: Spacing.sm,
		borderTopRightRadius: Spacing.sm,
	},
	title: {
		fontSize: 18,
		fontWeight: "bold",
		color: Colors.textPrimary,
	},
	meta: {
		fontSize: 13,
		color: Colors.textSecondary,
		marginTop: Spacing.xs,
	},
	deleteButton: {
		alignSelf: "flex-start",
		marginTop: Spacing.md,
		backgroundColor: `${Colors.accent}26`,
		borderRadius: Spacing.md,
		paddingHorizontal: Spacing.sm,
		paddingVertical: Spacing.xs + 2,
	},
	deleteButtonText: {
		color: Colors.accent,
		fontSize: 15,
		fontWeight: "600",
	},
});

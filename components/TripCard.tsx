import {
	Image,
	Pressable,
	type PressableProps,
	StyleSheet,
	Text,
	View,
} from "react-native";

import { Colors } from "@/constants/Colors";
import { Spacing } from "@/constants/Spacing";
import type { Trip } from "@/types/trip";
import { Ionicons } from "@expo/vector-icons";
import RatingStars from "./RatingStars";

type TripCardProps = Trip &
	PressableProps & {
		onDelete: () => void | Promise<void>;
	};

export default function TripCard({
	onDelete,
	title,
	destination,
	date,
	rating,
	imageUri,
	galleryUris,
	...pressableProps
}: TripCardProps) {
	return (
		<Pressable {...pressableProps}>
			<View style={styles.card}>
				{imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
				{galleryUris && galleryUris.length > 0 && (
					<View style={styles.galleryContainer}>
						<Ionicons
							name="images-outline"
							size={14}
							color={Colors.textPrimary}
						/>
						<Text style={styles.galleryCount}>{galleryUris.length}</Text>
					</View>
				)}
				<Text style={styles.title}>{title}</Text>
				<Text style={styles.meta}>
					{destination} | {date}
				</Text>
				<RatingStars rating={rating} />
				<Pressable onPress={onDelete} style={styles.deleteButton}>
					<Text style={styles.deleteButtonText}>Usuń</Text>
				</Pressable>
			</View>
		</Pressable>
	);
}

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

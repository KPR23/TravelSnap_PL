import { UNSPLASH_ACCESS_KEY, UNSPLASH_BASE_URL } from "@/constants/api";
import { Colors } from "@/constants/Colors";
import { Spacing } from "@/constants/Spacing";
import { useFetch } from "@/hooks/useFetch";
import type { UnsplashResponse } from "@/types/unsplash";
import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import {
	ActivityIndicator,
	Image,
	StyleSheet,
	Text,
	View,
} from "react-native";

interface DestinationPhotoProps {
	city: string;
	fallbackUri?: string;
}

export function DestinationPhoto({ city, fallbackUri }: DestinationPhotoProps) {
	const photoUrl = `${UNSPLASH_BASE_URL}/search/photos?query=${encodeURIComponent(
		city,
	)}&per_page=1`;
	const photoRequestInit = useMemo<RequestInit>(
		() => ({
			headers: {
				Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
			},
		}),
		[],
	);
	const { data: photoData, loading: photoLoading } = useFetch<UnsplashResponse>(
		photoUrl,
		photoRequestInit,
	);
	const heroUri = photoData?.results?.[0]?.urls?.regular ?? fallbackUri;
	const photoAuthor = photoData?.results?.[0]?.user?.name;

	return (
		<View>
			<View style={styles.heroContainer}>
				{heroUri ? (
					<Image
						source={{ uri: heroUri }}
						style={styles.image}
						resizeMode="cover"
					/>
				) : (
					<View style={styles.placeholder}>
						<Ionicons name="image-outline" size={64} color={Colors.placeholder} />
						<Text style={styles.placeholderText}>Brak zdjęcia</Text>
					</View>
				)}
				{photoLoading ? (
					<View style={styles.loadingOverlay}>
						<ActivityIndicator color={Colors.primary} />
					</View>
				) : null}
			</View>
			{photoAuthor ? (
				<Text style={styles.photoAttribution}>
					Photo by {photoAuthor} on Unsplash
				</Text>
			) : null}
		</View>
	);
}

export default DestinationPhoto;

const styles = StyleSheet.create({
	heroContainer: {
		position: "relative",
	},
	image: {
		width: "100%",
		height: 250,
		borderRadius: Spacing.sm,
	},
	loadingOverlay: {
		...StyleSheet.absoluteFillObject,
		alignItems: "center",
		justifyContent: "center",
		borderRadius: Spacing.sm,
		backgroundColor: "rgba(15, 26, 46, 0.35)",
	},
	photoAttribution: {
		fontSize: 12,
		color: Colors.textSecondary,
		marginTop: Spacing.xs,
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
});

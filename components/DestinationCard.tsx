import { ErrorView } from "@/components/ErrorView";
import { UNSPLASH_ACCESS_KEY, UNSPLASH_BASE_URL } from "@/constants/api";
import { Colors } from "@/constants/Colors";
import { Spacing } from "@/constants/Spacing";
import { useFetch } from "@/hooks/useFetch";
import type { UnsplashResponse } from "@/types/unsplash";
import { useMemo } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

interface DestinationCardProps {
	city: string;
}

export function DestinationCard({ city }: DestinationCardProps) {
	const url = `${UNSPLASH_BASE_URL}/search/photos?query=${encodeURIComponent(city)}&per_page=1`;
	const requestInit = useMemo<RequestInit>(
		() => ({
			headers: {
				Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
			},
		}),
		[],
	);

	const { data, loading, error, refetch } = useFetch<UnsplashResponse>(
		url,
		requestInit,
	);
	const photoUri = data?.results?.[0]?.urls?.regular;

	if (loading) {
		return <View style={styles.skeleton} />;
	}

	if (error || !photoUri) {
		return (
			<View style={styles.errorContainer}>
				<ErrorView
					message="Nie udało się załadować zdjęcia"
					onRetry={refetch}
				/>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<Image source={{ uri: photoUri }} style={styles.image} resizeMode="cover" />
			<View style={styles.overlay}>
				<Text style={styles.city}>{city}</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		aspectRatio: 16 / 9,
		borderRadius: Spacing.md,
		overflow: "hidden",
		backgroundColor: Colors.card,
	},
	skeleton: {
		width: "100%",
		aspectRatio: 16 / 9,
		borderRadius: Spacing.md,
		backgroundColor: Colors.skeleton,
	},
	errorContainer: {
		aspectRatio: 16 / 9,
		borderRadius: Spacing.md,
		overflow: "hidden",
		backgroundColor: Colors.card,
	},
	image: {
		width: "100%",
		height: "100%",
	},
	overlay: {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 0,
		padding: Spacing.lg,
		backgroundColor: "rgba(0,0,0,0.5)",
	},
	city: {
		color: Colors.textPrimary,
		fontSize: 20,
		fontWeight: "bold",
	},
});

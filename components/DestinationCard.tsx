import { ErrorView } from "@/components/ErrorView";
import { UNSPLASH_ACCESS_KEY, UNSPLASH_BASE_URL } from "@/constants/api";
import { Colors } from "@/constants/Colors";
import { Spacing } from "@/constants/Spacing";
import { useFetch } from "@/hooks/useFetch";
import type { UnsplashResponse } from "@/types/unsplash";
import { Image } from "expo-image";
import { useEffect, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

interface DestinationCardProps {
	city: string;
	// Token rośnie przy globalnym refreshu; zmiana wartości uruchamia refetch tej karty.
	refreshToken?: number;
	// Callback do rodzica: "skończyłem próbę odświeżenia" (sukces lub błąd).
	onRefreshSettled?: () => void;
}

export function DestinationCard({
	city,
	refreshToken = 0,
	onRefreshSettled,
}: DestinationCardProps) {
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

	useEffect(() => {
		// Pierwszy render ma token 0; nie traktujemy go jako "manual refresh".
		if (refreshToken === 0) return;

		let isActive = true;

		const refreshCard = async () => {
			try {
				await refetch();
			} finally {
				// `finally` jest celowe: rodzic musi dostać sygnał zakończenia także przy błędzie,
				// inaczej globalny spinner mógłby wisieć w nieskończoność.
				if (isActive) {
					onRefreshSettled?.();
				}
			}
		};

		void refreshCard();

		return () => {
			// Ochrona przed wywołaniem callbacku po unmount (np. szybkie przejście na inny ekran).
			isActive = false;
		};
	}, [onRefreshSettled, refetch, refreshToken]);

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
			<Image
				source={{ uri: photoUri }}
				style={styles.image}
				contentFit="cover"
				cachePolicy="memory-disk"
				transition={200}
			/>
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

import { ErrorView } from "@/components/ErrorView";
import { Colors } from "@/constants/Colors";
import { Spacing } from "@/constants/Spacing";
import { useUnsplashQuery } from "@/hooks/useUnsplashQuery";
import { Image } from "expo-image";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

interface DestinationCardProps {
	city: string;
	refreshToken?: number;
	onRefreshSettled?: () => void;
}

export function DestinationCard({
	city,
	refreshToken = 0,
	onRefreshSettled,
}: DestinationCardProps) {
	const { data, isLoading, isError, refetch, isFetching } = useUnsplashQuery(
		city,
		1,
	);
	const photoUri = data?.results?.[0]?.urls?.regular;

	useEffect(() => {
		if (refreshToken === 0) return;

		let isActive = true;

		const refreshCard = async () => {
			try {
				await refetch();
			} finally {
				if (isActive) {
					onRefreshSettled?.();
				}
			}
		};

		void refreshCard();

		return () => {
			isActive = false;
		};
	}, [onRefreshSettled, refetch, refreshToken]);

	if (isLoading || (isFetching && refreshToken > 0)) {
		return <View style={styles.skeleton} />;
	}

	if (isError || !photoUri) {
		return (
			<View style={styles.errorContainer}>
				<ErrorView
					message="Nie udało się załadować zdjęcia"
					onRetry={() => void refetch()}
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

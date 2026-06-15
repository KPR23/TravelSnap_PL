import { CountryCard } from "@/components/CountryCard";
import { ErrorView } from "@/components/ErrorView";
import ScreenHeader from "@/components/ScreenHeader";
import { SkeletonCard } from "@/components/SkeletonCard";
import { Colors } from "@/constants/Colors";
import { Spacing } from "@/constants/Spacing";
import { useCountriesQuery } from "@/hooks/useCountriesQuery";
import { useUnsplashInfiniteQuery } from "@/hooks/useUnsplashInfiniteQuery";
import { POPULAR } from "@/lib/destinations";
import type { UnsplashPhoto } from "@/types/unsplash";
import { Image } from "expo-image";
import { useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	Pressable,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ExploreScreen() {
	const [searchTerm, setSearchTerm] = useState(POPULAR[0]);
	const {
		data: countries,
		isLoading: countriesLoading,
		isError: countriesError,
		refetch: refetchCountries,
	} = useCountriesQuery();
	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading: photosLoading,
		isError: photosError,
		refetch: refetchPhotos,
	} = useUnsplashInfiniteQuery(searchTerm);

	const photos = data?.pages.flatMap((page) => page.results) ?? [];

	if (countriesLoading || photosLoading) {
		return (
			<SafeAreaView style={styles.container}>
				<SkeletonCard />
			</SafeAreaView>
		);
	}

	if (countriesError) {
		return (
			<SafeAreaView style={styles.container}>
				<ErrorView
					message="Nie udało się załadować listy krajów"
					onRetry={() => void refetchCountries()}
				/>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.headerContainer}>
				<ScreenHeader
					title="Discover new places"
					subtitle="Popular destinations from Unsplash"
					showBadge={false}
				/>
			</View>

			<View style={styles.chips}>
				{POPULAR.map((city) => (
					<Pressable
						key={city}
						style={[styles.chip, searchTerm === city && styles.chipActive]}
						onPress={() => setSearchTerm(city)}
					>
						<Text
							style={[
								styles.chipText,
								searchTerm === city && styles.chipTextActive,
							]}
						>
							{city}
						</Text>
					</Pressable>
				))}
			</View>

			{photosError ? (
				<ErrorView
					message="Nie udało się załadować zdjęć"
					onRetry={() => void refetchPhotos()}
				/>
			) : (
				<FlatList
					data={photos}
					keyExtractor={(item: UnsplashPhoto) => item.id}
					numColumns={2}
					columnWrapperStyle={styles.column}
					contentContainerStyle={styles.listContent}
					onEndReached={() => hasNextPage && fetchNextPage()}
					onEndReachedThreshold={0.5}
					ListHeaderComponent={
						countries?.[0] ? (
							<CountryCard countryName={countries[0].name.common} />
						) : null
					}
					ListFooterComponent={
						isFetchingNextPage ? (
							<ActivityIndicator color={Colors.primary} />
						) : null
					}
					renderItem={({ item }) => (
						<View style={styles.gridItem}>
							<Image
								source={{ uri: item.urls.regular }}
								style={styles.photo}
								contentFit="cover"
								cachePolicy="memory-disk"
								transition={200}
							/>
							<Text style={styles.photoAuthor}>Photo by {item.user.name}</Text>
						</View>
					)}
					showsVerticalScrollIndicator={false}
				/>
			)}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.background,
	},
	headerContainer: {
		paddingHorizontal: Spacing.lg,
	},
	chips: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: Spacing.sm,
		paddingHorizontal: Spacing.lg,
		paddingBottom: Spacing.md,
	},
	chip: {
		paddingHorizontal: Spacing.md,
		paddingVertical: Spacing.xs,
		borderRadius: Spacing.lg,
		backgroundColor: Colors.card,
	},
	chipActive: {
		backgroundColor: Colors.primary,
	},
	chipText: {
		color: Colors.textSecondary,
		fontSize: 13,
		fontWeight: "600",
	},
	chipTextActive: {
		color: Colors.background,
	},
	listContent: {
		padding: Spacing.lg,
		gap: Spacing.lg,
	},
	column: {
		gap: Spacing.lg,
		marginBottom: Spacing.lg,
	},
	gridItem: {
		flex: 1,
		gap: Spacing.xs,
	},
	photo: {
		width: "100%",
		aspectRatio: 1,
		borderRadius: Spacing.md,
		backgroundColor: Colors.card,
	},
	photoAuthor: {
		fontSize: 11,
		color: Colors.textSecondary,
	},
});

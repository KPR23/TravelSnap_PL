import { DestinationCard } from "@/components/DestinationCard";
import ScreenHeader from "@/components/ScreenHeader";
import { SkeletonCard } from "@/components/SkeletonCard";
import { Colors } from "@/constants/Colors";
import { Spacing } from "@/constants/Spacing";
import { POPULAR } from "@/lib/destinations";
import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const SKELETON_DELAY_MS = 2000;

export default function ExploreScreen() {
	const [refreshToken, setRefreshToken] = useState(0);

	const [isInitialLoading, setIsInitialLoading] = useState(true);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [pendingCards, setPendingCards] = useState(0);
	const refreshResolverRef = useRef<(() => void) | null>(null);

	useEffect(() => {
		const timer = setTimeout(() => setIsInitialLoading(false), SKELETON_DELAY_MS);
		return () => clearTimeout(timer);
	}, []);

	useEffect(() => {
		if (isRefreshing && pendingCards === 0 && refreshResolverRef.current) {
			refreshResolverRef.current();
			refreshResolverRef.current = null;
		}
	}, [isRefreshing, pendingCards]);

	const handleCardRefreshSettled = useCallback(() => {
		setPendingCards((prev) => Math.max(prev - 1, 0));
	}, []);

	const refetchAll = async () => {
		if (isRefreshing) return;

		setIsRefreshing(true);
		const startedAt = Date.now();

		try {
			setPendingCards(POPULAR.length);
			setRefreshToken((prev) => prev + 1);
			await new Promise<void>((resolve) => {
				refreshResolverRef.current = resolve;
			});

			const remaining = SKELETON_DELAY_MS - (Date.now() - startedAt);
			if (remaining > 0) {
				await new Promise((resolve) => setTimeout(resolve, remaining));
			}
		} catch (error) {
			console.error("Nie udało się odświeżyć kart kierunków", error);
		} finally {
			setIsRefreshing(false);
			setPendingCards(0);
			refreshResolverRef.current = null;
		}
	};

	const showSkeleton = isInitialLoading || isRefreshing;

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.headerContainer}>
				<ScreenHeader
					title="Discover new places"
					subtitle="Popular destinations from Unsplash"
					showBadge={false}
				/>
			</View>

			{showSkeleton ? (
				<View style={styles.skeletonContainer}>
					{Array.from({ length: 10 }).map((_, index) => (
						<SkeletonCard key={index} />
					))}
				</View>
			) : (
				<Animated.FlatList
					data={POPULAR}
					keyExtractor={(city) => city}
					numColumns={2}
					columnWrapperStyle={styles.column}
					refreshing={isRefreshing}
					onRefresh={refetchAll}
					renderItem={({ item, index }) => {
						const column = index % 2;

						return (
							<Animated.View
								entering={FadeInDown.delay(index * 100 + column * 50).springify()}
								style={styles.gridItem}
							>
								<DestinationCard
									city={item}
									refreshToken={refreshToken}
									onRefreshSettled={handleCardRefreshSettled}
								/>
							</Animated.View>
						);
					}}
					contentContainerStyle={styles.listContent}
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
	listContent: {
		padding: Spacing.lg,
	},
	column: {
		gap: Spacing.lg,
		marginBottom: Spacing.lg,
	},
	gridItem: {
		flex: 1,
	},
	skeletonContainer: {
		padding: Spacing.lg,
		gap: Spacing.lg,
	},
});

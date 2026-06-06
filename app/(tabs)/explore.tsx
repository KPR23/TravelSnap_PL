import { DestinationCard } from "@/components/DestinationCard";
import ScreenHeader from "@/components/ScreenHeader";
import { SkeletonCard } from "@/components/SkeletonCard";
import { Colors } from "@/constants/Colors";
import { Spacing } from "@/constants/Spacing";
import { POPULAR } from "@/lib/destinations";
import { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
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
				<FlatList
					data={POPULAR}
					keyExtractor={(city) => city}
					refreshing={isRefreshing}
					onRefresh={refetchAll}
					renderItem={({ item }) => (
						<DestinationCard
							city={item}
							refreshToken={refreshToken}
							onRefreshSettled={handleCardRefreshSettled}
						/>
					)}
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
		gap: Spacing.lg,
	},
	skeletonContainer: {
		padding: Spacing.lg,
		gap: Spacing.lg,
	},
});

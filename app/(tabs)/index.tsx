import { AnimatedTripCard } from "@/components/animated/AnimatedTripCard";
import { FAB } from "@/components/FAB";
import ScreenHeader from "@/components/ScreenHeader";
import { SkeletonCard } from "@/components/SkeletonCard";
import TripStats from "@/components/TripStats";
import { Colors } from "@/constants/Colors";
import { Spacing } from "@/constants/Spacing";
import { useDeleteTrip } from "@/hooks/useTripMutations";
import { useTripsQuery } from "@/hooks/useTripsQuery";
import { getTripStats } from "@/utils/tripStats";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Platform, StyleSheet } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const PAGE_SIZE = 20;

export default function HomeScreen() {
	const { data: trips = [], isLoading } = useTripsQuery();
	const { mutateAsync: deleteTrip } = useDeleteTrip();
	const sortedTrips = useMemo(
		() => [...trips].sort((a, b) => b.rating - a.rating),
		[trips],
	);
	const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [fabResetKey, setFabResetKey] = useState(0);

	useFocusEffect(
		useCallback(() => {
			setFabResetKey((key) => key + 1);
		}, []),
	);

	const visibleTrips = useMemo(
		() => sortedTrips.slice(0, visibleCount),
		[sortedTrips, visibleCount],
	);

	const { tripCount, averageRating, uniqueDestinations } = getTripStats(trips);

	useEffect(() => {
		setVisibleCount(PAGE_SIZE);
	}, [sortedTrips]);

	const loadMore = () => {
		if (isLoadingMore || visibleCount >= sortedTrips.length) return;

		setIsLoadingMore(true);
		setTimeout(() => {
			setVisibleCount((count) =>
				Math.min(count + PAGE_SIZE, sortedTrips.length),
			);
			setIsLoadingMore(false);
		}, 500);
	};

	const handleTripPress = useCallback(
		(id: string) => {
			router.push(`/trip/${id}`);
		},
		[router],
	);

	const handleDeleteTrip = useCallback(
		(id: string) => {
			void deleteTrip(id);
		},
		[deleteTrip],
	);

	if (isLoading) {
		return (
			<SafeAreaView style={styles.container}>
				<SkeletonCard />
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			<ScreenHeader
				tripCount={tripCount}
				title="TravelSnap"
				subtitle="Twój dziennik podróży"
				showBadge={true}
			/>
			<TripStats
				tripCount={tripCount}
				averageRating={averageRating}
				uniqueDestinations={uniqueDestinations}
			/>
			<Animated.FlatList
				data={visibleTrips}
				keyExtractor={(item) => item.id}
				initialNumToRender={10}
				maxToRenderPerBatch={8}
				windowSize={5}
				removeClippedSubviews={Platform.OS === "android"}
				onEndReached={loadMore}
				onEndReachedThreshold={0.5}
				itemLayoutAnimation={LinearTransition.springify()}
				ListFooterComponent={
					isLoadingMore ? <ActivityIndicator color={Colors.primary} /> : null
				}
				renderItem={({ item, index }) => (
					<AnimatedTripCard
						trip={item}
						index={index}
						onPress={handleTripPress}
						onDelete={handleDeleteTrip}
					/>
				)}
			/>
			<FAB
				resetKey={fabResetKey}
				onPress={() => router.push("/add-trip")}
			/>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.background,
		paddingHorizontal: Spacing.lg,
	},
	fab: {
		position: "absolute",
		right: Spacing.lg,
		bottom: Spacing.xl,
		width: 56,
		height: 56,
		borderRadius: 28,
		backgroundColor: Colors.primary,
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#000",
		shadowOpacity: 0.3,
		shadowRadius: 6,
		elevation: 6,
	},
});

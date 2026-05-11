import { DestinationCard } from "@/components/DestinationCard";
import ScreenHeader from "@/components/ScreenHeader";
import { Colors } from "@/constants/Colors";
import { Spacing } from "@/constants/Spacing";
import { POPULAR } from "@/lib/destinations";
import { useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ExploreScreen() {
	const [refreshKey, setRefreshKey] = useState(0);
	const [isRefreshing, setIsRefreshing] = useState(false);

	const refetchAll = () => {
		setIsRefreshing(true);
		setRefreshKey((key) => key + 1);
		setIsRefreshing(false);
	};

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.headerContainer}>
				<ScreenHeader
					title="Discover new places"
					subtitle="Popular destinations from Unsplash"
					showBadge={false}
				/>
			</View>

			<FlatList
				key={refreshKey}
				data={POPULAR}
				keyExtractor={(city) => city}
				refreshing={isRefreshing}
				onRefresh={refetchAll}
				renderItem={({ item }) => <DestinationCard city={item} />}
				contentContainerStyle={styles.listContent}
				showsVerticalScrollIndicator={false}
			/>
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
});

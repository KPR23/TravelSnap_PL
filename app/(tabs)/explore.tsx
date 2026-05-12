import { DestinationCard } from "@/components/DestinationCard";
import ScreenHeader from "@/components/ScreenHeader";
import { Colors } from "@/constants/Colors";
import { Spacing } from "@/constants/Spacing";
import { POPULAR } from "@/lib/destinations";
import { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ExploreScreen() {
	// Każda zmiana tokenu jest sygnałem "zrób refetch" dla każdej karty.
	// Dzięki temu unikamy remountowania całej listy przez `key`.
	const [refreshToken, setRefreshToken] = useState(0);
	// `refreshing` steruje spinnerem w FlatList.
	// Ten stan ma odpowiadać faktycznemu trwaniu odświeżania, a nie tylko kliknięciu/pull gesture.
	const [isRefreshing, setIsRefreshing] = useState(false);
	// Licznik kart, które jeszcze nie zakończyły swojej próby refetchu.
	const [pendingCards, setPendingCards] = useState(0);
	// Resolver Promise używany do "czekania" w refetchAll, aż wszystkie karty się rozliczą.
	const refreshResolverRef = useRef<(() => void) | null>(null);

	useEffect(() => {
		// Gdy ostatnia karta zgłosi zakończenie, zwalniamy await w refetchAll.
		if (isRefreshing && pendingCards === 0 && refreshResolverRef.current) {
			refreshResolverRef.current();
			refreshResolverRef.current = null;
		}
	}, [isRefreshing, pendingCards]);

	const handleCardRefreshSettled = useCallback(() => {
		// Zabezpieczenie przed zejściem poniżej 0 (np. przy nietypowej kolejności callbacków).
		setPendingCards((prev) => Math.max(prev - 1, 0));
	}, []);

	// Trzymamy `refreshing=true` aż wszystkie karty zakończą własny refetch.
	// Dzięki temu spinner znika dopiero po rzeczywistym odświeżeniu danych, a nie po samym triggerze.
	const refetchAll = async () => {
		// FlatList potrafi wywołać onRefresh ponownie zanim poprzedni cykl się skończy;
		// guard zapobiega nakładaniu kilku refreshy naraz.
		if (isRefreshing) return;

		setIsRefreshing(true);
		try {
			// Startujemy nową rundę i oczekujemy tylu sygnałów, ile renderujemy kart.
			setPendingCards(POPULAR.length);
			setRefreshToken((prev) => prev + 1);
			await new Promise<void>((resolve) => {
				refreshResolverRef.current = resolve;
			});
		} catch (error) {
			console.error("Nie udało się odświeżyć kart kierunków", error);
		} finally {
			setIsRefreshing(false);
			setPendingCards(0);
			refreshResolverRef.current = null;
		}
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

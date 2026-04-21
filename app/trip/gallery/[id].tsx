import { Colors } from "@/constants/Colors";
import { useTrips } from "@/context/TripsContext";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import {
	Dimensions,
	FlatList,
	Image,
	Pressable,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ITEM_SIZE = (Dimensions.get("window").width - 16) / 3;

export default function GalleryScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const { getTripById } = useTrips();
	const trip = getTripById(id);
	const images = trip?.galleryUris ?? [];

	return (
		<SafeAreaView style={styles.container}>
			<FlatList
				data={images}
				keyExtractor={(item, index) => `${item}-${index}`}
				numColumns={3}
				columnWrapperStyle={styles.row}
				contentContainerStyle={styles.content}
				ListEmptyComponent={
					<View style={styles.emptyState}>
						<Ionicons
							name="images-outline"
							size={48}
							color={Colors.placeholder}
						/>
						<Text style={styles.emptyText}>Brak zdjęć w galerii</Text>
					</View>
				}
				renderItem={({ item }) => (
					<Pressable style={styles.item}>
						<Image source={{ uri: item }} style={styles.image} />
					</Pressable>
				)}
			/>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.background,
	},
	content: {
		padding: 4,
		gap: 4,
		flexGrow: 1,
		backgroundColor: Colors.background,
	},
	row: {
		gap: 4,
	},
	item: {
		width: ITEM_SIZE,
		height: ITEM_SIZE,
		borderRadius: 8,
		overflow: "hidden",
		backgroundColor: Colors.card,
	},
	image: {
		width: "100%",
		height: "100%",
	},
	emptyState: {
		flex: 1,
		minHeight: 320,
		alignItems: "center",
		justifyContent: "center",
		gap: 10,
	},
	emptyText: {
		color: Colors.textSecondary,
		fontSize: 16,
	},
});

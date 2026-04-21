import { Colors } from "@/constants/Colors";
import { useTrips } from "@/context/TripsContext";
import { handleAddPhoto } from "@/lib/pickImage";
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
	const { getTripById, addGalleryImage } = useTrips();
	const trip = getTripById(id);
	const images = trip?.galleryUris ?? [];

	const handleAddImage = () => {
		handleAddPhoto(id, (uri) => addGalleryImage(id, uri));
	};

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
			<Pressable style={styles.fab} onPress={handleAddImage}>
				<Ionicons name="add" size={28} color={Colors.background} />
			</Pressable>
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
	fab: {
		position: "absolute",
		bottom: 20,
		right: 20,
		width: 56,
		height: 56,
		borderRadius: 28,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Colors.primary,
		shadowColor: "#000",
		shadowOpacity: 0.3,
		shadowRadius: 6,
		elevation: 6,
	},
});

import { Colors } from "@/constants/Colors";
import { useTrips } from "@/context/TripsContext";
import { deleteImage } from "@/ utils/imageStorage";
import { handleAddPhoto } from "@/lib/pickImage";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import {
	Alert,
	Dimensions,
	FlatList,
	Image,
	Modal,
	Pressable,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

const ITEM_SIZE = (Dimensions.get("window").width - 16) / 3;

export default function GalleryScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const { getTripById, addGalleryImage, removeGalleryImage } = useTrips();
	const [selectedUri, setSelectedUri] = useState<string | null>(null);
	const trip = getTripById(id);
	const images = trip?.galleryUris ?? [];

	const handleAddImage = () => {
		handleAddPhoto(id, (uri) => addGalleryImage(id, uri));
	};

	const handleDeleteImage = () => {
		if (!selectedUri) {
			return;
		}

		Alert.alert("Usuń zdjęcie?", "Ta operacja jest nieodwracalna.", [
			{ text: "Anuluj", style: "cancel" },
			{
				text: "Usuń",
				style: "destructive",
				onPress: async () => {
					try {
						if (selectedUri.startsWith("file://")) {
							await deleteImage(selectedUri);
						}
						removeGalleryImage(id, selectedUri);
						setSelectedUri(null);
					} catch {
						Alert.alert("Nie udało się usunąć zdjęcia");
					}
				},
			},
		]);
	};

	return (
		<>
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
						<Pressable style={styles.item} onPress={() => setSelectedUri(item)}>
							<Image source={{ uri: item }} style={styles.image} />
						</Pressable>
					)}
				/>
				<Pressable style={styles.fab} onPress={handleAddImage}>
					<Ionicons name="add" size={28} color={Colors.background} />
				</Pressable>
			</SafeAreaView>
			<Modal visible={!!selectedUri} animationType="fade" transparent>
				<View style={styles.modalContainer}>
					{selectedUri ? (
						<Image
							source={{ uri: selectedUri }}
							style={styles.modalImage}
							resizeMode="contain"
						/>
					) : null}
					<Pressable style={styles.closeButton} onPress={() => setSelectedUri(null)}>
						<Ionicons name="close" size={28} color={Colors.textPrimary} />
					</Pressable>
					<Pressable style={styles.deleteButton} onPress={handleDeleteImage}>
						<Ionicons name="trash-outline" size={28} color={Colors.accent} />
					</Pressable>
				</View>
			</Modal>
		</>
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
	modalContainer: {
		flex: 1,
		backgroundColor: "#000",
		alignItems: "center",
		justifyContent: "center",
	},
	modalImage: {
		width: "100%",
		height: "100%",
	},
	closeButton: {
		position: "absolute",
		top: 48,
		right: 16,
		padding: 8,
	},
	deleteButton: {
		position: "absolute",
		left: 16,
		bottom: 32,
		padding: 8,
	},
});

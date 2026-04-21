import { saveImageToTrip } from "@/utils/imageStorage";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import {
	requestCameraPermissions,
	requestMediaLibraryPermissions,
} from "./permissions";

export const pickImage = async (
	tripId: string,
	setImageUri: (uri: string) => void,
) => {
	try {
		const status = await requestMediaLibraryPermissions();
		if (status !== "granted") {
			Alert.alert("Nie masz uprawnień do galerii");
			return;
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ["images"],
			allowsEditing: true,
			aspect: [16, 9],
			quality: 0.8,
		});

		if (!result.canceled) {
			const pickedUri = result.assets[0].uri;
			const uri = await saveImageToTrip(pickedUri, tripId);
			setImageUri(uri);
		}
	} catch {
		Alert.alert("Nie udało się dodać zdjęcia");
	}
};

export const takePhoto = async (
	tripId: string,
	setImageUri: (uri: string) => void,
) => {
	const status = await requestCameraPermissions();

	if (status !== "granted") {
		Alert.alert("Nie masz uprawnień do użycia kamery");
		return;
	}

	try {
		const result = await ImagePicker.launchCameraAsync({
			mediaTypes: ["images"],
			allowsEditing: true,
			aspect: [16, 9],
			quality: 0.8,
		});

		if (!result.canceled) {
			const pickedUri = result.assets[0].uri;
			const uri = await saveImageToTrip(pickedUri, tripId);
			setImageUri(uri);
		}
	} catch {
		Alert.alert("Nie udało się zrobić zdjęcia");
	}
};

export const handleAddPhoto = async (
	tripId: string,
	setImageUri: (uri: string) => void,
) => {
	Alert.alert("Dodaj zdjęcie", "Wybierz źródło", [
		{ text: "Galeria", onPress: () => pickImage(tripId, setImageUri) },
		{ text: "Kamera", onPress: () => takePhoto(tripId, setImageUri) },
		{ text: "Anuluj", style: "cancel" },
	]);
};

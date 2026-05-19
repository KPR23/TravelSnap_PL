import { saveImageToTrip } from "@/utils/imageStorage";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import {
	requestCameraPermissions,
	requestMediaLibraryPermissions,
} from "./permissions";

type SetImageUri = (uri: string) => void | Promise<void>;

const pickImageFromLibrary = async (): Promise<string | undefined> => {
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
			return result.assets[0].uri;
		}
	} catch {
		Alert.alert("Nie udało się dodać zdjęcia");
	}
};

const takePhotoWithCamera = async (): Promise<string | undefined> => {
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
			return result.assets[0].uri;
		}
	} catch {
		Alert.alert("Nie udało się zrobić zdjęcia");
	}
};

const setSavedTripImage = async (
	tripId: string,
	pickUri: () => Promise<string | undefined>,
	setImageUri: SetImageUri,
): Promise<void> => {
	const pickedUri = await pickUri();
	if (pickedUri) {
		const savedUri = await saveImageToTrip(pickedUri, tripId);
		await setImageUri(savedUri);
	}
};

const setPickedImage = async (
	pickUri: () => Promise<string | undefined>,
	setImageUri: SetImageUri,
): Promise<void> => {
	const pickedUri = await pickUri();
	if (pickedUri) {
		await setImageUri(pickedUri);
	}
};

export const handleAddPhoto = (tripId: string, setImageUri: SetImageUri) => {
	Alert.alert("Dodaj zdjęcie", "Wybierz źródło", [
		{
			text: "Galeria",
			onPress: () =>
				setSavedTripImage(tripId, pickImageFromLibrary, setImageUri),
		},
		{
			text: "Kamera",
			onPress: () => setSavedTripImage(tripId, takePhotoWithCamera, setImageUri),
		},
		{ text: "Anuluj", style: "cancel" },
	]);
};

export const handlePickPhoto = (setImageUri: SetImageUri) => {
	Alert.alert("Dodaj zdjęcie", "Wybierz źródło", [
		{
			text: "Galeria",
			onPress: () => setPickedImage(pickImageFromLibrary, setImageUri),
		},
		{
			text: "Kamera",
			onPress: () => setPickedImage(takePhotoWithCamera, setImageUri),
		},
		{ text: "Anuluj", style: "cancel" },
	]);
};

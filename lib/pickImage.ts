import * as ImagePicker from "expo-image-picker";

export const pickImage = async (setImageUri: (uri: string) => void) => {
	const result = await ImagePicker.launchImageLibraryAsync({
		mediaTypes: ["images"],
		allowsEditing: true,
		aspect: [16, 9],
		quality: 0.8,
	});

	if (!result.canceled) {
		setImageUri(result.assets[0].uri);
	}
};

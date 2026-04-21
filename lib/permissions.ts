import * as ImagePicker from "expo-image-picker";

export const requestMediaLibraryPermissions = async () => {
	const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
	return status;
};

export const requestCameraPermissions = async () => {
	const { status } = await ImagePicker.requestCameraPermissionsAsync();
	return status;
};

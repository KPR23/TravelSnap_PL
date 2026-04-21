import * as FileSystem from "expo-file-system/legacy";

export async function ensureTripFolder(tripId: string): Promise<string> {
	const tripFolder = FileSystem.documentDirectory + "trips/" + tripId + "/";
	const info = await FileSystem.getInfoAsync(tripFolder);

	if (!info.exists) {
		await FileSystem.makeDirectoryAsync(tripFolder, { intermediates: true });
	}

	return tripFolder;
}

export async function saveImageToTrip(
	uri: string,
	tripId: string,
): Promise<string> {
	try {
		if (!uri.startsWith("file://")) {
			return uri;
		}

		const sourceInfo = await FileSystem.getInfoAsync(uri);
		if (!sourceInfo.exists) {
			throw new Error(`Image source file does not exist: ${uri}`);
		}

		const tripFolder = await ensureTripFolder(tripId);
		const fileName = uri.split("/").pop();
		const newUri = tripFolder + fileName;
		await FileSystem.copyAsync({ from: uri, to: newUri });
		return newUri;
	} catch {
		return uri;
	}
}

export async function deleteImage(uri: string): Promise<void> {
	try {
		await FileSystem.deleteAsync(uri, { idempotent: true });
	} catch {
		throw new Error(`Failed to delete image: ${uri}`);
	}
}

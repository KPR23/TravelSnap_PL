import * as FileSystem from "expo-file-system/legacy";

export async function ensureTripFolder(tripId: string): Promise<string> {
	try {
		const tripFolder = FileSystem.documentDirectory + "trips/" + tripId + "/";
		const info = await FileSystem.getInfoAsync(tripFolder);

		if (!info.exists) {
			await FileSystem.makeDirectoryAsync(tripFolder);
		}

		return tripFolder;
	} catch (error) {
		console.error(error);
		throw error;
	}
}

export async function saveImageToTrip(
	uri: string,
	tripId: string,
): Promise<string> {
	try {
		const tripFolder = await ensureTripFolder(tripId);
		const newUri = tripFolder + uri.split("/").pop();
		await FileSystem.copyAsync({ from: uri, to: newUri });
		return newUri;
	} catch (error) {
		console.error(error);
		throw error;
	}
}

export async function deleteImage(uri: string): Promise<void> {
	try {
		await FileSystem.deleteAsync(uri, { idempotent: true });
	} catch (error) {
		console.error(error);
	}
}

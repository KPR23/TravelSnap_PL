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
		const isRemoteUri = /^https?:\/\//i.test(uri);
		if (isRemoteUri) {
			return uri;
		}

		const sourceInfo = await FileSystem.getInfoAsync(uri);
		if (!sourceInfo.exists) {
			throw new Error(`Image source file does not exist: ${uri}`);
		}

		const tripFolder = await ensureTripFolder(tripId);
		const originalFileName = uri.split("/").pop();
		if (!originalFileName) {
			throw new Error(`Could not extract file name from uri: ${uri}`);
		}

		const safeFileName = originalFileName.split("?")[0];
		const extension = safeFileName.includes(".")
			? safeFileName.split(".").pop()
			: undefined;
		const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
		const fileName = extension ? `${uniqueId}.${extension}` : `${uniqueId}.jpg`;

		const newUri = tripFolder + fileName;
		await FileSystem.copyAsync({ from: uri, to: newUri });
		return newUri;
	} catch (error) {
		const details = error instanceof Error ? error.message : String(error);
		throw new Error(
			`Failed to copy image to trip folder (tripId: ${tripId}, uri: ${uri}): ${details}`,
		);
	}
}

export async function deleteImage(uri: string): Promise<void> {
	try {
		await FileSystem.deleteAsync(uri, { idempotent: true });
	} catch (error) {
		throw new Error(`Failed to delete image: ${uri}`, { cause: error });
	}
}

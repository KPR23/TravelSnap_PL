import type { Trip, TripFormData } from "@/types/tripSchema";
import { saveImageToTrip } from "@/utils/imageStorage";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "travelsnap_trips";

export async function saveTrips(trips: Trip[]): Promise<void> {
	try {
		const json = JSON.stringify(trips);
		await AsyncStorage.setItem(STORAGE_KEY, json);
	} catch (error) {
		console.error("Error saving trips:", error);
	}
}

export async function loadTrips(): Promise<Trip[]> {
	try {
		const json = await AsyncStorage.getItem(STORAGE_KEY);
		return json ? (JSON.parse(json) as Trip[]) : [];
	} catch (error) {
		console.error("Error loading trips:", error);
		return [];
	}
}

export async function saveTrip(data: TripFormData): Promise<Trip> {
	const trips = await loadTrips();
	const id = Date.now().toString();

	let imageUri = data.imageUri;
	if (imageUri) {
		imageUri = await saveImageToTrip(imageUri, id);
	}

	const mergedGalleryUris = Array.from(
		new Set([imageUri, ...(data.galleryUris ?? [])].filter(Boolean)),
	) as string[];

	const newTrip: Trip = { id, ...data, imageUri, galleryUris: mergedGalleryUris };
	await saveTrips([...trips, newTrip]);
	return newTrip;
}

export async function deleteTrip(id: string): Promise<void> {
	const trips = await loadTrips();
	await saveTrips(trips.filter((t) => t.id !== id));
}

export async function updateTrip(
	id: string,
	data: Partial<TripFormData>,
): Promise<Trip> {
	const trips = await loadTrips();
	const updated = trips.map((t) => (t.id === id ? { ...t, ...data } : t));
	await saveTrips(updated);
	return updated.find((t) => t.id === id)!;
}

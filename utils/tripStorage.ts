import { Trip } from "@/types/trip";
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

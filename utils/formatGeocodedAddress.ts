import type { LocationGeocodedAddress } from "expo-location";

export function formatGeocodedAddress(address: LocationGeocodedAddress): string {
	return [
		address.street,
		address.city,
		address.region,
		address.country,
		address.postalCode,
	]
		.filter(Boolean)
		.join(", ");
}

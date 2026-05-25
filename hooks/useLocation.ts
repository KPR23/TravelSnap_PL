import * as Location from "expo-location";
import { useEffect, useState } from "react";

interface UseLocationResult {
	location: Location.LocationObject | null;
	error: string | null;
	loading: boolean;
}

export function useLocation(): UseLocationResult {
	const [location, setLocation] = useState<Location.LocationObject | null>(
		null,
	);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const requestForegroundPermissionsAsync = async () => {
			try {
				const { status } = await Location.requestForegroundPermissionsAsync();

				if (status !== "granted") {
					setError("Brak uprawnień do lokalizacji");
					return;
				}

				const location = await Location.getCurrentPositionAsync({
					accuracy: Location.Accuracy.Balanced,
				});
				setLocation(location);
				setLoading(false);
			} catch (error) {
				setError(String(error));
				setLoading(false);
			} finally {
				setLoading(false);
			}
		};

		requestForegroundPermissionsAsync();
	}, []);

	return { location, error, loading };
}

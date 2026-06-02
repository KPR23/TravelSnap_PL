import { TripFormData } from "@/types/tripSchema";
import * as Location from "expo-location";
import TripForm from "./TripForm";

interface AddTripFormProps {
	onAddTrip: (data: TripFormData) => Promise<void>;
}

export default function AddTripForm({ onAddTrip }: AddTripFormProps) {
	const onSubmit = async (data: TripFormData): Promise<void> => {
		let coordinates: { latitude: number; longitude: number } | undefined =
			data.coordinates;

		try {
			const results = await Location.geocodeAsync(data.destination);
			if (results[0]) {
				coordinates = {
					latitude: results[0].latitude,
					longitude: results[0].longitude,
				};
			}
		} catch (error) {
			console.error(error);
		}

		await onAddTrip({ ...data, coordinates });
	};

	return (
		<TripForm
			defaultValues={{
				title: "",
				destination: "",
				date: "",
				rating: 3,
			}}
			onSubmit={onSubmit}
			buttonLabel="Dodaj podróż"
			isWizard
		/>
	);
}

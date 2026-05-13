import { TripFormData } from "@/types/tripSchema";
import TripForm from "./TripForm";

interface AddTripFormProps {
	onAddTrip: (data: TripFormData) => Promise<void>;
}

export default function AddTripForm({ onAddTrip }: AddTripFormProps) {
	const onSubmit = async (data: TripFormData): Promise<void> => {
		await onAddTrip(data);
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
		/>
	);
}

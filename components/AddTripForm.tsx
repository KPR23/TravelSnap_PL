import { useState } from "react";
import { Button, StyleSheet, TextInput, View } from "react-native";

type AddTripFormProps = {
	onAddTrip: (
		title: string,
		destination: string,
		date: string,
		rating: number,
	) => void;
};

export default function AddTripForm({ onAddTrip }: AddTripFormProps) {
	const [title, setTitle] = useState("");
	const [destination, setDestination] = useState("");
	const [date, setDate] = useState("");
	const [rating, setRating] = useState(0);

	const handleAddTrip = () => {
		if (title && destination && date && rating) {
			onAddTrip(title, destination, date, rating);
		}
	};

	return (
		<View style={styles.container}>
			<TextInput
				placeholder="Tytuł"
				style={styles.input}
				value={title}
				onChangeText={setTitle}
			/>
			<TextInput
				placeholder="Destynacja"
				style={styles.input}
				value={destination}
				onChangeText={setDestination}
			/>
			<TextInput
				placeholder="Data"
				style={styles.input}
				value={date}
				onChangeText={setDate}
			/>
			<TextInput
				placeholder="Ocena (1-5)"
				style={styles.input}
				value={rating.toString()}
				onChangeText={(text) => {
					const number = Number(text);
					if (number >= 1 && number <= 5) {
						setRating(number);
					}
				}}
				keyboardType="numeric"
			/>
			<Button title="Dodaj" onPress={handleAddTrip} color="#000" />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		gap: 10,
		padding: 16,
	},
	input: {
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 8,
		padding: 8,
	},
});

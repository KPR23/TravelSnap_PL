import type { TripData } from "@/types/trip";
import { useState } from "react";
import {
	Alert,
	Keyboard,
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";

type AddTripFormProps = {
	onAddTrip: (data: TripData) => void;
};

export default function AddTripForm({ onAddTrip }: AddTripFormProps) {
	const [title, setTitle] = useState("");
	const [destination, setDestination] = useState("");
	const [dateDigits, setDateDigits] = useState("");
	const [rating, setRating] = useState("");

	const YEAR_LENGTH = 4;
	const MONTH_LENGTH = 2;

	const date =
		dateDigits.length <= YEAR_LENGTH
			? dateDigits
			: `${dateDigits.slice(0, YEAR_LENGTH)}-${dateDigits.slice(YEAR_LENGTH, YEAR_LENGTH + MONTH_LENGTH)}`;

	const handleDateChange = (text: string): void => {
		setDateDigits(text.replace(/\D/g, "").slice(0, YEAR_LENGTH + MONTH_LENGTH));
	};

	const validateRating = (rating: string): boolean => {
		const number = Number(rating);
		return number >= 1 && number <= 5;
	};

	const validateDate = (date: string): boolean => {
		return (
			date.length === YEAR_LENGTH + MONTH_LENGTH + 1 &&
			date[4] === "-" &&
			Number(
				date.slice(YEAR_LENGTH + MONTH_LENGTH, YEAR_LENGTH + MONTH_LENGTH + 1),
			) >= 1 &&
			Number(
				date.slice(YEAR_LENGTH + MONTH_LENGTH, YEAR_LENGTH + MONTH_LENGTH + 1),
			) <= 12 &&
			Number(date.slice(0, YEAR_LENGTH)) <= new Date().getFullYear()
		);
	};

	const handleAddTrip = (): void => {
		Keyboard.dismiss();

		if (!title || !destination || !dateDigits || !rating) {
			Alert.alert("Wypełnij wszystkie pola");
			return;
		}

		const isRatingValid = validateRating(rating);
		if (!isRatingValid) {
			Alert.alert("Zła ocena", "Ocena musi być między 1 a 5");
			return;
		}

		const isDateValid = validateDate(date);
		if (!isDateValid) {
			Alert.alert("Zła data", "Format: YYYY-MM (np. 2026-03)");
			return;
		}

		const fullDate =
			date.length === YEAR_LENGTH + MONTH_LENGTH
				? `${date.slice(0, YEAR_LENGTH)}-${date.slice(YEAR_LENGTH, YEAR_LENGTH + MONTH_LENGTH)}`
				: date;

		onAddTrip({
			title,
			destination,
			date: fullDate,
			rating: Number(rating),
		});
		setTitle("");
		setDestination("");
		setDateDigits("");
		setRating("");
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
				style={styles.input}
				value={date}
				onChangeText={handleDateChange}
				keyboardType="numeric"
				placeholder="YYYY-MM"
				maxLength={7}
			/>
			<TextInput
				placeholder="Ocena (1-5)"
				style={styles.input}
				onChangeText={(text) => setRating(text)}
				value={rating}
				keyboardType="numeric"
			/>
			<Pressable onPress={handleAddTrip} style={styles.button}>
				<Text style={styles.buttonText}>Dodaj</Text>
			</Pressable>
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
	button: {
		backgroundColor: "#345834",
		padding: 10,
		borderRadius: 8,
		alignItems: "center",
		justifyContent: "center",
	},
	buttonText: {
		color: "#fff",
		fontSize: 16,
	},
});

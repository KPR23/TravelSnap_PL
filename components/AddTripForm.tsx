import { Colors } from "@/constants/Colors";
import { MONTH_LENGTH, YEAR_LENGTH } from "@/constants/Constants";
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
		const monthStr = date.slice(
			YEAR_LENGTH + 1,
			YEAR_LENGTH + 1 + MONTH_LENGTH,
		);
		const month = Number(monthStr);
		return (
			date.length === YEAR_LENGTH + 1 + MONTH_LENGTH &&
			date[YEAR_LENGTH] === "-" &&
			month >= 1 &&
			month <= 12 &&
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

		onAddTrip({
			title,
			destination,
			date,
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
				placeholderTextColor={Colors.textSecondary}
				style={styles.input}
				value={title}
				onChangeText={setTitle}
			/>
			<TextInput
				placeholder="Destynacja"
				placeholderTextColor={Colors.textSecondary}
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
				placeholderTextColor={Colors.textSecondary}
				maxLength={7}
			/>
			<TextInput
				placeholder="Ocena (1-5)"
				placeholderTextColor={Colors.textSecondary}
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
		backgroundColor: Colors.card,
		borderRadius: 16,
	},
	input: {
		borderWidth: 1,
		borderRadius: 8,
		padding: 8,
		backgroundColor: Colors.inputBg,
		borderColor: Colors.inputBorder,
		color: Colors.textPrimary,
	},
	button: {
		backgroundColor: Colors.accent,
		padding: 10,
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 12,
	},
	buttonText: {
		color: Colors.textPrimary,
		fontSize: 16,
	},
});

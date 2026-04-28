import { Colors } from "@/constants/Colors";
import { MONTH_LENGTH, YEAR_LENGTH } from "@/constants/Constants";
import { Spacing } from "@/constants/Spacing";
import { useTrips } from "@/context/TripsContext";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
	Alert,
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	TouchableWithoutFeedback,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditTripScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const { getTripById, updateTrip } = useTrips();
	const router = useRouter();
	const trip = getTripById(id);
	const [title, setTitle] = useState(trip?.title ?? "");
	const [destination, setDestination] = useState(trip?.destination ?? "");
	const [dateDigits, setDateDigits] = useState(() =>
		(trip?.date ?? "").replace(/\D/g, "").slice(0, YEAR_LENGTH + MONTH_LENGTH),
	);
	const [rating, setRating] = useState(trip?.rating.toString() ?? "");

	const date =
		dateDigits.length <= YEAR_LENGTH
			? dateDigits
			: `${dateDigits.slice(0, YEAR_LENGTH)}-${dateDigits.slice(YEAR_LENGTH, YEAR_LENGTH + MONTH_LENGTH)}`;

	const handleDateChange = (text: string): void => {
		setDateDigits(text.replace(/\D/g, "").slice(0, YEAR_LENGTH + MONTH_LENGTH));
	};

	const validateRating = (value: string): boolean => {
		const number = Number(value);
		return Number.isInteger(number) && number >= 1 && number <= 5;
	};

	const validateDate = (value: string): boolean => {
		const monthStr = value.slice(
			YEAR_LENGTH + 1,
			YEAR_LENGTH + 1 + MONTH_LENGTH,
		);
		const month = Number(monthStr);
		return (
			value.length === YEAR_LENGTH + 1 + MONTH_LENGTH &&
			value[YEAR_LENGTH] === "-" &&
			month >= 1 &&
			month <= 12 &&
			Number(value.slice(0, YEAR_LENGTH)) <= new Date().getFullYear()
		);
	};

	const handleSaveChanges = async (): Promise<void> => {
		Keyboard.dismiss();

		if (!title || !destination || !dateDigits || !rating) {
			Alert.alert("Wypełnij wszystkie pola");
			return;
		}

		if (!validateRating(rating)) {
			Alert.alert("Zła ocena", "Ocena musi być między 1 a 5");
			return;
		}

		if (!validateDate(date)) {
			Alert.alert("Zła data", "Format: YYYY-MM (np. 2026-03)");
			return;
		}

		await updateTrip(id, {
			title,
			destination,
			date,
			rating: Number(rating),
		});
		router.back();
	};

	if (!trip) {
		return (
			<SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
				<View style={styles.placeholder}>
					<Ionicons
						name="alert-circle-outline"
						size={56}
						color={Colors.placeholder}
					/>
					<Text style={styles.placeholderText}>Nie znaleziono podróży</Text>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
			<SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
				<KeyboardAvoidingView
					style={styles.content}
					behavior={Platform.OS === "ios" ? "padding" : "height"}
				>
					<View style={styles.formFields}>
						<Text style={styles.label}>Tytuł</Text>
						<TextInput
							placeholder="Tytuł"
							placeholderTextColor={Colors.textSecondary}
							style={styles.input}
							value={title}
							onChangeText={setTitle}
						/>
						<Text style={styles.label}>Destynacja</Text>
						<TextInput
							placeholder="Destynacja"
							placeholderTextColor={Colors.textSecondary}
							style={styles.input}
							value={destination}
							onChangeText={setDestination}
						/>
						<Text style={styles.label}>Data</Text>
						<TextInput
							style={styles.input}
							value={date}
							onChangeText={handleDateChange}
							keyboardType="numeric"
							placeholder="YYYY-MM"
							placeholderTextColor={Colors.textSecondary}
							maxLength={7}
						/>
						<Text style={styles.label}>Ocena</Text>
						<TextInput
							placeholder="Ocena (1-5)"
							placeholderTextColor={Colors.textSecondary}
							style={styles.input}
							onChangeText={setRating}
							value={rating}
							keyboardType="numeric"
						/>
					</View>
					<Pressable onPress={handleSaveChanges} style={styles.button}>
						<Text style={styles.buttonText}>Zapisz zmiany</Text>
					</Pressable>
				</KeyboardAvoidingView>
			</SafeAreaView>
		</TouchableWithoutFeedback>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.background,
	},
	content: {
		flex: 1,
		paddingHorizontal: Spacing.lg,
		paddingTop: Spacing.md,
		paddingBottom: Spacing.lg,
		gap: Spacing.lg,
	},
	formFields: {
		gap: Spacing.sm,
	},
	label: {
		color: Colors.textSecondary,
		fontSize: 14,
		fontWeight: "600",
	},
	input: {
		borderWidth: 1,
		borderRadius: Spacing.sm,
		padding: Spacing.sm,
		backgroundColor: Colors.inputBg,
		borderColor: Colors.inputBorder,
		color: Colors.textPrimary,
	},
	button: {
		backgroundColor: Colors.primary,
		paddingVertical: Spacing.sm + Spacing.xs,
		alignItems: "center",
		justifyContent: "center",
		borderRadius: Spacing.md,
		marginTop: "auto",
		flexDirection: "row",
		gap: Spacing.xs,
	},
	buttonText: {
		color: Colors.background,
		fontSize: 16,
		fontWeight: "600",
	},
	placeholder: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		gap: Spacing.sm,
	},
	placeholderText: {
		fontSize: 16,
		color: Colors.placeholder,
	},
});

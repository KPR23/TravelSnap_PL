import { Colors } from "@/constants/Colors";
import { Spacing } from "@/constants/Spacing";
import { handleAddPhoto } from "@/lib/pickImage";
import { TripFormData, tripSchema } from "@/types/tripSchema";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image } from "expo-image";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
	ActivityIndicator,
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
import RatingStars from "./RatingStars";

type AddTripFormProps = {
	onAddTrip: (data: TripFormData) => Promise<void>;
};

export default function AddTripForm({ onAddTrip }: AddTripFormProps) {
	const [imageUri, setImageUri] = useState<string | null>(null);
	const draftTripId = useRef<string | null>(null);
	const {
		control,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<TripFormData>({
		resolver: zodResolver(tripSchema),
		defaultValues: {
			title: "",
			destination: "",
			date: "",
			rating: 3,
		},
		mode: "onBlur",
	});

	const onSubmit = async (data: TripFormData): Promise<void> => {
		await onAddTrip({ ...data, imageUri: imageUri ?? undefined });
		setImageUri(null);
		reset();
	};

	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
			<KeyboardAvoidingView
				style={styles.container}
				behavior={Platform.OS === "ios" ? "padding" : "height"}
			>
				<View style={styles.formFields}>
					<Controller
						name="title"
						control={control}
						render={({ field: { onChange, onBlur, value }, fieldState }) => (
							<View style={styles.field}>
								<Text style={styles.label}>Tytuł</Text>
								<TextInput
									placeholder="np. Wycieczka do Paryża"
									placeholderTextColor={Colors.textSecondary}
									style={[styles.input, fieldState.error && styles.inputError]}
									value={value}
									onChangeText={onChange}
									onBlur={onBlur}
								/>
								{fieldState.error && (
									<Text style={styles.errorText}>
										{fieldState.error.message}
									</Text>
								)}
							</View>
						)}
					/>
					<Controller
						name="destination"
						control={control}
						render={({ field: { onChange, onBlur, value }, fieldState }) => (
							<View style={styles.field}>
								<Text style={styles.label}>Destynacja</Text>
								<TextInput
									placeholder="Destynacja"
									placeholderTextColor={Colors.textSecondary}
									style={[styles.input, fieldState.error && styles.inputError]}
									value={value}
									onChangeText={onChange}
									onBlur={onBlur}
								/>
								{fieldState.error && (
									<Text style={styles.errorText}>
										{fieldState.error.message}
									</Text>
								)}
							</View>
						)}
					/>
					<Controller
						name="date"
						control={control}
						render={({ field: { onChange, onBlur, value }, fieldState }) => (
							<View style={styles.field}>
								<Text style={styles.label}>Data</Text>
								<TextInput
									style={[styles.input, fieldState.error && styles.inputError]}
									value={value}
									onChangeText={onChange}
									onBlur={onBlur}
									keyboardType="numeric"
									placeholder="YYYY-MM"
									placeholderTextColor={Colors.textSecondary}
									maxLength={7}
								/>
								{fieldState.error && (
									<Text style={styles.errorText}>
										{fieldState.error.message}
									</Text>
								)}
							</View>
						)}
					/>
					<Controller
						name="rating"
						control={control}
						render={({ field: { value, onChange }, fieldState }) => (
							<View style={styles.field}>
								<Text style={styles.label}>Ocena</Text>
								<RatingStars rating={value} onChange={onChange} />
								{fieldState.error && (
									<Text style={styles.errorText}>
										{fieldState.error.message}
									</Text>
								)}
							</View>
						)}
					/>
				</View>
				<View style={styles.imageContainer}>
					{imageUri ? (
						<>
							<Image source={{ uri: imageUri }} style={styles.image} />
							<Pressable
								onPress={() =>
									handleAddPhoto(draftTripId.toString(), setImageUri)
								}
								style={styles.changeImageButton}
							>
								<Text style={styles.imageText}>Zmień zdjęcie</Text>
							</Pressable>
						</>
					) : (
						<Pressable
							onPress={() =>
								handleAddPhoto(draftTripId.toString(), setImageUri)
							}
							style={styles.imageButton}
						>
							<Ionicons
								name="camera-outline"
								size={24}
								color={Colors.textPrimary}
							/>
							<Text style={styles.imageText}>Dodaj zdjęcie</Text>
						</Pressable>
					)}
				</View>
				<Pressable
					onPress={handleSubmit(onSubmit)}
					disabled={isSubmitting}
					style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
				>
					{isSubmitting ? (
						<ActivityIndicator color={Colors.background} />
					) : (
						<Text style={styles.submitBtnText}>Dodaj podróż</Text>
					)}
				</Pressable>
			</KeyboardAvoidingView>
		</TouchableWithoutFeedback>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		gap: Spacing.sm,
		borderRadius: Spacing.lg,
	},
	formFields: {
		gap: Spacing.sm,
	},
	button: {
		backgroundColor: Colors.accent,
		paddingVertical: Spacing.sm + Spacing.xs,
		alignItems: "center",
		justifyContent: "center",
		borderRadius: Spacing.md,
		marginTop: "auto",
	},
	buttonText: {
		color: Colors.textPrimary,
		fontSize: 16,
	},
	imageContainer: {
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 1,
		borderStyle: "dashed",
		borderColor: Colors.inputBorder,
		borderRadius: Spacing.sm,
		padding: Spacing.sm,
	},
	image: {
		width: "100%",
		height: 200,
		borderRadius: Spacing.sm,
	},
	imageText: {
		color: Colors.textPrimary,
		fontSize: 16,
	},
	imageButton: {
		alignItems: "center",
		justifyContent: "center",
		gap: Spacing.xs,
		padding: Spacing.md,
	},
	changeImageButton: {
		paddingVertical: Spacing.sm,
		paddingHorizontal: Spacing.md,
	},
	field: { marginBottom: 16 },
	label: {
		fontSize: 14,
		color: Colors.textSecondary,
		marginBottom: 6,
		fontWeight: "500",
	},
	input: {
		borderWidth: 1,
		borderColor: Colors.inputBorder,
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 10,
		fontSize: 16,
		color: Colors.textPrimary,
		backgroundColor: Colors.inputBg,
	},
	inputError: {
		borderColor: Colors.accent,
		borderWidth: 1.5,
	},
	errorText: {
		fontSize: 12,
		color: Colors.accent,
		marginTop: 4,
	},
	submitBtn: {
		backgroundColor: Colors.primary,
		paddingVertical: 14,
		borderRadius: 10,
		alignItems: "center",
		marginTop: 12,
	},
	submitBtnDisabled: { opacity: 0.5 },
	submitBtnText: {
		color: Colors.background,
		fontSize: 16,
		fontWeight: "700",
	},
});

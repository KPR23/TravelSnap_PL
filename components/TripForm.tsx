import { Colors } from "@/constants/Colors";
import { MONTH_LENGTH, YEAR_LENGTH } from "@/constants/Constants";
import { Spacing } from "@/constants/Spacing";
import { useTrips } from "@/context/TripsContext";
import { handlePickPhoto } from "@/lib/pickImage";
import { TripFormData, tripSchema } from "@/types/tripSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import {
	ActivityIndicator,
	Image,
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

const formatDateInput = (text: string): string => {
	const digits = text.replace(/\D/g, "").slice(0, YEAR_LENGTH + MONTH_LENGTH);

	if (digits.length <= YEAR_LENGTH) {
		return digits;
	}

	return `${digits.slice(0, YEAR_LENGTH)}-${digits.slice(YEAR_LENGTH)}`;
};

interface TripFormProps {
	defaultValues: TripFormData;
	onSubmit: (data: TripFormData) => Promise<void>;
	buttonLabel: string;
	tripId?: string;
}

export default function TripForm({
	defaultValues,
	onSubmit,
	buttonLabel,
	tripId,
}: TripFormProps) {
	const { trips } = useTrips();
	const existingTitles = useMemo(
		() =>
			trips.filter((t) => t.id !== tripId).map((t) => t.title.toLowerCase()),
		[trips, tripId],
	);

	const schema = useMemo(
		() =>
			tripSchema.extend({
				title: tripSchema.shape.title.refine(
					async (val) => {
						await new Promise((r) => setTimeout(r, 150));
						return !existingTitles.includes(val.toLowerCase());
					},
					{ message: "Tytuł już istnieje — wybierz inny" },
				),
			}),
		[existingTitles],
	);

	const {
		control,
		handleSubmit,
		watch,
		setValue,
		formState: { isSubmitting },
	} = useForm<TripFormData>({
		resolver: zodResolver(schema),
		defaultValues,
		mode: "onBlur",
	});

	const imageUri = watch("imageUri");

	const setImageUri = (uri: string) => {
		setValue("imageUri", uri, {
			shouldDirty: true,
			shouldValidate: true,
		});
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
								<View style={styles.inputWrapper}>
									<TextInput
										placeholder="np. Wycieczka do Paryża"
										placeholderTextColor={Colors.textSecondary}
										style={[
											styles.input,
											styles.inputWithSpinner,
											fieldState.error && styles.inputError,
										]}
										value={value}
										onChangeText={onChange}
										onBlur={onBlur}
									/>
									{fieldState.isValidating && (
										<ActivityIndicator
											color={Colors.textSecondary}
											size="small"
											style={styles.validationSpinner}
										/>
									)}
								</View>
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
									onChangeText={(text) => onChange(formatDateInput(text))}
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
								onPress={() => handlePickPhoto(setImageUri)}
								style={styles.changeImageButton}
							>
								<Text style={styles.imageText}>Zmień zdjęcie</Text>
							</Pressable>
						</>
					) : (
						<Pressable
							onPress={() => handlePickPhoto(setImageUri)}
							style={styles.imageButton}
						>
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
						<Text style={styles.submitBtnText}>{buttonLabel}</Text>
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
	inputWrapper: {
		position: "relative",
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
	inputWithSpinner: {
		paddingRight: 40,
	},
	validationSpinner: {
		position: "absolute",
		right: 12,
		top: 0,
		bottom: 0,
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

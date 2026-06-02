import { Colors } from "@/constants/Colors";
import { MONTH_LENGTH, YEAR_LENGTH } from "@/constants/Constants";
import { Spacing } from "@/constants/Spacing";
import { useTrips } from "@/context/TripsContext";
import { handlePickPhoto } from "@/lib/pickImage";
import { TripFormData, tripSchema } from "@/types/tripSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePreventRemove } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
	ActivityIndicator,
	Alert,
	Image,
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
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

const WIZARD_STEPS = [1, 2, 3] as const;

interface TripFormProps {
	defaultValues: TripFormData;
	onSubmit: (data: TripFormData) => Promise<void>;
	buttonLabel: string;
	tripId?: string;
	isWizard?: boolean;
}

export default function TripForm({
	defaultValues,
	onSubmit,
	buttonLabel,
	tripId,
	isWizard = false,
}: TripFormProps) {
	const [step, setStep] = useState<1 | 2 | 3>(1);

	const { trips } = useTrips();
	const existingTitles = useMemo(
		() =>
			trips.filter((t) => t.id !== tripId).map((t) => t.title.toLowerCase()),
		[trips, tripId],
	);
	const navigation = useNavigation();
	const submittedRef = useRef(false);
	const destinationRef = useRef<TextInput>(null);
	const dateRef = useRef<TextInput>(null);

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
		trigger,
		formState: { isSubmitting, isDirty },
	} = useForm<TripFormData>({
		resolver: zodResolver(schema),
		defaultValues,
		mode: "onBlur",
	});

	usePreventRemove(
		isDirty && !submittedRef.current && !isSubmitting,
		({ data }) => {
			Alert.alert("Odrzucić zmiany?", "Masz niezapisane zmiany. Odrzucić je?", [
				{ text: "Zostań", style: "cancel" },
				{
					text: "Odrzuć",
					style: "destructive",
					onPress: () => navigation.dispatch(data.action),
				},
			]);
		},
	);

	const imageUri = watch("imageUri");
	const showAllFields = !isWizard;
	const showTripDetailsFields = showAllFields || step === 1;
	const showRatingFields = showAllFields || step === 2;
	const showImageField = showAllFields || step === 3;

	const setImageUri = (uri: string) => {
		setValue("imageUri", uri, {
			shouldDirty: true,
			shouldValidate: true,
		});
	};

	const goNext = async () => {
		const fields =
			step === 1
				? (["title", "destination"] as const)
				: step === 2
					? (["date", "rating"] as const)
					: ([] as const);

		const ok = await trigger(fields);
		if (ok) setStep((s) => (s + 1) as 1 | 2 | 3);
	};

	const handleValidSubmit = async (data: TripFormData) => {
		submittedRef.current = true;

		try {
			await onSubmit(data);
		} catch (error) {
			submittedRef.current = false;
			throw error;
		}
	};
	const submitHandler = handleSubmit(handleValidSubmit);
	const primaryButtonLabel = isWizard && step !== 3 ? "Dalej" : buttonLabel;
	const handlePrimaryPress = isWizard && step !== 3 ? goNext : submitHandler;
	const handleDestinationSubmit = () => {
		if (isWizard) {
			void goNext();
			return;
		}

		dateRef.current?.focus();
	};
	const handleDateSubmit = () => {
		if (isWizard) {
			void goNext();
			return;
		}

		void submitHandler();
	};

	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
			<KeyboardAvoidingView
				style={styles.container}
				behavior={Platform.OS === "ios" ? "padding" : "height"}
			>
				<ScrollView
					contentContainerStyle={styles.scrollContent}
					keyboardShouldPersistTaps="handled"
				>
					{isWizard && (
						<View style={styles.stepIndicatorContainer}>
							{WIZARD_STEPS.map((wizardStep) => (
								<View
									key={wizardStep}
									style={[
										styles.stepIndicator,
										wizardStep <= step
											? styles.stepIndicatorActive
											: styles.stepIndicatorInactive,
									]}
								/>
							))}
						</View>
					)}
					<View style={styles.formFields}>
						{showTripDetailsFields && (
							<>
								<Controller
									name="title"
									control={control}
									render={({
										field: { onChange, onBlur, value },
										fieldState,
									}) => (
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
													autoFocus
													returnKeyType="next"
													onSubmitEditing={() =>
														destinationRef.current?.focus()
													}
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
									render={({
										field: { onChange, onBlur, value },
										fieldState,
									}) => (
										<View style={styles.field}>
											<Text style={styles.label}>Destynacja</Text>
											<TextInput
												ref={destinationRef}
												placeholder="Destynacja"
												placeholderTextColor={Colors.textSecondary}
												style={[
													styles.input,
													fieldState.error && styles.inputError,
												]}
												value={value}
												onChangeText={onChange}
												onBlur={onBlur}
												returnKeyType="next"
												onSubmitEditing={handleDestinationSubmit}
											/>
											{fieldState.error && (
												<Text style={styles.errorText}>
													{fieldState.error.message}
												</Text>
											)}
										</View>
									)}
								/>
							</>
						)}
						{showRatingFields && (
							<>
								<Controller
									name="date"
									control={control}
									render={({
										field: { onChange, onBlur, value },
										fieldState,
									}) => (
										<View style={styles.field}>
											<Text style={styles.label}>Data</Text>
											<TextInput
												ref={dateRef}
												style={[
													styles.input,
													fieldState.error && styles.inputError,
												]}
												value={value}
												onChangeText={(text) => onChange(formatDateInput(text))}
												onBlur={onBlur}
												keyboardType="numeric"
												placeholder="YYYY-MM"
												placeholderTextColor={Colors.textSecondary}
												maxLength={7}
												autoFocus={isWizard}
												returnKeyType={isWizard ? "next" : "done"}
												onSubmitEditing={handleDateSubmit}
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
							</>
						)}
					</View>
					{showImageField && (
						<>
							<Text style={styles.label}>Zdjęcie</Text>
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
						</>
					)}
					<Pressable
						onPress={handlePrimaryPress}
						disabled={isSubmitting}
						style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
					>
						{isSubmitting ? (
							<ActivityIndicator color={Colors.background} />
						) : (
							<Text style={styles.submitBtnText}>{primaryButtonLabel}</Text>
						)}
					</Pressable>
				</ScrollView>
			</KeyboardAvoidingView>
		</TouchableWithoutFeedback>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		borderRadius: Spacing.lg,
	},
	scrollContent: {
		flexGrow: 1,
		gap: Spacing.sm,
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
	stepIndicatorContainer: {
		flexDirection: "row",
		justifyContent: "center",
		gap: Spacing.xs,
	},
	stepIndicator: {
		width: 10,
		height: 10,
		borderRadius: 5,
	},
	stepIndicatorActive: {
		backgroundColor: Colors.primary,
	},
	stepIndicatorInactive: {
		backgroundColor: Colors.textSecondary,
	},
});

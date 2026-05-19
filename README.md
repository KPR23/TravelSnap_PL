# Zadanie 9 - Formularze i walidacja

> **Cel zadania:** zamienić `AddTripForm` z gołego `useState` na `react-hook-form` + `Zod`, dodać field-level errors, loading state przy submicie, i nowy ekran edycji podróży. Po skończonym CORE Twój formularz będzie miał profesjonalną walidację i będzie się skalował z aplikacją bez bólu.

---

## Co dostajesz na start

Po Wykładzie 8 masz:

- `AddTripForm.tsx` na czterech `useState` (title, destination, date, rating) - submit bez walidacji.
- `TripContext` z `addTrip`, `deleteTrip`, `updateTrip` (sygnatura `(id, partial) => Promise<void>`) i hydracją z `AsyncStorage`.
- `types/trip.ts` z typami `TripData` i `Trip extends TripData { id }`.
- Ekrany: `(tabs)/index.tsx` (lista), `(tabs)/explore.tsx`, `trip/[id].tsx` (details), `trip/gallery/[id].tsx`.

Punkt startowy zadania: w `AddTripForm.tsx` można nacisnąć "Dodaj" mając pusty tytuł i pole `date` w dowolnym formacie. To naprawiamy.

---

## Design Spec - nowe pliki

| Plik                                            | Co w nim siedzi                                                                |
| ----------------------------------------------- | ------------------------------------------------------------------------------ |
| `types/tripSchema.ts`                           | `tripSchema` (z.object), typ `TripFormData = z.infer<typeof tripSchema>`       |
| `app/trip/edit/[id].tsx`                        | Ekran edycji podróży - ten sam formularz z `defaultValues` z istniejącego trip |
| `components/TripFormFields.tsx` _(opcjonalnie)_ | Wyodrębniony JSX pól formularza, reużywany między AddTripForm i ekranem edycji |

## Design Spec - modyfikowane pliki

| Plik                         | Co zmieniasz                                                                                  |
| ---------------------------- | --------------------------------------------------------------------------------------------- |
| `components/AddTripForm.tsx` | Refaktor z `useState` na `useForm` + `Controller`, dodanie field-level errors i loading state |
| `app/trip/[id].tsx`          | Dodajesz przycisk "Edytuj" obok "Usuń", który prowadzi do `/trip/edit/[id]`                   |
| `package.json`               | Nowe zależności: `react-hook-form`, `@hookform/resolvers`, `zod`                              |

## Konwencje stylu (zachować spójność z L1–L8)

- Kolory z `constants/Colors.ts` — `accent` (`#E94560`) dla błędów, `reactBlue` dla CTA, `gray500` dla placeholder.
- `borderColor` inputu w stanie błędu: `Colors.accent`; w stanie normalnym: `Colors.gray300`.
- `errorText`: `fontSize: 12`, `color: Colors.accent`, `marginTop: 4`.
- Przycisk submit: tło `Colors.reactBlue`, tekst `Colors.darkBg`; disabled: `opacity: 0.5`.

---

## Krok 0 - Setup zależności

**Cel:** zainstaluj `react-hook-form`, `@hookform/resolvers` (dla zodResolver) i `zod`.

1. W katalogu projektu uruchom:

   ```bash
   npx expo install react-hook-form @hookform/resolvers zod
   ```

   `expo install` dobiera wersje kompatybilne z Twoim SDK. Jeśli z jakiegoś powodu nie zadziała, można też `npm install react-hook-form @hookform/resolvers zod` - ale `expo install` jest bezpieczniejsze.

2. Sprawdź w `package.json`, że pojawiły się w `dependencies`:

   ```json
   "react-hook-form": "^7.x.x",
   "@hookform/resolvers": "^3.x.x",
   "zod": "^3.x.x"
   ```

3. Zrestartuj Metro (`Ctrl+C` i `npx expo start` ponownie).

**Pułapka:** jeśli widzisz błąd `Cannot find module '@hookform/resolvers/zod'`, upewnij się, że importujesz z `@hookform/resolvers/zod` (podścieżka), nie z `@hookform/resolvers`.

---

## Krok 1 - Schemat Zod dla TripData

**Cel:** zdefiniować jeden źródłowy plik z regułami walidacji i typem `TripFormData`.

**Plik do utworzenia:** `types/tripSchema.ts`.

### Sygnatura

```ts
import { z } from "zod";

export const tripSchema = z.object({
	/* ... */
});
export type TripFormData = z.infer<typeof tripSchema>;
```

### Wymagania

1. Pole `title`:
   - `z.string()`
   - `.min(3, 'Tytuł musi mieć co najmniej 3 znaki')`
   - `.max(60, 'Tytuł może mieć maksymalnie 60 znaków')`
   - `.trim()` — usuwa białe znaki z początku i końca.

2. Pole `destination`:
   - `z.string()`
   - `.min(1, 'Cel podróży jest wymagany')`
   - `.max(80, 'Cel podróży: maks 80 znaków')`.

3. Pole `date`:
   - `z.string()`
   - `.regex(/^\d{4}-\d{2}-\d{2}$/, 'Data w formacie YYYY-MM-DD')`.

4. Pole `rating`:
   - `z.number({ invalid_type_error: 'Ocena musi być liczbą' })`
   - `.int('Ocena musi być liczbą całkowitą')`
   - `.min(1, 'Min 1 gwiazdka')`
   - `.max(5, 'Max 5 gwiazdek')`.

5. Pole `imageUri`: `z.string().optional()` (URI z `expo-file-system`, nie zawsze URL — bez `.url()`).

6. Pole `galleryUris`: `z.array(z.string()).optional()`.

7. Wyeksportuj `tripSchema` (jako stałą) i typ `TripFormData = z.infer<typeof tripSchema>`.

### Pułapka

- Nie używaj `.url()` dla `imageUri`. W L4/L5 przechowujesz lokalne URI typu `file:///...` — `.url()` może je odrzucać (zależy od wersji Zod).
- `invalid_type_error` na `z.number()` łapie sytuacje, kiedy do pola wpadnie string z `setValue` lub ręcznego ustawienia — zostaw to dla bezpieczeństwa, choć przy normalnym flow nie powinno się zdarzyć.

---

## Krok 2 - Refaktor AddTripForm na react-hook-form

**Cel:** wymienić cztery `useState` na jeden `useForm` z `zodResolver`, owinąć każde `TextInput` w `Controller`.

**Plik:** `components/AddTripForm.tsx`.

### Wymagania

1. Usuń wszystkie `useState` dla pól formularza (`title`, `destination`, `date`, `rating`).

2. Dodaj importy:

   ```ts
   import { Controller, useForm } from "react-hook-form";
   import { zodResolver } from "@hookform/resolvers/zod";
   import { tripSchema, TripFormData } from "@/types/tripSchema";
   ```

3. Wywołaj `useForm<TripFormData>` z konfiguracją:

   ```ts
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
   ```

4. Każde `TextInput` zamień na `<Controller name="..." control={control} render={({ field, fieldState }) => (...)} />`. Wewnątrz `render`:
   - `value={field.value}`,
   - `onChangeText={field.onChange}` (uwaga: TextInput w RN ma `onChangeText`, nie `onChange`),
   - `onBlur={field.onBlur}`.

5. Pole `rating` zostaje obsługiwane przez Twój komponent `RatingStars` (z L2/L3). Owinąć go też w `Controller`:

   ```tsx
   <Controller
   	control={control}
   	name="rating"
   	render={({ field: { onChange, value } }) => (
   		<RatingStars rating={value} onChange={onChange} />
   	)}
   />
   ```

   Jeśli Twój `RatingStars` używa innej nazwy propu niż `rating`/`onChange` — dostosuj. Liczba musi być integer 1–5.

6. Funkcja `onSubmit` przyjmuje typowany obiekt `TripFormData`:

   ```ts
   const onSubmit = async (data: TripFormData) => {
   	await addTrip(data); // addTrip z useTrips()
   	reset();
   	// jeśli formularz jest na osobnym ekranie — router.back()
   };
   ```

7. Przycisk submit:

   ```tsx
   <Pressable onPress={handleSubmit(onSubmit)} disabled={isSubmitting} ... />
   ```

### Pułapka

- W `Controller` przekazujesz `field.onChange` do `onChangeText` (string-first), nie do `onChange`. Wpięcie do `onChange` powoduje, że RHF dostaje obiekt eventu zamiast stringa i walidacja Zod się sypie.
- Nie ustawiaj `defaultValues` jako wynik wywołania funkcji liczonej na każdym renderze — `useForm` czyta `defaultValues` tylko raz przy montowaniu. Jeśli potrzebujesz dynamicznych defaultów (jak na ekranie edycji), używaj `reset(values)` w `useEffect`.
- Pole `rating` w `defaultValues` musi być `number` (np. `3`), nie `'3'`. Inaczej Zod od razu wywali invalid_type_error.

---

## Krok 3 - Field-level errors w UI

**Cel:** pod każdym inputem renderować komunikat błędu, podświetlać ramkę inputu na czerwono w stanie błędu.

### Wymagania

1. W stylesheet `AddTripForm.tsx` dodaj:

   ```ts
   const styles = StyleSheet.create({
   	field: { marginBottom: 16 },
   	label: {
   		fontSize: 14,
   		color: Colors.gray700,
   		marginBottom: 6,
   		fontWeight: "500",
   	},
   	input: {
   		borderWidth: 1,
   		borderColor: Colors.gray300,
   		borderRadius: 8,
   		paddingHorizontal: 12,
   		paddingVertical: 10,
   		fontSize: 16,
   		color: Colors.gray900,
   		backgroundColor: Colors.white,
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
   });
   ```

2. W każdym `Controller`'s `render` wykorzystaj `fieldState.error`:

   ```tsx
   <View style={styles.field}>
   	<Text style={styles.label}>Tytuł</Text>
   	<TextInput
   		style={[styles.input, fieldState.error && styles.inputError]}
   		value={value}
   		onChangeText={onChange}
   		onBlur={onBlur}
   		placeholder="np. Wycieczka do Paryża"
   		placeholderTextColor={Colors.gray500}
   	/>
   	{fieldState.error && (
   		<Text style={styles.errorText}>{fieldState.error.message}</Text>
   	)}
   </View>
   ```

3. Powtórz dla `destination` i `date`. Dla `rating`, jeśli używasz `RatingStars`, error renderuj pod komponentem.

### Pułapka

- `fieldState.error` jest `undefined`, gdy nie ma błędu — short-circuit `{fieldState.error && (...)}` nie renderuje wtedy nic.
- Komunikaty błędów pojawiają się dopiero po pierwszym blur (tryb `onBlur`). To celowe — nie chcemy spamować błędami przy każdej literze.

---

## Krok 4 - Submit z loading state

**Cel:** podczas submitu przycisk jest disabled i pokazuje `ActivityIndicator`. Po sukcesie formularz się czyści.

### Wymagania

1. Funkcja `onSubmit` (z Kroku 2) jest `async`. RHF automatycznie ustawia `isSubmitting: true` na czas wykonywania.

2. W `AsyncStorage` operacje są błyskawiczne, więc żeby zobaczyć efekt loading state, zasymuluj 500ms opóźnienia (tylko na czas testowania!):

   ```ts
   const onSubmit = async (data: TripFormData) => {
   	await new Promise((r) => setTimeout(r, 500)); // tylko do testu
   	await addTrip(data);
   	reset();
   };
   ```

   Po przetestowaniu **usuń** linię z `setTimeout`.

3. Przycisk submit:

   ```tsx
   <Pressable
   	onPress={handleSubmit(onSubmit)}
   	disabled={isSubmitting}
   	style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
   >
   	{isSubmitting ? (
   		<ActivityIndicator color={Colors.darkBg} />
   	) : (
   		<Text style={styles.submitBtnText}>Dodaj podróż</Text>
   	)}
   </Pressable>
   ```

4. Style:

   ```ts
   submitBtn: {
     backgroundColor: Colors.reactBlue,
     paddingVertical: 14, borderRadius: 10,
     alignItems: 'center', marginTop: 12,
   },
   submitBtnDisabled: { opacity: 0.5 },
   submitBtnText: {
     color: Colors.darkBg, fontSize: 16, fontWeight: '700',
   },
   ```

### Pułapka

- `ActivityIndicator` musi mieć kontrastowy kolor względem tła przycisku. `Colors.reactBlue` to jasny niebieski, więc `color={Colors.darkBg}` (ciemny granat) jest widoczny.
- Nie wywołuj `onSubmit` bezpośrednio (np. `onPress={onSubmit}`) — ominiesz walidację. Zawsze `onPress={handleSubmit(onSubmit)}`.

---

## Krok 5 - Ekran edycji `app/trip/edit/[id].tsx`

**Cel:** stworzyć nowy ekran z formularzem wypełnionym istniejącymi danymi podróży. Submit wywołuje `updateTrip` i wraca na poprzedni ekran.

**Plik do utworzenia:** `app/trip/edit/[id].tsx`.

### Wymagania

1. Szkielet pliku:

   ```tsx
   import { useEffect, useMemo } from "react";
   import {
   	View,
   	Text,
   	StyleSheet,
   	Pressable,
   	ActivityIndicator,
   	TextInput,
   	ScrollView,
   } from "react-native";
   import { useLocalSearchParams, useRouter, Stack } from "expo-router";
   import { Controller, useForm } from "react-hook-form";
   import { zodResolver } from "@hookform/resolvers/zod";
   import { tripSchema, TripFormData } from "@/types/tripSchema";
   import { useTrips } from "@/context/TripContext";
   import { Colors } from "@/constants/Colors";
   ```

2. Wewnątrz komponentu:

   ```ts
   const { id } = useLocalSearchParams<{ id: string }>();
   const router = useRouter();
   const { trips, updateTrip } = useTrips();
   const trip = useMemo(() => trips.find((t) => t.id === id), [trips, id]);
   ```

3. Konfiguracja formularza:

   ```ts
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
   ```

4. Wypełnij formularz, gdy znajdziesz `trip`:

   ```ts
   useEffect(() => {
   	if (trip) {
   		reset({
   			title: trip.title,
   			destination: trip.destination,
   			date: trip.date,
   			rating: trip.rating,
   			imageUri: trip.imageUri,
   			galleryUris: trip.galleryUris,
   		});
   	}
   }, [trip, reset]);
   ```

5. Funkcja submit wywołuje `updateTrip`:

   ```ts
   const onSubmit = async (data: TripFormData) => {
   	if (!trip) return;
   	await updateTrip(trip.id, data);
   	router.back();
   };
   ```

6. Jeśli `trip === undefined` (np. zły id), pokaż pusty stan z linkiem powrotnym:

   ```tsx
   if (!trip) {
   	return (
   		<View style={styles.empty}>
   			<Text>Nie znaleziono podróży.</Text>
   			<Pressable onPress={() => router.back()}>
   				<Text>Wróć</Text>
   			</Pressable>
   		</View>
   	);
   }
   ```

7. JSX formularza jest identyczny jak w `AddTripForm` (te same `Controller` z tymi samymi polami). Możesz albo skopiować, albo (lepiej) wyodrębnić wspólny `TripFormFields` jako komponent. Wartość pól pochodzi już z `reset()` w useEffect.

8. Przycisk submit ma teraz tekst "Zapisz zmiany" (nie "Dodaj podróż").

9. `<Stack.Screen options={{ title: 'Edytuj podróż' }} />` na górze JSX-a, żeby nagłówek nawigacji pokazywał właściwy tytuł.

### Pułapka

- Nie przekazuj całego obiektu `trip` do `reset` — `trip` ma pole `id`, którego `TripFormData` nie zna. `reset` zignoruje nieznane pola, ale TypeScript się burzy. Lepiej wybierać pola jawnie (jak wyżej).
- `useEffect` z `[trip, reset]` może odpalić się ponownie, jeśli lista `trips` się zmieni z innego powodu. W praktyce nie jest to problem, bo `reset` zachowuje czystość formularza. Jeśli zauważysz dziwne nadpisywanie — dodaj flagę `useRef(false)`, która gwarantuje uruchomienie tylko raz przy pierwszym pojawieniu się `trip`.
- `Stack.Screen` musi być wewnątrz `Stack` w `_layout.tsx` lub w samym ekranie jako konfiguracja — sprawdź, że masz nawigację stack-ową dla tej trasy.

---

## Krok 6 - Przycisk "Edytuj" w `trip/[id].tsx`

**Cel:** dodać do ekranu details przycisk, który prowadzi na ekran edycji.

### Wymagania

1. W komponencie ekranu details dodaj importy (jeśli jeszcze nie ma):

   ```ts
   import { useRouter } from "expo-router";
   ```

2. Wewnątrz komponentu:

   ```ts
   const router = useRouter();
   ```

3. Dodaj przycisk obok istniejącego "Usuń" (lub w innym sensownym miejscu — np. w nagłówku):

   ```tsx
   <Pressable
   	onPress={() => router.push(`/trip/edit/${trip.id}`)}
   	style={styles.editBtn}
   >
   	<Text style={styles.editBtnText}>Edytuj</Text>
   </Pressable>
   ```

4. Style:

   ```ts
   editBtn: {
     backgroundColor: Colors.reactBlue,
     paddingVertical: 12, paddingHorizontal: 20,
     borderRadius: 8, marginRight: 8,
   },
   editBtnText: {
     color: Colors.darkBg, fontWeight: '600',
   },
   ```

### Pułapka

- Po powrocie z ekranu edycji lista `trips` w `TripContext` musi zawierać już zaktualizowane dane (bo `updateTrip` to robi). Sprawdź, że po `router.back()` Trip Details renderuje się z nowymi wartościami — jeśli nie, problem leży w `TripContext.updateTrip` (a nie w tym, co robisz w L9). W razie czego dodaj `console.log` po wywołaniu `updateTrip`, żeby zobaczyć, że trip w storze faktycznie się zmienił.

---

### Krok 7 - Async unique-title validation

**Cel:** sprawdzać, czy tytuł nie powiela istniejących (case-insensitive).

1. W komponencie pobierz listę istniejących tytułów:

   ```ts
   const { trips } = useTrips();
   const existingTitles = useMemo(
   	() => trips.map((t) => t.title.toLowerCase()),
   	[trips],
   );
   ```

2. Zbuduj rozszerzony schemat w `useMemo`:

   ```ts
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
   ```

3. Użyj `schema` w `useForm({ resolver: zodResolver(schema), ... })`.

4. RHF wystawia `isValidating: boolean` — możesz pokazać małe spinnery przy polu w trakcie walidacji.

**Pułapka:** na ekranie edycji NIE chcesz blokować obecnego tytułu jako duplikatu (bo to ten sam trip!). Wyklucz aktualny trip z `existingTitles`:

```ts
const existingTitles = useMemo(
	() =>
		trips.filter((t) => t.id !== trip?.id).map((t) => t.title.toLowerCase()),
	[trips, trip?.id],
);
```

### Krok 8 - `isDirty` + alert "Odrzucić zmiany?"

**Cel:** kiedy użytkownik wciska Back/Esc na ekranie edycji z niezapisanymi zmianami, zapytaj go "Odrzucić zmiany?".

1. W `app/trip/edit/[id].tsx`:

   ```ts
   import { useNavigation } from 'expo-router';
   import { Alert } from 'react-native';

   const navigation = useNavigation();
   const { formState: { isDirty } } = ...;

   useEffect(() => {
     const unsubscribe = navigation.addListener('beforeRemove', (e) => {
       if (!isDirty) return;
       e.preventDefault();
       Alert.alert(
         'Odrzucić zmiany?',
         'Masz niezapisane zmiany. Odrzucić je?',
         [
           { text: 'Zostań', style: 'cancel' },
           { text: 'Odrzuć', style: 'destructive',
             onPress: () => navigation.dispatch(e.data.action) },
         ]
       );
     });
     return unsubscribe;
   }, [navigation, isDirty]);
   ```

**Pułapka:** alert pokaże się też po `router.back()` z onSubmit po Twojej stronie. Rozwiązanie: ustaw flag `submittedRef.current = true` przed `router.back()` i sprawdzaj go w listenerze.

### Krok 9 - Multi-step wizard

**Cel:** rozbić formularz na 3 ekrany: title+destination → date+rating → photo+submit.

1. W `AddTripForm` (albo nowym `AddTripWizard`) dodaj stan `step: 1 | 2 | 3`.

2. Renderuj pola warunkowo:

   ```tsx
   {
   	step === 1 && <Step1 control={control} />;
   }
   {
   	step === 2 && <Step2 control={control} />;
   }
   {
   	step === 3 && <Step3 control={control} />;
   }
   ```

3. Przejście "Dalej" waliduje tylko pola bieżącego kroku przez `trigger`:

   ```ts
   const goNext = async () => {
   	const fields =
   		step === 1
   			? (["title", "destination"] as const)
   			: (["date", "rating"] as const);
   	const ok = await trigger(fields);
   	if (ok) setStep((s) => s + 1);
   };
   ```

4. Dodaj pasek postępu na górze (3 kropki, aktywna ma kolor `reactBlue`).

5. Krok 3 ma `handleSubmit(onSubmit)` na przycisku "Dodaj podróż".

**Pułapka:** `trigger` zwraca Promise — czekaj na wynik, nie polegaj na natychmiastowej wartości.

### Krok 10 - Upload zdjęcia jako część formularza

**Cel:** pole `imageUri` ustawiane przez `ImagePicker`, preview pod przyciskiem.

1. Zainstaluj (jeśli jeszcze nie masz z L4/L5):

   ```bash
   npx expo install expo-image-picker
   ```

2. W formularzu dodaj `<Controller name="imageUri" control={control} render={...} />`. W `render`:

   ```tsx
   <View style={styles.field}>
   	<Text style={styles.label}>Zdjęcie</Text>
   	{value ? (
   		<Image source={{ uri: value }} style={styles.preview} />
   	) : (
   		<View style={styles.previewPlaceholder}>
   			<Text style={{ color: Colors.gray500 }}>Brak zdjęcia</Text>
   		</View>
   	)}
   	<Pressable onPress={() => pickImage(onChange)} style={styles.pickBtn}>
   		<Text>{value ? "Zmień zdjęcie" : "Wybierz zdjęcie"}</Text>
   	</Pressable>
   </View>
   ```

3. Funkcja `pickImage`:

   ```ts
   const pickImage = async (onChange: (val: string) => void) => {
   	const result = await ImagePicker.launchImageLibraryAsync({
   		mediaTypes: ImagePicker.MediaTypeOptions.Images,
   		quality: 0.8,
   	});
   	if (!result.canceled && result.assets[0]) {
   		onChange(result.assets[0].uri);
   	}
   };
   ```

**Pułapka:** pamiętaj o uprawnieniach (`ImagePicker.requestMediaLibraryPermissionsAsync()` na pierwsze użycie). Bez tego na iOS picker po cichu nie pokazuje zdjęć.

### Krok 11 - UX polish: autoFocus, returnKeyType, KeyboardAvoidingView

**Cel:** profesjonalna obsługa klawiatury.

1. Pierwsze `TextInput` (title) dostaje `autoFocus={true}`.

2. Każde `TextInput` poza ostatnim: `returnKeyType="next"` + `onSubmitEditing={() => nextRef.current?.focus()}`.

3. Ostatnie tekstowe pole: `returnKeyType="done"` + `onSubmitEditing={handleSubmit(onSubmit)}`.

4. Ref na każdy input:

   ```ts
   const destinationRef = useRef<TextInput>(null);
   const dateRef = useRef<TextInput>(null);
   ```

5. Całość owijasz w `KeyboardAvoidingView`:

   ```tsx
   <KeyboardAvoidingView
   	behavior={Platform.OS === "ios" ? "padding" : "height"}
   	style={{ flex: 1 }}
   >
   	<ScrollView keyboardShouldPersistTaps="handled">
   		{/* formularz */}
   	</ScrollView>
   </KeyboardAvoidingView>
   ```

**Pułapka:** `forwardRef` przez `Controller` jest niemożliwy — `Controller` nie wystawia refa. Trzymaj swoje refy zewnętrznie i przekazuj je do `TextInput` bezpośrednio (przez prop `ref`), to działa niezależnie od RHF.

---

## Hints and common pitfalls

- **Typowanie `data` w onSubmit:** dzięki `useForm<TripFormData>` Twoje `data` w `onSubmit` jest w pełni typowane. Pisz `data.title`, nie `data['title']` - autocomplete robi resztę.

- **`mode: 'onBlur'` to optymalny default:** nie spamuje błędami przy każdym keystroke, ale od razu pokazuje błąd po opuszczeniu pola. Tryb `onChange` jest agresywny; `onSubmit` (domyślny) milczy do końca i daje słabą informację zwrotną.

- **`fieldState.error` vs `formState.errors`:** wewnątrz `Controller`'s render preferuj `fieldState.error` — to ten sam błąd, ale bez ręcznego dostępu przez nazwę.

- **`reset(values)` na ekranie edycji:** wywołuj w `useEffect` z `[trip, reset]`, nie próbuj inicjalizować `defaultValues` z `trip` od razu — `trip` może być `undefined` w pierwszym renderze (przed znalezieniem w `trips`).

- **Nie wywołuj `onSubmit` bezpośrednio:** zawsze `handleSubmit(onSubmit)`. Inaczej obchodzisz walidację i zapisujesz garbage.

- **`refine` async kosztuje:** unique-title check robi się na każdy blur tytułu — to dobrze przy 100 podróżach, ale z prawdziwym API ciężki. W produkcji rozważ debounce.

- **`ActivityIndicator` size i color:** domyślny size to "small". Color musi kontrastować z tłem przycisku.

- **TextInput w RN nie wie nic o `onChange`:** używaj `onChangeText` (string-first API).

- **Polskie znaki w komunikatach błędów:** są OK w stringach JS (UTF-8), w PDF, w markdown. Jedyne miejsce, gdzie czasem padają, to PPTX z Consolas — ale to nie dotyczy zadania.

- **`expo-router` i dynamiczne trasy:** `app/trip/edit/[id].tsx` to dynamiczna trasa. `router.push('/trip/edit/abc')` przejdzie tam i `useLocalSearchParams<{ id: string }>()` da `'abc'`.

---

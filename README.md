# Zajęcia 6 - Zadanie: Zdjęcia i galeria podróży

## Cel

Dodaj do TravelSnap pełną obsługę zdjęć: wybieranie z galerii, robienie aparatem, wyświetlanie w kartach i na ekranie szczegółowym, trwały zapis na dysku oraz ekran galerii z gridem, podglądem pełnoekranowym i usuwaniem.

---

## Design Spec

### Zaktualizowany typ danych

```
TripData {
  title: string;
  destination: string;
  date: string;
  rating: number;
  imageUri?: string;       // główne zdjęcie podróży
  galleryUris?: string[];  // dodatkowe zdjęcia
}
```

### AddTripForm - wybór zdjęcia

- Nowy obszar w formularzu: dashed border, ikona `camera-outline`, tekst "Dodaj zdjęcie"
- Po wybraniu zdjęcia: podgląd (Image, height 200, borderRadius 8) + przycisk "Zmień zdjęcie"
- Kliknięcie otwiera `Alert` z trzema opcjami: Galeria, Kamera, Anuluj
- Wybrane zdjęcie jest kopiowane do `FileSystem.documentDirectory + 'trips/'` przed zapisaniem
- URI z documentDirectory (nie z cache!) trafia do `imageUri` nowej podróży

### TripCard - zdjęcie nad treścią

- Jeśli `trip.imageUri` istnieje: `<Image>` na górze karty, `width: '100%'`, `height: 180`, `borderTopLeftRadius: 12`, `borderTopRightRadius: 12`
- Jeśli brak zdjęcia: karta wygląda jak dotychczas (bez zmian)
- Jeśli `trip.galleryUris.length > 0`: mała ikona `images` z liczbą w rogu karty

### TripDetail - hero image

- Jeśli `trip.imageUri` istnieje: duży obraz na górze (`height: 250`, `width: '100%'`)
- Jeśli brak: placeholder z ikoną `image-outline` (size 64, color `#4A6FA5`) i tekstem "Brak zdjęcia", tło `#1A2744`
- Pod hero image (lub placeholder): przycisk "Galeria (N)" z ikoną `images-outline`, linkujący do ekranu galerii

### Ekran galerii - `app/trip/gallery/[id].tsx`

- **Header**: tytuł podróży + liczba zdjęć (np. "Tokio — 5 zdjęć")
- **Grid**: `FlatList` z `numColumns={3}`, gap 4px, zdjęcia kwadratowe (1:1)
- **Pusty stan**: ikona `images-outline` + tekst "Brak zdjęć - dodaj pierwsze!"
- **FAB**: okrągły przycisk w prawym dolnym rogu - `position: 'absolute'`, `bottom: 20`, `right: 20`, `width: 56`, `height: 56`, `borderRadius: 28`, tło `#61DAFB`, ikona `camera-outline`
- FAB otwiera `Alert` z opcjami: Galeria, Kamera, Anuluj
- Tło: `Colors.background` (dark theme)

### Podgląd pełnoekranowy - Modal

- Kliknięcie zdjęcia w gridzie otwiera `<Modal>` z:
  - Czarne tło, `animationType="fade"`
  - `<Image>` z `resizeMode="contain"` na pełnym ekranie
  - Przycisk zamknięcia (X) - `position: 'absolute'`, `top: 50`, `right: 20`
  - Przycisk usunięcia (kosz) - `position: 'absolute'`, `bottom: 50`, `left: 20`
  - Usunięcie wymaga potwierdzenia `Alert.alert` → `FileSystem.deleteAsync(uri)` → aktualizacja stanu

### Zapis zdjęć

- Każde zdjęcie kopiowane do `FileSystem.documentDirectory + 'trips/{tripId}/'`
- Folder per podróż (nie jeden wspólny)
- Po usunięciu - `FileSystem.deleteAsync()` kasuje plik z dysku

---

## Kroki

### Krok 0 - Instalacja

Zainstaluj wymagane pakiety:

```bash
npx expo install expo-image-picker expo-file-system
```

### Krok 1 - Rozszerzenie typu TripData

W `types/trip.ts` dodaj dwa nowe opcjonalne pola do interfejsu `TripData`:

- `imageUri?: string` - główne zdjęcie podróży
- `galleryUris?: string[]` - tablica dodatkowych zdjęć

Oba pola opcjonalne (`?`) - istniejące podróże bez zdjęć dalej działają.

### Krok 2 - Utility: zarządzanie plikami

Utwórz plik `utils/imageStorage.ts` z trzema funkcjami:

- `ensureTripFolder(tripId: string): Promise<string>` - tworzy `documentDirectory/trips/{tripId}/` jeśli nie istnieje, zwraca ścieżkę. Użyj `FileSystem.getInfoAsync` + `FileSystem.makeDirectoryAsync`.
- `saveImageToTrip(uri: string, tripId: string): Promise<string>` - kopiuje plik z cache do folderu tripa (`FileSystem.copyAsync`), zwraca nowe URI.
- `deleteImage(uri: string): Promise<void>` - usuwa plik z dysku (`FileSystem.deleteAsync`).

### Krok 3 - pickImage i takePhoto

W `AddTripForm.tsx`:

- Dodaj state: `const [imageUri, setImageUri] = useState<string>()`
- Napisz funkcję `pickImage` - wywołuje `ImagePicker.launchImageLibraryAsync` z opcjami `mediaTypes: ['images']`, `allowsEditing: true`, `aspect: [16, 9]`, `quality: 0.8`. Jeśli nie anulowano — kopiuje zdjęcie przez `saveImageToTrip` i zapisuje URI do state.
- Napisz funkcję `takePhoto` - najpierw `ImagePicker.requestCameraPermissionsAsync()`. Jeśli `status !== 'granted'` → `Alert` i return. W przeciwnym razie `launchCameraAsync`, kopiowanie i zapis jak wyżej.
- Dodaj `handleAddPhoto` - `Alert.alert` z trzema przyciskami: Galeria (`pickImage`), Kamera (`takePhoto`), Anuluj.

### Krok 4 - Podgląd zdjęcia w formularzu

W renderze `AddTripForm.tsx`:

- Jeśli `imageUri` istnieje: `<Image source={{ uri: imageUri }}` ze stylem `preview` (width 100%, height 200, borderRadius 8) + `<Pressable>` "Zmień zdjęcie" (wywołuje `handleAddPhoto`)
- Jeśli brak: `<Pressable>` z dashed border, ikoną `camera-outline` i tekstem "Dodaj zdjęcie" (wywołuje `handleAddPhoto`)
- Przy tworzeniu podróży (submit) przekaż `imageUri` w obiekcie `TripData`

### Krok 5 - Zdjęcie w TripCard

W `components/TripCard.tsx`:

- Importuj `Image` z `react-native`
- W renderze, przed treścią karty: `{trip.imageUri && <Image source={{ uri: trip.imageUri }} style={styles.cardImage} />}`
- Styl `cardImage`: `width: '100%'`, `height: 180`, `borderTopLeftRadius: 12`, `borderTopRightRadius: 12`

### Krok 6 - Hero image w TripDetail

W `app/trip/[id].tsx`:

- Jeśli `trip.imageUri` istnieje: `<Image>` ze stylem `heroImage` (width 100%, height 250)
- Jeśli brak: `<View style={styles.placeholder}>` z ikoną `image-outline` (size 64, color `#4A6FA5`) i tekstem "Brak zdjęcia"
- Pod spodem: `<Link href={'/trip/gallery/${trip.id}'}` z tekstem "Galeria (N)" i ikoną `images-outline`

### Krok 7 - Ekran galerii

Utwórz `app/trip/gallery/[id].tsx`:

- Odczytaj `id` z `useLocalSearchParams`
- Znajdź trip po id (z kontekstu lub hardcoded danych)
- `FlatList` z `numColumns={3}` - każdy item to `<Pressable>` z kwadratowym `<Image>`
- Szerokość itemu: `(Dimensions.get('window').width - 16) / 3` (4px gap × 4)
- Pusty stan gdy brak zdjęć: ikona + tekst

### Krok 8 - FAB + dodawanie zdjęć do galerii

- Dodaj okrągły przycisk FAB (position absolute, bottom 20, right 20)
- `onPress` → `Alert` z Galeria/Kamera/Anuluj
- Po wybraniu zdjęcia: `saveImageToTrip(uri, tripId)` → dodaj URI do `galleryUris` w stanie
- Grid odświeża się automatycznie

### Krok 9 - Modal pełnoekranowy z usuwaniem

- Kliknięcie zdjęcia w gridzie ustawia state `selectedUri`
- `<Modal visible={!!selectedUri}>` z czarnym tłem
- `<Image>` z `resizeMode="contain"` na pełnym ekranie
- Przycisk X (zamknięcie) - prawy górny róg
- Przycisk kosza - lewy dolny róg → `Alert.alert` potwierdzenie → `deleteImage(uri)` → aktualizacja `galleryUris` w stanie → zamknięcie modala

### Krok 10 - Badge w TripCard

Jeśli `trip.galleryUris && trip.galleryUris.length > 0`, pokaż w rogu karty małą ikonę `images` + liczbę (np. "3").

---

### Krok 11 - Swipe do zamknięcia modala

Dodaj `PanResponder` lub `react-native-gesture-handler` - swipe w dół zamyka modal podglądu.

### Krok 12 - Zmiana głównego zdjęcia

W modalu dodaj przycisk "Ustaw jako główne". Po kliknięciu: `trip.imageUri` = wybrane URI z galerii. To zdjęcie pojawia się jako hero w TripCard i TripDetail.

### Krok 13 - Animowany FAB

Dodaj `Animated.Value` do FAB: scrollowanie w dół chowa przycisk (translateY), scrollowanie w górę pokazuje. Użyj `onScroll` z FlatList.

---

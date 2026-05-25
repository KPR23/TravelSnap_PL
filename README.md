# Zadanie 11 - Mapy i lokalizacja

## Cel

Dodaj do TravelSnap nowy tab **Map** z pełnoekranową mapą, na której wyświetlisz pinezki (markery) dla każdego wyjazdu posiadającego współrzędne. Użytkownik może kliknąć marker, zobaczyć callout z miniaturą i tytułem, a następnie przejść do szczegółów wyjazdu. Mapa automatycznie dopasowuje widok do wszystkich markerów.

---

## Krok 0 - Setup

**Cel:** Zainstaluj zależności i skonfiguruj Google Maps API key.

```bash
npx expo install expo-location react-native-maps
```

**Wymagania:**

1. Zainstaluj oba pakiety jednym poleceniem.
2. Dla Androida: dodaj Google Maps API key w `app.json` (lub `app.config.ts`):
   ```json
   {
   	"expo": {
   		"android": {
   			"config": {
   				"googleMaps": {
   					"apiKey": "TWOJ_GOOGLE_MAPS_API_KEY"
   				}
   			}
   		}
   	}
   }
   ```
3. Dla iOS: Apple Maps działa bez klucza - nie musisz nic konfigurować.
4. Po instalacji przebuduj aplikację: `npx expo run:android` lub `npx expo run:ios` (react-native-maps nie działa w Expo Go na Androidzie z Google provider).

**⚠ Pułapka:** Google Maps API key musi być na start **unrestricted**. Restricted key = pusta mapa bez żadnego błędu w konsoli. Ogranicz klucz dopiero po potwierdzeniu, że mapa się renderuje.

---

## Krok 1 - Custom hook `useLocation`

**Cel:** Stwórz reużywalny hook do pobierania bieżącej lokalizacji użytkownika.

**Plik:** `hooks/useLocation.ts`

**Sygnatura:**

```ts
import { LocationObject } from "expo-location";

interface UseLocationResult {
	location: LocationObject | null;
	error: string | null;
	loading: boolean;
}

export function useLocation(): UseLocationResult;
```

**Wymagania:**

1. Przy montowaniu komponentu wywołaj `Location.requestForegroundPermissionsAsync()`.
2. Jeśli `status !== 'granted'` - ustaw `error` na komunikat opisujący brak uprawnień (np. `"Brak uprawnień do lokalizacji"`), ustaw `loading` na `false`.
3. Jeśli uprawnienie udzielone - wywołaj `Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })`.
4. Zapisz wynik w `location`, ustaw `loading` na `false`.
5. Obsłuż błędy `try/catch` - przy wyjątku ustaw `error` na `e.message`.
6. Cała logika w `useEffect` z pustą tablicą zależności `[]`.
7. Return `{ location, error, loading }`.

**⚠ Pułapka:** Na emulatorze Android musisz ręcznie ustawić lokalizację: Extended Controls (…) → Location → wpisz współrzędne. Na iOS Simulator: Debug → Location → Custom Location. Bez tego `getCurrentPositionAsync` może wisieć w nieskończoność.

---

## Krok 2 - Nowy tab "Map" z `<MapView>`

**Cel:** Dodaj trzeci (lub czwarty) tab z pełnoekranową mapą.

**Pliki:** `app/(tabs)/map.tsx`, `app/(tabs)/_layout.tsx`

**Wymagania:**

1. W `_layout.tsx` dodaj nowy `<Tabs.Screen>` z `name="map"`, tytułem "Map" i ikoną mapy (np. `map` z Ionicons lub `map-pin`).
2. W `map.tsx` użyj hooka `useLocation()` z kroku 1.
3. Renderuj `<MapView>` z `react-native-maps`:
   ```tsx
   import MapView from "react-native-maps";
   ```
4. `MapView` musi mieć `style={{ flex: 1 }}` - **rodzic musi też mieć `flex: 1`**, inaczej mapa ma 0 wysokości i jest niewidoczna.
5. Ustaw `initialRegion`:
   - Jeśli `location` dostępny - użyj `location.coords.latitude` / `longitude` z deltą `0.1`.
   - Jeśli brak - domyślna Warszawa: `{ latitude: 52.2297, longitude: 21.0122, latitudeDelta: 0.1, longitudeDelta: 0.1 }`.
6. Gdy `loading === true` - pokaż spinner (`<ActivityIndicator>`).
7. Gdy `error` - pokaż `<ErrorView>` z opisem błędu i przyciskiem "Otwórz ustawienia" wywołującym `Linking.openSettings()`.

**⚠ Pułapka:** `MapView` z `style={{ flex: 1 }}` w `<View>` bez `flex: 1` = mapa niewidoczna (0px wysokości). Upewnij się, że cały łańcuch rodziców ma `flex: 1`.

---

## Krok 3 - Rozszerzenie `Trip` o `coordinates`

**Cel:** Dodaj opcjonalne pole współrzędnych do modelu danych wyjazdu.

**Pliki:** `types/trip.ts`, `types/tripSchema.ts`

**Wymagania:**

1. W `types/trip.ts` rozszerz interfejs `TripData`:
   ```ts
   coordinates?: {
     latitude: number;
     longitude: number;
   };
   ```
2. W `types/tripSchema.ts` dodaj opcjonalne pole do Zod schema:
   ```ts
   coordinates: z.object({
     latitude: z.number(),
     longitude: z.number(),
   }).optional(),
   ```
3. Do testów ręcznie dodaj współrzędne do 2–3 istniejących wyjazdów w danych testowych lub w `TripContext` (np. Paryż: `48.8566, 2.3522`, Tokio: `35.6762, 139.6503`, Rzym: `41.9028, 12.4964`).
4. Pole `coordinates` jest opcjonalne — nie każdy wyjazd musi je mieć.

**⚠ Pułapka:** Jeśli używasz AsyncStorage do persystencji wyjazdów, stare dane nie będą miały pola `coordinates`. Twój kod musi to obsługiwać - zawsze filtruj `.filter(t => t.coordinates)` przed mapowaniem na markery.

---

## Krok 4 - Markery wyjazdów na mapie

**Cel:** Wyświetl pinezki na mapie dla każdego wyjazdu z ustawionymi współrzędnymi.

**Plik:** `app/(tabs)/map.tsx`

**Wymagania:**

1. Pobierz listę wyjazdów z `TripContext` (`useTrips()`).
2. Przefiltruj wyjazdy posiadające `coordinates`:
   ```tsx
   const tripsWithCoords = useMemo(
   	() => trips.filter((t) => t.coordinates),
   	[trips],
   );
   ```
3. Renderuj `<Marker>` dla każdego wyjazdu:
   ```tsx
   {
   	tripsWithCoords.map((trip) => (
   		<Marker
   			key={trip.id}
   			coordinate={trip.coordinates!}
   			title={trip.title}
   			description={trip.destination}
   		/>
   	));
   }
   ```
4. Każdy marker wyświetla domyślną pinezkę z `title` i `description` widocznymi po tapnięciu.
5. Użyj `useMemo` na filtrowanej liście, żeby uniknąć zbędnych rekalkulacji.

**⚠ Pułapka:** Nie zapomnij o `key={trip.id}` na `<Marker>`. Bez unikalnego klucza React nie potrafi efektywnie aktualizować markerów i możesz zobaczyć ghost-markery po usunięciu wyjazdu.

---

## Krok 5 - Custom Callout z miniaturą

**Cel:** Po kliknięciu markera pokaż callout z miniaturą zdjęcia, tytułem i destynacją. Kliknięcie callout nawiguje do szczegółów wyjazdu.

**Plik:** `app/(tabs)/map.tsx`

**Wymagania:**

1. Import `Callout` z `react-native-maps`:
   ```tsx
   import MapView, { Marker, Callout } from "react-native-maps";
   ```
2. Wewnątrz każdego `<Marker>` dodaj `<Callout>`:
   ```tsx
   <Marker key={trip.id} coordinate={trip.coordinates!}>
   	<Callout onPress={() => router.push(`/trip/${trip.id}`)}>
   		<View style={styles.calloutContainer}>
   			<Image source={{ uri: trip.imageUri }} style={styles.calloutImage} />
   			<View style={styles.calloutText}>
   				<Text style={styles.calloutTitle}>{trip.title}</Text>
   				<Text style={styles.calloutDestination}>{trip.destination}</Text>
   			</View>
   		</View>
   	</Callout>
   </Marker>
   ```
3. Miniatura: 60×60 px, `borderRadius: 8`.
4. Callout container: `flexDirection: 'row'`, `alignItems: 'center'`, `gap: 8`, max width ~200 px.
5. `onPress` na `<Callout>` nawiguje do `trip/[id].tsx` za pomocą `router.push()`.

**⚠ Pułapka:** Na Androidzie `Callout` **nie obsługuje** interaktywnych komponentów wewnątrz (np. `TouchableOpacity`, `Pressable`). Jedyny sposób na obsłużenie tapnięcia to `onPress` bezpośrednio na `<Callout>` lub `onCalloutPress` na `<Marker>`. Nie próbuj umieszczać przycisków wewnątrz callout — nie zadziałają.

---

## Krok 6 - `fitToCoordinates`

**Cel:** Po załadowaniu wyjazdów automatycznie dopasuj widok mapy, żeby wszystkie markery były widoczne.

**Plik:** `app/(tabs)/map.tsx`

**Wymagania:**

1. Stwórz ref do mapy:
   ```tsx
   const mapRef = useRef<MapView>(null);
   ```
2. Przekaż ref do `<MapView ref={mapRef}>`.
3. Dodaj `useEffect` reagujący na zmiany listy wyjazdów:
   ```tsx
   useEffect(() => {
   	const coords = tripsWithCoords.map((t) => t.coordinates!);
   	if (coords.length > 0 && mapRef.current) {
   		mapRef.current.fitToCoordinates(coords, {
   			edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
   			animated: true,
   		});
   	}
   }, [tripsWithCoords]);
   ```
4. **Warunek `coords.length > 0` jest obowiązkowy** - `fitToCoordinates` z pustą tablicą powoduje crash.
5. Padding 50 px na każdą krawędź - markery przy krawędzi ekranu są trudne do tapnięcia.

**⚠ Pułapka:** `fitToCoordinates` z **jednym** markerem zoomuje do maksymalnego zoomu (ulica jest widoczna, ale brak kontekstu). Rozwiązanie STRETCH: gdy `coords.length === 1`, ustaw region ręcznie z minimalną deltą (`latitudeDelta: 0.05`).

---

## Krok 7 - Geocoding

**Cel:** Automatycznie pobierz współrzędne z nazwy destynacji przy dodawaniu wyjazdu.

**Plik:** `components/AddTripForm.tsx`

**Wymagania:**

1. Po wypełnieniu pola `destination` w formularzu wywołaj `Location.geocodeAsync(destination)`.
2. `geocodeAsync` zwraca tablicę `{ latitude, longitude }[]` - weź pierwszy wynik.
3. Jeśli geocoding zwróci wyniki - zapisz `coordinates` do obiektu Trip.
4. Jeśli geocoding nie znajdzie wyniku - nie blokuj zapisania wyjazdu, po prostu nie ustawiaj `coordinates`.
5. Dodaj obsługę `try/catch` - geocoding wymaga połączenia z internetem.

**⚠ Pułapka:** `Location.geocodeAsync` używa natywnego geocodera (Apple/Google) - nie zadziała offline. Nie wyświetlaj błędu użytkownikowi, gdy geocoding się nie uda - wyjazd i tak powinien się zapisać.

---

## Krok 8 - Custom marker ico

**Cel:** Zamiast domyślnej pinezki wyświetl okrągłą miniaturę zdjęcia wyjazdu jako ikonę markera.

**Plik:** `app/(tabs)/map.tsx`

**Wymagania:**

1. Zamiast domyślnego pina renderuj custom `<View>` wewnątrz `<Marker>`:
   ```tsx
   <Marker key={trip.id} coordinate={trip.coordinates!}>
   	<View style={styles.customMarker}>
   		<Image source={{ uri: trip.imageUri }} style={styles.markerImage} />
   	</View>
   	<Callout onPress={() => router.push(`/trip/${trip.id}`)}>
   		{/* ... */}
   	</Callout>
   </Marker>
   ```
2. Miniatura: 40×40 px, `borderRadius: 20` (kółko), `borderWidth: 2`, `borderColor: Colors.accent`.
3. **Ustaw `tracksViewChanges={false}`** na `<Marker>` - bez tego mapa re-renderuje marker co klatkę, co przy 10+ markerach powoduje spadek FPS.

**⚠ Pułapka:** `tracksViewChanges={false}` oznacza, że zmiana `imageUri` nie zaktualizuje ikony markera. Jeśli obraz wyjazdu się zmieni, musisz tymczasowo ustawić `tracksViewChanges={true}` i wrócić do `false` po załadowaniu obrazu.

---

## Krok 9 - Dark mode map

**Cel:** Dodaj ciemny styl mapy i przełącznik w UI.

**Plik:** `app/(tabs)/map.tsx`

**Wymagania:**

1. Pobierz JSON ze stylem dark mode z https://mapstyle.withgoogle.com/ lub https://snazzymaps.com/.
2. Zapisz JSON w `constants/mapStyle.ts` (export const `darkMapStyle`).
3. Przekaż do `<MapView customMapStyle={isDark ? darkMapStyle : undefined}>`.
4. Dodaj przełącznik (np. `Switch` lub ikonę) w prawym górnym rogu mapy do zmiany stylu.
5. Uwaga: `customMapStyle` działa **tylko z Google Maps provider** (Android). Na iOS z Apple Maps ten prop jest ignorowany - użyj `mapType` lub `userInterfaceStyle="dark"` (iOS 13+).

**⚠ Pułapka:** Styl JSON z serwisów zewnętrznych musi być tablicą obiektów `{ featureType, elementType, stylers }`. Upewnij się, że format jest poprawny - zły format = mapa bez stylu (brak błędu).

---

## Krok 10 - Marker clustering

**Cel:** Przy dużej liczbie markerów grupuj bliskie markery w klastry.

**Wymagania:**

1. Zainstaluj `react-native-map-clustering`:
   ```bash
   npm install react-native-map-clustering
   ```
2. Zamień `<MapView>` na `<ClusteredMapView>` (lub wrappe `MapView` z biblioteki):
   ```tsx
   import MapView from "react-native-map-clustering";
   ```
3. Klaster wyświetla liczbę zgrupowanych markerów.
4. Tapnięcie klastra zoomuje do regionu obejmującego zgrupowane markery.
5. Dodaj 10+ wyjazdów z różnymi współrzędnymi, żeby przetestować clustering.

**⚠ Pułapka:** `react-native-map-clustering` opakowuje `MapView` - jeśli importujesz `MapView` z tego pakietu, nie importuj go jednocześnie z `react-native-maps` w tym samym pliku. `Marker` i `Callout` nadal importujesz z `react-native-maps`.

---

## Krok 11 - Reverse geocoding na trip detail

**Cel:** Na ekranie szczegółów wyjazdu pokaż pełny adres obok nazwy destynacji.

**Plik:** `app/trip/[id].tsx`

**Wymagania:**

1. Jeśli wyjazd ma `coordinates`, wywołaj `Location.reverseGeocodeAsync(coordinates)` przy montowaniu.
2. `reverseGeocodeAsync` zwraca tablicę obiektów z polami: `street`, `city`, `region`, `country`, `postalCode`.
3. Sformatuj adres i wyświetl go pod nazwą destynacji (np. "Champs-Élysées, Paris, France").
4. Pokaż spinner podczas ładowania adresu.
5. Jeśli reverse geocoding się nie uda - pokaż tylko nazwę destynacji (bez błędu).

**⚠ Pułapka:** `reverseGeocodeAsync` może zwrócić `null` w niektórych polach (np. `street` dla lokalizacji w terenie). Sprawdzaj każde pole przed użyciem i łącz tylko niepuste wartości.

---

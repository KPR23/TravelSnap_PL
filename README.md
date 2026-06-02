# Zadanie 10 - Wydajność i obrazy

## Cel

Zoptymalizujesz TravelSnap pod kątem wydajności. Dostroisz FlatList
propami wydajnościowymi, dodasz memoizację tam gdzie ma sens,
i wymienisz domyślny komponent `Image` z React Native
na `expo-image` z cache, transitions i blurhash placeholderami.

---

## Krok 0 - Setup

Zainstaluj `expo-image`:

```bash
npx expo install expo-image
```

Po instalacji sprawdź, że `expo-image` pojawia się w `package.json` w `dependencies`.

---

## Krok 1 - FlatList tuning w `app/(tabs)/index.tsx`

**Cel:** Wyeliminować niepotrzebne pomiary elementów listy i ograniczyć liczbę renderowanych kart.

W pliku `app/(tabs)/index.tsx` na komponencie `<FlatList>` dodaj:

```tsx
const CARD_HEIGHT = 120;

<FlatList
	data={trips}
	keyExtractor={(item) => item.id}
	getItemLayout={(_, index) => ({
		length: CARD_HEIGHT,
		offset: CARD_HEIGHT * index,
		index,
	})}
	initialNumToRender={10}
	windowSize={5}
	renderItem={({ item }) => <TripCard trip={item} onPress={handleTripPress} />}
/>;
```

### Wymagania

1. `keyExtractor` zwraca `item.id` (string).
2. `getItemLayout` opiera się na stałej `CARD_HEIGHT` — zmierz rzeczywistą wysokość karty i dostosuj wartość.
3. `initialNumToRender={10}` — renderuj 10 kart na start (a nie całą listę).
4. `windowSize={5}` — renderuj 5 ekranów-worth elementów (2 przed, bieżący, 2 po).

> **Pułapka:** `getItemLayout` działa poprawnie tylko gdy wszystkie elementy mają identyczną wysokość. Jeśli twoje `TripCard` zawijają tytuł na dwie linie, zmierz maksymalną wysokość i użyj jej, albo zrezygnuj z `getItemLayout`.

---

## Krok 2 - `React.memo` na `TripCard`

**Cel:** Zapobiec re-renderowi kart, których propsy się nie zmieniły.

### 2a. Wrap `TripCard` w `React.memo`

W `components/TripCard.tsx`:

```tsx
import React from "react";

interface TripCardProps {
	trip: Trip;
	onPress: (id: string) => void;
}

export const TripCard = React.memo(function TripCard({
	trip,
	onPress,
}: TripCardProps) {
	// ...istniejący kod komponentu
});
```

### 2b. Stabilizuj handlery w rodzicu

W `app/(tabs)/index.tsx`:

```tsx
import { useCallback } from "react";

const handleTripPress = useCallback(
	(id: string) => {
		router.push(`/trip/${id}`);
	},
	[router],
);
```

### Wymagania

1. `TripCard` jest eksportowane jako `React.memo(function TripCard(...))`.
2. Handler `onPress` w rodzicu jest owrapowany w `useCallback` — bez tego `React.memo` nie ma efektu (każdy render rodzica tworzy nową referencję funkcji).
3. Zweryfikuj w React DevTools Profiler, że `TripCard` nie re-renderuje się, gdy zmienia się stan niezwiązany z danym wyjazdem.

> **Pułapka:** `React.memo` porównuje propsy płytko (shallow equality). Jeśli przekazujesz do `TripCard` obiekt tworzony inline (np. `style={{ margin: 10 }}`), memo i tak będzie re-renderować — przenieś styl do `StyleSheet.create`.

---

## Krok 3 - Migracja na `expo-image`

**Cel:** Zastąpić domyślny `Image` z React Native wydajniejszym `expo-image` z cache i transitions.

### 3a. `TripCard.tsx`

```tsx
// PRZED:
import { Image } from "react-native";
<Image source={{ uri: trip.imageUrl }} resizeMode="cover" />;

// PO:
import { Image } from "expo-image";
<Image
	source={{ uri: trip.imageUrl }}
	contentFit="cover"
	cachePolicy="memory-disk"
	transition={200}
	style={styles.image}
/>;
```

### 3b. `DestinationCard.tsx` i `CountryCard.tsx`

Analogicznie - zmień import i zamień `resizeMode` na `contentFit`.

### 3c. Hero image w `app/trip/[id].tsx`

```tsx
import { Image } from "expo-image";

<Image
	source={{ uri: trip.imageUrl }}
	contentFit="cover"
	cachePolicy="memory-disk"
	transition={300}
	style={styles.heroImage}
/>;
```

### Wymagania

1. Wszystkie 4 pliki: zamień import na `expo-image`.
2. Zamień `resizeMode` → `contentFit` (wartości te same: `"cover"`, `"contain"`).
3. Dodaj `cachePolicy="memory-disk"` i `transition={200}` (lub 300 dla hero).

> **Pułapka:** `expo-image` nie ma `defaultSource`. Jeśli korzystałeś z `defaultSource` w React Native, zamień na `placeholder={{ uri: localAsset }}` lub `placeholder={{ blurhash: '...' }}`.

---

## Krok 4 - Blurhash placeholder na hero image

**Cel:** Dodać elegancki gradient placeholder zamiast pustego miejsca podczas ładowania hero image.

W `app/trip/[id].tsx`:

```tsx
<Image
	source={{ uri: trip.imageUrl }}
	placeholder={{ blurhash: "LGF5]+Yk^6#M@-5c,1J5@[or[Q6." }}
	contentFit="cover"
	cachePolicy="memory-disk"
	transition={300}
	style={styles.heroImage}
/>
```

### Wymagania

1. Dodaj prop `placeholder` z obiektem `{ blurhash: '...' }`.
2. Wygeneruj swój blurhash na https://blurha.sh lub użyj przykładowego stringa.
3. Sprawdź, że przed załadowaniem obrazu widać kolorowy gradient, a po załadowaniu — płynne przejście (transition).

> **Pułapka:** Blurhash to string ~20–30 znaków — nie wymaga fetcha, jest wkompilowany w JS bundle. Nie generuj go dynamicznie — podaj statycznie w kodzie.

---

## Krok 5 - `useMemo` na sortowaniu listy

**Cel:** Memoizować kosztowne obliczenie, które nie powinno się powtarzać przy każdym re-renderze.

W `app/(tabs)/index.tsx`:

```tsx
import { useMemo } from "react";

const sortedTrips = useMemo(() => {
	return [...trips].sort((a, b) => b.rating - a.rating);
}, [trips]);
```

### Wymagania

1. Użyj `useMemo` do memoizacji sortowanej/filtrowanej listy.
2. Dep array zawiera `[trips]` — przelicza się tylko gdy zmieni się tablica wyjazdów.
3. Przekaż `sortedTrips` (nie `trips`) do `<FlatList data={...}>`.

> **Pułapka:** Nie opakowuj w `useMemo` prostych operacji jak `trips.length` czy `x + 1`. Hook ma narzut (alokacja closure, dep-check, GC) — dla taniej operacji kosztuje więcej niż zysk.

---

## Krok 6 - Dodatkowe propsy FlatList

**Cel:** Dostrój `removeClippedSubviews` i `maxToRenderPerBatch` dla lepszego RAM i fill-rate.

```tsx
<FlatList
	data={sortedTrips}
	keyExtractor={(item) => item.id}
	getItemLayout={(_, index) => ({
		length: CARD_HEIGHT,
		offset: CARD_HEIGHT * index,
		index,
	})}
	initialNumToRender={10}
	maxToRenderPerBatch={8}
	windowSize={5}
	removeClippedSubviews={true}
	renderItem={({ item }) => <TripCard trip={item} onPress={handleTripPress} />}
/>
```

### Wymagania

1. `removeClippedSubviews={true}` — odmontowuje elementy poza viewport.
2. `maxToRenderPerBatch={8}` — renderuj 8 elementów per batch przy scrollowaniu.
3. Przetestuj na fizycznym urządzeniu (emulator nie oddaje prawdziwej wydajności).

> **Pułapka:** `removeClippedSubviews` na iOS może powodować artefakty wizualne. Jeśli zauważysz problemy — wyłącz na iOS: `removeClippedSubviews={Platform.OS === 'android'}`.

---

## Krok 7 - Pagination listy

**Cel:** Zasymulować dociąganie danych przy scrollowaniu.

1. Stwórz `utils/dummyTrips.ts` — funkcja generująca 200 dummy trips.
2. Trzymaj w stanie `visibleTrips` — pierwsze 20.
3. Dodaj do `FlatList`:

```tsx
onEndReached={loadMore}
onEndReachedThreshold={0.5}
ListFooterComponent={isLoadingMore ? <ActivityIndicator /> : null}
```

4. `loadMore` dokłada kolejne 20 elementów z opóźnieniem 500ms (`setTimeout`).

> **Pułapka:** `onEndReached` może wystrzelić wielokrotnie — użyj flagi `isLoadingMore` żeby zignorować kolejne wywołania podczas ładowania.

---

## Krok 8 - Sesja profilowania z React DevTools

**Cel:** Zmierzyć faktyczny efekt optymalizacji.

1. Otwórz React DevTools → zakładka Profiler.
2. Nagraj sesję: otwórz listę, przewiń 3 razy, wróć.
3. Sprawdź: ile razy re-renderowały się `TripCard`, czas renderowania listy, czy `useMemo` zapobiega przeliczaniu.

> **Pułapka:** Profiler w dev mode jest wolniejszy niż produkcyjny build. Liczy się różnica relatywna (przed vs po), nie absolutne milisekundy.

---

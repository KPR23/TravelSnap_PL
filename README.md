# Zajęcia 4 — Zadanie praktyczne

<<<<<<< HEAD
## Od prototypu do prawdziwej apki

Po tym zadaniu TravelSnap wygląda jak prawdziwa aplikacja - z brandingiem, spójnym designem i przemyślanym layoutem.

---

## Krok 0: Paleta kolorów (`constants/Colors.ts`)

Zanim zaczniesz kodować - stwórz plik ze stałymi kolorami. **Nigdy nie hardcoduj kolorów bezpośrednio w StyleSheet.**

```ts
// constants/Colors.ts
export const Colors = {
  background:    '#0F1A2E',  // tło ekranu — ciemny granat
  card:          '#1A2742',  // tło kart — jaśniejszy granat
  accent:        '#E94560',  // akcent — czerwony/różowy
  primary:       '#61DAFB',  // React Blue — linki, daty
  textPrimary:   '#FFFFFF',  // główny tekst — biały
  textSecondary: '#8B95A5',  // drugorzędny tekst — szary
  inputBg:       '#243352',  // tło inputów w formularzu
  inputBorder:   '#2E4066',  // obramowanie inputów
  border:        '#2E3A50',  // subtelne linie oddzielające
} as const;
```

Importuj ten plik w każdym komponencie zamiast wpisywać kolory ręcznie.

---

## Krok 1: `ScreenHeader`

Stwórz nowy komponent `components/ScreenHeader.tsx`.

**Co ma wyświetlać:**
- Po lewej: **„TravelSnap"** (duży, bold, biały) + pod spodem **„Twój dziennik podróży"** (mały, `textSecondary`)
- Po prawej: kółko z liczbą podróży (np. „3") - tło `accent`, biały tekst, okrągłe

**Wymagania techniczne:**
- Tło: `Colors.background`
- Layout: `flexDirection: 'row'`, `justifyContent: 'space-between'`, `alignItems: 'center'`
- Padding: 20 góra, 16 boki, 12 dół
- Kółko z liczbą: `width: 36`, `height: 36`, `borderRadius: 18`

**Props:**

```ts
interface ScreenHeaderProps {
  tripCount: number;
}
```

**Podpowiedź struktury:**

```tsx
<View style={styles.header}>
  <View>                          {/* lewa strona: column */}
    <Text style={styles.appName}>TravelSnap</Text>
    <Text style={styles.subtitle}>Twój dziennik podróży</Text>
  </View>
  <View style={styles.badge}>    {/* prawa strona: kółko */}
    <Text style={styles.badgeText}>{tripCount}</Text>
  </View>
</View>
```

---

## Krok 2: TripCard — dark restyle

Przeróbcie istniejący `TripCard` - **nie piszecie od zera**, modyfikujecie to co macie.

**Design spec:**

| Element | Wartość |
|---------|---------|
| Tło karty | `Colors.card` (`#1A2742`) |
| `borderRadius` | `16` (zmniejszcie z 32) |
| `padding` | `16` |
| `marginBottom` | `12` |
| Cień (iOS) | `shadowColor: '#000'`, `shadowOpacity: 0.2`, `shadowRadius: 8` |
| Cień (Android) | `elevation: 4` |
| Tytuł | biały (`Colors.textPrimary`), `fontSize: 18`, `fontWeight: 'bold'` |
| Meta (destination \| date) | `Colors.textSecondary`, `fontSize: 13`, `marginTop: 4` |
| Przycisk usuwania | tło `accent` z opacity 0.15, `borderRadius: 12`, `padding: 6` |
| Gwiazdki | Ionicons `star` / `star-outline`, kolor `Colors.accent`, `size: 16` |

**Gwiazdki:** zamieńcie emoji (`★`/`☆`) na Ionicons (`import { Ionicons } from '@expo/vector-icons'` - wbudowane w Expo, zero instalacji).

---

## Krok 3: `EmptyState`

Nowy komponent `components/EmptyState.tsx`.

**Kiedy:** wyświetlany w `index.tsx` gdy `trips.length === 0` (zamiast pustej listy).

**Co wyświetla:**
- Duża ikona: Ionicons `airplane-outline`, `size: 64`, kolor `Colors.primary`
- Tekst główny: **„Brak podróży"** — biały, `fontSize: 20`, bold
- Tekst pomocniczy: **„Dodaj swoją pierwszą podróż!"** — `Colors.textSecondary`, `fontSize: 14`

**Layout:**
- `justifyContent: 'center'`, `alignItems: 'center'`
- `gap: 12` między elementami

**Uwaga:** `EmptyState` z `flex: 1` nie zadziała dobrze w `ScrollView`. Użyj jawnej wysokości, np. `height: 300`.

**Props:** brak - to czysty komponent prezentacyjny.

---

## Krok 4: Złóż to w całość (`index.tsx`)

1. Zmień `backgroundColor` kontenera na `Colors.background`
2. Dodaj `<ScreenHeader tripCount={trips.length} />` na górze
3. Usuń stary `<Text>Total trips: ...</Text>`
4. Gdy `trips.length === 0` — pokaż `<EmptyState />`
5. Gdy `trips.length > 0` — pokaż listę kart jak dotychczas

**Oczekiwana struktura:**

```tsx
<ScrollView
  style={{ flex: 1, backgroundColor: Colors.background }}
  contentContainerStyle={{ padding: 16 }}
>
  <ScreenHeader tripCount={trips.length} />
  <AddTripForm onAdd={handleAddTrip} />
  {trips.length === 0
    ? <EmptyState />
    : trips.map(trip => (
        <TripCard
          key={trip.id}
          {...trip}
          onDelete={() => handleDeleteTrip(trip.id)}
        />
      ))
  }
</ScrollView>
```

---

## Krok 5: AddTripForm restyle

Dostosujcie formularz do ciemnego theme:
- Tło formularza: `Colors.card`
- Inputy: tło `Colors.inputBg`, border `Colors.inputBorder`, tekst biały, placeholder `Colors.textSecondary`
- Tytuł formularza: biały
- Przycisk: tło `Colors.accent`, biały tekst, `borderRadius: 12`

## Krok 6: TripStats

Nowy komponent pod headerem — pasek z 3 kafelkami w rzędzie:

- **„Podróże"** — `trips.length`
- **„Śr. ocena"** — średnia rating (`.toFixed(1)`)
- **„Kraje"** — unikalne destinations (`new Set(...).size`)

Layout: `flexDirection: 'row'`, każdy kafelek `flex: 1`, tło `Colors.card`, `padding: 12`, `gap: 8`.
Każdy kafelek: liczba (duża, bold, `Colors.primary`) + label pod spodem (mały, `Colors.textSecondary`).

## Krok 7: StatusBar + SafeArea

Dodajcie `StatusBar` z `barStyle="light-content"` i opakujcie ekran w `SafeAreaView`, żeby content nie wchodził pod notch.
=======
**Branch:** `lesson-3`

## 🎯 Zadanie praktyczne: Lekcja 3 — Stan, hooki i interaktywność

### Zadanie podstawowe

1. `HomeScreen` posiada `useState` z pustą tablicą podróży.
2. Formularz z 4 polami: `title`, `destination`, `date`, `rating`.
3. Przycisk „Dodaj" → `handleAddTrip` → nowa karta `TripCard`.
4. Lista podróży renderowana przez `.map()` z użyciem `TripCard`.
5. Każda `TripCard` ma `key={trip.id}`.
6. Ocena: `TextInput` → `Number()` → props (number).
7. Walidacja: puste pola NIE dodają karty.

### Rozszerzenie ★

1. Przycisk usuwania w `TripCard` (props `onDelete`).
2. Walidacja oceny: tylko wartości 1–5.
3. Wyświetlenie liczby podróży nad listą.
4. Walidacja daty: format YYYY-MM.

---

## 🚀 Jak uruchomić ten kod?

Jeśli chcesz zobaczyć gotowe rozwiązanie tej lekcji:

1. Sklonuj repozytorium i przejdź na branch `lesson-3`.
2. Zainstaluj zależności:
   ```bash
   npm install
   ```
3. Uruchom projekt:
   ```bash
   npx expo start
   ```
>>>>>>> lesson-3

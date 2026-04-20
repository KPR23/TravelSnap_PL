# Zadanie 5 - Nawigacja i routing w TravelSnap

## Cel

Zaimplementuj pełną nawigację w aplikacji TravelSnap: dolne zakładki (Tab Navigation), ekran szczegółów podróży (Stack Navigation) oraz nawigację między listą a ekranem szczegółów. Pracujesz według design spec-a - nie przepisuj kodu z tablicy, zaprojektuj rozwiązanie samodzielnie.

---

## Design spec

### Architektura nawigacji

```
app/
  _layout.tsx          ← Root Stack (dark theme header)
  (tabs)/
    _layout.tsx        ← Tab Navigator (3 zakładki)
    index.tsx          ← Home — lista podróży
    explore.tsx        ← Explore — nowy ekran
    profile.tsx        ← Profile — nowy ekran
  trip/
    [id].tsx           ← TripDetail — ekran szczegółów
```

### Tab Bar — wytyczne wizualne

- Tło: `Colors.dark.background` (ciemne)
- Aktywna ikona: `Colors.dark.tint` (React Blue `#61DAFB`)
- Nieaktywna ikona: `#8B95A5`
- Ikony: Ionicons - `home`, `compass-outline`, `person`
- Bez domyślnego headera (`headerShown: false`)
- Bez górnej ramki (`borderTopWidth: 0`)

### Ekran Explore

- Ciemne tło, tekst wycentrowany
- Tytuł: "Discover new places" (styl `ScreenHeader`)
- Podtytuł: "Coming soon..." w szarym kolorze
- Ikona kompasu (Ionicons `compass`, rozmiar 64, kolor React Blue)

### Ekran Profile

- Ciemne tło
- Awatar: kolorowe kółko z inicjałami (View + Text, bez obrazka)
- Nazwa: Twoje imię, styl bold 22px
- Pod spodem: "Joined March 2026" w szarym
- Sekcja "Stats": 3 karty w rzędzie (Trips: liczba z listy, Countries: hardcoded, Rating: avg z listy)

### Ekran TripDetail (`app/trip/[id].tsx`)

- Header Stack: tytuł = nazwa podróży (dynamicznie z params)
- `headerStyle.backgroundColor`: `Colors.dark.background`
- `headerTintColor`: `Colors.dark.tint`
- Layout ekranu:
  - Górna sekcja: duży tytuł (24px bold), destynacja z ikoną `location` (16px szary)
  - Data podróży z ikoną `calendar` (14px szary)
  - Komponent `RatingStars` z oceną
  - Przycisk "Powrót do listy" - `Pressable` z `router.back()`
  - Styl przycisku: tło React Blue, borderRadius 8, padding 12

### Nawigacja Home → TripDetail

- `TripCard` opakowany w `<Link>` z `expo-router`
- `href` przekazuje: `pathname: '/trip/[id]'`, `params: { id, title, destination, date, rating }`
- Link nie dodaje własnych styli (użyj `asChild` jeśli potrzebne)

---

## Kroki

### Krok 0 - Przygotowanie brancha

```bash
git checkout lesson-5
```

### Krok 1 - Root Stack Layout

Utwórz / zmodyfikuj `app/_layout.tsx`:

- Importuj `Stack` z `expo-router`
- Ustaw `screenOptions` z ciemnym tłem headera i jasnym kolorem tekstu
- Zdefiniuj `Stack.Screen` dla `(tabs)` z `headerShown: false`
- Zdefiniuj `Stack.Screen` dla `trip/[id]` z tytułem "Trip Details"

### Krok 2 - Tab Navigator

Zmodyfikuj `app/(tabs)/_layout.tsx`:

- Importuj `Tabs` z `expo-router` i `Ionicons`
- W `screenOptions` ustaw kolory tab bara i ukryj header
- Zdefiniuj 3 zakładki: `index` (Home), `explore` (Explore), `profile` (Profile)
- Każda zakładka ma swoją ikonę Ionicons i tytuł
- `tabBarStyle` z ciemnym tłem i `borderTopWidth: 0`

### Krok 3 - Ekran Explore

Utwórz `app/(tabs)/explore.tsx`:

- Komponent z ciemnym tłem (flex: 1)
- Ikona kompasu wycentrowana
- Tytuł i podtytuł wg design spec-a

### Krok 4 - Ekran Profile

Utwórz `app/(tabs)/profile.tsx`:

- Awatar z inicjałami (View z borderRadius: 9999)
- Imię, data dołączenia
- Sekcja stats: 3 karty w `flexDirection: 'row'`
- Każda karta: wartość (bold, duża) + etykieta (szara, mała)

### Krok 5 - Ekran TripDetail

Utwórz `app/trip/[id].tsx`:

- `useLocalSearchParams` - odczytaj `id`, `title`, `destination`, `date`, `rating`
- `Stack.Screen options` - ustaw tytuł dynamicznie z `title`
- Wyświetl: tytuł, destynacja z ikoną, data z ikoną, RatingStars
- Przycisk "Powrót do listy" z `useRouter().back()`
- Styl wg design spec-a

### Krok 6 - Podłącz nawigację z Home

W `app/(tabs)/index.tsx`:

- Importuj `Link` z `expo-router`
- Opakuj każdy `TripCard` w `<Link>`
- Przekaż `href={{ pathname: '/trip/[id]', params: { ... } }}`
- Sprawdź, czy kliknięcie karty otwiera TripDetail

### Krok 7 - Testowanie

- Tab bar wyświetla 3 zakładki z ikonami
- Kliknięcie zakładki przełącza ekran bez utraty stanu
- Kliknięcie TripCard otwiera ekran TripDetail z animacją slide-in
- Dane podróży wyświetlają się poprawnie na TripDetail
- Przycisk "Powrót" i gest swipe-back działają
- Header TripDetail ma ciemne tło i tytuł podróży

### Krok 8 - Modal "Add Trip"

Dodaj ekran `app/add-trip.tsx`:

- W Root `_layout.tsx` dodaj `Stack.Screen` z `presentation: 'modal'`
- Przenieś `AddTripForm` na ten ekran
- Na Home dodaj `Pressable` / FAB (Floating Action Button) który otwiera modal: `router.push('/add-trip')`
- Po dodaniu podróży — `router.back()` zamyka modal

### Krok 9 - Animacje przejść

W `Stack.Screen` dla `trip/[id]` dodaj:

```tsx
options={{
  animation: 'slide_from_bottom',
  // lub: 'fade', 'slide_from_right', 'flip'
}}
```

Przetestuj różne animacje i wybierz najlepszą dla TravelSnap.

### Krok 10 - Ulubione

Na ekranie TripDetail:

- Dodaj ikonę serduszka w prawym górnym rogu headera (`headerRight`)
- Kliknięcie toggleuje stan `isFavorite` (useState)
- Ikona: `heart` (wypełniony, czerwony) / `heart-outline` (pusty, szary)
- Zapisz ulubione w stanie — bonus: użyj `AsyncStorage`

---

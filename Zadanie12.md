# Zadanie 12 - Animacje i gesty

## Cel

Wzbogacisz aplikacje TravelSnap o plynne animacje i gesty, ktore sprawia, ze interfejs bedzie wyglaldal i zachowywal sie jak natywna aplikacja mobilna. Dodasz animowane wejscia kart, interakcje dotykowe z efektem sprezzyny, swipe-to-delete z gestami, plywajacy przycisk FAB oraz (opcjonalnie) skeleton loading, shared element transitions i parallax header.


---

## Krok 0 - Instalacja i konfiguracja

**Cel:** zainstalowac biblioteki i skonfigurowac srodowisko tak, by shared values dzialaly poprawnie.

**Pliki:** `package.json`, `app/_layout.tsx` *(+ `babel.config.js` tylko SDK ≤ 51)*

### Krok 0a — sprawdz wersje Expo SDK

Otwórz `package.json` i znajdz pole `"expo"`:

```json
// package.json (fragment)
{
  "dependencies": {
    "expo": "~52.0.0"   // <-- sprawdz ten numer
  }
}
```

- **SDK 52 lub wyzszy** → Nowa Architektura aktywna domyslnie, reanimated dziala bez Babel — **przejdz od razu do 0c**
- **SDK 51 lub nizszy** → plugin Babel jest wymagany — **wykonaj 0b, potem 0c**

### Krok 0b - plugin Babel *(tylko SDK ≤ 51)*

Jezeli nie masz `babel.config.js`, utworz go w katalogu glownym projektu. Dodaj plugin reanimated **jako ostatni** w tablicy `plugins`:

```js
// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // ... ewentualne inne pluginy
      'react-native-reanimated/plugin', // MUSI byc ostatni!
    ],
  };
};
```

Po zapisaniu pliku wyczysc cache Metro:

```bash
npx expo start --clear
```

> **Dlaczego ostatni?** Reanimated musi przetworzyc kod po wszystkich innych transformacjach. Jesli nie jest ostatni - shared values sa ignorowane, animacje sa nieme, zero bledów.

### Krok 0c - instalacja pakietow i GestureHandlerRootView

```bash
npx expo install react-native-reanimated react-native-gesture-handler
```

```tsx
// app/_layout.tsx
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* reszta nawigacji */}
    </GestureHandlerRootView>
  );
}
```

> **Pitfall:** `GestureHandlerRootView` musi owijac CALY tree aplikacji — jezeli dodasz go tylko w jednym ekranie, gesty na pozostalych ekranach nie beda dzialac wcale.

---

## Krok 1 - useSharedValue + useAnimatedStyle

**Cel:** zrozumiec fundamenty reanimated: shared values i animowane style.

**Pliki:** dowolny komponent testowy lub bezposrednio `components/AnimatedTripCard.tsx`

**Wymagania:**
1. Uzyj `useSharedValue` do przechowywania wartosci animowanej (np. opacity, scale).
2. Uzyj `useAnimatedStyle` do mapowania wartosci na style.
3. Owin widok w `Animated.View` (z reanimated).

```tsx
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

function AnimatedBox() {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.box, animatedStyle]}>
      {/* tresc */}
    </Animated.View>
  );
}
```

> **Pitfall:** NIE uzywaj `Animated.View` z `react-native` razem z `useAnimatedStyle` z reanimated - to dwa rozne systemy animacji, ktore nie wspolpracuja.

---

## Krok 2 - Animacja wejscia listy (FadeInDown)

**Cel:** karty TripCard pojawiaja sie z efektem wejscia przy pierwszym renderze.

**Pliki:** `components/AnimatedTripCard.tsx`, `app/(tabs)/index.tsx`

**Wymagania:**
1. Opakuj karte w `Animated.View` z propem `entering`.
2. Uzyj `FadeInDown.delay(index * 80).springify()` — kazda karta z innym opoznieniem.
3. W `app/(tabs)/index.tsx` zamien `FlatList` na `Animated.FlatList` i renderuj `AnimatedTripCard`.

```tsx
// components/AnimatedTripCard.tsx
import Animated, { FadeInDown } from 'react-native-reanimated';

interface AnimatedTripCardProps {
  trip: Trip;
  index: number;
  onDelete: (id: string) => void;
}

export function AnimatedTripCard({ trip, index, onDelete }: AnimatedTripCardProps) {
  return (
    <Animated.View entering={FadeInDown.delay(index * 80).springify()}>
      <TripCard trip={trip} onDelete={onDelete} />
    </Animated.View>
  );
}
```

```tsx
// app/(tabs)/index.tsx — fragment
import Animated from 'react-native-reanimated';

<Animated.FlatList
  data={trips}
  keyExtractor={(item) => item.id}
  renderItem={({ item, index }) => (
    <AnimatedTripCard
      trip={item}
      index={index}
      onDelete={deleteTrip}
    />
  )}
/>
```

> **Pitfall:** Standardowy `FlatList` z React Native ignoruje prop `entering` na swoich itemach. Musisz uzyc `Animated.FlatList` z reanimated.

---

## Krok 3 - Tap feedback (scale spring)

**Cel:** karta "odbija sie" sprezzyna przy tapnieciu - natywne odczucie dotyku.

**Pliki:** `components/AnimatedTripCard.tsx`

**Wymagania:**
1. Dodaj `Gesture.Tap()` z `react-native-gesture-handler`.
2. Po `onBegin` zmniejsz scale do `0.97`, po `onFinalize` wroc do `1.0`.
3. Owin `GestureDetector` wewnatrz `Animated.View`.

```tsx
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

export function AnimatedTripCard({ trip, index, onDelete }: AnimatedTripCardProps) {
  const scale = useSharedValue(1);

  const tapGesture = Gesture.Tap()
    .onBegin(() => {
      scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
    })
    .onFinalize(() => {
      scale.value = withSpring(1.0, { damping: 10, stiffness: 200 });
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 80).springify()}
      style={animatedStyle}
    >
      <GestureDetector gesture={tapGesture}>
        <TripCard trip={trip} onDelete={onDelete} />
      </GestureDetector>
    </Animated.View>
  );
}
```

---

## Krok 4 - Layout animations (plynne usuwanie)

**Cel:** po usunieciu karty pozostale karty plynnie zajmuja wolne miejsce.

**Pliki:** `components/AnimatedTripCard.tsx`, `app/(tabs)/index.tsx`

**Wymagania:**
1. Dodaj `exiting={FadeOutLeft.springify()}` do `Animated.View` karty.
2. Dodaj `itemLayoutAnimation={LinearTransition.springify()}` do `Animated.FlatList`.
3. Upewnij sie, ze `keyExtractor` zwraca stabilne, unikalne klucze.

```tsx
// Animated.View na karcie
<Animated.View
  entering={FadeInDown.delay(index * 80).springify()}
  exiting={FadeOutLeft.springify()}
  style={animatedStyle}
>

// Animated.FlatList
<Animated.FlatList
  data={trips}
  keyExtractor={(item) => item.id}
  itemLayoutAnimation={LinearTransition.springify()}
  renderItem={...}
/>
```

> **Pitfall:** `Layout.springify()` (stary API) jest przestarzaly. Uzyj `itemLayoutAnimation` na FlatList z `LinearTransition.springify()` lub `CurvedTransition`.

---

## Krok 5 - Swipe-to-delete (Pan gesture)

**Cel:** przeciagniecie karty w lewo powoduje jej animowane usuniecie.

**Pliki:** `components/AnimatedTripCard.tsx`

**Wymagania:**
1. Dodaj `useSharedValue` dla `translateX`.
2. Skonfiguruj `Gesture.Pan()` - aktualizuj `translateX` w `onUpdate`, w `onEnd` sprawdz prog (-80px).
3. Jesli prog przekroczony: animuj do `-500`, po animacji wywolaj `runOnJS(onDelete)(trip.id)`.
4. Jesli prog nie przekroczony: animuj spowrotem do `0`.

```tsx
import { runOnJS } from 'react-native-reanimated';

export function AnimatedTripCard({ trip, index, onDelete }: AnimatedTripCardProps) {
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((e) => {
      if (e.translationX < 0) {
        translateX.value = e.translationX;
      }
    })
    .onEnd((e) => {
      if (e.translationX < -80) {
        translateX.value = withTiming(-500, { duration: 300 }, (finished) => {
          if (finished) runOnJS(onDelete)(trip.id);
        });
      } else {
        translateX.value = withSpring(0);
      }
    });

  const tapGesture = Gesture.Tap()
    .onBegin(() => { scale.value = withSpring(0.97); })
    .onFinalize(() => { scale.value = withSpring(1.0); });

  // Compose gestures: tap i pan dzialaja jednoczesnie
  const composedGesture = Gesture.Simultaneous(tapGesture, panGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 80).springify()}
      exiting={FadeOutLeft.springify()}
    >
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={animatedStyle}>
          <TripCard trip={trip} onDelete={onDelete} />
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}
```

> **Pitfall:** `runOnJS` jest niezbedny - nie mozna wywolac `onDelete` (JS function) bezposrednio z callbacka `.onEnd`, bo dziala on na UI thread.

---

## Animated FAB (Floating Action Button)

**Cel:** przycisk "+" pojawiajacy sie z animacja i obracajacy sie po tapnieciu.

**Pliki:** `components/FAB.tsx`, `app/(tabs)/index.tsx`

**Wymagania:**
1. Uzyj `withSpring` do animacji scale przy wejsciu (montowaniu komponentu).
2. Dodaj `useSharedValue` dla rotacji - po tapnieciu obracaj o 45 stopni.
3. Przekaz `onPress` jako prop, wywoluj przez `runOnJS`.

```tsx
// components/FAB.tsx
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useEffect } from 'react';

interface FABProps {
  onPress: () => void;
}

export function FAB({ onPress }: FABProps) {
  const scale = useSharedValue(0);
  const rotation = useSharedValue(0);
  const isOpen = useSharedValue(false);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 200 });
  }, []);

  const tapGesture = Gesture.Tap().onEnd(() => {
    isOpen.value = !isOpen.value;
    rotation.value = withSpring(isOpen.value ? 45 : 0, { damping: 10 });
    runOnJS(onPress)();
  });

  const fabStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View style={[styles.fab, fabStyle]}>
        <Text style={styles.fabIcon}>+</Text>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#61DAFB',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  fabIcon: {
    fontSize: 28,
    color: '#0A1628',
    fontWeight: 'bold',
    lineHeight: 30,
  },
});
```

---

## Krok 7: Skeleton loading

**Cel:** podczas ladowania danych z API wyswietl animowany placeholder zamiast pustego ekranu.

**Pliki:** `components/SkeletonCard.tsx`, `app/(tabs)/explore.tsx`

**Wymagania:**
1. Uzyj `useSharedValue` + `withRepeat(withTiming(...), -1, true)` dla animacji shimmer.
2. Interpoluj wartosc do opacity (np. 0.3 → 1.0 → 0.3).
3. Renderuj kilka szarych prostokatow w ksztalcie karty.

```tsx
// components/SkeletonCard.tsx
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';

export function SkeletonCard() {
  const shimmer = useSharedValue(0.3);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1.0, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,   // nieskonczone powt.
      true  // reverse (pulsuje w tyl)
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: shimmer.value,
  }));

  return (
    <Animated.View style={[styles.card, shimmerStyle]}>
      <View style={styles.imagePlaceholder} />
      <View style={styles.titlePlaceholder} />
      <View style={styles.subtitlePlaceholder} />
    </Animated.View>
  );
}
```

> **Pitfall:** `withRepeat(-1, true)` - `-1` oznacza nieskonczone powtorzenia, `true` wlacza reverse (shimmer "oddycha"). Bez `true` shimmer skoczy gwaltownie z powrotem do wartosci poczatkowej.

---

## Krok 8: Shared element transition

**Cel:** zdjecie z karty na liscie "przeplyna" animowanie do ekranu detali.

**Pliki:** `components/AnimatedTripCard.tsx`, `app/trip/[id].tsx`

**Wymagania:**
1. Dodaj `sharedTransitionTag` do Image na karcie listy.
2. Dodaj identyczny `sharedTransitionTag` do Image na ekranie detali.
3. Nazwa tagu musi byc unikalna dla kazdej podrozy (np. `trip-image-${trip.id}`).

```tsx
// Na liscie (AnimatedTripCard.tsx)
import Animated from 'react-native-reanimated';

<Animated.Image
  source={{ uri: trip.imageUri }}
  sharedTransitionTag={`trip-image-${trip.id}`}
  style={styles.cardImage}
/>

// Na ekranie detali (app/trip/[id].tsx)
<Animated.Image
  source={{ uri: trip.imageUri }}
  sharedTransitionTag={`trip-image-${trip.id}`}
  style={styles.detailImage}
/>
```

> **Pitfall:** `sharedTransitionTag` jest case-sensitive. `"trip-image-1"` i `"Trip-Image-1"` to dwa rozne tagi - tranzycja nie zadziala.

---

## Krok 9: Parallax header

**Cel:** naglowek ze zdjeciem na ekranie detali skaluje sie i przesuwa przy scrollowaniu.

**Pliki:** `app/trip/[id].tsx`

**Wymagania:**
1. Uzyj `Animated.ScrollView` (z reanimated) i `useScrollViewOffset` do sledzenia scroll.
2. Interpoluj pozycje scrolla na `translateY` i `scale` naglowka.
3. Naglowek powinien zwolnic (parallax) a nie scrololwac 1:1.

```tsx
import Animated, {
  useAnimatedRef,
  useScrollViewOffset,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

const HEADER_HEIGHT = 280;

export default function TripDetail() {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollY = useScrollViewOffset(scrollRef);

  const headerStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
      [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      scrollY.value,
      [-HEADER_HEIGHT, 0],
      [2, 1],
      Extrapolation.CLAMP
    );
    return { transform: [{ translateY }, { scale }] };
  });

  return (
    <Animated.ScrollView ref={scrollRef}>
      <Animated.View style={[styles.header, headerStyle]}>
        <Image source={{ uri: trip.imageUri }} style={styles.headerImage} />
      </Animated.View>
      {/* reszta tresci */}
    </Animated.ScrollView>
  );
}
```

---

## Krok 10: Gesture-based rating

**Cel:** przeciagniecie palcem po gwiazdkach ustawia rating (zamiast tap na kazda gwiazdke).

**Pliki:** `components/RatingStars.tsx`

**Wymagania:**
1. Pobierz szerokosc kontenera gwiazdek przez `onLayout`.
2. Dodaj `Gesture.Pan()` - w `onUpdate` oblicz rating z `translationX / (containerWidth / maxStars)`.
3. Wywolaj `runOnJS(onRatingChange)(newRating)` przy kazdej zmianie.

---

## Krok 11: Staggered grid animation

**Cel:** karty na zakladce Explore pojawiaja sie kaskadowo, kazda z wiekszym opoznieniem.

**Pliki:** `app/(tabs)/explore.tsx`

**Wymagania:**
1. Owin kazda `DestinationCard` w `Animated.View` z `entering`.
2. Uzyj `FadeInDown.delay(index * 100).springify()`.
3. Zwieksz opoznienie bazowe dla kolumny prawej (np. `index * 100 + (column * 50)`).

---

## Krok 12: Heart animation (like)

**Cel:** przycisk lajka na karcie wybucha sprezzyna animacja i zmienia kolor.

**Pliki:** `components/AnimatedTripCard.tsx` lub nowy `components/LikeButton.tsx`

**Wymagania:**
1. `useSharedValue` dla scale serduszka i koloru.
2. Po tapnieciu: `withSequence(withSpring(1.4), withSpring(1.0))`.
3. Kolor przeplywowy: interpoluj z szarego na accent czerwony.

---

## Tips & common pitfalls

1. **Babel - tylko SDK 51 i starsze** — jesli uzywasz SDK 52+, plugin `react-native-reanimated/plugin` nie jest potrzebny (Nowa Architektura zastepuje ta transformacje). W SDK 51 i starszych musi byc ostatni w tablicy `plugins` - bez tego shared values sa ignorowane. Po kazdej zmianie `babel.config.js`: `npx expo start --clear`.

2. **GestureHandlerRootView w root layout** - jezeli wstawisz go tylko w jednym ekranie, gesty nie beda dzialac na innych ekranach. Musi owijac caly tree.

4. **runOnJS dla logiki JS** - wszelkie setState, navigation.navigate(), dispatch z useReducer wywolywane z wnetrza gestow lub useAnimatedStyle wymagaja opakowania w `runOnJS`. Bez tego aplikacja crashuje z trudnym do zdiagnozowania bledem.

5. **Animated.FlatList, nie FlatList** - normalny FlatList ignoruje `entering`/`exiting` na swoich itemach. Uzyj `Animated.FlatList` z paczki reanimated.

6. **Stable key dla layout animations** - Layout animations sledzaca itemow po kluczu. Jezeli klucz sie zmieni (np. index zamiast id), React bedzie usuwac i tworzyc na nowo, nie animowac.

7. **Pan + ScrollView kolizja** - jezeli swipe-to-delete wewnarz pionowo scrollowalnej listy nie dziala, uzyj `activeOffsetX([-10, 10])` na Gesture.Pan - wtedy gesty poziome nie koliduja ze scrollem.

8. **withRepeat i reverse** - shimmer loading wymaga `withRepeat(animation, -1, true)`. Bez `true` shimmer skoczy z powrotem do 0 bez animacji.

9. **Emulator vs urzadzenie fizyczne** - animacje spring z niskim dampingiem (np. `damping: 5`) moga wyglaldac inaczej na emulatorze niz na telefonie. Testuj na urzadzeniu przed oddaniem.

10. **Nie mieszaj Animated z react-native i Animated z reanimated** - to sa dwa rozne systemy. Jezeli zaczniesz od reanimated, trzymaj sie go konsekwentnie.

---
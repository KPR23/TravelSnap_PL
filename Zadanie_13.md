# Zadanie 13 — Networking & Offline

---

## Cel

Po wykonaniu zadania aplikacja TravelSnap bedzie:

- zarzadzac danymi serwerowymi przez **TanStack Query** (cache, stale-while-revalidate, retry)
- przechowywac cache zapytan miedzy restartami aplikacji (**AsyncStorage persister**)
- wyswietlac animowany baner gdy brak polaczenia z internetem (**OfflineBanner**)
- wstrzymywac zapytania HTTP gdy offline (`enabled: isConnected`)
- wykonywac **optimistic updates** dla dodawania i usuwania wyjazdow
- wycofywac optymistyczne zmiany (**rollback**) gdy zapis do storage sie nie powiedzie
- zastepowac wlasny hook `useFetch` przez `useQuery` z TanStack Query

---

## Krok 0 — Instalacja i QueryClient `[CORE]`

### 0a. Instalacja zaleznosci

```bash
npx expo install @tanstack/react-query \
  @tanstack/query-async-storage-persister \
  @tanstack/react-query-persist-client \
  @react-native-community/netinfo
```

### 0b. Utworz `lib/queryClient.ts`

```tsx
import { QueryClient } from '@tanstack/react-query';

// Create outside component — one instance for the whole app lifecycle
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:  1000 * 60 * 5,              // 5 min — data considered fresh
      gcTime:     1000 * 60 * 60 * 24 * 7,   // 7 days — must match persister maxAge
      retry: 3,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
    },
    mutations: {
      retry: 0, // do not retry mutations automatically
    },
  },
});
```

> **Pitfall:** `gcTime` musi byc **rowny lub wiekszy** od `maxAge` persistera (7 dni w Krok 0d).
> Domyslny `gcTime` to zaledwie 5 minut — dane zostana usuniete z pamieci
> zanim persister zdazy je zapisac do AsyncStorage.

### 0c. Utworz `utils/persister.ts`

```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';

export const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
});
```

### 0d. Utworz `providers/QueryProvider.tsx`

```tsx
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { queryClient } from '../lib/queryClient';
import { persister } from '../utils/persister';

const SEVEN_DAYS = 1000 * 60 * 60 * 24 * 7;

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, maxAge: SEVEN_DAYS }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
```

> **Pitfall:** Uzyj `PersistQueryClientProvider`, nie zwyklego `QueryClientProvider`.
> Zwykly provider ignoruje `persistOptions` — brak bledu, ale persistence nie dziala.

### 0e. Dodaj QueryProvider do `app/_layout.tsx`

```tsx
import { QueryProvider } from '../providers/QueryProvider';

export default function RootLayout() {
  return (
    <QueryProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack>
          {/* ... reszta layoutu ... */}
        </Stack>
      </GestureHandlerRootView>
    </QueryProvider>
  );
}
```

---

## Krok 1 — useTripsQuery `[CORE]`

Utworz `hooks/useTripsQuery.ts`:

```tsx
import { useQuery } from '@tanstack/react-query';
import { loadTrips } from '../utils/tripStorage';
import type { Trip } from '../types/trip';

export function useTripsQuery() {
  return useQuery<Trip[]>({
    queryKey: ['trips'],
    queryFn:  loadTrips,
    staleTime: Infinity, // local data — never stale, invalidate manually after mutation
  });
}
```

Zaktualizuj `app/(tabs)/index.tsx` — zamien czytanie z TripContext na `useTripsQuery`:

```tsx
import { useTripsQuery } from '../../hooks/useTripsQuery';

export default function HomeScreen() {
  const { data: trips = [], isLoading } = useTripsQuery();

  if (isLoading) return <SkeletonCard />;

  return (
    <Animated.FlatList
      data={trips}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => (
        <AnimatedTripCard trip={item} index={index} />
      )}
      itemLayoutAnimation={LinearTransition.springify()}
    />
  );
}
```

> **Pitfall:** `staleTime: Infinity` oznacza, ze `useTripsQuery` nigdy automatycznie nie refetchuje.
> Po kazej mutacji trzeba wywolac `queryClient.invalidateQueries({ queryKey: ['trips'] })`.

---

## Krok 2 — useMutation addTrip (optimistic) `[CORE]`

Utworz `hooks/useTripMutations.ts` (sekcja addTrip):

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveTrip } from '../utils/tripStorage';
import type { Trip, TripData } from '../types/trip';

export function useAddTrip() {
  const qc = useQueryClient();

  return useMutation<Trip, Error, TripData>({
    mutationFn: saveTrip,

    onMutate: async (newData) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await qc.cancelQueries({ queryKey: ['trips'] });

      // Save snapshot for rollback
      const previous = qc.getQueryData<Trip[]>(['trips']) ?? [];

      // Optimistically add to cache
      const optimistic: Trip = {
        ...newData,
        id: `optimistic-${Date.now()}`,
      };
      qc.setQueryData<Trip[]>(['trips'], [optimistic, ...previous]);

      // Return context — available as 3rd arg in onError
      return { previous };
    },

    onError: (_err, _vars, ctx) => {
      // Rollback to snapshot
      if (ctx?.previous) {
        qc.setQueryData(['trips'], ctx.previous);
      }
    },

    onSettled: () => {
      // Always invalidate after success OR error — get real data from storage
      qc.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}
```

> **Pitfall:** `onMutate` **musi zwracac** `{ previous }`.
> Ten obiekt trafia jako `context` (trzeci argument) do `onError`.
> Bez `return` rollback nie ma czego przywrocic.

> **Pitfall:** Nie wywoluj `invalidateQueries` w `onSuccess`.
> Powoduje to podwojna aktualizacje UI — wywoluj tylko w `onSettled`.

---

## Krok 3 — useMutation deleteTrip (optimistic) `[CORE]`

Dodaj do `hooks/useTripMutations.ts`:

```tsx
// Add deleteTrip to the import at the top of the file:
import { saveTrip, deleteTrip } from '../utils/tripStorage';

export function useDeleteTrip() {
  const qc = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteTrip, // already exists in utils/tripStorage.ts

    onMutate: async (tripId) => {
      await qc.cancelQueries({ queryKey: ['trips'] });
      const previous = qc.getQueryData<Trip[]>(['trips']) ?? [];

      // Optimistically remove from cache
      qc.setQueryData<Trip[]>(
        ['trips'],
        previous.filter((t) => t.id !== tripId)
      );

      return { previous };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData(['trips'], ctx.previous);
      }
    },

    onSettled: () => qc.invalidateQueries({ queryKey: ['trips'] }),
  });
}
```

---

## Krok 4 — Persistence (AsyncStorage persister) `[CORE]`

Persister zostal skonfigurowany w Krok 0c i podlaczony w Krok 0d.
`lib/queryClient.ts` z Kroku 0b ma juz ustawione `gcTime: 7 dni` — rowne `maxAge` persistera.

**Weryfikacja persistence:** Zamknij aplikacje (nie tylko minimize — poczekaj ~10s),
otworz ponownie **bez polaczenia z internetem**.
Lista wyjazdow i dane Explore powinny byc widoczne **przed** pierwszym refetchem.

Sprawdz w logach, ze dane laduja sie z cache (brak requesta HTTP w Network tab Expo Dev Tools).

> **Kluczowa zasada:** `gcTime` >= `maxAge` persistera zawsze. Domyslny `gcTime` to 5 minut —
> nigdy nie ustawiaj `maxAge` dluzej niz `gcTime`, bo dane znikna z pamieci przed zapisem.

---

## Krok 5 — Network status i OfflineBanner `[CORE]`

### 5a. Utworz `hooks/useNetworkStatus.ts`

```tsx
import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean;
}

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({
    isConnected: true,         // assume connected until first event
    isInternetReachable: true,
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setStatus({
        isConnected:        state.isConnected        ?? true, // null = unknown, assume true
        isInternetReachable: state.isInternetReachable ?? true,
      });
    });
    return unsubscribe; // cleanup on unmount
  }, []);

  return status;
}
```

> **Pitfall:** NetInfo moze krotko zwracac `null` przy zimnym starcie.
> Traktuj `null` jako "polaczenie obecne" — bez tego zablokujesz zapytania
> przy pierwszym uruchomieniu aplikacji.

### 5b. Utworz `components/OfflineBanner.tsx`

```tsx
import { StyleSheet, Text } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

export function OfflineBanner() {
  const { isConnected } = useNetworkStatus();

  if (isConnected) return null;

  return (
    <Animated.View
      entering={FadeInDown.duration(300)}
      exiting={FadeOutUp.duration(300)}
      style={styles.banner}
    >
      <Text style={styles.icon}>📡</Text>
      <Text style={styles.text}>Brak polaczenia z internetem</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#E94560',
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 999,
  },
  icon: { fontSize: 16 },
  text: { color: '#fff', fontWeight: '600', fontSize: 13 },
});
```

### 5c. Dodaj OfflineBanner do root layout

W `app/_layout.tsx` dodaj baner nad `<Stack>`:

```tsx
import { OfflineBanner } from '../components/OfflineBanner';

// inside RootLayout return:
<QueryProvider>
  <GestureHandlerRootView style={{ flex: 1 }}>
    <OfflineBanner />
    <Stack>
      {/* ... */}
    </Stack>
  </GestureHandlerRootView>
</QueryProvider>
```

### 5d. Wstrzymaj zapytania gdy offline

W hookach `useCountriesQuery` i `useUnsplashQuery` (Krok 6) dodasz `enabled: isConnected`.

---

## Krok 6 — Zastapienie useFetch przez useQuery `[CORE]`

### 6a. Utworz `hooks/useCountriesQuery.ts`

```tsx
import { useQuery } from '@tanstack/react-query';
import { COUNTRY_API } from '../constants/api';
import { useNetworkStatus } from './useNetworkStatus';
import type { Country } from '../types/country';

export function useCountriesQuery() {
  const { isConnected } = useNetworkStatus();

  return useQuery<Country[]>({
    queryKey: ['countries'],
    queryFn:  () => fetch(COUNTRY_API).then((r) => r.json()),
    staleTime: 1000 * 60 * 60, // 1h — country data rarely changes
    enabled:   isConnected,    // pause when offline
  });
}
```

### 6b. Utworz `hooks/useUnsplashQuery.ts`

```tsx
import { useQuery } from '@tanstack/react-query';
import { UNSPLASH_KEY } from '../constants/api';
import { useNetworkStatus } from './useNetworkStatus';

export function useUnsplashQuery(searchTerm: string) {
  const { isConnected } = useNetworkStatus();

  return useQuery({
    queryKey: ['unsplash', searchTerm],
    queryFn: async () => {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchTerm)}&per_page=10`,
        { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } }
      );
      if (!res.ok) throw new Error(`Unsplash error: ${res.status}`);
      return res.json();
    },
    enabled:   isConnected && !!searchTerm,
    staleTime: 1000 * 60 * 30, // 30 min
  });
}
```

### 6c. Zaktualizuj `app/(tabs)/explore.tsx`

```tsx
import { useCountriesQuery }  from '../../hooks/useCountriesQuery';
import { useUnsplashQuery }   from '../../hooks/useUnsplashQuery';
import { SkeletonCard }       from '../../components/SkeletonCard';
import { ErrorView }          from '../../components/ErrorView';

export default function ExploreScreen() {
  const {
    data: countries,
    isLoading,
    isError,
    refetch,
  } = useCountriesQuery();

  if (isLoading) return <SkeletonCard />;
  if (isError)   return <ErrorView onRetry={refetch} />;

  return (
    <FlatList
      data={countries}
      keyExtractor={(item) => item.cca2}
      renderItem={({ item }) => <CountryCard country={item} />}
    />
  );
}
```

---

## Krok 7 — Background refetch po powrocie do foreground `[STRETCH]`

Dodaj do `providers/QueryProvider.tsx` (lub dedykowanego hooka `useAppStateFocus`):

```tsx
import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { focusManager } from '@tanstack/react-query';

function useAppStateFocus() {
  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (state: AppStateStatus) => {
        // Inform React Query when app returns to foreground
        focusManager.setFocused(state === 'active');
      }
    );
    return () => subscription.remove();
  }, []);
}
```

Wywolaj `useAppStateFocus()` wewnatrz komponentu `QueryProvider`.

> **Dlaczego?** `refetchOnWindowFocus` dziala tylko w przegladarce internetowej.
> W React Native nalezy reczenie podlaczyc `AppState` do `focusManager`.

---

## Krok 8 — useInfiniteQuery (paginacja Explore) `[STRETCH]`

Zamien `useCountriesQuery` lub `useUnsplashQuery` na wersje z paginacja:

```tsx
import { useInfiniteQuery } from '@tanstack/react-query';
import { UNSPLASH_KEY } from '../constants/api';

const PAGE_SIZE = 10;

export function useUnsplashInfiniteQuery(searchTerm: string) {
  return useInfiniteQuery({
    queryKey: ['unsplash', searchTerm, 'infinite'],

    queryFn: async ({ pageParam }) => {
      const res = await fetch(
        `https://api.unsplash.com/search/photos` +
        `?query=${encodeURIComponent(searchTerm)}&page=${pageParam}&per_page=${PAGE_SIZE}`,
        { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } }
      );
      if (!res.ok) throw new Error(`Unsplash error: ${res.status}`);
      return res.json();
    },

    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.results.length === PAGE_SIZE ? allPages.length + 1 : undefined,
  });
}
```

Uzycie w `explore.tsx`:

```tsx
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = useUnsplashInfiniteQuery(searchTerm);

const photos = data?.pages.flatMap((page) => page.results) ?? [];

<FlatList
  data={photos}
  onEndReached={() => hasNextPage && fetchNextPage()}
  onEndReachedThreshold={0.5}
  ListFooterComponent={
    isFetchingNextPage ? <ActivityIndicator /> : null
  }
/>
```

---

## Krok 9 — Retry z exponential backoff `[STRETCH]`

Zaktualizuj `lib/queryClient.ts` — nie ponawiaj bledow 4xx:

```tsx
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:  1000 * 60 * 5,
      gcTime:     1000 * 60 * 60 * 24 * 7,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),

      // Do not retry client errors (4xx) — only server errors (5xx)
      retry: (failureCount, error: unknown) => {
        const status = (error as { status?: number })?.status;
        if (status && status >= 400 && status < 500) return false;
        return failureCount < 3;
      },
    },
    mutations: { retry: 0 },
  },
});
```

---

## Krok 10 — useMutation updateTrip (optimistic) `[STRETCH]`

> **Uwaga:** `updateTrip` nie istnieje jeszcze w `utils/tripStorage.ts` (startowy stan po L12
> zawiera tylko `loadTrips`, `saveTrip`, `deleteTrip`). Przed implementacja hooka dodaj:
>
> ```tsx
> // utils/tripStorage.ts — dodaj ta funkcje
> export async function updateTrip(id: string, data: Partial<TripData>): Promise<Trip> {
>   const trips = await loadTrips();
>   const updated = trips.map((t) => (t.id === id ? { ...t, ...data } : t));
>   await AsyncStorage.setItem(TRIPS_KEY, JSON.stringify(updated));
>   return updated.find((t) => t.id === id)!;
> }
> ```

Dodaj do `hooks/useTripMutations.ts`:

```tsx
// Add updateTrip to the import:
import { saveTrip, deleteTrip, updateTrip } from '../utils/tripStorage';

export function useUpdateTrip() {
  const qc = useQueryClient();

  return useMutation<Trip, Error, { id: string; data: Partial<TripData> }>({
    mutationFn: ({ id, data }) => updateTrip(id, data),

    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey: ['trips'] });
      const previous = qc.getQueryData<Trip[]>(['trips']) ?? [];

      qc.setQueryData<Trip[]>(['trips'], (old = []) =>
        old.map((trip) => (trip.id === id ? { ...trip, ...data } : trip))
      );

      return { previous };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(['trips'], ctx.previous);
    },

    onSettled: () => qc.invalidateQueries({ queryKey: ['trips'] }),
  });
}
```

---

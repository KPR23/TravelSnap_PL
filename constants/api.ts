const fallbackUnsplashBaseUrl = "https://api.unsplash.com";
const fallbackRestCountriesBaseUrl = "https://restcountries.com/v3.1";

// Ten plik powinnien być commitowany celowo: zawiera wyłącznie publiczne adresy API
// i odczyt zmiennych EXPO_PUBLIC_* przekazywanych przez środowisko. Te callbacki można też pominąć tak naprawdę.
export const UNSPLASH_BASE_URL =
	process.env.EXPO_PUBLIC_UNSPLASH_BASE_URL ?? fallbackUnsplashBaseUrl;
export const RESTCOUNTRIES_BASE_URL =
	process.env.EXPO_PUBLIC_RESTCOUNTRIES_BASE_URL ?? fallbackRestCountriesBaseUrl;
export const UNSPLASH_ACCESS_KEY = process.env.EXPO_PUBLIC_UNSPLASH_ACCESS_KEY ?? "";

if (__DEV__ && !UNSPLASH_ACCESS_KEY) {
	console.warn(
		"[api] Brak EXPO_PUBLIC_UNSPLASH_ACCESS_KEY. Zapytania do Unsplash beda zwracac blad autoryzacji.",
	);
}

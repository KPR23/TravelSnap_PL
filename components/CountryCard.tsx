import { RESTCOUNTRIES_BASE_URL } from "@/constants/api";
import { Colors } from "@/constants/Colors";
import { Spacing } from "@/constants/Spacing";
import { useFetch } from "@/hooks/useFetch";
import { Country } from "@/types/country";
import { Image } from "expo-image";
import { JSX } from "react";
import { StyleSheet, Text, View } from "react-native";

interface CountryCardProps {
	countryName: string;
}

export function CountryCard({
	countryName,
}: CountryCardProps): JSX.Element | null {
	// Bazowy URL pobieramy z commitowanego `constants/api.ts` (bez sekretow w repo),
	// a ewentualne klucze trafiaja przez EXPO_PUBLIC_* z lokalnego .env.
	const URL = `${RESTCOUNTRIES_BASE_URL}/name/${encodeURIComponent(countryName)}`;

	const { data, loading, error, refetch: _refetch } = useFetch<Country[]>(URL);
	void _refetch;

	if (loading) {
		return <View style={styles.skeleton} />;
	}

	if (error || !data?.[0]) {
		return null;
	}

	const country = data[0];
	const name = country.name.common;
	const currency = Object.values(country.currencies ?? {})[0];
	const flag = country.flags.png;
	const capital = country.capital?.[0] ?? "—";
	const currencyText = currency ? `${currency.name} (${currency.symbol})` : "—";

	return (
		<View style={styles.container}>
			<Image
				source={{ uri: flag }}
				style={styles.flag}
				contentFit="cover"
				cachePolicy="memory-disk"
				transition={200}
			/>
			<View style={styles.textContainer}>
				<Text style={styles.name}>{name}</Text>
				<Text style={styles.meta}>Stolica: {capital}</Text>
				<Text style={styles.meta}>Waluta: {currencyText}</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing.md,
		padding: Spacing.lg,
		borderRadius: Spacing.md,
		backgroundColor: Colors.card,
	},
	flag: {
		width: 60,
		height: 40,
		borderRadius: Spacing.xs,
	},
	textContainer: {
		flex: 1,
		gap: Spacing.xs,
	},
	name: {
		fontSize: 16,
		fontWeight: "bold",
		color: Colors.textPrimary,
	},
	meta: {
		fontSize: 14,
		color: Colors.textSecondary,
	},
	skeleton: {
		width: "100%",
		height: 72,
		borderRadius: Spacing.md,
		backgroundColor: Colors.skeleton,
	},
});

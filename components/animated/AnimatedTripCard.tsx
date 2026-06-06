import { Trip } from "@/types/tripSchema";
import { StyleSheet } from "react-native";
import Animated, {
	FadeInDown,
	useAnimatedStyle,
	useSharedValue,
} from "react-native-reanimated";
import { TripCard } from "../TripCard";

type TripCardProps = {
	trip: Trip;
	index: number;
	onPress: (id: string) => void;
};

export function AnimatedTripCard({ trip, index, onPress }: TripCardProps) {
	const scale = useSharedValue(1);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	return (
		<Animated.View
			entering={FadeInDown.delay(index * 80).springify()}
			style={[styles.box, animatedStyle]}
		>
			<TripCard trip={trip} onPress={onPress} />
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	box: {
		width: 100,
		height: 100,
		backgroundColor: "red",
	},
});

import { Trip } from "@/types/tripSchema";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
	FadeInDown,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from "react-native-reanimated";
import { TripCard } from "../TripCard";

type TripCardProps = {
	trip: Trip;
	index: number;
	onPress: (id: string) => void;
};

export function AnimatedTripCard({ trip, index, onPress }: TripCardProps) {
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
				<TripCard trip={trip} onPress={onPress} />
			</GestureDetector>
		</Animated.View>
	);
}

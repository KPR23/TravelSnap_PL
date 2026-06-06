import { Trip } from "@/types/tripSchema";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
	FadeInDown,
	FadeOutLeft,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { TripCard } from "../TripCard";

type AnimatedTripCardProps = {
	trip: Trip;
	index: number;
	onPress: (id: string) => void;
	onDelete: (id: string) => Promise<void>;
};

export function AnimatedTripCard({
	trip,
	index,
	onPress,
	onDelete,
}: AnimatedTripCardProps) {
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
					if (finished) scheduleOnRN(onDelete, trip.id);
				});
			} else {
				translateX.value = withSpring(0);
			}
		});

	const tapGesture = Gesture.Tap()
		.onBegin(() => {
			scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
		})
		.onFinalize(() => {
			scale.value = withSpring(1.0, { damping: 10, stiffness: 200 });
		});

	const composedGesture = Gesture.Simultaneous(tapGesture, panGesture);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: translateX.value }, { scale: scale.value }],
	}));

	return (
		<Animated.View
			entering={FadeInDown.delay(index * 80).springify()}
			exiting={FadeOutLeft.springify()}
		>
			<GestureDetector gesture={composedGesture}>
				<Animated.View style={animatedStyle}>
					<TripCard trip={trip} onPress={onPress} />
				</Animated.View>
			</GestureDetector>
		</Animated.View>
	);
}

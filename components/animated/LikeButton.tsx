import { Colors } from "@/constants/Colors";
import { Spacing } from "@/constants/Spacing";
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
	interpolateColor,
	useAnimatedProps,
	useAnimatedStyle,
	useSharedValue,
	withSequence,
	withSpring,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

const AnimatedIcon = Animated.createAnimatedComponent(Ionicons);

type LikeButtonProps = {
	isLiked: boolean;
	onToggle: () => void;
};

export function LikeButton({ isLiked, onToggle }: LikeButtonProps) {
	const scale = useSharedValue(1);
	const colorProgress = useSharedValue(isLiked ? 1 : 0);

	useEffect(() => {
		colorProgress.value = withSpring(isLiked ? 1 : 0, { damping: 12 });
	}, [colorProgress, isLiked]);

	const tapGesture = Gesture.Tap().onEnd(() => {
		scale.value = withSequence(
			withSpring(1.4, { damping: 8, stiffness: 400 }),
			withSpring(1.0, { damping: 10, stiffness: 200 }),
		);
		scheduleOnRN(onToggle);
	});

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: scale.value }],
	}));

	const animatedIconProps = useAnimatedProps(() => ({
		color: interpolateColor(
			colorProgress.value,
			[0, 1],
			[Colors.textSecondary, Colors.accent],
		),
	}));

	return (
		<GestureDetector gesture={tapGesture}>
			<Animated.View style={[styles.button, animatedStyle]}>
				<AnimatedIcon
					name={isLiked ? "heart" : "heart-outline"}
					size={24}
					animatedProps={animatedIconProps}
				/>
			</Animated.View>
		</GestureDetector>
	);
}

const styles = StyleSheet.create({
	button: {
		padding: Spacing.sm,
		alignItems: "center",
		justifyContent: "center",
	},
});

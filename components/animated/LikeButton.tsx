import { Colors } from "@/constants/Colors";
import { Spacing } from "@/constants/Spacing";
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, {
	interpolateColor,
	useAnimatedProps,
	useSharedValue,
	withSequence,
	withSpring,
} from "react-native-reanimated";

const AnimatedIcon = Animated.createAnimatedComponent(Ionicons);
const ICON_SIZE = 24;

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

	const handlePress = () => {
		scale.value = withSequence(
			withSpring(1.4, { damping: 8, stiffness: 400 }),
			withSpring(1.0, { damping: 10, stiffness: 200 }),
		);
		onToggle();
	};

	const animatedIconProps = useAnimatedProps(() => ({
		size: scale.value * ICON_SIZE,
		color: interpolateColor(
			colorProgress.value,
			[0, 1],
			[Colors.textSecondary, Colors.accent],
		),
	}));

	return (
		<Pressable onPress={handlePress} style={styles.button}>
			<AnimatedIcon
				name={isLiked ? "heart" : "heart-outline"}
				animatedProps={animatedIconProps}
			/>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	button: {
		width: ICON_SIZE + Spacing.sm * 2,
		height: ICON_SIZE + Spacing.sm * 2,
		alignItems: "center",
		justifyContent: "center",
	},
});

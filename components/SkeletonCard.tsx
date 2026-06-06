import { Colors } from "@/constants/Colors";
import { Spacing } from "@/constants/Spacing";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withTiming,
} from "react-native-reanimated";

export function SkeletonCard() {
	const shimmer = useSharedValue(0.3);

	useEffect(() => {
		shimmer.value = withRepeat(
			withTiming(1.0, { duration: 900, easing: Easing.inOut(Easing.ease) }),
			-1,
			true,
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

const styles = StyleSheet.create({
	card: {
		backgroundColor: Colors.skeleton,
		borderRadius: Spacing.md,
		overflow: "hidden",
	},
	imagePlaceholder: {
		width: "100%",
		height: 100,
		backgroundColor: Colors.skeleton,
	},
	titlePlaceholder: {
		width: "80%",
		height: 20,
		backgroundColor: Colors.skeleton,
	},
	subtitlePlaceholder: {
		width: "60%",
		height: 20,
		backgroundColor: Colors.skeleton,
	},
});

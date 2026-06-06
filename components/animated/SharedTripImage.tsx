import { ComponentProps, type ComponentType } from "react";
import { ImageStyle, StyleProp } from "react-native";
import Animated from "react-native-reanimated";

type AnimatedImageProps = ComponentProps<typeof Animated.Image> & {
	sharedTransitionTag?: string;
};

const AnimatedImage =
	Animated.Image as ComponentType<AnimatedImageProps>;

type SharedTripImageProps = {
	uri: string;
	sharedTransitionTag: string;
	style?: StyleProp<ImageStyle>;
};

export function SharedTripImage({
	uri,
	sharedTransitionTag,
	style,
}: SharedTripImageProps) {
	return (
		<AnimatedImage
			source={{ uri }}
			sharedTransitionTag={sharedTransitionTag}
			style={style}
			resizeMode="cover"
		/>
	);
}

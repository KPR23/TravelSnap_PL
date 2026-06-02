import type { MapStyleElement } from "react-native-maps";

export const darkMapStyle: MapStyleElement[] = [
	{
		elementType: "geometry",
		stylers: [{ color: "#0F1A2E" }],
	},
	{
		elementType: "labels.text.fill",
		stylers: [{ color: "#8B95A5" }],
	},
	{
		elementType: "labels.text.stroke",
		stylers: [{ color: "#0F1A2E" }],
	},
	{
		featureType: "administrative",
		elementType: "geometry.stroke",
		stylers: [{ color: "#2E3A50" }],
	},
	{
		featureType: "landscape",
		elementType: "geometry",
		stylers: [{ color: "#1A2742" }],
	},
	{
		featureType: "poi",
		elementType: "geometry",
		stylers: [{ color: "#243352" }],
	},
	{
		featureType: "poi.park",
		elementType: "geometry",
		stylers: [{ color: "#1A2742" }],
	},
	{
		featureType: "road",
		elementType: "geometry",
		stylers: [{ color: "#243352" }],
	},
	{
		featureType: "road",
		elementType: "geometry.stroke",
		stylers: [{ color: "#2E4066" }],
	},
	{
		featureType: "road.highway",
		elementType: "geometry",
		stylers: [{ color: "#2E4066" }],
	},
	{
		featureType: "road.highway",
		elementType: "geometry.stroke",
		stylers: [{ color: "#4A6FA5" }],
	},
	{
		featureType: "transit",
		elementType: "geometry",
		stylers: [{ color: "#243352" }],
	},
	{
		featureType: "water",
		elementType: "geometry",
		stylers: [{ color: "#0B1220" }],
	},
	{
		featureType: "water",
		elementType: "labels.text.fill",
		stylers: [{ color: "#4A6FA5" }],
	},
];

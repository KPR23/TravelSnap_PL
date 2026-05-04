export type TripData = {
	title: string;
	destination: string;
	date: string;
	rating: number;
	imageUri?: string;
	galleryUris?: string[];
	isFavorite?: boolean;
};

export type Trip = TripData & { id: string };

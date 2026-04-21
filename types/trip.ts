export type TripData = {
	title: string;
	destination: string;
	date: string;
	rating: number;
	imageUri?: string;
	galleryUris?: string[];
};

export type Trip = TripData & { id: string };

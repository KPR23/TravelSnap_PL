export type TripData = {
	title: string;
	destination: string;
	date: string;
	rating: number;
};

export type Trip = TripData & { id: string };

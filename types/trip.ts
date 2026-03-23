export interface TripData {
  title: string;
  destination: string;
  date: string;
  rating: number;
}

export interface Trip extends TripData {
  id: string;
}

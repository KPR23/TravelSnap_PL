import { z } from "zod";

export const tripSchema = z.object({
	title: z
		.string()
		.min(3, "Tytuł musi mieć co najmniej 3 znaki")
		.max(60, "Tytuł może mieć maksymalnie 60 znaków")
		.trim(),
	destination: z
		.string()
		.min(3, "Destynacja musi mieć co najmniej 3 znaki")
		.max(60, "Destynacja może mieć maksymalnie 60 znaków")
		.trim(),
	date: z.string().regex(/^\d{4}-\d{2}$/, "Data musi być w formacie YYYY-MM"),
	rating: z
		.number({ message: "Ocena musi być liczbą" })
		.int("Ocena musi być liczbą całkowitą")
		.min(1, "Ocena musi być między 1 a 5")
		.max(5, "Ocena musi być między 1 a 5"),
	imageUri: z.url().optional(),
	galleryUris: z.array(z.string()).optional(),
	isFavorite: z.boolean().optional(),
});

export type TripFormData = z.infer<typeof tripSchema>;
export type Trip = TripFormData & { id: string };

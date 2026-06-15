import { deleteTrip, saveTrip } from "@/utils/tripStorage";
import type { Trip, TripFormData } from "@/types/tripSchema";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useAddTrip() {
	const qc = useQueryClient();

	return useMutation<Trip, Error, TripFormData>({
		mutationFn: saveTrip,

		onMutate: async (newData) => {
			await qc.cancelQueries({ queryKey: ["trips"] });

			const previous = qc.getQueryData<Trip[]>(["trips"]) ?? [];

			const optimistic: Trip = {
				...newData,
				id: `optimistic-${Date.now()}`,
			};
			qc.setQueryData<Trip[]>(["trips"], [optimistic, ...previous]);

			return { previous };
		},

		onError: (_err, _vars, ctx) => {
			if (ctx?.previous) {
				qc.setQueryData(["trips"], ctx.previous);
			}
		},

		onSettled: () => {
			qc.invalidateQueries({ queryKey: ["trips"] });
		},
	});
}

export function useDeleteTrip() {
	const qc = useQueryClient();

	return useMutation<void, Error, string>({
		mutationFn: deleteTrip,

		onMutate: async (tripId) => {
			await qc.cancelQueries({ queryKey: ["trips"] });
			const previous = qc.getQueryData<Trip[]>(["trips"]) ?? [];

			qc.setQueryData<Trip[]>(
				["trips"],
				previous.filter((t) => t.id !== tripId),
			);

			return { previous };
		},

		onError: (_err, _vars, ctx) => {
			if (ctx?.previous) {
				qc.setQueryData(["trips"], ctx.previous);
			}
		},

		onSettled: () => qc.invalidateQueries({ queryKey: ["trips"] }),
	});
}

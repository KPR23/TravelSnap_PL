import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { queryClient } from "@/lib/queryClient";
import { persister } from "@/utils/persister";

const SEVEN_DAYS = 1000 * 60 * 60 * 24 * 7;

export function QueryProvider({ children }: { children: React.ReactNode }) {
	return (
		<PersistQueryClientProvider
			client={queryClient}
			persistOptions={{ persister, maxAge: SEVEN_DAYS }}
		>
			{children}
		</PersistQueryClientProvider>
	);
}

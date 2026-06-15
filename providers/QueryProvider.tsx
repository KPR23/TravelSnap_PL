import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { focusManager } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { persister } from "@/utils/persister";
import { useEffect } from "react";
import { AppState, AppStateStatus } from "react-native";

const SEVEN_DAYS = 1000 * 60 * 60 * 24 * 7;

function useAppStateFocus() {
	useEffect(() => {
		const subscription = AppState.addEventListener(
			"change",
			(state: AppStateStatus) => {
				focusManager.setFocused(state === "active");
			},
		);
		return () => subscription.remove();
	}, []);
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
	useAppStateFocus();

	return (
		<PersistQueryClientProvider
			client={queryClient}
			persistOptions={{ persister, maxAge: SEVEN_DAYS }}
		>
			{children}
		</PersistQueryClientProvider>
	);
}

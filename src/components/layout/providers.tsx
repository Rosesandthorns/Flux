"use client";

import { ThemeProvider } from "@/context/ThemeContext";
import { VoiceProvider } from "@/context/VoiceContext";
import { ReactNode } from "react";
import { initializeFirebase, FirebaseClientProvider } from "@/firebase";
import AuthGuard from "../AuthGuard";

const { app, auth, firestore } = initializeFirebase();

export function Providers({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider>
            <VoiceProvider>
                <FirebaseClientProvider app={app} auth={auth} firestore={firestore}>
                    <AuthGuard>
                        {children}
                    </AuthGuard>
                </FirebaseClientProvider>
            </VoiceProvider>
        </ThemeProvider>
    );
}

"use client";

import { ThemeProvider } from "@/context/ThemeContext";
import { VoiceProvider } from "@/context/VoiceContext";
import { ReactNode } from "react";
import { initializeFirebase, FirebaseClientProvider } from "@/firebase";
import AuthGuard from "../AuthGuard";
import ServerRail from "./ServerRail";
import { BlockProvider } from "@/context/BlockContext";
import { DMCallProvider } from "@/context/DMCallContext";
import DMCallManager from "../calls/DMCallManager";

const { app, auth, firestore } = initializeFirebase();

export function Providers({ children }: { children: ReactNode }) {
    return (
        <FirebaseClientProvider app={app} auth={auth} firestore={firestore}>
            <ThemeProvider>
                <BlockProvider>
                    <VoiceProvider>
                        <DMCallProvider>
                            <AuthGuard>
                                {children}
                                <ServerRail />
                                <DMCallManager />
                            </AuthGuard>
                        </DMCallProvider>
                    </VoiceProvider>
                </BlockProvider>
            </ThemeProvider>
        </FirebaseClientProvider>
    );
}

    
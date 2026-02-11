"use client";

import { ThemeProvider } from "@/context/ThemeContext";
import { VoiceProvider } from "@/context/VoiceContext";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider>
            <VoiceProvider>{children}</VoiceProvider>
        </ThemeProvider>
    );
}

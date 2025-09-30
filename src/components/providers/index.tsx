"use client";

import React from "react";
import { AppProvider } from "@/contexts";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AppProvider>
            {children}
        </AppProvider>
    );
}

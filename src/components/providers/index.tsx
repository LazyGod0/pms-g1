"use client";
"use client";
import React from "react";
import { AppProvider } from "@/contexts";
import { AppThemeProvider } from "./ThemeProvider";
import { NotificationProvider } from "./NotificationProvider";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AppProvider>
            <AppThemeProvider>
                <NotificationProvider>
                    {children}
                </NotificationProvider>
            </AppThemeProvider>
        </AppProvider>
    );
}

import React from "react";
import { useTheme } from "@/contexts";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";

// Define theme configurations
const getTheme = (mode: "light" | "dark") =>
    createTheme({
        palette: {
            mode,
            ...(mode === "light"
                ? {
                    // Light mode colors
                    primary: {
                        main: "#1976d2",
                        light: "#42a5f5",
                        dark: "#1565c0",
                    },
                    secondary: {
                        main: "#9c27b0",
                        light: "#ba68c8",
                        dark: "#7b1fa2",
                    },
                    background: {
                        default: "#fafafa",
                        paper: "#ffffff",
                    },
                    text: {
                        primary: "#212121",
                        secondary: "#757575",
                    },
                }
                : {
                    // Dark mode colors
                    primary: {
                        main: "#90caf9",
                        light: "#e3f2fd",
                        dark: "#42a5f5",
                    },
                    secondary: {
                        main: "#ce93d8",
                        light: "#f3e5f5",
                        dark: "#ba68c8",
                    },
                    background: {
                        default: "#121212",
                        paper: "#1e1e1e",
                    },
                    text: {
                        primary: "#ffffff",
                        secondary: "#b0b0b0",
                    },
                }),
        },
        typography: {
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
            h1: {
                fontWeight: 700,
            },
            h2: {
                fontWeight: 700,
            },
            h3: {
                fontWeight: 600,
            },
            h4: {
                fontWeight: 600,
            },
            h5: {
                fontWeight: 600,
            },
            h6: {
                fontWeight: 600,
            },
        },
        shape: {
            borderRadius: 12,
        },
        components: {
            MuiButton: {
                styleOverrides: {
                    root: {
                        textTransform: "none",
                        borderRadius: 8,
                        fontWeight: 600,
                    },
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        borderRadius: 16,
                        boxShadow: mode === "light"
                            ? "0 2px 8px rgba(0,0,0,0.1)"
                            : "0 2px 8px rgba(0,0,0,0.3)",
                    },
                },
            },
            MuiTextField: {
                styleOverrides: {
                    root: {
                        "& .MuiOutlinedInput-root": {
                            borderRadius: 10,
                        },
                    },
                },
            },
        },
    });

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
    const { theme } = useTheme();
    const muiTheme = getTheme(theme);

    return (
        <ThemeProvider theme={muiTheme}>
            <CssBaseline />
            {children}
        </ThemeProvider>
    );
}

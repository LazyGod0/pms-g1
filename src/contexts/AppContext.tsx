"use client";

import React, { createContext, useContext, useReducer, useEffect } from "react";
import { User } from "firebase/auth";
import { auth } from "@/configs/firebase-config";
import { onAuthStateChanged } from "firebase/auth";

// Types
export interface AppState {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    theme: "light" | "dark";
    language: "th" | "en";
    notifications: Notification[];
    sidebarOpen: boolean;
}

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: "success" | "error" | "warning" | "info";
    timestamp: Date;
    read: boolean;
}

type AppAction =
    | { type: "SET_USER"; payload: User | null }
    | { type: "SET_LOADING"; payload: boolean }
    | { type: "SET_THEME"; payload: "light" | "dark" }
    | { type: "SET_LANGUAGE"; payload: "th" | "en" }
    | { type: "ADD_NOTIFICATION"; payload: Notification }
    | { type: "REMOVE_NOTIFICATION"; payload: string }
    | { type: "MARK_NOTIFICATION_READ"; payload: string }
    | { type: "CLEAR_NOTIFICATIONS" }
    | { type: "TOGGLE_SIDEBAR" }
    | { type: "SET_SIDEBAR"; payload: boolean };

// Initial State
const initialState: AppState = {
    user: null,
    loading: true,
    isAuthenticated: false,
    theme: "light",
    language: "th",
    notifications: [],
    sidebarOpen: false,
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
    switch (action.type) {
        case "SET_USER":
            return {
                ...state,
                user: action.payload,
                isAuthenticated: !!action.payload,
                loading: false,
            };
        case "SET_LOADING":
            return {
                ...state,
                loading: action.payload,
            };
        case "SET_THEME":
            return {
                ...state,
                theme: action.payload,
            };
        case "SET_LANGUAGE":
            return {
                ...state,
                language: action.payload,
            };
        case "ADD_NOTIFICATION":
            return {
                ...state,
                notifications: [action.payload, ...state.notifications],
            };
        case "REMOVE_NOTIFICATION":
            return {
                ...state,
                notifications: state.notifications.filter(n => n.id !== action.payload),
            };
        case "MARK_NOTIFICATION_READ":
            return {
                ...state,
                notifications: state.notifications.map(n =>
                    n.id === action.payload ? { ...n, read: true } : n
                ),
            };
        case "CLEAR_NOTIFICATIONS":
            return {
                ...state,
                notifications: [],
            };
        case "TOGGLE_SIDEBAR":
            return {
                ...state,
                sidebarOpen: !state.sidebarOpen,
            };
        case "SET_SIDEBAR":
            return {
                ...state,
                sidebarOpen: action.payload,
            };
        default:
            return state;
    }
}

// Context
interface AppContextType {
    state: AppState;
    dispatch: React.Dispatch<AppAction>;
    // Helper functions
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;
    setTheme: (theme: "light" | "dark") => void;
    setLanguage: (language: "th" | "en") => void;
    addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void;
    removeNotification: (id: string) => void;
    markNotificationRead: (id: string) => void;
    clearNotifications: () => void;
    toggleSidebar: () => void;
    setSidebar: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider Component
export function AppProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(appReducer, initialState);

    // Firebase Auth State Listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            dispatch({ type: "SET_USER", payload: user });
        });

        return () => unsubscribe();
    }, []);

    // Load theme and language from localStorage
    useEffect(() => {
        const savedTheme = localStorage.getItem("theme") as "light" | "dark";
        const savedLanguage = localStorage.getItem("language") as "th" | "en";

        if (savedTheme) {
            dispatch({ type: "SET_THEME", payload: savedTheme });
        }

        if (savedLanguage) {
            dispatch({ type: "SET_LANGUAGE", payload: savedLanguage });
        }
    }, []);

    // Save theme and language to localStorage
    useEffect(() => {
        localStorage.setItem("theme", state.theme);
    }, [state.theme]);

    useEffect(() => {
        localStorage.setItem("language", state.language);
    }, [state.language]);

    // Helper functions
    const setUser = (user: User | null) => {
        dispatch({ type: "SET_USER", payload: user });
    };

    const setLoading = (loading: boolean) => {
        dispatch({ type: "SET_LOADING", payload: loading });
    };

    const setTheme = (theme: "light" | "dark") => {
        dispatch({ type: "SET_THEME", payload: theme });
    };

    const setLanguage = (language: "th" | "en") => {
        dispatch({ type: "SET_LANGUAGE", payload: language });
    };

    const addNotification = (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
        const newNotification: Notification = {
            ...notification,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date(),
            read: false,
        };
        dispatch({ type: "ADD_NOTIFICATION", payload: newNotification });

        // Auto remove notification after 5 seconds for success/info types
        if (notification.type === "success" || notification.type === "info") {
            setTimeout(() => {
                dispatch({ type: "REMOVE_NOTIFICATION", payload: newNotification.id });
            }, 5000);
        }
    };

    const removeNotification = (id: string) => {
        dispatch({ type: "REMOVE_NOTIFICATION", payload: id });
    };

    const markNotificationRead = (id: string) => {
        dispatch({ type: "MARK_NOTIFICATION_READ", payload: id });
    };

    const clearNotifications = () => {
        dispatch({ type: "CLEAR_NOTIFICATIONS" });
    };

    const toggleSidebar = () => {
        dispatch({ type: "TOGGLE_SIDEBAR" });
    };

    const setSidebar = (open: boolean) => {
        dispatch({ type: "SET_SIDEBAR", payload: open });
    };

    const contextValue: AppContextType = {
        state,
        dispatch,
        setUser,
        setLoading,
        setTheme,
        setLanguage,
        addNotification,
        removeNotification,
        markNotificationRead,
        clearNotifications,
        toggleSidebar,
        setSidebar,
    };

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
}

// Custom Hook
export function useApp() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error("useApp must be used within an AppProvider");
    }
    return context;
}

// Auth Hook
export function useAuth() {
    const { state } = useApp();
    return {
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        loading: state.loading,
    };
}

// Theme Hook
export function useTheme() {
    const { state, setTheme } = useApp();
    return {
        theme: state.theme,
        setTheme,
        isDark: state.theme === "dark",
        toggleTheme: () => setTheme(state.theme === "light" ? "dark" : "light"),
    };
}

// Language Hook
export function useLanguage() {
    const { state, setLanguage } = useApp();
    return {
        language: state.language,
        setLanguage,
        isEnglish: state.language === "en",
        isThai: state.language === "th",
        toggleLanguage: () => setLanguage(state.language === "th" ? "en" : "th"),
    };
}

// Notifications Hook
export function useNotifications() {
    const { state, addNotification, removeNotification, markNotificationRead, clearNotifications } = useApp();
    return {
        notifications: state.notifications,
        unreadCount: state.notifications.filter(n => !n.read).length,
        addNotification,
        removeNotification,
        markNotificationRead,
        clearNotifications,
        // Helper functions for common notification types
        showSuccess: (title: string, message: string) =>
            addNotification({ title, message, type: "success" }),
        showError: (title: string, message: string) =>
            addNotification({ title, message, type: "error" }),
        showWarning: (title: string, message: string) =>
            addNotification({ title, message, type: "warning" }),
        showInfo: (title: string, message: string) =>
            addNotification({ title, message, type: "info" }),
    };
}

// Sidebar Hook
export function useSidebar() {
    const { state, toggleSidebar, setSidebar } = useApp();
    return {
        isOpen: state.sidebarOpen,
        toggle: toggleSidebar,
        open: () => setSidebar(true),
        close: () => setSidebar(false),
    };
}

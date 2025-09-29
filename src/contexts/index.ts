import { useApp, useAuth, useTheme, useLanguage, useNotifications, useSidebar } from "./AppContext";

// Re-export all hooks and types for easier imports
export {
    // Main Context
    useApp,

    // Specific hooks
    useAuth,
    useTheme,
    useLanguage,
    useNotifications,
    useSidebar,
} from "./AppContext";

export type {
    AppState,
    Notification,
} from "./AppContext";

// Provider
export { AppProvider } from "./AppContext";

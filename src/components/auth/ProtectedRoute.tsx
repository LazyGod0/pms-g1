"use client";

import { useAuth } from "@/contexts";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import dynamic from "next/dynamic";

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: "admin" | "editor" | "user" | "lecturer";
    redirectTo?: string;
}

function ProtectedRouteContent({
    children,
    requiredRole = "user",
    redirectTo = "/"
}: ProtectedRouteProps) {
    const { user, loading, isAuthenticated } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [hasRedirected, setHasRedirected] = useState(false);

    useEffect(() => {
        if (!loading && !hasRedirected) {
            // ไม่ได้ login
            if (!isAuthenticated) {
                setHasRedirected(true);
                router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
                return;
            }

            // ตรวจสอบ role
            if (requiredRole === "admin" && user?.role !== "admin") {
                setHasRedirected(true);
                router.push(redirectTo);
                return;
            }

            if (requiredRole === "editor" && !["admin", "editor"].includes(user?.role || "")) {
                setHasRedirected(true);
                router.push(redirectTo);
                return;
            }

            if (requiredRole === "lecturer" && !["admin", "editor", "lecturer"].includes(user?.role || "")) {
                setHasRedirected(true);
                router.push(redirectTo);
                return;
            }
        }
    }, [loading, isAuthenticated, user, router, requiredRole, redirectTo, pathname, hasRedirected]);

    // Show loading while checking authentication
    if (loading || hasRedirected) {
        return (
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "100vh",
                    gap: 2,
                }}
            >
                <CircularProgress />
                <Typography color="text.secondary">กำลังตรวจสอบสิทธิ์...</Typography>
            </Box>
        );
    }

    // ถ้าไม่ได้รับอนุญาต
    if (!isAuthenticated ||
        (requiredRole === "admin" && user?.role !== "admin") ||
        (requiredRole === "editor" && !["admin", "editor"].includes(user?.role || "")) ||
        (requiredRole === "lecturer" && !["admin", "editor", "lecturer"].includes(user?.role || ""))) {
        return (
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "100vh",
                    gap: 2,
                }}
            >
                <CircularProgress />
                <Typography color="text.secondary">กำลังเปลี่ยนเส้นทาง...</Typography>
            </Box>
        );
    }

    return <>{children}</>;
}

// Export as dynamic component to prevent SSR
export const ProtectedRoute = dynamic(
    () => Promise.resolve(ProtectedRouteContent),
    {
        ssr: false,
        loading: () => (
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "100vh",
                    gap: 2,
                }}
            >
                <CircularProgress />
                <Typography color="text.secondary">กำลังโหลด...</Typography>
            </Box>
        ),
    }
);

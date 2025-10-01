"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "firebase/auth";
import { auth } from "@/configs/firebase-config";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, getFirestore } from "firebase/firestore";

// Types
export type UserRole = "admin" | "user" | "editor" | "lecturer" | "staff"

interface AuthUser extends User {
    role?: UserRole;
}

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    isAuthenticated: boolean;
    isAdmin: boolean;
    setUser: (user: AuthUser | null) => void;
    setLoading: (loading: boolean) => void;
    getUserRole: () => UserRole | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const db = getFirestore();

// Function to get user role from Firestore by querying uid field
async function getUserRoleFromDB(user: User): Promise<UserRole> {
    try {
        console.log("Fetching role for UID:", user.uid, "Email:", user.email);

        // Query โดยใช้ฟิลด์ uid แทนการใช้ uid เป็น document ID
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("uid", "==", user.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            // ใช้ document แรกที่พบ (ควรมีเพียงเอกสารเดียว)
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();

            console.log("Found user data:", userData);
            console.log("Document ID:", userDoc.id);

            if (userData?.role) {
                console.log("User role from DB:", userData.role);
                return userData.role as UserRole;
            }
        } else {
            console.log("No user document found with UID:", user.uid);

            // ลองค้นหาด้วยอีเมลเป็น fallback
            const emailQuery = query(usersRef, where("email", "==", user.email));
            const emailSnapshot = await getDocs(emailQuery);

            if (!emailSnapshot.empty) {
                const userDoc = emailSnapshot.docs[0];
                const userData = userDoc.data();

                console.log("Found user by email:", userData);
                console.log("Document ID:", userDoc.id);

                if (userData?.role) {
                    console.log("User role from DB (by email):", userData.role);
                    return userData.role as UserRole;
                }
            } else {
                console.log("No user document found with email:", user.email);
            }
        }

        // ถ้าไม่พบ document หรือไม่มี role ให้เป็น user
        console.log("Defaulting to user role");
        return "user";
    } catch (error) {
        console.error("Error fetching user role:", error);
        return "user";
    }
}

// Provider Component
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    const isAuthenticated = !!user;
    const isAdmin = user?.role === "admin";

    // Firebase Auth State Listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                console.log("User authentication changed:", firebaseUser.email);
                console.log("Firebase Auth UID:", firebaseUser.uid);

                // ดึง role จากฐานข้อมูล
                const role = await getUserRoleFromDB(firebaseUser);

                const userWithRole: AuthUser = {
                    ...firebaseUser,
                    role: role
                };

                setUser(userWithRole);
                console.log("Final user object:", {
                    email: userWithRole.email,
                    uid: userWithRole.uid,
                    role: userWithRole.role,
                    isAdmin: role === "admin"
                });
            } else {
                console.log("User logged out");
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const getUserRoleFunction = () => {
        return user?.role || null;
    };

    const contextValue: AuthContextType = {
        user,
        loading,
        isAuthenticated,
        isAdmin,
        setUser,
        setLoading,
        getUserRole: getUserRoleFunction,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom Hook
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

// Export for backward compatibility
export const useApp = useAuth;
export const AppProvider = AuthProvider;

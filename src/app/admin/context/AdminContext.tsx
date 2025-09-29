"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/configs/firebase-config";
import { User } from "../components/user-types";

// Activity types
export interface Activity {
    id: string;
    userId: string;
    userName: string;
    action: "create" | "edit" | "delete" | "import";
    actionText: string;
    targetName: string;
    targetId?: string;
    timestamp: any;
    createdAt: any;
}

interface AdminContextType {
    users: User[];
    activities: Activity[];
    stats: {
        total: number;
        lecturers: number;
        admins: number;
        staff: number;
    };
    loading: boolean;
    addActivity: (activity: Omit<Activity, "id" | "timestamp" | "createdAt">) => Promise<void>;
    refreshUsers: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error("useAdmin must be used within an AdminProvider");
    }
    return context;
};

interface AdminProviderProps {
    children: ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    // Listen to users collection
    useEffect(() => {
        const usersQuery = query(collection(db, "users"));
        
        const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
            const usersData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as User[];
            
            setUsers(usersData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching users:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Listen to activities collection
    useEffect(() => {
        const activitiesQuery = query(
            collection(db, "activities"),
            orderBy("createdAt", "desc"),
            limit(10)
        );

        const unsubscribe = onSnapshot(activitiesQuery, (snapshot) => {
            const activitiesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Activity[];
            
            setActivities(activitiesData);
        }, (error) => {
            console.error("Error fetching activities:", error);
            // If activities collection doesn't exist, just continue without error
            if (!error.message.includes("NOT_FOUND")) {
                console.error("Unexpected error:", error);
            }
        });

        return () => unsubscribe();
    }, []);

    // Calculate stats
    const stats = React.useMemo(() => {
        const total = users.length;
        const lecturers = users.filter(user => user.role === "lecturer").length;
        const admins = users.filter(user => user.role === "admin").length;
        const staff = users.filter(user => user.role === "staff").length;

        return { total, lecturers, admins, staff };
    }, [users]);

    // Add activity function
    const addActivity = async (activity: Omit<Activity, "id" | "timestamp" | "createdAt">) => {
        try {
            await addDoc(collection(db, "activities"), {
                ...activity,
                timestamp: serverTimestamp(),
                createdAt: serverTimestamp(),
            });
        } catch (error) {
            console.error("Error adding activity:", error);
        }
    };

    const refreshUsers = () => {
        // Force refresh is handled by the real-time listener
        setLoading(true);
    };

    const value: AdminContextType = {
        users,
        activities,
        stats,
        loading,
        addActivity,
        refreshUsers,
    };

    return (
        <AdminContext.Provider value={value}>
            {children}
        </AdminContext.Provider>
    );
};
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { useAuth } from "@/contexts";
import { User } from "../components/user-types";

const db = getFirestore();

// Mock data as fallback when Firestore is not accessible
const mockUsers: User[] = [
    {
        id: "1",
        name: "Science",
        email: "popworks002@gmail.com",
        role: "admin",
        faculty: "Topfy",
        department: "Computer",
        phone: "0945813503",
    },
    {
        id: "2",
        name: "John Doe",
        email: "john@example.com",
        role: "lecturer",
        faculty: "Engineering",
        department: "Software Engineering",
        phone: "0812345678",
    },
    {
        id: "3",
        name: "Jane Smith",
        email: "jane@example.com",
        role: "staff",
        faculty: "Science",
        department: "Computer Science",
        phone: "0823456789",
    },
];

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
    error: string | null;
    usingMockData: boolean;
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
    const { user, isAuthenticated, isAdmin } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [usingMockData, setUsingMockData] = useState(false);

    // Listen to users collection - with fallback to mock data
    useEffect(() => {
        if (!isAuthenticated || !isAdmin || !user) {
            setLoading(false);
            setError("ไม่มีสิทธิ์เข้าถึงข้อมูล");
            return;
        }

        console.log("Fetching users data for admin:", user.email);

        // Query all users - this should now work with the new security rules
        const usersQuery = query(collection(db, "users"));

        const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
            try {
                const usersData = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,  // Use Firestore document ID
                        uid: data.uid || doc.id,  // Include uid if it exists
                        name: data.name || '',
                        email: data.email || '',
                        role: data.role || 'staff',
                        faculty: data.faculty || '',
                        department: data.department || '',
                        phone: data.phone || '',
                        createdAt: data.createdAt,
                        updatedAt: data.updatedAt
                    };
                }) as User[];

                console.log("Users data fetched from Firestore:", usersData.length);
                console.log("Sample user data:", usersData[0]);

                setUsers(usersData);
                setError(null);
                setUsingMockData(false);
                setLoading(false);
            } catch (err: any) {
                console.error("Error processing users data:", err);
                // Fall back to mock data
                console.warn("Falling back to mock data");
                setUsers(mockUsers);
                setError("กำลังใช้ข้อมูลตัวอย่าง (ไม่สามารถเชื่อมต่อฐานข้อมูลได้)");
                setUsingMockData(true);
                setLoading(false);
            }
        }, (firebaseError) => {
            console.error("Firebase permission error:", firebaseError);

            // Handle specific Firebase errors with fallback to mock data
            if (firebaseError.code === 'permission-denied') {
                console.warn("Permission denied, using mock data");
                setUsers(mockUsers);
                setError("กำลังใช้ข้อมูลตัวอย่าง (Firestore Rules ยังไม่อนุญาตให้เข้าถึงข้อมูล)");
                setUsingMockData(true);
            } else if (firebaseError.code === 'unavailable') {
                setUsers(mockUsers);
                setError("กำลังใช้ข้อมูลตัวอย่าง (ไม่สามารถเชื่อมต่อฐานข้อมูลได้)");
                setUsingMockData(true);
            } else {
                setUsers(mockUsers);
                setError(`กำลังใช้ข้อมูลตัวอย่าง (${firebaseError.message})`);
                setUsingMockData(true);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [isAuthenticated, isAdmin, user]);

    // Optional activities collection - with error handling
    useEffect(() => {
        if (!isAuthenticated || !isAdmin || !user || usingMockData) {
            return;
        }

        const activitiesQuery = query(
            collection(db, "activities"),
            orderBy("createdAt", "desc"),
            limit(10)
        );

        const unsubscribe = onSnapshot(activitiesQuery, (snapshot) => {
            try {
                const activitiesData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Activity[];

                setActivities(activitiesData);
            } catch (err) {
                console.error("Error processing activities data:", err);
            }
        }, (error) => {
            console.warn("Activities collection not accessible:", error.message);
            // Don't set error for activities as it's optional
        });

        return () => unsubscribe();
    }, [isAuthenticated, isAdmin, user, usingMockData]);

    // Calculate stats
    const stats = React.useMemo(() => {
        const total = users.length;
        const lecturers = users.filter(user => user.role === "lecturer").length;
        const admins = users.filter(user => user.role === "admin").length;
        const staff = users.filter(user => user.role === "staff").length;

        return {
            total,
            lecturers,
            admins,
            staff,
        };
    }, [users]);

    const addActivity = async (activity: Omit<Activity, "id" | "timestamp" | "createdAt">) => {
        if (usingMockData) {
            console.log("Mock activity:", activity);
            return;
        }

        try {
            await addDoc(collection(db, "activities"), {
                ...activity,
                timestamp: serverTimestamp(),
                createdAt: serverTimestamp(),
            });
        } catch (error: any) {
            console.error("Error adding activity:", error);
            // Don't throw error for activities as it's optional
        }
    };

    const refreshUsers = () => {
        if (usingMockData) {
            console.log("Cannot refresh when using mock data");
            return;
        }
        setLoading(true);
        setError(null);
    };

    const value: AdminContextType = {
        users,
        activities,
        stats,
        loading,
        error,
        usingMockData,
        addActivity,
        refreshUsers,
    };

    return (
        <AdminContext.Provider value={value}>
            {children}
        </AdminContext.Provider>
    );
};
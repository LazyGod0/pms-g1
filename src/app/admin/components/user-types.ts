/* -------------------------------------------------
   Types & Interfaces
------------------------------------------------- */
export type UserRole = "admin" | "lecturer" | "staff";

export type User = {
    id: string;          // Firestore document ID
    name: string;
    email: string;
    role: UserRole;
    faculty: string;
    department: string;
    phone: string;
    createdAt?: any;     // Firestore timestamp
    updatedAt?: any;     // Firestore timestamp
};

export type SearchFiltersType = {
    keyword?: string;
    role?: UserRole | "";
};

export type UserFormData = Omit<User, "id" | "createdAt" | "updatedAt"> & {
    password?: string;
};


export function searchUsers(users: User[], filters: SearchFiltersType): User[] {
    const keyword = filters.keyword?.toLowerCase().trim();
    return users.filter((user) => {
        const matchesKeyword = !keyword ||
            user.name.toLowerCase().includes(keyword) ||
            user.email.toLowerCase().includes(keyword) ||
            user.faculty?.toLowerCase().includes(keyword) ||
            user.department?.toLowerCase().includes(keyword);

        const matchesRole = !filters.role || user.role === filters.role;

        return matchesKeyword && matchesRole
    });
}

export function getRoleLabel(role: UserRole): string {
    const roleLabels = {
        admin: "ผู้ดูแลระบบ",
        lecturer: "อาจารย์",
        staff: "เจ้าหน้าที่",
    };
    return roleLabels[role];
}

export function getRoleColor(role: UserRole): "primary" | "secondary" | "success" | "warning" {
    const roleColors = {
        admin: "warning" as const,
        lecturer: "primary" as const,
        staff: "secondary" as const,
    };
    return roleColors[role];
}
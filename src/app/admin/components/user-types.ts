/* -------------------------------------------------
   Types & Interfaces
------------------------------------------------- */
export type UserRole = "admin" | "lecturer" | "staff" | "student";

export type User = {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    faculty?: string;
    department?: string;
    phone?: string;
    joinDate: string;
    status: "active" | "inactive";
};

export type SearchFiltersType = {
    keyword?: string;
    role?: UserRole | "";
    status?: "active" | "inactive" | "";
};

export type UserFormData = Omit<User, "id" | "joinDate"> & {
    password?: string;
};

/* -------------------------------------------------
   Mock Data & Utility Functions
------------------------------------------------- */
export const mockUsers: User[] = [
    {
        id: "1",
        name: "ดร.สมชาย วงศ์ใหญ่",
        email: "somchai.w@university.ac.th",
        role: "lecturer",
        faculty: "วิทยาศาสตร์",
        department: "วิทยาการคอมพิวเตอร์",
        phone: "081-234-5678",
        joinDate: "2020-01-15",
        status: "active",
    },
    {
        id: "2",
        name: "สมหญิง จันทร์เจริญ",
        email: "somying.c@university.ac.th",
        role: "staff",
        faculty: "วิทยาศาสตร์",
        department: "สำนักงานคณบดี",
        phone: "081-345-6789",
        joinDate: "2019-03-20",
        status: "active",
    },
    {
        id: "3",
        name: "John Smith",
        email: "john.smith@student.university.ac.th",
        role: "student",
        faculty: "วิทยาศาสตร์",
        department: "วิทยาการคอมพิวเตอร์",
        phone: "081-456-7890",
        joinDate: "2023-06-01",
        status: "active",
    },
    {
        id: "4",
        name: "ผู้ดูแลระบบ",
        email: "admin@university.ac.th",
        role: "admin",
        faculty: "สำนักงานอธิการบดี",
        department: "สำนักเทคโนโลยีสารสนเทศ",
        phone: "081-567-8901",
        joinDate: "2018-01-01",
        status: "active",
    },
    {
        id: "5",
        name: "อาจารย์มานี กิจดี",
        email: "manee.k@university.ac.th",
        role: "lecturer",
        faculty: "วิศวกรรมศาสตร์",
        department: "วิศวกรรมคอมพิวเตอร์",
        phone: "081-678-9012",
        joinDate: "2021-08-15",
        status: "inactive",
    },
];

export function searchUsers(users: User[], filters: SearchFiltersType): User[] {
    const keyword = filters.keyword?.toLowerCase().trim();
    return users.filter((user) => {
        const matchesKeyword = !keyword || 
            user.name.toLowerCase().includes(keyword) ||
            user.email.toLowerCase().includes(keyword) ||
            user.faculty?.toLowerCase().includes(keyword) ||
            user.department?.toLowerCase().includes(keyword);
        
        const matchesRole = !filters.role || user.role === filters.role;
        const matchesStatus = !filters.status || user.status === filters.status;
        
        return matchesKeyword && matchesRole && matchesStatus;
    });
}

export function getRoleLabel(role: UserRole): string {
    const roleLabels = {
        admin: "ผู้ดูแลระบบ",
        lecturer: "อาจารย์",
        staff: "เจ้าหน้าที่",
        student: "นักศึกษา",
    };
    return roleLabels[role];
}

export function getRoleColor(role: UserRole): "primary" | "secondary" | "success" | "warning" {
    const roleColors = {
        admin: "warning" as const,
        lecturer: "primary" as const,
        staff: "secondary" as const,
        student: "success" as const,
    };
    return roleColors[role];
}

export function getStatusColor(status: "active" | "inactive"): "success" | "default" {
    return status === "active" ? "success" : "default";
}
"use client";

import React, { useMemo, useState } from "react";
import { Container } from "@mui/material";
import Dashboard from "./components/dashboard-admin";
import DashboardExtras from "./components/dashboard-extras";
import ManageUsersComponent from "./components/manage-users";
import { User, role } from "@/types/user";

export default function ManageUsers() {
    const [users, setUsers] = useState<User[]>([]);

    const stats = useMemo(() => ({
        total: users.length,
        lecturers: users.filter((u: User) => u.role === role.lecturer).length,
        admins: users.filter((u: User) => u.role === role.admin).length,
        staff: users.filter((u: User) => u.role === role.staff).length,
    }), [users]);

    const handleAddUser = () => {
        // This function can be used to handle add user actions from Dashboard
        console.log("Add user clicked from Dashboard");
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Dashboard stats={stats} onAddUser={handleAddUser} />
            <DashboardExtras onAddUser={handleAddUser} />
            <ManageUsersComponent />
        </Container>
    );
}
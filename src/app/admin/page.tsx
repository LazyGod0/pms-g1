"use client";

import React, { useMemo, useState } from "react";
import { Container } from "@mui/material";
import Dashboard from "./components/dashboard-admin";
import ManageUsersComponent from "./components/manage-users";
import { User, mockUsers } from "./components/user-types";

export default function ManageUsers() {
    const [users, setUsers] = useState<User[]>(mockUsers);

    const stats = useMemo(() => ({
        total: users.length,
        active: users.filter(u => u.status === "active").length,
        lecturers: users.filter(u => u.role === "lecturer").length,
        students: users.filter(u => u.role === "student").length,
    }), [users]);

    const handleAddUser = () => {
        // This function can be used to handle add user actions from Dashboard
        console.log("Add user clicked from Dashboard");
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Dashboard stats={stats} onAddUser={handleAddUser} />
            <ManageUsersComponent />
        </Container>
    );
}
"use client";

import React from "react";
import { Container } from "@mui/material";
import Dashboard from "./components/dashboard-admin";
import DashboardExtras from "./components/dashboard-extras";
import ManageUsersComponent from "./components/manage-users";
import { AdminProvider } from "./context/AdminContext";

export default function ManageUsers() {
    const handleAddUser = () => {
        // This function can be used to handle add user actions from Dashboard
        console.log("Add user clicked from Dashboard");
    };

    return (
        <AdminProvider>
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Dashboard onAddUser={handleAddUser} />
                <DashboardExtras onAddUser={handleAddUser} />
                <ManageUsersComponent />
            </Container>
        </AdminProvider>
    );
}
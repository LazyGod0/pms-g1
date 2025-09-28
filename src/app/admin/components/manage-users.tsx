"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
    Box,
    Grid,
    Pagination,
    Stack,
    Typography,
    Alert,
    Snackbar,
    CircularProgress,
} from "@mui/material";

// Import แยก components
import UserCard from "./user-card";
import UserTable from "./user-table";
import SearchControls from "./search-controls";
import UserFormDialog from "./user-form-dialog";
import DeleteConfirmDialog from "./delete-confirm-dialog";
import EmptyState from "./empty-state";
import { 
    User, 
    UserFormData, 
    SearchFiltersType, 
    searchUsers 
} from "./user-types";

const ManageUsersComponent: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<SearchFiltersType>({
        keyword: "",
        role: "",
    });
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
    const [currentPage, setCurrentPage] = useState(1);
    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
        open: false,
        message: "",
        severity: "success",
    });

    const itemsPerPage = 12;

    // Load users from Firebase on component mount
    useEffect(() => {
        fetchUsers();
    }, []);

    // Firebase API functions
    const fetchUsers = async () => {
        try {
            setLoading(true);
            console.log('Fetching users from API...');
            
            const response = await fetch('/api/admin', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            console.log('Fetch response status:', response.status);

            if (!response.ok) {
                throw new Error(`Failed to fetch users: ${response.status}`);
            }

            const data = await response.json();
            console.log('Fetched users:', data);
            setUsers(data.users || []);
            
            if (data.users.length === 0) {
                console.log('No users found in database');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            setSnackbar({
                open: true,
                message: "เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้งาน กรุณาตรวจสอบการเชื่อมต่อ Firebase",
                severity: "error",
            });
            // ตั้งค่า users เป็น array ว่าง เมื่อเกิด error
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const createUser = async (userData: UserFormData) => {
        try {
            console.log('Creating user with data:', userData);
            
            const response = await fetch('/api/admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            console.log('API Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json();
                console.error('API Error:', errorData);
                
                // แสดง error message ที่เฉพาะเจาะจงขึ้น
                if (response.status === 409) {
                    throw new Error('อีเมลนี้มีผู้ใช้งานแล้ว กรุณาใช้อีเมลอื่น');
                } else if (response.status === 400) {
                    throw new Error('ข้อมูลไม่ครบถ้วน กรุณากรอกข้อมูลที่จำเป็นให้ครบ');
                } else {
                    throw new Error(errorData.message || 'เกิดข้อผิดพลาดในการสร้างผู้ใช้งาน');
                }
            }

            const data = await response.json();
            console.log('User created successfully:', data.user);
            setUsers(prevUsers => [...prevUsers, data.user]);
            return data.user;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    };

    const updateUser = async (id: string, userData: Partial<UserFormData>) => {
        try {
            const response = await fetch(`/api/admin/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update user');
            }

            const data = await response.json();
            setUsers(prevUsers => 
                prevUsers.map(user => 
                    user.id === id ? data.user : user
                )
            );
            return data.user;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    };

    const deleteUser = async (id: string) => {
        try {
            const response = await fetch(`/api/admin/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete user');
            }

            setUsers(prevUsers => prevUsers.filter(user => user.id !== id));
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    };

    // Filter และ search users
    const filteredUsers = useMemo(() => {
        return searchUsers(users, filters);
    }, [users, filters]);

    // Pagination
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const currentUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredUsers, currentPage, itemsPerPage]);

    // Event handlers
    const handleFiltersChange = (newFilters: SearchFiltersType) => {
        setFilters(newFilters);
        setCurrentPage(1);
    };

    const handleViewModeChange = (mode: "cards" | "table") => {
        setViewMode(mode);
    };

    const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
        setCurrentPage(value);
    };

    const handleAddUser = () => {
        setEditingUser(null);
        setFormDialogOpen(true);
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setFormDialogOpen(true);
    };

    const handleDeleteUser = (user: User) => {
        setDeletingUser(user);
        setDeleteDialogOpen(true);
    };

    const handleFormSubmit = async (formData: UserFormData) => {
        try {
            if (editingUser) {
                // Update existing user
                await updateUser(editingUser.id, formData);
                setSnackbar({
                    open: true,
                    message: "อัปเดตข้อมูลผู้ใช้งานเรียบร้อยแล้ว",
                    severity: "success",
                });
            } else {
                // Add new user
                await createUser(formData);
                setSnackbar({
                    open: true,
                    message: "เพิ่มผู้ใช้งานใหม่เรียบร้อยแล้ว",
                    severity: "success",
                });
            }
            setFormDialogOpen(false);
            setEditingUser(null);
        } catch (error) {
            setSnackbar({
                open: true,
                message: error instanceof Error ? error.message : "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
                severity: "error",
            });
        }
    };

    const handleDeleteConfirm = async () => {
        if (deletingUser) {
            try {
                await deleteUser(deletingUser.id);
                setDeleteDialogOpen(false);
                setDeletingUser(null);
                setSnackbar({
                    open: true,
                    message: "ลบผู้ใช้งานเรียบร้อยแล้ว",
                    severity: "success",
                });
            } catch (error) {
                setSnackbar({
                    open: true,
                    message: error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการลบผู้ใช้งาน",
                    severity: "error",
                });
            }
        }
    };

    const handleSnackbarClose = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    if (loading) {
        return (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '400px',
                p: 3 
            }}>
                <Stack alignItems="center" spacing={2}>
                    <CircularProgress size={40} />
                    <Typography variant="body2" color="text.secondary">
                        กำลังโหลดข้อมูลผู้ใช้งาน...
                    </Typography>
                </Stack>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Stack spacing={4}>
                {/* Search Controls */}
                <SearchControls
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    showAdvanced={showAdvancedFilters}
                    onToggleAdvanced={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    viewMode={viewMode}
                    onViewModeChange={handleViewModeChange}
                    onSearch={() => setCurrentPage(1)}
                    onRefresh={fetchUsers}
                    onAddUser={handleAddUser}
                />

                {/* Content */}
                {filteredUsers.length === 0 && !loading ? (
                    <EmptyState 
                        onClearFilters={() => setFilters({ keyword: "", role: "" })}
                        onAddUser={handleAddUser} 
                    />
                ) : (
                    <>
                        {/* Results Count */}
                        <Typography variant="body2" color="text.secondary">
                            พบผู้ใช้งาน {filteredUsers.length} คน {filters.keyword && `จากการค้นหา "${filters.keyword}"`}
                        </Typography>

                        {/* User Display */}
                        {viewMode === "cards" ? (
                            <Grid container spacing={3}>
                                {currentUsers.map((user) => (
                                    <UserCard
                                        key={user.id}
                                        user={user}
                                        onEdit={handleEditUser}
                                        onDelete={(id) => {
                                            const userToDelete = users.find(u => u.id === id);
                                            if (userToDelete) handleDeleteUser(userToDelete);
                                        }}
                                    />
                                ))}
                            </Grid>
                        ) : (
                            <UserTable
                                users={currentUsers}
                                onEdit={handleEditUser}
                                onDelete={(id) => {
                                    const userToDelete = users.find(u => u.id === id);
                                    if (userToDelete) handleDeleteUser(userToDelete);
                                }}
                            />
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <Box display="flex" justifyContent="center" mt={4}>
                                <Pagination
                                    count={totalPages}
                                    page={currentPage}
                                    onChange={handlePageChange}
                                    color="primary"
                                    size="large"
                                    showFirstButton
                                    showLastButton
                                />
                            </Box>
                        )}
                    </>
                )}
            </Stack>

            {/* Dialogs */}
            <UserFormDialog
                open={formDialogOpen}
                user={editingUser || undefined}
                onClose={() => setFormDialogOpen(false)}
                onSave={handleFormSubmit}
            />

            <DeleteConfirmDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleDeleteConfirm}
                userName={deletingUser?.name || ""}
            />

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ManageUsersComponent;
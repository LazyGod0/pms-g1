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
import { useAdmin } from "../context/AdminContext";
import { useAuth } from "@/contexts";
import { logUserActivity } from "@/libs/activity-logger";

const ManageUsersComponent: React.FC = () => {
    const { users, loading, addActivity } = useAdmin();
    const { user: currentUser } = useAuth();
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

    // Users are loaded via AdminContext, no need for manual fetching

    // Firebase API functions will use the real-time data from context

    const createUser = async (userData: UserFormData) => {
        try {
            console.log('Creating user with data:', userData);
            
            const response = await fetch('/api/admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...userData,
                    faculty: userData.faculty || "วิทยาศาสตร์",
                    department: userData.department || "วิทยาการคอมพิวเตอร์"
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('API Error:', errorData);
                
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
            
            // Enhanced activity logging for user creation
            await logUserActivity({
                userId: currentUser?.uid || "admin",
                userEmail: currentUser?.email || "admin@system.com",
                userName: currentUser?.displayName || currentUser?.email || "ผู้ดูแลระบบ",
                userRole: (currentUser as any)?.role || "admin",
                action: "create",
                actionText: "เพิ่มผู้ใช้ใหม่",
                category: "user_management",
                method: "web",
                targetType: "user",
                targetId: data.user.id,
                targetName: userData.name,
                severity: "medium",
                details: `เพิ่มผู้ใช้ใหม่ ${userData.name} (${userData.email}) ในบทบาท ${userData.role} คณะ${userData.faculty || "วิทยาศาสตร์"} ภาค${userData.department || "วิทยาการคอมพิวเตอร์"}`,
                metadata: {
                    newUserData: {
                        email: userData.email,
                        role: userData.role,
                        faculty: userData.faculty || "วิทยาศาสตร์",
                        department: userData.department || "วิทยาการคอมพิวเตอร์",
                        phone: userData.phone
                    },
                    createdVia: "admin_dashboard"
                }
            });
            
            return data.user;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    };

    const updateUser = async (id: string, userData: Partial<UserFormData>) => {
        try {
            // Get original user data for change tracking
            const originalUser = users.find(u => u.id === id);

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
            
            // Track what fields were changed - filter out undefined values
            const changes: Array<{field: string, oldValue: any, newValue: any}> = [];
            if (originalUser) {
                Object.keys(userData).forEach(key => {
                    const oldValue = (originalUser as any)[key];
                    const newValue = (userData as any)[key];
                    // Only track changes where both values are defined and different
                    if (oldValue !== newValue && newValue !== undefined && newValue !== null) {
                        changes.push({
                            field: key,
                            oldValue: oldValue || "", // Ensure no undefined values
                            newValue: newValue
                        });
                    }
                });
            }

            // Enhanced activity logging for user update - ensure no undefined values
            await logUserActivity({
                userId: currentUser?.uid || "admin",
                userEmail: currentUser?.email || "admin@system.com",
                userName: currentUser?.displayName || currentUser?.email || "ผู้ดูแลระบบ",
                userRole: (currentUser as any)?.role || "admin",
                action: "edit",
                actionText: "แก้ไขข้อมูลผู้ใช้",
                category: "user_management",
                method: "web",
                targetType: "user",
                targetId: id,
                targetName: userData.name || originalUser?.name || "ผู้ใช้",
                severity: "medium",
                details: `แก้ไขข้อมูลผู้ใช้ ${userData.name || originalUser?.name || "ผู้ใช้"} - เปลี่ยนแปลง ${changes.length} ฟิลด์`,
                // Only include changes if there are any valid changes
                ...(changes.length > 0 && { changes: changes }),
                metadata: {
                    updatedFields: Object.keys(userData).filter(key => (userData as any)[key] !== undefined),
                    // Only include originalUser data if it exists and has valid values
                    ...(originalUser && {
                        originalUser: {
                            name: originalUser.name || "ไม่ระบุ",
                            email: originalUser.email || "ไม่ระบุ",
                            role: originalUser.role || "user"
                        }
                    }),
                    updatedVia: "admin_dashboard"
                }
            });
            
            return data.user;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    };

    const deleteUser = async (id: string, userName: string) => {
        try {
            const userToDelete = users.find(u => u.id === id);

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

            // Enhanced activity logging for user deletion - ensure no undefined values
            await logUserActivity({
                userId: currentUser?.uid || "admin",
                userEmail: currentUser?.email || "admin@system.com",
                userName: currentUser?.displayName || currentUser?.email || "ผู้ดูแลระบบ",
                userRole: (currentUser as any)?.role || "admin",
                action: "delete",
                actionText: "ลบผู้ใช้",
                category: "user_management",
                method: "web",
                targetType: "user",
                targetId: id,
                targetName: userName,
                severity: "high",
                details: `ลบผู้ใช้ ${userName} (${userToDelete?.email || 'ไม่ทราบอีเมล'}) ออกจากระบบ`,
                metadata: {
                    // Only include deletedUser data if it exists and has valid values
                    ...(userToDelete && {
                        deletedUser: {
                            name: userToDelete.name || "ไม่ระบุ",
                            email: userToDelete.email || "ไม่ระบุ",
                            role: userToDelete.role || "user",
                            faculty: userToDelete.faculty || "ไม่ระบุ",
                            department: userToDelete.department || "ไม่ระบุ"
                        }
                    }),
                    deletedVia: "admin_dashboard",
                    confirmationRequired: true
                }
            });
            
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
                await deleteUser(deletingUser.id, deletingUser.name);
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
                    onRefresh={() => console.log("Refresh triggered")}
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

            {/* เอา UserActivityLogs dialog ออก */}

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

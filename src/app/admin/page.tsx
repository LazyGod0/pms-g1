"use client";

import { useState } from "react";
import { useAuth } from "@/contexts";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/configs/firebase-config";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminProvider } from "./context/AdminContext";
import Dashboard from "./components/dashboard-admin";
import UserFormDialog from "./components/user-form-dialog";
import ManageUsersComponent from "./components/manage-users";
import SystemActivityLogs from "./components/system-activity-logs";
import { UserFormData } from "./components/user-types";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { logUserActivity } from "@/libs/activity-logger";

import {
    Box,
    Container,
    Typography,
    Button,
    Stack,
    Chip,
    Snackbar,
    Alert,
} from "@mui/material";

import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import SecurityIcon from "@mui/icons-material/Security";

const db = getFirestore();

function AdminDashboardContent() {
    const { user } = useAuth();
    const router = useRouter();
    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error";
    }>({
        open: false,
        message: "",
        severity: "success",
    });

    const handleLogout = async () => {
        try {
            // บันทึกประวัติการออกจากระบบก่อน logout
            if (user) {
                await logUserActivity({
                    userId: user.uid,
                    userEmail: user.email || "ไม่ทราบ",
                    userName: user.displayName || user.email || "ผู้ใช้",
                    userRole: "admin",
                    action: "logout",
                    actionText: "ออกจากระบบ",
                    category: "auth",
                    method: "web",
                    targetType: "system",
                    targetName: "Admin Dashboard",
                    severity: "low",
                    details: `ออกจากระบบจาก Admin Dashboard`,
                    metadata: {
                        logoutMethod: "manual",
                        sessionDuration: Date.now() - (user.metadata?.lastSignInTime ? new Date(user.metadata.lastSignInTime).getTime() : Date.now()),
                        currentPage: "/admin"
                    }
                });
            }

            await signOut(auth);
            router.push('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const handleAddUser = () => {
        setFormDialogOpen(true);
    };

    const handleSaveUser = async (userData: UserFormData) => {
        try {
            // ใช้ API endpoint แทนการสร้างผู้ใช้โดยตรง เพื่อไม่ให้ admin logout
            const response = await fetch('/api/admin/create-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userData: userData,
                    adminUid: user?.uid // ส่ง admin UID เพื่อยืนยันสิทธิ์
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to create user');
            }

            // บันทึกประวัติการใช้งาน - เพิ่มผู้ใช้ใหม่
            if (user) {
                await logUserActivity({
                    userId: user.uid,
                    userEmail: user.email || "admin@system.com",
                    userName: user.displayName || user.email || "ผู้ดูแลระบบ",
                    userRole: "admin",
                    action: "create",
                    actionText: "เพิ่มผู้ใช้ใหม่",
                    category: "user_management",
                    method: "web",
                    targetType: "user",
                    targetId: result.user.uid,
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
                        createdVia: "admin_dashboard_api",
                        createdUserUid: result.user.uid,
                        method: "firebase_admin_sdk"
                    }
                });
            }

            setSnackbar({
                open: true,
                message: "เพิ่มผู้ใช้สำเร็จ! ผู้ใช้สามารถ login ด้วย email และ password ที่กำหนดได้ทันที",
                severity: "success",
            });

            setFormDialogOpen(false);
        } catch (error: unknown) {
            console.error("Error adding user:", error);
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
            setSnackbar({
                open: true,
                message: `เกิดข้อผิดพลาด: ${errorMessage}`,
                severity: "error",
            });
        }
    };

    // ฟังก์ชั่นทดสอบการสร้าง activity logs
    const handleTestActivityLog = async () => {
        if (!user) return;

        try {
            console.log("Creating test activity logs for current user:", user.email);

            // สร้าง activity logs ทดสอบหลายแบบ
            const testActivities = [
                {
                    userId: user.uid,
                    userEmail: user.email || "test@admin.com",
                    userName: user.displayName || user.email || "Admin User",
                    userRole: "admin" as const,
                    action: "login",
                    actionText: "เข้าสู่ระบบ (ทดสอบ)",
                    category: "auth",
                    method: "web",
                    targetType: "system",
                    targetName: "Admin Dashboard",
                    severity: "low" as const,
                    details: `เข้าสู่ระบบทดสอบ - เวลา ${new Date().toLocaleString('th-TH')}`,
                    metadata: {
                        testData: true,
                        createdBy: "admin-test-function",
                        timestamp: Date.now()
                    }
                },
                {
                    userId: user.uid,
                    userEmail: user.email || "test@admin.com",
                    userName: user.displayName || user.email || "Admin User",
                    userRole: "admin" as const,
                    action: "create",
                    actionText: "เพิ่มผู้ใช้ใหม่ (ทดสอบ)",
                    category: "user_management",
                    method: "web",
                    targetType: "user",
                    targetName: "Test User",
                    severity: "medium" as const,
                    details: "สร้างผู้ใช้ทดสอบผ่านฟังก์ชั่นทดสอบ",
                    metadata: {
                        testData: true,
                        newUserData: {
                            name: "Test User",
                            email: "test@example.com",
                            role: "staff"
                        }
                    }
                },
                {
                    userId: user.uid,
                    userEmail: user.email || "test@admin.com",
                    userName: user.displayName || user.email || "Admin User",
                    userRole: "admin" as const,
                    action: "view",
                    actionText: "ดูประวัติการใช้งาน (ทดสอบ)",
                    category: "user_management",
                    method: "web",
                    targetType: "user",
                    targetName: "Some User",
                    severity: "low" as const,
                    details: "ดูประวัติการใช้งานของผู้ใช้ผ่านฟังก์ชั่นทดสอบ",
                    metadata: {
                        testData: true,
                        viewType: "user_activity",
                        timestamp: Date.now()
                    }
                }
            ];

            // สร้าง activity logs ทีละตัว
            for (const activity of testActivities) {
                await logUserActivity(activity);
                await new Promise(resolve => setTimeout(resolve, 100)); // รอ 100ms ระหว่างการสร้าง
            }

            setSnackbar({
                open: true,
                message: "สร้าง Activity Logs ทดสอบเรียบร้อยแล้ว! ลองเปิดดูประวัติการใช้งานของผู้ใช้",
                severity: "success",
            });

            console.log("Test activity logs created successfully");
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
            console.error("Error creating test activity logs:", error);
            setSnackbar({
                open: true,
                message: `เกิดข้อผิดพลาดในการสร้าง Activity Logs ทดสอบ: ${errorMessage}`,
                severity: "error",
            });
        }
    };

    return (
        <Box
            sx={(t) => ({
                minHeight: "100vh",
                background: `linear-gradient(135deg, ${t.palette.primary.main}08 0%, ${t.palette.secondary.main}05 50%, transparent 100%)`,
                py: 3,
            })}
        >
            <Container maxWidth="xl">
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                        <Box>
                            <Typography variant="h4" fontWeight={700} gutterBottom>
                                Admin Dashboard
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                ยินดีต้อนรับ, {user?.displayName || user?.email}
                            </Typography>
                        </Box>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Chip
                                icon={<SecurityIcon />}
                                label="Admin"
                                color="primary"
                                variant="outlined"
                            />
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={handleTestActivityLog}
                                sx={{ borderRadius: 2 }}
                                size="small"
                            >
                                ทดสอบ Activity Logs
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<ExitToAppIcon />}
                                onClick={handleLogout}
                                sx={{ borderRadius: 2 }}
                            >
                                ออกจากระบบ
                            </Button>
                        </Stack>
                    </Stack>
                </Box>

                {/* Admin Provider wraps both Dashboard and ManageUsers */}
                <AdminProvider>
                    {/* Dashboard Component */}
                    <Dashboard onAddUser={handleAddUser} />

                    {/* System Activity Logs Section */}
                    <Box sx={{ mt: 4 }}>
                        <SystemActivityLogs />
                    </Box>

                    {/* User Management Section */}
                    <Box sx={{ mt: 4 }}>
                        <ManageUsersComponent />
                    </Box>

                    {/* User Form Dialog */}
                    <UserFormDialog
                        open={formDialogOpen}
                        onClose={() => setFormDialogOpen(false)}
                        onSave={handleSaveUser}
                    />
                </AdminProvider>

                {/* Snackbar for notifications */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert
                        severity={snackbar.severity}
                        onClose={() => setSnackbar({ ...snackbar, open: false })}
                        sx={{ width: '100%' }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Container>
        </Box>
    );
}

export default function AdminDashboard() {
    return (
        <ProtectedRoute requiredRole="admin" redirectTo="/">
            <AdminDashboardContent />
        </ProtectedRoute>
    );
}

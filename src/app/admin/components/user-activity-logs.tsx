"use client";

import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Box,
    Chip,
    IconButton,
    Tooltip,
    Stack,
    Alert,
    CircularProgress,
    Divider,
    Avatar,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from "@mui/material";
import {
    Close as CloseIcon,
    LoginOutlined as LoginIcon,
    LogoutOutlined as LogoutIcon,
    EditOutlined as EditIcon,
    VisibilityOutlined as ViewIcon,
    HistoryOutlined as HistoryIcon,
    DeleteOutlined as DeleteIcon,
    AddOutlined as AddIcon,
    ExpandMore as ExpandMoreIcon,
    Person as PersonIcon,
    Security as SecurityIcon,
    Work as WorkIcon,
    School as SchoolIcon,
} from "@mui/icons-material";
import { User } from "./user-types";
import { collection, query, where, orderBy, getDocs, getFirestore, Timestamp } from "firebase/firestore";

const db = getFirestore();

// Enhanced interface matching the new activity logger structure
interface ActivityLog {
    id: string;
    // ข้อมูลผู้ทำ (Who)
    userId: string;
    userEmail: string;
    userName: string;
    userRole: string;

    // การกระทำ (What)
    action: string;
    actionText: string;
    category: string;

    // เป้าหมาย (Where/What target)
    targetType?: string;
    targetId?: string;
    targetName?: string;

    // รายละเอียด (How)
    method?: string;
    ipAddress?: string;
    userAgent?: string;
    location?: string;

    // ข้อมูลเพิ่มเติม
    details?: string;
    metadata?: Record<string, any>;
    severity?: "low" | "medium" | "high" | "critical";

    // ข้อมูลการเปลี่ยนแปลง
    changes?: Array<{
        field: string;
        oldValue?: any;
        newValue?: any;
    }>;

    // เวลา
    timestamp: Timestamp;
    createdAt: Timestamp;
    sessionId?: string;
    requestId?: string;
}

interface UserActivityLogsProps {
    open: boolean;
    user: User | null;
    onClose: () => void;
}

export default function UserActivityLogs({ open, user, onClose }: UserActivityLogsProps) {
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open && user) {
            // ใช้ uid ถ้ามี หรือ id ถ้าไม่มี uid
            const searchId = user.uid || user.id;
            fetchUserActivities(searchId);
        }
    }, [open, user]);

    const fetchUserActivities = async (userId: string) => {
        setLoading(true);
        setError(null);

        try {
            console.log("Fetching activities for user:", userId, user?.email);
            console.log("User object:", { id: user?.id, uid: user?.uid, email: user?.email });

            // ลองหาด้วย userId ก่อน
            const activitiesRef = collection(db, "activities");

            // Query 1: หาด้วย userId (ควรจะเป็น Firebase Auth UID)
            let q = query(
                activitiesRef,
                where("userId", "==", userId),
                orderBy("createdAt", "desc")
            );

            let querySnapshot = await getDocs(q);
            let activitiesData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as ActivityLog[];

            console.log("Found activities with userId:", activitiesData.length);

            // ถ้าไม่เจอและมี email ให้ลองหาด้วย email
            if (activitiesData.length === 0 && user?.email) {
                console.log("No activities found with userId, trying email:", user.email);
                q = query(
                    activitiesRef,
                    where("userEmail", "==", user.email),
                    orderBy("createdAt", "desc")
                );

                querySnapshot = await getDocs(q);
                activitiesData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as ActivityLog[];

                console.log("Found activities with email:", activitiesData.length);
            }

            // ถ้ายังไม่เจอและ userId ไม่ใช่ document id ให้ลองหาด้วย document id
            if (activitiesData.length === 0 && userId !== user?.id && user?.id) {
                console.log("No activities found, trying with document id:", user.id);
                q = query(
                    activitiesRef,
                    where("userId", "==", user.id),
                    orderBy("createdAt", "desc")
                );

                querySnapshot = await getDocs(q);
                activitiesData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as ActivityLog[];

                console.log("Found activities with document id:", activitiesData.length);
            }

            console.log("Total activities found:", activitiesData.length);

            if (activitiesData.length > 0) {
                console.log("Sample activity:", activitiesData[0]);
                setActivities(activitiesData);
                setError(null);
            } else {
                // ถ้าไม่เจอข้อมูลจริง ให้แสดง mock data พร้อมกับข้อความแจ้งเตือน
                console.log("No real activities found, showing mock data");
                setError("ไม่พบประวัติการใช้งานจริงในฐานข้อมูล - กรุณาคลิกปุ่ม 'ทดสอบ Activity Logs' ในหน้า Admin เพื่อสร้างข้อมูลทดสอบ");
                setActivities([
                    {
                        id: "mock-1",
                        userId: userId,
                        userEmail: user?.email || "",
                        userName: user?.name || "ผู้ใช้",
                        userRole: user?.role || "staff",
                        action: "login",
                        actionText: "เข้าสู่ระบบ (ข้อมูลตัวอย่าง)",
                        category: "auth",
                        method: "web",
                        targetType: "system",
                        targetName: "ระบบจัดการผลงานตีพิมพ์",
                        severity: "low",
                        timestamp: Timestamp.now(),
                        createdAt: Timestamp.now(),
                        details: "นี่คือข้อมูลตัวอย่าง - คลิกปุ่ม 'ทดสอบ Activity Logs' ในหน้า Admin เพื่อสร้างข้อมูลจริง",
                        metadata: {
                            note: "ข้อมูลตัวอย่าง",
                            searchedUserId: userId,
                            searchedEmail: user?.email,
                            actualUserId: user?.id,
                            actualUid: user?.uid
                        }
                    }
                ]);
            }
        } catch (err: any) {
            console.error("Error fetching user activities:", err);
            setError(`เกิดข้อผิดพลาดในการโหลดข้อมูล: ${err.message}`);
            // แสดง mock data เมื่อเกิดข้อผิดพลาด
            setActivities([
                {
                    id: "error-mock",
                    userId: userId,
                    userEmail: user?.email || "",
                    userName: user?.name || "ผู้ใช้",
                    userRole: user?.role || "staff",
                    action: "login",
                    actionText: "เข้าสู่ระบบ (ข้อมูลตัวอย่าง)",
                    category: "auth",
                    method: "web",
                    targetType: "system",
                    targetName: "ระบบจัดการผลงานตีพิมพ์",
                    severity: "low",
                    timestamp: Timestamp.now(),
                    createdAt: Timestamp.now(),
                    details: "เกิดข้อผิดพลาดในการโหลดข้อมูลจริง - แสดงข้อมูลตัวอย่างแทน",
                    metadata: {
                        error: err.message,
                        note: "ข้อมูลตัวอย่างเนื่องจากเกิดข้อผิดพลาด"
                    }
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const getActionIcon = (action: string, severity?: string) => {
        const iconProps = {
            fontSize: "small" as const,
            color: getSeverityColor(severity) as any
        };

        switch (action) {
            case "login":
                return <LoginIcon {...iconProps} />;
            case "logout":
                return <LogoutIcon {...iconProps} />;
            case "edit":
                return <EditIcon {...iconProps} />;
            case "view":
                return <ViewIcon {...iconProps} />;
            case "delete":
                return <DeleteIcon {...iconProps} />;
            case "create":
                return <AddIcon {...iconProps} />;
            default:
                return <HistoryIcon {...iconProps} />;
        }
    };

    const getSeverityColor = (severity?: string) => {
        switch (severity) {
            case "critical":
                return "error";
            case "high":
                return "warning";
            case "medium":
                return "info";
            case "low":
            default:
                return "success";
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case "auth":
                return <SecurityIcon fontSize="small" />;
            case "user_management":
                return <PersonIcon fontSize="small" />;
            case "content":
                return <WorkIcon fontSize="small" />;
            case "system":
                return <SchoolIcon fontSize="small" />;
            default:
                return <HistoryIcon fontSize="small" />;
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case "admin":
                return "error";
            case "lecturer":
                return "primary";
            case "staff":
                return "success";
            case "student":
                return "info";
            default:
                return "default";
        }
    };

    const formatTimestamp = (timestamp: Timestamp) => {
        const date = timestamp.toDate();
        return new Intl.DateTimeFormat('th-TH', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'Asia/Bangkok'
        }).format(date);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xl"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 3, minHeight: '70vh' }
            }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <HistoryIcon color="primary" />
                        <Typography variant="h6" component="div">
                            ประวัติการใช้งานระบบ
                        </Typography>
                    </Box>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Stack>
                {user && (
                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                            {user.name.charAt(0)}
                        </Avatar>
                        <Box>
                            <Typography variant="body1" fontWeight={600}>
                                {user.name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                    {user.email}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    •
                                </Typography>
                                <Chip
                                    label={user.role}
                                    size="small"
                                    color={getRoleColor(user.role) as any}
                                    variant="outlined"
                                />
                            </Box>
                        </Box>
                    </Box>
                )}
            </DialogTitle>

            <Divider />

            <DialogContent sx={{ p: 0 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
                        <Stack alignItems="center" spacing={2}>
                            <CircularProgress />
                            <Typography variant="body2" color="text.secondary">
                                กำลังโหลดประวัติการใช้งาน...
                            </Typography>
                        </Stack>
                    </Box>
                ) : error ? (
                    <Box sx={{ p: 3 }}>
                        <Alert severity="warning" sx={{ mb: 2 }}>
                            {error} - แสดงข้อมูลตัวอย่าง
                        </Alert>
                    </Box>
                ) : activities.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="body1" color="text.secondary">
                            ไม่พบประวัติการใช้งานของผู้ใช้นี้
                        </Typography>
                    </Box>
                ) : null}

                {activities.length > 0 && (
                    <Box sx={{ p: 2 }}>
                        {activities.map((activity, index) => (
                            <Accordion key={activity.id} elevation={1} sx={{ mb: 1 }}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {getActionIcon(activity.action, activity.severity)}
                                            {getCategoryIcon(activity.category)}
                                        </Box>

                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="body1" fontWeight={600}>
                                                {activity.actionText}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {formatTimestamp(activity.createdAt || activity.timestamp)}
                                            </Typography>
                                        </Box>

                                        <Stack direction="row" spacing={1}>
                                            <Chip
                                                label={activity.category}
                                                size="small"
                                                variant="outlined"
                                            />
                                            <Chip
                                                label={activity.severity || 'low'}
                                                size="small"
                                                color={getSeverityColor(activity.severity) as any}
                                                variant="filled"
                                            />
                                        </Stack>
                                    </Box>
                                </AccordionSummary>

                                <AccordionDetails>
                                    <Box sx={{ pl: 2 }}>
                                        <Stack spacing={2}>
                                            {/* Basic Info */}
                                            <Box>
                                                <Typography variant="subtitle2" color="primary" gutterBottom>
                                                    รายละเอียด
                                                </Typography>
                                                <Typography variant="body2">
                                                    {activity.details || 'ไม่มีรายละเอียดเพิ่มเติม'}
                                                </Typography>
                                            </Box>

                                            {/* Target Info */}
                                            {activity.targetName && (
                                                <Box>
                                                    <Typography variant="subtitle2" color="primary" gutterBottom>
                                                        เป้าหมาย
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        {activity.targetType}: {activity.targetName}
                                                        {activity.targetId && ` (ID: ${activity.targetId})`}
                                                    </Typography>
                                                </Box>
                                            )}

                                            {/* Changes */}
                                            {activity.changes && activity.changes.length > 0 && (
                                                <Box>
                                                    <Typography variant="subtitle2" color="primary" gutterBottom>
                                                        การเปลี่ยนแปลง
                                                    </Typography>
                                                    {activity.changes.map((change, changeIndex) => (
                                                        <Box key={changeIndex} sx={{ ml: 2, mb: 1 }}>
                                                            <Typography variant="body2">
                                                                <strong>{change.field}:</strong>
                                                                <span style={{ color: '#f44336', textDecoration: 'line-through', marginLeft: 8 }}>
                                                                    {String(change.oldValue)}
                                                                </span>
                                                                <span style={{ color: '#4caf50', marginLeft: 8 }}>
                                                                    → {String(change.newValue)}
                                                                </span>
                                                            </Typography>
                                                        </Box>
                                                    ))}
                                                </Box>
                                            )}

                                            {/* Technical Details */}
                                            <Box>
                                                <Typography variant="subtitle2" color="primary" gutterBottom>
                                                    ข้อมูลเทคนิค
                                                </Typography>
                                                <Stack direction="row" spacing={3} flexWrap="wrap">
                                                    <Typography variant="body2">
                                                        <strong>วิธีการ:</strong> {activity.method || 'web'}
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        <strong>IP:</strong> {activity.ipAddress || 'ไม่ทราบ'}
                                                    </Typography>
                                                    {activity.sessionId && (
                                                        <Typography variant="body2">
                                                            <strong>Session:</strong> {activity.sessionId.slice(-8)}
                                                        </Typography>
                                                    )}
                                                </Stack>
                                            </Box>

                                            {/* Metadata */}
                                            {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                                                <Box>
                                                    <Typography variant="subtitle2" color="primary" gutterBottom>
                                                        ข้อมูลเพิ่มเติม
                                                    </Typography>
                                                    <pre style={{
                                                        fontSize: '12px',
                                                        background: '#f5f5f5',
                                                        padding: '8px',
                                                        borderRadius: '4px',
                                                        overflow: 'auto'
                                                    }}>
                                                        {JSON.stringify(activity.metadata, null, 2)}
                                                    </pre>
                                                </Box>
                                            )}
                                        </Stack>
                                    </Box>
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} variant="outlined">
                    ปิด
                </Button>
            </DialogActions>
        </Dialog>
    );
}

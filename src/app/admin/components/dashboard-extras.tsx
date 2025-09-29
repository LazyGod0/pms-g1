"use client";

import React from "react";
import {
    Card,
    CardContent,
    Grid,
    Stack,
    Typography,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Chip,
    Divider,
    CircularProgress,
    Box,
} from "@mui/material";
import {
    PersonAdd,
    Download,
    Upload,
    Analytics,
    Schedule,
} from "@mui/icons-material";
import { useAdmin } from "../context/AdminContext";

interface QuickActionsProps {
    onAddUser?: () => void;
}

const quickActions = [
    {
        icon: <PersonAdd />,
        label: "เพิ่มผู้ใช้ใหม่",
        color: "primary" as const,
        action: "addUser",
    },
    {
        icon: <Upload />,
        label: "นำเข้าข้อมูล",
        color: "success" as const,
        action: "importUsers",
    },
    {
        icon: <Download />,
        label: "ส่งออกข้อมูล",
        color: "secondary" as const,
        action: "exportUsers",
    },
    {
        icon: <Analytics />,
        label: "ดูสถิติ",
        color: "warning" as const,
        action: "viewAnalytics",
    },
];

// Utility function to format time
const formatTimeAgo = (timestamp: any) => {
    if (!timestamp) return "ไม่ทราบเวลา";
    
    const now = new Date();
    const activityTime = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "เมื่อสักครู่";
    if (diffInMinutes < 60) return `${diffInMinutes} นาทีที่แล้ว`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} ชั่วโมงที่แล้ว`;
    return `${Math.floor(diffInMinutes / 1440)} วันที่แล้ว`;
};

export default function DashboardExtras({ onAddUser }: QuickActionsProps) {
    const { activities, loading } = useAdmin();

    const handleAction = (action: string) => {
        switch (action) {
            case "addUser":
                onAddUser?.();
                break;
            default:
                console.log(`Action ${action} not implemented`);
        }
    };

    const getActivityColor = (type: string) => {
        switch (type) {
            case "create": return "success";
            case "edit": return "primary";
            case "delete": return "error";
            default: return "default";
        }
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case "create": return "👤";
            case "edit": return "✏️";
            case "delete": return "🗑️";
            default: return "📋";
        }
    };


    // Mock activities data
// const mockActivities = [
//     {
//         id: "1",
//         userName: "ดลภาค คงได้บุญ",
//         action: "create",
//         actionText: "สร้างผู้ใช้",
//         targetName: "นางสาวมาลี ลูกแม่แหม่ม",
//         createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
//     },
//     {
//         id: "2", 
//         userName: "ชัชชาติ สิทธิพันธุ์",
//         action: "edit",
//         actionText: "แก้ไขข้อมูล",
//         targetName: "นายวิชัย ไชยชนะ",
//         createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
//     },
//     {
//         id: "3",
//         userName: "Topfy Midnight",
//         action: "create",
//         actionText: "สร้างผู้ใช้",
//         targetName: "พี่เจพี่",
//         createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
//     },
// ];


    return (
        <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid size={{ xs:  12, md: 24 }}>
                <Card elevation={0} sx={{ borderRadius: 4, border: "1px solid", borderColor: "divider" }}>
                    <CardContent sx={{ p: 3 }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                            <Typography variant="h6" fontWeight={700}>
                                📊 กิจกรรมล่าสุด
                            </Typography>
                            <Chip 
                                icon={<Schedule />} 
                                label="ออนไลน์" 
                                size="small" 
                                color="success" 
                                variant="outlined"
                            />
                        </Stack>
                        
                        {loading ? (
                            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                                <CircularProgress size={24} />
                            </Box>
                        ) : activities.length === 0 ? (
                            <Box sx={{ textAlign: "center", py: 4 }}>
                                <Typography variant="body2" color="text.secondary">
                                    🎉 ไม่มีกิจกรรมล่าสุด
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    เริ่มใช้งานระบบเพื่อดูกิจกรรมที่นี่
                                </Typography>
                            </Box>
                        ) : (
                            <List sx={{ p: 0 }}>
                                {activities.slice(0, 5).map((activity, index) => (
                                    <React.Fragment key={activity.id}>
                                        <ListItem sx={{ px: 0, py: 1 }}>
                                            <ListItemAvatar>
                                                <Avatar 
                                                    sx={{ 
                                                        width: 32, 
                                                        height: 32, 
                                                        fontSize: "1rem",
                                                        bgcolor: "transparent",
                                                    }}
                                                >
                                                    {getActivityIcon(activity.action)}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={
                                                    <Stack direction="row" alignItems="center" spacing={1}>
                                                        <Typography variant="body2" fontWeight={600}>
                                                            {activity.userName}
                                                        </Typography>
                                                        <Chip 
                                                            label={activity.actionText} 
                                                            size="small" 
                                                            color={getActivityColor(activity.action) as any}
                                                            variant="outlined"
                                                            sx={{ fontSize: "0.75rem", height: "20px" }}
                                                        />
                                                    </Stack>
                                                }
                                                secondary={
                                                    <Typography variant="body2" color="text.secondary">
                                                        {activity.targetName} • {formatTimeAgo(activity.createdAt)}
                                                    </Typography>
                                                }
                                            />
                                        </ListItem>
                                        {index < activities.slice(0, 5).length - 1 && (
                                            <Divider sx={{ my: 0.5 }} />
                                        )}
                                    </React.Fragment>
                                ))}
                            </List>
                        )}
                        
                        <Button 
                            fullWidth 
                            variant="text" 
                            size="small" 
                            sx={{ mt: 1, borderRadius: 2 }}
                        >
                            ดูกิจกรรมทั้งหมด
                        </Button>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
}
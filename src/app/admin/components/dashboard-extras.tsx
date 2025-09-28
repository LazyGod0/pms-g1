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
} from "@mui/material";
import {
    PersonAdd,
    Download,
    Upload,
    Analytics,
    Schedule,
} from "@mui/icons-material";

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

const recentActivities = [
    {
        id: 1,
        user: "สมชาย ใจดี",
        action: "เพิ่มผู้ใช้ใหม่",
        target: "นางสาวมานี มีสุข",
        time: "5 นาทีที่แล้ว",
        type: "create",
    },
    {
        id: 2,
        user: "สมหญิง ขยัน",
        action: "แก้ไขข้อมูล",
        target: "อ.ดร.วิทย์ ปัญญา",
        time: "15 นาทีที่แล้ว",
        type: "edit",
    },
    {
        id: 3,
        user: "ผู้ดูแลระบบ",
        action: "ลบผู้ใช้",
        target: "นายทดสอบ ระบบ",
        time: "1 ชั่วโมงที่แล้ว",
        type: "delete",
    },
];

export default function DashboardExtras({ onAddUser }: QuickActionsProps) {
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

    return (
        <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid size={{ xs: 12, md: 6 }}>
                <Card elevation={0} sx={{ borderRadius: 4, border: "1px solid", borderColor: "divider" }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                            🚀 การดำเนินการด่วน
                        </Typography>
                        <Grid container spacing={2}>
                            {quickActions.map((action, index) => (
                                <Grid size={{ xs: 6 }} key={index}>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        color={action.color}
                                        startIcon={action.icon}
                                        onClick={() => handleAction(action.action)}
                                        sx={{
                                            p: 2,
                                            borderRadius: 3,
                                            flexDirection: "column",
                                            height: "80px",
                                            fontSize: "0.875rem",
                                            fontWeight: 600,
                                            "&:hover": {
                                                transform: "translateY(-2px)",
                                                boxShadow: 2,
                                            },
                                        }}
                                    >
                                        {action.label}
                                    </Button>
                                </Grid>
                            ))}
                        </Grid>
                    </CardContent>
                </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
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
                        
                        <List sx={{ p: 0 }}>
                            {recentActivities.map((activity, index) => (
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
                                                {getActivityIcon(activity.type)}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {activity.user}
                                                    </Typography>
                                                    <Chip 
                                                        label={activity.action} 
                                                        size="small" 
                                                        color={getActivityColor(activity.type) as any}
                                                        variant="outlined"
                                                        sx={{ fontSize: "0.75rem", height: "20px" }}
                                                    />
                                                </Stack>
                                            }
                                            secondary={
                                                <Typography variant="body2" color="text.secondary">
                                                    {activity.target} • {activity.time}
                                                </Typography>
                                            }
                                        />
                                    </ListItem>
                                    {index < recentActivities.length - 1 && (
                                        <Divider sx={{ my: 0.5 }} />
                                    )}
                                </React.Fragment>
                            ))}
                        </List>
                        
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
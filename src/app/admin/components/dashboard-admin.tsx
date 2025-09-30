"use client";

import React from "react";
import {
    Box,
    Card,
    CardContent,
    Grid,
    Stack,
    Typography,
    Button,
    Avatar,
    Chip,
    CircularProgress,
} from "@mui/material";
import PersonAddRoundedIcon from "@mui/icons-material/PersonAddRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import WorkRoundedIcon from "@mui/icons-material/WorkRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import { AdminPanelSettings } from "@mui/icons-material";
import { useAdmin } from "../context/AdminContext";

interface DashboardProps {
    onAddUser?: () => void;
}

function StatCard({
    icon,
    value,
    label,
    color = "primary",
    trend,
}: {
    icon: React.ReactNode;
    value: number | string;
    label: string;
    color?: "primary" | "success" | "secondary" | "warning" | "error";
    trend?: string;
}) {
    return (
        <Card
            elevation={0}
            sx={(theme) => ({
                p: 3,
                borderRadius: 4,
                border: `1px solid ${theme.palette.divider}`,
                background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.grey[50]})`,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                overflow: "hidden",
                "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: `0 8px 25px ${theme.palette.action.hover}`,
                    borderColor: theme.palette.primary.light,
                },
                "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: "100px",
                    height: "100px",
                    background: `linear-gradient(135deg, ${theme.palette[color].main}15, transparent)`,
                    borderRadius: "50%",
                    transform: "translate(30px, -30px)",
                },
            })}
        >
            <Stack spacing={2} sx={{ position: "relative", zIndex: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Avatar
                        sx={(theme) => ({
                            width: 56,
                            height: 56,
                            bgcolor: `${theme.palette[color].main}20`,
                            "& svg": {
                                fontSize: 28,
                                color: theme.palette[color].main,
                            },
                        })}
                    >
                        {icon}
                    </Avatar>
                    {trend && (
                        <Chip
                            label={trend}
                            size="small"
                            color="success"
                            variant="outlined"
                            sx={{ fontWeight: 600 }}
                        />
                    )}
                </Stack>
                
                <Box>
                    <Typography 
                        variant="h3" 
                        fontWeight={900} 
                        lineHeight={1.1}
                        sx={(theme) => ({
                            color: theme.palette.text.primary,
                            fontSize: { xs: "1.8rem", sm: "2.2rem" },
                        })}
                    >
                        {value}
                    </Typography>
                    <Typography
                        variant="body1"
                        color="text.secondary"
                        fontWeight={600}
                        sx={{ mt: 0.5 }}
                    >
                        {label}
                    </Typography>
                </Box>
            </Stack>
        </Card>
    );
}

export default function Dashboard({ onAddUser }: DashboardProps) {
    const { stats, loading, error, usingMockData } = useAdmin();

    const getPercentage = (value: number, total: number) => {
        return total > 0 ? `${Math.round((value / total) * 100)}%` : "0%";
    };

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress size={40} />
            </Box>
        );
    }

    if (error && !usingMockData) {
        return (
            <Card
                variant="outlined"
                sx={{
                    borderRadius: 4,
                    mb: 4,
                    borderColor: "error.main",
                }}
            >
                <CardContent sx={{ p: 4, textAlign: "center" }}>
                    <Typography variant="h6" color="error" gutterBottom>
                        เกิดข้อผิดพลาด
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 3 }}>
                        {error}
                    </Typography>
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={() => window.location.reload()}
                    >
                        รีเฟรชหน้า
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            {/* Show warning if using mock data */}
            {usingMockData && (
                <Card
                    variant="outlined"
                    sx={{
                        borderRadius: 4,
                        mb: 3,
                        borderColor: "warning.main",
                        backgroundColor: "warning.light",
                    }}
                >
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="body1" color="warning.dark" fontWeight={600}>
                            ⚠️ กำลังใช้ข้อมูลตัวอย่าง
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {error}
                        </Typography>
                    </CardContent>
                </Card>
            )}

            <Card
                variant="outlined"
                sx={(theme) => ({
                    borderRadius: 4,
                    background: `linear-gradient(135deg, ${theme.palette.primary.light}15, ${theme.palette.secondary.light}08, transparent)`,
                    mb: 4,
                    overflow: "visible",
                    position: "relative",
                    "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}08, transparent 60%)`,
                        borderRadius: 4,
                        zIndex: 0,
                    },
                })}
            >
                <CardContent sx={{ position: "relative", zIndex: 1, p: 4 }}>
                    <Stack spacing={3} alignItems="center" textAlign="center">
                        {/* Header Section */}
                        <Box>
                            <Typography
                                variant="h3"
                                fontWeight={900}
                                sx={(theme) => ({
                                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                    backgroundClip: "text",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    mb: 1,
                                })}
                            >
                                จัดการผู้ใช้งาน
                            </Typography>
                            <Typography
                                color="text.secondary"
                                variant="h6"
                                fontWeight={400}
                                sx={{ maxWidth: 720, mx: "auto" }}
                            >
                                จัดการข้อมูลผู้ใช้งานในระบบ เพิ่ม แก้ไข และลบข้อมูลผู้ใช้ต่างๆ
                            </Typography>
                        </Box>

                        {/* Stats Cards */}
                        <Grid container spacing={3} sx={{ mt: 2, maxWidth: 1000 }}>
                            <Grid item xs={6} md={3}>
                                <StatCard
                                    icon={<GroupRoundedIcon />}
                                    value={stats.total}
                                    label="ผู้ใช้ทั้งหมด"
                                    color="primary"
                                />
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <StatCard
                                    icon={<SchoolRoundedIcon />}
                                    value={stats.lecturers}
                                    label="อาจารย์"
                                    color="success"
                                />
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <StatCard
                                    icon={<AdminPanelSettings />}
                                    value={stats.admins}
                                    label="ผู้ดูแลระบบ"
                                    color="secondary"
                                />
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <StatCard
                                    icon={<WorkRoundedIcon />}
                                    value={stats.staff}
                                    label="เจ้าหน้าที่"
                                    color="warning"
                                />
                            </Grid>
                        </Grid>

                        {/* Action Button */}
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<PersonAddRoundedIcon />}
                            onClick={onAddUser}
                            sx={{
                                mt: 3,
                                py: 1.5,
                                px: 4,
                                borderRadius: 3,
                                fontWeight: 700,
                                textTransform: "none",
                                background: (theme) =>
                                    `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.dark} 90%)`,
                                boxShadow: "0 4px 20px rgba(25, 118, 210, 0.4)",
                                "&:hover": {
                                    transform: "translateY(-2px)",
                                    boxShadow: "0 6px 25px rgba(25, 118, 210, 0.5)",
                                },
                                transition: "all 0.3s ease-in-out",
                            }}
                        >
                            เพิ่มผู้ใช้ใหม่
                        </Button>
                    </Stack>
                </CardContent>
            </Card>
        </>
    );
}
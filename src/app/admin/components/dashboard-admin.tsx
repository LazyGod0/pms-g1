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
} from "@mui/material";
import PersonAddRoundedIcon from "@mui/icons-material/PersonAddRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import WorkRoundedIcon from "@mui/icons-material/WorkRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";

interface DashboardProps {
    stats: {
        total: number;
        lecturers: number;
        admins: number;
        staff: number;
    };
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
                    content: '""""',
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

export default function Dashboard({ stats, onAddUser }: DashboardProps) {
    return (
        <Card
            variant="outlined"
            sx={(theme) => ({
                borderRadius: 4,
                background: `linear-gradient(135deg, ${theme.palette.primary.light}15, ${theme.palette.secondary.light}08, transparent)`,
                mb: 4,
                overflow: "visible",
                position: "relative",
                "&::before": {
                    content: '""""',
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
                        <Grid size={{ xs: 6, md: 3 }}>
                            <StatCard
                                icon={<GroupRoundedIcon />}
                                value={stats.total}
                                label="ผู้ใช้ทั้งหมด"
                                color="primary"
                            />
                        </Grid>
                        <Grid size={{ xs: 6, md: 3 }}>
                            <StatCard
                                icon={<SchoolRoundedIcon />}
                                value={stats.lecturers}
                                label="อาจารย์"
                                color="warning"
                            />
                        </Grid>
                        <Grid size={{ xs: 6, md: 3 }}>
                            <StatCard
                                icon={<WorkRoundedIcon />}
                                value={stats.staff}
                                label="เจ้าหน้าที่"
                                color="success"
                            />
                        </Grid>
                        <Grid size={{ xs: 6, md: 3 }}>
                            <StatCard
                                icon={<PersonRoundedIcon />}
                                value={stats.admins}
                                label="ผู้ดูแลระบบ"
                                color="secondary"
                            />
                        </Grid>
                    </Grid>
                </Stack>
            </CardContent>
        </Card>
    );
}
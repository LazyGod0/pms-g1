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
    Paper,
} from "@mui/material";
import PersonAddRoundedIcon from "@mui/icons-material/PersonAddRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import WorkRoundedIcon from "@mui/icons-material/WorkRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";

interface DashboardProps {
    stats: {
        total: number;
        active: number;
        lecturers: number;
        students: number;
    };
    onAddUser?: () => void;
}

function StatCard({
    icon,
    value,
    label,
    color = "primary",
}: {
    icon: React.ReactNode;
    value: number | string;
    label: string;
    color?: "primary" | "success" | "secondary" | "warning";
}) {
    return (
        <Paper
            elevation={0}
            sx={(theme) => ({
                p: 2.5,
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: 3,
                },
            })}
        >
            <Stack spacing={1.25} alignItems="center" textAlign="center">
                <Box
                    sx={(theme) => ({
                        width: 48,
                        height: 48,
                        borderRadius: 2.5,
                        display: "grid",
                        placeItems: "center",
                        bgcolor:
                            color === "success"
                                ? "rgba(46,125,50,0.08)"
                                : color === "secondary"
                                    ? "rgba(156,39,176,0.08)"
                                    : color === "warning"
                                        ? "rgba(255,152,0,0.08)"
                                        : "rgba(25,118,210,0.08)",
                        "& svg": {
                            fontSize: 24,
                            color:
                                color === "success"
                                    ? theme.palette.success.main
                                    : color === "secondary"
                                        ? theme.palette.secondary.main
                                        : color === "warning"
                                            ? theme.palette.warning.main
                                            : theme.palette.primary.main,
                        },
                    })}
                >
                    {icon}
                </Box>
                <Typography variant="h4" fontWeight={800} lineHeight={1.2}>
                    {value}
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    fontWeight={500}
                >
                    {label}
                </Typography>
            </Stack>
        </Paper>
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
                                icon={<PersonRoundedIcon />}
                                value={stats.active}
                                label="ใช้งานอยู่"
                                color="success"
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
                                value={stats.students}
                                label="นักศึกษา"
                                color="secondary"
                            />
                        </Grid>
                    </Grid>
                </Stack>
            </CardContent>
        </Card>
    );
}
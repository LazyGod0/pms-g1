"use client";

import React from "react";
import {
    Box,
    Card,
    CardContent,
    Chip,
    Stack,
    Typography,
    Button,
    Avatar,
    IconButton,
    Tooltip,
    Grid,
} from "@mui/material";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import { User, getRoleLabel, getRoleColor } from "./user-types";

interface UserCardProps {
    user: User;
    onEdit: (user: User) => void;
    onDelete: (id: string) => void;
}

export default function UserCard({ user, onEdit, onDelete }: UserCardProps) {
    return (
        <Grid item xs={12} sm={6} md={4}>
            <Card
                variant="outlined"
                sx={{
                    borderRadius: 3,
                    transition: "all 0.3s ease-in-out",
                    "&:hover": {
                        boxShadow: (theme) => `0 8px 32px ${theme.palette.primary.main}15`,
                        transform: "translateY(-4px)",
                        borderColor: "primary.main",
                    },
                }}
            >
                <CardContent sx={{ p: 3 }}>
                    {/* Header */}
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                                variant="h6"
                                fontWeight={600}
                                sx={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {user.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                ID: {user.id}
                            </Typography>
                        </Box>
                        <Chip
                            label={getRoleLabel(user.role)}
                            color={getRoleColor(user.role) as any}
                            size="small"
                            variant="outlined"
                        />
                    </Stack>

                    {/* User Info */}
                    <Stack spacing={1.5} mb={3}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <EmailOutlinedIcon fontSize="small" color="action" />
                            <Typography
                                variant="body2"
                                sx={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {user.email}
                            </Typography>
                        </Box>

                        {user.phone && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <PhoneOutlinedIcon fontSize="small" color="action" />
                                <Typography variant="body2">{user.phone}</Typography>
                            </Box>
                        )}

                        {user.faculty && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <BusinessOutlinedIcon fontSize="small" color="action" />
                                <Typography
                                    variant="body2"
                                    sx={{
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {user.faculty} - {user.department}
                                </Typography>
                            </Box>
                        )}
                    </Stack>

                    {/* Actions */}
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Tooltip title="แก้ไข">
                            <IconButton
                                size="small"
                                onClick={() => onEdit(user)}
                                sx={{
                                    color: "warning.main",
                                    "&:hover": {
                                        backgroundColor: "warning.light",
                                        color: "warning.contrastText",
                                    },
                                }}
                            >
                                <EditRoundedIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="ลบ">
                            <IconButton
                                size="small"
                                onClick={() => onDelete(user.id)}
                                sx={{
                                    color: "error.main",
                                    "&:hover": {
                                        backgroundColor: "error.light",
                                        color: "error.contrastText",
                                    },
                                }}
                            >
                                <DeleteRoundedIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </CardContent>
            </Card>
        </Grid>
    );
}
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
} from "@mui/material";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import { User, getRoleLabel, getRoleColor } from "./user-types";

interface UserCardProps {
    user: User;
    onEdit: (user: User) => void;
    onDelete: (id: string) => void;
}

export default function UserCard({ user, onEdit, onDelete }: UserCardProps) {
    return (
        <Card
            variant="outlined"
            sx={{
                borderRadius: 3,
                "&:hover": { boxShadow: 4, transform: "translateY(-1px)" },
                transition: "all .2s",
            }}
        >
            <CardContent>
                <Stack spacing={1.5}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                            sx={(theme) => ({
                                bgcolor: theme.palette.primary.main,
                                width: 48,
                                height: 48,
                            })}
                        >
                            {user.name.charAt(0)}
                        </Avatar>
                        <Box flex={1}>
                            <Typography variant="subtitle1" fontWeight={700}>
                                {user.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {user.email}
                            </Typography>
                        </Box>
                    </Stack>
                    
                    <Stack spacing={1}>
                        <Typography variant="body2" color="text.secondary">
                            📞 {user.phone || "ไม่ระบุ"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            🏢 {user.faculty} - {user.department}
                        </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <Chip
                            size="small"
                            label={getRoleLabel(user.role)}
                            color={getRoleColor(user.role)}
                            variant="outlined"
                        />
                    </Stack>

                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<EditRoundedIcon />}
                            onClick={() => onEdit(user)}
                            sx={{ borderRadius: 2 }}
                        >
                            แก้ไข
                        </Button>
                        <Button
                            variant="outlined"
                            size="small"
                            color="error"
                            startIcon={<DeleteRoundedIcon />}
                            onClick={() => onDelete(user.id)}
                            sx={{ borderRadius: 2 }}
                        >
                            ลบ
                        </Button>
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
}
"use client";

import React from "react";
import {
    Card,
    CardContent,
    Chip,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
    IconButton,
    Avatar,
    Tooltip,
} from "@mui/material";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import { User, getRoleLabel, getRoleColor } from "./user-types";

interface UserTableProps {
    users: User[];
    onEdit: (user: User) => void;
    onDelete: (id: string) => void;
}

export default function UserTable({ users, onEdit, onDelete }: UserTableProps) {
    return (
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 0 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>ชื่อ</TableCell>
                            <TableCell sx={{ fontWeight: 700, width: 250 }}>อีเมล</TableCell>
                            <TableCell sx={{ fontWeight: 700, width: 120 }}>บทบาท</TableCell>
                            <TableCell sx={{ fontWeight: 700, width: 200 }}>คณะ/แผนก</TableCell>
                            <TableCell sx={{ fontWeight: 700, width: 120 }}>จัดการ</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id} hover>
                                <TableCell>
                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                        <Avatar sx={{ width: 32, height: 32 }}>
                                            {user.name.charAt(0)}
                                        </Avatar>
                                        <Typography variant="body2">{user.name}</Typography>
                                    </Stack>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" color="text.secondary">
                                        {user.email}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={getRoleLabel(user.role)}
                                        color={getRoleColor(user.role) as any}
                                        size="small"
                                        variant="outlined"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" color="text.secondary">
                                        {user.faculty || "-"} / {user.department || "-"}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Stack direction="row" spacing={0.5}>
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
                                </TableCell>
                            </TableRow>
                        ))}
                        {users.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                                    <Typography color="text.secondary">ไม่พบข้อมูลผู้ใช้</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
"use client";

import React from "react";
import {
    Card,
    CardContent,
    Typography,
    Button,
} from "@mui/material";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import PersonAddRoundedIcon from "@mui/icons-material/PersonAddRounded";

interface EmptyStateProps {
    onClearFilters: () => void;
    onAddUser: () => void;
}

export default function EmptyState({ onClearFilters, onAddUser }: EmptyStateProps) {
    return (
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ py: 8, textAlign: "center" }}>
                <PersonRoundedIcon
                    sx={{ fontSize: 48, color: "text.disabled", mb: 1.5 }}
                />
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                    ไม่พบข้อมูลผู้ใช้
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    ลองปรับเกณฑ์การค้นหาใหม่ หรือเพิ่มผู้ใช้ใหม่
                </Typography>
                <Button
                    variant="outlined"
                    onClick={onClearFilters}
                    sx={{ borderRadius: 2, mr: 1 }}
                >
                    ล้างตัวกรอง
                </Button>
                <Button
                    variant="contained"
                    startIcon={<PersonAddRoundedIcon />}
                    onClick={onAddUser}
                    sx={{ borderRadius: 2 }}
                >
                    เพิ่มผู้ใช้ใหม่
                </Button>
            </CardContent>
        </Card>
    );
}
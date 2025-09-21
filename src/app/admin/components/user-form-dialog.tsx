"use client";

import React, { useEffect, useState } from "react";
import {
    Stack,
    TextField,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from "@mui/material";
import { User, UserFormData, UserRole } from "./user-types";

interface UserFormDialogProps {
    open: boolean;
    user?: User;
    onClose: () => void;
    onSave: (userData: UserFormData) => void;
}

export default function UserFormDialog({
    open,
    user,
    onClose,
    onSave,
}: UserFormDialogProps) {
    const [formData, setFormData] = useState<UserFormData>({
        name: "",
        email: "",
        role: "student",
        faculty: "",
        department: "",
        phone: "",
        status: "active",
        password: "",
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                email: user.email,
                role: user.role,
                faculty: user.faculty || "",
                department: user.department || "",
                phone: user.phone || "",
                status: user.status,
            });
        } else {
            setFormData({
                name: "",
                email: "",
                role: "student",
                faculty: "",
                department: "",
                phone: "",
                status: "active",
                password: "",
            });
        }
    }, [user, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>
                    {user ? "แก้ไขข้อมูลผู้ใช้" : "เพิ่มผู้ใช้ใหม่"}
                </DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2.5} sx={{ mt: 1 }}>
                        <TextField
                            fullWidth
                            label="ชื่อ-สกุล"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                        <TextField
                            fullWidth
                            label="อีเมล"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                        {!user && (
                            <TextField
                                fullWidth
                                label="รหัสผ่าน"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        )}
                        <FormControl fullWidth>
                            <InputLabel>บทบาท</InputLabel>
                            <Select
                                value={formData.role}
                                label="บทบาท"
                                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                            >
                                <MenuItem value="student">นักศึกษา</MenuItem>
                                <MenuItem value="lecturer">อาจารย์</MenuItem>
                                <MenuItem value="staff">เจ้าหน้าที่</MenuItem>
                                <MenuItem value="admin">ผู้ดูแลระบบ</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth
                            label="คณะ"
                            value={formData.faculty}
                            onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            label="แผนก/ภาควิชา"
                            value={formData.department}
                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            label="เบอร์โทรศัพท์"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                        <FormControl fullWidth>
                            <InputLabel>สถานะ</InputLabel>
                            <Select
                                value={formData.status}
                                label="สถานะ"
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" })}
                            >
                                <MenuItem value="active">ใช้งาน</MenuItem>
                                <MenuItem value="inactive">ไม่ใช้งาน</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={onClose} color="inherit">
                        ยกเลิก
                    </Button>
                    <Button type="submit" variant="contained">
                        {user ? "บันทึกการแก้ไข" : "เพิ่มผู้ใช้"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
"use client";

import React from "react";
import {
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";

interface DeleteConfirmDialogProps {
    open: boolean;
    userName: string;
    onClose: () => void;
    onConfirm: () => void;
}

export default function DeleteConfirmDialog({
    open,
    userName,
    onClose,
    onConfirm,
}: DeleteConfirmDialogProps) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>ยืนยันการลบผู้ใช้</DialogTitle>
            <DialogContent>
                <Typography>
                    คุณต้องการลบผู้ใช้ <strong>{userName}</strong> ใช่หรือไม่?
                </Typography>
                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                    การลบนี้ไม่สามารถย้อนกลับได้
                </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 2.5 }}>
                <Button onClick={onClose} color="inherit">
                    ยกเลิก
                </Button>
                <Button onClick={onConfirm} color="error" variant="contained">
                    ลบ
                </Button>
            </DialogActions>
        </Dialog>
    );
}
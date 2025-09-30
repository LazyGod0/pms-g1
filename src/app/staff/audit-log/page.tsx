// =============================
// File: /app/(staff)/audit-log/page.tsx
// =============================
"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  CircularProgress,
  Chip,
  Stack,
} from "@mui/material";
import { db } from "@/configs/firebase-config";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";

type ActivityDoc = {
  action: string;
  actionText?: string;
  createdAt?: any; // Firestore Timestamp
  timestamp?: any; // Firestore Timestamp
  targetId?: string;
  targetName?: string;
  userId: string;
  userName: string;
};

export default function AuditLogPage() {
  const [rows, setRows] = useState<ActivityDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "activities"),
      orderBy("timestamp", "desc"),
      limit(100) // แสดงล่าสุด 100 รายการ
    );

    const unsub = onSnapshot(q, (snap) => {
      const result: ActivityDoc[] = snap.docs.map((doc) => doc.data() as ActivityDoc);
      setRows(result);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const renderActionChip = (action: string) => {
    let color: "success" | "warning" | "error" = "success";
    let label = action;

    if (action === "create") {
      color = "success";
      label = "สร้าง";
    } else if (action === "edit" || action === "update") {
      color = "warning";
      label = "แก้ไข";
    } else if (action === "delete") {
      color = "error";
      label = "ลบ";
    }
    return <Chip size="small" color={color} label={label} />;
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Audit Log
      </Typography>

      <Paper sx={{ p: 2, borderRadius: 2 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        ) : rows.length === 0 ? (
          <Typography align="center" sx={{ p: 3, color: "text.secondary" }}>
            ไม่พบข้อมูลการทำรายการ
          </Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ผู้ใช้</TableCell>
                <TableCell>กิจกรรม</TableCell>
                <TableCell>เป้าหมาย</TableCell>
                <TableCell align="right">เวลา</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {renderActionChip(row.action)}
                      <span>{row.userName} ({row.userId})</span>
                    </Stack>
                  </TableCell>
                  <TableCell>{row.actionText || row.action}</TableCell>
                  <TableCell>{row.targetName || row.targetId || "-"}</TableCell>
                  <TableCell align="right">
                    {row.timestamp?.toDate?.().toLocaleString("th-TH", {
                      dateStyle: "short",
                      timeStyle: "medium",
                    }) ??
                      row.createdAt?.toDate?.().toLocaleString("th-TH", {
                        dateStyle: "short",
                        timeStyle: "medium",
                      }) ??
                      "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Box>
  );
}

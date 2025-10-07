"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { logUserActivity } from "@/libs/activity-logger";

import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Alert,
    IconButton,
    InputAdornment,
    Divider,
    Container,
    Fab,
    Avatar,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Paper,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LockResetIcon from "@mui/icons-material/LockReset";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import ContactSupportIcon from "@mui/icons-material/ContactSupport";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Log activity when page loads (background process)
    useEffect(() => {
        // Run logging in background without blocking
        setTimeout(() => {
            logUserActivity({
                userId: "anonymous",
                userEmail: "anonymous@system.com",
                userName: "Anonymous User",
                userRole: "guest",
                action: "view",
                actionText: "เข้าชมหน้าลืมรหัสผ่าน",
                category: "auth",
                method: "web",
                targetType: "system",
                targetName: "หน้าลืมรหัสผ่าน",
                severity: "low",
                details: "เข้าสู่หน้าขอรีเซ็ตรหัสผ่าน",
                metadata: {
                    pageType: "forgot_password",
                    userAgent: navigator?.userAgent || "Unknown",
                    referrer: document?.referrer || "direct",
                    timestamp: new Date().toISOString()
                }
            }).catch(err => console.log("Logging error:", err));
        }, 0);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setLoading(true);

        // ตรวจสอบข้อมูลก่อนส่ง
        const trimmedEmail = email.trim();

        if (!trimmedEmail) {
            setMessage("กรุณากรอกอีเมลของคุณ");
            setLoading(false);
            return;
        }

        // ตรวจสอบรูปแบบอีเมล
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            setMessage("รูปแบบอีเมลไม่ถูกต้อง");
            setLoading(false);
            return;
        }

        // Log password reset request (background)
        setTimeout(() => {
            logUserActivity({
                userId: "anonymous",
                userEmail: trimmedEmail,
                userName: "Password Reset Request",
                userRole: "guest",
                action: "create",
                actionText: "ส่งคำขอรีเซ็ตรหัสผ่าน",
                category: "auth",
                method: "web",
                targetType: "system",
                targetName: "Password Reset System",
                severity: "medium",
                details: `ขอรีเซ็ตรหัสผ่านสำหรับอีเมล: ${trimmedEmail}`,
                metadata: {
                    requestType: "password_reset",
                    requestedEmail: trimmedEmail,
                    emailValid: true,
                    requestTime: new Date().toISOString(),
                    userAgent: navigator?.userAgent || "Unknown",
                    ipAddress: "client_request"
                }
            }).catch(err => console.log("Logging error:", err));
        }, 100);

        try {
            // แสดงข้อความว่าได้รับคำขอแล้ว
            setMessage(`ได้รับคำขอรีเซ็ตรหัสผ่านสำหรับอีเมล: ${trimmedEmail}\nกรุณาติดต่อผู้ดูแลระบบเพื่อดำเนินการต่อ`);

            // ล้างฟอร์ม
            setEmail("");
        } catch (err: any) {
            console.error("Password reset request error:", err);

            // Log error activity (background)
            setTimeout(() => {
                logUserActivity({
                    userId: "anonymous",
                    userEmail: trimmedEmail,
                    userName: "Password Reset Error",
                    userRole: "guest",
                    action: "create",
                    actionText: "ความผิดพลาดในการขอรีเซ็ตรหัสผ่าน",
                    category: "auth",
                    method: "web",
                    targetType: "system",
                    targetName: "Password Reset System",
                    severity: "high",
                    details: `เกิดข้อผิดพลาดในการขอรีเซ็ตรหัสผ่าน: ${err.message || "Unknown error"}`,
                    metadata: {
                        requestType: "password_reset_error",
                        requestedEmail: trimmedEmail,
                        errorMessage: err.message || "Unknown error",
                        errorTime: new Date().toISOString()
                    }
                }).catch(logErr => console.log("Logging error:", logErr));
            }, 50);

            setMessage("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
        } finally {
            setLoading(false);
        }
    };

    const handleGoBack = () => {
        // Log navigation activity (background)
        setTimeout(() => {
            logUserActivity({
                userId: "anonymous",
                userEmail: "anonymous@system.com",
                userName: "Anonymous User",
                userRole: "guest",
                action: "view",
                actionText: "ออกจากหน้าลืมรหัสผ่าน",
                category: "auth",
                method: "web",
                targetType: "system",
                targetName: "Navigation",
                severity: "low",
                details: "กดปุ่มย้อนกลับจากหน้าลืมรหัสผ่าน",
                metadata: {
                    navigationAction: "back_button",
                    fromPage: "forgot_password",
                    timestamp: new Date().toISOString()
                }
            }).catch(err => console.log("Logging error:", err));
        }, 0);

        router.back();
    };

    return (
        <Box
            sx={(t) => ({
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                py: 6,
                position: "relative",
                background: `linear-gradient(135deg, ${t.palette.primary.main}15 0%, ${t.palette.secondary.main}08 50%, transparent 100%)`,
                "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23f0f0f0" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                    zIndex: 0,
                },
            })}
        >
            {/* Back Button */}
            <Fab
                color="primary"
                size="medium"
                onClick={handleGoBack}
                sx={{
                    position: "fixed",
                    top: 24,
                    left: 24,
                    zIndex: 1000,
                    boxShadow: 3,
                    "&:hover": {
                        transform: "scale(1.05)",
                        boxShadow: 6,
                    },
                    transition: "all 0.2s ease-in-out",
                }}
                aria-label="ย้อนกลับ"
            >
                <ArrowBackIcon />
            </Fab>

            <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
                {/* Header Section */}
                <Box sx={{ textAlign: "center", mb: 4 }}>
                    <Avatar
                        sx={(t) => ({
                            width: 80,
                            height: 80,
                            mx: "auto",
                            mb: 2,
                            bgcolor: t.palette.warning.main,
                            boxShadow: 4,
                        })}
                    >
                        <LockResetIcon sx={{ fontSize: 40 }} />
                    </Avatar>
                    <Typography
                        variant="h4"
                        component="h1"
                        fontWeight={800}
                        gutterBottom
                        sx={(t) => ({
                            background: `linear-gradient(45deg, ${t.palette.primary.main}, ${t.palette.secondary.main})`,
                            backgroundClip: "text",
                            WebkitBackgroundClip: "text",
                            color: "transparent",
                            textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        })}
                    >
                        รีเซ็ตรหัสผ่าน
                    </Typography>
                    <Typography
                        variant="body1"
                        color="text.secondary"
                        align="center"
                        sx={{ maxWidth: 600, mx: "auto" }}
                    >
                        หากคุณลืมรหัสผ่าน กรุณาติดต่อผู้ดูแลระบบเพื่อขอรีเซ็ตรหัสผ่าน
                    </Typography>
                </Box>

                <Box sx={{ display: "grid", gap: 4, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
                    {/* Form Section */}
                    <Card
                        variant="outlined"
                        sx={{
                            borderRadius: 4,
                            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                            backdropFilter: "blur(10px)",
                            background: "rgba(255,255,255,0.95)",
                            border: "1px solid rgba(255,255,255,0.2)",
                        }}
                    >
                        <CardContent sx={{ p: { xs: 4, md: 5 } }}>
                            <Box sx={{ textAlign: "center", mb: 4 }}>
                                <Avatar
                                    sx={(t) => ({
                                        width: 64,
                                        height: 64,
                                        mx: "auto",
                                        mb: 2,
                                        bgcolor: `${t.palette.warning.main}15`,
                                        border: `2px solid ${t.palette.warning.main}25`,
                                    })}
                                >
                                    <ContactSupportIcon sx={(t) => ({ fontSize: 32, color: t.palette.warning.main })} />
                                </Avatar>
                                <Typography
                                    variant="h5"
                                    component="h2"
                                    align="center"
                                    fontWeight={700}
                                    gutterBottom
                                    sx={{ color: "text.primary" }}
                                >
                                    แจ้งขอรีเซ็ตรหัสผ่าน
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    align="center"
                                    sx={{ mb: 1, fontWeight: 500 }}
                                >
                                    กรอกอีเมลของคุณเพื่อแจ้งขอรีเซ็ตรหัสผ่าน
                                </Typography>
                            </Box>

                            {message && (
                                <Alert
                                    severity={message.includes("เกิดข้อผิดพลาด") ? "error" : "info"}
                                    sx={{
                                        mb: 3,
                                        borderRadius: 2,
                                        boxShadow: "0 2px 8px rgba(33, 150, 243, 0.15)",
                                        whiteSpace: "pre-line"
                                    }}
                                >
                                    {message}
                                </Alert>
                            )}

                            <Box component="form" onSubmit={handleSubmit}>
                                <TextField
                                    label="อีเมลของคุณ"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    fullWidth
                                    margin="normal"
                                    autoComplete="email"
                                    variant="outlined"
                                    placeholder="example@domain.com"
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: 3,
                                            backgroundColor: "rgba(0,0,0,0.02)",
                                            transition: "all 0.2s ease-in-out",
                                            "&:hover": {
                                                backgroundColor: "rgba(0,0,0,0.04)",
                                            },
                                            "&.Mui-focused": {
                                                backgroundColor: "rgba(255,255,255,1)",
                                                boxShadow: "0 0 0 2px rgba(255, 152, 0, 0.2)",
                                            },
                                        },
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <EmailIcon
                                                    fontSize="small"
                                                    sx={(t) => ({ color: t.palette.warning.main })}
                                                />
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                <Button
                                    type="submit"
                                    variant="contained"
                                    fullWidth
                                    disabled={loading}
                                    startIcon={loading ? undefined : <ContactSupportIcon />}
                                    sx={{
                                        mt: 3,
                                        py: 1.8,
                                        borderRadius: 3,
                                        fontWeight: 700,
                                        fontSize: "1rem",
                                        textTransform: "none",
                                        background: (t) => `linear-gradient(45deg, ${t.palette.warning.main} 30%, ${t.palette.warning.dark} 90%)`,
                                        boxShadow: "0 4px 20px rgba(255, 152, 0, 0.4)",
                                        "&:hover": {
                                            transform: "translateY(-2px)",
                                            boxShadow: "0 6px 25px rgba(255, 152, 0, 0.5)",
                                            background: (t) => `linear-gradient(45deg, ${t.palette.warning.dark} 30%, ${t.palette.warning.main} 90%)`,
                                        },
                                        "&:disabled": {
                                            background: "rgba(0,0,0,0.12)",
                                            boxShadow: "none",
                                            transform: "none",
                                        },
                                        transition: "all 0.3s ease-in-out",
                                    }}
                                >
                                    {loading ? "กำลังส่งคำขอ..." : "ส่งคำขอรีเซ็ตรหัสผ่าน"}
                                </Button>
                            </Box>

                            <Divider sx={{ my: 4, opacity: 0.7 }} />

                            <Typography variant="body2" align="center" fontWeight={500}>
                                จำรหัสผ่านได้แล้ว?{" "}
                                <Link
                                    href="/login"
                                    style={{
                                        textDecoration: "none",
                                        fontWeight: 600,
                                    }}
                                >
                                    เข้าสู่ระบบ
                                </Link>
                            </Typography>
                        </CardContent>
                    </Card>

                    {/* Contact Info Section */}
                    <Card
                        variant="outlined"
                        sx={{
                            borderRadius: 4,
                            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                            backdropFilter: "blur(10px)",
                            background: "rgba(255,255,255,0.95)",
                            border: "1px solid rgba(255,255,255,0.2)",
                        }}
                    >
                        <CardContent sx={{ p: { xs: 4, md: 5 } }}>
                            <Box sx={{ textAlign: "center", mb: 4 }}>
                                <Avatar
                                    sx={(t) => ({
                                        width: 64,
                                        height: 64,
                                        mx: "auto",
                                        mb: 2,
                                        bgcolor: `${t.palette.primary.main}15`,
                                        border: `2px solid ${t.palette.primary.main}25`,
                                    })}
                                >
                                    <AdminPanelSettingsIcon sx={(t) => ({ fontSize: 32, color: t.palette.primary.main })} />
                                </Avatar>
                                <Typography
                                    variant="h5"
                                    component="h2"
                                    align="center"
                                    fontWeight={700}
                                    gutterBottom
                                    sx={{ color: "text.primary" }}
                                >
                                    ติดต่อผู้ดูแลระบบ
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    align="center"
                                    sx={{ mb: 1, fontWeight: 500 }}
                                >
                                    สำหรับการขอรีเซ็ตรหัสผ่านและความช่วยเหลืออื่นๆ
                                </Typography>
                            </Box>

                            <List sx={{ width: "100%" }}>
                                <ListItem sx={{ px: 0 }}>
                                    <ListItemIcon>
                                        <EmailIcon color="primary" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Typography variant="subtitle2" fontWeight={600}>
                                                อีเมล
                                            </Typography>
                                        }
                                        secondary={
                                            <Typography variant="body2" color="text.secondary">
                                                pop@psu.ac.th<br />
                                                pop.support@psu.ac.th
                                            </Typography>
                                        }
                                    />
                                </ListItem>

                                <ListItem sx={{ px: 0 }}>
                                    <ListItemIcon>
                                        <PhoneIcon color="primary" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Typography variant="subtitle2" fontWeight={600}>
                                                โทรศัพท์
                                            </Typography>
                                        }
                                        secondary={
                                            <Typography variant="body2" color="text.secondary">
                                                094-581-3503<br />
                                                191 (ฉุกเฉิน)
                                            </Typography>
                                        }
                                    />
                                </ListItem>

                                <ListItem sx={{ px: 0 }}>
                                    <ListItemIcon>
                                        <AccessTimeIcon color="primary" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Typography variant="subtitle2" fontWeight={600}>
                                                เวลาให้บริการ
                                            </Typography>
                                        }
                                        secondary={
                                            <Typography variant="body2" color="text.secondary">
                                                จันทร์ - ศุกร์: 08:30 - 16:30<br />
                                                เสาร์ - อาทิตย์: ปิดให้บริการ
                                            </Typography>
                                        }
                                    />
                                </ListItem>

                                <ListItem sx={{ px: 0 }}>
                                    <ListItemIcon>
                                        <LocationOnIcon color="primary" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Typography variant="subtitle2" fontWeight={600}>
                                                ที่ตั้ง
                                            </Typography>
                                        }
                                        secondary={
                                            <Typography variant="body2" color="text.secondary">
                                                ตึกภาควิชาวิทยาการคอมพิวเตอร์<br />
                                                มหาวิทยาลัยสงขลานครินทร์<br />
                                                หาดใหญ่ สงขลา 90110
                                            </Typography>
                                        }
                                    />
                                </ListItem>
                            </List>

                            <Paper
                                elevation={0}
                                sx={{
                                    mt: 3,
                                    p: 3,
                                    backgroundColor: "rgba(33, 150, 243, 0.08)",
                                    borderRadius: 3,
                                    border: "1px solid rgba(33, 150, 243, 0.12)"
                                }}
                            >
                                <Typography variant="subtitle2" fontWeight={700} color="primary" gutterBottom>
                                    📋 ข้อมูลที่ต้องเตรียม
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    • อีเมลที่ลงทะเบียนในระบบ<br />
                                    • เลขประจำตัวประชาชน<br />
                                    • เลขที่พนักงาน (ถ้ามี)<br />
                                    • เอกสารยืนยันตัวตน
                                </Typography>
                            </Paper>
                        </CardContent>
                    </Card>
                </Box>
            </Container>
        </Box>
    );
}

// app/signin/page.tsx
"use client";

import { useMemo, useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/configs/firebase-config";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts";
import Link from "next/link";
import { logUserActivity, getUserAgent, getClientIP } from "@/libs/activity-logger";

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
    Checkbox,
    FormControlLabel,
    Divider,
    Container,
    Fab,
    Avatar,
} from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LoginIcon from "@mui/icons-material/Login";
import PersonIcon from "@mui/icons-material/Person";

function mapFirebaseErrorToThai(error: any) {
    console.log("Firebase Error:", error); // เพิ่ม logging เพื่อ debug

    const code = error?.code?.toLowerCase() || "";
    const message = error?.message?.toLowerCase() || "";

    // ตรวจสอบ error code ที่เป็นไปได้
    if (code.includes("auth/invalid-email") || code.includes("invalid-email")) {
        return "อีเมลไม่ถูกต้อง";
    }
    if (code.includes("auth/user-disabled") || code.includes("user-disabled")) {
        return "บัญชีนี้ถูกปิดการใช้งาน";
    }
    if (code.includes("auth/user-not-found") || code.includes("user-not-found")) {
        return "ไม่พบบัญชีผู้ใช้นี้ โปรดตรวจสอบอีเมลหรือสมัครสมาชิกใหม่";
    }
    if (code.includes("auth/wrong-password") || code.includes("wrong-password") ||
        code.includes("auth/invalid-credential") || code.includes("invalid-credential") ||
        message.includes("invalid-credential") || message.includes("wrong-password")) {
        return "รหัสผ่านไม่ถูกต้อง โปรดตรวจสอบรหัสผ่านอีกครั้ง";
    }
    if (code.includes("auth/too-many-requests") || code.includes("too-many-requests")) {
        return "พยายามเข้าสู่ระบบหล้ายครั้งเกินไป กรุณารอสักครู่แล้วลองใหม่";
    }
    if (code.includes("auth/network-request-failed") || code.includes("network-request-failed")) {
        return "ปัญหาการเชื่อมต่ออินเทอร์เน็ต โปรดตรวจสอบการเชื่อมต่อ";
    }
    if (code.includes("auth/weak-password") || code.includes("weak-password")) {
        return "รหัสผ่านไม่แข็งแรงพอ";
    }
    if (code.includes("auth/email-already-in-use") || code.includes("email-already-in-use")) {
        return "อีเมลนี้มีการใช้งานแล้ว";
    }

    // ถ้าไม่ตรงกับ case ไหนเลย ให้แสดง error ดิบเพื่อ debug
    console.error("Unhandled Firebase Error:", { code, message, fullError: error });
    return `เกิดข้อผิดพลาด: ${code || message || "ไม่ทราบสาเหตุ"}`;
}

export default function SignInPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = useMemo(() => searchParams.get("redirect") || "/", [searchParams]);

    // ใช้ Context hooks - ต้องเรียกที่ top level
    const { user: authUser, loading: authLoading, isAuthenticated } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [remember, setRemember] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // โหลดข้อมูลที่จำไว้เมื่อ component mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedRemember = localStorage.getItem('rememberMe') === 'true';
            const savedEmail = localStorage.getItem('rememberedEmail');

            if (savedRemember && savedEmail) {
                setRemember(true);
                setEmail(savedEmail);
            }
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setLoading(true);

        // ตรวจสอบข้อมูลก่อนส่ง
        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        if (!trimmedEmail || !trimmedPassword) {
            const errorMessage = "กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน";
            setError(errorMessage);
            setLoading(false);
            return;
        }

        // ตรวจสอบรูปแบบอีเมล
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            const errorMessage = "รูปแบบอีเมลไม่ถูกต้อง";
            setError(errorMessage);
            setLoading(false);
            return;
        }

        try {
            console.log("Attempting login with:", { email: trimmedEmail, passwordLength: trimmedPassword.length });

            const result = await signInWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
            console.log("Login successful:", result.user);

            // จัดการ "จดจำฉันไว้"
            if (remember) {
                localStorage.setItem('rememberMe', 'true');
                localStorage.setItem('rememberedEmail', trimmedEmail);
            } else {
                localStorage.removeItem('rememberMe');
                localStorage.removeItem('rememberedEmail');
            }

            // บันทึกประวัติการเข้าใช้งานระบบ
            // รอสักครู่ให้ AuthContext ประมวลผล role ก่อน
            setTimeout(async () => {
                try {
                    await logUserActivity({
                        userId: result.user.uid,
                        userEmail: result.user.email || trimmedEmail,
                        userName: result.user.displayName || result.user.email || "ผู้ใช้",
                        userRole: "user", // จะถูกอัพเดทจาก AuthContext หลังจากนี้
                        action: "login",
                        actionText: "เข้าสู่ระบบ",
                        category: "auth",
                        method: "web",
                        targetType: "system",
                        targetName: "ระบบจัดการผลงานตีพิมพ์",
                        severity: "low",
                        details: `เข้าสู่ระบบผ่านเว็บไซต์ - Browser: ${navigator.userAgent.split(' ')[0]}`,
                        metadata: {
                            loginMethod: "email_password",
                            rememberMe: remember,
                            redirectTo: redirect !== "/" ? redirect : null,
                            browserLanguage: navigator.language,
                            screenResolution: `${screen.width}x${screen.height}`,
                            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                            firebaseUid: result.user.uid,
                            actualEmail: result.user.email
                        }
                    });
                    console.log("Login activity logged successfully");
                } catch (logError) {
                    console.error("Failed to log login activity:", logError);
                }
            }, 1000);

            // แสดงการแจ้งเตือนสำเร็จ
            setSuccessMessage(`ยินดีต้อนรับ ${result.user.email || "ผู้ใช้งาน"} - กำลังตรวจสอบสิทธิ์...`);

            // รอให้ AuthContext อัพเดท user พร้อม role แล้วค่อย redirect
            // ไม่ต้อง redirect ที่นี่ ให้ useEffect ด้านล่างจัดการ

        } catch (err: any) {
            console.error("Login failed:", err);
            const errorMessage = mapFirebaseErrorToThai(err);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleGoBack = () => {
        router.back();
    };

    // useEffect เพื่อ redirect เมื่อ user และ role พร้อม
    useEffect(() => {
        if (!authLoading && isAuthenticated && authUser?.role && successMessage) {
            console.log("User authenticated with role:", authUser.role);

            let redirectPath: string;

            if (authUser.role === "admin") {
                redirectPath = "/admin";
            } else if (authUser.role === "editor") {
                redirectPath = "/dashboard";
            } else {
                // ใช้ redirect parameter หรือ default เป็น dashboard
                redirectPath = redirect !== "/" ? redirect : "/dashboard";
            }

            console.log("Redirecting to:", redirectPath);

            setTimeout(() => {
                router.push(redirectPath);
            }, 1500);
        }
    }, [authUser, authLoading, isAuthenticated, successMessage, redirect, router]);

    return (
        <Box
            sx={(t) => ({
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                py: 4, // ลดจาก 6
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
                size="small" // ลดจาก medium
                onClick={handleGoBack}
                sx={{
                    position: "fixed",
                    top: 20, // ลดจาก 24
                    left: 20, // ลดจาก 24
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

            <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>
                {/* Header Section */}
                <Box sx={{ textAlign: "center", mb: 3 }}> {/* ลดจาก mb: 4 */}
                    <Avatar
                        sx={(t) => ({
                            width: 64, // ลดจาก 80
                            height: 64, // ลดจาก 80
                            mx: "auto",
                            mb: 1.5, // ลดจาก 2
                            bgcolor: t.palette.primary.main,
                            boxShadow: 4,
                        })}
                    >
                        <LoginIcon sx={{ fontSize: 32 }} /> {/* ลดจาก 40 */}
                    </Avatar>
                    <Typography
                        variant="h5" // ลดจาก h4
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
                        ระบบจัดการผลงานตีพิมพ์
                    </Typography>
                </Box>

                <Card
                    variant="outlined"
                    sx={{
                        maxWidth: 480, // ลดจาก 520
                        mx: "auto",
                        borderRadius: 4,
                        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                        backdropFilter: "blur(10px)",
                        background: "rgba(255,255,255,0.95)",
                        border: "1px solid rgba(255,255,255,0.2)",
                    }}
                >
                    <CardContent sx={{ p: { xs: 3, md: 4 } }}> {/* ลดจาก { xs: 4, md: 5 } */}
                        {/* Login Icon and Title */}
                        <Box sx={{ textAlign: "center", mb: 3 }}> {/* ลดจาก mb: 4 */}
                            <Avatar
                                sx={(t) => ({
                                    width: 56, // ลดจาก 64
                                    height: 56, // ลดจาก 64
                                    mx: "auto",
                                    mb: 1.5, // ลดจาก 2
                                    bgcolor: `${t.palette.primary.main}15`,
                                    border: `2px solid ${t.palette.primary.main}25`,
                                })}
                            >
                                <PersonIcon sx={(t) => ({ fontSize: 28, color: t.palette.primary.main })} /> {/* ลดจาก 32 */}
                            </Avatar>
                            <Typography
                                variant="h6" // ลดจาก h5
                                component="h2"
                                align="center"
                                fontWeight={700}
                                gutterBottom
                                sx={{ color: "text.primary" }}
                            >
                                เข้าสู่ระบบ
                            </Typography>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                align="center"
                                sx={{ mb: 1, fontWeight: 500 }}
                            >
                                ลงชื่อเข้าใช้เพื่อเข้าถึงระบบจัดการผลงานตีพิมพ์
                            </Typography>
                        </Box>

                        {error && (
                            <Alert
                                severity="error"
                                sx={{
                                    mb: 2.5, // ลดจาก 3
                                    borderRadius: 2,
                                    boxShadow: "0 2px 8px rgba(244, 67, 54, 0.15)"
                                }}
                            >
                                {error}
                            </Alert>
                        )}

                        {successMessage && (
                            <Alert
                                severity="success"
                                sx={{
                                    mb: 2.5, // ลดจาก 3
                                    borderRadius: 2,
                                    boxShadow: "0 2px 8px rgba(76, 175, 80, 0.15)"
                                }}
                            >
                                เข้าสู่ระบบสำเร็จ - {successMessage}
                            </Alert>
                        )}

                        <Box component="form" onSubmit={handleSubmit}>
                            <TextField
                                label="อีเมล"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                fullWidth
                                margin="normal"
                                autoComplete="email"
                                variant="outlined"
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
                                            boxShadow: "0 0 0 2px rgba(25, 118, 210, 0.2)",
                                        },
                                    },
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailOutlinedIcon
                                                fontSize="small"
                                                sx={(t) => ({ color: t.palette.primary.main })}
                                            />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <TextField
                                label="รหัสผ่าน"
                                type={showPwd ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                fullWidth
                                margin="normal"
                                autoComplete="current-password"
                                variant="outlined"
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
                                            boxShadow: "0 0 0 2px rgba(25, 118, 210, 0.2)",
                                        },
                                    },
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockOutlinedIcon
                                                fontSize="small"
                                                sx={(t) => ({ color: t.palette.primary.main })}
                                            />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPwd((s) => !s)}
                                                edge="end"
                                                aria-label={showPwd ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                                                sx={{
                                                    "&:hover": {
                                                        backgroundColor: "rgba(0,0,0,0.04)",
                                                    },
                                                }}
                                            >
                                                {showPwd ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <Box
                                sx={{
                                    mt: 2,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                }}
                            >
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={remember}
                                            onChange={(e) => setRemember(e.target.checked)}
                                            size="small"
                                            sx={{
                                                "&.Mui-checked": {
                                                    color: "primary.main",
                                                },
                                            }}
                                        />
                                    }
                                    label={
                                        <Typography variant="body2" fontWeight={500}>
                                            จดจำฉันไว้
                                        </Typography>
                                    }
                                />
                                <Link
                                    href="/forgot-password"
                                    style={{
                                        fontSize: 14,
                                        textDecoration: "none",
                                        fontWeight: 500,
                                    }}
                                >
                                    ลืมรหัสผ่าน?
                                </Link>
                            </Box>

                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                disabled={loading}
                                startIcon={loading ? undefined : <LoginIcon />}
                                sx={{
                                    mt: 2.5, // ลดจาก 3
                                    py: 1.5, // ลดจาก 1.8
                                    borderRadius: 3,
                                    fontWeight: 700,
                                    fontSize: "0.95rem", // ลดจาก 1rem
                                    textTransform: "none",
                                    background: (t) => `linear-gradient(45deg, ${t.palette.primary.main} 30%, ${t.palette.primary.dark} 90%)`,
                                    boxShadow: "0 4px 20px rgba(25, 118, 210, 0.4)",
                                    "&:hover": {
                                        transform: "translateY(-2px)",
                                        boxShadow: "0 6px 25px rgba(25, 118, 210, 0.5)",
                                        background: (t) => `linear-gradient(45deg, ${t.palette.primary.dark} 30%, ${t.palette.primary.main} 90%)`,
                                    },
                                    "&:disabled": {
                                        background: "rgba(0,0,0,0.12)",
                                        boxShadow: "none",
                                        transform: "none",
                                    },
                                    transition: "all 0.3s ease-in-out",
                                }}
                            >
                                {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
                            </Button>
                        </Box>

                        <Divider sx={{ my: 3, opacity: 0.7 }} /> {/* ลดจาก my: 4 */}


                    </CardContent>
                </Card>


            </Container>
        </Box>
    );
}
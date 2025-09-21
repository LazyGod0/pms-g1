// app/signin/page.tsx
"use client";

import { useMemo, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/configs/firebase-config";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

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
} from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

function mapFirebaseErrorToThai(codeOrMsg: string) {
    const code = (codeOrMsg || "").toLowerCase();
    if (code.includes("auth/invalid-email")) return "อีเมลไม่ถูกต้อง";
    if (code.includes("auth/user-disabled")) return "บัญชีนี้ถูกปิดการใช้งาน";
    if (code.includes("auth/user-not-found")) return "ไม่พบบัญชีผู้ใช้";
    if (code.includes("auth/wrong-password") || code.includes("invalid-credential"))
        return "รหัสผ่านไม่ถูกต้อง";
    if (code.includes("too-many-requests")) return "พยายามเข้าสู่ระบบหลายครั้งเกินไป ลองใหม่ภายหลัง";
    return "ไม่สามารถเข้าสู่ระบบได้ โปรดลองอีกครั้ง";
}

export default function SignInPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = useMemo(() => searchParams.get("redirect") || "/", [searchParams]);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [remember, setRemember] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            // ถ้าอยากใช้ persistence ตาม remember: ตั้งที่ init firebase/auth persistence ภายนอกไฟล์นี้จะเหมาะกว่า
            await signInWithEmailAndPassword(auth, email.trim(), password);
            router.push(redirect);
        } catch (err: any) {
            setError(mapFirebaseErrorToThai(err?.code || err?.message || ""));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={(t) => ({
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                py: 6,
                background: `linear-gradient(120deg, ${t.palette.primary.light}22, transparent)`,
            })}
        >
            <Container maxWidth="sm">
                <Card
                    variant="outlined"
                    sx={{ maxWidth: 520, mx: "auto", borderRadius: 3, boxShadow: 3 }}
                >
                    <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                        <Typography
                            variant="h5"
                            component="h1"
                            align="center"
                            fontWeight={800}
                            gutterBottom
                        >
                            เข้าสู่ระบบ
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            align="center"
                            sx={{ mb: 3 }}
                        >
                            ลงชื่อเข้าใช้เพื่อเข้าถึงระบบจัดการผลงานตีพิมพ์
                        </Typography>

                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
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
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailOutlinedIcon fontSize="small" />
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
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockOutlinedIcon fontSize="small" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPwd((s) => !s)}
                                                edge="end"
                                                aria-label={showPwd ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                                            >
                                                {showPwd ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <Box
                                sx={{
                                    mt: 1,
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
                                        />
                                    }
                                    label={<Typography variant="body2">จดจำฉันไว้</Typography>}
                                />
                                <Link href="/forgot-password" style={{ fontSize: 14 }}>
                                    ลืมรหัสผ่าน?
                                </Link>
                            </Box>

                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                disabled={loading}
                                sx={{ mt: 2, py: 1.4, borderRadius: 2, fontWeight: 700 }}
                            >
                                {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
                            </Button>
                        </Box>

                        <Divider sx={{ my: 3 }} />

                        <Typography variant="body2" align="center">
                            หากคุณยังไม่มีบัญชี?{" "}
                            <Link href="/register">ลงทะเบียน</Link>
                        </Typography>
                    </CardContent>
                </Card>

                {/* Footer small info */}
                <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    align="center"
                    sx={{ mt: 2 }}
                >
                    หลังเข้าสู่ระบบแล้ว จะพาไปยัง: <b>{redirect}</b>
                </Typography>
            </Container>
        </Box>
    );
}

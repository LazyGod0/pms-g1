// app/signin/page.tsx
"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/configs/firebase-config";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
} from "@mui/material";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="#f5f5f5"
      px={2}
    >
      <Card sx={{ maxWidth: 400, width: "100%", boxShadow: 3 }}>
        <CardContent sx={{ p: 4 }}>
          {/* Headline */}
          <Typography
            variant="h5"
            component="h2"
            align="center"
            fontWeight="bold"
            color="primary"
            gutterBottom
          >
            เข้าสู่ระบบ
          </Typography>

          {/* Form */}
          <Box
            component="form"
            onSubmit={handleSubmit}
            display="flex"
            flexDirection="column"
            gap={3}
          >
            <TextField
              label="อีเมล"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              InputLabelProps={{ style: { color: "black" } }}
              InputProps={{ style: { color: "black" } }}
            />

            <TextField
              label="รหัสผ่าน"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              InputLabelProps={{ style: { color: "black" } }}
              InputProps={{ style: { color: "black" } }}
            />

            {error && <Alert severity="error">{error}</Alert>}

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ py: 1.5, fontWeight: "bold" }}
            >
              เข้าสู่ระบบ
            </Button>
          </Box>

          {/* Register link */}
          <Typography
            variant="body2"
            align="center"
            sx={{ mt: 3, color: "black" }}
          >
            หากคุณยังไม่มีบัญชี?{" "}
            <Link
              href="/register"
              style={{ color: "#1976d2", fontWeight: 500, textDecoration: "none" }}
            >
              ลงทะเบียน
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

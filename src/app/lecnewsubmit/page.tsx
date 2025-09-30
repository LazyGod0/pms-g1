"use client";

import * as React from "react";
import {
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  Stack,
  Paper,
  Snackbar,
  Alert,
  Typography,
  Grid,
  Container,
  Avatar,
  Fab,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { useRouter } from "next/navigation";

import BasicsStep from "@/app/component/steps/BasicsStep";
import AuthorsStep from "@/app/component/steps/AuthorsStep";
import IdentifiersStep from "@/app/component/steps/IdentifiersStep";
import AttachmentsStep from "@/app/component/steps/AttachmentsStep";
import SidebarSummary from "@/app/component/publications/SidebarSummary";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/contexts";

import { SubmissionForm } from "@/types/submission";
import { db } from "@/configs/firebase-config";
import { doc, setDoc, serverTimestamp, collection } from "firebase/firestore";
import { getNextTempId } from "@/libs/firestore-utils";

const steps = ["ข้อมูลพื้นฐาน", "ผู้แต่ง", "ตัวระบุ", "ไฟล์แนบ"];

const initialForm: SubmissionForm = {
  basics: { title: "", type: "", level: "", year: "", abstract: "", keywords: [] },
  authors: [],
  identifiers: { doi: "", url: "", references: [] },
  attachments: { files: [] },
};

type SnackState = { open: boolean; msg: string; sev: "success" | "error" | "warning" | "info" };

type BasicsErrors = Partial<{ title: string; type: string; level: string; year: string; abstract: string }>;
type AuthorRowError = { name?: string; affiliation?: string; email?: string };
type AuthorsErrors = Record<number, AuthorRowError>;

function LecNewSubmitContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeStep, setActiveStep] = React.useState(0);
  const [form, setForm] = React.useState<SubmissionForm>(initialForm);
  const [snack, setSnack] = React.useState<SnackState>({ open: false, msg: "", sev: "success" });
  const [errors, setErrors] = React.useState<{ basics?: BasicsErrors; authors?: AuthorsErrors }>({});

  // setters
  const setBasics = (next: SubmissionForm["basics"]) => setForm((p) => ({ ...p, basics: next }));
  const setAuthors = (next: SubmissionForm["authors"]) => setForm((p) => ({ ...p, authors: next }));
  const setIdentifiers = (next: SubmissionForm["identifiers"]) => setForm((p) => ({ ...p, identifiers: next }));
  const setAttachments = (next: SubmissionForm["attachments"]) => setForm((p) => ({ ...p, attachments: next }));

  // validate per step
  function validateStepAndCollect(step: number, f: SubmissionForm): boolean {
    const nextErrors: typeof errors = {};

    if (step === 0) {
      const e: BasicsErrors = {};
      if (!f.basics.title) e.title = "จำเป็น";
      if (!f.basics.type) e.type = "จำเป็น";
      if (!f.basics.level) e.level = "จำเป็น";
      if (!f.basics.year) e.year = "จำเป็น";
      if (!f.basics.abstract) e.abstract = "จำเป็น";
      if (Object.keys(e).length) nextErrors.basics = e;
    }

    if (step === 1) {
      const e: AuthorsErrors = {};
      if (!f.authors?.length) e[0] = { name: "ต้องมีผู้แต่งอย่างน้อย 1 คน" };
      f.authors?.forEach((a, i) => {
        const row: AuthorRowError = {};
        if (!a.name) row.name = "จำเป็น";
        if (!a.affiliation) row.affiliation = "จำเป็น";
        if (!a.email) row.email = "จำเป็น";
        if (Object.keys(row).length) e[i] = row;
      });
      if (Object.keys(e).length) nextErrors.authors = e;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  const onNext = () => {
    if (!validateStepAndCollect(activeStep, form)) {
      setSnack({ open: true, msg: "กรอกข้อมูลให้ครบก่อนดำเนินการต่อ", sev: "warning" });
      return;
    }
    setActiveStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const onBack = () => setActiveStep((s) => Math.max(0, s - 1));

  // Save Draft
  const handleSaveDraft = async () => {
    try {
      if (!user?.uid) {
        setSnack({ open: true, msg: "กรุณาเข้าสู่ระบบก่อนบันทึก", sev: "error" });
        return;
      }

      const newId = await getNextTempId(user.uid);
      const colRef = collection(db, "users", user.uid, "submissions");
      const docRef = doc(colRef, newId);

      await setDoc(docRef, {
        ...form,
        status: "draft",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setSnack({ open: true, msg: `Draft ถูกบันทึกเป็น ${newId}`, sev: "success" });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setSnack({ open: true, msg: msg || "Save draft ล้มเหลว", sev: "error" });
    }
  };

  // Submit
  const handleSubmit = async () => {
    const ok0 = validateStepAndCollect(0, form);
    const ok1 = validateStepAndCollect(1, form);
    if (!(ok0 && ok1)) {
      setSnack({ open: true, msg: "กรอกข้อมูลที่บังคับให้ครบก่อน Submit", sev: "warning" });
      return;
    }

    try {
      if (!user?.uid) {
        setSnack({ open: true, msg: "กรุณาเข้าสู่ระบบก่อนส่ง", sev: "error" });
        return;
      }

      const newId = await getNextTempId(user.uid);
      const colRef = collection(db, "users", user.uid, "submissions");
      const docRef = doc(colRef, newId);

      await setDoc(docRef, {
        ...form,
        status: "submitted",
        createdAt: serverTimestamp(),
        submittedAt: serverTimestamp(),
      });

      setSnack({ open: true, msg: `ส่งสำเร็จเป็นเอกสาร ${newId}`, sev: "success" });

      // Navigate back to dashboard after successful submission
      setTimeout(() => {
        router.push('/lec-dashboard');
      }, 2000);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setSnack({ open: true, msg: msg || "Submit ล้มเหลว", sev: "error" });
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <Box
      sx={(t) => ({
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${t.palette.primary.main}08 0%, ${t.palette.secondary.main}05 50%, transparent 100%)`,
        py: 3,
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23f0f0f0" fill-opacity="0.02"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          zIndex: 0,
          pointerEvents: 'none',
        },
      })}
    >
      {/* Back Button */}
      <Fab
        color="primary"
        size="small"
        onClick={handleGoBack}
        sx={{
          position: "fixed",
          top: 20,
          left: 20,
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

      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
        {/* Header Section */}
        <Box sx={{ mb: 4, textAlign: "center" }}>
          <Avatar
            sx={(t) => ({
              width: 64,
              height: 64,
              mx: "auto",
              mb: 2,
              bgcolor: t.palette.primary.main,
              boxShadow: 4,
            })}
          >
            <AssignmentIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Typography
            variant="h4"
            component="h1"
            fontWeight={700}
            gutterBottom
            sx={(t) => ({
              background: `linear-gradient(45deg, ${t.palette.primary.main}, ${t.palette.secondary.main})`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
            })}
          >
            New Publication Submission
          </Typography>
          <Typography variant="body1" color="text.secondary">
            ส่งผลงานตีพิมพ์ใหม่ของคุณผ่านระบบออนไลน์
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* ซ้าย: ฟอร์ม + stepper */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 4,
                boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                backdropFilter: "blur(10px)",
                background: "rgba(255,255,255,0.95)",
                border: "1px solid rgba(255,255,255,0.2)",
                overflow: 'hidden',
              }}
            >
              {/* Stepper Header */}
              <Box sx={{ px: 4, py: 3, bgcolor: "rgba(0,0,0,0.02)" }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  ขั้นตอนการส่งผลงาน
                </Typography>
                <Stepper
                  activeStep={activeStep}
                  alternativeLabel
                  sx={{
                    mt: 2,
                    "& .MuiStepLabel-label": {
                      fontSize: "0.875rem",
                      fontWeight: 500,
                    },
                    "& .MuiStepIcon-root": {
                      fontSize: "1.5rem",
                    },
                    "& .MuiStepIcon-root.Mui-active": {
                      color: "primary.main",
                    },
                    "& .MuiStepIcon-root.Mui-completed": {
                      color: "success.main",
                    },
                  }}
                >
                  {steps.map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>

              {/* Form Content */}
              <Box sx={{ px: 4, py: 3 }}>
                {activeStep === 0 && (
                  <BasicsStep value={form.basics} onChange={setBasics} errors={errors.basics} />
                )}
                {activeStep === 1 && (
                  <AuthorsStep value={form.authors} onChange={setAuthors} errors={errors.authors} />
                )}
                {activeStep === 2 && (
                  <IdentifiersStep value={form.identifiers} onChange={setIdentifiers} />
                )}
                {activeStep === 3 && (
                  <AttachmentsStep value={form.attachments} onChange={setAttachments} />
                )}
              </Box>

              {/* Navigation Buttons */}
              <Box sx={{ px: 4, py: 3, bgcolor: "rgba(0,0,0,0.02)", borderTop: "1px solid rgba(0,0,0,0.08)" }}>
                <Stack direction="row" spacing={2} justifyContent="space-between">
                  <Button
                    variant="outlined"
                    onClick={onBack}
                    disabled={activeStep === 0}
                    sx={{
                      borderRadius: 3,
                      px: 3,
                      py: 1.2,
                      fontWeight: 600,
                    }}
                  >
                    ย้อนกลับ
                  </Button>

                  <Stack direction="row" spacing={1.5}>
                    <Button
                      variant="outlined"
                      onClick={handleSaveDraft}
                      sx={{
                        borderRadius: 3,
                        px: 3,
                        py: 1.2,
                        fontWeight: 600,
                        borderColor: 'secondary.main',
                        color: 'secondary.main',
                        '&:hover': {
                          borderColor: 'secondary.dark',
                          bgcolor: 'secondary.main',
                          color: 'white',
                        }
                      }}
                    >
                      บันทึกแบบร่าง
                    </Button>

                    {activeStep < steps.length - 1 ? (
                      <Button
                        variant="contained"
                        onClick={onNext}
                        sx={{
                          borderRadius: 3,
                          px: 3,
                          py: 1.2,
                          fontWeight: 600,
                          background: (t) => `linear-gradient(45deg, ${t.palette.primary.main} 30%, ${t.palette.primary.dark} 90%)`,
                          boxShadow: "0 4px 20px rgba(25, 118, 210, 0.4)",
                          "&:hover": {
                            transform: "translateY(-1px)",
                            boxShadow: "0 6px 25px rgba(25, 118, 210, 0.5)",
                          },
                          transition: "all 0.3s ease-in-out",
                        }}
                      >
                        ถัดไป
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        onClick={handleSubmit}
                        sx={{
                          borderRadius: 3,
                          px: 4,
                          py: 1.2,
                          fontWeight: 700,
                          background: (t) => `linear-gradient(45deg, ${t.palette.success.main} 30%, ${t.palette.success.dark} 90%)`,
                          boxShadow: "0 4px 20px rgba(76, 175, 80, 0.4)",
                          "&:hover": {
                            transform: "translateY(-1px)",
                            boxShadow: "0 6px 25px rgba(76, 175, 80, 0.5)",
                          },
                          transition: "all 0.3s ease-in-out",
                        }}
                      >
                        ส่งผลงาน
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </Box>
            </Paper>
          </Grid>

          {/* ขวา: Progress + Summary */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Box sx={{ position: 'sticky', top: 24 }}>
              <SidebarSummary form={form} />
            </Box>
          </Grid>
        </Grid>

        <Snackbar
          open={snack.open}
          autoHideDuration={3500}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            severity={snack.sev}
            onClose={() => setSnack((s) => ({ ...s, open: false }))}
            sx={{
              borderRadius: 3,
              boxShadow: 4,
            }}
          >
            {snack.msg}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}

export default function LecNewSubmitPage() {
  return (
    <ProtectedRoute requiredRole="lecturer" redirectTo="/login">
      <LecNewSubmitContent />
    </ProtectedRoute>
  );
}

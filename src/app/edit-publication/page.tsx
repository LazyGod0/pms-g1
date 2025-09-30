"use client";

import * as React from "react";
import { useEffect, useState } from "react";
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
  Container,
  Avatar,
  Fab,
  CircularProgress,
  Fade,
  Slide,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { useRouter, useSearchParams } from "next/navigation";

import BasicsStep from "@/app/component/steps/BasicsStep";
import AuthorsStep from "@/app/component/steps/AuthorsStep";
import IdentifiersStep from "@/app/component/steps/IdentifiersStep";
import AttachmentsStep from "@/app/component/steps/AttachmentsStep";
import SidebarSummary from "@/app/component/publications/SidebarSummary";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/contexts";

import { SubmissionForm } from "@/types/submission";
import { db } from "@/configs/firebase-config";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";

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

export default function EditPublicationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const publicationId = searchParams.get("id");
  const { user } = useAuth();

  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState<SubmissionForm>(initialForm);
  const [snack, setSnack] = useState<SnackState>({ open: false, msg: "", sev: "info" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalTitle, setOriginalTitle] = useState("");

  // Error states
  const [basicsErrors, setBasicsErrors] = useState<BasicsErrors>({});
  const [authorsErrors, setAuthorsErrors] = useState<AuthorsErrors>({});

  // Load publication data
  useEffect(() => {
    const loadPublication = async () => {
      if (!publicationId || !user?.uid) {
        router.push("/lec-publication");
        return;
      }

      try {
        setLoading(true);
        const docRef = doc(db, "users", user.uid, "submissions", publicationId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          setSnack({
            open: true,
            msg: "ไม่พบผลงานที่ต้องการแก้ไข",
            sev: "error"
          });
          router.push("/lec-publication");
          return;
        }

        const data = docSnap.data();
        const loadedForm: SubmissionForm = {
          basics: {
            title: data.basics?.title || "",
            type: data.basics?.type || "",
            level: data.basics?.level || "",
            year: data.basics?.year || "",
            abstract: data.basics?.abstract || "",
            keywords: data.basics?.keywords || []
          },
          authors: data.authors || [],
          identifiers: {
            doi: data.identifiers?.doi || "",
            url: data.identifiers?.url || "",
            references: data.identifiers?.references || []
          },
          attachments: {
            files: data.attachments?.files || []
          }
        };

        setForm(loadedForm);
        setOriginalTitle(loadedForm.basics.title);
      } catch (error: any) {
        console.error("Error loading publication:", error);
        setSnack({
          open: true,
          msg: "เกิดข้อผิดพลาดในการโหลดข้อมูล",
          sev: "error"
        });
      } finally {
        setLoading(false);
      }
    };

    loadPublication();
  }, [publicationId, user, router]);

  const handleNext = () => {
    if (validateCurrentStep()) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const validateCurrentStep = (): boolean => {
    switch (activeStep) {
      case 0: // Basics
        const errors: BasicsErrors = {};
        if (!form.basics.title.trim()) errors.title = "กรุณากรอกชื่อเรื่อง";
        if (!form.basics.type) errors.type = "กรุณาเลือกประเภทผลงาน";
        if (!form.basics.level) errors.level = "กรุณาเลือกระดับผลงาน";
        if (!form.basics.year) errors.year = "กรุณาเลือกปี";
        if (!form.basics.abstract.trim()) errors.abstract = "กรุณากรอกบทคัดย่อ";

        setBasicsErrors(errors);
        return Object.keys(errors).length === 0;

      case 1: // Authors
        const authErrors: AuthorsErrors = {};
        let hasAuthErrors = false;

        if (form.authors.length === 0) {
          setSnack({ open: true, msg: "กรุณาเพิ่มผู้แต่งอย่างน้อย 1 คน", sev: "warning" });
          return false;
        }

        form.authors.forEach((author, index) => {
          const rowErrors: AuthorRowError = {};
          if (!author.name?.trim()) {
            rowErrors.name = "กรุณากรอกชื่อผู้แต่ง";
            hasAuthErrors = true;
          }
          if (!author.affiliation?.trim()) {
            rowErrors.affiliation = "กรุณากรอกสังกัด";
            hasAuthErrors = true;
          }
          if (author.email && !/\S+@\S+\.\S+/.test(author.email)) {
            rowErrors.email = "รูปแบบอีเมลไม่ถูกต้อง";
            hasAuthErrors = true;
          }
          if (Object.keys(rowErrors).length > 0) {
            authErrors[index] = rowErrors;
          }
        });

        setAuthorsErrors(authErrors);
        return !hasAuthErrors;

      default:
        return true;
    }
  };

  const handleSave = async () => {
    if (!validateCurrentStep()) return;

    if (!publicationId || !user?.uid) {
      setSnack({ open: true, msg: "ข้อมูลไม่ครบถ้วน", sev: "error" });
      return;
    }

    try {
      setSaving(true);

      const docRef = doc(db, "users", user.uid, "submissions", publicationId);

      await updateDoc(docRef, {
        basics: form.basics,
        authors: form.authors,
        identifiers: form.identifiers,
        attachments: form.attachments,
        updatedAt: serverTimestamp(),
        updatedBy: user.uid
      });

      setSnack({
        open: true,
        msg: "บันทึกการแก้ไขเรียบร้อยแล้ว",
        sev: "success"
      });

      // Redirect back to publications list after a short delay
      setTimeout(() => {
        router.push("/lec-publication");
      }, 2000);

    } catch (error: any) {
      console.error("Error updating publication:", error);
      setSnack({
        open: true,
        msg: "เกิดข้อผิดพลาดในการบันทึก",
        sev: "error"
      });
    } finally {
      setSaving(false);
    }
  };

  const closeSnack = () => setSnack((prev) => ({ ...prev, open: false }));

  // Helper functions to update specific parts of the form
  const setBasics = (basics: SubmissionForm["basics"]) => {
    setForm(prev => ({ ...prev, basics }));
  };

  const setAuthors = (authors: SubmissionForm["authors"]) => {
    setForm(prev => ({ ...prev, authors }));
  };

  const setIdentifiers = (identifiers: SubmissionForm["identifiers"]) => {
    setForm(prev => ({ ...prev, identifiers }));
  };

  const setAttachments = (attachments: SubmissionForm["attachments"]) => {
    setForm(prev => ({ ...prev, attachments }));
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="lecturer" redirectTo="/login">
        <Box
          sx={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Card
            sx={{
              p: 4,
              borderRadius: 4,
              boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(10px)",
              textAlign: "center",
              maxWidth: 400,
              mx: 2
            }}
          >
            <CardContent>
              <Box sx={{ mb: 3 }}>
                <CircularProgress
                  size={60}
                  sx={{
                    color: "primary.main",
                    filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.2))"
                  }}
                />
              </Box>
              <Typography variant="h5" fontWeight={700} sx={{ mb: 2, color: "text.primary" }}>
                กำลังโหลดข้อมูล
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                โปรดรอสักครู่ ระบบกำลังเตรียมข้อมูลสำหรับการแก้ไข
              </Typography>
              <LinearProgress
                sx={{
                  borderRadius: 2,
                  height: 6,
                  bgcolor: "rgba(0,0,0,0.1)",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 2,
                    background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)"
                  }
                }}
              />
            </CardContent>
          </Card>
        </Box>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="lecturer" redirectTo="/login">
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          py: 3
        }}
      >
        <Container maxWidth="xl">
          <Fade in timeout={800}>
            <Box>
              {/* Enhanced Header */}
              <Slide direction="down" in timeout={600}>
                <Card
                  sx={{
                    mb: 4,
                    borderRadius: 4,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    boxShadow: "0 20px 40px rgba(102, 126, 234, 0.3)",
                    overflow: "visible",
                    position: "relative"
                  }}
                >
                  {/* Decorative elements */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: -10,
                      right: 30,
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <AutoAwesomeIcon sx={{ color: "rgba(255,255,255,0.8)" }} />
                  </Box>

                  <CardContent sx={{ p: 4 }}>
                    <Stack direction="row" alignItems="center" spacing={3}>
                      <Tooltip title="กลับไปยังรายการผลงาน">
                        <Fab
                          size="medium"
                          onClick={() => router.push("/lec-publication")}
                          sx={{
                            bgcolor: "rgba(255,255,255,0.2)",
                            color: "white",
                            backdropFilter: "blur(10px)",
                            "&:hover": {
                              bgcolor: "rgba(255,255,255,0.3)",
                              transform: "scale(1.05)"
                            },
                            transition: "all 0.3s ease"
                          }}
                        >
                          <ArrowBackIcon />
                        </Fab>
                      </Tooltip>

                      <Stack direction="row" alignItems="center" spacing={2} sx={{ flex: 1 }}>
                        <Avatar
                          sx={{
                            bgcolor: "rgba(255,255,255,0.2)",
                            width: 56,
                            height: 56,
                            backdropFilter: "blur(10px)"
                          }}
                        >
                          <EditIcon sx={{ fontSize: 28 }} />
                        </Avatar>

                        <Box sx={{ flex: 1 }}>
                          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                            <Typography variant="h4" fontWeight={800}>
                              แก้ไขผลงานตีพิมพ์
                            </Typography>
                            <Chip
                              label="กำลังแก้ไข"
                              size="small"
                              sx={{
                                bgcolor: "rgba(255,255,255,0.2)",
                                color: "white",
                                fontWeight: 600
                              }}
                            />
                          </Stack>
                          <Typography
                            variant="h6"
                            sx={{
                              opacity: 0.9,
                              fontWeight: 500,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              maxWidth: { xs: 300, md: 600 }
                            }}
                          >
                            {originalTitle || "กำลังโหลด..."}
                          </Typography>
                        </Box>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Slide>

              <Box sx={{ display: "flex", gap: 4, alignItems: "flex-start" }}>
                {/* Enhanced Main Content */}
                <Slide direction="up" in timeout={800}>
                  <Box sx={{ flex: 1 }}>
                    <Card
                      elevation={0}
                      sx={{
                        borderRadius: 4,
                        background: "rgba(255,255,255,0.9)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
                      }}
                    >
                      <CardContent sx={{ p: 4 }}>
                        {/* Enhanced Stepper */}
                        <Box sx={{ mb: 4 }}>
                          <Stepper
                            activeStep={activeStep}
                            sx={{
                              "& .MuiStepLabel-label": {
                                fontWeight: 600,
                                fontSize: "1.1rem"
                              },
                              "& .MuiStepIcon-root": {
                                fontSize: "1.8rem",
                                "&.Mui-active": {
                                  color: "primary.main",
                                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
                                },
                                "&.Mui-completed": {
                                  color: "success.main"
                                }
                              },
                              "& .MuiStepConnector-line": {
                                borderTopWidth: 3
                              }
                            }}
                          >
                            {steps.map((label, index) => (
                              <Step key={label}>
                                <StepLabel
                                  StepIconComponent={({ active, completed }) => (
                                    <Box
                                      sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        background: completed
                                          ? "linear-gradient(135deg, #4caf50 0%, #45a049 100%)"
                                          : active
                                          ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                          : "#e0e0e0",
                                        color: active || completed ? "white" : "#666",
                                        fontWeight: 700,
                                        fontSize: "1.1rem",
                                        boxShadow: active || completed ? "0 4px 12px rgba(0,0,0,0.2)" : "none",
                                        transition: "all 0.3s ease"
                                      }}
                                    >
                                      {completed ? <CheckCircleIcon /> : index + 1}
                                    </Box>
                                  )}
                                >
                                  {label}
                                </StepLabel>
                              </Step>
                            ))}
                          </Stepper>
                        </Box>

                        {/* Enhanced Step Content */}
                        <Fade in key={activeStep} timeout={500}>
                          <Box
                            sx={{
                              minHeight: 500,
                              p: 3,
                              borderRadius: 3,
                              background: "linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(247,250,252,0.8) 100%)",
                              border: "1px solid rgba(0,0,0,0.05)"
                            }}
                          >
                            {activeStep === 0 && (
                              <BasicsStep
                                value={form.basics}
                                onChange={setBasics}
                                errors={basicsErrors}
                              />
                            )}
                            {activeStep === 1 && (
                              <AuthorsStep
                                value={form.authors}
                                onChange={setAuthors}
                                errors={authorsErrors}
                              />
                            )}
                            {activeStep === 2 && (
                              <IdentifiersStep
                                value={form.identifiers}
                                onChange={setIdentifiers}
                              />
                            )}
                            {activeStep === 3 && (
                              <AttachmentsStep
                                value={form.attachments}
                                onChange={setAttachments}
                              />
                            )}
                          </Box>
                        </Fade>

                        {/* Enhanced Navigation Buttons */}
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          sx={{
                            mt: 4,
                            pt: 4,
                            borderTop: "2px solid",
                            borderImage: "linear-gradient(90deg, transparent 0%, #e0e0e0 50%, transparent 100%) 1"
                          }}
                        >
                          <Button
                            onClick={handleBack}
                            disabled={activeStep === 0}
                            size="large"
                            variant="outlined"
                            sx={{
                              borderRadius: 3,
                              px: 4,
                              py: 1.5,
                              fontWeight: 600,
                              borderWidth: 2,
                              "&:hover": {
                                borderWidth: 2,
                                transform: "translateY(-2px)",
                                boxShadow: "0 8px 16px rgba(0,0,0,0.1)"
                              },
                              transition: "all 0.3s ease"
                            }}
                          >
                            ย้อนกลับ
                          </Button>

                          <Box>
                            {activeStep < steps.length - 1 ? (
                              <Button
                                onClick={handleNext}
                                size="large"
                                variant="contained"
                                sx={{
                                  borderRadius: 3,
                                  px: 4,
                                  py: 1.5,
                                  fontWeight: 600,
                                  minWidth: 140,
                                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                  "&:hover": {
                                    transform: "translateY(-2px)",
                                    boxShadow: "0 12px 24px rgba(102, 126, 234, 0.4)"
                                  },
                                  transition: "all 0.3s ease"
                                }}
                              >
                                ถัดไป
                              </Button>
                            ) : (
                              <Button
                                onClick={handleSave}
                                size="large"
                                variant="contained"
                                disabled={saving}
                                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                                sx={{
                                  borderRadius: 3,
                                  px: 4,
                                  py: 1.5,
                                  fontWeight: 600,
                                  minWidth: 180,
                                  background: saving
                                    ? "linear-gradient(135deg, #ccc 0%, #999 100%)"
                                    : "linear-gradient(135deg, #4caf50 0%, #45a049 100%)",
                                  "&:hover": {
                                    transform: saving ? "none" : "translateY(-2px)",
                                    boxShadow: saving ? "none" : "0 12px 24px rgba(76, 175, 80, 0.4)"
                                  },
                                  transition: "all 0.3s ease"
                                }}
                              >
                                {saving ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
                              </Button>
                            )}
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Box>
                </Slide>

                {/* Enhanced Sidebar */}
                <Slide direction="left" in timeout={1000}>
                  <Box sx={{ width: 350, flexShrink: 0 }}>
                    <Card
                      sx={{
                        borderRadius: 4,
                        background: "rgba(255,255,255,0.9)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                        position: "sticky",
                        top: 20
                      }}
                    >
                      <SidebarSummary form={form} />
                    </Card>
                  </Box>
                </Slide>
              </Box>
            </Box>
          </Fade>
        </Container>
      </Box>

      {/* Enhanced Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={6000}
        onClose={closeSnack}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        TransitionComponent={Slide}
      >
        <Alert
          onClose={closeSnack}
          severity={snack.sev}
          variant="filled"
          sx={{
            borderRadius: 3,
            fontWeight: 600,
            boxShadow: "0 8px 24px rgba(0,0,0,0.2)"
          }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </ProtectedRoute>
  );
}

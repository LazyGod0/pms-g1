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
} from "@mui/material";

import BasicsStep from "@/app/component/steps/BasicsStep";
import AuthorsStep from "@/app/component/steps/AuthorsStep";
import IdentifiersStep from "@/app/component/steps/IdentifiersStep";
import AttachmentsStep from "@/app/component/steps/AttachmentsStep";
import SidebarSummary from "@/app/component/publications/SidebarSummary";

import { SubmissionForm } from "@/types/submission";
import { db } from "@/configs/firebase-config";
import {
  doc,
  setDoc,
  serverTimestamp,
  addDoc,
  collection,
} from "firebase/firestore";
import { getNextTempId } from "@/libs/firestore-utils";

// ======= ใช้ UID ตายตัวตามที่กำหนด =======
const FIXED_UID = "YZUhXqGmf1U24zmdxYvV";

const steps = ["Basics", "Authors", "Identifiers", "Attachments"];

const initialForm: SubmissionForm = {
  basics: { title: "", type: "", level: "", year: "", abstract: "", keywords: [] },
  authors: [],
  identifiers: { doi: "", url: "", references: [] },
  attachments: { files: [] },
};

type SnackState = {
  open: boolean;
  msg: string;
  sev: "success" | "error" | "warning" | "info";
};

type BasicsErrors = Partial<{
  title: string;
  type: string;
  level: string;
  year: string;
  abstract: string;
}>;
type AuthorRowError = { name?: string; affiliation?: string; email?: string };
type AuthorsErrors = Record<number, AuthorRowError>;

// ======= เขียน Log ที่ users/{uid}/logs =======
async function writeUserLog(
  userId: string,
  payload: {
    submissionId: string;
    action: "saved_draft" | "submitted" | "created" | "updated" | "deleted";
    title?: string;
    type?: string;
    status?: string;
  }
) {
  const logsCol = collection(db, "users", userId, "logs"); // collection path = 3 segments (คี่) ✔️
  await addDoc(logsCol, {
    userId,
    ...payload,
    timestamp: serverTimestamp(),
  });
}

export default function LecNewSubmitPage() {
  const [activeStep, setActiveStep] = React.useState(0);
  const [form, setForm] = React.useState<SubmissionForm>(initialForm);
  const [snack, setSnack] = React.useState<SnackState>({
    open: false,
    msg: "",
    sev: "success",
  });

  const [errors, setErrors] = React.useState<{
    basics?: BasicsErrors;
    authors?: AuthorsErrors;
  }>({});

  // setters
  const setBasics = (next: SubmissionForm["basics"]) =>
    setForm((p) => ({ ...p, basics: next }));
  const setAuthors = (next: SubmissionForm["authors"]) =>
    setForm((p) => ({ ...p, authors: next }));
  const setIdentifiers = (next: SubmissionForm["identifiers"]) =>
    setForm((p) => ({ ...p, identifiers: next }));
  const setAttachments = (next: SubmissionForm["attachments"]) =>
    setForm((p) => ({ ...p, attachments: next }));

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

  // ======= Save Draft -> สร้าง submission + เขียน users/{uid}/logs =======
  const handleSaveDraft = async () => {
    try {
      const newId = await getNextTempId(FIXED_UID); // e.g., temp0001
      const colRef = collection(db, "users", FIXED_UID, "submissions"); // collection path (คี่) ✔️
      const docRef = doc(colRef, newId); // document path (คู่) ✔️

      await setDoc(docRef, {
        ...form,
        status: "draft",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await writeUserLog(FIXED_UID, {
        submissionId: newId,
        action: "saved_draft",
        title: form.basics.title,
        type: form.basics.type,
        status: "draft",
      });

      setSnack({ open: true, msg: `Draft ถูกบันทึกเป็น ${newId}`, sev: "success" });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setSnack({ open: true, msg: msg || "Save draft ล้มเหลว", sev: "error" });
    }
  };

  // ======= Submit -> สร้าง submission + เขียน users/{uid}/logs =======
  const handleSubmit = async () => {
    const ok0 = validateStepAndCollect(0, form);
    const ok1 = validateStepAndCollect(1, form);
    if (!(ok0 && ok1)) {
      setSnack({ open: true, msg: "กรอกข้อมูลที่บังคับให้ครบก่อน Submit", sev: "warning" });
      return;
    }

    try {
      const newId = await getNextTempId(FIXED_UID);
      const colRef = collection(db, "users", FIXED_UID, "submissions");
      const docRef = doc(colRef, newId);

      await setDoc(docRef, {
        ...form,
        status: "submitted",
        createdAt: serverTimestamp(),
        submittedAt: serverTimestamp(),
      });

      await writeUserLog(FIXED_UID, {
        submissionId: newId,
        action: "submitted",
        title: form.basics.title,
        type: form.basics.type,
        status: "submitted",
      });

      setSnack({ open: true, msg: `ส่งสำเร็จเป็นเอกสาร ${newId}`, sev: "success" });
      // ถ้าต้องการรีเซ็ต:
      // setForm(initialForm); setActiveStep(0); setErrors({});
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setSnack({ open: true, msg: msg || "Submit ล้มเหลว", sev: "error" });
    }
  };

  return (
    <Box sx={{ maxWidth: 1152, mx: "auto", p: 2 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        New Submission
      </Typography>

      <Grid container spacing={2}>
        {/* ซ้าย: ฟอร์ม + stepper */}
        <Grid size={{ xs:12,md:8 }}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <Box sx={{ mt: 3 }}>
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

            <Stack direction="row" spacing={1.5} sx={{ mt: 3, justifyContent: "space-between" }}>
              <Button variant="outlined" onClick={onBack} disabled={activeStep === 0}>
                Back
              </Button>
              <Box>
                <Button sx={{ mr: 1 }} variant="outlined" onClick={handleSaveDraft}>
                  Save draft
                </Button>
                {activeStep < steps.length - 1 ? (
                  <Button variant="contained" onClick={onNext}>
                    Next
                  </Button>
                ) : (
                  <Button color="success" variant="contained" onClick={handleSubmit}>
                    Submit
                  </Button>
                )}
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* ขวา: Progress + Summary */}
        <Grid size={{ xs:12,md:4 }}>
          <SidebarSummary form={form} />
        </Grid>
      </Grid>

      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack.sev} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}

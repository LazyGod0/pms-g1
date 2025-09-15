"use client";
import * as React from "react";
import {
  Box,
  Button,
  Grid,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import SidebarSummary from "@/app/component/publications/SidebarSummary";
import BasicsStep from "@/app/component/steps/BasicsStep.mock";
import AuthorsStep from "@/app/component/steps/AuthorsStep.mock";
import IdentifiersStep from "@/app/component/steps/IdentifiersStep.mock";
import AttachmentsStep from "@/app/component/steps/AttachmentsStep.mock";
import { PROGRESS_BY_STEP } from "@/app/component/publications/mock";

import { useRouter } from "next/navigation";

export default function PublicationWizardPage() {
  const steps = ["Basics", "Authors", "Identifiers", "Attachments"];
  const [activeStep, setActiveStep] = React.useState(0);
  const router = useRouter();

  const content = [
    <BasicsStep key={0} />,
    <AuthorsStep key={1} />,
    <IdentifiersStep key={2} />,
    <AttachmentsStep key={3} />,
  ][activeStep];

  const goNext = () => setActiveStep((s) => Math.min(s + 1, 3));
  const goPrev = () => setActiveStep((s) => Math.max(s - 1, 0));

  const onSubmit = () => {
    alert("Submitted publication");
    router.push("/");
  };

  const isAttachments = activeStep === 3;

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: "auto" }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <Typography color="primary" fontWeight={700}>
          New Publication Submission
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Step {activeStep + 1} of 4
        </Typography>
      </Stack>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
        {steps.map((label, idx) => (
          <Step key={label} completed={idx < activeStep}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Grid container spacing={3}>
        <Grid size={{xs:12,md:8}}>
          {content}
          <Stack direction="row" spacing={1} justifyContent="space-between">
            <Button
              variant="outlined"
              onClick={goPrev}
              disabled={activeStep === 0}
            >
              Previous
            </Button>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined">Save Draft</Button>
              {isAttachments ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={onSubmit}
                >
                  Submit
                </Button>
              ) : (
                <Button variant="contained" onClick={goNext}>
                  Next
                </Button>
              )}
            </Stack>
          </Stack>
        </Grid>
        <Grid size={{xs:12,md:4}}>
          <SidebarSummary progress={PROGRESS_BY_STEP[activeStep]} />
        </Grid>
      </Grid>
    </Box>
  );
}

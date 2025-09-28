// src/app/component/publications/SidebarSummary.tsx
"use client";
import * as React from "react";
import {
  Box, Card, CardContent, LinearProgress, Typography, Stack, Divider,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { SubmissionForm } from "@/types/submission";

type Props = { form: SubmissionForm };

function computeCompleteness(form: SubmissionForm) {
  // นับเฉพาะช่อง "บังคับ"
  const checks: Array<[string, boolean]> = [
    ["Title", !!form.basics.title],
    ["Type", !!form.basics.type],
    ["Level", !!form.basics.level],
    ["Year", !!form.basics.year],
    ["Abstract", !!form.basics.abstract],
    ["Authors", Array.isArray(form.authors) && form.authors.length > 0],
  ];
  const done = checks.filter(([, ok]) => ok).length;
  const total = checks.length;
  const percent = Math.round((done / total) * 100);
  return { percent, done, total, checks };
}

export default function SidebarSummary({ form }: Props) {
  const { percent, checks } = computeCompleteness(form);

  const authorsCount = form.authors?.length ?? 0;
  const keywordsCount = form.basics?.keywords?.length ?? 0;

  // ✅ แทนที่ refId ด้วย url และ references
  const refsCount =
    Number(Boolean(form.identifiers?.doi)) +
    Number(Boolean(form.identifiers?.url)) +
    (form.identifiers?.references?.length ?? 0);

  const filesCount = form.attachments?.files?.length ?? 0;

  return (
    <Stack spacing={2}>
      {/* Progress */}
      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography fontWeight={700} mb={1}>Progress</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Typography variant="body2" color="text.secondary">Completeness</Typography>
            <Box sx={{ flex: 1 }}>
              <LinearProgress
                variant="determinate"
                value={percent}
                aria-label="completeness"
                sx={{ height: 10, borderRadius: 2 }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary">{percent}%</Typography>
          </Box>

          {/* รายการ checklist */}
          <Stack spacing={0.5} mt={1}>
            {checks.map(([label, ok]) => (
              <Box key={label} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {ok ? (
                  <CheckCircleIcon fontSize="small" color="success" />
                ) : (
                  <RadioButtonUncheckedIcon fontSize="small" color="disabled" />
                )}
                <Typography variant="body2">{label}</Typography>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography fontWeight={700} mb={1}>Summary</Typography>
          <Stack spacing={1.25}>
            <Box>
              <Typography variant="body2" color="text.secondary">Title:</Typography>
              <Typography fontWeight={700}>{form.basics.title || "-"}</Typography>
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Type:</Typography>
                <Typography>{form.basics.type || "-"}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Level:</Typography>
                <Typography>{form.basics.level || "-"}</Typography>
              </Box>
            </Box>

            <Divider />

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Authors:</Typography>
                <Typography>{authorsCount} added</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Keywords:</Typography>
                <Typography>{keywordsCount} added</Typography>
              </Box>
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">References:</Typography>
                <Typography>{refsCount} added</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Files:</Typography>
                <Typography>{filesCount} uploaded</Typography>
              </Box>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}

"use client";
import * as React from "react";
import {
  Box, Card, CardContent, LinearProgress, Typography, Stack, Divider,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { SubmissionForm } from "@/types/submission";
import { formatFileSize } from "@/libs/file-upload";

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

  // ✅ นับเฉพาะ references ที่เพิ่มในลิสต์เท่านั้น (ไม่นับ DOI/URL)
  const refsCount = form.identifiers?.references?.length ?? 0;

  const filesCount = form.attachments?.files?.length ?? 0;
  const totalFileSize = form.attachments?.files?.reduce((sum, file) => sum + file.size, 0) ?? 0;

  return (
    <Stack spacing={2}>
      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography fontWeight={700} mb={1}>Progress</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Typography variant="body2" color="text.secondary">Completeness</Typography>
            <Box sx={{ flex: 1 }}>
              <LinearProgress variant="determinate" value={percent} sx={{ height: 10, borderRadius: 2 }} />
            </Box>
            <Typography variant="body2" color="text.secondary">{percent}%</Typography>
          </Box>

          <Stack spacing={1} mt={2}>
            {checks.map(([label, done]) => (
              <Box key={label} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {done ? (
                  <CheckCircleIcon sx={{ fontSize: 16, color: "success.main" }} />
                ) : (
                  <RadioButtonUncheckedIcon sx={{ fontSize: 16, color: "grey.400" }} />
                )}
                <Typography variant="body2" color={done ? "text.primary" : "text.secondary"}>
                  {label}
                </Typography>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography fontWeight={700} mb={1}>Summary</Typography>
          <Stack spacing={1.5}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary">Authors</Typography>
              <Typography variant="body2">{authorsCount}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary">Keywords</Typography>
              <Typography variant="body2">{keywordsCount}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary">References</Typography>
              <Typography variant="body2">{refsCount}</Typography>
            </Box>
            <Divider />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary">Uploaded Files</Typography>
              <Typography variant="body2">{filesCount}</Typography>
            </Box>
            {filesCount > 0 && (
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">Total File Size</Typography>
                <Typography variant="body2">{formatFileSize(totalFileSize)}</Typography>
              </Box>
            )}
          </Stack>
        </CardContent>
      </Card>

      {form.basics.title && (
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography fontWeight={700} mb={1}>Preview</Typography>
            <Typography variant="body2" fontWeight={600} gutterBottom>
              {form.basics.title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {form.basics.type} • {form.basics.level} • {form.basics.year}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}

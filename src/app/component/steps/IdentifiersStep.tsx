// src/app/component/steps/IdentifiersStep.tsx
"use client";
import * as React from "react";
import {
  Box,
  Grid,
  TextField,
  Typography,
  Button,
  Paper,
  Divider,
  IconButton,
  Link,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { SubmissionForm, ReferenceItem } from "@/types/submission";

type Props = {
  value: SubmissionForm["identifiers"];
  onChange: (next: SubmissionForm["identifiers"]) => void;
};

export default function IdentifiersStep({ value, onChange }: Props) {
  const [refDraft, setRefDraft] = React.useState<ReferenceItem>({
    title: "",
    authors: "",
    year: "",
    link: "",
  });

  const addRef = () => {
    const t = refDraft.title.trim();
    const a = refDraft.authors.trim();
    const y = refDraft.year.trim();
    if (!t || !a || !y) return; // ต้องกรอก * ให้ครบ

    const list = [...(value.references ?? []), { ...refDraft }];
    onChange({ ...value, references: list });
    setRefDraft({ title: "", authors: "", year: "", link: "" });
  };

  const removeRef = (idx: number) => {
    const list = (value.references ?? []).filter((_, i) => i !== idx);
    onChange({ ...value, references: list });
  };

  return (
    <Box>
      {/* DOI / URL */}
      <Grid container spacing={2}>
        <Grid size={{ xs:12,md:6 }}>
          <TextField
            label="DOI"
            placeholder="10.1000/example.2024.01"
            fullWidth
            value={value.doi ?? ""}
            onChange={(e) => onChange({ ...value, doi: e.target.value })}
          />
        </Grid>
        <Grid size={{ xs:12,md:6 }}>
          <TextField
            label="URL"
            placeholder="https://example.com/publication"
            fullWidth
            value={value.url ?? ""}
            onChange={(e) => onChange({ ...value, url: e.target.value })}
          />
        </Grid>
      </Grid>

      {/* Add Reference form */}
      <Box sx={{ border: "1px solid #eee", p: 2, borderRadius: 2, mt: 3 }}>
        <Typography fontWeight={700} mb={1}>
          Add Reference
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs:12 }}>
            <TextField
              label="Title *"
              placeholder="Reference title"
              required
              fullWidth
              value={refDraft.title}
              onChange={(e) =>
                setRefDraft((p) => ({ ...p, title: e.target.value }))
              }
            />
          </Grid>
          <Grid size={{ xs:12, md:6 }}>
            <TextField
              label="Authors *"
              placeholder="Smith, J., Brown, K."
              required
              fullWidth
              value={refDraft.authors}
              onChange={(e) =>
                setRefDraft((p) => ({ ...p, authors: e.target.value }))
              }
            />
          </Grid>
          <Grid size={{ xs:12, md:6 }}>
            <TextField
              label="Year *"
              placeholder="2025"
              required
              fullWidth
              value={refDraft.year}
              onChange={(e) =>
                setRefDraft((p) => ({ ...p, year: e.target.value }))
              }
            />
          </Grid>
          <Grid size={{ xs:12 }}>
            <TextField
              label="Link/DOI"
              placeholder="https://doi.org/10.xxxx or URL"
              fullWidth
              value={refDraft.link ?? ""}
              onChange={(e) =>
                setRefDraft((p) => ({ ...p, link: e.target.value }))
              }
            />
          </Grid>
          <Grid size={{ xs:12 }}>
            <Button variant="contained" fullWidth onClick={addRef}>
              + Add Reference
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* References list */}
      <Box sx={{ mt: 3 }}>
        <Typography fontWeight={700} mb={1}>
          References ({value.references?.length ?? 0})
        </Typography>

        {(value.references ?? []).map((r, idx) => (
          <Paper
            key={`${r.title}-${idx}`}
            variant="outlined"
            sx={{ p: 2, borderRadius: 2, mb: 1.5 }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography fontWeight={700} sx={{ wordBreak: "break-word" }}>
                  {r.title || "-"}
                </Typography>
                <Typography color="text.secondary" sx={{ wordBreak: "break-word" }}>
                  {r.authors || "-"} {r.year ? `(${r.year})` : ""}
                </Typography>
                {r.link ? (
                  <Link
                    href={r.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="hover"
                    sx={{ display: "inline-block", mt: 0.5, wordBreak: "break-all" }}
                  >
                    {r.link}
                  </Link>
                ) : null}
              </Box>
              <IconButton onClick={() => removeRef(idx)} aria-label="remove reference">
                <CloseIcon />
              </IconButton>
            </Box>
          </Paper>
        ))}

        {(value.references ?? []).length > 0 && <Divider sx={{ mt: 1 }} />}
      </Box>
    </Box>
  );
}

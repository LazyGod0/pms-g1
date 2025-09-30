"use client";
import * as React from "react";
import {
  Box, Grid, TextField, MenuItem, FormControl, InputLabel, Select, Chip, Button,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import { SubmissionForm } from "@/types/submission";

type Props = {
  value: SubmissionForm["basics"];
  onChange: (next: SubmissionForm["basics"]) => void;
  errors?: Partial<{ title: string; type: string; level: string; year: string; keywords: string; abstract: string }>;
};

type PubType = "Journal" | "Conference" | "";
type PubLevel = "National" | "International" | "";

export default function BasicsStep({ value, onChange, errors }: Props) {
  const [keywordInput, setKeywordInput] = React.useState("");

  const pushKeyword = () => {
    const k = keywordInput.trim();
    if (!k) return;
    onChange({ ...value, keywords: Array.from(new Set([...(value.keywords ?? []), k])) });
    setKeywordInput("");
  };

  const handleTypeChange = (e: SelectChangeEvent<string>) =>
    onChange({ ...value, type: (e.target.value as PubType) ?? "" });

  const handleLevelChange = (e: SelectChangeEvent<string>) =>
    onChange({ ...value, level: (e.target.value as PubLevel) ?? "" });

  const abstractLen = value.abstract?.length ?? 0;

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid size={{ xs:12 }}>
          <TextField
            label="Publication Title *"
            placeholder="e.g., An Efficient Model for ..."
            required fullWidth
            value={value.title}
            onChange={(e) => onChange({ ...value, title: e.target.value })}
            error={Boolean(errors?.title)}
            helperText={errors?.title}
          />
        </Grid>

        <Grid size={{ xs:12,md:4 }}>
          <TextField
            label="Year *"
            placeholder="2025"
            required fullWidth
            value={value.year}
            onChange={(e) => onChange({ ...value, year: e.target.value })}
            error={Boolean(errors?.year)}
            helperText={errors?.year}
            select
          >
            {Array.from({ length: 50 }, (_, i) => 2026 - i).map(y => (
              <MenuItem key={y} value={String(y)}>{y}</MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid size={{ xs:12,md:4 }}>
          <FormControl fullWidth required error={Boolean(errors?.type)}>
            <InputLabel id="type-label">Type *</InputLabel>
            <Select labelId="type-label" label="Type *" value={value.type} onChange={handleTypeChange}>
              <MenuItem value="Journal">Journal</MenuItem>
              <MenuItem value="Conference">Conference</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs:12,md:4 }}>
          <FormControl fullWidth required error={Boolean(errors?.level)}>
            <InputLabel id="level-label">Level *</InputLabel>
            <Select labelId="level-label" label="Level *" value={value.level} onChange={handleLevelChange}>
              <MenuItem value="National">National</MenuItem>
              <MenuItem value="International">International</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs:12,md:9 }}>
          <TextField
            label="Keywords"
            placeholder="Add keyword and press Enter"
            fullWidth
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); pushKeyword(); } }}
            error={Boolean(errors?.keywords)}
            helperText={errors?.keywords}
          />
        </Grid>
        <Grid size={{ xs:12,md:3 }} sx={{ display: "flex", alignItems: "stretch" }}>
          <Button fullWidth variant="contained" onClick={pushKeyword}>Add</Button>
        </Grid>

        <Grid size={{ xs:12 }}>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {(value.keywords ?? []).map((k) => (
              <Chip key={k} label={k} onDelete={() =>
                onChange({ ...value, keywords: (value.keywords ?? []).filter((x) => x !== k) })
              } />
            ))}
          </Box>
        </Grid>

        <Grid size={{ xs:12 }}>
          <TextField
            label="Abstract *"
            placeholder="Write a concise abstract of your publication"
            required fullWidth multiline minRows={4}
            value={value.abstract}
            onChange={(e) => onChange({ ...value, abstract: e.target.value })}
            error={Boolean(errors?.abstract)}
            helperText={errors?.abstract ?? `${abstractLen} characters`}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

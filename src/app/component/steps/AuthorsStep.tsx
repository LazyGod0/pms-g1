"use client";
import * as React from "react";
import {
  Box, Grid, TextField, IconButton, Typography, Button, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { Author } from "@/types/submission";

type Props = {
  value: Author[];
  onChange: (next: Author[]) => void;
  errors?: Record<number, { name?: string; affiliation?: string; email?: string }>;
};

export default function AuthorsStep({ value, onChange, errors }: Props) {
  const add = () =>
    onChange([...(value ?? []), { name: "", affiliation: "", email: "", role: "Author", authorType: "Internal" }]);
  const del = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const upd = (i: number, patch: Partial<Author>) =>
    onChange(value.map((a, idx) => (idx === i ? { ...a, ...patch } : a)));

  return (
    <Box>
      <Typography fontWeight={700} mb={1}>Add Author</Typography>

      {(value ?? []).map((a, i) => (
        <Box key={i} sx={{ border: "1px solid #eee", p: 2, borderRadius: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs:12,md:6 }}>
              <TextField
                label="Name *"
                placeholder="Full name"
                required fullWidth
                value={a.name}
                onChange={(e) => upd(i, { name: e.target.value })}
                error={Boolean(errors?.[i]?.name)}
                helperText={errors?.[i]?.name}
              />
            </Grid>
            <Grid size={{ xs:12,md:6 }}>
              <TextField
                label="Email *"
                placeholder="email@example.com"
                required type="email" fullWidth
                value={a.email}
                onChange={(e) => upd(i, { email: e.target.value })}
                error={Boolean(errors?.[i]?.email)}
                helperText={errors?.[i]?.email}
              />
            </Grid>

            <Grid size={{ xs:12,md:6 }}>
              <TextField
                label="Affiliation *"
                placeholder="Department, Institution"
                required fullWidth
                value={a.affiliation}
                onChange={(e) => upd(i, { affiliation: e.target.value })}
                error={Boolean(errors?.[i]?.affiliation)}
                helperText={errors?.[i]?.affiliation}
              />
            </Grid>
            <Grid size={{ xs:12,md:5 }}>
              <FormControl fullWidth>
                <InputLabel id={`role-${i}`}>Role</InputLabel>
                <Select
                  labelId={`role-${i}`} label="Role"
                  value={a.role ?? "Author"}
                  onChange={(e) => upd(i, { role: e.target.value as Author["role"] })}
                >
                  <MenuItem value="Author">Author</MenuItem>
                  <MenuItem value="Co-Author">Co-Author</MenuItem>
                  <MenuItem value="Corresponding">Corresponding</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs:12,md:1 }} sx={{ textAlign: { xs: "left", md: "right" } }}>
              <IconButton color="error" onClick={() => del(i)}><DeleteIcon /></IconButton>
            </Grid>

            <Grid size={{ xs:12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={(a.authorType ?? "Internal") === "Internal"}
                    onChange={(e) => upd(i, { authorType: e.target.checked ? "Internal" : "External" })}
                  />
                }
                label="Author Type — Internal"
              />
            </Grid>
          </Grid>
        </Box>
      ))}

      <Button startIcon={<AddIcon />} onClick={add} fullWidth variant="contained">
        + Add Author
      </Button>

      {(!value || value.length === 0) && (
        <Typography mt={1} variant="body2" color="text.secondary">
          ยังไม่มีผู้แต่ง กด “Add Author” เพื่อเพิ่ม
        </Typography>
      )}
    </Box>
  );
}

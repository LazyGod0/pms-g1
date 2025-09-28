"use client";

import { Paper, Typography, TextField, Button, Stack } from "@mui/material";

export default function InternalNotes() {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Internal Notes
      </Typography>
      <Stack spacing={2}>
        <TextField
          placeholder="Add internal notes for other reviewers..."
          multiline
          minRows={3}
          fullWidth
        />
        <Button variant="contained">Save Notes</Button>
      </Stack>
    </Paper>
  );
}

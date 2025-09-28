"use client";
import React from "react";
import {
  Box,
  Typography,
  Chip,
  Stack,
  Paper,
} from "@mui/material";

/* 
Authors Section 
  using mocked-up ui for demonstration purpose only, use actual data later.
*/
export default function AuthorsSection() {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Authors & Affiliations
      </Typography>
      {/* Author 1 */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <Typography fontWeight="bold">Siriporn Dokbua</Typography>
        <Typography variant="body2" color="text.secondary">
          siriporn.d@university.ac.th
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Faculty of Science, Computer Science
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          <Chip label="Internal" color="primary" size="small" />
          <Chip label="author" variant="outlined" size="small" />
        </Stack>
      </Paper>

      {/* Author 2 */}
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Typography fontWeight="bold">Dr. Metinee Chaiyaphum</Typography>
        <Typography variant="body2" color="text.secondary">
          metinee.c@law.ac.th
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Faculty of Law, External University
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          <Chip label="External" variant="outlined" size="small" />
          <Chip label="co-author" variant="outlined" size="small" />
        </Stack>
      </Paper>
    </Box>
  );
}
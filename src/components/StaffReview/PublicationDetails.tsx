"use client";

import { Paper, Typography, Chip, Stack } from "@mui/material";

export default function PublicationDetails() {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Publication Details
      </Typography>

      <Typography><b>Title</b></Typography>
      <Typography gutterBottom>Thai NLP for Legal Texts</Typography>

      <Stack direction="row" spacing={4} sx={{ mb: 2 }}>
        <Typography><b>Year:</b> 2022</Typography>
        <Typography><b>Type:</b> Journal</Typography>
        <Typography><b>Level:</b> National</Typography>
      </Stack>

      <Typography><b>Keywords</b></Typography>
      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", mb: 2 }}>
        {["natural language processing", "Thai language", "legal technology", "text classification"].map((kw) => (
          <Chip key={kw} label={kw} />
        ))}
      </Stack>

      <Typography><b>Abstract</b></Typography>
      <Typography>
        Natural language processing techniques specifically designed for Thai legal documents. 
        The system achieves high accuracy in legal text classification and information extraction tasks.
      </Typography>
    </Paper>
  );
}

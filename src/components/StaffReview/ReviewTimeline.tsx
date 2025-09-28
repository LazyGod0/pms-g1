"use client";

import { Paper, Typography, List, ListItem, ListItemText } from "@mui/material";

export default function ReviewTimeline() {
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Review Timeline
      </Typography>
      <List dense>
        <ListItem>
          <ListItemText
            primary="Publication submitted for review"
            secondary="Siriporn Dokbua • Jul 20, 2022"
          />
        </ListItem>
      </List>
    </Paper>
  );
}

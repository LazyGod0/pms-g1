"use client";

import { Button, Stack } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";

export default function ReviewActions() {
  return (
    <Stack direction="row" spacing={2}>
      <Button variant="contained" color="error" startIcon={<CloseIcon />}>
        Reject
      </Button>
      <Button variant="contained" color="success" startIcon={<CheckIcon />}>
        Approve
      </Button>
    </Stack>
  );
}

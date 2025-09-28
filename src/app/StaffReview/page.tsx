"use client";

import React from "react";
import {
  Box,
  Typography,
  Chip,
  Tabs,
  Tab,
  Divider,
  Stack,
  Paper,
} from "@mui/material";
import AuthorsSection from "@/components/StaffReview/AuthorsSection";
import BreadcrumbsNav from "@/components/StaffReview/BreadcrumbsNav";
import ReviewActions from "@/components/StaffReview/ReviewActions";
import PublicationDetails from "@/components/StaffReview/PublicationDetails";
import ReviewTimeline from "@/components/StaffReview/ReviewTimeline";
import InternalNotes from "@/components/StaffReview/InternalNotes";

export default function ReviewPage() {
  const [value, setValue] = React.useState("basics");

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  return (
    <Box>
      <BreadcrumbsNav />

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mt: 2 }}
      >
        <Typography variant="h5">Thai NLP for Legal Texts</Typography>
        <ReviewActions />
      </Stack>

      <Typography variant="subtitle1" color="text.secondary">
        by Siriporn Dokbua • Faculty of Science • Submitted Aug 15, 2022
      </Typography>

      <Stack direction="row" spacing={1} sx={{ my: 2 }}>
        <Chip label="Journal" color="primary" />
        <Chip label="National" color="secondary" />
        <Chip label="Pending Review" color="warning" />
      </Stack>

      <Tabs value={value} onChange={handleChange} sx={{ mb: 2 }}>
        <Tab value="basics" label="Basics" />
        <Tab value="authors" label="Authors" />
        <Tab value="identifiers" label="Identifiers" />
        <Tab value="references" label="References" />
        <Tab value="attachments" label="Attachments" />
      </Tabs>

      <Divider />

      <Stack
        direction="row"
        spacing={2}
        alignItems="flex-start"
        sx={{ mt: 2 }}
      >
        <Box flex={2}>
          {value === "basics" && <PublicationDetails />}
          {value === "authors" && <AuthorsSection />}
          {/* You can add more conditional renders for identifiers, references, etc. */}
        </Box>
        <Box flex={1}>
          <ReviewTimeline />
          <InternalNotes />
        </Box>
      </Stack>
    </Box>
  );
}

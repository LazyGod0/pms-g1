"use client";

import { Breadcrumbs, Link, Typography } from "@mui/material";

export default function BreadcrumbsNav() {
  return (
    <Breadcrumbs aria-label="breadcrumb">
      <Link underline="hover" color="inherit" href="#">Home</Link>
      <Link underline="hover" color="inherit" href="#">Staff Portal</Link>
      <Typography color="text.primary">Review Queue</Typography>
    </Breadcrumbs>
  );
}

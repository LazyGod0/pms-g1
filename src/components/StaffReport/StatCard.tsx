// =============================
// File: /components/report/StatCard.tsx
// =============================
'use client';
import * as React from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';

export function StatCard({ label, value, icon }: { label: string; value: number | string; icon?: React.ReactNode }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Box sx={{ width: 40, height: 40, display: 'grid', placeItems: 'center' }}>{icon}</Box>
        <Box>
          <Typography color="text.secondary" variant="body2">{label}</Typography>
          <Typography variant="h5" fontWeight={700}>{value}</Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

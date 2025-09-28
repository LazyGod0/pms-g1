// =============================
// File: /components/report/PublicationsTable.tsx
// =============================
'use client';
import * as React from 'react';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Typography, Box } from '@mui/material';
import { Publication } from '@/types/publication';

const statusColor: Record<string, 'success' | 'warning' | 'default' | 'error' | 'info'> = {
  Approved: 'success',
  'Pending Review': 'warning',
  'Needs Fix': 'info',
  Rejected: 'error',
  Draft: 'default',
};

export function PublicationsTable({ rows }: { rows: Publication[] }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
        <Typography variant="h6">Publications Data</Typography>
        <Typography variant="body2" color="text.secondary">{rows.length} records</Typography>
      </Box>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Authors</TableCell>
              <TableCell>Faculty</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Level</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r)=> (
              <TableRow key={r.id} hover>
                <TableCell sx={{ maxWidth: 320 }}>{r.title}</TableCell>
                <TableCell sx={{ maxWidth: 260 }}>{r.authors.join(', ')}</TableCell>
                <TableCell>
                  <Box sx={{ display:'flex', flexDirection:'column' }}>
                    <span>{r.faculty}</span>
                    <Typography variant="caption" color="text.secondary">{r.department}</Typography>
                  </Box>
                </TableCell>
                <TableCell><Chip size="small" label={r.type} variant="outlined"/></TableCell>
                <TableCell><Chip size="small" label={r.level} variant="outlined"/></TableCell>
                <TableCell><Chip size="small" label={r.status} color={statusColor[r.status]} variant={r.status==='Draft'?'outlined':'filled'} /></TableCell>
                <TableCell align="right">{new Date(r.date).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

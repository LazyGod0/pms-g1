// =============================
// File: /app/(staff)/report/page.tsx
// =============================
'use client';
import * as React from 'react';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import GetAppIcon from '@mui/icons-material/GetApp';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { ReportFilters, fetchPublications } from '@/libs/StaffReport/dataSource';
import { ReportFilters as Filters, FiltersState } from '@/components/StaffReport/ReportFilters';
import { StatCard } from '@/components/StaffReport/StatCard';
import { PublicationsByType, PublicationsByYear, PublicationsByLevel } from '@/components/StaffReport/Charts';
import { PublicationsTable } from '@/components/StaffReport/PublicationsTable';
import { exportCSV, exportPDF } from '@/components/StaffReport/export';

export default function ReportPage() {
  const [filters, setFilters] = React.useState<FiltersState>({ yearFrom: 2020, yearTo: 2024, faculty: 'All Faculties', type: 'All', level: 'All' });
  const [rows, setRows] = React.useState([] as Awaited<ReturnType<typeof fetchPublications>>);

  const reload = React.useCallback(async ()=>{
    const data = await fetchPublications(filters as ReportFilters);
    setRows(data);
  }, [filters]);

  React.useEffect(()=>{ reload(); }, [reload]);

  const total = rows.length;
  const journals = rows.filter(r=>r.type==='Journal').length;
  const conferences = rows.filter(r=>r.type==='Conference').length;
  const intl = rows.filter(r=>r.level==='International').length;
  const approved = rows.filter(r=>r.status==='Approved').length;

  const normalizedRows = rows.map(r => ({
    ...r,
    authors: (r.authors ?? []).map(a => (typeof a === 'string' ? a : (a?.name ?? '')) )
  }));

  return (
    <Container maxWidth="xl">
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Report</Typography>
          <Typography color="text.secondary">Query the information and export as CSV/PDF file</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<GetAppIcon />} onClick={()=>exportCSV(normalizedRows as any)}>Export CSV</Button>
          <Button variant="contained" startIcon={<PictureAsPdfIcon />} onClick={exportPDF}>Export PDF</Button>
        </Stack>
      </Stack>

      <Filters
        value={filters}
        onChange={setFilters}
        onClear={()=> setFilters({ yearFrom: 2020, yearTo: 2024, faculty: 'All Faculties', type: 'All', level: 'All' })}
      />

      {/* Stats section */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
          gap: 2,
          mt: 2
        }}
      >
        <StatCard label="Total Publications" value={total} />
      </Box>

      {/* Charts section */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 2,
          mt: 2
        }}
      >
        <PublicationsByYear data={normalizedRows as any} />
        <PublicationsByType data={normalizedRows as any} />
        <PublicationsByLevel data={normalizedRows as any} />
      </Box>

      <Box sx={{ mt: 2 }}>
        <PublicationsTable rows={normalizedRows as any} />
      </Box>
    </Container>
  );
}

// =============================
// QUICK FIRESTORE WIRE-UP (reference)
// Replace fetchPublications in /lib/dataSource.ts with Firestore query like:
//
// import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
// import { db } from '@/lib/firebase';
// export async function fetchPublications(filters: ReportFilters): Promise<Publication[]> {
//   const col = collection(db, 'publications');
//   const q = query(col, orderBy('year'));
//   const snap = await getDocs(q);
//   return snap.docs.map(d => ({ id: d.id, ...(d.data() as Publication) }));
// }

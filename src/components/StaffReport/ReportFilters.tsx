// =============================
// File: /components/report/ReportFilters.tsx
// =============================
'use client';
import * as React from 'react';
import { Box, Button, MenuItem, Paper, TextField, Typography } from '@mui/material';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';

const FACULTIES = [
  'All Faculties',
  'Faculty of Science',
  'Faculty of Engineering',
  'Faculty of Management',
  'Faculty of Liberal Arts'
];

export type FiltersState = {
  yearFrom: number;
  yearTo: number;
  // faculty: string;
  type: 'All' | 'Journal' | 'Conference';
  level: 'All' | 'National' | 'International';
};

export function ReportFilters({
  value,
  onChange,
  onClear
}: {
  value: FiltersState;
  onChange: (v: FiltersState) => void;
  onClear: () => void;
}) {
  const set = (k: keyof FiltersState, v: any) => onChange({ ...value, [k]: v });

  const currentYear = new Date().getFullYear();
  const years = React.useMemo(() => {
    const arr: number[] = [];
    for (let y = currentYear; y >= 1981; y--) {
      arr.push(y);
    }
    return arr;
  }, [currentYear]);

  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <FilterAltOutlinedIcon />
        <Typography variant="h6">Filters</Typography>
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: '1fr 1fr',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)'
          },
          gap: 2
        }}
      >
        {/* Year From */}
        <TextField
          select
          fullWidth
          label="Year From"
          value={value.yearFrom}
          onChange={(e) => set('yearFrom', Number(e.target.value))}
        >
          {years.map((y) => (
            <MenuItem key={y} value={y}>
              {y}
            </MenuItem>
          ))}
        </TextField>

        {/* Year To */}
        <TextField
          select
          fullWidth
          label="Year To"
          value={value.yearTo}
          onChange={(e) => set('yearTo', Number(e.target.value))}
        >
          {years.map((y) => (
            <MenuItem key={y} value={y}>
              {y}
            </MenuItem>
          ))}
        </TextField>

        {/* Faculty */}
        {/* <TextField
          select
          fullWidth
          label="Faculty"
          value={value.faculty}
          onChange={(e) => set('faculty', e.target.value)}
        >
          {FACULTIES.map((f) => (
            <MenuItem key={f} value={f}>
              {f}
            </MenuItem>
          ))}
        </TextField> */}

        {/* Type */}
        <TextField
          select
          fullWidth
          label="Type"
          value={value.type}
          onChange={(e) => set('type', e.target.value)}
        >
          {['All', 'Journal', 'Conference'].map((t) => (
            <MenuItem key={t} value={t}>
              {t}
            </MenuItem>
          ))}
        </TextField>

        {/* Level */}
        <TextField
          select
          fullWidth
          label="Level"
          value={value.level}
          onChange={(e) => set('level', e.target.value)}
        >
          {['All', 'National', 'International'].map((l) => (
            <MenuItem key={l} value={l}>
              {l}
            </MenuItem>
          ))}
        </TextField>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button onClick={onClear} variant="outlined" fullWidth>
            Clear Filters
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

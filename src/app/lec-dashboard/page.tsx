'use client';

import {
  Box,
  Button,
  Chip,
  Container,
  Divider,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import BuildCircleOutlinedIcon from '@mui/icons-material/BuildCircleOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import DraftsOutlinedIcon from '@mui/icons-material/DraftsOutlined';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import { FC } from 'react';
type Activity = {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  status: 'approved' | 'submitted' | 'draft';
};

const activities: Activity[] = [
  {
    id: '1',
    title: 'Deep Learning for Coral Reef Monitoring',
    subtitle: 'Your publication has been approved',
    date: 'Dec 7, 2024',
    status: 'approved',
  },
  {
    id: '2',
    title: 'Edge AI for Smart Campus',
    subtitle: 'Publication submitted for review',
    date: 'Dec 6, 2024',
    status: 'submitted',
  },
  {
    id: '3',
    title: 'IoT Security Framework',
    subtitle: 'Draft saved with updates',
    date: 'Dec 5, 2024',
    status: 'draft',
  },
];

const trend = [
  { year: 2020, value: 1, max: 2 },
  { year: 2021, value: 2, max: 2 },
  { year: 2022, value: 1, max: 2 },
  { year: 2023, value: 2, max: 2 },
  { year: 2024, value: 1, max: 2 },
];

function StatCard({
  icon,
  label,
  value,
  color = 'default',
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color?: 'default' | 'success' | 'error' | 'warning';
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: (t) => `1px solid ${t.palette.divider}`,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2}>
        <Box
          sx={(t) => ({
            width: 44,
            height: 44,
            borderRadius: 2,
            display: 'grid',
            placeItems: 'center',
            bgcolor:
              color === 'success'
                ? t.palette.success.light + '33'
                : color === 'error'
                ? t.palette.error.light + '33'
                : color === 'warning'
                ? t.palette.warning.light + '33'
                : t.palette.action.hover,
            color:
              color === 'success'
                ? t.palette.success.main
                : color === 'error'
                ? t.palette.error.main
                : color === 'warning'
                ? t.palette.warning.main
                : t.palette.text.secondary,
          })}
        >
          {icon}
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h5" fontWeight={700} mt={0.5}>
            {value}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

function ActivityIcon({ status }: { status: Activity['status'] }) {
  const common = { fontSize: 20 };
  if (status === 'approved')
    return <CheckCircleRoundedIcon color="success" sx={common} />;
  if (status === 'submitted')
    return <AccessTimeRoundedIcon color="warning" sx={common} />;
  return <DraftsOutlinedIcon color="info" sx={common} />;
}

function ActivityItem({ item }: { item: Activity }) {
  return (
    <Stack
      direction="row"
      spacing={2}
      alignItems="flex-start"
      sx={{
        px: 2,
        py: 1.5,
      }}
    >
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: 1.2,
          display: 'grid',
          placeItems: 'center',
          bgcolor: 'action.hover',
          flex: '0 0 auto',
          mt: 0.2,
        }}
      >
        <ActivityIcon status={item.status} />
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="subtitle1"
          fontWeight={600}
          sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          {item.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {item.subtitle}
        </Typography>
        <Typography variant="caption" color="text.disabled">
          {item.date}
        </Typography>
      </Box>
    </Stack>
  );
}

function TrendRow({
  year,
  value,
  max,
}: {
  year: number;
  value: number;
  max: number;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <Box sx={{ width: 52 }}>
        <Typography variant="body2" color="text.secondary">
          {year}
        </Typography>
      </Box>
      <Box sx={{ flex: 1 }}>
        <Box
          sx={(t) => ({
            height: 10,
            borderRadius: 5,
            bgcolor: t.palette.action.hover,
            overflow: 'hidden',
          })}
        >
          <Box
            sx={(t) => ({
              width: `${pct}%`,
              height: '100%',
              bgcolor: t.palette.primary.main,
            })}
          />
        </Box>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ width: 16, textAlign: 'right' }}>
        {value}
      </Typography>
    </Stack>
  );
}

export default function DashboardPage() {
  const draft = 0;
  const pending = 0;
  const needsFix = 0;
  const approved = 1;
  const rejected = 0;

  return (
    <Box sx={{ py: 4, bgcolor: 'white', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        {/* Top bar */}
        <Stack direction="row" alignItems="start" justifyContent="space-between" sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight={800} color='black'>
              Welcome back, Dr. Sookchai
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Faculty of Science, Computer Science Department
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            sx={{ borderRadius: 2 }}
          >
            New Submission
          </Button>
        </Stack>

        {/* Stat cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12,sm:6, md: 3 }}>
            <StatCard
              icon={<DescriptionOutlinedIcon />}
              label="Draft"
              value={draft}
            />
          </Grid>

          <Grid size={{ xs: 12,sm:6, md: 3 }}>
            <StatCard
              icon={<PendingActionsOutlinedIcon />}
              label="Pending Review"
              value={pending}
            />
          </Grid>

          <Grid size={{ xs: 12,sm:6, md: 3 }}>
            <StatCard
              icon={<BuildCircleOutlinedIcon />}
              label="Needs Fix"
              value={needsFix}
              color="warning"
            />
          </Grid>

          <Grid size={{ xs: 12,sm:6, md: 3 }}>
            <StatCard
              icon={<CheckCircleRoundedIcon />}
              label="Approved"
              value={approved}
              color="success"
            />
          </Grid>

          <Grid size={{ xs: 12,sm:6, md: 3 }}>
            <StatCard
              icon={<CancelRoundedIcon />}
              label="Rejected"
              value={rejected}
              color="error"
            />
          </Grid>
        </Grid>

        {/* Main panels */}
        <Grid container spacing={3}>
          {/* Recent Activity */}
          <Grid size={{ xs: 12, md: 7.5 }}>
            <Paper
              elevation={0}
              sx={{
                p: 0,
                borderRadius: 3,
                border: (t) => `1px solid ${t.palette.divider}`,
                overflow: 'hidden',
              }}
            >
              <Box sx={{ px: 2, py: 2 }}>
                <Typography variant="subtitle1" fontWeight={700}>
                  Recent Activity
                </Typography>
              </Box>
              <Divider />
              <Box>
                {activities.map((a, idx) => (
                  <Box key={a.id}>
                    <ActivityItem item={a} />
                    {idx !== activities.length - 1 && <Divider sx={{ ml: 8 }} />}
                  </Box>
                ))}
              </Box>

              <Divider />
              <Box sx={{ p: 1.5 }}>
                <Button fullWidth variant="text" sx={{ borderRadius: 2 }}>
                  View All Publications
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Trend */}
          <Grid size={{ xs: 12, md: 4.5 }}>
            <Paper
              elevation={0}
              sx={{
                p: 0,
                borderRadius: 3,
                border: (t) => `1px solid ${t.palette.divider}`,
                overflow: 'hidden',
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: 2, py: 2 }}>
                <TrendingUpRoundedIcon fontSize="small" />
                <Typography variant="subtitle1" fontWeight={700}>
                  Publication Trend
                </Typography>
              </Stack>
              <Divider />

              <Stack spacing={1.5} sx={{ p: 2 }}>
                {trend.map((t) => (
                  <TrendRow key={t.year} year={t.year} value={t.value} max={t.max} />
                ))}
              </Stack>

              <Divider />
              <Stack direction="row" justifyContent="space-between" sx={{ p: 2 }}>
                <Stack spacing={0.5} alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    This Year
                  </Typography>
                  <Typography variant="h6" fontWeight={800}>
                    1
                  </Typography>
                </Stack>
                <Stack spacing={0.5} alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    Total
                  </Typography>
                  <Typography variant="h6" fontWeight={800}>
                    1
                  </Typography>
                </Stack>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

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
import Grid from '@mui/material/Grid'; // keep your Grid import as-is
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
import { FC, useEffect, useMemo, useState } from 'react';

// --- Firebase ---
import { auth, db } from '@/configs/firebase-config'; // <-- adjust if your exports differ
import {
  collection,
  getDocs,
  orderBy,
  query,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

type Activity = {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  status: 'approved' | 'submitted' | 'draft';
};

type SubmissionDoc = {
  basics?: {
    title?: string;
    year?: number | string;
    type?: 'Journal' | 'Conference' | 'Book' | string;
    level?: 'International' | 'National' | 'Local' | string;
  };
  status?: 'Draft' | 'Pending' | 'Needs Fix' | 'Approved' | 'Rejected' | string;
  createdAt?: Timestamp;
  submittedAt?: Timestamp;
  reviewedAt?: Timestamp;
};

type TrendPoint = { year: number; value: number; max: number };

const titleCase = (s?: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : undefined;

function tsToDate(x?: any): Date | undefined {
  if (!x) return undefined;
  if (x instanceof Timestamp) return x.toDate();
  if (x instanceof Date) return x;
  if (typeof x === 'string') return new Date(x);
  return undefined;
}

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
  const pct = Math.max(0, Math.min(100, (value / Math.max(1, max)) * 100));
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
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState(0);
  const [pending, setPending] = useState(0);
  const [needsFix, setNeedsFix] = useState(0);
  const [approved, setApproved] = useState(0);
  const [rejected, setRejected] = useState(0);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [displayName, setDisplayName] = useState<string | undefined>(undefined);
  const [facultyLine, setFacultyLine] = useState<string | undefined>(undefined);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      // if (!user) {
      //   setLoading(false);
      //   setActivities([]);
      //   return;
      // }

      // setDisplayName(user.displayName ?? undefined);

      try {
        setLoading(true);

        // Read this lecturer's submissions
        const FIXED_UID = "TUtYsDTbvEOy50N1AVhe";
        const subCol = collection(db, 'users', FIXED_UID, 'submissions');

        // For activities list, we need most recent first
        const qRecent = query(subCol, orderBy('createdAt', 'desc'), limit(10));
        const snap = await getDocs(qRecent);

        let cDraft = 0,
          cPending = 0,
          cNeedsFix = 0,
          cApproved = 0,
          cRejected = 0;

        const act: Activity[] = [];
        const perYear: Record<number, number> = {};

        const nowYear = new Date().getFullYear();
        const windowYears = Array.from({ length: 5 }, (_, i) => nowYear - 4 + i);

        snap.docs.forEach((d) => {
          const data = d.data() as SubmissionDoc;

          const s = titleCase(data.status) as
            | 'Draft'
            | 'Pending'
            | 'Needs Fix'
            | 'Approved'
            | 'Rejected'
            | undefined;

          if (s === 'Draft') cDraft++;
          else if (s === 'Pending') cPending++;
          else if (s === 'Needs Fix') cNeedsFix++;
          else if (s === 'Approved') cApproved++;
          else if (s === 'Rejected') cRejected++;

          // Activities: pick a date preferring reviewedAt > submittedAt > createdAt
          const dt =
            tsToDate(data.reviewedAt) ||
            tsToDate(data.submittedAt) ||
            tsToDate(data.createdAt) ||
            new Date();

          const statusForActivity: Activity['status'] =
            s === 'Approved'
              ? 'approved'
              : s === 'Draft'
              ? 'draft'
              : 'submitted';

          act.push({
            id: d.id,
            title: data.basics?.title || '(Untitled)',
            subtitle:
              s === 'Approved'
                ? 'Your publication has been approved'
                : s === 'Needs Fix'
                ? 'Changes requested'
                : s === 'Pending'
                ? 'Publication submitted for review'
                : s === 'Rejected'
                ? 'Publication was rejected'
                : 'Draft saved',
            date: dt.toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: '2-digit',
            }),
            status: statusForActivity,
          });

          // Trend counts by basics.year
          const by = Number(data.basics?.year ?? NaN);
          if (!Number.isNaN(by) && windowYears.includes(by)) {
            perYear[by] = (perYear[by] ?? 0) + 1;
          }
        });

        // Fill 5-year window, compute max
        const maxVal = Math.max(1, ...Array.from({ length: 5 }, (_, i) => perYear[nowYear - 4 + i] ?? 0));
        const trendArr: TrendPoint[] = Array.from({ length: 5 }, (_, i) => {
          const y = nowYear - 4 + i;
          const v = perYear[y] ?? 0;
          return { year: y, value: v, max: maxVal };
        });

        setDraft(cDraft);
        setPending(cPending);
        setNeedsFix(cNeedsFix);
        setApproved(cApproved);
        setRejected(cRejected);
        setActivities(act);
        setTrend(trendArr);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  return (
    <Box sx={{ py: 4, bgcolor: 'white', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        {/* Top bar */}
        <Stack direction="row" alignItems="start" justifyContent="space-between" sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight={800} color="black">
              {`Welcome back${displayName ? `, ${displayName}` : ''}`}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {/* If you later read /users/{uid} you can place Faculty/Dept info here */}
              Faculty dashboard
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
                {activities.length === 0 && !loading && (
                  <Typography sx={{ px: 2, py: 3 }} color="text.secondary">
                    No activity yet
                  </Typography>
                )}
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
                    {trend.find((x) => x.year === new Date().getFullYear())?.value ?? 0}
                  </Typography>
                </Stack>
                <Stack spacing={0.5} alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    Total (5 yrs)
                  </Typography>
                  <Typography variant="h6" fontWeight={800}>
                    {trend.reduce((sum, x) => sum + x.value, 0)}
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

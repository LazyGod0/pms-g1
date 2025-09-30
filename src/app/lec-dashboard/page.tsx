'use client';

import {
  Box, Button, Container, Divider, Paper, Stack, Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import { useEffect, useState } from 'react';

import { db } from '@/configs/firebase-config';
import { collection, getDocs, orderBy, query, limit, Timestamp } from 'firebase/firestore';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts';

type Activity = {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  status: 'approved' | 'rejected' | 'submitted' | 'draft';
};

type SubmissionDoc = {
  basics?: {
    title?: string;
    year?: number | string;
    type?: 'Journal' | 'Conference' | 'Book' | string;
    level?: 'International' | 'National' | 'Local' | string;
  };
  status?: 'Draft' | 'Submitted' | 'Approved' | 'Rejected' | string;
  createdAt?: Timestamp;
  submittedAt?: Timestamp;
  reviewedAt?: Timestamp;
};

const normalizeStatus = (s?: string) => {
  if (!s) return undefined;
  const key = s.trim().toLowerCase();
  if (key === 'pending' || key === 'needs fix') return 'Submitted';
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
};

type TrendPoint = { year: number; value: number; max: number };

function tsToDate(x?: Timestamp | Date | string | null): Date | undefined {
  if (!x) return undefined;
  if (x instanceof Timestamp) return x.toDate();
  if (x instanceof Date) return x;
  if (typeof x === 'string') return new Date(x);
  return undefined;
}

function formatThaiDateTime(dt: Date) {
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Bangkok',
  }).format(dt);
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
  if (status === 'approved') return <CheckCircleRoundedIcon color="success" sx={common} />;
  if (status === 'rejected') return <CancelRoundedIcon color="error" sx={common} />;
  if (status === 'submitted') return <PendingActionsOutlinedIcon color="warning" sx={common} />;
  return <DescriptionOutlinedIcon color="inherit" sx={common} />; // draft
}

function ActivityItem({ item }: { item: Activity }) {
  return (
    <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ px: 2, py: 1.5 }}>
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: 1.2,
          display: 'grid',
          placeItems: 'center',
          bgcolor: 'action.hover',
          color: 'text.secondary',
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

function TrendRow({ year, value, max }: { year: number; value: number; max: number }) {
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
          <Box sx={(t) => ({ width: `${pct}%`, height: '100%', bgcolor: t.palette.primary.main })} />
        </Box>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ width: 16, textAlign: 'right' }}>
        {value}
      </Typography>
    </Stack>
  );
}

function LecturerDashboardContent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState(0);
  const [submitted, setSubmitted] = useState(0);
  const [approved, setApproved] = useState(0);
  const [rejected, setRejected] = useState(0);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [trend, setTrend] = useState<TrendPoint[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.uid) return;

      try {
        setLoading(true);
        // ใช้ UID ของ user ที่ login อยู่แทน fixed UID
        const subCol = collection(db, 'users', user.uid, 'submissions');
        const qRecent = query(subCol, orderBy('createdAt', 'desc'), limit(5));
        const snapRecent = await getDocs(qRecent);
        const snapAll = await getDocs(subCol);

        const recentActivities: Activity[] = [];
        snapRecent.docs.forEach((d) => {
          const data = d.data() as SubmissionDoc;
          const s = normalizeStatus(data.status) as 'Draft' | 'Submitted' | 'Approved' | 'Rejected' | undefined;

          let dt: Date | undefined;
          if (s === 'Submitted') dt = tsToDate(data.submittedAt) || tsToDate(data.createdAt);
          else if (s === 'Approved' || s === 'Rejected') dt = tsToDate(data.reviewedAt) || tsToDate(data.submittedAt) || tsToDate(data.createdAt);
          else dt = tsToDate(data.createdAt);

          const statusForActivity: Activity['status'] =
            s === 'Approved' ? 'approved'
              : s === 'Rejected' ? 'rejected'
                : s === 'Submitted' ? 'submitted'
                  : 'draft';

          recentActivities.push({
            id: d.id,
            title: data.basics?.title || '(Untitled)',
            subtitle:
              s === 'Approved' ? 'Your publication has been approved'
                : s === 'Rejected' ? 'Publication was rejected'
                  : s === 'Submitted' ? 'Publication submitted for review'
                    : 'Draft saved',
            date: formatThaiDateTime(dt || new Date()),
            status: statusForActivity,
          });
        });

        let cDraft = 0, cSubmitted = 0, cApproved = 0, cRejected = 0;

        const perYear: Record<number, number> = {};
        const nowYear = new Date().getFullYear();
        const windowYears = Array.from({ length: 5 }, (_, i) => nowYear - 4 + i);

        snapAll.docs.forEach((d) => {
          const data = d.data() as SubmissionDoc;
          const s = normalizeStatus(data.status) as 'Draft' | 'Submitted' | 'Approved' | 'Rejected' | undefined;

          if (s === 'Draft') cDraft++;
          else if (s === 'Submitted') cSubmitted++;
          else if (s === 'Approved') cApproved++;
          else if (s === 'Rejected') cRejected++;

          const by = Number(data.basics?.year ?? NaN);
          if (!Number.isNaN(by) && windowYears.includes(by)) {
            perYear[by] = (perYear[by] ?? 0) + 1;
          }
        });

        const maxVal = Math.max(1, ...windowYears.map(y => perYear[y] ?? 0));
        const trendArr: TrendPoint[] = windowYears.map((y) => ({
          year: y,
          value: perYear[y] ?? 0,
          max: maxVal,
        }));

        setActivities(recentActivities);
        setDraft(cDraft);
        setSubmitted(cSubmitted);
        setApproved(cApproved);
        setRejected(cRejected);
        setTrend(trendArr);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.uid]);

  return (
    <Box sx={{ py: 4, bgcolor: 'white', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        <Stack direction="row" alignItems="start" justifyContent="space-between" sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight={800} color="black">
              {`Welcome back${user?.displayName ? `, ${user.displayName}` : user?.email ? `, ${user.email.split('@')[0]}` : ''}`}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Lecturer Dashboard
            </Typography>
          </Box>

          <Button variant="contained" startIcon={<AddRoundedIcon />} sx={{ borderRadius: 2 }}>
            New Submission
          </Button>
        </Stack>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard icon={<CheckCircleRoundedIcon />} label="Approved" value={approved} color="success" />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard icon={<CancelRoundedIcon />} label="Rejected" value={rejected} color="error" />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              icon={<PendingActionsOutlinedIcon />}
              label="Pending Review"
              value={submitted}
              color="warning"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard icon={<DescriptionOutlinedIcon />} label="Draft" value={draft} />
          </Grid>
        </Grid>
        <Grid container spacing={3}>
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
                {loading && (
                  <Typography sx={{ px: 2, py: 3 }} color="text.secondary">
                    Loading activities...
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

export default function DashboardPage() {
  return (
    <ProtectedRoute requiredRole="lecturer" redirectTo="/login">
      <LecturerDashboardContent />
    </ProtectedRoute>
  );
}

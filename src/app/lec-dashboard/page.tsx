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
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
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
    <Box
      sx={(t) => ({
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${t.palette.primary.main}08 0%, ${t.palette.secondary.main}05 50%, transparent 100%)`,
        py: 3,
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23f0f0f0" fill-opacity="0.02"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          zIndex: 0,
          pointerEvents: 'none',
        },
      })}
    >
      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Box>
              <Typography
                variant="h4"
                fontWeight={700}
                gutterBottom
                sx={(t) => ({
                  background: `linear-gradient(45deg, ${t.palette.primary.main}, ${t.palette.secondary.main})`,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                })}
              >
                {`Welcome back${user?.displayName ? `, ${user.displayName}` : user?.email ? `, ${user.email.split('@')[0]}` : ''}`}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Lecturer Dashboard - จัดการและติดตามผลงานตีพิมพ์ของคุณ
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={() => router.push('/lecnewsubmit')}
              sx={{
                borderRadius: 3,
                px: 3,
                py: 1.2,
                fontWeight: 600,
                background: (t) => `linear-gradient(45deg, ${t.palette.primary.main} 30%, ${t.palette.primary.dark} 90%)`,
                boxShadow: "0 4px 20px rgba(25, 118, 210, 0.4)",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 25px rgba(25, 118, 210, 0.5)",
                  background: (t) => `linear-gradient(45deg, ${t.palette.primary.dark} 30%, ${t.palette.primary.main} 90%)`,
                },
                transition: "all 0.3s ease-in-out",
              }}
            >
              New Submission
            </Button>
          </Stack>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
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

        {/* Main Content */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 4,
                boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                backdropFilter: "blur(10px)",
                background: "rgba(255,255,255,0.95)",
                border: "1px solid rgba(255,255,255,0.2)",
                overflow: 'hidden',
              }}
            >
              <Box sx={{ px: 3, py: 2.5 }}>
                <Typography variant="h6" fontWeight={700}>
                  Recent Activity
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  ติดตามกิจกรรมล่าสุดของผลงานตีพิมพ์
                </Typography>
              </Box>
              <Divider />

              <Box>
                {activities.length === 0 && !loading && (
                  <Box sx={{ px: 3, py: 4, textAlign: 'center' }}>
                    <DescriptionOutlinedIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                    <Typography color="text.secondary">
                      ยังไม่มีกิจกรรม
                    </Typography>
                    <Typography variant="body2" color="text.disabled">
                      เริ่มต้นสร้างผลงานตีพิมพ์แรกของคุณ
                    </Typography>
                  </Box>
                )}
                {loading && (
                  <Box sx={{ px: 3, py: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                      กำลังโหลดข้อมูล...
                    </Typography>
                  </Box>
                )}
                {activities.map((a, idx) => (
                  <Box key={a.id}>
                    <ActivityItem item={a} />
                    {idx !== activities.length - 1 && <Divider sx={{ ml: 8 }} />}
                  </Box>
                ))}
              </Box>

              {activities.length > 0 && (
                <>
                  <Divider />
                  <Box sx={{ p: 2 }}>
                    <Button
                      fullWidth
                      variant="text"
                      sx={{
                        borderRadius: 3,
                        py: 1.5,
                        fontWeight: 600,
                        color: 'primary.main',
                        '&:hover': {
                          backgroundColor: 'primary.main',
                          color: 'white',
                        }
                      }}
                    >
                      View All Publications
                    </Button>
                  </Box>
                </>
              )}
            </Paper>
          </Grid>

          {/* Publication Trend */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 4,
                boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                backdropFilter: "blur(10px)",
                background: "rgba(255,255,255,0.95)",
                border: "1px solid rgba(255,255,255,0.2)",
                overflow: 'hidden',
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: 3, py: 2.5 }}>
                <Box
                  sx={(t) => ({
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: `${t.palette.primary.main}15`,
                    color: t.palette.primary.main,
                  })}
                >
                  <TrendingUpRoundedIcon fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    Publication Trend
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    แนวโน้มผลงาน 5 ปี
                  </Typography>
                </Box>
              </Stack>
              <Divider />

              <Stack spacing={2} sx={{ p: 3 }}>
                {trend.map((t) => (
                  <TrendRow key={t.year} year={t.year} value={t.value} max={t.max} />
                ))}
              </Stack>

              <Divider />
              <Box sx={{ p: 3 }}>
                <Grid container spacing={2}>
                  <Grid size={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        This Year
                      </Typography>
                      <Typography variant="h5" fontWeight={800} color="primary.main">
                        {trend.find((x) => x.year === new Date().getFullYear())?.value ?? 0}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        Total (5 yrs)
                      </Typography>
                      <Typography variant="h5" fontWeight={800} color="secondary.main">
                        {trend.reduce((sum, x) => sum + x.value, 0)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
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

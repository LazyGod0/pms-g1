'use client';

import {
  Box, Button, Container, Divider, Paper, Stack, Typography, Chip, Card, CardContent,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import ArticleIcon from '@mui/icons-material/Article';
import SchoolIcon from '@mui/icons-material/School';
import TimelineIcon from '@mui/icons-material/Timeline';
import PublishIcon from '@mui/icons-material/Publish';
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
  return new Date(x);
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
  gradient,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  gradient?: string;
}) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        background: gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '120px',
          height: '120px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%',
          transform: 'translate(40px, -40px)',
        },
      }}
    >
      <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: 3,
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
            }}
          >
            {icon}
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
              {label}
            </Typography>
            <Typography variant="h4" fontWeight={800}>
              {value}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function ActivityIcon({ status }: { status: Activity['status'] }) {
  const common = { fontSize: 22 };
  if (status === 'approved') return <CheckCircleRoundedIcon sx={{ ...common, color: '#4caf50' }} />;
  if (status === 'rejected') return <CancelRoundedIcon sx={{ ...common, color: '#f44336' }} />;
  if (status === 'submitted') return <PendingActionsOutlinedIcon sx={{ ...common, color: '#ff9800' }} />;
  return <DescriptionOutlinedIcon sx={{ ...common, color: '#9e9e9e' }} />; // draft
}

function ActivityItem({ item }: { item: Activity }) {
  const getStatusColor = (status: Activity['status']) => {
    switch (status) {
      case 'approved': return '#4caf50';
      case 'rejected': return '#f44336';
      case 'submitted': return '#ff9800';
      default: return '#9e9e9e';
    }
  };

  const getStatusText = (status: Activity['status']) => {
    switch (status) {
      case 'approved': return 'อนุมัติแล้ว';
      case 'rejected': return 'ถูกปฏิเสธ';
      case 'submitted': return 'รอการอนุมัติ';
      default: return 'ร่าง';
    }
  };

  return (
    <Box
      sx={{
        px: 3,
        py: 2.5,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          bgcolor: 'rgba(0,0,0,0.02)',
          transform: 'translateX(4px)',
        },
      }}
    >
      <Stack direction="row" spacing={3} alignItems="flex-start">
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            display: 'grid',
            placeItems: 'center',
            bgcolor: `${getStatusColor(item.status)}15`,
            flex: '0 0 auto',
          }}
        >
          <ActivityIcon status={item.status} />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
            <Typography
              variant="h6"
              fontWeight={600}
              sx={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                flex: 1,
              }}
            >
              {item.title}
            </Typography>
            <Chip
              label={getStatusText(item.status)}
              size="small"
              sx={{
                bgcolor: `${getStatusColor(item.status)}15`,
                color: getStatusColor(item.status),
                fontWeight: 600,
                borderRadius: 2,
              }}
            />
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            {item.subtitle}
          </Typography>
          <Typography variant="caption" color="text.disabled">
            {item.date}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

function TrendRow({ year, value, max }: { year: number; value: number; max: number }) {
  const pct = Math.max(0, Math.min(100, (value / Math.max(1, max)) * 100));
  return (
    <Stack direction="row" spacing={3} alignItems="center" sx={{ py: 1 }}>
      <Box sx={{ width: 60 }}>
        <Typography variant="body1" fontWeight={600} color="text.primary">
          {year}
        </Typography>
      </Box>
      <Box sx={{ flex: 1 }}>
        <Box
          sx={{
            height: 12,
            borderRadius: 6,
            bgcolor: 'rgba(0,0,0,0.08)',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <Box
            sx={{
              width: `${pct}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
              transition: 'width 1s ease-in-out',
            }}
          />
        </Box>
      </Box>
      <Typography variant="body1" fontWeight={700} color="primary.main" sx={{ width: 24, textAlign: 'right' }}>
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
            title: data.basics?.title || '(ไม่มีชื่อ)',
            subtitle:
              s === 'Approved' ? 'ผลงานของคุณได้รับการอนุมัติแล้ว'
                : s === 'Rejected' ? 'ผลงานถูกปฏิเสธ'
                  : s === 'Submitted' ? 'ส่งผลงานเพื่อตรวจสอบแล้ว'
                    : 'บันทึกร่างเรียบร้อย',
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
      sx={{
        minHeight: "100vh",
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        py: 4,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(255,255,255,0.8) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(79,172,254,0.1) 0%, transparent 50%)
          `,
          zIndex: 0,
          pointerEvents: 'none',
        },
      }}
    >
      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
        {/* Header Section */}
        <Box sx={{ mb: 5 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
            <Box>
              <Typography
                variant="h3"
                fontWeight={800}
                gutterBottom
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                  mb: 1,
                }}
              >
                ยินดีต้อนรับ{user?.displayName ? `, ${user.displayName}` : user?.email ? `, ${user.email.split('@')[0]}` : ''}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <SchoolIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                <Typography variant="h6" color="text.secondary" fontWeight={500}>
                  แดชบอร์ดอาจารย์ - จัดการและติดตามผลงานตีพิมพ์ของคุณ
                </Typography>
              </Stack>
            </Box>

            <Button
              variant="contained"
              size="large"
              startIcon={<PublishIcon />}
              onClick={() => router.push('/lecnewsubmit')}
              sx={{
                borderRadius: 4,
                px: 4,
                py: 1.5,
                fontWeight: 700,
                fontSize: '1.1rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: "0 8px 32px rgba(102, 126, 234, 0.4)",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 12px 40px rgba(102, 126, 234, 0.5)",
                  background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                },
                transition: "all 0.3s ease-in-out",
              }}
            >
              เพิ่มผลงานใหม่
            </Button>
          </Stack>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={4} sx={{ mb: 5 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              icon={<CheckCircleRoundedIcon sx={{ fontSize: 30 }} />}
              label="ผลงานที่อนุมัติแล้ว"
              value={approved}
              gradient="linear-gradient(135deg, #4CAF50 0%, #45a049 100%)"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              icon={<CancelRoundedIcon sx={{ fontSize: 30 }} />}
              label="ผลงานที่ถูกปฏิเสธ"
              value={rejected}
              gradient="linear-gradient(135deg, #f44336 0%, #d32f2f 100%)"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              icon={<PendingActionsOutlinedIcon sx={{ fontSize: 30 }} />}
              label="รอการตรวจสอบ"
              value={submitted}
              gradient="linear-gradient(135deg, #ff9800 0%, #f57c00 100%)"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              icon={<ArticleIcon sx={{ fontSize: 30 }} />}
              label="ผลงานร่าง"
              value={draft}
              gradient="linear-gradient(135deg, #9e9e9e 0%, #757575 100%)"
            />
          </Grid>
        </Grid>

        {/* Main Content */}
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 6,
                boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
                backdropFilter: "blur(20px)",
                background: "rgba(255,255,255,0.95)",
                border: "1px solid rgba(255,255,255,0.3)",
                overflow: 'hidden',
              }}
            >
              <Box sx={{ px: 4, py: 3 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 3,
                      display: 'grid',
                      placeItems: 'center',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                    }}
                  >
                    <TimelineIcon />
                  </Box>
                  <Box>
                    <Typography variant="h5" fontWeight={700}>
                      กิจกรรมล่าสุด
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      ติดตามความคืบหน้าของผลงานตีพิมพ์ทั้งหมด
                    </Typography>
                  </Box>
                </Stack>
              </Box>
              <Divider />

              <Box>
                {activities.length === 0 && !loading && (
                  <Box sx={{ px: 4, py: 6, textAlign: 'center' }}>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: 'rgba(0,0,0,0.04)',
                        mx: 'auto',
                        mb: 2,
                      }}
                    >
                      <DescriptionOutlinedIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
                    </Box>
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                      ยังไม่มีกิจกรรม
                    </Typography>
                    <Typography variant="body2" color="text.disabled">
                      เริ่มต้นสร้างผลงานตีพิมพ์แรกของคุณกัน
                    </Typography>
                  </Box>
                )}
                {loading && (
                  <Box sx={{ px: 4, py: 6, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary">
                      กำลังโหลดข้อมูล...
                    </Typography>
                  </Box>
                )}
                {activities.map((a, idx) => (
                  <Box key={a.id}>
                    <ActivityItem item={a} />
                    {idx !== activities.length - 1 && <Divider sx={{ ml: 12 }} />}
                  </Box>
                ))}
              </Box>

              {activities.length > 0 && (
                <>
                  <Divider />
                  <Box sx={{ p: 3 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="large"
                      onClick={() => router.push('/lec-publication')}
                      sx={{
                        borderRadius: 4,
                        py: 1.5,
                        fontWeight: 600,
                        fontSize: '1rem',
                        borderColor: 'primary.main',
                        color: 'primary.main',
                        '&:hover': {
                          backgroundColor: 'primary.main',
                          color: 'white',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
                        },
                        transition: 'all 0.3s ease-in-out',
                      }}
                    >
                      ดูผลงานทั้งหมด
                    </Button>
                  </Box>
                </>
              )}
            </Paper>
          </Grid>

          {/* Publication Trend */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 6,
                boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
                backdropFilter: "blur(20px)",
                background: "rgba(255,255,255,0.95)",
                border: "1px solid rgba(255,255,255,0.3)",
                overflow: 'hidden',
              }}
            >
              <Box sx={{ px: 4, py: 3 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 3,
                      display: 'grid',
                      placeItems: 'center',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                    }}
                  >
                    <TrendingUpRoundedIcon />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      แนวโน้มผลงาน
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      สถิติผลงาน 5 ปีที่ผ่านมา
                    </Typography>
                  </Box>
                </Stack>
              </Box>
              <Divider />

              <Stack spacing={2} sx={{ p: 4 }}>
                {trend.map((t) => (
                  <TrendRow key={t.year} year={t.year} value={t.value} max={t.max} />
                ))}
              </Stack>

              <Divider />
              <Box sx={{ p: 4 }}>
                <Grid container spacing={3}>
                  <Grid size={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        textAlign: 'center',
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
                        border: '1px solid rgba(102, 126, 234, 0.1)',
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        ปีนี้
                      </Typography>
                      <Typography variant="h4" fontWeight={800} color="primary.main" sx={{ mt: 0.5 }}>
                        {trend.find((x) => x.year === new Date().getFullYear())?.value ?? 0}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid size={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        textAlign: 'center',
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #764ba215 0%, #667eea15 100%)',
                        border: '1px solid rgba(118, 75, 162, 0.1)',
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        รวม 5 ปี
                      </Typography>
                      <Typography variant="h4" fontWeight={800} color="secondary.main" sx={{ mt: 0.5 }}>
                        {trend.reduce((sum, x) => sum + x.value, 0)}
                      </Typography>
                    </Paper>
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

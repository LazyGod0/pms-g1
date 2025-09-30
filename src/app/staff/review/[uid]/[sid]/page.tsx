'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Box, Button, Chip, Divider, Paper, Stack, Typography,
  List, ListItem, ListItemText, TextField, Skeleton
} from '@mui/material';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { db } from '@/configs/firebase-config'; // ← adjust if needed
import {
  doc as fsDoc, onSnapshot, updateDoc, serverTimestamp, Timestamp,
} from 'firebase/firestore';

type TabKey = 'basics' | 'authors' | 'identifiers' | 'references' | 'attachments';

type Pub = {
  title: string;
  authorLine?: string;
  faculty?: string;
  submittedAt?: string;
  basics?: {
    title?: string;
    year?: string | number;
    type?: string;
    level?: string;
    keywords?: string[];
    abstract?: string;
  };
  authors?: Array<{ name: string; email?: string; affiliation?: string; authorType?: string; role?: string }>;
  identifiers?: { doi?: string;[k: string]: any };
  references?: Array<{ title?: string; authors?: string; link?: string; url?: string; year?: string }>;
  attachments?: { files?: string[] };
  status?: string;
};

type ActionKind = 'approve' | 'reject';

const fmt = (t?: Timestamp) =>
  t?.toDate?.()?.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

export default function ReviewPublicationPage() {
  const { uid, sid } = useParams<{ uid: string; sid: string }>();
  const router = useRouter(); // ✅ ใช้ router จาก next/navigation

  const [tab, setTab] = React.useState<TabKey>('basics');
  const [internalNotes, setInternalNotes] = React.useState('');
  const [pub, setPub] = React.useState<Pub | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [pendingAction, setPendingAction] = React.useState<ActionKind | null>(null);
  const [busy, setBusy] = React.useState(false);

  function openConfirm(action: ActionKind) {
    setPendingAction(action);
    setConfirmOpen(true);
  }

  function closeConfirm() {
    if (busy) return;
    setConfirmOpen(false);
    setPendingAction(null);
  }

  async function confirmAction() {
    if (!pendingAction) return;
    try {
      setBusy(true);
      await setStatus(pendingAction === 'approve' ? 'approved' : 'rejected');
      closeConfirm();
    } finally {
      setBusy(false);
    }
  }

  // --- Firestore: direct doc subscribe ---
  React.useEffect(() => {
    if (!uid || !sid) return;

    const ref = fsDoc(db, 'users', uid, 'submissions', sid);
    console.log('[Review] subscribing to:', ref.path);

    const unsub = onSnapshot(
      ref,
      (ds) => {
        console.log('[Review] exists?', ds.exists());
        if (!ds.exists()) {
          setErrorMsg(`Not found: ${ref.path}`);
          setLoading(false);
          return;
        }
        const d: any = ds.data();
        console.log('[Review] data:', d);
        const basics = d.basics ?? {};
        setPub({
          title: basics.title ?? d.title ?? 'Untitled',
          authorLine: d.author ?? basics.author,
          // faculty: d.faculty,
          submittedAt: fmt(d.submittedAt) ?? fmt(d.createdAt),
          basics: {
            title: basics.title,
            year: basics.year,
            type: basics.type,
            level: basics.level,
            keywords: basics.keywords ?? [],
            abstract: basics.abstract,
          },
          authors: d.authors ?? [],
          identifiers: d.identifiers,
          references: d.references ?? [],
          attachments: d.attachments,
          status: d.status,
        });
        setLoading(false);
        setErrorMsg(null);
      },
      (err) => {
        console.error('[Review] onSnapshot error:', err);
        setErrorMsg(err?.message || 'Permission denied or network error.');
        setLoading(false);
      }
    );
    return () => unsub();
  }, [uid, sid]);

  async function setStatus(next: 'approved' | 'rejected') {
    try {
      await updateDoc(fsDoc(db, 'users', uid, 'submissions', sid), {
        status: next,
        reviewedAt: serverTimestamp(),
      });
      // ✅ อัปเดตเสร็จ → เด้งกลับ Review Queue
      router.push('/staff/review-queue');
    } catch (e) {
      console.error(e);
      alert('Failed to update status');
    }
  }

  if (loading) {
    return (
      <Box>
        <Skeleton width={220} height={28} />
        <Skeleton width={420} height={44} sx={{ my: 1 }} />
        <Skeleton variant="rectangular" height={52} sx={{ borderRadius: 2, mb: 2 }} />
        <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }
  if (errorMsg || !pub) return <Typography color="error">{errorMsg ?? 'Not found'}</Typography>;

  const b = pub.basics ?? {};

  return (
    <Box>
      {/* Breadcrumb */}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
  

        <Typography component={Link} href="/staff/dashboard" color="primary" sx={{ textDecoration: 'none' }}>
          Staff Portal
        </Typography>
        <Typography>›</Typography>
        <Typography component={Link} href="/staff/review-queue" color="primary" sx={{ textDecoration: 'none' }}>
          Review Queue
        </Typography>
      </Stack>

      <Button component={Link} href="/staff/review-queue" startIcon={<ArrowBackIosNewIcon fontSize="small" />} sx={{ mb: 1 }}>
        Back to Review Queue
      </Button>

      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>{pub.title}</Typography>
          <Stack direction="row" spacing={1} sx={{ color: 'text.secondary', mt: 0.5, flexWrap: 'wrap' }}>
            {pub.authorLine && <Typography>by {pub.authorLine}</Typography>}
            {pub.faculty && <Typography>• {pub.faculty}</Typography>}
            {pub.submittedAt && <Typography>• Submitted {pub.submittedAt}</Typography>}
          </Stack>
          <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
            {b.type && <Chip label={b.type} size="small" />}
            {b.level && <Chip label={b.level} size="small" />}
            <Chip
              label={pub.status ? (pub.status === 'approved' ? 'Approved' : pub.status === 'rejected' ? 'Rejected' : 'Pending Review') : 'Pending Review'}
              color={pub.status === 'approved' ? 'success' : pub.status === 'rejected' ? 'error' : 'warning'}
              size="small"
            />
          </Stack>
        </Box>

        <Stack direction="row" spacing={1}>
          <Button variant="contained" color="success" startIcon={<CheckCircleIcon />} onClick={() => openConfirm('approve')}>
            Approve
          </Button>
          <Button variant="contained" color="error" startIcon={<CancelIcon />} onClick={() => openConfirm('reject')}>
            Reject
          </Button>
        </Stack>
      </Stack>

      {/* Tabs */}
      <Paper variant="outlined" sx={{ p: 0.5, borderRadius: 8, mb: 2, bgcolor: (t) => (t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.background.paper) }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          slotProps={{ indicator: { style: { display: 'none' } } }}
          sx={{
            px: 1,
            minHeight: 44,
            '& .MuiTabs-indicator': { display: 'none' },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 999,
              minHeight: 40,
              lineHeight: 1.25,
              px: 2, mr: 1,
            },
            '& .Mui-selected': {
              bgcolor: 'background.paper',
              boxShadow: (t) => `0 0 0 1px ${t.palette.divider} inset`,
            },
          }}
        >
          <Tab label="Basics" value="basics" />
          <Tab label="Authors" value="authors" />
          <Tab label="Identifiers" value="identifiers" />
          <Tab label="References" value="references" />
          <Tab label="Attachments" value="attachments" />
        </Tabs>
      </Paper>

      {/* 2-column */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 360px' }, gap: 2 }}>
        {/* Left */}
        <Box>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            {tab === 'basics' && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>Publication Details</Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography color="text.secondary">Title</Typography>
                    <Typography fontWeight={700}>{b.title ?? pub.title}</Typography>
                  </Box>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {b.year && (<Box><Typography color="text.secondary">Year</Typography><Typography>{b.year}</Typography></Box>)}
                    {b.type && (<Box><Typography color="text.secondary">Type</Typography><Typography>{b.type}</Typography></Box>)}
                    {b.level && (<Box><Typography color="text.secondary">Level</Typography><Typography>{b.level}</Typography></Box>)}
                  </Box>

                  {!!b.keywords?.length && (
                    <Box>
                      <Typography color="text.secondary" sx={{ mb: 1 }}>Keywords</Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {b.keywords!.map((k) => <Chip key={k} label={k} size="small" variant="outlined" />)}
                      </Stack>
                    </Box>
                  )}

                  {b.abstract && (
                    <Box>
                      <Typography color="text.secondary">Abstract</Typography>
                      <Typography sx={{ mt: 0.5 }}>{b.abstract}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {b.abstract.length} characters
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Box>
            )}

            {tab === 'authors' && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>Authors &amp; Affiliations</Typography>
                <Stack spacing={2}>
                  {(pub.authors ?? []).map((a) => (
                    <Paper key={`${a.email ?? a.name}`} variant="outlined" sx={{ p: 2, borderRadius: 3, display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                      <Box>
                        <Typography fontWeight={700}>{a.name}</Typography>
                        {a.email && <Typography variant="body2" color="text.secondary">{a.email}</Typography>}
                        {a.affiliation && <Typography variant="body2" color="text.secondary">{a.affiliation}</Typography>}
                      </Box>
                      <Stack direction="row" spacing={1} flexShrink={0} alignSelf="center">
                        {a.authorType && <Chip label={a.authorType} color={a.authorType === 'Internal' ? 'primary' : 'default'} size="small" />}
                        {a.role && <Chip label={a.role} size="small" variant="outlined" />}
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </Box>
            )}

            {tab === 'identifiers' && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>Identifiers</Typography>
                <List>
                  {pub.identifiers?.doi && <ListItem><ListItemText primary="DOI" secondary={pub.identifiers.doi} /></ListItem>}
                </List>
              </Box>
            )}

            {tab === 'references' && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>References</Typography>
                <List>
                  {(pub.references ?? []).map((r, i) => (
                    <ListItem key={i}>
                      <ListItemText
                        primary={r.title ?? r.url ?? r.link}
                        secondary={[r.authors, r.year, r.link ?? r.url].filter(Boolean).join(' • ')}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {tab === 'attachments' && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>Attachments</Typography>
                <List>
                  {(pub.attachments?.files ?? []).map((f, i) => (
                    <ListItem key={i}><ListItemText primary={f} /></ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Paper>
        </Box>

        {/* Right rail */}
        <Box>
          <Stack spacing={2}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>Review Timeline</Typography>
              <Divider sx={{ mb: 1 }} />
              <List dense>
                <ListItem disableGutters>
                  <ListItemText primary="Publication submitted for review" secondary={pub.submittedAt ?? ''} />
                </ListItem>
                {pub.status && (
                  <ListItem disableGutters>
                    <ListItemText primary={`Current status: ${pub.status}`} />
                  </ListItem>
                )}
              </List>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>Internal Notes</Typography>
              <TextField
                multiline minRows={4} fullWidth
                placeholder="Add internal notes for other reviewers..."
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
              />
              <Stack direction="row" justifyContent="flex-end" sx={{ mt: 1 }}>
                <Button variant="outlined" onClick={() => alert('Notes saved (stub)')}>Save Notes</Button>
              </Stack>
            </Paper>
          </Stack>
        </Box>
      </Box>

      {/* Confirm Dialog */}
      <Dialog
        open={confirmOpen}
        onClose={closeConfirm}
        aria-labelledby="review-confirm-title"
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle id="review-confirm-title">
          {pendingAction === 'approve' ? 'Confirm approval' : 'Confirm rejection'}
        </DialogTitle>

        <DialogContent dividers>
          <Typography>
            {pendingAction === 'approve'
              ? 'Are you sure you want to approve this submission?'
              : 'Are you sure you want to reject this submission?'}
          </Typography>
          {/* If you ever want to require a reason for rejection, add a TextField here conditionally. */}
        </DialogContent>

        <DialogActions>
          <Button onClick={closeConfirm} disabled={busy}>
            Cancel
          </Button>
          <Button
            onClick={confirmAction}
            variant="contained"
            color={pendingAction === 'approve' ? 'success' : 'error'}
            disabled={busy}
          >
            {busy ? 'Saving…' : pendingAction === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

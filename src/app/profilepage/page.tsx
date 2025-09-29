'use client';

import * as React from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
  Paper,
  Snackbar,
  Alert,
} from '@mui/material';

type ProfileForm = {
  fullName: string;
  email: string;
  faculty: string;
  department: string;
  phone: string;
  website: string;
  bio: string;
  avatarUrl?: string;
  accountCreated: string;
  lastLogin: string;
};

const initialData: ProfileForm = {
  fullName: 'Dr. Niran Sookchai',
  email: 'niran.s@university.ac.th',
  faculty: 'Faculty of Science',
  department: 'Computer Science',
  phone: '+66 2 123 4567',
  website: 'https://scholar.google.com/citations?user=example',
  bio: 'Passionate researcher in computer science with focus on AI and machine learning applications.',
  accountCreated: '1/15/2020',
  lastLogin: '12/8/2024',
};

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('');
}

export default function ProfilePage() {
  const [form, setForm] = React.useState<ProfileForm>(initialData);
  const [dirty, setDirty] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [toast, setToast] = React.useState<{ open: boolean; msg: string; type: 'success' | 'error' }>({
    open: false,
    msg: '',
    type: 'success',
  });

  const onChange =
    (key: keyof ProfileForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
      setDirty(true);
    };

  // เบื้องต้น: validate อีเมล/URL/ชื่อ
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const urlOk = !form.website || /^https?:\/\/.+/i.test(form.website);
  const nameOk = form.fullName.trim().length > 0;

  const canSave = dirty && emailOk && urlOk && nameOk && !saving;

  const handleSave = async () => {
    try {
      setSaving(true);
      // TODO: ต่อ backend จริง (เช่น fetch('/api/profile', {method:'POST', body: JSON.stringify(form)}))
      await new Promise((r) => setTimeout(r, 800));
      setDirty(false);
      setToast({ open: true, msg: 'บันทึกข้อมูลเรียบร้อย', type: 'success' });
      console.log('Saved payload:', form);
    } catch (e) {
      setToast({ open: true, msg: 'บันทึกล้มเหลว', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpload: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // แสดงตัวอย่างทันที (client-side)
    const url = URL.createObjectURL(file);
    setForm((prev) => ({ ...prev, avatarUrl: url }));
    setDirty(true);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
        Personal Information
      </Typography>

      <Paper variant="outlined" sx={{ p: 2.5, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          {/* Avatar + Upload */}
          <Grid size={{xs:12,sm:"auto"}}>
            <Stack alignItems="center" spacing={1.5}>
              <Avatar
                src={form.avatarUrl}
                sx={{ width: 96, height: 96, fontSize: 28 }}
                alt={form.fullName}
              >
                {getInitials(form.fullName) || 'AA'}
              </Avatar>
              <Button component="label" variant="outlined" size="small">
                Upload Photo
                <input hidden accept="image/*" type="file" onChange={handleUpload} />
              </Button>
              <Typography variant="caption" color="text.secondary" textAlign="center">
                Recommended: Square image, at least 400x400px
              </Typography>
            </Stack>
          </Grid>

          {/* Form */}
          <Grid size={{xs:12,sm:6}}>
            <Grid container spacing={2}>
              <Grid size={{xs:12,sm:6}}>
                <TextField
                  label="Full Name"
                  fullWidth
                  value={form.fullName}
                  onChange={onChange('fullName')}
                  error={!nameOk}
                  helperText={!nameOk ? 'กรุณากรอกชื่อ-นามสกุล' : ' '}
                />
              </Grid>
              <Grid size={{xs:12,sm:6}}>
                <TextField
                  label="Email"
                  fullWidth
                  value={form.email}
                  onChange={onChange('email')}
                  error={!emailOk}
                  helperText={!emailOk ? 'อีเมลไม่ถูกต้อง' : ' '}
                />
              </Grid>

              <Grid size={{xs:12,sm:6}}>
                <TextField label="Faculty" fullWidth value={form.faculty} onChange={onChange('faculty')} />
              </Grid>
              <Grid size={{xs:12,sm:6}}>
                <TextField
                  label="Department"
                  fullWidth
                  value={form.department}
                  onChange={onChange('department')}
                />
              </Grid>

              <Grid size={{xs:12,sm:6}}>
                <TextField label="Phone" fullWidth value={form.phone} onChange={onChange('phone')} />
              </Grid>
              <Grid size={{xs:12,sm:6}}>
                <TextField
                  label="Website/Portfolio"
                  fullWidth
                  value={form.website}
                  onChange={onChange('website')}
                  error={!urlOk}
                  helperText={!urlOk ? 'URL ต้องขึ้นต้นด้วย http:// หรือ https://' : ' '}
                />
              </Grid>

              <Grid size={{xs:12}}>
                <TextField
                  label="Bio"
                  fullWidth
                  multiline
                  minRows={3}
                  value={form.bio}
                  onChange={onChange('bio')}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Save button */}
          <Grid size={{xs:12}}>
            <Box display="flex" justifyContent="flex-end">
              <Button variant="contained" onClick={handleSave} disabled={!canSave}>
                {saving ? 'Saving…' : 'Save Changes'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Account Information */}
      <Card variant="outlined">
        <CardHeader title="Account Information" />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            <Grid size={{xs:12,sm:6}}>
              <Typography color="text.secondary">Account Created</Typography>
              <Typography fontWeight={600}>{form.accountCreated}</Typography>
            </Grid>
            <Grid size={{xs:12,sm:6}} >
              <Typography color="text.secondary">Last Login</Typography>
              <Typography fontWeight={600}>{form.lastLogin}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Snackbar
        open={toast.open}
        autoHideDuration={2500}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={toast.type} variant="filled" sx={{ width: '100%' }}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </Container>
  );
}

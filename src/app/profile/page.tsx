"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Grid,
  Divider,
  Avatar,
  IconButton,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Lock as LockIcon,
  ArrowBack as ArrowBackIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updateProfile
} from 'firebase/auth';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/configs/firebase-config';

interface UserProfile {
  displayName: string;
  email: string;
  faculty: string;
  department: string;
  position: string;
  phone: string;
  academicRank: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function ProfileContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Profile states
  const [profile, setProfile] = useState<UserProfile>({
    displayName: '',
    email: '',
    faculty: '',
    department: '',
    position: '',
    phone: '',
    academicRank: '',
  });
  const [originalProfile, setOriginalProfile] = useState<UserProfile>({
    displayName: '',
    email: '',
    faculty: '',
    department: '',
    position: '',
    phone: '',
    academicRank: '',
  });

  // Password change states
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Snackbar states
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  // Load user profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.uid) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.exists() ? userDoc.data() : {};

        const profileData: UserProfile = {
          displayName: user.displayName || userData.displayName || '',
          email: user.email || '',
          faculty: userData.faculty || '',
          department: userData.department || '',
          position: userData.position || '',
          phone: userData.phone || '',
          academicRank: userData.academicRank || '',
        };

        setProfile(profileData);
        setOriginalProfile(profileData);
      } catch (error) {
        console.error('Error loading profile:', error);
        setSnackbar({
          open: true,
          message: 'เกิดข้อผิดพลาดในการโหลดข้อมูลโปรไฟล์',
          severity: 'error',
        });
      }
    };

    loadProfile();
  }, [user]);

  const handleProfileChange = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);

      // Use auth.currentUser for Firebase Auth operations
      const currentUser = auth.currentUser;

      // Update Firebase Auth profile
      if (currentUser && profile.displayName !== currentUser.displayName) {
        await updateProfile(currentUser, {
          displayName: profile.displayName,
        });
      }

      // Update Firestore document
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: profile.displayName,
        faculty: profile.faculty,
        department: profile.department,
        position: profile.position,
        phone: profile.phone,
        academicRank: profile.academicRank,
        updatedAt: new Date(),
      });

      setOriginalProfile(profile);
      setEditMode(false);
      setSnackbar({
        open: true,
        message: 'บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      setSnackbar({
        open: true,
        message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setProfile(originalProfile);
    setEditMode(false);
  };

  const handlePasswordChange = async () => {
    // Use auth.currentUser instead of context user to avoid Firebase Auth method issues
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setSnackbar({
        open: true,
        message: 'ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่',
        severity: 'error',
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setSnackbar({
        open: true,
        message: 'รหัสผ่านใหม่และการยืนยันไม่ตรงกัน',
        severity: 'error',
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setSnackbar({
        open: true,
        message: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร',
        severity: 'error',
      });
      return;
    }

    try {
      setLoading(true);

      // Re-authenticate user with current Firebase Auth user
      const credential = EmailAuthProvider.credential(
        currentUser.email!,
        passwordForm.currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);

      // Update password with current Firebase Auth user
      await updatePassword(currentUser, passwordForm.newPassword);

      setPasswordDialog(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      setSnackbar({
        open: true,
        message: 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว',
        severity: 'success',
      });
    } catch (error: any) {
      console.error('Error changing password:', error);
      let message = 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน';

      if (error.code === 'auth/wrong-password') {
        message = 'รหัสผ่านปัจจุบันไม่ถูกต้อง';
      } else if (error.code === 'auth/weak-password') {
        message = 'รหัสผ่านใหม่ไม่แข็งแรงพอ';
      } else if (error.code === 'auth/requires-recent-login') {
        message = 'กรุณาเข้าสู่ระบบใหม่เพื่อเปลี่ยนรหัสผ่าน';
      }

      setSnackbar({
        open: true,
        message,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
            <IconButton
              onClick={() => router.back()}
              sx={{
                bgcolor: 'white',
                boxShadow: 2,
                '&:hover': { bgcolor: 'grey.100' },
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography
                variant="h4"
                fontWeight={800}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                ข้อมูลส่วนตัว
              </Typography>
              <Typography variant="body1" color="text.secondary">
                จัดการข้อมูลโปรไฟล์และการตั้งค่าบัญชีของคุณ
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Profile Card */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 6,
            boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
            backdropFilter: "blur(20px)",
            background: "rgba(255,255,255,50)",
            border: "1px solid rgba(255,255,255,0.3)",
            overflow: 'hidden',
          }}
        >
          {/* Profile Header */}
          <Box sx={{ p: 4, bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <Stack direction="row" alignItems="center" spacing={3}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: "black", // เพิ่มสีขาวให้ตัวอักษรใน Avatar
                }}
              >
                {profile.displayName.charAt(0).toUpperCase() || profile.email.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" fontWeight={700} sx={{ color: "black" }} gutterBottom>
                  {profile.displayName || profile.email.split('@')[0]}
                </Typography>
                <Typography variant="body1" sx={{ color: "black" }}>
                  {profile.position} {profile.position && profile.faculty && '•'} {profile.faculty}
                </Typography>
                <Typography variant="body2" sx={{ color: "black" }}>
                  {profile.email}
                </Typography>
              </Box>
              {!editMode && (
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => setEditMode(true)}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: "black", // เปลี่ยนเป็นสีขาวชัดเจน
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.3)',
                      color: "black", // รักษาสีขาวเมื่อ hover
                    },
                  }}
                >
                  แก้ไขข้อมูล
                </Button>
              )}
            </Stack>
          </Box>

          {/* Tabs */}
          <Box sx={{ px: 4, pt: 2 }}>
            <Tabs
              value={tabValue}
              onChange={(_, newValue) => setTabValue(newValue)}
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                },
              }}
            >
              <Tab
                icon={<PersonIcon />}
                iconPosition="start"
                label="ข้อมูลส่วนตัว"
              />
              <Tab
                icon={<LockIcon />}
                iconPosition="start"
                label="รหัสผ่าน"
              />
            </Tabs>
          </Box>

          {/* Tab Content */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ px: 4, pb: 4 }}>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="ชื่อ-นามสกุล"
                    value={profile.displayName}
                    onChange={(e) => handleProfileChange('displayName', e.target.value)}
                    disabled={!editMode}
                    variant="outlined"
                    InputProps={{
                      startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="อีเมล"
                    value={profile.email}
                    disabled
                    variant="outlined"
                    InputProps={{
                      startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                    helperText="ไม่สามารถเปลี่ยนแปลงอีเมลได้"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="คณะ"
                    value={profile.faculty}
                    onChange={(e) => handleProfileChange('faculty', e.target.value)}
                    disabled={!editMode}
                    variant="outlined"
                    InputProps={{
                      startAdornment: <SchoolIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="ภาควิชา"
                    value={profile.department}
                    onChange={(e) => handleProfileChange('department', e.target.value)}
                    disabled={!editMode}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="ตำแหน่ง"
                    value={profile.position}
                    onChange={(e) => handleProfileChange('position', e.target.value)}
                    disabled={!editMode}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="เบอร์โทรศัพท์"
                    value={profile.phone}
                    onChange={(e) => handleProfileChange('phone', e.target.value)}
                    disabled={!editMode}
                    variant="outlined"
                    InputProps={{
                      startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="ตำแหน่งทางวิชาการ"
                    value={profile.academicRank}
                    onChange={(e) => handleProfileChange('academicRank', e.target.value)}
                    disabled={!editMode}
                    variant="outlined"
                    placeholder="เช่น ผู้ช่วยศาสตราจารย์, รองศาสตราจารย์"
                  />
                </Grid>
              </Grid>

              {editMode && (
                <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveProfile}
                    disabled={loading}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      px: 3,
                    }}
                  >
                    {loading ? 'กำลังบันทึก...' : 'บันทึก'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancelEdit}
                    disabled={loading}
                  >
                    ยกเลิก
                  </Button>
                </Stack>
              )}
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ px: 4, pb: 4 }}>
              <Card variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    เปลี่ยนรหัสผ่าน
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    เพื่อความปลอดภัยของบัญชี กรุณาใช้รหัสผ่านที่แข็งแรง
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<LockIcon />}
                    onClick={() => setPasswordDialog(true)}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    }}
                  >
                    เปลี่ยนรหัสผ่าน
                  </Button>
                </CardContent>
              </Card>
            </Box>
          </TabPanel>
        </Paper>

        {/* Password Change Dialog */}
        <Dialog
          open={passwordDialog}
          onClose={() => setPasswordDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3 },
          }}
        >
          <DialogTitle sx={{ fontWeight: 700 }}>
            เปลี่ยนรหัสผ่าน
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="รหัสผ่านปัจจุบัน"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                variant="outlined"
              />
              <TextField
                fullWidth
                label="รหัสผ่านใหม่"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                variant="outlined"
                helperText="รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"
              />
              <TextField
                fullWidth
                label="ยืนยันรหัสผ่านใหม่"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                variant="outlined"
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={() => setPasswordDialog(false)}
              disabled={loading}
            >
              ยกเลิก
            </Button>
            <Button
              variant="contained"
              onClick={handlePasswordChange}
              disabled={loading || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              {loading ? 'กำลังเปลี่ยน...' : 'เปลี่ยนรหัสผ่าน'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            severity={snackbar.severity}
            variant="filled"
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute requiredRole="lecturer" redirectTo="/login">
      <ProfileContent />
    </ProtectedRoute>
  );
}

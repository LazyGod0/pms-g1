'use client';
import * as React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Tabs,
  Tab,
  TextField,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Snackbar,
  IconButton,
  InputAdornment,
} from '@mui/material';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LockIcon from '@mui/icons-material/Lock';
import LinkIcon from '@mui/icons-material/Link';
import SettingsIcon from '@mui/icons-material/Settings';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SaveIcon from '@mui/icons-material/Save';

import { useRouter } from 'next/navigation';
import { currentUser, faculties } from '../../libs/mock-data';

// ---- helpers/types (นอกคอมโพเนนต์) ----
type SnackbarState = {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
};

function TabPanel(props: { children?: React.ReactNode; value: string; index: string }) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ mt: 2 }}>{children}</Box>}
    </div>
  );
}

// ---- หน้า ProfilePage (default export ต้องเป็นคอมโพเนนต์) ----
export default function ProfilePage() {
  const router = useRouter();

  const [activeTab, setActiveTab] =
    React.useState<'profile' | 'security' | 'integrations' | 'preferences'>('profile');

  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const [snack, setSnack] = React.useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  const openSnack = (message: string, severity: SnackbarState['severity'] = 'success') =>
    setSnack({ open: true, message, severity });
  const handleSnackClose = () => setSnack((s) => ({ ...s, open: false }));

  const [profileData, setProfileData] = React.useState({
    name: currentUser.name,
    email: currentUser.email,
    faculty: currentUser.faculty,
    department: currentUser.department,
  });

  const [passwordData, setPasswordData] = React.useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [preferences, setPreferences] = React.useState({
    language: 'en',
    theme: 'light',
    emailNotifications: true,
    reviewReminders: true,
    systemUpdates: false,
  });

  const [integrations, setIntegrations] = React.useState({
    orcidConnected: false,
    orcidId: '',
    googleScholarConnected: false,
    researchGateConnected: false,
  });

  const handleSaveProfile = () => {
    if (!profileData.name || !profileData.email) {
      openSnack('Please fill in all required fields', 'error');
      return;
    }
    openSnack('Profile updated successfully', 'success');
  };

  const handleChangePassword = () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;
    if (!currentPassword || !newPassword || !confirmPassword) {
      openSnack('Please fill in all password fields', 'error'); return;
    }
    if (newPassword !== confirmPassword) {
      openSnack('New passwords do not match', 'error'); return;
    }
    if (newPassword.length < 8) {
      openSnack('Password must be at least 8 characters long', 'error'); return;
    }
    openSnack('Password changed successfully', 'success');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleSavePreferences = () => openSnack('Preferences saved successfully', 'success');

  const handleConnectOrcid = () => {
    if (integrations.orcidConnected) {
      setIntegrations((prev) => ({ ...prev, orcidConnected: false, orcidId: '' }));
      openSnack('ORCID disconnected', 'success');
    } else {
      openSnack('Redirecting to ORCID...', 'info');
      setTimeout(() => {
        setIntegrations((prev) => ({ ...prev, orcidConnected: true, orcidId: '0000-0000-0000-0000' }));
        openSnack('ORCID connected successfully', 'success');
      }, 1000);
    }
  };

  const handleConnectGoogleScholar = () => {
    setIntegrations((prev) => {
      const next = { ...prev, googleScholarConnected: !prev.googleScholarConnected };
      openSnack(next.googleScholarConnected ? 'Google Scholar connected' : 'Google Scholar disconnected', 'success');
      return next;
    });
  };

  const handleConnectResearchGate = () => {
    setIntegrations((prev) => {
      const next = { ...prev, researchGateConnected: !prev.researchGateConnected };
      openSnack(next.researchGateConnected ? 'ResearchGate connected' : 'ResearchGate disconnected', 'success');
      return next;
    });
  };

  return (
    <Box sx={{ maxWidth: 1024, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button variant="text" startIcon={<ArrowBackIcon />} onClick={() => router.push('/lecturer/dashboard')}>
          Back to Dashboard
        </Button>
        <Box>
          <Typography variant="h5" fontWeight={700}>Profile &amp; Settings</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your account information and preferences
          </Typography>
        </Box>
      </Box>

      {/* Tabs */}
      <Box>
        <Tabs value={activeTab} onChange={(_e, v) => setActiveTab(v)} aria-label="profile settings tabs">
          <Tab value="profile" label="Profile" />
          <Tab value="security" label="Security" />
          <Tab value="integrations" label="Integrations" />
          <Tab value="preferences" label="Preferences" />
        </Tabs>

        {/* Profile Tab */}
        <TabPanel value={activeTab} index="profile">
          <Card>
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <PersonOutlineIcon fontSize="small" />
                  <Typography variant="h6">Personal Information</Typography>
                </Box>
              }
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={{ xs:12 , md:6}}>
                  <TextField
                    fullWidth required id="name" label="Full Name"
                    value={profileData.name}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </Grid>
                <Grid size={{ xs:12 , md:6}}>
                  <TextField
                    fullWidth required id="email" type="email" label="Email Address"
                    value={profileData.email}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, email: e.target.value }))}
                  />
                </Grid>

                <Grid size={{ xs:12 , md:6}}>
                  <FormControl fullWidth>
                    <InputLabel id="faculty-label">Faculty</InputLabel>
                    <Select
                      labelId="faculty-label" id="faculty" label="Faculty"
                      value={profileData.faculty || ''}
                      onChange={(e) => setProfileData((prev) => ({ ...prev, faculty: e.target.value as string }))}
                    >
                      {faculties.map((f: any) => (
                        <MenuItem key={f.id} value={f.name}>{f.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs:12 , md:6}}>
                  <TextField
                    fullWidth id="department" label="Department"
                    value={profileData.department || ''}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, department: e.target.value }))}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 2 }}>
                <Alert severity="info">
                  Changes to your email address will require verification before taking effect.
                </Alert>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveProfile}>
                  Save Changes
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Box sx={{ mt: 2 }}>
            <Card>
              <CardHeader title="Account Information" />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid size={{ xs:12 , md:6}}>
                    <Typography variant="caption" color="text.secondary">User ID</Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{currentUser.id}</Typography>
                  </Grid>
                  <Grid size={{ xs:12 , md:6}}>
                    <Typography variant="caption" color="text.secondary">Role</Typography>
                    <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>{currentUser.role}</Typography>
                  </Grid>
                  <Grid size={{ xs:12 , md:6}}>
                    <Typography variant="caption" color="text.secondary">Account Created</Typography>
                    <Typography variant="body2">
                      {new Date(currentUser.createdAt).toLocaleDateString()}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs:12 , md:6}}>
                    <Typography variant="caption" color="text.secondary">Last Login</Typography>
                    <Typography variant="body2">
                      {currentUser.lastLogin ? new Date(currentUser.lastLogin).toLocaleDateString() : 'Never'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>

        {/* Security Tab */}
        <TabPanel value={activeTab} index="security">
          <Card>
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <LockIcon fontSize="small" />
                  <Typography variant="h6">Change Password</Typography>
                </Box>
              }
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={{ xs:12}}>
                  <TextField
                    fullWidth id="current-password" label="Current Password"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowCurrentPassword((v) => !v)} edge="end">
                            {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid size={{ xs:12 , md:6}}>
                  <TextField
                    fullWidth id="new-password" label="New Password"
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowNewPassword((v) => !v)} edge="end">
                            {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid size={{ xs:12 , md:6}}>
                  <TextField
                    fullWidth id="confirm-password" label="Confirm New Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowConfirmPassword((v) => !v)} edge="end">
                            {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 2 }}>
                <Alert severity="info">
                  Password must be at least 8 characters long and contain a mix of letters, numbers, and special characters.
                </Alert>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button variant="contained" startIcon={<LockIcon />} onClick={handleChangePassword}>
                  Change Password
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Box sx={{ mt: 2 }}>
            <Card>
              <CardHeader title="Two-Factor Authentication" />
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box>
                    <Typography fontWeight={600}>Authenticator App</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Use an authenticator app to generate verification codes
                    </Typography>
                  </Box>
                  <Button variant="outlined">Setup 2FA</Button>
                </Box>

                <Divider />

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', my: 2 }}>
                  <Box>
                    <Typography fontWeight={600}>SMS Verification</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Receive verification codes via SMS
                    </Typography>
                  </Box>
                  <Button variant="outlined">Setup SMS</Button>
                </Box>

                <Alert severity="info">
                  Two-factor authentication adds an extra layer of security to your account.
                </Alert>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>

        {/* Integrations Tab */}
        <TabPanel value={activeTab} index="integrations">
          <Card>
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <LinkIcon fontSize="small" />
                  <Typography variant="h6">External Accounts</Typography>
                </Box>
              }
            />
            <CardContent>
              {/* ORCID */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 40, height: 40, bgcolor: 'success.light', color: 'success.main', borderRadius: 1.2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    OR
                  </Box>
                  <Box>
                    <Typography fontWeight={600}>ORCID</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {integrations.orcidConnected ? `Connected: ${integrations.orcidId}` : 'Connect your ORCID researcher identifier'}
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  color={integrations.orcidConnected ? 'error' : 'primary'}
                  onClick={handleConnectOrcid}
                >
                  {integrations.orcidConnected ? 'Disconnect' : 'Connect ORCID'}
                </Button>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Google Scholar */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 40, height: 40, bgcolor: 'primary.light', color: 'primary.main', borderRadius: 1.2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    GS
                  </Box>
                  <Box>
                    <Typography fontWeight={600}>Google Scholar</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {integrations.googleScholarConnected ? 'Connected and syncing publications' : 'Import publications from Google Scholar'}
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant={integrations.googleScholarConnected ? 'contained' : 'outlined'}
                  color={integrations.googleScholarConnected ? 'error' : 'primary'}
                  onClick={handleConnectGoogleScholar}
                >
                  {integrations.googleScholarConnected ? 'Disconnect' : 'Connect'}
                </Button>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* ResearchGate */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 40, height: 40, bgcolor: 'info.light', color: 'info.main', borderRadius: 1.2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    RG
                  </Box>
                  <Box>
                    <Typography fontWeight={600}>ResearchGate</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {integrations.researchGateConnected ? 'Connected to your ResearchGate profile' : 'Link your ResearchGate profile'}
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant={integrations.researchGateConnected ? 'contained' : 'outlined'}
                  color={integrations.researchGateConnected ? 'error' : 'primary'}
                  onClick={handleConnectResearchGate}
                >
                  {integrations.researchGateConnected ? 'Disconnect' : 'Connect'}
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Box sx={{ mt: 2 }}>
            <Card>
              <CardHeader title="Single Sign-On" />
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box>
                    <Typography fontWeight={600}>University SSO</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Use your university credentials to sign in
                    </Typography>
                  </Box>
                  <Button variant="outlined">Configure SSO</Button>
                </Box>
                <Alert severity="info">
                  Contact your system administrator to enable SSO integration.
                </Alert>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>

        {/* Preferences Tab */}
        <TabPanel value={activeTab} index="preferences">
          <Card>
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <SettingsIcon fontSize="small" />
                  <Typography variant="h6">Application Preferences</Typography>
                </Box>
              }
            />
            <CardContent>
              <Grid container spacing={3}>
                <Grid size={{ xs:12 , md:6}}>
                  <FormControl fullWidth>
                    <InputLabel id="language-label">Language</InputLabel>
                    <Select
                      labelId="language-label" id="language" label="Language"
                      value={preferences.language}
                      onChange={(e) => setPreferences((prev) => ({ ...prev, language: e.target.value as string }))}
                    >
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="th">ไทย (Thai)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs:12 , md:6}}>
                  <FormControl fullWidth>
                    <InputLabel id="theme-label">Theme</InputLabel>
                    <Select
                      labelId="theme-label" id="theme" label="Theme"
                      value={preferences.theme}
                      onChange={(e) => setPreferences((prev) => ({ ...prev, theme: e.target.value as string }))}
                    >
                      <MenuItem value="light">Light</MenuItem>
                      <MenuItem value="dark">Dark</MenuItem>
                      <MenuItem value="system">System</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Box sx={{ mt: 2 }}>
            <Card>
              <CardHeader title="Notification Preferences" />
              <CardContent>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.emailNotifications}
                      onChange={(_e, checked) => setPreferences((prev) => ({ ...prev, emailNotifications: checked }))}
                    />
                  }
                  label={
                    <Box>
                      <Typography fontWeight={600}>Email Notifications</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Receive email updates about your publications
                      </Typography>
                    </Box>
                  }
                  sx={{ m: 0, width: '100%', justifyContent: 'space-between' }}
                />

                <Divider sx={{ my: 2 }} />

                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.reviewReminders}
                      onChange={(_e, checked) => setPreferences((prev) => ({ ...prev, reviewReminders: checked }))}
                    />
                  }
                  label={
                    <Box>
                      <Typography fontWeight={600}>Review Reminders</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Get reminders about pending reviews
                      </Typography>
                    </Box>
                  }
                  sx={{ m: 0, width: '100%', justifyContent: 'space-between' }}
                />

                <Divider sx={{ my: 2 }} />

                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.systemUpdates}
                      onChange={(_e, checked) => setPreferences((prev) => ({ ...prev, systemUpdates: checked }))}
                    />
                  }
                  label={
                    <Box>
                      <Typography fontWeight={600}>System Updates</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Notifications about system maintenance and updates
                      </Typography>
                    </Box>
                  }
                  sx={{ m: 0, width: '100%', justifyContent: 'space-between' }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 2 }}>
                  <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSavePreferences}>
                    Save Preferences
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={2500}
        onClose={handleSnackClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackClose} severity={snack.severity} sx={{ width: '100%' }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// =============================
// File: /app/(staff)/layout.tsx
// Layout with AppBar (topbar) + Drawer (sidebar) that never collapses over content
// =============================
'use client';
import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Chip,
  Paper,
  useTheme,
  alpha
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssessmentIcon from '@mui/icons-material/Assessment';
import HistoryIcon from '@mui/icons-material/History';
import GradingIcon from '@mui/icons-material/Grading';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useAuth } from '@/contexts';
import { signOut } from 'firebase/auth';
import { auth } from '@/configs/firebase-config';
import { useRouter } from 'next/navigation';

const drawerWidth = 280;

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/staff/dashboard',
    },
    {
      text: 'Review Queue',
      icon: <GradingIcon />,
      path: '/staff/review-queue',
    },
    {
      text: 'Audit Log',
      icon: <HistoryIcon />,
      path: '/staff/audit-log',
    },
  ];

  const drawer = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: `linear-gradient(180deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}08 50%, transparent 100%)`,
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
            mt:8,
          p: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '100px',
            height: '100px',
            background: `radial-gradient(circle, ${alpha(theme.palette.common.white, 0.1)} 0%, transparent 70%)`,
            transform: 'translate(30px, -30px)',
          }
        }}
      >


        {/* User Info */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2,
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: 'rgba(255,255,255,0.2)',
                fontSize: 14,
              }}
            >
              <PersonIcon />
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{
                  color: 'white',
                  fontSize: '0.875rem',
                  lineHeight: 1.2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user?.displayName || 'Staff User'}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: '0.75rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'block',
                }}
              >
                {user?.email}
              </Typography>
            </Box>
            <Chip
              label="Staff"
              size="small"
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontSize: '0.7rem',
                height: 20,
              }}
            />
          </Box>
        </Paper>
      </Box>

      <Divider sx={{ borderColor: 'rgba(0,0,0,0.08)' }} />

      {/* Navigation Menu */}
      <List sx={{ px: 2, py: 2 }}>
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                LinkComponent={Link}
                href={item.path}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  position: 'relative',
                  overflow: 'hidden',
                  ...(isActive && {
                    bgcolor: `${theme.palette.primary.main}15`,
                    color: theme.palette.primary.main,
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 3,
                      bgcolor: theme.palette.primary.main,
                    },
                  }),
                  '&:hover': {
                    bgcolor: isActive
                      ? `${theme.palette.primary.main}20`
                      : `${theme.palette.action.hover}`,
                    transform: 'translateX(4px)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? theme.palette.primary.main : 'text.secondary',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.9rem',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ flexGrow: 1 }} />

      {/* Logout Section */}
      <Box sx={{ p: 2 }}>
        <Divider sx={{ mb: 2, borderColor: 'rgba(0,0,0,0.08)' }} />
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            color: 'error.main',
            '&:hover': {
              bgcolor: `${theme.palette.error.main}10`,
              transform: 'translateX(4px)',
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          <ListItemIcon sx={{ color: 'error.main', minWidth: 40 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            primaryTypographyProps={{
              fontWeight: 500,
              fontSize: '0.9rem',
            }}
          />
        </ListItemButton>

        {/* Footer */}
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography
            variant="caption"
            sx={{
              color: 'text.disabled',
              fontSize: '0.75rem',
            }}
          >
            © {new Date().getFullYear()} Staff Portal
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* Enhanced Topbar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
        }}
      >
        <Toolbar sx={{ minHeight: 70 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              mr: 2,
              display: { md: 'none' },
              bgcolor: 'rgba(255,255,255,0.1)',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.2)',
              }
            }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)',
              }}
            >
              <AdminPanelSettingsIcon />
            </Avatar>
            <Box>
              <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{
                  fontWeight: 700,
                  fontSize: '1.3rem',
                  color: 'white',
                }}
              >
                Staff Portal
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: '0.75rem',
                }}
              >
                Publication Management System
              </Typography>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Enhanced Sidebar */}
      <Box
        component="nav"
        sx={{
          width: { md: drawerWidth },
          flexShrink: { md: 0 }
        }}
        aria-label="navigation menu"
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              border: 'none',
            }
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              border: 'none',
              borderRight: `1px solid ${theme.palette.divider}`,
            }
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Enhanced Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          background: `linear-gradient(135deg, ${theme.palette.primary.main}03 0%, ${theme.palette.secondary.main}02 50%, transparent 100%)`,
        }}
      >
        {/* Toolbar spacer with enhanced height */}
        <Toolbar sx={{ minHeight: 70 }} />

        {/* Content wrapper */}
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
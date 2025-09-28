// 'use client';

// import * as React from 'react';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import {
//   AppBar, Box, CssBaseline, Divider, Drawer, IconButton, InputBase,
//   List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography,
//   Badge, Avatar, Paper
// } from '@mui/material';
// import MenuIcon from '@mui/icons-material/Menu';
// import DashboardIcon from '@mui/icons-material/Dashboard';
// import BarChartIcon from '@mui/icons-material/BarChart';
// import SearchIcon from '@mui/icons-material/Search';
// import NotificationsIcon from '@mui/icons-material/Notifications';

// const drawerWidth = 240;

// const navItems = [
//   { label: 'Dashboard', href: '/staff', icon: <DashboardIcon /> },
//   { label: 'Report', href: '/staff/report', icon: <BarChartIcon /> },
// ];

// export default function StaffLayout({ children }: { children: React.ReactNode }) {
//   const [mobileOpen, setMobileOpen] = React.useState(false);
//   const pathname = usePathname();

//   const drawer = (
//     <div>
//       {/* spacer ให้ Drawer เริ่มใต้ Topbar */}
//       <List>
//         {navItems.map((item) => {
//           const active = pathname?.startsWith(item.href);
//           return (
//             <ListItemButton
//               key={item.href}
//               component={Link}
//               href={item.href}
//               selected={active}
//             >
//               <ListItemIcon>{item.icon}</ListItemIcon>
//               <ListItemText primary={item.label} />
//             </ListItemButton>
//           );
//         })}
//       </List>
//     </div>
//   );

//   return (
//     <Box sx={{ display: 'flex' }}>
//       <CssBaseline />

//       {/* Topbar */}
//       <AppBar
//         position="fixed"
//         color="inherit"
//         elevation={0}
//         sx={(theme) => ({
//           borderBottom: `1px solid ${theme.palette.divider}`,
//           // ทำให้ AppBar อยู่เหนือ Drawer
//           zIndex: theme.zIndex.drawer + 1,
//           // เวอร์ชันเดสก์ท็อป: ขยับไปทางขวาและลดความกว้างตาม sidebar
//           ml: { sm: `${drawerWidth}px` },
//           width: { sm: `calc(100% - ${drawerWidth}px)` },
//         })}
//       >
//         <Toolbar>
//           {/* ปุ่มเปิดเมนูเฉพาะจอเล็ก */}
//           <IconButton
//             color="inherit"
//             edge="start"
//             onClick={() => setMobileOpen(!mobileOpen)}
//             sx={{ mr: 2, display: { sm: 'none' } }}
//             aria-label="open drawer"
//           >
//             <MenuIcon />
//           </IconButton>

//           <Typography
//             variant="h6"
//             noWrap
//             sx={{ display: { xs: 'none', sm: 'block' }, mr: 2 }}
//           >
//             Publication Management System
//           </Typography>

//           {/* Search */}
//           <Paper
//             component="form"
//             sx={{
//               ml: { xs: 0, sm: 2 },
//               mr: 'auto',
//               p: '2px 8px',
//               display: 'flex',
//               alignItems: 'center',
//               width: { xs: 1, sm: 480 },
//               borderRadius: 3,
//             }}
//           >
//             <SearchIcon sx={{ mr: 1 }} />
//             <InputBase fullWidth placeholder="Search publications..." />
//           </Paper>

//           <IconButton sx={{ ml: 1 }}>
//             <Badge color="error" variant="dot">
//               <NotificationsIcon />
//             </Badge>
//           </IconButton>
//           <IconButton sx={{ ml: 1 }}>
//             <Avatar sx={{ width: 32, height: 32 }}>S</Avatar>
//           </IconButton>
//         </Toolbar>
//       </AppBar>

//       {/* Sidebar */}
//       <Box
//         component="nav"
//         sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
//         aria-label="sidebar"
//       >
//         {/* Mobile drawer (ชิดซ้าย ทับหน้าจอ) */}
//         <Drawer
//           variant="temporary"
//           open={mobileOpen}
//           onClose={() => setMobileOpen(false)}
//           ModalProps={{ keepMounted: true }}
//           sx={{
//             display: { xs: 'block', sm: 'none' },
//             '& .MuiDrawer-paper': {
//               boxSizing: 'border-box',
//               width: drawerWidth,
//             },
//           }}
//         >
//           {drawer}
//         </Drawer>

//         {/* Permanent drawer (เดสก์ท็อป) */}
//         <Drawer
//           variant="permanent"
//           open
//           sx={{
//             display: { xs: 'none', sm: 'block' },
//             '& .MuiDrawer-paper': {
//               boxSizing: 'border-box',
//               width: drawerWidth,
//             },
//           }}
//         >
//           {drawer}
//         </Drawer>
//       </Box>

//       {/* Content */}
//       <Box
//         component="main"
//         sx={{
//           flexGrow: 1,
//           // เว้นที่ให้ Topbar
//           pt: 0,
//           // เว้นด้านซ้ายเท่ากับ sidebar บนเดสก์ท็อป เพื่อไม่ให้เนื้อหาไปอยู่ใต้ Drawer
//           ml: { sm: `${drawerWidth}px` },
//           // padding เนื้อหา และกันชนใต้ AppBar
//           p: { xs: 2, md: 3 },
//         }}
//       >
//         {/* Spacer ให้ content เริ่มใต้ AppBar */}
//         <Toolbar />
//         {children}
//       </Box>
//     </Box>
//   );
// }

// =============================
// File: /app/(staff)/layout.tsx
// Layout with AppBar (topbar) + Drawer (sidebar) that never collapses over content
// =============================
'use client';
import * as React from 'react';
import Link from 'next/link';
import { AppBar, Box, CssBaseline, Divider, Drawer, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import AssessmentIcon from '@mui/icons-material/Assessment';

const drawerWidth = 240;

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar>
        <Typography variant="h6" noWrap>Staff Portal</Typography>
      </Toolbar>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton LinkComponent={Link} href="/staff">
            <ListItemIcon><HomeIcon /></ListItemIcon>
            <ListItemText primary="Home" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton LinkComponent={Link} href="/staff/report">
            <ListItemIcon><AssessmentIcon /></ListItemIcon>
            <ListItemText primary="Report" />
          </ListItemButton>
        </ListItem>
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Divider />
      <Box sx={{ p: 2, color: 'text.secondary', fontSize: 12 }}>© {new Date().getFullYear()}</Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* Topbar */}
      <AppBar position="fixed" sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Staff Portal
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }} aria-label="mailbox folders">
        {/* Mobile */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }
          }}
        >
          {drawer}
        </Drawer>
        {/* Desktop */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { md: `calc(100% - ${drawerWidth}px)` } }}>
        {/* toolbar spacer ensures content starts below AppBar */}
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}


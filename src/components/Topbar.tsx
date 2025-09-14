"use client";

import { AppBar, Toolbar, Typography, Box, InputBase, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

export default function Topbar() {
  return (
    <AppBar position="sticky" sx={{ bgcolor: "white", color: "black", boxShadow: 1 }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Publication Management System
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            bgcolor: "#f5f5f5",
            px: 2,
            borderRadius: 2,
            mr: 2,
          }}
        >
          <SearchIcon />
          <InputBase placeholder="Search publications..." sx={{ ml: 1 }} />
        </Box>
        <IconButton><NotificationsIcon /></IconButton>
        <IconButton><AccountCircleIcon /></IconButton>
      </Toolbar>
    </AppBar>
  );
}

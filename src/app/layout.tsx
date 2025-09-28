"use client";

import { ReactNode } from "react";
import { CssBaseline, Box } from "@mui/material";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CssBaseline />
        <Box sx={{ display: "flex" }}>
          <Sidebar />
          <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
            <Topbar />
            <Box component="main" sx={{ p: 3 }}>
              {children}
            </Box>
          </Box>
        </Box>
      </body>
    </html>
  );
}

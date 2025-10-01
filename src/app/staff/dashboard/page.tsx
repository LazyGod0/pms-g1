// =============================
// File: /app/(staff)/report/page.tsx
// =============================
"use client";
import * as React from "react";
import {
  Box,
  Button,
  Container,
  Stack,
  Typography,
  Avatar,
  Paper,
  Card,
  CardContent,
  Fade,
  Chip,
} from "@mui/material";
import GetAppIcon from "@mui/icons-material/GetApp";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import {
  ReportFilters,
  fetchPublications,
} from "@/libs/StaffReport/dataSource";
import {
  ReportFilters as Filters,
  FiltersState,
} from "@/components/StaffReport/ReportFilters";
import { StatCard } from "@/components/StaffReport/StatCard";
import {
  PublicationsByType,
  PublicationsByYear,
  PublicationsByLevel,
} from "@/components/StaffReport/Charts";
import { PublicationsTable } from "@/components/StaffReport/PublicationsTable";
import { exportCSV, exportPDF } from "@/components/StaffReport/export";

function DashboardContent() {
  const { user } = useAuth();
  const router = useRouter();

  const [filters, setFilters] = React.useState<FiltersState>({
    yearFrom: new Date(Date.now()).getFullYear() - 5,
    yearTo: new Date(Date.now()).getFullYear(),
    type: "All",
    level: "All",
  });

  const [rows, setRows] = React.useState(
    [] as Awaited<ReturnType<typeof fetchPublications>>
  );

  const reload = React.useCallback(async () => {
    let data = await fetchPublications(filters as ReportFilters);

    // กรองออก เหลือแค่ Approved / Rejected
    data = data.filter((r) => {
      const status = r.status?.toLowerCase();
      return status === "approved" || status === "rejected";
    });
    console.log(data);
    setRows(data);
  }, [filters]);

  React.useEffect(() => {
    reload();
  }, [reload]);

  // Stats calculations
  const total = rows.length;
  const journals = rows.filter((r) => r.type === "Journal").length;
  const conferences = rows.filter((r) => r.type === "Conference").length;
  const intl = rows.filter((r) => r.level === "International").length;
  const natl = rows.filter((r) => r.level === "National").length;
  const approved = rows.filter(
    (r) => r.status.toLowerCase() === "approved"
  ).length;
  const rejected = rows.filter(
    (r) => r.status.toLowerCase() === "rejected"
  ).length;

  // Normalize rows for table & export
  const normalizedRows = rows.map((r) => ({
    ...r,
    authors: (r.authors ?? []).map((a) =>
      typeof a === "string" ? a : a?.name ?? ""
    ),
  }));

  const handleProfileEdit = () => {
    router.push("/profile");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: (theme) =>
          `linear-gradient(135deg, ${theme.palette.primary.main}08 0%, ${theme.palette.secondary.main}05 50%, transparent 100%)`,
        py: 3,
      }}
    >
      <Container maxWidth="xl">
        <Fade in={true} timeout={800}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 4 },
              mb: 3,
              borderRadius: 4,
              background: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.06)",
            }}
          >
            <Stack
              direction={{ xs: "column", lg: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", lg: "center" }}
              spacing={3}
            >
              {/* Header Section */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar
                  sx={{
                    width: 56,
                    height: 56,
                    background: (theme) =>
                      `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
                  }}
                >
                  <DashboardIcon sx={{ fontSize: 28 }} />
                </Avatar>
                <Box>
                  <Typography
                    variant="h4"
                    fontWeight={800}
                    sx={{
                      background: (theme) =>
                        `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      color: "transparent",
                      mb: 0.5,
                    }}
                  >
                    Staff Dashboard
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <AnalyticsIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                    <Typography color="text.secondary" variant="body2">
                      Publications Analytics & Export Center
                    </Typography>
                  </Stack>
                  <Chip
                    label={`Welcome, ${user?.displayName || "Staff User"}`}
                    size="small"
                    sx={{
                      mt: 1,
                      bgcolor: "primary.main",
                      color: "white",
                      fontWeight: 600,
                    }}
                  />
                </Box>
              </Box>

              {/* Action Buttons */}
              <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                <Button
                  variant="outlined"
                  startIcon={<GetAppIcon />}
                  onClick={() => exportCSV(normalizedRows as any)}
                  sx={{
                    borderRadius: 3,
                    borderWidth: 2,
                    fontWeight: 600,
                    px: 3,
                    "&:hover": {
                      borderWidth: 2,
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
                    },
                    transition: "all 0.3s ease-in-out",
                  }}
                >
                  Export CSV
                </Button>

                <Button
                  variant="contained"
                  startIcon={<PictureAsPdfIcon />}
                  onClick={() =>
                    exportPDF(
                      normalizedRows as any,
                      {
                        total,
                        journals,
                        conferences,
                        approved,
                        rejected,
                        intl,
                        natl,
                      },
                      filters
                    )
                  }
                  sx={{
                    borderRadius: 3,
                    fontWeight: 600,
                    px: 3,
                    background: (theme) =>
                      `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.dark} 90%)`,
                    boxShadow: "0 4px 20px rgba(25, 118, 210, 0.3)",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 30px rgba(25, 118, 210, 0.4)",
                      background: (theme) =>
                        `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.main} 90%)`,
                    },
                    transition: "all 0.3s ease-in-out",
                  }}
                >
                  Export PDF
                </Button>

                <Button
                  variant="outlined"
                  startIcon={
                    <Avatar
                      sx={{
                        width: 24,
                        height: 24,
                        bgcolor: "primary.main",
                      }}
                    >
                      <PersonIcon sx={{ fontSize: 14 }} />
                    </Avatar>
                  }
                  endIcon={<SettingsIcon />}
                  onClick={handleProfileEdit}
                  sx={{
                    borderRadius: 3,
                    borderWidth: 2,
                    fontWeight: 600,
                    px: 3,
                    borderColor: "primary.main",
                    color: "primary.main",
                    "&:hover": {
                      borderWidth: 2,
                      bgcolor: "primary.main",
                      color: "white",
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 25px rgba(25, 118, 210, 0.3)",
                    },
                    transition: "all 0.3s ease-in-out",
                  }}
                >
                  แก้ไขโปรไฟล์
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Fade>

        {/* Filters Section */}
        <Fade in={true} timeout={1000}>
          <Card
            elevation={0}
            sx={{
              mb: 3,
              borderRadius: 3,
              background: "rgba(255, 255, 255, 0.7)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Filters
                value={filters}
                onChange={setFilters}
                onClear={() =>
                  setFilters({
                    yearFrom: 2020,
                    yearTo: 2024,
                    type: "All",
                    level: "All",
                  })
                }
              />
            </CardContent>
          </Card>
        </Fade>

        {/* Stats section */}
        <Fade in={true} timeout={1200}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)", lg: "repeat(5, 1fr)" },
              gap: 3,
              mb: 4,
            }}
          >
            <StatCard label="Total Publications" value={total} />
            <StatCard label="Journal Articles" value={journals} />
            <StatCard label="Conference Papers" value={conferences} />
            <StatCard label="Approved" value={approved} />
            <StatCard label="Rejected" value={rejected} />
          </Box>
        </Fade>

        {/* Charts section */}
        <Fade in={true} timeout={1400}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
              gap: 3,
              mb: 4,
            }}
          >
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                background: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.06)",
                overflow: "hidden",
              }}
            >
              <PublicationsByYear data={normalizedRows as any} />
            </Card>

            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                background: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.06)",
                overflow: "hidden",
              }}
            >
              <PublicationsByType data={normalizedRows as any} />
            </Card>

            <Card
              elevation={0}
              sx={{
                gridColumn: { xs: "1", lg: "1 / -1" },
                borderRadius: 3,
                background: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.06)",
                overflow: "hidden",
              }}
            >
              <PublicationsByLevel data={normalizedRows as any} />
            </Card>
          </Box>
        </Fade>

        {/* Publications Table */}
        <Fade in={true} timeout={1600}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(15px)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              boxShadow: "0 12px 40px rgba(0, 0, 0, 0.08)",
              overflow: "hidden",
            }}
          >
            <PublicationsTable rows={normalizedRows as any} />
          </Card>
        </Fade>
      </Container>
    </Box>
  );
}

export default function StaffDashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

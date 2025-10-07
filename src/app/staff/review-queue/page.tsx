"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Grid,
  InputAdornment,
  Tooltip,
  Skeleton,
  Avatar,
  Divider,
  Container,
  IconButton,
  Stack,
} from "@mui/material";
import {
  Search as SearchIcon,
  Clear,
  Description as DescriptionIcon,
  PendingActions as PendingIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Assessment as AssessmentIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterIcon,
  Article as ArticleIcon,
  AttachFile as AttachFileIcon,
  GetApp as GetAppIcon,
} from "@mui/icons-material";

// Firestore & Storage
import { db } from "@/configs/firebase-config";
import { collectionGroup, getDocs } from "firebase/firestore";

// Next.js Router
import { useRouter } from "next/navigation";

// Types
interface Author {
  name: string;
  role: string;
}

interface FileAttachment {
  name: string;
  url: string;
}

interface Publication {
  id: string;
  uid: string;
  sid: string;
  title: string;
  abstract: string;
  year: string;
  type: string;
  level: string;
  keywords: string[];
  authors: Author[];
  submitter: string;
  files: FileAttachment[];
  doi: string;
  references: string[];
  submitted: string;
  status: string;
}

const StaffDashboard = () => {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedLevel, setSelectedLevel] = useState("All Levels");
  const [activeTab, setActiveTab] = useState(0);
  const [mounted, setMounted] = useState(false);

  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);

  // โหลดข้อมูลจาก Firestore
  useEffect(() => {
    setMounted(true);

    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collectionGroup(db, "submissions"));
        const pubs: Publication[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const pathParts = doc.ref.path.split("/");
          const uid = pathParts[1]; // users/{uid}
          const sid = pathParts[3]; // submissions/{sid}

          // แปลงข้อมูลไฟล์แนบให้ถูกต้อง
          const files = Array.isArray(data?.attachments?.files)
            ? data.attachments.files
                .filter((file: any) => file?.url && file.url.trim() !== "") // กรองเฉพาะไฟล์ที่มี URL
                .map((file: any) => ({
                  name: file?.name || "ไฟล์ไม่ระบุชื่อ",
                  url: file.url,
                }))
            : [];

          pubs.push({
            id: doc.id,
            uid,
            sid,
            title: data?.basics?.title || "Untitled",
            abstract: data?.basics?.abstract || "",
            year: data?.basics?.year || "-",
            type: data?.basics?.type || "Unknown",
            level: data?.basics?.level || "Unknown",
            keywords: data?.keywords || [],
            authors: data?.authors || [],
            submitter: data?.authors?.[0]?.name || "Unknown",
            files: files,
            doi: data?.identifiers?.doi || "",
            references: data?.references || [],
            submitted: data?.submittedAt
              ? new Date(data.submittedAt.seconds * 1000).toLocaleString()
              : "N/A",
            status: data?.status || "draft",
          });
        });

        setPublications(pubs);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleOpenFile = async (fileUrl: string, fileName: string) => {
    try {
      // Basic URL validation
      if (!fileUrl || fileUrl.trim() === '' || fileUrl === 'undefined' || fileUrl === 'null') {
        alert(`ไฟล์ "${fileName}" ไม่มี URL ที่ถูกต้อง\nกรุณาติดต่อผู้ดูแลระบบ`);
        return;
      }

      // Check if URL looks valid
      try {
        new URL(fileUrl);
      } catch {
        alert(`ไฟล์ "${fileName}" มี URL ที่ไม่ถูกต้อง\nกรุณาติดต่อผู้ดูแลระบบ`);
        return;
      }

      // For Firebase Storage URLs, try direct access without validation
      // The browser will handle the error if file doesn't exist
      console.log(`Opening file: ${fileName} at ${fileUrl}`);

      // Try to open the file directly
      const newWindow = window.open(fileUrl, "_blank", "noopener,noreferrer");

      // Check if popup was blocked
      if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
        // Fallback: try direct navigation
        try {
          const link = document.createElement('a');
          link.href = fileUrl;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (linkError) {
          alert(`ไม่สามารถเปิดไฟล์ "${fileName}" ได้\nกรุณาลองใหม่อีกครั้ง`);
        }
      }

    } catch (error) {
      console.error("Error opening file:", error);
      alert(`เกิดข้อผิดพลาดในการเปิดไฟล์ "${fileName}"\nกรุณาลองใหม่อีกครั้ง`);
    }
  };

  const handleReview = (uid: string, sid: string) => {
    router.push(`/staff/review/${uid}/${sid}`);
  };

  const filteredPublications = useMemo(() => {
    return publications.filter((pub) => {
      const status = pub.status?.toLowerCase() || "draft";
      const matchesSearch =
        searchTerm === "" ||
        pub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pub.submitter.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType =
        selectedType === "All Types" || pub.type === selectedType;
      const matchesLevel =
        selectedLevel === "All Levels" || pub.level === selectedLevel;
      let matchesTab = false;
      if (activeTab === 0) matchesTab = status === "submitted";
      if (activeTab === 1) matchesTab = status === "rejected";
      if (activeTab === 2) matchesTab = status === "approved";
      if (activeTab === 3)
        matchesTab = ["submitted", "rejected", "approved"].includes(status);

      return matchesSearch && matchesType && matchesTab && matchesLevel;
    });
  }, [searchTerm, selectedType, selectedLevel, activeTab, publications]);

  const dynamicStats = useMemo(() => {
    const getStatus = (p: Publication) => p.status?.toLowerCase() || "draft";
    const pendingReview = publications.filter(
      (p) => getStatus(p) === "submitted"
    ).length;
    const needsFix = publications.filter(
      (p) => getStatus(p) === "rejected"
    ).length;
    const approved = publications.filter(
      (p) => getStatus(p) === "approved"
    ).length;
    const totalReviews = publications.filter((p) =>
      ["submitted", "rejected", "approved"].includes(getStatus(p))
    ).length;

    return { pendingReview, needsFix, approved, totalReviews };
  }, [publications]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedType("All Types");
    setSelectedLevel("All Levels");
  };

  // Define stats with enhanced styling
  const statsConfig = [
    {
      label: "Pending Review",
      value: dynamicStats.pendingReview,
      icon: <PendingIcon />,
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "#667eea",
    },
    {
      label: "Needs Fix",
      value: dynamicStats.needsFix,
      icon: <ErrorIcon />,
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      color: "#f5576c",
    },
    {
      label: "Approved",
      value: dynamicStats.approved,
      icon: <CheckCircleIcon />,
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      color: "#00f2fe",
    },
    {
      label: "Total Reviews",
      value: dynamicStats.totalReviews,
      icon: <AssessmentIcon />,
      gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      color: "#43e97b",
    },
  ];

  if (!mounted) return null;

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* Header Section */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: 3,
            p: 4,
            mb: 4,
            color: "white",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              right: 0,
              width: "200px",
              height: "200px",
              background: "rgba(255,255,255,0.1)",
              borderRadius: "50%",
              transform: "translate(50%, -50%)",
            },
          }}
        >
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Typography variant="h3" sx={{ fontWeight: "bold", mb: 1 }}>
              📋 Review Queue
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Manage and review publication submissions
            </Typography>
          </Box>
        </Box>

        {/* Enhanced Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statsConfig.map((stat, i) => (
            <Grid key={i} item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  cursor: "pointer",
                  background: stat.gradient,
                  color: "white",
                  border: "none",
                  borderRadius: 3,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                  },
                  position: "relative",
                  overflow: "hidden",
                }}
                onClick={() => setActiveTab(i)}
              >
                <CardContent sx={{ p: 3 }}>
                  {loading ? (
                    <>
                      <Skeleton width="60%" sx={{ bgcolor: "rgba(255,255,255,0.3)" }} />
                      <Skeleton width="40%" height={40} sx={{ bgcolor: "rgba(255,255,255,0.3)" }} />
                    </>
                  ) : (
                    <>
                      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: "rgba(255,255,255,0.2)",
                            color: "white",
                            mr: 2,
                          }}
                        >
                          {stat.icon}
                        </Avatar>
                        <Typography variant="h6" sx={{ fontWeight: "600" }}>
                          {stat.label}
                        </Typography>
                      </Box>
                      <Typography variant="h2" sx={{ fontWeight: "bold" }}>
                        {stat.value}
                      </Typography>
                    </>
                  )}
                </CardContent>
                <Box
                  sx={{
                    position: "absolute",
                    top: -20,
                    right: -20,
                    width: 80,
                    height: 80,
                    background: "rgba(255,255,255,0.1)",
                    borderRadius: "50%",
                  }}
                />
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Enhanced Search & Filters */}
        <Card
          sx={{
            mb: 4,
            borderRadius: 3,
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
            overflow: "hidden",
          }}
        >
          <Paper
            sx={{
              background: "linear-gradient(90deg, #f8f9fa 0%, #e9ecef 100%)",
              p: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <FilterIcon sx={{ mr: 2, color: "primary.main" }} />
              <Typography variant="h6" sx={{ fontWeight: "600" }}>
                Search & Filters
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 2,
                alignItems: "stretch",
              }}
            >
              <TextField
                placeholder="Search by title or submitter..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="primary" />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  flexGrow: 1,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    backgroundColor: "white",
                  },
                }}
              />
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Publication Type</InputLabel>
                <Select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  sx={{
                    borderRadius: 2,
                    backgroundColor: "white",
                  }}
                >
                  <MenuItem value="All Types">🔍 All Types</MenuItem>
                  <MenuItem value="Journal">📰 Journal</MenuItem>
                  <MenuItem value="Conference">🎯 Conference</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Level</InputLabel>
                <Select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  sx={{
                    borderRadius: 2,
                    backgroundColor: "white",
                  }}
                >
                  <MenuItem value="All Levels">🌐 All Levels</MenuItem>
                  <MenuItem value="National">🏠 National</MenuItem>
                  <MenuItem value="International">🌍 International</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                startIcon={<Clear />}
                onClick={clearFilters}
                sx={{
                  borderRadius: 2,
                  backgroundColor: "white",
                  "&:hover": {
                    backgroundColor: "primary.main",
                    color: "white",
                  },
                }}
              >
                Clear
              </Button>
            </Box>
          </Paper>

          <Divider />

          {/* Enhanced Tabs */}
          <Tabs
            value={activeTab}
            onChange={(e, val) => setActiveTab(val)}
            sx={{
              px: 3,
              "& .MuiTab-root": {
                fontWeight: "600",
                textTransform: "none",
                fontSize: "1rem",
              },
            }}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              label={`⏳ Pending Review (${dynamicStats.pendingReview})`}
              sx={{ color: "#667eea" }}
            />
            <Tab
              label={`🔄 Needs Fix (${dynamicStats.needsFix})`}
              sx={{ color: "#f5576c" }}
            />
            <Tab
              label={`✅ Completed (${dynamicStats.approved})`}
              sx={{ color: "#00f2fe" }}
            />
            <Tab
              label={`📊 All Reviews (${dynamicStats.totalReviews})`}
              sx={{ color: "#43e97b" }}
            />
          </Tabs>

          <Divider />

          {/* Enhanced Table */}
          <TableContainer sx={{ overflowX: "auto" }}>
            {loading ? (
              <Box sx={{ p: 4 }}>
                {[...Array(5)].map((_, i) => (
                  <Skeleton
                    key={i}
                    variant="rectangular"
                    height={60}
                    sx={{ mb: 2, borderRadius: 2 }}
                  />
                ))}
              </Box>
            ) : filteredPublications.length === 0 ? (
              <Box sx={{ p: 8, textAlign: "center" }}>
                <ArticleIcon sx={{ fontSize: 80, color: "grey.300", mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No publications found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try adjusting your search criteria
                </Typography>
              </Box>
            ) : (
              <Table>
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor: "#f8f9fa",
                      "& .MuiTableCell-head": {
                        fontWeight: "bold",
                        color: "text.primary",
                      },
                    }}
                  >
                    <TableCell>📄 Title</TableCell>
                    <TableCell>👥 Authors</TableCell>
                    <TableCell>🏷️ Type/Level</TableCell>
                    <TableCell>📅 Year</TableCell>
                    <TableCell>⏰ Submitted</TableCell>
                    <TableCell>🔖 Status</TableCell>
                    <TableCell>📎 Files</TableCell>
                    <TableCell>⚡ Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPublications.map((pub, pubIdx) => (
                    <TableRow
                      key={pubIdx}
                      sx={{
                        "&:hover": {
                          backgroundColor: "rgba(103, 126, 234, 0.04)",
                        },
                        borderBottom: "1px solid #f0f0f0",
                      }}
                    >
                      <TableCell sx={{ maxWidth: 300 }}>
                        <Typography fontWeight={600} sx={{ mb: 1 }}>
                          {pub.title}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {pub.abstract}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {pub.authors.slice(0, 2).map((a: Author, i: number) => (
                          <Box key={i} sx={{ mb: 0.5, display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography variant="body2" component="span">
                              {a.name}
                            </Typography>
                            <Chip
                              label={a.role}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: "0.7rem", height: 20 }}
                            />
                          </Box>
                        ))}
                        {pub.authors.length > 2 && (
                          <Typography variant="caption" color="text.secondary">
                            +{pub.authors.length - 2} more
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Chip
                            label={pub.type}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ mb: 1, display: "block", width: "fit-content" }}
                          />
                          <Chip
                            label={pub.level}
                            size="small"
                            color="secondary"
                            variant="outlined"
                            sx={{ display: "block", width: "fit-content" }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {pub.year}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{pub.submitted}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={pub.status}
                          size="small"
                          color={
                            pub.status?.toLowerCase() === "approved"
                              ? "success"
                              : pub.status?.toLowerCase() === "rejected"
                              ? "error"
                              : pub.status?.toLowerCase() === "submitted"
                              ? "warning"
                              : "default"
                          }
                          sx={{ fontWeight: "600" }}
                        />
                      </TableCell>
                      <TableCell>
                        {pub.files && pub.files.length > 0 ? (
                          <Stack spacing={0.5}>
                            {pub.files.slice(0, 2).map((file, index) => (
                              <Stack
                                key={`${file.name}-${index}`}
                                direction="row"
                                spacing={1}
                                alignItems="center"
                              >
                                <AttachFileIcon
                                  fontSize="small"
                                  color="primary"
                                />
                                <Typography
                                  variant="body2"
                                  component="span"
                                  sx={{
                                    color: 'primary.main',
                                    fontWeight: 600,
                                    maxWidth: 120,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    cursor: 'pointer',
                                    '&:hover': {
                                      textDecoration: 'underline',
                                      color: 'primary.dark',
                                    }
                                  }}
                                  title={file.name}
                                  onClick={() => handleOpenFile(file.url, file.name)}
                                >
                                  {file.name}
                                </Typography>
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenFile(file.url, file.name)}
                                  sx={{
                                    p: 0.5,
                                    '&:hover': {
                                      bgcolor: 'primary.main',
                                      color: 'white',
                                    }
                                  }}
                                  title="เปิดไฟล์"
                                >
                                  <GetAppIcon fontSize="small" />
                                </IconButton>
                              </Stack>
                            ))}
                            {pub.files.length > 2 && (
                              <Typography variant="caption" color="text.secondary">
                                +{pub.files.length - 2} ไฟล์เพิ่มเติม
                              </Typography>
                            )}
                          </Stack>
                        ) : (
                          <Typography color="text.disabled" variant="body2">
                            ไม่มีไฟล์
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<VisibilityIcon />}
                          disabled={pub.status?.toLowerCase() !== "submitted"}
                          onClick={() => handleReview(pub.uid, pub.sid)}
                          sx={{
                            borderRadius: 2,
                            textTransform: "none",
                            fontWeight: "600",
                            "&:disabled": {
                              opacity: 0.5,
                            },
                          }}
                        >
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TableContainer>
        </Card>
      </Box>
    </Container>
  );
};

export default StaffDashboard;

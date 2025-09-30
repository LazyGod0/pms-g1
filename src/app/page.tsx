"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Publication, SearchFiltersType } from "@/types/publication";
import { downloadFile } from "@/utils/storage";

/* MUI */
import {
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Pagination,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  Button,
  Paper,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
} from "@mui/material";

/* MUI Icons */
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import TableRowsRoundedIcon from "@mui/icons-material/TableRowsRounded";
import AutoStoriesOutlinedIcon from "@mui/icons-material/AutoStoriesOutlined";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import LoginIcon from "@mui/icons-material/Login";
import SchoolIcon from "@mui/icons-material/School";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import CloseIcon from "@mui/icons-material/Close";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import DownloadIcon from "@mui/icons-material/Download";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";

/* -------------------------------------------------
   API Functions
------------------------------------------------- */
const fetchPublications = async (): Promise<Publication[]> => {
  try {
    const response = await fetch("/api/publications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(result);
    if (!result.success) {
      throw new Error(result.message || "Failed to fetch publications");
    }

    return result.data || [];
  } catch (error) {
    console.error("Error fetching publications:", error);
    throw error;
  }
};

/* -------------------------------------------------
   Small UI Pieces
------------------------------------------------- */
function PublicationDetailModal({
  publication,
  open,
  onClose,
}: {
  publication: Publication | null;
  open: boolean;
  onClose: () => void;
}) {
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);

  if (!publication) return null;

  const handleDownloadFile = async (filePath: string, fileName: string) => {
    try {
      setDownloadingFile(filePath);
      await downloadFile(filePath, fileName);
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setDownloadingFile(null);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
        >
          <Typography variant="h6" fontWeight={600} sx={{ pr: 2 }}>
            {publication.title}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          {/* Authors */}
          <Box>
            <Typography
              variant="subtitle2"
              fontWeight={600}
              gutterBottom
              color="primary"
            >
              ผู้เขียน
            </Typography>
            <Stack spacing={1}>
              {publication.authors.map((author, index) => (
                <Paper
                  key={index}
                  elevation={0}
                  sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2 }}
                >
                  <Typography variant="body2" fontWeight={500}>
                    {author.name}
                  </Typography>
                  {author.affiliation && (
                    <Typography variant="caption" color="text.secondary">
                      {author.affiliation}
                    </Typography>
                  )}
                  {author.email && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      {author.email}
                    </Typography>
                  )}
                </Paper>
              ))}
            </Stack>
          </Box>

          {/* Publication Details */}
          <Box>
            <Typography
              variant="subtitle2"
              fontWeight={600}
              gutterBottom
              color="primary"
            >
              รายละเอียดการตีพิมพ์
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mb: 2 }}>
              <Chip label={`ปี ${publication.year}`} />
              <Chip
                label={publication.type}
                color={publication.type === "Journal" ? "primary" : "secondary"}
                variant="outlined"
              />
              <Chip
                label={publication.level}
                color={
                  publication.level === "International" ? "success" : "default"
                }
                variant="outlined"
              />
              <Chip
                label={publication.status}
                color={
                  publication.status === "published"
                    ? "success"
                    : publication.status === "approved"
                    ? "info"
                    : publication.status === "rejected"
                    ? "error"
                    : "default"
                }
                variant="outlined"
              />
            </Stack>
          </Box>

          {/* Abstract */}
          {publication.abstract && (
            <Box>
              <Typography
                variant="subtitle2"
                fontWeight={600}
                gutterBottom
                color="primary"
              >
                บทคัดย่อ
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                {publication.abstract}
              </Typography>
            </Box>
          )}

          {/* Keywords */}
          {publication.keywords.length > 0 && (
            <Box>
              <Typography
                variant="subtitle2"
                fontWeight={600}
                gutterBottom
                color="primary"
              >
                คำสำคัญ
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {publication.keywords.map((keyword, index) => (
                  <Chip
                    key={index}
                    label={keyword}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Stack>
            </Box>
          )}

          {/* Attachments */}
          {publication.attachments && publication.attachments.length > 0 && (
            <Box>
              <Typography
                variant="subtitle2"
                fontWeight={600}
                gutterBottom
                color="primary"
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <AttachFileIcon sx={{ fontSize: 16 }} />
                ไฟล์แนบ ({publication.attachments.length} ไฟล์)
              </Typography>
              <Paper elevation={0} sx={{ bgcolor: "grey.50", borderRadius: 2 }}>
                <List dense>
                  {publication.attachments.map((attachment, index) => (
                    <ListItem
                      key={index}
                      divider={index < publication.attachments.length - 1}
                      sx={{ py: 1.5 }}
                    >
                      <ListItemIcon>
                        <InsertDriveFileIcon color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight={500}>
                            {attachment.name}
                          </Typography>
                        }
                        secondary={
                          <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                            {attachment.size && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {(attachment.size / 1024 / 1024).toFixed(2)} MB
                              </Typography>
                            )}
                            {attachment.type && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {attachment.type}
                              </Typography>
                            )}
                          </Stack>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Tooltip title="ดาวน์โหลดไฟล์">
                          <IconButton
                            edge="end"
                            onClick={() =>
                              handleDownloadFile(
                                attachment.path!,
                                attachment.name
                              )
                            }
                            disabled={
                              !attachment.path ||
                              downloadingFile === attachment.path
                            }
                            size="small"
                            sx={{
                              bgcolor: "primary.main",
                              color: "white",
                              "&:hover": {
                                bgcolor: "primary.dark",
                              },
                              "&:disabled": {
                                bgcolor: "grey.300",
                                color: "grey.500",
                              },
                            }}
                          >
                            {downloadingFile === attachment.path ? (
                              <CircularProgress size={16} color="inherit" />
                            ) : (
                              <DownloadIcon fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Box>
          )}

          {/* DOI and URL */}
          {(publication.doi || publication.url) && (
            <Box>
              <Typography
                variant="subtitle2"
                fontWeight={600}
                gutterBottom
                color="primary"
              >
                ลิงก์และข้อมูลอ้างอิง
              </Typography>
              <Stack spacing={1}>
                {publication.doi && (
                  <Typography variant="body2">
                    <strong>DOI:</strong> {publication.doi}
                  </Typography>
                )}
                {publication.url && (
                  <Typography variant="body2">
                    <strong>URL:</strong>
                    <Button
                      href={publication.url}
                      target="_blank"
                      size="small"
                      sx={{ ml: 1 }}
                    >
                      เปิดลิงก์
                    </Button>
                  </Typography>
                )}
              </Stack>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          ปิด
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function PublicationCard({
  publication,
  onView,
}: {
  publication: Publication;
  onView: (publication: Publication) => void;
}) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        "&:hover": { boxShadow: 4, transform: "translateY(-1px)" },
        transition: "all .2s",
      }}
    >
      <CardContent>
        <Stack spacing={1.2}>
          <Typography variant="subtitle1" fontWeight={700}>
            {publication.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {publication.authors.map((author) => author.name).join(", ")}
          </Typography>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            flexWrap="wrap"
          >
            <Chip size="small" label={publication.year} />
            <Chip
              size="small"
              label={publication.type}
              color={publication.type === "Journal" ? "primary" : "secondary"}
              variant="outlined"
            />
            <Chip
              size="small"
              label={publication.level}
              color={
                publication.level === "International" ? "success" : "default"
              }
              variant="outlined"
            />
            {publication.attachments && publication.attachments.length > 0 && (
              <Chip
                size="small"
                icon={<AttachFileIcon />}
                label={`${publication.attachments.length} ไฟล์`}
                variant="outlined"
                color="info"
              />
            )}
          </Stack>
          <Box>
            <Button
              variant="contained"
              size="small"
              onClick={() => onView(publication)}
              sx={{ borderRadius: 2, mt: 0.5 }}
            >
              View
            </Button>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function PublicationTable({
  publications,
  onView,
}: {
  publications: Publication[];
  onView: (publication: Publication) => void;
}) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 0 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 700, width: 220 }}>
                Authors
              </TableCell>
              <TableCell sx={{ fontWeight: 700, width: 80 }}>Year</TableCell>
              <TableCell sx={{ fontWeight: 700, width: 120 }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 700, width: 140 }}>Level</TableCell>
              <TableCell sx={{ fontWeight: 700, width: 80 }}>Files</TableCell>
              <TableCell sx={{ fontWeight: 700, width: 100 }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {publications.map((p) => (
              <TableRow key={p.id} hover>
                <TableCell>{p.title}</TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {p.authors.map((author) => author.name).join(", ")}
                  </Typography>
                </TableCell>
                <TableCell>{p.year}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={p.type}
                    color={p.type === "Journal" ? "primary" : "secondary"}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={p.level}
                    color={p.level === "International" ? "success" : "default"}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  {p.attachments && p.attachments.length > 0 && (
                    <Chip
                      size="small"
                      icon={<AttachFileIcon />}
                      label={p.attachments.length}
                      variant="outlined"
                      color="info"
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => onView(p)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {publications.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">
                    No Publications
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------
   Main Page Component - Keep your existing implementation
------------------------------------------------- */
export default function PublicHomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialKeyword = useMemo(
    () => searchParams.get("q") ?? "",
    [searchParams]
  );
  const [filters, setFilters] = useState<SearchFiltersType>({
    keyword: initialKeyword,
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [currentPage, setCurrentPage] = useState(1);
  const [allPublications, setAllPublications] = useState<Publication[]>([]);
  const [searchResults, setSearchResults] = useState<Publication[]>([]);
  const [selectedPublication, setSelectedPublication] =
    useState<Publication | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 12;

  // Fetch publications from API
  useEffect(() => {
    const loadPublications = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchPublications();
        setAllPublications(data);
        setSearchResults(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการโหลดข้อมูล"
        );
        setAllPublications([]);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    loadPublications();
  }, []);

  // Search functionality
  const searchPublications = (filters: SearchFiltersType): Publication[] => {
    const keyword = filters.keyword?.toLowerCase().trim();
    return allPublications.filter(
      (p) =>
        !keyword ||
        p.title.toLowerCase().includes(keyword) ||
        p.authors.some((a) => a.name.toLowerCase().includes(keyword)) ||
        p.keywords.some((k) => k.toLowerCase().includes(keyword))
    );
  };

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const kw = (filters.keyword ?? "").trim();
    if (kw.length > 0) params.set("q", kw);
    else params.delete("q");
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [filters.keyword, router, searchParams]);

  useEffect(() => {
    setSearchResults(searchPublications(filters));
    setCurrentPage(1);
  }, [filters, allPublications]);

  const handleSearch = () => {
    setSearchResults(searchPublications(filters));
    setCurrentPage(1);
  };

  const handleNavigate = (path: string) => router.push(path);

  const handleViewPublication = (publication: Publication) => {
    setSelectedPublication(publication);
    setDetailModalOpen(true);
  };

  const paginatedResults = searchResults.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(searchResults.length / itemsPerPage);

  const stats = {
    total: allPublications.length,
    journals: allPublications.filter((p) => p.type === "Journal").length,
    conferences: allPublications.filter((p) => p.type === "Conference").length,
    international: allPublications.filter((p) => p.level === "International")
      .length,
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "grey.50",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress size={48} />
          <Typography variant="h6" color="text.secondary">
            กำลังโหลดข้อมูล...
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      sx={(t) => ({
        position: "relative",
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${t.palette.primary.main}08 0%, ${t.palette.secondary.main}05 50%, transparent 100%)`,
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23f0f0f0" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="1.5"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          zIndex: 0,
        },
      })}
    >
      <Container maxWidth="lg" sx={{ py: 3, position: "relative", zIndex: 1 }}>
        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Header Section */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Avatar
            sx={(t) => ({
              width: 80,
              height: 80,
              mx: "auto",
              mb: 2,
              background: `linear-gradient(45deg, ${t.palette.primary.main}, ${t.palette.secondary.main})`,
              boxShadow: 4,
            })}
          >
            <SchoolIcon sx={{ fontSize: 40 }} />
          </Avatar>
          <Typography
            variant="h4"
            component="h1"
            fontWeight={700}
            gutterBottom
            sx={(t) => ({
              background: `linear-gradient(45deg, ${t.palette.primary.main}, ${t.palette.secondary.main})`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
              textShadow: "0 1px 4px rgba(0,0,0,0.1)",
              mb: 1.5,
            })}
          >
            ระบบจัดการผลงานตีพิมพ์
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: "auto", fontWeight: 500, lineHeight: 1.5 }}
          >
            ค้นพบและสำรวจผลงานวิชาการจากมหาวิทยาลัยของเรา ค้นหาผ่านวารสาร
            บทความงานประชุม และผลงานวิจัยต่างๆ
          </Typography>
        </Box>

        {/* Hero Card with Stats */}
        <Card
          variant="outlined"
          sx={{
            borderRadius: 4,
            background: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.2)",
            boxShadow: "0 6px 24px rgba(0,0,0,0.08)",
            mb: 4,
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
            <Stack spacing={3} alignItems="center" textAlign="center">
              {/* Main Title with Icon */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                <MenuBookIcon
                  sx={(t) => ({ fontSize: 32, color: t.palette.primary.main })}
                />
                <Typography
                  variant="h5"
                  fontWeight={600}
                  sx={{ color: "text.primary" }}
                >
                  Publication Management System
                </Typography>
              </Box>

              <Typography
                color="text.secondary"
                sx={{
                  maxWidth: 600,
                  fontSize: "1rem",
                  lineHeight: 1.6,
                  fontWeight: 400,
                }}
              >
                Discover and explore academic publications from our university.
                Search through journals, conference papers, and research
                outputs.
              </Typography>

              {/* Enhanced Stats Grid */}
              <Grid container spacing={2.5} sx={{ mt: 1.5, maxWidth: 900 }}>
                <Grid item xs={6} md={3}>
                  <Paper
                    elevation={0}
                    sx={(t) => ({
                      p: 2.5,
                      borderRadius: 3,
                      background: `linear-gradient(135deg, ${t.palette.primary.main}15, ${t.palette.primary.light}08)`,
                      border: `1px solid ${t.palette.primary.main}20`,
                      transition: "all 0.3s ease-in-out",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: `0 6px 20px ${t.palette.primary.main}25`,
                      },
                    })}
                  >
                    <Stack spacing={1} alignItems="center" textAlign="center">
                      <Avatar
                        sx={(t) => ({
                          width: 42,
                          height: 42,
                          bgcolor: t.palette.primary.main,
                          boxShadow: 1,
                        })}
                      >
                        <AutoStoriesOutlinedIcon sx={{ fontSize: 24 }} />
                      </Avatar>
                      <Typography
                        variant="h5"
                        fontWeight={700}
                        sx={{ color: "primary.main" }}
                      >
                        {stats.total}
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color="text.secondary"
                      >
                        ผลงานทั้งหมด
                      </Typography>
                    </Stack>
                  </Paper>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Paper
                    elevation={0}
                    sx={(t) => ({
                      p: 2.5,
                      borderRadius: 3,
                      background: `linear-gradient(135deg, ${t.palette.success.main}15, ${t.palette.success.light}08)`,
                      border: `1px solid ${t.palette.success.main}20`,
                      transition: "all 0.3s ease-in-out",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: `0 6px 20px ${t.palette.success.main}25`,
                      },
                    })}
                  >
                    <Stack spacing={1} alignItems="center" textAlign="center">
                      <Avatar
                        sx={(t) => ({
                          width: 42,
                          height: 42,
                          bgcolor: t.palette.success.main,
                          boxShadow: 1,
                        })}
                      >
                        <EmojiEventsOutlinedIcon sx={{ fontSize: 24 }} />
                      </Avatar>
                      <Typography
                        variant="h5"
                        fontWeight={700}
                        sx={{ color: "success.main" }}
                      >
                        {stats.international}
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color="text.secondary"
                      >
                        ระดับนานาชาติ
                      </Typography>
                    </Stack>
                  </Paper>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Paper
                    elevation={0}
                    sx={(t) => ({
                      p: 2.5,
                      borderRadius: 3,
                      background: `linear-gradient(135deg, ${t.palette.info.main}15, ${t.palette.info.light}08)`,
                      border: `1px solid ${t.palette.info.main}20`,
                      transition: "all 0.3s ease-in-out",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: `0 6px 20px ${t.palette.info.main}25`,
                      },
                    })}
                  >
                    <Stack spacing={1} alignItems="center" textAlign="center">
                      <Avatar
                        sx={(t) => ({
                          width: 42,
                          height: 42,
                          bgcolor: t.palette.info.main,
                          boxShadow: 1,
                        })}
                      >
                        <TrendingUpRoundedIcon sx={{ fontSize: 24 }} />
                      </Avatar>
                      <Typography
                        variant="h5"
                        fontWeight={700}
                        sx={{ color: "info.main" }}
                      >
                        {stats.journals}
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color="text.secondary"
                      >
                        วารสาร
                      </Typography>
                    </Stack>
                  </Paper>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Paper
                    elevation={0}
                    sx={(t) => ({
                      p: 2.5,
                      borderRadius: 3,
                      background: `linear-gradient(135deg, ${t.palette.secondary.main}15, ${t.palette.secondary.light}08)`,
                      border: `1px solid ${t.palette.secondary.main}20`,
                      transition: "all 0.3s ease-in-out",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: `0 6px 20px ${t.palette.secondary.main}25`,
                      },
                    })}
                  >
                    <Stack spacing={1} alignItems="center" textAlign="center">
                      <Avatar
                        sx={(t) => ({
                          width: 42,
                          height: 42,
                          bgcolor: t.palette.secondary.main,
                          boxShadow: 1,
                        })}
                      >
                        <GroupOutlinedIcon sx={{ fontSize: 24 }} />
                      </Avatar>
                      <Typography
                        variant="h5"
                        fontWeight={700}
                        sx={{ color: "secondary.main" }}
                      >
                        {stats.conferences}
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color="text.secondary"
                      >
                        งานประชุม
                      </Typography>
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>

              {/* Enhanced Login Button */}
              <Button
                variant="contained"
                size="large"
                startIcon={<LoginIcon />}
                onClick={() => handleNavigate("/login")}
                sx={{
                  mt: 3,
                  py: 1.5,
                  px: 3.5,
                  borderRadius: 3,
                  fontSize: "1rem",
                  fontWeight: 700,
                  textTransform: "none",
                  background: (t) =>
                    `linear-gradient(45deg, ${t.palette.primary.main} 30%, ${t.palette.primary.dark} 90%)`,
                  boxShadow: "0 4px 16px rgba(25, 118, 210, 0.35)",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 24px rgba(25, 118, 210, 0.5)",
                    background: (t) =>
                      `linear-gradient(45deg, ${t.palette.primary.dark} 30%, ${t.palette.primary.main} 90%)`,
                  },
                  transition: "all 0.3s ease-in-out",
                }}
              >
                เข้าสู่ระบบเพื่อจัดการผลงาน
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Enhanced Search & Controls */}
        <Card
          variant="outlined"
          sx={{
            mt: 4,
            borderRadius: 4,
            background: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.2)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              gap={2}
              alignItems="center"
            >
              <TextField
                fullWidth
                placeholder="ค้นหาผลงานตีพิมพ์..."
                value={filters.keyword ?? ""}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, keyword: e.target.value }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    backgroundColor: "rgba(0,0,0,0.02)",
                    "&:hover": {
                      backgroundColor: "rgba(0,0,0,0.04)",
                    },
                    "&.Mui-focused": {
                      backgroundColor: "rgba(255,255,255,1)",
                      boxShadow: "0 0 0 3px rgba(25, 118, 210, 0.1)",
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon
                        fontSize="small"
                        sx={(t) => ({ color: t.palette.primary.main })}
                      />
                    </InputAdornment>
                  ),
                }}
              />
              <Stack direction="row" gap={1} alignItems="center" flexShrink={0}>
                <Button
                  variant="contained"
                  onClick={handleSearch}
                  sx={{
                    borderRadius: 3,
                    px: 3,
                    fontWeight: 600,
                    "&:hover": {
                      transform: "translateY(-1px)",
                      boxShadow: 4,
                    },
                    transition: "all 0.2s ease-in-out",
                  }}
                >
                  ค้นหา
                </Button>
                <Tooltip
                  title={
                    showAdvanced ? "ซ่อนตัวกรองขั้นสูง" : "แสดงตัวกรองขั้นสูง"
                  }
                >
                  <IconButton
                    onClick={() => setShowAdvanced((s) => !s)}
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                      "&:hover": {
                        backgroundColor: "primary.main",
                        color: "white",
                        borderColor: "primary.main",
                      },
                      transition: "all 0.2s ease-in-out",
                    }}
                  >
                    <TuneRoundedIcon />
                  </IconButton>
                </Tooltip>
                <ToggleButtonGroup
                  exclusive
                  size="small"
                  value={viewMode}
                  onChange={(_, v) => v && setViewMode(v)}
                  sx={{
                    ml: { md: 1 },
                    borderRadius: 2,
                    "& .MuiToggleButton-root": {
                      px: 2,
                      borderRadius: 2,
                      "&.Mui-selected": {
                        backgroundColor: "primary.main",
                        color: "white",
                      },
                    },
                  }}
                >
                  <ToggleButton value="cards" aria-label="มุมมองการ์ด">
                    <GridViewRoundedIcon fontSize="small" />
                  </ToggleButton>
                  <ToggleButton value="table" aria-label="มุมมองตาราง">
                    <TableRowsRoundedIcon fontSize="small" />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Stack>
            </Stack>

            {/* Advanced placeholder */}
            {showAdvanced && (
              <Box sx={{ mt: 3 }}>
                <Divider sx={{ mb: 3 }} />
                <Typography
                  variant="body1"
                  color="text.secondary"
                  fontWeight={500}
                >
                  🚧 ตัวกรองขั้นสูง — สามารถเพิ่มการกรองตามปี ประเภท ระดับ คณะ
                  ฯลฯ
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Results header */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          alignItems={{ xs: "flex-start", md: "center" }}
          justifyContent="space-between"
          sx={{ mt: 3, mb: 1 }}
          gap={1.5}
        >
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {searchResults.length} Publications Found
            </Typography>
            {(filters.keyword ?? "").trim().length > 0 && (
              <Typography variant="body2" color="text.secondary">
                Showing results for: <b>{filters.keyword}</b>
              </Typography>
            )}
          </Box>
        </Stack>

        {/* Results */}
        {paginatedResults.length > 0 ? (
          <>
            {viewMode === "cards" ? (
              <Grid container spacing={2}>
                {paginatedResults.map((p) => (
                  <Grid key={p.id} item xs={12} sm={6} md={4}>
                    <PublicationCard
                      publication={p}
                      onView={handleViewPublication}
                    />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <PublicationTable
                publications={paginatedResults}
                onView={handleViewPublication}
              />
            )}

            {totalPages > 1 && (
              <Stack alignItems="center" sx={{ mt: 3 }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={(_, p) => setCurrentPage(p)}
                  shape="rounded"
                  color="primary"
                />
              </Stack>
            )}
          </>
        ) : (
          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ py: 8, textAlign: "center" }}>
              <AutoStoriesOutlinedIcon
                sx={{ fontSize: 48, color: "text.disabled", mb: 1.5 }}
              />
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                No Publications Found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Try adjusting your search criteria or browse all publications.
              </Typography>
              <Button
                variant="outlined"
                onClick={() => setFilters({ keyword: "" })}
                sx={{ borderRadius: 2 }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Publication Detail Modal */}
        <PublicationDetailModal
          publication={selectedPublication}
          open={detailModalOpen}
          onClose={() => {
            setDetailModalOpen(false);
            setSelectedPublication(null);
          }}
        />
      </Container>
    </Box>
  );
}

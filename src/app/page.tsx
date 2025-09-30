"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
    Fab,
    Avatar,
    Backdrop,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Collapse,
    Link,
    CircularProgress,
    Alert,
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
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LoginIcon from "@mui/icons-material/Login";
import SchoolIcon from "@mui/icons-material/School";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import DownloadIcon from "@mui/icons-material/Download";
import CloseIcon from "@mui/icons-material/Close";

/* Types */
import { Publication, PublicationSearchFilters } from '@/types/submission';

/* -------------------------------------------------
   API Functions
------------------------------------------------- */
const fetchPublications = async (filters: PublicationSearchFilters = {}, page: number = 1, pageSize: number = 12) => {
    try {
        const params = new URLSearchParams();

        if (filters.keyword) params.append('keyword', filters.keyword);
        if (filters.author) params.append('author', filters.author);
        if (filters.yearFrom) params.append('yearFrom', filters.yearFrom.toString());
        if (filters.yearTo) params.append('yearTo', filters.yearTo.toString());
        if (filters.type && filters.type !== 'All') params.append('type', filters.type);
        if (filters.level && filters.level !== 'All') params.append('level', filters.level);
        if (filters.status && filters.status !== 'All') params.append('status', filters.status);

        params.append('page', page.toString());
        params.append('pageSize', pageSize.toString());
        params.append('isPublic', 'true');

        const response = await fetch(`/api/publications?${params.toString()}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Failed to fetch publications');
        }

        return data.data;
    } catch (error) {
        console.error('Error fetching publications:', error);
        throw error;
    }
};

const fetchPublicationById = async (id: string): Promise<Publication> => {
    try {
        const response = await fetch(`/api/publications/${id}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Failed to fetch publication');
        }

        return data.data;
    } catch (error) {
        console.error('Error fetching publication by ID:', error);
        throw error;
    }
};

/* -------------------------------------------------
   Publication Detail Dialog
------------------------------------------------- */
function PublicationDetailDialog({
    publicationId,
    open,
    onClose
}: {
    publicationId: string | null;
    open: boolean;
    onClose: () => void;
}) {
    const [publication, setPublication] = useState<Publication | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open && publicationId) {
            setLoading(true);
            setError(null);

            fetchPublicationById(publicationId)
                .then(setPublication)
                .catch(err => setError(err.message))
                .finally(() => setLoading(false));
        }
    }, [open, publicationId]);

    if (!open) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 3 }
            }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box sx={{ flex: 1, pr: 2 }}>
                        {loading ? (
                            <Typography variant="h6">กำลังโหลด...</Typography>
                        ) : error ? (
                            <Typography variant="h6" color="error">เกิดข้อผิดพลาด</Typography>
                        ) : publication ? (
                            <>
                                <Typography variant="h6" fontWeight={700} gutterBottom>
                                    {publication.title}
                                </Typography>
                                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
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
                                        color={publication.level === "International" ? "success" : "default"}
                                        variant="outlined"
                                    />
                                </Stack>
                            </>
                        ) : null}
                    </Box>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Stack>
            </DialogTitle>

            <DialogContent>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error" sx={{ my: 2 }}>
                        {error}
                    </Alert>
                ) : publication ? (
                    <Stack spacing={3}>
                        {/* Authors */}
                        <Box>
                            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                ผู้แต่ง / Authors
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {publication.authors.map(author => author.name).join(", ")}
                            </Typography>
                        </Box>

                        {/* Publication Details */}
                        {(publication.journal || publication.conference) && (
                            <Box>
                                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                    สถานที่ตีพิมพ์ / Publication Venue
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {publication.journal || publication.conference}
                                    {publication.volume && ` Vol. ${publication.volume}`}
                                    {publication.issue && ` No. ${publication.issue}`}
                                    {publication.pages && `, pp. ${publication.pages}`}
                                </Typography>
                            </Box>
                        )}

                        {/* DOI */}
                        {publication.doi && (
                            <Box>
                                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                    DOI
                                </Typography>
                                <Link href={`https://doi.org/${publication.doi}`} target="_blank">
                                    {publication.doi}
                                </Link>
                            </Box>
                        )}

                        {/* Abstract */}
                        {publication.abstract && (
                            <Box>
                                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                    บทคัดย่อ / Abstract
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'justify' }}>
                                    {publication.abstract}
                                </Typography>
                            </Box>
                        )}

                        {/* Keywords */}
                        {publication.keywords && publication.keywords.length > 0 && (
                            <Box>
                                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                    คำสำคัญ / Keywords
                                </Typography>
                                <Stack direction="row" spacing={1} flexWrap="wrap">
                                    {publication.keywords.map((keyword, index) => (
                                        <Chip
                                            key={index}
                                            label={keyword}
                                            size="small"
                                            variant="outlined"
                                            color="primary"
                                        />
                                    ))}
                                </Stack>
                            </Box>
                        )}

                        {/* Attachments */}
                        {publication.attachments && publication.attachments.length > 0 && (
                            <Box>
                                <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <AttachFileIcon fontSize="small" />
                                    ไฟล์แนบ / Attachments
                                </Typography>
                                <Stack spacing={1}>
                                    {publication.attachments.map((attachment) => (
                                        <Paper
                                            key={attachment.id}
                                            variant="outlined"
                                            sx={{ p: 2, borderRadius: 2 }}
                                        >
                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                <Box>
                                                    <Typography variant="body2" fontWeight={500}>
                                                        {attachment.name}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {attachment.type} • {(attachment.size / 1024 / 1024).toFixed(2)} MB
                                                    </Typography>
                                                </Box>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    startIcon={<DownloadIcon />}
                                                    href={attachment.url}
                                                    target="_blank"
                                                >
                                                    ดาวน์โหลด
                                                </Button>
                                            </Stack>
                                        </Paper>
                                    ))}
                                </Stack>
                            </Box>
                        )}
                    </Stack>
                ) : null}
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>ปิด</Button>
            </DialogActions>
        </Dialog>
    );
}

function StatCard({
                      icon,
                      value,
                      label,
                      color = "primary",
                  }: {
    icon: React.ReactNode;
    value: number | string;
    label: string;
    color?: "primary" | "success" | "secondary";
}) {
    return (
        <Paper
            elevation={0}
            sx={(t) => ({
                p: 2.5,
                borderRadius: 3,
                border: `1px solid ${t.palette.divider}`,
            })}
        >
            <Stack spacing={1.25} alignItems="center" textAlign="center">
                <Box
                    sx={(t) => ({
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        display: "grid",
                        placeItems: "center",
                        bgcolor:
                            color === "success"
                                ? "rgba(46,125,50,0.08)"
                                : color === "secondary"
                                    ? "rgba(156,39,176,0.08)"
                                    : "rgba(25,118,210,0.08)",
                        "& svg": {
                            color:
                                color === "success"
                                    ? t.palette.success.main
                                    : color === "secondary"
                                        ? t.palette.secondary.main
                                        : t.palette.primary.main,
                        },
                    })}
                >
                    {icon}
                </Box>
                <Typography variant="h5" fontWeight={700} lineHeight={1.2}>
                    {value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {label}
                </Typography>
            </Stack>
        </Paper>
    );
}

function PublicationCard({
    publication,
    onView,
}: {
    publication: Publication;
    onView: (id: string) => void;
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
                    <Typography variant="subtitle1" fontWeight={700} sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                    }}>
                        {publication.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {publication.authors.map(author => author.name).join(", ")}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
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
                            color={publication.level === "International" ? "success" : "default"}
                            variant="outlined"
                        />
                    </Stack>
                    {publication.attachments && publication.attachments.length > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AttachFileIcon fontSize="small" color="action" />
                            <Typography variant="caption" color="text.secondary">
                                {publication.attachments.length} ไฟล์แนบ
                            </Typography>
                        </Box>
                    )}
                    <Box>
                        <Button
                            variant="contained"
                            size="small"
                            onClick={() => onView(publication.id)}
                            sx={{ borderRadius: 2, mt: 0.5 }}
                        >
                            ดูรายละเอียด
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
    onView: (id: string) => void;
}) {
    return (
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 0 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>ชื่อเรื่อง</TableCell>
                            <TableCell sx={{ fontWeight: 700, width: 220 }}>ผู้แต่ง</TableCell>
                            <TableCell sx={{ fontWeight: 700, width: 80 }}>ปี</TableCell>
                            <TableCell sx={{ fontWeight: 700, width: 120 }}>ประเภท</TableCell>
                            <TableCell sx={{ fontWeight: 700, width: 140 }}>ระดับ</TableCell>
                            <TableCell sx={{ fontWeight: 700, width: 100 }}>ไฟล์แนบ</TableCell>
                            <TableCell sx={{ fontWeight: 700, width: 120 }}>การกระทำ</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {publications.map((p) => (
                            <TableRow key={p.id} hover>
                                <TableCell>
                                    <Typography variant="body2" sx={{
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                    }}>
                                        {p.title}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" color="text.secondary" noWrap>
                                        {p.authors.map(author => author.name).join(", ")}
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
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <AttachFileIcon fontSize="small" color="action" />
                                            <Typography variant="caption">
                                                {p.attachments.length}
                                            </Typography>
                                        </Box>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Button size="small" variant="contained" onClick={() => onView(p.id)}>
                                        ดูรายละเอียด
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {publications.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                                    <Typography color="text.secondary">ไม่พบผลงานตีพิมพ์</Typography>
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
   Main Page
------------------------------------------------- */
export default function PublicHomePage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const initialKeyword = useMemo(() => searchParams.get("q") ?? "", [searchParams]);
    const [filters, setFilters] = useState<PublicationSearchFilters>({
        keyword: initialKeyword,
        author: "",
        yearFrom: undefined,
        yearTo: undefined,
        type: "All"
    });
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
    const [currentPage, setCurrentPage] = useState(1);
    const [publications, setPublications] = useState<Publication[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [selectedPublicationId, setSelectedPublicationId] = useState<string | null>(null);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState({
        total: 0,
        journal: 0,
        conference: 0,
        international: 0
    });
    const itemsPerPage = 12;

    // Load publications
    const loadPublications = async (searchFilters: PublicationSearchFilters = filters, page: number = 1) => {
        try {
            setLoading(true);
            setError(null);

            const data = await fetchPublications(searchFilters, page, itemsPerPage);

            setPublications(data.publications);
            setTotalPages(data.pagination.totalPages);
            setTotalCount(data.pagination.total);

            // Calculate stats from current results
            const publicationStats = {
                total: data.pagination.total,
                journal: data.publications.filter((p: Publication) => p.type === 'Journal').length,
                conference: data.publications.filter((p: Publication) => p.type === 'Conference').length,
                international: data.publications.filter((p: Publication) => p.level === 'International').length
            };
            setStats(publicationStats);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
            console.error('Error loading publications:', err);
        } finally {
            setLoading(false);
        }
    };

    // Search handler
    const handleSearch = () => {
        setCurrentPage(1);
        loadPublications(filters, 1);
    };

    // Reset filters
    const handleResetFilters = () => {
        const resetFilters = {
            keyword: "",
            author: "",
            yearFrom: undefined,
            yearTo: undefined,
            type: "All"
        };
        setFilters(resetFilters);
        setCurrentPage(1);
        loadPublications(resetFilters, 1);
    };

    // View publication details
    const handleViewPublication = (id: string) => {
        setSelectedPublicationId(id);
        setDetailDialogOpen(true);
    };

    // Handle page change
    const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
        setCurrentPage(page);
        loadPublications(filters, page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Load initial data
    useEffect(() => {
        loadPublications({ keyword: initialKeyword });
    }, [initialKeyword]);

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "grey.50" }}>
            {/* Header */}
            <Box sx={{ bgcolor: "white", borderBottom: 1, borderColor: "divider" }}>
                <Container maxWidth="lg" sx={{ py: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar sx={{ bgcolor: "primary.main" }}>
                                <SchoolIcon />
                            </Avatar>
                            <Box>
                                <Typography variant="h6" fontWeight={700}>
                                    ระบบจัดการผลงานตีพิมพ์
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    มหาวิทยาลัยสงขลานครินทร์
                                </Typography>
                            </Box>
                        </Stack>
                        <Button
                            variant="outlined"
                            startIcon={<LoginIcon />}
                            onClick={() => router.push("/login")}
                            sx={{ borderRadius: 2 }}
                        >
                            เข้าสู่ระบบ
                        </Button>
                    </Stack>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ py: 4 }}>
                {/* Error Alert */}
                {error && (
                    <Alert severity="error" sx={{ mb: 4 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {/* Statistics */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            icon={<AutoStoriesOutlinedIcon />}
                            value={loading ? "..." : stats.total}
                            label="ผลงานทั้งหมด"
                            color="primary"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            icon={<MenuBookIcon />}
                            value={loading ? "..." : stats.journal}
                            label="วารสาร"
                            color="success"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            icon={<EmojiEventsOutlinedIcon />}
                            value={loading ? "..." : stats.conference}
                            label="การประชุมวิชาการ"
                            color="secondary"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            icon={<TrendingUpRoundedIcon />}
                            value={loading ? "..." : stats.international}
                            label="ระดับนานาชาติ"
                            color="success"
                        />
                    </Grid>
                </Grid>

                {/* Search Section */}
                <Card variant="outlined" sx={{ borderRadius: 3, mb: 4 }}>
                    <CardContent>
                        <Stack spacing={3}>
                            <Typography variant="h6" fontWeight={700}>
                                ค้นหาผลงานตีพิมพ์
                            </Typography>

                            {/* Basic Search */}
                            <Stack direction="row" spacing={2} alignItems="center">
                                <TextField
                                    fullWidth
                                    placeholder="ค้นหาโดยชื่อเรื่อง, คำสำคัญ, หรือเนื้อหา..."
                                    value={filters.keyword || ""}
                                    onChange={(e) => setFilters(prev => ({ ...prev, keyword: e.target.value }))}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchRoundedIcon />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                                />
                                <Button
                                    variant="contained"
                                    onClick={handleSearch}
                                    disabled={loading}
                                    sx={{ borderRadius: 2, px: 3 }}
                                >
                                    {loading ? <CircularProgress size={20} /> : "ค้นหา"}
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={showAdvanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                    onClick={() => setShowAdvanced(!showAdvanced)}
                                    sx={{ borderRadius: 2 }}
                                >
                                    ตัวกรองขั้นสูง
                                </Button>
                            </Stack>

                            {/* Advanced Filters */}
                            <Collapse in={showAdvanced}>
                                <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                label="ผู้แต่ง"
                                                placeholder="ระบุชื่อผู้แต่ง..."
                                                value={filters.author || ""}
                                                onChange={(e) => setFilters(prev => ({ ...prev, author: e.target.value }))}
                                                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <FormControl fullWidth>
                                                <InputLabel>ประเภทผลงาน</InputLabel>
                                                <Select
                                                    value={filters.type || "All"}
                                                    label="ประเภทผลงาน"
                                                    onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                                                    sx={{ borderRadius: 2 }}
                                                >
                                                    <MenuItem value="All">ทั้งหมด</MenuItem>
                                                    <MenuItem value="Journal">วารสาร</MenuItem>
                                                    <MenuItem value="Conference">การประชุมวิชาการ</MenuItem>
                                                    <MenuItem value="Book">หนังสือ</MenuItem>
                                                    <MenuItem value="Thesis">วิทยานิพนธ์</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                label="ปีเริ่มต้น"
                                                type="number"
                                                placeholder="เช่น 2020"
                                                value={filters.yearFrom || ""}
                                                onChange={(e) => setFilters(prev => ({
                                                    ...prev,
                                                    yearFrom: e.target.value ? parseInt(e.target.value) : undefined
                                                }))}
                                                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                label="ปีสิ้นสุด"
                                                type="number"
                                                placeholder="เช่น 2024"
                                                value={filters.yearTo || ""}
                                                onChange={(e) => setFilters(prev => ({
                                                    ...prev,
                                                    yearTo: e.target.value ? parseInt(e.target.value) : undefined
                                                }))}
                                                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                                            />
                                        </Grid>
                                    </Grid>
                                    <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                                        <Button
                                            variant="contained"
                                            onClick={handleSearch}
                                            disabled={loading}
                                            sx={{ borderRadius: 2 }}
                                        >
                                            ค้นหาด้วยตัวกรอง
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            onClick={handleResetFilters}
                                            disabled={loading}
                                            sx={{ borderRadius: 2 }}
                                        >
                                            ล้างตัวกรอง
                                        </Button>
                                    </Stack>
                                </Paper>
                            </Collapse>
                        </Stack>
                    </CardContent>
                </Card>

                {/* Results Header */}
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 3 }}
                >
                    <Typography variant="h6" fontWeight={600}>
                        ผลการค้นหา ({loading ? "..." : totalCount} รายการ)
                    </Typography>
                    <ToggleButtonGroup
                        value={viewMode}
                        exclusive
                        onChange={(_, newMode) => newMode && setViewMode(newMode)}
                        size="small"
                    >
                        <ToggleButton value="cards">
                            <GridViewRoundedIcon />
                        </ToggleButton>
                        <ToggleButton value="table">
                            <TableRowsRoundedIcon />
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Stack>

                {/* Loading */}
                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress size={40} />
                    </Box>
                )}

                {/* Results */}
                {!loading && !error && (
                    <>
                        {viewMode === "cards" ? (
                            <Grid container spacing={3}>
                                {publications.map((publication) => (
                                    <Grid item xs={12} sm={6} md={4} key={publication.id}>
                                        <PublicationCard
                                            publication={publication}
                                            onView={handleViewPublication}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        ) : (
                            <PublicationTable
                                publications={publications}
                                onView={handleViewPublication}
                            />
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <Stack alignItems="center" sx={{ mt: 4 }}>
                                <Pagination
                                    count={totalPages}
                                    page={currentPage}
                                    onChange={handlePageChange}
                                    color="primary"
                                    size="large"
                                />
                            </Stack>
                        )}

                        {/* No Results */}
                        {publications.length === 0 && (
                            <Paper sx={{ p: 6, textAlign: "center", borderRadius: 3 }}>
                                <AutoStoriesOutlinedIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                    ไม่พบผลงานตีพิมพ์
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    ลองใช้คำค้นหาอื่นหรือปรับเปลี่ยนตัวกรอง
                                </Typography>
                            </Paper>
                        )}
                    </>
                )}
            </Container>

            {/* Publication Detail Dialog */}
            <PublicationDetailDialog
                publicationId={selectedPublicationId}
                open={detailDialogOpen}
                onClose={() => {
                    setDetailDialogOpen(false);
                    setSelectedPublicationId(null);
                }}
            />
        </Box>
    );
}

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

/* -------------------------------------------------
   Mock Data + Types
------------------------------------------------- */
type Publication = {
    id: string;
    title: string;
    authors: string[];
    year: number;
    type: "Journal" | "Conference";
    level: "National" | "International";
};

type SearchFiltersType = {
    keyword?: string;
};

const mockPublications: Publication[] = [
    {
        id: "1",
        title: "Deep Learning for Natural Language Processing",
        authors: ["Alice", "Bob"],
        year: 2023,
        type: "Journal",
        level: "International",
    },
    {
        id: "2",
        title: "Quantum Computing Trends",
        authors: ["Carol"],
        year: 2022,
        type: "Conference",
        level: "National",
    },
    {
        id: "3",
        title: "Blockchain in Education",
        authors: ["Dave", "Eve"],
        year: 2024,
        type: "Journal",
        level: "International",
    },
];

function searchPublications(filters: SearchFiltersType): Publication[] {
    const keyword = filters.keyword?.toLowerCase().trim();
    return mockPublications.filter(
        (p) =>
            !keyword ||
            p.title.toLowerCase().includes(keyword) ||
            p.authors.some((a) => a.toLowerCase().includes(keyword))
    );
}

/* -------------------------------------------------
   Small UI Pieces
------------------------------------------------- */
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
                    <Typography variant="subtitle1" fontWeight={700}>
                        {publication.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {publication.authors.join(", ")}
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
                    <Box>
                        <Button
                            variant="contained"
                            size="small"
                            onClick={() => onView(publication.id)}
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
    onView: (id: string) => void;
}) {
    return (
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 0 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
                            <TableCell sx={{ fontWeight: 700, width: 220 }}>Authors</TableCell>
                            <TableCell sx={{ fontWeight: 700, width: 80 }}>Year</TableCell>
                            <TableCell sx={{ fontWeight: 700, width: 120 }}>Type</TableCell>
                            <TableCell sx={{ fontWeight: 700, width: 140 }}>Level</TableCell>
                            <TableCell sx={{ fontWeight: 700, width: 100 }}>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {publications.map((p) => (
                            <TableRow key={p.id} hover>
                                <TableCell>{p.title}</TableCell>
                                <TableCell>
                                    <Typography variant="body2" color="text.secondary" noWrap>
                                        {p.authors.join(", ")}
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
                                    <Button size="small" variant="contained" onClick={() => onView(p.id)}>
                                        View
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {publications.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                    <Typography color="text.secondary">No Publications</Typography>
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
    const [filters, setFilters] = useState<SearchFiltersType>({ keyword: initialKeyword });
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
    const [currentPage, setCurrentPage] = useState(1);
    const [searchResults, setSearchResults] = useState<Publication[]>(
        searchPublications({ keyword: initialKeyword })
    );
    const itemsPerPage = 12;

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
    }, [filters]);

    const handleSearch = () => {
        setSearchResults(searchPublications(filters));
        setCurrentPage(1);
    };

    const handleNavigate = (path: string) => router.push(path);
    const handleGoBack = () => {
        router.back();
    };

    const paginatedResults = searchResults.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    const totalPages = Math.ceil(searchResults.length / itemsPerPage);

    const stats = {
        total: mockPublications.length,
        journals: mockPublications.filter((p) => p.type === "Journal").length,
        conferences: mockPublications.filter((p) => p.type === "Conference").length,
        international: mockPublications.filter((p) => p.level === "International").length,
    };

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
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23f0f0f0" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="1.5"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                    zIndex: 0,
                },
            })}
        >
        <Container maxWidth="lg" sx={{ py: 4, position: "relative", zIndex: 1 }}>
            {/* Header Section */}
            <Box sx={{ textAlign: "center", mb: 6 }}>
                <Avatar
                    sx={(t) => ({
                        width: 100,
                        height: 100,
                        mx: "auto",
                        mb: 3,
                        background: `linear-gradient(45deg, ${t.palette.primary.main}, ${t.palette.secondary.main})`,
                        boxShadow: 6,
                    })}
                >
                    <SchoolIcon sx={{ fontSize: 50 }} />
                </Avatar>
                <Typography
                    variant="h3"
                    component="h1"
                    fontWeight={800}
                    gutterBottom
                    sx={(t) => ({
                        background: `linear-gradient(45deg, ${t.palette.primary.main}, ${t.palette.secondary.main})`,
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        color: "transparent",
                        textShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        mb: 2,
                    })}
                >
                    ระบบจัดการผลงานตีพิมพ์
                </Typography>
                <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{ maxWidth: 800, mx: "auto", fontWeight: 500, lineHeight: 1.6 }}
                >
                    ค้นพบและสำรวจผลงานวิชาการจากมหาวิทยาลัยของเรา ค้นหาผ่านวารสาร บทความงานประชุม และผลงานวิจัยต่างๆ
                </Typography>
            </Box>

            {/* Hero Card */}
            <Card
                variant="outlined"
                sx={{
                    borderRadius: 5,
                    background: "rgba(255,255,255,0.9)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                    mb: 6,
                }}
            >
                <CardContent sx={{ p: { xs: 3, md: 5 } }}>
                    <Stack spacing={4} alignItems="center" textAlign="center">
                        {/* Main Title with Icon */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap", justifyContent: "center" }}>
                            <MenuBookIcon sx={(t) => ({ fontSize: 40, color: t.palette.primary.main })} />
                            <Typography
                                variant="h4"
                                fontWeight={700}
                                sx={{ color: "text.primary" }}
                            >
                                Publication Management System
                            </Typography>
                        </Box>

                        <Typography
                            color="text.secondary"
                            sx={{
                                maxWidth: 720,
                                fontSize: "1.1rem",
                                lineHeight: 1.7,
                                fontWeight: 400
                            }}
                        >
                            Discover and explore academic publications from our university. Search through
                            journals, conference papers, and research outputs.
                        </Typography>

                        {/* Enhanced Stats Grid */}
                        <Grid container spacing={3} sx={{ mt: 2, maxWidth: 1000 }}>
                            <Grid item xs={6} md={3}>
                                <Paper
                                    elevation={0}
                                    sx={(t) => ({
                                        p: 3,
                                        borderRadius: 4,
                                        background: `linear-gradient(135deg, ${t.palette.primary.main}15, ${t.palette.primary.light}08)`,
                                        border: `1px solid ${t.palette.primary.main}20`,
                                        transition: "all 0.3s ease-in-out",
                                        "&:hover": {
                                            transform: "translateY(-4px)",
                                            boxShadow: `0 8px 25px ${t.palette.primary.main}30`,
                                        },
                                    })}
                                >
                                    <Stack spacing={1.5} alignItems="center" textAlign="center">
                                        <Avatar
                                            sx={(t) => ({
                                                width: 50,
                                                height: 50,
                                                bgcolor: t.palette.primary.main,
                                                boxShadow: 2,
                                            })}
                                        >
                                            <AutoStoriesOutlinedIcon sx={{ fontSize: 28 }} />
                                        </Avatar>
                                        <Typography variant="h4" fontWeight={800} sx={{ color: "primary.main" }}>
                                            {stats.total}
                                        </Typography>
                                        <Typography variant="body1" fontWeight={600} color="text.secondary">
                                            ผลงานทั้งหมด
                                        </Typography>
                                    </Stack>
                                </Paper>
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <Paper
                                    elevation={0}
                                    sx={(t) => ({
                                        p: 3,
                                        borderRadius: 4,
                                        background: `linear-gradient(135deg, ${t.palette.success.main}15, ${t.palette.success.light}08)`,
                                        border: `1px solid ${t.palette.success.main}20`,
                                        transition: "all 0.3s ease-in-out",
                                        "&:hover": {
                                            transform: "translateY(-4px)",
                                            boxShadow: `0 8px 25px ${t.palette.success.main}30`,
                                        },
                                    })}
                                >
                                    <Stack spacing={1.5} alignItems="center" textAlign="center">
                                        <Avatar
                                            sx={(t) => ({
                                                width: 50,
                                                height: 50,
                                                bgcolor: t.palette.success.main,
                                                boxShadow: 2,
                                            })}
                                        >
                                            <EmojiEventsOutlinedIcon sx={{ fontSize: 28 }} />
                                        </Avatar>
                                        <Typography variant="h4" fontWeight={800} sx={{ color: "success.main" }}>
                                            {stats.international}
                                        </Typography>
                                        <Typography variant="body1" fontWeight={600} color="text.secondary">
                                            ระดับนานาชาติ
                                        </Typography>
                                    </Stack>
                                </Paper>
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <Paper
                                    elevation={0}
                                    sx={(t) => ({
                                        p: 3,
                                        borderRadius: 4,
                                        background: `linear-gradient(135deg, ${t.palette.info.main}15, ${t.palette.info.light}08)`,
                                        border: `1px solid ${t.palette.info.main}20`,
                                        transition: "all 0.3s ease-in-out",
                                        "&:hover": {
                                            transform: "translateY(-4px)",
                                            boxShadow: `0 8px 25px ${t.palette.info.main}30`,
                                        },
                                    })}
                                >
                                    <Stack spacing={1.5} alignItems="center" textAlign="center">
                                        <Avatar
                                            sx={(t) => ({
                                                width: 50,
                                                height: 50,
                                                bgcolor: t.palette.info.main,
                                                boxShadow: 2,
                                            })}
                                        >
                                            <TrendingUpRoundedIcon sx={{ fontSize: 28 }} />
                                        </Avatar>
                                        <Typography variant="h4" fontWeight={800} sx={{ color: "info.main" }}>
                                            {stats.journals}
                                        </Typography>
                                        <Typography variant="body1" fontWeight={600} color="text.secondary">
                                            วารสาร
                                        </Typography>
                                    </Stack>
                                </Paper>
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <Paper
                                    elevation={0}
                                    sx={(t) => ({
                                        p: 3,
                                        borderRadius: 4,
                                        background: `linear-gradient(135deg, ${t.palette.secondary.main}15, ${t.palette.secondary.light}08)`,
                                        border: `1px solid ${t.palette.secondary.main}20`,
                                        transition: "all 0.3s ease-in-out",
                                        "&:hover": {
                                            transform: "translateY(-4px)",
                                            boxShadow: `0 8px 25px ${t.palette.secondary.main}30`,
                                        },
                                    })}
                                >
                                    <Stack spacing={1.5} alignItems="center" textAlign="center">
                                        <Avatar
                                            sx={(t) => ({
                                                width: 50,
                                                height: 50,
                                                bgcolor: t.palette.secondary.main,
                                                boxShadow: 2,
                                            })}
                                        >
                                            <GroupOutlinedIcon sx={{ fontSize: 28 }} />
                                        </Avatar>
                                        <Typography variant="h4" fontWeight={800} sx={{ color: "secondary.main" }}>
                                            {stats.conferences}
                                        </Typography>
                                        <Typography variant="body1" fontWeight={600} color="text.secondary">
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
                            onClick={() => handleNavigate('/login')}
                            sx={{
                                mt: 4,
                                py: 2,
                                px: 4,
                                borderRadius: 4,
                                fontSize: "1.1rem",
                                fontWeight: 700,
                                textTransform: "none",
                                background: (t) => `linear-gradient(45deg, ${t.palette.primary.main} 30%, ${t.palette.primary.dark} 90%)`,
                                boxShadow: "0 6px 20px rgba(25, 118, 210, 0.4)",
                                "&:hover": {
                                    transform: "translateY(-3px)",
                                    boxShadow: "0 8px 30px rgba(25, 118, 210, 0.6)",
                                    background: (t) => `linear-gradient(45deg, ${t.palette.primary.dark} 30%, ${t.palette.primary.main} 90%)`,
                                },
                                transition: "all 0.3s ease-in-out",
                            }}
                        >
                            เข้าสู่ระบบจัดการผลงานตีพิมพ์
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
                    <Stack direction={{ xs: "column", md: "row" }} gap={2} alignItems="center">
                        <TextField
                            fullWidth
                            placeholder="ค้นหาผลงานตีพิมพ์..."
                            value={filters.keyword ?? ""}
                            onChange={(e) => setFilters((f) => ({ ...f, keyword: e.target.value }))}
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
                            <Tooltip title={showAdvanced ? "ซ่อนตัวกรองขั้นสูง" : "แสดงตัวกรองขั้นสูง"}>
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
                            <Typography variant="body1" color="text.secondary" fontWeight={500}>
                                🚧 ตัวกรองขั้นสูง — สามารถเพิ่มการกรองตามปี ประเภท ระดับ คณะ ฯลฯ
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
                    {((filters.keyword ?? "").trim().length > 0) && (
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
                                        onView={(id) => handleNavigate(`/publication/${id}`)}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <PublicationTable
                            publications={paginatedResults}
                            onView={(id) => handleNavigate(`/publication/${id}`)}
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
        </Container>
        </Box>
    );
}

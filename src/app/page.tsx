"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/* MUI */
import {
    Box,
    Card,
    CardContent,
    CardHeader,
    Chip,
    Container,
    Divider,
    Grid as Grid,
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
                        bgcolor:"red",
                            // color === "success"
                            //     ? t.palette.success[50] ?? "rgba(46,125,50,0.08)"
                            //     : color === "secondary"
                            //         ? t.palette.secondary[50] ?? "rgba(156,39,176,0.08)"
                            //         : t.palette.primary[50] ?? "rgba(25,118,210,0.08)",
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
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Hero */}
            <Card
                variant="outlined"
                sx={(t) => ({
                    borderRadius: 4,
                    background: `linear-gradient(90deg, ${t.palette.primary.light}11, transparent)`,
                })}
            >
                <CardContent>
                    <Stack spacing={2} alignItems="center" textAlign="center">
                        <Typography variant="h4" fontWeight={800}>
                            Publication Management System
                        </Typography>
                        <Typography color="text.secondary" sx={{ maxWidth: 720 }}>
                            Discover and explore academic publications from our university. Search through
                            journals, conference papers, and research outputs.
                        </Typography>

                        <Grid container spacing={2} sx={{ mt: 1, maxWidth: 900 }}>
                            <Grid item xs={6} md={3}>
                                <StatCard
                                    icon={<AutoStoriesOutlinedIcon />}
                                    value={stats.total}
                                    label="Publications"
                                    color="primary"
                                />
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <StatCard
                                    icon={<EmojiEventsOutlinedIcon />}
                                    value={stats.international}
                                    label="International"
                                    color="success"
                                />
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <StatCard
                                    icon={<TrendingUpRoundedIcon />}
                                    value={stats.journals}
                                    label="Journals"
                                    color="primary"
                                />
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <StatCard
                                    icon={<GroupOutlinedIcon />}
                                    value={stats.conferences}
                                    label="Conferences"
                                    color="secondary"
                                />
                            </Grid>
                        </Grid>
                        <Button variant="contained" >
                            Login to Publications Management System
                        </Button>
                    </Stack>
                </CardContent>
            </Card>

            {/* Search & Controls */}
            <Card
                variant="outlined"
                sx={{ mt: 4, borderRadius: 3, backdropFilter: "blur(2px)" }}
            >
                <CardContent>
                    <Stack direction={{ xs: "column", md: "row" }} gap={2} alignItems="center">
                        <TextField
                            fullWidth
                            placeholder="Search publications..."
                            value={filters.keyword ?? ""}
                            onChange={(e) => setFilters((f) => ({ ...f, keyword: e.target.value }))}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleSearch();
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchRoundedIcon fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Stack direction="row" gap={1} alignItems="center" flexShrink={0}>
                            <Button variant="contained" onClick={handleSearch} sx={{ borderRadius: 2 }}>
                                Search
                            </Button>
                            <Tooltip title={showAdvanced ? "Hide advanced filters" : "Show advanced filters"}>
                                <IconButton
                                    onClick={() => setShowAdvanced((s) => !s)}
                                    sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}
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
                                    "& .MuiToggleButton-root": { px: 1.5 },
                                }}
                            >
                                <ToggleButton value="cards" aria-label="card view">
                                    <GridViewRoundedIcon fontSize="small" />
                                </ToggleButton>
                                <ToggleButton value="table" aria-label="table view">
                                    <TableRowsRoundedIcon fontSize="small" />
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </Stack>
                    </Stack>

                    {/* Advanced placeholder */}
                    {showAdvanced && (
                        <Box sx={{ mt: 2 }}>
                            <Divider sx={{ mb: 2 }} />
                            <Typography variant="body2" color="text.secondary">
                                (Advanced filters placeholder — you can add year, type, level, faculty, etc.)
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
    );
}

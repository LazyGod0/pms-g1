"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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
    Avatar,
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

/* Import the publication details dialog */
import PublicationDetailsDialog from "@/components/PublicationDetailsDialog";

/* Firebase */
import { db } from "@/configs/firebase-config";
import {
    collectionGroup,
    getDocs,
    getCountFromServer,
    limit as fblimit,
    orderBy,
    query,
    startAfter,
    Timestamp,
    DocumentData,
    QueryDocumentSnapshot,
} from "firebase/firestore";

/* -------------------------------------------------
   Types
------------------------------------------------- */
type Publication = {
    id: string;                   // doc id
    refPath: string;              // full Firestore path (users/{uid}/submissions/{docId})
    title: string;
    authors: string[];
    year: number;
    type: "Journal" | "Conference" | string;
    level: "National" | "International" | string;
    createdAt?: Date;
};

type RawSubmission = {
    basics?: {
        title?: string;
        authors?: string[]; // ถ้า schema ยังไม่มี จะ fallback เป็น []
        year?: number | string;
        type?: "Journal" | "Conference" | string;
        level?: "International" | "National" | "Local" | string;
    };
    status?: "Draft" | "Submitted" | "Approved" | "Rejected" | string;
    createdAt?: Timestamp;
};

type SearchFiltersType = { keyword?: string };

/* -------------------------------------------------
   Helpers
------------------------------------------------- */
function toDate(x?: Timestamp | Date | string | null): Date | undefined {
    if (!x) return undefined;
    if (x instanceof Timestamp) return x.toDate();
    if (x instanceof Date) return x;
    return new Date(x);
}

function normalizePublication(doc: QueryDocumentSnapshot<DocumentData>): Publication {
    const data = doc.data() as RawSubmission;
    const b = data.basics ?? {};
    const title = (b.title ?? "(Untitled)").toString();
    const authors = Array.isArray(b.authors)
        ? b.authors.map((s) => String(s))
        : []; // ถ้าไม่มี authors ให้เป็น []

    const rawYear = b.year;
    const yearNum =
        typeof rawYear === "number"
            ? rawYear
            : Number.isFinite(Number(rawYear))
                ? Number(rawYear)
                : NaN;

    return {
        id: doc.id,
        refPath: doc.ref.path,
        title,
        authors,
        year: Number.isFinite(yearNum) ? (yearNum as number) : 0,
        type: (b.type as string) ?? "",
        level: (b.level as string) ?? "",
        createdAt: toDate(data.createdAt),
    };
}

/* -------------------------------------------------
   Small UI Pieces (เหมือนเดิม)
------------------------------------------------- */
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
                        {publication.authors.length ? publication.authors.join(", ") : "-"}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <Chip size="small" label={publication.year || "-"} />
                        <Chip
                            size="small"
                            label={publication.type || "-"}
                            color={publication.type === "Journal" ? "primary" : "secondary"}
                            variant="outlined"
                        />
                        <Chip
                            size="small"
                            label={publication.level || "-"}
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
                            <TableCell sx={{ fontWeight: 700, width: 240 }}>Authors</TableCell>
                            <TableCell sx={{ fontWeight: 700, width: 80 }}>Year</TableCell>
                            <TableCell sx={{ fontWeight: 700, width: 120 }}>Type</TableCell>
                            <TableCell sx={{ fontWeight: 700, width: 140 }}>Level</TableCell>
                            <TableCell sx={{ fontWeight: 700, width: 100 }}>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {publications.map((p) => (
                            <TableRow key={p.refPath} hover>
                                <TableCell>{p.title}</TableCell>
                                <TableCell>
                                    <Typography variant="body2" color="text.secondary" noWrap>
                                        {p.authors.length ? p.authors.join(", ") : "-"}
                                    </Typography>
                                </TableCell>
                                <TableCell>{p.year || "-"}</TableCell>
                                <TableCell>
                                    <Chip
                                        size="small"
                                        label={p.type || "-"}
                                        color={p.type === "Journal" ? "primary" : "secondary"}
                                        variant="outlined"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        size="small"
                                        label={p.level || "-"}
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
   Main Page (ดึงข้อมูลจริงจาก Firestore)
------------------------------------------------- */
export default function PublicHomePage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const initialKeyword = useMemo(() => searchParams.get("q") ?? "", [searchParams]);
    const [filters, setFilters] = useState<SearchFiltersType>({ keyword: initialKeyword });

    const [showAdvanced, setShowAdvanced] = useState(false);
    const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

    const itemsPerPage = 12;
    const [currentPage, setCurrentPage] = useState(1);

    // ข้อมูลที่ดึงมาทั้งหมด (ภายในขอบเขตเพดาน)
    const [allPublications, setAllPublications] = useState<Publication[]>([]);
    const [loading, setLoading] = useState(true);

    // สำหรับโหลดเป็นหน้าๆ จาก Firestore collection group
    const lastCursorRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [hasMore, setHasMore] = useState(true);

    // เพดานดึงสูงสุดครั้งแรก (กันโหลดทั้งโลก)
    const MAX_FETCH = 500;         // ปรับตามปริมาณจริง
    const PAGE_FETCH_SIZE = 100;   // ทีละก้อนจาก Firestore

    // นับจำนวนรวมทั้งหมดจากฝั่งเซิร์ฟ (ไม่ใช่หลังกรอง keyword)
    const [totalServerCount, setTotalServerCount] = useState<number | null>(null);

    // ดึง count ทั้งหมด (ไม่กรองคำค้น)
    useEffect(() => {
        let isMounted = true;
        (async () => {
            try {
                const cg = collectionGroup(db, "submissions");
                // อย่าลืมสร้าง index สำหรับ collectionGroup + orderBy('createdAt') ใน Firestore Console
                const countSnap = await getCountFromServer(cg);
                if (isMounted) setTotalServerCount(countSnap.data().count);
            } catch (e) {
                // เงียบไว้ก็ได้ แค่ใช้เพื่อแสดงผลรวมบนสถิติ
                // console.warn("Count failed", e);
            }
        })();
        return () => { isMounted = false; };
    }, []);

    // ดึงข้อมูลเป็นหน้าๆ จนถึงเพดาน MAX_FETCH
    const fetchNextChunk = async () => {
        const base = collectionGroup(db, "submissions");
        const qBase = lastCursorRef.current
            ? query(base, orderBy("createdAt", "desc"), startAfter(lastCursorRef.current), fblimit(PAGE_FETCH_SIZE))
            : query(base, orderBy("createdAt", "desc"), fblimit(PAGE_FETCH_SIZE));

        const snap = await getDocs(qBase);
        if (snap.empty) {
            setHasMore(false);
            return [];
        }

        const pubs = snap.docs.map(normalizePublication);
        lastCursorRef.current = snap.docs[snap.docs.length - 1];
        if (snap.size < PAGE_FETCH_SIZE) setHasMore(false);
        return pubs;
    };

    // โหลดข้อมูลครั้งแรก (และไล่โหลดต่อจนถึงเพดานหรือหมด)
    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                setLoading(true);
                lastCursorRef.current = null;
                setHasMore(true);
                const collected: Publication[] = [];
                while (collected.length < MAX_FETCH) {
                    const chunk = await fetchNextChunk();
                    collected.push(...chunk);
                    if (chunk.length === 0 || !hasMore) break;
                }
                if (!alive) return;
                setAllPublications(collected);
            } catch (e) {
                console.error("Error loading publications:", e);
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => { alive = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // โหลดครั้งเดียว

    // อัปเดต URL เมื่อพิมพ์ค้นหา
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        const kw = (filters.keyword ?? "").trim();
        if (kw.length > 0) params.set("q", kw);
        else params.delete("q");
        router.replace(`?${params.toString()}`, { scroll: false });
    }, [filters.keyword, router, searchParams]);

    // ฟังก์ชันค้นหาแบบง่าย (ฝั่ง client)
    const applySearch = (rows: Publication[], keyword?: string) => {
        const kw = keyword?.toLowerCase().trim();
        if (!kw) return rows;
        return rows.filter(
            (p) =>
                p.title.toLowerCase().includes(kw) ||
                (p.authors?.some((a) => a.toLowerCase().includes(kw)) ?? false)
        );
    };

    const handleSearch = () => {
        setCurrentPage(1);
    };

    const handleNavigate = (path: string) => router.push(path);

    // สร้างชุดผลลัพธ์ (หลังกรอง keyword)
    const searchResults = useMemo(() => applySearch(allPublications, filters.keyword), [allPublications, filters.keyword]);

    // คำนวนค่าทางสถิติ (บนชุดผลลัพธ์ที่ดึงมาแล้ว)
    const stats = useMemo(() => {
        const total = searchResults.length;
        const journals = searchResults.filter((p) => (p.type || "").toLowerCase() === "journal").length;
        const conferences = searchResults.filter((p) => (p.type || "").toLowerCase() === "conference").length;
        const international = searchResults.filter((p) => (p.level || "").toLowerCase() === "international").length;
        return { total, journals, conferences, international };
    }, [searchResults]);

    // แบ่งหน้า (client-side)
    const totalPages = Math.ceil(searchResults.length / itemsPerPage) || 1;
    const paginatedResults = useMemo(
        () => searchResults.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
        [searchResults, currentPage]
    );

    // State for managing the publication details dialog
    const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleViewPublication = (id: string) => {
        const pub = allPublications.find((p) => p.id === id) || null;
        setSelectedPublication(pub);
        setDialogOpen(true);
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
        setSelectedPublication(null);
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
                    backgroundImage:
                        'url("data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23f0f0f0\" fill-opacity=\"0.03\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"1.5\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                    zIndex: 0,
                },
            })}
        >
            <Container maxWidth="lg" sx={{ py: 3, position: "relative", zIndex: 1 }}>
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
                        ค้นพบและสำรวจผลงานวิชาการจากมหาวิทยาลัยของเรา ค้นหาผ่านวารสาร บทความงานประชุม และผลงานวิจัยต่างๆ
                    </Typography>
                </Box>

                {/* Hero Card + Stats */}
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
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap", justifyContent: "center" }}>
                                <MenuBookIcon sx={(t) => ({ fontSize: 32, color: t.palette.primary.main })} />
                                <Typography variant="h5" fontWeight={600} sx={{ color: "text.primary" }}>
                                    Publication Management System
                                </Typography>
                            </Box>

                            <Typography color="text.secondary" sx={{ maxWidth: 600, fontSize: "1rem", lineHeight: 1.6, fontWeight: 400 }}>
                                Discover and explore academic publications from our university. Search through journals, conference papers, and research outputs.
                            </Typography>

                            {/* Stats Grid */}
                            <Grid container spacing={2.5} sx={{ mt: 1.5, maxWidth: 900 }}>
                                <Grid item xs={6} md={3}>
                                    <Paper
                                        elevation={0}
                                        sx={(t) => ({
                                            p: 2.5,
                                            borderRadius: 3,
                                            background: `linear-gradient(135deg, ${t.palette.primary.main}15, ${t.palette.primary.light}08)`,
                                            border: `1px solid ${t.palette.primary.main}20`,
                                        })}
                                    >
                                        <Stack spacing={1} alignItems="center" textAlign="center">
                                            <Avatar sx={(t) => ({ width: 42, height: 42, bgcolor: t.palette.primary.main, boxShadow: 1 })}>
                                                <AutoStoriesOutlinedIcon sx={{ fontSize: 24 }} />
                                            </Avatar>
                                            <Typography variant="h5" fontWeight={700} sx={{ color: "primary.main" }}>
                                                {stats.total}
                                            </Typography>
                                            <Typography variant="body2" fontWeight={600} color="text.secondary">
                                                ผลงานทั้งหมด{totalServerCount !== null ? ` (จาก ${totalServerCount} ทั้งระบบ)` : ""}
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
                                        })}
                                    >
                                        <Stack spacing={1} alignItems="center" textAlign="center">
                                            <Avatar sx={(t) => ({ width: 42, height: 42, bgcolor: t.palette.success.main, boxShadow: 1 })}>
                                                <EmojiEventsOutlinedIcon sx={{ fontSize: 24 }} />
                                            </Avatar>
                                            <Typography variant="h5" fontWeight={700} sx={{ color: "success.main" }}>
                                                {stats.international}
                                            </Typography>
                                            <Typography variant="body2" fontWeight={600} color="text.secondary">
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
                                        })}
                                    >
                                        <Stack spacing={1} alignItems="center" textAlign="center">
                                            <Avatar sx={(t) => ({ width: 42, height: 42, bgcolor: t.palette.info.main, boxShadow: 1 })}>
                                                <TrendingUpRoundedIcon sx={{ fontSize: 24 }} />
                                            </Avatar>
                                            <Typography variant="h5" fontWeight={700} sx={{ color: "info.main" }}>
                                                {stats.journals}
                                            </Typography>
                                            <Typography variant="body2" fontWeight={600} color="text.secondary">
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
                                        })}
                                    >
                                        <Stack spacing={1} alignItems="center" textAlign="center">
                                            <Avatar sx={(t) => ({ width: 42, height: 42, bgcolor: t.palette.secondary.main, boxShadow: 1 })}>
                                                <GroupOutlinedIcon sx={{ fontSize: 24 }} />
                                            </Avatar>
                                            <Typography variant="h5" fontWeight={700} sx={{ color: "secondary.main" }}>
                                                {stats.conferences}
                                            </Typography>
                                            <Typography variant="body2" fontWeight={600} color="text.secondary">
                                                งานประชุม
                                            </Typography>
                                        </Stack>
                                    </Paper>
                                </Grid>
                            </Grid>

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
                                    background: (t) => `linear-gradient(45deg, ${t.palette.primary.main} 30%, ${t.palette.primary.dark} 90%)`,
                                    boxShadow: "0 4px 16px rgba(25, 118, 210, 0.35)",
                                    "&:hover": {
                                        transform: "translateY(-2px)",
                                        boxShadow: "0 6px 24px rgba(25, 118, 210, 0.5)",
                                        background: (t) => `linear-gradient(45deg, ${t.palette.primary.dark} 30%, ${t.palette.primary.main} 90%)`,
                                    },
                                    transition: "all 0.3s ease-in-out",
                                }}
                            >
                                เข้าสู่ระบบเพื่อจัดการผลงาน
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>

                {/* Search & Controls */}
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
                                        "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
                                        "&.Mui-focused": {
                                            backgroundColor: "rgba(255,255,255,1)",
                                            boxShadow: "0 0 0 3px rgba(25, 118, 210, 0.1)",
                                        },
                                    },
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchRoundedIcon fontSize="small" sx={(t) => ({ color: t.palette.primary.main })} />
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
                                        "&:hover": { transform: "translateY(-1px)", boxShadow: 4 },
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
                                            "&.Mui-selected": { backgroundColor: "primary.main", color: "white" },
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

                        {showAdvanced && (
                            <Box sx={{ mt: 3 }}>
                                <Divider sx={{ mb: 3 }} />
                                <Typography variant="body1" color="text.secondary" fontWeight={500}>
                                    🚧 ตัวกรองขั้นสูง — สามารถเพิ่มการกรองตามปี ประเภท ระดับ คณะ ฯลฯ (ต้องมี index และปรับ query)
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
                            {loading ? "Loading..." : `${searchResults.length} Publications Found`}
                        </Typography>
                        {((filters.keyword ?? "").trim().length > 0) && !loading && (
                            <Typography variant="body2" color="text.secondary">
                                Showing results for: <b>{filters.keyword}</b>
                            </Typography>
                        )}
                    </Box>
                    {!loading && hasMore && (
                        <Button
                            variant="outlined"
                            onClick={async () => {
                                // กดโหลดเพิ่ม (ยังคงเคารพ MAX_FETCH)
                                if (allPublications.length >= MAX_FETCH) return;
                                try {
                                    setLoading(true);
                                    const chunk = await fetchNextChunk();
                                    setAllPublications((prev) => [...prev, ...chunk]);
                                } finally {
                                    setLoading(false);
                                }
                            }}
                            sx={{ borderRadius: 2 }}
                        >
                            โหลดข้อมูลเพิ่ม
                        </Button>
                    )}
                </Stack>

                {/* Results */}
                {!loading ? (
                    searchResults.length > 0 ? (
                        <>
                            {viewMode === "cards" ? (
                                <Grid container spacing={2}>
                                    {paginatedResults.map((p) => (
                                        <Grid key={p.refPath} xs={12} sm={6} md={4}>
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
                                <AutoStoriesOutlinedIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1.5 }} />
                                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                                    No Publications Found
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Try adjusting your search criteria or browse all publications.
                                </Typography>
                                <Button variant="outlined" onClick={() => setFilters({ keyword: "" })} sx={{ borderRadius: 2 }}>
                                    Clear Filters
                                </Button>
                            </CardContent>
                        </Card>
                    )
                ) : (
                    <Card variant="outlined" sx={{ borderRadius: 3 }}>
                        <CardContent sx={{ py: 6, textAlign: "center" }}>
                            <Typography variant="body1" color="text.secondary">
                                กำลังโหลดข้อมูล...
                            </Typography>
                        </CardContent>
                    </Card>
                )}

                {/* Publication Details Dialog */}
                <PublicationDetailsDialog
                    open={dialogOpen}
                    onClose={handleDialogClose}
                    publicationId={selectedPublication?.id || ""}
                    refPath={selectedPublication?.refPath || ""}
                />
            </Container>
        </Box>
    );
}

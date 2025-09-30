"use client";

import {
    Box, Button, Chip, Container, Divider, IconButton, InputAdornment, Menu, MenuItem, Paper, Stack, Table,
    TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography, Select, FormControl,
    InputLabel, SelectChangeEvent, Tabs, Tab, useMediaQuery, Card, CardContent, Dialog, DialogTitle, DialogContent,
    DialogContentText, DialogActions, Alert, Snackbar, Link,
} from "@mui/material";
import Pagination from "@mui/material/Pagination";
import SearchIcon from "@mui/icons-material/Search";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import GetAppIcon from "@mui/icons-material/GetApp";
import { useMemo, useState, MouseEvent, useEffect } from "react";
import dayjs from "dayjs";
import { auth, db } from "@/configs/firebase-config";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    Timestamp,
    deleteDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export type Pub = {
    id: string;
    title: string;
    authors: { name: string; tag?: "External" | "Internal" }[];
    year: number;
    type: "Journal" | "Conference";
    level: "International" | "National";
    status: "Draft" | "Submitted" | "Approved" | "Rejected";
    doi?: string;
    updatedAt: string;
    faculty?: string;
    attachments?: { name: string; url: string; }[]; // New field for attachments
};

const statusColor: Record<
    Pub["status"],
    "default" | "warning" | "success" | "error" | "info"
> = {
    Draft: "default",
    Submitted: "warning",
    Approved: "success",
    Rejected: "error",
};

function StatusChip({ status }: { status: Pub["status"] }) {
    const displayLabel = status === "Submitted" ? "รอการพิจารณา" :
        status === "Approved" ? "อนุมัติแล้ว" :
            status === "Rejected" ? "ไม่อนุมัติ" :
                status === "Draft" ? "ร่าง" : status;

    const icon =
        status === "Approved" ? (
            <CheckCircleRoundedIcon fontSize="small" />
        ) : status === "Submitted" ? (
            <PendingActionsOutlinedIcon fontSize="small" />
        ) : status === "Rejected" ? (
            <CancelRoundedIcon fontSize="small" />
        ) : status === "Draft" ? (
            <DescriptionOutlinedIcon fontSize="small" />
        ) : null;

    const draftStyle =
        status === "Draft"
            ? {
                bgcolor: (t: any) =>
                    t.palette.mode === "dark" ? t.palette.grey[800] : t.palette.grey[200],
                color: (t: any) =>
                    t.palette.mode === "dark" ? t.palette.grey[100] : t.palette.grey[900],
                borderColor: (t: any) =>
                    t.palette.mode === "dark" ? t.palette.grey[700] : t.palette.grey[400],
            }
            : {};

    return (
        <Chip
            label={displayLabel}
            color={statusColor[status]}
            size="small"
            variant={"filled"}
            icon={icon ?? undefined}
            sx={{
                fontWeight: 700,
                letterSpacing: 0.2,
                borderRadius: 1.5,
                px: 0.5,
                ...draftStyle,
            }}
        />
    );
}

const toTitle = (s?: string) =>
    s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : undefined;

function tsToISO(v: any): string | undefined {
    if (!v) return undefined;
    if (v instanceof Timestamp) return v.toDate().toISOString();
    if (v instanceof Date) return v.toISOString();
    if (typeof v === "string") return new Date(v).toISOString();
    return undefined;
}

function normalizeStatus(raw?: string): Pub["status"] {
    const s = (raw || "").toLowerCase();
    if (s === "approved") return "Approved";
    if (s === "rejected") return "Rejected";
    if (s === "submitted") return "Submitted";
    if (s === "pending" || s === "needs fix" || s === "needsfix") return "Submitted";
    return "Draft";
}

function mapSubmissionToPub(id: string, d: any, userDoc?: any): Pub {
    const basics = d?.basics ?? {};
    const identifiers = d?.identifiers ?? {};
    const statusRaw: string = d?.status ?? "draft";
    const authors = Array.isArray(d?.authors)
        ? d.authors.map((a: any) => ({
            name: a?.name ?? "",
            tag:
                a?.authorType === "External"
                    ? "External"
                    : a?.authorType === "Internal"
                        ? "Internal"
                        : undefined,
        }))
        : [];

    const updatedAt =
        tsToISO(d?.reviewedAt) ??
        tsToISO(d?.submittedAt) ??
        tsToISO(d?.createdAt) ??
        new Date().toISOString();

    // Map attachments if they exist
    const attachments = Array.isArray(d?.attachments)
        ? d.attachments.map((a: any) => ({
            name: a?.name ?? "",
            url: a?.url ?? "",
        }))
        : [];

    return {
        id,
        title: basics?.title ?? "(Untitled)",
        authors,
        year: Number(basics?.year ?? new Date().getFullYear()),
        type: (toTitle(basics?.type) as Pub["type"]) ?? "Conference",
        level: (toTitle(basics?.level) as Pub["level"]) ?? "National",
        status: normalizeStatus(statusRaw),
        doi: identifiers?.doi || undefined,
        updatedAt,
        faculty: userDoc?.faculty || undefined,
        attachments, // Include attachments in the mapped publication
    };
}

type TabKey = "ทั้งหมด" | "อนุมัติแล้ว" | "ไม่อนุมัติ" | "รอการพิจารณา" | "ร่าง";

export default function PublicationsPage() {
    const [data, setData] = useState<Pub[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | undefined>();
    const router = useRouter();

    // Menu and dialog states
    const [anchor, setAnchor] = useState<null | HTMLElement>(null);
    const [selectedPub, setSelectedPub] = useState<Pub | null>(null);
    const [pubToDelete, setPubToDelete] = useState<Pub | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error'
    }>({
        open: false,
        message: '',
        severity: 'success'
    });

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            try {
                setLoading(true);
                setErr(undefined);

                if (!user?.uid) {
                    // If no user is authenticated, redirect to login
                    router.push('/login');
                    return;
                }

                const userRef = doc(db, "users", user.uid);
                const userSnap = await getDoc(userRef);
                const userDoc = userSnap.exists() ? userSnap.data() : undefined;
                const subCol = collection(db, "users", user.uid, "submissions");
                const q = query(
                    subCol,
                    orderBy("basics.year", "desc"),
                    orderBy("createdAt", "desc")
                );
                const snap = await getDocs(q);

                const pubs = snap.docs.map((s) => mapSubmissionToPub(s.id, s.data(), userDoc));
                setData(pubs);
            } catch (e: any) {
                setErr(e?.message ?? "Failed to load");
                setData([]);
            } finally {
                setLoading(false);
            }
        });

        return () => unsub();
    }, [router]);

    const [queryTxt, setQueryTxt] = useState("");
    const [yearStart, setYearStart] = useState<string>("");
    const [yearEnd, setYearEnd] = useState<string>("");
    const [type, setType] = useState<string>("ทุกประเภท");
    const [level, setLevel] = useState<string>("ทุกระดับ");
    const [tab, setTab] = useState<TabKey>("ทั้งหมด");

    // ---- Pagination state ----
    const [page, setPage] = useState(1);
    const rowsPerPage = 10;

    const isSm = useMediaQuery("(max-width:900px)");

    const openMenu = (e: MouseEvent<HTMLElement>, pub: Pub) => {
        setAnchor(e.currentTarget);
        setSelectedPub(pub);
    };

    const closeMenu = () => {
        setAnchor(null);
        setSelectedPub(null);
    };

    const handleEdit = () => {
        if (selectedPub) {
            router.push(`/edit-publication?id=${selectedPub.id}`);
        }
        closeMenu();
    };

    const handleDeleteClick = () => {
        if (selectedPub) {
            setPubToDelete(selectedPub);
            // Don't close menu here - keep selectedPub available for the dialog
            setDeleteDialogOpen(true);
        }
        // Close menu after setting dialog state
        setTimeout(() => closeMenu(), 100);
    };

    const confirmDelete = async () => {
        console.log('confirmDelete called, selectedPub:', selectedPub);
        console.log('auth.currentUser:', auth.currentUser);

        if (!pubToDelete) {
            console.error('No publication selected for deletion');
            setSnackbar({
                open: true,
                message: 'ไม่พบผลงานที่ต้องการลบ',
                severity: 'error'
            });
            setDeleteDialogOpen(false);
            return;
        }

        if (!auth.currentUser?.uid) {
            console.error('No authenticated user');
            setSnackbar({
                open: true,
                message: 'กรุณาเข้าสู่ระบบใหม่',
                severity: 'error'
            });
            setDeleteDialogOpen(false);
            return;
        }

        try {
            setDeleting(true);
            console.log('Deleting publication:', pubToDelete.id, 'for user:', auth.currentUser.uid);

            // Delete the document from Firestore
            const docRef = doc(db, 'users', auth.currentUser.uid, 'submissions', pubToDelete.id);
            await deleteDoc(docRef);

            // Update local state to remove the deleted publication
            setData(prev => prev.filter(p => p.id !== pubToDelete.id));

            setSnackbar({
                open: true,
                message: 'ลบผลงานตีพิมพ์เรียบร้อยแล้ว',
                severity: 'success'
            });

            console.log('Delete successful');
        } catch (error: any) {
            console.error('Error deleting publication:', error);
            setSnackbar({
                open: true,
                message: error.message || 'ไม่สามารถลบผลงานตีพิมพ์ได้',
                severity: 'error'
            });
        } finally {
            setDeleting(false);
            setDeleteDialogOpen(false);
            setSelectedPub(null);
            setPubToDelete(null);
        }
    };

    const cancelDelete = () => {
        console.log('Cancel delete');
        setDeleteDialogOpen(false);
        setSelectedPub(null);
        setPubToDelete(null);
    };

    const closeSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    const filtered = useMemo(() => {
        return data.filter((p) => {
            const matchTab =
                tab === "ทั้งหมด"
                    ? true
                    : tab === "รอการพิจารณา"
                        ? p.status === "Submitted"
                        : tab === "อนุมัติแล้ว"
                            ? p.status === "Approved"
                            : tab === "ไม่อนุมัติ"
                                ? p.status === "Rejected"
                                : tab === "ร่าง"
                                    ? p.status === "Draft"
                                    : false;
            const matchQuery =
                queryTxt.trim() === "" ||
                [p.title, p.authors.map((a) => a.name).join(", "), p.doi]
                    .join(" ")
                    .toLowerCase()
                    .includes(queryTxt.toLowerCase());
            const matchYear =
                (yearStart === "" || p.year >= Number(yearStart)) &&
                (yearEnd === "" || p.year <= Number(yearEnd));
            const matchType = type === "ทุกประเภท" || p.type === type;
            const matchLevel = level === "ทุกระดับ" || p.level === level;
            return matchTab && matchQuery && matchYear && matchType && matchLevel;
        });
    }, [data, queryTxt, yearStart, yearEnd, type, level, tab]);

    const counts = useMemo(
        () =>
            data.reduce(
                (acc, p) => {
                    acc["ทั้งหมด"] += 1;
                    if (p.status === "Submitted") acc["รอการพิจารณา"] += 1;
                    else if (p.status === "Approved") acc["อนุมัติแล้ว"] += 1;
                    else if (p.status === "Rejected") acc["ไม่อนุมัติ"] += 1;
                    else if (p.status === "Draft") acc["ร่าง"] += 1;
                    return acc;
                },
                {
                    "ทั้งหมด": 0,
                    "อนุมัติแล้ว": 0,
                    "ไม่อนุมัติ": 0,
                    "รอการพิจารณา": 0,
                    "ร่าง": 0,
                } as Record<TabKey, number>
            ),
        [data]
    );

    // จำนวนหน้าทั้งหมด (อย่างน้อย 1)
    const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));

    // ถ้าเปลี่ยนตัวกรอง/แท็บ/ค้นหา ให้กลับไปหน้า 1
    useEffect(() => {
        setPage(1);
    }, [queryTxt, yearStart, yearEnd, type, level, tab]);

    // กันกรณี page > totalPages (เช่นข้อมูลเหลือน้อยลง)
    useEffect(() => {
        if (page > totalPages) setPage(totalPages);
    }, [page, totalPages]);

    // ข้อมูลเฉพาะหน้าปัจจุบัน
    const paginated = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        return filtered.slice(start, start + rowsPerPage);
    }, [filtered, page]);

    const clearFilters = () => {
        setQueryTxt("");
        setYearStart("");
        setYearEnd("");
        setType("ทุกประเภท");
        setLevel("ทุกระดับ");
    };

    const years = useMemo(() => {
        const ys = Array.from(new Set(data.map((m) => m.year))).sort((a, b) => b - a);
        return ["ทุกปี", ...ys.map(String)];
    }, [data]);

    const types = ["ทุกประเภท", "Journal", "Conference"];
    const levels = ["ทุกระดับ", "International", "National"];

    return (
        <ProtectedRoute requiredRole="lecturer" redirectTo="/login">
            <Box
                sx={{
                    minHeight: "100vh",
                    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                    py: 4,
                    position: 'relative',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: `
                            radial-gradient(circle at 25% 25%, rgba(255,255,255,0.8) 0%, transparent 50%),
                            radial-gradient(circle at 75% 75%, rgba(79,172,254,0.1) 0%, transparent 50%)
                        `,
                        zIndex: 0,
                        pointerEvents: 'none',
                    },
                }}
            >
                <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
                    {/* Header Section with Back Button */}
                    <Box sx={{ mb: 4 }}>
                        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                            <IconButton
                                onClick={() => router.push('/lec-dashboard')}
                                sx={{
                                    bgcolor: 'white',
                                    boxShadow: 2,
                                    '&:hover': { 
                                        bgcolor: 'grey.100',
                                        transform: 'translateY(-1px)',
                                        boxShadow: 4,
                                    },
                                    transition: 'all 0.3s ease-in-out',
                                }}
                            >
                                <ArrowBackIcon />
                            </IconButton>
                            <Box sx={{ flex: 1 }}>
                                <Typography
                                    variant="h3"
                                    fontWeight={800}
                                    sx={{
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        backgroundClip: "text",
                                        WebkitBackgroundClip: "text",
                                        color: "transparent",
                                        mb: 1,
                                    }}
                                >
                                    ผลงานตีพิมพ์ของฉัน
                                </Typography>
                                <Typography variant="h6" color="text.secondary" fontWeight={500}>
                                    จัดการและติดตามผลงานวิจัยและการตีพิมพ์ของคุณ
                                </Typography>
                            </Box>
                            <Button
                                variant="contained"
                                startIcon={<AddRoundedIcon />}
                                size={isSm ? "medium" : "large"}
                                sx={{
                                    borderRadius: 4,
                                    px: 4,
                                    py: 1.5,
                                    fontWeight: 700,
                                    fontSize: '1.1rem',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    boxShadow: "0 8px 32px rgba(102, 126, 234, 0.4)",
                                    "&:hover": {
                                        transform: "translateY(-2px)",
                                        boxShadow: "0 12px 40px rgba(102, 126, 234, 0.5)",
                                        background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                                    },
                                    transition: "all 0.3s ease-in-out",
                                }}
                                onClick={() => router.push('/lecnewsubmit')}
                            >
                                ส่งผลงานใหม่
                            </Button>
                        </Stack>
                    </Box>

                    {/* Search and Filter Section */}
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 6,
                            mb: 3,
                            boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
                            backdropFilter: "blur(20px)",
                            background: "rgba(255,255,255,0.95)",
                            border: "1px solid rgba(255,255,255,0.3)",
                        }}
                    >
                        <Stack
                            direction={{ xs: "column", md: "row" }}
                            spacing={2}
                            alignItems="stretch"
                        >
                            <TextField
                                placeholder="ค้นหาผลงานตีพิมพ์..."
                                fullWidth
                                value={queryTxt}
                                onChange={(e) => setQueryTxt(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ color: 'primary.main' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 3,
                                        bgcolor: 'white',
                                        '&:hover fieldset': {
                                            borderColor: 'primary.main',
                                        },
                                    }
                                }}
                            />
                            <FormControl sx={{ minWidth: 160 }}>
                                <InputLabel>ปีเริ่มต้น</InputLabel>
                                <Select
                                    value={yearStart}
                                    label="ปีเริ่มต้น"
                                    onChange={(e: SelectChangeEvent) => setYearStart(e.target.value)}
                                    IconComponent={ExpandMoreRoundedIcon as any}
                                    sx={{ 
                                        borderRadius: 3,
                                        bgcolor: 'white',
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'primary.main',
                                        },
                                    }}
                                >
                                    {years.map((y) => (
                                        <MenuItem key={y} value={y}>
                                            {y}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl sx={{ minWidth: 160 }}>
                                <InputLabel>ปีสิ้นสุด</InputLabel>
                                <Select
                                    value={yearEnd}
                                    label="ปีสิ้นสุด"
                                    onChange={(e: SelectChangeEvent) => setYearEnd(e.target.value)}
                                    IconComponent={ExpandMoreRoundedIcon as any}
                                    sx={{ 
                                        borderRadius: 3,
                                        bgcolor: 'white',
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'primary.main',
                                        },
                                    }}
                                >
                                    {years.map((y) => (
                                        <MenuItem key={y} value={y}>
                                            {y}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl sx={{ minWidth: 160 }}>
                                <InputLabel>ประเภท</InputLabel>
                                <Select
                                    value={type}
                                    label="ประเภท"
                                    onChange={(e: SelectChangeEvent) => setType(e.target.value)}
                                    IconComponent={ExpandMoreRoundedIcon as any}
                                    sx={{ 
                                        borderRadius: 3,
                                        bgcolor: 'white',
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'primary.main',
                                        },
                                    }}
                                >
                                    {types.map((t) => (
                                        <MenuItem key={t} value={t}>
                                            {t}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl sx={{ minWidth: 160 }}>
                                <InputLabel>ระดับ</InputLabel>
                                <Select
                                    value={level}
                                    label="ระดับ"
                                    onChange={(e: SelectChangeEvent) => setLevel(e.target.value)}
                                    IconComponent={ExpandMoreRoundedIcon as any}
                                    sx={{ 
                                        borderRadius: 3,
                                        bgcolor: 'white',
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'primary.main',
                                        },
                                    }}
                                >
                                    {levels.map((l) => (
                                        <MenuItem key={l} value={l}>
                                            {l}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <Button
                                onClick={clearFilters}
                                variant="outlined"
                                color="inherit"
                                sx={{
                                    whiteSpace: "nowrap",
                                    px: 4,
                                    borderRadius: 3,
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    bgcolor: 'white',
                                    '&:hover': {
                                        bgcolor: 'grey.100',
                                        transform: 'translateY(-1px)',
                                    },
                                    transition: 'all 0.3s ease-in-out',
                                }}
                            >
                                ล้างตัวกรอง
                            </Button>
                        </Stack>
                    </Paper>

                    {/* Status Tabs */}
                    <Paper
                        elevation={0}
                        sx={{
                            borderRadius: 6,
                            mb: 3,
                            px: 2,
                            boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
                            backdropFilter: "blur(20px)",
                            background: "rgba(255,255,255,0.95)",
                            border: "1px solid rgba(255,255,255,0.3)",
                        }}
                    >
                        <Tabs
                            value={tab}
                            onChange={(_, v) => setTab(v)}
                            variant="scrollable"
                            scrollButtons="auto"
                            sx={{
                                "& .MuiTab-root": {
                                    textTransform: "none",
                                    fontWeight: 700,
                                    minHeight: 56,
                                    px: 3,
                                    borderRadius: 3,
                                    margin: 0.5,
                                    transition: 'all 0.3s ease-in-out',
                                    '&:hover': {
                                        bgcolor: 'rgba(102, 126, 234, 0.1)',
                                    },
                                },
                                "& .MuiTabs-indicator": {
                                    height: 4,
                                    borderRadius: 2,
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                },
                            }}
                        >
                            {(["ทั้งหมด", "อนุมัติแล้ว", "ไม่อนุมัติ", "รอการพิจารณา", "ร่าง"] as TabKey[]).map(
                                (k) => (
                                    <Tab
                                        key={k}
                                        value={k}
                                        label={
                                            <Stack direction="row" spacing={1.5} alignItems="center">
                                                <span>{k}</span>
                                                <Chip
                                                    size="small"
                                                    label={counts[k]}
                                                    sx={{
                                                        fontWeight: 700,
                                                        borderRadius: 2,
                                                        height: 24,
                                                        bgcolor: 'primary.main',
                                                        color: 'white',
                                                        '& .MuiChip-label': {
                                                            px: 1,
                                                        },
                                                    }}
                                                />
                                            </Stack>
                                        }
                                    />
                                )
                            )}
                        </Tabs>
                    </Paper>

                    {/* Publications Table */}
                    <TableContainer
                        component={Paper}
                        elevation={0}
                        sx={{
                            borderRadius: 6,
                            overflow: 'hidden',
                            boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
                            backdropFilter: "blur(20px)",
                            background: "rgba(255,255,255,0.95)",
                            border: "1px solid rgba(255,255,255,0.3)",
                        }}
                    >
                        <Table size="medium" stickyHeader>
                            <TableHead>
                                <TableRow
                                    sx={{
                                        '& th': {
                                            fontWeight: 800,
                                            bgcolor: 'rgba(102, 126, 234, 0.1)',
                                            borderBottomWidth: 2,
                                            borderBottomColor: 'primary.main',
                                            color: 'primary.main',
                                        }
                                    }}
                                >
                                    <TableCell>ชื่อเรื่อง</TableCell>
                                    <TableCell>ผู้แต่ง</TableCell>
                                    <TableCell>ปี</TableCell>
                                    <TableCell>ประเภท/ระดับ</TableCell>
                                    <TableCell>สถานะ</TableCell>
                                    <TableCell>DOI</TableCell>
                                    <TableCell>ไฟล์แนบ</TableCell>
                                    <TableCell>อัปเดต</TableCell>
                                    <TableCell align="right" />
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading && (
                                    <TableRow>
                                        <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    gap: 2,
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        width: 40,
                                                        height: 40,
                                                        borderRadius: '50%',
                                                        border: '4px solid',
                                                        borderColor: 'primary.main',
                                                        borderTopColor: 'transparent',
                                                        animation: 'spin 1s linear infinite',
                                                        '@keyframes spin': {
                                                            '0%': { transform: 'rotate(0deg)' },
                                                            '100%': { transform: 'rotate(360deg)' },
                                                        },
                                                    }}
                                                />
                                                <Typography color="text.secondary" fontWeight={600}>
                                                    กำลังโหลดข้อมูล...
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                )}

                                {!loading &&
                                    paginated.map((p) => (
                                        <TableRow
                                            key={p.id}
                                            hover
                                            sx={{
                                                transition: 'all 0.3s ease-in-out',
                                                '&:nth-of-type(even)': {
                                                    bgcolor: 'rgba(102, 126, 234, 0.02)',
                                                },
                                                '&:hover': {
                                                    bgcolor: 'rgba(102, 126, 234, 0.08)',
                                                    transform: 'translateY(-1px)',
                                                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                                },
                                            }}
                                        >
                                            <TableCell sx={{ py: 2 }}>
                                                <Typography fontWeight={800} sx={{ mb: 0.5, lineHeight: 1.25 }}>
                                                    {p.title}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {p.faculty}
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ minWidth: 220, py: 2 }}>
                                                <Stack spacing={0.5}>
                                                    {p.authors.map((a, index) => (
                                                        <Stack key={`${a.name}-${index}`} direction="row" spacing={1} alignItems="center">
                                                            <Typography variant="body2" fontWeight={600}>{a.name}</Typography>
                                                            {a.tag && (
                                                                <Chip
                                                                    size="small"
                                                                    variant="outlined"
                                                                    label={a.tag}
                                                                    sx={{ 
                                                                        borderRadius: 2, 
                                                                        height: 22,
                                                                        fontWeight: 600,
                                                                        borderColor: 'primary.main',
                                                                        color: 'primary.main',
                                                                    }}
                                                                />
                                                            )}
                                                        </Stack>
                                                    ))}
                                                </Stack>
                                            </TableCell>
                                            <TableCell sx={{ py: 2 }}>
                                                <Typography fontWeight={700}>{p.year}</Typography>
                                            </TableCell>
                                            <TableCell sx={{ py: 2 }}>
                                                <Stack direction="row" spacing={1} flexWrap="wrap">
                                                    <Chip 
                                                        size="small" 
                                                        label={p.type} 
                                                        sx={{ 
                                                            borderRadius: 2,
                                                            fontWeight: 600,
                                                            bgcolor: 'secondary.main',
                                                            color: 'white',
                                                        }} 
                                                    />
                                                    <Chip 
                                                        size="small" 
                                                        label={p.level} 
                                                        sx={{ 
                                                            borderRadius: 2,
                                                            fontWeight: 600,
                                                            bgcolor: 'info.main',
                                                            color: 'white',
                                                        }} 
                                                    />
                                                </Stack>
                                            </TableCell>
                                            <TableCell sx={{ py: 2 }}>
                                                <StatusChip status={p.status} />
                                            </TableCell>
                                            <TableCell sx={{ py: 2 }}>
                                                {p.doi ? (
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <LinkOutlinedIcon fontSize="small" color="primary" />
                                                        <Typography
                                                            variant="body2"
                                                            component="a"
                                                            href={`https://doi.org/${p.doi}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            sx={{
                                                                textDecoration: "none",
                                                                color: 'primary.main',
                                                                fontWeight: 700,
                                                                '&:hover': { 
                                                                    textDecoration: 'underline',
                                                                    color: 'primary.dark',
                                                                }
                                                            }}
                                                        >
                                                            {p.doi}
                                                        </Typography>
                                                    </Stack>
                                                ) : (
                                                    <Typography color="text.disabled">-</Typography>
                                                )}
                                            </TableCell>
                                            <TableCell sx={{ py: 2, minWidth: 200 }}>
                                                {p.attachments && p.attachments.length > 0 ? (
                                                    <Stack spacing={1}>
                                                        {p.attachments.map((attachment, attIndex) => (
                                                            <Tooltip
                                                                key={attIndex}
                                                                title={`ดาวน์โหลด: ${attachment.name}`}
                                                                arrow
                                                            >
                                                                <Link
                                                                    href={attachment.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    sx={{
                                                                        display: 'inline-flex',
                                                                        alignItems: 'center',
                                                                        gap: 1,
                                                                        textDecoration: 'none',
                                                                        color: 'primary.main',
                                                                        fontWeight: 600,
                                                                        fontSize: '0.875rem',
                                                                        px: 1.5,
                                                                        py: 0.5,
                                                                        borderRadius: 2,
                                                                        bgcolor: 'rgba(102, 126, 234, 0.1)',
                                                                        maxWidth: '180px',
                                                                        transition: 'all 0.3s ease-in-out',
                                                                        '&:hover': {
                                                                            bgcolor: 'primary.main',
                                                                            color: 'white',
                                                                            transform: 'translateY(-1px)',
                                                                            boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                                                                        },
                                                                    }}
                                                                >
                                                                    <GetAppIcon fontSize="small" />
                                                                    <Typography
                                                                        variant="body2"
                                                                        sx={{
                                                                            whiteSpace: 'nowrap',
                                                                            overflow: 'hidden',
                                                                            textOverflow: 'ellipsis',
                                                                            maxWidth: '120px',
                                                                        }}
                                                                    >
                                                                        {attachment.name.length > 15
                                                                            ? `${attachment.name.substring(0, 15)}...`
                                                                            : attachment.name
                                                                        }
                                                                    </Typography>
                                                                </Link>
                                                            </Tooltip>
                                                        ))}
                                                        {p.attachments.length > 1 && (
                                                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                                                                ({p.attachments.length} ไฟล์)
                                                            </Typography>
                                                        )}
                                                    </Stack>
                                                ) : (
                                                    <Stack direction="row" alignItems="center" spacing={1}>
                                                        <AttachFileIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                                                        <Typography
                                                            variant="body2"
                                                            color="text.disabled"
                                                            fontWeight={500}
                                                        >
                                                            ไม่มีไฟล์แนบ
                                                        </Typography>
                                                    </Stack>
                                                )}
                                            </TableCell>
                                            <TableCell sx={{ py: 2 }}>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {dayjs(p.updatedAt).format("DD MMM YYYY")}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right" width={40} sx={{ py: 2 }}>
                                                <Tooltip title="ตัวเลือกเพิ่มเติม" arrow>
                                                    <IconButton
                                                        onClick={(e) => openMenu(e, p)}
                                                        sx={{
                                                            borderRadius: 3,
                                                            bgcolor: 'rgba(102, 126, 234, 0.1)',
                                                            '&:hover': { 
                                                                bgcolor: 'rgba(102, 126, 234, 0.2)',
                                                                transform: 'scale(1.1)',
                                                            },
                                                            transition: 'all 0.3s ease-in-out',
                                                        }}
                                                    >
                                                        <MoreHorizRoundedIcon color="primary" />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}

                                {!loading && filtered.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    gap: 2,
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        width: 80,
                                                        height: 80,
                                                        borderRadius: '50%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        bgcolor: 'rgba(102, 126, 234, 0.1)',
                                                    }}
                                                >
                                                    <DescriptionOutlinedIcon 
                                                        sx={{ fontSize: 40, color: 'primary.main' }} 
                                                    />
                                                </Box>
                                                <Typography color={err ? "error" : "text.secondary"} fontWeight={600}>
                                                    {err ? "เกิดข้อผิดพลาดในการโหลดข้อมูล" : "ไม่พบผลงานตีพิมพ์"}
                                                </Typography>
                                                {!err && (
                                                    <Typography variant="body2" color="text.disabled">
                                                        ลองปรับเปลี่ยนตัวกรองหรือเพิ่มผลงานใหม่
                                                    </Typography>
                                                )}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Pagination */}
                    {filtered.length > 0 && (
                        <Stack direction="row" justifyContent="center" sx={{ mt: 4 }}>
                            <Pagination
                                page={page}
                                count={totalPages}
                                onChange={(_, v) => setPage(v)}
                                color="primary"
                                shape="rounded"
                                siblingCount={1}
                                boundaryCount={1}
                                size="large"
                                sx={{
                                    '& .MuiPagination-ul': { gap: 1 },
                                    '& .MuiPaginationItem-root': {
                                        borderRadius: 3,
                                        fontWeight: 700,
                                        bgcolor: 'white',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                        '&:hover': {
                                            transform: 'translateY(-1px)',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                        },
                                        '&.Mui-selected': {
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            color: 'white',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                                            },
                                        },
                                        transition: 'all 0.3s ease-in-out',
                                    }
                                }}
                            />
                        </Stack>
                    )}

                    {/* Statistics Summary */}
                    <Paper
                        elevation={0}
                        sx={{
                            mt: 4,
                            p: 4,
                            borderRadius: 6,
                            boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
                            backdropFilter: "blur(20px)",
                            background: "rgba(255,255,255,0.95)",
                            border: "1px solid rgba(255,255,255,0.3)",
                        }}
                    >
                        <Typography variant="h6" fontWeight={800} sx={{ mb: 3, textAlign: 'center' }}>
                            สรุปสถิติผลงาน
                        </Typography>
                        <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems="stretch">
                            <StatCard label="รวมที่แสดง" value={filtered.length} />
                            <StatCard label="วารสาร" value={filtered.filter((p) => p.type === "Journal").length} />
                            <StatCard
                                label="ระดับนานาชาติ"
                                value={filtered.filter((p) => p.level === "International").length}
                            />
                            <StatCard label="อนุมัติแล้ว" value={filtered.filter((p) => p.status === "Approved").length} />
                        </Stack>
                    </Paper>

                    {/* Action Menu */}
                    <Menu
                        anchorEl={anchor}
                        open={Boolean(anchor)}
                        onClose={closeMenu}
                        PaperProps={{
                            sx: { 
                                minWidth: 240, 
                                borderRadius: 3, 
                                p: 1,
                                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                            }
                        }}
                    >
                        <MenuItem 
                            onClick={handleEdit} 
                            sx={{ 
                                gap: 2, 
                                borderRadius: 2,
                                py: 1.5,
                                '&:hover': {
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    '& .MuiSvgIcon-root': {
                                        color: 'white',
                                    },
                                },
                                transition: 'all 0.3s ease-in-out',
                            }}
                        >
                            <EditRoundedIcon fontSize="small" />
                            <Typography fontWeight={600}>แก้ไขผลงาน</Typography>
                        </MenuItem>
                        <MenuItem
                            onClick={handleDeleteClick}
                            sx={{ 
                                gap: 2, 
                                borderRadius: 2,
                                py: 1.5,
                                color: 'error.main',
                                '&:hover': {
                                    bgcolor: 'error.main',
                                    color: 'white',
                                    '& .MuiSvgIcon-root': {
                                        color: 'white',
                                    },
                                },
                                transition: 'all 0.3s ease-in-out',
                            }}
                            disabled={selectedPub?.status === 'Approved'}
                        >
                            <DeleteRoundedIcon fontSize="small" />
                            <Typography fontWeight={600}>ลบผลงาน</Typography>
                        </MenuItem>
                    </Menu>

                    {/* Delete Confirmation Dialog */}
                    <Dialog
                        open={deleteDialogOpen}
                        onClose={cancelDelete}
                        maxWidth="sm"
                        fullWidth
                        PaperProps={{ 
                            sx: { 
                                borderRadius: 4,
                                boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                            } 
                        }}
                    >
                        <DialogTitle sx={{ fontWeight: 800, pb: 2 }}>
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <Box
                                    sx={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: 3,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        bgcolor: 'error.main',
                                        color: 'white',
                                    }}
                                >
                                    <DeleteRoundedIcon />
                                </Box>
                                <Box>
                                    <Typography variant="h6" fontWeight={800}>
                                        ลบผลงานตีพิมพ์
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        การดำเนินการนี้ไม่สามารถยกเลิกได้
                                    </Typography>
                                </Box>
                            </Stack>
                        </DialogTitle>
                        <DialogContent sx={{ pb: 2 }}>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                                คุณแน่ใจหรือไม่ว่าต้องการลบผลงาน
                            </Typography>
                            <Paper
                                sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    bgcolor: 'grey.50',
                                    border: '1px solid',
                                    borderColor: 'grey.200',
                                }}
                            >
                                <Typography fontWeight={700} color="error.main">
                                    "{pubToDelete?.title}"
                                </Typography>
                            </Paper>
                            {pubToDelete?.status === 'Approved' && (
                                <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
                                    ไม่สามารถลบผลงานที่อนุมัติแล้วได้
                                </Alert>
                            )}
                        </DialogContent>
                        <DialogActions sx={{ p: 3, gap: 2 }}>
                            <Button 
                                onClick={cancelDelete} 
                                variant="outlined"
                                sx={{ 
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    borderRadius: 3,
                                    px: 3,
                                }}
                            >
                                ยกเลิก
                            </Button>
                            <Button
                                onClick={confirmDelete}
                                color="error"
                                variant="contained"
                                disabled={deleting || pubToDelete?.status === 'Approved'}
                                sx={{ 
                                    textTransform: 'none', 
                                    fontWeight: 700,
                                    borderRadius: 3,
                                    px: 3,
                                }}
                            >
                                {deleting ? 'กำลังลบ...' : 'ลบผลงาน'}
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {/* Success/Error Snackbar */}
                    <Snackbar
                        open={snackbar.open}
                        autoHideDuration={6000}
                        onClose={closeSnackbar}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                    >
                        <Alert
                            onClose={closeSnackbar}
                            severity={snackbar.severity}
                            variant="filled"
                            sx={{ 
                                width: '100%',
                                borderRadius: 3,
                                fontWeight: 600,
                            }}
                        >
                            {snackbar.message}
                        </Alert>
                    </Snackbar>
                </Container>
            </Box>
        </ProtectedRoute>
    );
}

function StatCard({ label, value }: { label: string; value: number }) {
    return (
        <Card
            variant="outlined"
            sx={{
                flex: 1,
                borderRadius: 3,
                transition: 'transform 120ms ease, box-shadow 120ms ease',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 }
            }}
        >
            <CardContent sx={{ textAlign: "center", py: 2.5 }}>
                <Typography variant="h5" fontWeight={900} sx={{ lineHeight: 1 }}>
                    {value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {label}
                </Typography>
            </CardContent>
        </Card>
    );
}

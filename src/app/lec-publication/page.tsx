"use client";

import {
    Box, Button, Chip, Container, Divider, IconButton, InputAdornment, Menu, MenuItem, Paper, Stack, Table,
    TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography, Select, FormControl,
    InputLabel, SelectChangeEvent, Tabs, Tab, useMediaQuery, Card, CardContent, Dialog, DialogTitle, DialogContent,
    DialogContentText, DialogActions, Alert, Snackbar,
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
    const [year, setYear] = useState<string>("ทุกปี");
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
            const matchYear = year === "ทุกปี" || String(p.year) === year;
            const matchType = type === "ทุกประเภท" || p.type === type;
            const matchLevel = level === "ทุกระดับ" || p.level === level;
            return matchTab && matchQuery && matchYear && matchType && matchLevel;
        });
    }, [data, queryTxt, year, type, level, tab]);

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
    }, [queryTxt, year, type, level, tab]);

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
        setYear("ทุกปี");
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
            <Container
                maxWidth="lg"
                sx={{
                    py: 4,
                    '& .MuiPaper-outlined': {
                        borderColor: (t) => (t.palette.mode === 'dark' ? t.palette.grey[800] : t.palette.grey[200]),
                    },
                }}
            >
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={2}
                    sx={{ mb: 2 }}
                >
                    <Box>
                        <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: 0.2 }}>
                            ผลงานตีพิมพ์ของฉัน
                        </Typography>
                        <Typography color="text.secondary">
                            จัดการผลงานวิจัยและการส่งบทความของคุณ
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<AddRoundedIcon />}
                        size={isSm ? "medium" : "large"}
                        sx={{
                            borderRadius: 2.5,
                            px: 2.5,
                            boxShadow: 4,
                            textTransform: 'none',
                            fontWeight: 800,
                            transition: 'transform 120ms ease, box-shadow 120ms ease',
                            '&:hover': { transform: 'translateY(-1px)', boxShadow: 6 },
                        }}
                        onClick={() => router.push('/lecnewsubmit')}
                    >
                        ส่งผลงานใหม่
                    </Button>
                </Stack>

                <Paper
                    variant="outlined"
                    sx={{
                        p: 2,
                        borderRadius: 3,
                        mb: 2,
                        backdropFilter: 'saturate(1.1)',
                        '& .MuiFormControl-root': { bgcolor: 'background.paper', borderRadius: 2 },
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
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                }
                            }}
                        />
                        <FormControl sx={{ minWidth: 160 }}>
                            <InputLabel>ทุกปี</InputLabel>
                            <Select
                                value={year}
                                label="ทุกปี"
                                onChange={(e: SelectChangeEvent) => setYear(e.target.value)}
                                IconComponent={ExpandMoreRoundedIcon as any}
                                sx={{ borderRadius: 2 }}
                            >
                                {years.map((y) => (
                                    <MenuItem key={y} value={y}>
                                        {y}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl sx={{ minWidth: 160 }}>
                            <InputLabel>ทุกประเภท</InputLabel>
                            <Select
                                value={type}
                                label="ทุกประเภท"
                                onChange={(e: SelectChangeEvent) => setType(e.target.value)}
                                IconComponent={ExpandMoreRoundedIcon as any}
                                sx={{ borderRadius: 2 }}
                            >
                                {types.map((t) => (
                                    <MenuItem key={t} value={t}>
                                        {t}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl sx={{ minWidth: 160 }}>
                            <InputLabel>ทุกระดับ</InputLabel>
                            <Select
                                value={level}
                                label="ทุกระดับ"
                                onChange={(e: SelectChangeEvent) => setLevel(e.target.value)}
                                IconComponent={ExpandMoreRoundedIcon as any}
                                sx={{ borderRadius: 2 }}
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
                                px: 3,
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 700
                            }}
                        >
                            ล้างตัวกรอง
                        </Button>
                    </Stack>
                </Paper>

                <Paper
                    variant="outlined"
                    sx={{
                        borderRadius: 3,
                        mb: 2,
                        px: 1,
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
                                fontWeight: 800,
                                minHeight: 48,
                                px: 1.5,
                            },
                            "& .MuiTabs-indicator": {
                                height: 3,
                                borderRadius: 3,
                            },
                        }}
                    >
                        {(["ทั้งหมด", "อนุมัติแล้ว", "ไม่อนุมัติ", "รอการพิจารณา", "ร่าง"] as TabKey[]).map(
                            (k) => (
                                <Tab
                                    key={k}
                                    value={k}
                                    label={
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <span>{k}</span>
                                            <Chip
                                                size="small"
                                                label={counts[k]}
                                                variant="outlined"
                                                sx={{
                                                    fontWeight: 700,
                                                    borderRadius: 1.5,
                                                    height: 22
                                                }}
                                            />
                                        </Stack>
                                    }
                                />
                            )
                        )}
                    </Tabs>
                </Paper>

                <TableContainer
                    component={Paper}
                    variant="outlined"
                    sx={{
                        borderRadius: 3,
                        overflow: 'hidden',
                        boxShadow: 0,
                    }}
                >
                    <Table size="medium" stickyHeader>
                        <TableHead>
                            <TableRow
                                sx={{
                                    '& th': {
                                        fontWeight: 800,
                                        bgcolor: (t) => (t.palette.mode === 'dark' ? t.palette.grey[900] : t.palette.grey[50]),
                                        borderBottomWidth: 2,
                                    }
                                }}
                            >
                                <TableCell>ชื่อเรื่อง</TableCell>
                                <TableCell>ผู้แต่ง</TableCell>
                                <TableCell>ปี</TableCell>
                                <TableCell>ประเภท/ระดับ</TableCell>
                                <TableCell>สถานะ</TableCell>
                                <TableCell>DOI</TableCell>
                                <TableCell>อัปเดต</TableCell>
                                <TableCell align="right" />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading && (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                                        <Typography color="text.secondary">กำลังโหลด...</Typography>
                                    </TableCell>
                                </TableRow>
                            )}

                            {!loading &&
                                paginated.map((p) => (
                                    <TableRow
                                        key={p.id}
                                        hover
                                        sx={{
                                            transition: 'background-color 120ms ease',
                                            '&:nth-of-type(even)': {
                                                bgcolor: (t) => (t.palette.mode === 'dark' ? 'transparent' : t.palette.grey[50]),
                                            },
                                            '&:hover': {
                                                bgcolor: (t) => (t.palette.mode === 'dark' ? t.palette.action.hover : t.palette.grey[100]),
                                            },
                                        }}
                                    >
                                        <TableCell sx={{ py: 1.5 }}>
                                            <Typography fontWeight={800} sx={{ mb: 0.5, lineHeight: 1.25 }}>
                                                {p.title}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {p.faculty}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ minWidth: 220, py: 1.5 }}>
                                            <Stack spacing={0.5}>
                                                {p.authors.map((a, index) => (
                                                    <Stack key={`${a.name}-${index}`} direction="row" spacing={1} alignItems="center">
                                                        <Typography variant="body2">{a.name}</Typography>
                                                        {a.tag && (
                                                            <Chip
                                                                size="small"
                                                                variant="outlined"
                                                                label={a.tag}
                                                                sx={{ borderRadius: 1.5, height: 22 }}
                                                            />
                                                        )}
                                                    </Stack>
                                                ))}
                                            </Stack>
                                        </TableCell>
                                        <TableCell sx={{ py: 1.5 }}>{p.year}</TableCell>
                                        <TableCell sx={{ py: 1.5 }}>
                                            <Stack direction="row" spacing={1} flexWrap="wrap">
                                                <Chip size="small" label={p.type} sx={{ borderRadius: 1.5 }} />
                                                <Chip size="small" label={p.level} sx={{ borderRadius: 1.5 }} />
                                            </Stack>
                                        </TableCell>
                                        <TableCell sx={{ py: 1.5 }}>
                                            <StatusChip status={p.status} />
                                        </TableCell>
                                        <TableCell sx={{ py: 1.5 }}>
                                            {p.doi ? (
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <LinkOutlinedIcon fontSize="small" />
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
                                                            '&:hover': { textDecoration: 'underline' }
                                                        }}
                                                    >
                                                        {p.doi}
                                                    </Typography>
                                                </Stack>
                                            ) : (
                                                "-"
                                            )}
                                        </TableCell>
                                        <TableCell sx={{ py: 1.5 }}>
                                            {dayjs(p.updatedAt).format("DD MMM YYYY")}
                                        </TableCell>
                                        <TableCell align="right" width={40} sx={{ py: 1.5 }}>
                                            <Tooltip title="ตัวเลือกเพิ่มเติม" arrow>
                                                <IconButton
                                                    onClick={(e) => openMenu(e, p)}
                                                    sx={{
                                                        borderRadius: 2,
                                                        '&:hover': { bgcolor: (t) => t.palette.action.hover }
                                                    }}
                                                >
                                                    <MoreHorizRoundedIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}

                            {!loading && filtered.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                                        <Typography color={err ? "error" : "text.secondary"}>
                                            {err ? "เกิดข้อผิดพลาด" : "ไม่พบผลลัพธ์"}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* แถบเพจจิ้ง */}
                <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
                    <Pagination
                        page={page}
                        count={totalPages}
                        onChange={(_, v) => setPage(v)}
                        color="primary"
                        shape="rounded"
                        siblingCount={1}
                        boundaryCount={1}
                        sx={{
                            '& .MuiPagination-ul': { gap: 0.5 },
                            '& .MuiPaginationItem-root': {
                                borderRadius: 2,
                                fontWeight: 700
                            }
                        }}
                    />
                </Stack>

                <Paper
                    variant="outlined"
                    sx={{
                        mt: 3,
                        p: 2.5,
                        borderRadius: 3,
                    }}
                >
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="stretch">
                        <StatCard label="รวมที่แสดง" value={filtered.length} />
                        <Divider flexItem orientation={isSm ? "horizontal" : "vertical"} />
                        <StatCard label="วารสาร" value={filtered.filter((p) => p.type === "Journal").length} />
                        <Divider flexItem orientation={isSm ? "horizontal" : "vertical"} />
                        <StatCard
                            label="ระดับนานาชาติ"
                            value={filtered.filter((p) => p.level === "International").length}
                        />
                        <Divider flexItem orientation={isSm ? "horizontal" : "vertical"} />
                        <StatCard label="อนุมัติแล้ว" value={filtered.filter((p) => p.status === "Approved").length} />
                    </Stack>
                </Paper>

                {/* เมนูการดำเนินการ */}
                <Menu
                    anchorEl={anchor}
                    open={Boolean(anchor)}
                    onClose={closeMenu}
                    PaperProps={{
                        sx: { minWidth: 220, borderRadius: 2, p: 0.5 }
                    }}
                >
                    <MenuItem onClick={handleEdit} sx={{ gap: 1.5, borderRadius: 1 }}>
                        <EditRoundedIcon fontSize="small" />
                        แก้ไขผลงาน
                    </MenuItem>
                    <MenuItem
                        onClick={handleDeleteClick}
                        sx={{ gap: 1.5, color: 'error.main', borderRadius: 1 }}
                        disabled={selectedPub?.status === 'Approved'}
                    >
                        <DeleteRoundedIcon fontSize="small" />
                        ลบผลงาน
                    </MenuItem>
                </Menu>

                {/* กล่องยืนยันการลบ */}
                <Dialog
                    open={deleteDialogOpen}
                    onClose={cancelDelete}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{ sx: { borderRadius: 3 } }}
                >
                    <DialogTitle sx={{ fontWeight: 900 }}>
                        ลบผลงานตีพิมพ์
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            คุณแน่ใจหรือไม่ว่าต้องการลบ "{pubToDelete?.title}" การดำเนินการนี้ไม่สามารถยกเลิกได้
                        </DialogContentText>
                        {pubToDelete?.status === 'Approved' && (
                            <Alert severity="warning" sx={{ mt: 2 }}>
                                ไม่สามารถลบผลงานที่อนุมัติแล้วได้
                            </Alert>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={cancelDelete} color="inherit" sx={{ textTransform: 'none' }}>
                            ยกเลิก
                        </Button>
                        <Button
                            onClick={confirmDelete}
                            color="error"
                            variant="contained"
                            disabled={deleting || pubToDelete?.status === 'Approved'}
                            sx={{ textTransform: 'none', fontWeight: 800 }}
                        >
                            {deleting ? 'กำลังลบ...' : 'ลบ'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* แจ้งเตือนผลลัพธ์ */}
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
                        sx={{ width: '100%' }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Container>
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

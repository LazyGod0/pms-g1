"use client";

import {
  Box, Button, Chip, Container, Divider, IconButton, InputAdornment, Menu, MenuItem, Paper, Stack, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography, Select, FormControl,
  InputLabel, SelectChangeEvent, Tabs, Tab, useMediaQuery, Card, CardContent,
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
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

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
  const displayLabel = status === "Submitted" ? "Pending Review" : status;
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
            t.palette.mode === "dark" ? t.palette.grey[800] : t.palette.grey[300],
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
      variant={status === "Draft" ? "filled" : "filled"}
      icon={icon ?? undefined}
      sx={{ fontWeight: 600, ...draftStyle }}
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

type TabKey = "All" | "Approved" | "Rejected" | "Pending Review" | "Draft";

export default function PublicationsPage() {
  const [data, setData] = useState<Pub[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | undefined>();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async () => {
      try {
        setLoading(true);
        setErr(undefined);
        const FIXED_UID = "YZUhXqGmf1U24zmdxYvV";
        const userRef = doc(db, "users", FIXED_UID);
        const userSnap = await getDoc(userRef);
        const userDoc = userSnap.exists() ? userSnap.data() : undefined;
        const subCol = collection(db, "users", FIXED_UID, "submissions");
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
  }, []);

  const [queryTxt, setQueryTxt] = useState("");
  const [year, setYear] = useState<string>("All Years");
  const [type, setType] = useState<string>("All Types");
  const [level, setLevel] = useState<string>("All Levels");
  const [tab, setTab] = useState<TabKey>("All");

  // ---- Pagination state ----
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const isSm = useMediaQuery("(max-width:900px)");
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const openMenu = (e: MouseEvent<HTMLElement>) => setAnchor(e.currentTarget);
  const closeMenu = () => setAnchor(null);

  const filtered = useMemo(() => {
    return data.filter((p) => {
      const matchTab =
        tab === "All"
          ? true
          : tab === "Pending Review"
          ? p.status === "Submitted"
          : p.status === tab;
      const matchQuery =
        queryTxt.trim() === "" ||
        [p.title, p.authors.map((a) => a.name).join(", "), p.doi]
          .join(" ")
          .toLowerCase()
          .includes(queryTxt.toLowerCase());
      const matchYear = year === "All Years" || String(p.year) === year;
      const matchType = type === "All Types" || p.type === type;
      const matchLevel = level === "All Levels" || p.level === level;
      return matchTab && matchQuery && matchYear && matchType && matchLevel;
    });
  }, [data, queryTxt, year, type, level, tab]);

  const counts = useMemo(
    () =>
      data.reduce(
        (acc, p) => {
          acc.All += 1;
          if (p.status === "Submitted") acc["Pending Review"] += 1;
          else acc[p.status as Exclude<TabKey, "All" | "Pending Review">] += 1;
          return acc;
        },
        {
          All: 0,
          Approved: 0,
          Rejected: 0,
          "Pending Review": 0,
          Draft: 0,
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
    setYear("All Years");
    setType("All Types");
    setLevel("All Levels");
  };

  const years = useMemo(() => {
    const ys = Array.from(new Set(data.map((m) => m.year))).sort((a, b) => b - a);
    return ["All Years", ...ys.map(String)];
  }, [data]);

  const types = ["All Types", "Journal", "Conference"];
  const levels = ["All Levels", "International", "National"];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="h4" fontWeight={800}>
            My Publications
          </Typography>
          <Typography color="text.secondary">
            Manage your research publications and submissions
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          size={isSm ? "medium" : "large"}
          sx={{ borderRadius: 2 }}
        >
          New Submission
        </Button>
      </Stack>

      <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, mb: 2 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems="stretch"
        >
          <TextField
            placeholder="Search publications..."
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
          />
          <FormControl sx={{ minWidth: 160 }}>
            <InputLabel>All Years</InputLabel>
            <Select
              value={year}
              label="All Years"
              onChange={(e: SelectChangeEvent) => setYear(e.target.value)}
              IconComponent={ExpandMoreRoundedIcon as any}
            >
              {years.map((y) => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 160 }}>
            <InputLabel>All Types</InputLabel>
            <Select
              value={type}
              label="All Types"
              onChange={(e: SelectChangeEvent) => setType(e.target.value)}
              IconComponent={ExpandMoreRoundedIcon as any}
            >
              {types.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 160 }}>
            <InputLabel>All Levels</InputLabel>
            <Select
              value={level}
              label="All Levels"
              onChange={(e: SelectChangeEvent) => setLevel(e.target.value)}
              IconComponent={ExpandMoreRoundedIcon as any}
            >
              {levels.map((l) => (
                <MenuItem key={l} value={l}>
                  {l}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button onClick={clearFilters} variant="outlined" color="inherit" sx={{ whiteSpace: "nowrap" }}>
            Clear
          </Button>
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ borderRadius: 3, mb: 2 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 1,
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 700,
              minHeight: 48,
            },
          }}
        >
          {(["All", "Approved", "Rejected", "Pending Review", "Draft"] as TabKey[]).map(
            (k) => (
              <Tab
                key={k}
                value={k}
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <span>{k}</span>
                    <Chip size="small" label={counts[k]} />
                  </Stack>
                }
              />
            )
          )}
        </Tabs>
      </Paper>

      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
        <Table size="medium">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Authors</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Year</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Type/Level</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>DOI</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Updated</TableCell>
              <TableCell align="right" />
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">Loading…</Typography>
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              paginated.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell>
                    <Typography fontWeight={700} sx={{ mb: 0.5 }}>
                      {p.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {p.faculty}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ minWidth: 220 }}>
                    <Stack spacing={0.5}>
                      {p.authors.map((a) => (
                        <Stack key={a.name} direction="row" spacing={1} alignItems="center">
                          <Typography variant="body2">{a.name}</Typography>
                          {a.tag && <Chip size="small" variant="outlined" label={a.tag} />}
                        </Stack>
                      ))}
                    </Stack>
                  </TableCell>
                  <TableCell>{p.year}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Chip size="small" label={p.type} />
                      <Chip size="small" label={p.level} />
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <StatusChip status={p.status} />
                  </TableCell>
                  <TableCell>
                    {p.doi ? (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <LinkOutlinedIcon fontSize="small" />
                        <Typography
                          variant="body2"
                          component="a"
                          href="#"
                          onClick={(e) => e.preventDefault()}
                          sx={{ textDecoration: "none" }}
                        >
                          {p.doi}
                        </Typography>
                      </Stack>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>{dayjs(p.updatedAt).format("MMM D, YYYY")}</TableCell>
                  <TableCell align="right" width={40}>
                    <Tooltip title="More">
                      <IconButton onClick={openMenu}>
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
                    {err ?? "No results"}
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
        />
      </Stack>

      <Paper variant="outlined" sx={{ mt: 3, p: 2.5, borderRadius: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <StatCard label="Total Shown" value={filtered.length} />
          <Divider flexItem orientation={isSm ? "horizontal" : "vertical"} />
          <StatCard label="Journals" value={filtered.filter((p) => p.type === "Journal").length} />
          <Divider flexItem orientation={isSm ? "horizontal" : "vertical"} />
          <StatCard
            label="International"
            value={filtered.filter((p) => p.level === "International").length}
          />
          <Divider flexItem orientation={isSm ? "horizontal" : "vertical"} />
          <StatCard label="Approved" value={filtered.filter((p) => p.status === "Approved").length} />
        </Stack>
      </Paper>

      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={closeMenu}>
        <MenuItem onClick={closeMenu}>Edit</MenuItem>
        <MenuItem onClick={closeMenu}>Delete</MenuItem>
      </Menu>
    </Container>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card variant="outlined" sx={{ flex: 1, borderRadius: 3 }}>
      <CardContent sx={{ textAlign: "center", py: 2 }}>
        <Typography variant="h5" fontWeight={800}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </CardContent>
    </Card>
  );
}
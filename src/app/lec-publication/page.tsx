"use client";

import {
  Box,
  Button,
  Chip,
  Container,
  Divider,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Tabs,
  Tab,
  useMediaQuery,
  Card,
  CardContent,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import { useMemo, useState, MouseEvent } from "react";
import dayjs from "dayjs";

type Pub = {
  id: string;
  title: string;
  authors: { name: string; tag?: "External" | "Internal" }[];
  year: number;
  type: "Journal" | "Conference" | "Book";
  level: "International" | "National" | "Local";
  status: "Draft" | "Pending" | "Needs Fix" | "Approved" | "Rejected";
  doi?: string;
  updatedAt: string; // ISO
  faculty?: string;
};

const MOCK_DATA: Pub[] = [
  {
    id: "p1",
    title: "Deep Learning for Coral Reef Monitoring",
    authors: [
      { name: "Dr. Niran Sookchai" },
      { name: "Dr. Amanda Tan", tag: "External" },
    ],
    year: 2023,
    type: "Journal",
    level: "International",
    status: "Approved",
    doi: "10.1000/coral.2023.01",
    updatedAt: "2023-04-05",
    faculty: "Faculty of Science",
  },
];

const statusColor: Record<Pub["status"], "default" | "warning" | "success" | "error" | "info"> = {
  Draft: "default",
  Pending: "warning",
  "Needs Fix": "info",
  Approved: "success",
  Rejected: "error",
};

function StatusChip({ status }: { status: Pub["status"] }) {
  const icon =
    status === "Approved" ? (
      <CheckCircleRoundedIcon fontSize="small" />
    ) : status === "Pending" ? (
      <PendingActionsOutlinedIcon fontSize="small" />
    ) : status === "Needs Fix" ? (
      <ErrorOutlineOutlinedIcon fontSize="small" />
    ) : null;

  return (
    <Chip
      label={status}
      color={statusColor[status]}
      size="small"
      variant={status === "Draft" ? "outlined" : "filled"}
      icon={icon ?? undefined}
      sx={{ fontWeight: 600 }}
    />
  );
}

export default function PublicationsPage() {
  // filters
  const [query, setQuery] = useState("");
  const [year, setYear] = useState<string>("All Years");
  const [type, setType] = useState<string>("All Types");
  const [level, setLevel] = useState<string>("All Levels");

  // tabs
  type TabKey = "All" | "Draft" | "Pending" | "Needs Fix" | "Approved" | "Rejected";
  const [tab, setTab] = useState<TabKey>("All");

  // menu
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const openMenu = (e: MouseEvent<HTMLElement>) => setAnchor(e.currentTarget);
  const closeMenu = () => setAnchor(null);

  const isSm = useMediaQuery("(max-width:900px)");

  const filtered = useMemo(() => {
    return MOCK_DATA.filter((p) => {
      const matchTab = tab === "All" ? true : p.status === tab;
      const matchQuery =
        query.trim() === "" ||
        [p.title, p.authors.map((a) => a.name).join(", "), p.doi]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase());
      const matchYear = year === "All Years" || String(p.year) === year;
      const matchType = type === "All Types" || p.type === type;
      const matchLevel = level === "All Levels" || p.level === level;
      return matchTab && matchQuery && matchYear && matchType && matchLevel;
    });
  }, [query, year, type, level, tab]);

  // counts for tabs
  const counts = useMemo(
    () =>
      MOCK_DATA.reduce(
        (acc, p) => {
          acc.All += 1;
          acc[p.status as TabKey] += 1;
          return acc;
        },
        { All: 0, Draft: 0, Pending: 0, "Needs Fix": 0, Approved: 0, Rejected: 0 } as Record<TabKey, number>
      ),
    []
  );

  const clearFilters = () => {
    setQuery("");
    setYear("All Years");
    setType("All Types");
    setLevel("All Levels");
  };

  const years = useMemo(() => {
    const ys = Array.from(new Set(MOCK_DATA.map((m) => m.year))).sort((a, b) => b - a);
    return ["All Years", ...ys.map(String)];
  }, []);

  const types = ["All Types", "Journal", "Conference", "Book"];
  const levels = ["All Levels", "International", "National", "Local"];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
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

      {/* Filters */}
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="stretch">
          <TextField
            placeholder="Search publications..."
            fullWidth
            value={query}
            onChange={(e) => setQuery(e.target.value)}
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

      {/* Tabs */}
      <Paper variant="outlined" sx={{ borderRadius: 3, mb: 2 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 1,
            "& .MuiTab-root": { textTransform: "none", fontWeight: 700, minHeight: 48 },
          }}
        >
          {(["All", "Draft", "Pending", "Needs Fix", "Approved", "Rejected"] as TabKey[]).map((k) => (
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
          ))}
        </Tabs>
      </Paper>

      {/* Table */}
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
            {filtered.map((p) => (
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
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">No results</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Footer stats */}
      <Paper variant="outlined" sx={{ mt: 3, p: 2.5, borderRadius: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <StatCard label="Total Shown" value={filtered.length} />
          <Divider flexItem orientation={isSm ? "horizontal" : "vertical"} />
          <StatCard label="Journals" value={filtered.filter((p) => p.type === "Journal").length} />
          <Divider flexItem orientation={isSm ? "horizontal" : "vertical"} />
          <StatCard label="International" value={filtered.filter((p) => p.level === "International").length} />
          <Divider flexItem orientation={isSm ? "horizontal" : "vertical"} />
          <StatCard label="Approved" value={filtered.filter((p) => p.status === "Approved").length} />
        </Stack>
      </Paper>

      {/* Row menu (placeholder actions) */}
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={closeMenu}>
        <MenuItem onClick={closeMenu}>View</MenuItem>
        <MenuItem onClick={closeMenu}>Edit</MenuItem>
        <MenuItem onClick={closeMenu}>Duplicate</MenuItem>
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

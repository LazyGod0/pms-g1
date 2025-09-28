'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Select, MenuItem,
  FormControl, InputLabel, Button, Tab, Tabs, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Chip,
  Grid, InputAdornment, Tooltip
} from '@mui/material';
import { Search as SearchIcon, Clear, Description as DescriptionIcon } from '@mui/icons-material';

// Firestore & Storage
import { db, storage } from '@/configs/firebase-config';
import { collectionGroup, getDocs } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";

// Next.js Router
import { useRouter } from 'next/navigation';

const StaffDashboard = () => {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All Types');
  const [activeTab, setActiveTab] = useState(0);
  const [mounted, setMounted] = useState(false);

  const [publications, setPublications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // โหลดข้อมูลจาก Firestore
  useEffect(() => {
    setMounted(true);

    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collectionGroup(db, "submissions"));
        const pubs: any[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();

          // path เช่น users/TUtYsDTbvEOy50N1AVhe/submissions/temp0003
          const pathParts = doc.ref.path.split('/');
          const uid = pathParts[1]; // users/{uid}
          const sid = pathParts[3]; // submissions/{sid}

          pubs.push({
            id: doc.id,
            uid,
            sid,
            // ---- Basics ----
            title: data?.basics?.title || "Untitled",
            abstract: data?.basics?.abstract || "",
            year: data?.basics?.year || "-",
            type: data?.basics?.type || "Unknown",
            level: data?.basics?.level || "Unknown",
            keywords: data?.basics?.keywords || [],
            // ---- Authors ----
            authors: data?.authors || [],
            submitter: data?.authors?.[0]?.name || "Unknown",
            // ---- Attachments ----
            files: data?.attachments?.files || [],
            // ---- Identifiers ----
            doi: data?.identifiers?.doi || "",
            references: data?.identifiers?.references || [],
            // ---- Metadata ----
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

  // เปิดไฟล์จาก Firebase Storage
  const handleOpenFile = async (filePath: string) => {
    try {
      const fileRef = ref(storage, filePath);
      const url = await getDownloadURL(fileRef);

      const newWindow = window.open(url, "_blank", "noopener,noreferrer");
      if (newWindow) newWindow.opener = null;
    } catch (error) {
      console.error("Error opening file:", error);
      alert("ไม่สามารถเปิดไฟล์ได้: " + filePath);
    }
  };

  // ไปหน้ารีวิว
  const handleReview = (uid: string, sid: string) => {
    router.push(`/staff/review/${uid}/${sid}`);
  };

  // Filter
  const filteredPublications = useMemo(() => {
    return publications.filter(pub => {
      const status = pub.status?.toLowerCase() || "draft";

      const matchesSearch =
        searchTerm === '' ||
        pub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pub.submitter.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType =
        selectedType === 'All Types' || pub.type === selectedType;

      let matchesTab = false;
      if (activeTab === 0) matchesTab = status === "submitted"; // Pending
      if (activeTab === 1) matchesTab = status === "rejected";  // Rejected = Needs Fix
      if (activeTab === 2) matchesTab = status === "approved";  // Completed
      if (activeTab === 3) matchesTab = ["submitted", "rejected", "approved"].includes(status); // Total

      return matchesSearch && matchesType && matchesTab;
    });
  }, [searchTerm, selectedType, activeTab, publications]);

  // Stats
  const dynamicStats = useMemo(() => {
    const getStatus = (p: any) => p.status?.toLowerCase() || "draft";

    const pendingReview = publications.filter(p => getStatus(p) === "submitted").length;
    const needsFix = publications.filter(p => getStatus(p) === "rejected").length;
    const approved = publications.filter(p => getStatus(p) === "approved").length;
    const totalReviews = publications.filter(p =>
      ["submitted", "rejected", "approved"].includes(getStatus(p))
    ).length;

    return {
      pendingReview,
      needsFix,
      approved,
      totalReviews,
    };
  }, [publications]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('All Types');
  };

  if (!mounted) return null;
  if (loading) return <Typography>Loading publications...</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
        Review Queue
      </Typography>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card onClick={() => setActiveTab(0)} sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Pending Review</Typography>
              <Typography variant="h3">{dynamicStats.pendingReview}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card onClick={() => setActiveTab(1)} sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Needs Fix</Typography>
              <Typography variant="h3">{dynamicStats.needsFix}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card onClick={() => setActiveTab(2)} sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Approved</Typography>
              <Typography variant="h3">{dynamicStats.approved}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card onClick={() => setActiveTab(3)} sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Total Reviews</Typography>
              <Typography variant="h3">{dynamicStats.totalReviews}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search & Filters */}
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              placeholder="Search by title or submitter..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ maxWidth: 400, flexGrow: 1 }}
            />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Type</InputLabel>
              <Select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                <MenuItem value="All Types">All Types</MenuItem>
                <MenuItem value="Journal">Journal</MenuItem>
                <MenuItem value="Conference">Conference</MenuItem>
              </Select>
            </FormControl>
            <Button variant="text" startIcon={<Clear />} onClick={clearFilters}>
              Clear Filters
            </Button>
          </Box>
        </Box>

        {/* Tabs */}
        <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)} sx={{ px: 2 }}>
          <Tab label={`Pending Review (${dynamicStats.pendingReview})`} />
          <Tab label={`Needs Fix (${dynamicStats.needsFix})`} />
          <Tab label={`Completed (${dynamicStats.approved})`} />
          <Tab label={`Total Reviews (${dynamicStats.totalReviews})`} />
        </Tabs>

        {/* Table */}
        <TableContainer>
          {filteredPublications.length === 0 ? (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <SearchIcon sx={{ fontSize: 64, color: 'grey.300' }} />
              <Typography>No publications found</Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Authors</TableCell>
                  <TableCell>Type/Level</TableCell>
                  <TableCell>Year</TableCell>
                  <TableCell>Submitted</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Files</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPublications.map((pub) => (
                  <TableRow key={pub.id}>
                    <TableCell>
                      <Typography fontWeight={600}>{pub.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{pub.abstract}</Typography>
                    </TableCell>
                    <TableCell>
                      {pub.authors.map((a: any, i: number) => (
                        <Typography key={i} variant="body2">
                          {a.name} <Typography component="span" variant="caption">({a.role})</Typography>
                        </Typography>
                      ))}
                    </TableCell>
                    <TableCell>{pub.type} ({pub.level})</TableCell>
                    <TableCell>{pub.year}</TableCell>
                    <TableCell>{pub.submitted}</TableCell>
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
                      />
                    </TableCell>
                    <TableCell>
                      {pub.files.map((f: string, i: number) => (
                        <Tooltip key={i} title={f}>
                          <DescriptionIcon
                            sx={{ mr: 1, color: "primary.main", cursor: "pointer" }}
                            onClick={() => handleOpenFile(f)}
                          />
                        </Tooltip>
                      ))}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        size="small"
                        disabled={pub.status?.toLowerCase() !== "submitted"} // ✅ เฉพาะ submitted
                        onClick={() => handleReview(pub.uid, pub.sid)}
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
      </Paper>
    </Box>
  );
};

export default StaffDashboard;

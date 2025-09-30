'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Select, MenuItem,
  FormControl, InputLabel, Button, Tab, Tabs, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Chip,
  Grid, InputAdornment, Tooltip, Skeleton
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
          const pathParts = doc.ref.path.split('/');
          const uid = pathParts[1]; // users/{uid}
          const sid = pathParts[3]; // submissions/{sid}

          pubs.push({
            id: doc.id,
            uid,
            sid,
            title: data?.basics?.title || "Untitled",
            abstract: data?.basics?.abstract || "",
            year: data?.basics?.year || "-",
            type: data?.basics?.type || "Unknown",
            level: data?.keywords?.level || "Unknown", // อยู่ใน keywords
            keywords: data?.keywords || [],
            authors: data?.authors || [],
            submitter: data?.authors?.[0]?.name || "Unknown",
            files: data?.attachments?.files || [],
            doi: data?.identifiers?.doi || "",
            references: data?.references || [],
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

  const handleOpenFile = async (filePath: string) => {
    try {
      const fileRef = ref(storage, filePath);
      const url = await getDownloadURL(fileRef);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Error opening file:", error);
      alert("ไม่สามารถเปิดไฟล์ได้: " + filePath);
    }
  };

  const handleReview = (uid: string, sid: string) => {
    router.push(`/staff/review/${uid}/${sid}`);
  };

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
      if (activeTab === 0) matchesTab = status === "submitted";
      if (activeTab === 1) matchesTab = status === "rejected";
      if (activeTab === 2) matchesTab = status === "approved";
      if (activeTab === 3) matchesTab = ["submitted", "rejected", "approved"].includes(status);

      return matchesSearch && matchesType && matchesTab;
    });
  }, [searchTerm, selectedType, activeTab, publications]);

  const dynamicStats = useMemo(() => {
    const getStatus = (p: any) => p.status?.toLowerCase() || "draft";
    const pendingReview = publications.filter(p => getStatus(p) === "submitted").length;
    const needsFix = publications.filter(p => getStatus(p) === "rejected").length;
    const approved = publications.filter(p => getStatus(p) === "approved").length;
    const totalReviews = publications.filter(p =>
      ["submitted", "rejected", "approved"].includes(getStatus(p))
    ).length;

    return { pendingReview, needsFix, approved, totalReviews };
  }, [publications]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('All Types');
  };

  if (!mounted) return null;

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
        Review Queue
      </Typography>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[ 
          { label: "Pending Review", value: dynamicStats.pendingReview },
          { label: "Needs Fix", value: dynamicStats.needsFix },
          { label: "Approved", value: dynamicStats.approved },
          { label: "Total Reviews", value: dynamicStats.totalReviews },
        ].map((stat, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }} onClick={() => setActiveTab(i)}>
              <CardContent>
                {loading ? (
                  <>
                    <Skeleton width="60%" />
                    <Skeleton width="40%" height={40} />
                  </>
                ) : (
                  <>
                    <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
                    <Typography variant="h3">{stat.value}</Typography>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Search & Filters */}
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ p: 2, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
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
            sx={{ flexGrow: 1 }}
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

        {/* Tabs */}
        <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)} sx={{ px: 2 }}>
          <Tab label={`Pending Review (${dynamicStats.pendingReview})`} />
          <Tab label={`Needs Fix (${dynamicStats.needsFix})`} />
          <Tab label={`Completed (${dynamicStats.approved})`} />
          <Tab label={`Total Reviews (${dynamicStats.totalReviews})`} />
        </Tabs>

        {/* Table */}
        <TableContainer sx={{ overflowX: 'auto' }}>
          {loading ? (
            <Box sx={{ p: 4 }}>
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} variant="rectangular" height={40} sx={{ mb: 1, borderRadius: 1 }} />
              ))}
            </Box>
          ) : filteredPublications.length === 0 ? (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <SearchIcon sx={{ fontSize: 64, color: 'grey.300' }} />
              <Typography>No publications found</Typography>
            </Box>
          ) : (
            <Table size="small">
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
                        disabled={pub.status?.toLowerCase() !== "submitted"}
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

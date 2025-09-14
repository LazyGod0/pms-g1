'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  IconButton,
  InputAdornment,
  Grid,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  Breadcrumbs,
  Link,
  Avatar,
  Badge,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility,
  Notifications,
  Person,
  Dashboard as DashboardIcon,
  Assessment,
  NavigateNext,
  Clear
} from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3b82f6',
    },
    secondary: {
      main: '#10b981',
    },
  },
});

interface Publication {
  id: string;
  title: string;
  submitter: string;
  faculty: string;
  department: string;
  type: string;
  level: string;
  submitted: string;
  completeness: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'Pending Review' | 'Needs Fix' | 'Approved';
}

const StaffDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('All Faculties');
  const [selectedType, setSelectedType] = useState('All Types');
  const [activeTab, setActiveTab] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  const publications: Publication[] = [
    {
      id: '1',
      title: 'Thai NLP for Legal Texts',
      submitter: 'Siriporn Doktum',
      faculty: 'Faculty of Science',
      department: 'Computer Science',
      type: 'Journal',
      level: 'National',
      submitted: 'Aug 15, 2022',
      completeness: 100,
      priority: 'HIGH',
      status: 'Pending Review'
    },
    {
      id: '2',
      title: 'Cultural Heritage Preservation Through Digital Technology',
      submitter: 'Nensor Aroong',
      faculty: 'Faculty of Liberal Arts',
      department: 'History',
      type: 'Journal',
      level: 'International',
      submitted: 'Dec 5, 2022',
      completeness: 71,
      priority: 'HIGH',
      status: 'Pending Review'
    },
    {
      id: '3',
      title: 'Blockchain Technology in Supply Chain Management',
      submitter: 'Asst. Prof. Nunung Techapun',
      faculty: 'Faculty of Engineering',
      department: 'Civil Engineering',
      type: 'Journal',
      level: 'National',
      submitted: 'Aug 22, 2024',
      completeness: 71,
      priority: 'HIGH',
      status: 'Needs Fix'
    }
  ];

  const stats = {
    pendingReview: 2,
    needsFix: 1,
    approved: 5,
    totalReviews: 9
  };

  // Filtered publications based on search and filters
  const filteredPublications = useMemo(() => {
    return publications.filter(pub => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        pub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pub.submitter.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesGlobalSearch = globalSearchTerm === '' ||
        pub.title.toLowerCase().includes(globalSearchTerm.toLowerCase()) ||
        pub.submitter.toLowerCase().includes(globalSearchTerm.toLowerCase());

      // Faculty filter
      const matchesFaculty = selectedFaculty === 'All Faculties' || 
        pub.faculty === selectedFaculty;

      // Type filter
      const matchesType = selectedType === 'All Types' || 
        pub.type === selectedType;

      // Tab filter
      const matchesTab = activeTab === 0 
        ? (pub.status === 'Pending Review' || pub.status === 'Needs Fix')
        : pub.status === 'Approved';

      return matchesSearch && matchesGlobalSearch && matchesFaculty && matchesType && matchesTab;
    });
  }, [searchTerm, globalSearchTerm, selectedFaculty, selectedType, activeTab, publications]);

  // Calculate dynamic stats
  const dynamicStats = useMemo(() => {
    const pendingReview = publications.filter(p => p.status === 'Pending Review').length;
    const needsFix = publications.filter(p => p.status === 'Needs Fix').length;
    const approved = publications.filter(p => p.status === 'Approved').length;
    
    return {
      pendingReview,
      needsFix,
      approved,
      totalReviews: pendingReview + needsFix + approved
    };
  }, [publications]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedFaculty('All Faculties');
    setSelectedType('All Types');
  };

  const handleReview = (pubId: string) => {
    alert(`Opening review for publication ID: ${pubId}`);
    // Here you would typically navigate to review page or open a modal
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending Review': return 'warning';
      case 'Needs Fix': return 'error';
      case 'Approved': return 'success';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    return priority === 'HIGH' ? 'error' : 'default';
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'grey.50' }}>
        {/* Sidebar */}
        <Drawer
          variant="permanent"
          sx={{
            width: 280,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 280,
              boxSizing: 'border-box',
              bgcolor: 'white',
              borderRight: '1px solid',
              borderColor: 'grey.200'
            },
          }}
        >
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'grey.800' }}>
              Publication Management System
            </Typography>
          </Box>
          <List sx={{ mt: 2, px: 2 }}>
            <ListItem
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                borderRadius: 1,
                mb: 1
              }}
            >
              <ListItemIcon>
                <DashboardIcon sx={{ color: 'white' }} />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItem>
            <ListItem
              component="div"
              sx={{
                borderRadius: 1,
                '&:hover': { bgcolor: 'grey.100' },
                cursor: 'pointer'
              }}
            >
              <ListItemIcon>
                <Assessment sx={{ color: 'grey.600' }} />
              </ListItemIcon>
              <ListItemText primary="Report" />
            </ListItem>
          </List>
        </Drawer>

        {/* Main Content */}
        <Box sx={{ flexGrow: 1 }}>
          {/* Header */}
          <AppBar position="static" color="inherit" elevation={1}>
            <Toolbar sx={{ justifyContent: 'space-between' }}>
              <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
                <Link underline="hover" color="inherit" href="#">Home</Link>
                <Typography color="text.primary">Staff Portal</Typography>
              </Breadcrumbs>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TextField
                  size="small"
                  placeholder="Search publications..."
                  value={globalSearchTerm}
                  onChange={(e) => setGlobalSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ width: 300 }}
                />
                <IconButton 
                  onClick={() => alert('Notifications: You have 3 new publication submissions')}
                  aria-label="notifications"
                >
                  <Badge badgeContent={3} color="error">
                    <Notifications />
                  </Badge>
                </IconButton>
                <IconButton 
                  onClick={() => alert('User Profile: Staff Member - John Doe')}
                  aria-label="user profile"
                >
                  <Avatar sx={{ width: 32, height: 32 }}>
                    <Person />
                  </Avatar>
                </IconButton>
              </Box>
            </Toolbar>
          </AppBar>

          {/* Dashboard Content */}
          <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                Review Queue
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Review and approve publication submissions
              </Typography>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid size= {{xs:12, sm:6, md:3}}>
                <Card 
                  sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }}
                  onClick={() => setActiveTab(0)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography color="text.secondary" variant="body2" sx={{ mb: 1 }}>
                          Pending Review
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                          {dynamicStats.pendingReview}
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        bgcolor: 'orange.100', 
                        borderRadius: '50%', 
                        p: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <CircularProgress size={24} sx={{ color: 'orange.500' }} />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size= {{xs:12, sm:6, md:3}}>
                <Card 
                  sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }}
                  onClick={() => {
                    setActiveTab(0);
                    setSelectedType('All Types');
                    setSelectedFaculty('All Faculties');
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography color="text.secondary" variant="body2" sx={{ mb: 1 }}>
                          Needs Fix
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                          {dynamicStats.needsFix}
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        bgcolor: 'yellow.100', 
                        borderRadius: '50%', 
                        p: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Box sx={{ 
                          width: 16, 
                          height: 16, 
                          bgcolor: 'yellow.500', 
                          transform: 'rotate(45deg)' 
                        }} />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size= {{xs:12, sm:6, md:3}}>
                <Card 
                  sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }}
                  onClick={() => setActiveTab(1)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography color="text.secondary" variant="body2" sx={{ mb: 1 }}>
                          Approved
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                          {dynamicStats.approved}
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        bgcolor: 'green.100', 
                        borderRadius: '50%', 
                        p: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Typography sx={{ color: 'green.500', fontWeight: 'bold', fontSize: 20 }}>
                          ✓
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size= {{xs:12, sm:6, md:3}}>
                <Card 
                  sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }}
                  onClick={() => {
                    setActiveTab(0);
                    clearFilters();
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography color="text.secondary" variant="body2" sx={{ mb: 1 }}>
                          Total Reviews
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                          {dynamicStats.totalReviews}
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        bgcolor: 'primary.light', 
                        borderRadius: '50%', 
                        p: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Visibility sx={{ color: 'primary.main' }} />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Search and Filters */}
            <Paper sx={{ mb: 3 }}>
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
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
                  
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <FormControl size="small" sx={{ minWidth: 160 }}>
                      <InputLabel id="faculty-select-label">Faculty</InputLabel>
                      <Select
                        labelId="faculty-select-label"
                        value={selectedFaculty}
                        label="Faculty"
                        onChange={(e) => setSelectedFaculty(e.target.value)}
                      >
                        <MenuItem value="All Faculties">All Faculties</MenuItem>
                        <MenuItem value="Faculty of Science">Faculty of Science</MenuItem>
                        <MenuItem value="Faculty of Liberal Arts">Faculty of Liberal Arts</MenuItem>
                        <MenuItem value="Faculty of Engineering">Faculty of Engineering</MenuItem>
                      </Select>
                    </FormControl>
                    
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <InputLabel id="type-select-label">Type</InputLabel>
                      <Select
                        labelId="type-select-label"
                        value={selectedType}
                        label="Type"
                        onChange={(e) => setSelectedType(e.target.value)}
                      >
                        <MenuItem value="All Types">All Types</MenuItem>
                        <MenuItem value="Journal">Journal</MenuItem>
                        <MenuItem value="Conference">Conference</MenuItem>
                      </Select>
                    </FormControl>
                    
                    <Button
                      variant="text"
                      startIcon={<Clear />}
                      onClick={clearFilters}
                    >
                      Clear Filters
                    </Button>
                  </Box>
                </Box>
              </Box>

              {/* Tabs */}
              <Box sx={{ px: 2 }}>
                <Tabs
                  value={activeTab}
                  onChange={(e, newValue) => setActiveTab(newValue)}
                  textColor="primary"
                  indicatorColor="primary"
                  aria-label="publication status tabs"
                >
                  <Tab 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        Pending Review
                        <Chip 
                          label={dynamicStats.pendingReview + dynamicStats.needsFix} 
                          size="small" 
                          color="default"
                        />
                      </Box>
                    }
                    id="tab-0"
                    aria-controls="tabpanel-0"
                  />
                  <Tab 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        Completed
                        <Chip 
                          label={dynamicStats.approved} 
                          size="small" 
                          color="default"
                        />
                      </Box>
                    }
                    id="tab-1"
                    aria-controls="tabpanel-1"
                  />
                </Tabs>
              </Box>

              {/* Table */}
              <TableContainer>
                {filteredPublications.length === 0 ? (
                  <Box sx={{ p: 6, textAlign: 'center' }} role="status" aria-live="polite">
                    <SearchIcon sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      No publications found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Try adjusting your search criteria or filters
                    </Typography>
                  </Box>
                ) : (
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Title & Submitter</TableCell>
                        <TableCell>Faculty</TableCell>
                        <TableCell>Type/Level</TableCell>
                        <TableCell>Submitted</TableCell>
                        <TableCell>Completeness</TableCell>
                        <TableCell>Priority</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredPublications.map((pub) => (
                        <TableRow key={pub.id} hover>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {pub.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                by {pub.submitter}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2">{pub.faculty}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {pub.department}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2">{pub.type}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {pub.level}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{pub.submitted}</Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={pub.completeness}
                                sx={{ width: 80, height: 6, borderRadius: 3 }}
                              />
                              <Typography variant="body2">{pub.completeness}%</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={pub.priority}
                              size="small"
                              color={getPriorityColor(pub.priority) as any}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={pub.status}
                              size="small"
                              color={getStatusColor(pub.status) as any}
                              variant="filled"
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => handleReview(pub.id)}
                              aria-label={`Review ${pub.title}`}
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

            {/* Results Summary */}
            {filteredPublications.length > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Showing {filteredPublications.length} of {publications.length} publications
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchTerm || globalSearchTerm || selectedFaculty !== 'All Faculties' || selectedType !== 'All Types' 
                    ? 'Filters applied' 
                    : 'No filters applied'}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default StaffDashboard;

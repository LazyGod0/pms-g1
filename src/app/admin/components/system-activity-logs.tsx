"use client";

import React, { useState, useEffect } from "react";
import {
    Box,
    Card,
    CardContent,
    CardHeader,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Chip,
    Avatar,
    Stack,
    Alert,
    CircularProgress,
    IconButton,
    Tooltip,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    InputAdornment,
    Pagination,
} from "@mui/material";
import {
    LoginOutlined as LoginIcon,
    LogoutOutlined as LogoutIcon,
    EditOutlined as EditIcon,
    VisibilityOutlined as ViewIcon,
    HistoryOutlined as HistoryIcon,
    DeleteOutlined as DeleteIcon,
    AddOutlined as AddIcon,
    Person as PersonIcon,
    Security as SecurityIcon,
    Work as WorkIcon,
    School as SchoolIcon,
    SearchOutlined as SearchIcon,
    RefreshOutlined as RefreshIcon,
} from "@mui/icons-material";
import { collection, query, orderBy, limit, getDocs, getFirestore, Timestamp, where } from "firebase/firestore";

const db = getFirestore();

// Enhanced interface matching the activity logger structure
interface ActivityLog {
    id: string;
    userId: string;
    userEmail: string;
    userName: string;
    userRole: string;
    action: string;
    actionText: string;
    category: string;
    targetType?: string;
    targetId?: string;
    targetName?: string;
    method?: string;
    ipAddress?: string;
    userAgent?: string;
    details?: string;
    metadata?: Record<string, any>;
    severity?: "low" | "medium" | "high" | "critical";
    timestamp: Timestamp;
    createdAt: Timestamp;
    sessionId?: string;
}

interface SystemActivityLogsProps {
    className?: string;
}

export default function SystemActivityLogs({ className }: SystemActivityLogsProps) {
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState<string>("");
    const [filterSeverity, setFilterSeverity] = useState<string>("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchAllActivities();
    }, []);

    const fetchAllActivities = async () => {
        setLoading(true);
        setError(null);

        try {
            console.log("Fetching all system activities...");

            const activitiesRef = collection(db, "activities");
            const q = query(
                activitiesRef,
                orderBy("createdAt", "desc"),
                limit(200) // จำกัดไว้ 200 รายการล่าสุด
            );

            const querySnapshot = await getDocs(q);
            const activitiesData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as ActivityLog[];

            console.log(`Found ${activitiesData.length} activities`);

            if (activitiesData.length > 0) {
                setActivities(activitiesData);
                setError(null);
            } else {
                setError("ไม่พบข้อมูลประวัติการใช้งานในระบบ");
                // สร้างข้อมูลตัวอย่าง
                setActivities([
                    {
                        id: "sample-1",
                        userId: "admin-user",
                        userEmail: "admin@example.com",
                        userName: "ผู้ดูแลระบบ",
                        userRole: "admin",
                        action: "login",
                        actionText: "เข้าสู่ระบบ",
                        category: "auth",
                        method: "web",
                        targetType: "system",
                        targetName: "Admin Dashboard",
                        severity: "low",
                        timestamp: Timestamp.now(),
                        createdAt: Timestamp.now(),
                        details: "ข้อมูลตัวอย่าง - กรุณาคลิกปุ่ม 'ทดสอบ Activity Logs' เพื่อสร้างข้อมูลจริง",
                        ipAddress: "192.168.1.100"
                    }
                ]);
            }
        } catch (err: any) {
            console.error("Error fetching activities:", err);
            setError(`เกิดข้อผิดพลาดในการโหลดข้อมูล: ${err.message}`);
            setActivities([]);
        } finally {
            setLoading(false);
        }
    };

    // Filter activities based on search and filters
    const filteredActivities = React.useMemo(() => {
        return activities.filter(activity => {
            const matchesSearch = !searchTerm ||
                activity.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                activity.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                activity.actionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
                activity.details?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCategory = !filterCategory || activity.category === filterCategory;
            const matchesSeverity = !filterSeverity || activity.severity === filterSeverity;

            return matchesSearch && matchesCategory && matchesSeverity;
        });
    }, [activities, searchTerm, filterCategory, filterSeverity]);

    // Pagination
    const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
    const currentActivities = React.useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredActivities.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredActivities, currentPage]);

    const getActionIcon = (action: string, severity?: string) => {
        const iconProps = { fontSize: "small" as const, color: getSeverityColor(severity) as any };

        switch (action) {
            case "login": return <LoginIcon {...iconProps} />;
            case "logout": return <LogoutIcon {...iconProps} />;
            case "edit": return <EditIcon {...iconProps} />;
            case "view": return <ViewIcon {...iconProps} />;
            case "delete": return <DeleteIcon {...iconProps} />;
            case "create": return <AddIcon {...iconProps} />;
            default: return <HistoryIcon {...iconProps} />;
        }
    };

    const getSeverityColor = (severity?: string) => {
        switch (severity) {
            case "critical": return "error";
            case "high": return "warning";
            case "medium": return "info";
            case "low":
            default: return "success";
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case "auth": return <SecurityIcon fontSize="small" />;
            case "user_management": return <PersonIcon fontSize="small" />;
            case "content": return <WorkIcon fontSize="small" />;
            case "system": return <SchoolIcon fontSize="small" />;
            default: return <HistoryIcon fontSize="small" />;
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case "admin": return "error";
            case "lecturer": return "primary";
            case "staff": return "success";
            case "student": return "info";
            default: return "default";
        }
    };

    const formatTimestamp = (timestamp: Timestamp) => {
        const date = timestamp.toDate();
        return new Intl.DateTimeFormat('th-TH', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Bangkok'
        }).format(date);
    };

    return (
        <Card variant="outlined" sx={{ borderRadius: 3 }} className={className}>
            <CardHeader
                title={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <HistoryIcon color="primary" />
                        <Typography variant="h6" component="div">
                            ประวัติการใช้งานระบบทั้งหมด
                        </Typography>
                    </Box>
                }
                action={
                    <IconButton onClick={fetchAllActivities} disabled={loading}>
                        <RefreshIcon />
                    </IconButton>
                }
            />

            <CardContent>
                {/* Search and Filter Controls */}
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
                    <TextField
                        size="small"
                        placeholder="ค้นหาผู้ใช้, การกระทำ, หรือรายละเอียด..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ minWidth: 300 }}
                    />

                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>หมวดหมู่</InputLabel>
                        <Select
                            value={filterCategory}
                            label="หมวดหมู่"
                            onChange={(e) => setFilterCategory(e.target.value)}
                        >
                            <MenuItem value="">ทั้งหมด</MenuItem>
                            <MenuItem value="auth">Authentication</MenuItem>
                            <MenuItem value="user_management">User Management</MenuItem>
                            <MenuItem value="content">Content</MenuItem>
                            <MenuItem value="system">System</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>ความสำคัญ</InputLabel>
                        <Select
                            value={filterSeverity}
                            label="ความสำคัญ"
                            onChange={(e) => setFilterSeverity(e.target.value)}
                        >
                            <MenuItem value="">ทั้งหมด</MenuItem>
                            <MenuItem value="low">Low</MenuItem>
                            <MenuItem value="medium">Medium</MenuItem>
                            <MenuItem value="high">High</MenuItem>
                            <MenuItem value="critical">Critical</MenuItem>
                        </Select>
                    </FormControl>
                </Stack>

                {/* Results Info */}
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    แสดงผลลัพธ์ {filteredActivities.length} รายการ จากทั้งหมด {activities.length} รายการ
                </Typography>

                {/* Error Alert */}
                {error && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* Loading State */}
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                        <Stack alignItems="center" spacing={2}>
                            <CircularProgress />
                            <Typography variant="body2" color="text.secondary">
                                กำลังโหลดประวัติการใช้งาน...
                            </Typography>
                        </Stack>
                    </Box>
                ) : (
                    <>
                        {/* Activity Table */}
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell width="60">การกระทำ</TableCell>
                                        <TableCell width="120">ผู้ใช้</TableCell>
                                        <TableCell>รายละเอียด</TableCell>
                                        <TableCell width="100">หมวดหมู่</TableCell>
                                        <TableCell width="80">ความสำคัญ</TableCell>
                                        <TableCell width="140">เวลา</TableCell>
                                        <TableCell width="100">IP Address</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {currentActivities.map((activity) => (
                                        <TableRow key={activity.id} hover>
                                            <TableCell>
                                                <Tooltip title={activity.actionText}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        {getActionIcon(activity.action, activity.severity)}
                                                        {getCategoryIcon(activity.category)}
                                                    </Box>
                                                </Tooltip>
                                            </TableCell>

                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                                                        {activity.userName.charAt(0)}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>
                                                            {activity.userName}
                                                        </Typography>
                                                        <Chip
                                                            label={activity.userRole}
                                                            size="small"
                                                            color={getRoleColor(activity.userRole) as any}
                                                            sx={{ height: 16, fontSize: '0.65rem' }}
                                                        />
                                                    </Box>
                                                </Box>
                                            </TableCell>

                                            <TableCell>
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                        {activity.actionText}
                                                    </Typography>
                                                    {activity.targetName && (
                                                        <Typography variant="caption" color="text.secondary">
                                                            → {activity.targetName}
                                                        </Typography>
                                                    )}
                                                    {activity.details && (
                                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                                            {activity.details.length > 50
                                                                ? `${activity.details.substring(0, 50)}...`
                                                                : activity.details}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </TableCell>

                                            <TableCell>
                                                <Chip
                                                    label={activity.category}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ fontSize: '0.7rem' }}
                                                />
                                            </TableCell>

                                            <TableCell>
                                                <Chip
                                                    label={activity.severity || 'low'}
                                                    size="small"
                                                    color={getSeverityColor(activity.severity) as any}
                                                    sx={{ fontSize: '0.7rem' }}
                                                />
                                            </TableCell>

                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                                                    {formatTimestamp(activity.createdAt || activity.timestamp)}
                                                </Typography>
                                            </TableCell>

                                            <TableCell>
                                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                                                    {activity.ipAddress || '-'}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))}

                                    {currentActivities.length === 0 && !loading && (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                                <Typography color="text.secondary">
                                                    ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                                <Pagination
                                    count={totalPages}
                                    page={currentPage}
                                    onChange={(_, value) => setCurrentPage(value)}
                                    color="primary"
                                    size="small"
                                />
                            </Box>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}

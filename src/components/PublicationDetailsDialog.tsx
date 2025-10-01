"use client";

import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Stack,
    Chip,
    Divider,
    IconButton,
    Paper,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    CircularProgress,
    Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PersonIcon from "@mui/icons-material/Person";
import CategoryIcon from "@mui/icons-material/Category";
import PublicIcon from "@mui/icons-material/Public";
import { db } from "@/configs/firebase-config";
import { doc, getDoc } from "firebase/firestore";

type AttachedFile = {
    name: string;
    url: string;
    size?: number | null;
    type?: string | null;
    path?: string;
    uploadedAt?: string;
};

type PublicationDetails = {
    id: string;
    title: string;
    authors: { name: string; affiliation?: string; email?: string; authorType?: string }[];
    year: number;
    type: string;
    level: string;
    abstract?: string;
    keywords?: string[];
    doi?: string;
    url?: string;
    attachments?: { files: AttachedFile[] };
    status?: string;
    createdAt?: Date;
    submittedAt?: Date;
};

interface PublicationDetailsDialogProps {
    open: boolean;
    onClose: () => void;
    publicationId: string;
    refPath: string;
}

const getFileIcon = (fileType: string | undefined | null) => {
    if (!fileType) return <InsertDriveFileIcon color="action" />;
    const type = fileType.toLowerCase();
    if (type.includes('pdf')) return <PictureAsPdfIcon color="error" />;
    if (type.includes('doc') || type.includes('word')) return <DescriptionIcon color="primary" />;
    return <InsertDriveFileIcon color="action" />;
};

const formatFileSize = (bytes: number | undefined | null): string => {
    // Handle various falsy values but allow actual 0
    if (bytes === null || bytes === undefined) return 'ไม่ระบุขนาด';
    if (isNaN(bytes) || bytes < 0) return 'ไม่ระบุขนาด';
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const calculatedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
    return calculatedSize + ' ' + sizes[i];
};

export default function PublicationDetailsDialog({
    open,
    onClose,
    publicationId,
    refPath
}: PublicationDetailsDialogProps) {
    const [loading, setLoading] = useState(false);
    const [publication, setPublication] = useState<PublicationDetails | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open && refPath) {
            fetchPublicationDetails();
        }
    }, [open, refPath]);

    const fetchPublicationDetails = async () => {
        setLoading(true);
        setError(null);

        try {
            const docRef = doc(db, refPath);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();

                // Process attachments with better error handling for file sizes
                let processedAttachments = { files: [] };
                if (data.attachments?.files && Array.isArray(data.attachments.files)) {
                    processedAttachments.files = data.attachments.files.map((file: any) => ({
                        name: file.name || 'Unknown File',
                        url: file.url || '',
                        size: typeof file.size === 'number' ? file.size : null,
                        type: file.type || null,
                        path: file.path || '',
                        uploadedAt: file.uploadedAt || '',
                    }));
                }

                const details: PublicationDetails = {
                    id: docSnap.id,
                    title: data.basics?.title || "Untitled",
                    authors: data.authors || [],
                    year: data.basics?.year || 0,
                    type: data.basics?.type || "",
                    level: data.basics?.level || "",
                    abstract: data.basics?.abstract || "",
                    keywords: data.basics?.keywords || [],
                    doi: data.identifiers?.doi || "",
                    url: data.identifiers?.url || "",
                    attachments: processedAttachments,
                    status: data.status || "",
                    createdAt: data.createdAt?.toDate(),
                    submittedAt: data.submittedAt?.toDate(),
                };

                setPublication(details);
            } else {
                setError("Publication not found");
            }
        } catch (err) {
            console.error("Error fetching publication details:", err);
            setError("Failed to load publication details");
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = (file: AttachedFile) => {
        if (file?.url && file?.name) {
            const link = document.createElement('a');
            link.href = file.url;
            link.download = file.name;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const getStatusColor = (status: string | undefined) => {
        if (!status) return 'default';
        switch (status.toLowerCase()) {
            case 'approved': return 'success';
            case 'submitted': case 'pending': return 'warning';
            case 'rejected': return 'error';
            case 'draft': return 'default';
            default: return 'default';
        }
    };

    const getStatusLabel = (status: string | undefined) => {
        if (!status) return 'ไม่ระบุ';
        switch (status.toLowerCase()) {
            case 'approved': return 'อนุมัติแล้ว';
            case 'submitted': case 'pending': return 'รอการพิจารณา';
            case 'rejected': return 'ไม่อนุมัติ';
            case 'draft': return 'ร่าง';
            default: return status;
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 3, maxHeight: '90vh' }
            }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h5" fontWeight={600}>
                        รายละเอียดผลงานตีพิมพ์
                    </Typography>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ px: 3 }}>
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" py={4}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error" sx={{ my: 2 }}>
                        {error}
                    </Alert>
                ) : publication ? (
                    <Stack spacing={3}>
                        {/* Title */}
                        <Box>
                            <Typography variant="h6" fontWeight={600} gutterBottom>
                                {publication.title}
                            </Typography>
                            {publication.status && (
                                <Chip
                                    label={getStatusLabel(publication.status)}
                                    color={getStatusColor(publication.status) as any}
                                    size="small"
                                    sx={{ mb: 1 }}
                                />
                            )}
                        </Box>

                        {/* Basic Info */}
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                            <Stack spacing={2}>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <PersonIcon fontSize="small" color="action" />
                                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                        ผู้แต่ง:
                                    </Typography>
                                    <Typography variant="body2">
                                        {publication.authors.length > 0
                                            ? publication.authors.map(a => a.name).join(", ")
                                            : "ไม่ระบุ"
                                        }
                                    </Typography>
                                </Box>

                                <Box display="flex" alignItems="center" gap={1}>
                                    <CalendarTodayIcon fontSize="small" color="action" />
                                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                        ปี:
                                    </Typography>
                                    <Typography variant="body2">
                                        {publication.year || "ไม่ระบุ"}
                                    </Typography>
                                </Box>

                                <Box display="flex" alignItems="center" gap={1}>
                                    <CategoryIcon fontSize="small" color="action" />
                                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                        ประเภท:
                                    </Typography>
                                    <Chip
                                        label={publication.type || "ไม่ระบุ"}
                                        size="small"
                                        color={publication.type === "Journal" ? "primary" : "secondary"}
                                        variant="outlined"
                                    />
                                </Box>

                                <Box display="flex" alignItems="center" gap={1}>
                                    <PublicIcon fontSize="small" color="action" />
                                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                        ระดับ:
                                    </Typography>
                                    <Chip
                                        label={publication.level || "ไม่ระบุ"}
                                        size="small"
                                        color={publication.level === "International" ? "success" : "default"}
                                        variant="outlined"
                                    />
                                </Box>
                            </Stack>
                        </Paper>

                        {/* Abstract */}
                        {publication.abstract && (
                            <Box>
                                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                    บทคัดย่อ
                                </Typography>
                                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                    <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                                        {publication.abstract}
                                    </Typography>
                                </Paper>
                            </Box>
                        )}

                        {/* Keywords */}
                        {publication.keywords && publication.keywords.length > 0 && (
                            <Box>
                                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                    คำสำคัญ
                                </Typography>
                                <Box display="flex" flexWrap="wrap" gap={1}>
                                    {publication.keywords.map((keyword, index) => (
                                        <Chip
                                            key={index}
                                            label={keyword}
                                            size="small"
                                            variant="outlined"
                                        />
                                    ))}
                                </Box>
                            </Box>
                        )}

                        {/* DOI/URL */}
                        {(publication.doi || publication.url) && (
                            <Box>
                                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                    ลิงก์อ้างอิง
                                </Typography>
                                <Stack spacing={1}>
                                    {publication.doi && (
                                        <Typography variant="body2">
                                            <strong>DOI:</strong>{' '}
                                            <a
                                                href={`https://doi.org/${publication.doi}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {publication.doi}
                                            </a>
                                        </Typography>
                                    )}
                                    {publication.url && (
                                        <Typography variant="body2">
                                            <strong>URL:</strong>{' '}
                                            <a
                                                href={publication.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {publication.url}
                                            </a>
                                        </Typography>
                                    )}
                                </Stack>
                            </Box>
                        )}

                        {/* Attachments */}
                        {publication.attachments?.files && publication.attachments.files.length > 0 && (
                            <Box>
                                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                    ไฟล์แนบ
                                </Typography>
                                <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                                    <List dense>
                                        {publication.attachments.files.map((file, index) => (
                                            <ListItem
                                                key={index}
                                                secondaryAction={
                                                    <IconButton
                                                        edge="end"
                                                        onClick={() => handleDownload(file)}
                                                        color="primary"
                                                        size="small"
                                                    >
                                                        <DownloadIcon />
                                                    </IconButton>
                                                }
                                            >
                                                <ListItemIcon>
                                                    {getFileIcon(file.type)}
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={file.name}
                                                    secondary={formatFileSize(file.size)}
                                                    primaryTypographyProps={{
                                                        variant: 'body2',
                                                        fontWeight: 500
                                                    }}
                                                    secondaryTypographyProps={{
                                                        variant: 'caption'
                                                    }}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Paper>
                            </Box>
                        )}
                    </Stack>
                ) : null}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} variant="outlined">
                    ปิด
                </Button>
            </DialogActions>
        </Dialog>
    );
}

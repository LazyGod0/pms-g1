"use client";
import * as React from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  Stack,
  LinearProgress,
  Alert,
  Paper,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import { SubmissionForm, AttachedFile } from "@/types/submission";
import {
  uploadMultipleFiles,
  deletePublicationFile,
  formatFileSize,
  validateFileSize,
  validateFileType,
  UploadProgress,
} from "@/libs/file-upload";
import { useAuth } from "@/contexts";

type Props = {
  value: SubmissionForm["attachments"];
  onChange: (next: SubmissionForm["attachments"]) => void;
  submissionId?: string;
};

export default function AttachmentsStep({ value, onChange, submissionId = "temp" }: Props) {
  const { user } = useAuth();
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState<UploadProgress | null>(null);
  const [errors, setErrors] = React.useState<string[]>([]);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0 || !user?.uid) return;

    // ตรวจสอบไฟล์ก่อนอัปโหลด
    const fileArray = Array.from(files);
    const validationErrors: string[] = [];

    fileArray.forEach((file) => {
      if (!validateFileSize(file)) {
        validationErrors.push(
          `${file.name}: ขนาดไฟล์เกิน 10MB (ขนาดปัจจุบัน: ${formatFileSize(file.size)})`
        );
      }
      if (!validateFileType(file)) {
        validationErrors.push(`${file.name}: ชนิดไฟล์ไม่ได้รับอนุญาต`);
      }
    });

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    setUploading(true);

    try {
      const uploadedFiles = await uploadMultipleFiles(
        fileArray,
        user.uid,
        submissionId,
        (progress) => setUploadProgress(progress)
      );

      // เพิ่มไฟล์ที่อัปโหลดสำเร็จเข้าไปในรายการ
      const updatedFiles = [...(value.files || []), ...uploadedFiles];
      onChange({ files: updatedFiles });

      console.log("✅ All files uploaded successfully:", uploadedFiles);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      setErrors([errorMsg]);
      console.error("❌ Upload failed:", error);
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };

  const handleFileDelete = async (fileToDelete: AttachedFile) => {
    try {
      // ลบไฟล์จาก Firebase Storage
      await deletePublicationFile(fileToDelete.path);

      // ลบออกจากรายการ
      const updatedFiles = (value.files || []).filter((f) => f.path !== fileToDelete.path);
      onChange({ files: updatedFiles });

      console.log("🗑️ File deleted successfully:", fileToDelete.name);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      setErrors([`ไม่สามารถลบไฟล์ ${fileToDelete.name}: ${errorMsg}`]);
      console.error("❌ Delete failed:", error);
    }
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  };

  const getFileIcon = (fileType: string) => {
    // Add null/undefined check to prevent runtime error
    if (!fileType) return "📄";
    if (fileType.includes("pdf")) return "📄";
    if (fileType.includes("word")) return "📝";
    if (fileType.includes("image")) return "🖼️";
    if (fileType.includes("zip")) return "📦";
    return "📄";
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} mb={1}>
        Upload Files
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        อัปโหลดไฟล์ผลงานของคุณ (PDF, DOC, DOCX, ZIP, JPG, PNG, TXT) ขนาดสูงสุด 10MB ต่อไฟล์
      </Typography>

      {/* Error Messages */}
      {errors.length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            เกิดข้อผิดพลาด:
          </Typography>
          {errors.map((error, index) => (
            <Typography key={index} variant="body2">
              • {error}
            </Typography>
          ))}
        </Alert>
      )}

      {/* Upload Area */}
      <Paper
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        sx={{
          border: "2px dashed",
          borderColor: uploading ? "primary.main" : "grey.300",
          borderRadius: 2,
          p: 4,
          textAlign: "center",
          bgcolor: uploading ? "primary.50" : "grey.50",
          transition: "all 0.3s ease",
          cursor: uploading ? "wait" : "pointer",
          mb: 3,
          "&:hover": {
            borderColor: "primary.main",
            bgcolor: "primary.50",
          },
        }}
        onClick={() => !uploading && inputRef.current?.click()}
      >
        <CloudUploadIcon
          sx={{
            fontSize: 48,
            color: uploading ? "primary.main" : "grey.400",
            mb: 1,
          }}
        />

        {uploading ? (
          <Box>
            <Typography variant="h6" color="primary" gutterBottom>
              กำลังอัปโหลด...
            </Typography>
            {uploadProgress && (
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {uploadProgress.fileName} ({uploadProgress.progress}%)
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={uploadProgress.progress}
                  sx={{ mt: 1, borderRadius: 1 }}
                />
              </Box>
            )}
          </Box>
        ) : (
          <Box>
            <Typography variant="h6" gutterBottom>
              ลากไฟล์มาที่นี่ หรือคลิกเพื่อเลือกไฟล์
            </Typography>
            <Typography variant="body2" color="text.secondary">
              รองรับไฟล์: PDF, DOC, DOCX, ZIP, JPG, PNG, TXT
            </Typography>
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              startIcon={<CloudUploadIcon />}
              disabled={uploading}
            >
              เลือกไฟล์
            </Button>
          </Box>
        )}

        <input
          ref={inputRef}
          type="file"
          multiple
          hidden
          onChange={(e) => handleFileSelect(e.target.files)}
          accept=".pdf,.doc,.docx,.zip,.jpg,.jpeg,.png,.txt"
          disabled={uploading}
        />
      </Paper>

      {/* File List */}
      {value.files && value.files.length > 0 && (
        <Paper sx={{ borderRadius: 2 }}>
          <Box sx={{ p: 2, bgcolor: "grey.50" }}>
            <Typography variant="h6" fontWeight={600}>
              ไฟล์ที่อัปโหลดแล้ว ({value.files.length} ไฟล์)
            </Typography>
          </Box>
          <Divider />
          <List sx={{ p: 0 }}>
            {value.files.map((file, index) => (
              <React.Fragment key={file.path}>
                <ListItem sx={{ py: 2 }}>
                  <Box sx={{ mr: 2, fontSize: "1.5rem" }}>{getFileIcon(file.type)}</Box>
                  <ListItemText
                    primary={
                      <Typography variant="body1" fontWeight={500}>
                        {file.name}
                      </Typography>
                    }
                    secondary={
                      <Box component="span" sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                        <Typography variant="caption" color="text.secondary" component="span">
                          {formatFileSize(file.size)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" component="span">
                          อัปโหลดเมื่อ:{" "}
                          {new Date(file.uploadedAt).toLocaleString("th-TH")}
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        edge="end"
                        color="primary"
                        onClick={() => window.open(file.url, "_blank")}
                        title="ดาวน์โหลดไฟล์"
                      >
                        <DownloadIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        color="error"
                        onClick={() => handleFileDelete(file)}
                        title="ลบไฟล์"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < value.files.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}

      {/* Summary */}
      {value.files && value.files.length === 0 && (
        <Alert severity="info">
          <Typography variant="body2">
            ยังไม่มีไฟล์ที่อัปโหลด กรุณาเลือกไฟล์เพื่ออัปโหลด
          </Typography>
        </Alert>
      )}
    </Box>
  );
}

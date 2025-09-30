"use client";
import * as React from "react";
import { Box, Typography, Button, Chip, Stack } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { SubmissionForm } from "@/types/submission";

type Props = {
  value: SubmissionForm["attachments"];
  onChange: (next: SubmissionForm["attachments"]) => void;
};

export default function AttachmentsStep({ value, onChange }: Props) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const addFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const names = Array.from(files).map((f) => f.name);
    onChange({ ...value, files: Array.from(new Set([...(value.files ?? []), ...names])) });
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
  };

  return (
    <Box>
      <Typography fontWeight={700} mb={1}>Upload Files</Typography>
      <Typography variant="body2" color="text.secondary" mb={1}>
        Upload your publication files (PDF, DOC, etc.). Maximum file size: 10MB per file.
      </Typography>

      <Box
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        sx={{
          border: "2px dashed #d6d6d6",
          borderRadius: 2,
          p: 4,
          textAlign: "center",
          color: "text.secondary",
          mb: 2,
        }}
      >
        <CloudUploadIcon />
        <Typography mt={1}>Drag files here or click to browse</Typography>
        <Button
          sx={{ mt: 2 }}
          variant="contained"
          onClick={() => inputRef.current?.click()}
        >
          Choose Files
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          hidden
          onChange={(e) => addFiles(e.target.files)}
          accept=".pdf,.doc,.docx,.zip"
        />
      </Box>

      <Stack direction="row" spacing={1} flexWrap="wrap">
        {(value.files ?? []).map((f) => (
          <Chip
            key={f}
            label={f}
            onDelete={() =>
              onChange({ ...value, files: (value.files ?? []).filter((x) => x !== f) })
            }
          />
        ))}
      </Stack>
    </Box>
  );
}

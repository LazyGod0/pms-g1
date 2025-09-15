"use client";
import * as React from "react";
import { Box, Button, List, ListItem, ListItemText, Paper, Typography } from "@mui/material";
import SectionCard from "../publications/SectionCard";

export default function AttachmentsStep() {
    const [files, setFiles] = React.useState<File[]>([]);
    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles([...files, ...Array.from(e.target.files)]);
        }
    };
    return (
        <SectionCard title="Attachments">
            <Paper variant="outlined" sx={{ borderStyle: "dashed", p: 4, textAlign: "center" }}>
                <Typography variant="h6" gutterBottom>Drag files here or click to browse</Typography>
                <Button variant="contained" component="label">
                    Choose Files
                    <input type="file" hidden multiple onChange={handleUpload} />
                </Button>
            </Paper>
            <Box mt={3}>
                <List>
                    {files.map((f, idx) => <ListItem key={idx}><ListItemText primary={f.name} /></ListItem>)}
                    {files.length === 0 && <ListItem><ListItemText primary="0 files" /></ListItem>}
                </List>
            </Box>
        </SectionCard>
    );
}
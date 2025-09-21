"use client";
import * as React from "react";
import { Box, Button, Grid, List, ListItem, ListItemSecondaryAction, ListItemText, TextField, Typography } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SectionCard from "../publications/SectionCard";

type Reference = {
    title: string;
    authors: string;
    year: string;
    link: string;
};

export default function IdentifiersStep() {
    const [doi, setDoi] = React.useState("");
    const [url, setUrl] = React.useState("");
    const [references, setReferences] = React.useState<Reference[]>([]);
    const [ref, setRef] = React.useState<Reference>({ title: "", authors: "", year: "", link: "" });


    const handleAdd = () => {
        if (ref.title) {
            setReferences([...references, ref]);
            setRef({ title: "", authors: "", year: "", link: "" });
        }
    };

    return (
        <SectionCard title="Identifiers">
            <Grid container spacing={2}>
                <Grid size={{xs:12,md:6}}><TextField fullWidth label="DOI" value={doi} onChange={(e) => setDoi(e.target.value)} /></Grid>
                <Grid size={{xs:12,md:6}}><TextField fullWidth label="URL" value={url} onChange={(e) => setUrl(e.target.value)} /></Grid>
            </Grid>
            <Box mt={3}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>Add Reference</Typography>
                <Grid container spacing={2}>
                    <Grid size={{xs:12,md:6}}><TextField fullWidth label="Title *" value={ref.title} onChange={(e) => setRef({ ...ref, title: e.target.value })} /></Grid>
                    <Grid size={{xs:12,md:6}}><TextField fullWidth label="Authors *" value={ref.authors} onChange={(e) => setRef({ ...ref, authors: e.target.value })} /></Grid>
                    <Grid size={{xs:12,md:3}}><TextField fullWidth label="Year *" value={ref.year} onChange={(e) => setRef({ ...ref, year: e.target.value })} /></Grid>
                    <Grid size={{xs:12,md:9}}><TextField fullWidth label="Link/DOI" value={ref.link} onChange={(e) => setRef({ ...ref, link: e.target.value })} /></Grid>
                    <Grid size={{xs:12}}><Button variant="contained" fullWidth onClick={handleAdd}>+ Add Reference</Button></Grid>
                </Grid>
            </Box>
            <Box mt={3}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>References ({references.length})</Typography>
                <List>
                    {references.map((r, idx) => (
                        <ListItem key={idx} divider>
                            <ListItemText primary={r.title} secondary={`${r.authors} (${r.year})`} />
                            <ListItemSecondaryAction>
                                <Button size="small" color="error" onClick={() => setReferences(references.filter((_, i) => i !== idx))} startIcon={<DeleteOutlineIcon />}>Remove</Button>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                </List>
            </Box>
        </SectionCard>
    );
}
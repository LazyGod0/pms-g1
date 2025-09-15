"use client";
import * as React from "react";
import { Box, Button, FormControl, Grid, InputLabel, List, ListItem, ListItemSecondaryAction, ListItemText, MenuItem, Select, TextField, Typography } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SectionCard from "../publications/SectionCard";

type Author = {
    name: string;
    email: string;
    affiliation: string;
    role: string;
};

export default function AuthorsStep() {
    const [authors, setAuthors] = React.useState<Author[]>([]);
    const [author, setAuthor] = React.useState<Author>({ name: "", email: "", affiliation: "", role: "Author" });


    const handleAdd = () => {
        if (author.name && author.email) {
            setAuthors([...authors, author]);
            setAuthor({ name: "", email: "", affiliation: "", role: "Author" });
        }
    };

    return (
        <SectionCard title="Authors">
            <Grid container spacing={2}>
                <Grid size={{xs:12,md:6}}><TextField fullWidth label="Name *" value={author.name} onChange={(e) => setAuthor({ ...author, name: e.target.value })} /></Grid>
                <Grid size={{xs:12,md:6}}><TextField fullWidth label="Email *" value={author.email} onChange={(e) => setAuthor({ ...author, email: e.target.value })} /></Grid>
                <Grid size={{xs:12,md:6}}><TextField fullWidth label="Affiliation *" value={author.affiliation} onChange={(e) => setAuthor({ ...author, affiliation: e.target.value })} /></Grid>
                <Grid size={{xs:12,md:6}}>
                    <FormControl fullWidth>
                        <InputLabel>Role</InputLabel>
                        <Select value={author.role} onChange={(e) => setAuthor({ ...author, role: e.target.value })}>
                            <MenuItem value="Author">Author</MenuItem>
                            <MenuItem value="Co-author">Co-author</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid size={{xs:12}}><Button variant="contained" fullWidth onClick={handleAdd}>+ Add Author</Button></Grid>
            </Grid>
            <Box mt={3}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>Authors ({authors.length})</Typography>
                <List>
                    {authors.map((a, idx) => (
                        <ListItem key={idx} divider>
                            <ListItemText primary={a.name} secondary={`${a.email} | ${a.affiliation}`} />
                            <ListItemSecondaryAction>
                                <Button size="small" color="error" onClick={() => setAuthors(authors.filter((_, i) => i !== idx))} startIcon={<DeleteOutlineIcon />}>Remove</Button>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                </List>
            </Box>
        </SectionCard>
    );
}
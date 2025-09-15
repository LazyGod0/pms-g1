"use client";
import * as React from "react";
import { Button, Chip, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField } from "@mui/material";
import SectionCard from "@/app/component/publications/SectionCard";

export default function BasicsStep() {
    const [keywords, setKeywords] = React.useState<string[]>([]);
    const [newKeyword, setNewKeyword] = React.useState("");


    const handleAddKeyword = () => {
        const k = newKeyword.trim();
        if (!k) return;
        setKeywords((prev) => [...prev, k]);
        setNewKeyword("");
    };
    const displayKeywords = keywords.filter((k) => k.trim().length > 0);

    return (
        <SectionCard title="Basics">
            <Grid container spacing={2}>
                <Grid size={{xs:12}}><TextField fullWidth label="Publication Title *" defaultValue="" /></Grid>
                <Grid size={{xs:12,md:4}}>
                    <FormControl fullWidth>
                        <InputLabel>Year *</InputLabel>
                        <Select defaultValue="">
                            {["2023", "2024", "2025", "2026"].map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid size={{xs:12,md:4}}>
                    <FormControl fullWidth>
                        <InputLabel>Type *</InputLabel>
                        <Select defaultValue="">
                            <MenuItem value="Journal">Journal</MenuItem>
                            <MenuItem value="Conference">Conference</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid size={{xs:12,md:4}}>
                    <FormControl fullWidth>
                        <InputLabel>Level *</InputLabel>
                        <Select defaultValue="">
                            <MenuItem value="National">National</MenuItem>
                            <MenuItem value="International">International</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid size={{xs:12}}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <TextField
                            fullWidth
                            label="Keywords"
                            value={newKeyword}
                            onChange={(e) => setNewKeyword(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddKeyword(); } }}
                        />
                        <Button variant="contained" onClick={handleAddKeyword}>Add</Button>
                    </Stack>
                    {displayKeywords.length > 0 && (
                        <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
                            {displayKeywords.map((k) => <Chip key={k} label={k} />)}
                        </Stack>
                    )}
                </Grid>
                <Grid size={{xs:12}}><TextField fullWidth label="Abstract *" multiline minRows={4} /></Grid>
            </Grid>
        </SectionCard>
    );
}
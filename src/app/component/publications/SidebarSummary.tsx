"use client";
import * as React from "react";
import { Box, Card, CardContent, LinearProgress, Stack, Typography } from "@mui/material";
import { MOCK } from "./mock";

export default function SidebarSummary({ progress }: { progress: number }) {
    return (
        <Stack spacing={2}>
            <Card variant="outlined">
                <CardContent>
                    <Typography variant="h6" gutterBottom>Progress</Typography>
                    <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 10 }} />
                    <Box mt={1} textAlign="right"><Typography variant="caption">{progress}%</Typography></Box>
                </CardContent>
            </Card>
            <Card variant="outlined">
                <CardContent>
                    <Typography variant="h6" gutterBottom>Summary</Typography>
                    <Stack spacing={1.2}>
                        <Box>
                            <Typography variant="caption" color="text.secondary">Title:</Typography>
                            <Typography>{MOCK.basics.title || "-"}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" color="text.secondary">Type:</Typography>
                            <Typography>{MOCK.basics.type || "-"}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" color="text.secondary">Authors:</Typography>
                            <Typography>{MOCK.authors.length}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" color="text.secondary">Keywords:</Typography>
                            <Typography>{MOCK.basics.keywords.length}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" color="text.secondary">References:</Typography>
                            <Typography>{MOCK.identifiers.references.length}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" color="text.secondary">Files:</Typography>
                            <Typography>{MOCK.files.length}</Typography>
                        </Box>
                    </Stack>
                </CardContent>
            </Card>
        </Stack>
    );
}
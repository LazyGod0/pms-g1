"use client";
import * as React from "react";
import { Card, CardContent, Typography } from "@mui/material";


export default function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                    {title}
                </Typography>
                {children}
            </CardContent>
        </Card>
    );
}
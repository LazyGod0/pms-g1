"use client";

import React from "react";
import { useNotifications } from "@/contexts";
import {
    Alert,
    AlertTitle,
    Snackbar,
    Stack,
    IconButton,
    Slide,
    SlideProps,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

function SlideTransition(props: SlideProps) {
    return <Slide {...props} direction="down" />;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const { notifications, removeNotification } = useNotifications();

    return (
        <>
            {children}
            <Stack
                spacing={1}
                sx={{
                    position: "fixed",
                    top: 16,
                    right: 16,
                    zIndex: 9999,
                    maxWidth: 400,
                }}
            >
                {notifications.slice(0, 5).map((notification) => (
                    <Snackbar
                        key={notification.id}
                        open={true}
                        TransitionComponent={SlideTransition}
                        sx={{ position: "relative" }}
                    >
                        <Alert
                            severity={notification.type}
                            variant="filled"
                            sx={{
                                width: "100%",
                                borderRadius: 2,
                                boxShadow: 3,
                            }}
                            action={
                                <IconButton
                                    size="small"
                                    aria-label="close"
                                    color="inherit"
                                    onClick={() => removeNotification(notification.id)}
                                >
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            }
                        >
                            <AlertTitle sx={{ fontWeight: 600 }}>
                                {notification.title}
                            </AlertTitle>
                            {notification.message}
                        </Alert>
                    </Snackbar>
                ))}
            </Stack>
        </>
    );
}

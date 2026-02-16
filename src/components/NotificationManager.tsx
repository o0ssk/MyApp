"use client";

import { useCallback } from "react";
import { useAuth } from "@/lib/auth/hooks";
import { useNotifications, useForegroundMessages } from "@/lib/hooks/useNotifications";
import { useToast } from "@/components/ui/Toast";

/**
 * NotificationManager — invisible component that:
 * 1. Auto-registers FCM token when a user is logged in
 * 2. Shows foreground messages as toast notifications
 * 
 * Place inside both AuthProvider and ToastProvider.
 */
export function NotificationManager() {
    const { user } = useAuth();
    const { showToast } = useToast();

    // Auto-registers FCM token when user is authenticated
    useNotifications(user?.uid);

    // Listen for foreground messages and show them as toasts
    const handleForegroundMessage = useCallback(
        (title: string, body: string) => {
            showToast(`${title}: ${body}`, "info");
        },
        [showToast]
    );

    useForegroundMessages(handleForegroundMessage);

    return null; // This component renders nothing
}

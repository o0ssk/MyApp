"use client";

import { useState, useEffect, useCallback } from "react";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import app from "@/lib/firebase/client";

// Your VAPID key — generate from Firebase Console > Project Settings > Cloud Messaging > Web Push certificates
// Replace this placeholder with your actual VAPID key
const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || "";

interface UseNotificationsReturn {
    token: string | null;
    permission: NotificationPermission | "unsupported";
    isLoading: boolean;
    error: string | null;
    requestPermission: () => Promise<void>;
}

export function useNotifications(uid: string | null | undefined): UseNotificationsReturn {
    const [token, setToken] = useState<string | null>(null);
    const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Check initial permission state
    useEffect(() => {
        if (typeof window === "undefined" || !("Notification" in window)) {
            setPermission("unsupported");
            return;
        }
        setPermission(Notification.permission);
    }, []);

    // Save FCM token to Firestore under the user's document
    const saveTokenToFirestore = useCallback(
        async (fcmToken: string) => {
            if (!uid) return;
            try {
                const userRef = doc(db, "users", uid);
                await updateDoc(userRef, {
                    fcmTokens: arrayUnion(fcmToken),
                    updatedAt: new Date(),
                });
            } catch (err) {
                console.error("Error saving FCM token to Firestore:", err);
            }
        },
        [uid]
    );

    // Request permission and get FCM token
    const requestPermission = useCallback(async () => {
        if (typeof window === "undefined" || !("Notification" in window)) {
            setError("الإشعارات غير مدعومة في هذا المتصفح");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Check if FCM is supported in this browser
            const supported = await isSupported();
            if (!supported) {
                setPermission("unsupported");
                setError("الإشعارات غير مدعومة في هذا المتصفح");
                return;
            }

            // Request notification permission
            const result = await Notification.requestPermission();
            setPermission(result);

            if (result !== "granted") {
                setError("تم رفض إذن الإشعارات");
                return;
            }

            // Get FCM token
            const messaging = getMessaging(app);
            const fcmToken = await getToken(messaging, {
                vapidKey: VAPID_KEY,
                serviceWorkerRegistration: await navigator.serviceWorker.register("/firebase-messaging-sw.js"),
            });

            if (fcmToken) {
                setToken(fcmToken);
                await saveTokenToFirestore(fcmToken);
                console.log("FCM Token obtained and saved:", fcmToken.substring(0, 20) + "...");
            } else {
                setError("لم يتم الحصول على توكن الإشعارات");
            }
        } catch (err: any) {
            console.error("Error requesting notification permission:", err);
            setError(err.message || "حدث خطأ أثناء تفعيل الإشعارات");
        } finally {
            setIsLoading(false);
        }
    }, [saveTokenToFirestore]);

    // Auto-request permission when user is authenticated and permission was previously granted
    useEffect(() => {
        if (uid && permission === "granted" && !token) {
            requestPermission();
        }
    }, [uid, permission, token, requestPermission]);

    return { token, permission, isLoading, error, requestPermission };
}

/**
 * Hook to listen for foreground FCM messages.
 * Call this in a component wrapped by ToastProvider to show toast notifications.
 */
export function useForegroundMessages(onMessageReceived: (title: string, body: string) => void) {
    useEffect(() => {
        if (typeof window === "undefined") return;

        let unsubscribe: (() => void) | undefined;

        isSupported().then((supported) => {
            if (!supported) return;

            const messaging = getMessaging(app);
            unsubscribe = onMessage(messaging, (payload) => {
                console.log("Foreground message received:", payload);
                const title = payload.notification?.title || "حلقتي";
                const body = payload.notification?.body || "لديك إشعار جديد";
                onMessageReceived(title, body);
            });
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [onMessageReceived]);
}

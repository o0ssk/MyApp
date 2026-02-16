/* eslint-disable no-undef */
// Firebase Cloud Messaging Service Worker
// This runs in the background when the app is closed or not in focus

importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

// Initialize Firebase in the service worker
firebase.initializeApp({
    apiKey: "AIzaSyB2NZBgLqXxa4w1GQrteILwgathXTxrfOk",
    authDomain: "halqati-quran-2026.firebaseapp.com",
    projectId: "halqati-quran-2026",
    storageBucket: "halqati-quran-2026.firebasestorage.app",
    messagingSenderId: "577940742168",
    appId: "1:577940742168:web:a3bbaf2278c992c8aba36d",
});

const messaging = firebase.messaging();

// Handle background messages (when app is closed or not in focus)
messaging.onBackgroundMessage((payload) => {
    console.log("[firebase-messaging-sw.js] Background message received:", payload);

    const notificationTitle = payload.notification?.title || "حلقتي";
    const notificationOptions = {
        body: payload.notification?.body || "لديك إشعار جديد",
        icon: "/icons/icon-192x192.png",
        badge: "/icons/icon-192x192.png",
        dir: "rtl",
        lang: "ar",
        tag: payload.data?.tag || "halqati-notification",
        data: {
            url: payload.data?.url || "/",
            ...payload.data,
        },
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click — open the app to the relevant page
self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    const targetUrl = event.notification.data?.url || "/";

    event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
            // If a window is already open, focus it and navigate
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && "focus" in client) {
                    client.focus();
                    client.navigate(targetUrl);
                    return;
                }
            }
            // Otherwise, open a new window
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
